import { useState, useEffect, useRef } from "react";
import AdminLayout from "../../common/AdminLayout";
import AddCandidateModal from "../../components/Candidates/AddCandidate";
import ViewCandidateModal from "../../components/Candidates/ViewCandidate";
import ViewCandidateReportModal from "../../components/Candidates/ViewCandidateReport";
import { Plus, Filter, MoreVertical } from "lucide-react";
import BulkUpload from "../../components/Candidates/BulkUpload";
import toast from "react-hot-toast";
import { socket } from "../../utils/socket";
import { adminService } from "../../services/service/adminService";

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
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5); // fixed per page
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isViewReportModalOpen, setIsViewReportModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  );

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  /* ================= FETCH ================= */

  const fetchCandidates = async (
    pageNumber = 1,
    limit = rowsPerPage,
    status = "all",
  ) => {
    setLoading(true);
    try {
      const response = await adminService.getAllCandidate(
        pageNumber,
        limit,
        status,
      );

      if (response.status === 200) {
        const { data, totalPages, totalRecords } = response;

        setData(Array.isArray(data) ? data : []);
        setTotalPages(totalPages || 1);
        setTotalRecords(totalRecords || 0);

        // if current page becomes invalid after filtering
        if (pageNumber > totalPages && totalPages > 0) {
          setPage(totalPages);
        }
      }
    } catch (error) {
      console.error(error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= EFFECT ================= */

  useEffect(() => {
    fetchCandidates(page, rowsPerPage, statusFilter);
  }, [page, statusFilter]);

  /* ================= SOCKET ================= */

  useEffect(() => {
    socket.on("candidate-added", () => {
      fetchCandidates(page, rowsPerPage, statusFilter);
    });

    socket.on("candidate-updated", () => {
      fetchCandidates(page, rowsPerPage, statusFilter);
    });

    return () => {
      socket.off("candidate-added");
      socket.off("candidate-updated");
    };
  }, [page, statusFilter]);

  /* ================= MENU CLOSE ================= */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= HANDLERS ================= */

  const formatStatus = (status: string = "new") =>
    status.charAt(0).toUpperCase() + status.slice(1);

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page > 3) pages.push(1, "...");

      let start = Math.max(1, page - 2);
      let end = Math.min(totalPages, page + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) pages.push("...", totalPages);
    }

    return pages;
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
        candidate._id === updatedCandidate._id ? updatedCandidate : candidate,
      ),
    );
  };

  const handleViewCandidate = async (candidate: Candidate) => {
    try {
      setLoading(true);

      const response = await adminService.getCandidateProfile(candidate._id);
      console.log(response);
      if (response.status === 200) {
        setSelectedCandidate(response);
        setIsViewModalOpen(true);
      }
    } catch (error) {
      toast.error("Failed to load candidate profile");
    } finally {
      setLoading(false);
      setOpenMenuId(null);
    }
  };
  const handleViewReportCandidate = async (candidate: Candidate) => {
    try {
      setLoading(true);

      const response = await adminService.getCandidateProfile(candidate._id);
      console.log(response);
      if (response.status === 200) {
        setSelectedCandidate(response);
        setIsViewReportModalOpen(true);
      }
    } catch (error) {
      toast.error("Failed to load candidate profile");
    } finally {
      setLoading(false);
      setOpenMenuId(null);
    }
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleUpdateCandidateStatus = async (
    candidateId: string,
    newStatus: "active" | "inactive",
  ) => {
    try {
      const response = await adminService.updateCandidate(candidateId, {
        candidate_status: newStatus,
      });

      if (response.data && response.data.data) {
        // Update the candidate in the list
        setData((prevData) =>
          prevData.map((candidate) =>
            candidate._id === candidateId ? response.data.data : candidate,
          ),
        );

        toast.success(`Candidate ${newStatus} successfully!`);
      }

      setOpenMenuId(null);
    } catch (error: any) {
      console.error("Error updating candidate status:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update candidate status";
      toast.error(errorMessage);
    }
  };

  const toggleMenu = (candidateId: string) => {
    setOpenMenuId(openMenuId === candidateId ? null : candidateId);
  };
  const SkeletonRow = () => {
    return (
      <tr className="animate-pulse">
        {[...Array(8)].map((_, index) => (
          <td key={index} className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </td>
        ))}
      </tr>
    );
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
            className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-[#00000033] rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Candidates
          </button>
          <div className="flex cursor-pointer items-center gap-2 bg-white rounded-lg px-2  border border-[#00000033] focus:outline-none">
            <Filter className="h-4 w-4 text-gray-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm  cursor-pointer border-none outline-none focus:ring-0"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="Inactive">In-Active</option>
              {/* <option value="new">New</option>
              <option value="In_Progress">In-Progress</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option> */}
            </select>
          </div>
        </div>
      </div>

      {activeTab === "list" && (
        <div className="bg-white rounded-lg border border-[#00000033]">
          {/* Loading State */}
          {loading ? (
            <>
              <div className="relative overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-[#00000033]">
                    <tr>
                      <th className="px-6 py-3 text-xs uppercase">Sr. No</th>
                      <th className="px-6 py-3 text-xs uppercase">
                        Candidates
                      </th>
                      <th className="px-6 py-3 text-xs uppercase">Role</th>
                      <th className="px-6 py-3 text-xs uppercase">Status</th>
                      <th className="px-6 py-3 text-xs uppercase">
                        Experience
                      </th>
                      <th className="px-6 py-3 text-xs uppercase">Skills</th>
                      <th className="px-6 py-3 text-xs uppercase">Phone</th>
                      <th className="px-6 py-3 text-xs uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(rowsPerPage)].map((_, index) => (
                      <SkeletonRow key={index} />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
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
                      {/* <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={
                            selected.length === data.length && data.length > 0
                          }
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </th> */}
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
                    {data.map((row, index) => (
                      <tr
                        key={row._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selected.includes(row._id)}
                            onChange={() => toggleRow(row._id)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          />
                        </td> */}
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
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              row.candidate_status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {row.candidate_status === "active"
                              ? "Active"
                              : "Inactive"}
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
                              className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50"
                            >
                              <button
                                onClick={() => handleViewCandidate(row)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                              >
                                View
                              </button>

                              <button
                                onClick={() => handleEditCandidate(row)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleViewReportCandidate(row)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                              >
                                Report
                              </button>
                              {row.candidate_status === "active" ? (
                                <button
                                  onClick={() =>
                                    handleUpdateCandidateStatus(
                                      row._id,
                                      "inactive",
                                    )
                                  }
                                  className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 transition"
                                >
                                  Mark as Inactive
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleUpdateCandidateStatus(
                                      row._id,
                                      "active",
                                    )
                                  }
                                  className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition"
                                >
                                  Mark as Active
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className=" z-0 flex flex-col md:flex-row justify-between items-center gap-4 px-6 py-4 border-t border-[#00000033]">
                {/* Info */}
                <div className="text-sm text-gray-700">
                  {totalRecords === 0
                    ? "No results found"
                    : `Showing ${(page - 1) * rowsPerPage + 1} to 
        ${Math.min(page * rowsPerPage, totalRecords)} 
        of ${totalRecords} results`}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1">
                  {/* First */}

                  {/* Prev */}
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ‹
                  </button>

                  {/* Page Numbers */}
                  {getVisiblePages().map((p, index) =>
                    p === "..." ? (
                      <span
                        key={index}
                        className="px-2 py-1 text-sm text-gray-500"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={index}
                        onClick={() => setPage(Number(p))}
                        className={`px-3 py-1 text-sm rounded transition-all ${
                          page === p
                            ? "bg-indigo-600 text-white shadow-md"
                            : "border hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}

                  {/* Next */}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ›
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
      <ViewCandidateReportModal
        isOpen={isViewReportModalOpen}
        onClose={() => {
          setIsViewReportModalOpen(false);
          setSelectedCandidate(null);
        }}
        candidateData={selectedCandidate}
      />
    </AdminLayout>
  );
};

export default Candidates;
