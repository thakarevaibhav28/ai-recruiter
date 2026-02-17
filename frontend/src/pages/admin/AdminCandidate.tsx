import { useState, useEffect, useRef } from "react";
import AdminLayout from "../../common/AdminLayout";
import AddCandidateModal from "../../components/admin/Candidates/AddCandidate";
import ViewCandidateModal from "../../components/admin/Candidates/ViewCandidate";
import { Plus, Filter, MoreVertical } from "lucide-react";
import BulkUpload from "../../components/admin/Candidates/BulkUpload";
import toast from "react-hot-toast";
import { adminService } from "../../services/service/adminService";

const statusStyles = {
  new: "bg-blue-100 text-blue-600",
  Interview: "bg-purple-100 text-purple-600",
  Completed: "bg-green-100 text-green-600",
  Screening: "bg-orange-100 text-orange-600",
  Rejected: "bg-red-100 text-red-600",
};

interface Candidate {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  year_of_experience: string;
  key_Skills: string;
  description?: string;
  status?: string;
  candidate_status?: string;
}

const Candidates = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [activeMenuItem, setActiveMenuItem] = useState("Dashboard");
  const [data, setData] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const paginated = data.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch all candidates on component mount
  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllCandidate();

      if (response.status === 200) {
        // Reverse the array to show newest first
        setData(response.data.reverse());
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selected.length === data.length) setSelected([]);
    else setSelected(data.map((d) => d._id));
  };

  const toggleRow = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAddCandidate = (candidateData: Candidate) => {
    // Add the new candidate to the top of the list
    setData((prevData) => [candidateData, ...prevData]);

    // Reset to page 1 to see the new candidate
    setPage(1);
  };

  const handleUpdateCandidate = (updatedCandidate: Candidate) => {
    // Update the candidate in the list
    setData((prevData) =>
      prevData.map((candidate) =>
        candidate._id === updatedCandidate._id ? updatedCandidate : candidate
      )
    );
    toast.success("Candidate updated successfully!");
  };

  const handleViewCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsViewModalOpen(true);
    setOpenMenuId(null);
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      try {
        await adminService.deleteCandidate(candidateId);
        
        // Remove candidate from the list
        setData((prevData) => prevData.filter((c) => c._id !== candidateId));
        
        toast.success("Candidate deleted successfully!");
        setOpenMenuId(null);
      } catch (error) {
        console.error("Error deleting candidate:", error);
        toast.error("Failed to delete candidate");
      }
    }
  };

  const toggleMenu = (candidateId: string) => {
    setOpenMenuId(openMenuId === candidateId ? null : candidateId);
  };

  // Capitalize first letter of status
  const formatStatus = (status: string = "new") => {
    return status.charAt(0).toUpperCase() + status.slice(1);
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
      <div className="flex items-center justify-between mb-6 ">
        {/* Left: Tabs */}
        <div className="inline-flex bg-white rounded-lg p-2">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "list"
                ? "bg-[#F4F7FE] text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Candidates List
          </button>
          <button
            onClick={() => setActiveTab("bulk")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "bulk"
                ? "bg-[#F4F7FE] text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Bulk Add
          </button>
        </div>

        {/* Right: Action Buttons */}
        <div
          className={`items-center gap-3 ${activeTab === "bulk" ? "hidden" : "flex"}`}
        >
          <button
            onClick={() => {
              setSelectedCandidate(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-[#00000033] rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Candidates
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-[#00000033] rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      {activeTab === "list" && (
        <div className="bg-white rounded-lg border border-[#00000033]">
          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-gray-500">Loading candidates...</div>
            </div>
          ) : data.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-gray-400 mb-2">No candidates found</div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                Add your first candidate
              </button>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-[#00000033]">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={
                            selected.length === data.length && data.length > 0
                          }
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
                        Experience
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Skills
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginated.map((row, index) => (
                      <tr
                        key={row._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selected.includes(row._id)}
                            onChange={() => toggleRow(row._id)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {(page - 1) * rowsPerPage + index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                              {row.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {row.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {row.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {row.role}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              statusStyles[
                                row.status as keyof typeof statusStyles
                              ] || statusStyles.new
                            }`}
                          >
                            {formatStatus(row.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {row.year_of_experience} years
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {row.key_Skills.split("|").join(", ")}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {row.mobile}
                        </td>
                        <td className="px-6 py-4 relative">
                          <button
                            onClick={() => toggleMenu(row._id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>

                          {/* Dropdown Menu */}
                          {openMenuId === row._id && (
                            <div
                              ref={menuRef}
                              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                            >
                              <button
                                onClick={() => handleViewCandidate(row)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleEditCandidate(row)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCandidate(row._id)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center px-6 py-4 border-t border-[#00000033]">
                <div className="text-sm text-gray-700">
                  Showing {(page - 1) * rowsPerPage + 1} to{" "}
                  {Math.min(page * rowsPerPage, data.length)} of {data.length}{" "}
                  results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 text-sm border border-[#00000033] rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    «
                  </button>
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 text-sm border border-[#00000033] rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          : "border border-[#00000033] hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  {totalPages > 5 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                  {totalPages > 1 && (
                    <button
                      onClick={() => setPage(totalPages)}
                      className={`px-3 py-1 text-sm rounded ${
                        page === totalPages
                          ? "bg-indigo-600 text-white"
                          : "border border-[#00000033] hover:bg-gray-50"
                      }`}
                    >
                      {totalPages}
                    </button>
                  )}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 text-sm border border-[#00000033] rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ›
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 text-sm border border-[#00000033] rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    »
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === "bulk" && <BulkUpload />}

      {/* Add/Edit Candidate Modal */}
      <AddCandidateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCandidate(null);
        }}
        onAdd={handleAddCandidate}
        onUpdate={handleUpdateCandidate}
        candidateData={selectedCandidate}
      />

      {/* View Candidate Modal */}
      <ViewCandidateModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedCandidate(null);
        }}
        candidateData={selectedCandidate}
      />
    </AdminLayout>
  );
};

export default Candidates;