import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import PanelRefreshButton from '../../components/PanelRefreshButton';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/categories');
      setCategories(data);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) { toast.error('Enter a category name'); return; }
    try {
      await API.post('/categories', { name: newCategory.trim() });
      toast.success('Category added!');
      setNewCategory('');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await API.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-10 h-10 border-4 border-amber-800 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-2xl">
      <p className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4 text-sm text-amber-900">
        Categories are stored in MongoDB and kept forever until you delete them.
      </p>
      <div className="flex justify-between items-center mb-6">
        <p className="text-amber-800">Manage food categories for your menu</p>
        <PanelRefreshButton onClick={fetchCategories} loading={loading} />
      </div>

      <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-beige-300 p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-bold text-black mb-4">Add New Category</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Category name"
            className="flex-1 px-4 py-2.5 border border-beige-300 rounded-xl bg-beige-50 text-black font-serif focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
          <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-amber-800 text-beige-50 rounded-xl hover:bg-amber-700 transition-colors font-medium cursor-pointer">
            <HiOutlinePlus /> Add
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat._id} className="bg-white rounded-xl border border-beige-300 px-6 py-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
            <span className="text-black font-semibold text-lg">{cat.name}</span>
            <button onClick={() => handleDelete(cat._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
              <HiOutlineTrash size={20} />
            </button>
          </div>
        ))}
        {categories.length === 0 && <p className="text-center text-amber-800/60 py-8 italic">No categories yet</p>}
      </div>
    </div>
  );
};

export default CategoryManagement;
