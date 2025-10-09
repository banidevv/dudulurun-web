import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const prisma = getPrismaClient();

    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';
        const checkedIn = searchParams.get('checkedIn') || '';
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};

        // Search filter
        if (search) {
            where.registration = {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                ],
            };
        }

        // Category filter
        if (category) {
            where.registration = {
                ...where.registration,
                category: category,
            };
        }

        // Check-in status filter
        if (checkedIn !== '') {
            where.checkedIn = checkedIn === 'true';
        }

        // Build orderBy clause
        let orderBy: any = {};
        if (sortBy.includes('registration.')) {
            const field = sortBy.replace('registration.', '');
            orderBy = {
                registration: {
                    [field]: sortOrder,
                },
            };
        } else {
            orderBy = {
                [sortBy]: sortOrder,
            };
        }

        // Get total count
        const total = await prisma.race.count({ where });

        // Get races with pagination
        const races = await prisma.race.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            include: {
                registration: {
                    include: {
                        payment: true,
                    },
                },
            },
        });

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            races,
            pagination: {
                total,
                page,
                limit,
                totalPages,
            },
        });
    } catch (error) {
        console.error('Error fetching race data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch race data' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    const prisma = getPrismaClient();
    try {
        const body = await request.json();
        const { id, raceId, racePackPhotoUrl, checkedIn } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Race ID is required' },
                { status: 400 }
            );
        }

        const updateData: any = {};
        if (racePackPhotoUrl !== undefined) updateData.racePackPhotoUrl = racePackPhotoUrl;
        if (checkedIn !== undefined) updateData.checkedIn = checkedIn;

        // Handle raceId update - this requires special handling since it's the primary key
        if (raceId !== undefined && raceId !== parseInt(id)) {
            // Check if the new raceId already exists
            const existingRace = await prisma.race.findUnique({
                where: { id: raceId }
            });

            if (existingRace) {
                return NextResponse.json(
                    { error: 'Race ID already exists' },
                    { status: 400 }
                );
            }

            // For raceId updates, we need to delete the old record and create a new one
            // since we can't update the primary key directly
            const currentRace = await prisma.race.findUnique({
                where: { id: parseInt(id) },
                include: {
                    registration: true
                }
            });

            if (!currentRace) {
                return NextResponse.json(
                    { error: 'Race not found' },
                    { status: 404 }
                );
            }

            // Delete the old race record
            await prisma.race.delete({
                where: { id: parseInt(id) }
            });

            // Create a new race record with the new ID
            const newRace = await prisma.race.create({
                data: {
                    id: raceId,
                    racePackPhotoUrl: racePackPhotoUrl !== undefined ? racePackPhotoUrl : currentRace.racePackPhotoUrl,
                    checkedIn: checkedIn !== undefined ? checkedIn : currentRace.checkedIn,
                    registrationId: currentRace.registrationId,
                },
                include: {
                    registration: {
                        include: {
                            payment: true,
                        },
                    },
                },
            });

            return NextResponse.json(newRace);
        }

        // Regular update for non-ID fields
        const updatedRace = await prisma.race.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                registration: {
                    include: {
                        payment: true,
                    },
                },
            },
        });

        return NextResponse.json(updatedRace);
    } catch (error) {
        console.error('Error updating race data:', error);
        return NextResponse.json(
            { error: 'Failed to update race data' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    const prisma = getPrismaClient();
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Race ID is required' },
                { status: 400 }
            );
        }

        await prisma.race.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting race data:', error);
        return NextResponse.json(
            { error: 'Failed to delete race data' },
            { status: 500 }
        );
    }
}
