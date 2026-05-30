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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [menuRes, catRes] = await Promise.all([
        API.get('/menu'),
        API.get('/categories')
      ]);
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
    if (!form.name || !form.price || !form.category) {
      toast.error('Please fill required fields');
      return;
    }
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
      name: item.name,
      price: item.price,
      category: item.category?._id || item.category,
      description: item.description,
      isAvailable: item.isAvailable
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await API.delete(`/menu/${id}`);
      toast.success('Item deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await API.put(`/menu/${item._id}`, { isAvailable: !item.isAvailable });
      fetchData();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-10 h-10 border-4 border-amber-800 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div>
      <p className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4 text-sm text-amber-900">
        Menu items are saved in MongoDB permanently. Close the browser and reopen — your items will still be here.
      </p>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <p className="text-amber-800">Manage your restaurant menu items</p>
        <div className="flex items-center gap-2">
          <PanelRefreshButton onClick={fetchData} loading={loading} />
        <button
          onClick={() => { setShowForm(!showForm); setEditingItem(null); setForm({ name: '', price: '', category: '', description: '', isAvailable: true }); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-800 text-beige-50 rounded-xl hover:bg-amber-700 transition-colors font-medium cursor-pointer"
        >
          {showForm ? <><HiOutlineX /> Cancel</> : <><HiOutlinePlus /> Add Item</>}
        </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-beige-300 p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-black mb-4">{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 border border-beige-300 rounded-xl bg-beige-50 text-black font-serif focus:outline-none focus:ring-2 focus:ring-amber-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Price (₹) *</label>
              <input type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} className="w-full px-4 py-2.5 border border-beige-300 rounded-xl bg-beige-50 text-black font-serif focus:outline-none focus:ring-2 focus:ring-amber-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Category *</label>
              <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="w-full px-4 py-2.5 border border-beige-300 rounded-xl bg-beige-50 text-black font-serif focus:outline-none focus:ring-2 focus:ring-amber-600">
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({...form, isAvailable: e.target.checked})} className="w-5 h-5 rounded accent-amber-800" />
                <span className="text-sm font-medium text-black">Available</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-black mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows="2" className="w-full px-4 py-2.5 border border-beige-300 rounded-xl bg-beige-50 text-black font-serif focus:outline-none focus:ring-2 focus:ring-amber-600" />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="px-8 py-2.5 bg-amber-800 text-beige-50 rounded-xl hover:bg-amber-700 transition-colors font-medium cursor-pointer">
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-beige-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-beige-100">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-amber-800">Name</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-amber-800">Category</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-amber-800">Price</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-amber-800">Status</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-amber-800">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {items.map((item) => (
                <tr key={item._id} className="hover:bg-beige-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-black">{item.name}</p>
                      <p className="text-xs text-amber-800/60 mt-0.5">{item.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-black">{item.category?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-black font-semibold">₹{item.price}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleAvailability(item)} className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(item)} className="p-2 text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"><HiOutlinePencil size={18} /></button>
                      <button onClick={() => handleDelete(item._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"><HiOutlineTrash size={18} /></button>
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
