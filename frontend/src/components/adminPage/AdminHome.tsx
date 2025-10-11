import { FinancialCards } from "./FinancialCards";
import { BathSchedule } from "./BathSchedule";
import { UpcomingAppointments } from "./UpcomingAppointments";
import { QuickActionButtons } from "./QuickActionButtons";
import { NotificationsList } from "./NotificationsList";
import { QuickReports } from "./QuickReports";

export default function AdminHome() {
  return (
    <main className="flex-1 space-y-3 p-2">
      <FinancialCards />

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <BathSchedule />
          <UpcomingAppointments />
        </div>

        <div className="space-y-3">
          <QuickActionButtons />
          <NotificationsList />
          <QuickReports />
        </div>
      </div>
    </main>
  );
}
