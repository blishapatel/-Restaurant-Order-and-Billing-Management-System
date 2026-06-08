import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import RestaurantBill from '../components/RestaurantBill';
import PanelRefreshButton from '../components/PanelRefreshButton';
import ThemeToggle from '../components/ThemeToggle';
import { HiOutlineLogout, HiOutlineArrowLeft, HiOutlineCheck } from 'react-icons/hi';

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', color: '#4285F4', icon: 'G' },
  { id: 'phonepe', name: 'PhonePe', color: '#5F259F', icon: 'P' },
  { id: 'paytm', name: 'Paytm', color: '#00BAF2', icon: 'T' },
  { id: 'bhim', name: 'BHIM', color: '#108E3E', icon: 'B' },
];

const CARD_BRANDS = [
  { id: 'visa', name: 'Visa', color: '#1A1F71', icon: 'V' },
  { id: 'mastercard', name: 'Mastercard', color: '#EB001B', icon: 'M' },
  { id: 'rupay', name: 'RuPay', color: '#096B3F', icon: 'R' },
];

const FakeQR = ({ amount, upiId }) => {
  const cells = Array.from({ length: 21 }, () =>
    Array.from({ length: 21 }, () => Math.random() > 0.55)
  );
  // QR finder patterns
  for (let r = 0; r < 7; r++)
    for (let c = 0; c < 7; c++)
      cells[r][c] = r === 0 || r === 6 || c === 0 || c === 6 || (r > 1 && r < 5 && c > 1 && c < 5);
  for (let r = 0; r < 7; r++)
    for (let c = 14; c < 21; c++)
      cells[r][c] = r === 0 || r === 6 || c === 14 || c === 20 || (r > 1 && r < 5 && c > 15 && c < 19);
  for (let r = 14; r < 21; r++)
    for (let c = 0; c < 7; c++)
      cells[r][c] = r === 14 || r === 20 || c === 0 || c === 6 || (r > 15 && r < 19 && c > 1 && c < 5);

  const size = 21;
  const cellSize = 8;
  const padding = 4;
  const svgSize = size * cellSize + padding * 2;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={svgSize} height={svgSize} style={{ borderRadius: 8, background: '#fff' }}>
        {cells.flatMap((row, r) =>
          row.map((filled, c) =>
            filled ? <rect key={`${r}-${c}`} x={padding + c * cellSize} y={padding + r * cellSize} width={cellSize} height={cellSize} fill="#1a1a1a" /> : null
          )
        )}
      </svg>
      <div className="text-center">
        <p className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>{upiId}</p>
        <p className="text-sm font-bold mt-1" style={{ color: 'var(--text-primary)' }}>Amount: ₹{amount.toFixed(2)}</p>
      </div>
    </div>
  );
};

