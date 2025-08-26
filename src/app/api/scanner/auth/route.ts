import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

export async function POST(request: Request) {
  const prisma = getPrismaClient();
  
  try {
    const { secretCode } = await request.json();

    if (!secretCode) {
      return NextResponse.json(
        { error: 'Secret code is required' },
        { status: 400 }
      );
    }

    const scannerAccess = await prisma.scannerAccess.findUnique({
      where: { secretCode },
    });

    if (!scannerAccess) {
      return NextResponse.json(
        { error: 'Invalid secret code' },
        { status: 401 }
      );
    }

    // Update last used timestamp
    await prisma.scannerAccess.update({
      where: { id: scannerAccess.id },
      data: { lastUsedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Scanner authentication error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 