// import React, { useState, useRef, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   ArrowLeft,
//   Upload,
//   Camera,
//   CheckCircle,
//   AlertTriangle,
//   User,
//   FileImage,
//   RefreshCw,
//   Shield,
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { userService } from "../../services/service/userService";
// import toast from "react-hot-toast";

// type Step = "document" | "selfie";
// type UploadStatus = "idle" | "uploading" | "verified" | "error";
// type CameraStatus = "idle" | "active" | "processing" | "completed";

// const IdentityVerification: React.FC = () => {
//   const navigate = useNavigate();
// const interviewId = sessionStorage.getItem("interviewId");
//   // Step management
//   const [currentStep, setCurrentStep] = useState<Step>("document");

//   // Document upload states
//   const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
//   const [uploadedFile, setUploadedFile] = useState<{
//     name: string;
//     size: string;
//     file: File;
//   } | null>(null);
//   const [isDragOver, setIsDragOver] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // Selfie capture states
//   const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
//   const [capturedImage, setCapturedImage] = useState<string | null>(null);
//   const [scanLinePos, setScanLinePos] = useState(0);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const streamRef = useRef<MediaStream | null>(null);
//   const animFrameRef = useRef<number | null>(null);
//   const scanRef = useRef({ pos: 0, dir: 1 });

//   // Get user ID from session storage
//   const getInterviewId = () => {
//     const id = sessionStorage.getItem("interviewId");
//     return id ? id : null;
//   };

//   const formatFileSize = (bytes: number) => {
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
//   };

//   const handleFile = async (file: File) => {
//     // Validate file type
//     const validTypes = [
//       "image/jpeg",
//       "image/png",
//       "image/jpg",
//       "application/pdf",
//     ];
//     if (!validTypes.includes(file.type)) {
//       toast.error("Invalid file type. Please upload JPG, PNG, or PDF");
//       return;
//     }

//     // Validate file size (5MB)
//     if (file.size > 5 * 1024 * 1024) {
//       toast.error("File size must be less than 5MB");
//       return;
//     }

//     setUploadStatus("uploading");
//     setUploadedFile({
//       name: file.name,
//       size: formatFileSize(file.size),
//       file: file,
//     });

//     try {
//       const userId = getInterviewId();
//       if (!userId) {
//         toast.error("User not authenticated");
//         setUploadStatus("error");
//         return;
//       }

//       // Call adharVerification service
//       const response = await userService.adharVerification(userId, file);

//       console.log(response);
//       if (response.status === 200 || response.data.success) {
//         setUploadStatus("verified");
//         toast.success("Aadhaar verified successfully!");
//       } else {
//         setUploadStatus("error");
//         toast.error("Verification failed. Please try again.");
//       }
//     } catch (error: any) {
//       console.error("Aadhaar verification error:", error);
//       setUploadStatus("error");

//       const errorMessage =
//         error.response?.data?.message ||
//         "Verification failed. Please try again.";
//       toast.error(errorMessage);
//     }
//   };

//   const handleDrop = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragOver(false);
//     const file = e.dataTransfer.files[0];
//     if (file) handleFile(file);
//   }, []);

//   const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) handleFile(file);
//   };

//   const handleUploadDifferent = () => {
//     setUploadStatus("idle");
//     setUploadedFile(null);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   // Selfie capture functions
//   const stopScan = () => {
//     if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
//   };

//   const startScanAnimation = () => {
//     const animate = () => {
//       scanRef.current.pos += scanRef.current.dir * 1.5;
//       if (scanRef.current.pos >= 100) scanRef.current.dir = -1;
//       if (scanRef.current.pos <= 0) scanRef.current.dir = 1;
//       setScanLinePos(scanRef.current.pos);
//       animFrameRef.current = requestAnimationFrame(animate);
//     };
//     animFrameRef.current = requestAnimationFrame(animate);
//   };

//   const captureFrame = useCallback((): string | null => {
//     if (videoRef.current && canvasRef.current) {
//       const canvas = canvasRef.current;
//       const video = videoRef.current;
//       canvas.width = video.videoWidth || 480;
//       canvas.height = video.videoHeight || 360;
//       const ctx = canvas.getContext("2d");
//       if (ctx) {
//         ctx.drawImage(video, 0, 0);
//         return canvas.toDataURL("image/jpeg", 0.85);
//       }
//     }
//     return null;
//   }, []);

//   const startCamera = useCallback(async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: "user" },
//       });
//       streamRef.current = stream;
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         await videoRef.current.play();
//       }
//       setCameraStatus("active");

//       // Auto-capture after 2.5 seconds
//       setTimeout(() => {
//         const img = captureFrame();
//         if (img) setCapturedImage(img);
//         if (streamRef.current) {
//           streamRef.current.getTracks().forEach((t) => t.stop());
//         }
//         // start processing state and animation
//         setCameraStatus("processing");
//         scanRef.current = { pos: 0, dir: 1 };
//         startScanAnimation();

//         // send captured image to backend as soon as it's available
//         (async () => {
//           try {
//             if (!img) return;
//             // convert dataURL to Blob -> File
//             const blob = await (await fetch(img)).blob();
//             const file = new File([blob], "selfie.jpg", { type: blob.type || "image/jpeg" });
//             const userId = getInterviewId();
//             if (!userId) {
//               toast.error("User not authenticated");
//               return;
//             }
//             const response = await userService.selfieVerification(userId, file);
//             console.log("selfie upload response:", response);
//             if (response && (response.status === 200 || response.data?.success)) {
//               // success handled by existing completion flow
//             } else {
//               toast.error("Selfie upload failed. Please try again.");
//             }
//           } catch (error) {
//             console.error("Selfie upload error:", error);
//             toast.error("Selfie upload failed. Please try again.");
//           }
//         })();

//         // Complete after processing
//         setTimeout(() => {
//           stopScan();
//           setCameraStatus("completed");
//           toast.success("Selfie captured successfully!");
//         }, 3000);
//       }, 2500);
//     } catch (error) {
//       console.error("Camera error:", error);
//       toast.error("Failed to access camera");
//       setCameraStatus("idle");
//     }
//   }, [captureFrame]);

//   const handleRetake = () => {
//     setCapturedImage(null);
//     setCameraStatus("idle");
//     setScanLinePos(0);
//     stopScan();
//   };

//   const handleBack = () => {
//     navigate(-1);
//   };

//   const handleComplete = () => {
//     // Navigate to next page
//    navigate(`/user/${interviewId}/interview-instruction`, { replace: true });
//   };

