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
      <p className="text-xs text-amber-800">
        <span className="font-medium text-black">{staff.name}</span>
        {' · '}{roleLabels[staff.role] || staff.role}
        {staff.phone && <> · {staff.phone}</>}
      </p>
    );
  }

  return (
    <div className="bg-beige-50 border border-beige-300 rounded-xl p-3 text-sm">
      <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2">{title}</p>
      <p className="font-semibold text-black">{staff.name}</p>
      <p className="text-amber-800 capitalize">{roleLabels[staff.role] || staff.role}</p>
      {staff.email && <p className="text-black/70">{staff.email}</p>}
      {staff.phone && <p className="text-black/70">{staff.phone}</p>}
    </div>
  );
};

export default StaffInfoCard;
