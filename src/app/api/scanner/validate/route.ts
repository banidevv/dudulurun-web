import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

export async function POST(request: Request) {
  const prisma = getPrismaClient();
  
  try {
    const { ticketData } = await request.json();

    if (!ticketData || !ticketData.id) {
      return NextResponse.json(
        { error: 'Invalid ticket data' },
        { status: 400 }
      );
    }

    const registration = await prisma.registration.findUnique({
      where: { id: ticketData.id },
      include: {
        payment: true,
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    if (registration.payment?.status !== 'paid') {
      return NextResponse.json(
        { error: 'Ticket payment not completed' },
        { status: 400 }
      );
    }

    // Prepare package details
    const packageDetails = {
      type: registration.packageType || 'N/A',
      shirtSize: registration.shirtSize || 'N/A',
      familyDetails: registration.familyPackageData || null
    };

    // Check if ticket has been used
    if (registration.ticketUsed) {
      return NextResponse.json({
        success: false,
        message: 'This ticket has already been used',
        data: {
          name: registration.name,
          category: registration.category,
          packageDetails,
          ticketUsed: true,
        },
      });
    }

    // Mark ticket as used
    await prisma.registration.update({
      where: { id: registration.id },
      data: { ticketUsed: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Ticket validated successfully',
      data: {
        name: registration.name,
        category: registration.category,
        packageDetails,
        ticketUsed: false,
      },
    });
  } catch (error) {
    console.error('Ticket validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 