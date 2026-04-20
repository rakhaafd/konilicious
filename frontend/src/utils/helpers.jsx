import { FaStar } from "react-icons/fa";

export const formatRp = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

export const Stars = ({ count = 5, rating = 0 }) => {
  const safeRating = Number(rating) || 0;
  return (
    <div className="flex items-center text-yellow-400 text-sm gap-0.5">
      {[...Array(count)].map((_, i) => (
        <FaStar key={i} className={i < Math.round(safeRating) ? "text-yellow-400" : "text-gray-300"} />
      ))}
      <span className="text-gray-600 ml-1 text-xs font-semibold">
        {safeRating > 0 ? safeRating.toFixed(1) : "0.0"}
      </span>
    </div>
  );
};
