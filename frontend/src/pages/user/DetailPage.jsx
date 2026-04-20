import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { formatRp } from "../../utils/helpers";
import { IoArrowBackOutline, IoCartOutline, IoBagCheckOutline } from "react-icons/io5";
import MenuReviews from "../../components/MenuReviews";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Label from "../../components/Label";
import { showConfirm } from "../../components/SweetAlert";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80";

export default function DetailPage({ item, setPage, addToCart, showToast }) {
  const { menuId } = useParams();
  const [menuDetail, setMenuDetail] = useState(item || null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [qty, setQty] = useState(1);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!menuId) {
      setMenuDetail(item || null);
      return;
    }

    const currentId = String(item?._id || item?.id || "");
    if (item && currentId === String(menuId)) {
      setMenuDetail(item);
      return;
    }

    const fetchMenuById = async () => {
      setLoadingDetail(true);
      try {
        const res = await fetch(`http://localhost:5000/api/v1/menu/${menuId}`);
        if (!res.ok) throw new Error("Menu tidak ditemukan");
        const data = await res.json();

        setMenuDetail({
          id: data._id,
          _id: data._id,
          name: data.name,
          price: data.price,
          img: data.image || FALLBACK_IMAGE,
          description: data.description || "",
          category: (data.category || "").toLowerCase(),
          tag: (data.tag || "").toLowerCase(),
          labelOptions: data.labelOptions || [],
        });
      } catch {
        showToast("Menu tidak ditemukan atau gagal dimuat");
        setMenuDetail(null);
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchMenuById();
  }, [item, menuId, showToast]);

  const currentItem = menuDetail;
  const category = currentItem?.category || (currentItem?.id >= 10 ? "Minuman" : "Makanan");

  useEffect(() => {
    if (currentItem?.labelOptions?.length > 0) {
      setSelectedLabel(currentItem.labelOptions[0]);
    } else {
      setSelectedLabel("");
    }
  }, [currentItem]);

  if (loadingDetail) {
    return <div className="max-w-5xl mx-auto px-6 py-10 min-h-screen text-center text-gray-500">Memuat detail menu...</div>;
  }

  if (!currentItem) {
    return <div className="max-w-5xl mx-auto px-6 py-10 min-h-screen text-center text-gray-500">Menu tidak ditemukan.</div>;
  }

  const labelOptions = currentItem.labelOptions || [];

  const processPayment = async () => {
    const confirmed = await showConfirm({
      title: "Lanjut Checkout?",
      text: "Pesanan akan diproses ke halaman pembayaran.",
      confirmButtonText: "Ya, lanjut",
      cancelButtonText: "Batal",
    });
    if (!confirmed) return;

    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Silakan login terlebih dahulu untuk membeli!");
      setPage("login");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch("http://localhost:5000/api/v1/payment/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          menuId: currentItem.id || currentItem._id,
          quantity: qty,
          paymentMethod: "Online",
          label: selectedLabel,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const invoiceUrl = data.invoiceUrl || data.payment?.invoiceUrl || data.data?.invoiceUrl;

        if (invoiceUrl) {
          if (data?.payment?._id) {
            localStorage.setItem("pendingPaymentId", data.payment._id);
          }
          showToast("Mengarahkan ke halaman pembayaran...");
          window.location.href = invoiceUrl;
        } else {
          showToast("Pembayaran berhasil! Pesanan sedang diproses.");
          setPage("beranda");
        }
      } else {
        showToast(data.message || "Gagal memproses pembayaran");
      }
    } catch (err) {
      console.error("Failed to process transaction", err);
      showToast("Terjadi kesalahan jaringan");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 min-h-screen bg-gray-50/30">
      <Button
        variant="ghost"
        size="sm"
        icon={IoArrowBackOutline}
        onClick={() => setPage("menu")}
        className="mb-8"
      >
        Kembali ke Menu
      </Button>

      <Card className="p-6 md:p-10 flex flex-col md:flex-row gap-10 md:gap-14">
        <div className="w-full md:w-1/2 flex flex-col">
          <h1 className="font-extrabold text-3xl md:text-4xl text-gray-900 mb-6 leading-tight">
            {currentItem.name}
          </h1>
          <div className="relative rounded-3xl overflow-hidden shadow-sm aspect-square md:aspect-auto md:h-80 w-full mb-6 group">
            <img
              src={currentItem.img || FALLBACK_IMAGE}
              alt={currentItem.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100/50">
            <h3 className="font-extrabold text-lg text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-red-500 rounded-full inline-block"></span>
              Deskripsi Menu
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm md:text-[15px]">
              {currentItem.description ||
                "Menu andalan Konicipi yang dibuat dengan bumbu khas. Disajikan segar dengan cita rasa yang autentik dan menggugah selera."}
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Label className="px-2 py-1 bg-red-50 text-red-700 border border-red-100 rounded-md text-xs font-bold uppercase tracking-wider mb-0!">
              {category}
            </Label>
            {labelOptions.length > 0 && (
              <Label className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-bold uppercase tracking-wider mb-0!">
                {labelOptions.length} Opsi Variant
              </Label>
            )}
          </div>

          <div className="mb-8">
            <p className="font-black text-4xl text-red-600 tracking-tight">{formatRp(currentItem.price)}</p>
            <p className="text-gray-400 text-sm mt-1 font-medium">per porsi</p>
          </div>

          <div className="mb-6">
            <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">Jumlah</h4>
            <div className="inline-flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white font-bold text-xl text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors shadow-sm"
              >
                −
              </button>
              <span className="font-bold text-lg w-12 text-center text-gray-800">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white font-bold text-xl text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors shadow-sm"
              >
                +
              </button>
            </div>
          </div>

          {labelOptions.length > 0 && (
            <div className="mb-8">
              <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">Opsi / Varian</h4>
              <div className="flex flex-wrap gap-3">
                {labelOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedLabel(opt)}
                    className={`flex-auto py-3 px-4 min-w-30 overflow-hidden relative rounded-xl font-bold transition-all duration-300 capitalize ${
                      selectedLabel === opt
                        ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-red-600 hover:text-red-600"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mt-auto pt-6 border-t border-gray-100">
            <Button
              variant="primary"
              disabled={isProcessing}
              fullWidth
              size="lg"
              className="flex items-center justify-center gap-2"
              onClick={processPayment}
            >
              <IoBagCheckOutline className="text-xl" />
              {isProcessing ? "Memproses..." : "Beli Sekarang"}
            </Button>
            <Button
              variant="outline"
              fullWidth
              size="lg"
              className="flex items-center justify-center gap-2"
              onClick={() => {
                addToCart({ ...currentItem, label: selectedLabel }, qty);
                showToast(`${currentItem.name} (${selectedLabel}) ditambahkan ke keranjang!`);
              }}
            >
              <IoCartOutline className="text-xl" />
              Keranjang
            </Button>
          </div>
        </div>
      </Card>

      <MenuReviews menuId={currentItem._id || currentItem.id || menuId} />
    </div>
  );
}