import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineClipboardList, HiOutlineCurrencyRupee, HiOutlineClock, HiOutlineViewGrid } from 'react-icons/hi';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalOrders: 0, revenue: 0, pendingOrders: 0, availableTables: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, tablesRes, reportRes] = await Promise.all([
        API.get('/orders'),
        API.get('/tables'),
        API.get('/billing/reports/daily').catch(() => ({ data: { totalOrders: 0, totalRevenue: 0 } }))
      ]);

      const orders = ordersRes.data;
      const tables = tablesRes.data;
      const report = reportRes.data;

      const todayOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt).toDateString();
        return orderDate === new Date().toDateString();
      });

      setStats({
        totalOrders: todayOrders.length,
        revenue: report.totalRevenue || 0,
        pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'in-kitchen').length,
        availableTables: tables.filter(t => t.status === 'available').length
      });

      setRecentOrders(orders.slice(0, 10));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Orders Today', value: stats.totalOrders, icon: <HiOutlineClipboardList size={28} />, bg: 'bg-amber-50', iconBg: 'bg-amber-100 text-amber-800' },
    { label: 'Revenue Today', value: `₹${stats.revenue.toFixed(2)}`, icon: <HiOutlineCurrencyRupee size={28} />, bg: 'bg-green-50', iconBg: 'bg-green-100 text-green-800' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: <HiOutlineClock size={28} />, bg: 'bg-orange-50', iconBg: 'bg-orange-100 text-orange-800' },
    { label: 'Available Tables', value: stats.availableTables, icon: <HiOutlineViewGrid size={28} />, bg: 'bg-blue-50', iconBg: 'bg-blue-100 text-blue-800' },
  ];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    'in-kitchen': 'bg-orange-100 text-orange-800',
    served: 'bg-blue-100 text-blue-800',
    billed: 'bg-green-100 text-green-800'
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-10 h-10 border-4 border-amber-800 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className={`${card.bg} rounded-2xl p-6 border border-beige-300 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                {card.icon}
              </div>
            </div>
            <p className="text-3xl font-bold text-black">{card.value}</p>
            <p className="text-sm text-amber-800 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-beige-300 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-beige-200">
          <h3 className="text-xl font-bold text-black">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-beige-100">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-amber-800">Order ID</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-amber-800">Table</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-amber-800">Waiter</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-amber-800">Contact</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-amber-800">Items</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-amber-800">Total</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-amber-800">Status</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-amber-800">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {recentOrders.length === 0 ? (
                <tr><td colSpan="8" className="px-6 py-8 text-center text-amber-800/60 italic">No orders yet</td></tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-beige-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-black font-mono">#{order._id.slice(-6)}</td>
                    <td className="px-6 py-4 text-sm text-black">Table {order.tableId?.tableNumber || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-black">
                      {order.waiterId?.name || 'N/A'}
                      <span className="text-amber-800/70 text-xs block capitalize">{order.waiterId?.role}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-black/70">
                      {order.waiterId?.phone || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-black">{order.items.length} items</td>
                    <td className="px-6 py-4 text-sm text-black font-semibold">₹{order.items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-amber-800/70">
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
