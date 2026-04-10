'use client';

import { useState } from 'react';
import styles from './claim.module.css';
import Toast from '@/components/Toast';

export default function ClaimPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '' });
  const [otp, setOtp] = useState('');
  const [voucher, setVoucher] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const validatePhone = (phone: string) => {
    return /^09\d{9}$/.test(phone);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhone(formData.phone)) {
      showToast('Please enter a valid Philippine phone number (09XXXXXXXXX)', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone })
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Failed to send OTP', 'error');
        setLoading(false);
        return;
      }

      showToast('OTP sent to your phone! Check console for testing.', 'success');
      console.log('TEST OTP:', data.otp);
      setStep(2);
    } catch (error) {
      showToast('Server error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      showToast('Please enter a 6-digit OTP', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/otp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, otp })
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Invalid OTP', 'error');
        setLoading(false);
        return;
      }

      showToast('Phone verified! Claiming voucher...', 'success');
      await claimVoucher();
    } catch (error) {
      showToast('Server error. Please try again.', 'error');
      setLoading(false);
    }
  };

  const claimVoucher = async () => {
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
      setStep(3);
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

  if (step === 3) {
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

  if (step === 2) {
    return (
      <div className={styles.page}>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <form className={styles.card} onSubmit={handleVerifyOTP}>
          <h1>Verify Your Phone</h1>
          <p className={styles.otpInfo}>Enter the 6-digit code sent to {formData.phone}</p>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
            className={styles.input}
            maxLength={6}
          />
          <button type="submit" disabled={loading} className={styles.btn}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button 
            type="button" 
            onClick={() => setStep(1)} 
            className={styles.btnSecondary}
            disabled={loading}
          >
            Back
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <form className={styles.card} onSubmit={handleSendOTP}>
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
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </button>
      </form>
    </div>
  );
}
