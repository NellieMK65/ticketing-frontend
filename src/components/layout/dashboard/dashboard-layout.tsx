import { Outlet, useNavigate } from "react-router";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../../ui/sidebar";
import { AppSidebar } from "./sidebar";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../../context/auth-context";

export const DashboardLayout = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // if (user?.role !== 'admin') {
    //   navigate("/")
    // }
  }, [user, navigate]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 px-4 py-10">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
