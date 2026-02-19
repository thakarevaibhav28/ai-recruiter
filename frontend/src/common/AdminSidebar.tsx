import React from "react";
import {
  Home,
  Users,
  FileText,
  Video,
  BarChart3,
  Settings,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/context";




const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { title: "Dashboard", icon: Home, path: "/admin/dashboard" },
    { title: "Candidates", icon: Users, path: "/admin/candidates" },
    { title: "Tests & Assessments", icon: FileText, path: "/admin/tests" },
    { title: "AI Video Interview", icon: Video, path: "/admin/video" },
    { title: "Reports & Insights", icon: BarChart3, path: "/admin/reports" },
    { title: "Settings", icon: Settings, path: "/admin/settings" },
  ];
const { logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-200">
      <div className="px-5 pt-6 pb-8 flex items-center justify-center border-b border-gray-100 mb-10">
        <h1 className="text-[25px] font-bold text-gray-900">Vitric IQ</h1>
      </div>
<nav className="space-y-4">
  {navItems.map((item) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;

    return (
      <button
        key={item.title}
        onClick={() => navigate(item.path)}
        className={`pl-10 text-[16px] relative w-full flex items-center gap-3 px-4 py-2.5 font-medium transition-colors ${
          isActive
            ? "text-indigo-600"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        {isActive && (
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full" />
        )}

        <Icon className="h-[18px] w-[18px]" />
        <span className={isActive ? "font-semibold text-[#2B3674]" : ""}>
          {item.title}
        </span>
      </button>
    );
  })}

  {/* Logout Button */}
  <button
    onClick={async () => {
      await logout();
      navigate("/admin/login");
    }}
    className="pl-10 text-[16px] w-full flex items-center gap-3 px-4 py-2.5 font-medium text-red-600 hover:text-red-700 transition-colors"
  >
    <Settings className="h-[18px] w-[18px]" />
    Logout
  </button>
</nav>
    </aside>
  );
};

export default Sidebar;
