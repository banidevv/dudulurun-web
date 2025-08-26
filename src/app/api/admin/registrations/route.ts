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