//   // Cleanup on unmount
//   React.useEffect(() => {
//     return () => {
//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach((t) => t.stop());
//       }
//       stopScan();
//     };
//   }, []);

//   return (
//     <div className="min-h-screen relative overflow-hidden bg-[#050A24] bg-[radial-gradient(circle_at_100%_0%,rgba(45,85,251,0.45),transparent_50%),radial-gradient(circle_at_0%_100%,rgba(45,85,251,0.35),transparent_50%)]">
//       {/* Gradient orbs */}
//       <motion.div
//         className="absolute -top-20 -right-20 w-[200px] h-[200px] bg-[#2D55FB] rounded-full mix-blend-multiply filter blur-3xl opacity-30"
//         animate={{
//           x: [0, 30, -20, 0],
//           y: [0, -50, 20, 0],
//           scale: [1, 1.1, 0.9, 1],
//         }}
//         transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//       />
//       <motion.div
//         className="absolute -bottom-20 -left-20 w-[200px] h-[200px] bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
//         animate={{
//           x: [0, -40, 30, 0],
//           y: [0, 40, -30, 0],
//           scale: [1, 0.9, 1.1, 1],
//         }}
//         transition={{
//           duration: 10,
//           repeat: Infinity,
//           ease: "easeInOut",
//           delay: 2,
//         }}
//       />

//       <canvas ref={canvasRef} className="hidden" />

//       <div className="relative z-10 min-h-screen">
//         {/* Header */}
//         <div className="flex items-center justify-between p-4 sm:p-4 md:p-4 bg-[#0a1342]/30 backdrop-blur-sm">
//           <button
//             onClick={handleBack}
//             className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
//           >
//             <ArrowLeft className="h-5 w-5" />
//             <span className="text-sm sm:text-base">Identity Verification</span>
//           </button>
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
//               <User className="h-5 w-5 text-white" />
//             </div>
//           </div>
//         </div>

//         {/* Step Indicator */}
//         <div className="flex items-center justify-center gap-6 pt-6 pb-4 px-4">
//           {/* Step 1 */}
//           <div className="flex items-center gap-2">
//             <div
//               className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
//                 uploadStatus === "verified"
//                   ? "bg-green-500 text-white"
//                   : currentStep === "document"
//                     ? "bg-[#2D55FB] text-white"
//                     : "bg-[#2D55FB] text-white"
//               }`}
//             >
//               {uploadStatus === "verified" ? (
//                 <CheckCircle className="h-5 w-5" />
//               ) : (
//                 "1"
//               )}
//             </div>
//             <div>
//               <p
//                 className={`text-xs sm:text-sm font-semibold ${
//                   uploadStatus === "verified"
//                     ? "text-green-400"
//                     : currentStep === "document"
//                       ? "text-[#2D55FB]"
//                       : "text-[#2D55FB]"
//                 }`}
//               >
//                 Document Upload
//               </p>
//               <p className="text-gray-500 text-xs">
//                 {uploadStatus === "verified"
//                   ? "Completed"
//                   : "Identity verification"}
//               </p>
//             </div>
//           </div>

//           {/* Connector */}
//           <div className="flex-1 max-w-16 h-px bg-gray-700 relative">
//             <motion.div
//               className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-[#2D55FB]"
//               initial={{ width: "0%" }}
//               animate={{
//                 width:
//                   uploadStatus === "verified" && currentStep === "selfie"
//                     ? "100%"
//                     : "0%",
//               }}
//               transition={{ duration: 0.5 }}
//             />
//           </div>

//           {/* Step 2 */}
//           <div className="flex items-center gap-2">
//             <div
//               className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
//                 cameraStatus === "completed"
//                   ? "bg-green-500 text-white"
//                   : currentStep === "selfie"
//                     ? "bg-[#2D55FB] text-white"
//                     : "bg-[#1a2850] text-gray-400 border border-gray-600"
//               }`}
//             >
//               {cameraStatus === "completed" ? (
//                 <CheckCircle className="h-5 w-5" />
//               ) : (
//                 "2"
//               )}
//             </div>
//             <div>
//               <p
//                 className={`text-xs sm:text-sm font-semibold ${
//                   cameraStatus === "completed"
//                     ? "text-green-400"
//                     : currentStep === "selfie"
//                       ? "text-[#2D55FB]"
//                       : "text-gray-400"
//                 }`}
//               >
//                 Selfie Capture
//               </p>
//               <p className="text-gray-500 text-xs">
//                 {cameraStatus === "completed"
//                   ? "Completed"
//                   : "Identity verification"}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="flex items-start justify-center px-4 sm:px-6 md:px-8 py-6">
//           <motion.div
//             className="w-full max-w-xl"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//           >
//             <AnimatePresence mode="wait">
//               {currentStep === "document" ? (
//                 <motion.div
//                   key="document"
//                   className="w-full max-w-2xl"
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -20 }}
//                   transition={{ duration: 0.4 }}
//                 >
//                   {/* Title */}
//                   <div className="text-center mb-6">
//                     <h1 className="text-white text-2xl sm:text-3xl font-bold mb-2">
//                       Document Verification
//                     </h1>
//                     <p className="text-gray-400 text-sm sm:text-base">
//                       Please upload a clear photo of your Aadhaar card for
//                       secure identity verification
//                     </p>
//                   </div>

//                   {/* Upload Card */}
//                   <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/10 shadow-2xl mb-4">
//                     <h2 className="text-white font-semibold text-sm sm:text-base mb-1">
//                       Upload Aadhaar Card
//                     </h2>
//                     <p className="text-gray-500 text-xs mb-4">
//                       Accepted formats: JPG, PNG, PDF • Maximum size: 5MB •
//                       Ensure all corners are visible
//                     </p>

//                     {/* Drop Zone */}
//                     <AnimatePresence mode="wait">
//                       {uploadStatus === "idle" ||
//                       uploadStatus === "uploading" ? (
//                         <motion.div
//                           key="dropzone"
//                           className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${isDragOver ? "border-[#2D55FB] bg-[#2D55FB]/10" : "border-gray-700 hover:border-gray-600"}`}
//                           onDragOver={(e) => {
//                             e.preventDefault();
//                             setIsDragOver(true);
//                           }}
//                           onDragLeave={() => setIsDragOver(false)}
//                           onDrop={handleDrop}
//                           onClick={() => fileInputRef.current?.click()}
//                           initial={{ opacity: 0 }}
//                           animate={{ opacity: 1 }}
//                           exit={{ opacity: 0 }}
//                         >
//                           <input
//                             ref={fileInputRef}
//                             type="file"
//                             accept=".jpg,.jpeg,.png,.pdf"
//                             className="hidden"
//                             onChange={handleFileInput}
//                           />

