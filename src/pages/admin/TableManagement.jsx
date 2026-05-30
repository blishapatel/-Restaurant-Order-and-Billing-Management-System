import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import PanelRefreshButton from '../../components/PanelRefreshButton';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineQrcode, HiOutlineX } from 'react-icons/hi';

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tableNumber: '', capacity: '' });
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTables(); }, []);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/tables');
      setTables(data);
    } catch (error) {
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.tableNumber || !form.capacity) { toast.error('Fill all fields'); return; }
    try {
      await API.post('/tables', { tableNumber: Number(form.tableNumber), capacity: Number(form.capacity) });
      toast.success('Table added!');
      setForm({ tableNumber: '', capacity: '' });
      setShowForm(false);
      fetchTables();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this table?')) return;
    try {
      await API.delete(`/tables/${id}`);
      toast.success('Table deleted');
      fetchTables();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await API.put(`/tables/${id}`, { status });
      fetchTables();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const generateQR = async (id) => {
    try {
      const { data } = await API.get(`/tables/${id}/qr`);
      setQrData(data);
    } catch (error) {
      toast.error('Failed to generate QR');
    }
  };

  const statusColors = {
    available: 'bg-green-100 border-green-400 text-green-800',
    occupied: 'bg-red-100 border-red-400 text-red-800',
    reserved: 'bg-yellow-100 border-yellow-400 text-yellow-800'
  };

  const statusBg = {
    available: 'from-green-50 to-green-100',
    occupied: 'from-red-50 to-red-100',
    reserved: 'from-yellow-50 to-yellow-100'
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-10 h-10 border-4 border-amber-800 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <p className="text-amber-800">Manage restaurant tables and generate QR codes</p>
        <div className="flex items-center gap-2">
          <PanelRefreshButton onClick={fetchTables} loading={loading} />
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-800 text-beige-50 rounded-xl hover:bg-amber-700 transition-colors font-medium cursor-pointer"
        >
          {showForm ? <><HiOutlineX /> Cancel</> : <><HiOutlinePlus /> Add Table</>}
        </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-beige-300 p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-black mb-4">Add New Table</h3>
          <div className="flex gap-4 flex-wrap">
            <input type="number" placeholder="Table Number" value={form.tableNumber} onChange={(e) => setForm({...form, tableNumber: e.target.value})} className="px-4 py-2.5 border border-beige-300 rounded-xl bg-beige-50 text-black font-serif focus:outline-none focus:ring-2 focus:ring-amber-600 w-40" />
            <input type="number" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({...form, capacity: e.target.value})} className="px-4 py-2.5 border border-beige-300 rounded-xl bg-beige-50 text-black font-serif focus:outline-none focus:ring-2 focus:ring-amber-600 w-40" />
            <button type="submit" className="px-6 py-2.5 bg-amber-800 text-beige-50 rounded-xl hover:bg-amber-700 transition-colors font-medium cursor-pointer">Add</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.map((table) => (
          <div key={table._id} className={`bg-gradient-to-br ${statusBg[table.status]} rounded-2xl border-2 ${statusColors[table.status].split(' ')[1]} p-5 text-center shadow-sm hover:shadow-md transition-all`}>
            <div className="text-3xl mb-2">🪑</div>
            <h4 className="text-xl font-bold text-black">Table {table.tableNumber}</h4>
            <p className="text-sm text-amber-800/70 mb-2">Seats: {table.capacity}</p>
            <select
              value={table.status}
              onChange={(e) => handleStatusChange(table._id, e.target.value)}
              className={`w-full px-2 py-1.5 rounded-lg text-xs font-medium border-0 mb-3 ${statusColors[table.status]} focus:outline-none cursor-pointer`}
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
            </select>
            <div className="flex gap-2 justify-center">
              <button onClick={() => generateQR(table._id)} className="p-2 bg-white/70 hover:bg-white rounded-lg transition-colors cursor-pointer" title="Generate QR">
                <HiOutlineQrcode size={18} className="text-amber-800" />
              </button>
              <button onClick={() => handleDelete(table._id)} className="p-2 bg-white/70 hover:bg-white rounded-lg transition-colors cursor-pointer" title="Delete">
                <HiOutlineTrash size={18} className="text-red-600" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {qrData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setQrData(null)}>
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-black mb-4">Table QR Code</h3>
            <img src={qrData.qrCode} alt="QR Code" className="mx-auto mb-4 rounded-xl" />
            <p className="text-sm text-amber-800 mb-4 break-all">{qrData.url}</p>
            <button onClick={() => setQrData(null)} className="px-6 py-2.5 bg-amber-800 text-beige-50 rounded-xl hover:bg-amber-700 transition-colors cursor-pointer">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManagement;
