import { useEffect, useState } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import { useAppContext } from "./context/AppContext";
import WelcomePage from "./components/WelcomePage";

import BerandaPage from "./pages/user/BerandaPage";
import MenuPage from "./pages/user/MenuPage";
import DetailPage from "./pages/user/DetailPage";
import CartPage from "./pages/user/CartPage";
import ProfilePage from "./pages/user/ProfilePage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminMenusPage from "./pages/admin/AdminMenusPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminReviewsPage from "./pages/admin/AdminReviewsPage";
import AdminLoginPage from "./pages/admin/auth/AdminLoginPage";
import AdminRoute from "./pages/admin/AdminRoute";
import LoginPage from "./pages/user/auth/LoginPage";
import RegisterPage from "./pages/user/auth/RegisterPage";

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-accent px-6 py-16 text-center text-white">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Error 404</p>
      <h1 className="mb-2 text-5xl font-extrabold leading-none text-primary sm:text-6xl">404</h1>
      <h2 className="mb-3 text-xl font-semibold">Halaman tidak ditemukan</h2>
      <p className="mx-auto mb-6 max-w-sm text-sm text-slate-300">
        Maaf, halaman yang kamu tuju tidak tersedia atau mungkin sudah dipindahkan.
      </p>

      <Link
        to="/"
        className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-text transition hover:bg-primary-hover"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isClosingWelcome, setIsClosingWelcome] = useState(false);

  useEffect(() => {
    const startCloseTimer = setTimeout(() => {
      setIsClosingWelcome(true);
    }, 1900);

    const hideTimer = setTimeout(() => {
      setShowWelcome(false);
    }, 2600);

    return () => {
      clearTimeout(startCloseTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const {
    setPage,
    setSelectedItem,
    selectedItem,
    addToCart,
    showToast,
    cart,
    setCart,
    updateCartItemApi,
    removeCartItemApi,
    clearCartApi,
    setIsLoggedIn,
    user,
    setUser,
  } = useAppContext();

  return (
    <>
      {showWelcome && <WelcomePage isClosing={isClosingWelcome} />}

      <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<BerandaPage setPage={setPage} />} />
        <Route path="/" element={<BerandaPage setPage={setPage} />} />
        <Route
          path="/menu"
          element={<MenuPage setPage={setPage} setSelectedItem={setSelectedItem} />}
        />
        <Route
          path="/detail"
          element={
            <DetailPage
              item={selectedItem}
              setPage={setPage}
              addToCart={addToCart}
              showToast={showToast}
            />
          }
        />
        <Route
          path="/detail/:menuId"
          element={
            <DetailPage
              item={selectedItem}
              setPage={setPage}
              addToCart={addToCart}
              showToast={showToast}
            />
          }
        />
        <Route
          path="/cart"
          element={
            <CartPage
              cart={cart}
              setCart={setCart}
              setPage={setPage}
              showToast={showToast}
              updateCartItem={updateCartItemApi}
              removeCartItem={removeCartItemApi}
              clearCart={clearCartApi}
            />
          }
        />
        <Route
          path="/profile"
          element={
            <ProfilePage
              setPage={setPage}
              setIsLoggedIn={setIsLoggedIn}
              user={user}
              setUser={setUser}
            />
          }
        />
      </Route>

      <Route
        path="/admin/login"
        element={
          <AdminLoginPage
            setIsLoggedIn={setIsLoggedIn}
            setUser={setUser}
          />
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="dashboard" element={<Navigate to="/admin" replace />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="menus" element={<AdminMenusPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
      </Route>

      <Route
        path="/login"
        element={
          <LoginPage
            setIsLoggedIn={setIsLoggedIn}
            setUser={setUser}
          />
        }
      />
      <Route
        path="/register"
        element={
          <RegisterPage
            setIsLoggedIn={setIsLoggedIn}
            setUser={setUser}
          />
        }
      />
      <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
