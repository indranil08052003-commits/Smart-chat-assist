import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Download, MessageSquare } from 'lucide-react';

const ChatHistory = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [chatDetail, setChatDetail] = useState(null);

  useEffect(() => {
    api.get('/chat').then(r => setChats(r.data.chats)).finally(() => setLoading(false));
  }, []);

  const openChat = async (chatId) => {
    setSelected(chatId);
    const res = await api.get(`/chat/${chatId}`);
    setChatDetail(res.data.chat);
  };

  const exportCSV = () => {
    window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/chat/export/csv`, '_blank');
  };

  const sentimentClass = { positive: 'badge-positive', negative: 'badge-negative', neutral: 'badge-neutral' };

  return (
    <div className="fade-in" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '40px' }}>
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
          <h1 className="page-title" style={{ fontSize: '1.75rem', margin: 0 }}>Conversations</h1>
          <p className="page-subtitle" style={{ margin: 0, marginTop: '2px' }}>{chats.length} interactive sessions stored</p>
        </div>
        <button className="btn btn-ghost" onClick={exportCSV} style={{ padding: '10px 20px', borderRadius: '12px' }}>
          <Download size={18} style={{ marginRight: '4px' }} />
          Export Data (.csv)
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1.1fr 0.9fr' : '1fr', gap: '24px', alignItems: 'start' }}>
        {/* List Card */}
        <div className="card fade-in" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>History Feed</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: 'var(--bg-primary)' }}>
                  <th style={{ padding: '16px 24px' }}>Visitor Entity</th>
                  <th style={{ padding: '16px 12px' }}>msgs</th>
                  <th style={{ padding: '16px 12px' }}>Sentiment</th>
                  <th style={{ padding: '16px 12px' }}>Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px' }}>
                    <span className="spinner" style={{ margin: '0 auto 12px', width: '30px', height: '30px' }} />
                    <div style={{ marginTop: '12px' }}>Fetching records...</div>
                  </td></tr>
                ) : chats.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '80px 20px' }}>
                    <MessageSquare size={48} style={{ margin: '0 auto 16px', color: 'var(--border)', display: 'block' }} />
                    <div style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-muted)' }}>No conversations found</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Your chat history will appear here once users start interacting.</div>
                  </td></tr>
                ) : chats.map(c => (
                  <tr
                    key={c._id}
                    onClick={() => openChat(c._id)}
                    style={{
                      cursor: 'pointer',
                      background: selected === c._id ? 'var(--bg-hover)' : 'transparent',
                      transition: 'background 0.2s',
                    }}
                  >
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '10px',
                          background: selected === c._id ? 'var(--accent)' : 'var(--bg-secondary)',
                          color: selected === c._id ? 'white' : 'var(--accent)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                          fontSize: '0.9rem', border: '1px solid var(--border)'
                        }}>
                          {(c.visitorName || 'A')[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: selected === c._id ? 'var(--accent-light)' : 'var(--text-primary)' }}>{c.visitorName || 'Anonymous Visitor'}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--mono)' }}>{c.visitorEmail || c.sessionId.slice(-12)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{c.messageCount}</span>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      {c.sentiment?.label && <span className={`badge ${sentimentClass[c.sentiment.label]}`} style={{ textTransform: 'capitalize' }}>{c.sentiment.label}</span>}
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '10px', padding: '2px 8px' }}>{c.status}</span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chat Detail View */}
        {selected && (
          <div className="card fade-in" style={{
            maxHeight: '750px',
            height: '750px',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)',
            position: 'sticky',
            top: '120px'
          }}>
            <div style={{
              padding: '20px 24px',
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Inspection Panel</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
                  Viewing detailed sequence
                </div>
              </div>
              <button
                className="btn btn-ghost"
                onClick={() => { setSelected(null); setChatDetail(null); }}
                style={{ width: '32px', height: '32px', borderRadius: '50%', padding: 0, justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              background: 'linear-gradient(to bottom, var(--bg-card), var(--bg-primary))'
            }}>
              {!chatDetail ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  <span className="spinner" style={{ marginBottom: '16px' }} />
                  Loading conversation...
                </div>
              ) : chatDetail.messages?.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    animation: `fadeIn 0.3s ease forwards ${i * 0.05}s`,
                    opacity: 0
                  }}
                >
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
                  }}>
                    <div style={{
                      background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-secondary)',
                      color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                      padding: '12px 18px',
                      borderRadius: msg.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                      fontSize: '0.9rem',
                      lineHeight: 1.6,
                      border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                      boxShadow: msg.role === 'user' ? `0 4px 15px ${chatbotConfig?.theme || '#6366f1'}40` : 'none',
                    }}>
                      {msg.content}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.65rem',
                      color: 'var(--text-muted)',
                      marginTop: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {msg.role === 'user' ? (
                        <>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {msg.intent || 'Message'}
                          <span style={{ fontSize: '10px' }}>👤</span>
                        </>
                      ) : (
                        <>
                          <span style={{ fontSize: '10px' }}>🤖</span>
                          AI Assistant · {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '16px 24px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.75rem', flex: 1 }}>
                <span style={{ color: 'var(--text-muted)' }}>Sentiment:</span> <span className={`badge ${sentimentClass[chatDetail?.sentiment?.label] || 'badge-neutral'}`} style={{ marginLeft: '4px', transform: 'scale(0.85)' }}>{chatDetail?.sentiment?.label || 'Unknown'}</span>
              </div>
              <div style={{ padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.75rem', flex: 1 }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span> <span style={{ marginLeft: '4px', fontWeight: 600, color: 'var(--success)' }}>Complete</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
