import { HiOutlineRefresh } from 'react-icons/hi';

const PanelRefreshButton = ({ onClick, loading = false, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border border-beige-300 rounded-xl bg-white text-amber-800 hover:bg-beige-100 disabled:opacity-50 cursor-pointer transition-colors ${className}`}
  >
    <HiOutlineRefresh size={16} className={loading ? 'animate-spin' : ''} />
    Refresh
  </button>
);

export default PanelRefreshButton;
