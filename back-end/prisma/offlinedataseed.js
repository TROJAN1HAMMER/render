// prisma/seedOfflineData.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedOfflineData() {
  try {
    // Step 1: Find the FieldExecutive ID for this user
    const fieldExec = await prisma.fieldExecutive.findUnique({
      where: { userId: "6890aec47022ccdc50802f0d" },
    });

    if (!fieldExec) {
      console.error("No FieldExecutive found for this userId");
      return;
    }

    const executiveId = fieldExec.id;

    // Step 2: Add sample offline data
    const offlineDataEntries = [
      {
        executiveId,
        dataType: "order",
        data: JSON.stringify({
          orderId: "ORD123",
          items: [
            { product: "Product A", quantity: 2 },
            { product: "Product B", quantity: 1 },
          ],
        }),
        synced: false,
      },
      {
        executiveId,
        dataType: "visit",
        data: JSON.stringify({
          customer: "John Doe",
          contact: "9876543210",
          notes: "Sample visit notes",
        }),
        synced: false,
      },
      {
        executiveId,
        dataType: "image",
        data: JSON.stringify({
          imageUrl: "https://example.com/sample.jpg",
          description: "Sample captured image",
        }),
        synced: false,
      },
    ];

    await prisma.offlineData.createMany({
      data: offlineDataEntries,
    });

    console.log("✅ Seeded OfflineData successfully!");
  } catch (err) {
    console.error("Error seeding OfflineData:", err);
  } finally {
    await prisma.$disconnect();
  }
}

seedOfflineData();
