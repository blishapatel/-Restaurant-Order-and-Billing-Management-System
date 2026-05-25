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
    <div className="min-h-screen bg-beige-50 flex items-center justify-center font-serif">
      <div className="w-10 h-10 border-4 border-amber-800 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-beige-50 font-serif">
      <div className="bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 text-beige-50 py-12 px-6 text-center">
        <h1 className="text-5xl font-bold tracking-wide mb-2">{'\ud83c\udf7d\ufe0f'} The Grand Table</h1>
        <p className="text-beige-200 text-lg italic">Fine Dining & Restaurant</p>
        {tableNumber && (
          <div className="mt-4 inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full">
            <span className="text-beige-50 font-medium">{'\ud83d\udccd'} Table {tableNumber}</span>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 justify-center flex-wrap">
          <button onClick={() => setSelectedCategory('all')} className={`px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
            selectedCategory === 'all' ? 'bg-amber-800 text-beige-50 shadow-md' : 'bg-white border border-beige-300 text-black hover:bg-beige-100'
          }`}>{'\u2728'} All</button>
          {categories.map(cat => (
            <button key={cat._id} onClick={() => setSelectedCategory(cat._id)} className={`px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              selectedCategory === cat._id ? 'bg-amber-800 text-beige-50 shadow-md' : 'bg-white border border-beige-300 text-black hover:bg-beige-100'
            }`}>{cat.name}</button>
          ))}
        </div>

        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1 bg-beige-400"></div>
              <h2 className="text-2xl font-bold text-amber-800 tracking-wide">{category}</h2>
              <div className="h-px flex-1 bg-beige-400"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map(item => (
                <div key={item._id} className="bg-white rounded-xl border border-beige-300 p-5 flex justify-between items-start hover:shadow-lg transition-all group">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-black group-hover:text-amber-800 transition-colors">{item.name}</h3>
                    <p className="text-sm text-amber-800/60 mt-1 leading-relaxed">{item.description}</p>
                  </div>
                  <div className="ml-4 text-right">
                    <span className="text-xl font-bold text-amber-800">{'\u20b9'}{item.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="text-center py-8 border-t border-beige-300 mt-8">
          <p className="text-amber-800/60 italic">Prices inclusive of all taxes unless stated otherwise</p>
          <p className="text-amber-800/40 text-sm mt-2">{'\u00a9'} 2024 The Grand Table</p>
        </div>
      </div>
    </div>
  );
};

export default PublicMenu;
