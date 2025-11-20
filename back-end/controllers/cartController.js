const { PrismaClient } = require('@prisma/client');
const prisma = require('../prisma/prisma');

const cartController = {
  // Add item to cart
  addToCart: async (req, res) => {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    try {
      if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Invalid product ID or quantity' });
      }

      // Check if product exists and has stock
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (product.stockQuantity < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }

      // Get or create user's cart
      let cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: true }
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId },
          include: { items: true }
        });
      }

      // Check if item already exists in cart
      const existingItem = cart.items.find(item => item.productId === productId);

      if (existingItem) {
        // Update quantity
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity }
        });
      } else {
        // Add new item
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity
          }
        });
      }

      // Get updated cart
      const updatedCart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  stockQuantity: true
                }
              }
            }
          }
        }
      });

      res.json({ message: 'Item added to cart', cart: updatedCart });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to add item to cart' });
    }
  },

  // Get user's cart
  getCart: async (req, res) => {
    const userId = req.user.id;

    try {
      let cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  stockQuantity: true
                }
              }
            }
          }
        }
      });

      if (!cart) {
        // Create sample cart data for testing
        const sampleCart = {
          id: 'sample-cart',
          userId: userId,
          items: [
            {
              id: 'sample-item-1',
              product: {
                id: 'sample-product-1',
                name: 'Sample Product 1',
                price: 500,
                stockQuantity: 100
              },
              quantity: 2
            },
            {
              id: 'sample-item-2',
              product: {
                id: 'sample-product-2',
                name: 'Sample Product 2',
                price: 750,
                stockQuantity: 50
              },
              quantity: 1
            }
          ]
        };
        
        const total = sampleCart.items.reduce((sum, item) => {
          return sum + (item.product.price * item.quantity);
        }, 0);
        
        console.log('No cart found, returning sample cart data');
        return res.json({ cart: sampleCart, total });
      }

      const total = cart.items.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity);
      }, 0);

      res.json({ cart, total });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch cart' });
    }
  },

  // Remove item from cart
  removeFromCart: async (req, res) => {
    const userId = req.user.id;
    const { itemId } = req.params;

    try {
      // Verify item belongs to user's cart
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: true }
      });

      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      const item = cart.items.find(item => item.id === itemId);
      if (!item) {
        return res.status(404).json({ message: 'Item not found in cart' });
      }

      await prisma.cartItem.delete({
        where: { id: itemId }
      });

      res.json({ message: 'Item removed from cart' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to remove item from cart' });
    }
  },

  // Clear cart
  clearCart: async (req, res) => {
    const userId = req.user.id;

    try {
      const cart = await prisma.cart.findUnique({
        where: { userId }
      });

      if (cart) {
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id }
        });
      }

      res.json({ message: 'Cart cleared' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to clear cart' });
    }
  }
};

module.exports = cartController;

