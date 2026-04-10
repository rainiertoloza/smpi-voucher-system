'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './database.module.css';

export default function DatabaseViewer() {
  const [activeTab, setActiveTab] = useState('vouchers');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vouchersRes, analyticsRes, branchesRes, limitRes] = await Promise.all([
        fetch('/api/admin/vouchers'),
        fetch('/api/admin/analytics'),
        fetch('/api/admin/branches'),
        fetch('/api/admin/limit')
      ]);

      if (!vouchersRes.ok || !analyticsRes.ok || !branchesRes.ok || !limitRes.ok) {
        if (vouchersRes.status === 401) {
          window.location.href = '/gate/v9x3k7m2q8';
          return;
        }
        throw new Error('Failed to load data');
      }

      const [vouchers, analytics, branches, limit] = await Promise.all([
        vouchersRes.json(),
        analyticsRes.json(),
        branchesRes.json(),
        limitRes.json()
      ]);

      setData({ vouchers, analytics, branches, limit });
    } catch (error) {
      console.error('Database load error:', error);
      alert('Failed to load database. Please try again.');
    }
  };

  if (!data) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Database Viewer</h1>
          <p className={styles.subtitle}>View all database tables and records</p>
        </div>
        <Link href="/gate/v9x3k7m2q8/dashboard" className={styles.backBtn}>
          ← Back to Dashboard
        </Link>
      </div>

      <div className={styles.tabs}>
        <button 
          className={activeTab === 'vouchers' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('vouchers')}
        >
          Vouchers ({data.vouchers.length})
        </button>
        <button 
          className={activeTab === 'customers' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('customers')}
        >
          Customers ({data.vouchers.length})
        </button>
        <button 
          className={activeTab === 'branches' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('branches')}
        >
          Branches ({data.branches.length})
        </button>
        <button 
          className={activeTab === 'settings' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'vouchers' && (
          <div className={styles.tableCard}>
            <h2>Vouchers Table</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Code</th>
                    <th>Customer ID</th>
                    <th>Status</th>
                    <th>Branch ID</th>
                    <th>Created At</th>
                    <th>Used At</th>
                    <th>Expires At</th>
                  </tr>
                </thead>
                <tbody>
                  {data.vouchers.map((v: any) => (
                    <tr key={v.id}>
                      <td><code>{v.id}</code></td>
                      <td><code className={styles.code}>{v.code}</code></td>
                      <td><code>{v.customer.email}</code></td>
                      <td><span className={`${styles.badge} ${styles[v.status.toLowerCase()]}`}>{v.status}</span></td>
                      <td>{v.branch?.name || '-'}</td>
                      <td>{new Date(v.createdAt).toLocaleString()}</td>
                      <td>{v.usedAt ? new Date(v.usedAt).toLocaleString() : '-'}</td>
                      <td>{v.expiresAt ? new Date(v.expiresAt).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className={styles.tableCard}>
            <h2>Customers Table</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Created At</th>
                    <th>Voucher Code</th>
                  </tr>
                </thead>
                <tbody>
                  {data.vouchers.map((v: any) => (
                    <tr key={v.customer.email}>
                      <td><code>{v.id.substring(0, 12)}...</code></td>
                      <td>{v.customer.fullName}</td>
                      <td>{v.customer.email}</td>
                      <td>{v.customer.phone}</td>
                      <td>{new Date(v.createdAt).toLocaleString()}</td>
                      <td><code className={styles.code}>{v.code}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'branches' && (
          <div className={styles.tableCard}>
            <h2>Branches Table</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Redemptions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.branches.map((b: any) => {
                    const redemptions = data.analytics.branchData.find((bd: any) => bd.name === b.name)?.count || 0;
                    return (
                      <tr key={b.id}>
                        <td><code>{b.id}</code></td>
                        <td>{b.name}</td>
                        <td>{b.location || '-'}</td>
                        <td><span className={styles.countBadge}>{redemptions}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className={styles.tableCard}>
            <h2>System Settings</h2>
            <div className={styles.settingsGrid}>
              <div className={styles.settingCard}>
                <h3>Voucher Limit</h3>
                <div className={styles.settingValue}>
                  <span className={styles.bigNumber}>{data.limit.maxVouchers}</span>
                  <span className={styles.label}>Maximum Vouchers</span>
                </div>
              </div>
              <div className={styles.settingCard}>
                <h3>Current Count</h3>
                <div className={styles.settingValue}>
                  <span className={styles.bigNumber}>{data.limit.currentCount}</span>
                  <span className={styles.label}>Vouchers Issued</span>
                </div>
              </div>
              <div className={styles.settingCard}>
                <h3>Remaining</h3>
                <div className={styles.settingValue}>
                  <span className={styles.bigNumber}>{data.limit.maxVouchers - data.limit.currentCount}</span>
                  <span className={styles.label}>Available Slots</span>
                </div>
              </div>
              <div className={styles.settingCard}>
                <h3>Database File</h3>
                <div className={styles.settingValue}>
                  <code className={styles.path}>./dev.db</code>
                  <span className={styles.label}>SQLite Database</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