//                           {uploadStatus === "uploading" ? (
//                             <div className="flex flex-col items-center gap-3">
//                               <motion.div
//                                 animate={{ rotate: 360 }}
//                                 transition={{
//                                   duration: 1,
//                                   repeat: Infinity,
//                                   ease: "linear",
//                                 }}
//                               >
//                                 <RefreshCw className="h-10 w-10 text-[#2D55FB]" />
//                               </motion.div>
//                               <p className="text-white text-sm font-medium">
//                                 Verifying document...
//                               </p>
//                               <p className="text-gray-400 text-xs">
//                                 {uploadedFile?.name}
//                               </p>
//                             </div>
//                           ) : (
//                             <div className="flex flex-col items-center gap-3">
//                               <div className="w-14 h-14 rounded-xl bg-[#1a2850] flex items-center justify-center">
//                                 <FileImage className="h-7 w-7 text-[#2D55FB]" />
//                               </div>
//                               <div>
//                                 <p className="text-white text-sm font-medium">
//                                   Drag and drop your Aadhaar card here
//                                 </p>
//                                 <p className="text-gray-500 text-xs mt-1">
//                                   or click to select from your device
//                                 </p>
//                               </div>
//                               <button className="flex items-center gap-2 px-4 py-2 bg-[#1a2850] border border-[#2D55FB]/40 text-[#2D55FB] text-sm rounded-lg hover:bg-[#2D55FB]/10 transition-colors">
//                                 <Upload className="h-4 w-4" />
//                                 Choose File
//                               </button>
//                             </div>
//                           )}
//                         </motion.div>
//                       ) : uploadStatus === "verified" ? (
//                         <motion.div
//                           key="verified"
//                           className="border-2 border-green-500/40 rounded-xl p-8 text-center bg-green-500/5"
//                           initial={{ opacity: 0, scale: 0.95 }}
//                           animate={{ opacity: 1, scale: 1 }}
//                           exit={{ opacity: 0 }}
//                           transition={{ duration: 0.4 }}
//                         >
//                           <div className="flex flex-col items-center gap-3">
//                             <motion.div
//                               initial={{ scale: 0 }}
//                               animate={{ scale: 1 }}
//                               transition={{
//                                 type: "spring",
//                                 stiffness: 200,
//                                 delay: 0.1,
//                               }}
//                             >
//                               <CheckCircle className="h-14 w-14 text-green-500" />
//                             </motion.div>
//                             <div>
//                               <p className="text-white text-sm font-semibold">
//                                 Document verified successfully!
//                               </p>
//                               <p className="text-gray-400 text-xs mt-1">
//                                 {uploadedFile?.name}
//                               </p>
//                               <p className="text-gray-500 text-xs">
//                                 {uploadedFile?.size} • Uploaded and verified
//                               </p>
//                             </div>
//                             <button
//                               onClick={handleUploadDifferent}
//                               className="flex items-center gap-2 px-4 py-2 bg-[#1a2850] border border-[#2D55FB]/40 text-[#2D55FB] text-xs rounded-lg hover:bg-[#2D55FB]/10 transition-colors mt-1"
//                             >
//                               <Upload className="h-3 w-3" />
//                               Upload Different Document
//                             </button>
//                           </div>
//                         </motion.div>
//                       ) : (
//                         <motion.div
//                           key="error"
//                           className="border-2 border-red-500/40 rounded-xl p-8 text-center bg-red-500/5"
//                           initial={{ opacity: 0, scale: 0.95 }}
//                           animate={{ opacity: 1, scale: 1 }}
//                           exit={{ opacity: 0 }}
//                         >
//                           <div className="flex flex-col items-center gap-3">
//                             <AlertTriangle className="h-14 w-14 text-red-500" />
//                             <div>
//                               <p className="text-white text-sm font-semibold">
//                                 Verification failed
//                               </p>
//                               <p className="text-gray-400 text-xs mt-1">
//                                 Please try uploading again
//                               </p>
//                             </div>
//                             <button
//                               onClick={handleUploadDifferent}
//                               className="flex items-center gap-2 px-4 py-2 bg-[#1a2850] border border-[#2D55FB]/40 text-[#2D55FB] text-xs rounded-lg hover:bg-[#2D55FB]/10 transition-colors mt-1"
//                             >
//                               <Upload className="h-3 w-3" />
//                               Try Again
//                             </button>
//                           </div>
//                         </motion.div>
//                       )}
//                     </AnimatePresence>
//                   </div>

//                   {/* Document Guidelines */}
//                   <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 mb-6">
//                     <div className="flex items-center gap-2 mb-4">
//                       <AlertTriangle className="h-4 w-4 text-amber-400" />
//                       <h3 className="text-amber-400 font-semibold text-sm">
//                         Document Guidelines
//                       </h3>
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <p className="text-amber-400/80 text-xs font-medium mb-2">
//                           Required Quality
//                         </p>
//                         {[
//                           "Clear and well-lit photograph",
//                           "All four corners visible",
//                           "Text and numbers readable",
//                         ].map((item) => (
//                           <div
//                             key={item}
//                             className="flex items-start gap-2 mb-1.5"
//                           >
//                             <CheckCircle className="h-3 w-3 text-gray-500 mt-0.5 shrink-0" />
//                             <p className="text-gray-500 text-xs">{item}</p>
//                           </div>
//                         ))}
//                       </div>
//                       <div>
//                         <p className="text-amber-400/80 text-xs font-medium mb-2">
//                           Avoid Common Issues
//                         </p>
//                         {[
//                           "Blurry or tilted images",
//                           "Shadows covering text",
//                           "Partial or cropped document",
//                         ].map((item) => (
//                           <div
//                             key={item}
//                             className="flex items-start gap-2 mb-1.5"
//                           >
//                             <AlertTriangle className="h-3 w-3 text-amber-500/60 mt-0.5 shrink-0" />
//                             <p className="text-gray-500 text-xs">{item}</p>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Next Button */}
//                   <div className="flex justify-center">
//                     <motion.button
//                       onClick={() =>
//                         uploadStatus === "verified" && setCurrentStep("selfie")
//                       }
//                       disabled={uploadStatus !== "verified"}
//                       className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${uploadStatus === "verified" ? "bg-[#2D55FB] text-white hover:bg-[#1e3fd4]" : "bg-gray-700 text-gray-400 cursor-not-allowed"}`}
//                       whileHover={
//                         uploadStatus === "verified" ? { scale: 1.02 } : {}
//                       }
//                       whileTap={
//                         uploadStatus === "verified" ? { scale: 0.98 } : {}
//                       }
//                     >
//                       Next: Selfie Verification →
//                     </motion.button>
//                   </div>
//                 </motion.div>
//               ) : (
//                 <motion.div
//                   key="selfie"
//                   initial={{ opacity: 0, x: 30 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -30 }}
//                   transition={{ duration: 0.4 }}
//                 >
//                   {/* Title */}
//                   <div className="text-center mb-6">
//                     <h1 className="text-white text-2xl sm:text-3xl font-bold mb-2">
//                       Selfie Verification
//                     </h1>
//                     <p className="text-gray-400 text-sm sm:text-base">
//                       Take a clear selfie to verify your identity and ensure
//                       secure assessment access
//                     </p>
//                   </div>

