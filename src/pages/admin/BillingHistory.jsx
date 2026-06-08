import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import BillViewModal from '../../components/BillViewModal';
import PanelRefreshButton from '../../components/PanelRefreshButton';
import { getTableNumber } from '../../utils/orderHelpers';
import { HiOutlineEye, HiOutlinePrinter } from 'react-icons/hi';

const todayStr = () => new Date().toISOString().split('T')[0];

const BillingHistory = () => {
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState({ totalOrders: 0, totalRevenue: 0 });
  const [selectedDate, setSelectedDate] = useState('');
  const [viewBill, setViewBill] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = selectedDate ? `?date=${selectedDate}` : '';
      const { data } = await API.get(`/billing/reports/history${params}`);
      setBills(Array.isArray(data.bills) ? data.bills : []);
      setSummary({
        totalOrders: data.totalOrders || 0,
        totalRevenue: data.totalRevenue || 0,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load billing history');
      setBills([]);
      setSummary({ totalOrders: 0, totalRevenue: 0 });
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const openView = (bill) => setViewBill(bill);

  const handlePrintFromRow = (bill) => {
    setViewBill(bill);
    setTimeout(() => window.print(), 400);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '4px solid var(--border)', borderTopColor: 'var(--accent)' }} />
    </div>
  );

  return (
    <div className="animate-slide-up">
      {viewBill && <BillViewModal bill={viewBill} onClose={() => setViewBill(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {selectedDate ? `Showing bills for ${selectedDate}` : 'Showing all paid bills'}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Filter:</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="input-field text-sm py-2" />
          <button
            type="button"
            onClick={() => setSelectedDate('')}
            className="px-3 py-2 text-sm rounded-xl font-medium cursor-pointer transition-all"
            style={{
              background: !selectedDate ? 'var(--accent)' : 'var(--surface)',
              color: !selectedDate ? 'var(--accent-text)' : 'var(--text-primary)',
              border: `1px solid ${!selectedDate ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            All dates
          </button>
          <button
            type="button"
            onClick={() => setSelectedDate(todayStr())}
            className="px-3 py-2 text-sm rounded-xl font-medium cursor-pointer transition-all"
            style={{
              background: selectedDate === todayStr() ? 'var(--accent)' : 'var(--surface)',
              color: selectedDate === todayStr() ? 'var(--accent-text)' : 'var(--text-primary)',
              border: `1px solid ${selectedDate === todayStr() ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            Today
          </button>
          <PanelRefreshButton onClick={fetchHistory} loading={loading} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{summary.totalOrders}</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Paid orders{selectedDate ? ` on ${selectedDate}` : ' (all time)'}</p>
        </div>
        <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>₹{summary.totalRevenue.toFixed(2)}</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Total revenue</p>
        </div>
      </div>

      {bills.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="italic" style={{ color: 'var(--text-tertiary)' }}>No paid bills found{selectedDate ? ` for ${selectedDate}` : ''}</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Orders &amp; Bills</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px]">
              <thead style={{ background: 'var(--surface-2)' }}>
                <tr>
                  {['Table No.', 'Bill No.', 'Order No.', 'Paid On', 'Waiter', 'Payment', 'Amount', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => {
                  const order = bill.orderId;
                  const hasOrder = order && typeof order === 'object';
                  const tableNum = getTableNumber(order, bill);
                  return (
                    <tr key={bill._id} className="transition-colors duration-200" style={{ borderBottom: '1px solid var(--border-light)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2.5 py-1 rounded-lg text-sm font-bold" style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
                          {tableNum != null ? tableNum : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono" style={{ color: 'var(--text-primary)' }}>#{bill._id.slice(-6)}</td>
                      <td className="px-4 py-3 text-sm font-mono" style={{ color: 'var(--text-primary)' }}>
                        {hasOrder ? `#${order._id.slice(-6)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{formatDateTime(bill.paidAt)}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                        {hasOrder && order.waiterId ? order.waiterId.name : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm capitalize" style={{ color: 'var(--text-primary)' }}>{bill.paymentMethod || '—'}</td>
                      <td className="px-4 py-3 text-sm font-bold text-right" style={{ color: 'var(--text-primary)' }}>₹{(bill.total || 0).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button type="button" onClick={() => openView(bill)} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg cursor-pointer btn-primary">
                            <HiOutlineEye size={14} /> View
                          </button>
                          <button type="button" onClick={() => handlePrintFromRow(bill)} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg cursor-pointer"
                            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                            <HiOutlinePrinter size={14} /> Print
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingHistory;
