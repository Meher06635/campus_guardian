import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Could not connect to server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h2>
        
        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '10px', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(239, 68, 68, 0.5)' }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', padding: '10px', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(16, 185, 129, 0.5)' }}>
            Registration successful! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" className="form-input" 
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" className="form-input" 
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" className="form-input" 
              value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select 
              className="form-input" 
              value={formData.role} 
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              style={{ padding: '0.75rem 1rem' }}
            >
              <option value="student">Student</option>
              <option value="counselor">Counselor</option>
              <option value="admin">Admin</option>
              <option value="hostel_manager">Hostel Manager</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading || success}>
            {isLoading ? 'Creating...' : 'Register'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
