import React, { useState, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Upload,
  Camera,
  CheckCircle,
  AlertTriangle,
  User,
  FileImage,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Step = "document" | "selfie";
type UploadStatus = "idle" | "uploading" | "verified" | "error";

const IdentityVerification: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>("document");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
  } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFile = (file: File) => {
    setUploadStatus("uploading");
    setUploadedFile({ name: file.name, size: formatFileSize(file.size) });

    setTimeout(() => {
      setUploadStatus("verified");
    }, 1800);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleUploadDifferent = () => {
    setUploadStatus("idle");
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050A24] bg-[radial-gradient(circle_at_100%_0%,rgba(45,85,251,0.45),transparent_50%),radial-gradient(circle_at_0%_100%,rgba(45,85,251,0.35),transparent_50%)]">
      {/* Gradient orbs */}
      <motion.div
        className="absolute -top-20 -right-20 w-[200px] h-[200px] bg-[#2D55FB] rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -50, 20, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 -left-20 w-[200px] h-[200px] bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{
          x: [0, -40, 30, 0],
          y: [0, 40, -30, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 md:p-8 bg-[#0a1342]/30 backdrop-blur-sm">
          <button className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm sm:text-base">Identity Verification</span>
          </button>
          <div className="flex items-center gap-3">
            {/* <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div> */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-6 pt-6 pb-4 px-4">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep === "document" ? "bg-[#2D55FB] text-white" : "bg-[#2D55FB] text-white"}`}
            >
              1
            </div>
            <div>
              <p
                className={`text-xs sm:text-sm font-semibold ${currentStep === "document" ? "text-[#2D55FB]" : "text-[#2D55FB]"}`}
              >
                Document Upload
              </p>
              <p className="text-gray-500 text-xs">Identity verification</p>
            </div>
          </div>

          {/* Connector */}
          <div className="flex-1 max-w-16 h-px bg-gray-700 relative">
            <motion.div
              className="absolute top-0 left-0 h-full bg-[#2D55FB]"
              initial={{ width: "0%" }}
              animate={{ width: currentStep === "selfie" ? "100%" : "0%" }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep === "selfie" ? "bg-[#2D55FB] text-white" : "bg-[#1a2850] text-gray-400 border border-gray-600"}`}
            >
              2
            </div>
            <div>
              <p
                className={`text-xs sm:text-sm font-semibold ${currentStep === "selfie" ? "text-[#2D55FB]" : "text-gray-400"}`}
              >
                Selfie Capture
              </p>
              <p className="text-gray-500 text-xs">Identity verification</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex items-start justify-center px-4 sm:px-6 md:px-8 py-6">
          <motion.div
            className="w-full max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <AnimatePresence mode="wait">
              {currentStep === "document" ? (
                <motion.div
                  key="document"
                  className="w-full max-w-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Title */}
                  <div className="text-center mb-6">
                    <h1 className="text-white text-2xl sm:text-3xl font-bold mb-2">
                      Document Verification
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base">
                      Please upload a clear photo of your Aadhaar card for
                      secure identity verification
                    </p>
                  </div>

                  {/* Upload Card */}
                  <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/10 shadow-2xl mb-4">
                    <h2 className="text-white font-semibold text-sm sm:text-base mb-1">
                      Upload Aadhaar Card
                    </h2>
                    <p className="text-gray-500 text-xs mb-4">
                      Accepted formats: JPG, PNG, PDF • Maximum size: 5MB •
                      Ensure all corners are visible
                    </p>

                    {/* Drop Zone */}
                    <AnimatePresence mode="wait">
                      {uploadStatus === "idle" ||
                      uploadStatus === "uploading" ? (
                        <motion.div
                          key="dropzone"
                          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${isDragOver ? "border-[#2D55FB] bg-[#2D55FB]/10" : "border-gray-700 hover:border-gray-600"}`}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragOver(true);
                          }}
                          onDragLeave={() => setIsDragOver(false)}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="hidden"
                            onChange={handleFileInput}
                          />

                          {uploadStatus === "uploading" ? (
                            <div className="flex flex-col items-center gap-3">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                              >
                                <RefreshCw className="h-10 w-10 text-[#2D55FB]" />
                              </motion.div>
                              <p className="text-white text-sm font-medium">
                                Verifying document...
                              </p>
                              <p className="text-gray-400 text-xs">
                                {uploadedFile?.name}
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-14 h-14 rounded-xl bg-[#1a2850] flex items-center justify-center">
                                <FileImage className="h-7 w-7 text-[#2D55FB]" />
                              </div>
                              <div>
                                <p className="text-white text-sm font-medium">
                                  Drag and drop your Aadhaar card here
                                </p>
                                <p className="text-gray-500 text-xs mt-1">
                                  or click to select from your device
                                </p>
                              </div>
                              <button className="flex items-center gap-2 px-4 py-2 bg-[#1a2850] border border-[#2D55FB]/40 text-[#2D55FB] text-sm rounded-lg hover:bg-[#2D55FB]/10 transition-colors">
                                <Upload className="h-4 w-4" />
                                Choose File
                              </button>
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="verified"
                          className="border-2 border-green-500/40 rounded-xl p-8 text-center bg-green-500/5"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.4 }}
                        >
                          <div className="flex flex-col items-center gap-3">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 200,
                                delay: 0.1,
                              }}
                            >
                              <CheckCircle className="h-14 w-14 text-green-500" />
                            </motion.div>
                            <div>
                              <p className="text-white text-sm font-semibold">
                                Document verified successfully!
                              </p>
                              <p className="text-gray-400 text-xs mt-1">
                                {uploadedFile?.name}
                              </p>
                              <p className="text-gray-500 text-xs">
                                {uploadedFile?.size} • Uploaded and verified
                              </p>
                            </div>
                            <button
                              onClick={handleUploadDifferent}
                              className="flex items-center gap-2 px-4 py-2 bg-[#1a2850] border border-[#2D55FB]/40 text-[#2D55FB] text-xs rounded-lg hover:bg-[#2D55FB]/10 transition-colors mt-1"
                            >
                              <Upload className="h-3 w-3" />
                              Upload Different Document
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Document Guidelines */}
                  <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      <h3 className="text-amber-400 font-semibold text-sm">
                        Document Guidelines
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-amber-400/80 text-xs font-medium mb-2">
                          Required Quality
                        </p>
                        {[
                          "Clear and well-lit photograph",
                          "All four corners visible",
                          "Text and numbers readable",
                        ].map((item) => (
                          <div
                            key={item}
                            className="flex items-start gap-2 mb-1.5"
                          >
                            <CheckCircle className="h-3 w-3 text-gray-500 mt-0.5 shrink-0" />
                            <p className="text-gray-500 text-xs">{item}</p>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-amber-400/80 text-xs font-medium mb-2">
                          Avoid Common Issues
                        </p>
                        {[
                          "Blurry or tilted images",
                          "Shadows covering text",
                          "Partial or cropped document",
                        ].map((item) => (
                          <div
                            key={item}
                            className="flex items-start gap-2 mb-1.5"
                          >
                            <AlertTriangle className="h-3 w-3 text-amber-500/60 mt-0.5 shrink-0" />
                            <p className="text-gray-500 text-xs">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Next Button */}
                  <div className="flex justify-center">
                    <motion.button
                      onClick={() =>
                        uploadStatus === "verified" && setCurrentStep("selfie")
                      }
                      disabled={uploadStatus !== "verified"}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${uploadStatus === "verified" ? "bg-[#2D55FB] text-white hover:bg-[#1e3fd4]" : "bg-gray-700 text-gray-400 cursor-not-allowed"}`}
                      whileHover={
                        uploadStatus === "verified" ? { scale: 1.02 } : {}
                      }
                      whileTap={
                        uploadStatus === "verified" ? { scale: 0.98 } : {}
                      }
                    >
                      Next: Selfie Verification →
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="selfie"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Title */}
                  <div className="text-center mb-6">
                    <h1 className="text-white text-2xl sm:text-3xl font-bold mb-2">
                      Selfie Capture
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base">
                      Please take a clear selfie to verify your identity
                    </p>
                  </div>

                  {/* Camera Card */}
                  <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/10 shadow-2xl mb-4">
                    <h2 className="text-white font-semibold text-sm sm:text-base mb-1">
                      Selfie Verification
                    </h2>
                    <p className="text-gray-500 text-xs mb-4">
                      Position your face in the center of the frame
                    </p>

                    <div className="border-2 border-dashed border-gray-700 rounded-xl p-10 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-24 h-24 rounded-full bg-[#1a2850] border-2 border-[#2D55FB]/40 flex items-center justify-center">
                          <Camera className="h-10 w-10 text-[#2D55FB]" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">
                            Enable camera to take selfie
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            Ensure good lighting and a clear background
                          </p>
                        </div>
                        <motion.button
                          className="flex items-center gap-2 px-5 py-2.5 bg-[#2D55FB] text-white text-sm rounded-lg hover:bg-[#1e3fd4] transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Camera className="h-4 w-4" />
                          Open Camera
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Selfie Guidelines */}
                  <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      <h3 className="text-amber-400 font-semibold text-sm">
                        Selfie Guidelines
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-amber-400/80 text-xs font-medium mb-2">
                          Required
                        </p>
                        {[
                          "Face clearly visible",
                          "Good lighting",
                          "Neutral expression",
                        ].map((item) => (
                          <div
                            key={item}
                            className="flex items-start gap-2 mb-1.5"
                          >
                            <CheckCircle className="h-3 w-3 text-gray-500 mt-0.5 shrink-0" />
                            <p className="text-gray-500 text-xs">{item}</p>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-amber-400/80 text-xs font-medium mb-2">
                          Avoid
                        </p>
                        {[
                          "Wearing sunglasses",
                          "Low light conditions",
                          "Face partially covered",
                        ].map((item) => (
                          <div
                            key={item}
                            className="flex items-start gap-2 mb-1.5"
                          >
                            <AlertTriangle className="h-3 w-3 text-amber-500/60 mt-0.5 shrink-0" />
                            <p className="text-gray-500 text-xs">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCurrentStep("document")}
                      className="flex items-center gap-2 px-4 py-2.5 border border-gray-600 text-gray-400 text-sm rounded-lg hover:border-gray-500 hover:text-gray-300 transition-colors"
                    >
                      ← Back
                    </button>
                    <motion.button
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#2D55FB] text-white rounded-lg font-medium text-sm hover:bg-[#1e3fd4] transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Complete Verification →
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default IdentityVerification;
