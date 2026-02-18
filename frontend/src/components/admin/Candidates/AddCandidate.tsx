import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { adminService } from "../../../services/service/adminService";

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
  const isEditMode = !!candidateData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CandidateFormData>();

  // Populate form when editing
  useEffect(() => {
    if (candidateData) {
      setValue("name", candidateData.name);
      setValue("email", candidateData.email);
      setValue("mobile", candidateData.mobile);
      setValue("role", candidateData.role);
      setValue("year_of_experience", candidateData.year_of_experience);
      setValue("key_Skills", candidateData.key_Skills);
      setValue("description", candidateData.description || "");
    } else {
      reset();
    }
  }, [candidateData, setValue, reset]);

  const onSubmit = async (data: CandidateFormData) => {
    setIsLoading(true);

    const loadingToast = toast.loading(
      isEditMode ? "Updating candidate..." : "Adding candidate..."
    );

    try {
      // Prepare payload - include ID if editing
      const payload = isEditMode 
        ? { ...data, id: candidateData._id }
        : data;

      // Use same API service for both create and update
      const response = await adminService.addCandidate(payload);

      toast.dismiss(loadingToast);

      // Show success toast
      toast.success(
        isEditMode 
          ? "Candidate updated successfully!" 
          : "Candidate added successfully!"
      );

      // Backend returns newCandidate in both create and update
      const newCandidate = response.data?.newCandidate;
      
      if (newCandidate) {
        isEditMode ? onUpdate(newCandidate) : onAdd(newCandidate);
      }

      reset();
      onClose();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      
      // Show specific error message from backend
      const errorMessage = err.response?.data?.message || 
        (isEditMode
          ? "Failed to update candidate. Please try again."
          : "Failed to add candidate. Please try again.");
      
      toast.error(errorMessage);
      console.error("Candidate operation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Edit Candidate" : "Add New Candidates"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-5">
            {/* Row 1: Full Name, Email Address */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("name", {
                    required: "Full name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                    maxLength: {
                      value: 50,
                      message: "Name must not exceed 50 characters",
                    },
                  })}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Phone Number, Role */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none ${
                    errors.mobile ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("mobile", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Phone number must be 10 digits",
                    },
                  })}
                />
                {errors.mobile && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.mobile.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none appearance-none bg-white ${
                    errors.role ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("role", {
                    required: "Role is required",
                  })}
                >
                  <option value="">Select role</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full Stack Developer">
                    Full Stack Developer
                  </option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                </select>
                {errors.role && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.role.message}
                  </p>
                )}
              </div>
            </div>

            {/* Row 3: Year of Experience, Key Skills */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year of Experience
                </label>
                <select
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none appearance-none bg-white ${
                    errors.year_of_experience
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  {...register("year_of_experience", {
                    required: "Experience is required",
                  })}
                >
                  <option value="">Select year of experience</option>
                  <option value="0-1">0-1 years</option>
                  <option value="1-2">1-2 years</option>
                  <option value="2-3">2-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-7">5-7 years</option>
                  <option value="7-10">7-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
                {errors.year_of_experience && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.year_of_experience.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Skills
                </label>
                <input
                  type="text"
                  placeholder="e.g., React, Node.js, Python, Figma"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none ${
                    errors.key_Skills ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("key_Skills", {
                    required: "Skills are required",
                    minLength: {
                      value: 2,
                      message: "Please enter at least one skill",
                    },
                  })}
                />
                {errors.key_Skills && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.key_Skills.message}
                  </p>
                )}
              </div>
            </div>

            {/* Row 4: Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                placeholder="Any additional information about the candidates"
                rows={4}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none resize-none ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                {...register("description", {
                  required: "Description is required",
                })}
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 text-gray-700 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading
                ? isEditMode
                  ? "Updating..."
                  : "Adding..."
                : isEditMode
                  ? "Update Candidate"
                  : "Add Candidate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCandidateModal;