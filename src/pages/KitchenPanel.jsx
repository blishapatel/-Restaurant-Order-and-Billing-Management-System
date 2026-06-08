import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PanelRefreshButton from '../components/PanelRefreshButton';
import ThemeToggle from '../components/ThemeToggle';
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '4px solid var(--accent)', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <header className="glass px-6 py-4 flex items-center justify-between sticky top-0 z-10" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Kitchen Panel</h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {user?.name} &middot; {user?.role} | Auto-refresh 30s
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <PanelRefreshButton onClick={fetchOrders} loading={loading} />
          <button onClick={handleLogout} className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm cursor-pointer">
            <HiOutlineLogout size={16} /> Logout
          </button>
        </div>
      </header>

      <div className="p-6">
        {orders.length === 0 ? (
          <div className="text-center py-20 animate-slide-up">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>All Caught Up!</h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>No pending orders at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {orders.map(order => {
              const isPending = order.status === 'pending';
              return (
                <div
                  key={order._id}
                  className="rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderLeft: `4px solid ${isPending ? 'var(--warning)' : 'var(--orange)'}`,
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div className="px-5 py-3 flex items-center justify-between" style={{ background: isPending ? 'var(--warning-light)' : 'var(--orange-light)' }}>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                        Table {order.tableId?.tableNumber || 'N/A'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium text-white" style={{ background: isPending ? 'var(--warning)' : 'var(--orange)' }}>
                        {order.status}
                      </span>
                    </div>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                      #{order._id.slice(-6)}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="space-y-2 mb-4">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center rounded-lg px-3 py-2" style={{ background: 'var(--surface-2)' }}>
                          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-sm font-bold" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                            &times;{item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>
                      <span>&#9201; {getTimeSince(order.createdAt)}</span>
                      <span>By: {order.waiterId?.name || 'N/A'}</span>
                    </div>

                    <div className="flex gap-2">
                      {isPending && (
                        <button
                          onClick={() => markInKitchen(order._id)}
                          className="flex-1 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-opacity"
                          style={{ background: 'var(--warning)', color: 'white' }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                          Accept
                        </button>
                      )}
                      <button
                        onClick={() => markReady(order._id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-opacity"
                        style={{ background: 'var(--success)', color: 'white' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      >
                        <HiOutlineCheck size={16} /> Ready
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenPanel;
