import React, { useState, useEffect } from "react";
import { MonitorCheck, X } from "lucide-react";
import { motion } from "framer-motion";

const SessionEnded: React.FC = () => {
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Prevent Browser Back/Forward Navigation ──
    useEffect(() => {
     
  
      // Push a state to prevent back navigation
      window.history.pushState(null, "", window.location.href);
  
      const handlePopState = () => {
        // Push state again to prevent actual navigation
        window.history.pushState(null, "", window.location.href);
      };
  
      window.addEventListener("popstate", handlePopState);
  
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }, []);

  return (
    <div className="min-h-screen bg-[#050A24] bg-[radial-gradient(circle_at_70%_20%,rgba(45,85,251,0.25),transparent_50%),radial-gradient(circle_at_20%_80%,rgba(45,85,251,0.15),transparent_50%)] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <motion.div className="absolute -top-20 -right-20 w-[200px] h-[200px] bg-[#2D55FB] rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ x: [0,30,-20,0], y: [0,-50,20,0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute -bottom-20 -left-20 w-[200px] h-[200px] bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ x: [0,-40,30,0], y: [0,40,-30,0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }} />

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
        {/* Title */}
        <motion.h1
          className="text-white text-2xl sm:text-3xl font-bold text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Session Ended Successfully
        </motion.h1>

        {/* Main Card */}
        <motion.div
          className="w-full bg-[#0d1535]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sm:p-8 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <h2 className="text-white text-xl sm:text-2xl font-bold text-center mb-2">You've Been Logged Out</h2>
          <p className="text-gray-400 text-sm text-center mb-6">
            Your session has been securely terminated. All your responses has been saved.
          </p>

          {/* Secure Logout Box */}
          <div className="bg-[#0a0f2e]/80 rounded-xl border border-[#2D55FB]/20 p-4 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <MonitorCheck className="h-5 w-5 text-[#2D55FB]" />
              <span className="text-[#2D55FB] font-semibold text-sm">Secure Logout Complete</span>
            </div>
            <ul className="space-y-1.5">
              {[
                "Your responses has been successfully submitted",
                "Session data has been cleared from this device",
                "All security protocol have been followed.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#2D55FB] text-xs mt-0.5">•</span>
                  <span className="text-[#2D55FB]/80 text-xs sm:text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Close Window Button */}
          <motion.button
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#2D55FB]/40 text-white text-sm font-medium hover:bg-[#2D55FB]/10 transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => window.close()}
          >
            <X className="h-4 w-4" />
            Close Window
          </motion.button>
        </motion.div>

        {/* Countdown Card */}
        <motion.div
          className="w-full bg-[#0d1535]/60 backdrop-blur-xl rounded-xl border border-white/5 px-5 py-3 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-gray-500 text-xs sm:text-sm">
            This windows will automatically close in{" "}
            <span className="text-white font-semibold">{countdown} seconds</span>
            {" "}or close it manually.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SessionEnded;