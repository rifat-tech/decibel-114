// Shopping assistant. Uses Gemini through Firebase AI Logic (no server, no secret key in the
// browser). The model only sees the products most relevant to the question, so answers stay
// grounded in real prices and stock. Falls back to a simple catalog search if AI is unavailable.
import { app, DEMO } from './firebase';

let modelCache = null;
async function getModel(settings) {
  if (DEMO || !settings?.ai?.enabled) return null;
  const key = settings.ai.model;
  if (modelCache?.key === key) return modelCache.model;
  const { getAI, getGenerativeModel, GoogleAIBackend } = await import('firebase/ai');
  const ai = getAI(app, { backend: new GoogleAIBackend() });
  const model = getGenerativeModel(ai, { model: key, generationConfig: { temperature: 0.4, maxOutputTokens: 700 } });
  modelCache = { key, model };
  return model;
}

const norm = (s) => String(s || '').toLowerCase();
const STOP = new Set('the a an and or for with of to in on is are i me my want need price best good under below budget dam koto ki ache te er ta'.split(' '));
export function searchCatalog(products, q, n = 12) {
  const words = norm(q).replace(/[^\p{L}\p{N}\s.]/gu, ' ').split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w) && !/^\d[\d,.]*$/.test(w));
  const budget = (norm(q).match(/(\d[\d,]{3,})/) || [])[1];
  const max = budget ? Number(budget.replace(/,/g, '')) : 0;
  const scored = products.map((p) => {
    const hay = norm([p.name, p.brand, p.subcategory, p.categoryId, ...(p.tags || []), p.shortDescription].join(' '));
    let s = 0;
    words.forEach((w) => { if (hay.includes(w)) s += norm(p.name).includes(w) ? 3 : 1; });
    if (!s) return { p, s: 0 };
    if (max && p.price && p.price <= max) s += 1;
    if (max && p.price > max * 1.15) s -= 2;
    if (p.stock > 0) s += 0.3;
    return { p, s };
  }).filter((x) => x.s > 0.5).sort((a, b) => b.s - a.s);
  return scored.slice(0, n).map((x) => x.p);
}

const line = (p) => `- ${p.name} | slug:${p.slug} | ৳${p.price ? p.price.toLocaleString('en-IN') : 'coming soon'}${p.originalPrice > p.price ? ` (regular ৳${p.originalPrice.toLocaleString('en-IN')})` : ''} | ${p.stock > 0 ? 'in stock' : 'not in stock'} | ${(p.specs || []).slice(0, 4).map((s) => `${s.key}: ${s.value}`).join('; ')}`;

function systemPrompt(settings, categories, relevant) {
  const s = settings;
  return [
    `You are ${s.ai.name}, the shopping assistant for ${s.storeName}, an electronics shop in Bangladesh (Apple, phones, laptops, gadgets, network gear).`,
    s.ai.instructions,
    'Rules:',
    '- Use ONLY the products and facts listed below. Never invent prices, stock, specs, discounts or delivery dates.',
    '- Prices are in Bangladeshi taka (৳). If something is not listed, say we can source it and offer a quote or a human agent.',
    '- Keep answers under 90 words. Use short sentences. No markdown tables.',
    '- When you recommend products, end your reply with a line exactly like: [[products: slug-one, slug-two]] (max 4 slugs, from the list).',
    '- If the customer asks for a person, a bulk/corporate deal, a complaint, or you cannot help, end with [[handoff]].',
    `Store facts: delivery inside Dhaka ৳${s.shippingInsideDhaka}, outside Dhaka ৳${s.shippingOutsideDhaka}, free over ৳${s.freeShippingOver}. Returns within ${s.returnDays} days if unused. ${s.hours ? `Hours: ${s.hours}.` : ''} ${s.phone ? `Phone: ${s.phone}.` : ''} Payment: cash on delivery${s.bkash ? ', bKash' : ''}${s.nagad ? ', Nagad' : ''}${s.bank ? ', bank transfer' : ''}.`,
    `Categories: ${categories.map((c) => c.name).join(', ')}.`,
    'Relevant products:',
    ...(relevant.length ? relevant.map(line) : ['(no direct match in the catalog)']),
  ].join('\n');
}

export function parseReply(text) {
  let t = String(text || '');
  const m = t.match(/\[\[products:\s*([^\]]+)\]\]/i);
  const slugs = m ? m[1].split(',').map((x) => x.trim()).filter(Boolean).slice(0, 4) : [];
  const handoff = /\[\[handoff\]\]/i.test(t);
  t = t.replace(/\[\[products:[^\]]*\]\]/gi, '').replace(/\[\[handoff\]\]/gi, '').trim();
  return { text: t, products: slugs, handoff };
}

/** history: [{from:'customer'|'ai'|'agent', text}] */
export async function askAssistant({ question, history, catalog, settings }) {
  const relevant = searchCatalog(catalog.products, [question, ...history.slice(-4).map((h) => h.text)].join(' '), 14);
  try {
    const model = await getModel(settings);
    if (!model) throw new Error('ai-off');
    const contents = [
      ...history.slice(-8).filter((h) => h.text).map((h) => ({ role: h.from === 'customer' ? 'user' : 'model', parts: [{ text: h.text }] })),
      { role: 'user', parts: [{ text: question }] },
    ];
    const res = await model.generateContent({ systemInstruction: { role: 'system', parts: [{ text: systemPrompt(settings, catalog.categories, relevant) }] }, contents });
    const out = parseReply(res.response.text());
    out.products = out.products.filter((s) => catalog.products.some((p) => p.slug === s));
    return { ...out, source: 'ai' };
  } catch (e) {
    if (e.message !== 'ai-off') console.warn('AI assistant unavailable, using catalog search', e);
    const top = relevant.slice(0, 3);
    if (/human|agent|person|call|manush|কথা|মানুষ/i.test(question)) return { text: 'Sure. I am connecting you to our team now.', products: [], handoff: true, source: 'fallback' };
    return top.length
      ? { text: `Here are the closest matches I found. Tap one to see full specs, or ask me to compare them.`, products: top.map((p) => p.slug), handoff: false, source: 'fallback' }
      : { text: 'I could not find that in our catalog. Would you like our team to source it for you?', products: [], handoff: true, source: 'fallback' };
  }
}
