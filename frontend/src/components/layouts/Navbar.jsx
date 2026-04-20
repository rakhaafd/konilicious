import { useState, useEffect } from "react";
import Button from "../Button";
import { IoCartOutline, IoPersonOutline, IoLogOutOutline, IoMenuOutline, IoCloseOutline } from "react-icons/io5";

const Navbar = ({ isLoggedIn, setPage, cartCount, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNav = (page) => {
    setIsOpen(false);
    if (setPage) setPage(page);
  };

  const navLinks = [
    { name: "Home", page: "beranda" },
    { name: "Menu", page: "menu" },
  ];
  const isAdmin = user?.role === "admin";

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-2" : "bg-white py-4"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/" onClick={(e) => { e.preventDefault(); handleNav("beranda"); }} className="text-2xl font-extrabold text-primary flex items-center gap-2">
              <h2 className="brand text-4xl text-secondary px-2 py-1 rounded-xl">Konilicious.</h2>
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-1 items-center">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={`/${link.page === "beranda" ? "" : link.page}`}
              className="px-4 py-2 rounded-full text-gray-700 hover:text-secondary hover:bg-red-50 font-bold transition-all duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(link.page);
                }}
              >
                {link.name}
              </a>
            ))}
            {isLoggedIn && isAdmin && (
              <a
                href="/admin"
                className="px-4 py-2 rounded-full text-gray-700 hover:text-secondary hover:bg-red-50 font-bold transition-all duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  handleNav("admin");
                }}
              >
                Dashboard
              </a>
            )}
            {isLoggedIn && isAdmin && (
              <a
                href="/admin/users"
                className="px-4 py-2 rounded-full text-gray-700 hover:text-secondary hover:bg-red-50 font-bold transition-all duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  handleNav("admin/users");
                }}
              >
                Users
              </a>
            )}
            {isLoggedIn && isAdmin && (
              <a
                href="/admin/menus"
                className="px-4 py-2 rounded-full text-gray-700 hover:text-secondary hover:bg-red-50 font-bold transition-all duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  handleNav("admin/menus");
                }}
              >
                Menus
              </a>
            )}
            {isLoggedIn && isAdmin && (
              <a
                href="/admin/orders"
                className="px-4 py-2 rounded-full text-gray-700 hover:text-secondary hover:bg-red-50 font-bold transition-all duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  handleNav("admin/orders");
                }}
              >
                Orders
              </a>
            )}
            {isLoggedIn && isAdmin && (
              <a
                href="/admin/reviews"
                className="px-4 py-2 rounded-full text-gray-700 hover:text-secondary hover:bg-red-50 font-bold transition-all duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  handleNav("admin/reviews");
                }}
              >
                Reviews
              </a>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => handleNav("cart")}
                  className="relative p-2.5 text-gray-700 hover:text-secondary hover:bg-red-50 rounded-full transition-all duration-300"
                  title="Cart"
                >
                  <IoCartOutline className="text-2xl" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-secondary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                      {cartCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleNav("profile")}
                  className="p-2.5 text-gray-700 hover:text-primary hover:bg-orange-50 rounded-full transition-all duration-300"
                  title="Profile"
                >
                  <IoPersonOutline className="text-2xl" />
                </button>

                <button
                  onClick={() => {
                    localStorage.removeItem("user");
                    localStorage.removeItem("token");
                    localStorage.setItem("isLoggedIn", "false");
                    window.location.href = "/";
                  }}
                  className="p-2.5 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-300"
                  title="Logout"
                >
                  <IoLogOutOutline className="text-2xl" />
                </button>

                <Button
                  variant="primary"
                  onClick={() => handleNav("menu")}
                  className="ml-2"
                >
                  Order Now
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => handleNav("login")}
                  className="hover:bg-gray-100"
                >
                  Login
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleNav("register")}
                >
                  Register
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {isLoggedIn && (
              <button
                onClick={() => handleNav("cart")}
                className="relative p-2 text-gray-700 mr-2"
              >
                <IoCartOutline className="text-2xl" />
                {cartCount > 0 && (
                  <span className="absolute 0 top-0 right-0 bg-secondary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors"
            >
              {isOpen ? <IoCloseOutline className="text-3xl" /> : <IoMenuOutline className="text-3xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-lg transition-all duration-300 origin-top overflow-hidden ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-4 py-6 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={`/${link.page === "beranda" ? "" : link.page}`}
              className="block px-4 py-3 rounded-xl text-gray-800 font-bold hover:bg-red-50 hover:text-secondary transition-colors"
              onClick={(e) => {
                e.preventDefault();
                handleNav(link.page);
              }}
            >
              {link.name}
            </a>
          ))}
          {isLoggedIn && isAdmin && (
            <a
              href="/admin"
              className="block px-4 py-3 rounded-xl text-gray-800 font-bold hover:bg-red-50 hover:text-secondary transition-colors"
              onClick={(e) => {
                e.preventDefault();
                handleNav("admin");
              }}
            >
              Dashboard
            </a>
          )}
          {isLoggedIn && isAdmin && (
            <a
              href="/admin/users"
              className="block px-4 py-3 rounded-xl text-gray-800 font-bold hover:bg-red-50 hover:text-secondary transition-colors"
              onClick={(e) => {
                e.preventDefault();
                handleNav("admin/users");
              }}
            >
              Users
            </a>
          )}
          {isLoggedIn && isAdmin && (
            <a
              href="/admin/menus"
              className="block px-4 py-3 rounded-xl text-gray-800 font-bold hover:bg-red-50 hover:text-secondary transition-colors"
              onClick={(e) => {
                e.preventDefault();
                handleNav("admin/menus");
              }}
            >
              Menus
            </a>
          )}
          {isLoggedIn && isAdmin && (
            <a
              href="/admin/orders"
              className="block px-4 py-3 rounded-xl text-gray-800 font-bold hover:bg-red-50 hover:text-secondary transition-colors"
              onClick={(e) => {
                e.preventDefault();
                handleNav("admin/orders");
              }}
            >
              Orders
            </a>
          )}
          {isLoggedIn && isAdmin && (
            <a
              href="/admin/reviews"
              className="block px-4 py-3 rounded-xl text-gray-800 font-bold hover:bg-red-50 hover:text-secondary transition-colors"
              onClick={(e) => {
                e.preventDefault();
                handleNav("admin/reviews");
              }}
            >
              Reviews
            </a>
          )}
          
          <hr className="border-gray-100 my-4" />

          {isLoggedIn ? (
            <div className="space-y-3">
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-800 font-bold hover:bg-orange-50 hover:text-primary transition-colors"
                onClick={() => handleNav("profile")}
              >
                 <IoPersonOutline className="text-xl" /> Profile
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 font-bold hover:bg-red-50 transition-colors"
                onClick={() => {
                  localStorage.removeItem("user");
                  localStorage.removeItem("token");
                  localStorage.setItem("isLoggedIn", "false");
                  window.location.href = "/";
                }}
              >
                 <IoLogOutOutline className="text-xl" /> Logout
              </button>
              <div className="pt-4">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => handleNav("menu")}
                >
                  Order Now
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-2">
              <Button
                variant="ghost"
                fullWidth
                onClick={() => handleNav("login")}
                className="border border-gray-200"
              >
                Login
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => handleNav("register")}
              >
                Register
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