//                   {/* Camera Card */}
//                   <div className="bg-[#0d1535]/80 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/10 shadow-2xl mb-4">
//                     <div className="flex items-center justify-between mb-1">
//                       <h2 className="text-white font-semibold text-sm sm:text-base">
//                         Live Camera Feed
//                       </h2>
//                       {cameraStatus === "processing" && (
//                         <motion.div
//                           className="flex items-center gap-2 text-[#2D55FB] text-sm"
//                           initial={{ opacity: 0 }}
//                           animate={{ opacity: 1 }}
//                         >
//                           <span className="font-medium">AI Processing</span>
//                           <motion.div
//                             animate={{ rotate: 360 }}
//                             transition={{
//                               duration: 1,
//                               repeat: Infinity,
//                               ease: "linear",
//                             }}
//                           >
//                             <RefreshCw className="h-4 w-4" />
//                           </motion.div>
//                         </motion.div>
//                       )}
//                       {cameraStatus === "completed" && (
//                         <motion.div
//                           className="flex items-center gap-2 text-green-400 text-sm"
//                           initial={{ opacity: 0, scale: 0.8 }}
//                           animate={{ opacity: 1, scale: 1 }}
//                           transition={{ type: "spring", stiffness: 200 }}
//                         >
//                           <span className="font-semibold text-base">
//                             Perfect
//                           </span>
//                           <CheckCircle className="h-5 w-5" />
//                         </motion.div>
//                       )}
//                     </div>
//                     <p className="text-gray-500 text-xs mb-4">
//                       Position your face in the center of the frame and ensure
//                       good lighting
//                     </p>

//                     {/* Viewport */}
//                     <div
//                       className="relative bg-[#0a0f1e] rounded-xl overflow-hidden flex items-center justify-center"
//                       style={{ minHeight: "260px" }}
//                     >
//                       {/* Live video */}
//                       <video
//                         ref={videoRef}
//                         muted
//                         playsInline
//                         className={`w-full object-cover rounded-xl ${cameraStatus === "active" ? "block" : "hidden"}`}
//                         style={{ maxHeight: "280px", minHeight: "260px" }}
//                       />

//                       {/* Captured photo */}
//                       {(cameraStatus === "processing" ||
//                         cameraStatus === "completed") &&
//                         capturedImage && (
//                           <motion.img
//                             src={capturedImage}
//                             alt="Captured selfie"
//                             className="w-full object-cover rounded-xl"
//                             style={{ maxHeight: "280px", minHeight: "260px" }}
//                             initial={{ opacity: 0 }}
//                             animate={{ opacity: 1 }}
//                             transition={{ duration: 0.4 }}
//                           />
//                         )}

//                       {/* No-camera placeholder */}
//                       {(cameraStatus === "processing" ||
//                         cameraStatus === "completed") &&
//                         !capturedImage && (
//                           <motion.div
//                             className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#1a2540] to-[#0d1535]"
//                             initial={{ opacity: 0 }}
//                             animate={{ opacity: 1 }}
//                           >
//                             <div className="w-28 h-28 rounded-full bg-[#2a3a60] border-2 border-[#2D55FB]/40 flex items-center justify-center">
//                               <User className="h-16 w-16 text-[#2D55FB]/60" />
//                             </div>
//                           </motion.div>
//                         )}

//                       {/* Idle */}
//                       {cameraStatus === "idle" && (
//                         <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
//                           <div className="absolute inset-6 pointer-events-none">
//                             <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#2D55FB] rounded-tl-lg" />
//                             <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#2D55FB] rounded-tr-lg" />
//                             <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#2D55FB] rounded-bl-lg" />
//                             <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#2D55FB] rounded-br-lg" />
//                           </div>
//                           <Camera className="h-14 w-14 text-gray-600" />
//                           <motion.button
//                             onClick={startCamera}
//                             className="flex items-center gap-2 px-5 py-2.5 bg-[#2D55FB] text-white text-sm rounded-lg hover:bg-[#1e3fd4] transition-colors shadow-lg"
//                             whileHover={{ scale: 1.03 }}
//                             whileTap={{ scale: 0.97 }}
//                           >
//                             <Camera className="h-4 w-4" />
//                             Start Camera
//                           </motion.button>
//                         </div>
//                       )}

//                       {/* Corner brackets (non-idle) */}
//                       {cameraStatus !== "idle" && (
//                         <div className="absolute inset-0 pointer-events-none z-10">
//                           <div className="absolute inset-6">
//                             <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[#2D55FB]" />
//                             <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-[#2D55FB]" />
//                             <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-[#2D55FB]" />
//                             <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-[#2D55FB]" />
//                           </div>
//                         </div>
//                       )}

//                       {/* Scan line */}
//                       {cameraStatus === "processing" && (
//                         <div
//                           className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-[#2D55FB] to-transparent pointer-events-none z-20"
//                           style={{ top: `${scanLinePos}%` }}
//                         />
//                       )}

//                       {/* Active indicator */}
//                       {cameraStatus === "active" && (
//                         <motion.div
//                           className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10"
//                           initial={{ opacity: 0, y: 6 }}
//                           animate={{ opacity: 1, y: 0 }}
//                         >
//                           <div className="flex items-center gap-2 px-4 py-1.5 bg-black/60 backdrop-blur rounded-full text-white text-xs">
//                             <motion.div
//                               className="w-2 h-2 rounded-full bg-green-400"
//                               animate={{ opacity: [1, 0.3, 1] }}
//                               transition={{ duration: 1.2, repeat: Infinity }}
//                             />
//                             Preparing to capture...
//                           </div>
//                         </motion.div>
//                       )}

