import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { IoMenuOutline, IoCloseOutline, IoLogOutOutline } from "react-icons/io5";
import Button from "../Button";

const adminLinks = [
  { name: "Dashboard", to: "/admin", end: true },
  { name: "Users", to: "/admin/users" },
  { name: "Menus", to: "/admin/menus" },
  { name: "Orders", to: "/admin/orders" },
  { name: "Reviews", to: "/admin/reviews" },
];

export default function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.setItem("isLoggedIn", "false");
    navigate("/admin/login");
  };

  const handleNavigate = () => {
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <NavLink to="/admin" className="text-2xl font-black text-gray-900 tracking-tight" onClick={handleNavigate}>
            Admin Panel
          </NavLink>

          <nav className="hidden md:flex items-center gap-2">
            {adminLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={handleNavigate}
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

          <div className="hidden md:block">
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Toggle admin menu"
          >
            {isOpen ? <IoCloseOutline className="text-3xl" /> : <IoMenuOutline className="text-3xl" />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-lg transition-all duration-300 origin-top overflow-hidden ${
          isOpen ? "max-h-105 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-5 space-y-2">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={handleNavigate}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                  isActive
                    ? "bg-red-600 text-white"
                    : "text-gray-800 hover:bg-red-50 hover:text-red-700"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          <hr className="border-gray-100 my-3" />

          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 font-bold hover:bg-red-50 transition-colors"
            onClick={handleLogout}
          >
            <IoLogOutOutline className="text-xl" /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}