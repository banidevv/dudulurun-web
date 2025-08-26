import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

// GET - List all referral codes
export async function GET(request: Request) {
    const prisma = getPrismaClient();

    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';

        const skip = (page - 1) * limit;

        const where = search
            ? {
                OR: [
                    { code: { contains: search } },
                    { name: { contains: search } },
                    { description: { contains: search } },
                ],
            }
            : {};

        const [referralCodes, total] = await Promise.all([
            prisma.referralCode.findMany({
                where,
                include: {
                    _count: {
                        select: {
                            registrations: true,
                            usages: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.referralCode.count({ where }),
        ]);

        return NextResponse.json({
            referralCodes,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });

    } catch (error) {
        console.error('Error fetching referral codes:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan saat mengambil data kode referral' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// POST - Create new referral code
export async function POST(request: Request) {
    const prisma = getPrismaClient();

    try {
        const body = await request.json();
        const {
            code,
            name,
            description,
            maxClaims,
            isActive,
            validFrom,
            validUntil,
        } = body;

        // Validation
        if (!code || !name || !maxClaims) {
            return NextResponse.json(
                { error: 'Kode, nama, dan maksimal klaim wajib diisi' },
                { status: 400 }
            );
        }

        if (maxClaims < 1) {
            return NextResponse.json(
                { error: 'Maksimal klaim harus minimal 1' },
                { status: 400 }
            );
        }



        // Check if code already exists
        const existingCode = await prisma.referralCode.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (existingCode) {
            return NextResponse.json(
                { error: 'Kode referral sudah ada' },
                { status: 400 }
            );
        }

        const referralCode = await prisma.referralCode.create({
            data: {
                code: code.toUpperCase(),
                name,
                description,
                maxClaims: parseInt(maxClaims),
                isActive: isActive !== false,
                validFrom: validFrom ? new Date(validFrom) : null,
                validUntil: validUntil ? new Date(validUntil) : null,
            },
        });

        return NextResponse.json(referralCode, { status: 201 });

    } catch (error) {
        console.error('Error creating referral code:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan saat membuat kode referral' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
