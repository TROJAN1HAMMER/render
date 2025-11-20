const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Deleting all products...");

  // Delete children first
  await prisma.orderItem.deleteMany({});
  await prisma.warrantyCard.deleteMany({});
  await prisma.stock.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.registerWarranty.deleteMany({});

  // Now delete products
  await prisma.product.deleteMany({});

  console.log("✅ All products deleted successfully");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
