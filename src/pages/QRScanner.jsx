import React, { useEffect, useRef, useState } from 'react';
import { eventsAPI, attendanceAPI } from '../services/api';
import { Html5Qrcode } from 'html5-qrcode';

const QrScanner = () => {
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [marking, setMarking] = useState(false);
  const [markResult, setMarkResult] = useState(null);
  const qrCodeRegionId = 'qr-reader';
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    loadActiveEvents();

    const startScanner = async () => {
      const config = { fps: 10, qrbox: 250 };

      try {
        html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId);
        setScanning(true);
        await html5QrCodeRef.current.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            try {
              const jsonData = JSON.parse(decodedText);
              setScannedData(jsonData);
            } catch (parseError) {
              setError('Scanned data is not valid JSON.');
            }
            stopScanner();
          },
          () => {}
        );
      } catch (err) {
        setError('Unable to start the QR scanner.');
        setScanning(false);
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  
  const loadActiveEvents = async () => {
    try {
      const res = await eventsAPI.getActiveEvents();
      if (res.success && res.events && res.events.length > 0) {
        setEvents(res.events);
      } else {
        setError('No active events found.');
      }
    } catch (err) {
      setError('Error fetching active events.');
    }
  };


  const stopScanner = async () => {
    if (html5QrCodeRef.current && scanning) {
      await html5QrCodeRef.current.stop();
      await html5QrCodeRef.current.clear();
      setScanning(false);
    }
  };

  const closeModal = () => {
    setScannedData(null);
    setError(null);
    setSelectedEventId('');
    setMarkResult(null);
    window.location.reload();
  };

  
  const handleMarkAttendance = async () => {
    if (!selectedEventId || !scannedData) return;
    setMarking(true);
    setMarkResult(null);
    try {
      const payload = {
        eventId: selectedEventId,
        ...scannedData,
        status: 'present',
      };
      const res = await attendanceAPI.markAttendance(payload);
      setMarkResult(res);
    } catch (err) {
      setMarkResult({ success: false, error: 'Failed to mark attendance.' });
    }
    setMarking(false);
  };



  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        <h2 style={styles.heading}> QR Code Scanner</h2>
        <div id={qrCodeRegionId} style={styles.qrBox} />
        {error && <div style={styles.error}>{error}</div>}
        <p style={styles.instructions}>Point your camera at a QR code with JSON data</p>
        
        {/* Show active events list below scanner */}
        {events.length > 0 && (
          <div style={styles.eventSection}>
            <h3 style={styles.eventHeading}>Select Event:</h3>
            <select
              style={styles.eventSelect}
              value={selectedEventId}
              onChange={e => setSelectedEventId(e.target.value)}
            >
              <option value="">-- Choose Event --</option>
              {events.map(ev => (
                <option key={ev._id} value={ev._id}>{ev.title} ({ev.date})</option>
              ))}
            </select>
            {selectedEventId && (
              <div style={styles.selectedEvent}>
                 Selected: {events.find(e => e._id === selectedEventId)?.title}
              </div>
            )}
          </div>
        )}
      </div>

      {scannedData && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalHeading}> Scanned QR Data</h3>
            <pre style={styles.jsonDisplay}>
              {JSON.stringify(scannedData, null, 2)}
            </pre>
            
            {selectedEventId ? (
              <div>
                <div style={styles.selectedEvent}>
                  Selected Event: {events.find(e => e._id === selectedEventId)?.title}
                </div>
                <button
                  style={{...styles.button, ...(marking ? styles.buttonDisabled : {})}}
                  onClick={handleMarkAttendance}
                  disabled={marking}
                >
                  {marking ? ' Marking...' : ' Mark Attendance'}
                </button>
              </div>
            ) : (
              <div style={styles.errorMessage}>
                Please select an event first
              </div>
            )}
            
            {markResult && (
              <div style={{ marginTop: 15 }}>
                {markResult.success ? (
                  <div style={styles.successMessage}>
                    Attendance marked successfully!
                  </div>
                ) : (
                  <div style={styles.errorMessage}>
                    Error: {markResult.error}
                  </div>
                )}
              </div>
            )}
            <button style={styles.closeButton} onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  pageContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  container: {
    width: '100%',
    maxWidth: '450px',
    padding: '30px',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heading: {
    marginBottom: '25px',
    color: '#2c3e50',
    fontSize: '28px',
    fontWeight: '600',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  qrBox: {
    width: '100%',
    height: '300px',
    marginBottom: '25px',
    borderRadius: '15px',
    overflow: 'hidden',
    border: '3px solid #e74c3c',
    boxShadow: '0 8px 16px rgba(231, 76, 60, 0.2)',
    position: 'relative',
  },
  error: {
    color: '#e74c3c',
    fontSize: '14px',
    marginTop: '15px',
    padding: '10px',
    backgroundColor: '#fdf2f2',
    borderRadius: '8px',
    border: '1px solid #fecaca',
  },
  instructions: {
    fontSize: '16px',
    color: '#7f8c8d',
    marginBottom: '20px',
    fontWeight: '400',
  },
  eventSection: {
    marginTop: '25px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '15px',
    border: '2px solid #e9ecef',
  },
  eventHeading: {
    color: '#2c3e50',
    marginBottom: '15px',
    fontSize: '18px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  eventSelect: {
    width: '100%',
    padding: '15px',
    fontSize: '16px',
    borderRadius: '12px',
    border: '2px solid #dee2e6',
    backgroundColor: '#fff',
    color: '#495057',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none',
  },
  selectedEvent: {
    marginTop: '15px',
    padding: '12px',
    backgroundColor: '#d4edda',
    borderRadius: '10px',
    border: '1px solid #c3e6cb',
    fontSize: '14px',
    color: '#155724',
    fontWeight: '500',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(5px)',
  },
  modal: {
    backgroundColor: '#fff',
    padding: '35px',
    borderRadius: '20px',
    width: '90%',
    maxWidth: '550px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
    textAlign: 'left',
    maxHeight: '80vh',
    overflowY: 'auto',
  },
  modalHeading: {
    marginBottom: '20px',
    color: '#2c3e50',
    fontSize: '24px',
    fontWeight: '600',
    textAlign: 'center',
  },
  jsonDisplay: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '12px',
    maxHeight: '250px',
    overflowY: 'auto',
    fontSize: '13px',
    fontFamily: "'Fira Code', 'Courier New', monospace",
    border: '1px solid #e9ecef',
    lineHeight: '1.5',
  },
  successMessage: {
    color: '#28a745',
    fontSize: '16px',
    fontWeight: '600',
    textAlign: 'center',
    padding: '15px',
    backgroundColor: '#d4edda',
    borderRadius: '10px',
    border: '1px solid #c3e6cb',
  },
  errorMessage: {
    color: '#dc3545',
    fontSize: '16px',
    fontWeight: '600',
    textAlign: 'center',
    padding: '15px',
    backgroundColor: '#f8d7da',
    borderRadius: '10px',
    border: '1px solid #f5c6cb',
  },
  button: {
    marginTop: '20px',
    backgroundColor: '#28a745',
    color: '#fff',
    padding: '15px 30px',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    width: '100%',
    boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  closeButton: {
    marginTop: '15px',
    backgroundColor: '#6c757d',
    color: '#fff',
    padding: '12px 25px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
};

export default QrScanner;
