import { createContext, useContext, useEffect, useState } from 'react';
import { onUser } from '../lib/db';

const Ctx = createContext({ user: null, loading: true });
export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, loading: true });
  useEffect(() => onUser((user) => setState({ user, loading: false })), []);
  const isAdmin = state.user?.profile?.role === 'admin';
  return <Ctx.Provider value={{ ...state, isAdmin }}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
