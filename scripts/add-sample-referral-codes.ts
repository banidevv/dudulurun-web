import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function addSampleReferralCodes() {
    console.log('Adding sample referral codes...');

    try {
        const sampleCodes = [
            {
                code: 'COMMUNITY2025',
                name: 'Community Discount 2025',
                description: 'Diskon khusus untuk anggota komunitas lari',
                maxClaims: 100,
                discount: 30000, // IDR 30,000 discount
                applicableCategories: ['fun'], // Only for Fun Run
                isActive: true,
                validFrom: new Date('2025-01-01'),
                validUntil: new Date('2025-12-31'),
            },
            {
                code: 'FAMILY10',
                name: 'Family Run 10% Off',
                description: 'Diskon 10% untuk Family Run',
                maxClaims: 50,
                discountPercent: 10, // 10% discount
                applicableCategories: ['family'], // Only for Family Run
                isActive: true,
                validFrom: new Date('2025-01-01'),
                validUntil: new Date('2025-06-30'),
            },
            {
                code: 'EARLYBIRD',
                name: 'Early Bird Special',
                description: 'Diskon early bird untuk semua kategori',
                maxClaims: 200,
                discount: 25000, // IDR 25,000 discount
                applicableCategories: null, // Applies to all categories
                isActive: true,
                validFrom: new Date('2025-01-01'),
                validUntil: new Date('2025-03-31'),
            },
            {
                code: 'STUDENT50',
                name: 'Student Discount',
                description: 'Diskon khusus untuk pelajar dan mahasiswa',
                maxClaims: 150,
                discount: 50000, // IDR 50,000 discount
                applicableCategories: ['fun'], // Only for Fun Run
                isActive: true,
                validFrom: new Date('2025-01-01'),
                validUntil: new Date('2025-12-31'),
            },
            {
                code: 'CORPORATE15',
                name: 'Corporate Package',
                description: 'Diskon untuk registrasi korporat',
                maxClaims: 75,
                discountPercent: 15, // 15% discount
                applicableCategories: null, // Applies to all categories
                isActive: true,
                validFrom: new Date('2025-01-01'),
                validUntil: new Date('2025-12-31'),
            },
            {
                code: 'INFLUENCER',
                name: 'Influencer Code',
                description: 'Kode khusus untuk influencer dan content creator',
                maxClaims: 25,
                discount: 75000, // IDR 75,000 discount
                applicableCategories: null, // Applies to all categories
                isActive: true,
                validFrom: new Date('2025-01-01'),
                validUntil: new Date('2025-12-31'),
            },
            {
                code: 'TESTCODE',
                name: 'Test Referral Code',
                description: 'Kode untuk testing sistem referral',
                maxClaims: 10,
                discount: 10000, // IDR 10,000 discount
                applicableCategories: null, // Applies to all categories
                isActive: true,
                validFrom: new Date('2025-01-01'),
                validUntil: new Date('2025-12-31'),
            }
        ];

        for (const codeData of sampleCodes) {
            // Check if code already exists
            const existingCode = await prisma.referralCode.findUnique({
                where: { code: codeData.code }
            });

            if (existingCode) {
                console.log(`⚠️  Code ${codeData.code} already exists, skipping...`);
                continue;
            }

            const referralCode = await prisma.referralCode.create({
                data: codeData
            });

            console.log(`✅ Created referral code: ${referralCode.code} (${referralCode.name})`);
        }

        console.log('\n🎉 Sample referral codes added successfully!');

        // Show summary
        const totalCodes = await prisma.referralCode.count();
        console.log(`📊 Total referral codes in database: ${totalCodes}`);

    } catch (error) {
        console.error('❌ Error adding sample referral codes:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
addSampleReferralCodes();
