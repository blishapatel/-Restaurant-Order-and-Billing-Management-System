import { HiOutlineRefresh } from 'react-icons/hi';

const PanelRefreshButton = ({ onClick, loading = false, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl disabled:opacity-50 cursor-pointer ${className}`}
    style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      color: 'var(--text-secondary)',
      transition: 'var(--transition)',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'var(--surface-hover)';
      e.currentTarget.style.borderColor = 'var(--border-focus)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'var(--surface)';
      e.currentTarget.style.borderColor = 'var(--border)';
    }}
  >
    <HiOutlineRefresh size={16} className={loading ? 'animate-spin' : ''} />
    Refresh
  </button>
);

export default PanelRefreshButton;
