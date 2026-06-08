import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import MenuManagement from './pages/admin/MenuManagement.jsx';
import CategoryManagement from './pages/admin/CategoryManagement.jsx';
import TableManagement from './pages/admin/TableManagement.jsx';
import StaffManagement from './pages/admin/StaffManagement.jsx';
import BillingHistory from './pages/admin/BillingHistory.jsx';
import Analytics from './pages/admin/Analytics.jsx';
import WaiterPanel from './pages/WaiterPanel.jsx';
import KitchenPanel from './pages/KitchenPanel.jsx';
import CashierPanel from './pages/CashierPanel.jsx';
import PublicMenu from './pages/PublicMenu.jsx';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: "'Inter', sans-serif",
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-lg)',
                borderRadius: 'var(--radius-md)',
              },
              success: {
                iconTheme: {
                  primary: 'var(--success)',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--danger)',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/menu/table/:tableNumber" element={<PublicMenu />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="menu" element={<MenuManagement />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="tables" element={<TableManagement />} />
              <Route path="staff" element={<StaffManagement />} />
              <Route path="billing" element={<BillingHistory />} />
            </Route>

            {/* Role-specific routes */}
            <Route path="/waiter" element={
              <ProtectedRoute roles={['waiter', 'admin']}>
                <WaiterPanel />
              </ProtectedRoute>
            } />
            <Route path="/kitchen" element={
              <ProtectedRoute roles={['kitchen', 'admin']}>
                <KitchenPanel />
              </ProtectedRoute>
            } />
            <Route path="/cashier" element={
              <ProtectedRoute roles={['cashier', 'admin']}>
                <CashierPanel />
              </ProtectedRoute>
            } />

            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
