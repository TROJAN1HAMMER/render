/**
 * Migration script for Company schema changes
 * This script helps migrate existing admin records to support company switching
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateCompanySchema() {
  try {
    console.log('Starting Company schema migration...');

    // 1. Create a default company if none exists
    const existingCompanies = await prisma.company.findMany();
    let defaultCompany;

    if (existingCompanies.length === 0) {
      console.log('Creating default company...');
      defaultCompany = await prisma.company.create({
        data: {
          name: 'Default Company',
          description: 'Default company for existing admins',
          isActive: true
        }
      });
      console.log(`Created default company: ${defaultCompany.id}`);
    } else {
      defaultCompany = existingCompanies[0];
      console.log(`Using existing company: ${defaultCompany.id}`);
    }

    // 2. Update existing admins to be assigned to the default company
    const adminsWithoutCompany = await prisma.admin.findMany({
      where: { companyId: null }
    });

    if (adminsWithoutCompany.length > 0) {
      console.log(`Found ${adminsWithoutCompany.length} admins without company assignment`);
      
      await prisma.admin.updateMany({
        where: { companyId: null },
        data: { companyId: defaultCompany.id }
      });
      
      console.log('Assigned all admins to default company');
    } else {
      console.log('All admins already have company assignments');
    }

    // 3. Verify migration
    const totalAdmins = await prisma.admin.count();
    const adminsWithCompany = await prisma.admin.count({
      where: { companyId: { not: null } }
    });

    console.log(`Migration completed successfully!`);
    console.log(`Total admins: ${totalAdmins}`);
    console.log(`Admins with company: ${adminsWithCompany}`);
    console.log(`Admins without company: ${totalAdmins - adminsWithCompany}`);

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateCompanySchema()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateCompanySchema;
