import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

// GET - Get single referral code
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const prisma = getPrismaClient();

    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return NextResponse.json(
                { error: 'ID tidak valid' },
                { status: 400 }
            );
        }

        const referralCode = await prisma.referralCode.findUnique({
            where: { id },
            include: {
                registrations: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        category: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
                usages: {
                    include: {
                        registration: {
                            select: {
                                name: true,
                                email: true,
                                category: true,
                            },
                        },
                    },
                    orderBy: { usedAt: 'desc' },
                },
                _count: {
                    select: {
                        registrations: true,
                        usages: true,
                    },
                },
            },
        });

        if (!referralCode) {
            return NextResponse.json(
                { error: 'Kode referral tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json(referralCode);

    } catch (error) {
        console.error('Error fetching referral code:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan saat mengambil data kode referral' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// PUT - Update referral code
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const prisma = getPrismaClient();

    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return NextResponse.json(
                { error: 'ID tidak valid' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const {
            code,
            name,
            description,
            maxClaims,
            isActive,
            validFrom,
            validUntil,
            discount,
            discountPercent,
            applicableCategories,
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

        if (discount && discountPercent) {
            return NextResponse.json(
                { error: 'Tidak dapat mengatur diskon tetap dan persentase bersamaan' },
                { status: 400 }
            );
        }

        if (discountPercent && (discountPercent < 0 || discountPercent > 100)) {
            return NextResponse.json(
                { error: 'Persentase diskon harus antara 0-100' },
                { status: 400 }
            );
        }

        // Check if referral code exists
        const existingReferralCode = await prisma.referralCode.findUnique({
            where: { id },
        });

        if (!existingReferralCode) {
            return NextResponse.json(
                { error: 'Kode referral tidak ditemukan' },
                { status: 404 }
            );
        }

        // Check if code already exists for other referral codes
        if (code.toUpperCase() !== existingReferralCode.code) {
            const codeExists = await prisma.referralCode.findUnique({
                where: { code: code.toUpperCase() },
            });

            if (codeExists) {
                return NextResponse.json(
                    { error: 'Kode referral sudah digunakan' },
                    { status: 400 }
                );
            }
        }

        // Don't allow reducing maxClaims below current usedClaims
        if (maxClaims < existingReferralCode.usedClaims) {
            return NextResponse.json(
                { error: `Maksimal klaim tidak dapat dikurangi di bawah ${existingReferralCode.usedClaims} (jumlah yang sudah digunakan)` },
                { status: 400 }
            );
        }

        const updatedReferralCode = await prisma.referralCode.update({
            where: { id },
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

        return NextResponse.json(updatedReferralCode);

    } catch (error) {
        console.error('Error updating referral code:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan saat mengupdate kode referral' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// DELETE - Delete referral code
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const prisma = getPrismaClient();

    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return NextResponse.json(
                { error: 'ID tidak valid' },
                { status: 400 }
            );
        }

        // Check if referral code exists
        const existingReferralCode = await prisma.referralCode.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        registrations: true,
                        usages: true,
                    },
                },
            },
        });

        if (!existingReferralCode) {
            return NextResponse.json(
                { error: 'Kode referral tidak ditemukan' },
                { status: 404 }
            );
        }

        // Check if referral code has been used
        if (existingReferralCode._count.registrations > 0 || existingReferralCode._count.usages > 0) {
            return NextResponse.json(
                { error: 'Tidak dapat menghapus kode referral yang sudah digunakan' },
                { status: 400 }
            );
        }

        await prisma.referralCode.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Kode referral berhasil dihapus' });

    } catch (error) {
        console.error('Error deleting referral code:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan saat menghapus kode referral' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
