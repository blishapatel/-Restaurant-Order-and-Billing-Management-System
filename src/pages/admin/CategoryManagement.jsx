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
      <div
        className="w-10 h-10 rounded-full animate-spin"
        style={{ border: '4px solid var(--border)', borderTopColor: 'var(--accent)' }}
      />
    </div>
  );

  return (
    <div className="max-w-2xl animate-slide-up">
      <div className="flex justify-between items-center mb-6">
        <p style={{ color: 'var(--text-secondary)' }}>Manage food categories for your menu</p>
        <PanelRefreshButton onClick={fetchCategories} loading={loading} />
      </div>

      <form
        onSubmit={handleAdd}
        className="rounded-2xl p-6 mb-6"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
      >
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Add New Category</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Category name"
            className="flex-1 px-4 py-2.5 focus:outline-none"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-md)',
              transition: 'var(--transition)',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          />
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium cursor-pointer transition-all duration-200"
            style={{ background: 'var(--accent)', color: 'var(--text-inverse)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <HiOutlinePlus /> Add
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {categories.map((cat, i) => (
          <div
            key={cat._id}
            className={`rounded-xl px-6 py-4 flex items-center justify-between hover:shadow-md transition-all duration-200 stagger-${Math.min(i + 1, 5)}`}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <span className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
            <button
              onClick={() => handleDelete(cat._id)}
              className="p-2 rounded-lg cursor-pointer transition-all duration-200"
              style={{ color: 'var(--danger)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--danger-light)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <HiOutlineTrash size={20} />
            </button>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-center py-8 italic" style={{ color: 'var(--text-tertiary)' }}>No categories yet</p>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;
