import React, { useState } from "react";
import Papa from "papaparse";
import { useTheme } from "../../context/Themecontext";
import { adminService } from "../../services/service/adminService";
import toast from "react-hot-toast";
import { X, Upload, FileText, Download, Loader2 } from "lucide-react";

interface BulkAddCandidateProps {
  isOpen: boolean;
  onClose: () => void;
}

const BulkAddCandidate: React.FC<BulkAddCandidateProps> = ({
  isOpen,
  onClose,
}) => {
  const { theme } = useTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Only CSV files are allowed");
      return;
    }

    setSelectedFile(file);

    // Parse CSV for preview
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        setPreviewData(results.data.slice(0, 5)); // show first 5 rows
      },
    });
  };

  // Upload to Backend
  const handleBulkUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a CSV file");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("csvFile", selectedFile);

      const res = await adminService.bulk_add_candidate(formData);

      toast.success(res?.data?.message || "Candidates added successfully");

      setPreviewData([]);
      setSelectedFile(null);
      onClose(); // Close the modal upon success
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = `name,email,mobile,role,year_of_experience,key_Skills
John Doe,john@example.com,9876543210,Frontend Developer,3,React|JavaScript
Jane Smith,jane@example.com,9123456789,Backend Developer,5,Node.js|MongoDB`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sample-candidates.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewData([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div
        className={`rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col ${theme === "dark" ? "bg-slate-800 text-white" : "bg-white text-gray-900"}`}
      >
        {/* Header */}
        <div
          className={`flex items-start justify-between p-6 border-b ${theme === "dark" ? "border-slate-700" : "border-gray-100"}`}
        >
          <div>
            <h2 className="text-lg font-semibold">Bulk Add Candidates</h2>
            <p
              className={`text-xs mt-0.5 ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}
            >
              Upload a CSV file to import multiple candidates at once
            </p>
          </div>
          <button
            onClick={handleClose}
            className={`p-1 rounded-md transition ${theme === "dark" ? "hover:bg-slate-700 text-slate-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Area */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Upload Candidates</h3>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${theme === "dark" ? "border-slate-600 bg-slate-900/50 hover:border-indigo-500" : "border-gray-300 bg-[#FFFFFF73] hover:border-indigo-500"}`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${theme === "dark" ? "bg-slate-800" : "bg-gray-100"}`}
                  >
                    <Upload
                      className={`w-5 h-5 ${theme === "dark" ? "text-slate-200" : "text-gray-500"}`}
                    />
                  </div>
                  <p className="text-sm font-semibold">Upload CSV File</p>
                  <p
                    className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}
                  >
                    Drag & drop or click to browse
                  </p>
                  <label className="mt-2">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded-lg cursor-pointer transition ${theme === "dark" ? "text-white bg-slate-800 border-slate-700 hover:bg-slate-700" : "text-black bg-white border-[#00000033] hover:bg-gray-50"}`}
                    >
                      <FileText className="w-3.5 h-3.5" /> Choose File
                    </span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Preview Area */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Preview & Import</h3>
              {previewData.length === 0 ? (
                /* Empty State */
                <div
                  className={`rounded-xl border p-8 text-center ${theme === "dark" ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"}`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme === "dark" ? "bg-slate-800" : "bg-gray-100"}`}
                    >
                      <FileText
                        className={`w-5 h-5 ${theme === "dark" ? "text-slate-200" : "text-gray-500"}`}
                      />
                    </div>
                    <h4 className="text-sm font-semibold">No File Uploaded</h4>
                    <p
                      className={`text-xs max-w-xs ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}
                    >
                      Upload a CSV file to preview candidates before importing.
                    </p>
                  </div>
                </div>
              ) : (
                /* Preview Table Card */
                <div
                  className={`rounded-xl border p-4 shadow-sm transition-all ${theme === "dark" ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-medium truncate">
                          {selectedFile?.name}
                        </p>
                        <p
                          className={`text-[10px] ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}
                        >
                          {previewData.length} records previewed
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewData([]);
                      }}
                      className="text-xs font-medium text-red-500 hover:text-red-600 transition"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Table */}
                  <div className="max-h-40 overflow-y-auto overflow-x-auto border rounded-lg">
                    <table className="min-w-full text-xs text-left">
                      <thead
                        className={`sticky top-0 z-10 uppercase text-[10px] tracking-wider ${theme === "dark" ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-gray-50 text-gray-600"}`}
                      >
                        <tr>
                          {Object.keys(previewData[0]).map((key) => (
                            <th
                              key={key}
                              className="px-3 py-2 font-semibold border-b"
                            >
                              {key.replaceAll("_", " ")}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody
                        className={
                          theme === "dark"
                            ? "divide-y divide-slate-700 bg-slate-950"
                            : "divide-y divide-gray-100 bg-white"
                        }
                      >
                        {previewData.map((row, index) => (
                          <tr
                            key={index}
                            className={
                              theme === "dark"
                                ? "hover:bg-slate-800"
                                : "hover:bg-gray-50"
                            }
                          >
                            {Object.values(row).map((value: any, i) => (
                              <td
                                key={i}
                                className="px-3 py-2 whitespace-nowrap"
                              >
                                {value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Guidelines & Sample CSV */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              className={`rounded-xl p-5 border ${theme === "dark" ? "bg-slate-900 border-slate-700" : "bg-[#FFFFFF73] border-gray-200"}`}
            >
              <h4 className="text-sm font-semibold mb-3">
                CSV Format Requirements
              </h4>
              <ul
                className={`space-y-2 text-xs list-disc pl-4 ${theme === "dark" ? "text-slate-300" : "text-gray-600"}`}
              >
                <li>File must be in CSV format (.csv extension)</li>
                <li>
                  Required Columns:{" "}
                  <code className="font-mono text-indigo-500">name</code>,{" "}
                  <code className="font-mono text-indigo-500">email</code>,{" "}
                  <code className="font-mono text-indigo-500">mobile</code>,{" "}
                  <code className="font-mono text-indigo-500">role</code>
                </li>
                <li>
                  Optional Columns:{" "}
                  <code className="font-mono text-indigo-500">
                    year_of_experience
                  </code>
                  ,{" "}
                  <code className="font-mono text-indigo-500">key_Skills</code>
                </li>
                <li>
                  Multiple skills should be separated by pipe character (e.g.
                  React|JavaScript)
                </li>
              </ul>

              <div className="mt-4">
                <button
                  onClick={downloadSampleCSV}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition ${theme === "dark" ? "text-white bg-slate-800 border border-slate-700 hover:bg-slate-700" : "text-black bg-white border border-[#00000033] hover:bg-gray-100"}`}
                >
                  <Download className="w-4 h-4" /> Download Sample CSV
                </button>
            </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`flex justify-end gap-3 p-6 border-t ${theme === "dark" ? "border-slate-700 bg-slate-900/40" : "border-gray-100 bg-gray-50"}`}
        >
          <button
            onClick={handleClose}
            className={`px-4 py-2 border rounded-lg text-xs font-medium transition ${theme === "dark" ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
          >
            Cancel
          </button>
          <button
            onClick={handleBulkUpload}
            disabled={loading || !selectedFile}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {loading ? "Uploading..." : "Import Candidates"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkAddCandidate;
