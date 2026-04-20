import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import { Line, Doughnut, Bar as BarChartJS } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

const ADMIN_API_BASE = "http://localhost:5000/api/v1/admin";
const PIE_COLORS = ["#E00013", "#FFC107", "#111827", "#22C55E", "#0EA5E9"];

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function MetricCard({ title, value, subtitle }) {
  return (
    <Card className="p-5 border border-gray-200 rounded-2xl shadow-none">
      <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">{title}</p>
      <p className="text-3xl font-black text-gray-900 mt-1">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </Card>
  );
}

function SectionTable({ title, columns, rows, emptyText }) {
  return (
    <Card className="p-0 rounded-2xl border border-gray-200 shadow-none overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-white">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-5 py-3 font-bold text-gray-600 border-b border-gray-200 whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-6 text-center text-gray-500">
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={row._id || idx} className="border-b border-gray-100 last:border-b-0">
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-3 text-gray-700 whitespace-nowrap">
                      {col.render ? col.render(row[col.key], row) : row[col.key] || "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalMenus: 0,
    totalRatings: 0,
    completedOrders: 0,
  });
  const [users, setUsers] = useState([]);
  const [menus, setMenus] = useState([]);
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token tidak ditemukan. Silakan login ulang.");
      setLoading(false);
      return;
    }

    const fetchAdminData = async () => {
      setLoading(true);
      setError("");

      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [summaryRes, usersRes, menusRes, ratingsRes] = await Promise.all([
          fetch(`${ADMIN_API_BASE}/dashboard`, { headers }),
          fetch(`${ADMIN_API_BASE}/users`, { headers }),
          fetch(`${ADMIN_API_BASE}/menus`, { headers }),
          fetch(`${ADMIN_API_BASE}/ratings`, { headers }),
        ]);

        if (!summaryRes.ok || !usersRes.ok || !menusRes.ok || !ratingsRes.ok) {
          const firstFailed = [summaryRes, usersRes, menusRes, ratingsRes].find((res) => !res.ok);
          throw new Error(`Gagal memuat data admin (${firstFailed?.status || 500})`);
        }

        const [summaryData, usersData, menusData, ratingsData] = await Promise.all([
          summaryRes.json(),
          usersRes.json(),
          menusRes.json(),
          ratingsRes.json(),
        ]);

        setSummary({
          totalUsers: summaryData.totalUsers || 0,
          totalMenus: summaryData.totalMenus || 0,
          totalRatings: summaryData.totalRatings || 0,
          completedOrders: summaryData.completedOrders || 0,
        });
        setUsers(Array.isArray(usersData) ? usersData : []);
        setMenus(Array.isArray(menusData) ? menusData : []);
        setRatings(Array.isArray(ratingsData) ? ratingsData : []);
      } catch (err) {
        setError(err.message || "Terjadi kesalahan saat memuat data dashboard admin.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const latestUsers = useMemo(() => users.slice(0, 5), [users]);
  const latestMenus = useMemo(() => menus.slice(0, 5), [menus]);
  const latestRatings = useMemo(() => ratings.slice(0, 5), [ratings]);

  const growthData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const base = new Date();
    const months = [];

    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: `${monthNames[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}` });
    }

    const countByMonth = (items, dateKey = "createdAt") => {
      const map = Object.fromEntries(months.map((m) => [m.key, 0]));
      items.forEach((item) => {
        const rawDate = item?.[dateKey];
        if (!rawDate) return;
        const d = new Date(rawDate);
        if (Number.isNaN(d.getTime())) return;
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (map[key] !== undefined) map[key] += 1;
      });
      return map;
    };

    const userMap = countByMonth(users);
    const ratingMap = countByMonth(ratings);

    return months.map((m) => ({
      month: m.label,
      users: userMap[m.key] || 0,
      ratings: ratingMap[m.key] || 0,
    }));
  }, [users, ratings]);

  const menuCategoryData = useMemo(() => {
    const map = menus.reduce(
      (acc, menu) => {
        const category = menu?.category || "Lainnya";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {}
    );

    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [menus]);

  const ratingDistributionData = useMemo(() => {
    const buckets = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach((r) => {
      const val = Number(r?.rating || 0);
      if (buckets[val] !== undefined) buckets[val] += 1;
    });
    return [1, 2, 3, 4, 5].map((score) => ({ score: `${score}★`, total: buckets[score] }));
  }, [ratings]);

  const averageRating = useMemo(() => {
    if (!ratings.length) return 0;
    const total = ratings.reduce((sum, item) => sum + Number(item?.rating || 0), 0);
    return Number((total / ratings.length).toFixed(2));
  }, [ratings]);

  const growthLineData = useMemo(() => ({
    labels: growthData.map((d) => d.month),
    datasets: [
      {
        label: "User Baru",
        data: growthData.map((d) => d.users),
        borderColor: "#E00013",
        backgroundColor: "rgba(224, 0, 19, 0.18)",
        fill: true,
        tension: 0.35,
      },
      {
        label: "Rating Baru",
        data: growthData.map((d) => d.ratings),
        borderColor: "#FFC107",
        backgroundColor: "rgba(255, 193, 7, 0.18)",
        fill: true,
        tension: 0.35,
      },
    ],
  }), [growthData]);

  const growthLineOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
      },
      x: {
        grid: { display: false },
      },
    },
  }), []);

  const menuDoughnutData = useMemo(() => ({
    labels: menuCategoryData.map((d) => d.name),
    datasets: [
      {
        data: menuCategoryData.map((d) => d.value),
        backgroundColor: menuCategoryData.map((_, idx) => PIE_COLORS[idx % PIE_COLORS.length]),
        borderWidth: 1,
      },
    ],
  }), [menuCategoryData]);

  const menuDoughnutOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
    cutout: "58%",
  }), []);

  const ratingBarData = useMemo(() => ({
    labels: ratingDistributionData.map((d) => d.score),
    datasets: [
      {
        label: "Jumlah Ulasan",
        data: ratingDistributionData.map((d) => d.total),
        backgroundColor: "#111827",
        borderRadius: 8,
      },
    ],
  }), [ratingDistributionData]);

  const ratingBarOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
      },
      x: {
        grid: { display: false },
      },
    },
  }), []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen bg-gray-50/30">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Ringkasan data user, menu, rating, dan order selesai.</p>
        </div>
      </div>

      {loading && (
        <div className="text-center text-gray-500 py-10">Memuat data dashboard admin...</div>
      )}

      {!loading && error && (
        <div className="text-center text-red-600 font-semibold py-10">{error}</div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard title="Total User" value={summary.totalUsers} subtitle="Seluruh akun terdaftar" />
            <MetricCard title="Total Menu" value={summary.totalMenus} subtitle="Item makanan dan minuman" />
            <MetricCard title="Total Rating" value={summary.totalRatings} subtitle="Ulasan dari pelanggan" />
            <MetricCard title="Order Selesai" value={summary.completedOrders} subtitle="Status COMPLETED" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <Card className="xl:col-span-2 p-5 rounded-2xl border border-gray-200 shadow-none">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-extrabold text-gray-900">Tren User & Rating (6 Bulan)</h3>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Growth</span>
              </div>
              <div className="h-72">
                <Line data={growthLineData} options={growthLineOptions} />
              </div>
            </Card>

            <Card className="p-5 rounded-2xl border border-gray-200 shadow-none">
              <div className="mb-3">
                <h3 className="text-lg font-extrabold text-gray-900">Komposisi Kategori Menu</h3>
                <p className="text-sm text-gray-500">Distribusi Makanan, Minuman, dan lainnya</p>
              </div>
              <div className="h-72">
                <Doughnut data={menuDoughnutData} options={menuDoughnutOptions} />
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <Card className="xl:col-span-2 p-5 rounded-2xl border border-gray-200 shadow-none">
              <div className="mb-4">
                <h3 className="text-lg font-extrabold text-gray-900">Distribusi Bintang Rating</h3>
                <p className="text-sm text-gray-500">Total ulasan untuk tiap skor 1 sampai 5</p>
              </div>
              <div className="h-64">
                <BarChartJS data={ratingBarData} options={ratingBarOptions} />
              </div>
            </Card>

            <Card className="p-5 rounded-2xl border border-gray-200 shadow-none flex flex-col justify-center">
              <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Rata-Rata Rating</p>
              <p className="text-5xl font-black text-gray-900 mt-1">{averageRating}</p>
              <p className="text-sm text-gray-500 mt-1">Dari {ratings.length} ulasan pelanggan</p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                  <p className="text-xs text-red-600 font-bold">Top Score (5★)</p>
                  <p className="text-lg font-black text-red-700">
                    {ratingDistributionData.find((d) => d.score === "5★")?.total || 0}
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <p className="text-xs text-gray-600 font-bold">Low Score (1-2★)</p>
                  <p className="text-lg font-black text-gray-800">
                    {(ratingDistributionData.find((d) => d.score === "1★")?.total || 0) +
                      (ratingDistributionData.find((d) => d.score === "2★")?.total || 0)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <SectionTable
              title="User Terbaru"
              columns={[
                { key: "username", label: "Username" },
                { key: "email", label: "Email" },
                {
                  key: "role",
                  label: "Role",
                  render: (value) => (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${value === "admin" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                      {value || "user"}
                    </span>
                  ),
                },
              ]}
              rows={latestUsers}
              emptyText="Belum ada data user"
            />

            <SectionTable
              title="Menu Terbaru"
              columns={[
                { key: "name", label: "Nama Menu" },
                { key: "category", label: "Kategori" },
                {
                  key: "price",
                  label: "Harga",
                  render: (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`,
                },
              ]}
              rows={latestMenus}
              emptyText="Belum ada data menu"
            />
          </div>

          <SectionTable
            title="Rating Terbaru"
            columns={[
              { key: "rating", label: "Bintang", render: (value) => `${value || 0}/5` },
              { key: "comment", label: "Komentar" },
              {
                key: "createdAt",
                label: "Tanggal",
                render: (value) => (value ? new Date(value).toLocaleDateString("id-ID") : "-"),
              },
            ]}
            rows={latestRatings}
            emptyText="Belum ada data rating"
          />
        </>
      )}
    </div>
  );
}
