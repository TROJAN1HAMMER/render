

const express = require('express');
const router = express.Router();

const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const accountantController = require('../../controllers/accountantController');


router.use(authenticate);
router.use(authorizeRoles('Accountant', 'Admin'));

router.get('/', accountantController.getAllFinancialLogs);
router.post('/', accountantController.createFinancialLog);
router.delete('/:id', accountantController.deleteFinancialLog); 

module.exports = router;

