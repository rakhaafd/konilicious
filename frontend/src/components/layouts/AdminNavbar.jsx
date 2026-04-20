import { NavLink, useNavigate } from "react-router-dom";
import Button from "../Button";

const adminLinks = [
  { name: "Dashboard", to: "/admin", end: true },
  { name: "Users", to: "/admin/users" },
  { name: "Menus", to: "/admin/menus" },
  { name: "Orders", to: "/admin/orders" },
  { name: "Reviews", to: "/admin/reviews" },
];

export default function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.setItem("isLoggedIn", "false");
    navigate("/admin/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-6">
          <NavLink to="/admin" className="text-2xl font-black text-gray-900 tracking-tight">
            Admin Panel
          </NavLink>

          <nav className="flex flex-wrap items-center gap-2">
            {adminLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                    isActive
                      ? "bg-red-600 text-white"
                      : "text-gray-700 hover:bg-red-50 hover:text-red-700"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
}