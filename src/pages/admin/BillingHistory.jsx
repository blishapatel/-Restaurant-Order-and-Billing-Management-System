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

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openView = (bill) => {
    setViewBill(bill);
  };

  const handlePrintFromRow = (bill) => {
    setViewBill(bill);
    setTimeout(() => window.print(), 400);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-amber-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {viewBill && <BillViewModal bill={viewBill} onClose={() => setViewBill(null)} />}

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-sm text-amber-900">
        All bills are saved permanently in <strong>MongoDB</strong>. Closing the browser does not delete them.
        Use <strong>All dates</strong> to see yesterday and older records. Table numbers are stored on each paid bill.
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <p className="text-amber-800 text-sm">
          {selectedDate ? `Showing bills for ${selectedDate}` : 'Showing all paid bills (every day)'}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium text-black">Filter:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-beige-300 rounded-xl bg-beige-50 text-black text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
          <button
            type="button"
            onClick={() => setSelectedDate('')}
            className={`px-3 py-2 text-sm rounded-xl border cursor-pointer ${
              !selectedDate
                ? 'bg-amber-800 text-beige-50 border-amber-800'
                : 'border-beige-300 text-amber-800 hover:bg-beige-100'
            }`}
          >
            All dates
          </button>
          <button
            type="button"
            onClick={() => setSelectedDate(todayStr())}
            className={`px-3 py-2 text-sm rounded-xl border cursor-pointer ${
              selectedDate === todayStr()
                ? 'bg-amber-800 text-beige-50 border-amber-800'
                : 'border-beige-300 text-amber-800 hover:bg-beige-100'
            }`}
          >
            Today
          </button>
          <PanelRefreshButton onClick={fetchHistory} loading={loading} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-beige-300 shadow-sm">
          <p className="text-3xl font-bold text-black">{summary.totalOrders}</p>
          <p className="text-sm text-amber-800">Paid orders{selectedDate ? ` on ${selectedDate}` : ' (all time)'}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-beige-300 shadow-sm">
          <p className="text-3xl font-bold text-black">₹{summary.totalRevenue.toFixed(2)}</p>
          <p className="text-sm text-amber-800">Total revenue</p>
        </div>
      </div>

      {bills.length === 0 ? (
        <div className="bg-white rounded-2xl border border-beige-300 p-12 text-center">
          <p className="text-amber-800/70 italic">
            No paid bills found{selectedDate ? ` for ${selectedDate}` : ''}
          </p>
          <p className="text-sm text-neutral-500 mt-2">
            Click <strong>All dates</strong> to see older bills, or complete a payment in Cashier panel
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-beige-300 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-beige-200">
            <h3 className="text-lg font-bold text-black">Orders & Bills</h3>
            <p className="text-xs text-amber-800 mt-0.5">
              Click <strong>View</strong> to open printable bill · <strong>Print</strong> opens bill and prints
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px]">
              <thead className="bg-beige-100">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-amber-800">Table No.</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-amber-800">Bill No.</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-amber-800">Order No.</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-amber-800">Paid On</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-amber-800">Waiter</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-amber-800">Payment</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-amber-800">Amount</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-amber-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-200">
                {bills.map((bill) => {
                  const order = bill.orderId;
                  const hasOrder = order && typeof order === 'object';
                  const tableNum = getTableNumber(order, bill);

                  return (
                    <tr key={bill._id} className="hover:bg-beige-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2.5 py-1 rounded-lg bg-amber-800 text-beige-50 font-bold text-base">
                          {tableNum != null ? tableNum : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-black">#{bill._id.slice(-6)}</td>
                      <td className="px-4 py-3 text-sm font-mono text-black">
                        {hasOrder ? `#${order._id.slice(-6)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-black whitespace-nowrap">
                        {formatDateTime(bill.paidAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-black">
                        {hasOrder && order.waiterId ? order.waiterId.name : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-black capitalize">{bill.paymentMethod || '—'}</td>
                      <td className="px-4 py-3 text-sm font-bold text-black text-right">
                        ₹{(bill.total || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openView(bill)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-amber-800 rounded-lg hover:bg-amber-700 cursor-pointer"
                          >
                            <HiOutlineEye size={14} />
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePrintFromRow(bill)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-800 border border-beige-300 rounded-lg hover:bg-beige-100 cursor-pointer"
                            title="View and print"
                          >
                            <HiOutlinePrinter size={14} />
                            Print
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
