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

        const lastRace = await prisma.race.findFirst({
            orderBy: { id: 'desc' },
            select: { id: true },
            where: {
                registration: {
                    category: registration.category,
                },
            },
        });

        const lastRaceId = lastRace ? lastRace.id : null;
        var raceId = 0;


        if (lastRaceId) {
            if (registration.category === 'fun') {
                if (lastRaceId >= 1 && lastRaceId <= 300 || lastRaceId >= 377 && lastRaceId <= 428) {
                    raceId = lastRaceId + 1;
                }
            } else if (registration.category === 'family') {
                if (lastRaceId >= 377 && lastRaceId <= 428) {
                    raceId = lastRaceId + 1;
                }
            }
        } else {
            if (registration.category === 'fun') {
                raceId = 1;
            } else if (registration.category === 'family') {
                raceId = 377;
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