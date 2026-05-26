import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PanelRefreshButton from '../components/PanelRefreshButton';
import { HiOutlineLogout, HiOutlineCheck } from 'react-icons/hi';

const KitchenPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/orders');
      setOrders(data.filter(o => o.status === 'pending' || o.status === 'in-kitchen'));
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const markReady = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}`, { status: 'served' });
      toast.success('Order marked as ready!');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const markInKitchen = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}`, { status: 'in-kitchen' });
      toast.success('Order accepted!');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const getTimeSince = (date) => {
    const mins = Math.floor((new Date() - new Date(date)) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  if (loading) return (
    <div className="min-h-screen bg-beige-50 flex items-center justify-center font-serif">
      <div className="w-10 h-10 border-4 border-amber-800 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-beige-50 font-serif">
      <header className="bg-white border-b border-beige-300 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-black">{'\ud83d\udc68\u200d\ud83c\udf73'} Kitchen Panel</h1>
          <p className="text-sm text-amber-800">{user?.name} · {user?.role} · {user?.phone} | Auto-refresh 30s</p>
        </div>
        <div className="flex gap-3">
          <PanelRefreshButton onClick={fetchOrders} loading={loading} />
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-amber-800 text-beige-50 rounded-xl hover:bg-amber-700 transition-colors cursor-pointer">
            <HiOutlineLogout size={18} /> Logout
          </button>
        </div>
      </header>

      <div className="p-6">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">{'\u2705'}</div>
            <h2 className="text-2xl font-bold text-black">All Caught Up!</h2>
            <p className="text-amber-800 mt-2">No pending orders at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map(order => (
              <div key={order._id} className={`bg-white rounded-2xl border-2 shadow-sm hover:shadow-md transition-all overflow-hidden ${
                order.status === 'pending' ? 'border-yellow-400' : 'border-orange-400'
              }`}>
                <div className={`px-5 py-3 flex items-center justify-between ${
                  order.status === 'pending' ? 'bg-yellow-50' : 'bg-orange-50'
                }`}>
                  <div>
                    <span className="font-bold text-black">Table {order.tableId?.tableNumber || 'N/A'}</span>
                    <span className={`ml-3 px-2 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-orange-200 text-orange-800'
                    }`}>{order.status}</span>
                  </div>
                  <span className="text-xs text-amber-800/70">#{order._id.slice(-6)}</span>
                </div>
                <div className="p-5">
                  <div className="space-y-2 mb-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center bg-beige-50 rounded-lg px-3 py-2">
                        <span className="text-black">{item.name}</span>
                        <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full text-sm">×{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-amber-800/70 mb-4">
                    <span>{'\u23f1'} {getTimeSince(order.createdAt)}</span>
                    <span>By: {order.waiterId?.name || 'N/A'}</span>
                  </div>
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <button onClick={() => markInKitchen(order._id)} className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors cursor-pointer">
                        Accept Order
                      </button>
                    )}
                    <button onClick={() => markReady(order._id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors cursor-pointer">
                      <HiOutlineCheck size={18} /> Mark Ready
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenPanel;
