import { useState } from "react";
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

type AdminPageType = "dashboard" | "schedule" | "clients" | "pets" | "financial" | "reports" | "analytics" | "settings" | "notifications";

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [currentPage, setCurrentPage] = useState<AdminPageType>("dashboard");

  const renderContent = () => {
    switch (currentPage) {
      case "schedule":
        return <SchedulePage />;
      case "settings":
        return <SettingsPage />;
      case "notifications":
        return <NotificationsPage />;
      case "clients":
        return <ClientsPage />;
      case "pets":
        return <PetsPage />;
      case "financial":
        return <FinancialPage />;
      case "reports":
        return <ReportsPage />;
      case "analytics":
        return <AnalyticsPage />;
      default:
        return (
          <main className="flex-1 space-y-6 p-6">
            {/* Cards de indicadores financeiros */}
            <FinancialCards />
            
            {/* Layout principal com 3 colunas: left column stacks BathSchedule + UpcomingAppointments; right column has widgets */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left column: stack BathSchedule and UpcomingAppointments so UpcomingAppointments isn't pushed down by right column height */}
              <div className="lg:col-span-2 space-y-6">
                <BathSchedule />
                <UpcomingAppointments />
              </div>

              {/* Right column with actions, notifications and reports */}
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