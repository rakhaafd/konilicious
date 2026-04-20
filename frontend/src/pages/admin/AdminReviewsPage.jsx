import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { showConfirm } from "../../components/SweetAlert";
import api from "../../utils/api";

const initialForm = {
  rating: 5,
  comment: "",
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/admin/ratings", { headers: authHeaders });
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat mengambil data review.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEditForm = (review) => {
    setEditingReviewId(review._id);
    setForm({
      rating: Number(review.rating) || 5,
      comment: review.comment || "",
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingReviewId(null);
    setForm(initialForm);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingReviewId) return;

    setSaving(true);
    setError("");

    try {
      const payload = {
        rating: Number(form.rating),
        comment: form.comment,
      };

      await api.put(`/admin/ratings/${editingReviewId}`, payload, {
        headers: authHeaders,
      });

      await fetchReviews();
      closeForm();
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat menyimpan review.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm({
      title: "Hapus Review",
      text: "Yakin ingin menghapus review ini?",
    });
    if (!confirmed) return;

    setError("");
    try {
      await api.delete(`/admin/ratings/${id}`, {
        headers: authHeaders,
      });

      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat menghapus review.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen bg-gray-50/30">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900">Kelola Review</h1>
          <p className="text-gray-600 mt-1">Pantau, edit, dan hapus ulasan pelanggan dari panel admin.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <Card className="p-0 rounded-2xl border border-gray-200 shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white">
              <tr>
                <th className="text-left px-5 py-3 font-bold text-gray-600 border-b border-gray-200">User</th>
                <th className="text-left px-5 py-3 font-bold text-gray-600 border-b border-gray-200">Menu</th>
                <th className="text-left px-5 py-3 font-bold text-gray-600 border-b border-gray-200">Order</th>
                <th className="text-left px-5 py-3 font-bold text-gray-600 border-b border-gray-200">Rating</th>
                <th className="text-left px-5 py-3 font-bold text-gray-600 border-b border-gray-200">Komentar</th>
                <th className="text-left px-5 py-3 font-bold text-gray-600 border-b border-gray-200">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-gray-500">Memuat data review...</td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-gray-500">Belum ada review.</td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review._id} className="border-b border-gray-100 last:border-b-0 align-top">
                    <td className="px-5 py-3 text-gray-800 font-semibold">{review.user?.username || "-"}</td>
                    <td className="px-5 py-3 text-gray-700">{review.menu?.name || "-"}</td>
                    <td className="px-5 py-3 text-gray-700">{review.order?._id?.slice(-8)?.toUpperCase() || "-"}</td>
                    <td className="px-5 py-3 text-gray-700">
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                        {review.rating || 0} / 5
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-700 max-w-[320px]">{review.comment || "-"}</td>
                    <td className="px-5 py-3 text-gray-700">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditForm(review)}>Edit</Button>
                        <Button size="sm" variant="dangerOutline" onClick={() => handleDelete(review._id)}>Hapus</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4 py-6 overflow-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 p-6 my-auto">
            <h2 className="text-2xl font-black text-gray-900 mb-1">Edit Review</h2>
            <p className="text-sm text-gray-500 mb-6">Perbarui rating dan komentar pelanggan.</p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                <select
                  className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={form.rating}
                  onChange={(e) => setForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                  required
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </div>

              <Input
                label="Komentar"
                value={form.comment}
                onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
                required
              />

              <div className="pt-2 flex gap-3">
                <Button type="button" variant="outline" fullWidth onClick={closeForm}>Batal</Button>
                <Button type="submit" variant="secondary" fullWidth disabled={saving}>
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
