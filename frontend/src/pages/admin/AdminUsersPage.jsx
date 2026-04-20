import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { showConfirm } from "../../components/SweetAlert";

const ADMIN_API_BASE = "http://localhost:5000/api/v1/admin";

const initialForm = {
  username: "",
  email: "",
  password: "",
  role: "user",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${ADMIN_API_BASE}/users`, {
        headers: authHeaders,
      });

      if (!res.ok) {
        throw new Error(`Gagal mengambil user (${res.status})`);
      }

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat mengambil data user.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateForm = () => {
    setEditingUserId(null);
    setForm(initialForm);
    setIsFormOpen(true);
  };

  const openEditForm = (user) => {
    setEditingUserId(user._id);
    setForm({
      username: user.username || "",
      email: user.email || "",
      password: "",
      role: user.role || "user",
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingUserId(null);
    setForm(initialForm);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        username: form.username,
        email: form.email,
        role: form.role,
      };

      if (!editingUserId || form.password.trim()) {
        payload.password = form.password;
      }

      const endpoint = editingUserId
        ? `${ADMIN_API_BASE}/users/${editingUserId}`
        : `${ADMIN_API_BASE}/users`;

      const method = editingUserId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal menyimpan user.");
      }

      await fetchUsers();
      closeForm();
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat menyimpan user.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm({
      title: "Hapus User",
      text: "Yakin ingin menghapus user ini?",
    });
    if (!confirmed) return;

    setError("");
    try {
      const res = await fetch(`${ADMIN_API_BASE}/users/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal menghapus user.");
      }

      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat menghapus user.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen bg-gray-50/30">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900">Kelola User</h1>
          <p className="text-gray-600 mt-1">Create, read, update, delete user dari panel admin.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={openCreateForm}>Tambah User</Button>
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
                <th className="text-left px-5 py-3 font-bold text-gray-600 border-b border-gray-200">Username</th>
                <th className="text-left px-5 py-3 font-bold text-gray-600 border-b border-gray-200">Email</th>
                <th className="text-left px-5 py-3 font-bold text-gray-600 border-b border-gray-200">Role</th>
                <th className="text-left px-5 py-3 font-bold text-gray-600 border-b border-gray-200">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-gray-500">Memuat data user...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-gray-500">Belum ada user.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-100 last:border-b-0">
                    <td className="px-5 py-3 text-gray-800 font-semibold">{user.username}</td>
                    <td className="px-5 py-3 text-gray-700">{user.email}</td>
                    <td className="px-5 py-3 text-gray-700">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === "admin" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditForm(user)}>Edit</Button>
                        <Button size="sm" variant="dangerOutline" onClick={() => handleDelete(user._id)}>Hapus</Button>
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
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h2 className="text-2xl font-black text-gray-900 mb-1">
              {editingUserId ? "Edit User" : "Tambah User"}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {editingUserId ? "Perbarui informasi user." : "Buat akun user baru dari panel admin."}
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Username"
                value={form.username}
                onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                required
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Role</label>
                <select
                  className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={form.role}
                  onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                  required
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <Input
                label={editingUserId ? "Password Baru (opsional)" : "Password"}
                type="password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                required={!editingUserId}
              />

              <div className="pt-2 flex gap-3">
                <Button type="button" variant="outline" fullWidth onClick={closeForm}>Batal</Button>
                <Button type="submit" variant="secondary" fullWidth disabled={saving}>
                  {saving ? "Menyimpan..." : editingUserId ? "Simpan Perubahan" : "Buat User"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
