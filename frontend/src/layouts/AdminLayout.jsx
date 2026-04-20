import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/layouts/AdminNavbar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50/30">
      <AdminNavbar />
      <Outlet />
    </div>
  );
}