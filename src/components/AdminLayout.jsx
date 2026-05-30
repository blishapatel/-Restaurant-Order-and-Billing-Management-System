import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineTag,
  HiOutlineViewGrid,
  HiOutlineUsers,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineReceiptTax,
  HiOutlineChartBar,
} from 'react-icons/hi';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <HiOutlineHome size={20} /> },
    { path: '/admin/analytics', label: 'Analytics', icon: <HiOutlineChartBar size={20} /> },
    { path: '/admin/menu', label: 'Menu Items', icon: <HiOutlineClipboardList size={20} /> },
    { path: '/admin/categories', label: 'Categories', icon: <HiOutlineTag size={20} /> },
    { path: '/admin/tables', label: 'Tables', icon: <HiOutlineViewGrid size={20} /> },
    { path: '/admin/staff', label: 'Staff', icon: <HiOutlineUsers size={20} /> },
    { path: '/admin/billing', label: 'Orders & Bills', icon: <HiOutlineReceiptTax size={20} /> },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-beige-50 font-serif">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen w-64 flex-col bg-amber-800 text-beige-50 shadow-xl transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand — compact single line */}
        <div className="shrink-0 border-b border-amber-700 px-4 py-3">
          <p className="text-sm font-bold leading-tight whitespace-nowrap truncate" title="The Grand Table">
            🍽️ The Grand Table
          </p>
          <p className="text-[11px] text-beige-300 mt-0.5">Admin Panel</p>
        </div>

        {/* Nav — scrollable, never overlaps profile */}
        <nav className="flex-1 min-h-0 overflow-y-auto px-2 py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`relative z-10 flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-amber-700 text-white shadow-md'
                  : 'text-beige-200 hover:bg-amber-700/50 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium truncate">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Profile — fixed at bottom, separate from nav */}
        <div className="shrink-0 border-t border-amber-700 bg-amber-900/40 px-3 py-3">
          <div className="flex items-center gap-2.5 mb-2.5 px-1">
            <div className="w-9 h-9 shrink-0 rounded-full bg-amber-600 flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{user?.name}</p>
              <p className="text-[11px] text-beige-300 capitalize truncate">{user?.role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 justify-center px-3 py-2 bg-amber-700 hover:bg-amber-600 rounded-lg transition-colors text-sm font-medium cursor-pointer"
          >
            <HiOutlineLogout size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="lg:ml-64 min-h-screen flex flex-col">
        <header className="bg-white border-b border-beige-300 px-4 lg:px-8 py-3 flex items-center justify-between gap-3 sticky top-0 z-30 shrink-0">
          <button
            type="button"
            className="lg:hidden text-black p-2 cursor-pointer shrink-0"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
          </button>
          <h2 className="text-lg font-bold text-black truncate">
            {navItems.find((item) => isActive(item.path))?.label || 'Admin'}
          </h2>
          <p className="text-xs text-amber-800 text-right shrink-0 hidden sm:block">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