//                       {/* Retake */}
//                       {cameraStatus === "completed" && (
//                         <motion.div
//                           className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10"
//                           initial={{ opacity: 0 }}
//                           animate={{ opacity: 1 }}
//                         >
//                           <button
//                             onClick={handleRetake}
//                             className="flex items-center gap-1.5 px-4 py-1.5 bg-black/60 backdrop-blur border border-white/20 text-white text-xs rounded-full hover:bg-black/80 transition-colors"
//                           >
//                             <RefreshCw className="h-3 w-3" />
//                             Retake
//                           </button>
//                         </motion.div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Guidelines */}
//                   <div className="bg-[#0d1535]/80 backdrop-blur-xl rounded-2xl p-5 border border-white/10 mb-6">
//                     <div className="flex items-center gap-2 mb-4">
//                       <Shield className="h-4 w-4 text-[#2D55FB]" />
//                       <h3 className="text-[#2D55FB] font-semibold text-sm">
//                         Selfie Guidelines
//                       </h3>
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <p className="text-[#2D55FB]/80 text-xs font-medium mb-2">
//                           For Best Results
//                         </p>
//                         {[
//                           "Face clearly visible",
//                           "Good lighting",
//                           "Neutral expression",
//                         ].map((item) => (
//                           <div
//                             key={item}
//                             className="flex items-start gap-2 mb-1.5"
//                           >
//                             <CheckCircle className="h-3 w-3 text-gray-500 mt-0.5 shrink-0" />
//                             <p className="text-gray-500 text-xs">{item}</p>
//                           </div>
//                         ))}
//                       </div>
//                       <div>
//                         <p className="text-amber-400/80 text-xs font-medium mb-2">
//                           Avoid Common Issues
//                         </p>
//                         {[
//                           "Wearing sunglasses",
//                           "Low light conditions",
//                           "Face partially covered",
//                         ].map((item) => (
//                           <div
//                             key={item}
//                             className="flex items-start gap-2 mb-1.5"
//                           >
//                             <AlertTriangle className="h-3 w-3 text-amber-500/60 mt-0.5 shrink-0" />
//                             <p className="text-gray-500 text-xs">{item}</p>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Navigation */}
//                   <div className="flex items-center justify-between">
//                     <button
//                       onClick={() => setCurrentStep("document")}
//                       className="flex items-center gap-2 px-4 py-2.5 border border-gray-600 text-gray-400 text-sm rounded-lg hover:border-gray-500 hover:text-gray-300 transition-colors"
//                     >
//                       ← Back
//                     </button>
//                     <motion.button
//                       onClick={handleComplete}
//                       disabled={cameraStatus !== "completed"}
//                       className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
//                         cameraStatus === "completed"
//                           ? "bg-[#2D55FB] text-white hover:bg-[#1e3fd4]"
//                           : "bg-gray-700 text-gray-400 cursor-not-allowed"
//                       }`}
//                       whileHover={
//                         cameraStatus === "completed" ? { scale: 1.02 } : {}
//                       }
//                       whileTap={
//                         cameraStatus === "completed" ? { scale: 0.98 } : {}
//                       }
//                     >
//                       Complete Verification →
//                     </motion.button>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default IdentityVerification;

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Camera,
  CheckCircle,
  AlertTriangle,
  User,
  RefreshCw,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { userService } from "../../services/service/userService";
import toast from "react-hot-toast";
import Tesseract from "tesseract.js";
import * as faceapi from "@vladmandic/face-api";

// ─── face-api.js model source ─────────────────────────────────────────────────
// Option A (CDN – no setup):
const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";
// Option B (self-hosted – copy /node_modules/@vladmandic/face-api/model → /public/models):
// const MODEL_URL = "/models";

let faceModelsLoaded = false;
const loadFaceModels = async () => {
  if (faceModelsLoaded) return;
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
  ]);
  faceModelsLoaded = true;
};

// ─── Aadhaar OCR validation (tesseract.js) ────────────────────────────────────

const fileToDataUrl = (file: File): Promise<string | null> =>
  new Promise((resolve) => {
    if (file.type === "application/pdf") return resolve(null);
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) ?? null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });

/**
 * Runs OCR on the uploaded image and checks for Aadhaar-specific markers:
 *   Group 1 – Keywords : "AADHAAR" / "AADHAR" / "UIDAI" / "UID"
 *   Group 2 – 12-digit number: #### #### #### (spaces/hyphens OK, partial masking OK)
 *   Group 3 – "GOVERNMENT OF INDIA" or "UIDAI"
 * Requires ≥ 2 of 3 groups to pass.
 * PDFs are forwarded to the backend without OCR (cannot render PDF pixels client-side).
 */
const validateAadhaarWithOCR = async (
  file: File
): Promise<{ isValid: boolean; reason: string }> => {
  if (file.type === "application/pdf") {
    return { isValid: true, reason: "PDF forwarded to backend" };
  }

  const dataUrl = await fileToDataUrl(file);
  if (!dataUrl) return { isValid: false, reason: "Could not read the file" };

  try {
    const { data: { text } } = await Tesseract.recognize(dataUrl, "eng", {
      logger: () => {}, // suppress verbose progress logs
    });

    const upper = text.toUpperCase();

    const hasAadhaarKeyword = /AADHAAR|AADHAR|UIDAI/.test(upper) || /\bUID\b/.test(upper);
    const has12Digit =
      /\d{4}[\s\-]?\d{4}[\s\-]?\d{4}/.test(upper) ||
      /[X\d]{4}[\s\-]?[X\d]{4}[\s\-]?[X\d]{4}/i.test(upper);
    const hasGovt = /GOVERNMENT\s+OF\s+INDIA|GOVT\.?\s+OF\s+INDIA/.test(upper);

    const passed = [hasAadhaarKeyword, has12Digit, hasGovt].filter(Boolean).length;

    if (passed >= 2) {
      return { isValid: true, reason: "Aadhaar card detected via OCR" };
    }

    const missing: string[] = [];
    if (!hasAadhaarKeyword) missing.push("Aadhaar/UIDAI branding");
    if (!has12Digit) missing.push("12-digit Aadhaar number");
    if (!hasGovt) missing.push('"Government of India" text');

    return {
      isValid: false,
      reason: `Could not confirm this is an Aadhaar card. Missing: ${missing.join(
        ", "
      )}. Please upload a clear, unobstructed photo of your Aadhaar card.`,
    };
  } catch (err) {
    console.error("Tesseract OCR error:", err);
    return { isValid: true, reason: "OCR check skipped due to an error" }; // fail-open
  }
};

// ─── Face validation (face-api.js) ───────────────────────────────────────────

