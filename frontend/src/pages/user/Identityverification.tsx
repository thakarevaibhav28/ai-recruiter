import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Camera,
  CheckCircle,
  AlertTriangle,
  User,
  FileImage,
  RefreshCw,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { userService } from "../../services/service/userService";
import toast from "react-hot-toast";

type Step = "document" | "selfie";
type UploadStatus = "idle" | "uploading" | "verified" | "error";
type CameraStatus = "idle" | "active" | "processing" | "completed";

const IdentityVerification: React.FC = () => {
  const navigate = useNavigate();
const interviewId = sessionStorage.getItem("interviewId");
  // Step management
  const [currentStep, setCurrentStep] = useState<Step>("document");

  // Document upload states
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    file: File;
  } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selfie capture states
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanLinePos, setScanLinePos] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const scanRef = useRef({ pos: 0, dir: 1 });

  // Get user ID from session storage
  const getInterviewId = () => {
    const id = sessionStorage.getItem("interviewId");
    return id ? id : null;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFile = async (file: File) => {
    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload JPG, PNG, or PDF");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploadStatus("uploading");
    setUploadedFile({
      name: file.name,
      size: formatFileSize(file.size),
      file: file,
    });

    try {
      const userId = getInterviewId();
      if (!userId) {
        toast.error("User not authenticated");
        setUploadStatus("error");
        return;
      }

      // Call adharVerification service
      const response = await userService.adharVerification(userId, file);

      console.log(response);
      if (response.status === 200 || response.data.success) {
        setUploadStatus("verified");
        toast.success("Aadhaar verified successfully!");
      } else {
        setUploadStatus("error");
        toast.error("Verification failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Aadhaar verification error:", error);
      setUploadStatus("error");

      const errorMessage =
        error.response?.data?.message ||
        "Verification failed. Please try again.";
      toast.error(errorMessage);
    }
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

  // Selfie capture functions
  const stopScan = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  };

  const startScanAnimation = () => {
    const animate = () => {
      scanRef.current.pos += scanRef.current.dir * 1.5;
      if (scanRef.current.pos >= 100) scanRef.current.dir = -1;
      if (scanRef.current.pos <= 0) scanRef.current.dir = 1;
      setScanLinePos(scanRef.current.pos);
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
  };

  const captureFrame = useCallback((): string | null => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth || 480;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        return canvas.toDataURL("image/jpeg", 0.85);
      }
    }
    return null;
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraStatus("active");

      // Auto-capture after 2.5 seconds
      setTimeout(() => {
        const img = captureFrame();
        if (img) setCapturedImage(img);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }
        // start processing state and animation
        setCameraStatus("processing");
        scanRef.current = { pos: 0, dir: 1 };
        startScanAnimation();

        // send captured image to backend as soon as it's available
        (async () => {
          try {
            if (!img) return;
            // convert dataURL to Blob -> File
            const blob = await (await fetch(img)).blob();
            const file = new File([blob], "selfie.jpg", { type: blob.type || "image/jpeg" });
            const userId = getInterviewId();
            if (!userId) {
              toast.error("User not authenticated");
              return;
            }
            const response = await userService.selfieVerification(userId, file);
            console.log("selfie upload response:", response);
            if (response && (response.status === 200 || response.data?.success)) {
              // success handled by existing completion flow
            } else {
              toast.error("Selfie upload failed. Please try again.");
            }
          } catch (error) {
            console.error("Selfie upload error:", error);
            toast.error("Selfie upload failed. Please try again.");
          }
        })();

        // Complete after processing
        setTimeout(() => {
          stopScan();
          setCameraStatus("completed");
          toast.success("Selfie captured successfully!");
        }, 3000);
      }, 2500);
    } catch (error) {
      console.error("Camera error:", error);
      toast.error("Failed to access camera");
      setCameraStatus("idle");
    }
  }, [captureFrame]);

  const handleRetake = () => {
    setCapturedImage(null);
    setCameraStatus("idle");
    setScanLinePos(0);
    stopScan();
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleComplete = () => {
    // Navigate to next page
   navigate(`/user/${interviewId}/interview-instruction`, { replace: true });
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      stopScan();
    };
  }, []);

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

      <canvas ref={canvasRef} className="hidden" />

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-4 md:p-4 bg-[#0a1342]/30 backdrop-blur-sm">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm sm:text-base">Identity Verification</span>
          </button>
          <div className="flex items-center gap-3">
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
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                uploadStatus === "verified"
                  ? "bg-green-500 text-white"
                  : currentStep === "document"
                    ? "bg-[#2D55FB] text-white"
                    : "bg-[#2D55FB] text-white"
              }`}
            >
              {uploadStatus === "verified" ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                "1"
              )}
            </div>
            <div>
              <p
                className={`text-xs sm:text-sm font-semibold ${
                  uploadStatus === "verified"
                    ? "text-green-400"
                    : currentStep === "document"
                      ? "text-[#2D55FB]"
                      : "text-[#2D55FB]"
                }`}
              >
                Document Upload
              </p>
              <p className="text-gray-500 text-xs">
                {uploadStatus === "verified"
                  ? "Completed"
                  : "Identity verification"}
              </p>
            </div>
          </div>

          {/* Connector */}
          <div className="flex-1 max-w-16 h-px bg-gray-700 relative">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-[#2D55FB]"
              initial={{ width: "0%" }}
              animate={{
                width:
                  uploadStatus === "verified" && currentStep === "selfie"
                    ? "100%"
                    : "0%",
              }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                cameraStatus === "completed"
                  ? "bg-green-500 text-white"
                  : currentStep === "selfie"
                    ? "bg-[#2D55FB] text-white"
                    : "bg-[#1a2850] text-gray-400 border border-gray-600"
              }`}
            >
              {cameraStatus === "completed" ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                "2"
              )}
            </div>
            <div>
              <p
                className={`text-xs sm:text-sm font-semibold ${
                  cameraStatus === "completed"
                    ? "text-green-400"
                    : currentStep === "selfie"
                      ? "text-[#2D55FB]"
                      : "text-gray-400"
                }`}
              >
                Selfie Capture
              </p>
              <p className="text-gray-500 text-xs">
                {cameraStatus === "completed"
                  ? "Completed"
                  : "Identity verification"}
              </p>
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
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
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
                      ) : uploadStatus === "verified" ? (
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
                      ) : (
                        <motion.div
                          key="error"
                          className="border-2 border-red-500/40 rounded-xl p-8 text-center bg-red-500/5"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <div className="flex flex-col items-center gap-3">
                            <AlertTriangle className="h-14 w-14 text-red-500" />
                            <div>
                              <p className="text-white text-sm font-semibold">
                                Verification failed
                              </p>
                              <p className="text-gray-400 text-xs mt-1">
                                Please try uploading again
                              </p>
                            </div>
                            <button
                              onClick={handleUploadDifferent}
                              className="flex items-center gap-2 px-4 py-2 bg-[#1a2850] border border-[#2D55FB]/40 text-[#2D55FB] text-xs rounded-lg hover:bg-[#2D55FB]/10 transition-colors mt-1"
                            >
                              <Upload className="h-3 w-3" />
                              Try Again
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
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Title */}
                  <div className="text-center mb-6">
                    <h1 className="text-white text-2xl sm:text-3xl font-bold mb-2">
                      Selfie Verification
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base">
                      Take a clear selfie to verify your identity and ensure
                      secure assessment access
                    </p>
                  </div>

                  {/* Camera Card */}
                  <div className="bg-[#0d1535]/80 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/10 shadow-2xl mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-white font-semibold text-sm sm:text-base">
                        Live Camera Feed
                      </h2>
                      {cameraStatus === "processing" && (
                        <motion.div
                          className="flex items-center gap-2 text-[#2D55FB] text-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <span className="font-medium">AI Processing</span>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </motion.div>
                        </motion.div>
                      )}
                      {cameraStatus === "completed" && (
                        <motion.div
                          className="flex items-center gap-2 text-green-400 text-sm"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <span className="font-semibold text-base">
                            Perfect
                          </span>
                          <CheckCircle className="h-5 w-5" />
                        </motion.div>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs mb-4">
                      Position your face in the center of the frame and ensure
                      good lighting
                    </p>

                    {/* Viewport */}
                    <div
                      className="relative bg-[#0a0f1e] rounded-xl overflow-hidden flex items-center justify-center"
                      style={{ minHeight: "260px" }}
                    >
                      {/* Live video */}
                      <video
                        ref={videoRef}
                        muted
                        playsInline
                        className={`w-full object-cover rounded-xl ${cameraStatus === "active" ? "block" : "hidden"}`}
                        style={{ maxHeight: "280px", minHeight: "260px" }}
                      />

                      {/* Captured photo */}
                      {(cameraStatus === "processing" ||
                        cameraStatus === "completed") &&
                        capturedImage && (
                          <motion.img
                            src={capturedImage}
                            alt="Captured selfie"
                            className="w-full object-cover rounded-xl"
                            style={{ maxHeight: "280px", minHeight: "260px" }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                          />
                        )}

                      {/* No-camera placeholder */}
                      {(cameraStatus === "processing" ||
                        cameraStatus === "completed") &&
                        !capturedImage && (
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#1a2540] to-[#0d1535]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <div className="w-28 h-28 rounded-full bg-[#2a3a60] border-2 border-[#2D55FB]/40 flex items-center justify-center">
                              <User className="h-16 w-16 text-[#2D55FB]/60" />
                            </div>
                          </motion.div>
                        )}

                      {/* Idle */}
                      {cameraStatus === "idle" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                          <div className="absolute inset-6 pointer-events-none">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#2D55FB] rounded-tl-lg" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#2D55FB] rounded-tr-lg" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#2D55FB] rounded-bl-lg" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#2D55FB] rounded-br-lg" />
                          </div>
                          <Camera className="h-14 w-14 text-gray-600" />
                          <motion.button
                            onClick={startCamera}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#2D55FB] text-white text-sm rounded-lg hover:bg-[#1e3fd4] transition-colors shadow-lg"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <Camera className="h-4 w-4" />
                            Start Camera
                          </motion.button>
                        </div>
                      )}

                      {/* Corner brackets (non-idle) */}
                      {cameraStatus !== "idle" && (
                        <div className="absolute inset-0 pointer-events-none z-10">
                          <div className="absolute inset-6">
                            <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[#2D55FB]" />
                            <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-[#2D55FB]" />
                            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-[#2D55FB]" />
                            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-[#2D55FB]" />
                          </div>
                        </div>
                      )}

                      {/* Scan line */}
                      {cameraStatus === "processing" && (
                        <div
                          className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-[#2D55FB] to-transparent pointer-events-none z-20"
                          style={{ top: `${scanLinePos}%` }}
                        />
                      )}

                      {/* Active indicator */}
                      {cameraStatus === "active" && (
                        <motion.div
                          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="flex items-center gap-2 px-4 py-1.5 bg-black/60 backdrop-blur rounded-full text-white text-xs">
                            <motion.div
                              className="w-2 h-2 rounded-full bg-green-400"
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ duration: 1.2, repeat: Infinity }}
                            />
                            Preparing to capture...
                          </div>
                        </motion.div>
                      )}

                      {/* Retake */}
                      {cameraStatus === "completed" && (
                        <motion.div
                          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <button
                            onClick={handleRetake}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-black/60 backdrop-blur border border-white/20 text-white text-xs rounded-full hover:bg-black/80 transition-colors"
                          >
                            <RefreshCw className="h-3 w-3" />
                            Retake
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Guidelines */}
                  <div className="bg-[#0d1535]/80 backdrop-blur-xl rounded-2xl p-5 border border-white/10 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="h-4 w-4 text-[#2D55FB]" />
                      <h3 className="text-[#2D55FB] font-semibold text-sm">
                        Selfie Guidelines
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[#2D55FB]/80 text-xs font-medium mb-2">
                          For Best Results
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
                          Avoid Common Issues
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
                      onClick={handleComplete}
                      disabled={cameraStatus !== "completed"}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
                        cameraStatus === "completed"
                          ? "bg-[#2D55FB] text-white hover:bg-[#1e3fd4]"
                          : "bg-gray-700 text-gray-400 cursor-not-allowed"
                      }`}
                      whileHover={
                        cameraStatus === "completed" ? { scale: 1.02 } : {}
                      }
                      whileTap={
                        cameraStatus === "completed" ? { scale: 0.98 } : {}
                      }
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
