'use client';

import { useState } from 'react';
import styles from './claim.module.css';

export default function ClaimPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '' });
  const [voucher, setVoucher] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/voucher/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to claim voucher');
        setLoading(false);
        return;
      }

      const data = await res.json();
      setVoucher(data.code);
      setStep(2);
    } catch (error) {
      alert('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyVoucher = () => {
    navigator.clipboard.writeText(voucher);
    alert('Voucher copied!');
  };

  if (step === 2) {
    return (
      <div className={styles.page}>
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
          placeholder="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
          className={styles.input}
        />
        <button type="submit" disabled={loading} className={styles.btn}>
          {loading ? 'Processing...' : 'Claim Voucher'}
        </button>
      </form>
    </div>
  );
}
