import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { getPrismaClient } from '@/lib/prisma';
import { getSessionQRCode, getDetailedSessionStatus, isSessionConnected } from '@/lib/whatsapp';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Verify admin authentication
async function verifyAdmin(request: Request) {
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token');

    if (!token) {
        return null;
    }

    try {
        const decoded = verify(token.value, JWT_SECRET) as { adminId: number };
        return decoded;
    } catch (error) {
        return null;
    }
}

// GET - Get all WhatsApp sessions with connection status
export async function GET(request: Request) {
    const admin = await verifyAdmin(request);

    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const getQRCode = searchParams.get('qrcode') === 'true';

    // If requesting QR code for specific session
    if (sessionId && getQRCode) {
        try {
            const connected = isSessionConnected(sessionId);

            if (connected) {
                return NextResponse.json({
                    sessionId,
                    qrCode: null,
                    connected: true,
                    hasQRCode: false,
                    message: 'Session sudah terhubung'
                });
            }

            console.log(`Generating QR code for session: ${sessionId}`);

            // Try to get QR code with retry mechanism
            let qrCode = null;
            let retryCount = 0;
            const maxRetries = 2;

            while (!qrCode && retryCount <= maxRetries) {
                if (retryCount > 0) {
                    console.log(`Retrying QR code generation for session ${sessionId}, attempt ${retryCount + 1}/${maxRetries + 1}`);
                    // Wait a bit before retry
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

                qrCode = await getSessionQRCode(sessionId);

                // Check if session got connected during QR generation
                if (isSessionConnected(sessionId)) {
                    return NextResponse.json({
                        sessionId,
                        qrCode: null,
                        connected: true,
                        hasQRCode: false,
                        message: 'Session berhasil terhubung selama proses pembuatan QR code'
                    });
                }

                retryCount++;
            }

            console.log("qrCode result:", qrCode ? 'Generated successfully' : 'Failed to generate');

            return NextResponse.json({
                sessionId,
                qrCode,
                connected: false,
                hasQRCode: !!qrCode,
                message: qrCode
                    ? 'QR code berhasil dibuat'
                    : 'QR code tidak dapat dibuat. Pastikan WhatsApp session dapat diakses dan coba lagi.'
            });
        } catch (error) {
            console.error('Error getting session QR code:', error);
            return NextResponse.json(
                { error: 'Gagal mendapatkan QR code session. Silakan coba lagi.' },
                { status: 500 }
            );
        }
    }

    const prisma = getPrismaClient();

    try {
        const sessions = await prisma.whatsAppSession.findMany({
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'asc' }
            ]
        });

        // Add connection status to each session
        const sessionsWithStatus = await Promise.all(
            sessions.map(async (session) => {
                const connected = isSessionConnected(session.sessionId);
                return {
                    ...session,
                    connected
                };
            })
        );

        return NextResponse.json({ sessions: sessionsWithStatus });
    } catch (error) {
        console.error('Error fetching WhatsApp sessions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch WhatsApp sessions' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// POST - Create new WhatsApp session
export async function POST(request: Request) {
    const admin = await verifyAdmin(request);

    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrismaClient();

    try {
        const body = await request.json();
        const { name, sessionId, phoneNumber, isActive, isDefault, description } = body;

        // Validate required fields
        if (!name || !sessionId || !phoneNumber) {
            return NextResponse.json(
                { error: 'Name, session ID, and phone number are required' },
                { status: 400 }
            );
        }

        // Check if there's already an existing session (limit to 1)
        const existingSessions = await prisma.whatsAppSession.findMany();
        if (existingSessions.length > 0) {
            return NextResponse.json(
                { error: 'Hanya 1 WhatsApp session yang diizinkan. Hapus session yang ada terlebih dahulu.' },
                { status: 400 }
            );
        }

        // Validate sessionId format (only lowercase, numbers, underscores)
        if (!/^[a-z0-9_]+$/.test(sessionId)) {
            return NextResponse.json(
                { error: 'Session ID must contain only lowercase letters, numbers, and underscores' },
                { status: 400 }
            );
        }

        // Always set as default and active since we only allow one session
        // Unset any existing default sessions (just in case)
        await prisma.whatsAppSession.updateMany({
            where: { isDefault: true },
            data: { isDefault: false }
        });

        const session = await prisma.whatsAppSession.create({
            data: {
                name,
                sessionId,
                phoneNumber,
                isActive: true, // Always active for single session
                isDefault: true, // Always default for single session
                description
            }
        });

        return NextResponse.json({ session });
    } catch (error: any) {
        console.error('Error creating WhatsApp session:', error);

        if (error.code === 'P2002') {
            const target = error.meta?.target;
            if (target?.includes('sessionId')) {
                return NextResponse.json(
                    { error: 'Session ID already exists' },
                    { status: 400 }
                );
            } else {
                return NextResponse.json(
                    { error: 'Session name already exists' },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Failed to create WhatsApp session' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// PUT - Update WhatsApp session
export async function PUT(request: Request) {
    const admin = await verifyAdmin(request);

    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrismaClient();

    try {
        const body = await request.json();
        const { id, name, sessionId, phoneNumber, isActive, isDefault, description } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            );
        }

        // Validate sessionId format if provided
        if (sessionId && !/^[a-z0-9_]+$/.test(sessionId)) {
            return NextResponse.json(
                { error: 'Session ID must contain only lowercase letters, numbers, and underscores' },
                { status: 400 }
            );
        }

        // Always set as default since we only allow one session
        // Unset any existing default sessions (just in case)
        await prisma.whatsAppSession.updateMany({
            where: {
                isDefault: true,
                id: { not: id }
            },
            data: { isDefault: false }
        });

        const session = await prisma.whatsAppSession.update({
            where: { id },
            data: {
                name,
                sessionId,
                phoneNumber,
                isActive: isActive !== undefined ? isActive : true,
                isDefault: true, // Always default for single session
                description
            }
        });

        return NextResponse.json({ session });
    } catch (error: any) {
        console.error('Error updating WhatsApp session:', error);

        if (error.code === 'P2002') {
            const target = error.meta?.target;
            if (target?.includes('sessionId')) {
                return NextResponse.json(
                    { error: 'Session ID already exists' },
                    { status: 400 }
                );
            } else {
                return NextResponse.json(
                    { error: 'Session name already exists' },
                    { status: 400 }
                );
            }
        }

        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update WhatsApp session' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// DELETE - Delete WhatsApp session
export async function DELETE(request: Request) {
    const admin = await verifyAdmin(request);

    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrismaClient();

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Session ID diperlukan' },
                { status: 400 }
            );
        }

        // Check if session exists
        const session = await prisma.whatsAppSession.findUnique({
            where: { id: parseInt(id) }
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Session tidak ditemukan' },
                { status: 404 }
            );
        }

        // Since we only allow one session, deleting it is allowed
        // but warn user about consequences

        await prisma.whatsAppSession.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ message: 'Session berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting WhatsApp session:', error);
        return NextResponse.json(
            { error: 'Gagal menghapus WhatsApp session' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
