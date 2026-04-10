import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  QrCode, 
  BarChart3, 
  Plus, 
  LogOut, 
  Settings, 
  Bell,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  History,
  Target,
  Activity,
  FileText,
  Filter,
  Search,
  Eye,
  Menu,
  X,
  Home,
  UserCheck,
  ClipboardList
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usersAPI, noticesAPI, attendanceAPI, eventsAPI } from '../services/api';
import { use } from 'react';

const AdminDashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalEvents: 0,
    totalEventsUpcoming: 0,
    todayAttendance: 0,
    thisWeekAttendance: 0,
    thisMonthAttendance: 0,
    totalAttendance: 0,
    presentAttendance: 0,
    absentAttendance: 0,
    averageAttendanceRate: 0
  });

  const [events, setEvents] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [recentMarkedNames, setRecentMarkedNames] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [upcount,setUpcount] = useState(0); //this is for upcoming events count
  const [total,setTotal] = useState(0); //this is to count total events;


  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // console.log('Fetching dashboard data...');
      
      // Fetch user statistics
      const usersResponse = await usersAPI.getUserStats();
      // console.log('Users response:', usersResponse);
      if (usersResponse.success) {
        setStats(prevStats => ({
          ...prevStats,
          totalStudents: usersResponse.stats.summary.totalUsers
        }));
      }


      // //fetch event data
      const eventsResponse = await noticesAPI.getUpcomingNotices();
      // console.log('Events response:', eventsResponse);
      if (eventsResponse.success) {
        setEvents(eventsResponse.events.slice(0, 5)); // Show only 5 upcoming events
      }

      let totalUpcoming = 0;
      
      if(eventsResponse.success && Array.isArray(eventsResponse.events)) {
        totalUpcoming = eventsResponse.events.length;
        setUpcount(totalUpcoming);
      }

      // console.log('Total upcoming events:', totalUpcoming);
      setStats(prevStats => ({
          ...prevStats,
          totalEventsUpcoming: totalUpcoming
      }));

      //get all events
      const allEvents = await eventsAPI.getAllEvents();
      if(allEvents){
        // console.log("The event data is as follows:",allEvents);
        const data = allEvents;
        const total = data.count;
        setStats(prevStats => ({
          ...prevStats,
          totalEvents: total
      }));
      }
      else{
        console.log("Error occured");
      }

      

      // Fetch comprehensive attendance statistics
      const attendanceStatsResponse = await attendanceAPI.getAttendanceStats();
      // console.log('Attendance stats response:', attendanceStatsResponse);
      if (attendanceStatsResponse.success) {
        const stats = attendanceStatsResponse.data;
        setRecentAttendance(stats.recentAttendance || []);
        // Compute last 4 names marked by this admin
        try {
          const myId = user._id || user.id;
          const markedByMe = (stats.recentAttendance || [])
            .filter((r) => {
              const verifierId = r?.verified_by?._id || r?.verified_by?.id || r?.verified_by;
              return verifierId && myId && String(verifierId) === String(myId);
            })
            .slice(0, 4)
            .map((r) => r?.user_id?.name || 'Unknown');
          setRecentMarkedNames(markedByMe);
        } catch (e) {
          console.warn('Failed to compute recentMarkedNames', e);
          setRecentMarkedNames([]);
        }
        
        setStats(prevStats => ({
          ...prevStats,
          todayAttendance: stats.today?.present || 0,
          thisWeekAttendance: stats.thisWeek?.present || 0,
          thisMonthAttendance: stats.thisMonth?.present || 0,
          totalAttendance: stats.overall?.total || 0,
          presentAttendance: stats.overall?.present || 0,
          absentAttendance: stats.overall?.absent || 0,
          averageAttendanceRate: stats.overall?.total > 0 ? Math.round((stats.overall.present / stats.overall.total) * 100) : 0
        }));
      } else {
        // Fallback to basic attendance data
        const attendanceResponse = await attendanceAPI.getAttendanceReport({ limit: 5 });
        // console.log('Fallback attendance response:', attendanceResponse);
        if (attendanceResponse.success) {
          setRecentAttendance(attendanceResponse.attendance.slice(0, 5));
          
          if (attendanceResponse.stats) {
            setStats(prevStats => ({
              ...prevStats,
              todayAttendance: attendanceResponse.stats.present || 0,
              thisWeekAttendance: 0,
              thisMonthAttendance: 0,
              totalAttendance: attendanceResponse.stats.total || 0,
              presentAttendance: attendanceResponse.stats.present || 0,
              absentAttendance: attendanceResponse.stats.absent || 0,
              averageAttendanceRate: attendanceResponse.stats.attendanceRate || 0
            }));
          }
        }
      }
    } catch (error) {
      console.error('Fetch dashboard data error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const trades = [
    'All Trades',
    'GCS',
    'GIN',
    'GEC',
    'GME',
    'GEE',
    'GFT',
    'GCT'
  ];

  const [filteredEvents, setFilteredEvents] = useState(events);
  const [searchTerm, setSearchTerm] = useState('');
  const [tradeFilter, setTradeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    filterEvents();
  }, [searchTerm, tradeFilter, statusFilter, events]);

  const filterEvents = () => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (tradeFilter !== 'all') {
      filtered = filtered.filter(event => event.trade === tradeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    setFilteredEvents(filtered);
  };

  const getAttendanceRate = (attendees, total) => {
    return Math.round((attendees / total) * 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'upcoming':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceRateColor = (rate) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleLogout = () => {
    onLogout();
    toast.success('Logged out successfully');
  };

  const navigationItems = [
    { name: 'Dashboard', icon: Home, href: '/admin', current: true },
    { name: 'Manage Teams', icon: Users, href: '/teams', current: false },
    { name: 'Scan QR Code', icon: QrCode, href: '/scan', current: false },
    { name: 'Create Event', icon: Plus, href: '/create-event', current: false },
    { name: 'Attendance Report', icon: BarChart3, href: '/attendance-report', current: false },
    { name: 'Manage Notices', icon: Bell, href: '/notices', current: false },
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
            
            <span className="text-sm font-bold text-gray-900">Admin</span>
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
                <p className="text-xs text-gray-500">Administrator</p>
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
                <h1 className="text-lg font-bold text-gray-900">Admin</h1>
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-md border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Total Students</p>
                  <p className="text-lg font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-md border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Total Events</p>
                  <p className="text-lg font-bold text-gray-900">{stats.totalEvents}</p>
                </div>
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-md border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Upcoming</p>
                  <p className="text-lg font-bold text-gray-900">{stats.totalEventsUpcoming}</p>
                </div>
                <Target className="w-5 h-5 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-md border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Today's Attendance</p>
                  <p className="text-lg font-bold text-gray-900">{stats.todayAttendance}</p>
                </div>
                <QrCode className="w-5 h-5 text-orange-600" />
              </div>
            </div>

            <div className="bg-white rounded-md border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">This Week</p>
                  <p className="text-lg font-bold text-gray-900">{stats.thisWeekAttendance}</p>
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-md border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Avg. Rate</p>
                  <p className="text-lg font-bold text-gray-900">{stats.averageAttendanceRate}%</p>
                </div>
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          {/* Desktop Event Attendance Section - Hidden on Mobile */}
          <div className="hidden lg:block">
            {/* Compact Filters */}
            <div className="bg-white rounded-md border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <select
                  value={tradeFilter}
                  onChange={(e) => setTradeFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {trades.map((trade) => (
                    <option key={trade} value={trade === 'All Trades' ? 'all' : trade}>
                      {trade}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="upcoming">Upcoming</option>
                </select>
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
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Attendees</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {events.map((event) => (
                        <tr key={event._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{event.title}</p>
                              {event.description && (
                                <p className="text-xs text-gray-500 truncate max-w-xs">{event.description}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              event.event_type === 'Event' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {event.event_type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm text-gray-900">{event.date}</p>
                              <p className="text-xs text-gray-500">{event.time}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-900">{event.location}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-gray-900">
                              {event.attendee_count || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-1">
                              <Link
                                to="/scan"
                                className="text-xs text-green-600 hover:text-green-700 font-medium"
                              >
                                Scan QR
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {events.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No upcoming events</p>
                    <Link
                      to="/create-event"
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-2 inline-block"
                    >
                      Create Event →
                    </Link>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-md border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <Link
                      to="/create-event"
                      className="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2 text-indigo-600" />
                      Create Event
                    </Link>
                    <Link
                      to="/scan"
                      className="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <QrCode className="w-4 h-4 mr-2 text-green-600" />
                      Scan QR Code
                    </Link>
                    <Link
                      to="/attendance-report"
                      className="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <BarChart3 className="w-4 h-4 mr-2 text-purple-600" />
                      View Reports
                    </Link>
                    <Link
                      to="/notices"
                      className="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <Bell className="w-4 h-4 mr-2 text-orange-600" />
                      Manage Notices
                    </Link>
                  </div>
                </div>

                {/* Recent Attendance (Last 4 marked by you) */}
                <div className="bg-white rounded-md border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Last 4 Marked (You)</h3>
                  <div className="space-y-2">
                    {recentMarkedNames.length > 0 ? (
                      recentMarkedNames.map((name, idx) => (
                        <div key={`${name}-${idx}`} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <div>
                            <p className="text-xs font-medium text-gray-900">{name}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">No recent attendance marked by you</p>
                    )}
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="bg-white rounded-md border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Summary</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Events:</span>
                      <span className="font-medium">{events.filter(e => e.status === 'active').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Attendance:</span>
                      <span className="font-medium">{stats.averageAttendanceRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Students:</span>
                      <span className="font-medium">{stats.totalStudents}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Quick Actions */}
          <div className="lg:hidden">
            <div className="bg-white rounded-md border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/scan"
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all"
                >
                  <QrCode className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">Scan QR</span>
                </Link>
                <Link
                  to="/create-event"
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                >
                  <Plus className="w-5 h-5 text-indigo-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">Create Event</span>
                </Link>
                <Link
                  to="/attendance-report"
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
                >
                  <BarChart3 className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">Reports</span>
                </Link>
                <Link
                  to="/notices"
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all"
                >
                  <Bell className="w-5 h-5 text-orange-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">Notices</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
