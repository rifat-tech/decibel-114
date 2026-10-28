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

/* ── Query understanding: Bangla digits and common Bangla/Banglish words mapped to catalog terms ── */
const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
const BN_WORDS = [
  ['আইফোন', 'iphone'], ['ম্যাকবুক', 'macbook'], ['আইপ্যাড', 'ipad'], ['ল্যাপটপ', 'laptop'], ['মোবাইল', 'phone'], ['ফোন', 'phone'],
  ['স্টারলিংক', 'starlink'], ['রাউটার', 'router'], ['স্যামসাং', 'samsung'], ['হেডফোন', 'headphone'], ['এয়ারপড', 'airpods'],
  ['ঘড়ি', 'watch'], ['মনিটর', 'monitor'], ['প্রিন্টার', 'printer'], ['ক্যামেরা', 'camera'], ['গেমিং', 'gaming'], ['চার্জার', 'charger'],
  ['মিনি', 'mini'], ['প্রো', 'pro'], ['ম্যাক্স', 'max'], ['আল্ট্রা', 'ultra'], ['এয়ার', 'air'], ['ওয়াচ', 'watch'], ['ডেলিভারি', 'delivery'],
  ['হাজার', ' hazar '], ['টাকা', ' taka '],
];
export function prepQuery(q) {
  let s = norm(q).replace(/[০-৯]/g, (d) => BN_DIGITS.indexOf(d));
  // Swallow Bangla suffixes too (হাজারের, ল্যাপটপটা, আইফোনের) so no fragments are left behind.
  for (const [bn, en] of BN_WORDS) s = s.replace(new RegExp(`${bn}[\u0980-\u09FF]*`, 'g'), ` ${en} `);
  return s.replace(/\s+/g, ' ').trim();
}
export const isBangla = (q) => /[\u0980-\u09F1\u09F4-\u09FF]/.test(q) || /\b(dam|koto|ache|achhe|chai|kivabe|kothay|kobe|vai|bhai|apnar|amar|ki)\b/i.test(q);

const STOP = new Set(('the a an and or for with of to in on is are am i me my you your we our do does can could would please plz pls want need show find have has any '
  + 'price prices cost costs how much what which whats best good top latest new buy get available availability stock in-stock '
  + 'under below within less than upto up max budget around about range taka tk bdt hazar k thousand '
  + 'dam koto ki ache achhe te er ta ar ekta kono chai lagbe moddhe nite din den dite lakh lac taka '
  + 'এর দাম কত কি আছে চাই টা একটা কেমন প্রাইস মধ্যে নিচে দিন দেন লাগবে').split(' '));
const CAT_WORDS = {
  laptop: ['laptop'], laptops: ['laptop'], notebook: ['laptop'], macbook: ['laptop'],
  phone: ['phone'], phones: ['phone'], mobile: ['phone'], smartphone: ['phone'], iphone: ['phone'],
  tablet: ['tablet'], ipad: ['tablet'], monitor: ['monitor'], monitors: ['monitor'], tv: ['monitor'],
  printer: ['printer'], printers: ['printer'], router: ['router'], routers: ['router'], switch: ['switch'],
  desktop: ['desktop'], pc: ['desktop'], cctv: ['security'], camera: ['security', 'gadget'],
  headphone: ['sound'], headphones: ['sound'], earbuds: ['sound'], speaker: ['sound'], watch: ['gadget'], smartwatch: ['gadget'],
};
const VARIANT = new Set(['pro', 'max', 'plus', 'mini', 'ultra', 'air', 'lite', 'se', 'fe', 'neo', 'e']);
const words = (s) => norm(s).replace(/[^\p{L}\p{M}\p{N}\s.+-]/gu, ' ').split(/[\s/,()|]+/).filter(Boolean);

