import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function cleanupWhatsAppSessions() {
    try {
        console.log('🔍 Checking WhatsApp sessions...');

        // Get all sessions
        const allSessions = await prisma.whatsAppSession.findMany({
            orderBy: { createdAt: 'asc' }
        });

        console.log(`📊 Found ${allSessions.length} WhatsApp sessions`);

        if (allSessions.length === 0) {
            console.log('✅ No sessions found, nothing to cleanup');
            return;
        }

        if (allSessions.length === 1) {
            // Ensure the single session is set as default and active
            const session = allSessions[0];
            if (!session.isDefault || !session.isActive) {
                console.log('🔧 Updating single session to be default and active...');
                await prisma.whatsAppSession.update({
                    where: { id: session.id },
                    data: {
                        isDefault: true,
                        isActive: true
                    }
                });
                console.log('✅ Single session updated');
            } else {
                console.log('✅ Single session is already properly configured');
            }
            return;
        }

        // Multiple sessions found - keep only the first one (oldest)
        console.log('⚠️  Multiple sessions found, cleaning up...');

        const sessionToKeep = allSessions[0];
        const sessionsToDelete = allSessions.slice(1);

        console.log(`🔄 Keeping session: "${sessionToKeep.name}" (${sessionToKeep.sessionId})`);
        console.log(`🗑️  Deleting ${sessionsToDelete.length} other sessions:`);

        for (const session of sessionsToDelete) {
            console.log(`   - "${session.name}" (${session.sessionId})`);
        }

        // Delete extra sessions
        await prisma.whatsAppSession.deleteMany({
            where: {
                id: {
                    in: sessionsToDelete.map(s => s.id)
                }
            }
        });

        // Ensure the remaining session is default and active
        await prisma.whatsAppSession.update({
            where: { id: sessionToKeep.id },
            data: {
                isDefault: true,
                isActive: true
            }
        });

        console.log('✅ Cleanup completed successfully');
        console.log(`📱 Active session: "${sessionToKeep.name}" (${sessionToKeep.phoneNumber})`);

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
    cleanupWhatsAppSessions()
        .then(() => {
            console.log('🎉 WhatsApp sessions cleanup completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Cleanup failed:', error);
            process.exit(1);
        });
}

export { cleanupWhatsAppSessions };
