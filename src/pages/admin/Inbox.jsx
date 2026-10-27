import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LuSend, LuPhone } from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa6';
import { useTitle } from '../../components/ui';
import { chatCol, errText, msgCol, phoneKey, postMessage } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { money, telHref, waLink } from '../../config';

const FILTERS = [['active', 'Needs reply'], ['ai', 'With assistant'], ['closed', 'Closed'], ['all', 'All']];
const ago = (t) => { const s = (Date.now() - t) / 1000; return s < 60 ? 'now' : s < 3600 ? `${Math.floor(s / 60)}m` : s < 86400 ? `${Math.floor(s / 3600)}h` : `${Math.floor(s / 86400)}d`; };

function Thread({ chat }) {
  const { user } = useAuth();
  const { bySlug } = useStore();
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const end = useRef();
  const me = user?.profile?.name || user?.email || 'Agent';
  useEffect(() => msgCol(chat.id).watch({ order: ['at', 'asc'] }, setMsgs), [chat.id]);
  useEffect(() => { if (chat.unreadStaff) chatCol().update(chat.id, { unreadStaff: 0 }).catch(() => {}); }, [chat.id, chat.unreadStaff]);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs]);
  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try { await postMessage(chat.id, { from: 'agent', text: text.trim(), agent: me }, { status: 'open', assignee: chat.assignee || me }); setText(''); } catch (err) { toast.error(errText(err)); }
  };
  const setStatus = (status, extra = {}) => chatCol().update(chat.id, { status, ...extra }).catch((e) => toast.error(errText(e)));
  return (
    <div className="thread">
      <header className="thread-head">
        <div><b>{chat.name || 'Guest'}</b><small>{chat.phone || 'No phone yet'} · {chat.status}{chat.assignee ? ` · ${chat.assignee}` : ''}</small></div>
        <div className="row-gap">
          {chat.phone && <a className="btn btn-ghost btn-sm" href={telHref(chat.phone)}><LuPhone /></a>}
          {chat.phone && <a className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer" href={waLink(chat.phone)}><FaWhatsapp /></a>}
          {chat.phone && <Link className="btn btn-ghost btn-sm" to={`/admin/customers?open=${phoneKey(chat.phone)}`}>Profile</Link>}
          {chat.status !== 'open' && chat.status !== 'closed' && <button className="btn btn-primary btn-sm" onClick={() => setStatus('open', { assignee: me })}>Take chat</button>}
          {chat.status !== 'closed' ? <button className="btn btn-ghost btn-sm" onClick={() => setStatus('closed')}>Close</button> : <button className="btn btn-ghost btn-sm" onClick={() => setStatus('ai')}>Reopen</button>}
        </div>
      </header>
      <div className="thread-body">
        {msgs.map((m) => (
          <div key={m.id} className={`msg ${m.from}`}>
            <small className="msg-who">{m.from === 'customer' ? chat.name || 'Customer' : m.from === 'ai' ? 'Assistant' : m.from === 'agent' ? m.agent : 'System'} · {new Date(m.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</small>
            {m.text && <p>{m.text}</p>}
            {(m.products || []).map((s) => bySlug[s] && <Link key={s} to={`/product/${s}`} target="_blank" className="msg-product">{bySlug[s].name} · {money(bySlug[s].price)}</Link>)}
          </div>
        ))}
        <div ref={end} />
      </div>
      <form className="thread-input" onSubmit={send}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={chat.status === 'ai' ? 'Reply to take over from the assistant' : 'Write a reply'} />
        <button className="btn btn-primary" disabled={!text.trim()}><LuSend /> Send</button>
      </form>
    </div>
  );
}

export default function Inbox() {
  useTitle('Inbox');
  const [sp, setSp] = useSearchParams();
  const [chats, setChats] = useState([]);
  const [f, setF] = useState('active');
  useEffect(() => chatCol().watch({ limit: 300 }, (r) => setChats(r.sort((a, b) => b.updatedAt - a.updatedAt))), []);
  const shown = useMemo(() => chats.filter((c) => (f === 'all' ? true : f === 'active' ? ['waiting', 'open'].includes(c.status) : c.status === f)), [chats, f]);
  const counts = useMemo(() => ({ active: chats.filter((c) => ['waiting', 'open'].includes(c.status)).length, ai: chats.filter((c) => c.status === 'ai').length }), [chats]);
  const current = chats.find((c) => c.id === sp.get('chat'));
  return (
    <div className="admin-page wide inbox-page">
      <div className="page-head"><div><h1>Inbox</h1><p className="muted">Website chats. The assistant answers first; reply here to take over.</p></div></div>
      <div className={`inbox ${current ? 'has-thread' : ''}`}>
        <aside className="inbox-list">
          <div className="seg">{FILTERS.map(([k, l]) => <button key={k} className={f === k ? 'on' : ''} onClick={() => setF(k)}>{l}{counts[k] ? ` ${counts[k]}` : ''}</button>)}</div>
          {shown.length === 0 && <p className="muted pad">No chats here.</p>}
          {shown.map((c) => (
            <button key={c.id} className={`inbox-row ${current?.id === c.id ? 'on' : ''} ${c.status === 'waiting' ? 'waiting' : ''}`} onClick={() => setSp({ chat: c.id })}>
              <span className="inbox-top"><b>{c.name || 'Guest'}</b><small>{ago(c.updatedAt)}</small></span>
              <span className="inbox-last">{c.lastFrom === 'customer' ? '' : `${c.lastFrom}: `}{c.lastMessage}</span>
              <span className="inbox-meta"><span className={`status s-chat-${c.status}`}>{c.status === 'waiting' ? 'Waiting' : c.status === 'ai' ? 'Assistant' : c.status}</span>{c.unreadStaff > 0 && <i className="nav-badge">{c.unreadStaff}</i>}</span>
            </button>
          ))}
        </aside>
        <section className="inbox-thread">{current ? <Thread chat={current} /> : <div className="empty"><h3>Pick a conversation</h3><p>Chats waiting for a person are at the top.</p></div>}</section>
      </div>
    </div>
  );
}
