const express = require('express');
const router = express.Router();
const { generateBill, payBill, getBill, getBillByOrder, dailyReport, getBillingHistory, getAnalytics } = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/generate/:orderId', protect, authorize('admin', 'cashier'), generateBill);
router.post('/pay/:billId', protect, authorize('admin', 'cashier'), payBill);
router.get('/reports/daily', protect, authorize('admin', 'cashier'), dailyReport);
router.get('/reports/history', protect, authorize('admin', 'cashier'), getBillingHistory);
router.get('/reports/analytics', protect, authorize('admin'), getAnalytics);
router.get('/order/:orderId', protect, authorize('admin', 'cashier'), getBillByOrder);
router.get('/:billId', protect, authorize('admin', 'cashier'), getBill);

module.exports = router;
