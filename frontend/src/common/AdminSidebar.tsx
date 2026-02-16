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

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-200">
      <div className="px-5 pt-6 pb-8">
        <h1 className="text-lg font-bold text-gray-900">Vitric IQ</h1>
      </div>

      <nav className="space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.title}
              onClick={() => navigate(item.path)}
              className={`relative w-full flex items-center gap-3 px-4 py-2.5 text-[14px] font-medium transition-colors ${
                isActive
                  ? "text-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {isActive && (
                <div className="absolute right-0 top-0 bottom-0 w-1 rounded-r-full bg-indigo-600" />
              )}

              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className={isActive ? "font-semibold" : ""}>
                {item.title}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
