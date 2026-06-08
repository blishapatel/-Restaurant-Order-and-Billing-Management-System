import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import PanelRefreshButton from '../../components/PanelRefreshButton';
import useAnimatedCounter from '../../utils/useAnimatedCounter.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import { HiOutlineCurrencyRupee, HiOutlineClipboardList, HiOutlineTrendingUp, HiOutlineStar } from 'react-icons/hi';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const StatCard = ({ label, rawValue, prefix, icon, borderColor, iconBg, iconColor }) => {
  const isNumber = typeof rawValue === 'number';
  const { count, ref } = useAnimatedCounter(isNumber ? rawValue : 0, 1200, prefix === '₹' ? 2 : 0);
  return (
    <div ref={ref} className="rounded-2xl p-4 hover:shadow-lg transition-all duration-300"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: `4px solid ${borderColor}`, boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: iconBg, color: iconColor }}>{icon}</div>
      <p className="text-xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>{isNumber ? `${prefix || ''}${count}` : rawValue}</p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
    </div>
  );
};

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const tickColor = isDark ? '#94A3B8' : '#64748B';
  const tooltipBg = isDark ? '#1E293B' : '#1E293B';
  const chartFont = "'Inter', sans-serif";
  const brandColor = '#2563EB';
  const brandColorRgb = '37,99,235';

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await API.get('/billing/reports/analytics');
      setData(res);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load analytics');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '4px solid var(--border)', borderTopColor: 'var(--accent)' }} />
    </div>
  );

  if (!data) {
    return (
      <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="italic" style={{ color: 'var(--text-tertiary)' }}>No analytics data available</p>
        <button onClick={fetchAnalytics} className="mt-4 px-4 py-2 rounded-xl cursor-pointer text-sm btn-primary">Try Again</button>
      </div>
    );
  }

  const { dailyRevenue, popularItems, paymentMethods, totalRevenue, totalOrders, averageOrderValue } = data;
  const bestItem = popularItems.length > 0 ? popularItems[0].name : '—';

  const statCards = [
    { label: 'Total Revenue (30d)', rawValue: totalRevenue, prefix: '₹', icon: <HiOutlineCurrencyRupee size={24} />, borderColor: 'var(--success)', iconBg: 'var(--success-light)', iconColor: 'var(--success-text)' },
    { label: 'Total Orders (30d)', rawValue: totalOrders, icon: <HiOutlineClipboardList size={24} />, borderColor: 'var(--chart-3)', iconBg: 'var(--warning-light)', iconColor: 'var(--warning-text)' },
    { label: 'Avg Order Value', rawValue: averageOrderValue, prefix: '₹', icon: <HiOutlineTrendingUp size={24} />, borderColor: 'var(--accent)', iconBg: 'var(--accent-light)', iconColor: 'var(--accent-text)' },
    { label: 'Best Seller', rawValue: bestItem, icon: <HiOutlineStar size={24} />, borderColor: 'var(--purple)', iconBg: 'var(--purple-light)', iconColor: 'var(--purple-text)' },
  ];

  const revenueChartData = {
    labels: dailyRevenue.map(d => { const parts = d.date.split('-'); return `${parts[2]}/${parts[1]}`; }),
    datasets: [{
      label: 'Revenue (₹)',
      data: dailyRevenue.map(d => d.revenue),
      borderColor: brandColor,
      backgroundColor: (ctx) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
        gradient.addColorStop(0, `rgba(${brandColorRgb},0.25)`);
        gradient.addColorStop(1, `rgba(${brandColorRgb},0.01)`);
        return gradient;
      },
      fill: true, tension: 0.4,
      pointBackgroundColor: brandColor,
      pointBorderColor: isDark ? '#1E293B' : '#fff',
      pointBorderWidth: 2, pointRadius: 3, pointHoverRadius: 6,
    }]
  };

  const revenueChartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: tooltipBg, titleFont: { family: chartFont }, bodyFont: { family: chartFont }, titleColor: '#fff', bodyColor: '#fff', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, cornerRadius: 8, padding: 10, callbacks: { label: (ctx) => `₹${ctx.parsed.y.toFixed(2)}` } }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: chartFont, size: 10 }, maxRotation: 45, color: tickColor } },
      y: { grid: { color: gridColor }, ticks: { font: { family: chartFont, size: 11 }, color: tickColor, callback: (v) => `₹${v}` } }
    }
  };

  const chartColors = ['#2563EB','#7C3AED','#D97706','#059669','#DC2626','#EC4899','#06B6D4','#EA580C'];
  const topItems = popularItems.slice(0, 8);
  const itemsChartData = {
    labels: topItems.map(i => i.name.length > 18 ? i.name.slice(0, 18) + '…' : i.name),
    datasets: [{
      label: 'Qty Sold',
      data: topItems.map(i => i.quantity),
      backgroundColor: chartColors,
      borderColor: isDark ? 'rgba(0,0,0,0.3)' : '#fff',
      borderWidth: 2, borderRadius: 6,
    }]
  };

  const itemsChartOptions = {
    responsive: true, maintainAspectRatio: false, indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: tooltipBg, titleFont: { family: chartFont }, bodyFont: { family: chartFont }, titleColor: '#fff', bodyColor: '#fff', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, cornerRadius: 8, padding: 10 }
    },
    scales: {
      x: { grid: { color: gridColor }, ticks: { font: { family: chartFont, size: 11 }, color: tickColor, stepSize: 1 } },
      y: { grid: { display: false }, ticks: { font: { family: chartFont, size: 11 }, color: tickColor } }
    }
  };

  const paymentTotal = (paymentMethods.cash || 0) + (paymentMethods.card || 0) + (paymentMethods.upi || 0);
  const paymentChartData = {
    labels: ['Cash', 'Card', 'UPI'],
    datasets: [{
      data: [paymentMethods.cash || 0, paymentMethods.card || 0, paymentMethods.upi || 0],
      backgroundColor: ['#059669', '#2563EB', '#7C3AED'],
      borderColor: isDark ? 'rgba(0,0,0,0.4)' : '#fff',
      borderWidth: 3, hoverOffset: 6,
    }]
  };

  const paymentChartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { family: chartFont, size: 12 }, padding: 16, usePointStyle: true, pointStyleWidth: 10, color: tickColor } },
      tooltip: {
        backgroundColor: tooltipBg, titleFont: { family: chartFont }, bodyFont: { family: chartFont }, titleColor: '#fff', bodyColor: '#fff',
        borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, cornerRadius: 8, padding: 10,
        callbacks: { label: (ctx) => { const pct = paymentTotal > 0 ? ((ctx.parsed / paymentTotal) * 100).toFixed(1) : 0; return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`; } }
      }
    }
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayTotals = Array(7).fill(0);
  const dayCounts = Array(7).fill(0);
  dailyRevenue.forEach(d => { const dayIdx = new Date(d.date + 'T00:00:00').getDay(); dayTotals[dayIdx] += d.revenue; dayCounts[dayIdx] += 1; });
  const dayAvg = dayTotals.map((t, i) => dayCounts[i] > 0 ? t / dayCounts[i] : 0);

  const weekdayChartData = {
    labels: dayNames,
    datasets: [{
      label: 'Avg Revenue (₹)',
      data: dayAvg,
      backgroundColor: dayAvg.map((v) => { const max = Math.max(...dayAvg); return v === max ? brandColor : `rgba(${brandColorRgb},0.15)`; }),
      borderRadius: 8, borderSkipped: false,
    }]
  };

  const weekdayChartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: tooltipBg, titleFont: { family: chartFont }, bodyFont: { family: chartFont }, titleColor: '#fff', bodyColor: '#fff', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, cornerRadius: 8, padding: 10, callbacks: { label: (ctx) => `₹${ctx.parsed.y.toFixed(2)}` } }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: chartFont, size: 12, weight: '600' }, color: tickColor } },
      y: { grid: { color: gridColor }, ticks: { font: { family: chartFont, size: 11 }, color: tickColor, callback: (v) => `₹${v}` } }
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <p style={{ color: 'var(--text-secondary)' }}>Business insights from the last 30 days</p>
        <PanelRefreshButton onClick={fetchAnalytics} loading={loading} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, i) => <StatCard key={i} {...card} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Revenue Trend</h3>
          <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>Daily revenue over the last 30 days</p>
          <div className="h-56"><Line data={revenueChartData} options={revenueChartOptions} /></div>
        </div>

        <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Busiest Days</h3>
          <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>Average revenue by day of week</p>
          <div className="h-56"><Bar data={weekdayChartData} options={weekdayChartOptions} /></div>
        </div>

        <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Top Selling Items</h3>
          <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>Most popular items by quantity sold</p>
          <div className="h-52"><Bar data={itemsChartData} options={itemsChartOptions} /></div>
          {topItems.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs pt-2" style={{ borderTop: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
              {topItems.slice(0, 5).map((item, i) => (
                <li key={item.name} className="flex justify-between">
                  <span>{i + 1}. {item.name}</span>
                  <span className="font-medium">{item.quantity} sold · ₹{item.revenue.toFixed(0)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Payment Methods</h3>
          <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>Breakdown by payment type</p>
          {paymentTotal === 0 ? (
            <div className="h-48 flex items-center justify-center"><p className="italic text-sm" style={{ color: 'var(--text-tertiary)' }}>No payment data yet</p></div>
          ) : (
            <div className="h-52 flex items-center justify-center"><div className="w-48 h-48"><Doughnut data={paymentChartData} options={paymentChartOptions} /></div></div>
          )}
          {paymentTotal > 0 && (
            <div className="flex justify-center gap-6 mt-2 text-sm">
              <span className="font-medium" style={{ color: '#059669' }}>Cash: {paymentMethods.cash || 0}</span>
              <span className="font-medium" style={{ color: '#2563EB' }}>Card: {paymentMethods.card || 0}</span>
              <span className="font-medium" style={{ color: '#7C3AED' }}>UPI: {paymentMethods.upi || 0}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
