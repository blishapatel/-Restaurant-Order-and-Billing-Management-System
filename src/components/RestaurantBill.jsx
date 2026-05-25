import { HiOutlinePrinter } from 'react-icons/hi';

const formatMoney = (n) => `₹${Number(n || 0).toFixed(2)}`;

const RestaurantBill = ({
  order,
  bill,
  paymentMethod,
  discount = 0,
  showStaff = true,
  showPrintButton = true,
  printId = 'restaurant-bill-print',
}) => {
  if (!order) return null;

  const subtotal = bill?.subtotal ?? order.items?.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0;
  const cgst = bill?.cgst ?? subtotal * 0.025;
  const sgst = bill?.sgst ?? subtotal * 0.025;
  const billDiscount = bill?.discount ?? discount ?? 0;
  const total = bill?.total ?? subtotal + cgst + sgst - billDiscount;

  const billDate = bill?.paidAt || new Date();
  const billNo = bill?._id?.slice(-8).toUpperCase() || order._id?.slice(-8).toUpperCase();

  const handlePrint = () => window.print();

  return (
    <div className="bill-print-wrapper">
      {showPrintButton && (
        <div className="no-print flex justify-end mb-3">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium border border-black hover:bg-neutral-800 cursor-pointer"
          >
            <HiOutlinePrinter size={18} />
            Print Bill
          </button>
        </div>
      )}

      <div id={printId} className="restaurant-receipt mx-auto">
        <div className="receipt-header">
          <h1 className="receipt-title">THE GRAND TABLE</h1>
          <p className="receipt-sub">Restaurant &amp; Fine Dining</p>
          <p className="receipt-sub">123 Gourmet Street, Food City</p>
          <p className="receipt-sub">GSTIN: 29ABCDE1234F1Z5</p>
          <p className="receipt-sub">Tel: +91 98765 43210</p>
        </div>

        <div className="receipt-line" />

        <div className="receipt-meta">
          <p><span>Bill No:</span> {billNo}</p>
          <p><span>Table:</span> {order.tableId?.tableNumber ?? 'N/A'}</p>
          <p><span>Date:</span> {new Date(billDate).toLocaleDateString('en-IN')}</p>
          <p><span>Time:</span> {new Date(billDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
          <p><span>Order:</span> #{order._id?.slice(-6)}</p>
          {paymentMethod && <p><span>Payment:</span> {paymentMethod}</p>}
        </div>

        {showStaff && order.waiterId && (
          <>
            <div className="receipt-line" />
            <div className="receipt-meta">
              <p><span>Waiter:</span> {order.waiterId.name}</p>
              <p><span>Role:</span> {order.waiterId.role}</p>
              {order.waiterId.phone && <p><span>Ph:</span> {order.waiterId.phone}</p>}
            </div>
          </>
        )}

        <div className="receipt-line" />

        <table className="receipt-table">
          <thead>
            <tr>
              <th className="text-left">Item</th>
              <th>Qty</th>
              <th className="text-right">Rate</th>
              <th className="text-right">Amt</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, i) => (
              <tr key={i}>
                <td className="item-name">{item.name}</td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-right">{item.price.toFixed(2)}</td>
                <td className="text-right">{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="receipt-line" />

        <div className="receipt-totals">
          <div className="receipt-row">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <div className="receipt-row">
            <span>CGST @ 2.5%</span>
            <span>{formatMoney(cgst)}</span>
          </div>
          <div className="receipt-row">
            <span>SGST @ 2.5%</span>
            <span>{formatMoney(sgst)}</span>
          </div>
          {billDiscount > 0 && (
            <div className="receipt-row">
              <span>Discount</span>
              <span>-{formatMoney(billDiscount)}</span>
            </div>
          )}
          <div className="receipt-line thin" />
          <div className="receipt-row grand">
            <span>GRAND TOTAL</span>
            <span>{formatMoney(total)}</span>
          </div>
        </div>

        <div className="receipt-line" />

        <div className="receipt-footer">
          <p>Thank you for dining with us!</p>
          <p>Please visit again</p>
          <p className="receipt-note">*** This is a computer generated bill ***</p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantBill;
