import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ChatHistory from './pages/ChatHistory';
import FAQManager from './pages/FAQManager';
import Leads from './pages/Leads';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import WidgetPage from './pages/WidgetPage';
import Layout from './components/Layout';
import './index.css';

const PrivateRoute = ({ children }) => {
  const { business, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#0f0f1a' }}>
      <div style={{ color:'#6366f1', fontSize:'1.2rem' }}>Loading SmartChat Assist...</div>
    </div>
  );
  return business ? children : <Navigate to="/login" />;
};

const App = () => (
  <AuthProvider>
    <Router>
      <Toaster position="top-right" toastOptions={{ style: { background:'#1e1e2e', color:'#fff', border:'1px solid #333' }}} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/widget/:businessId" element={<WidgetPage />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="chats" element={<ChatHistory />} />
          <Route path="faqs" element={<FAQManager />} />
          <Route path="leads" element={<Leads />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
