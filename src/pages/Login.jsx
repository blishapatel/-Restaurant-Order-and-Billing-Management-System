import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoleSelector from '../components/RoleSelector';
import { ROLE_ROUTES } from '../constants/roles';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      toast.error('Please select your role');
      return;
    }
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      const data = await login(email, password, selectedRole);
      toast.success(`Welcome, ${data.name}!`);
      navigate(ROLE_ROUTES[data.role] || '/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-beige-50 flex items-center justify-center px-4 py-8 font-serif">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-800 rounded-full mb-3">
            <span className="text-2xl text-beige-50">🍽️</span>
          </div>
          <h1 className="text-3xl font-bold text-black tracking-wide">The Grand Table</h1>
          <p className="text-amber-800 mt-1 italic">Restaurant Management System</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-beige-300">
          <h2 className="text-xl font-bold text-black mb-1 text-center">Staff Login</h2>
          <p className="text-amber-800 text-xs text-center mb-5">Select role, then sign in</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Role</label>
              <RoleSelector selectedRole={selectedRole} onSelect={setSelectedRole} disabled={isLoading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-beige-300 rounded-xl bg-beige-50 text-black font-serif focus:outline-none focus:ring-2 focus:ring-amber-600"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-beige-300 rounded-xl bg-beige-50 text-black font-serif focus:outline-none focus:ring-2 focus:ring-amber-600"
                placeholder="Your password"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-amber-800 text-beige-50 rounded-xl font-semibold hover:bg-amber-700 transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-black/70 mt-6 text-sm">
            New staff member?{' '}
            <Link to="/register" className="text-amber-800 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
        <p className="text-center text-amber-800/70 mt-6 text-sm">
          © 2024 The Grand Table. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
