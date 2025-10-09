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

        // Get all existing race IDs for this category
        const existingRaces = await prisma.race.findMany({
            select: { id: true },
            where: {
                registration: {
                    category: registration.category,
                },
            },
        });

        const existingIds = new Set(existingRaces.map(race => race.id));
        let raceId = 0;

        if (registration.category === 'fun') {
            // Check range 1-300 first
            for (let id = 1; id <= 300; id++) {
                if (!existingIds.has(id)) {
                    raceId = id;
                    break;
                }
            }
            // If no ID found in 1-300, check range 377-428
            if (raceId === 0) {
                for (let id = 377; id <= 428; id++) {
                    if (!existingIds.has(id)) {
                        raceId = id;
                        break;
                    }
                }
            }
        } else if (registration.category === 'family') {
            // Check range 301-376
            for (let id = 301; id <= 376; id++) {
                if (!existingIds.has(id)) {
                    raceId = id;
                    break;
                }
            }
        }


        if (raceId === 0) {
            return NextResponse.json(
                { error: 'No available id for this category' },
                { status: 400 }
            );
        }

        if (!registration.race) {
            return NextResponse.json({
                data: {
                    checkedType: 'racePack',
                    registration: registration,
                    race: {
                        id: raceId,
                        racePackPhotoUrl: null,
                        checkedIn: false,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                }
            });
        }

        return NextResponse.json({
            data: {
                checkedType: 'checkIn',
                registration: registration,
                race: registration.race,
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