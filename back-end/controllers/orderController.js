const { PrismaClient } = require('@prisma/client');
const prisma = require('../prisma/prisma');

const orderController = {
  // placeOrder: async (req, res) => {
  //   const userId = req.user.id;
  //   const { items } = req.body; // [{ productId, quantity }]
  
  //   try {
  //     if (!items || !Array.isArray(items) || items.length === 0) {
  //       return res.status(400).json({ message: 'No items provided' });
  //     }
  
  //     await prisma.$transaction(async (tx) => {
  //       const productIds = items.map(item => item.productId);
  
  //       const products = await tx.product.findMany({
  //         where: { id: { in: productIds } }
  //       });
  
  //       const orderItemsData = items.map(item => {
  //         const product = products.find(p => p.id === item.productId);
  //         if (!product) throw new Error(`Invalid product ID: ${item.productId}`);
  
  //         if (product.stockQuantity < item.quantity) {
  //           throw new Error(`Not enough stock for ${product.name}`);
  //         }
  
  //         return {
  //           productId: item.productId,
  //           quantity: item.quantity,
  //           unitPrice: product.price
  //         };
  //       });
  
  //       // Deduct product stock
  //       for (const item of orderItemsData) {
  //         await tx.product.update({
  //           where: { id: item.productId },
  //           data: {
  //             stockQuantity: {
  //               decrement: item.quantity
  //             }
  //           }
  //         });
  //       }
  
  //       // Create order and order items
  //       const order = await tx.order.create({
  //         data: {
  //           userId,
  //           status: 'Pending',
  //           orderDate: new Date(),
  //           orderItems: {
  //             create: orderItemsData
  //           }
  //         },
  //         include: {
  //           orderItems: true
  //         }
  //       });
  
  //       res.status(201).json({ message: 'Order placed', order });
  //     });
  //   } catch (err) {
  //     console.error('Order Error:', err);
  //     res.status(500).json({ message: 'Order placement failed', error: err.message });
  //   }
  // },
//   placeOrder: async (req, res) => {
//   console.log("🟢 Incoming request to placeOrder");

//   const userId = String(req.user?.id || "");
//   const { items } = req.body;

//   console.log("➡️ User ID:", userId);
//   console.log("➡️ Items received:", items);

//   if (!userId) {
//     return res.status(401).json({ message: "Unauthorized: No user ID found" });
//   }

//   if (!items || !Array.isArray(items) || items.length === 0) {
//     return res.status(400).json({ message: "No items provided" });
//   }

//   try {
//     let order; // store final order

//     await prisma.$transaction(async (tx) => {
//       const productNames = items.map((i) => i.productName);
//       console.log("🛒 Product names:", productNames);

//       // find products by name (case insensitive)
//       const products = await tx.product.findMany({
//         where: {
//           name: { in: productNames, mode: "insensitive" },
//         },
//       });

//       console.log("📦 Products found:", products);

//       const orderItemsData = items.map((item) => {
//         const product = products.find(
//           (p) => p.name.toLowerCase() === item.productName.toLowerCase()
//         );

//         if (!product) throw new Error(`Invalid product name: ${item.productName}`);

//         if (product.stockQuantity < item.quantity) {
//           throw new Error(`Not enough stock for ${product.name}`);
//         }

//         return {
//           productId: String(product.id),
//           quantity: item.quantity,
//           unitPrice: product.price,
//         };
//       });

//       // Update stock
//       for (const item of orderItemsData) {
//         console.log(`🧮 Updating stock for productId ${item.productId}`);
//         await tx.product.update({
//           where: { id: item.productId },
//           data: {
//             stockQuantity: { decrement: item.quantity },
//           },
//         });
//       }

//       // Create order
//       order = await tx.order.create({
//         data: {
//           userId: String(userId),
//           status: "Pending",
//           orderDate: new Date(),
//           orderItems: { create: orderItemsData },
//         },
//         include: { orderItems: true },
//       });
//     });

//     console.log("✅ Order placed successfully:", order);

//     res.status(201).json({
//       message: "Order placed successfully",
//       order,
//     });
//   } catch (err) {
//     console.error("❌ OrderTwo Error:", err);
//     res.status(500).json({
//       message: "Order placement failed",
//       error: err.message,
//       stack: err.stack,
//     });
//   }
// },
  placeOrder: async (req, res) => {
  const userId = req.user.id;
  const { items } = req.body; // [{ productId, quantity }]

  try {
    // ✅ Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items provided' });
    }

    // ✅ Fetch all products at once
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (!products.length) {
      return res.status(404).json({ message: 'No valid products found' });
    }

    const orderItemsData = [];

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return res
          .status(400)
          .json({ message: `Invalid product ID: ${item.productId}` });
      }

      if (product.stockQuantity < item.quantity) {
        return res
          .status(400)
          .json({ message: `Not enough stock for ${product.name}` });
      }

      // ✅ Deduct product stock
      await prisma.product.update({
        where: { id: product.id },
        data: {
          stockQuantity: {
            decrement: item.quantity,
          },
        },
      });

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
      });
    }

    // ✅ Create order and order items
    const order = await prisma.order.create({
      data: {
        userId,
        status: 'Pending',
        orderDate: new Date(),
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: '✅ Order placed successfully',
      order,
    });
  } catch (err) {
    console.error('Order Error:', err);
    return res.status(500).json({
      message: '❌ Order placement failed',
      error: err.message,
    });
  }
},

