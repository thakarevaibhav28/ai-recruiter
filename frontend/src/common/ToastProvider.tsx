import React from "react";
import { Toaster } from "react-hot-toast";

const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={12}
      containerStyle={{
        top: 20,
        right: 20,
      }}
      toastOptions={{
        duration: 4000,
        style: {
          background: "#ffffff",
          color: "#111827",
          padding: "14px 18px",
          borderRadius: "12px",
          fontSize: "14px",
          fontWeight: 500,
          border: "1px solid #E5E7EB",
          boxShadow:
            "0 10px 25px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0,0,0,0.04)",
        },

        success: {
          duration: 3000,
          style: {
            background: "#ffffff",
            color: "#065F46",
            border: "1px solid #A7F3D0",
          },
          iconTheme: {
            primary: "#10B981",
            secondary: "#ffffff",
          },
        },

        error: {
          duration: 4000,
          style: {
            background: "#ffffff",
            color: "#7F1D1D",
            border: "1px solid #FCA5A5",
          },
          iconTheme: {
            primary: "#EF4444",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
};

export default ToastProvider;
