const { PrismaClient } = require('@prisma/client');
const prisma = require('../prisma/prisma');

const promoCodeController = {
  // Apply promo code to cart
  applyPromoCode: async (req, res) => {
    const userId = req.user.id;
    const { promoCode, orderAmount } = req.body;

    try {
      if (!promoCode || !orderAmount) {
        return res.status(400).json({ message: 'Promo code and order amount are required' });
      }

      // Find promo code
      const promo = await prisma.promoCode.findUnique({
        where: { code: promoCode }
      });

      if (!promo) {
        return res.status(404).json({ message: 'Invalid promo code' });
      }

      // Check if promo code is active
      if (promo.status !== 'Active') {
        return res.status(400).json({ message: 'Promo code is not active' });
      }

      // Check validity period
      const now = new Date();
      if (now < promo.validFrom || now > promo.validUntil) {
        return res.status(400).json({ message: 'Promo code is not valid at this time' });
      }

      // Check minimum order amount
      if (promo.minOrderAmount && orderAmount < promo.minOrderAmount) {
        return res.status(400).json({ 
          message: `Minimum order amount of $${promo.minOrderAmount} required` 
        });
      }

      // Check usage limit
      if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
        return res.status(400).json({ message: 'Promo code usage limit exceeded' });
      }

      // Calculate discount
      let discountAmount = 0;
      if (promo.discountType === 'percentage') {
        discountAmount = (orderAmount * promo.discountValue) / 100;
      } else {
        discountAmount = promo.discountValue;
      }

      // Apply maximum discount limit if set
      if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
        discountAmount = promo.maxDiscount;
      }

      const finalAmount = orderAmount - discountAmount;

      res.json({
        message: 'Promo code applied successfully',
        promoCode: {
          code: promo.code,
          description: promo.description,
          discountType: promo.discountType,
          discountValue: promo.discountValue,
          discountAmount,
          finalAmount
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to apply promo code' });
    }
  },

  // Validate promo code (for order placement)
  validatePromoCode: async (req, res) => {
    const { promoCode, orderAmount } = req.body;

    try {
      if (!promoCode || !orderAmount) {
        return res.status(400).json({ message: 'Promo code and order amount are required' });
      }

      const promo = await prisma.promoCode.findUnique({
        where: { code: promoCode }
      });

      if (!promo) {
        return res.status(404).json({ message: 'Invalid promo code' });
      }

      // Check all validation criteria
      const now = new Date();
      const isValid = 
        promo.status === 'Active' &&
        now >= promo.validFrom &&
        now <= promo.validUntil &&
        (!promo.minOrderAmount || orderAmount >= promo.minOrderAmount) &&
        (!promo.usageLimit || promo.usedCount < promo.usageLimit);

      if (!isValid) {
        return res.status(400).json({ message: 'Promo code validation failed' });
      }

      // Calculate discount
      let discountAmount = 0;
      if (promo.discountType === 'percentage') {
        discountAmount = (orderAmount * promo.discountValue) / 100;
      } else {
        discountAmount = promo.discountValue;
      }

      if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
        discountAmount = promo.maxDiscount;
      }

      res.json({
        isValid: true,
        promoCode: {
          id: promo.id,
          code: promo.code,
          discountType: promo.discountType,
          discountValue: promo.discountValue,
          discountAmount,
          finalAmount: orderAmount - discountAmount
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to validate promo code' });
    }
  },

  // Get all active promo codes (for admin/distributor view)
  getActivePromoCodes: async (req, res) => {
    try {
      const promoCodes = await prisma.promoCode.findMany({
        where: { status: 'Active' },
        select: {
          id: true,
          code: true,
          description: true,
          discountType: true,
          discountValue: true,
          minOrderAmount: true,
          maxDiscount: true,
          validFrom: true,
          validUntil: true
        }
      });

      res.json(promoCodes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch promo codes' });
    }
  }
  ,
  // GET promo by CODE (details)
  getPromoByCode: async (req, res) => {
    try {
      const { code } = req.params;
      const promo = await prisma.promoCode.findUnique({ where: { code } });
      if (!promo) return res.status(404).json({ message: 'Promo code not found' });
      res.json(promo);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch promo code' });
    }
  }
};

module.exports = promoCodeController;

