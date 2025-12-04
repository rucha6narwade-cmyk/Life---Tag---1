import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/context/AuthContext';
import apiClient from '../api';
import './PageWrapper.css';

const PatientRequestsPage = () => {
  const { auth } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const hasInitialized = React.useRef(false);

  // Fetch requests from backend
  const fetchRequests = async (isInitial = false) => {
    if (!auth?.tagId) {
      if (isInitial) {
        setError('Patient ID not found');
        setLoading(false);
      }
      return;
    }

    if (isInitial) {
      setLoading(true);
      setError(null);
    }

    try {
      // Call backend API endpoint
      const response = await apiClient.get(`/access/patient/tag/${auth.tagId}`);
      const allRequests = response.data || [];

      const now = new Date();

      // Filter into pending and active
      const pending = allRequests.filter((req) => req.status === 'pending');
      const active = allRequests.filter(
        (req) =>
          req.status === 'approved' &&
          req.expiresAt &&
          new Date(req.expiresAt) > now
      );

      setPendingRequests(pending);
      setActiveSessions(active);
      if (isInitial) {
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      if (isInitial) {
        setError(err.response?.data?.message || 'Failed to fetch requests');
      }
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!hasInitialized.current && auth?.tagId) {
      hasInitialized.current = true;
      fetchRequests(true);
      // Poll for updates every 10 seconds silently (no loading state)
      const interval = setInterval(() => fetchRequests(false), 10000);
      return () => clearInterval(interval);
    }
  }, [auth?.tagId]);

  // Handle approve/reject/end actions
  const handleAction = async (requestId, action) => {
    setActionLoading(requestId);

    try {
      if (action === 'end') {
        await apiClient.put(`/access/end/${requestId}`, { action: 'end' });
      } else {
        const payload = { action };
        if (action === 'approve') {
          payload.durationMinutes = 30;
        }
        await apiClient.put(`/access/respond/${requestId}`, payload);
      }
      // Refresh silently after action
      await fetchRequests(false);
    } catch (err) {
      console.error(`Error ${action}ing request:`, err);
      setError(err.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <p>Loading requests...</p>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* Active Sessions */}
      <div className="glass-card">
        <h3 style={{ marginTop: 0 }}>Active Sessions</h3>
        {activeSessions.length === 0 ? (
          <p>No active sessions.</p>
        ) : (
          <div className="requests-list">
            {activeSessions.map((req) => (
              <div key={req.id} className="request-card" style={{
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <p>
                  <strong>Dr. {req.Doctor?.fullName || 'Unknown'}</strong>
                </p>
                <p>Specialization: {req.Doctor?.specialization || 'N/A'}</p>
                <p>Expires: {new Date(req.expiresAt).toLocaleString()}</p>
                <button
                  className="primary-button glossy-btn"
                  onClick={() => handleAction(req.id, 'end')}
                  disabled={actionLoading === req.id}
                  style={{ marginTop: '0.5rem' }}
                >
                  {actionLoading === req.id ? 'Processing...' : 'End Session'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Requests */}
      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginTop: 0 }}>Pending Access Requests</h3>
        {pendingRequests.length === 0 ? (
          <p>No pending access requests.</p>
        ) : (
          <div className="requests-list">
            {pendingRequests.map((req) => (
              <div key={req.id} className="request-card" style={{
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <p>
                  <strong>Dr. {req.Doctor?.fullName || 'Unknown'}</strong>
                </p>
                <p>Specialization: {req.Doctor?.specialization || 'N/A'}</p>
                {req.notes && <p>Notes: {req.notes}</p>}
                <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>
                  Requested: {new Date(req.createdAt).toLocaleString()}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    className="primary-button glossy-btn"
                    onClick={() => handleAction(req.id, 'approve')}
                    disabled={actionLoading === req.id}
                  >
                    {actionLoading === req.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    className="primary-button glossy-btn"
                    onClick={() => handleAction(req.id, 'reject')}
                    disabled={actionLoading === req.id}
                    style={{
                      background: 'linear-gradient(90deg,#ff6b6b,#ff4d4d)'
                    }}
                  >
                    {actionLoading === req.id ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientRequestsPage;