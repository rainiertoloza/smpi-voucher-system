'use client';

import { useState } from 'react';
import styles from './claim.module.css';
import Toast from '@/components/Toast';

export default function ClaimPage() {
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const validatePhone = (phone: string) => {
    return /^09\d{9}$/.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhone(formData.phone)) {
      showToast('Please enter a valid Philippine phone number (09XXXXXXXXX)', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/voucher/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Failed to claim voucher', 'error');
        setLoading(false);
        return;
      }

      if (data.warning) {
        showToast(data.warning, 'info');
      } else {
        setSubmitted(true);
        showToast('Voucher sent to your email!', 'success');
      }
    } catch (error) {
      console.error('Claim error:', error);
      showToast('Server error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.page}>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <div className={styles.card}>
          <div className={styles.successIcon}>📧</div>
          <h1 className={styles.success}>Check Your Email!</h1>
          <p className={styles.successText}>
            Your voucher code has been sent to:
          </p>
          <p className={styles.email}>{formData.email}</p>
          <div className={styles.infoBox}>
            <p><strong>What's next?</strong></p>
            <ul className={styles.steps}>
              <li>Check your inbox (and spam folder)</li>
              <li>Save your voucher code</li>
              <li>Valid for 30 days from today</li>
              <li>Redeem at any SMPI branch</li>
            </ul>
          </div>
          <button 
            onClick={() => {
              setSubmitted(false);
              setFormData({ fullName: '', email: '', phone: '' });
            }} 
            className={styles.btnSecondary}
          >
            Claim Another Voucher
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1>Claim Your Voucher</h1>
        <p className={styles.subtitle}>Fill in your details to receive your voucher code via email</p>
        <input
          type="text"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
          className={styles.input}
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className={styles.input}
        />
        <input
          type="tel"
          placeholder="Phone (09XXXXXXXXX)"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 11) })}
          required
          className={styles.input}
          maxLength={11}
        />
        {formData.phone && !validatePhone(formData.phone) && formData.phone.length > 0 && (
          <p className={styles.error}>Phone must start with 09 and have 11 digits</p>
        )}
        <button type="submit" disabled={loading} className={styles.btn}>
          {loading ? 'Sending...' : 'Claim Voucher'}
        </button>
        <p className={styles.note}>📧 Voucher code will be sent to your email</p>
      </form>
    </div>
  );
}
