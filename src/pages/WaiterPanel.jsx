import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PanelRefreshButton from '../components/PanelRefreshButton';
import ThemeToggle from '../components/ThemeToggle';
import { HiOutlineLogout, HiOutlinePlus, HiOutlineMinus, HiOutlineShoppingCart, HiOutlineX, HiOutlineArrowLeft } from 'react-icons/hi';

const WaiterPanel = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [existingOrder, setExistingOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tablesRes, menuRes, catRes] = await Promise.all([
        API.get('/tables'),
        API.get('/menu'),
        API.get('/categories')
      ]);
      setTables(tablesRes.data);
      setMenuItems(menuRes.data.filter(i => i.isAvailable));
      setCategories(catRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const selectTable = async (table) => {
    setSelectedTable(table);
    setCart([]);
    if (table.status === 'occupied') {
      try {
        const { data } = await API.get('/orders');
        const activeOrder = data.find(o => o.tableId?._id === table._id && (o.status === 'pending' || o.status === 'in-kitchen'));
        setExistingOrder(activeOrder || null);
      } catch (error) {
        setExistingOrder(null);
      }
    } else {
      setExistingOrder(null);
    }
  };

  const addToCart = (item) => {
    const existing = cart.find(c => c.menuItemId === item._id);
    if (existing) {
      setCart(cart.map(c => c.menuItemId === item._id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { menuItemId: item._id, name: item.name, price: item.price, quantity: 1 }]);
    }
  };

  const updateQuantity = (menuItemId, delta) => {
    setCart(cart.map(c => {
      if (c.menuItemId === menuItemId) {
        const newQty = c.quantity + delta;
        return newQty > 0 ? { ...c, quantity: newQty } : c;
      }
      return c;
    }).filter(c => c.quantity > 0));
  };

  const removeFromCart = (menuItemId) => {
    setCart(cart.filter(c => c.menuItemId !== menuItemId));
  };

  const placeOrder = async () => {
    if (cart.length === 0) { toast.error('Add items to order'); return; }
    try {
      if (existingOrder) {
        await API.post(`/orders/${existingOrder._id}/items`, { items: cart });
        toast.success('Items added to existing order!');
      } else {
        await API.post('/orders', { tableId: selectedTable._id, items: cart });
        toast.success('Order placed successfully!');
      }
      setCart([]);
      setSelectedTable(null);
      setExistingOrder(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const filteredMenu = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(i => (i.category?._id || i.category) === selectedCategory);

  const handleLogout = () => { logout(); navigate('/login'); };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div
        className="w-10 h-10 rounded-full animate-spin"
        style={{ border: '4px solid var(--accent)', borderTopColor: 'transparent' }}
      />
    </div>
  );

  if (!selectedTable) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <header className="glass px-6 py-4 flex items-center justify-between sticky top-0 z-10" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Waiter Panel</h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {user?.name} &middot; {user?.role} &middot; {user?.phone || user?.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <PanelRefreshButton onClick={fetchData} loading={loading} />
            <button onClick={handleLogout} className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm cursor-pointer">
              <HiOutlineLogout size={16} /> Logout
            </button>
          </div>
        </header>

        <div className="p-6 animate-slide-up">
          <div className="mb-6">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Select a Table</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Tap a table to start taking orders</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {tables.map(table => {
              const statusConfig = {
                available: { border: 'var(--success)', bg: 'var(--success-light)', text: 'var(--success-text)', label: 'Available' },
                occupied: { border: 'var(--danger)', bg: 'var(--danger-light)', text: 'var(--danger-text)', label: 'Occupied' },
                reserved: { border: 'var(--warning)', bg: 'var(--warning-light)', text: 'var(--warning-text)', label: 'Reserved' },
              }[table.status] || {};

              return (
                <button
                  key={table._id}
                  onClick={() => selectTable(table)}
                  className="rounded-xl p-5 text-center cursor-pointer transition-all duration-200 hover:-translate-y-1"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderTop: `3px solid ${statusConfig.border}`,
                    boxShadow: 'var(--shadow-sm)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                >
                  <div className="text-3xl mb-2">🪑</div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Table {table.tableNumber}</h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Seats: {table.capacity}</p>
                  <span
                    className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize"
                    style={{ background: statusConfig.bg, color: statusConfig.text }}
                  >
                    {statusConfig.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <header className="glass px-6 py-3 flex items-center justify-between sticky top-0 z-10" style={{ borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => { setSelectedTable(null); setCart([]); setExistingOrder(null); }}
          className="flex items-center gap-2 text-sm font-medium cursor-pointer transition-opacity"
          style={{ color: 'var(--accent)' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <HiOutlineArrowLeft size={18} /> Back
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Table {selectedTable.tableNumber}
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Serving: {user?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
            <HiOutlineShoppingCart size={16} />
            <span>{cart.length}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row animate-slide-up">
        <div className="flex-1 p-6">
          {existingOrder && (
            <div className="rounded-xl p-4 mb-6" style={{ background: 'var(--warning-light)', border: '1px solid var(--warning)' }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                  Existing Order #{existingOrder._id.slice(-6)}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--warning)', color: '#fff' }}>
                  {existingOrder.status}
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Items: {existingOrder.items.length} &middot; Waiter: {existingOrder.waiterId?.name || 'N/A'}</p>
            </div>
          )}

          <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap cursor-pointer transition-all"
              style={{
                background: selectedCategory === 'all' ? 'var(--accent)' : 'var(--surface)',
                color: selectedCategory === 'all' ? 'var(--accent-text)' : 'var(--text-primary)',
                border: '1px solid',
                borderColor: selectedCategory === 'all' ? 'var(--accent)' : 'var(--border)',
              }}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap cursor-pointer transition-all"
                style={{
                  background: selectedCategory === cat._id ? 'var(--accent)' : 'var(--surface)',
                  color: selectedCategory === cat._id ? 'var(--accent-text)' : 'var(--text-primary)',
                  border: '1px solid',
                  borderColor: selectedCategory === cat._id ? 'var(--accent)' : 'var(--border)',
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredMenu.map(item => {
              const inCart = cart.find(c => c.menuItemId === item._id);
              return (
                <div
                  key={item._id}
                  className="rounded-xl p-4 flex justify-between items-center transition-all duration-200 hover:shadow-md"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-focus)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{item.name}</h4>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{item.description}</p>
                    <p className="font-bold mt-1" style={{ color: 'var(--accent)' }}>₹{item.price}</p>
                  </div>
                  {inCart ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => updateQuantity(item._id, -1)} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors" style={{ background: 'var(--surface-2)', color: 'var(--text-primary)' }}>
                        <HiOutlineMinus size={14} />
                      </button>
                      <span className="font-bold w-6 text-center text-sm" style={{ color: 'var(--text-primary)' }}>{inCart.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, 1)} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer" style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
                        <HiOutlinePlus size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer btn-primary shrink-0"
                    >
                      Add
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:w-96 p-6" style={{ background: 'var(--surface-2)', borderLeft: '1px solid var(--border)' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Order Summary</h3>
          {cart.length === 0 ? (
            <p className="text-center py-12 text-sm" style={{ color: 'var(--text-tertiary)' }}>No items added yet</p>
          ) : (
            <>
              <div className="space-y-2 mb-6">
                {cart.map(item => (
                  <div key={item.menuItemId} className="flex items-center justify-between rounded-xl p-3" style={{ background: 'var(--bg-secondary)' }}>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>₹{item.price} &times; {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                      <button onClick={() => removeFromCart(item.menuItemId)} className="p-1 rounded cursor-pointer transition-colors" style={{ color: 'var(--danger)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-light)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <HiOutlineX size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 mb-4" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex justify-between text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  <span>Total</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
              </div>
              <button onClick={placeOrder} className="btn-primary w-full py-3 rounded-xl font-semibold cursor-pointer">
                {existingOrder ? 'Add to Existing Order' : 'Place Order'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaiterPanel;
