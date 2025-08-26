import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

export async function GET(request: Request) {
  const prisma = getPrismaClient();
  
  try {
    // Get total registrations
    const totalRegistrations = await prisma.registration.count();

    // Get registrations by category
    const registrationsByCategory = await prisma.registration.groupBy({
      by: ['category'],
      _count: true,
    });

    // Get payment status distribution
    const paymentStatusDistribution = await prisma.payment.groupBy({
      by: ['status'],
      _count: true,
    });

    // Get total revenue (sum of paid payments)
    const revenue = await prisma.payment.aggregate({
      where: {
        status: 'paid'
      },
      _sum: {
        amount: true
      }
    });

    // Get pending payments count
    const pendingPayments = await prisma.payment.count({
      where: {
        status: 'pending'
      }
    });

    // Get registration trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const registrationTrend = await prisma.registration.groupBy({
      by: ['createdAt'],
      _count: true,
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json({
      totalRegistrations,
      registrationsByCategory: registrationsByCategory.map(item => ({
        category: item.category,
        count: item._count
      })),
      paymentStatusDistribution: paymentStatusDistribution.map(item => ({
        status: item.status,
        count: item._count
      })),
      totalRevenue: revenue._sum.amount || 0,
      pendingPayments,
      registrationTrend: registrationTrend.map(item => ({
        date: item.createdAt,
        count: item._count
      }))
    });
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 