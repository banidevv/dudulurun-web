import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

export async function GET(request: Request) {
    const prisma = getPrismaClient();
    const { searchParams } = new URL(request.url);

    try {
        const format = searchParams.get('format') || 'csv';
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || undefined;
        const status = searchParams.get('status') || undefined;

        // Build where clause (same as GET registrations)
        const where: any = {
            AND: [
                search ? {
                    OR: [
                        { name: { contains: search } },
                        { email: { contains: search } },
                        { phone: { contains: search } },
                    ],
                } : {},
                category ? { category } : {},
                status ? { payment: { status } } : {},
            ],
        };

        // Get all registrations with payment info
        const registrations = await prisma.registration.findMany({
            where,
            include: {
                payment: {
                    select: {
                        status: true,
                        amount: true,
                        merchantRef: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (format === 'csv') {
            // Generate CSV
            const csvHeaders = [
                'ID',
                'Name',
                'Email',
                'Phone',
                'Category',
                'Package Type',
                'Shirt Size',
                'Payment Status',
                'Amount',
                'Merchant Ref',
                'Registration Date',
                'Payment Date'
            ];

            const csvRows = registrations.map(reg => [
                reg.id,
                reg.name,
                reg.email,
                reg.phone,
                reg.category,
                reg.packageType || '',
                reg.shirtSize || '',
                reg.payment?.status || 'No Payment',
                reg.payment?.amount || 0,
                reg.payment?.merchantRef || '',
                new Date(reg.createdAt).toLocaleDateString('id-ID'),
                reg.payment?.createdAt ? new Date(reg.payment.createdAt).toLocaleDateString('id-ID') : ''
            ]);

            const csvContent = [
                csvHeaders.join(','),
                ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
            ].join('\n');

            return new NextResponse(csvContent, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="registrations-${new Date().toISOString().split('T')[0]}.csv"`,
                },
            });
        }

        if (format === 'excel') {
            // For Excel format, we'll return JSON that can be processed by frontend
            const excelData = registrations.map(reg => ({
                'ID': reg.id,
                'Name': reg.name,
                'Email': reg.email,
                'Phone': reg.phone,
                'Category': reg.category,
                'Package Type': reg.packageType || '',
                'Shirt Size': reg.shirtSize || '',
                'Payment Status': reg.payment?.status || 'No Payment',
                'Amount': reg.payment?.amount || 0,
                'Merchant Ref': reg.payment?.merchantRef || '',
                'Registration Date': new Date(reg.createdAt).toLocaleDateString('id-ID'),
                'Payment Date': reg.payment?.createdAt ? new Date(reg.payment.createdAt).toLocaleDateString('id-ID') : ''
            }));

            return NextResponse.json({
                data: excelData,
                filename: `registrations-${new Date().toISOString().split('T')[0]}.xlsx`
            });
        }

        return NextResponse.json(
            { error: 'Unsupported format. Use csv or excel.' },
            { status: 400 }
        );

    } catch (error) {
        console.error('Failed to export registrations:', error);
        return NextResponse.json(
            { error: 'Failed to export registrations' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
