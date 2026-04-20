import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { showAlert } from "../components/SweetAlert";
import api from "../utils/api";

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [cart, setCart] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("isLoggedIn") === "true"
  );
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const navigate = useNavigate();
  const location = useLocation();

  const showToast = (msg) =>
    showAlert({
      title: "Notifikasi",
      text: msg,
      icon: "info",
    });

  const fetchCart = async () => {
    if (!isLoggedIn) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const { data } = await api.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const items = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : data.items || [];
      const formattedCart = items.map((c) => ({
        cartId: c._id,
        id: c.menu?._id || c.menuId || "unknown",
        name: c.menu?.name || c.name || "Menu",
        price: c.menu?.price || c.price || 0,
        img: c.menu?.image || c.image || "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80",
        qty: c.quantity || c.qty || 1,
        label: c.label || c.menu?.label || null,
      }));
      setCart(formattedCart);
    } catch (err) {
      console.error("Gagal load keranjang:", err);
    }
  };

  const syncPendingPayment = async () => {
    const token = localStorage.getItem("token");
    const pendingPaymentId = localStorage.getItem("pendingPaymentId");

    if (!token || !pendingPaymentId) return;

    try {
      const { data } = await api.get(`/payment/check/${pendingPaymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const status = data?.status || data?.payment?.status;
      const normalizedStatus = String(status || "").toUpperCase();

      if (normalizedStatus === "PAID" || normalizedStatus === "SETTLED") {
        localStorage.removeItem("pendingPaymentId");
        showToast("Pembayaran berhasil, pesanan masuk ke riwayat order.");
        fetchCart();
      }
    } catch (err) {
      console.error("Gagal sinkronisasi status payment:", err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchCart();
    } else {
      setCart([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      syncPendingPayment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, location.pathname]);

  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const setPage = (pageName) => {
    if (pageName === "landing" || pageName === "beranda") {
      navigate("/");
    } else {
      navigate(`/${pageName}`);
    }
  };

  const addToCart = async (item, qty = 1) => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Tolong login dulu sebelum membeli.");
      setPage("login");
      return;
    }

    try {
      await api.post("/cart", {
        menuId: item.id || item._id,
        quantity: qty,
        label: item.label,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      showToast(`${item.name} berhasil ditambahkan ke keranjang!`);
      fetchCart();
    } catch (err) {
      console.error(err);
      showToast(err?.response?.data?.message || "Terjadi kesalahan jaringan");
    }
  };

  const updateCartItemApi = async (cartId, newQty) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setCart((prev) =>
      prev.map((i) => (i.cartId === cartId ? { ...i, qty: newQty } : i))
    );

    try {
      await api.put(`/cart/${cartId}`, { quantity: newQty }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error("Gagal update keranjang", err);
      fetchCart();
    }
  };

  const removeCartItemApi = async (cartId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setCart((prev) => prev.filter((i) => i.cartId !== cartId));

    try {
      await api.delete(`/cart/${cartId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Gagal hapus item dari keranjang", err);
      fetchCart();
    }
  };

  const clearCartApi = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setCart([]);
    try {
      await api.delete("/cart/clear", {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Gagal bersihkan keranjang", err);
      fetchCart();
    }
  };

  const cartCount = cart.reduce((s, i) => s + (i.qty || 1), 0);
  const showNav = location.pathname !== "/landing";

  const value = {
    selectedItem, setSelectedItem,
    cart, setCart,
    isLoggedIn, setIsLoggedIn,
    user, setUser,
    showToast,
    setPage,
    addToCart,
    updateCartItemApi,
    removeCartItemApi,
    clearCartApi,
    cartCount,
    showNav,
    location
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
