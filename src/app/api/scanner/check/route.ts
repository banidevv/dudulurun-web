import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

export async function POST(request: Request) {
    const prisma = getPrismaClient();

    try {
        const { ticketId } = await request.json();

        if (!ticketId) {
            return NextResponse.json(
                { error: 'Registration ID is required' },
                { status: 400 }
            );
        }

        const registration = await prisma.registration.findUnique({
            where: { id: ticketId },
            include: {
                race: true,
            },
        });

        if (!registration) {
            return NextResponse.json(
                { error: 'Registration not found' },
                { status: 404 }
            );
        }

        if (!registration.race) {
            return NextResponse.json({
                data : {
                    checkedType : 'racePack',
                    registration : registration,
                    race : null,
                }
            });
        }

        return NextResponse.json({
            data : {
                checkedType : 'checkIn',
                registration : registration,
                race : registration.race,
            }
        });

    } catch (error) {
        console.error('Race check error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}