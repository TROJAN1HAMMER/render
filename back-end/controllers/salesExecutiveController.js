const prisma = require('../prisma/prisma');

const salesExecutiveController = {
  // GPS Location Tracking (similar to existing location controller)
  submitLocation: async (req, res) => {
    try {
      const userId = req.user.id;
      const { latitude, longitude } = req.body;

      if (latitude == null || longitude == null) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }

      const location = await prisma.liveLocation.create({
        data: {
          userId,
          latitude,
          longitude,
          timeStamp: new Date()
        }
      });

      res.status(201).json({ message: 'Location recorded', location });
    } catch (err) {
      console.error('submitLocation error:', err);
      res.status(500).json({ message: 'Failed to record location' });
    }
  },

  getMyLocationHistory: async (req, res) => {
    try {
      const userId = req.user.id;
      const locations = await prisma.liveLocation.findMany({
        where: { userId },
        orderBy: { timeStamp: 'desc' }
      });

      res.json(locations);
    } catch (err) {
      console.error('getMyLocationHistory error:', err);
      res.status(500).json({ message: 'Failed to fetch location history' });
    }
  },

  // Tasks Management (extend existing task controller)
  getTasks: async (req, res) => {
    try {
      const userId = req.user.id;
      const { status } = req.query;

      const fieldExec = await prisma.fieldExecutive.findUnique({
        where: { userId }
      });

      if (!fieldExec) {
        return res.status(403).json({ message: 'Not a Field Executive' });
      }

      const whereClause = { executiveId: fieldExec.id };
      if (status) {
        whereClause.status = status;
      }

      const tasks = await prisma.task.findMany({
        where: whereClause,
        orderBy: { dueDate: 'asc' }
      });

      res.json(tasks);
    } catch (err) {
      console.error('Error in getTasks:', err);
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  },

  getTaskById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const fieldExec = await prisma.fieldExecutive.findUnique({
        where: { userId }
      });

      if (!fieldExec) {
        return res.status(403).json({ message: 'Not a Field Executive' });
      }

      const task = await prisma.task.findFirst({
        where: { id, executiveId: fieldExec.id }
      });

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.json(task);
    } catch (err) {
      console.error('Error in getTaskById:', err);
      res.status(500).json({ message: 'Failed to fetch task' });
    }
  },

  updateTaskStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.id;

      const fieldExec = await prisma.fieldExecutive.findUnique({
        where: { userId }
      });

      if (!fieldExec) {
        return res.status(403).json({ message: 'Not a Field Executive' });
      }

      const task = await prisma.task.findFirst({
        where: { id, executiveId: fieldExec.id }
      });

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const updated = await prisma.task.update({
        where: { id },
        data: { status }
      });

      res.json({ message: 'Task status updated', task: updated });
    } catch (err) {
      console.error('Error in updateTaskStatus:', err);
      res.status(500).json({ message: 'Failed to update task status' });
    }
  },

  // Chat functionality
  getMessages: async (req, res) => {
    try {
      const userId = req.user.id;
      const { receiverId } = req.query;

      const fieldExec = await prisma.fieldExecutive.findUnique({
        where: { userId }
      });

      if (!fieldExec) {
        return res.status(403).json({ message: 'Not a Field Executive' });
      }

      let whereClause = {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      };

      if (receiverId) {
        whereClause = {
          OR: [
            { senderId: userId, receiverId: receiverId },
            { senderId: receiverId, receiverId: userId }
          ]
        };
      }

      const messages = await prisma.chatMessage.findMany({
        where: whereClause,
        include: {
          sender: { select: { id: true, name: true, role: true } },
          receiver: { select: { id: true, name: true, role: true } }
        },
        orderBy: { createdAt: 'asc' }
      });

      res.json(messages);
    } catch (err) {
      console.error('Error in getMessages:', err);
      res.status(500).json({ message: 'Failed to retrieve messages' });
    }
  },

  sendMessage: async (req, res) => {
    try {
      const { content, receiverId } = req.body;
      const userId = req.user.id;

      if (!content) {
        return res.status(400).json({ message: 'Message content is required' });
      }

      const fieldExec = await prisma.fieldExecutive.findUnique({
        where: { userId }
      });

      if (!fieldExec) {
        return res.status(403).json({ message: 'Not a Field Executive' });
      }

      const message = await prisma.chatMessage.create({
        data: {
          senderId: userId,
          receiverId: receiverId || null,
          content
        },
        include: {
          sender: { select: { id: true, name: true, role: true } },
          receiver: { select: { id: true, name: true, role: true } }
        }
      });

      res.status(201).json({ message: 'Message sent successfully', data: message });
    } catch (err) {
      console.error('Error in sendMessage:', err);
      res.status(500).json({ message: 'Failed to send message' });
    }
  },

  // Camera functionality
  uploadImage: async (req, res) => {
    try {
      const { latitude, longitude, description } = req.body;
      const image = req.file;
      const userId = req.user.id;

      if (!latitude || !longitude) {
        return res.status(400).json({ 
          message: 'Latitude and longitude are required' 
        });
      }

      if (!image) {
        return res.status(400).json({ message: 'Image file is required' });
      }

      const fieldExec = await prisma.fieldExecutive.findUnique({
        where: { userId }
      });

      if (!fieldExec) {
        return res.status(403).json({ message: 'Not a Field Executive' });
      }

      const capturedImage = await prisma.capturedImage.create({
        data: {
          executiveId: fieldExec.id,
          imageData: image.buffer,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          description: description || ''
        }
      });

      res.status(201).json({
        message: 'Image uploaded successfully',
        data: {
          id: capturedImage.id,
          latitude: capturedImage.latitude,
          longitude: capturedImage.longitude,
          description: capturedImage.description,
          createdAt: capturedImage.createdAt
        }
      });
    } catch (err) {
      console.error('Error in uploadImage:', err);
      res.status(500).json({ message: 'Failed to upload image' });
    }
  },

  getMyImages: async (req, res) => {
    try {
      const userId = req.user.id;

      const fieldExec = await prisma.fieldExecutive.findUnique({
        where: { userId }
      });

      if (!fieldExec) {
        return res.status(403).json({ message: 'Not a Field Executive' });
      }

      const images = await prisma.capturedImage.findMany({
        where: { executiveId: fieldExec.id },
        select: {
          id: true,
          latitude: true,
          longitude: true,
          description: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({ message: 'Images retrieved successfully', images });
    } catch (err) {
      console.error('Error in getMyImages:', err);
      res.status(500).json({ message: 'Failed to retrieve images' });
    }
  },

  // Customer Management
  getAssignedCustomers: async (req, res) => {
    try {
      const userId = req.user.id;

      const fieldExec = await prisma.fieldExecutive.findUnique({
        where: { userId }
      });

      if (!fieldExec) {
        return res.status(403).json({ message: 'Not a Field Executive' });
      }

      const customers = await prisma.customer.findMany({
        where: { assignedTo: fieldExec.id },
        include: {
          visits: {
            orderBy: { visitDate: 'desc' },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json(customers);
    } catch (err) {
      console.error('Error in getAssignedCustomers:', err);
      res.status(500).json({ message: 'Failed to fetch customers' });
    }
  },

  // getCustomerById: async (req, res) => {
  //   try {
  //     const { id } = req.params;
  //     const userId = req.user.id;

  //     const fieldExec = await prisma.fieldExecutive.findUnique({
  //       where: { userId }
  //     });

  //     if (!fieldExec) {
  //       return res.status(403).json({ message: 'Not a Field Executive' });
  //     }

  //     const customer = await prisma.customer.findFirst({
  //       where: { id, assignedTo: fieldExec.id },
  //       include: {
  //         visits: {
  //           orderBy: { visitDate: 'desc' }
  //         }
  //       }
  //     });

  //     if (!customer) {
  //       return res.status(404).json({ message: 'Customer not found' });
  //     }

  //     res.json(customer);
  //   } catch (err) {
  //     console.error('Error in getCustomerById:', err);
  //     res.status(500).json({ message: 'Failed to fetch customer' });
  //   }
  // },

  getCustomerById: async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find Field Executive linked to this user
    const fieldExec = await prisma.fieldExecutive.findUnique({
      where: { userId }
    });

    if (!fieldExec) return res.status(403).json({ message: '❌ Not a Field Executive' });

    // Fetch customer if assigned to this field executive
    const customer = await prisma.customer.findFirst({
      where: { id, assignedTo: fieldExec.id },
      include: {
        visits: {
          orderBy: { visitDate: 'desc' }
        }
      }
    });

    if (!customer) return res.status(404).json({ message: '❌ Customer not found or not assigned to you' });

    res.json(customer);
  } catch (err) {
    console.error('Error in getCustomerById:', err);
    res.status(500).json({ message: '❌ Failed to fetch customer' });
  }
},


  // Customer Visit Reports
  // createVisitReport: async (req, res) => {
  //   try {
  //     const {
  //       customerId,
  //       visitDate,
  //       location,
  //       peoplePresent,
  //       productsDiscussed,
  //       reasonForVisit,
  //       customerConcerns,
  //       investigationStatus,
  //       rootCause,
  //       correctiveAction,
  //       recommendations,
  //       feedback
  //     } = req.body;

  //     const userId = req.user.id;

  //     const fieldExec = await prisma.fieldExecutive.findUnique({
  //       where: { userId }
  //     });

  //     if (!fieldExec) {
  //       return res.status(403).json({ message: 'Not a Field Executive' });
  //     }

  //     // Verify customer is assigned to this executive
  //     const customer = await prisma.customer.findFirst({
  //       where: { id: customerId, assignedTo: fieldExec.id }
  //     });

  //     if (!customer) {
  //       return res.status(404).json({ message: 'Customer not found or not assigned to you' });
  //     }

  //     const visit = await prisma.customerVisit.create({
  //       data: {
  //         customerId,
  //         executiveId: fieldExec.id,
  //         visitDate: new Date(visitDate),
  //         location,
  //         peoplePresent,
  //         productsDiscussed,
  //         reasonForVisit,
  //         customerConcerns,
  //         investigationStatus,
  //         rootCause,
  //         correctiveAction,
  //         recommendations,
  //         feedback,
  //         reportCompletedBy: req.user.name
  //       }
  //     });

  //     res.status(201).json({ message: 'Visit report created successfully', visit });
  //   } catch (err) {
  //     console.error('Error in createVisitReport:', err);
  //     res.status(500).json({ message: 'Failed to create visit report' });
  //   }
  // },

createVisitReport: async (req, res) => {
  try {
    const { id } = req.params;
    const {
      visitDate,
      location,
      peoplePresent,
      productsDiscussed,
      reasonForVisit,
      customerConcerns,
      investigationStatus,
      rootCause,
      correctiveAction,
      recommendations,
      feedback,
      reportCompletedBy
    } = req.body;

    // Validate required fields
    if (!id || !visitDate || !location || !reportCompletedBy) {
      return res.status(400).json({
        message: "⚠️ Customer ID, Visit Date, Location & Report Completed By are required"
      });
    }

    const userId = req.user.id;

    // Find Field Executive linked to this user
    const fieldExec = await prisma.fieldExecutive.findUnique({
      where: { userId }
    });

    if (!fieldExec) return res.status(403).json({ message: '❌ Not a Field Executive' });

    // Ensure customer exists and is assigned to this Field Executive
    const customer = await prisma.customer.findFirst({
      where: { id, assignedTo: fieldExec.id }
    });

    if (!customer) return res.status(404).json({
      message: '❌ Customer not found or not assigned to you'
    });

    // Create the visit report
    const visit = await prisma.customerVisit.create({
      data: {
        customerId: id,
        executiveId: fieldExec.id,
        visitDate: new Date(visitDate),
        location,
        peoplePresent,
        productsDiscussed,
        reasonForVisit,
        customerConcerns,
        investigationStatus,
        rootCause,
        correctiveAction,
        recommendations,
        feedback,
        reportCompletedBy: reportCompletedBy || req.user.name
      }
    });

    res.status(201).json({ message: '✅ Visit report created successfully', visit });
  } catch (err) {
    console.error('Error in createVisitReport:', err.message);
    res.status(500).json({ message: '❌ Failed to create visit report' });
  }
},

  // getVisitReports: async (req, res) => {
  //   try {
  //     const userId = req.user.id;
  //     const { customerId } = req.query;

  //     const fieldExec = await prisma.fieldExecutive.findUnique({
  //       where: { userId }
  //     });

  //     if (!fieldExec) {
  //       return res.status(403).json({ message: 'Not a Field Executive' });
  //     }

  //     let whereClause = { executiveId: fieldExec.id };
  //     if (customerId) {
  //       whereClause.customerId = customerId;
  //     }

  //     const visits = await prisma.customerVisit.findMany({
  //       where: whereClause,
  //       include: {
  //         customer: {
  //           select: { id: true, name: true, phone: true, email: true }
  //         }
  //       },
  //       orderBy: { visitDate: 'desc' }
  //     });

  //     res.json(visits);
  //   } catch (err) {
  //     console.error('Error in getVisitReports:', err);
  //     res.status(500).json({ message: 'Failed to fetch visit reports' });
  //   }
  // },

  getVisitReports: async (req, res) => {
    try {
      const userId = req.user.id;
      const { customerId } = req.query;

      const fieldExec = await prisma.fieldExecutive.findUnique({
        where: { userId }
      });

      if (!fieldExec) {
        return res.status(403).json({ message: 'Not a Field Executive' });
      }

      let whereClause = { executiveId: fieldExec.id };
      if (customerId) whereClause.customerId = customerId;

      const visits = await prisma.customerVisit.findMany({
        where: whereClause,
        include: {
          customer: { select: { id: true, name: true, phone: true, email: true } }
        },
        orderBy: { visitDate: 'desc' }
      });

      res.json(visits);
    } catch (err) {
      console.error('Error in getVisitReports:', err);
      console.log("error");
      res.status(500).json({ message: 'Failed to fetch visit reports' });
    }
  },

// Order Management (similar to distributor)
  getProducts: async (req, res) => {
    try {
      const { categoryId, search } = req.query;
      let whereClause = {};

      if (categoryId) {
        whereClause.categoryId = categoryId;
      }

      if (search) {
        whereClause.name = {
          contains: search,
          mode: 'insensitive'
        };
      }

      const products = await prisma.product.findMany({
        where: whereClause,
        include: {
          category: {
            select: { id: true, name: true }
          }
        },
        orderBy: { name: 'asc' }
      });

      res.json(products);
    } catch (err) {
      console.error('Error in getProducts:', err);
      res.status(500).json({ message: 'Failed to fetch products' });
    }
  },

  getProductById: async (req, res) => {
    try {
      const { id } = req.params;

      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: {
            select: { id: true, name: true }
          }
        }
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json(product);
    } catch (err) {
      console.error('Error in getProductById:', err);
      res.status(500).json({ message: 'Failed to fetch product' });
    }
  },

  checkStock: async (req, res) => {
    try {
      const { productId } = req.params;

      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, stockQuantity: true }
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json({
        productId: product.id,
        productName: product.name,
        stockQuantity: product.stockQuantity,
        inStock: product.stockQuantity > 0
      });
    } catch (err) {
      console.error('Error in checkStock:', err);
      res.status(500).json({ message: 'Failed to check stock' });
    }
  },

  // Cart Management (reuse existing cart controller logic)
  addToCart: async (req, res) => {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    try {
      if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Invalid product ID or quantity' });
      }

      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (product.stockQuantity < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }

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

      const existingItem = cart.items.find(item => item.productId === productId);

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity }
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity
          }
        });
      }

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

  getCart: async (req, res) => {
    const userId = req.user.id;

    try {
      const cart = await prisma.cart.findUnique({
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
        return res.json({ cart: null, total: 0 });
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

  removeFromCart: async (req, res) => {
    const userId = req.user.id;
    const { itemId } = req.params;

    try {
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
  },

  // Place Order
  placeOrder: async (req, res) => {
    const userId = req.user.id;
    const { items, promoCode } = req.body;

    try {
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'No items provided' });
      }

      let promoCodeData = null;
      let discountAmount = 0;

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

        const subtotal = orderItemsData.reduce((sum, item) => {
          const product = products.find(p => p.id === item.productId);
          return sum + (product.price * item.quantity);
        }, 0);

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
                  price: true
                }
              }
            }
          }
        },
        orderBy: {
          orderDate: 'desc'
        }
      });

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
            unitPrice: item.unitPrice
          }))
        };
      });

      res.json(formatted);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
  },

  // Signature Capture
  captureSignature: async (req, res) => {
    try {
      const { signatureData, context } = req.body;
      const userId = req.user.id;

      if (!signatureData) {
        return res.status(400).json({ message: 'Signature data is required' });
      }

      const fieldExec = await prisma.fieldExecutive.findUnique({
        where: { userId }
      });

      if (!fieldExec) {
        return res.status(403).json({ message: 'Not a Field Executive' });
      }

      const signature = await prisma.signature.create({
        data: {
          executiveId: fieldExec.id,
          signatureData: Buffer.from(signatureData, 'base64'),
          context: context || 'General signature'
        }
      });

      res.status(201).json({ 
        message: 'Signature captured successfully', 
        signature: {
          id: signature.id,
          context: signature.context,
          createdAt: signature.createdAt
        }
      });
    } catch (err) {
      console.error('Error in captureSignature:', err);
      res.status(500).json({ message: 'Failed to capture signature' });
    }
  },

  // Offline Data Sync
  syncOfflineData: async (req, res) => {
    try {
      const { offlineData } = req.body;
      const userId = req.user.id;

      if (!offlineData || !Array.isArray(offlineData)) {
        console.log("a");
        return res.status(400).json({ message: 'Offline data array is required' });
      }

      const fieldExec = await prisma.fieldExecutive.findUnique({
        where: { userId }
      });

      if (!fieldExec) {
         console.log("b");
        return res.status(403).json({ message: 'Not a Field Executive' });
      }

      const syncedItems = [];

      for (const item of offlineData) {
        try {
          const { dataType, data } = item;
          
          // Store offline data
          const offlineRecord = await prisma.offlineData.create({
            data: {
              executiveId: fieldExec.id,
              dataType,
              data: JSON.stringify(data),
              synced: true,
              syncedAt: new Date()
            }
          });

          syncedItems.push({
            id: offlineRecord.id,
            dataType,
            syncedAt: offlineRecord.syncedAt
          });
        } catch (itemError) {
          console.error('Error syncing individual item:', itemError);
        }
      }

      res.json({ 
        message: 'Offline data synced successfully', 
        syncedItems,
        totalSynced: syncedItems.length
      });
    } catch (err) {
      console.error('Error in syncOfflineData:', err);
      res.status(500).json({ message: 'Failed to sync offline data' });
    }
  },

  getOfflineData: async (req, res) => {
    try {
      const userId = req.user.id;
      const { synced } = req.query;

      const fieldExec = await prisma.fieldExecutive.findUnique({
        where: { userId }
      });

      if (!fieldExec) {
         console.log("c");
        return res.status(403).json({ message: 'Not a Field Executive' });
      }

      let whereClause = { executiveId: fieldExec.id };
      if (synced !== undefined) {
        whereClause.synced = synced === 'true';
      }

      const offlineData = await prisma.offlineData.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      });

      res.json(offlineData);
    } catch (err) {
      console.error('Error in getOfflineData:', err);
      res.status(500).json({ message: 'Failed to fetch offline data' });
    }
  },

  // Notifications (reuse existing notification logic)
  getMyNotifications: async (req, res) => {
    try {
      const userId = req.user.id;
      const { unreadOnly } = req.query;

      let whereClause = { userId };
      if (unreadOnly === 'true') {
        whereClause.isRead = false;
      }

      const notifications = await prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      });

      res.json(notifications);
    } catch (err) {
      console.error('Error in getMyNotifications:', err);
      res.status(500).json({ message: 'Failed to fetch notifications' });
    }
  },

  markNotificationAsRead: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await prisma.notification.updateMany({
        where: { id, userId },
        data: { isRead: true }
      });

      if (notification.count === 0) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      res.json({ message: 'Notification marked as read' });
    } catch (err) {
      console.error('Error in markNotificationAsRead:', err);
      res.status(500).json({ message: 'Failed to mark notification as read' });
    }
  },

  markAllNotificationsAsRead: async (req, res) => {
    try {
      const userId = req.user.id;

      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      });

      res.json({ message: 'All notifications marked as read' });
    } catch (err) {
      console.error('Error in markAllNotificationsAsRead:', err);
      res.status(500).json({ message: 'Failed to mark all notifications as read' });
    }
  }
};

module.exports = salesExecutiveController;
