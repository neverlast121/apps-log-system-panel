import React from "react";

export function Button({
  children,
  variant = "default",
  className = "",
  ...props
}) {
  const baseStyle = "p-2 rounded-md transition duration-200";
  const variants = {
    default: "bg-blue-500 text-white hover:bg-blue-600",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-200",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// export default Button;
