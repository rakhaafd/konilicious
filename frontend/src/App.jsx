import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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
      </Routes>
    </>
  );
}
