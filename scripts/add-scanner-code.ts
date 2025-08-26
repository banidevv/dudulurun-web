const { PrismaClient } = require('../src/generated/prisma');

async function addScannerCode() {
  const prisma = new PrismaClient();
  
  try {
    // Generate a random 8-character code
    const secretCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    const scannerAccess = await prisma.scannerAccess.create({
      data: {
        secretCode,
      },
    });

    console.log('Successfully created scanner access code:', secretCode);
    console.log('Please save this code securely as it will be needed to access the scanner.');
  } catch (error) {
    console.error('Error creating scanner access code:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addScannerCode(); 