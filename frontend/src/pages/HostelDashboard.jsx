import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building, Zap, RefreshCw, AlertTriangle, Users, Coffee } from 'lucide-react';

const HostelDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [messData, setMessData] = useState(null);

  // Advanced Mock State for 3-Bed Rooms
  const [rooms, setRooms] = useState([
      { id: '101', students: 3, capacity: 3 },
      { id: '102', students: 2, capacity: 3 },
      { id: '103', students: 1, capacity: 3 },
      { id: '104', students: 3, capacity: 3 },
      { id: '105', students: 0, capacity: 3 },
      { id: '106', students: 2, capacity: 3 },
  ]);

  const [isAlgorithmRunning, setIsAlgorithmRunning] = useState(false);
  const API_BASE = "http://127.0.0.1:5000/api";

  useEffect(() => {
    fetchMessStatus();
  }, []);

  const fetchMessStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/hostel/mess-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runAllocationAlgorithm = async () => {
      setIsAlgorithmRunning(true);
      try {
          const token = localStorage.getItem('token');
          const res = await axios.post(`${API_BASE}/hostel/optimize-rooms`, {}, {
             headers: { 'Authorization': `Bearer ${token}` }
          });
          
          // Simulation: Merge 102 (2) and 103 (1) into one full room
          setTimeout(() => {
              const newRooms = [...rooms];
              newRooms[1].students = 3; // 102 becomes full
              newRooms[2].students = 0; // 103 becomes vacant
              setRooms(newRooms);
              setIsAlgorithmRunning(false);
              alert(res.data.message);
          }, 2000);
      } catch (err) {
          alert("Optimization failed");
          setIsAlgorithmRunning(false);
      }
  };

  const totalBeds = rooms.length * 3;
  const occupiedBeds = rooms.reduce((acc, r) => acc + r.students, 0);
  const electricityUsage = 50 + (occupiedBeds * 40); // Base + per student logic

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Hostel Hub & Resources</h1>
        <button onClick={() => {logout(); navigate('/');}} className="btn btn-secondary">Logout</button>
      </div>

      <div className="grid grid-cols-2">
        {/* Resource Analytics */}
        <div className="glass-panel animate-fade-in">
           <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap /> Consumption Analytics</h2>
           <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Occupancy Rate ({occupiedBeds}/{totalBeds})</span>
                    <span style={{ fontWeight: 'bold' }}>{((occupiedBeds/totalBeds)*100).toFixed(0)}%</span>
                 </div>
                 <div className="progress-bar"><div className="progress-fill" style={{ width: `${(occupiedBeds/totalBeds)*100}%` }}></div></div>
              </div>
              
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Predicted Electricity Bill</span>
                    <span style={{ fontWeight: 'bold' }}>{electricityUsage} kWh</span>
                 </div>
                 <div className="progress-bar"><div className="progress-fill" style={{ width: '65%', backgroundColor: 'var(--warning)' }}></div></div>
              </div>

              {messData && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--secondary)' }}>
                   <h3 style={{ fontSize: '0.9rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Coffee size={16} /> MESS ATTENDANCE REPORT
                   </h3>
                   <div style={{ marginTop: '0.5rem' }}>
                      Daily Headcount: <strong>{messData.mess_attendance}</strong> / {messData.total_students}
                   </div>
                </div>
              )}
           </div>
        </div>

        {/* Room Matrix */}
        <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
           <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Building /> 3-Bed Room Matrix</span>
               <button onClick={runAllocationAlgorithm} disabled={isAlgorithmRunning} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem' }}>
                  <RefreshCw size={14} className={isAlgorithmRunning ? 'spin-animation' : ''} /> Optimize
               </button>
           </h2>

           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
              {rooms.map(room => (
                 <div key={room.id} style={{ 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    background: room.students === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.3)',
                    border: room.students === 0 ? '1px dashed var(--border)' : '1px solid var(--border)',
                    textAlign: 'center'
                 }}>
                    <strong style={{ display: 'block' }}>R-{room.id}</strong>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>Beds: {room.students}/3</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
                       {[...Array(3)].map((_, i) => (
                          <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i < room.students ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }}></div>
                       ))}
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>
      <style>{`
        .spin-animation { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default HostelDashboard;
