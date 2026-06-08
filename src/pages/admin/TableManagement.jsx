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

  const statusConfig = {
    available: { bg: 'from-green-50 to-green-100/50', border: 'border-l-green-500', badge: 'bg-green-100 text-green-700' },
    occupied: { bg: 'from-red-50 to-red-100/50', border: 'border-l-red-500', badge: 'bg-red-100 text-red-700' },
    reserved: { bg: 'from-amber-50 to-amber-100/50', border: 'border-l-amber-500', badge: 'bg-amber-100 text-amber-700' }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '4px solid var(--border)', borderTopColor: 'var(--accent)' }} />
    </div>
  );

  return (
    <div className="animate-slide-up">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <p style={{ color: 'var(--text-secondary)' }}>Manage restaurant tables and generate QR codes</p>
        <div className="flex items-center gap-2">
          <PanelRefreshButton onClick={fetchTables} loading={loading} />
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium cursor-pointer transition-all duration-200 btn-primary"
          >
            {showForm ? <><HiOutlineX /> Cancel</> : <><HiOutlinePlus /> Add Table</>}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="rounded-2xl p-6 mb-6 animate-scale-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Add New Table</h3>
          <form onSubmit={handleAdd} className="flex gap-4 flex-wrap">
            <input type="number" placeholder="Table Number" value={form.tableNumber} onChange={(e) => setForm({...form, tableNumber: e.target.value})} className="input-field w-40" />
            <input type="number" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({...form, capacity: e.target.value})} className="input-field w-40" />
            <button type="submit" className="px-6 py-2.5 rounded-xl font-medium cursor-pointer btn-primary">Add</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.map((table) => {
          const config = statusConfig[table.status] || statusConfig.available;
          return (
            <div
              key={table._id}
              className={`rounded-xl p-5 text-center bg-gradient-to-br ${config.bg} border-l-4 ${config.border}`}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeftWidth: 4, boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="text-3xl mb-2">🪑</div>
              <h4 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Table {table.tableNumber}</h4>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Seats: {table.capacity}</p>
              <select
                value={table.status}
                onChange={(e) => handleStatusChange(table._id, e.target.value)}
                className={`w-full px-2 py-1.5 rounded-lg text-xs font-medium border-0 mt-3 mb-3 focus:outline-none cursor-pointer ${config.badge}`}
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
              </select>
              <div className="flex gap-2 justify-center">
                <button onClick={() => generateQR(table._id)} className="p-2 rounded-lg cursor-pointer transition-colors" style={{ color: 'var(--accent)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <HiOutlineQrcode size={18} />
                </button>
                <button onClick={() => handleDelete(table._id)} className="p-2 rounded-lg cursor-pointer transition-colors" style={{ color: 'var(--danger)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <HiOutlineTrash size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {qrData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setQrData(null)}>
          <div className="rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Table QR Code</h3>
            <img src={qrData.qrCode} alt="QR Code" className="mx-auto mb-4 rounded-xl" />
            <p className="text-xs mb-4 break-all" style={{ color: 'var(--text-secondary)' }}>{qrData.url}</p>
            <button onClick={() => setQrData(null)} className="px-6 py-2.5 rounded-xl font-medium cursor-pointer btn-primary">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManagement;
