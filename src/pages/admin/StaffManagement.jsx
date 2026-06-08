import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import PanelRefreshButton from '../../components/PanelRefreshButton';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'waiter' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/auth/staff');
      setStaff(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) { toast.error('Fill all fields'); return; }
    try {
      await API.post('/auth/register/staff', form);
      toast.success('Staff member added!');
      setForm({ name: '', email: '', phone: '', password: '', role: 'waiter' });
      setShowForm(false);
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this staff member?')) return;
    try {
      await API.delete(`/auth/staff/${id}`);
      toast.success('Staff member deleted');
      fetchStaff();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const roleColors = {
    admin: 'bg-purple-100 text-purple-700',
    waiter: 'bg-brand-100 text-brand-700',
    kitchen: 'bg-orange-100 text-orange-700',
    cashier: 'bg-green-100 text-green-700'
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '4px solid var(--border)', borderTopColor: 'var(--accent)' }} />
    </div>
  );

  const formatJoined = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="animate-slide-up">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <p style={{ color: 'var(--text-secondary)' }}>Manage restaurant staff ({staff.length})</p>
        <div className="flex items-center gap-2">
          <PanelRefreshButton onClick={fetchStaff} loading={loading} />
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium cursor-pointer btn-primary">
            {showForm ? <><HiOutlineX /> Cancel</> : <><HiOutlinePlus /> Add Staff</>}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="rounded-2xl p-6 mb-6 animate-scale-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Add New Staff Member</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Role</label>
              <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="input-field w-full">
                <option value="waiter">Waiter</option>
                <option value="kitchen">Kitchen</option>
                <option value="cashier">Cashier</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="px-8 py-2.5 rounded-xl font-medium cursor-pointer btn-primary">Add Staff</button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: 'var(--surface-2)' }}>
              <tr>
                {['Name', 'Email', 'Phone', 'Role', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s._id} className="transition-colors duration-200" style={{ borderBottom: '1px solid var(--border-light)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td className="px-6 py-4 font-medium" style={{ color: 'var(--text-primary)' }}>{s.name}</td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-primary)' }}>{s.email}</td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-primary)' }}>{s.phone || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${roleColors[s.role] || 'bg-slate-100 text-slate-700'}`}>{s.role}</span>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>{formatJoined(s.createdAt)}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleDelete(s._id)} className="p-2 rounded-lg cursor-pointer transition-colors" style={{ color: 'var(--danger)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-light)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <HiOutlineTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffManagement;