function budgetMatch(q) {
  return q.match(/(?:under|below|within|less than|upto|up to|max|budget|er moddhe|moddhe|মধ্যে|around)\s*(?:৳|tk|bdt)?\s*(\d[\d,.]*)\s*(k|hazar|thousand|lakh|lac)?/i)
    || q.match(/(\d[\d,.]*)\s*(k|hazar|thousand|lakh|lac)\b/i)
    || q.match(/(?:৳|tk\s?|bdt\s?)(\d[\d,]{3,})/i)
    || q.match(/\b(\d{2,3},\d{3}|\d{5,7})\b(?!\s*mah)/i);
}
function readBudget(q) {
  const m = budgetMatch(q);
  if (!m) return 0;
  let n = Number(String(m[1]).replace(/,/g, ''));
  const unit = norm(m[2]);
  if (unit === 'k' || unit === 'hazar' || unit === 'thousand') n *= 1000;
  if (unit === 'lakh' || unit === 'lac') n *= 100000;
  return n >= 500 ? n : 0;
}

/** Ranked product search. Model numbers must match exactly; extra variant words (Pro, Max...) the
    customer did not ask for push a product down, so "iPhone 17" finds the iPhone 17 first. */
export function searchCatalog(products, q, n = 12) {
  let pq = prepQuery(q);
  const max = readBudget(pq);
  if (max) pq = pq.replace(budgetMatch(pq)[0], ' ');
  const tokens = [...new Set(words(pq).filter((w) => !STOP.has(w) && /[\p{L}\p{N}]/u.test(w) && !/^\d{5,}$/.test(w)))];
  if (!tokens.length) return [];
  // A category word ("laptop", "router") limits results to that category, so accessories that
  // merely mention it (laptop stands, adapters) do not crowd out the real thing.
  const cats = [...new Set(tokens.flatMap((t) => CAT_WORDS[t] || []))];
  // "laptop stand" names the accessory itself, so fall back to the whole catalog when the category has no match.
  if (cats.length) {
    const pool = products.filter((p) => cats.some((c) => p.categoryId === c || norm(p.subcategory) === c));
    const inCat = rank(pool, tokens, max, n);
    if (inCat.length) return inCat;
    // Nothing in the category fits the budget: offer the most affordable ones instead of accessories.
    if (max) { const over = rank(pool, tokens, 0, 50).filter((p) => p.price > 0).sort((a, b) => a.price - b.price); if (over.length) return over.slice(0, n); }
  }
  return rank(products, tokens, max, n);
}

function rank(products, tokens, max, n) {
  const nums = tokens.filter((w) => /^\d/.test(w));
  const scored = [];
  for (const p of products) {
    if (max && (!p.price || p.price > max)) continue;
    const nameW = new Set(words(p.name));
    const hayW = new Set(words([p.brand, p.subcategory, p.categoryId, ...(p.tags || [])].join(' ')));
    let hit = 0, s = 0;
    for (const t of tokens) {
      if (nameW.has(t)) { hit++; s += 3; } else if (hayW.has(t) || (t.length >= 2 && [...nameW].some((w) => w.startsWith(t)))) { hit++; s += 1.5; }
    }
    if (nums.some((d) => !nameW.has(d) && !(d === tokens[tokens.length - 1] && [...nameW].some((w) => w.startsWith(d))))) continue; // model numbers are not optional (prefix allowed while typing)
    if (hit < Math.max(1, Math.ceil(tokens.length * 0.6))) continue;
    for (const w of nameW) if (VARIANT.has(w) && !tokens.includes(w)) s -= 0.8;
    if (p.price > 0) s += 0.6;
    if (p.stock > 0) s += 0.4;
    if (/^\/|^\/img/.test(p.images?.[0] || '') || !/^https?:/.test(p.images?.[0] || 'x')) s += 0.2;
    s -= nameW.size * 0.02;
    scored.push({ p, s });
  }
  scored.sort((a, b) => b.s - a.s || (max ? b.p.price - a.p.price : 0));
  return scored.slice(0, n).map((x) => x.p);
}

