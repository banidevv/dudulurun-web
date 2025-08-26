import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

export async function POST(request: Request) {
    const prisma = getPrismaClient();

    try {
        const body = await request.json();
        const { email, phone } = body;

        if (!email || !phone) {
            return NextResponse.json(
                { error: 'Email dan nomor telepon harus diisi' },
                { status: 400 }
            );
        }

        // Check if email or phone already exists
        const existingRegistration = await prisma.registration.findFirst({
            where: {
                OR: [
                    { email: email },
                    { phone: phone }
                ]
            },
            select: {
                email: true,
                phone: true,
                name: true
            }
        });

        if (existingRegistration) {
            let errorMessage = '';
            if (existingRegistration.email === email && existingRegistration.phone === phone) {
                errorMessage = 'Email dan nomor telepon sudah terdaftar';
            } else if (existingRegistration.email === email) {
                errorMessage = 'Email sudah terdaftar';
            } else if (existingRegistration.phone === phone) {
                errorMessage = 'Nomor telepon sudah terdaftar';
            }

            return NextResponse.json(
                {
                    error: errorMessage,
                    isRegistered: true,
                    registeredName: existingRegistration.name
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                message: 'Email dan nomor telepon tersedia',
                isRegistered: false
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Validation error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan saat memvalidasi data' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
