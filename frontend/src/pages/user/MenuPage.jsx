import { useEffect, useState } from "react";
import { formatRp, Stars } from "../../utils/helpers";
import { FiSearch } from "react-icons/fi";
import { IoFastFoodOutline, IoCafeOutline } from "react-icons/io5";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Label from "../../components/Label";

const MENU_API_URL = "http://localhost:5000/api/v1/menu";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80";

function MenuCard({ item, onDetail }) {
  const category = item?.category || (item?.id >= 10 ? "Minuman" : "Makanan");
  const desc = item.description || "Menu andalan Konicipi dengan cita rasa autentik dan bahan pilihan terbaik.";

  return (
    <Card className="group p-0 rounded-xl overflow-hidden flex flex-col cursor-pointer transition-all duration-200 hover:shadow-md border border-gray-200">
      <div className="relative overflow-hidden">
        <img
          src={item.img || FALLBACK_IMAGE}
          alt={item.name}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-1">
          <Label className="px-2 py-1 bg-red-50 text-red-700 border border-red-100 rounded-md text-xs font-bold uppercase tracking-wider mb-0!">
            {category}
          </Label>
          {item.labelOptions && item.labelOptions.length > 0 && (
            <Label className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-bold uppercase tracking-wider mb-0!">
              {item.labelOptions.length} Opsi Variant
            </Label>
          )} 
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-800 text-lg mb-1 leading-snug line-clamp-1">
          {item.name}
        </h3>

        <div className="mb-2">
          <Stars rating={item.rating} />
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{desc}
        </p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-200">
          <p className="text-secondary font-black text-lg">
            {formatRp(item.price)}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDetail(item);
            }}
            className="font-bold rounded-lg shadow-none hover:shadow-sm"
          >
            Detail
          </Button>
        </div>
      </div>
    </Card>
  );
}

function MenuSection({ title, items, onDetail }) {
  return (
    <div className="mb-12">
      <div className="text-center mb-10">
        <h2 className="inline-block font-extrabold text-3xl text-gray-800 tracking-tight mb-2 relative">
          {title}
          <div className="absolute -bottom-4 left-1/4 right-1/4 h-1.5 bg-yellow-400 rounded-full"></div>
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {items.map((item) => (
          <MenuCard key={item.id} item={item} onDetail={onDetail} />
        ))}
      </div>
    </div>
  );
}

export default function MenuPage({ setPage, setSelectedItem }) {
  const [tab, setTab] = useState("makanan");
  const [search, setSearch] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchMenu = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(MENU_API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Gagal ambil menu (${response.status})`);
        }

        const data = await response.json();
        const normalized = Array.isArray(data)
          ? data.map((item, index) => ({
            id: item._id || `menu-${index}`,
            name: item.name || "Tanpa Nama",
            price: item.price || 0,
            img: item.image || FALLBACK_IMAGE,
            description: item.description || "",
            rating:
              Number(
                item.averageRating ?? item.avgRating ?? item.rating ?? item.average_rate ?? 0
              ) || 0,
            category: (item.category || "").toLowerCase(),
            tag: (item.tag || "Lain-lain").toLowerCase(),
            labelOptions: item.labelOptions || [],
            label: item.label || "",
          }))
          : [];

        setMenuItems(normalized);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();

    return () => controller.abort();
  }, []);

  const filter = (items) =>
    items.filter((i) =>
      i.name.toLowerCase().includes(search.toLowerCase())
    );

  const itemsByTab = filter(
    menuItems.filter((item) => {
      if (tab === "makanan") return item.category === "makanan";
      return item.category === "minuman";
    })
  );

  const groupedItems = itemsByTab.reduce((acc, item) => {
    const tag = item.tag;
    if (!acc[tag]) acc[tag] = [];
    acc[tag].push(item);
    return acc;
  }, {});

  const goDetail = (item) => {
    setSelectedItem(item);
    setPage(`detail/${item.id || item._id}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 min-h-screen bg-gray-50/30">
      {/* Header & Title */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          Jelajahi <span className="text-red-600">Menu</span> Kami
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">Temukan hidangan favoritmu dan nikmati sensasi rasa yang memikat di setiap gigitan.
        </p>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 bg-white p-3 rounded-2xl md:rounded-full shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
        <div className="flex items-center gap-2 w-full md:w-auto p-1 bg-gray-100 rounded-full">
          <button
            onClick={() => setTab("makanan")}
            className={`flex items-center justify-center gap-2 flex-1 md:flex-none px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 ${tab === "makanan"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <IoFastFoodOutline className="text-lg" />
            Makanan
          </button>
          <button
            onClick={() => setTab("minuman")}
            className={`flex items-center justify-center gap-2 flex-1 md:flex-none px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 ${tab === "minuman"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <IoCafeOutline className="text-lg" />
            Minuman
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-80 px-5 py-3 bg-gray-50 border border-gray-200 rounded-full shadow-inner focus-within:ring-2 focus-within:ring-yellow-400 focus-within:border-yellow-400 transition-all">
          <FiSearch className="text-gray-400 text-lg" />
          <input
            className="outline-none text-sm font-medium flex-1 bg-transparent text-gray-700 placeholder-gray-400"
            placeholder="Cari hidangan favoritmu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {loading && (
        <p className="text-center text-gray-500 py-10">Memuat menu...</p>
      )}

      {!loading && error && (
        <p className="text-center text-red-600 py-10 font-semibold">{error}</p>
      )}

      {!loading && !error && Object.keys(groupedItems).length > 0 && (
        Object.keys(groupedItems).map((tag, index) => (
          <MenuSection
            key={index}
            title={tag.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
            items={groupedItems[tag]}
            onDetail={goDetail}
          />
        ))
      )}

      {!loading && !error && itemsByTab.length === 0 && (
        <p className="text-center text-gray-500 py-10">
          Menu untuk kategori ini belum tersedia.
        </p>
      )}
    </div>
  );
}