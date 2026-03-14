import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Save, Bot, Building2, Palette } from 'lucide-react';

const Settings = () => {
  const { business, updateBusiness } = useAuth();
  const [saving, setSaving] = useState(false);

  const [businessInfo, setBusinessInfo] = useState({
    openingHours: business?.businessInfo?.openingHours || '',
    address: business?.businessInfo?.address || '',
    services: business?.businessInfo?.services || '',
    pricing: business?.businessInfo?.pricing || '',
    deliveryOptions: business?.businessInfo?.deliveryOptions || '',
    specialOffers: business?.businessInfo?.specialOffers || '',
  });

  const [chatbotConfig, setChatbotConfig] = useState({
    greeting: business?.chatbotConfig?.greeting || 'Hi! How can I help you today? 😊',
    theme: business?.chatbotConfig?.theme || '#6366f1',
    personality: business?.chatbotConfig?.personality || 'friendly',
    botName: business?.chatbotConfig?.botName || 'Assistant',
    autoWhatsappHandoff: business?.chatbotConfig?.autoWhatsappHandoff || false,
    whatsappNumber: business?.chatbotConfig?.whatsappNumber || '',
  });

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put('/business/profile', { businessInfo, chatbotConfig });
      updateBusiness(res.data.business);
      toast.success('Settings saved!');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const Section = ({ icon: Icon, title, description, children }) => (
    <div className="card fade-in" style={{ marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'var(--accent-glow)', filter: 'blur(50px)', opacity: 0.15, borderRadius: '50%' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px', position: 'relative' }}>
        <div style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '12px', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <Icon size={22} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>{title}</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{description}</p>
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="fade-in" style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px',
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
          <h1 className="page-title" style={{ fontSize: '1.75rem', margin: 0 }}>Dashboard Settings</h1>
          <p className="page-subtitle" style={{ margin: 0, marginTop: '2px' }}>Personalize your AI assistant and business profile</p>
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={save}
          disabled={saving}
          style={{ padding: '12px 24px', boxShadow: '0 8px 16px var(--accent-glow)' }}
        >
          {saving ? <span className="spinner" style={{ width: '16px', height: '16px' }} /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Publish Changes'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Section
          icon={Building2}
          title="Business Information"
          description="Detailed information about your business helps the AI provide accurate and context-aware responses to your customers."
        >
          <div className="grid-2" style={{ gap: '24px' }}>
            {[
              { key: 'openingHours', label: 'Opening Hours', placeholder: 'Mon-Fri 9AM-6PM, Sat 10AM-4PM' },
              { key: 'address', label: 'Address', placeholder: '123 Main Street, City, State' },
            ].map(f => (
              <div key={f.key} className="form-group">
                <label className="form-label">{f.label}</label>
                <input className="form-input" placeholder={f.placeholder} value={businessInfo[f.key]} onChange={e => setBusinessInfo({ ...businessInfo, [f.key]: e.target.value })} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { key: 'services', label: 'Services / Products', placeholder: 'We offer haircuts, colouring, styling...', rows: 3 },
              { key: 'pricing', label: 'Pricing Info', placeholder: 'Haircuts from $30, highlights from $80...', rows: 2 },
              { key: 'deliveryOptions', label: 'Delivery Options', placeholder: 'Free delivery above $50, same-day available...', rows: 2 },
              { key: 'specialOffers', label: 'Special Offers', placeholder: '10% off for first-time customers...', rows: 2 },
            ].map(f => (
              <div key={f.key} className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{f.label}</label>
                <textarea
                  className="form-input"
                  placeholder={f.placeholder}
                  rows={f.rows}
                  value={businessInfo[f.key]}
                  onChange={e => setBusinessInfo({ ...businessInfo, [f.key]: e.target.value })}
                  style={{ minHeight: 'unset' }}
                />
              </div>
            ))}
          </div>
        </Section>

        <Section
          icon={Bot}
          title="Chatbot Intelligence"
          description="Configure the name, personality, and behavior of your AI assistant to match your brand's voice."
        >
          <div className="grid-2" style={{ gap: '24px' }}>
            <div className="form-group">
              <label className="form-label">Bot Name</label>
              <input className="form-input" placeholder="Assistant" value={chatbotConfig.botName} onChange={e => setChatbotConfig({ ...chatbotConfig, botName: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Personality</label>
              <select className="form-input" value={chatbotConfig.personality} onChange={e => setChatbotConfig({ ...chatbotConfig, personality: e.target.value })}>
                <option value="friendly">Friendly 😊</option>
                <option value="formal">Formal 💼</option>
                <option value="witty">Witty 😄</option>
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '24px' }}>
            <label className="form-label">Welcome Message</label>
            <textarea className="form-input" value={chatbotConfig.greeting} onChange={e => setChatbotConfig({ ...chatbotConfig, greeting: e.target.value })} rows={3} />
          </div>

          <div style={{
            marginTop: '24px',
            padding: '20px',
            background: 'linear-gradient(to right, var(--bg-secondary), var(--bg-card))',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative', width: '44px', height: '24px' }}>
                <input
                  type="checkbox"
                  id="whatsapp"
                  checked={chatbotConfig.autoWhatsappHandoff}
                  onChange={e => setChatbotConfig({ ...chatbotConfig, autoWhatsappHandoff: e.target.checked })}
                  style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                />
                <label
                  htmlFor="whatsapp"
                  style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: chatbotConfig.autoWhatsappHandoff ? 'var(--accent)' : 'var(--bg-hover)',
                    transition: '.4s',
                    borderRadius: '34px',
                    boxShadow: chatbotConfig.autoWhatsappHandoff ? '0 0 10px var(--accent-glow)' : 'none'
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    height: '18px', width: '18px',
                    left: chatbotConfig.autoWhatsappHandoff ? '22px' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    transition: '.4s',
                    borderRadius: '50%',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </label>
              </div>
              <div>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, display: 'block' }}>WhatsApp Handoff</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Automatically suggest human support when AI detects frustration.</span>
              </div>
            </div>

            {chatbotConfig.autoWhatsappHandoff && (
              <div className="form-group fade-in" style={{ margin: 0, paddingLeft: '60px' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Business WhatsApp Number</label>
                <input
                  className="form-input"
                  placeholder="+1 (234) 567-890"
                  value={chatbotConfig.whatsappNumber}
                  onChange={e => setChatbotConfig({ ...chatbotConfig, whatsappNumber: e.target.value })}
                  style={{ maxWidth: '300px' }}
                />
              </div>
            )}
          </div>
        </Section>

        <Section
          icon={Palette}
          title="Widget Styling"
          description="Customize the look and feel of the chat widget to perfectly integrate with your website's design."
        >
          <div className="form-group">
            <label className="form-label">Primary Brand Color</label>
            <div style={{
              display: 'flex',
              gap: '24px',
              alignItems: 'center',
              background: 'var(--bg-secondary)',
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid var(--border)'
            }}>
              <div style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '16px', overflow: 'hidden', border: '2px solid var(--border)' }}>
                <input
                  type="color"
                  value={chatbotConfig.theme}
                  onChange={e => setChatbotConfig({ ...chatbotConfig, theme: e.target.value })}
                  style={{
                    position: 'absolute', top: '-5px', left: '-5px', width: '140%', height: '140%',
                    cursor: 'pointer', border: 'none', background: 'none'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <input
                  className="form-input mono"
                  value={chatbotConfig.theme}
                  onChange={e => setChatbotConfig({ ...chatbotConfig, theme: e.target.value })}
                  style={{ maxWidth: '140px', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.05em' }}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Select a color that matches your company's branding.</p>
              </div>
              <div style={{
                width: '120px',
                height: '64px',
                borderRadius: '16px',
                background: chatbotConfig.theme,
                boxShadow: `0 8px 24px ${chatbotConfig.theme}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                Preview
              </div>
            </div>
          </div>
        </Section>
      </div>
      <div style={{ height: '40px' }} />
    </div>
  );
};

export default Settings;
