import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LuLayoutDashboard, LuReceipt, LuKanban, LuUsers, LuMessagesSquare, LuPackage, LuShapes, LuFileSpreadsheet,
  LuBadgePercent, LuUserCog, LuSettings, LuExternalLink, LuLogOut, LuMenu, LuX,
} from 'react-icons/lu';
import Logo from '../../components/Logo';
import { DEMO, chatCol, logout } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';

const GROUPS = [
  ['', [['/admin', 'Overview', LuLayoutDashboard, 'support', true]]],
  ['Sales', [['/admin/orders', 'Orders', LuReceipt, 'sales'], ['/admin/leads', 'Leads pipeline', LuKanban, 'sales'], ['/admin/customers', 'Customers', LuUsers, 'sales']]],
  ['Support', [['/admin/inbox', 'Inbox', LuMessagesSquare, 'support', false, 'inbox']]],
  ['Catalog', [['/admin/products', 'Products', LuPackage, 'catalog'], ['/admin/categories', 'Categories', LuShapes, 'catalog'], ['/admin/import', 'Import & export', LuFileSpreadsheet, 'catalog'], ['/admin/coupons', 'Promo codes', LuBadgePercent, 'catalog']]],
  ['Company', [['/admin/team', 'Team & accounts', LuUserCog, 'admin'], ['/admin/settings', 'Store settings', LuSettings, 'admin']]],
];

export default function AdminLayout() {
  const { user, role, can } = useAuth();
  const [open, setOpen] = useState(false);
  const [waiting, setWaiting] = useState(0);
  const loc = useLocation();
  useEffect(() => { setOpen(false); }, [loc.pathname]);
  useEffect(() => chatCol().watch({ where: [['status', 'in', ['waiting', 'open']]], limit: 100 }, (r) => setWaiting(r.filter((c) => c.status === 'waiting' || c.unreadStaff > 0).length), () => {}), []);

  return (
    <div className={`admin ${open ? 'menu-open' : ''}`}>
      <aside className="admin-side">
        <div className="admin-brand"><Link to="/admin"><Logo onBlue /></Link><button className="icon-btn on-blue only-mobile" onClick={() => setOpen(false)} aria-label="Close menu"><LuX /></button></div>
        <nav>
          {GROUPS.map(([g, links]) => {
            const shown = links.filter((l) => can(l[3]));
            if (!shown.length) return null;
            return (
              <div key={g || 'top'} className="admin-group">
                {g && <span className="admin-group-label">{g}</span>}
                {shown.map(([to, label, I, , end, badge]) => (
                  <NavLink key={to} to={to} end={end}><I /> <span>{label}</span>{badge === 'inbox' && waiting > 0 && <i className="nav-badge">{waiting}</i>}</NavLink>
                ))}
              </div>
            );
          })}
        </nav>
        <div className="admin-side-foot">
          <Link to="/" target="_blank"><LuExternalLink /> View store</Link>
          <button onClick={logout}><LuLogOut /> Sign out</button>
          <small>{user?.profile?.name || user?.email} · {role}</small>
        </div>
      </aside>
      {open && <div className="scrim only-mobile" onClick={() => setOpen(false)} />}
      <div className="admin-main">
        <div className="admin-top">
          <button className="icon-btn only-mobile" onClick={() => setOpen(true)} aria-label="Open admin menu"><LuMenu /></button>
          {DEMO && <span className="demo-pill">Demo mode: data stays in this browser</span>}
        </div>
        <Outlet />
      </div>
    </div>
  );
}