/**
 * Uses TinyFaceDetector + 68-point landmarks to validate the captured selfie:
 *   1. Exactly ONE face detected with confidence ≥ 0.55
 *   2. Both eye landmark groups present (proxy for eyes open/visible)
 *   3. Face roughly front-facing (nose tip near jaw midpoint, offset < 28 %)
 */
const validateFaceWithLibrary = async (
  imageDataUrl: string
): Promise<{ isValid: boolean; reason: string }> => {
  try {
    await loadFaceModels();

    const img = document.createElement("img");
    img.src = imageDataUrl;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Image load failed"));
    });

    const detections = await faceapi
      .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.45 }))
      .withFaceLandmarks(true);

    if (detections.length === 0) {
      return {
        isValid: false,
        reason: "No face detected. Please ensure your face is clearly visible and well-lit.",
      };
    }
    if (detections.length > 1) {
      return {
        isValid: false,
        reason: "Multiple faces detected. Please make sure only you are in the frame.",
      };
    }

    const { detection, landmarks } = detections[0];

    if (detection.score < 0.55) {
      return {
        isValid: false,
        reason: "Face not clearly detected. Please improve lighting and ensure your face fills the frame.",
      };
    }

    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    if (!leftEye?.length || !rightEye?.length) {
      return {
        isValid: false,
        reason: "Eyes not clearly visible. Please remove sunglasses or any obstruction and try again.",
      };
    }

    // Front-facing check via nose/jaw geometry
    const nose = landmarks.getNose();
    const jaw = landmarks.getJawOutline();
    if (nose?.length && jaw?.length) {
      const jawLeft = jaw[0].x;
      const jawRight = jaw[jaw.length - 1].x;
      const jawWidth = jawRight - jawLeft;
      if (jawWidth > 0) {
        const jawCenter = (jawLeft + jawRight) / 2;
        const noseTip = nose[nose.length - 1].x;
        const offset = Math.abs(noseTip - jawCenter) / jawWidth;
        if (offset > 0.28) {
          return {
            isValid: false,
            reason: "Please face the camera directly. Your face appears to be turned to the side.",
          };
        }
      }
    }

    return { isValid: true, reason: "Face verified successfully" };
  } catch (err) {
    console.error("face-api.js error:", err);
    return { isValid: true, reason: "Face check skipped due to an error" }; // fail-open
  }
};

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = "document" | "selfie";
type UploadStatus = "idle" | "uploading" | "verified" | "error";
type CameraStatus = "idle" | "active" | "validating" | "processing" | "completed";

