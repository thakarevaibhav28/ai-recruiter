import { createContext, useContext, useEffect, useState } from "react";
import { adminService } from "../services/service/adminService";
import { socket } from "../utils/socket";

/* ================= TYPES ================= */

type User = {
  _id: string;
  email: string;
  role: "admin" | "super_admin" | "user";
  phone: string;
  name: string;
  location: string;
};

type AuthContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  logout: () => Promise<void>;
};

/* ================= CONTEXT ================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ================= PROVIDER ================= */

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  console.log(user);

  // useEffect(() => {
  //   const token =
  //     sessionStorage.getItem("accessToken") ||
  //     localStorage.getItem("accessToken");

  //   if (!token) {
  //     setLoading(false);
  //     return;
  //   }

  //   const fetchMe = async () => {
  //     try {
  //       const res = await adminService.getMe();
  //       setUser(res.user);
  //     } catch (error) {
  //       setUser(null);
  //       localStorage.removeItem("accessToken");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchMe();
  // }, []);

  useEffect(() => {
    if (!user) return;

    socket.connect();
    socket.emit("user-join-room", user._id);

    if (user.role === "admin") {
      socket.emit("admin-join-room");
    }

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const logout = async () => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      socket.disconnect();
      window.location.href = "/admin/login";

      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/* ================= HOOK ================= */

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
