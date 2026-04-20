import { useEffect, useMemo, useRef, useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { showConfirm } from "../../components/SweetAlert";
import api from "../../utils/api";

const initialForm = {
  name: "",
  category: "Makanan",
  labelOptions: "",
  tag: "",
  price: "",
  description: "",
  image: null,
  imagePreview: "",
  existingImage: "",
  removeImage: false,
};

export default function AdminMenusPage() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef("");

  const cleanupObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = "";
    }
  };

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const fetchMenus = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/admin/menus", { headers: authHeaders });
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
    cleanupObjectUrl();
    setEditingMenuId(null);
    setForm(initialForm);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      image: null,
      imagePreview: menu.image || "",
      existingImage: menu.image || "",
      removeImage: false,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsFormOpen(true);
  };

  const closeForm = () => {
    cleanupObjectUrl();
    setIsFormOpen(false);
    setEditingMenuId(null);
    setForm(initialForm);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({
      ...prev,
      image: null,
      imagePreview: "",
      existingImage: "",
      removeImage: true,
    }));

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    return () => {
      cleanupObjectUrl();
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("category", form.category);
      payload.append("labelOptions", form.labelOptions);
      payload.append("tag", form.tag || "");
      payload.append("price", String(Number(form.price)));
      payload.append("description", form.description);

      if (form.image instanceof File) {
        payload.append("image", form.image);
      }

      if (editingMenuId && form.removeImage && !(form.image instanceof File)) {
        payload.append("image", "");
        payload.append("imagePublicId", "");
      }

      const endpoint = editingMenuId
        ? `/admin/menus/${editingMenuId}`
        : "/admin/menus";

      const method = editingMenuId ? "PUT" : "POST";

      await api({
        url: endpoint,
        method,
        headers: authHeaders,
        data: payload,
      });

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
      await api.delete(`/admin/menus/${id}`, {
        headers: authHeaders,
      });

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

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Upload Gambar Menu
                </label>

                <div className="flex items-center gap-3">
                  <input
                    id="file-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    required={!editingMenuId && !form.image && !form.existingImage}
                    className="hidden"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0] || null;
                      cleanupObjectUrl();

                      const previewUrl = selectedFile ? URL.createObjectURL(selectedFile) : "";
                      if (previewUrl) {
                        objectUrlRef.current = previewUrl;
                      }

                      setForm((prev) => ({
                        ...prev,
                        image: selectedFile,
                        imagePreview: previewUrl || prev.existingImage || "",
                        removeImage: false,
                      }));
                    }}
                  />

                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                  >
                    Choose File
                  </label>

                  <span className="text-sm text-gray-600 truncate max-w-65">
                    {form.image
                      ? form.image.name
                      : form.existingImage
                        ? "Gambar tersimpan"
                        : "No file chosen"}
                  </span>
                </div>

                {form.imagePreview && (
                  <div className="relative mt-3 w-40 h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                      src={form.imagePreview}
                      alt="Preview menu"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white text-xs font-bold hover:bg-black transition"
                      title="Hapus gambar"
                    >
                      X
                    </button>
                  </div>
                )}

                {editingMenuId && form.existingImage && !form.image && (
                  <p className="text-xs text-gray-500 mt-2">
                    Gambar lama sudah dipilih. Upload file baru jika ingin mengganti.
                  </p>
                )}
              </div>

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
