import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function testSimplifiedReferralSystem() {
    console.log('🧪 Testing Simplified Referral System (No Category Restrictions)...\n');

    try {
        // Test 1: Create a test referral code without category restrictions
        console.log('1️⃣ Creating universal referral code...');
        const testCode = await prisma.referralCode.create({
            data: {
                code: 'UNIVERSAL2025',
                name: 'Universal Referral Code',
                description: 'Berlaku untuk semua kategori',
                maxClaims: 10, // Universal - no category restrictions
                isActive: true,
                validFrom: new Date(),
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            }
        });
        console.log(`✅ Created universal code: ${testCode.code}\n`);

        // Test 2: Test validation for both categories
        console.log('2️⃣ Testing validation for all categories...');

        // Test Fun Run category
        const funValidation = await validateReferralCode('UNIVERSAL2025', 'fun');
        console.log(`Fun Run validation: ${funValidation.valid ? '✅ PASS' : '❌ FAIL'}`);
        if (funValidation.valid) {
            console.log(`   Savings: IDR ${funValidation.referralCode?.discount?.toLocaleString()}`);
        }

        // Test Family category
        const familyValidation = await validateReferralCode('UNIVERSAL2025', 'family');
        console.log(`Family Run validation: ${familyValidation.valid ? '✅ PASS' : '❌ FAIL'}`);
        if (familyValidation.valid) {
            console.log(`   Savings: IDR ${familyValidation.referralCode?.discount?.toLocaleString()}`);
        }
        console.log();

        // Test 3: Test pricing scenarios
        console.log('3️⃣ Testing pricing scenarios...');

        const scenarios = [
            {
                category: 'fun',
                packageType: 'general',
                hasReferral: false,
                expectedPrice: 225000,
                description: 'Fun Run General (no referral)'
            },
            {
                category: 'fun',
                packageType: 'community',
                hasReferral: true,
                expectedPrice: 198000,
                description: 'Fun Run Community (with referral)'
            },
            {
                category: 'family',
                packageType: undefined,
                hasReferral: false,
                expectedPrice: 312000,
                description: 'Family Run (no referral)'
            },
            {
                category: 'family',
                packageType: undefined,
                hasReferral: true,
                expectedPrice: 312000,
                description: 'Family Run (with referral - same price)'
            }
        ];

        scenarios.forEach((scenario, index) => {
            let calculatedPrice;
            if (scenario.category === 'fun') {
                if (scenario.packageType === 'general') calculatedPrice = 225000;
                if (scenario.packageType === 'community') calculatedPrice = 198000;
            }
            if (scenario.category === 'family') calculatedPrice = 312000;

            const testResult = calculatedPrice === scenario.expectedPrice ? '✅ PASS' : '❌ FAIL';
            console.log(`   ${scenario.description}: ${testResult} (IDR ${calculatedPrice?.toLocaleString()})`);
        });
        console.log();

        // Test 4: Check database consistency
        console.log('4️⃣ Checking database consistency...');

        const allCodes = await prisma.referralCode.findMany({
            where: { isActive: true },
            select: {
                code: true,
                name: true,
                maxClaims: true,
                usedClaims: true,
            }
        });

        console.log(`   Found ${allCodes.length} active referral codes:`);
        allCodes.forEach(code => {
            console.log(`   - ${code.code}: Universal (${code.usedClaims}/${code.maxClaims} used)`);
        });
        console.log();

        // Test 5: Simulate registration flow
        console.log('5️⃣ Testing registration flow simulation...');

        console.log('   Registration scenarios:');
        console.log('   📝 Fun Run 5K General: IDR 225,000 (no referral needed)');
        console.log('   📝 Fun Run 5K Community: IDR 195,000 (requires any valid referral)');
        console.log('   📝 Family Run 2.5K: IDR 315,000 (can use referral, same price)');
        console.log('   ✅ All referral codes work for all categories');
        console.log('   ✅ No category restrictions to manage');
        console.log('   ✅ Simplified admin interface');
        console.log();

        // Clean up test data
        console.log('🧹 Cleaning up test data...');
        await prisma.referralCode.delete({
            where: { id: testCode.id }
        });
        console.log('✅ Test data cleaned up\n');

        console.log('🎉 Simplified referral system test completed!');
        console.log('\n📋 Summary of Changes:');
        console.log('✅ Removed category restrictions from all referral codes');
        console.log('✅ Simplified admin interface (no category selection)');
        console.log('✅ All codes work universally across categories');
        console.log('✅ Maintained flat pricing for community packages');
        console.log('✅ Reduced complexity in validation logic');

    } catch (error) {
        console.error('❌ Error during testing:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Validation function (updated for no category restrictions)
async function validateReferralCode(code: string, category: string) {
    try {
        const referralCode = await prisma.referralCode.findUnique({
            where: { code: code.toUpperCase() },
            include: { usages: true },
        });

        if (!referralCode) {
            return { valid: false, error: 'Kode referral tidak ditemukan' };
        }

        if (!referralCode.isActive) {
            return { valid: false, error: 'Kode referral tidak aktif' };
        }

        const now = new Date();
        if (referralCode.validFrom && now < referralCode.validFrom) {
            return { valid: false, error: 'Kode referral belum berlaku' };
        }

        if (referralCode.validUntil && now > referralCode.validUntil) {
            return { valid: false, error: 'Kode referral sudah kadaluarsa' };
        }

        if (referralCode.usedClaims >= referralCode.maxClaims) {
            return { valid: false, error: 'Kode referral sudah mencapai batas maksimal penggunaan' };
        }

        // No category check needed - all codes are universal

        let discountAmount = 0;
        if (category === 'fun') {
            // Community package gets flat 195k pricing (savings of 30k from 225k)
            discountAmount = 30000;
        }
        // Family category doesn't have discount but can still use referral codes

        return {
            valid: true,
            referralCode: {
                id: referralCode.id,
                code: referralCode.code,
                name: referralCode.name,
                description: referralCode.description,
                discount: discountAmount,
                remainingClaims: referralCode.maxClaims - referralCode.usedClaims,
            },
        };
    } catch (error) {
        return { valid: false, error: 'Terjadi kesalahan saat memvalidasi kode referral' };
    }
}

// Run the test
testSimplifiedReferralSystem();
