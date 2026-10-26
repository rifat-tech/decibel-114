import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LuSlidersHorizontal, LuX } from 'react-icons/lu';
import ProductCard from '../components/ProductCard';
import { Empty, Spinner, useTitle } from '../components/ui';
import { useCatalog } from '../context/CatalogContext';

const SORTS = { newest: 'Newest', featured: 'Recommended', 'price-asc': 'Price: low to high', 'price-desc': 'Price: high to low', name: 'Name' };

export default function Shop() {
  const { categories, products, catById, loading } = useCatalog();
  const [sp, setSp] = useSearchParams();
  const [sheet, setSheet] = useState(false);
  const cat = sp.get('cat') || '';
  const sub = sp.get('sub') || '';
  const brands = (sp.get('brand') || '').split(',').filter(Boolean);
  const q = (sp.get('q') || '').trim().toLowerCase();
  const min = Number(sp.get('min') || 0);
  const max = Number(sp.get('max') || 0);
  const stockOnly = sp.get('stock') === '1';
  const newOnly = sp.get('new') === '1';
  const sort = sp.get('sort') || 'newest';
  const category = catById[cat];
  useTitle(category ? category.name : q ? `Search: ${q}` : 'All products');

  const set = (k, v) => {
    const n = new URLSearchParams(sp);
    if (v === '' || v === null || v === undefined || v === false) n.delete(k); else n.set(k, v);
    if (k === 'cat') n.delete('sub');
    setSp(n, { replace: true });
  };
  const toggleBrand = (b) => set('brand', (brands.includes(b) ? brands.filter((x) => x !== b) : [...brands, b]).join(','));

  const scoped = useMemo(() => products.filter((p) => (!cat || p.categoryId === cat)), [products, cat]);
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
      featured: (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0),
      'price-asc': (a, b) => a.price - b.price,
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
        <button className={`chip-row ${!cat ? 'on' : ''}`} onClick={() => set('cat', '')}>All categories</button>
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
      {brandList.length > 0 && (
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
      {active > 0 && <button className="btn btn-ghost btn-block" onClick={() => setSp(cat ? { cat } : {}, { replace: true })}>Clear filters</button>}
    </div>
  );

  return (
    <div className="container shop">
      <div className="shop-head">
        <div>
          <h1>{category ? category.name : q ? `Results for “${sp.get('q')}”` : 'All products'}</h1>
          <p>{loading ? 'Loading…' : `${results.length} ${results.length === 1 ? 'product' : 'products'}`}{category?.description ? `. ${category.description}.` : ''}</p>
        </div>
        <div className="shop-tools">
          <button className="btn btn-ghost only-mobile" onClick={() => setSheet(true)}><LuSlidersHorizontal /> Filters{active ? ` (${active})` : ''}</button>
          <select value={sort} onChange={(e) => set('sort', e.target.value === 'newest' ? '' : e.target.value)} aria-label="Sort products">
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
            <motion.div layout className="pgrid">
              <AnimatePresence initial={false}>
                {results.map((p) => (
                  <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2 }}>
                    <ProductCard product={p} category={catById[p.categoryId]} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
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
