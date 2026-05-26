import { HiOutlineX } from 'react-icons/hi';
import RestaurantBill from './RestaurantBill';
import { formatTableLabel } from '../utils/orderHelpers';

const BillViewModal = ({ bill, onClose }) => {
  if (!bill) return null;

  const order = bill.orderId && typeof bill.orderId === 'object' ? bill.orderId : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-beige-50 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 border border-beige-300">
        <div className="no-print flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-bold text-black">Bill Receipt</h3>
            <p className="text-sm text-amber-800">
              {formatTableLabel(order, bill)} · Paid {bill.paidAt ? new Date(bill.paidAt).toLocaleString('en-IN') : '—'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-beige-200 text-black cursor-pointer"
            aria-label="Close"
          >
            <HiOutlineX size={22} />
          </button>
        </div>

        {order ? (
          <RestaurantBill
            order={order}
            bill={bill}
            paymentMethod={bill.paymentMethod}
            printId={`modal-bill-${bill._id}`}
          />
        ) : (
          <div className="bg-white border border-beige-300 rounded-xl p-6 text-center">
            <p className="text-amber-800 mb-2">Order details not available</p>
            <p className="text-2xl font-bold text-black">₹{(bill.total || 0).toFixed(2)}</p>
            <p className="text-sm text-black/70 mt-2 capitalize">Payment: {bill.paymentMethod || '—'}</p>
            {bill.tableNumber != null && (
              <p className="text-sm font-semibold text-black mt-2">Table {bill.tableNumber}</p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="no-print w-full mt-4 py-2.5 border border-beige-300 rounded-xl text-amber-800 hover:bg-beige-100 cursor-pointer text-sm font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default BillViewModal;
