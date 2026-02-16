import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/Header/logo.png";
import PageNotFoundImg from "../assets/Users/page_not_found.png";

const PageNotFound: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleGoHome = () => {
    if (isAdminRoute) {
      navigate("/admin-login");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-100 px-6 text-center">
      {/* Logo Section - Left aligned */}
      <div
        className="absolute top-6 left-8 flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
        onClick={handleGoHome}
      >
        <img src={Logo} alt="Logo" className="w-10 h-10 object-contain" />
        <h1 className="text-xl sm:text-2xl font-bold text-red-600 tracking-tight">
          Purti Super Bazar
        </h1>
      </div>

      {/* Page Not Found Image */}
      <img
        src={PageNotFoundImg}
        alt="Page Not Found"
        className="w-[90%] max-w-[480px] mb-6 drop-shadow-md"
      />

      {/* Back Home Button */}
      <button
        onClick={handleGoHome}
        className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium text-sm sm:text-base hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
      >
        {isAdminRoute ? "Go to Admin Login" : "Go Back Home"}
      </button>
    </div>
  );
};

export default PageNotFound;