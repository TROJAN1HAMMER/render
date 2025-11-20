const prisma = require('../prisma/prisma');
const QRCode = require('qrcode');

const warrantyController = {
  // POST /user/warranty/register
  registerWarranty: async (req, res) => {
    try {
      const { productId, serialNumber, purchaseDate, warrantyMonths } = req.body;
      const sellerId = req.user.id; // From auth middleware

      if (!productId || !serialNumber || !purchaseDate || !warrantyMonths) {
        return res.status(400).json({ 
          message: 'Product ID, serial number, purchase date, and warranty months are required' 
        });
      }

      if (warrantyMonths <= 0) {
        return res.status(400).json({ message: 'Warranty months must be positive' });
      }

      // Check if serial number already exists
      const existingWarranty = await prisma.registerWarranty.findUnique({
        where: { serialNumber }
      });

      if (existingWarranty) {
        return res.status(409).json({ message: 'Serial number already registered' });
      }

      // Verify product exists
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Create warranty data for QR code
      const warrantyData = {
        productId,
        serialNumber,
        purchaseDate,
        warrantyMonths,
        sellerId,
        registeredAt: new Date()
      };

      // Generate QR code as JSON string
      const qrImage = JSON.stringify(warrantyData);

      // Create warranty registration
      const warranty = await prisma.registerWarranty.create({
        data: {
          productId,
          serialNumber,
          purchaseDate: new Date(purchaseDate),
          warrantyMonths,
          sellerId,
          qrImage,
          registeredAt: new Date()
        }
      });

      res.status(201).json({
        id: warranty.id,
        productId: warranty.productId,
        serialNumber: warranty.serialNumber,
        purchaseDate: warranty.purchaseDate,
        warrantyMonths: warranty.warrantyMonths,
        sellerId: warranty.sellerId,
        registeredAt: warranty.registeredAt,
        qrImage: warranty.qrImage
      });
    } catch (err) {
      console.error('registerWarranty error:', err);
      res.status(500).json({ message: 'Failed to register warranty' });
    }
  },

  // POST /user/warranty/validate
  validateWarranty: async (req, res) => {
    try {
      const qrData = req.body; // JSON data from QR code scan

      if (!qrData || typeof qrData !== 'object') {
        return res.status(400).json({ message: 'Invalid QR data format' });
      }

      // Try to find warranty by serial number first
      let warranty = null;
      if (qrData.serialNumber) {
        warranty = await prisma.registerWarranty.findUnique({
          where: { serialNumber: qrData.serialNumber },
          include: {
            product: true,
            seller: true
          }
        });
      }

      // If not found by serial number, try to match other fields
      if (!warranty && qrData.productId) {
        warranty = await prisma.registerWarranty.findFirst({
          where: {
            productId: qrData.productId,
            serialNumber: qrData.serialNumber || undefined
          },
          include: {
            product: true,
            seller: true
          }
        });
      }

      if (!warranty) {
        return res.status(404).json({ message: 'Warranty not found' });
      }

      // Calculate warranty expiry
      const purchaseDate = new Date(warranty.purchaseDate);
      const expiryDate = new Date(purchaseDate);
      expiryDate.setMonth(expiryDate.getMonth() + warranty.warrantyMonths);
      const isExpired = new Date() > expiryDate;

      res.json({
        message: 'Warranty validated successfully',
        warranty: {
          id: warranty.id,
          productName: warranty.product?.name || 'Unknown Product',
          serialNumber: warranty.serialNumber,
          purchaseDate: warranty.purchaseDate,
          warrantyMonths: warranty.warrantyMonths,
          registeredAt: warranty.registeredAt,
          expiryDate: expiryDate,
          isExpired: isExpired,
          sellerName: warranty.seller?.name || 'Unknown Seller'
        }
      });
    } catch (err) {
      console.error('validateWarranty error:', err);
      res.status(500).json({ message: 'Failed to validate warranty' });
    }
  }
};

module.exports = warrantyController;
