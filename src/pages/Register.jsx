import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoleSelector from '../components/RoleSelector';
import { ROLE_ROUTES } from '../constants/roles';
import toast from 'react-hot-toast';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      toast.error('Please select your role');
      return;
    }
    if (!name || !email || !phone || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const data = await register(name, email, phone, password, selectedRole);
      toast.success(`Account created! Welcome, ${data.name}`);
      navigate(ROLE_ROUTES[data.role] || '/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
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
          <p className="text-amber-800 mt-1 italic">Join the team</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-beige-300">
          <h2 className="text-xl font-bold text-black mb-1 text-center">Staff Registration</h2>
          <p className="text-amber-800 text-xs text-center mb-5">
            Personal details saved with your role in MongoDB
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Role</label>
              <RoleSelector selectedRole={selectedRole} onSelect={setSelectedRole} disabled={isLoading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 border border-beige-300 rounded-xl bg-beige-50 text-black font-serif focus:outline-none focus:ring-2 focus:ring-amber-600"
                placeholder="Your full name"
              />
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
              <label className="block text-sm font-medium text-black mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full px-3 py-2.5 border border-beige-300 rounded-xl bg-beige-50 text-black font-serif focus:outline-none focus:ring-2 focus:ring-amber-600"
                placeholder="10-digit mobile number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-beige-300 rounded-xl bg-beige-50 text-black font-serif focus:outline-none focus:ring-2 focus:ring-amber-600"
                placeholder="Min 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-beige-300 rounded-xl bg-beige-50 text-black font-serif focus:outline-none focus:ring-2 focus:ring-amber-600"
                placeholder="Confirm password"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-amber-800 text-beige-50 rounded-xl font-semibold hover:bg-amber-700 transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Creating account...' : 'Register & Sign In'}
            </button>
          </form>

          <p className="text-center text-black/70 mt-4 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-800 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
