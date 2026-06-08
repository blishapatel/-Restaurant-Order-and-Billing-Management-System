import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle.jsx';
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
  const { theme } = useTheme();
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
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen w-64 flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'var(--surface-glass)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: '1px solid var(--border)',
          boxShadow: theme === 'dark' ? '4px 0 24px rgba(0,0,0,0.3)' : '4px 0 24px rgba(0,0,0,0.06)',
          color: 'var(--text-primary)',
        }}
      >
        <div className="shrink-0 px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-brand-200">
              GT
            </div>
            <div>
              <p className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>The Grand Table</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: isActive(item.path) ? 'var(--accent-glow)' : 'transparent',
                color: isActive(item.path) ? 'var(--accent)' : 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'var(--surface-2)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
              {isActive(item.path) && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
              )}
            </Link>
          ))}
        </nav>

        <div className="shrink-0 px-3 py-3" style={{ background: 'transparent', borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-bold text-sm text-white" style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}>
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
              <p className="text-[11px] capitalize truncate" style={{ color: 'var(--text-tertiary)' }}>{user?.role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 justify-center px-3 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200"
            style={{
              background: 'rgba(239,68,68,0.08)',
              color: 'var(--danger)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
            }}
          >
            <HiOutlineLogout size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <header
          className="px-4 lg:px-8 py-3 flex items-center justify-between gap-3 sticky top-0 z-30 shrink-0 glass"
          style={{
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <button
            type="button"
            className="lg:hidden p-2 cursor-pointer shrink-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            style={{ color: 'var(--text-primary)' }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
          </button>
          <h2 className="text-lg font-bold truncate" style={{ color: 'var(--text-primary)' }}>
            {navItems.find((item) => isActive(item.path))?.label || 'Admin'}
          </h2>
          <div className="flex items-center gap-3 shrink-0">
            <p className="text-xs text-right hidden sm:block" style={{ color: 'var(--text-secondary)' }}>
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
