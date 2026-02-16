import { useState } from "react";
import AdminLayout from "../../common/AdminLayout";
import AddCandidateModal from "../../components/admin/AddCandidate";
import { Plus, Filter, MoreVertical } from "lucide-react";

const statusStyles = {
  Interview: "bg-purple-100 text-purple-600",   
  New: "bg-blue-100 text-blue-600",
  Completed: "bg-green-100 text-green-600",
  Screening: "bg-orange-100 text-orange-600",
  Rejected: "bg-red-100 text-red-600",
};

const initialData = [
  {
    id: 1,
    name: "Priya Sharma",
    email: "priyasharma23@gmail.com",
    role: "Senior Frontend Developer",
    status: "Interview",
    test: "React Assessment",
    score: 87,
    interview: "Dec 28, 2:00PM",
    applied: "Dec 28, 2:00PM",
  },
  {
    id: 2,
    name: "Priya Sharma",
    email: "priyasharma23@gmail.com",
    role: "Product Designer",
    status: "New",
    test: "Coding Challenge",
    score: null,
    interview: "Not Schedule",
    applied: "Dec 28, 2:00PM",
  },
  {
    id: 3,
    name: "Priya Sharma",
    email: "priyasharma23@gmail.com",
    role: "Full Stack Engineer",
    status: "Completed",
    test: "Design Portfolio",
    score: 95,
    interview: "Dec 28, 2:00PM",
    applied: "Dec 28, 2:00PM",
  },
  {
    id: 4,
    name: "Priya Sharma",
    email: "priyasharma23@gmail.com",
    role: "Senior Frontend Developer",
    status: "Screening",
    test: "System Design",
    score: 85,
    interview: "Not Schedule",
    applied: "Dec 28, 2:00PM",
  },
  {
    id: 5,
    name: "Priya Sharma",
    email: "priyasharma23@gmail.com",
    role: "Senior Frontend Developer",
    status: "Rejected",
    test: "Research Case Study",
    score: 75,
    interview: "Not Schedule",
    applied: "Dec 28, 2:00PM",
  },
];

const Candidates = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [activeMenuItem, setActiveMenuItem] = useState("Dashboard");
  const [data] = useState(initialData);
  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const paginated = data.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const toggleSelectAll = () => {
    if (selected.length === data.length) setSelected([]);
    else setSelected(data.map((d) => d.id));
  };

  const toggleRow = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAddCandidate = (candidateData: any) => {
    console.log("New candidate:", candidateData);
    // Add logic to add candidate to your data
  };

  return (
    <AdminLayout 
      heading="Candidate Management" 
      subheading="Manage and Review Candidates"
      showSearch={false}
      activeMenuItem={activeMenuItem}
      onMenuItemClick={setActiveMenuItem}
    >
      {/* Header with Tabs and Action Buttons */}
      <div className="flex items-center justify-between mb-6">
        {/* Left: Tabs */}
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "list"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Candidates List
          </button>
          <button
            onClick={() => setActiveTab("bulk")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "bulk"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Bulk Add
          </button>
        </div>

        {/* Right: Action Buttons */}
        <div className={`items-center gap-3 ${activeTab === "bulk"? "hidden":"flex"}`}>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Candidates
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      {activeTab === "list" && (
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selected.length === data.length && data.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sr. No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Assigned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interview Slot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginated.map((row, index) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(row.id)}
                        onChange={() => toggleRow(row.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {(page - 1) * rowsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-linear-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                          PS
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {row.name}
                          </div>
                          <div className="text-xs text-gray-500">{row.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{row.role}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusStyles[row.status as keyof typeof statusStyles]
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-4 h-4 flex items-center justify-center text-gray-400">
                          📄
                        </div>
                        {row.test}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {row.score !== null ? (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                          <span className="font-medium text-gray-900">
                            {row.score}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Not Taken</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {row.interview}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {row.applied}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {(page - 1) * rowsPerPage + 1} to{" "}
              {Math.min(page * rowsPerPage, data.length)} of {data.length} results
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                «
              </button>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ‹
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 text-sm rounded ${
                    page === i + 1
                      ? "bg-indigo-600 text-white"
                      : "border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <span className="px-2 text-gray-500">...</span>
              <button
                onClick={() => setPage(totalPages)}
                className={`px-3 py-1 text-sm rounded ${
                  page === totalPages
                    ? "bg-indigo-600 text-white"
                    : "border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {totalPages}
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ›
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                »
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "bulk" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Upload Section */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Upload Candidates
              </h3>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl">
                    ⬆
                  </div>
                  <p className="font-medium text-gray-900">Upload CSV File</p>
                  <p className="text-sm text-gray-500">
                    Drag and drop your CSV file here, or click to browse
                  </p>
                  <label className="mt-2">
                    <span className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50 inline-block">
                      Choose File
                    </span>
                    <input type="file" accept=".csv" className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Preview & Import
              </h3>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center text-2xl">
                    📄
                  </div>
                  <p className="font-medium text-gray-900">Import Preview</p>
                  <p className="text-sm text-gray-500 max-w-xs">
                    Upload a CSV file to see a preview of candidates that will be
                    imported
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CSV Requirements */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 max-w-2xl">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              CSV Format Requirements
            </h3>

            <ul className="space-y-2.5 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-2" />
                File must be in CSV format (.csv extension)
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-2" />
                Required Columns: Name, Email, Phone, Position
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-2" />
                Optional Columns: Experience, Skills, Location
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-2" />
                Maximum file size: 10MB
              </li>
            </ul>

            <button className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-50">
              <span>⬇</span> Download Sample CSV
            </button>
          </div>
        </div>
      )}

      {/* Add Candidate Modal */}
      <AddCandidateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddCandidate}
      />
    </AdminLayout>
  );
};

export default Candidates;