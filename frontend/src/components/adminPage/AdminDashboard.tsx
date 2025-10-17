import { useState, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { FinancialCards } from "./FinancialCards";
import { BathSchedule } from "./BathSchedule";
import { UpcomingAppointments } from "./UpcomingAppointments";
import { QuickActionButtons } from "./QuickActionButtons";
import { NotificationsList } from "./NotificationsList";
import { QuickReports } from "./QuickReports";
import { SchedulePage } from "./SchedulePage";
import { ClientsPage } from "./ClientsPage";
import { PetsPage } from "./PetsPage";
import { FinancialPage } from "./FinancialPage";
import { ReportsPage } from "./ReportsPage";
import { AnalyticsPage } from "./AnalyticsPage";
import { SettingsPage } from "./SettingsPage";
import { NotificationsPage } from "./NotificationsPage";
import { SidebarProvider, SidebarInset } from "../ui/sidebar";
import { getCurrentUser } from "../../services/auth";

type AdminPageType = "dashboard" | "schedule" | "clients" | "pets" | "financial" | "reports" | "analytics" | "settings" | "notifications";

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [currentPage, setCurrentPage] = useState<AdminPageType>("dashboard");
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

  const renderContent = () => {
    if (authLoading) return <div>Carregando...</div>;

    switch (currentPage) {
      case "schedule":
        return <SchedulePage />;
      case "settings":
        return <SettingsPage />;
      case "notifications":
        return <NotificationsPage />;
      case "clients":
        return <ClientsPage currentRole={(auth.role as any) || 'user'} currentBusinessId={auth.business_id} currentUserId={auth.id} />;
      case "pets":
        return <PetsPage currentRole={(auth.role as any) || 'user'} currentBusinessId={auth.business_id} currentUserId={auth.id} />;
      case "financial":
        return <FinancialPage />;
      case "reports":
        return <ReportsPage />;
      case "analytics":
        return <AnalyticsPage />;
      default:
        return (
          <main className="flex-1 space-y-6 p-6">

            <FinancialCards />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <BathSchedule />
                <UpcomingAppointments />
              </div>

              <div className="space-y-6">
                <QuickActionButtons />
                <NotificationsList />
                <QuickReports />
              </div>
            </div>
          </main>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar onLogout={onLogout} />
        <SidebarInset className="flex-1">
          <DashboardHeader />
          {renderContent()}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}