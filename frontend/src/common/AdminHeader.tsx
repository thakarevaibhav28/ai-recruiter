import React from "react";
import { Search, Bell } from "lucide-react";

interface HeaderProps {
  heading?: string;
  subheading?: string;
  showSearch?: boolean;
  userName?: string;
  userInitial?: string;
}

const Header: React.FC<HeaderProps> = ({
  heading = "Hi, John",
  subheading,
  showSearch = true,
  userName = "Himanshu",
  userInitial = "H",
}) => {
  return (
    <header className="flex h-16 items-center justify-between px-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{heading}</h2>
        {subheading && (
          <p className="text-sm text-gray-500 mt-0.5">{subheading}</p>
        )}
      </div>

      <div className="flex items-center gap-3 bg-[#FFFFFF] p-2 rounded-3xl">
        {/* Search */}
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search"
              className="h-9 w-48 rounded-full bg-[#F4F7FE] border border-gray-200 pl-9 pr-4 text-[13px] text-gray-900 placeholder:text-[#8F9BBA] outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>
        )}

        {/* Bell Icon */}
        <button className="relative rounded-full p-2 text-gray-600 hover:text-gray-900 transition-colors">
          <Bell className="h-4.5 w-4.5" />
        </button>

        {/* User Avatar */}
        <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-medium cursor-pointer hover:bg-indigo-700 transition-colors">
          {userInitial}
        </div>
      </div>
    </header>
  );
};

export default Header;