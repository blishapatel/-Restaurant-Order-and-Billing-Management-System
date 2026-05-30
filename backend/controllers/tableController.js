const Table = require('../models/Table');
const QRCode = require('qrcode');

exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find().sort('tableNumber');
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createTable = async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;
    const exists = await Table.findOne({ tableNumber });
    if (exists) return res.status(400).json({ message: 'Table number already exists' });
    const table = await Table.create({ tableNumber, capacity });
    res.status(201).json(table);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!table) return res.status(404).json({ message: 'Table not found' });
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) return res.status(404).json({ message: 'Table not found' });
    res.json({ message: 'Table deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.generateQR = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ message: 'Table not found' });
    
    // Build frontend URL - use origin/referer header from the frontend, or default to localhost:5173
    const origin = req.get('origin') || req.get('referer') || 'http://localhost:5173';
    const baseUrl = origin.replace(/\/$/, '').replace(/\/api.*$/, '');
    const url = `${baseUrl}/menu/table/${table.tableNumber}`;
    
    const qrDataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 });
    res.json({ qrCode: qrDataUrl, url });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