// ─── Component ────────────────────────────────────────────────────────────────
const IdentityVerification: React.FC = () => {
  const navigate = useNavigate();
  const interviewId = sessionStorage.getItem("interviewId");

  const [currentStep, setCurrentStep] = useState<Step>("document");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; file: File } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanLinePos, setScanLinePos] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const scanRef = useRef({ pos: 0, dir: 1 });

  // Pre-load face models on mount so they're ready when camera starts
  useEffect(() => {
    loadFaceModels().catch(console.error);
  }, []);

  const getInterviewId = () => sessionStorage.getItem("interviewId") ?? null;

  const formatFileSize = (bytes: number) =>
    bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(2)} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

  // ── Document upload ──────────────────────────────────────────────────────────

  const handleFile = async (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload JPG, PNG, or PDF");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploadStatus("uploading");
    setUploadedFile({ name: file.name, size: formatFileSize(file.size), file });

    // Step 1 – OCR Aadhaar check
    const ocrResult = await validateAadhaarWithOCR(file);
    if (!ocrResult.isValid) {
      setUploadStatus("error");
      toast.error(ocrResult.reason);
      return;
    }

    // Step 2 – Backend verification
    try {
      const userId = getInterviewId();
      if (!userId) { toast.error("User not authenticated"); setUploadStatus("error"); return; }

      const response = await userService.adharVerification(userId, file);
      if (response.status === 200 || response.data?.success) {
        setUploadStatus("verified");
        toast.success("Aadhaar verified successfully!");
      } else {
        setUploadStatus("error");
        toast.error("Verification failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Aadhaar verification error:", error);
      setUploadStatus("error");
      toast.error(error.response?.data?.message ?? "Verification failed. Please try again.");
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

  // ── Selfie / Camera ──────────────────────────────────────────────────────────

  const stopScan = () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };

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
      if (ctx) { ctx.drawImage(video, 0, 0); return canvas.toDataURL("image/jpeg", 0.85); }
    }
    return null;
  }, []);

  const stopStream = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
  };

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setCameraStatus("active");

      setTimeout(async () => {
        const img = captureFrame();
        stopStream();

        if (!img) { toast.error("Could not capture image. Please try again."); setCameraStatus("idle"); return; }

        setCapturedImage(img);
        setCameraStatus("validating");

        // face-api.js face validation
        const faceResult = await validateFaceWithLibrary(img);
        if (!faceResult.isValid) {
          toast.error(faceResult.reason);
          setCapturedImage(null);
          setCameraStatus("idle");
          return;
        }

        // Passed — start scan animation
        setCameraStatus("processing");
        scanRef.current = { pos: 0, dir: 1 };
        startScanAnimation();

        // Upload selfie to backend in background
        (async () => {
          try {
            const blob = await (await fetch(img)).blob();
            const file = new File([blob], "selfie.jpg", { type: blob.type || "image/jpeg" });
            const userId = getInterviewId();
            if (!userId) { toast.error("User not authenticated"); return; }
            await userService.selfieVerification(userId, file);
          } catch (error) {
            console.error("Selfie upload error:", error);
            toast.error("Selfie upload failed. Please try again.");
          }
        })();

        setTimeout(() => { stopScan(); setCameraStatus("completed"); toast.success("Selfie captured successfully!"); }, 3000);
      }, 2500);
    } catch (error) {
      console.error("Camera error:", error);
      toast.error("Failed to access camera");
      setCameraStatus("idle");
    }
  }, [captureFrame]);

  const handleRetake = () => { setCapturedImage(null); setCameraStatus("idle"); setScanLinePos(0); stopScan(); };
  const handleBack = () => navigate(-1);
  const handleComplete = () => navigate(`/user/${interviewId}/interview-instruction`, { replace: true });

  useEffect(() => {
    return () => { stopStream(); stopScan(); };
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050A24] bg-[radial-gradient(circle_at_100%_0%,rgba(45,85,251,0.45),transparent_50%),radial-gradient(circle_at_0%_100%,rgba(45,85,251,0.35),transparent_50%)]">
      <motion.div className="absolute -top-20 -right-20 w-[200px] h-[200px] bg-[#2D55FB] rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{ x: [0,30,-20,0], y: [0,-50,20,0], scale: [1,1.1,0.9,1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute -bottom-20 -left-20 w-[200px] h-[200px] bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{ x: [0,-40,30,0], y: [0,40,-30,0], scale: [1,0.9,1.1,1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }} />
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[#0a1342]/30 backdrop-blur-sm">
          <button onClick={handleBack} className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors">
            <ArrowLeft className="h-5 w-5" /><span className="text-sm sm:text-base">Identity Verification</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 pt-6 pb-2 px-4">
          <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
              {uploadStatus === "verified" ? (
                <motion.div key="d1" className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                  <CheckCircle className="h-5 w-5 text-white" />
                </motion.div>
              ) : (
                <motion.div key="p1" className="w-9 h-9 rounded-full bg-[#2D55FB] flex items-center justify-center text-white text-sm font-bold">1</motion.div>
              )}
            </AnimatePresence>
            <div>
              <p className={`text-xs sm:text-sm font-semibold ${uploadStatus === "verified" ? "text-green-400" : "text-[#2D55FB]"}`}>Document Upload</p>
              <p className="text-gray-500 text-xs">{uploadStatus === "verified" ? "Completed" : "Identity verification"}</p>
            </div>
          </div>

          <div className="w-12 sm:w-20 h-px bg-gray-700 relative overflow-hidden">
            <motion.div className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-[#2D55FB]"
              initial={{ width: "0%" }} animate={{ width: uploadStatus === "verified" ? "100%" : "0%" }} transition={{ duration: 0.8 }} />
          </div>

          <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
              {cameraStatus === "completed" ? (
                <motion.div key="d2" className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                  <CheckCircle className="h-5 w-5 text-white" />
                </motion.div>
              ) : (
                <motion.div key="p2" className="w-9 h-9 rounded-full bg-[#2D55FB] flex items-center justify-center text-white text-sm font-bold">2</motion.div>
              )}
            </AnimatePresence>
            <div>
              <p className={`text-xs sm:text-sm font-semibold ${cameraStatus === "completed" ? "text-green-400" : "text-[#2D55FB]"}`}>Selfie Capture</p>
              <p className="text-gray-500 text-xs">{cameraStatus === "completed" ? "Completed" : "Identity verification"}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex items-start justify-center px-4 sm:px-6 md:px-8 py-6">
          <motion.div className="w-full max-w-xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

            {currentStep === "document" ? (
              <>
                <div className="text-center mb-6">
                  <h1 className="text-white text-2xl sm:text-3xl font-bold mb-2">Document Verification</h1>
                  <p className="text-gray-400 text-sm sm:text-base">Please upload a clear photo of your Aadhaar card for secure identity verification</p>
                </div>

                <div className="bg-[#0d1535]/80 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/10 shadow-2xl mb-4">
                  <h2 className="text-white font-semibold text-sm sm:text-base mb-1">Upload Aadhaar Card</h2>
                  <p className="text-gray-500 text-xs mb-4">Accepted formats: JPG, PNG, PDF • Maximum size: 5MB • Ensure all corners are visible</p>
                  <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={handleFileInput} />

                  <AnimatePresence mode="wait">
                    {uploadStatus === "idle" || uploadStatus === "uploading" ? (
                      <motion.div key="dz"
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragOver ? "border-[#2D55FB] bg-[#2D55FB]/10" : "border-gray-600 hover:border-gray-500"} ${uploadStatus === "uploading" ? "pointer-events-none" : ""}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)} onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {uploadStatus === "uploading" ? (
                          <div className="flex flex-col items-center gap-3">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                              <RefreshCw className="h-8 w-8 text-[#2D55FB]" />
                            </motion.div>
                            <p className="text-gray-400 text-sm">Verifying document...</p>
                            <p className="text-gray-600 text-xs">{uploadedFile?.name}</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3">
                            <Upload className="h-10 w-10 text-gray-500" />
                            <div>
                              <p className="text-gray-300 text-sm font-medium">Drag and drop your Aadhaar card here</p>
                              <p className="text-gray-500 text-xs mt-1">or click to select from your device</p>
                            </div>
                            <button className="px-4 py-2 bg-[#2D55FB]/20 border border-[#2D55FB]/40 text-[#2D55FB] text-xs rounded-lg hover:bg-[#2D55FB]/30 transition-colors">Choose File</button>
                          </div>
                        )}
                      </motion.div>
                    ) : uploadStatus === "verified" ? (
                      <motion.div key="ok" className="border border-green-500/30 bg-green-500/10 rounded-xl p-6 text-center"
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-3" />
                        <p className="text-green-400 font-semibold text-sm mb-1">Document verified successfully!</p>
                        <p className="text-gray-500 text-xs mb-1">{uploadedFile?.name}</p>
                        <p className="text-gray-600 text-xs mb-4">{uploadedFile?.size} • Uploaded and verified</p>
                        <button onClick={handleUploadDifferent} className="text-xs text-gray-400 hover:text-gray-300 underline transition-colors">Upload Different Document</button>
                      </motion.div>
                    ) : (
                      <motion.div key="err" className="border border-red-500/30 bg-red-500/10 rounded-xl p-6 text-center"
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-3" />
                        <p className="text-red-400 font-semibold text-sm mb-1">Verification failed</p>
                        <p className="text-gray-500 text-xs mb-4">Please try uploading again</p>
                        <button onClick={handleUploadDifferent} className="px-4 py-2 bg-[#2D55FB]/20 border border-[#2D55FB]/40 text-[#2D55FB] text-xs rounded-lg hover:bg-[#2D55FB]/30 transition-colors">Try Again</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="bg-[#0d1535]/80 backdrop-blur-xl rounded-2xl p-5 border border-white/10 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-4 w-4 text-[#2D55FB]" />
                    <h3 className="text-[#2D55FB] font-semibold text-sm">Document Guidelines</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[#2D55FB]/80 text-xs font-medium mb-2">Required Quality</p>
                      {["Clear and well-lit photograph", "All four corners visible", "Text and numbers readable"].map((item) => (
                        <div key={item} className="flex items-start gap-2 mb-1.5">
                          <CheckCircle className="h-3 w-3 text-gray-500 mt-0.5 shrink-0" />
                          <p className="text-gray-500 text-xs">{item}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-amber-400/80 text-xs font-medium mb-2">Avoid Common Issues</p>
                      {["Blurry or tilted images", "Shadows covering text", "Partial or cropped document"].map((item) => (
                        <div key={item} className="flex items-start gap-2 mb-1.5">
                          <AlertTriangle className="h-3 w-3 text-amber-500/60 mt-0.5 shrink-0" />
                          <p className="text-gray-500 text-xs">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <motion.button onClick={() => uploadStatus === "verified" && setCurrentStep("selfie")}
                    disabled={uploadStatus !== "verified"}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${uploadStatus === "verified" ? "bg-[#2D55FB] text-white hover:bg-[#1e3fd4]" : "bg-gray-700 text-gray-400 cursor-not-allowed"}`}
                    whileHover={uploadStatus === "verified" ? { scale: 1.02 } : {}}
                    whileTap={uploadStatus === "verified" ? { scale: 0.98 } : {}}>
                    Next: Selfie Verification →
                  </motion.button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h1 className="text-white text-2xl sm:text-3xl font-bold mb-2">Selfie Verification</h1>
                  <p className="text-gray-400 text-sm sm:text-base">Take a clear selfie to verify your identity and ensure secure assessment access</p>
                </div>

                <div className="bg-[#0d1535]/80 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/10 shadow-2xl mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-white font-semibold text-sm sm:text-base">Live Camera Feed</h2>
                    {cameraStatus === "validating" && (
                      <motion.div className="flex items-center gap-2 text-amber-400 text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <span className="font-medium">Verifying Face</span>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><RefreshCw className="h-4 w-4" /></motion.div>
                      </motion.div>
                    )}
                    {cameraStatus === "processing" && (
                      <motion.div className="flex items-center gap-2 text-[#2D55FB] text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <span className="font-medium">AI Processing</span>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><RefreshCw className="h-4 w-4" /></motion.div>
                      </motion.div>
                    )}
                    {cameraStatus === "completed" && (
                      <motion.div className="flex items-center gap-2 text-green-400 text-sm" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                        <span className="font-semibold text-base">Perfect</span><CheckCircle className="h-5 w-5" />
                      </motion.div>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs mb-4">Position your face in the center of the frame and ensure good lighting</p>

                  <div className="relative bg-[#0a0f1e] rounded-xl overflow-hidden flex items-center justify-center" style={{ minHeight: "260px" }}>
                    <video ref={videoRef} muted playsInline
                      className={`w-full object-cover rounded-xl ${cameraStatus === "active" ? "block" : "hidden"}`}
                      style={{ maxHeight: "280px", minHeight: "260px" }} />

                    {(cameraStatus === "validating" || cameraStatus === "processing" || cameraStatus === "completed") && capturedImage && (
                      <motion.img src={capturedImage} alt="Captured selfie" className="w-full object-cover rounded-xl"
                        style={{ maxHeight: "280px", minHeight: "260px" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} />
                    )}

                    {(cameraStatus === "validating" || cameraStatus === "processing" || cameraStatus === "completed") && !capturedImage && (
                      <motion.div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#1a2540] to-[#0d1535]"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="w-28 h-28 rounded-full bg-[#2a3a60] border-2 border-[#2D55FB]/40 flex items-center justify-center">
                          <User className="h-16 w-16 text-[#2D55FB]/60" />
                        </div>
                      </motion.div>
                    )}

                    {cameraStatus === "idle" && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <div className="absolute inset-6 pointer-events-none">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#2D55FB] rounded-tl-lg" />
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#2D55FB] rounded-tr-lg" />
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#2D55FB] rounded-bl-lg" />
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#2D55FB] rounded-br-lg" />
                        </div>
                        <Camera className="h-14 w-14 text-gray-600" />
                        <motion.button onClick={startCamera}
                          className="flex items-center gap-2 px-5 py-2.5 bg-[#2D55FB] text-white text-sm rounded-lg hover:bg-[#1e3fd4] transition-colors shadow-lg"
                          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                          <Camera className="h-4 w-4" />Start Camera
                        </motion.button>
                      </div>
                    )}

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

                    {cameraStatus === "processing" && (
                      <div className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-[#2D55FB] to-transparent pointer-events-none z-20"
                        style={{ top: `${scanLinePos}%` }} />
                    )}

                    {cameraStatus === "active" && (
                      <motion.div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-black/60 backdrop-blur rounded-full text-white text-xs">
                          <motion.div className="w-2 h-2 rounded-full bg-green-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                          Preparing to capture...
                        </div>
                      </motion.div>
                    )}

                    {cameraStatus === "validating" && (
                      <motion.div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-black/60 backdrop-blur rounded-full text-amber-400 text-xs">
                          <motion.div className="w-2 h-2 rounded-full bg-amber-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                          Verifying face...
                        </div>
                      </motion.div>
                    )}

                    {cameraStatus === "completed" && (
                      <motion.div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <button onClick={handleRetake}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-black/60 backdrop-blur border border-white/20 text-white text-xs rounded-full hover:bg-black/80 transition-colors">
                          <RefreshCw className="h-3 w-3" />Retake
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="bg-[#0d1535]/80 backdrop-blur-xl rounded-2xl p-5 border border-white/10 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-4 w-4 text-[#2D55FB]" />
                    <h3 className="text-[#2D55FB] font-semibold text-sm">Selfie Guidelines</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[#2D55FB]/80 text-xs font-medium mb-2">For Best Results</p>
                      {["Face clearly visible", "Good lighting", "Neutral expression"].map((item) => (
                        <div key={item} className="flex items-start gap-2 mb-1.5">
                          <CheckCircle className="h-3 w-3 text-gray-500 mt-0.5 shrink-0" />
                          <p className="text-gray-500 text-xs">{item}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-amber-400/80 text-xs font-medium mb-2">Avoid Common Issues</p>
                      {["Wearing sunglasses", "Low light conditions", "Face partially covered"].map((item) => (
                        <div key={item} className="flex items-start gap-2 mb-1.5">
                          <AlertTriangle className="h-3 w-3 text-amber-500/60 mt-0.5 shrink-0" />
                          <p className="text-gray-500 text-xs">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button onClick={() => setCurrentStep("document")}
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-600 text-gray-400 text-sm rounded-lg hover:border-gray-500 hover:text-gray-300 transition-colors">
                    ← Back
                  </button>
                  <motion.button onClick={handleComplete} disabled={cameraStatus !== "completed"}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${cameraStatus === "completed" ? "bg-[#2D55FB] text-white hover:bg-[#1e3fd4]" : "bg-[#2D55FB]/40 text-white/50 cursor-not-allowed"}`}
                    whileHover={cameraStatus === "completed" ? { scale: 1.02 } : {}}
                    whileTap={cameraStatus === "completed" ? { scale: 0.98 } : {}}>
                    Complete Verification →
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default IdentityVerification;