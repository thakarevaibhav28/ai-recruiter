import React from "react";
import { Toaster } from "react-hot-toast";

const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: "#fff",
          color: "#363636",
          padding: "16px",
          borderRadius: "8px",
          fontSize: "14px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        },
        success: {
          duration: 3000,
          style: {
            background: "#10B981",
            color: "#fff",
          },
        },
        error: {
          duration: 4000,
          style: {
            background: "#EF4444",
            color: "#fff",
          },
        },
      }}
    />
  );
};

export default ToastProvider;