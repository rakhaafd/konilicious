import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { Stars } from "../utils/helpers";
import { FaTrash, FaPen } from "react-icons/fa";
import Button from "./Button";
import { showConfirm } from "./SweetAlert";
import api from "../utils/api";

export default function MenuReviews({ menuId }) {
  const { user, showToast } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  
  // form state
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const fetchReviews = async () => {
    try {
      const { data } = await api.get(`/rating/menu/${menuId}`);
      const rList = data.ratings || [];
      setReviews(rList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

      if (user) {
        const myReview = rList.find(r => r.user._id === user._id);
        setUserReview(myReview || null);
        if (myReview && !isEditing) {
          setRating(myReview.rating);
          setComment(myReview.comment);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkPurchase = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const { data } = await api.get("/order/my-orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const orders = Array.isArray(data) ? data : data.data || [];
      const bought = orders.some(o => 
        ["WAITING", "PROCESSING", "COMPLETED"].includes(o.status) &&
        o.paymentStatus === "PAID" &&
        o.items.some(i => String(i.menu?._id || i.menu) === String(menuId))
      );
      setHasPurchased(bought);
    } catch (err) {
      console.error("Gagal cek transaksi:", err);
    }
  };

  useEffect(() => {
    if (menuId) {
      fetchReviews();
      if (user) checkPurchase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return showToast("Silakan login untuk memberi ulasan");

    const mtd = userReview ? "PUT" : "POST";
    const ratingId = userReview?._id || userReview?.ratingId;
    const endpoint = userReview 
      ? `/rating/${ratingId}` 
      : `/rating/menu/${menuId}`;

    try {
      await api({
        url: endpoint,
        method: mtd,
        headers: {
          Authorization: `Bearer ${token}`
        },
        data: { rating, comment }
      });
      showToast(userReview ? "Ulasan diperbarui" : "Ulasan berhasil ditambahkan");
      setIsEditing(false);
      fetchReviews();
    } catch {
      showToast("Kesalahan jaringan");
    }
  };

  const handleDelete = async () => {
    const confirmed = await showConfirm({
      title: "Hapus Ulasan",
      text: "Yakin ingin menghapus ulasan ini?",
    });
    if (!confirmed) return;
    
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!userReview) return;
    const ratingId = userReview._id || userReview.ratingId;

    try {
      await api.delete(`/rating/${ratingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("Ulasan dihapus");
      setUserReview(null);
      setRating(5);
      setComment("");
      fetchReviews();
    } catch {
      showToast("Kesalahan jaringan");
    }
  };

  if (loading) return <div className="py-4 text-center text-gray-500">Memuat ulasan...</div>;

  return (
    <div className="mt-12 bg-white rounded-3xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100">
      <h3 className="font-extrabold text-2xl mb-6 text-gray-800">Ulasan & Rating</h3>

      {/* Form Ulasan (jika user login & sudah beli & belum review ATAU sedang isEditing) */}
      {user ? (
        (!userReview || isEditing) ? (
          hasPurchased ? (
            <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Rating Anda</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setRating(num)}
                      className={`text-2xl transition ${rating >= num ? "text-yellow-400" : "text-gray-300"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Komentar</label>
                <textarea
                  className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-red-400 transition"
                  rows="3"
                  placeholder="Bagaimana rasa hidangan ini?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  type="submit"
                >
                  {userReview ? "Perbarui Ulasan" : "Kirim Ulasan"}
                </Button>
                {isEditing && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setRating(userReview.rating);
                      setComment(userReview.comment);
                    }}
                  >
                    Batal
                  </Button>
                )}
              </div>
            </form>
          ) : (
            <div className="mb-8 bg-orange-50 p-4 rounded-2xl border border-orange-100 text-center">
              <p className="text-orange-700 font-semibold">Anda harus bertransaksi dulu sebelum memberi rating.</p>
            </div>
          )
        ) : null
      ) : (
        <div className="mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-200 text-center">
          <p className="text-gray-600 font-semibold">Silakan login untuk memberi ulasan.</p>
        </div>
      )}

      {/* Daftar Ulasan */}
      <div className="space-y-4 max-h-100 overflow-y-auto pr-2">
        {reviews.length === 0 ? (
          <p className="text-gray-400 text-center py-6">Belum ada ulasan untuk hidangan ini.</p>
        ) : (
          reviews.map(r => (
            <div key={r._id} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-50 flex flex-col sm:flex-row gap-4 justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-800">{r.user?.username || "Anonim"}</span>
                  <span className="text-gray-400 text-xs">• {new Date(r.createdAt).toLocaleDateString("id-ID")}</span>
                </div>
                <div className="mb-2">
                  <Stars rating={r.rating} count={5} />
                </div>
                <p className="text-gray-600 text-sm">{r.comment}</p>
              </div>

              {/* Tombol Edit/Delete (jika ini ulasan user) */}
              {user && r.user?._id === user._id && !isEditing && (
                <div className="flex items-start justify-end gap-2 shrink-0">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                    title="Edit"
                  >
                    <FaPen />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Hapus"
                  >
                    <FaTrash />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}