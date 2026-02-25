import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { adminService } from "../../services/service/adminService";
import {
  FileText,
  Clock,
  Calendar as CalendarIcon,
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  Users,
} from "lucide-react";
interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (candidate: any) => void;
  onUpdate: (candidate: any) => void;
  candidateData?: any;
}

interface CandidateFormData {
  name: string;
  email: string;
  mobile: string;
  role: string;
  year_of_experience: string;
  key_Skills: string;
  description: string;
}

const AddCandidateModal: React.FC<AddCandidateModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  onUpdate,
  candidateData,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);

  const isEditMode = !!candidateData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CandidateFormData>();

  /* ================= Populate Edit Mode ================= */
  useEffect(() => {
    if (candidateData) {
      setValue("name", candidateData.name);
      setValue("email", candidateData.email);
      setValue("mobile", candidateData.mobile);
      setValue("role", candidateData.role);
      setValue("year_of_experience", candidateData.year_of_experience);
      setValue("key_Skills", candidateData.key_Skills);
      setValue("description", candidateData.description || "");
      setResumeUrl(candidateData.resume || "");
    } else {
      reset();
      setResumeUrl("");
      setResumeFile(null);
    }
  }, [candidateData, setValue, reset]);

  /* ================= Analyze Resume ================= */
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFile(file);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setAnalyzing(true);

      const response = await adminService.analyzeResume(formData);

      console.log("Analyze API Response:", response);

      // 🔥 FIXED: Support both axios and direct data return
      const data = response?.data ?? response;

      if (!data?.success) {
        toast.error("Invalid server response.");
        return;
      }

      const { analysis, resumeUrl } = data;

      setResumeUrl(resumeUrl || "");

      // Auto fill safely
      setValue("name", analysis?.name ?? "");
      setValue("email", analysis?.email ?? "");
      setValue("mobile", analysis?.mobile ?? "");
      setValue("role", analysis?.role ?? "");
      setValue("year_of_experience", analysis?.year_of_experience ?? "");
      setValue("key_Skills", analysis?.key_Skills ?? "");
      setValue("description", analysis?.description ?? "");

      toast.success("Resume analyzed successfully!");
    } catch (err: any) {
      console.error("Resume Error:", err);
      toast.error(
        err?.response?.data?.message ||
          "Resume analysis failed. Please try again.",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  /* ================= Submit Candidate ================= */
  const onSubmit = async (data: CandidateFormData) => {
    try {
      setIsLoading(true);

      const loadingToast = toast.loading(
        isEditMode ? "Updating candidate..." : "Adding candidate...",
      );

      const payload = isEditMode
        ? { ...data, id: candidateData._id, resume: resumeUrl }
        : { ...data, resume: resumeUrl };

      const response = await adminService.addCandidate(payload);

      toast.dismiss(loadingToast);
      toast.success(
        isEditMode
          ? "Candidate updated successfully!"
          : "Candidate added successfully!",
      );

      const newCandidate = response.data?.newCandidate;

      if (newCandidate) {
        isEditMode ? onUpdate(newCandidate) : onAdd(newCandidate);
      }

      reset();
      setResumeUrl("");
      setResumeFile(null);
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setResumeFile(null);
    setResumeUrl("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* ================= HEADER ================= */}
        <div className="flex items-start gap-4 px-8 py-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-2xl  text-gray-900">
              {isEditMode ? "Edit Candidate" : "Create New Candidate"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Upload resume and manage candidate information
            </p>
          </div>

          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
          {/* ================= RESUME SECTION ================= */}
          {!isEditMode && (
            <div className="">
              <h3 className="text-lg  text-gray-500 mb-2">Resume Upload</h3>

              {!resumeUrl ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-2 text-center hover:border-gray-300 transition ">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    disabled={analyzing}
                    className="hidden"
                    id="resumeUpload"
                  />

                  <label
                    htmlFor="resumeUpload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <span className=" text-gray-500 text-sm flex items-center justify-center gap-4">
                      <Upload className="h-4 w-4 text-gray-500" /> Upload PDF,
                      DOC, DOCX
                    </span>
                  </label>

                  {analyzing && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-indigo-600 text-sm">
                      <div className="h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      Analyzing with AI...
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* File Card */}
                  <div className="flex items-center justify-between border border-gray-300 rounded-lg p-2 bg-white shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                        📄
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {resumeFile?.name || "Resume Uploaded"}
                        </p>
                        <a
                          href={resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 hover:underline"
                        >
                          View Resume
                        </a>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setResumeUrl("");
                        setResumeFile(null);
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>

                  {/* AI Info */}
                  <div className="bg-green-50 flex items-center justify-center border border-gray-300  rounded-lg px-4 py-1">
                    <div className="w-full flex items-center gap-2 text-green-700 text-sm font-medium mb-2">
                      ✓ Candidate details auto-filled from resume
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= CANDIDATE DETAILS ================= */}
          <div className="">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-500 mb-1 block">
                  Full Name
                </label>
                <input
                  {...register("name", { required: "Name is required" })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg    outline-none"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">
                  Email
                </label>
                <input
                  type="email"
                  {...register("email", { required: "Email is required" })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg   outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">
                  Mobile
                </label>
                <input
                  {...register("mobile", { required: true })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg   outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">
                  Role
                </label>
                <input
                  {...register("role", { required: true })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg   outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">
                  Years of Experience
                </label>
                <input
                  {...register("year_of_experience", { required: true })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg   outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">
                  Key Skills
                </label>
                <input
                  {...register("key_Skills", { required: true })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg   outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 mb-2 mt-2 block">
                Professional Summary
              </label>
              <textarea
                rows={4}
                {...register("description", { required: true })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg   outline-none resize-none"
              />
            </div>
          </div>

          {/* ================= FOOTER ================= */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 text-sm font-medium border border-gray-300 border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || analyzing}
              className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Candidate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCandidateModal;
