import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, MessageSquare, HelpCircle, Users,
  BarChart3, Settings, LogOut, Bot, Menu, X, ChevronRight
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/chats', icon: MessageSquare, label: 'Chat History' },
  { to: '/faqs', icon: HelpCircle, label: 'FAQ Manager' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const Layout = () => {
  const { business, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '240px' : '72px',
        minWidth: sidebarOpen ? '240px' : '72px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Bot size={20} color="white" />
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>SmartChat</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Assist</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex' }}
          >
            {sidebarOpen ? <ChevronRight size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: '10px',
                color: isActive ? 'var(--accent-light)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} style={{ flexShrink: 0, color: isActive ? 'var(--accent)' : 'inherit' }} />
                  {sidebarOpen && label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          {sidebarOpen && (
            <div style={{ padding: '10px 12px', marginBottom: '4px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{business?.businessName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{business?.email}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 12px', borderRadius: '10px', width: '100%',
              background: 'none', border: 'none', color: 'var(--danger)',
              cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
            }}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', padding: '28px 32px', background: 'var(--bg-primary)' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
