import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import PanelRefreshButton from '../../components/PanelRefreshButton';
import { HiOutlineClipboardList, HiOutlineCurrencyRupee, HiOutlineClock, HiOutlineViewGrid } from 'react-icons/hi';

const todayStr = () => new Date().toISOString().split('T')[0];

const isSameCalendarDay = (dateStr, ymd) => {
  const d = new Date(dateStr);
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return key === ymd;
};

const formatDisplayDate = (ymd) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [stats, setStats] = useState({ totalOrders: 0, revenue: 0, pendingOrders: 0, availableTables: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const isToday = selectedDate === todayStr();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let orders = [];
      let tables = [];
      let report = { totalRevenue: 0, totalOrders: 0 };

      try {
        const res = await API.get('/orders');
        orders = res.data;
      } catch (e) {
        console.warn('Failed to load orders:', e.message);
      }

      try {
        const res = await API.get('/tables');
        tables = res.data;
      } catch (e) {
        console.warn('Failed to load tables:', e.message);
      }

      try {
        const res = await API.get(`/billing/reports/daily?date=${selectedDate}`);
        report = res.data;
      } catch (e) {
        const msg = e.response?.data?.message;
        if (e.response?.status === 403) {
          toast.error(msg || 'No permission for revenue report — log in as Admin');
        }
      }

      const dayOrders = orders.filter((o) => isSameCalendarDay(o.createdAt, selectedDate));

      setStats({
        totalOrders: dayOrders.length,
        revenue: report.totalRevenue || 0,
        pendingOrders: orders.filter((o) => o.status === 'pending' || o.status === 'in-kitchen').length,
        availableTables: tables.filter((t) => t.status === 'available').length,
      });

      setRecentOrders(
        dayOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 15)
      );
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const dateLabel = isToday ? 'Today' : formatDisplayDate(selectedDate);

  const statCards = [
    {
      label: `Orders · ${dateLabel}`,
      value: stats.totalOrders,
      icon: <HiOutlineClipboardList size={28} />,
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100 text-amber-800',
    },
    {
      label: `Revenue · ${dateLabel}`,
      value: `₹${stats.revenue.toFixed(2)}`,
      icon: <HiOutlineCurrencyRupee size={28} />,
      bg: 'bg-green-50',
      iconBg: 'bg-green-100 text-green-800',
    },
    {
      label: 'Pending Orders (live)',
      value: stats.pendingOrders,
      icon: <HiOutlineClock size={28} />,
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-100 text-orange-800',
    },
    {
      label: 'Available Tables',
      value: stats.availableTables,
      icon: <HiOutlineViewGrid size={28} />,
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100 text-blue-800',
    },
  ];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    'in-kitchen': 'bg-orange-100 text-orange-800',
    served: 'bg-blue-100 text-blue-800',
    billed: 'bg-green-100 text-green-800',
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
        <div>
          <p className="text-amber-800 text-sm">View stats and orders for any day</p>
          <p className="text-black font-semibold mt-1">{formatDisplayDate(selectedDate)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium text-black">Date:</label>
          <input
            type="date"
            value={selectedDate}
            max={todayStr()}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-beige-300 rounded-xl bg-beige-50 text-black text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
          <button
            type="button"
            onClick={() => setSelectedDate(todayStr())}
            className={`px-3 py-2 text-sm rounded-xl border cursor-pointer transition-colors ${
              isToday
                ? 'bg-amber-800 text-beige-50 border-amber-800'
                : 'border-beige-300 text-amber-800 hover:bg-beige-100'
            }`}
          >
            Today
          </button>
          <PanelRefreshButton onClick={fetchData} loading={loading} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`${card.bg} rounded-2xl p-5 border border-beige-300 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center mb-3`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-black">{card.value}</p>
            <p className="text-xs text-amber-800 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-beige-300 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-beige-200 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-black">Orders on {dateLabel}</h3>
          <span className="text-sm text-amber-800">{recentOrders.length} order(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-beige-100">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-amber-800">Table</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-amber-800">Order ID</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-amber-800">Items</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-amber-800">Total</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-amber-800">Status</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-amber-800">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-amber-800/60 italic">
                    No orders on this date
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-beige-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-lg bg-amber-800 text-beige-50 font-bold text-sm">
                        {order.tableId?.tableNumber ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-black font-mono">#{order._id.slice(-6)}</td>
                    <td className="px-4 py-3 text-sm text-black">{order.items.length} items</td>
                    <td className="px-4 py-3 text-sm text-black font-semibold">
                      ₹{order.items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-amber-800/70 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
