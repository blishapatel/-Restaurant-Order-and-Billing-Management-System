import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import RestaurantBill from '../components/RestaurantBill';
import PanelRefreshButton from '../components/PanelRefreshButton';
import { HiOutlineLogout, HiOutlineArrowLeft } from 'react-icons/hi';

const CashierPanel = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [bill, setBill] = useState(null);
  const [paidReceipt, setPaidReceipt] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/orders');
      setOrders(data.filter((o) => o.status === 'served'));
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const selectOrder = async (order) => {
    setPaidReceipt(null);
    setSelectedOrder(order);
    setDiscount(0);
    try {
      const { data } = await API.post(`/billing/generate/${order._id}`, { discount: 0 });
      setBill(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate bill');
    }
  };

  const subtotal = selectedOrder?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const cgst = subtotal * 0.025;
  const sgst = subtotal * 0.025;
  const total = subtotal + cgst + sgst - discount;

  const previewBill = bill
    ? { ...bill, subtotal, cgst, sgst, discount, total }
    : { subtotal, cgst, sgst, discount, total };

  const confirmPayment = async () => {
    if (!bill || !selectedOrder) return;
    setProcessing(true);
    try {
      const { data: paidBill } = await API.post(`/billing/pay/${bill._id}`, { paymentMethod, discount });
      const orderForReceipt = {
        ...selectedOrder,
        waiterId: selectedOrder.waiterId,
        tableId: selectedOrder.tableId,
      };
      setPaidReceipt({
        order: orderForReceipt,
        bill: { ...paidBill, subtotal, cgst, sgst, discount, total: paidBill.total ?? total },
        paymentMethod,
      });
      toast.success('Payment confirmed! Print bill if needed.');
      setSelectedOrder(null);
      setBill(null);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-200 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-200 font-serif">
      <header className="bg-white border-b border-neutral-300 px-6 py-4 flex items-center justify-between sticky top-0 z-10 no-print">
        <div>
          <h1 className="text-2xl font-bold text-black">Cashier Panel</h1>
          <p className="text-sm text-neutral-600">{user?.name} · {user?.role}</p>
        </div>
        <div className="flex items-center gap-2">
          <PanelRefreshButton onClick={fetchOrders} loading={loading} className="border-neutral-400 text-black" />
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-neutral-800 cursor-pointer">
            <HiOutlineLogout size={18} /> Logout
          </button>
        </div>
      </header>

      {paidReceipt && (
        <div className="no-print bg-white border-b border-neutral-300 p-6">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-black">Payment successful — Print receipt</h2>
              <button
                type="button"
                onClick={() => setPaidReceipt(null)}
                className="text-sm text-neutral-600 hover:text-black cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            <RestaurantBill
              order={paidReceipt.order}
              bill={paidReceipt.bill}
              paymentMethod={paidReceipt.paymentMethod}
              printId="paid-receipt-print"
            />
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row">
        <div className={`${selectedOrder ? 'hidden lg:block' : ''} lg:w-1/3 border-r border-neutral-300 bg-white no-print`}>
          <div className="p-4 border-b border-neutral-200">
            <h2 className="text-lg font-bold text-black">Served Orders</h2>
            <p className="text-sm text-neutral-600">{orders.length} ready for billing</p>
          </div>
          <div className="divide-y divide-neutral-200">
            {orders.length === 0 ? (
              <p className="text-center text-neutral-500 py-12 italic">No served orders</p>
            ) : (
              orders.map((order) => (
                <button
                  key={order._id}
                  type="button"
                  onClick={() => selectOrder(order)}
                  className={`w-full text-left p-4 hover:bg-neutral-50 cursor-pointer ${
                    selectedOrder?._id === order._id ? 'bg-neutral-100 border-l-4 border-black' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-black">Table {order.tableId?.tableNumber || 'N/A'}</span>
                    <span className="text-xs text-neutral-500">#{order._id.slice(-6)}</span>
                  </div>
                  <p className="text-sm text-neutral-600 mt-1">
                    {order.items.length} items · ₹{order.items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 p-6">
          {!selectedOrder ? (
            <div className="text-center py-20 no-print">
              <h2 className="text-2xl font-bold text-black">Select an Order</h2>
              <p className="text-neutral-600 mt-2">Click a served order to generate the bill</p>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <button
                type="button"
                onClick={() => { setSelectedOrder(null); setBill(null); }}
                className="lg:hidden no-print flex items-center gap-2 text-black mb-4 cursor-pointer"
              >
                <HiOutlineArrowLeft size={18} /> Back
              </button>

              <div className="no-print mb-4 space-y-4 bg-white border border-neutral-300 p-4">
                <div className="flex justify-between items-center">
                  <span className="text-black font-medium">Discount (₹)</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                    className="w-28 px-3 py-1.5 border border-black bg-white text-black text-right focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Payment Method</label>
                  <div className="flex gap-2">
                    {['Cash', 'Card', 'UPI'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`flex-1 py-2 text-sm font-medium border cursor-pointer ${
                          paymentMethod === method
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-black border-neutral-400 hover:border-black'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={confirmPayment}
                  disabled={processing}
                  className="w-full py-3 bg-black text-white font-semibold hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
                >
                  {processing ? 'Processing...' : 'Confirm Payment & Save Bill'}
                </button>
              </div>

              <p className="no-print text-center text-xs text-neutral-600 mb-2">Bill preview (print after payment or now)</p>
              <RestaurantBill
                order={selectedOrder}
                bill={previewBill}
                paymentMethod={paymentMethod}
                discount={discount}
                printId="cashier-bill-print"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashierPanel;
