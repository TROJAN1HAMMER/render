import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // 1) Ensure demo user exists (email is unique in your schema)
  const user = await prisma.user.upsert({
    where: { email: "demo@company.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@company.com",
      phone: "9999999999",
      password: "hashedpassword", // OK for dev/test
      role: "Accountant",
    },
  });

  // 2) Ensure first product exists (use findFirst/create to avoid requiring a unique constraint on name)
  let productA = await prisma.product.findFirst({ where: { name: "Sample Product" } });
  if (!productA) {
    productA = await prisma.product.create({
      data: {
        name: "Sample Product",
        price: 120.5,
        stockQuantity: 50,
        warrantyPeriodInMonths: 12,
      },
    });
  }

  // 3) Ensure a second product exists (this will be used to create the "one more" invoice)
  let productB = await prisma.product.findFirst({ where: { name: "Sample Product Extra" } });
  if (!productB) {
    productB = await prisma.product.create({
      data: {
        name: "Sample Product Extra",
        price: 249.99,
        stockQuantity: 20,
        warrantyPeriodInMonths: 6,
      },
    });
  }

  // 4) Create a new order (this will be the "new" order that we invoice)
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      status: "Pending",
      orderDate: new Date(),
      orderItems: {
        create: [
          {
            productId: productB.id,
            quantity: 1,
            unitPrice: productB.price,
          },
        ],
      },
    },
  });

  // 5) Create an invoice for that order
  const invoice = await prisma.invoice.create({
    data: {
      orderId: order.id,
      invoiceDate: new Date(),
      totalAmount: productB.price * 1,
      pdfUrl: "https://example.com/invoice-extra.pdf",
      status: "Sent",
      sentAt: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // 6) Create a financial log entry linked to the invoice (createdBy => user.id)
  const financialLog = await prisma.financialLog.create({
    data: {
      type: "Income", // must match your FinancialLogType enum
      amount: invoice.totalAmount,
      description: `Payment recorded for Invoice #${invoice.id}`,
      category: "Sales",
      reference: invoice.id,
      createdBy: user.id,
    },
  });

  console.log("✅ Added invoice + financialLog:", {
    invoiceId: invoice.id,
    invoiceTotal: invoice.totalAmount,
    financialLogId: financialLog.id,
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
