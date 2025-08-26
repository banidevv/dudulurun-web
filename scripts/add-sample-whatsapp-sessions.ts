import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function addSampleSessions() {
    try {
        console.log('Adding sample WhatsApp sessions for wa-multi-session...');

        // Create default session
        const defaultSession = await prisma.whatsAppSession.create({
            data: {
                name: 'Customer Support',
                sessionId: 'customer_support',
                phoneNumber: '+6285117132297',
                isActive: true,
                isDefault: true,
                description: 'Main customer support WhatsApp session for handling general inquiries'
            }
        });

        console.log('Created default session:', defaultSession.name);

        // Create additional sessions
        const marketingSession = await prisma.whatsAppSession.create({
            data: {
                name: 'Marketing',
                sessionId: 'marketing',
                phoneNumber: '+6285117132298',
                isActive: true,
                isDefault: false,
                description: 'Marketing WhatsApp session for promotional messages and campaigns'
            }
        });

        console.log('Created marketing session:', marketingSession.name);

        const registrationSession = await prisma.whatsAppSession.create({
            data: {
                name: 'Registration',
                sessionId: 'registration',
                phoneNumber: '+6285117132299',
                isActive: true,
                isDefault: false,
                description: 'Dedicated WhatsApp session for registration confirmations and updates'
            }
        });

        console.log('Created registration session:', registrationSession.name);

        console.log('✅ Sample WhatsApp sessions added successfully!');
        console.log('\nNext steps:');
        console.log('1. Start each session by calling startWhatsAppSession() with the sessionId');
        console.log('2. Scan the QR code for each session to connect to WhatsApp');
        console.log('3. Sessions will be saved and auto-loaded on subsequent starts');
        console.log('\nSession IDs created:');
        console.log('- customer_support (default)');
        console.log('- marketing');
        console.log('- registration');

    } catch (error) {
        console.error('Error adding sample sessions:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
addSampleSessions().catch(console.error);
