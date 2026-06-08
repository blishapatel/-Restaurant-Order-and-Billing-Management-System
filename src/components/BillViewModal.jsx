import { HiOutlineX } from 'react-icons/hi';
import RestaurantBill from './RestaurantBill';
import { formatTableLabel } from '../utils/orderHelpers';

const BillViewModal = ({ bill, onClose }) => {
  if (!bill) return null;

  const order = bill.orderId && typeof bill.orderId === 'object' ? bill.orderId : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 animate-scale-in"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <div className="no-print flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Bill Receipt</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {formatTableLabel(order, bill)} · Paid {bill.paidAt ? new Date(bill.paidAt).toLocaleString('en-IN') : '—'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg cursor-pointer"
            style={{
              color: 'var(--text-secondary)',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.background = 'var(--surface-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.background = 'transparent';
            }}
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
          <div
            className="rounded-xl p-6 text-center"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>Order details not available</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>₹{(bill.total || 0).toFixed(2)}</p>
            <p className="text-sm mt-2 capitalize" style={{ color: 'var(--text-tertiary)' }}>Payment: {bill.paymentMethod || '—'}</p>
            {bill.tableNumber != null && (
              <p className="text-sm font-semibold mt-2" style={{ color: 'var(--text-primary)' }}>Table {bill.tableNumber}</p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="no-print w-full mt-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--surface-hover)';
            e.currentTarget.style.borderColor = 'var(--border-focus)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default BillViewModal;
