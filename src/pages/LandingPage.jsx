import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  Calendar, 
  BarChart3, 
  Plus,
  Menu,
  X,
  User,
  LogIn,
  LogOut,
  FileText,
  Bell,
  ArrowRight,
  Users,
  Shield,
  Smartphone
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const userTools = [
    {
      icon: <QrCode className="w-6 h-6" />,
      title: "My QR Code",
      description: "Access your personal QR code for attendance",
      link: "/qr-code",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "My Attendance",
      description: "View your attendance history and records",
      link: "/attendance",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Upcoming Events",
      description: "See list of upcoming events and meetings",
      link: "/notices",
      color: "from-purple-500 to-purple-600"
    }
  ];

  const adminTools = [
    {
      icon: <QrCode className="w-6 h-6" />,
      title: "Scan QR Code",
      description: "Scan student QR codes to mark attendance",
      link: "/scan",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Plus className="w-6 h-6" />,
      title: "Create New Event",
      description: "Schedule new events and meetings",
      link: "/create-event",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "View Attendance Sheet",
      description: "Access attendance reports and analytics",
      link: "/attendance-report",
      color: "from-purple-500 to-purple-600"
    }
  ];

  const features = [
    {
      icon: <QrCode className="w-8 h-8" />,
      title: "QR Code Attendance",
      description: "Quick and secure attendance marking using unique QR codes for each student"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Student Management",
      description: "Comprehensive student database with trade-wise organization"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Event & Meeting Tracking",
      description: "Manage both events and TNP meetings with detailed scheduling"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Attendance Analytics",
      description: "Detailed reports and analytics for attendance monitoring"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Mobile Friendly",
      description: "Access the system from any device with responsive design"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Reliable",
      description: "Advanced security measures to protect student data"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isMenuOpen ? 0 : '-100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 md:hidden"
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
      
              <span className="text-lg font-bold text-gray-900">RollCall</span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Sidebar Navigation */}
          <div className="flex-1 p-4">
            <div className="space-y-4">
              <Link 
                to="/" 
                className="flex items-center space-x-3 p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-5 h-5 bg-blue-600 rounded-sm"></div>
                <span className="font-medium">Home</span>
              </Link>
              
              <Link 
                to="/notices" 
                className="flex items-center space-x-3 p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Bell className="w-5 h-5" />
                <span className="font-medium">Notices</span>
              </Link>

              {user ? (
                <>
                  <Link 
                    to="/profile" 
                    className="flex items-center space-x-3 p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Profile</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="flex items-center space-x-3 p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="w-5 h-5" />
                    <span className="font-medium">Login</span>
                  </Link>
                  
                  <Link 
                    to="/signup" 
                    className="flex items-center space-x-3 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Sign Up</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500">
                QR Attendance System
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Version 1.0
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white border-b border-gray-200 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              
              <span className="text-lg sm:text-xl font-bold text-gray-900">RollCall</span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link to="/notices" className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-1">
                <Bell className="w-4 h-4" />
                <span>Notices</span>
              </Link>
              {user ? (
                <>
                  <Link to="/profile" className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600 transition-colors flex items-center space-x-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-1">
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                  <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600 transition-colors p-2"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6"
            >
              Modern QR-Based
              <span className="block text-blue-700">Attendance System</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4"
            >
              Streamline your college TNP department's attendance tracking with our advanced QR code system. 
              Manage events, meetings, and student attendance with ease and precision.
            </motion.p>

            {!user && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4"
              >
                <Link to="/signup" className="w-full sm:w-auto bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link to="/login" className="w-full sm:w-auto border-2 border-blue-600 text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 text-center">
                  Login
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Tools Section - Only show if user is logged in */}
      {user && (
        <section className="py-8 sm:py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 sm:mb-10"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Welcome back, {user.name}!
              </h2>
              <p className="mt-2 text-gray-600">
                Quick access to your tools.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(user.role === 'admin' ? adminTools : userTools).map((tool, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors"
                >
                  <Link to={tool.link} className="flex items-start">
                    <div className="w-10 h-10 mr-3 bg-blue-600 rounded-md flex items-center justify-center text-white">
                      {tool.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{tool.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{tool.description}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our System?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Experience the future of attendance management with cutting-edge features designed for modern educational institutions.
            </p>
          </motion.div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-start border border-gray-200 bg-white rounded-md p-4"
              >
                <div className="w-10 h-10 mr-3 bg-blue-600 rounded-md flex items-center justify-center text-white">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Simple three-step process to revolutionize your attendance management
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Student Registration",
                description: "Students register with their details and receive a unique QR code"
              },
              {
                step: "02",
                title: "QR Code Scanning",
                description: "Admins scan student QR codes during events and meetings"
              },
              {
                step: "03",
                title: "Attendance Tracking",
                description: "Real-time attendance records and detailed reports generated"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="text-center border border-gray-200 rounded-md p-6"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6">{item.step}</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 px-4">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Attendance System?
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Join hundreds of educational institutions already using our QR-based attendance system
            </p>
            {!user ? (
              <Link to="/signup" className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center space-x-2">
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            ) : (
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center space-x-2">
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-lg sm:text-xl font-bold">RollCall</span>
              </div>
              <p className="text-sm sm:text-base text-gray-400">
                Modern attendance management system for educational institutions.
              </p>
            </div>
            
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/notices" className="hover:text-white transition-colors">Notices</Link></li>
                <li><Link to="/attendance" className="hover:text-white transition-colors">My Attendance</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Account</h3>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link to="/profile" className="hover:text-white transition-colors">Profile</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-sm sm:text-base text-gray-400">
            <p>&copy; 2025 RollCall All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
