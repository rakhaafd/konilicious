import { useState } from "react";
import { formatRp } from "../../utils/helpers";
import { IoCartOutline, IoArrowBackOutline } from "react-icons/io5";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { showConfirm } from "../../components/SweetAlert";
import api from "../../utils/api";

export default function CartPage({ cart, setCart, setPage, showToast, updateCartItem, removeCartItem, clearCart }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const updateQty = (id, delta) => {
    const item = cart.find(i => (i.cartId === id || i.id === id));
    if (!item) return;

    const newQty = Math.max(1, item.qty + delta);
    
    // Call props function if available
    if (updateCartItem) {
      updateCartItem(item.cartId, newQty);
    } else {
      // Local fallback
      setCart((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, qty: newQty } : i
        )
      );
    }
  };

  const removeItem = (id) => {
    const item = cart.find(i => (i.cartId === id || i.id === id));
    if (!item) return;

    if (removeCartItem) {
      removeCartItem(item.cartId);
    } else {
      // Local fallback
      setCart((prev) => prev.filter((i) => i.id !== item.id));
    }
  };

  const processCheckout = async () => {
    const confirmed = await showConfirm({
      title: "Lanjut Checkout?",
      text: "Pesanan akan diproses ke halaman pembayaran.",
      confirmButtonText: "Ya, lanjut",
      cancelButtonText: "Batal",
    });
    if (!confirmed) return;

    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Silakan login terlebih dahulu!");
      setPage("login");
      return;
    }

    setIsProcessing(true);
    try {
      const { data } = await api.post("/payment", {
        paymentMethod: "Online"
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Cek URL invoice dari res body Xendit!
      const invoiceUrl = data.invoiceUrl || data.payment?.invoiceUrl || data.data?.invoiceUrl;

      if (invoiceUrl) {
        if (data?.payment?._id) {
          localStorage.setItem("pendingPaymentId", data.payment._id);
        }
        showToast("Mengarahkan ke halaman pembayaran...");
        window.location.href = invoiceUrl;
      } else {
        showToast("Pesanan berhasil! Terima kasih");
        setPage("beranda");
      }
    } catch (err) {
      console.error("Failed to process transaction", err);
      showToast(err?.response?.data?.message || "Terjadi kesalahan jaringan");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <Button
        variant="ghost"
        icon={IoArrowBackOutline}
        onClick={() => setPage("menu")}
        className="mb-6 -ml-2"
      >
        Back
      </Button>

      <h2 className="text-2xl font-bold mb-6 text-accent">Keranjang Belanja</h2>

      {cart.length === 0 ? (
        <Card className="text-center py-20 flex flex-col items-center">
          <IoCartOutline className="text-5xl text-gray-300 mb-4" />
          <p className="mb-6 text-lg text-gray-500 font-medium">Keranjang kosong</p>
          <Button
            variant="primary"
            onClick={() => setPage("menu")}
            className="px-8"
          >
            Lihat Menu
          </Button>
        </Card>
      ) : (
        <>
          {/* Items */}
          <Card className="divide-y divide-gray-100 px-6">
            {cart.map((item, index) => (
              <div key={item.cartId || item.id || index} className="flex items-center gap-4 py-4">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover bg-yellow-300"
                />
                <div className="flex-1">
                  <p className="font-bold text-sm">{item.name}</p>
                  <p className="text-red-600 font-bold text-sm mt-0.5">
                    {formatRp(item.price)}
                  </p>
                  {item.label && (
                    <p className="text-gray-500 text-xs capitalize mt-0.5">
                      {item.label}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(item.cartId || item.id, -1)}
                    className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-50 font-bold hover:bg-primary hover:text-primary-text transition"
                  >
                    −
                  </button>
                  <span className="font-bold w-5 text-center">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.cartId || item.id, 1)}
                    className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-50 font-bold hover:bg-primary hover:text-primary-text transition"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item.cartId || item.id)}
                    className="ml-1 text-secondary hover:text-secondary-hover font-bold text-lg transition"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </Card>

          {/* Summary */}
          <Card className="mt-8 p-6 bg-white">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold text-accent">{formatRp(total)}</span>
            </div>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-gray-600">Fee</span>
              <span className="text-green-600 font-semibold">Gratis</span>
            </div>
            <hr className="border-gray-200 mb-3" />
            <div className="flex justify-between font-bold text-lg mb-6">
              <span className="text-accent">Total</span>
              <span className="text-secondary">{formatRp(total)}</span>
            </div>

            <Button
              variant="secondary"
              fullWidth
              size="lg"
              disabled={isProcessing}
              onClick={processCheckout}
            >
              {isProcessing ? "Memproses Checkout..." : "Checkout Sekarang"}
            </Button>
          </Card>
        </>
      )}
    </div>
  );
}