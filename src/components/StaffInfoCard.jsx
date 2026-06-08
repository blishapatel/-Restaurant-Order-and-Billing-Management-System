const roleLabels = {
  admin: 'Admin',
  waiter: 'Waiter',
  kitchen: 'Kitchen',
  cashier: 'Cashier',
};

const StaffInfoCard = ({ staff, title = 'Staff', compact = false }) => {
  if (!staff) return null;

  if (compact) {
    return (
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{staff.name}</span>
        {' · '}{roleLabels[staff.role] || staff.role}
        {staff.phone && <> · {staff.phone}</>}
      </p>
    );
  }

  return (
    <div
      className="rounded-xl p-3 text-sm"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
      }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-wide mb-2"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {title}
      </p>
      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{staff.name}</p>
      <p className="capitalize" style={{ color: 'var(--text-secondary)' }}>{roleLabels[staff.role] || staff.role}</p>
      {staff.email && <p style={{ color: 'var(--text-tertiary)' }}>{staff.email}</p>}
      {staff.phone && <p style={{ color: 'var(--text-tertiary)' }}>{staff.phone}</p>}
    </div>
  );
};

export default StaffInfoCard;
