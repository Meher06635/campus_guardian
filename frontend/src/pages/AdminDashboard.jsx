import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, FileText, Send, User, Check, X } from 'lucide-react';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = "http://127.0.0.1:5000/api";

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/admin/pending-submissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSubmissions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/admin/approve-student`, { student_id: studentId }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSubmissions(submissions.filter(s => s.user_id !== studentId));
      alert("Student data approved and sent to Counselor!");
    } catch (err) {
      alert("Approval failed.");
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>System Administration</h1>
        <button onClick={() => {logout(); navigate('/');}} className="btn btn-secondary">Logout</button>
      </div>

      <div className="glass-panel animate-fade-in">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldCheck /> Data Approval Hub</h2>
        <p>Review and verify persistent student data from the database.</p>
        
        {loading ? (
           <p style={{ textAlign: 'center', padding: '2rem' }}>Loading submissions...</p>
        ) : submissions.length > 0 ? (
           <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {submissions.map((sub, idx) => (
                 <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid var(--warning)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <User size={18} color="var(--primary)" />
                          <strong style={{ fontSize: '1.1rem' }}>{sub.name}</strong>
                          <span className="badge badge-medium">{sub.department} / Sem {sub.semester}</span>
                       </div>
                       <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                          <span>CGPA: <strong>{sub.cgpa}</strong></span>
                          <span>Attendance: <strong>{sub.attendance_percentage}%</strong></span>
                          <span style={{ color: sub.counseling_preference === 'needed' ? 'var(--danger)' : 'var(--secondary)' }}>
                             Preference: {sub.counseling_preference === 'needed' ? 'Needs Help' : 'Not Requested'}
                          </span>
                       </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                       <button onClick={() => handleApprove(sub.user_id)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Check size={16} /> Approve
                       </button>
                       <button className="btn btn-danger" style={{ padding: '0.5rem 1rem' }}><X size={16} /></button>
                    </div>
                 </div>
              ))}
           </div>
        ) : (
           <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No student submissions pending approval in DB.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
