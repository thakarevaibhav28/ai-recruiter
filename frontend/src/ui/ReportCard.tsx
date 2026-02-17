import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
}

const ReportCard: React.FC<StatCardProps> = ({ title, value, icon, iconBg }) => (
  <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm w-full min-h-[7rem]">
    <div>
      <p className="text-sm text-gray-500 mb-3">{title}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>
      {icon}
    </div>
  </div>
);

export default ReportCard;
