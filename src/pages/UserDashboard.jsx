import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  TrendingUp,
  BarChart3,
  Users,
  Eye,
  FileText,
  Target,
  QrCode,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  User,
  History,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { eventsAPI, attendanceAPI, noticesAPI } from '../services/api';

const UserDashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({
    totalEventsAttended: 0,
    totalEvents: 0,
    attendanceRate: 0,
    todayAttendance: 0,
    thisWeekAttendance: 0,
    thisMonthAttendance: 0,
    upcomingEvents: 0
  });

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching user dashboard data...');
      console.log('User object:', user);
      
      
      const eventsResponse = await noticesAPI.getUpcomingNotices();
      console.log('Events response:', eventsResponse);
      if (eventsResponse.success) {
        setUpcomingEvents(eventsResponse.events.slice(0, 5));
      }

      
      const userId = user._id || user.id;
      console.log('Using user ID:', userId);
      const attendanceStatsResponse = await attendanceAPI.getUserAttendanceStats(userId);
      console.log('Attendance stats response:', attendanceStatsResponse);
      if (attendanceStatsResponse.success) {
        const stats = attendanceStatsResponse.data;
        setRecentAttendance(stats.recentAttendance || []);
        
        
        setStats({
          totalEventsAttended: stats.overall?.present || 0,
          totalEvents: stats.overall?.total || 0,
          attendanceRate: stats.overall?.total > 0 ? Math.round((stats.overall.present / stats.overall.total) * 100) : 0,
          todayAttendance: stats.today?.present || 0,
          thisWeekAttendance: stats.thisWeek?.present || 0,
          thisMonthAttendance: stats.thisMonth?.present || 0,
          upcomingEvents: eventsResponse.success ? eventsResponse.events.length : 0
        });
      } else {
        const attendanceResponse = await attendanceAPI.getUserAttendance(userId);
        console.log('Fallback attendance response:', attendanceResponse);
        if (attendanceResponse.success) {
          setRecentAttendance(attendanceResponse.attendance.slice(0, 5));
          
          const totalEvents = attendanceResponse.attendance.length;
          const presentCount = attendanceResponse.attendance.filter(a => a.status === 'present').length;
          const attendanceRate = totalEvents > 0 ? Math.round((presentCount / totalEvents) * 100) : 0;
          
          setStats({
            totalEventsAttended: presentCount,
            totalEvents: totalEvents,
            attendanceRate: attendanceRate,
            todayAttendance: 0,
            thisWeekAttendance: 0,
            thisMonthAttendance: 0,
            upcomingEvents: eventsResponse.success ? eventsResponse.events.length : 0
          });
        }
      }
    } catch (error) {
      console.error('Fetch dashboard data error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateConsecutiveAttendance = (attendanceRecords) => {
    
    const sortedRecords = attendanceRecords
      .filter(a => a.status === 'present')
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let consecutive = 0;
    for (let i = 0; i < sortedRecords.length; i++) {
      if (i === 0) {
        consecutive = 1;
        continue;
      }
      
      const currentDate = new Date(sortedRecords[i].date);
      const prevDate = new Date(sortedRecords[i-1].date);
      const diffDays = Math.floor((prevDate - currentDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        consecutive++;
      } else {
        break;
      }
    }
    
    return consecutive;
  };

  const handleLogout = () => {
    onLogout();
    toast.success('Logged out successfully');
  };

  const getStatusIcon = (status) => {
    return status === 'present' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getEventTypeColor = (type) => {
    return type === 'Event' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  const navigationItems = [
    { name: 'Dashboard', icon: Home, href: '/dashboard', current: true },
    { name: 'My QR Code', icon: QrCode, href: '/qr-code', current: false },
    { name: 'My Attendance', icon: BarChart3, href: '/attendance', current: false },
    { name: 'View Notices', icon: Bell, href: '/notices', current: false },
    { name: 'Update Profile', icon: User, href: '/profile', current: false },
    { name: 'Settings', icon: Settings, href: '#', current: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            
            <span className="text-sm font-bold text-gray-900">TNP Student</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-6">
          {/* User Info */}
          <div className="mb-6 p-3 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{user.name.charAt(0)}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">Student</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    item.current
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-0">
        {/* Compact Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Student Dashboard</h1>
              </div>
              
              <div className="hidden lg:flex items-center space-x-3">
                <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                  <Bell className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Compact Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-md border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Events Attended</p>
                  <p className="text-lg font-bold text-gray-900">{stats.totalEventsAttended}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-md border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Attendance Rate</p>
                  <p className="text-lg font-bold text-blue-600">{stats.attendanceRate}%</p>
                </div>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-md border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">This Week</p>
                  <p className="text-lg font-bold text-purple-600">{stats.thisWeekAttendance}</p>
                </div>
                <Target className="w-5 h-5 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-md border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Upcoming</p>
                  <p className="text-lg font-bold text-orange-600">{stats.upcomingEvents}</p>
                </div>
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Events */}
            <div className="lg:col-span-2 bg-white rounded-md border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Upcoming Events</h3>
                  <Link
                    to="/notices"
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    View All →
                  </Link>
                </div>
              </div>
              
              <div className="p-4">
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event._id || event.id} className="flex items-start space-x-4 p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.event_type)}`}>
                            {event.event_type}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-xs text-gray-600 mb-2">{event.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {event.date} • {event.time}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {upcomingEvents.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No upcoming events</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-md border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Link
                    to="/qr-code"
                    className="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <QrCode className="w-4 h-4 mr-2 text-indigo-600" />
                    My QR Code
                  </Link>
                  <Link
                    to="/attendance"
                    className="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <BarChart3 className="w-4 h-4 mr-2 text-green-600" />
                    Attendance History
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <User className="w-4 h-4 mr-2 text-purple-600" />
                    Update Profile
                  </Link>
                  <Link
                    to="/notices"
                    className="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <Bell className="w-4 h-4 mr-2 text-orange-600" />
                    View Notices
                  </Link>
                </div>
              </div>

              {/* Recent Attendance */}
              <div className="bg-white rounded-md border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Attendance</h3>
                <div className="space-y-2">
                  {recentAttendance.map((record) => (
                    <div key={record._id || record.id || `${record.eventName}-${record.date}`} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <div>
                        <p className="text-xs font-medium text-gray-900">{record.eventName || record.event_id?.title}</p>
                        <p className="text-xs text-gray-500">{record.date || record.createdAt}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          {getStatusIcon(record.status)}
                        </div>
                        {record.time && (
                          <p className="text-xs text-gray-500">{record.time}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {recentAttendance.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-xs text-gray-500">No recent attendance records</p>
                  </div>
                )}
              </div>

              

              {/* Tips Section */}
              <div className="bg-white rounded-md border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Tips</h3>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                    <p>Keep your QR code ready for quick scanning</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                    <p>Arrive early to ensure attendance is marked</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                    <p>Regular attendance improves placement chances</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
