import { useEffect, useRef, useState } from 'react';
import { LuCheck, LuLanguages } from 'react-icons/lu';

// Whole-page translation through Google's website translator, so product names,
// descriptions and every page follow the chosen language. English needs no script.
const LANGS = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'zh-CN', label: '中文', short: '中文' },
  { code: 'ru', label: 'Русский', short: 'RU' },
];

export function currentLang() {
  const m = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([^;]+)/);
  const c = m ? decodeURIComponent(m[1]) : 'en';
  return LANGS.some((l) => l.code === c) ? c : 'en';
}

function writeCookie(code) {
  const host = location.hostname;
  const bare = host.replace(/^www\./, '');
  const value = code === 'en' ? '' : `/en/${code}`;
  const exp = code === 'en' ? '; expires=Thu, 01 Jan 1970 00:00:00 GMT' : '; max-age=31536000';
  const domains = ['', `; domain=${host}`];
  if (bare.includes('.')) domains.push(`; domain=.${bare}`);
  domains.forEach((d) => { document.cookie = `googtrans=${value}; path=/${d}${exp}`; });
}

/** Loads the translator when a non-English language is saved. Called once at start-up. */
export function startTranslator() {
  const lang = currentLang();
  document.documentElement.lang = lang;
  if (lang === 'en' || window.__d114Translator) return;
  window.__d114Translator = true;
  const holder = document.createElement('div');
  holder.id = 'gt-holder';
  holder.style.display = 'none';
  document.body.appendChild(holder);
  window.__d114GtInit = () => {
    // eslint-disable-next-line no-new
    new window.google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: 'en,zh-CN,ru', autoDisplay: false }, 'gt-holder');
  };
  const s = document.createElement('script');
  s.src = 'https://translate.google.com/translate_a/element.js?cb=__d114GtInit';
  s.async = true;
  document.body.appendChild(s);
}

export default function LangSwitch() {
  const [open, setOpen] = useState(false);
  const lang = currentLang();
  const ref = useRef();
  useEffect(() => {
    if (!open) return;
    const off = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', off);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', off); document.removeEventListener('keydown', esc); };
  }, [open]);

  function choose(code) {
    setOpen(false);
    if (code === lang) return;
    writeCookie(code);
    location.reload();
  }

  const cur = LANGS.find((l) => l.code === lang);
  return (
    <div className="lang notranslate" translate="no" ref={ref}>
      <button className="lang-btn" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open} aria-label={`Language: ${cur.label}. Change language`}>
        <LuLanguages /><span>{cur.short}</span>
      </button>
      {open && (
        <ul className="lang-menu" role="listbox" aria-label="Choose language">
          {LANGS.map((l) => (
            <li key={l.code}>
              <button role="option" aria-selected={l.code === lang} lang={l.code} onClick={() => choose(l.code)}>
                {l.label}{l.code === lang && <LuCheck />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
