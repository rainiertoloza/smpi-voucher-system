'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './database.module.css';
import Toast from '@/components/Toast';
import Modal from '@/components/Modal';

export default function DatabaseViewer() {
  const [activeTab, setActiveTab] = useState('vouchers');
  const [data, setData] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; voucherId: string; voucherCode: string }>({ 
    isOpen: false, 
    voucherId: '', 
    voucherCode: '' 
  });
  const [voucherSearch, setVoucherSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [branchSearch, setBranchSearch] = useState('');
  const [voucherPage, setVoucherPage] = useState(1);
  const [customerPage, setCustomerPage] = useState(1);
  const [branchPage, setBranchPage] = useState(1);
  const itemsPerPage = 10;

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

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
      showToast('Failed to load database. Please try again.', 'error');
    }
  };

  const handleDelete = async (voucherId: string, voucherCode: string) => {
    setDeleteModal({ isOpen: true, voucherId, voucherCode });
  };

  const confirmDelete = async () => {
    const { voucherId, voucherCode } = deleteModal;
    setDeleteModal({ isOpen: false, voucherId: '', voucherCode: '' });

    try {
      const res = await fetch(`/api/admin/vouchers/delete?id=${voucherId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        showToast(`Voucher ${voucherCode} deleted successfully!`, 'success');
        // Delay reload to show toast
        setTimeout(() => loadData(), 500);
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to delete voucher', 'error');
      }
    } catch (error) {
      showToast('Server error. Please try again.', 'error');
    }
  };

  if (!data) return <div className={styles.loading}>Loading...</div>;

  const filteredVouchers = data.vouchers.filter((v: any) =>
    v.code.toLowerCase().includes(voucherSearch.toLowerCase()) ||
    v.customer.fullName.toLowerCase().includes(voucherSearch.toLowerCase()) ||
    v.customer.email.toLowerCase().includes(voucherSearch.toLowerCase())
  );

  const filteredCustomers = data.vouchers.filter((v: any) =>
    v.customer.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
    v.customer.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
    v.customer.phone.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredBranches = data.branches.filter((b: any) =>
    b.name.toLowerCase().includes(branchSearch.toLowerCase()) ||
    (b.location && b.location.toLowerCase().includes(branchSearch.toLowerCase()))
  );

  const paginatedVouchers = filteredVouchers.slice(
    (voucherPage - 1) * itemsPerPage,
    voucherPage * itemsPerPage
  );

  const paginatedCustomers = filteredCustomers.slice(
    (customerPage - 1) * itemsPerPage,
    customerPage * itemsPerPage
  );

  const paginatedBranches = filteredBranches.slice(
    (branchPage - 1) * itemsPerPage,
    branchPage * itemsPerPage
  );

  const voucherTotalPages = Math.ceil(filteredVouchers.length / itemsPerPage);
  const customerTotalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const branchTotalPages = Math.ceil(filteredBranches.length / itemsPerPage);

  return (
    <div className={styles.page}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, voucherId: '', voucherCode: '' })}
        onConfirm={confirmDelete}
        title="Delete Voucher"
        message={`Are you sure you want to delete voucher ${deleteModal.voucherCode}? This will permanently remove the voucher and associated customer data. This action cannot be undone.`}
        confirmText="Delete Voucher"
        cancelText="Cancel"
        type="danger"
      />
      
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
            <div className={styles.tableHeader}>
              <h2>Vouchers Table ({filteredVouchers.length})</h2>
              <input
                type="text"
                placeholder="🔍 Search..."
                value={voucherSearch}
                onChange={(e) => { setVoucherSearch(e.target.value); setVoucherPage(1); }}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Customer Name</th>
                    <th>Customer Email</th>
                    <th>Status</th>
                    <th>Branch</th>
                    <th>Created At</th>
                    <th>Used At</th>
                    <th>Expires At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedVouchers.length > 0 ? (
                    paginatedVouchers.map((v: any) => (
                      <tr key={v.id}>
                        <td><code className={styles.code}>{v.code}</code></td>
                        <td>{v.customer.fullName}</td>
                        <td>{v.customer.email}</td>
                        <td><span className={`${styles.badge} ${styles[v.status.toLowerCase()]}`}>{v.status}</span></td>
                        <td>{v.branch?.name || '-'}</td>
                        <td>{new Date(v.createdAt).toLocaleDateString()}</td>
                        <td>{v.usedAt ? new Date(v.usedAt).toLocaleDateString() : '-'}</td>
                        <td>{v.expiresAt ? new Date(v.expiresAt).toLocaleDateString() : '-'}</td>
                        <td>
                          <button 
                            onClick={() => handleDelete(v.id, v.code)}
                            className={styles.deleteBtn}
                            title="Delete voucher"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    Array.from({ length: itemsPerPage }).map((_, i) => (
                      <tr key={`empty-${i}`} className={styles.emptyRow}>
                        <td colSpan={9} className={styles.emptyCell}>
                          {i === 0 && 'No vouchers found'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {voucherTotalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setVoucherPage(p => Math.max(1, p - 1))}
                  disabled={voucherPage === 1}
                  className={styles.pageBtn}
                >
                  ← Previous
                </button>
                <span className={styles.pageInfo}>
                  Page {voucherPage} of {voucherTotalPages}
                </span>
                <button
                  onClick={() => setVoucherPage(p => Math.min(voucherTotalPages, p + 1))}
                  disabled={voucherPage === voucherTotalPages}
                  className={styles.pageBtn}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'customers' && (
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h2>Customers Table ({filteredCustomers.length})</h2>
              <input
                type="text"
                placeholder="🔍 Search..."
                value={customerSearch}
                onChange={(e) => { setCustomerSearch(e.target.value); setCustomerPage(1); }}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Voucher Code</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCustomers.length > 0 ? (
                    paginatedCustomers.map((v: any) => (
                      <tr key={v.customer.email}>
                        <td><code className={styles.code}>{v.code}</code></td>
                        <td>{v.customer.fullName}</td>
                        <td>{v.customer.email}</td>
                        <td>{v.customer.phone}</td>
                        <td>{new Date(v.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    Array.from({ length: itemsPerPage }).map((_, i) => (
                      <tr key={`empty-${i}`} className={styles.emptyRow}>
                        <td colSpan={5} className={styles.emptyCell}>
                          {i === 0 && 'No customers found'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {customerTotalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setCustomerPage(p => Math.max(1, p - 1))}
                  disabled={customerPage === 1}
                  className={styles.pageBtn}
                >
                  ← Previous
                </button>
                <span className={styles.pageInfo}>
                  Page {customerPage} of {customerTotalPages}
                </span>
                <button
                  onClick={() => setCustomerPage(p => Math.min(customerTotalPages, p + 1))}
                  disabled={customerPage === customerTotalPages}
                  className={styles.pageBtn}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'branches' && (
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h2>Branches Table ({filteredBranches.length})</h2>
              <input
                type="text"
                placeholder="🔍 Search..."
                value={branchSearch}
                onChange={(e) => { setBranchSearch(e.target.value); setBranchPage(1); }}
                className={styles.searchInput}
              />
            </div>
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
                  {paginatedBranches.length > 0 ? (
                    paginatedBranches.map((b: any) => {
                      const redemptions = data.analytics.branchData.find((bd: any) => bd.name === b.name)?.count || 0;
                      return (
                        <tr key={b.id}>
                          <td><code>{b.id}</code></td>
                          <td>{b.name}</td>
                          <td>{b.location || '-'}</td>
                          <td><span className={styles.countBadge}>{redemptions}</span></td>
                        </tr>
                      );
                    })
                  ) : (
                    Array.from({ length: itemsPerPage }).map((_, i) => (
                      <tr key={`empty-${i}`} className={styles.emptyRow}>
                        <td colSpan={4} className={styles.emptyCell}>
                          {i === 0 && 'No branches found'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {branchTotalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setBranchPage(p => Math.max(1, p - 1))}
                  disabled={branchPage === 1}
                  className={styles.pageBtn}
                >
                  ← Previous
                </button>
                <span className={styles.pageInfo}>
                  Page {branchPage} of {branchTotalPages}
                </span>
                <button
                  onClick={() => setBranchPage(p => Math.min(branchTotalPages, p + 1))}
                  disabled={branchPage === branchTotalPages}
                  className={styles.pageBtn}
                >
                  Next →
                </button>
              </div>
            )}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
