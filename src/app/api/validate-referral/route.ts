import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

export async function POST(request: Request) {
    const prisma = getPrismaClient();

    try {
        const body = await request.json();
        const { code, category } = body;

        if (!code) {
            return NextResponse.json(
                { error: 'Kode referral wajib diisi' },
                { status: 400 }
            );
        }

        // Find the referral code
        const referralCode = await prisma.referralCode.findUnique({
            where: { code: code.toUpperCase() },
            include: {
                usages: true,
            },
        });

        if (!referralCode) {
            return NextResponse.json(
                { error: 'Kode referral tidak ditemukan' },
                { status: 404 }
            );
        }

        // Check if code is active
        if (!referralCode.isActive) {
            return NextResponse.json(
                { error: 'Kode referral tidak aktif' },
                { status: 400 }
            );
        }

        // Check validity dates
        const now = new Date();
        if (referralCode.validFrom && now < referralCode.validFrom) {
            return NextResponse.json(
                { error: 'Kode referral belum berlaku' },
                { status: 400 }
            );
        }

        if (referralCode.validUntil && now > referralCode.validUntil) {
            return NextResponse.json(
                { error: 'Kode referral sudah kadaluarsa' },
                { status: 400 }
            );
        }

        // Check if max claims reached
        if (referralCode.usedClaims >= referralCode.maxClaims) {
            return NextResponse.json(
                { error: 'Kode referral sudah mencapai batas maksimal penggunaan' },
                { status: 400 }
            );
        }

        // All referral codes now apply to all categories - no category check needed

        // For community referral codes, return flat pricing info
        let discountAmount = 0;
        if (category === 'fun') {
            // Community package gets flat 195k pricing (savings of 30k from 225k)
            discountAmount = 30000;
        }

        return NextResponse.json({
            valid: true,
            referralCode: {
                id: referralCode.id,
                code: referralCode.code,
                name: referralCode.name,
                description: referralCode.description,
                discount: discountAmount, // This represents the savings, not actual discount applied
                remainingClaims: referralCode.maxClaims - referralCode.usedClaims,
            },
        });

    } catch (error) {
        console.error('Error validating referral code:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan saat memvalidasi kode referral' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
