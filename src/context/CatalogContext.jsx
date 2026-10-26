import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getCatalog } from '../lib/db';

const Ctx = createContext(null);
export function CatalogProvider({ children }) {
  const [data, setData] = useState({ categories: [], products: [], loading: true, error: '' });
  const load = useCallback(async (fresh = false) => {
    try {
      const d = await getCatalog({ fresh });
      setData({ ...d, loading: false, error: '' });
    } catch (e) {
      setData((s) => ({ ...s, loading: false, error: 'The catalog could not load. Check your connection and refresh.' }));
      console.error(e);
    }
  }, []);
  useEffect(() => { load(); }, [load]);
  const value = useMemo(() => {
    const catById = Object.fromEntries(data.categories.map((c) => [c.id, c]));
    const brands = [...new Set(data.products.map((p) => p.brand).filter(Boolean))].sort();
    return { ...data, catById, brands, reload: () => load(true) };
  }, [data, load]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useCatalog = () => useContext(Ctx);
