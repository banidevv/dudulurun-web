import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

export async function GET(request: Request) {
  const prisma = getPrismaClient();
  const { searchParams } = new URL(request.url);

  try {
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      AND: [
        search ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
          ],
        } : {},
        category ? { category } : {},
        status ? { payment: { status } } : {},
      ],
    };

    // Get total count for pagination
    const total = await prisma.registration.count({ where });

    // Get registrations with payment info
    const registrations = await prisma.registration.findMany({
      where,
      include: {
        payment: {
          select: {
            status: true,
            amount: true,
            merchantRef: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      registrations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request) {
  const prisma = getPrismaClient();

  try {
    const body = await request.json();
    const { id, name, email, phone, category, packageType, shirtSize, familyPackageData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 }
      );
    }

    // Check if registration exists
    const existingRegistration = await prisma.registration.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingRegistration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      phone,
      category,
      packageType,
      shirtSize,
    };

    // Add family package data if provided
    if (familyPackageData) {
      updateData.familyPackageData = familyPackageData;
    }

    // Update registration
    const updatedRegistration = await prisma.registration.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        payment: {
          select: {
            status: true,
            amount: true,
            merchantRef: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Registration updated successfully',
      registration: updatedRegistration,
    });
  } catch (error) {
    console.error('Failed to update registration:', error);
    return NextResponse.json(
      { error: 'Failed to update registration' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: Request) {
  const prisma = getPrismaClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    if (!id) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 }
      );
    }

    // Check if registration exists
    const existingRegistration = await prisma.registration.findUnique({
      where: { id: parseInt(id) },
      include: { payment: true }
    });

    if (!existingRegistration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Delete associated payment first (if exists)
    if (existingRegistration.payment) {
      await prisma.payment.delete({
        where: { registrationId: parseInt(id) }
      });
    }

    // Delete registration
    await prisma.registration.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      message: 'Registration deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete registration:', error);
    return NextResponse.json(
      { error: 'Failed to delete registration' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 