import { motion } from 'framer-motion';
import { Loader2, QrCode, Users, Calendar } from 'lucide-react';

const LoadingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {/* Logo and Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <QrCode className="w-16 h-16 text-blue-600" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full"></div>
              </motion.div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            QR Attendance System
          </h1>
          <p className="text-lg text-gray-600">
            TNP Department - College Events & Meetings
          </p>
        </motion.div>

        {/* Loading Spinner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-8"
        >
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </motion.div>

        {/* Feature Icons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex justify-center space-x-8"
        >
          <div className="flex flex-col items-center">
            <Users className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm text-gray-600">Student Management</span>
          </div>
          <div className="flex flex-col items-center">
            <QrCode className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm text-gray-600">QR Scanning</span>
          </div>
          <div className="flex flex-col items-center">
            <Calendar className="w-8 h-8 text-purple-600 mb-2" />
            <span className="text-sm text-gray-600">Event Tracking</span>
          </div>
        </motion.div>

        {/* Loading Progress */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 1.5, duration: 2 }}
          className="mt-8 bg-gray-200 rounded-full h-2 max-w-md mx-auto"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 1.5, duration: 2 }}
            className="bg-blue-600 h-2 rounded-full"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingPage;
