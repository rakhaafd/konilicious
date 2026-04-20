import { Outlet } from "react-router-dom";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/layouts/Footer";
import { useAppContext } from "../context/AppContext";

export default function MainLayout() {
  const { showNav, cartCount, isLoggedIn, setPage, location, user } = useAppContext();

  return (
    <div className="font-sans min-h-screen bg-white">
      {showNav && (
        <Navbar
          page={location.pathname.substring(1) || "beranda"}
          setPage={setPage}
          isLoggedIn={isLoggedIn}
          cartCount={cartCount}
          user={user}
        />
      )}

      <Outlet />

      {showNav && <Footer />}
    </div>
  );
}