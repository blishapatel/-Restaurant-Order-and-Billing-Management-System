import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PanelRefreshButton from '../components/PanelRefreshButton';
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

  const statusColors = {
    available: 'from-green-50 to-green-100 border-green-400',
    occupied: 'from-red-50 to-red-100 border-red-400',
    reserved: 'from-yellow-50 to-yellow-100 border-yellow-400'
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  if (loading) return (
    <div className="min-h-screen bg-beige-50 flex items-center justify-center font-serif">
      <div className="w-10 h-10 border-4 border-amber-800 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!selectedTable) {
    return (
      <div className="min-h-screen bg-beige-50 font-serif">
        <header className="bg-white border-b border-beige-300 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-black">{'\ud83c\udf7d\ufe0f'} Waiter Panel</h1>
            <p className="text-sm text-amber-800">
              {user?.name} · {user?.role} · {user?.phone || user?.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PanelRefreshButton onClick={fetchData} loading={loading} />
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-amber-800 text-beige-50 rounded-xl hover:bg-amber-700 transition-colors cursor-pointer">
              <HiOutlineLogout size={18} /> Logout
            </button>
          </div>
        </header>
        <div className="p-6">
          <h2 className="text-xl font-bold text-black mb-2">Select a Table</h2>
          <p className="text-amber-800 mb-6">Tap a table to start taking orders</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {tables.map(table => (
              <button
                key={table._id}
                onClick={() => selectTable(table)}
                className={`bg-gradient-to-br ${statusColors[table.status]} border-2 rounded-2xl p-5 text-center hover:shadow-lg transition-all cursor-pointer`}
              >
                <div className="text-3xl mb-2">{'\ud83e\ude91'}</div>
                <h3 className="text-xl font-bold text-black">Table {table.tableNumber}</h3>
                <p className="text-xs text-amber-800/70">Seats: {table.capacity}</p>
                <p className={`text-xs font-medium mt-2 capitalize ${table.status === 'available' ? 'text-green-700' : table.status === 'occupied' ? 'text-red-700' : 'text-yellow-700'}`}>{table.status}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige-50 font-serif">
      <header className="bg-white border-b border-beige-300 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => { setSelectedTable(null); setCart([]); setExistingOrder(null); }} className="flex items-center gap-2 text-amber-800 hover:text-amber-600 cursor-pointer">
          <HiOutlineArrowLeft size={20} /> Back to Tables
        </button>
        <div className="text-center">
          <h1 className="text-xl font-bold text-black">Table {selectedTable.tableNumber} — Order</h1>
          <p className="text-xs text-amber-800">Serving: {user?.name} ({user?.role}) · {user?.phone}</p>
        </div>
        <div className="flex items-center gap-2 text-amber-800">
          <HiOutlineShoppingCart size={20} />
          <span className="font-bold">{cart.length} items</span>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 p-6">
          {existingOrder && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-black">Existing Order #{existingOrder._id.slice(-6)}</h3>
              <p className="text-sm text-amber-800 mt-1">Status: {existingOrder.status} | Items: {existingOrder.items.length}</p>
              {existingOrder.waiterId && (
                <p className="text-xs text-black/70 mt-1">
                  Waiter: {existingOrder.waiterId.name} ({existingOrder.waiterId.role}) · {existingOrder.waiterId.phone}
                </p>
              )}
              <ul className="mt-2 space-y-1">
                {existingOrder.items.map((item, i) => (
                  <li key={i} className="text-sm text-black">{item.quantity}x {item.name} — ₹{(item.price * item.quantity).toFixed(2)}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
            <button onClick={() => setSelectedCategory('all')} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${
              selectedCategory === 'all' ? 'bg-amber-800 text-beige-50' : 'bg-white border border-beige-300 text-black hover:bg-beige-100'
            }`}>All Items</button>
            {categories.map(cat => (
              <button key={cat._id} onClick={() => setSelectedCategory(cat._id)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategory === cat._id ? 'bg-amber-800 text-beige-50' : 'bg-white border border-beige-300 text-black hover:bg-beige-100'
              }`}>{cat.name}</button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredMenu.map(item => {
              const inCart = cart.find(c => c.menuItemId === item._id);
              return (
                <div key={item._id} className="bg-white rounded-xl border border-beige-300 p-4 flex justify-between items-center hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <h4 className="font-semibold text-black">{item.name}</h4>
                    <p className="text-xs text-amber-800/60 mt-0.5">{item.description}</p>
                    <p className="text-amber-800 font-bold mt-1">₹{item.price}</p>
                  </div>
                  {inCart ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item._id, -1)} className="w-8 h-8 rounded-full bg-beige-200 flex items-center justify-center text-black cursor-pointer hover:bg-beige-300 transition-colors">
                        <HiOutlineMinus size={14} />
                      </button>
                      <span className="font-bold text-black w-6 text-center">{inCart.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, 1)} className="w-8 h-8 rounded-full bg-amber-800 flex items-center justify-center text-beige-50 cursor-pointer hover:bg-amber-700 transition-colors">
                        <HiOutlinePlus size={14} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(item)} className="px-4 py-2 bg-amber-800 text-beige-50 rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors cursor-pointer">
                      Add
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:w-96 bg-white border-l border-beige-300 p-6 lg:min-h-screen">
          <h3 className="text-xl font-bold text-black mb-4">Order Summary</h3>
          {cart.length === 0 ? (
            <p className="text-amber-800/60 italic text-center py-8">No items added yet</p>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {cart.map(item => (
                  <div key={item.menuItemId} className="flex items-center justify-between bg-beige-50 rounded-xl p-3">
                    <div className="flex-1">
                      <p className="font-medium text-black text-sm">{item.name}</p>
                      <p className="text-xs text-amber-800">₹{item.price} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-black text-sm">₹{(item.price * item.quantity).toFixed(2)}</span>
                      <button onClick={() => removeFromCart(item.menuItemId)} className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer">
                        <HiOutlineX size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-beige-300 pt-4 mb-4">
                <div className="flex justify-between text-lg font-bold text-black">
                  <span>Total</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
              </div>
              <button onClick={placeOrder} className="w-full py-3 bg-amber-800 text-beige-50 rounded-xl font-semibold text-lg hover:bg-amber-700 transition-all shadow-lg cursor-pointer">
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
