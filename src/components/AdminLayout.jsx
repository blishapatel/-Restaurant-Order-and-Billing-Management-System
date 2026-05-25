import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineHome, HiOutlineClipboardList, HiOutlineTag, HiOutlineViewGrid, HiOutlineUsers, HiOutlineLogout, HiOutlineMenu, HiOutlineX, HiOutlineReceiptTax } from 'react-icons/hi';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <HiOutlineHome size={22} /> },
    { path: '/admin/menu', label: 'Menu Items', icon: <HiOutlineClipboardList size={22} /> },
    { path: '/admin/categories', label: 'Categories', icon: <HiOutlineTag size={22} /> },
    { path: '/admin/tables', label: 'Tables', icon: <HiOutlineViewGrid size={22} /> },
    { path: '/admin/staff', label: 'Staff', icon: <HiOutlineUsers size={22} /> },
    { path: '/admin/billing', label: 'Orders & Bills', icon: <HiOutlineReceiptTax size={22} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-beige-50 font-serif">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-amber-800 text-beige-50 transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 border-b border-amber-700">
          <h1 className="text-2xl font-bold tracking-wide">🍽️ The Grand Table</h1>
          <p className="text-beige-200 text-sm mt-1">Admin Panel</p>
        </div>
        <nav className="mt-4 px-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-amber-700 text-white shadow-md'
                  : 'text-beige-200 hover:bg-amber-700/50 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-amber-700">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center font-bold text-lg">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-sm">{user?.name}</p>
              <p className="text-xs text-beige-300 capitalize">{user?.role}</p>
              {user?.phone && <p className="text-xs text-beige-400">{user.phone}</p>}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 justify-center px-4 py-2.5 bg-amber-700 hover:bg-amber-600 rounded-xl transition-colors text-sm font-medium cursor-pointer"
          >
            <HiOutlineLogout size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-white border-b border-beige-300 px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <button
            className="lg:hidden text-black p-2 cursor-pointer"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
          </button>
          <h2 className="text-xl font-bold text-black">
            {navItems.find(item => item.path === location.pathname)?.label || 'Admin'}
          </h2>
          <div className="text-sm text-amber-800">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
