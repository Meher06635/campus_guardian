import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Simulate API call for hackathon or use actual
    const result = await login(email, password);
    
    if (result.success) {
      if (result.role === 'student') navigate('/student');
      else if (result.role === 'admin') navigate('/admin');
      else if (result.role === 'counselor') navigate('/counselor');
      else if (result.role === 'hostel_manager') navigate('/hostel');
      else navigate('/');
    } else {
      setError(result.message || 'Failed to login');
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Welcome Back</h2>
        
        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '10px', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(239, 68, 68, 0.5)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email"
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter your password"
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Register here</Link>
        </p>
        
        <div style={{marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center'}}>
          <p>Hackathon Demo Accounts:</p>
          <p>student@test.com / student</p>
          <p>admin@test.com / admin</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
