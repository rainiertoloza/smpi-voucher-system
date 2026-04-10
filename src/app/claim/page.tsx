'use client';

import { useState } from 'react';
import styles from './claim.module.css';
import Toast from '@/components/Toast';

export default function ClaimPage() {
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '' });
  const [voucher, setVoucher] = useState('');
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

      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || 'Failed to claim voucher', 'error');
        setLoading(false);
        return;
      }

      const data = await res.json();
      setVoucher(data.code);
      showToast('Voucher claimed successfully!', 'success');
    } catch (error) {
      showToast('Server error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyVoucher = () => {
    navigator.clipboard.writeText(voucher);
    showToast('Voucher code copied to clipboard!', 'success');
  };

  if (voucher) {
    return (
      <div className={styles.page}>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <div className={styles.card}>
          <h1 className={styles.success}>✅ Success!</h1>
          <p>Your voucher code:</p>
          <div className={styles.voucherCode}>{voucher}</div>
          <button onClick={copyVoucher} className={styles.btn}>Copy Code</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1>Claim Your Voucher</h1>
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
          {loading ? 'Processing...' : 'Claim Voucher'}
        </button>
      </form>
    </div>
  );
}
