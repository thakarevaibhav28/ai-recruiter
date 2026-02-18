import React from "react";
import { CheckCircle, LogOut } from "lucide-react";
import { motion } from "framer-motion";

const AssessmentCompleted: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => {
  return (
    <div className="min-h-screen bg-[#050A24] bg-[radial-gradient(circle_at_70%_20%,rgba(45,85,251,0.3),transparent_50%),radial-gradient(circle_at_20%_80%,rgba(45,85,251,0.2),transparent_50%)] flex items-center justify-center relative overflow-hidden">
      <motion.div className="absolute -top-20 -right-20 w-[200px] h-[200px] bg-[#2D55FB] rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ x: [0,30,-20,0], y: [0,-50,20,0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute -bottom-20 -left-20 w-[200px] h-[200px] bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ x: [0,-40,30,0], y: [0,40,-30,0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }} />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center mb-6"
        >
          <CheckCircle className="h-10 w-10 text-green-400" />
        </motion.div>

        <motion.h1
          className="text-white text-3xl sm:text-4xl font-bold mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Thank You !
        </motion.h1>

        <motion.p
          className="text-green-400 text-base sm:text-lg font-medium mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
        >
          Assessment Completed Successfully
        </motion.p>

        <motion.button
          onClick={onLogout}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#2D55FB] hover:bg-[#1e3fd4] text-white font-medium rounded-lg transition-colors"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </motion.button>
      </div>
    </div>
  );
};

export default AssessmentCompleted;