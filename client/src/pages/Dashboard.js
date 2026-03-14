import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { MessageSquare, Users, TrendingUp, Clock, Zap, AlertTriangle, Info, Lightbulb } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StatCard = ({ icon: Icon, label, value, sub, color = 'var(--accent)' }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <div style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.2 }}>{value ?? '—'}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{sub}</div>}
    </div>
  </div>
);

const insightIcons = { alert: AlertTriangle, info: Info, suggestion: Lightbulb };
const insightColors = { alert: 'var(--danger)', info: 'var(--accent-light)', suggestion: 'var(--warning)' };
const SENTIMENT_COLORS = { positive: '#22c55e', neutral: '#6366f1', negative: '#ef4444' };

const Dashboard = () => {
  const { business } = useAuth();
  const [data, setData] = useState(null);
  const [embedCode, setEmbedCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/analytics/dashboard'), api.get('/business/embed-code')])
      .then(([analyticsRes, embedRes]) => {
        setData(analyticsRes.data);
        setEmbedCode(embedRes.data.scriptTag);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Loading dashboard...</div>;

  const sentimentData = data ? [
    { name: 'Positive', value: data.sentimentBreakdown.positive },
    { name: 'Neutral', value: data.sentimentBreakdown.neutral },
    { name: 'Negative', value: data.sentimentBreakdown.negative },
  ] : [];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Welcome back, {business?.name}! 👋</h1>
        <p className="page-subtitle">{business?.businessName} · AI-powered customer support</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard icon={MessageSquare} label="Total Chats" value={data?.stats.totalChats} sub={`${data?.stats.todayChats} today`} />
        <StatCard icon={Users} label="Total Leads" value={data?.stats.totalLeads} color="#22c55e" />
        <StatCard icon={Clock} label="Avg Response" value={data?.stats.avgResponseTime ? `${(data.stats.avgResponseTime/1000).toFixed(1)}s` : '—'} color="#f59e0b" />
        <StatCard icon={TrendingUp} label="Avg Rating" value={data?.stats.avgRating ? `${data.stats.avgRating}⭐` : '—'} color="#a855f7" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Chat volume chart */}
        <div className="card">
          <h3 style={{ marginBottom: '20px', fontSize: '1rem', fontWeight: 600 }}>Chat Volume (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.dailyVolume || []}>
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
              <Bar dataKey="chats" fill="var(--accent)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment pie */}
        <div className="card">
          <h3 style={{ marginBottom: '20px', fontSize: '1rem', fontWeight: 600 }}>Sentiment Analysis</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                {sentimentData.map((entry, i) => (
                  <Cell key={i} fill={SENTIMENT_COLORS[entry.name.toLowerCase()]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {sentimentData.map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: SENTIMENT_COLORS[s.name.toLowerCase()] }} />
                {s.name}: {s.value}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* AI Insights */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Zap size={18} color="var(--accent)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>AI Coach Insights</h3>
          </div>
          {data?.insights?.length > 0 ? data.insights.map((insight, i) => {
            const Icon = insightIcons[insight.type] || Info;
            const color = insightColors[insight.type] || 'var(--text-secondary)';
            return (
              <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', background: 'var(--bg-hover)', borderRadius: '10px', marginBottom: '8px' }}>
                <Icon size={16} color={color} style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{insight.message}</p>
              </div>
            );
          }) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No insights yet. Start chatting to get AI-powered recommendations!</p>
          )}
        </div>

        {/* Embed code */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>Embed Your Chatbot</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
            Copy this code and paste it before your website's &lt;/body&gt; tag:
          </p>
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--accent-light)', wordBreak: 'break-all', marginBottom: '12px' }}>
            {embedCode || 'Loading embed code...'}
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { navigator.clipboard.writeText(embedCode); }}
          >
            Copy Code
          </button>
          <Link to="/settings" className="btn btn-ghost btn-sm" style={{ marginLeft: '8px' }}>
            Customize Widget →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
