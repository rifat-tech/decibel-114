import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LuSlidersHorizontal, LuX } from 'react-icons/lu';
import ProductCard from '../components/ProductCard';
import { Empty, Spinner, useTitle } from '../components/ui';
import { useCatalog } from '../context/StoreContext';
import { discountPct } from '../config';
import DeviceArt from '../components/DeviceArt';

const PAGE = 48;
const SORTS = { featured: 'Best match', newest: 'Newest', discount: 'Biggest savings', 'price-asc': 'Price: low to high', 'price-desc': 'Price: high to low', name: 'Name' };

export default function Shop({ preset = {}, heading, intro, art }) {
  const { categories, products, catById, loading } = useCatalog();
  const [sp, setSp] = useSearchParams();
  const [sheet, setSheet] = useState(false);
  const cat = sp.get('cat') || preset.cat || '';
  const sub = sp.get('sub') || '';
  const brands = (sp.get('brand') || preset.brand || '').split(',').filter(Boolean);
  const dealsOnly = sp.get('deals') === '1' || !!preset.deals;
  const q = (sp.get('q') || '').trim().toLowerCase();
  const min = Number(sp.get('min') || 0);
  const max = Number(sp.get('max') || 0);
  const stockOnly = sp.get('stock') === '1';
  const newOnly = sp.get('new') === '1';
  const sort = sp.get('sort') || preset.sort || 'featured';
  const category = catById[cat];
  const [shown, setShown] = useState(PAGE);
  useEffect(() => setShown(PAGE), [sp.toString()]); // eslint-disable-line react-hooks/exhaustive-deps
  useTitle(heading || (category ? category.name : q ? `Search: ${q}` : 'All products'));

  const set = (k, v) => {
    const n = new URLSearchParams(sp);
    if (v === '' || v === null || v === undefined || v === false) n.delete(k); else n.set(k, v);
    if (k === 'cat') n.delete('sub');
    setSp(n, { replace: true });
  };
  const toggleBrand = (b) => set('brand', (brands.includes(b) ? brands.filter((x) => x !== b) : [...brands, b]).join(','));

  const scoped = useMemo(() => products.filter((p) => (!cat || p.categoryId === cat) && (!preset.brand || p.brand === preset.brand) && (!dealsOnly || discountPct(p) > 0)), [products, cat, preset.brand, dealsOnly]);
  const subs = useMemo(() => [...new Set(scoped.map((p) => p.subcategory).filter(Boolean))].sort(), [scoped]);
  const brandList = useMemo(() => [...new Set(scoped.map((p) => p.brand).filter(Boolean))].sort(), [scoped]);

  const results = useMemo(() => {
    let r = scoped.filter((p) => {
      if (sub && p.subcategory !== sub) return false;
      if (brands.length && !brands.includes(p.brand)) return false;
      if (min && p.price < min) return false;
      if (max && p.price > max) return false;
      if (stockOnly && p.stock <= 0) return false;
      if (newOnly && !p.newArrival) return false;
      if (q) {
        const hay = [p.name, p.brand, p.subcategory, p.shortDescription, ...(p.tags || []), catById[p.categoryId]?.name].join(' ').toLowerCase();
        if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
      }
      return true;
    });
    const by = {
      newest: (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
      featured: (a, b) => ((b.featured ? 2 : 0) + (b.stock > 0 ? 1 : 0)) - ((a.featured ? 2 : 0) + (a.stock > 0 ? 1 : 0)),
      discount: (a, b) => (b.originalPrice - b.price) * (discountPct(b) > 0) - (a.originalPrice - a.price) * (discountPct(a) > 0),
      'price-asc': (a, b) => (a.price || 1e12) - (b.price || 1e12),
      'price-desc': (a, b) => b.price - a.price,
      name: (a, b) => a.name.localeCompare(b.name),
    }[sort];
    return by ? [...r].sort(by) : r;
  }, [scoped, sub, brands, min, max, stockOnly, newOnly, q, sort, catById]);

  const active = [sub, ...brands, min, max, stockOnly, newOnly, q].filter(Boolean).length;

  const Filters = (
    <div className="filters">
      <div className="filter-block">
        <h4>Category</h4>
        {!preset.cat && <button className={`chip-row ${!cat ? 'on' : ''}`} onClick={() => set('cat', '')}>All categories</button>}
        {categories.map((c) => (
          <button key={c.id} className={`chip-row ${cat === c.id ? 'on' : ''}`} onClick={() => set('cat', c.id)}>{c.name}</button>
        ))}
      </div>
      {subs.length > 1 && (
        <div className="filter-block">
          <h4>Type</h4>
          <div className="chips">
            {subs.map((s) => <button key={s} className={`chip ${sub === s ? 'on' : ''}`} onClick={() => set('sub', sub === s ? '' : s)}>{s}</button>)}
          </div>
        </div>
      )}
      {brandList.length > 1 && !preset.brand && (
        <div className="filter-block">
          <h4>Brand</h4>
          {brandList.map((b) => (
            <label key={b} className="check"><input type="checkbox" checked={brands.includes(b)} onChange={() => toggleBrand(b)} /> {b}</label>
          ))}
        </div>
      )}
      <div className="filter-block">
        <h4>Price (৳)</h4>
        <div className="price-range">
          <input inputMode="numeric" placeholder="Min" defaultValue={min || ''} onBlur={(e) => set('min', e.target.value.replace(/\D/g, ''))} aria-label="Minimum price" />
          <span>to</span>
          <input inputMode="numeric" placeholder="Max" defaultValue={max || ''} onBlur={(e) => set('max', e.target.value.replace(/\D/g, ''))} aria-label="Maximum price" />
        </div>
      </div>
      <div className="filter-block">
        <label className="check"><input type="checkbox" checked={stockOnly} onChange={(e) => set('stock', e.target.checked ? '1' : '')} /> In stock only</label>
        <label className="check"><input type="checkbox" checked={newOnly} onChange={(e) => set('new', e.target.checked ? '1' : '')} /> New arrivals</label>
      </div>
      {active > 0 && <button className="btn btn-ghost btn-block" onClick={() => setSp(sp.get('cat') ? { cat: sp.get('cat') } : {}, { replace: true })}>Clear filters</button>}
    </div>
  );

  return (
    <div className="container shop">
      {art && <div className="shop-hero"><DeviceArt type={art} /></div>}
      <div className="shop-head">
        <div>
          <h1>{heading || (category ? category.name : q ? `Results for “${sp.get('q')}”` : 'All products')}</h1>
          <p>{intro ? `${intro} ` : ''}{loading ? 'Loading…' : `${results.length} ${results.length === 1 ? 'product' : 'products'}`}</p>
        </div>
        <div className="shop-tools">
          <button className="btn btn-ghost only-mobile" onClick={() => setSheet(true)}><LuSlidersHorizontal /> Filters{active ? ` (${active})` : ''}</button>
          <select value={sort} onChange={(e) => set('sort', e.target.value === (preset.sort || 'featured') ? '' : e.target.value)} aria-label="Sort products">
            {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      <div className="shop-layout">
        <aside className="only-desktop">{Filters}</aside>
        <div>
          {loading ? <Spinner /> : results.length === 0 ? (
            <Empty title="Nothing matches these filters" action="Request it as a quote" to={`/quote?items=${encodeURIComponent(sp.get('q') || category?.name || '')}`}>
              Remove a filter, or tell us the model you need and we will source it.
            </Empty>
          ) : (
            <>
              <div className="pgrid">
                {results.slice(0, shown).map((p) => <ProductCard key={p.id} product={p} category={catById[p.categoryId]} />)}
              </div>
              {results.length > shown && (
                <div className="more-row">
                  <p className="muted small">Showing {shown} of {results.length.toLocaleString('en-IN')} products</p>
                  <button className="btn btn-ghost" onClick={() => setShown((n) => n + PAGE)}>Show {Math.min(PAGE, results.length - shown)} more</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {sheet && (
          <>
            <motion.div className="scrim" onClick={() => setSheet(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div className="sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'tween', duration: 0.25 }}>
              <div className="sheet-head"><h3>Filters</h3><button className="icon-btn" onClick={() => setSheet(false)} aria-label="Close filters"><LuX /></button></div>
              {Filters}
              <button className="btn btn-primary btn-block sheet-apply" onClick={() => setSheet(false)}>Show {results.length} products</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
