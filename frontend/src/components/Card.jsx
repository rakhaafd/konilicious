export default function Card({ children, className = "", onClick, ...props }) {
  const isClickable = !!onClick;
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] ${
        isClickable ? "cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1.5 transition-all duration-300" : ""
      } flex flex-col ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className = "", ...props }) {
  return <div className={`relative overflow-hidden ${className}`} {...props}>{children}</div>;
};

Card.Body = function CardBody({ children, className = "", ...props }) {
  return <div className={`p-5 flex-1 flex flex-col ${className}`} {...props}>{children}</div>;
};

Card.Title = function CardTitle({ children, className = "", ...props }) {
  return <h3 className={`font-bold text-gray-800 text-lg mb-1 leading-snug line-clamp-2 ${className}`} {...props}>{children}</h3>;
};

Card.Footer = function CardFooter({ children, className = "", ...props }) {
  return <div className={`mt-auto pt-2 grid gap-2 ${className}`} {...props}>{children}</div>;
};