// ----------------------------------------------------
// ✅ Get all orders for the logged-in Field Executive
// ----------------------------------------------------
getMyOrders: async (req, res) => {
  const userId = req.user.id;

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: {
        orderDate: 'desc',
      },
    });

    // ✅ Add computed total amount
    const formatted = orders.map(order => {
      const totalAmount = order.orderItems.reduce((sum, item) => {
        return sum + item.unitPrice * item.quantity;
      }, 0);

      return {
        id: order.id,
        orderDate: order.orderDate,
        status: order.status,
        totalAmount,
        items: order.orderItems.map(item => ({
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
},

  // GET /admin/orders
  getAllOrders: async (req, res) => {
    try {
      const { status, userId } = req.query;
      const where = {};
      if (status) where.status = status;
      if (userId) where.userId = userId;
      const orders = await prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          orderItems: {
            include: {
              product: { select: { name: true, price: true } }
            }
          },
          invoice: true
        },
        orderBy: { orderDate: 'desc' }
      });
      res.json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
  },

  // GET /admin/orders/:id
  getOrderById: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          orderItems: {
            include: {
              product: { select: { name: true, price: true } }
            }
          },
          invoice: true
        }
      });
      if (!order) return res.status(404).json({ message: 'Order not found' });
      res.json(order);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch order' });
    }
  },

  // GET /distributor/orders/:id (Track Order)
  trackOrder: async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
      const order = await prisma.order.findUnique({
        where: { 
          id,
          userId // Ensure user can only track their own orders
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  warrantyPeriodInMonths: true
                }
              }
            }
          },
          invoice: true,
          promoCode: {
            select: {
              code: true,
              description: true,
              discountType: true,
              discountValue: true
            }
          }
        }
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Calculate totals
      const subtotal = order.orderItems.reduce((sum, item) => {
        return sum + (item.unitPrice * item.quantity);
      }, 0);

      const discountAmount = order.promoCode ? 
        (order.promoCode.discountType === 'percentage' ? 
          (subtotal * order.promoCode.discountValue) / 100 : 
          order.promoCode.discountValue) : 0;

      const total = subtotal - discountAmount;

      const orderDetails = {
        id: order.id,
        status: order.status,
        orderDate: order.orderDate,
        subtotal,
        discountAmount,
        total,
        items: order.orderItems.map(item => ({
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.unitPrice * item.quantity
        })),
        promoCode: order.promoCode,
        invoice: order.invoice
      };

      res.json(orderDetails);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to track order' });
    }
  },

  // GET /distributor/orders/:id/confirmation (Order Confirmation)
  getOrderConfirmation: async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
      const order = await prisma.order.findUnique({
        where: { 
          id,
          userId
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  warrantyPeriodInMonths: true
                }
              }
            }
          },
          invoice: true,
          promoCode: {
            select: {
              code: true,
              description: true,
              discountType: true,
              discountValue: true
            }
          }
        }
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const subtotal = order.orderItems.reduce((sum, item) => {
        return sum + (item.unitPrice * item.quantity);
      }, 0);

      const discountAmount = order.promoCode ? 
        (order.promoCode.discountType === 'percentage' ? 
          (subtotal * order.promoCode.discountValue) / 100 : 
          order.promoCode.discountValue) : 0;

      const total = subtotal - discountAmount;

      const confirmation = {
        orderId: order.id,
        orderDate: order.orderDate,
        status: order.status,
        customerInfo: {
          userId: order.userId
        },
        items: order.orderItems.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.unitPrice * item.quantity,
          warrantyPeriod: item.product.warrantyPeriodInMonths
        })),
        pricing: {
          subtotal,
          discountAmount,
          total
        },
        promoCode: order.promoCode,
        invoice: order.invoice,
        estimatedDelivery: new Date(order.orderDate.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from order
      };

      res.json(confirmation);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to get order confirmation' });
    }
  },

  // Enhanced order placement with promo code support
  placeOrderWithPromo: async (req, res) => {
    const userId = req.user.id;
    const { items, promoCode } = req.body;

    try {
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'No items provided' });
      }

      let promoCodeData = null;
      let discountAmount = 0;

      // Validate promo code if provided
      if (promoCode) {
        const promo = await prisma.promoCode.findUnique({
          where: { code: promoCode }
        });

        if (promo && promo.status === 'Active') {
          const now = new Date();
          if (now >= promo.validFrom && now <= promo.validUntil) {
            promoCodeData = promo;
          }
        }
      }

      await prisma.$transaction(async (tx) => {
        const productIds = items.map(item => item.productId);

        const products = await tx.product.findMany({
          where: { id: { in: productIds } }
        });

        const orderItemsData = items.map(item => {
          const product = products.find(p => p.id === item.productId);
          if (!product) throw new Error(`Invalid product ID: ${item.productId}`);

          if (product.stockQuantity < item.quantity) {
            throw new Error(`Not enough stock for ${product.name}`);
          }

          return {
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: product.price
          };
        });

        // Calculate subtotal
        const subtotal = orderItemsData.reduce((sum, item) => {
          const product = products.find(p => p.id === item.productId);
          return sum + (product.price * item.quantity);
        }, 0);

        // Calculate discount if promo code is valid
        if (promoCodeData) {
          if (promoCodeData.minOrderAmount && subtotal < promoCodeData.minOrderAmount) {
            throw new Error(`Minimum order amount of $${promoCodeData.minOrderAmount} required for promo code`);
          }

          if (promoCodeData.discountType === 'percentage') {
            discountAmount = (subtotal * promoCodeData.discountValue) / 100;
          } else {
            discountAmount = promoCodeData.discountValue;
          }

          if (promoCodeData.maxDiscount && discountAmount > promoCodeData.maxDiscount) {
            discountAmount = promoCodeData.maxDiscount;
          }
        }

        // Deduct product stock
        for (const item of orderItemsData) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                decrement: item.quantity
              }
            }
          });
        }

        // Create order with promo code
        const order = await tx.order.create({
          data: {
            userId,
            status: 'Pending',
            orderDate: new Date(),
            promoCodeId: promoCodeData?.id || null,
            orderItems: {
              create: orderItemsData
            }
          },
          include: {
            orderItems: true,
            promoCode: true
          }
        });

        // Update promo code usage count
        if (promoCodeData) {
          await tx.promoCode.update({
            where: { id: promoCodeData.id },
            data: {
              usedCount: {
                increment: 1
              }
            }
          });
        }

        const total = subtotal - discountAmount;

        res.status(201).json({ 
          message: 'Order placed successfully', 
          order,
          pricing: {
            subtotal,
            discountAmount,
            total
          }
        });
      });
    } catch (err) {
      console.error('Order Error:', err);
      res.status(500).json({ message: 'Order placement failed', error: err.message });
    }
  },

  // POST /distributor/order/create
  // createOrder: async (req, res) => {
  //   const userId = req.user.id; // logged-in distributor
  //   const { items } = req.body;

  //   if (!items || !Array.isArray(items) || items.length === 0) {
  //     return res.status(400).json({ message: 'Order must contain at least one item' });
  //   }

  //   try {
  //     // fetch product details to get prices
  //     const productIds = items.map(i => i.productId);
  //     const products = await prisma.product.findMany({
  //       where: { id: { in: productIds } },
  //     });

  //     if (products.length !== items.length) {
  //       return res.status(400).json({ message: 'Some products not found' });
  //     }

//       // Create order + items in a transaction
//       const order = await prisma.order.create({
//         data: {
//           userId,
//           status: 'Pending',
//           orderDate: new Date(),
//           orderItems: {
//             create: items.map(i => {
//               const product = products.find(p => p.id === i.productId);
//               return {
//                 productId: i.productId,
//                 quantity: i.quantity,
//                 unitPrice: product.price,
//               };
//             }),
//           },
//         },
//         include: { orderItems: true },
//       });

//       res.status(201).json({ message: 'Order created successfully', order });
//     } catch (err) {
//       console.error('Error creating order:', err);
//       res.status(500).json({ message: 'Failed to create order' });
//     }
//  },
 };

module.exports = orderController;
