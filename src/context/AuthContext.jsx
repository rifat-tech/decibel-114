import { createContext, useContext, useEffect, useState } from 'react';
import { onUser, STAFF_ROLES } from '../lib/db';

const Ctx = createContext({ user: null, loading: true });
export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, loading: true });
  useEffect(() => onUser((user) => setState({ user, loading: false })), []);
  const role = state.user?.profile?.role || 'customer';
  const isStaff = STAFF_ROLES.includes(role);
  const can = (area) => ({
    admin: ['admin'],
    catalog: ['admin', 'manager'],
    sales: ['admin', 'manager', 'sales'],
    support: ['admin', 'manager', 'sales', 'support'],
  }[area] || []).includes(role);
  return <Ctx.Provider value={{ ...state, role, isStaff, isAdmin: role === 'admin', can }}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
