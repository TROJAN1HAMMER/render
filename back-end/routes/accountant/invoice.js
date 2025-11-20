
const express = require('express');
const router = express.Router();

const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const invoiceController = require('../../controllers/invoiceController');
const accountantController = require('../../controllers/accountantController');

router.use(authenticate);
router.use(authorizeRoles('Accountant', 'Admin'));

router.get('/users', accountantController.getAllUsers);
router.get('/summary', accountantController.getFinancialSummary);


router.post('/:orderId', invoiceController.generateInvoice);
router.get('/:orderId', invoiceController.getInvoice);

router.get('/', accountantController.getAllInvoices);
router.post('/', accountantController.createInvoice);
router.patch('/:id/send', accountantController.sendInvoice);
router.patch('/:id/verify-payment', accountantController.verifyPayment);


module.exports = router;
