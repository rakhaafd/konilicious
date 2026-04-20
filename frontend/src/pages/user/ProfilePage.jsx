import { useState, useEffect, useRef } from "react";
import { formatRp } from "../../utils/helpers";
import { IoPerson, IoPencil, IoArrowBackOutline, IoCamera } from "react-icons/io5";
import { useAppContext } from "../../context/AppContext";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Label from "../../components/Label";
import { showAlert } from "../../components/SweetAlert";

export default function ProfilePage({ setPage, setIsLoggedIn, user, setUser }) {
  const { setSelectedItem } = useAppContext();
  const [profile, setProfile] = useState({ _id: "", username: "", email: "", profilePicture: "" });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const fileInputRef = useRef(null);

  // States for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    password: "",
});

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const userId = user?._id || user?.id;

        // Prioritaskan endpoint profile user aktif
        if (token) {
          const meRes = await fetch("http://localhost:5000/api/v1/user/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (meRes.ok) {
            const meData = await meRes.json();
            const userData = meData.user || meData.data || meData;

            setProfile({
              _id: userData._id || userData.id,
              username: userData.username,
              email: userData.email,
              profilePicture: userData.profilePicture || "",
            });

            if (setUser) {
              setUser((prev) => ({ ...prev, ...userData }));
            }
            return;
          }
        }

        // Fallback ke endpoint by-id jika ada userId
        if (userId && token) {
          const res = await fetch(`http://localhost:5000/api/v1/user/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            const userData = data.user || data.data || data;

            setProfile({
              _id: userData._id || userData.id,
              username: userData.username,
              email: userData.email,
              profilePicture: userData.profilePicture || "",
            });

            if (setUser) {
              setUser(userData);
            }
            return; // Sukses fetch, tidak perlu jalankan fallback
          }
        }
        
        // Fallback langsung pakai state local kalau fetch gagal/tidak ada id belum
        if (user) {
          setProfile({
            _id: user._id || user.id || "",
            username: user.username || "",
            email: user.email || "",
            profilePicture: user.profilePicture || "",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        // Fallback langsung tanpa menampilkan UI error
        if (user) {
          setProfile({
            _id: user._id || user.id || "",
            username: user.username || "",
            email: user.email || "",
            profilePicture: user.profilePicture || "",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchMyOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        setLoadingOrders(true);
        const res = await fetch("http://localhost:5000/api/v1/order/my-orders", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(Array.isArray(data) ? data : data.data || []);
        }
      } catch (err) {
        console.error("Gagal memuat orders:", err);
      } finally {
        setLoadingOrders(false);
      }
    };
    
    fetchMyOrders();
  }, []);

  const handleEditClick = () => {
    setEditForm({
      username: profile.username,
      email: profile.email,
      password: "", // Keep empty, only send if changing
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!profile._id) {
      await showAlert({
        title: "Data Tidak Lengkap",
        text: "User ID tidak ditemukan.",
        icon: "error",
      });
      return;
    }

    try {
      const payload = {
        username: editForm.username,
        email: editForm.email,
      };

      // Only include password if user typed a new one
      if (editForm.password) {
        payload.password = editForm.password;
      }

      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/v1/user/${profile._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        const data = await res.json();
        const updatedUser = data.user || data.data || payload;

        // Update local state
        setProfile((prev) => ({
          ...prev,
          username: updatedUser.username || payload.username,
          email: updatedUser.email || payload.email,
        }));

        if (setUser) {
          setUser((prev) => ({
            ...prev,
            username: updatedUser.username || payload.username,
            email: updatedUser.email || payload.email,
          }));
        }

        setIsEditing(false);
        await showAlert({
          title: "Berhasil",
          text: "Profil berhasil diperbarui!",
          icon: "success",
        });
      } else {
        const errData = await res.json();
        await showAlert({
          title: "Gagal",
          text: errData.message || "Gagal memperbarui profil.",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      await showAlert({
        title: "Koneksi Gagal",
        text: "Error connecting to server.",
        icon: "error",
      });
    }
  };

  const handleProfilePictureClick = () => {
    if (uploadingPicture) return;
    fileInputRef.current?.click();
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    if (!token) {
      await showAlert({
        title: "Belum Login",
        text: "Silakan login terlebih dahulu.",
        icon: "warning",
      });
      event.target.value = "";
      return;
    }

    try {
      setUploadingPicture(true);
      const formData = new FormData();
      formData.append("profilePicture", file);

      const res = await fetch("http://localhost:5000/api/v1/user/me/profile-picture", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const rawResponse = await res.text();
      let data = {};
      try {
        data = rawResponse ? JSON.parse(rawResponse) : {};
      } catch {
        data = { message: rawResponse };
      }

      if (!res.ok) {
        await showAlert({
          title: "Gagal Upload",
          text:
            data.message ||
            `Gagal memperbarui foto profil (HTTP ${res.status}).`,
          icon: "error",
        });
        return;
      }

      const newPictureUrl = data.profilePicture || "";
      setProfile((prev) => ({ ...prev, profilePicture: newPictureUrl }));

      if (setUser) {
        setUser((prev) => ({ ...prev, profilePicture: newPictureUrl }));
      }

      await showAlert({
        title: "Berhasil",
        text: "Foto profil berhasil diperbarui.",
        icon: "success",
      });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      await showAlert({
        title: "Koneksi Gagal",
        text: "Terjadi masalah saat upload foto profil.",
        icon: "error",
      });
    } finally {
      setUploadingPicture(false);
      event.target.value = "";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.setItem("isLoggedIn", "false");
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-6 py-8 text-center text-gray-500 mt-10">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Grouping orders for structured layout
  const orderGroups = {
    WAITING: orders.filter((o) => o?.status === "WAITING"),
    PROCESSING: orders.filter((o) => o?.status === "PROCESSING"),
    COMPLETED: orders.filter((o) => o?.status === "COMPLETED"),
    CANCELLED: orders.filter((o) => (o?.status === "CANCELLED" || o?.status === "CANCELED")),
  };

  const handleBeriUlasan = (menu) => {
    setSelectedItem(menu);
    setPage("detail");
  };

  const renderOrderCard = (order, isDisabled) => (
    <Card
      key={order._id}
      className={`p-5 flex flex-col gap-3 relative transition-all ${
        isDisabled ? "bg-gray-50 border-gray-200 opacity-70 grayscale-[0.5]" : "bg-white border-gray-100 shadow-sm"
      }`}
    >
      <div className="flex justify-between items-start border-b border-gray-100 pb-3">
        <div>
          <p className={`text-xs mb-0.5 ${isDisabled ? "text-gray-400" : "text-gray-400"}`}>Order ID: {order._id}</p>
          <p className={`text-xs font-semibold ${isDisabled ? "text-gray-400" : "text-gray-500"}`}>
            {new Date(order.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              order.status === "COMPLETED"
                ? "bg-green-100 text-green-700"
                : order.status === "WAITING"
                ? "bg-orange-100 text-orange-700"
                : order.status === "CANCELLED" || order.status === "CANCELED"
                ? "bg-gray-200 text-gray-600"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {order.status}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              order.paymentStatus === "PAID"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {order.paymentStatus || "UNPAID"}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {order.items && order.items.map((item, idx) => (
          <div key={item._id || idx} className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-3">
              <img 
                src={item.menu?.image || "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80"} 
                alt={item.menu?.name} 
                className={`w-12 h-12 rounded-lg object-cover shadow-sm ${isDisabled ? "opacity-70 bg-gray-200" : "bg-gray-100"}`}
              />
              <div>
                <p className={`font-semibold ${isDisabled ? "text-gray-500" : "text-gray-800"}`}>
                  {item.menu?.name || "Item Menu"}
                </p>
                <p className="text-xs text-gray-500">
                  {item.quantity} x {formatRp(item.price || item.menu?.price || 0)}
                  {item.label && ` (${item.label})`}
                </p>
                {order.status === "COMPLETED" && item.menu && (
                  <button
                    onClick={() => handleBeriUlasan(item.menu)}
                    className="text-xs text-blue-600 font-semibold mt-1 hover:underline text-left"
                  >
                    Beri Ulasan
                  </button>
                )}
              </div>
            </div>
            <p className={`font-bold ${isDisabled ? "text-gray-500" : "text-gray-700"}`}>
              {formatRp((item.price || item.menu?.price || 0) * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-sm text-gray-500 font-medium">Total Pesanan</span>
        <span className={`font-black text-lg ${isDisabled ? "text-gray-500" : "text-red-600"}`}>
          {formatRp(order.totalPrice || 0)}
        </span>
      </div>
    </Card>
  );

  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => setPage("beranda")}
          className="flex items-center gap-1 font-semibold text-gray-700 hover:text-red-600 transition"
        >
          <IoArrowBackOutline className="text-xl" /> Back
        </button>
        <h2 className="font-bold text-xl">Profile</h2>
        <span className="w-6" />
      </div>

      {/* User Info */}
      <div className="flex gap-8 mb-10 flex-col md:flex-row">
        <div className="relative w-36 h-36 rounded-xl shrink-0 mx-auto md:mx-0 overflow-hidden bg-gray-200 flex items-center justify-center text-gray-400">
          {profile.profilePicture ? (
            <img
              src={profile.profilePicture}
              alt={profile.username || "Profile"}
              className="w-full h-full object-cover"
            />
          ) : (
            <IoPerson className="text-6xl" />
          )}

          <button
            type="button"
            onClick={handleProfilePictureClick}
            disabled={uploadingPicture}
            className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center shadow-lg disabled:opacity-60"
            title="Ganti Foto Profil"
          >
            <IoCamera className="text-lg" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfilePictureChange}
          />
        </div>

        <div className="space-y-4 flex-1">
          {!isEditing ? (
            <>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Username</p>
                <p className="font-bold text-lg flex items-center gap-2">
                  {profile.username || "Tidak ada username"}
                  <span
                    className="cursor-pointer text-gray-500 hover:text-gray-700"
                    onClick={handleEditClick}
                    title="Edit Profile"
                  >
                    <IoPencil className="text-lg" />
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Email</p>
                <p className="text-gray-500 text-[16px]">
                  {profile.email || "Tidak ada email"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Password</p>
                <p className="font-bold text-gray-500 flex items-center gap-2">
                  *****
                  <span
                    className="cursor-pointer text-gray-500 hover:text-gray-700"
                    onClick={handleEditClick}
                    title="Ubah Password"
                  >
                    <IoPencil className="text-lg" />
                  </span>
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <Label>Username</Label>
                <Input
                  type="text"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm({ ...editForm, username: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Password Baru (kosongkan jika tidak diubah)</Label>
                <Input
                  type="password"
                  placeholder="*****"
                  value={editForm.password}
                  onChange={(e) =>
                    setEditForm({ ...editForm, password: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleSave}
                >
                  Simpan
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={handleCancelEdit}
                >
                  Batal
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order History */}
      <h3 className="font-bold text-lg border-b-3 border-gray-300 pb-5 mb-8 mt-12">
        My Orders (Riwayat Pesanan)
      </h3>
      <div className="space-y-8">
        {loadingOrders ? (
          <p className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-xl">
            Memuat pesanan...
          </p>
        ) : orders && orders.length > 0 ? (
          <>
            {/* Waiting */}
            {orderGroups.WAITING.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between font-bold text-orange-600 border-b border-orange-100 pb-1">
                  <span>Menunggu (Waiting)</span>
                  <span>({orderGroups.WAITING.length})</span>
                </div>
                {orderGroups.WAITING.map((order) => renderOrderCard(order, false))}
              </div>
            )}

            {/* Processing */}
            {orderGroups.PROCESSING.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between font-bold text-blue-600 border-b border-blue-100 pb-1">
                  <span>Diproses (Processing)</span>
                  <span>({orderGroups.PROCESSING.length})</span>
                </div>
                {orderGroups.PROCESSING.map((order) => renderOrderCard(order, false))}
              </div>
            )}

            {/* Completed */}
            {orderGroups.COMPLETED.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between font-bold text-gray-500 border-b border-gray-200 pb-1">
                  <span>Selesai (Completed)</span>
                  <span>({orderGroups.COMPLETED.length})</span>
                </div>
                {orderGroups.COMPLETED.map((order) => renderOrderCard(order, true))}
              </div>
            )}

            {/* Cancelled */}
            {orderGroups.CANCELLED.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between font-bold text-gray-400 border-b border-gray-100 pb-1">
                  <span>Dibatalkan (Cancelled)</span>
                  <span>({orderGroups.CANCELLED.length})</span>
                </div>
                {orderGroups.CANCELLED.map((order) => renderOrderCard(order, true))}
              </div>
            )}
            
            {orderGroups.WAITING.length === 0 && orderGroups.PROCESSING.length === 0 && orderGroups.COMPLETED.length === 0 && orderGroups.CANCELLED.length === 0 && (
               <p className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-xl">
                 Pesanan Anda memiliki status yang lain.
               </p>
            )}
          </>
        ) : (
          <p className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-xl">
            Belum ada riwayat pesanan.
          </p>
        )}
      </div>

      <Button
        variant="secondary"
        fullWidth
        className="mt-8"
        onClick={handleLogout}
      >
        Keluar
      </Button>
    </div>
  );
}
