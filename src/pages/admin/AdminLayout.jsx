import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { LuLayoutDashboard, LuPackage, LuShapes, LuReceipt, LuUsers, LuFileText, LuExternalLink, LuLogOut, LuMenu } from 'react-icons/lu';
import Logo from '../../components/Logo';
import { DEMO, logout } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';

const LINKS = [
  ['/admin', 'Overview', LuLayoutDashboard, true],
  ['/admin/orders', 'Orders', LuReceipt],
  ['/admin/quotes', 'Quote requests', LuFileText],
  ['/admin/products', 'Products', LuPackage],
  ['/admin/categories', 'Categories', LuShapes],
  ['/admin/people', 'Customers & staff', LuUsers],
];

export default function AdminLayout() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <div className={`admin ${open ? 'menu-open' : ''}`}>
      <aside className="admin-side" onClick={() => setOpen(false)}>
        <Link to="/admin" className="admin-logo"><Logo light /><small>Admin</small></Link>
        <nav>
          {LINKS.map(([to, l, I, end]) => <NavLink key={to} to={to} end={end}><I /> {l}</NavLink>)}
        </nav>
        <div className="admin-side-foot">
          <Link to="/" target="_blank"><LuExternalLink /> View store</Link>
          <button onClick={logout}><LuLogOut /> Sign out</button>
          <small>{user?.email}</small>
        </div>
      </aside>
      <div className="admin-main">
        <div className="admin-top">
          <button className="icon-btn only-mobile" onClick={() => setOpen(true)} aria-label="Open admin menu"><LuMenu /></button>
          {DEMO && <span className="demo-pill">Demo mode — data is saved in this browser only</span>}
        </div>
        <Outlet />
      </div>
    </div>
  );
}
