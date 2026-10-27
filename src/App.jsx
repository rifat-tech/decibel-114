import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, HashRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { ShopperProvider } from './context/ShopperContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import { Spinner } from './components/ui';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Product from './pages/Product';
import Compare from './pages/Compare';
import CompareBar from './pages/CompareBar';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderPlaced from './pages/OrderPlaced';
import Track from './pages/Track';
import Account from './pages/Account';
import { Login, Register } from './pages/Auth';
import { InfoPage, NotFound, Quote, Solutions, Wishlist } from './pages/Misc';
import { HASH } from './config';

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Orders = lazy(() => import('./pages/admin/Orders'));
const Leads = lazy(() => import('./pages/admin/Leads'));
const Customers = lazy(() => import('./pages/admin/Customers'));
const Inbox = lazy(() => import('./pages/admin/Inbox'));
const AdminProducts = lazy(() => import('./pages/admin/Products').then((m) => ({ default: m.AdminProducts })));
const ProductForm = lazy(() => import('./pages/admin/Products').then((m) => ({ default: m.ProductForm })));
const ImportExport = lazy(() => import('./pages/admin/ImportExport'));
const Categories = lazy(() => import('./pages/admin/Categories'));
const Coupons = lazy(() => import('./pages/admin/Coupons'));
const People = lazy(() => import('./pages/admin/People'));
const Settings = lazy(() => import('./pages/admin/Settings'));

function RequireUser({ children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <Spinner full />;
  return user ? children : <Navigate to={`/login?next=${encodeURIComponent(loc.pathname)}`} replace />;
}
function RequireStaff({ children, area = 'support' }) {
  const { user, isStaff, can, loading } = useAuth();
  if (loading) return <Spinner full />;
  if (!user) return <Navigate to="/login?next=/admin" replace />;
  if (!isStaff) return <Navigate to="/account" replace />;
  return can(area) ? children : <div className="admin-page"><h1>No access</h1><p className="muted">Your role does not include this section. Ask an admin to change it.</p></div>;
}

function StoreLayout() {
  const loc = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  return (
    <div className="store">
      <Header />
      <main className="store-main"><Outlet /></main>
      <Footer />
      <CompareBar />
      <ChatWidget />
    </div>
  );
}

const Apple = () => <Shop preset={{ brand: 'Apple' }} heading="Apple store" intro="iPhone, Mac, iPad, Apple Watch, AirPods and accessories with official warranty." art="laptop" />;
const Deals = () => <Shop preset={{ deals: true, sort: 'discount' }} heading="Top deals" intro="Every product currently priced below its regular price." />;

export default function App() {
  const Router = HASH ? HashRouter : BrowserRouter;
  return (
    <MotionConfig reducedMotion="user">
      <Router>
        <AuthProvider>
          <StoreProvider>
            <CartProvider>
              <ShopperProvider>
                <Toaster position="bottom-center" toastOptions={{ duration: 2600, className: 'toast' }} />
                <Suspense fallback={<Spinner full />}>
                  <Routes>
                    <Route element={<StoreLayout />}>
                      <Route index element={<Home />} />
                      <Route path="shop" element={<Shop />} />
                      <Route path="brand/apple" element={<Apple />} />
                      <Route path="deals" element={<Deals />} />
                      <Route path="product/:slug" element={<Product />} />
                      <Route path="compare" element={<Compare />} />
                      <Route path="saved" element={<Wishlist />} />
                      <Route path="cart" element={<Cart />} />
                      <Route path="checkout" element={<Checkout />} />
                      <Route path="order/:no" element={<OrderPlaced />} />
                      <Route path="track" element={<Track />} />
                      <Route path="quote" element={<Quote />} />
                      <Route path="solutions" element={<Solutions />} />
                      <Route path="login" element={<Login />} />
                      <Route path="register" element={<Register />} />
                      <Route path="account" element={<RequireUser><Account /></RequireUser>} />
                      <Route path="page/:slug" element={<InfoPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                    <Route path="admin" element={<RequireStaff><AdminLayout /></RequireStaff>}>
                      <Route index element={<Dashboard />} />
                      <Route path="orders" element={<RequireStaff area="sales"><Orders /></RequireStaff>} />
                      <Route path="leads" element={<RequireStaff area="sales"><Leads /></RequireStaff>} />
                      <Route path="customers" element={<RequireStaff area="sales"><Customers /></RequireStaff>} />
                      <Route path="inbox" element={<Inbox />} />
                      <Route path="products" element={<RequireStaff area="catalog"><AdminProducts /></RequireStaff>} />
                      <Route path="products/new" element={<RequireStaff area="catalog"><ProductForm /></RequireStaff>} />
                      <Route path="products/:id" element={<RequireStaff area="catalog"><ProductForm /></RequireStaff>} />
                      <Route path="import" element={<RequireStaff area="catalog"><ImportExport /></RequireStaff>} />
                      <Route path="categories" element={<RequireStaff area="catalog"><Categories /></RequireStaff>} />
                      <Route path="coupons" element={<RequireStaff area="catalog"><Coupons /></RequireStaff>} />
                      <Route path="team" element={<RequireStaff area="admin"><People /></RequireStaff>} />
                      <Route path="settings" element={<RequireStaff area="admin"><Settings /></RequireStaff>} />
                    </Route>
                  </Routes>
                </Suspense>
              </ShopperProvider>
            </CartProvider>
          </StoreProvider>
        </AuthProvider>
      </Router>
    </MotionConfig>
  );
}
