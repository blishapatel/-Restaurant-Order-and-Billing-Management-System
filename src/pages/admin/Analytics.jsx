import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import PanelRefreshButton from '../../components/PanelRefreshButton';
import { HiOutlineCurrencyRupee, HiOutlineClipboardList, HiOutlineTrendingUp, HiOutlineStar } from 'react-icons/hi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await API.get('/billing/reports/analytics');
      setData(res);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to load analytics';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-amber-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-2xl border border-beige-300 p-12 text-center">
        <p className="text-amber-800/70 italic">No analytics data available</p>
        <button onClick={fetchAnalytics} className="mt-4 px-4 py-2 bg-amber-800 text-beige-50 rounded-xl hover:bg-amber-700 cursor-pointer text-sm">
          Try Again
        </button>
      </div>
    );
  }

  const { dailyRevenue, popularItems, paymentMethods, totalRevenue, totalOrders, averageOrderValue } = data;

  const bestItem = popularItems.length > 0 ? popularItems[0].name : '—';

  // Summary stat cards
  const statCards = [
    { label: 'Total Revenue (30d)', value: `₹${totalRevenue.toFixed(2)}`, icon: <HiOutlineCurrencyRupee size={24} />, bg: 'bg-green-50', iconBg: 'bg-green-100 text-green-800' },
    { label: 'Total Orders (30d)', value: totalOrders, icon: <HiOutlineClipboardList size={24} />, bg: 'bg-amber-50', iconBg: 'bg-amber-100 text-amber-800' },
    { label: 'Avg Order Value', value: `₹${averageOrderValue.toFixed(2)}`, icon: <HiOutlineTrendingUp size={24} />, bg: 'bg-blue-50', iconBg: 'bg-blue-100 text-blue-800' },
    { label: 'Best Seller', value: bestItem, icon: <HiOutlineStar size={24} />, bg: 'bg-purple-50', iconBg: 'bg-purple-100 text-purple-800' },
  ];

  // Revenue trend chart
  const revenueChartData = {
    labels: dailyRevenue.map(d => {
      const parts = d.date.split('-');
      return `${parts[2]}/${parts[1]}`;
    }),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: dailyRevenue.map(d => d.revenue),
        borderColor: '#7A5C2E',
        backgroundColor: 'rgba(122, 92, 46, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#7A5C2E',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
      }
    ]
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleFont: { family: "'Times New Roman', serif" },
        bodyFont: { family: "'Times New Roman', serif" },
        callbacks: {
          label: (ctx) => `₹${ctx.parsed.y.toFixed(2)}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: "'Times New Roman', serif", size: 10 }, maxRotation: 45, color: '#7A5C2E' }
      },
      y: {
        grid: { color: 'rgba(235, 227, 213, 0.5)' },
        ticks: { font: { family: "'Times New Roman', serif", size: 11 }, color: '#7A5C2E', callback: (v) => `₹${v}` }
      }
    }
  };

  // Popular items chart (top 8, compact)
  const topItems = popularItems.slice(0, 8);
  const itemsChartData = {
    labels: topItems.map(i => i.name.length > 18 ? i.name.slice(0, 18) + '…' : i.name),
    datasets: [
      {
        label: 'Qty Sold',
        data: topItems.map(i => i.quantity),
        backgroundColor: [
          '#7A5C2E', '#B8860B', '#996515', '#D4A574', '#C2B280',
          '#A0522D', '#CD853F', '#DEB887', '#D2691E', '#8B7355'
        ],
        borderColor: '#fff',
        borderWidth: 2,
        borderRadius: 6,
      }
    ]
  };

  const itemsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleFont: { family: "'Times New Roman', serif" },
        bodyFont: { family: "'Times New Roman', serif" },
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(235, 227, 213, 0.5)' },
        ticks: { font: { family: "'Times New Roman', serif", size: 11 }, color: '#7A5C2E', stepSize: 1 }
      },
      y: {
        grid: { display: false },
        ticks: { font: { family: "'Times New Roman', serif", size: 11 }, color: '#000' }
      }
    }
  };

  // Payment methods chart
  const paymentTotal = (paymentMethods.cash || 0) + (paymentMethods.card || 0) + (paymentMethods.upi || 0);
  const paymentChartData = {
    labels: ['Cash', 'Card', 'UPI'],
    datasets: [
      {
        data: [paymentMethods.cash || 0, paymentMethods.card || 0, paymentMethods.upi || 0],
        backgroundColor: ['#22c55e', '#3b82f6', '#a855f7'],
        borderColor: '#fff',
        borderWidth: 3,
        hoverOffset: 6,
      }
    ]
  };

  const paymentChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: "'Times New Roman', serif", size: 12 },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
        }
      },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleFont: { family: "'Times New Roman', serif" },
        bodyFont: { family: "'Times New Roman', serif" },
        callbacks: {
          label: (ctx) => {
            const pct = paymentTotal > 0 ? ((ctx.parsed / paymentTotal) * 100).toFixed(1) : 0;
            return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
          }
        }
      }
    }
  };

  // Revenue by day-of-week bar chart
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayTotals = Array(7).fill(0);
  const dayCounts = Array(7).fill(0);
  dailyRevenue.forEach(d => {
    const dayIdx = new Date(d.date + 'T00:00:00').getDay();
    dayTotals[dayIdx] += d.revenue;
    dayCounts[dayIdx] += 1;
  });
  const dayAvg = dayTotals.map((t, i) => dayCounts[i] > 0 ? t / dayCounts[i] : 0);

  const weekdayChartData = {
    labels: dayNames,
    datasets: [
      {
        label: 'Avg Revenue (₹)',
        data: dayAvg,
        backgroundColor: dayAvg.map((v, i) => {
          const max = Math.max(...dayAvg);
          return v === max ? '#7A5C2E' : 'rgba(122, 92, 46, 0.3)';
        }),
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const weekdayChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleFont: { family: "'Times New Roman', serif" },
        bodyFont: { family: "'Times New Roman', serif" },
        callbacks: { label: (ctx) => `₹${ctx.parsed.y.toFixed(2)}` }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: "'Times New Roman', serif", size: 12, weight: '600' }, color: '#000' }
      },
      y: {
        grid: { color: 'rgba(235, 227, 213, 0.5)' },
        ticks: { font: { family: "'Times New Roman', serif", size: 11 }, color: '#7A5C2E', callback: (v) => `₹${v}` }
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <p className="text-amber-800">Business insights from the last 30 days</p>
        <PanelRefreshButton onClick={fetchAnalytics} loading={loading} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, i) => (
          <div key={i} className={`${card.bg} rounded-2xl p-4 border border-beige-300 shadow-sm hover:shadow-md transition-shadow`}>
            <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center mb-3`}>
              {card.icon}
            </div>
            <p className="text-xl font-bold text-black truncate">{card.value}</p>
            <p className="text-xs text-amber-800 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Revenue Trend */}
        <div className="bg-white rounded-2xl border border-beige-300 shadow-sm p-4">
          <h3 className="text-base font-bold text-black mb-1">Revenue Trend</h3>
          <p className="text-xs text-amber-800/60 mb-3">Daily revenue over the last 30 days</p>
          <div className="h-56">
            <Line data={revenueChartData} options={revenueChartOptions} />
          </div>
        </div>

        {/* Revenue by Day of Week */}
        <div className="bg-white rounded-2xl border border-beige-300 shadow-sm p-4">
          <h3 className="text-base font-bold text-black mb-1">Busiest Days</h3>
          <p className="text-xs text-amber-800/60 mb-3">Average revenue by day of week</p>
          <div className="h-56">
            <Bar data={weekdayChartData} options={weekdayChartOptions} />
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-white rounded-2xl border border-beige-300 shadow-sm p-4">
          <h3 className="text-base font-bold text-black mb-1">Top Selling Items</h3>
          <p className="text-xs text-amber-800/60 mb-3">Most popular items by quantity sold</p>
          <div className="h-52">
            <Bar data={itemsChartData} options={itemsChartOptions} />
          </div>
          {topItems.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-black/80 border-t border-beige-200 pt-2">
              {topItems.slice(0, 5).map((item, i) => (
                <li key={item.name} className="flex justify-between">
                  <span>{i + 1}. {item.name}</span>
                  <span className="font-medium">{item.quantity} sold · ₹{item.revenue.toFixed(0)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl border border-beige-300 shadow-sm p-4">
          <h3 className="text-base font-bold text-black mb-1">Payment Methods</h3>
          <p className="text-xs text-amber-800/60 mb-3">Breakdown by payment type</p>
          {paymentTotal === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-amber-800/50 italic text-sm">No payment data yet</p>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center">
              <div className="w-48 h-48">
                <Doughnut data={paymentChartData} options={paymentChartOptions} />
              </div>
            </div>
          )}
          {paymentTotal > 0 && (
            <div className="flex justify-center gap-6 mt-2 text-sm">
              <span className="text-green-700 font-medium">Cash: {paymentMethods.cash || 0}</span>
              <span className="text-blue-700 font-medium">Card: {paymentMethods.card || 0}</span>
              <span className="text-purple-700 font-medium">UPI: {paymentMethods.upi || 0}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
