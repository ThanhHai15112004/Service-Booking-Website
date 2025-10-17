import React from "react";

type ToastProps = { type: "error" | "success"; message: string };

const Toast: React.FC<ToastProps> = ({ type, message }) => {
  return (
    <div
      className={`fixed top-6 right-8 px-4 py-2 rounded shadow-lg z-50
        ${type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}
      role="alert"
    >
      {message}
    </div>
  );
};

export default Toast;