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
            return (
              <button
                key={role.id}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(role.id)}
                title={role.description}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedRole === role.id
                    ? 'border-amber-800 bg-amber-800 text-beige-50 shadow-sm'
                    : 'border-beige-300 bg-beige-50 text-black hover:border-amber-600'
                }`}
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
