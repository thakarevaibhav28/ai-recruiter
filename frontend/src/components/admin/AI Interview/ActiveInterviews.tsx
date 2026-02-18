import { Button } from "../../../ui/button";
import {useEffect, useState } from "react";
import File from "../../../assets/admin/TestTemplates/file-edit.png";
import Comment from "../../../assets/admin/report/message.png";
import Calender from "../../../assets/admin/report/calendar.png";
import RightArrow from "../../../assets/admin/TestTemplates/arrow-right.png";
import FileEdit from "../../../assets/admin/TestTemplates/file-edit1.png";
import {adminService} from "../../../services/service/adminService"

interface ActiveInterviewsProps {
  onNavigateToInterviewSetup: (title: string) => void;
}

const ActiveInterviews: React.FC<ActiveInterviewsProps> = ({ onNavigateToInterviewSetup }) => {
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [assessments, setAssessments] = useState<any[]>([]);
  console.log("Assessments:", assessments);


  useEffect(() => {
    let isMounted = true;

    const loadAssessments = async () => {
      try {
        const res: any = await adminService.getDraft();
        console.log("API Response:", res);
        if (isMounted) {
          setAssessments(res.drafts);
        }
      } catch (error) {
        console.error("Error fetching assessments:", error);
      }
    };

    loadAssessments();

    return () => {
      isMounted = false;
    };
  }, []);

  const getTimeAgo = (dateString: string) => {
  const now = new Date();
  const past = new Date(dateString);

  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
};

  return (
    <div className=" flex  ">
      <div className="w-full">
        <div className="flex flex-wrap items-start justify-start gap-3   mt-0 pt-12">
          {assessments.map((assessment, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4 border border-gray-200 w-[290px]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{assessment.position}</h3>
                  <span className="border border-[#C2410C] text-[#C2410C] text-xs font-medium px-2 py-1 rounded-xl">{assessment.difficulty}</span>
                </div>
                <img src={File} alt="" className="w-5 -mt-3" />
              </div>
              <div className="text-sm text-gray-500 mb-4">
                {assessment.skills.map((skill: string, i: number) => (
                  <span key={i} className="inline-block bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full mr-2 mb-2">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <span className="flex items-center mr-4">
                  <img src={Comment} alt="" className="w-4 h-4 mr-3" />
                  {assessment.numberOfQuestions} questions
                </span>
                <span className="flex items-center">
                  <img src={Calender} alt="" className="w-4 h-4 mr-3" />
                  {assessment.createdDate}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-6"> Last Use: {getTimeAgo(assessment.createdAt)}</p>
              <div className="flex space-x-3">
                <button
                onClick={() => onNavigateToInterviewSetup(assessment)}
                  className="flex-1 bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center justify-center hover:bg-blue-700"
                >
                  <img src={RightArrow} className="w-4 h-4 mr-2" />
                  Use
                </button>
                <button className="border border-[#4318FF99] px-4 py-2 rounded-lg">
                  <img src={FileEdit} className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isResultOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Frontend Developer - Interview Results</h2>
              <button
                onClick={() => setIsResultOpen(false)}
                className="text-red-500 text-2xl font-bold hover:opacity-75"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-gray-50 text-center rounded-lg mx-6 mt-6">
              <div>
                <p className="text-2xl font-bold text-gray-800">16</p>
                <p className="text-sm uppercase text-gray-500 mt-1">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">12</p>
                <p className="text-sm uppercase text-gray-500 mt-1">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-500">6</p>
                <p className="text-sm uppercase text-gray-500 mt-1">Pending</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">75%</p>
                <p className="text-sm uppercase text-gray-500 mt-1">Rate</p>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-4 ml-6 mt-6">Candidates Results</h3>
            <div className="px-6 py-4 max-h-[400px] overflow-y-auto">
              {[
                { name: "John Doe", initials: "JD", completedDate: "2024-06-28", status: "Completed", score: 91 },
                { name: "Jane Smith", initials: "JS", completedDate: "2024-06-28", status: "Pending" },
                { name: "Alex Lee", initials: "AL", completedDate: "2024-06-28", status: "Pending" },
              ].map((c, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border border-gray-200 rounded-lg p-4 mb-4 bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex gap-4 items-center">
                    <div className="bg-indigo-100 rounded-full h-12 w-12 flex items-center justify-center text-xl font-medium">
                      {c.initials}
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">{c.name}</p>
                      {c.completedDate && (
                        <p className="text-sm text-gray-500">Completed: {c.completedDate}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <span
                      className={`text-sm px-3 py-1 rounded-full ${
                        c.status === "Completed" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {c.status}
                    </span>
                    {c.score !== undefined && (
                      <span className="text-xl font-bold text-green-600">{c.score}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isReminderOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Send Interview Reminders</h2>
              <button
                onClick={() => setIsReminderOpen(false)}
                className="text-red-500 text-2xl font-bold hover:opacity-75"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              This will send email reminders to all 6 pending candidates for the Frontend Developer position. The reminder will include the interview link and instructions.
            </p>
            <div className="flex justify-end gap-4">
              <Button variant="outline" className="text-sm" onClick={() => setIsReminderOpen(false)}>
                Cancel
              </Button>
              <Button
              
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm">
                Send Reminders
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveInterviews;






