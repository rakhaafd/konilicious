import { forwardRef } from "react";

const Button = forwardRef(({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  fullWidth = false,
  icon: Icon,
  ...props
}, ref) => {
  const baseStyle = "inline-flex items-center justify-center font-bold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none";

  const variants = {
    primary: "bg-primary text-primary-text hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/40",
    secondary: "bg-secondary text-white hover:bg-secondary-hover hover:shadow-lg hover:shadow-secondary/40",
    dark: "bg-accent text-white hover:bg-accent-hover hover:shadow-lg",
    outline: "border-2 border-primary text-primary-hover bg-transparent hover:bg-primary/10",
    ghost: "bg-transparent text-gray-600 hover:text-primary-hover hover:bg-gray-50",
    danger: "bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/40",
    dangerOutline: "border-2 border-red-500 text-red-500 bg-transparent hover:bg-red-50 focus:ring-red-500/20",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm gap-1.5 rounded-lg",
    md: "px-4 py-2.5 text-sm gap-1.5 rounded-xl",
    lg: "px-6 py-4 text-base gap-2 rounded-xl",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {Icon && <Icon className={size === "sm" ? "text-base" : "text-xl"} />}
      {children}
    </button>
  );
});

Button.displayName = "Button";
export default Button;
