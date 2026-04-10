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
  Search,
  Filter,
  TrendingUp,
  BarChart3,
  Users,
  Eye,
  FileText,
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import { attendanceAPI } from '../services/api';

const Attendance = ({ user, onLogout }) => {
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalEvents: 0,
    attended: 0,
    absent: 0,
    attendanceRate: 0
  });

  const eventTypes = ['All Types', 'Event', 'TNP Meeting'];
  const statusOptions = ['All Status', 'present', 'absent'];
  const dateRanges = ['All Time', 'This Week', 'This Month', 'Last 3 Months'];

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getUserAttendance(user._id || user.id);
      
      if (response.success) {
        setAttendanceHistory(response.attendance);
        setFilteredHistory(response.attendance);
        
        // Calculate stats
        const totalEvents = response.attendance.length;
        const attended = response.attendance.filter(a => a.status === 'present').length;
        const absent = response.attendance.filter(a => a.status === 'absent').length;
        const attendanceRate = totalEvents > 0 ? Math.round((attended / totalEvents) * 100) : 0;
        
        setStats({
          totalEvents,
          attended,
          absent,
          attendanceRate
        });
      } else {
        toast.error('Failed to fetch attendance history');
      }
    } catch (error) {
      console.error('Fetch attendance history error:', error);
      toast.error('Failed to fetch attendance history');
    } finally {
      setLoading(false);
    }
  };

  const filterHistory = () => {
    let filtered = attendanceHistory;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    // Event type filter
    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter(record => record.eventType === eventTypeFilter);
    }

    // Date range filter
    if (dateRangeFilter !== 'all') {
      const today = new Date();
      const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const threeMonthsAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date);
        switch (dateRangeFilter) {
          case 'This Week':
            return recordDate >= oneWeekAgo;
          case 'This Month':
            return recordDate >= oneMonthAgo;
          case 'Last 3 Months':
            return recordDate >= threeMonthsAgo;
          default:
            return true;
        }
      });
    }

    setFilteredHistory(filtered);
  };

  const getStatusColor = (status) => {
    return status === 'present' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (status) => {
    return status === 'present' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />;
  };

  const getEventTypeColor = (type) => {
    return type === 'Event' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  const getArrivalStatus = (arrivalTime, eventTime) => {
    if (!arrivalTime) return null;
    
    const arrival = new Date(`2000-01-01 ${arrivalTime}`);
    const event = new Date(`2000-01-01 ${eventTime}`);
    const diffMinutes = (arrival - event) / (1000 * 60);
    
    if (diffMinutes <= 0) return { text: 'On time', color: 'text-green-600' };
    if (diffMinutes <= 5) return { text: 'Slightly late', color: 'text-yellow-600' };
    return { text: 'Late', color: 'text-red-600' };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your attendance.</p>
          <Link to="/login" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-3">
              <Link to="/dashboard" className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              <h1 className="text-lg font-bold text-gray-900">My Attendance</h1>
            </div>
            
            <Link
              to="/qr-code"
              className="flex items-center px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <span className="hidden sm:inline">My QR Code</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Compact Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
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
                <p className="text-xs font-medium text-gray-600">Attended</p>
                <p className="text-lg font-bold text-green-600">{stats.attended}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-md border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Absent</p>
                <p className="text-lg font-bold text-red-600">{stats.absent}</p>
              </div>
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-md border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Attendance Rate</p>
                <p className="text-lg font-bold text-purple-600">{stats.attendanceRate}%</p>
              </div>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>

          
        </div>

        {/* Compact Filters */}
        <div className="bg-white rounded-md border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-2">
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status === 'All Status' ? 'all' : status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {eventTypes.map((type) => (
                <option key={type} value={type === 'All Types' ? 'all' : type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {dateRanges.map((range) => (
                <option key={range} value={range === 'All Time' ? 'all' : range}>
                  {range}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Attendance History */}
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Attendance History</h3>
              <p className="text-xs text-gray-500">Showing {filteredHistory.length} of {attendanceHistory.length} records</p>
            </div>
          </div>

          {/* Mobile Card View (Event, Date, Status only) */}
          <div className="lg:hidden">
            <div className="divide-y divide-gray-200">
              {filteredHistory.map((record) => {
                const arrivalStatus = getArrivalStatus(record.arrivalTime, record.time);
                return (
                  <div key={record.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{record.eventName}</h4>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          {record.date}{record.time ? ` • ${record.time}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end mb-1">
                          <span className={`mr-1 ${getStatusColor(record.status)}`}>
                            {getStatusIcon(record.status)}
                          </span>
                          <span className={`text-xs font-medium ${getStatusColor(record.status)}`}>
                            {record.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredHistory.map((record) => {
                    return (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{record.eventName}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">{record.date}</div>
                          <div className="text-xs text-gray-500">{record.time}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <span className={`mr-2 ${getStatusColor(record.status)}`}>
                              {getStatusIcon(record.status)}
                            </span>
                            <span className={`text-sm font-medium ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">No attendance records found</h3>
              <p className="text-xs text-gray-500">Try adjusting your filters to see more results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
