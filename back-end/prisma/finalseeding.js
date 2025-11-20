// prisma/finalseeding.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding related data for existing users...");

  const users = await prisma.user.findMany();

  if (!users.length) {
    console.log("❌ No users found in the database. Seed users first.");
    return;
  }

  for (const user of users) {
    console.log(`👤 Seeding data for user: ${user.email}`);

    try {
      // -----------------------
      // 1️⃣ CATEGORY
      // -----------------------
      const category = await prisma.category.create({
        data: {
          name: "Pipes & Fittings",
          description: "All kinds of PVC and CPVC fittings",
          userId: user.id,
        },
      });

      console.log("📦 Category created:", category.name);

      // -----------------------
      // 2️⃣ PRODUCTS
      // -----------------------
      const products = await prisma.product.createMany({
        data: [
          {
            name: "PVC Pipe 2 inch",
            price: 250,
            stock: 100,
            categoryId: category.id,
            userId: user.id,
          },
          {
            name: "CPVC Elbow Joint",
            price: 120,
            stock: 200,
            categoryId: category.id,
            userId: user.id,
          },
        ],
        skipDuplicates: true,
      });

      console.log("🧰 Products and category added");

      // -----------------------
      // 3️⃣ FINANCIAL LOG
      // -----------------------
      await prisma.financialLog.create({
        data: {
          amount: 5000,
          type: "Credit",
          description: "Initial system setup credit",
          userId: user.id,
        },
      });

      console.log("💰 Financial log added");

      // -----------------------
      // 4️⃣ NOTIFICATION
      // -----------------------
      await prisma.notification.create({
        data: {
          type: "Info",
          message: "Welcome to AquaTech system setup!",
          userId: user.id,
        },
      });

      console.log("🔔 Notification added");

      // -----------------------
      // 5️⃣ INVENTORY LOG
      // -----------------------
      await prisma.inventoryLog.create({
        data: {
          productName: "PVC Pipe 2 inch",
          quantity: 50,
          action: "Added",
          userId: user.id,
        },
      });

      console.log("📦 Inventory log added");

    } catch (error) {
      console.error("❌ Error while seeding for user:", user.email, "\n", error);
    }
  }

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
