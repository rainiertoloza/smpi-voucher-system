'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styles from './dashboard.module.css';
import Toast from '@/components/Toast';

const COLORS = ['#0058a9', '#fdd802', '#ea2429', '#10b981'];

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [limit, setLimit] = useState<any>(null);
  const [redeemCode, setRedeemCode] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cleanupMonths, setCleanupMonths] = useState('3');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const loadData = async () => {
    try {
      const [analyticsRes, vouchersRes, branchesRes, limitRes] = await Promise.all([
        fetch('/api/admin/analytics'),
        fetch('/api/admin/vouchers'),
        fetch('/api/admin/branches'),
        fetch('/api/admin/limit')
      ]);

      // Check for authentication errors
      if (analyticsRes.status === 401 || vouchersRes.status === 401 || 
          branchesRes.status === 401 || limitRes.status === 401) {
        window.location.href = '/gate/v9x3k7m2q8';
        return;
      }

      // Check for other errors
      if (!analyticsRes.ok || !vouchersRes.ok || !branchesRes.ok || !limitRes.ok) {
        const errorText = await analyticsRes.text();
        console.error('API Error:', errorText);
        throw new Error('Failed to load data. Check console for details.');
      }

      const [analyticsData, vouchersData, branchesData, limitData] = await Promise.all([
        analyticsRes.json(),
        vouchersRes.json(),
        branchesRes.json(),
        limitRes.json()
      ]);

      setAnalytics(analyticsData);
      setVouchers(vouchersData);
      setBranches(branchesData);
      setLimit(limitData);
      setError(''); // Clear any previous errors
    } catch (err: any) {
      console.error('Load data error:', err);
      setError(err.message || 'Failed to load dashboard data');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRedeem = async () => {
    if (!redeemCode || !selectedBranch) {
      showToast('Please enter voucher code and select branch', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: redeemCode, branchId: selectedBranch })
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Voucher redeemed successfully!', 'success');
        setRedeemCode('');
        setSelectedBranch('');
        loadData();
      } else {
        showToast(data.error || 'Failed to redeem voucher', 'error');
      }
    } catch (error) {
      showToast('Server error. Please try again.', 'error');
    }
  };

  const handleSetLimit = async () => {
    const maxVouchers = parseInt(newLimit);
    if (isNaN(maxVouchers) || maxVouchers < 0) {
      showToast('Please enter a valid number', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxVouchers })
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Voucher limit updated successfully!', 'success');
        setNewLimit('');
        loadData();
      } else {
        showToast(data.error || 'Failed to update limit', 'error');
      }
    } catch (error) {
      showToast('Server error. Please try again.', 'error');
    }
  };

  const handleCleanup = async () => {
    const months = parseInt(cleanupMonths);
    if (isNaN(months) || months < 1) {
      showToast('Please enter a valid number of months', 'error');
      return;
    }

    if (!confirm(`Are you sure you want to delete all data older than ${months} months? This cannot be undone!`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthsAgo: months })
      });

      const data = await res.json();

      if (res.ok) {
        showToast(data.message, 'success');
        loadData();
      } else {
        showToast(data.error || 'Failed to cleanup data', 'error');
      }
    } catch (error) {
      showToast('Server error. Please try again.', 'error');
    }
  };

  const filteredVouchers = vouchers.filter((v: any) => 
    v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) return <div className={styles.loading}>Error: {error}</div>;
  if (!analytics || !limit) return <div className={styles.loading}>Loading dashboard...</div>;

  const pieData = [
    { name: 'Active', value: analytics.active },
    { name: 'Redeemed', value: analytics.redeemed }
  ];

  return (
    <div className={styles.page}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className={styles.header}>
        <div>
          <h1>Admin Dashboard</h1>
          <p className={styles.subtitle}>Manage vouchers and track analytics</p>
        </div>
        <div className={styles.headerActions}>
          <a href="/gate/v9x3k7m2q8/database" className={styles.dbLink}>
            🗄️ Database
          </a>
          <div className={styles.limitBadge}>
            <span className={styles.limitLabel}>Vouchers Issued</span>
            <span className={styles.limitValue}>{limit.currentCount} / {limit.maxVouchers}</span>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.statsSection}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🎫</div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Total Issued</p>
              <p className={styles.statValue}>{analytics.total}</p>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Redeemed</p>
              <p className={styles.statValue}>{analytics.redeemed}</p>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⚡</div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Active</p>
              <p className={styles.statValue}>{analytics.active}</p>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📊</div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Conversion Rate</p>
              <p className={styles.statValue}>{analytics.conversionRate}%</p>
            </div>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>Redemptions by Branch</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.branchData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#888" style={{ fontSize: '0.75rem' }} />
              <YAxis stroke="#888" style={{ fontSize: '0.75rem' }} />
              <Tooltip 
                contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem' }}
              />
              <Bar dataKey="count" fill="#0058a9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <h3>Voucher Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.legend}>
            {pieData.map((entry, index) => (
              <div key={entry.name} className={styles.legendItem}>
                <span className={styles.legendColor} style={{ background: COLORS[index] }}></span>
                <span>{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.actionsCard}>
          <div className={styles.actionSection}>
            <h3>🎯 Set Voucher Limit</h3>
            <p className={styles.actionDesc}>Control how many vouchers can be issued</p>
            <div className={styles.actionForm}>
              <input
                type="number"
                placeholder="Max vouchers"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                className={styles.input}
                min="0"
              />
              <button onClick={handleSetLimit} className={styles.btnPrimary}>
                Set Limit
              </button>
            </div>
          </div>

          <div className={styles.actionSection}>
            <h3>🗑️ Cleanup Old Data</h3>
            <p className={styles.actionDesc}>Delete vouchers older than specified months</p>
            <div className={styles.actionForm}>
              <input
                type="number"
                placeholder="Months ago"
                value={cleanupMonths}
                onChange={(e) => setCleanupMonths(e.target.value)}
                className={styles.input}
                min="1"
              />
              <button onClick={handleCleanup} className={styles.btnDanger}>
                Delete Old Data
              </button>
            </div>
          </div>

          <div className={styles.actionSection}>
            <h3>🔓 Redeem Voucher</h3>
            <p className={styles.actionDesc}>Enter voucher code and select branch</p>
            <div className={styles.actionForm}>
              <input
                type="text"
                placeholder="SMPI-XXXXXX"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                className={styles.input}
              />
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className={styles.input}
              >
                <option value="">Select Branch</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <button onClick={handleRedeem} className={styles.btnSuccess}>
                Redeem
              </button>
            </div>
          </div>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h3>All Vouchers ({filteredVouchers.length})</h3>
            <input
              type="text"
              placeholder="🔍 Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Branch</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredVouchers.map(v => (
                  <tr key={v.id}>
                    <td><code className={styles.code}>{v.code}</code></td>
                    <td>{v.customer.fullName}</td>
                    <td className={styles.email}>{v.customer.email}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[v.status.toLowerCase()]}`}>
                        {v.status}
                      </span>
                    </td>
                    <td>{v.branch?.name || '-'}</td>
                    <td>{new Date(v.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
