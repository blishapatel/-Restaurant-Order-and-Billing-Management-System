import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const PublicMenu = () => {
  const { tableNumber } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMenu(); }, []);

  const fetchMenu = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        axios.get('/api/menu'),
        axios.get('/api/categories')
      ]);
      setMenuItems(menuRes.data.filter(i => i.isAvailable));
      setCategories(catRes.data);
    } catch (error) {
      console.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const groupedItems = {};
  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(i => (i.category?._id || i.category) === selectedCategory);

  filteredItems.forEach(item => {
    const catName = item.category?.name || 'Other';
    if (!groupedItems[catName]) groupedItems[catName] = [];
    groupedItems[catName].push(item);
  });

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 text-white py-14 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">The Grand Table</h1>
          <p className="text-slate-300 text-lg">Fine Dining & Restaurant</p>
          {tableNumber && (
            <div className="mt-5 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2 rounded-full text-sm font-medium">
              <span>📍</span>
              <span>Table {tableNumber}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 justify-center flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-200'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600'
            }`}
          >
            ✨ All
          </button>
          {categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                selectedCategory === cat._id
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-200'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1 bg-slate-200"></div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{category}</h2>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map(item => (
                <div
                  key={item._id}
                  className="bg-white rounded-xl border border-slate-100 p-5 flex justify-between items-start hover:shadow-lg hover:shadow-slate-200/50 transition-all group"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{item.name}</h3>
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                  </div>
                  <div className="ml-4 text-right shrink-0">
                    <span className="text-xl font-bold text-brand-600">₹{item.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="text-center py-8 border-t border-slate-200 mt-8">
          <p className="text-slate-400 italic text-sm">Prices inclusive of all taxes unless stated otherwise</p>
          <p className="text-slate-300 text-xs mt-2">&copy; 2024 The Grand Table</p>
        </div>
      </div>
    </div>
  );
};

export default PublicMenu;
