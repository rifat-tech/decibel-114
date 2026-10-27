import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getCatalog, getSettings, DEFAULT_SETTINGS } from '../lib/db';

const Ctx = createContext(null);
export function StoreProvider({ children }) {
  const [data, setData] = useState({ categories: [], products: [], loading: true, error: '' });
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  // Curated products render first; the full price list (~6k items) streams in right after.
  const load = useCallback(async (fresh = false) => {
    try {
      const q = await getCatalog({ fresh, full: false });
      setData((s) => (s.full ? s : { categories: q.categories, products: q.products, loading: false, error: '', full: false }));
      const d = await getCatalog({ fresh, full: true });
      setData({ categories: d.categories, products: d.products, loading: false, error: '', full: true });
    } catch (e) { console.error(e); setData((s) => ({ ...s, loading: false, error: 'The catalog could not load. Check your connection and refresh the page.' })); }
  }, []);
  const loadSettings = useCallback(() => getSettings().then(setSettings), []);
  useEffect(() => { load(); loadSettings(); }, [load, loadSettings]);
  const value = useMemo(() => {
    const catById = Object.fromEntries(data.categories.map((c) => [c.id, c]));
    const bySlug = Object.fromEntries(data.products.map((p) => [p.slug, p]));
    const brands = [...new Set(data.products.map((p) => p.brand).filter(Boolean))].sort();
    return { ...data, catById, bySlug, brands, settings, reload: () => load(true), reloadSettings: loadSettings };
  }, [data, settings, load, loadSettings]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useStore = () => useContext(Ctx);
// Backwards-compatible name used across pages.
export const useCatalog = useStore;