/* ── Store questions answered from settings, never invented ── */
const INTENTS = [
  ['human', /\b(human|agent|person|representative|call me|manush)\b|মানুষ|কথা বল/],
  ['track', /\b(track|tracking|order status|where is my order|my order)\b|অর্ডার/],
  ['corporate', /\b(corporate|bulk|wholesale|quotation|quote|tender|rfq|vat|invoice|office purchase)\b/],
  ['delivery', /\b(deliver|delivery|shipping|ship|courier|home delivery|kobe pabo|koto din)\b|ডেলিভারি|কত দিনে/],
  ['warranty', /\b(warranty|guarantee|official|genuine|original)\b|ওয়ারেন্টি|অরিজিনাল/],
  ['payment', /\b(bkash|nagad|rocket|payment|pay|emi|installment|cash on delivery|cod|credit card|debit card|bank transfer)\b|বিকাশ|নগদ|পেমেন্ট/],
  ['returns', /\b(return|refund|replace|replacement|exchange)\b|ফেরত/],
  ['where', /\b(where (is|are) (you|your|the)|your (shop|store|office|address|showroom)|address|location|showroom|dokan|opening hours|open (today|now|on)|office hours|visit)\b|ঠিকানা|কোথায়|দোকান/],
  ['greet', /^(hi|hello|hey|hlw|salam|assalamu|assalamualaikum|good (morning|evening|afternoon)|thanks|thank you)\b|^আসসালাম|^হ্যালো|ধন্যবাদ/],
];
const money = (n) => `৳${Number(n).toLocaleString('en-IN')}`;
function storeAnswer(intent, s, bn) {
  const ship = `${money(s.shippingInsideDhaka)} inside Dhaka and ${money(s.shippingOutsideDhaka)} outside Dhaka${s.freeShippingOver ? `, free on orders over ${money(s.freeShippingOver)}` : ''}`;
  const shipBn = `ঢাকার ভেতরে ${money(s.shippingInsideDhaka)}, ঢাকার বাইরে ${money(s.shippingOutsideDhaka)}${s.freeShippingOver ? `; ${money(s.freeShippingOver)}-এর বেশি অর্ডারে ফ্রি` : ''}`;
  const pays = ['cash on delivery', s.bkash && 'bKash', s.nagad && 'Nagad', s.bank && 'bank transfer'].filter(Boolean);
  const contact = [s.phone && `call ${s.phone}`, s.whatsapp && `WhatsApp ${s.whatsapp}`].filter(Boolean).join(' or ');
  const A = {
    greet: bn ? 'আসসালামু আলাইকুম! কোন প্রোডাক্ট খুঁজছেন? নাম, বাজেট বা কাজের ধরন লিখুন, আমি দাম আর স্টক দেখিয়ে দেব।'
      : 'Hello! Tell me the product, your budget or what you need it for, and I will show you prices and stock.',
    delivery: bn ? `ডেলিভারি চার্জ: ${shipBn}। ঢাকায় সাধারণত ১–২ দিন, ঢাকার বাইরে ২–৪ দিন লাগে।`
      : `Delivery is ${ship}. Dhaka orders usually arrive in 1–2 days, the rest of Bangladesh in 2–4 days.`,
    warranty: bn ? 'আমাদের সব প্রোডাক্ট অরিজিনাল, অফিসিয়াল ওয়ারেন্টিসহ। প্রতিটা প্রোডাক্টের পেজে ওয়ারেন্টির মেয়াদ লেখা আছে।'
      : 'Every product is original and comes with official warranty. The warranty period is shown on each product page.',
    payment: bn ? `এখন ${pays.join(', ')}-এ পেমেন্ট নেওয়া হয়।${!s.bkash || !s.nagad ? ' বিকাশ/নগদ বা অন্য উপায়ে দিতে চাইলে "Talk to a person" চাপুন, টিম জানিয়ে দেবে।' : ''}`
      : `Right now we take ${pays.join(', ')}.${!s.bkash || !s.nagad ? ' For bKash, Nagad or another method, tap "Talk to a person" and our team will confirm.' : ''}`,
    returns: bn ? `অব্যবহৃত ও সিল করা প্রোডাক্ট ${s.returnDays} দিনের মধ্যে ফেরত দেওয়া যায়।` : `Unused, sealed products can be returned within ${s.returnDays} days.`,
    where: bn ? `আমরা অনলাইনে অর্ডার নিই এবং সারা বাংলাদেশে ডেলিভারি দিই।${s.address ? ` ঠিকানা: ${s.address}।` : ''}${s.hours ? ` সময়: ${s.hours}।` : ''}${contact ? ` যোগাযোগ: ${contact}।` : ' বিস্তারিত জানতে "Talk to a person" চাপুন।'}`
      : `We sell online and deliver across Bangladesh.${s.address ? ` Address: ${s.address}.` : ''}${s.hours ? ` Hours: ${s.hours}.` : ''}${contact ? ` You can ${contact}.` : ' Tap "Talk to a person" for anything else.'}`,
    track: bn ? 'অর্ডারের অবস্থা দেখতে "Track order" পেজে অর্ডার নম্বর আর ফোন নম্বর দিন।' : 'Open "Track order" at the top of the site and enter your order number and phone number.',
    corporate: bn ? 'অফিস বা বাল্ক অর্ডারের জন্য "Corporate sales" পেজে লিস্ট পাঠান, আমরা VAT ইনভয়েসসহ একটা দাম দেব। চাইলে এখনই আমাদের টিমের সাথে কথা বলিয়ে দিই।'
      : 'For office or bulk orders, send your list on the "Corporate sales" page and we will reply with one price and VAT documents. I can also connect you to our team now.',
    human: bn ? 'ঠিক আছে, আমাদের টিমের সাথে যুক্ত করছি।' : 'Sure. I am connecting you to our team now.',
  };
  return A[intent];
}
function detectIntent(pq) {
  for (const [k, re] of INTENTS) if (re.test(pq)) return k;
  return null;
}

