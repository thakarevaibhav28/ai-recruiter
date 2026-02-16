import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import SignIN_BG_Image from "../../assets/sign_in_bg.png";
import { adminService } from "../../services/service/adminService";
import { AxiosError } from "axios";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await adminService.login({
        email: data.email,
        password: data.password,
      });

      // Store token if remember me is checked
      if (data.rememberMe && response.data.token) {
        localStorage.setItem("token", response.data.token);
      } else if (response.data.token) {
        sessionStorage.setItem("token", response.data.token);
      }

      // Store user data if needed
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      // Navigate to dashboard
      navigate("/admin/dashboard");
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      
      if (axiosError.response) {
        // Server responded with error
        setError(
          axiosError.response.data.message || "Invalid email or password"
        );
      } else if (axiosError.request) {
        // Request made but no response
        setError("Network error. Please check your connection.");
      } else {
        // Something else happened
        setError("An unexpected error occurred. Please try again.");
      }
      
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center py-8 relative">
      <div className="relative w-[95%] h-[99%] mr-20">
        <img
          src={SignIN_BG_Image}
          className="sticky w-full h-full"
          alt="Background"
        />

        <div className="absolute w-[90%] top-0 left-1/2 -translate-x-1/2 flex-1 text-black flex flex-wrap items-center justify-between px-8 py-12 md:py-24">
          {/* Left Side - Branding */}
          <div className="text-white">
            <div className="text-2xl mb-4 z-10 font-bold">Vitric IQ</div>
            <h1 className="text-2xl md:text-4xl font-bold leading-snug z-10">
              Streamline Interview <br /> Management Easily
            </h1>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-[36%] h-[90%] rounded-xl py-10 px-10 bg-white">
            <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-500 mb-6 text-center">
              Please Enter Your Email & Password
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              {/* Email Field */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Ex: Maguire@lReduxi.com"
                  className={`w-full px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter Password"
                  className={`w-full px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  className="mr-2"
                  {...register("rememberMe")}
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-600">
                  Keep me signed in
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md text-sm font-semibold transition-all ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Logging in..." : "Login →"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;