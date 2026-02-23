import { useState, useEffect } from "react";
import AdminLayout from "../../common/AdminLayout";
import { adminService } from "../../services/service/adminService";
import toast from "react-hot-toast";
import {
  FaUsers,
  FaClipboardList,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import { Plus, UserPlus, Calendar, TrendingUp } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";

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
const QuickActions = ({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) => {
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

const TopPerformance = () => {
  const [examType, setExamType] = useState("MCQ");
  const [performers, setPerformers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTopPerformance = async (type: string) => {
    try {
      setLoading(true);

      const res = await adminService.getTopPerformance(type);

      if (res?.success) {
        // Add ranking dynamically
        const ranked = res.data
          .slice(0, 3) // 🔥 ONLY TOP 5
          .map((item: any, index: number) => ({
            rank: index + 1,
            name: item.candidate?.name,
            email: item.candidate?.email,
            score: `${item.percentage}%`,
            examType: item.interview?.examType,
            testTitle: item.interview?.test_title,
          }));

        setPerformers(ranked);
      } else {
        setPerformers([]);
      }
    } catch (error: any) {
      toast.error("Top Performance Error:", error);
      setPerformers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopPerformance(examType);
  }, [examType]);

  return (
    <div className="bg-white rounded-lg p-5 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Top Performance
          </h3>
          <p className="text-xs text-gray-500">Top Scorers</p>
        </div>

        <div className="flex gap-2">
          <select
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600 outline-none focus:ring-1 focus:ring-indigo-600"
          >
            <option value="MCQ">MCQ</option>
            <option value="AI">AI</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-6 text-sm text-gray-500">Loading...</div>
      ) : performers.length === 0 ? (
        <div className="text-center py-6 text-sm text-gray-500">
          No Data Available
        </div>
      ) : (
        <div className="space-y-3 overflow-x-auto">
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 pb-2">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">Candidate</div>
            <div className="col-span-3">Score</div>
            <div className="col-span-3">Test</div>
          </div>

          {performers.map((performer) => (
            <div
              key={performer.rank}
              className="grid grid-cols-12 gap-2 items-center py-2"
            >
              <div className="col-span-1 text-sm font-medium text-gray-900">
                {performer.rank}
              </div>

              <div className="col-span-5">
                <p className="text-sm font-medium text-gray-900">
                  {performer.name}
                </p>
                <p className="text-xs text-gray-500">{performer.email}</p>
              </div>

              <div className="col-span-3 text-sm font-semibold text-indigo-600">
                {performer.score}
              </div>

              <div className="col-span-3 text-xs text-gray-600">
                {performer.testTitle}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
// Attendance Overview Component
// const AttendanceOverview = () => {
//   const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
//   const data = [
//     { present: 40, absent: 30, late: 30 },
//     { present: 55, absent: 25, late: 20 },
//     { present: 60, absent: 20, late: 20 },
//     { present: 45, absent: 30, late: 25 },
//     { present: 50, absent: 25, late: 25 },
//     { present: 65, absent: 20, late: 15 },
//     { present: 70, absent: 15, late: 15 },
//   ];

//   return (
//     <div className="bg-white rounded-lg p-5 border border-gray-200">
//       <div className="flex items-center justify-between mb-6">
//         <h3 className="text-sm font-semibold text-gray-900">
//           Attendance Overview
//         </h3>
//         <select className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600 outline-none focus:ring-1 focus:ring-indigo-600">
//           <option>Today</option>
//           <option>This Week</option>
//           <option>This Month</option>
//         </select>
//       </div>

//       <div className="flex items-end justify-between h-48 gap-2">
//         {data.map((item, i) => (
//           <div key={i} className="flex-1 flex flex-col items-center gap-1">
//             <div
//               className="w-full flex flex-col gap-0.5"
//               style={{ height: "100%" }}
//             >
//               <div
//                 className="w-full bg-red-400 rounded-t"
//                 style={{ height: `${item.absent}%` }}
//               />
//               <div
//                 className="w-full bg-amber-400"
//                 style={{ height: `${item.late}%` }}
//               />
//               <div
//                 className="w-full bg-yellow-300 rounded-b"
//                 style={{ height: `${item.present}%` }}
//               />
//             </div>
//             <span className="text-xs text-gray-500 mt-2">{days[i]}</span>
//           </div>
//         ))}
//       </div>

//       <div className="flex items-center justify-center gap-4 mt-6">
//         <div className="flex items-center gap-1.5">
//           <div className="w-2 h-2 rounded-full bg-yellow-300" />
//           <span className="text-xs text-gray-600">100%</span>
//         </div>
//         <div className="flex items-center gap-1.5">
//           <div className="w-2 h-2 rounded-full bg-amber-400" />
//           <span className="text-xs text-gray-600">67%</span>
//         </div>
//         <div className="flex items-center gap-1.5">
//           <div className="w-2 h-2 rounded-full bg-red-400" />
//           <span className="text-xs text-gray-600">0%</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// Upcoming Interviews Component
const UpcomingInterviews = ({
  interviews,
  onReschedule,
  onCancel,
}: {
  interviews: any[];
  onReschedule: (interview: any) => void;
  onCancel: (interview: any) => void;
}) => {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US");

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <div className="flex w-full bg-white flex-col px-5 gap-3 py-3 border-b border-gray-200">
      <h3 className="text-sm font-semibold mb-4">Upcoming Interviews</h3>

      {interviews.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">
          No upcoming interviews scheduled
        </p>
      ) : (
        interviews.slice(0, 3).map((interview, i) => (
          <div
            key={i}
            className="flex justify-between items-center py-3 border-b  border-gray-200"
          >
            <div>
              <div className="flex items-center gap-5">
                <p className="font-medium">
                  {interview?.candidate?.name || "Unknown"}
                </p>
                <p className="text-xs text-gray-500">{interview.title}</p>
              </div>
              <div className="flex items-center gap-5">
                <p className="text-xs font-medium">
                  {formatTime(interview.startDate)}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDate(interview.startDate)}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onReschedule(interview)}
                className="px-3 py-1 text-xs border rounded cursor-pointer  border-gray-400"
              >
                Reschedule
              </button>

              <button
                onClick={() => onCancel(interview)}
                className="px-3 py-1 text-xs border cursor-pointer border-red-300 text-red-600 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [totalCandidates, setTotalCandidates] = useState("0");
  const [totalScheduledTests, setTotalScheduledTests] = useState("0");
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelInterview, setCancelInterview] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<any>(null);
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();

  /* ================= FETCH DASHBOARD ================= */

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const candidateRes = await adminService.getAllCandidate(1, 100, "all");
      if (candidateRes?.status === 200) {
        setTotalCandidates(candidateRes.totalRecords?.toString() || "0");
      }

      const scheduleRes = await adminService.getTotalSchedule();
      console.log(".....", scheduleRes);

      if (scheduleRes?.status === 200) {
        setTotalScheduledTests(
          scheduleRes.totalScheduledTests?.toString() || "0",
        );
        setUpcomingInterviews(scheduleRes.upcoming || []);
      }
    } catch (err: any) {
      toast.error("Dashboard Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /* ================= RESCHEDULE ================= */

  const handleReschedule = (interview: any) => {
    setSelectedInterview(interview);
    setNewStartDate("");
    setNewEndDate("");
    setShowModal(true);
  };

  const submitReschedule = async () => {
    if (!selectedInterview || !newStartDate || !newEndDate) return;

    try {
      setActionLoading(true);

      await adminService.reScheduleInterview(
        selectedInterview.type,
        selectedInterview._id,
        {
          candidateId: selectedInterview.candidate._id,
          newStartDate: new Date(newStartDate).toISOString(),
          newEndDate: new Date(newEndDate).toISOString(),
        },
      );

      setShowModal(false);
      fetchDashboardData();
      toast.success("Interview re-Schedule Successfully");
    } catch (err) {
      console.error("Reschedule Error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  /* ================= CANCEL ================= */

  const handleCancel = async (interview: any) => {
    setCancelInterview(interview);
    setShowCancelModal(true);
  };
  const confirmCancelInterview = async () => {
    if (!cancelInterview) return;

    try {
      setActionLoading(true);

      await adminService.cancleInterview(
        cancelInterview.type,
        cancelInterview._id,
        {
          candidateId: cancelInterview.candidate._id,
        },
      );

      toast.success("Interview Cancelled Successfully");
      setShowCancelModal(false);
      fetchDashboardData();
    } catch (err: any) {
      toast.error("Cancel Error");
    } finally {
      setActionLoading(false);
    }
  };

  /* ================= NAVIGATION ================= */

  const handleQuickActionNavigate = (page: string) => {
    const routeMap: Record<string, string> = {
      Dashboard: "/admin/dashboard",
      Candidates: "/admin/candidates",
      "Tests & Assessments": "/admin/tests",
      "AI Video Interview": "/admin/video",
      "Reports & Insights": "/admin/reports",
      Settings: "/admin/settings",
    };

    navigate(routeMap[page]);
  };

  /* ================= RENDER ================= */

  return (
    <AdminLayout heading="Hi, Himanshu" showSearch>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FaUsers}
          title="Total Candidates"
          value={loading ? "..." : totalCandidates}
          change="+12% from Last Month"
          changeColor="text-green-600"
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          icon={FaClipboardList}
          title="Tests Scheduled"
          value={loading ? "..." : totalScheduledTests}
          change="+5% from Last Month"
          changeColor="text-green-600"
          bgColor="bg-green-100"
          iconColor="text-green-600"
        />
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <QuickActions onNavigate={handleQuickActionNavigate} />
        </div>
        <div className="lg:col-span-3">
          <TopPerformance />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-1 gap-4">
        {/* <div className="lg:col-span-2">
          <AttendanceOverview />
        </div> */}
        <div className="lg:col-span-3">
          <UpcomingInterviews
            interviews={upcomingInterviews}
            onReschedule={handleReschedule}
            onCancel={handleCancel}
          />
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] sm:w-[400px]">
            <h3 className="text-lg font-semibold mb-4">Reschedule Interview</h3>

            <input
              type="datetime-local"
              className="w-full border p-2 rounded mb-3"
              value={newStartDate}
              onChange={(e) => setNewStartDate(e.target.value)}
            />

            <input
              type="datetime-local"
              className="w-full border p-2 rounded mb-4"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                disabled={actionLoading}
                onClick={submitReschedule}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                {actionLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ================= CANCEL CONFIRM MODAL ================= */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] sm:w-[400px]">
            <h3 className="text-lg font-semibold mb-3 text-red-600">
              Cancel Interview
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to cancel this interview?
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border rounded"
              >
                No
              </button>

              <button
                disabled={actionLoading}
                onClick={confirmCancelInterview}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                {actionLoading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Dashboard;
