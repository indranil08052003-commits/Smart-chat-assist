import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Sparkles, HelpCircle } from 'lucide-react';

const FAQManager = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({ question: '', answer: '', category: 'general' });
  const [showForm, setShowForm] = useState(false);

  const loadFAQs = () => {
    api.get('/faqs').then(res => setFaqs(res.data.faqs)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { loadFAQs(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/faqs', form);
      setFaqs([...faqs, res.data.faq]);
      setForm({ question: '', answer: '', category: 'general' });
      setShowForm(false);
      toast.success('FAQ added!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add FAQ');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/faqs/${id}`);
      setFaqs(faqs.filter(f => f._id !== id));
      toast.success('FAQ deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleAutoGenerate = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/faqs/auto-generate');
      setFaqs([...faqs, ...res.data.faqs]);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Auto-generate failed. Add business info in Settings first.');
    } finally {
      setGenerating(false);
    }
  };

  const categories = ['general', 'pricing', 'hours', 'location', 'services', 'delivery', 'booking'];

  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '40px' }}>
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
          <h1 className="page-title" style={{ fontSize: '1.75rem', margin: 0 }}>Knowledge Base</h1>
          <p className="page-subtitle" style={{ margin: 0, marginTop: '2px' }}>{faqs.length} question-answer pairs training your AI</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn btn-ghost"
            onClick={handleAutoGenerate}
            disabled={generating}
            style={{
              border: '1px solid var(--border)',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.05), transparent)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Sparkles size={16} color="var(--accent)" />
            {generating ? 'Processing...' : 'Auto-Generate'}
            {generating && <div style={{ position: 'absolute', bottom: 0, left: 0, height: '2px', background: 'var(--accent)', animation: 'pulse 1s infinite' }} />}
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} />
            Add Entry
          </button>
        </div>
      </div>

      {/* Modernized Form */}
      {showForm && (
        <div className="card fade-in" style={{
          marginBottom: '32px',
          border: '1px solid var(--accent)',
          background: 'linear-gradient(180deg, var(--bg-card), var(--bg-primary))',
          boxShadow: '0 8px 32px var(--accent-glow)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ padding: '8px', background: 'var(--accent)', borderRadius: '10px', color: 'white' }}>
              <Plus size={18} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>New Knowledge Entry</h3>
          </div>

          <form onSubmit={handleAdd}>
            <div className="form-group">
              <label className="form-label">Customer Question</label>
              <input
                className="form-input"
                placeholder="e.g. What are your opening hours?"
                value={form.question}
                onChange={e => setForm({ ...form, question: e.target.value })}
                required
                style={{ background: 'var(--bg-primary)' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">AI Response</label>
              <textarea
                className="form-input"
                placeholder="e.g. We're open Monday-Friday 9AM-6PM and Saturdays 10AM-4PM."
                value={form.answer}
                onChange={e => setForm({ ...form, answer: e.target.value })}
                required
                rows={4}
                style={{ background: 'var(--bg-primary)' }}
              />
            </div>
            <div className="form-group" style={{ maxWidth: '300px' }}>
              <label className="form-label">Intelligence Category</label>
              <select
                className="form-input"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                style={{ background: 'var(--bg-primary)' }}
              >
                {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <button type="submit" className="btn btn-primary btn-lg" style={{ padding: '12px 28px' }}>Create Record</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Dismiss</button>
            </div>
          </form>
        </div>
      )}

      {/* Styled FAQ Grid/List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', opacity: 0.6 }}>
          <span className="spinner" style={{ width: '40px', height: '40px' }} />
          <p style={{ marginTop: '16px', fontWeight: 500 }}>Synchronizing knowledge base...</p>
        </div>
      ) : faqs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '80px 40px', background: 'var(--bg-secondary)', borderStyle: 'dashed' }}>
          <div style={{ width: '80px', height: '80px', background: 'var(--bg-card)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid var(--border)' }}>
            <HelpCircle size={40} color="var(--text-muted)" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>No Intelligence Records</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '320px', margin: '0 auto 32px' }}>
            Train your AI using manual entries or automatically generate them from your business profile.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} />Add Manually</button>
            <button className="btn btn-ghost" onClick={handleAutoGenerate} disabled={generating}><Sparkles size={16} />{generating ? 'Processing...' : 'AI Generate'}</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqs.map((faq, index) => (
            <div
              key={faq._id}
              className="card fade-in"
              style={{
                display: 'flex',
                gap: '24px',
                alignItems: 'flex-start',
                padding: '24px',
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                transition: 'all 0.2s',
                animation: `fadeIn 0.3s ease forwards ${index * 0.05}s`,
                opacity: 0,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--accent)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span className="badge badge-neutral" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '10px', padding: '2px 10px' }}>{faq.category}</span>
                  {faq.useCount > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
                      Consulted {faq.useCount} times
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent)', opacity: 0.6 }}>Q</span>
                    <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{faq.question}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)', opacity: 0.4 }}>A</span>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '95%' }}>{faq.answer}</p>
                  </div>
                </div>
              </div>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(faq._id)}
                style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center', borderRadius: '10px', background: 'transparent', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FAQManager;
