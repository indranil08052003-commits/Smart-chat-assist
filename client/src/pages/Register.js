import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Bot } from 'lucide-react';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', businessName: '', businessType: 'General' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '20px' }}>
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      
      <div style={{ width: '100%', maxWidth: '440px' }} className="fade-in">
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--accent), #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Bot size={30} color="white" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Get Started Free</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>Set up your AI chatbot in minutes</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input className="form-input" placeholder="John Doe" value={form.name} onChange={update('name')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Business Name</label>
                <input className="form-input" placeholder="My Shop" value={form.businessName} onChange={update('businessName')} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Business Type</label>
              <select className="form-input" value={form.businessType} onChange={update('businessType')}>
                {['General','Restaurant','Retail','Services','Healthcare','Education','Real Estate','E-commerce','Other'].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="you@business.com" value={form.email} onChange={update('email')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Min 6 characters" value={form.password} onChange={update('password')} required minLength={6} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Account →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
