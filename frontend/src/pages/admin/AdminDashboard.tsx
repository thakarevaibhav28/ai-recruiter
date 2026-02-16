import { useState } from "react";
import AdminLayout from "../../common/AdminLayout";
import {
  FaUsers,
  FaClipboardList,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import { Plus, UserPlus, Calendar, TrendingUp } from "lucide-react";

// Stat Card Component
const StatCard = ({
  icon: Icon,
  title,
  value,
  change,
  changeColor,
  bgColor,
  iconColor,
}: any) => {
  return (
    <div className="bg-white rounded-lg p-5 border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className={`text-xs mt-2 ${changeColor}`}>{change}</p>
        </div>
        <div className={`${bgColor} rounded-lg p-3`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};

// Quick Actions Component
const QuickActions = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const actions = [
    {
      title: "Create New Assessment",
      icon: Plus,
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
      navigateTo: "Tests & Assessments",
    },
    { 
      title: "Bulk Add Candidates", 
      icon: UserPlus,
      navigateTo: "Candidates",
    },
    { 
      title: "Schedule Interviews", 
      icon: Calendar,
      navigateTo: "AI Video Interview",
    },
    { 
      title: "View Analytics", 
      icon: TrendingUp,
      navigateTo: "Reports & Insights",
    },
  ];

  return (
    <div className="bg-white rounded-lg p-5 border border-gray-200">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
        <p className="text-xs text-gray-500">Most Common Recruitment tasks</p>
      </div>
      <div className="space-y-2">
        {actions.map((action, i) => {
          const Icon = action.icon;
          const isFirst = i === 0;
          return (
            <button
              key={i}
              onClick={() => onNavigate(action.navigateTo)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isFirst
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span>{action.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Top Performance Component
const TopPerformance = () => {
  const performers = [
    {
      rank: 1,
      name: "Rahul Verma",
      role: "UX/UI Designer",
      score: "95%",
      date: "20 June",
      avatar: "RV",
    },
    {
      rank: 2,
      name: "Rahul Verma",
      role: "Backend Developer",
      score: "92%",
      date: "18 June",
      avatar: "RV",
    },
    {
      rank: 3,
      name: "Yash Sharma",
      role: "Frontend Developer",
      score: "90%",
      date: "19 June",
      avatar: "YS",
    },
  ];

  return (
    <div className="bg-white rounded-lg p-5 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Top Performance
          </h3>
          <p className="text-xs text-gray-500">
            Top Scorers in the Past 2 Weeks
          </p>
        </div>
        <div className="flex gap-2">
          <select className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600 outline-none focus:ring-1 focus:ring-indigo-600">
            <option>Test Name</option>
          </select>
          <select className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600 outline-none focus:ring-1 focus:ring-indigo-600">
            <option>Time Frame</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 pb-2">
          <div className="col-span-1">Rank</div>
          <div className="col-span-5">Candidate Name</div>
          <div className="col-span-3">Score</div>
          <div className="col-span-3">Date</div>
        </div>
        {performers.map((performer) => (
          <div
            key={performer.rank}
            className="grid grid-cols-12 gap-2 items-center py-2"
          >
            <div className="col-span-1 text-sm font-medium text-gray-900">
              {performer.rank}
            </div>
            <div className="col-span-5 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-medium">
                {performer.avatar}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {performer.name}
                </p>
                <p className="text-xs text-gray-500">{performer.role}</p>
              </div>
            </div>
            <div className="col-span-3 text-sm font-semibold text-gray-900">
              {performer.score}
            </div>
            <div className="col-span-3 text-sm text-gray-600">
              {performer.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Attendance Overview Component
const AttendanceOverview = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const data = [
    { present: 40, absent: 30, late: 30 },
    { present: 55, absent: 25, late: 20 },
    { present: 60, absent: 20, late: 20 },
    { present: 45, absent: 30, late: 25 },
    { present: 50, absent: 25, late: 25 },
    { present: 65, absent: 20, late: 15 },
    { present: 70, absent: 15, late: 15 },
  ];

  return (
    <div className="bg-white rounded-lg p-5 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-gray-900">
          Attendance Overview
        </h3>
        <select className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600 outline-none focus:ring-1 focus:ring-indigo-600">
          <option>Today</option>
          <option>This Week</option>
          <option>This Month</option>
        </select>
      </div>

      <div className="flex items-end justify-between h-48 gap-2">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full flex flex-col gap-0.5"
              style={{ height: "100%" }}
            >
              <div
                className="w-full bg-red-400 rounded-t"
                style={{ height: `${item.absent}%` }}
              />
              <div
                className="w-full bg-amber-400"
                style={{ height: `${item.late}%` }}
              />
              <div
                className="w-full bg-yellow-300 rounded-b"
                style={{ height: `${item.present}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 mt-2">{days[i]}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 mt-6">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-yellow-300" />
          <span className="text-xs text-gray-600">100%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-xs text-gray-600">67%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-xs text-gray-600">0%</span>
        </div>
      </div>
    </div>
  );
};

// Upcoming Interviews Component
const UpcomingInterviews = () => {
  const interviews = [
    {
      name: "Yash Sharma",
      role: "Frontend Developer",
      time: "9:00 AM",
      date: "June 24, 2025",
      status: "Upcoming",
    },
    {
      name: "Yash Sharma",
      role: "Frontend Developer",
      time: "9:00 AM",
      date: "June 24, 2025",
      status: "",
    },
    {
      name: "Yash Sharma",
      role: "Frontend Developer",
      time: "9:00 AM",
      date: "June 24, 2025",
      status: "",
    },
  ];

  return (
    <div className="bg-white rounded-lg p-5 border border-gray-200">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Upcoming Interviews
        </h3>
        <p className="text-xs text-gray-500">
          Scheduled Interviews (Today & Tomorrow)
        </p>
      </div>

      <div className="space-y-3">
        {interviews.map((interview, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                YS
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {interview.name}
                </p>
                <p className="text-xs text-gray-500">{interview.role}</p>
                <p className="text-xs text-gray-900 font-medium mt-0.5">
                  {interview.time}
                </p>
              </div>
              {interview.status && (
                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                  {interview.status}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                Reschedule
              </button>
              <button className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                Cancel Interview
              </button>
              <span className="text-xs text-gray-500">{interview.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [activeMenuItem, setActiveMenuItem] = useState("Dashboard");

  const stats = [
    {
      icon: FaUsers,
      title: "Total Candidates",
      value: "156",
      change: "+12% from Last Month",
      changeColor: "text-green-600",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      icon: FaClipboardList,
      title: "Tests Scheduled",
      value: "23",
      change: "+5% from Last Month",
      changeColor: "text-green-600",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      icon: FaCheckCircle,
      title: "Completed Tests",
      value: "89",
      change: "+18 from last month",
      changeColor: "text-green-600",
      bgColor: "bg-pink-100",
      iconColor: "text-pink-600",
    },
    {
      icon: FaClock,
      title: "Awaiting Review",
      value: "12",
      change: "-3 from last month",
      changeColor: "text-red-600",
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  // Handle navigation from Quick Actions
  const handleQuickActionNavigate = (page: string) => {
    setActiveMenuItem(page);
  };

  return (
    <AdminLayout
      heading="Hi, Himanshu"
      showSearch={true}
      activeMenuItem={activeMenuItem}
      onMenuItemClick={setActiveMenuItem}
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Quick Actions + Top Performance */}
      <div className="mt-5 grid grid-cols-5 gap-4">
        <div className="col-span-2">
          <QuickActions onNavigate={handleQuickActionNavigate} />
        </div>
        <div className="col-span-3">
          <TopPerformance />
        </div>
      </div>

      {/* Attendance + Upcoming Interviews */}
      <div className="mt-5 grid grid-cols-5 gap-4">
        <div className="col-span-2">
          <AttendanceOverview />
        </div>
        <div className="col-span-3">
          <UpcomingInterviews />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;