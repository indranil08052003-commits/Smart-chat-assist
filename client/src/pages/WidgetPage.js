import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// sessionId is normally passed in via ?sid=... by the parent widget.js script
// (generated on the host page's own first-party storage). fromUrl is that
// value, read with useSearchParams() inside the component below. The
// localStorage path here is only a fallback for someone opening this widget
// URL directly (e.g. testing), not the primary embedded flow.
const getSessionId = (fromUrl) => {
  if (fromUrl) return fromUrl;
  try {
    let id = localStorage.getItem('chat_session');
    if (!id) {
      id = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('chat_session', id);
    }
    return id;
  } catch {
    return `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
};


const WidgetPage = () => {
  const { businessId } = useParams();
  const [searchParams] = useSearchParams();
  const [config, setConfig] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [connected, setConnected] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', email: '' });
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [handoff, setHandoff] = useState(null);
  const socketRef = useRef(null);
  const sessionId = useRef(getSessionId(searchParams.get('sid')));
  const messageCountRef = useRef(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    // Load business config
    axios.get(`${API_URL}/api/widget/${businessId}/config`)
      .then(res => setConfig(res.data))
      .catch(() => setConfig({ businessName: 'Business', botName: 'Assistant', theme: '#6366f1', greeting: 'Hi! How can I help you today? 😊' }));
  }, [businessId]);

  useEffect(() => {
    // Connect socket as soon as we know which business this is - we don't
    // need the REST-fetched config first, since the server sends its own
    // 'business_config' event right after join_chat anyway.
    if (!businessId) return;

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_chat', { businessId, sessionId: sessionId.current });
    });

    socket.on('disconnect', () => setConnected(false));

    // IMPORTANT: this updates `config`, which used to also be a dependency of
    // this same effect below. That created an infinite reconnect loop: this
    // event fires -> setConfig creates a new object -> effect deps change ->
    // cleanup disconnects the socket -> effect re-runs -> connects again ->
    // join_chat -> server sends business_config again -> repeat forever.
    // Fixed by depending only on `businessId` (see the dependency array).
    socket.on('business_config', (cfg) => setConfig(prev => ({ ...prev, ...cfg })));

    socket.on('chat_history', (msgs) => {
      setMessages(msgs.filter(m => m.role !== 'system').map(m => ({
        id: Date.now() + Math.random(),
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        intent: m.intent,
      })));
    });

    socket.on('bot_message', (msg) => {
      setTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: msg.content,
        timestamp: msg.timestamp,
        intent: msg.intent,
      }]);

      // Show lead form after 3 bot messages. Uses a ref (not a local
      // variable) so the count survives re-renders instead of resetting.
      messageCountRef.current += 1;
      if (messageCountRef.current === 3 && !leadCaptured) setShowLeadForm(true);
    });

    socket.on('bot_typing', (isTyping) => setTyping(isTyping));

    socket.on('handoff_trigger', (data) => {
      setHandoff(data);
      setTyping(false);
    });

    socket.on('feedback_received', (data) => {
      setFeedback(data.message);
      setShowFeedback(false);
    });

    socket.on('error', (err) => console.error('Socket error:', err));

    return () => socket.disconnect();
  }, [businessId]);

  const sendMessage = () => {
    if (!input.trim() || !connected) return;
    const content = input.trim();
    setInput('');

    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      content,
      timestamp: new Date(),
    }]);

    socketRef.current?.emit('send_message', {
      sessionId: sessionId.current,
      content,
      visitorName: leadForm.name || undefined,
      visitorEmail: leadForm.email || undefined,
    });
  };

  const submitLeadForm = () => {
    if (!leadForm.name && !leadForm.email) { setShowLeadForm(false); return; }
    setLeadCaptured(true);
    setShowLeadForm(false);
    socketRef.current?.emit('send_message', {
      sessionId: sessionId.current,
      content: `My name is ${leadForm.name || 'a visitor'}${leadForm.email ? ' and my email is ' + leadForm.email : ''}.`,
      visitorName: leadForm.name,
      visitorEmail: leadForm.email,
    });
  };

  const submitFeedback = () => {
    socketRef.current?.emit('submit_feedback', {
      sessionId: sessionId.current,
      rating,
      comment: '',
    });
  };

  const theme = config?.theme || '#6366f1';

  if (!config) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f1a', color: '#888' }}>
      Loading...
    </div>
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a14', fontFamily: "'Space Grotesk', sans-serif", overflow: 'hidden' }}>
      {/* Import font */}
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ padding: '16px 20px', background: theme, display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🤖</div>
        <div>
          <div style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>{config.botName || 'Assistant'}</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>
            {config.businessName} · {connected ? '🟢 Online' : '🔴 Reconnecting...'}
          </div>
        </div>
        <button
          onClick={() => setShowFeedback(true)}
          style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', cursor: 'pointer' }}
        >
          Rate Chat
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#666', marginTop: '40px', fontSize: '0.875rem' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
            Start a conversation...
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', animation: 'fadeIn 0.25s ease' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: theme, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', marginRight: '8px', flexShrink: 0, alignSelf: 'flex-end' }}>🤖</div>
            )}
            <div style={{
              maxWidth: '78%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user' ? theme : '#1e1e2e',
              color: msg.role === 'user' ? 'white' : '#e0e0ff',
              fontSize: '0.875rem',
              lineHeight: 1.6,
            }}>
              {msg.content}
              {msg.intent && msg.role === 'assistant' && (
                <div style={{ marginTop: '6px', fontSize: '0.7rem', opacity: 0.5 }}>#{msg.intent}</div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {typing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: theme, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🤖</div>
            <div style={{ background: '#1e1e2e', borderRadius: '16px', padding: '12px 16px', display: 'flex', gap: '4px' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: theme, animation: 'pulse 1.4s ease infinite', animationDelay: `${i*0.2}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* WhatsApp handoff */}
        {handoff && (
          <div style={{ background: '#1a2a1a', border: '1px solid #2d4a2d', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
            <p style={{ color: '#86efac', marginBottom: '12px', fontSize: '0.875rem' }}>🟢 Connect with our team on WhatsApp for better assistance!</p>
            <a
              href={`https://wa.me/${handoff.number?.replace(/\D/g,'')}`}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#25d366', color: 'white', padding: '10px 20px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}
            >
              📱 Open WhatsApp
            </a>
          </div>
        )}

        {/* Lead capture form */}
        {showLeadForm && !leadCaptured && (
          <div style={{ background: '#1a1a2e', border: `1px solid ${theme}40`, borderRadius: '12px', padding: '16px', animation: 'fadeIn 0.3s ease' }}>
            <p style={{ color: '#c0c0ff', fontSize: '0.85rem', marginBottom: '12px', fontWeight: 500 }}>👋 Can I get your name and email to follow up?</p>
            <input
              placeholder="Your name"
              value={leadForm.name}
              onChange={e => setLeadForm({...leadForm, name: e.target.value})}
              style={{ width: '100%', background: '#252535', border: '1px solid #333', borderRadius: '8px', padding: '8px 12px', color: 'white', fontSize: '0.85rem', marginBottom: '8px', outline: 'none' }}
            />
            <input
              type="email"
              placeholder="Email address (optional)"
              value={leadForm.email}
              onChange={e => setLeadForm({...leadForm, email: e.target.value})}
              style={{ width: '100%', background: '#252535', border: '1px solid #333', borderRadius: '8px', padding: '8px 12px', color: 'white', fontSize: '0.85rem', marginBottom: '12px', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={submitLeadForm} style={{ flex: 1, background: theme, color: 'white', border: 'none', borderRadius: '8px', padding: '8px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}>Share</button>
              <button onClick={() => setShowLeadForm(false)} style={{ background: '#252535', color: '#888', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '0.85rem', cursor: 'pointer' }}>Skip</button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {showFeedback && !feedback && (
          <div style={{ background: '#1a1a2e', border: `1px solid ${theme}40`, borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
            <p style={{ color: '#c0c0ff', fontSize: '0.875rem', marginBottom: '12px' }}>How was your experience?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setRating(n)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', opacity: n <= rating ? 1 : 0.3 }}>⭐</button>
              ))}
            </div>
            <button onClick={submitFeedback} disabled={!rating} style={{ background: theme, color: 'white', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', fontSize: '0.875rem' }}>Submit</button>
          </div>
        )}

        {feedback && <p style={{ textAlign: 'center', color: '#22c55e', fontSize: '0.875rem' }}>{feedback}</p>}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', background: '#111120', borderTop: '1px solid #1e1e2e', display: 'flex', gap: '10px', flexShrink: 0 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Type a message..."
          disabled={!connected}
          style={{
            flex: 1, background: '#1e1e2e', border: '1px solid #2e2e45', borderRadius: '12px',
            padding: '12px 16px', color: 'white', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || !connected}
          style={{
            width: '44px', height: '44px', borderRadius: '12px', background: input.trim() ? theme : '#252535',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', flexShrink: 0, transition: 'background 0.2s',
          }}
        >
          ➤
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2e2e45; border-radius: 2px; }
      `}</style>
    </div>
  );
};

export default WidgetPage;
