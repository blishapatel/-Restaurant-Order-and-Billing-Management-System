import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'waiter' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
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
    admin: 'bg-purple-100 text-purple-800',
    waiter: 'bg-blue-100 text-blue-800',
    kitchen: 'bg-orange-100 text-orange-800',
    cashier: 'bg-green-100 text-green-800'
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-10 h-10 border-4 border-amber-800 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-amber-800">Manage restaurant staff members</p>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-5 py-2.5 bg-amber-800 text-beige-50 rounded-xl hover:bg-amber-700 transition-colors font-medium cursor-pointer">
          {showForm ? <><HiOutlineX /> Cancel</> : <><HiOutlinePlus /> Add Staff</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-beige-300 p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-black mb-4">Add New Staff Member</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 border border-beige-300 rounded-xl bg-beige-50 text-black font-serif focus:outline-none focus:ring-2 focus:ring-amber-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full px-4 py-2.5 border border-beige-300 rounded-xl bg-beige-50 text-black font-serif focus:outline-none focus:ring-2 focus:ring-amber-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} className="w-full px-4 py-2.5 border border-beige-300 rounded-xl bg-beige-50 text-black font-serif focus:outline-none focus:ring-2 focus:ring-amber-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="w-full px-4 py-2.5 border border-beige-300 rounded-xl bg-beige-50 text-black font-serif focus:outline-none focus:ring-2 focus:ring-amber-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Role</label>
              <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="w-full px-4 py-2.5 border border-beige-300 rounded-xl bg-beige-50 text-black font-serif focus:outline-none focus:ring-2 focus:ring-amber-600">
                <option value="waiter">Waiter</option>
                <option value="kitchen">Kitchen</option>
                <option value="cashier">Cashier</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="px-8 py-2.5 bg-amber-800 text-beige-50 rounded-xl hover:bg-amber-700 transition-colors font-medium cursor-pointer">Add Staff</button>
            </div>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-beige-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-beige-100">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-amber-800">Name</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-amber-800">Email</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-amber-800">Phone</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-amber-800">Role</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-amber-800">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {staff.map((s) => (
                <tr key={s._id} className="hover:bg-beige-50 transition-colors">
                  <td className="px-6 py-4 text-black font-medium">{s.name}</td>
                  <td className="px-6 py-4 text-black text-sm">{s.email}</td>
                  <td className="px-6 py-4 text-black text-sm">{s.phone || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${roleColors[s.role]}`}>{s.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleDelete(s._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
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
