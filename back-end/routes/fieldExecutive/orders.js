const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const orderController = require('../../controllers/orderController');

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Field Executive Orders
 *   description: APIs for Field Executives to manage and track their orders
 */

/**
 * @swagger
 * /field-executive/orders:
 *   post:
 *     summary: Place a new order
 *     description: Allows a Field Executive to place a new order with one or more products.
 *     tags: [Field Executive Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Order details including product IDs and quantities
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Order placed successfully
 *       400:
 *         description: No items provided or invalid input
 *       500:
 *         description: Order placement failed
 */
router.post(
  '/',
  authorizeRoles('FieldExecutive'),
  orderController.placeOrder
);

/**
 * @swagger
 * /field-executive/orders/{orderId}/add-product:
 *   put:
 *     summary: Add a product to an existing order
 *     description: Allows a Field Executive to update an existing order by adding more products.
 *     tags: [Field Executive Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the existing order
 *     requestBody:
 *       description: Product details to add to the order
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 3
 *               quantity:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Product added to order successfully
 *       400:
 *         description: Invalid product or insufficient stock
 *       404:
 *         description: Order not found
 *       500:
 *         description: Failed to add product to order
 */
router.put(
  '/:orderId/add-product',
  authorizeRoles('FieldExecutive'),
  async (req, res) => {
    const { orderId } = req.params;
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    try {
      const existingOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
      });

      if (!existingOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (existingOrder.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized access' });
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return res.status(400).json({ message: 'Invalid product ID' });
      }

      if (product.stockQuantity < quantity) {
        return res
          .status(400)
          .json({ message: `Not enough stock for ${product.name}` });
      }

      // Check if product already exists in order
      const existingItem = existingOrder.orderItems.find(
        (item) => item.productId === productId
      );

      if (existingItem) {
        // Update existing item quantity
        await prisma.orderItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
        });
      } else {
        // Add new item to order
        await prisma.orderItem.create({
          data: {
            orderId: existingOrder.id,
            productId,
            quantity,
            unitPrice: product.price,
          },
        });
      }

      // Deduct stock
      await prisma.product.update({
        where: { id: productId },
        data: {
          stockQuantity: {
            decrement: quantity,
          },
        },
      });

      const updatedOrder = await prisma.order.findUnique({
        where: { id: existingOrder.id },
        include: {
          orderItems: {
            include: {
              product: { select: { name: true, price: true } },
            },
          },
        },
      });

      res.status(200).json({
        message: 'Product added to order successfully',
        order: updatedOrder,
      });
    } catch (err) {
      console.error('Add Product Error:', err);
      res.status(500).json({
        message: 'Failed to add product to order',
        error: err.message,
      });
    }
  }
);

/**
 * @swagger
 * /field-executive/orders:
 *   get:
 *     summary: Get all my orders
 *     description: Fetches all orders placed by the logged-in Field Executive.
 *     tags: [Field Executive Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's orders
 *       500:
 *         description: Failed to fetch orders
 */
router.get(
  '/',
  authorizeRoles('FieldExecutive'),
  orderController.getMyOrders
);

module.exports = router;
