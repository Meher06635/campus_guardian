import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Brain, UserCircle, Send, AlertTriangle, FileText, CheckCircle } from 'lucide-react';

const CounselorDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reportData, setReportData] = useState({ suggestions: '', action_type: 'suggestions' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_BASE = "http://127.0.0.1:5000/api";

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/counselor/queue`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setQueue(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportData.suggestions || !selectedStudent) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/counselor/submit-report`, {
        student_id: selectedStudent.user_id,
        ...reportData
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setQueue(queue.filter(s => s.user_id !== selectedStudent.user_id));
      setSelectedStudent(null);
      setReportData({ suggestions: '', action_type: 'suggestions' });
      alert("Counseling & AI Risk report submitted to DB!");
    } catch (err) {
      alert("Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Counseling Hub</h1>
        <button onClick={() => {logout(); navigate('/');}} className="btn btn-secondary">Logout</button>
      </div>

      <div className="grid grid-cols-2">
        {/* Approved Queue */}
        <div className="glass-panel animate-fade-in">
           <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Brain /> AI Triage Queue</h2>
           <p>Only students approved by Administration are queued here for risk analysis.</p>

           {loading ? (
             <p style={{ textAlign: 'center', padding: '2rem' }}>Loading queue...</p>
           ) : queue.length > 0 ? (
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {queue.map((student, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedStudent(student)}
                      style={{ 
                        background: 'rgba(0,0,0,0.2)', 
                        padding: '1rem', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        border: selectedStudent?.user_id === student.user_id ? '2px solid var(--primary)' : '1px solid var(--border)',
                        transition: 'all 0.2s'
                      }}
                    >
                       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong>{student.name}</strong>
                          <span className="badge badge-medium">Ready for Triage</span>
                       </div>
                       <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                          CGPA: {student.cgpa} | Att: {student.attendance_percentage}% | Dept: {student.department}
                       </p>
                    </div>
                 ))}
              </div>
           ) : (
              <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Queue is currently empty.</p>
           )}
        </div>

        {/* Action Panel */}
        <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
           <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText /> Intervention Design</h2>
           
           {selectedStudent ? (
              <div style={{ marginTop: '1.5rem' }}>
                 <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,165,0,0.1)', borderRadius: '8px', border: '1px solid var(--warning)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', fontWeight: 'bold' }}>
                       <Brain size={18} /> AI ASSISTANCE ENABLED
                    </div>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Automated Risk Score will be generated upon submission based on CGPA and Attendance.</p>
                 </div>

                 <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label>Intervention Selection</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                       <button onClick={() => setReportData({...reportData, action_type: 'session'})} className={`btn ${reportData.action_type === 'session' ? 'btn-danger' : 'btn-secondary'}`} style={{ flex: 1 }}>Session Needed</button>
                       <button onClick={() => setReportData({...reportData, action_type: 'suggestions'})} className={`btn ${reportData.action_type === 'suggestions' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }}>Send Suggestions</button>
                    </div>
                 </div>

                 <div className="form-group">
                    <label>Report & Suggestions</label>
                    <textarea 
                       className="form-control" 
                       rows="5" 
                       style={{ width: '100%', marginTop: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'white', padding: '0.75rem' }}
                       placeholder="Enter guidance for the student..."
                       value={reportData.suggestions}
                       onChange={(e) => setReportData({...reportData, suggestions: e.target.value})}
                    ></textarea>
                 </div>

                 <button disabled={isSubmitting} onClick={handleSubmitReport} className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Send size={18} /> {isSubmitting ? 'Submitting...' : 'Submit Final Report to DB'}
                 </button>
              </div>
           ) : (
              <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Select a student from the triage queue to begin analysis.</p>
           )}
        </div>
      </div>
    </div>
  );
};

export default CounselorDashboard;
