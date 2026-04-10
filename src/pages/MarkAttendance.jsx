import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  Users,
  CheckSquare,
  Square,
  Loader,
  QrCode,
  Users2
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_BASE_URL, teamsAPI, attendanceAPI } from '../services/api';

const MarkAttendance = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, scannedData } = location.state || {};
  
  // Mode state (team or individual)
  const [mode, setMode] = useState('individual'); // 'individual' or 'team'
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  
  // Individual attendance state
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('present');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  
  // Team attendance state
  const [selectedTeamEvent, setSelectedTeamEvent] = useState('');
  const [teamAttendanceData, setTeamAttendanceData] = useState({}); // { userId: 'present'/'absent' }
  const [isSubmittingTeam, setIsSubmittingTeam] = useState(false);

  useEffect(() => {
    // For individual mode, redirect if no user data
    if (mode === 'individual' && !user) {
      toast.error('No user data found. Please scan a QR code first.');
      navigate('/scan');
      return;
    }

    // Fetch events
    fetchUpcomingEvents();
    
    // If switching to team mode, fetch teams
    if (mode === 'team') {
      fetchTeams();
    }
  }, [mode, user, navigate]);

  const fetchTeams = async () => {
    try {
      const response = await teamsAPI.getAllTeams();
      if (response.success && response.teams) {
        setTeams(response.teams);
      } else {
        toast.error('Failed to fetch teams');
      }
    } catch (error) {
      toast.error('Error fetching teams');
      console.error(error);
    }
  };

  const handleTeamSelection = async (teamId) => {
    setSelectedTeam(teamId);
    setIsLoadingTeam(true);
    try {
      const response = await teamsAPI.getTeamMembers(teamId);
      if (response.success) {
        setTeamMembers(response.members || []);
        setTeamAttendanceData({}); // Reset attendance data
      } else {
        toast.error('Failed to fetch team members');
      }
    } catch (error) {
      toast.error('Error fetching team members');
      console.error(error);
    } finally {
      setIsLoadingTeam(false);
    }
  };

  const handleMemberToggle = (userId) => {
    setTeamAttendanceData(prev => {
      if (prev[userId]) {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      } else {
        return { ...prev, [userId]: 'present' };
      }
    });
  };

  const handleMemberStatusChange = (userId, status) => {
    setTeamAttendanceData(prev => ({
      ...prev,
      [userId]: status
    }));
  };

  const fetchUpcomingEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/events/upcoming`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (response.ok && result.events) {
        setEvents(result.events);
      } else {
        toast.error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  };

  // Individual QR mode attendance marking
  const markAttendance = async () => {
    if (!selectedEvent) {
      toast.error('Please select an event');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/mark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: user._id || user.id,
          eventId: selectedEvent,
          status: attendanceStatus
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        setAttendanceMarked(true);
        toast.success('Attendance marked successfully!');
      } else {
        toast.error(result.error || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Team attendance marking
  const markTeamAttendance = async () => {
    if (!selectedTeamEvent) {
      toast.error('Please select an event');
      return;
    }

    if (Object.keys(teamAttendanceData).length === 0) {
      toast.error('Please select at least one member to mark attendance');
      return;
    }

    setIsSubmittingTeam(true);
    try {
      const attendanceArray = Object.entries(teamAttendanceData).map(([userId, status]) => ({
        userId,
        status
      }));

      const response = await teamsAPI.markTeamAttendance({
        eventId: selectedTeamEvent,
        attendanceData: attendanceArray
      });

      if (response.success) {
        toast.success(`Attendance marked for ${response.successful} members!`);
        if (response.failed > 0) {
          toast.error(`Failed to mark ${response.failed} members`);
        }
        // Reset form
        setTeamAttendanceData({});
        setSelectedTeamEvent('');
      } else {
        toast.error(response.error || 'Failed to mark team attendance');
      }
    } catch (error) {
      toast.error('Error marking team attendance');
      console.error(error);
    } finally {
      setIsSubmittingTeam(false);
    }
  };

  const resetForm = () => {
    setSelectedEvent('');
    setAttendanceStatus('present');
    setAttendanceMarked(false);
  };

  const goBackToScanner = () => {
    navigate('/scan');
  };

  // If individual mode and no user, redirect
  if (mode === 'individual' && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No user data found.</p>
          <button
            onClick={() => navigate('/scan')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Scanner
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header with Mode Switcher */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
            <div className="w-20"></div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex gap-2 p-1 bg-white rounded-lg shadow-sm border border-gray-200">
            <motion.button
              onClick={() => {
                setMode('individual');
                setAttendanceMarked(false);
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all ${
                mode === 'individual'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <QrCode className="w-5 h-5" />
              <span>QR Scanning</span>
            </motion.button>
            
            <motion.button
              onClick={() => {
                setMode('team');
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all ${
                mode === 'team'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users2 className="w-5 h-5" />
              <span>Team Mode</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Individual Mode */}
        <AnimatePresence mode="wait">
          {mode === 'individual' && !attendanceMarked && (
            <motion.div 
              key="individual-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* User Details Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Student Information</h2>
                    <p className="text-gray-600">Mark attendance for this student</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                        {user?.name}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                        {user?.roll_no}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trade/Department</label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                        {user?.trade}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Selection */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                  Select Event/Meeting
                </h3>
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading events...</p>
                  </div>
                ) : events.length > 0 ? (
                  <div className="space-y-4">
                    <select
                      value={selectedEvent}
                      onChange={(e) => setSelectedEvent(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Choose an event or meeting...</option>
                      {events.map((event) => (
                        <option key={event._id} value={event._id}>
                          {event.title} - {event.event_type} ({event.date} at {event.time})
                        </option>
                      ))}
                    </select>

                    {selectedEvent && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-indigo-50 rounded-lg border border-indigo-200"
                      >
                        <h4 className="font-semibold text-indigo-900 mb-3">Selected Event Details:</h4>
                        {(() => {
                          const event = events.find(e => e._id === selectedEvent);
                          return event ? (
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-indigo-600" />
                                <span className="text-gray-700">{event.title}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-indigo-600" />
                                <span className="text-gray-700">{event.date} at {event.time}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-indigo-600" />
                                <span className="text-gray-700">{event.location}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="px-3 py-1 bg-indigo-200 text-indigo-900 rounded-full text-xs font-medium">
                                  {event.event_type}
                                </span>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No upcoming events found</p>
                    <button
                      onClick={fetchUpcomingEvents}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Refresh Events
                    </button>
                  </div>
                )}
              </div>

              {/* Attendance Status */}
              {selectedEvent && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-md"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Attendance Status</h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-green-50 transition">
                      <input
                        type="radio"
                        name="attendanceStatus"
                        value="present"
                        checked={attendanceStatus === 'present'}
                        onChange={(e) => setAttendanceStatus(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                        attendanceStatus === 'present' 
                          ? 'border-green-500 bg-green-500' 
                          : 'border-gray-300'
                      }`}>
                        {attendanceStatus === 'present' && <CheckSquare className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-gray-700 font-medium">Present</span>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-red-50 transition">
                      <input
                        type="radio"
                        name="attendanceStatus"
                        value="absent"
                        checked={attendanceStatus === 'absent'}
                        onChange={(e) => setAttendanceStatus(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                        attendanceStatus === 'absent' 
                          ? 'border-red-500 bg-red-500' 
                          : 'border-gray-300'
                      }`}>
                        {attendanceStatus === 'absent' && <XCircle className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-gray-700 font-medium">Absent</span>
                    </label>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              {selectedEvent && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                >
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Ready to mark attendance</span>
                    </div>
                    <p className="text-green-700 mt-2">
                      Click the button below to mark {user?.name} as {attendanceStatus} for the selected event.
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={markAttendance}
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader className="w-5 h-5 animate-spin" />
                          Marking...
                        </div>
                      ) : (
                        'Mark Attendance'
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={resetForm}
                      className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition font-semibold"
                    >
                      Reset
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Individual Mode Success */}
          {mode === 'individual' && attendanceMarked && (
            <motion.div 
              key="individual-success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-md"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-10 h-10 text-green-600" />
              </motion.div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Attendance Marked Successfully!
              </h3>
              
              <p className="text-gray-600 mb-8">
                {user?.name} has been marked as <span className="font-semibold">{attendanceStatus}</span> for the selected event.
              </p>

              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goBackToScanner}
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
                >
                  Scan Another QR
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/admin')}
                  className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-semibold"
                >
                  Back to Dashboard
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Team Mode */}
          {mode === 'team' && (
            <motion.div 
              key="team-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Team Selection */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Users2 className="w-5 h-5 mr-2 text-indigo-600" />
                  Select Team
                </h3>
                
                {teams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teams.map(team => (
                      <motion.button
                        key={team._id}
                        onClick={() => handleTeamSelection(team._id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-lg border-2 transition text-left ${
                          selectedTeam === team._id
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        <h4 className="font-semibold text-gray-900">{team.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{team.membersCount} members</p>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No teams available</p>
                    <button
                      onClick={() => navigate('/create-team')}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Create a Team
                    </button>
                  </div>
                )}
              </div>

              {/* Event Selection for Team */}
              {selectedTeam && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-md"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                    Select Event
                  </h3>
                  
                  {isLoading ? (
                    <div className="text-center py-8">
                      <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                      <p className="text-gray-600">Loading events...</p>
                    </div>
                  ) : events.length > 0 ? (
                    <select
                      value={selectedTeamEvent}
                      onChange={(e) => setSelectedTeamEvent(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Choose an event...</option>
                      {events.map((event) => (
                        <option key={event._id} value={event._id}>
                          {event.title} - {event.date} at {event.time}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-600 text-center">No upcoming events found</p>
                  )}
                </motion.div>
              )}

              {/* Team Members - Attendance Marking */}
              {selectedTeam && selectedTeamEvent && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-md"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-indigo-600" />
                    Mark Team Members ({Object.keys(teamAttendanceData).length}/{teamMembers.length})
                  </h3>

                  {isLoadingTeam ? (
                    <div className="text-center py-8">
                      <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                      <p className="text-gray-600">Loading members...</p>
                    </div>
                  ) : teamMembers.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {teamMembers.map(member => {
                        const userId = member.user_id?._id;
                        const isSelected = !!teamAttendanceData[userId];
                        const status = teamAttendanceData[userId] || 'present';

                        return (
                          <motion.div
                            key={userId}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-4 rounded-lg border-2 transition ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <motion.button
                                  onClick={() => handleMemberToggle(userId)}
                                  className={`p-2 rounded-lg transition ${
                                    isSelected
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                  }`}
                                >
                                  {isSelected ? (
                                    <CheckSquare className="w-5 h-5" />
                                  ) : (
                                    <Square className="w-5 h-5" />
                                  )}
                                </motion.button>

                                <div>
                                  <p className="font-medium text-gray-900">
                                    {member.user_id?.name}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {member.user_id?.roll_no}
                                  </p>
                                </div>
                              </div>

                              {isSelected && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="flex gap-2"
                                >
                                  <button
                                    onClick={() => handleMemberStatusChange(userId, 'present')}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                                      status === 'present'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    }`}
                                  >
                                    Present
                                  </button>
                                  <button
                                    onClick={() => handleMemberStatusChange(userId, 'absent')}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                                      status === 'absent'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    }`}
                                  >
                                    Absent
                                  </button>
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">No members in this team</p>
                  )}

                  {/* Submit Button */}
                  {Object.keys(teamAttendanceData).length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 pt-6 border-t border-gray-200"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={markTeamAttendance}
                        disabled={isSubmittingTeam}
                        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                      >
                        {isSubmittingTeam ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader className="w-5 h-5 animate-spin" />
                            Marking {Object.keys(teamAttendanceData).length} Members...
                          </div>
                        ) : (
                          `Mark Attendance for ${Object.keys(teamAttendanceData).length} Member${Object.keys(teamAttendanceData).length > 1 ? 's' : ''}`
                        )}
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MarkAttendance;
