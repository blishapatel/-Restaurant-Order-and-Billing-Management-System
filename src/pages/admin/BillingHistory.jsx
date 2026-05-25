import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import RestaurantBill from '../../components/RestaurantBill';
import StaffInfoCard from '../../components/StaffInfoCard';
import { HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';

const BillingHistory = () => {
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState({ totalOrders: 0, totalRevenue: 0 });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedId, setExpandedId] = useState(null);
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
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to load billing history';
      toast.error(msg);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-amber-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <p className="text-amber-800">Paid bills with full order details — filter by date</p>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-black">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-beige-300 rounded-xl bg-beige-50 text-black font-serif focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
          <button
            type="button"
            onClick={() => setSelectedDate('')}
            className="px-3 py-2 text-sm text-amber-800 border border-beige-300 rounded-xl hover:bg-beige-100 cursor-pointer"
          >
            All dates
          </button>
          <button
            type="button"
            onClick={fetchHistory}
            className="px-3 py-2 text-sm bg-amber-800 text-beige-50 rounded-xl hover:bg-amber-700 cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-amber-50 rounded-2xl p-5 border border-beige-300">
          <p className="text-3xl font-bold text-black">{summary.totalOrders}</p>
          <p className="text-sm text-amber-800">Paid orders{selectedDate ? ` on ${selectedDate}` : ''}</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-5 border border-beige-300">
          <p className="text-3xl font-bold text-black">₹{summary.totalRevenue.toFixed(2)}</p>
          <p className="text-sm text-amber-800">Total revenue</p>
        </div>
      </div>

      {bills.length === 0 ? (
        <div className="bg-white rounded-2xl border border-beige-300 p-12 text-center">
          <p className="text-amber-800/70 italic">No paid bills found{selectedDate ? ` for ${selectedDate}` : ''}</p>
          <p className="text-sm text-neutral-500 mt-2">Try &quot;All dates&quot; or confirm payment was completed in Cashier panel</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bills.map((bill) => {
            const order = bill.orderId;
            const isOpen = expandedId === bill._id;
            const hasOrder = order && typeof order === 'object';

            return (
              <div key={bill._id} className="bg-white rounded-2xl border border-beige-300 shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedId(isOpen ? null : bill._id)}
                  className="w-full text-left px-6 py-4 flex flex-wrap items-center justify-between gap-3 hover:bg-beige-50 cursor-pointer"
                >
                  <div>
                    <p className="font-bold text-black">
                      {hasOrder ? `Table ${order.tableId?.tableNumber || 'N/A'}` : 'Order removed'} · Bill #{bill._id.slice(-6)}
                    </p>
                    <p className="text-sm text-amber-800 mt-0.5">Paid: {formatDateTime(bill.paidAt)}</p>
                    {hasOrder && order.waiterId && (
                      <p className="text-xs text-black/70 mt-1">
                        Waiter: {order.waiterId.name} ({order.waiterId.role})
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-black">₹{(bill.total || 0).toFixed(2)}</p>
                      <p className="text-xs text-amber-800">{bill.paymentMethod || '—'}</p>
                    </div>
                    {isOpen ? <HiOutlineChevronUp size={20} /> : <HiOutlineChevronDown size={20} />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 border-t border-beige-200 pt-4">
                    {hasOrder ? (
                      <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <StaffInfoCard staff={order.waiterId} title="Serving Waiter" />
                              <StaffInfoCard staff={bill.cashierId} title="Cashier" />
                            </div>
                          </div>
                          <div className="flex justify-center lg:justify-end">
                            <RestaurantBill
                              order={order}
                              bill={bill}
                              paymentMethod={bill.paymentMethod}
                              printId={`history-bill-${bill._id}`}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-amber-800 italic mb-4">Order record not found. Bill total: ₹{(bill.total || 0).toFixed(2)}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BillingHistory;
