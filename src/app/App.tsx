import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { BottomNav } from './components/layout/BottomNav';
import { ProtectedRoute } from './components/ProtectedRoute';
import { WalletPage } from './pages/WalletPage';
import { CafeDetailPage } from './pages/CafeDetailPage';
import { QrPage } from './pages/QrPage';
import { ActivityPage } from './pages/ActivityPage';
import { ProfilePage } from './pages/ProfilePage';
import { CustomerOnboarding } from './pages/CustomerOnboarding';
import { AuthPage } from './pages/AuthPage';
import { BusinessLoginPage } from './pages/BusinessLoginPage';
import { BusinessLayout } from './components/business/BusinessLayout';
import { BusinessDashboard } from './pages/business/BusinessDashboard';
import { BusinessScanner } from './pages/business/BusinessScanner';
import { BusinessCustomers } from './pages/business/BusinessCustomers';
import { BusinessStaff } from './pages/business/BusinessStaff';
import { BusinessBranches } from './pages/business/BusinessBranches';
import { BusinessStatistics } from './pages/business/BusinessStatistics';
import { BusinessLoyalty } from './pages/business/BusinessLoyalty';
import { BusinessTransactions } from './pages/business/BusinessTransactions';
import { BusinessSettings } from './pages/business/BusinessSettings';
import { useEffect, useState } from 'react';
import { isAuthenticated, isBusinessUser } from '@/lib/store';

function AppRoutes() {
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [isBusiness, setIsBusiness] = useState<boolean>(false);

  // Check authentication on every route change
  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setIsBusiness(isBusinessUser());
  }, [location.pathname]);

  // Only show BottomNav for authenticated regular users (not business users)
  const showBottomNav = authenticated && !isBusiness;

  return (
    <>
      <Routes>
        {/* Always show splash/onboarding first */}
        <Route path="/" element={<CustomerOnboarding />} />
        
        {/* Auth - public */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/business-login" element={<BusinessLoginPage />} />
        
        {/* Protected app routes */}
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <WalletPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cafe/:id"
          element={
            <ProtectedRoute>
              <CafeDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/qr"
          element={
            <ProtectedRoute>
              <QrPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <ActivityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        
        {/* Business Panel Routes */}
        <Route
          path="/business/*"
          element={
            <ProtectedRoute>
              <BusinessLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<BusinessDashboard />} />
          <Route path="scanner" element={<BusinessScanner />} />
          <Route path="customers" element={<BusinessCustomers />} />
          <Route path="staff" element={<BusinessStaff />} />
          <Route path="branches" element={<BusinessBranches />} />
          <Route path="statistics" element={<BusinessStatistics />} />
          <Route path="loyalty" element={<BusinessLoyalty />} />
          <Route path="transactions" element={<BusinessTransactions />} />
          <Route path="settings" element={<BusinessSettings />} />
          <Route index element={<Navigate to="/business/dashboard" replace />} />
        </Route>
      </Routes>
      {showBottomNav && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <BrowserRouter>
        <div className="relative min-h-screen">
          <AppRoutes />
          <Toaster position="top-center" richColors />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;