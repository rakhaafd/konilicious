export default function Label({ children, className = "", htmlFor, ...props }) {
  return (
    <label htmlFor={htmlFor} className={`block text-sm font-bold text-gray-700 mb-2 ${className}`} {...props}>
      {children}
    </label>
  );
}
