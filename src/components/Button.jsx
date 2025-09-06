// src/components/Button.jsx
import React from "react";

const Button = ({ children, type = "primary" }) => {
  const base = "px-6 py-2 rounded font-semibold transition-colors duration-300";
  const styles = type === "primary"
    ? "bg-blue-600 text-white hover:bg-blue-700"
    : "bg-white text-black dark:bg-gray-800 dark:text-white border border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700";

  return <button className={`${base} ${styles}`}>{children}</button>;
};

export default Button;
