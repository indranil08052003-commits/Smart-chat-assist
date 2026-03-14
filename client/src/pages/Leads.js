import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Download, Users } from 'lucide-react';

const statusOptions = ['new', 'contacted', 'converted', 'lost'];
const statusColors = { new: 'badge-new', contacted: 'badge-neutral', converted: 'badge-positive', lost: 'badge-negative' };

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leads').then(r => setLeads(r.data.leads)).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await api.put(`/leads/${id}/status`, { status });
      setLeads(leads.map(l => l._id === id ? res.data.lead : l));
      toast.success('Lead updated');
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const exportCSV = () => window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/leads/export/csv`, '_blank');

  return (
    <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        background: 'var(--bg-secondary)',
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
        position: 'sticky',
        top: '20px',
        zIndex: 10,
        backdropFilter: 'blur(10px)'
      }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', margin: 0 }}>Projected Leads</h1>
          <p className="page-subtitle" style={{ margin: 0, marginTop: '2px' }}>{leads.length} potential customers captured via AI</p>
        </div>
        <button className="btn btn-ghost" onClick={exportCSV} style={{ padding: '10px 20px', borderRadius: '12px' }}>
          <Download size={18} style={{ marginRight: '6px' }} />
          Export Leads (.csv)
        </button>
      </div>

      <div className="card fade-in" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-glow)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CRM Database</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time visitor contact information extraction</p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: 'var(--bg-primary)' }}>
                <th style={{ padding: '16px 24px' }}>Contact Identity</th>
                <th style={{ padding: '16px 12px' }}>Phone / Mobile</th>
                <th style={{ padding: '16px 12px' }}>Channel</th>
                <th style={{ padding: '16px 12px' }}>Pipeline Status</th>
                <th style={{ padding: '16px 24px', textAlign: 'right' }}>Date Captured</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
                  <span className="spinner" style={{ margin: '0 auto 16px', width: '32px', height: '32px' }} />
                  <div>Processing lead data...</div>
                </td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-muted)' }}>
                  <div style={{ padding: '24px', background: 'var(--bg-secondary)', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid var(--border)' }}>
                    <Users size={40} style={{ color: 'var(--border)' }} />
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>No prospects captured yet</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '6px', maxWidth: '300px', margin: '8px auto 0' }}>The AI Assistant will automatically extract contact details during conversations.</div>
                </td></tr>
              ) : leads.map((lead, index) => (
                <tr
                  key={lead._id}
                  style={{
                    transition: 'all 0.2s',
                    animation: `fadeIn 0.3s ease forwards ${index * 0.05}s`,
                    opacity: 0
                  }}
                >
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, var(--bg-hover), var(--bg-secondary))',
                        color: 'var(--text-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '1rem', border: '1px solid var(--border)'
                      }}>
                        {(lead.name || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{lead.name || 'Anonymous User'}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--mono)' }}>{lead.email || 'no-email-provided'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{lead.phone || '—'}</span>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{lead.source || 'Direct'}</span>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <select
                        value={lead.status}
                        onChange={e => updateStatus(lead._id, e.target.value)}
                        style={{
                          appearance: 'none',
                          background: lead.status === 'converted' ? 'var(--success)' : lead.status === 'lost' ? 'var(--danger)' : 'var(--bg-hover)',
                          color: lead.status === 'converted' || lead.status === 'lost' ? 'white' : 'var(--text-primary)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '6px 28px 6px 12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: lead.status === 'converted' ? '0 4px 12px rgba(34,197,94,0.3)' : 'none'
                        }}
                      >
                        {statusOptions.map(s => <option key={s} value={s} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                      <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '8px', opacity: 0.6 }}>▼</div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(lead.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leads;
