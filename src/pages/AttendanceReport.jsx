import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Filter,
  Search,
  TrendingUp,
  Download,
  BarChart3,
  Users,
  Eye,
  Smartphone
} from 'lucide-react';
import toast from 'react-hot-toast';
import { attendanceAPI } from '../services/api';

const AttendanceReport = ({ user, onLogout }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [tradeFilter, setTradeFilter] = useState('all');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalStudents: 0,
    presentCount: 0,
    absentCount: 0,
    attendanceRate: 0,
    totalEvents: 0
  });

  const trades = [
    'All Trades',
    'GCS',
    'GIN',
    'GME',
    'GEC',
    'GEE',
    'GFT',
    'GCT'
  ];

  const eventTypes = ['All Types', 'Event', 'TNP Meeting'];

  useEffect(() => {
    fetchAttendanceReport();
  }, []);

  const fetchAttendanceReport = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getAttendanceReport();
      
      if (response.success) {
        setAttendanceData(response.attendance);
        setFilteredData(response.attendance);
        setStats(response.stats);
      } else {
        toast.error('Failed to fetch attendance report');
      }
    } catch (error) {
      console.error('Fetch attendance report error:', error);
      toast.error('Failed to fetch attendance report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterData();
  }, [searchTerm, dateFilter, tradeFilter, eventTypeFilter, statusFilter, attendanceData]);

  const filterData = () => {
    let filtered = attendanceData;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.eventName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date);
        switch (dateFilter) {
          case 'today':
            return recordDate.toDateString() === today.toDateString();
          case 'week':
            return recordDate >= oneWeekAgo;
          case 'month':
            return recordDate >= oneMonthAgo;
          default:
            return true;
        }
      });
    }

    // Trade filter
    if (tradeFilter !== 'all') {
      filtered = filtered.filter(record => record.trade === tradeFilter);
    }

    // Event type filter
    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter(record => record.eventType === eventTypeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    setFilteredData(filtered);
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

  const handleGeneratePDF = async () => {
    try {
      toast.loading('Generating PDF report...');
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/attendance/report/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (!res.ok) {
        toast.dismiss();
        return toast.error('Failed to generate PDF');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'attendance-report.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success('PDF downloaded');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate PDF report');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-3">
              <Link to="/admin" className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              <h1 className="text-lg font-bold text-gray-900">Attendance Report</h1>
            </div>
            
            <button
              onClick={handleGeneratePDF}
              className="flex items-center px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Compact Stats Row */}
        

        {/* Compact Filters */}
        <div className="bg-white rounded-md border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students or events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </div>

        {/* Attendance Data */}
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Attendance Records</h3>
              <p className="text-xs text-gray-500">Showing {filteredData.length} of {attendanceData.length} records</p>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            <div className="divide-y divide-gray-200">
              {filteredData.map((record, idx) => (
                <div key={record._id || record.id || `${record.studentId}-${record.date}-${idx}`} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{record.studentName}</h4>
                      <p className="text-xs text-gray-500">Roll No: {record.studentId}</p>
                      {record.verifiedByName && (
                        <p className="text-xs text-gray-500">Verified by: {record.verifiedByName}</p>
                      )}
                      <p className="text-xs text-gray-500 mb-1">Trade: {(record.trade || record.user_id?.trade || '').split(' ')[0] || 'N/A'}</p>
                      <p className="text-sm text-gray-700">Event: {record.eventName}</p>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {record.date}{record.attendanceTime ? ` • ${record.attendanceTime}` : ''}
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
              ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trade</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Verified By</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((record, idx) => (
                    <tr key={record._id || record.id || `${record.studentId}-${record.eventName}-${record.date || idx}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{record.studentName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{record.studentId}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{(record.trade || record.user_id?.trade || '').split(' ')[0] || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{record.eventName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {record.date}{record.attendanceTime ? ` • ${record.attendanceTime}` : ''}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{record.verifiedByName || '—'}</td>
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">No records found</h3>
              <p className="text-xs text-gray-500">Try adjusting your filters to see more results.</p>
            </div>
          )}
        </div>

        {/* Mobile Export Button */}
        <div className="lg:hidden mt-6">
          <button
            onClick={handleGeneratePDF}
            className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReport;
