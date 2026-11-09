import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import Categories from './pages/Categories.jsx';
import Services from './pages/Services.jsx';
import Orders from './pages/Orders.jsx';
import Coupons from './pages/Coupons.jsx';
import Reviews from './pages/Reviews.jsx';
import Customers from './pages/Customers.jsx';
import SiteSettings from './pages/SiteSettings.jsx';
import HomeContent from './pages/HomeContent.jsx';
import ThemeSettings from './pages/ThemeSettings.jsx';
import ContentPages from './pages/ContentPages.jsx';
import SeoSettings from './pages/SeoSettings.jsx';
import Analytics from './pages/Analytics.jsx';
import AiAssistant from './pages/AiAssistant.jsx';
import Backup from './pages/Backup.jsx';
import Update from './pages/Update.jsx';
import Invoices from './pages/Invoices.jsx';
import Courier from './pages/Courier.jsx';
import LandingPages from './pages/LandingPages.jsx';
import Integrations from './pages/Integrations.jsx';
import PaymentSettings from './pages/PaymentSettings.jsx';
import CourierSettings from './pages/CourierSettings.jsx';
import SmsSettings from './pages/SmsSettings.jsx';
import AnalyticsSettings from './pages/AnalyticsSettings.jsx';
import MarketingSettings from './pages/MarketingSettings.jsx';
import Returns from './pages/Returns.jsx';
import Warranties from './pages/Warranties.jsx';
import Campaigns from './pages/Campaigns.jsx';
import Suppliers from './pages/Suppliers.jsx';
import Purchases from './pages/Purchases.jsx';
import Inventory from './pages/Inventory.jsx';
import Loyalty from './pages/Loyalty.jsx';
import Support from './pages/Support.jsx';
import Faqs from './pages/Faqs.jsx';
import Policies from './pages/Policies.jsx';
import SeoAdvanced from './pages/SeoAdvanced.jsx';
import Vendors from './pages/Vendors.jsx';
import DeployGuide from './pages/DeployGuide.jsx';
import GithubPush from './pages/GithubPush.jsx';

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="h-full grid place-items-center text-ink-muted">
        লোড হচ্ছে…
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/services" element={<Services />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/courier" element={<Courier />} />
        <Route path="/landing" element={<LandingPages />} />
        <Route path="/coupons" element={<Coupons />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/loyalty" element={<Loyalty />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="/warranties" element={<Warranties />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/purchases" element={<Purchases />} />
        <Route path="/support" element={<Support />} />
        <Route path="/faqs" element={<Faqs />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/payment" element={<PaymentSettings />} />
        <Route path="/courier-settings" element={<CourierSettings />} />
        <Route path="/sms" element={<SmsSettings />} />
        <Route path="/analytics-settings" element={<AnalyticsSettings />} />
        <Route path="/marketing" element={<MarketingSettings />} />
        <Route path="/seo-advanced" element={<SeoAdvanced />} />
        <Route path="/deploy" element={<DeployGuide />} />
        <Route path="/github" element={<GithubPush />} />
        <Route path="/settings" element={<SiteSettings />} />
        <Route path="/home" element={<HomeContent />} />
        <Route path="/theme" element={<ThemeSettings />} />
        <Route path="/content" element={<ContentPages />} />
        <Route path="/seo" element={<SeoSettings />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/ai" element={<AiAssistant />} />
        <Route path="/backup" element={<Backup />} />
        <Route path="/update" element={<Update />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