/** Catalog answer in plain sentences, with the real price and stock. */
function productAnswer(question, hits, bn) {
  const pq = prepQuery(question);
  const max = readBudget(pq);
  const [top] = hits;
  const priceLine = (p) => (p.price
    ? `${money(p.price)}${p.originalPrice > p.price ? (bn ? ` (আগের দাম ${money(p.originalPrice)})` : ` (regular ${money(p.originalPrice)})`) : ''}`
    : (bn ? 'দাম জানতে রিকোয়েস্ট করুন' : 'price on request'));
  const stock = (p) => (p.stock > 0 ? (bn ? 'স্টকে আছে' : 'in stock') : (bn ? 'এখন স্টকে নেই' : 'out of stock right now'));
  if (max && top.price > max) {
    return bn ? `${money(max)}-এর মধ্যে এখন কিছু নেই। সবচেয়ে কম দামে পাবেন ${top.name}, ${priceLine(top)}।`
      : `Nothing fits ${money(max)} right now. The most affordable option is ${top.name} at ${priceLine(top)}.`;
  }
  if (max) {
    return bn ? `${money(max)}-এর মধ্যে এগুলো পাবেন। সবচেয়ে কাছের: ${top.name}, ${priceLine(top)}।`
      : `Here is what fits a ${money(max)} budget. Closest to it: ${top.name} at ${priceLine(top)}.`;
  }
  const asked = new Set(words(prepQuery(question)));
  const extras = words(top.name).filter((w) => !asked.has(w) && w !== norm(top.brand));
  // Treat it as "the one they asked for" only when the name adds at most one word and no variant (Pro, Max...).
  const exact = hits.length === 1 || (extras.length <= 1 && !extras.some((w) => VARIANT.has(w) || /\d/.test(w)));
  if (exact) {
    const more = hits.length > 1 ? (bn ? ' নিচে আরও কয়েকটা অপশন দিলাম।' : ' Similar options are below.') : '';
    if (!top.price) return bn ? `${top.name}-এর দাম জানতে প্রোডাক্ট পেজে "Request price" চাপুন, বা আমাদের টিমের সাথে কথা বলুন।${more}` : `${top.name} is priced on request. Tap "Request price" on its page or talk to our team for today's price.${more}`;
    return bn ? `${top.name}: ${priceLine(top)}, ${stock(top)}।${more}` : `${top.name} is ${priceLine(top)} and ${stock(top)}.${more}`;
  }
  return bn ? 'সবচেয়ে কাছের অপশনগুলো নিচে দিলাম, দাম আর স্টকসহ। মডেলের নাম বা বাজেট বললে আরও ঠিকঠাক দেখাতে পারব।'
    : 'Here are the closest options, with prices and stock. Tell me the exact model or your budget and I can narrow it down.';
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
  const relevant = searchCatalog(catalog.products, question, 14);
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
    return localAnswer({ question, catalog, settings });

  }
}

