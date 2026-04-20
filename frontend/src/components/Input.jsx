import { forwardRef } from "react";

const Input = forwardRef(({
  type = "text",
  className = "",
  error,
  label,
  id,
  disabled,
  ...props
}, ref) => {
  return (
    <div className={`w-full relative ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-bold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={type}
          ref={ref}
          disabled={disabled}
          className={`w-full border p-3 rounded-xl focus:outline-none transition-all duration-200 placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-75 ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              : "border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          } ${props.rightIcon ? "pr-10" : ""}`}
          {...props}
        />
        {props.rightIcon && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={props.onRightIconClick}
          >
            {props.rightIcon}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-500 font-medium">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
