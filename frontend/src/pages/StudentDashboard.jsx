import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileUp, FileText, CheckCircle, XCircle, AlertCircle, LayoutDashboard, Info, Loader } from 'lucide-react';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State for manual inputs
  const [formData, setFormData] = useState({
    cgpa: '',
    attendance: '',
    department: '',
    semester: ''
  });
  
  // State for file uploads
  const [files, setFiles] = useState([]);
  const [counselingNeeded, setCounselingNeeded] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [finalReports, setFinalReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = "http://127.0.0.1:5000/api";

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/student/my-reports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setFinalReports(res.data);
      if (res.data.length === 0) {
          // If no reports, check if we have a pending submission
          // For the sake of the hackathon demo, we check a local flag
          const status = localStorage.getItem('student_submission_status');
          if (status) setIsSubmitted(true);
      }
    } catch (err) {
      console.error("Error fetching reports", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    const validFiles = uploadedFiles.filter(f => 
      f.type === 'application/pdf' || f.type.startsWith('image/')
    );
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const submitToAdmin = async () => {
    const { cgpa, attendance, department, semester } = formData;
    if (!cgpa || !attendance || !department || !semester || !counselingNeeded) {
      alert("Please fill in all fields.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/student/submit`, {
        ...formData,
        counselingRequested: counselingNeeded === 'needed'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      localStorage.setItem('student_submission_status', 'submitted');
      setIsSubmitted(true);
      alert("Data successfully submitted to Database!");
    } catch (err) {
      alert("Submission failed: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '5rem' }}><Loader className="spin-animation" /></div>;

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LayoutDashboard color="var(--primary)" /> Student Portal
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>Welcome, {user?.name || 'Student'}</span>
          <button onClick={() => {logout(); navigate('/');}} className="btn btn-secondary">Logout</button>
        </div>
      </div>

      <div className="grid grid-cols-2">
        {/* Left Side: Submission Form */}
        <div className="glass-panel animate-fade-in">
          <h2>Academic & Health Data</h2>
          {!isSubmitted ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
               <input name="department" placeholder="Department" value={formData.department} onChange={handleInputChange} className="form-control" />
               <input name="semester" placeholder="Semester" value={formData.semester} onChange={handleInputChange} className="form-control" />
               <div style={{ display: 'flex', gap: '1rem' }}>
                  <input type="number" name="cgpa" placeholder="CGPA" value={formData.cgpa} onChange={handleInputChange} className="form-control" />
                  <input type="number" name="attendance" placeholder="Attendance %" value={formData.attendance} onChange={handleInputChange} className="form-control" />
               </div>
               
               <div style={{ border: '2px dashed var(--border)', padding: '1rem', textAlign: 'center', borderRadius: '8px' }}>
                  <input type="file" multiple onChange={handleFileUpload} style={{ display: 'none' }} id="file-upload" />
                  <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                     <FileUp size={24} color="var(--text-muted)" />
                     <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Upload Proof (PDF/Images)</p>
                  </label>
                  {files.length > 0 && <p style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{files.length} files selected</p>}
               </div>

               <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button onClick={() => setCounselingNeeded('needed')} className={`btn ${counselingNeeded === 'needed' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }}>Need Counseling</button>
                  <button onClick={() => setCounselingNeeded('not_needed')} className={`btn ${counselingNeeded === 'not_needed' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }}>Not Needed</button>
               </div>

               <button disabled={isSubmitting} onClick={submitToAdmin} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  {isSubmitting ? 'Submitting...' : 'Submit to Admin Desk'}
               </button>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
               <AlertCircle color="var(--warning)" size={48} style={{ margin: '0 auto' }} />
               <h3 style={{ marginTop: '1rem' }}>Submission Received</h3>
               <p style={{ color: 'var(--text-muted)' }}>Your data is securely stored in the database and is being reviewed by the Administration.</p>
            </div>
          )}
        </div>

        {/* Right Side: Reports */}
        <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
           <h2>The Intervention Reports</h2>
           {finalReports.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                 {finalReports.map(report => (
                    <div key={report.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid var(--secondary)' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>Counselor Guidance</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(report.created_at).toLocaleDateString()}</span>
                       </div>
                       <p style={{ marginBottom: '1.5rem' }}>{report.report_text}</p>
                       <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                          <h4 style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>AI RISK ANALYSIS:</h4>
                          <pre style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{report.ai_risk_report}</pre>
                       </div>
                    </div>
                 ))}
              </div>
           ) : (
              <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No finalized reports available yet.</p>
           )}
        </div>
      </div>
      
      <style>{`
        .form-control { width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 4px; color: white; }
        .spin-animation { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default StudentDashboard;