/* ── Broad questions ("phone", "router", "mikrotik", "iphone"): a short overview with the range,
      popular picks, one-tap filters and a link to the full list ── */
const plural = { phone: 'phones', laptop: 'laptops', tablet: 'tablets', monitor: 'monitors', printer: 'printers', router: 'routers', switch: 'switches', desktop: 'desktops', security: 'CCTV products', sound: 'audio products', gadget: 'gadgets' };
function overview(question, catalog, bn) {
  const pq = prepQuery(question);
  if (readBudget(pq)) return null;
  const all = words(pq).filter((w) => !STOP.has(w));
  if (all.some((w) => /\d/.test(w))) return null; // a model number means a specific product
  const toks = all.filter((w) => /[\p{L}]/u.test(w));
  if (!toks.length || toks.length > 2) return null;
  const P = catalog.products;
  const brands = new Map(); const subs = new Map();
  for (const p of P) { brands.set(norm(p.brand), p.brand); if (p.subcategory) subs.set(norm(p.subcategory), p.subcategory); }
  const q = toks.join(' ');
  let pool, label, link, kind;
  const GENERIC = !['iphone', 'macbook', 'ipad'].includes(q);
  const cat = toks.length === 1 && GENERIC && CAT_WORDS[q] && CAT_WORDS[q][0];
  if (cat) {
    pool = P.filter((p) => p.categoryId === cat || norm(p.subcategory) === cat); kind = 'cat';
    label = plural[cat] || `${cat}s`; const c = pool.find((p) => norm(p.subcategory) === cat && p.categoryId !== cat);
    link = c ? `/shop?cat=${c.categoryId}&sub=${encodeURIComponent(c.subcategory)}` : `/shop?cat=${cat}`;
  } else if (subs.has(q)) {
    const sub = subs.get(q); pool = P.filter((p) => norm(p.subcategory) === q); kind = 'sub';
    label = sub; link = `/shop?cat=${pool[0]?.categoryId || ''}&sub=${encodeURIComponent(sub)}`;
  } else if (brands.has(q)) {
    const b = brands.get(q); pool = P.filter((p) => norm(p.brand) === q); kind = 'brand';
    label = b; link = b === 'Apple' ? '/brand/apple' : `/shop?brand=${encodeURIComponent(b)}`;
  } else return null;
  if (pool.length < 2) return null;
  const priced = pool.filter((p) => p.price > 0);
  const onReq = pool.length - priced.length;
  const top = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
  const brandCount = new Map(); priced.forEach((p) => brandCount.set(p.brand, (brandCount.get(p.brand) || 0) + 1));
  const subCount = new Map(); priced.forEach((p) => p.subcategory && subCount.set(p.subcategory, (subCount.get(p.subcategory) || 0) + 1));
  const ours = (p) => p.images?.[0] && !/^https?:/.test(p.images[0]);
  const picks = [...priced].filter((p) => p.stock > 0).sort((a, b) => (ours(b) - ours(a)) || ((b.featured ? 1 : 0) + (b.newArrival ? 1 : 0)) - ((a.featured ? 1 : 0) + (a.newArrival ? 1 : 0)) || a.price - b.price).slice(0, 3);
  const prices = priced.map((p) => p.price).sort((a, b) => a - b);
  const lo = prices[0], hi = prices[prices.length - 1];
  // Budget steps at roughly the 40th and 75th percentile, rounded to a clean figure.
  const step = (f) => { const v = prices[Math.floor((prices.length - 1) * f)]; const r = v > 100000 ? 10000 : v > 10000 ? 5000 : 500; return Math.ceil(v / r) * r; };
  const budgets = prices.length >= 4 ? [...new Set([step(0.4), step(0.75)])].filter((v) => v < hi) : [];
  const noun = kind === 'cat' ? label : `${label} products`;
  const chips = [];
  if (kind === 'brand') top(subCount).slice(0, 3).forEach((sub) => chips.push(`${label} ${sub}`));
  else top(brandCount).filter((b) => norm(b) !== q).slice(0, kind === 'sub' ? 2 : 3).forEach((b) => chips.push(kind === 'cat' ? `${b} ${q}` : `${b} ${label}`));
  budgets.forEach((v) => chips.push(`${kind === 'brand' ? label : q} under ${money(v)}`));
  const brandList = top(brandCount);
  const brandsTxt = brandList.length > 1 ? brandList.slice(0, 3).join(', ') : '';
  const BN_LABEL = { phones: 'ফোন', laptops: 'ল্যাপটপ', tablets: 'ট্যাবলেট', monitors: 'মনিটর', printers: 'প্রিন্টার', routers: 'রাউটার', switches: 'সুইচ', desktops: 'ডেস্কটপ', 'CCTV products': 'সিসিটিভি', 'audio products': 'অডিও', gadgets: 'গ্যাজেট' };
  const bnLabel = BN_LABEL[label] || label;
  let text;
  if (!priced.length) {
    text = bn ? `${label}-এর ${pool.length}টা প্রোডাক্ট আছে, সবগুলোর দাম রিকোয়েস্টে। মডেল বললে টিম আজকের দাম জানিয়ে দেবে।`
      : `We carry ${pool.length} ${noun}, all priced on request. Tell me the model and our team will share today's price.`;
  } else {
    const range = lo === hi ? money(lo) : (bn ? `${money(lo)} থেকে ${money(hi)}` : `${money(lo)} to ${money(hi)}`);
    const one = priced.length === 1;
    text = bn
      ? `${bnLabel}: ${priced.length}টা মডেল, দাম ${range}${kind !== 'brand' && brandsTxt ? ` (${brandsTxt})` : ''}।${onReq ? ` আরও ${onReq}টার দাম রিকোয়েস্টে।` : ''} জনপ্রিয় কয়েকটা নিচে দিলাম। ব্র্যান্ড বা বাজেট বেছে নিলে আরও ঠিকঠাক দেখাব।`
      : one
        ? `We have one ${label} model with a listed price (${range})${onReq ? ` and ${onReq} more priced on request` : ''}. ${onReq ? 'Pick a type below or ask our team for today\'s prices.' : ''}`.trim()
        : `We have ${priced.length} ${noun} from ${range}${kind !== 'brand' && brandsTxt ? `, mostly ${brandsTxt}` : ''}.${onReq ? ` ${onReq} more are priced on request.` : ''} Popular picks are below; pick a brand or budget to narrow it down.`;
  }
  return { text, products: picks.map((p) => p.slug), chips: chips.slice(0, 5).map((c) => c.charAt(0).toUpperCase() + c.slice(1)), link: { to: link, label: bn ? `সব ${bnLabel} দেখুন` : `See all ${noun}` } };
}

