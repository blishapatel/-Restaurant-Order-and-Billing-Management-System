import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import PanelRefreshButton from '../../components/PanelRefreshButton';
import useAnimatedCounter from '../../utils/useAnimatedCounter.js';
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
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
};

const StatCard = ({ label, rawValue, prefix, icon, borderColor, iconBg, iconColor }) => {
  const isNumber = typeof rawValue === 'number';
  const { count, ref } = useAnimatedCounter(isNumber ? rawValue : 0, 1200, prefix === '₹' ? 2 : 0);
  return (
    <div
      ref={ref}
      className="rounded-2xl p-5 hover:shadow-lg transition-all duration-300"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: `4px solid ${borderColor}`,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        {isNumber ? `${prefix || ''}${count}` : rawValue}
      </p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
    </div>
  );
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

      try { const res = await API.get('/orders'); orders = res.data; } catch (e) {}
      try { const res = await API.get('/tables'); tables = res.data; } catch (e) {}
      try { const res = await API.get(`/billing/reports/daily?date=${selectedDate}`); report = res.data; } catch (e) {}

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

  useEffect(() => { fetchData(); }, [fetchData]);

  const dateLabel = isToday ? 'Today' : formatDisplayDate(selectedDate);

  const statCards = [
    {
      label: `Orders · ${dateLabel}`, rawValue: stats.totalOrders,
      icon: <HiOutlineClipboardList size={28} />,
      borderColor: 'var(--chart-3)', iconBg: 'var(--warning-light)', iconColor: 'var(--warning-text)',
    },
    {
      label: `Revenue · ${dateLabel}`, rawValue: stats.revenue, prefix: '₹',
      icon: <HiOutlineCurrencyRupee size={28} />,
      borderColor: 'var(--success)', iconBg: 'var(--success-light)', iconColor: 'var(--success-text)',
    },
    {
      label: 'Pending Orders (live)', rawValue: stats.pendingOrders,
      icon: <HiOutlineClock size={28} />,
      borderColor: 'var(--warning)', iconBg: 'var(--orange-light)', iconColor: 'var(--orange-text)',
    },
    {
      label: 'Available Tables', rawValue: stats.availableTables,
      icon: <HiOutlineViewGrid size={28} />,
      borderColor: 'var(--accent)', iconBg: 'var(--accent-light)', iconColor: 'var(--accent-text)',
    },
  ];

  const statusStyles = {
    pending: { background: 'var(--warning-light)', color: 'var(--warning-text)' },
    'in-kitchen': { background: 'var(--orange-light)', color: 'var(--orange-text)' },
    served: { background: 'var(--accent-light)', color: 'var(--accent-text)' },
    billed: { background: 'var(--success-light)', color: 'var(--success-text)' },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '4px solid var(--border)', borderTopColor: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>View stats and orders for any day</p>
          <p className="font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>{formatDisplayDate(selectedDate)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Date:</label>
          <input type="date" value={selectedDate} max={todayStr()} onChange={(e) => setSelectedDate(e.target.value)} className="input-field text-sm py-2" />
          <button
            type="button"
            onClick={() => setSelectedDate(todayStr())}
            className="px-3 py-2 text-sm rounded-xl font-medium cursor-pointer transition-all"
            style={{
              background: isToday ? 'var(--accent)' : 'var(--surface)',
              color: isToday ? 'var(--accent-text)' : 'var(--text-primary)',
              border: `1px solid ${isToday ? 'var(--accent)' : 'var(--border)'}`,
              boxShadow: isToday ? 'var(--shadow-glow)' : 'none',
            }}
          >
            Today
          </button>
          <PanelRefreshButton onClick={fetchData} loading={loading} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => <StatCard key={i} {...card} />)}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Orders on {dateLabel}</h3>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{recentOrders.length} order(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: 'var(--surface-2)' }}>
              <tr>
                {['Table', 'Order ID', 'Items', 'Total', 'Status', 'Time'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center italic" style={{ color: 'var(--text-tertiary)' }}>No orders on this date</td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order._id} className="transition-colors duration-200" style={{ borderBottom: '1px solid var(--border-light)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-lg font-bold text-sm" style={{ background: 'var(--accent)', color: 'var(--text-inverse)' }}>
                        {order.tableId?.tableNumber ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono" style={{ color: 'var(--text-primary)' }}>#{order._id.slice(-6)}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>{order.items.length} items</td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      ₹{order.items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium capitalize" style={statusStyles[order.status] || {}}>{order.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: 'var(--text-tertiary)' }}>
                      {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
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
