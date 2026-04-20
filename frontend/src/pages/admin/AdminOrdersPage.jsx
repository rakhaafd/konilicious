import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import api from "../../utils/api";

const ORDER_API_BASE = "/order";
const ORDER_STATUSES = ["WAITING", "PROCESSING", "COMPLETED", "CANCELLED"];

const isFailedToFetchError = (err) =>
  err instanceof TypeError && /failed to fetch|networkerror/i.test(String(err.message || ""));

const updateOrderStatusRequest = async (orderId, nextStatus, headers) => {
  const endpoint = `${ORDER_API_BASE}/${orderId}/status`;
  const methods = ["PATCH", "PUT"];
  let lastError = null;

  for (const method of methods) {
    try {
      const res = await api({
        url: endpoint,
        method: method.toLowerCase(),
        headers,
        data: { status: nextStatus },
      });

      return res.data;
    } catch (err) {
      lastError = err;
      if (!isFailedToFetchError(err) || method === methods[methods.length - 1]) {
        throw err;
      }
    }
  }

  throw lastError || new Error("Gagal mengupdate status order.");
};

const STATUS_BADGE_CLASS = {
  WAITING: "bg-amber-100 text-amber-700",
  PROCESSING: "bg-sky-100 text-sky-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-rose-100 text-rose-700",
};

const formatCurrency = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

const formatDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString("id-ID");
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [statusDrafts, setStatusDrafts] = useState({});

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const fetchOrders = async (status = activeStatus) => {
    setLoading(true);
    setError("");

    try {
      const endpoint =
        status === "ALL"
          ? `${ORDER_API_BASE}`
          : `${ORDER_API_BASE}/status/${status}`;

      const res = await api.get(endpoint, { headers: authHeaders });
      const data = res.data;
      const rawOrders = Array.isArray(data) ? data : [];
      const nextOrders =
        status === "ALL"
          ? rawOrders.filter((order) => order?.status !== "COMPLETED")
          : rawOrders;
      setOrders(nextOrders);

      const draftMap = {};
      nextOrders.forEach((order) => {
        draftMap[order._id] = order.status || "WAITING";
      });
      setStatusDrafts(draftMap);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat mengambil data order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders("ALL");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterStatus = async (status) => {
    setActiveStatus(status);
    await fetchOrders(status);
  };

  const handleUpdateStatus = async (orderId) => {
    const nextStatus = statusDrafts[orderId];
    if (!nextStatus || !ORDER_STATUSES.includes(nextStatus)) return;

    setUpdatingOrderId(orderId);
    setError("");

    try {
      const data = await updateOrderStatusRequest(orderId, nextStatus, authHeaders);

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, ...(data.order || {}), status: nextStatus } : order
        )
      );
    } catch (err) {
      if (isFailedToFetchError(err)) {
        setError("Tidak bisa terhubung ke server saat update status. Cek CORS backend untuk method PATCH/PUT dan pastikan API bisa diakses dari browser.");
      } else {
        setError(err.message || "Terjadi kesalahan saat mengupdate status order.");
      }
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen bg-gray-50/30">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900">Kelola Order</h1>
          <p className="text-gray-600 mt-1">Pantau order masuk dan update status pesanan dari panel admin.</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {["ALL", ...ORDER_STATUSES].map((status) => (
          <Button
            key={status}
            size="sm"
            variant={activeStatus === status ? "secondary" : "outline"}
            onClick={() => handleFilterStatus(status)}
          >
            {status}
          </Button>
        ))}
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
                <th className="text-left px-5 py-3 font-bold text-gray-600 border-b border-gray-200">Order ID</th>
                <th className="text-left px-5 py-3 font-bold text-gray-600 border-b border-gray-200">User</th>
                <th className="text-left px-5 py-3 font-bold text-gray-600 border-b border-gray-200">Total</th>
                <th className="text-left px-5 py-3 font-bold text-gray-600 border-b border-gray-200">Payment</th>
                <th className="text-left px-5 py-3 font-bold text-gray-600 border-b border-gray-200">Items</th>
                <th className="text-left px-5 py-3 font-bold text-gray-600 border-b border-gray-200">Dibuat</th>
                <th className="text-left px-5 py-3 font-bold text-gray-600 border-b border-gray-200">Status</th>
                <th className="text-left px-5 py-3 font-bold text-gray-600 border-b border-gray-200">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-6 text-center text-gray-500">Memuat data order...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-6 text-center text-gray-500">Belum ada order.</td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isCompleted = order.status === "COMPLETED";

                  return (
                  <tr
                    key={order._id}
                    className={`border-b border-gray-100 last:border-b-0 align-top ${isCompleted ? "bg-gray-50 text-gray-400" : ""}`}
                  >
                    <td className="px-5 py-3 text-gray-800 font-semibold">{order._id?.slice(-8)?.toUpperCase() || "-"}</td>
                    <td className="px-5 py-3 text-gray-700">
                      <p className="font-semibold text-gray-800">{order.user?.username || order.user?.name || "-"}</p>
                      <p className="text-xs text-gray-500">{order.user?.email || "-"}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-700 font-semibold">{formatCurrency(order.totalPrice)}</td>
                    <td className="px-5 py-3 text-gray-700">{order.paymentStatus || "-"}</td>
                    <td className="px-5 py-3 text-gray-700 max-w-[280px]">
                      <div className="space-y-1">
                        {(order.items || []).slice(0, 3).map((item, idx) => (
                          <p key={`${order._id}-item-${idx}`} className="text-xs text-gray-700">
                            {item.quantity}x {item.menu?.name || "Menu"}
                          </p>
                        ))}
                        {(order.items || []).length > 3 && (
                          <p className="text-xs text-gray-500">+{(order.items || []).length - 3} item lainnya</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-700 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                    <td className="px-5 py-3 text-gray-700">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_BADGE_CLASS[order.status] || "bg-gray-100 text-gray-700"}`}>
                        {order.status || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-700 min-w-[220px]">
                      <div className="flex gap-2 items-center">
                        <select
                          className="border border-gray-200 p-2 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                          value={statusDrafts[order._id] || order.status || "WAITING"}
                          disabled={isCompleted}
                          onChange={(e) =>
                            setStatusDrafts((prev) => ({
                              ...prev,
                              [order._id]: e.target.value,
                            }))
                          }
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          variant="dark"
                          disabled={updatingOrderId === order._id || isCompleted}
                          onClick={() => handleUpdateStatus(order._id)}
                        >
                          {isCompleted ? "Completed" : updatingOrderId === order._id ? "Menyimpan..." : "Update"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