/** Answer without the AI model: store questions first, then the catalog. */
export function localAnswer({ question, catalog, settings }) {
  const bn = isBangla(question);
  const pq = prepQuery(question);
  const intent = detectIntent(pq);
  if (!intent || intent === 'greet') { const o = overview(question, catalog, bn); if (o) return { handoff: false, source: 'fallback', ...o }; }
  const hits = searchCatalog(catalog.products, question, 6);
  const base = { products: [], handoff: false, source: 'fallback' };
  if (intent === 'human') return { ...base, text: storeAnswer('human', settings, bn), handoff: true };
  // A product named in the question wins over generic store words ("iPhone 17 delivery" → product + delivery note).
  if (intent && intent !== 'greet' && !hits.length) return { ...base, text: storeAnswer(intent, settings, bn) };
  if (hits.length) {
    let text = productAnswer(question, hits, bn);
    if (intent && !['greet', 'corporate'].includes(intent)) text += ` ${storeAnswer(intent, settings, bn)}`;
    return { ...base, text, products: hits.slice(0, 3).map((p) => p.slug) };
  }
  if (intent === 'greet') return { ...base, text: storeAnswer('greet', settings, bn) };
  return { ...base, text: bn ? 'এটা আমাদের ক্যাটালগে পাইনি। আমাদের টিম এনে দিতে পারবে, চাইলে "Talk to a person" চাপুন।'
    : 'I could not find that in our catalog. Our team can source it for you; tap "Talk to a person" and they will reply here.' };
}