const CashierPanel = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [bill, setBill] = useState(null);
  const [paidReceipt, setPaidReceipt] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [upiStep, setUpiStep] = useState('scan');
  const [selectedUpiApp, setSelectedUpiApp] = useState(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardStep, setCardStep] = useState('choose');
  const [selectedCardBrand, setSelectedCardBrand] = useState(null);
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

  const completePayment = async () => {
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
      toast.success('Payment successful! Print bill if needed.');
      setSelectedOrder(null);
      setBill(null);
      setShowUPIModal(false);
      setUpiStep('scan');
      setSelectedUpiApp(null);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleUPIPay = () => {
    setShowUPIModal(true);
    setUpiStep('scan');
    setSelectedUpiApp(null);
  };

  const handleUpiAppSelect = (app) => {
    setSelectedUpiApp(app);
    setUpiStep('processing');
    setTimeout(() => {
      setUpiStep('success');
      setTimeout(() => {
        setShowUPIModal(false);
        setUpiStep('scan');
        setSelectedUpiApp(null);
        paymentMethod === 'UPI' && completePayment();
      }, 1500);
    }, 2000);
  };

  const handleCardPay = () => {
    setShowCardModal(true);
    setCardStep('choose');
    setSelectedCardBrand(null);
  };

  const handleCardBrandSelect = (brand) => {
    setSelectedCardBrand(brand);
    setCardStep('processing');
    setTimeout(() => {
      setCardStep('success');
      setTimeout(() => {
        setShowCardModal(false);
        setCardStep('choose');
        setSelectedCardBrand(null);
        completePayment();
      }, 1500);
    }, 2000);
  };

  const handleCashOrCardPayment = () => {
    completePayment();
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '4px solid var(--accent)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <header className="glass px-6 py-4 flex items-center justify-between sticky top-0 z-10 no-print" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Cashier Panel</h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{user?.name} &middot; {user?.role}</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <PanelRefreshButton onClick={fetchOrders} loading={loading} />
          <button onClick={handleLogout} className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm cursor-pointer">
            <HiOutlineLogout size={16} /> Logout
          </button>
        </div>
      </header>

      {paidReceipt && (
        <div className="no-print p-6" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Payment successful &mdash; Print receipt
              </h2>
              <button type="button" onClick={() => setPaidReceipt(null)} className="text-sm cursor-pointer transition-colors" style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >Dismiss</button>
            </div>
            <RestaurantBill order={paidReceipt.order} bill={paidReceipt.bill} paymentMethod={paidReceipt.paymentMethod} printId="paid-receipt-print" />
          </div>
        </div>
      )}

      {/* UPI Payment Modal */}
      {showUPIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm no-print" onClick={() => { if (upiStep === 'scan') { setShowUPIModal(false); setUpiStep('scan'); } }}>
          <div className="rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl animate-scale-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} onClick={(e) => e.stopPropagation()}>
            {upiStep === 'scan' && (
              <>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Scan & Pay</h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Scan this QR with any UPI app</p>
                </div>
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-xl" style={{ background: '#fff', border: '2px solid var(--border)' }}>
                    <FakeQR amount={total} upiId="grandtable@upi" />
                  </div>
                </div>
                <div className="text-center mb-4">
                  <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Or pay using</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {UPI_APPS.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => handleUpiAppSelect(app)}
                      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: app.color }}>
                        {app.icon}
                      </div>
                      <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{app.name}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { setShowUPIModal(false); setUpiStep('scan'); }}
                  className="w-full py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >Cancel</button>
              </>
            )}

            {upiStep === 'processing' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: selectedUpiApp?.color || 'var(--accent)' }}>
                  <span className="text-2xl text-white font-bold">{selectedUpiApp?.icon}</span>
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{selectedUpiApp?.name}</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Connecting to UPI...</p>
                <div className="flex justify-center gap-1 mb-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-3 h-3 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Please check your phone to complete payment</p>
              </div>
            )}

            {upiStep === 'success' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--success)' }}>
                  <HiOutlineCheck size={32} className="text-white" />
                </div>
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Payment Successful!</h3>
                <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>₹{total.toFixed(2)} paid via {selectedUpiApp?.name}</p>
                <div className="flex justify-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  <span>UPI: grandtable@upi</span>
                  <span>Ref: GT{(Date.now() + '').slice(-8)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card Payment Modal */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm no-print" onClick={() => { if (cardStep === 'choose') { setShowCardModal(false); setCardStep('choose'); } }}>
          <div className="rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl animate-scale-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} onClick={(e) => e.stopPropagation()}>
            {cardStep === 'choose' && (
              <>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Card Payment</h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Select card type to process payment</p>
                </div>
                <div className="grid grid-cols-1 gap-3 mb-4">
                  {CARD_BRANDS.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => handleCardBrandSelect(brand)}
                      className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                    >
                      <div className="w-12 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: brand.color }}>
                        {brand.icon}
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{brand.name}</span>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>**** **** **** {String(brand.id === 'rupay' ? 4582 : brand.id === 'visa' ? 9821 : 5609)}</p>
                      </div>
                      <span className="ml-auto text-xl">{brand.id === 'visa' ? '💳' : brand.id === 'mastercard' ? '💳' : '🏦'}</span>
                    </button>
                  ))}
                </div>
                <p className="text-center text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>Amount: <strong>₹{total.toFixed(2)}</strong></p>
                <button
                  onClick={() => { setShowCardModal(false); setCardStep('choose'); }}
                  className="w-full py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >Cancel</button>
              </>
            )}

            {cardStep === 'processing' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: selectedCardBrand?.color || 'var(--accent)' }}>
                  <span className="text-2xl text-white font-bold">{selectedCardBrand?.icon}</span>
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{selectedCardBrand?.name}</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Processing payment...</p>
                <div className="flex justify-center gap-1 mb-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-3 h-3 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Please do not remove the card</p>
              </div>
            )}

            {cardStep === 'success' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--success)' }}>
                  <HiOutlineCheck size={32} className="text-white" />
                </div>
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Payment Successful!</h3>
                <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>₹{total.toFixed(2)} paid via {selectedCardBrand?.name}</p>
                <div className="flex justify-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  <span>Card: {selectedCardBrand?.name}</span>
                  <span>Ref: GT{(Date.now() + '').slice(-8)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row animate-slide-up">
        <div className={`${selectedOrder ? 'hidden lg:block' : ''} lg:w-1/3 no-print`} style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
          <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Served Orders</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{orders.length} ready for billing</p>
          </div>
          <div>
            {orders.length === 0 ? (
              <p className="text-center py-12 text-sm italic" style={{ color: 'var(--text-tertiary)' }}>No served orders</p>
            ) : (
              orders.map((order) => (
                <button
                  key={order._id} type="button" onClick={() => selectOrder(order)}
                  className="w-full text-left p-4 cursor-pointer transition-all"
                  style={{
                    background: selectedOrder?._id === order._id ? 'var(--accent-light)' : 'transparent',
                    borderLeft: selectedOrder?._id === order._id ? '3px solid var(--accent)' : '3px solid transparent',
                    borderBottom: '1px solid var(--border-light)',
                  }}
                  onMouseEnter={e => { if (selectedOrder?._id !== order._id) e.currentTarget.style.background = 'var(--surface-hover)'; }}
                  onMouseLeave={e => { if (selectedOrder?._id !== order._id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Table {order.tableId?.tableNumber || 'N/A'}</span>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>#{order._id.slice(-6)}</span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {order.items.length} items &middot; ₹{order.items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 p-6">
          {!selectedOrder ? (
            <div className="text-center py-20 no-print">
              <div className="text-4xl mb-4">🧾</div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Select an Order</h2>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Click a served order to generate the bill</p>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <button type="button" onClick={() => { setSelectedOrder(null); setBill(null); }}
                className="lg:hidden no-print flex items-center gap-2 mb-4 text-sm font-medium cursor-pointer transition-opacity" style={{ color: 'var(--accent)' }}>
                <HiOutlineArrowLeft size={18} /> Back
              </button>

              <div className="no-print mb-4 space-y-4 p-5 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Discount (₹)</span>
                  <input type="number" value={discount} onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                    className="input-field w-28 text-right text-sm" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Cash', 'Card', 'UPI'].map((method) => (
                      <button key={method} type="button" onClick={() => setPaymentMethod(method)}
                        className="py-3 text-sm font-medium rounded-xl cursor-pointer transition-all"
                        style={{
                          background: paymentMethod === method ? 'var(--accent)' : 'var(--surface-2)',
                          color: paymentMethod === method ? 'var(--accent-text)' : 'var(--text-primary)',
                          border: `1px solid ${paymentMethod === method ? 'var(--accent)' : 'var(--border)'}`,
                        }}
                      >
                        <div className="text-lg mb-1">{method === 'Cash' ? '💵' : method === 'Card' ? '💳' : '📱'}</div>
                        <div className="text-xs">{method}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMethod === 'UPI' ? (
                  <button onClick={handleUPIPay} disabled={processing}
                    className="w-full py-3 rounded-xl font-semibold cursor-pointer btn-primary flex items-center justify-center gap-2">
                    📱 Pay with UPI
                  </button>
                ) : paymentMethod === 'Card' ? (
                  <button onClick={handleCardPay} disabled={processing}
                    className="w-full py-3 rounded-xl font-semibold cursor-pointer btn-primary flex items-center justify-center gap-2">
                    💳 Pay with Card
                  </button>
                ) : (
                  <button onClick={handleCashOrCardPayment} disabled={processing}
                    className="w-full py-3 rounded-xl font-semibold cursor-pointer btn-primary">
                    {processing ? 'Processing...' : `Confirm ${paymentMethod} Payment`}
                  </button>
                )}
              </div>

              <p className="no-print text-center text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>Bill preview</p>
              <RestaurantBill order={selectedOrder} bill={previewBill} paymentMethod={paymentMethod} discount={discount} printId="cashier-bill-print" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashierPanel;
