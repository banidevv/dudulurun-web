import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function testReferralSystem() {
    console.log('🧪 Testing Referral Code System...\n');

    try {
        // Test 1: Create a test referral code
        console.log('1️⃣ Creating test referral code...');
        const testCode = await prisma.referralCode.create({
            data: {
                code: 'TESTVALIDATION',
                name: 'Test Validation Code',
                description: 'Code for testing validation logic',
                maxClaims: 5,   
                isActive: true,
                validFrom: new Date(),
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            }
        });
        console.log(`✅ Created test code: ${testCode.code}\n`);

        // Test 2: Validate the code
        console.log('2️⃣ Testing validation logic...');

        // Test valid code
        const validationResult = await validateReferralCode('TESTVALIDATION', 'fun');
        console.log('Valid code test:', validationResult.valid ? '✅ PASS' : '❌ FAIL');

        // Test invalid code
        const invalidResult = await validateReferralCode('INVALIDCODE', 'fun');
        console.log('Invalid code test:', !invalidResult.valid ? '✅ PASS' : '❌ FAIL');

        // Test wrong category
        const wrongCategoryResult = await validateReferralCode('TESTVALIDATION', 'family');
        console.log('Wrong category test:', !wrongCategoryResult.valid ? '✅ PASS' : '❌ FAIL');
        console.log();

        // Test 3: Test usage tracking
        console.log('3️⃣ Testing usage tracking...');

        // Create test registration
        const testRegistration = await prisma.registration.create({
            data: {
                name: 'Test User',
                email: `test${Date.now()}@example.com`,
                phone: '081234567890',
                category: 'fun',
                packageType: 'community',
                shirtSize: 'M',
                referralCodeId: testCode.id,
            }
        });

        // Create usage record and increment claims
        await prisma.$transaction([
            prisma.referralUsage.create({
                data: {
                    referralCodeId: testCode.id,
                    registrationId: testRegistration.id,
                }
            }),
            prisma.referralCode.update({
                where: { id: testCode.id },
                data: { usedClaims: { increment: 1 } }
            })
        ]);

        // Verify usage was tracked
        const updatedCode = await prisma.referralCode.findUnique({
            where: { id: testCode.id },
            include: { usages: true }
        });

        console.log(`Usage tracking test: ${updatedCode?.usedClaims === 1 ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Usage record test: ${updatedCode?.usages.length === 1 ? '✅ PASS' : '❌ FAIL'}`);
        console.log();

        // Test 4: Test max claims limit
        console.log('4️⃣ Testing max claims limit...');

        // Use up remaining claims (4 more)
        for (let i = 0; i < 4; i++) {
            const registration = await prisma.registration.create({
                data: {
                    name: `Test User ${i + 2}`,
                    email: `test${Date.now() + i}@example.com`,
                    phone: '081234567890',
                    category: 'fun',
                    packageType: 'community',
                    shirtSize: 'M',
                    referralCodeId: testCode.id,
                }
            });

            await prisma.$transaction([
                prisma.referralUsage.create({
                    data: {
                        referralCodeId: testCode.id,
                        registrationId: registration.id,
                    }
                }),
                prisma.referralCode.update({
                    where: { id: testCode.id },
                    data: { usedClaims: { increment: 1 } }
                })
            ]);
        }

        // Try to validate when max claims reached
        const maxClaimsResult = await validateReferralCode('TESTVALIDATION', 'fun');
        console.log(`Max claims limit test: ${!maxClaimsResult.valid ? '✅ PASS' : '❌ FAIL'}`);
        console.log();

        // Test 5: Test expired code
        console.log('5️⃣ Testing expired code...');

        const expiredCode = await prisma.referralCode.create({
            data: {
                code: 'EXPIREDTEST',
                name: 'Expired Test Code',
                description: 'Code for testing expiry logic',
                maxClaims: 10,
                isActive: true,
                validFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                validUntil: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (expired)
            }
        });

        const expiredResult = await validateReferralCode('EXPIREDTEST', 'fun');
        console.log(`Expired code test: ${!expiredResult.valid ? '✅ PASS' : '❌ FAIL'}`);
        console.log();

        // Test 6: Test inactive code
        console.log('6️⃣ Testing inactive code...');

        const inactiveCode = await prisma.referralCode.create({
            data: {
                code: 'INACTIVETEST',
                name: 'Inactive Test Code',
                description: 'Code for testing inactive logic',
                maxClaims: 10,
                isActive: false, // Inactive
            }
        });

        const inactiveResult = await validateReferralCode('INACTIVETEST', 'fun');
        console.log(`Inactive code test: ${!inactiveResult.valid ? '✅ PASS' : '❌ FAIL'}`);
        console.log();

        // Clean up test data
        console.log('🧹 Cleaning up test data...');
        await prisma.referralUsage.deleteMany({
            where: { referralCodeId: { in: [testCode.id, expiredCode.id, inactiveCode.id] } }
        });
        await prisma.registration.deleteMany({
            where: { referralCodeId: { in: [testCode.id, expiredCode.id, inactiveCode.id] } }
        });
        await prisma.referralCode.deleteMany({
            where: { id: { in: [testCode.id, expiredCode.id, inactiveCode.id] } }
        });
        console.log('✅ Test data cleaned up\n');

        console.log('🎉 All referral system tests completed!');

    } catch (error) {
        console.error('❌ Error during testing:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Validation function (similar to API endpoint logic)
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





        return {
            valid: true,
            referralCode: {
                id: referralCode.id,
                code: referralCode.code,
                name: referralCode.name,
                description: referralCode.description,
                remainingClaims: referralCode.maxClaims - referralCode.usedClaims,
            },
        };
    } catch (error) {
        return { valid: false, error: 'Terjadi kesalahan saat memvalidasi kode referral' };
    }
}

// Run the test
testReferralSystem();
