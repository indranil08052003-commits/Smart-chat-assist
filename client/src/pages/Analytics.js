import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: 'var(--text-muted)', padding: '40px' }}>Loading analytics...</p>;

  const topicData = data?.topTopics?.map(t => ({ name: t.intent, count: t.count })) || [];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">ML-powered insights on your customer conversations</p>
      </div>

      <div className="grid-4" style={{ marginBottom: '28px' }}>
        {[
          { label: 'Total Chats', value: data?.stats.totalChats },
          { label: 'Chats Today', value: data?.stats.todayChats },
          { label: 'Avg Response', value: data?.stats.avgResponseTime ? `${(data.stats.avgResponseTime/1000).toFixed(1)}s` : '—' },
          { label: 'Total Leads', value: data?.stats.totalLeads },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-light)' }}>{s.value ?? '—'}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '20px', fontWeight: 600, fontSize: '1rem' }}>Daily Chat Volume</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data?.dailyVolume || []}>
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="chats" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '20px', fontWeight: 600, fontSize: '1rem' }}>Top Customer Intents (ML Clustering)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topicData} layout="vertical">
              <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={80} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
              <Bar dataKey="count" fill="var(--accent)" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '16px', fontWeight: 600, fontSize: '1rem' }}>Sentiment Breakdown</h3>
        <div className="grid-3">
          {[
            { label: 'Positive', count: data?.sentimentBreakdown.positive, color: '#22c55e' },
            { label: 'Neutral', count: data?.sentimentBreakdown.neutral, color: '#6366f1' },
            { label: 'Negative', count: data?.sentimentBreakdown.negative, color: '#ef4444' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '24px', background: 'var(--bg-hover)', borderRadius: '12px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: s.color }}>{s.count ?? 0}</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{s.label} Chats</div>
              <div style={{ height: '4px', background: s.color, borderRadius: '2px', marginTop: '12px', opacity: 0.6 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
