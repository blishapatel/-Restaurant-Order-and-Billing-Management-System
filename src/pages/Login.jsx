import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoleSelector from '../components/RoleSelector';
import { ROLE_ROUTES } from '../constants/roles';
import toast from 'react-hot-toast';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) { toast.error('Please select your role'); return; }
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setIsLoading(true);
    try {
      const data = await login(email, password, selectedRole);
      toast.success(`Welcome, ${data.name}!`);
      navigate(ROLE_ROUTES[data.role] || '/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-green-50 opacity-60" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-brand-300/30 to-brand-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-gradient-to-tr from-green-300/30 to-green-400/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl mb-4 shadow-lg shadow-brand-200/50">
            <span className="text-2xl">🍽️</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">The Grand Table</h1>
          <p className="text-slate-500 mt-1 text-sm">Restaurant Management System</p>
        </div>

        <div
          className="rounded-2xl p-7 animate-scale-in"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.9)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <h2 className="text-xl font-bold text-slate-900 mb-1">Staff Login</h2>
          <p className="text-slate-400 text-xs mb-6">Select your role and sign in to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
              <RoleSelector selectedRole={selectedRole} onSelect={setSelectedRole} disabled={isLoading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/70 border border-white/60 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all backdrop-blur-sm"
                placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 bg-white/70 border border-white/60 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all backdrop-blur-sm"
                  placeholder="Your password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                  style={{ color: '#94A3B8' }}>
                  {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                </button>
              </div>
            </div>
            <div className="pt-2">
              <button type="submit" disabled={isLoading}
                className="w-full py-3 rounded-xl font-semibold text-base tracking-wide transition-all disabled:opacity-50 cursor-pointer shadow-lg active:scale-[0.98]"
                style={{ background: '#2563EB', color: '#fff', boxShadow: '0 10px 20px -5px rgba(37,99,235,0.3)' }}
                onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.background = '#1D4ED8'; } }}
                onMouseLeave={e => { if (!isLoading) { e.currentTarget.style.background = '#2563EB'; } }}>
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </div>
          </form>

          <p className="text-center text-slate-400 mt-6 text-sm">
            New staff member?{' '}
            <Link to="/register" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">Create an account</Link>
          </p>
        </div>

        <p className="text-center text-slate-400 mt-6 text-xs">&copy; 2024 The Grand Table. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Login;
