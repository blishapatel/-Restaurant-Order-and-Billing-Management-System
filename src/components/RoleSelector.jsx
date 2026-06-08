import { ROLES } from '../constants/roles';

const ROLE_ROWS = [
  ['kitchen', 'cashier'],
  ['admin', 'waiter'],
];

const roleById = Object.fromEntries(ROLES.map((r) => [r.id, r]));

const RoleSelector = ({ selectedRole, onSelect, disabled = false }) => {
  return (
    <div className="space-y-2">
      {ROLE_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-2">
          {row.map((id) => {
            const role = roleById[id];
            const selected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(role.id)}
                title={role.description}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                style={selected ? {
                  background: '#2563EB',
                  color: '#fff',
                  border: '1px solid #2563EB',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                } : {
                  background: '#fff',
                  color: '#334155',
                  border: '1px solid #E2E8F0',
                }}
                onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = '#93C5FD'; e.currentTarget.style.background = '#EFF6FF'; } }}
                onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#fff'; } }}
              >
                <span className="text-base leading-none">{role.icon}</span>
                <span className="font-medium">{role.label}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default RoleSelector;
