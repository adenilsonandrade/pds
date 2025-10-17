import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import { getCurrentUser } from './services/auth';
import { LandingPage } from "./components/landingPage/LandingPage";
import { LoginPage } from "./components/loginPage/LoginPage";
import AdminLayout from "./components/adminPage/AdminLayout";
import AdminHome from "./components/adminPage/AdminHome";
import { ClientsPage } from "./components/adminPage/ClientsPage";
import { SchedulePage } from "./components/adminPage/SchedulePage";
import { PetsPage } from "./components/adminPage/PetsPage";
import { FinancialPage } from "./components/adminPage/FinancialPage";
import { ReportsPage } from "./components/adminPage/ReportsPage";
import { AnalyticsPage } from "./components/adminPage/AnalyticsPage";
import { SettingsPage } from "./components/adminPage/SettingsPage";
import { NotificationsPage } from "./components/adminPage/NotificationsPage";
import UsersPage from "./components/adminPage/UsersPage";
import BusinessesPage from "./components/adminPage/BusinessesPage";
import PrivateRoute from './components/PrivateRoute';

export default function App() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState<{ id?: number | null; role: string | null; business_id: string | null }>({ id: null, role: null, business_id: null });
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
  const user = await getCurrentUser();
  if (!mounted) return;
  setAuth({ id: user.id || null, role: user.role || null, business_id: user.business_id || null });
      } catch (e) {
        if (!mounted) return;
        setAuth({ role: null, business_id: null });
      } finally {
        if (mounted) setAuthLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage onNavigateToLogin={() => navigate('/login')} />} />
      <Route path="/login" element={<LoginPage onBackToLanding={() => navigate('/')} onLoginSuccess={() => navigate('/admin')} />} />

  <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
        <Route index element={<AdminHome />} />
        <Route path="clients" element={
          authLoading ? <div>Carregando...</div> : <ClientsPage currentRole={(auth.role as any) || 'user'} currentBusinessId={auth.business_id} currentUserId={auth.id} />
        } />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="pets" element={
          authLoading ? <div>Carregando...</div> : <PetsPage currentRole={(auth.role as any) || 'user'} currentBusinessId={auth.business_id} currentUserId={auth.id} />
        } />
        <Route path="financial" element={<FinancialPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="users" element={
    authLoading ? <div>Carregando...</div> : <UsersPage currentRole={(auth.role as any) || 'user'} currentBusinessId={auth.business_id} currentUserId={auth.id} />
        } />
        <Route path="petshops" element={
          authLoading ? <div>Carregando...</div> : <BusinessesPage />
        } />
      </Route>
    </Routes>
  );
}