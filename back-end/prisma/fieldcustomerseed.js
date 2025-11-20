// const bcrypt = require('bcrypt');
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// async function main() {
//   // 1) Create Dummy FieldExecutive user + role
//   const passwordHash = await bcrypt.hash('password123', 10);

//   const fieldExecUser = await prisma.user.upsert({
//     where: { email: 'fieldexec.dummy@example.com' },
//     update: {},
//     create: {
//       name: 'Dummy FieldExecutive',
//       email: 'fieldexec.dummy@example.com',
//       phone: '9000000000',
//       password: passwordHash,
//       role: 'FieldExecutive',
//     },
//   });

//   const fieldExecRole = await prisma.fieldExecutive.upsert({
//     where: { userId: fieldExecUser.id },
//     update: {},
//     create: {
//       userId: fieldExecUser.id,
//     },
//   });

//   console.log('✔ Dummy FieldExecutive');
//   console.log('  - userId:', fieldExecUser.id);
//   console.log('  - fieldExecutiveId:', fieldExecRole.id);
//   console.log('  - email: fieldexec.dummy@example.com');
//   console.log('  - password: password123');

//   // 2) Create several Customers assigned to this FieldExecutive
//   const customersToEnsure = [
//     { name: 'Acme Retail', phone: '8888880001', location: 'Central City' },
//     { name: 'Bright Supplies', phone: '8888880002', location: 'North Zone' },
//     { name: 'Coastal Traders', phone: '8888880003', location: 'Harbor Area' },
//   ];

//   const createdCustomers = [];
//   for (const c of customersToEnsure) {
//     let existing = await prisma.customer.findFirst({
//       where: { name: c.name, phone: c.phone },
//     });
//     if (!existing) {
//       existing = await prisma.customer.create({
//         data: {
//           name: c.name,
//           phone: c.phone,
//           location: c.location,
//           assignedTo: fieldExecRole.id,
//         },
//       });
//       console.log('✔ Customer created:', existing.name, 'id:', existing.id);
//     } else {
//       // Ensure assignment
//       if (existing.assignedTo !== fieldExecRole.id) {
//         existing = await prisma.customer.update({
//           where: { id: existing.id },
//           data: { assignedTo: fieldExecRole.id },
//         });
//         console.log('↺ Customer reassigned to dummy FE:', existing.name, 'id:', existing.id);
//       } else {
//         console.log('• Customer already exists:', existing.name, 'id:', existing.id);
//       }
//     }
//     createdCustomers.push(existing);
//   }

//   // 3) Print a short summary with IDs for quick testing
//   console.log('\nTest with these IDs in the app:');
//   console.log('  FieldExecutiveId:', fieldExecRole.id);
//   createdCustomers.forEach((cust, idx) => {
//     console.log(`  Customer ${idx + 1}:`, cust.name, '-> id:', cust.id);
//   });

//   // 4) Optional: create a follow-up for the first customer to validate relations
//   if (createdCustomers.length > 0) {
//     const followUp = await prisma.customerFollowUp.create({
//       data: {
//         executiveId: fieldExecRole.id,
//         customerName: createdCustomers[0].name,
//         contactDetails: createdCustomers[0].phone,
//         feedback: 'Seed: initial contact',
//         status: 'Pending',
//         nextFollowUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//       },
//     });
//     console.log('✔ Sample follow-up created:', followUp.id);
//   }
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // === 1) Create NEW Dummy FieldExecutive user + role ===
  const email = 'fieldexec.dummy2@example.com';
  const rawPassword = 'Exec@2025'; // ✅ Uppercase, lowercase, number, special char, 8 chars
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  const fieldExecUser = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: 'Dummy FieldExecutive 2',
      email,
      phone: '9111111111',
      password: passwordHash,
      role: 'FieldExecutive',
    },
  });

  const fieldExecRole = await prisma.fieldExecutive.upsert({
    where: { userId: fieldExecUser.id },
    update: {},
    create: {
      userId: fieldExecUser.id,
    },
  });

  console.log('✅ New Dummy FieldExecutive Created');
  console.log('---------------------------------');
  console.log('Name: Dummy FieldExecutive 2');
  console.log('Email:', email);
  console.log('Password:', rawPassword);
  console.log('User ID:', fieldExecUser.id);
  console.log('FieldExecutive ID:', fieldExecRole.id);

  // === 2) Create or ensure linked Customers ===
  const customersToEnsure = [
    { name: 'Summit Stores', phone: '8999991001', location: 'East End' },
    { name: 'Vertex Traders', phone: '8999991002', location: 'West Point' },
    { name: 'Harbor Mart', phone: '8999991003', location: 'Seaside Road' },
  ];

  const createdCustomers = [];

  for (const c of customersToAdd) {
    let existing = await prisma.customer.findFirst({
      where: { name: c.name, phone: c.phone },
    });

    if (!existing) {
      existing = await prisma.customer.create({
        data: {
          name: c.name,
          phone: c.phone,
          location: c.location,
          assignedTo: fieldExecId,
        },
      });
      console.log('✔ Customer created:', existing.name, '→ id:', existing.id);
    } else {
      if (existing.assignedTo !== fieldExecRole.id) {
        existing = await prisma.customer.update({
          where: { id: existing.id },
          data: { assignedTo: fieldExecId },
        });
        console.log('↺ Customer reassigned:', existing.name, '→ id:', existing.id);
      } else {
        console.log('• Customer already linked:', existing.name, '→ id:', existing.id);
      }
    }

    createdCustomers.push(existing);
  }

  // === 3) Optional: Create one follow-up entry ===
  if (createdCustomers.length > 0) {
    const followUp = await prisma.customerFollowUp.create({
      data: {
        executiveId: fieldExecRole.id,
        customerName: createdCustomers[0].name,
        contactDetails: createdCustomers[0].phone,
        feedback: 'Follow-up initiated by seed script',
        status: 'Pending',
        nextFollowUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // +3 days
      },
    });
    console.log('✔ Follow-up created:', followUp.id);
  }

  // === 4) Summary ===
  console.log('\n🔎 Use these credentials to log in:');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${rawPassword}`);
  console.log('---------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error in seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
