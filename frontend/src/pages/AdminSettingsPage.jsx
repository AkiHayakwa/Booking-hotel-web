import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import './AdminSettingsPage.css';

const NOTIF_ROWS = [
  { id: 'booking_confirmed', label: 'New Booking Confirmed', email: true,  system: true  },
  { id: 'booking_cancel',    label: 'Booking Cancellation',  email: true,  system: true  },
  { id: 'user_report',       label: 'New User Reports',      email: false, system: true  },
  { id: 'maintenance',       label: 'Platform Maintenance',  email: true,  system: true  },
];

function ToggleSwitch({ id, checked, onChange }) {
  return (
    <label className="settings-toggle-label" htmlFor={id}>
      <input id={id} type="checkbox" className="settings-toggle-input" checked={checked} onChange={onChange} />
      <span className="settings-toggle-track">
        <span className="settings-toggle-thumb" />
      </span>
    </label>
  );
}

export default function AdminSettingsPage() {
  const [siteName,      setSiteName]      = useState('LuxStay Booking');
  const [contactEmail,  setContactEmail]  = useState('admin@luxstay.com');
  const [phone,         setPhone]         = useState('+84 24 1234 5678');
  const [currency,      setCurrency]      = useState('VND');
  const [taxRate,       setTaxRate]       = useState(10);
  const [cancelPolicy,  setCancelPolicy]  = useState(
    'Free cancellation up to 48 hours before check-in. Cancellations within 48 hours will incur a 50% charge of the first night.'
  );
  const [twoFa,         setTwoFa]         = useState(true);
  const [notifs,        setNotifs]        = useState(
    Object.fromEntries(NOTIF_ROWS.map(r => [r.id, { email: r.email, system: r.system }]))
  );
  const [toastVisible,  setToastVisible]  = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('admin_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.siteName) setSiteName(parsed.siteName);
        if (parsed.contactEmail) setContactEmail(parsed.contactEmail);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.currency) setCurrency(parsed.currency);
        if (parsed.taxRate !== undefined) setTaxRate(parsed.taxRate);
        if (parsed.cancelPolicy) setCancelPolicy(parsed.cancelPolicy);
        if (parsed.twoFa !== undefined) setTwoFa(parsed.twoFa);
        if (parsed.notifs) setNotifs(parsed.notifs);
      } catch(e) { console.error('Error parsing settings', e) }
    }
  }, []);

  const toggleNotif = (id, channel) =>
    setNotifs(prev => ({ ...prev, [id]: { ...prev[id], [channel]: !prev[id][channel] } }));

  const handleSave = () => {
    const settingsObj = {
      siteName, contactEmail, phone, currency, taxRate, cancelPolicy, twoFa, notifs
    };
    localStorage.setItem('admin_settings', JSON.stringify(settingsObj));
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleDiscard = () => {
    setSiteName('LuxStay Booking');
    setContactEmail('admin@luxstay.com');
    setPhone('+84 24 1234 5678');
    setCurrency('VND');
    setTaxRate(10);
    setCancelPolicy('Free cancellation up to 48 hours before check-in. Cancellations within 48 hours will incur a 50% charge of the first night.');
    setTwoFa(true);
    setNotifs(Object.fromEntries(NOTIF_ROWS.map(r => [r.id, { email: r.email, system: r.system }])));
  };

  return (
    <AdminLayout activePath="/admin/settings" searchPlaceholder="Search settings, users or bookings...">
      {toastVisible && (
        <div className="admin-toast" role="alert">
          <span className="material-symbols-outlined">check_circle</span>
          Settings saved successfully!
        </div>
      )}

      <div className="admin-page-title">
        <h2>Admin Settings</h2>
        <p>Configure platform preferences, security, and global booking policies.</p>
      </div>

      <div className="admin-settings-sections">

        {/* General */}
        <section className="settings-card">
          <div className="settings-card__header">
            <span className="material-symbols-outlined settings-card__header-icon">info</span>
            <h3>General Settings</h3>
          </div>
          <div className="settings-card__body">
            <div className="settings-grid">
              <div className="settings-form-group">
                <label htmlFor="site-name">Site Name</label>
                <input id="site-name" type="text" className="settings-input" value={siteName} onChange={e => setSiteName(e.target.value)} />
              </div>
              <div className="settings-form-group">
                <label htmlFor="contact-email">Contact Email</label>
                <input id="contact-email" type="email" className="settings-input" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
              </div>
              <div className="settings-form-group">
                <label htmlFor="phone">Phone Number</label>
                <input id="phone" type="text" className="settings-input" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className="settings-form-group">
                <label>Logo Upload</label>
                <div className="settings-logo-upload">
                  <div className="settings-logo-preview"><span className="material-symbols-outlined">image</span></div>
                  <button className="settings-file-btn">Choose File</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Booking */}
        <section className="settings-card">
          <div className="settings-card__header">
            <span className="material-symbols-outlined settings-card__header-icon">receipt_long</span>
            <h3>Booking Configuration</h3>
          </div>
          <div className="settings-card__body">
            <div className="settings-grid">
              <div className="settings-form-group">
                <label htmlFor="currency">Primary Currency</label>
                <select id="currency" className="settings-input" value={currency} onChange={e => setCurrency(e.target.value)}>
                  <option value="VND">VND (Vietnamese Dong)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>
              <div className="settings-form-group">
                <label htmlFor="tax-rate">Tax Rate (%)</label>
                <input id="tax-rate" type="number" className="settings-input" value={taxRate} min={0} max={100} onChange={e => setTaxRate(e.target.value)} />
              </div>
              <div className="settings-form-group settings-grid--full">
                <label htmlFor="cancel-policy">Cancellation Policy</label>
                <textarea id="cancel-policy" className="settings-input" rows={3} value={cancelPolicy} onChange={e => setCancelPolicy(e.target.value)} />
              </div>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="settings-card">
          <div className="settings-card__header">
            <span className="material-symbols-outlined settings-card__header-icon">security</span>
            <h3>Security</h3>
          </div>
          <div className="settings-card__body">
            <div className="settings-security-items">
              <div className="settings-security-row">
                <div className="settings-security-row__info">
                  <p>Admin Password</p>
                  <p>Last changed 3 months ago</p>
                </div>
                <button className="settings-change-pwd-btn">Change Password</button>
              </div>
              <hr className="settings-divider" />
              <div className="settings-security-row">
                <div className="settings-security-row__info">
                  <p>Two-Factor Authentication (2FA)</p>
                  <p>Add an extra layer of security to your account.</p>
                </div>
                <ToggleSwitch id="2fa-toggle" checked={twoFa} onChange={() => setTwoFa(v => !v)} />
              </div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="settings-card">
          <div className="settings-card__header">
            <span className="material-symbols-outlined settings-card__header-icon">notifications_active</span>
            <h3>Notifications</h3>
          </div>
          <div className="settings-card__body">
            <table className="settings-notif-table">
              <thead>
                <tr><th>Event Type</th><th>Email</th><th>System Alert</th></tr>
              </thead>
              <tbody>
                {NOTIF_ROWS.map(row => (
                  <tr key={row.id}>
                    <td>{row.label}</td>
                    <td><input type="checkbox" className="settings-checkbox" checked={notifs[row.id].email} onChange={() => toggleNotif(row.id, 'email')} /></td>
                    <td><input type="checkbox" className="settings-checkbox" checked={notifs[row.id].system} onChange={() => toggleNotif(row.id, 'system')} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Actions */}
        <div className="settings-actions">
          <button className="settings-btn-discard" onClick={handleDiscard}>Discard Changes</button>
          <button className="settings-btn-save" onClick={handleSave}>Save Settings</button>
        </div>

      </div>
    </AdminLayout>
  );
}
