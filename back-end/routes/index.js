const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));

router.use('/admin/audits', require('./admin/audit'));
router.use('/admin/products', require('./admin/product'));
router.use('/admin/stock', require('./admin/stock'));
router.use('/admin/users', require('./admin/user'));
router.use('/admin/companies', require('./admin/company'));
router.use('/admin/orders', require('./admin/order'));
router.use('/admin/warranty-cards', require('./admin/warrantyCard'));
router.use('/admin/reports', require('./admin/report'));
router.use('/admin/invoices', require('./admin/invoice'));
router.use('/admin/search', require('./admin/search'));
router.use('/admin/notifications', require('./admin/notification'));
router.use('/admin/dashboard', require('./admin/dashboard'));
router.use('/admin/incentives', require('./admin/incentive'));
router.use('/admin/points', require('./admin/points'));
router.use('/admin/location', require('./admin/location'));
router.use('/admin/shift-alerts', require('./admin/shiftAlert'));

router.use('/distributor/catalog', require('./distributor/catalog'));
router.use('/distributor/order', require('./distributor/order'));
router.use('/distributor/orders', require('./distributor/orders'));
router.use('/distributor/stock', require('./distributor/stock'));
router.use('/distributor/cart', require('./distributor/cart'));
router.use('/distributor/promo', require('./distributor/promo'));
router.use('/distributor/categories', require('./distributor/category'));

router.use('/accountant/invoice', require('./accountant/invoice'));
router.use('/accountant/financial-logs', require('./accountant/financial-logs'));

router.use('/worker/attendance', require('./worker/attendance'));
router.use('/worker/production', require('./worker/production'));
router.use('/worker/shift-alerts', require('./worker/shiftAlert'));
router.use('/worker/stock', require('./worker/stock'));
router.use('/worker/damage-report', require('./worker/damageReportRoutes'));
router.use('/worker/products', require('./worker/products'));

router.use('/fieldExecutive/followups', require('./fieldExecutive/followUp'));
router.use('/fieldExecutive/dvr', require('./fieldExecutive/dvr'));
router.use('/fieldExecutive/delivery', require('./fieldExecutive/delivery'));
router.use('/fieldExecutive/camera', require('./fieldExecutive/camera'));
router.use('/fieldExecutive/chat', require('./fieldExecutive/chat'));
router.use('/fieldExecutive/task', require('./fieldExecutive/task'));
router.use('/fieldExecutive/location', require('./fieldExecutive/location'));
router.use('/fieldExecutive/customers', require('./fieldExecutive/customers'));
router.use('/fieldExecutive/orders', require('./fieldExecutive/orders'));
router.use('/fieldExecutive/operations', require('./fieldExecutive/operations'));
router.use('/fieldExecutive/stock', require('./fieldExecutive/stock'));
router.use('/fieldExecutive/products', require('./fieldExecutive/products'));

router.use('/plumber/incentives', require('./plumber/incentive'));
router.use('/plumber/points', require('./plumber/points'));
router.use('/plumber/delivery-report', require('./plumber/deliveryReport'));
router.use('/plumber/warranty', require('./plumber/warranty'));
router.use('/plumber/commissioned-work', require('./plumber/commissionedWork'));
router.use('/plumber/products', require('./plumber/products'));
router.use('/plumber/account-profile', require('./plumber/accountProfile'));

router.use('/user/location', require('./user/location'));


module.exports = router;