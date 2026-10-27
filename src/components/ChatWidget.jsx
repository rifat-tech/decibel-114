import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LuMessageCircle, LuX, LuSend, LuUserCircle2, LuSparkles } from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa6';
import { ProductVisual } from './DeviceArt';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { askAssistant } from '../lib/ai';
import { chatCol, ensureChat, msgCol, postMessage, rid } from '../lib/db';
import { money, waLink } from '../config';

const KEY = 'd114_chat_id';
const PROMPTS = ['Best iPhone under ৳1,50,000?', 'MacBook for a university student', 'Starlink kit price and setup', 'Do you deliver outside Dhaka?'];

function ProductChip({ p }) {
  return (
    <Link to={`/product/${p.slug}`} className="chat-product">
      <span className="chat-product-img"><ProductVisual product={p} /></span>
      <span><b>{p.name}</b><small>{p.price ? money(p.price) : 'Coming soon'}{p.stock > 0 ? '' : p.price ? ', out of stock' : ''}</small></span>
    </Link>
  );
}

export default function ChatWidget() {
  const store = useStore();
  const { user } = useAuth();
  const s = store.settings;
  const [open, setOpen] = useState(false);
  const [chatId, setChatId] = useState(() => { try { return localStorage.getItem(KEY) || ''; } catch { return ''; } });
  const [chat, setChat] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [thinking, setThinking] = useState(false);
  const [needContact, setNeedContact] = useState(false);
  const [contact, setContact] = useState({ name: user?.profile?.name || '', phone: user?.profile?.phone || '' });
  const [seen, setSeen] = useState(0);
  const end = useRef();

  useEffect(() => {
    if (!chatId) return undefined;
    const a = msgCol(chatId).watch({ order: ['at', 'asc'] }, setMsgs, () => {});
    const b = chatCol().watchDoc(chatId, setChat);
    return () => { a && a(); b && b(); };
  }, [chatId]);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs, thinking, open]);
  useEffect(() => { if (open) setSeen(msgs.length); }, [open, msgs.length]);
  const unread = !open ? msgs.slice(seen).filter((m) => m.from === 'agent').length : 0;

  const human = chat && ['waiting', 'open'].includes(chat.status);
  const getId = async () => {
    if (chatId) return chatId;
    const id = rid(20);
    await ensureChat(id, { name: contact.name || user?.profile?.name, phone: contact.phone, uid: user?.uid });
    try { localStorage.setItem(KEY, id); } catch { /* ignore */ }
    setChatId(id);
    return id;
  };

  const handoff = async (id, reason) => {
    if (!contact.phone) { setNeedContact(true); return; }
    await postMessage(id, { from: 'system', text: `${contact.name || 'Customer'} asked for a person${reason ? `: ${reason}` : ''}. Our team will reply here${s.hours ? ` (${s.hours})` : ''}.` }, { status: 'waiting', name: contact.name || 'Guest', phone: contact.phone });
  };

  const send = async (q) => {
    const question = (q ?? text).trim();
    if (!question) return;
    setText('');
    const id = await getId();
    const history = msgs.map((m) => ({ from: m.from, text: m.text }));
    await postMessage(id, { from: 'customer', text: question });
    if (human || !s.ai?.enabled) { if (!human) await handoff(id); return; }
    setThinking(true);
    try {
      const r = await askAssistant({ question, history, catalog: store, settings: s });
      await postMessage(id, { from: 'ai', text: r.text, products: r.products });
      if (r.handoff) await handoff(id);
    } finally { setThinking(false); }
  };

  const saveContact = async (e) => {
    e.preventDefault();
    if (contact.phone.replace(/\D/g, '').length < 10) return;
    setNeedContact(false);
    const id = await getId();
    await chatCol().update(id, { name: contact.name || 'Guest', phone: contact.phone });
    await handoff(id);
  };

  const wa = waLink(s.whatsapp || s.phone, 'Hi Decibel-114, I need help with a product.');
  const list = useMemo(() => msgs, [msgs]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.section className="chat" initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24 }} transition={{ duration: 0.18 }} aria-label="Chat with Decibel-114">
            <header className="chat-head">
              <div>
                <b>{human ? 'Decibel-114 team' : s.ai?.name || 'Assistant'}</b>
                <small>{human ? (chat?.status === 'open' ? 'An agent is with you' : 'Waiting for an agent') : 'Instant answers from our catalog'}</small>
              </div>
              {!human && <button className="chat-human" onClick={async () => { const id = await getId(); handoff(id); }}><LuUserCircle2 /> Talk to a person</button>}
              <button className="icon-btn on-blue" onClick={() => setOpen(false)} aria-label="Close chat"><LuX /></button>
            </header>
            <div className="chat-body">
              {list.length === 0 && (
                <div className="chat-hello">
                  <LuSparkles />
                  <p>Hi! Ask about any product, price, stock or delivery. I answer from our live catalog, and a person can take over any time.</p>
                  <div className="chat-prompts">{PROMPTS.map((p) => <button key={p} onClick={() => send(p)}>{p}</button>)}</div>
                </div>
              )}
              {list.map((m) => (
                <div key={m.id} className={`msg ${m.from}`}>
                  {m.from === 'agent' && <small className="msg-who">{m.agent || 'Agent'}</small>}
                  {m.text && <p>{m.text}</p>}
                  {(m.products || []).map((slug) => store.bySlug[slug] && <ProductChip key={slug} p={store.bySlug[slug]} />)}
                </div>
              ))}
              {thinking && <div className="msg ai typing"><span /><span /><span /></div>}
              {needContact && (
                <form className="chat-contact" onSubmit={saveContact}>
                  <p>So our team can reach you if the chat drops:</p>
                  <input placeholder="Your name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
                  <input placeholder="Mobile number" inputMode="tel" required value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
                  <button className="btn btn-primary btn-sm">Connect me</button>
                </form>
              )}
              <div ref={end} />
            </div>
            <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(); }}>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder={human ? 'Message our team' : 'Ask about a product'} aria-label="Message" />
              <button className="chat-send" aria-label="Send" disabled={!text.trim()}><LuSend /></button>
            </form>
            {wa && <a className="chat-wa" href={wa} target="_blank" rel="noreferrer"><FaWhatsapp /> Prefer WhatsApp?</a>}
          </motion.section>
        )}
      </AnimatePresence>
      {!open && (
        <button className="chat-fab" onClick={() => setOpen(true)} aria-label="Open chat">
          <LuMessageCircle /><span>Chat</span>
          {unread > 0 && <i className="chat-badge">{unread}</i>}
        </button>
      )}
    </>
  );
}
