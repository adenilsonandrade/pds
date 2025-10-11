import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { SidebarProvider, SidebarInset } from "../ui/sidebar";

type AdminPageType =
  | "dashboard"
  | "schedule"
  | "clients"
  | "pets"
  | "financial"
  | "reports"
  | "analytics"
  | "settings"
  | "notifications";

function pathToPage(pathname: string): AdminPageType {
  const parts = pathname.replace(/\/+$/, "").split("/");
  const last = parts[parts.length - 1];
  if (!last || last === "admin") return "dashboard";
  return (last as AdminPageType) || "dashboard";
}

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPage = pathToPage(location.pathname);

  const handleNavigate = (page: AdminPageType) => {
    if (page === "dashboard") navigate(`/admin`);
    else navigate(`/admin/${page}`);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar onLogout={() => navigate('/')} />
        <SidebarInset className="flex-1">
          <DashboardHeader />
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default AdminLayout;
