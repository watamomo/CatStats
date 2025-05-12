
import { Outlet } from "react-router-dom";
import Sidebar from "./components/ui/SideBar";

function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 bg-[#121212] p-6">
        <Outlet />
      </div>
    </div>
  );
}

export default AppLayout;
