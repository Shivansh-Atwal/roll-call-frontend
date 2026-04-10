import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import AttendanceSheet from './pages/AttendanceSheet';
import CreateEvent from './pages/CreateEvent';
import QRScanner from './pages/QRScanner';
import MarkAttendance from './pages/MarkAttendance';
import NoticePage from './pages/NoticePage';
import AttendanceReport from './pages/AttendanceReport';
import Profile from './pages/Profile';
import QRCodePage from './pages/QRCode';
import Attendance from './pages/Attendance';
import CreateTeam from './pages/CreateTeam';
import ManageTeams from './pages/ManageTeams';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('App: User data loaded from localStorage:', userData);
        console.log('App: User role:', userData.role);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      console.log('App: No user data found in localStorage');
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    console.log('App: Login function called with user data:', userData);
    console.log('App: User role for login:', userData.role);
    setUser(userData);
    // User data and token are already stored in localStorage by Login/Signup components
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={<LandingPage />} 
          />
          <Route 
            path="/notices" 
            element={<NoticePage />} 
          />
          <Route 
            path="/login" 
            element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login onLogin={login} />} 
          />
          <Route 
            path="/signup" 
            element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Signup onSignup={login} />} 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/admin" 
            element={
              user && user.role === 'admin' ? 
                <AdminDashboard user={user} onLogout={logout} /> : 
                user ? 
                  <Navigate to="/dashboard" /> : 
                  <Navigate to="/login" />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              user ? (
                user.role === 'admin' ? <Navigate to="/admin" /> : <UserDashboard user={user} onLogout={logout} />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/attendance/:eventId" 
            element={
              user ? 
                <AttendanceSheet user={user} onLogout={logout} /> : 
                <Navigate to="/login" />
            } 
          />
          <Route 
            path="/create-event" 
            element={
              user && user.role === 'admin' ? 
                <CreateEvent user={user} onLogout={logout} /> : 
                user ? 
                  <Navigate to="/dashboard" /> : 
                  <Navigate to="/login" />
            } 
          />
          <Route 
            path="/scan" 
            element={
              user && user.role === 'admin' ? 
                <QRScanner /> : 
                user ? 
                  <Navigate to="/dashboard" /> : 
                  <Navigate to="/login" />
            } 
          />
          <Route 
            path="/mark-attendance" 
            element={
              user && user.role === 'admin' ? 
                <MarkAttendance /> : 
                user ? 
                  <Navigate to="/dashboard" /> : 
                  <Navigate to="/login" />
            } 
          />
          <Route 
            path="/attendance-report" 
            element={
              user && user.role === 'admin' ? 
                <AttendanceReport /> : 
                user ? 
                  <Navigate to="/dashboard" /> : 
                  <Navigate to="/login" />
            } 
          />
          <Route 
            path="/profile" 
            element={user ? <Profile user={user} onLogout={logout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/qr-code" 
            element={user ? <QRCodePage user={user} onLogout={logout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/attendance" 
            element={user ? <Attendance user={user} onLogout={logout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/teams" 
            element={
              user && user.role === 'admin' ? 
                <ManageTeams /> : 
                user ? 
                  <Navigate to="/dashboard" /> : 
                  <Navigate to="/login" />
            } 
          />
          <Route 
            path="/create-team" 
            element={
              user && user.role === 'admin' ? 
                <CreateTeam /> : 
                user ? 
                  <Navigate to="/dashboard" /> : 
                  <Navigate to="/login" />
            } 
          />
          
          {/* Fallback Route */}
          <Route 
            path="*" 
            element={<Navigate to="/" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

