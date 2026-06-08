import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import PanelRefreshButton from '../../components/PanelRefreshButton';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';

const MenuManagement = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', category: '', description: '', isAvailable: true });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [menuRes, catRes] = await Promise.all([API.get('/menu'), API.get('/categories')]);
      setItems(menuRes.data);
      setCategories(catRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) { toast.error('Please fill required fields'); return; }
    try {
      if (editingItem) {
        await API.put(`/menu/${editingItem._id}`, { ...form, price: Number(form.price) });
        toast.success('Item updated!');
      } else {
        await API.post('/menu', { ...form, price: Number(form.price) });
        toast.success('Item added!');
      }
      setForm({ name: '', price: '', category: '', description: '', isAvailable: true });
      setShowForm(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name, price: item.price,
      category: item.category?._id || item.category,
      description: item.description, isAvailable: item.isAvailable,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await API.delete(`/menu/${id}`);
      toast.success('Item deleted');
      fetchData();
    } catch (error) { toast.error('Failed to delete'); }
  };

  const toggleAvailability = async (item) => {
    try {
      await API.put(`/menu/${item._id}`, { isAvailable: !item.isAvailable });
      fetchData();
    } catch (error) { toast.error('Failed to update'); }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '4px solid var(--border)', borderTopColor: 'var(--accent)' }} />
    </div>
  );

  return (
    <div className="animate-slide-up">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <p style={{ color: 'var(--text-secondary)' }}>Manage your restaurant menu items</p>
        <div className="flex items-center gap-2">
          <PanelRefreshButton onClick={fetchData} loading={loading} />
          <button
            onClick={() => { setShowForm(!showForm); setEditingItem(null); setForm({ name: '', price: '', category: '', description: '', isAvailable: true }); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium cursor-pointer btn-primary"
          >
            {showForm ? <><HiOutlineX /> Cancel</> : <><HiOutlinePlus /> Add Item</>}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="rounded-2xl p-6 mb-6 animate-scale-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Price (₹) *</label>
              <input type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Category *</label>
              <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="input-field w-full">
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({...form, isAvailable: e.target.checked})} className="w-5 h-5 rounded" style={{ accentColor: 'var(--accent)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Available</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
              <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows="2" className="input-field w-full" />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="px-8 py-2.5 rounded-xl font-medium cursor-pointer btn-primary">
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: 'var(--surface-2)' }}>
              <tr>
                {['Name', 'Category', 'Price', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="transition-colors duration-200" style={{ borderBottom: '1px solid var(--border-light)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{item.description}</p>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-primary)' }}>{item.category?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>₹{item.price}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleAvailability(item)} className="px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all"
                      style={item.isAvailable
                        ? { background: 'var(--success-light)', color: 'var(--success-text)' }
                        : { background: 'var(--danger-light)', color: 'var(--danger-text)' }
                      }
                    >
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(item)} className="p-2 rounded-lg cursor-pointer transition-colors" style={{ color: 'var(--accent)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-light)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <HiOutlinePencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="p-2 rounded-lg cursor-pointer transition-colors" style={{ color: 'var(--danger)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--danger-light)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <HiOutlineTrash size={18} />
                      </button>
                    </div>
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

export default MenuManagement;
