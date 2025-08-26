import { NextResponse } from 'next/server';
import { getPaymentMethods } from '@/lib/tripay';

// Prevent static optimization for this route
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const amount = parseInt(searchParams.get('amount') || '0', 10);

    if (!amount) {
      return NextResponse.json(
        { error: 'Amount is required' },
        { status: 400 }
      );
    }

    const paymentMethods = await getPaymentMethods(amount);
    return NextResponse.json({ data: paymentMethods });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
} 