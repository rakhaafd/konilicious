import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { showConfirm } from "../../components/SweetAlert";

const ADMIN_API_BASE = "http://localhost:5000/api/v1/admin";

const initialForm = {
  name: "",
  category: "Makanan",
  labelOptions: "",
  tag: "",
  price: "",
  description: "",
  image: "",
  imagePublicId: "",
};

export default function AdminMenusPage() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const fetchMenus = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${ADMIN_API_BASE}/menus`, { headers: authHeaders });
      if (!res.ok) throw new Error(`Gagal mengambil menu (${res.status})`);

      const data = await res.json();
      setMenus(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat mengambil data menu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateForm = () => {
    setEditingMenuId(null);
    setForm(initialForm);
    setIsFormOpen(true);
  };

  const openEditForm = (menu) => {
    setEditingMenuId(menu._id);
    setForm({
      name: menu.name || "",
      category: menu.category || "Makanan",
      labelOptions: Array.isArray(menu.labelOptions) ? menu.labelOptions.join(", ") : "",
      tag: menu.tag || "",
      price: menu.price ?? "",
      description: menu.description || "",
      image: menu.image || "",
      imagePublicId: menu.imagePublicId || "",
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingMenuId(null);
    setForm(initialForm);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        name: form.name,
        category: form.category,
        labelOptions: form.labelOptions,
        tag: form.tag || null,
        price: Number(form.price),
        description: form.description,
        image: form.image || null,
        imagePublicId: form.imagePublicId || null,
      };

      const endpoint = editingMenuId
        ? `${ADMIN_API_BASE}/menus/${editingMenuId}`
        : `${ADMIN_API_BASE}/menus`;

      const method = editingMenuId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan menu.");

      await fetchMenus();
      closeForm();
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat menyimpan menu.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm({
      title: "Hapus Menu",
      text: "Yakin ingin menghapus menu ini?",
    });
    if (!confirmed) return;

    setError("");
    try {
      const res = await fetch(`${ADMIN_API_BASE}/menus/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menghapus menu.");

      setMenus((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat menghapus menu.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen bg-gray-50/30">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900">Kelola Menu</h1>
          <p className="text-gray-600 mt-1">Create, read, update, delete data menu dari panel admin.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={openCreateForm}>Tambah Menu</Button>
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
                <th className="text-left px-5 py-3 font-bold text-gray-600 border-b border-gray-200">Nama</th>
                <th className="text-left px-5 py-3 font-bold text-gray-600 border-b border-gray-200">Kategori</th>
                <th className="text-left px-5 py-3 font-bold text-gray-600 border-b border-gray-200">Tag</th>
                <th className="text-left px-5 py-3 font-bold text-gray-600 border-b border-gray-200">Harga</th>
                <th className="text-left px-5 py-3 font-bold text-gray-600 border-b border-gray-200">Label</th>
                <th className="text-left px-5 py-3 font-bold text-gray-600 border-b border-gray-200">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-gray-500">Memuat data menu...</td>
                </tr>
              ) : menus.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-gray-500">Belum ada menu.</td>
                </tr>
              ) : (
                menus.map((menu) => (
                  <tr key={menu._id} className="border-b border-gray-100 last:border-b-0">
                    <td className="px-5 py-3 text-gray-800 font-semibold">{menu.name}</td>
                    <td className="px-5 py-3 text-gray-700">{menu.category}</td>
                    <td className="px-5 py-3 text-gray-700">{menu.tag || "-"}</td>
                    <td className="px-5 py-3 text-gray-700">Rp {Number(menu.price || 0).toLocaleString("id-ID")}</td>
                    <td className="px-5 py-3 text-gray-700">{Array.isArray(menu.labelOptions) ? menu.labelOptions.join(", ") || "-" : "-"}</td>
                    <td className="px-5 py-3 text-gray-700">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditForm(menu)}>Edit</Button>
                        <Button size="sm" variant="dangerOutline" onClick={() => handleDelete(menu._id)}>Hapus</Button>
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
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 p-6 my-auto">
            <h2 className="text-2xl font-black text-gray-900 mb-1">
              {editingMenuId ? "Edit Menu" : "Tambah Menu"}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {editingMenuId ? "Perbarui informasi menu." : "Tambahkan item menu baru dari panel admin."}
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nama Menu"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Kategori</label>
                  <select
                    className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={form.category}
                    onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                    required
                  >
                    <option value="Makanan">Makanan</option>
                    <option value="Minuman">Minuman</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Tag"
                  placeholder="misal: favorit"
                  value={form.tag}
                  onChange={(e) => setForm((prev) => ({ ...prev, tag: e.target.value }))}
                />
                <Input
                  label="Harga"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                  required
                />
              </div>

              <Input
                label="Label Options (pisahkan dengan koma)"
                placeholder="misal: pedas, tidak pedas"
                value={form.labelOptions}
                onChange={(e) => setForm((prev) => ({ ...prev, labelOptions: e.target.value }))}
              />

              <Input
                label="Image URL"
                value={form.image}
                onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
              />

              <Input
                label="Image Public ID"
                value={form.imagePublicId}
                onChange={(e) => setForm((prev) => ({ ...prev, imagePublicId: e.target.value }))}
              />

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button type="button" variant="outline" fullWidth onClick={closeForm}>Batal</Button>
                <Button type="submit" variant="secondary" fullWidth disabled={saving}>
                  {saving ? "Menyimpan..." : editingMenuId ? "Simpan Perubahan" : "Buat Menu"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
