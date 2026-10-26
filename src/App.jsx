import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, HashRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CatalogProvider } from './context/CatalogContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';
import { Spinner } from './components/ui';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderPlaced from './pages/OrderPlaced';
import Track from './pages/Track';
import Account from './pages/Account';
import { Login, Register } from './pages/Auth';
import { InfoPage, NotFound, Quote, Solutions, Wishlist } from './pages/Misc';
import { HASH } from './config';

// Admin screens load only when an admin opens /admin.
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products').then((m) => ({ default: m.AdminProducts })));
const ProductForm = lazy(() => import('./pages/admin/Products').then((m) => ({ default: m.ProductForm })));
const Categories = lazy(() => import('./pages/admin/Categories'));
const Orders = lazy(() => import('./pages/admin/Orders'));
const Quotes = lazy(() => import('./pages/admin/Quotes'));
const People = lazy(() => import('./pages/admin/People'));

function RequireUser({ children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <Spinner full />;
  return user ? children : <Navigate to={`/login?next=${encodeURIComponent(loc.pathname)}`} replace />;
}
function RequireAdmin({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <Spinner full />;
  if (!user) return <Navigate to="/login?next=/admin" replace />;
  return isAdmin ? children : <Navigate to="/account" replace />;
}

function StoreLayout() {
  const loc = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  return (
    <div className="store">
      <Navbar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main key={loc.pathname} className="store-main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}>
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

export default function App() {
  const Router = HASH ? HashRouter : BrowserRouter;
  return (
    <MotionConfig reducedMotion="user">
      <Router>
        <AuthProvider>
          <CatalogProvider>
            <CartProvider>
              <WishlistProvider>
                <Toaster position="bottom-center" toastOptions={{ duration: 2600, className: 'toast' }} />
                <Suspense fallback={<Spinner full />}>
                  <Routes>
                    <Route element={<StoreLayout />}>
                      <Route index element={<Home />} />
                      <Route path="shop" element={<Shop />} />
                      <Route path="product/:slug" element={<Product />} />
                      <Route path="cart" element={<Cart />} />
                      <Route path="checkout" element={<Checkout />} />
                      <Route path="order/:no" element={<OrderPlaced />} />
                      <Route path="track" element={<Track />} />
                      <Route path="quote" element={<Quote />} />
                      <Route path="solutions" element={<Solutions />} />
                      <Route path="wishlist" element={<Wishlist />} />
                      <Route path="login" element={<Login />} />
                      <Route path="register" element={<Register />} />
                      <Route path="account" element={<RequireUser><Account /></RequireUser>} />
                      <Route path="page/:slug" element={<InfoPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                    <Route path="admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
                      <Route index element={<Dashboard />} />
                      <Route path="orders" element={<Orders />} />
                      <Route path="quotes" element={<Quotes />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="products/new" element={<ProductForm />} />
                      <Route path="products/:id" element={<ProductForm />} />
                      <Route path="categories" element={<Categories />} />
                      <Route path="people" element={<People />} />
                    </Route>
                  </Routes>
                </Suspense>
              </WishlistProvider>
            </CartProvider>
          </CatalogProvider>
        </AuthProvider>
      </Router>
    </MotionConfig>
  );
}
