import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  Download, 
  ArrowLeft, 
  User, 
  Share2,
  CheckCircle,
  Smartphone,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import QRCode from 'react-qr-code';
import toast from 'react-hot-toast';
import { qrAPI } from '../services/api';

const QRCodePage = ({ user, onLogout }) => {
  const [qrValue, setQrValue] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [shared, setShared] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserQRCode();
    }
  }, [user]);

  const fetchUserQRCode = async () => {
    try {
      setLoading(true);
      const response = await qrAPI.getUserQR(user._id || user.id);
      
      if (response.qrCodeData) {
        setQrValue(response.qrCodeData);
        setQrCodeUrl(response.qrCodeUrl);
      } else {
        // Fallback to generating QR code locally
        const qrData = {
          userId: user._id || user.id,
          rollNo: user.roll_no,
          name: user.name,
          trade: user.trade,
          timestamp: new Date().toISOString(),
          type: 'user_attendance'
        };
        setQrValue(JSON.stringify(qrData));
        toast.error('Failed to fetch QR code from server, using local fallback');
      }
    } catch (error) {
      console.error('Fetch QR code error:', error);
      // Fallback to generating QR code locally
      const qrData = {
        userId: user._id || user.id,
        rollNo: user.roll_no,
        name: user.name,
        trade: user.trade,
        timestamp: new Date().toISOString(),
        type: 'user_attendance'
      };
      setQrValue(JSON.stringify(qrData));
      toast.error('Failed to fetch QR code from server, using local fallback');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `qr-code-${user?.name || 'user'}-${user?.roll_no || 'user'}.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast.success('QR Code downloaded successfully!');
    }
  };

  const handleShare = async () => {
    try {
      const canvas = document.querySelector('canvas');
      let shareData = {
        title: 'My Attendance QR Code',
        text: `QR Code for ${user?.name} - Roll Number: ${user?.roll_no}`,
      };

      // Try to share the QR code image if canvas is available
      if (canvas && navigator.canShare && navigator.canShare({ files: [] })) {
        canvas.toBlob(async (blob) => {
          const file = new File([blob], `qr-code-${user?.name || 'user'}-${user?.roll_no || 'user'}.png`, { type: 'image/png' });
          shareData.files = [file];
          
          try {
            await navigator.share(shareData);
            setShared(true);
            toast.success('QR Code shared successfully!');
            setTimeout(() => setShared(false), 2000);
          } catch (error) {
            // Fallback to text sharing
            await navigator.share({
              title: shareData.title,
              text: `${shareData.text}\n\nQR Code Data: ${qrValue}`,
            });
            setShared(true);
            toast.success('QR Code data shared successfully!');
            setTimeout(() => setShared(false), 2000);
          }
        });
      } else if (navigator.share) {
        // Share text data if file sharing is not supported
        await navigator.share({
          title: shareData.title,
          text: `${shareData.text}\n\nQR Code Data: ${qrValue}`,
        });
        setShared(true);
        toast.success('QR Code data shared successfully!');
        setTimeout(() => setShared(false), 2000);
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(qrValue);
        setShared(true);
        toast.success('QR Code data copied to clipboard!');
        setTimeout(() => setShared(false), 2000);
      }
    } catch (error) {
      console.error('Share failed:', error);
      // Final fallback - copy to clipboard
      try {
        await navigator.clipboard.writeText(qrValue);
        setShared(true);
        toast.success('QR Code data copied to clipboard!');
        setTimeout(() => setShared(false), 2000);
      } catch (clipboardError) {
        toast.error('Failed to share QR code data');
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your QR code.</p>
          <Link to="/login" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center space-x-2">
                
                <h1 className="text-xl font-bold text-gray-900">My QR Code</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-md border border-gray-200 p-6 mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h2>
              <p className="text-gray-600 mb-1">Roll Number: {user.roll_no}</p>
              <p className="text-gray-600">{user.trade}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center text-green-600 text-sm mb-2">
                <CheckCircle className="w-4 h-4 mr-1" />
                Active QR Code
              </div>
              <p className="text-xs text-gray-500">Generated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </motion.div>

        {/* QR Code Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-md border border-gray-200 p-8"
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Attendance QR Code</h3>
              
              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-md border-2 border-gray-200">
                  {qrValue ? (
                    <QRCode
                      value={qrValue}
                      size={200}
                      level="H"
                    />
                  ) : (
                    <div className="w-[200px] h-[200px] bg-gray-100 rounded-lg flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={handleShare}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    shared 
                      ? 'bg-green-600 text-white' 
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {shared ? <CheckCircle className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  <span>{shared ? 'Shared!' : 'Share'}</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* How to Use */}
            <div className="bg-white rounded-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Smartphone className="w-5 h-5 mr-2 text-blue-600" />
                How to Use Your QR Code
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Present this QR code to the admin during events and meetings</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>The admin will scan this code to mark your attendance</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>You can download and save this QR code on your phone</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Use the share button to send your QR code to other devices</p>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-blue-50 rounded-md border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                Important Notes
              </h3>
              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>This QR code is unique to your account and contains your personal information</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Attendance can only be marked by authorized administrators</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default QRCodePage;
