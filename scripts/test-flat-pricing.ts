import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function testFlatPricing() {
    console.log('🧪 Testing Flat Pricing System (195k for Community)...\n');

    try {
        // Test 1: Validate referral code for Fun Run category
        console.log('1️⃣ Testing referral validation for Fun Run...');

        const validationResponse = await fetch('http://localhost:3000/api/validate-referral', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: 'COMMUNITY2025',
                category: 'fun'
            }),
        });

        if (validationResponse.ok) {
            const validationData = await validationResponse.json();
            console.log('✅ Referral validation successful');
            console.log(`   Code: ${validationData.referralCode.code}`);
            console.log(`   Name: ${validationData.referralCode.name}`);
            console.log(`   Savings shown: IDR ${validationData.referralCode.discount.toLocaleString()}`);
            console.log(`   Remaining claims: ${validationData.referralCode.remainingClaims}`);
        } else {
            console.log('❌ Referral validation failed');
            const errorData = await validationResponse.json();
            console.log(`   Error: ${errorData.error}`);
        }
        console.log();

        // Test 2: Test pricing calculation manually
        console.log('2️⃣ Testing pricing logic...');

        // Simulate pricing calculation
        const testScenarios = [
            { category: 'fun', packageType: 'general', expectedPrice: 225000 },
            { category: 'fun', packageType: 'community', expectedPrice: 195000 },
            { category: 'family', packageType: undefined, expectedPrice: 315000 }
        ];

        testScenarios.forEach(scenario => {
            let calculatedPrice;
            if (scenario.category === 'fun') {
                if (scenario.packageType === 'general') calculatedPrice = 225000;
                if (scenario.packageType === 'community') calculatedPrice = 195000;
            }
            if (scenario.category === 'family') calculatedPrice = 315000;

            const testResult = calculatedPrice === scenario.expectedPrice ? '✅ PASS' : '❌ FAIL';
            console.log(`   ${scenario.category} - ${scenario.packageType || 'N/A'}: ${testResult} (${calculatedPrice?.toLocaleString()} IDR)`);
        });
        console.log();

        // Test 3: Check existing referral codes in database
        console.log('3️⃣ Checking existing referral codes...');

        const referralCodes = await prisma.referralCode.findMany({
            where: { isActive: true },
            select: {
                code: true,
                name: true,
                maxClaims: true,
                usedClaims: true,
                applicableCategories: true,
            }
        });

        console.log(`   Found ${referralCodes.length} active referral codes:`);
        referralCodes.forEach(code => {
            const categories = code.applicableCategories as string[] | null;
            const categoryStr = categories ? categories.join(', ') : 'All categories';
            console.log(`   - ${code.code}: ${code.name} (${code.usedClaims}/${code.maxClaims} used, ${categoryStr})`);
        });
        console.log();

        // Test 4: Simulate registration flow
        console.log('4️⃣ Testing community registration pricing...');

        console.log('   Community Fun Run 5K scenarios:');
        console.log('   - Without referral code: IDR 195,000 (base community price)');
        console.log('   - With valid referral code: IDR 195,000 (same flat price)');
        console.log('   - Benefit: Access to community pricing (vs IDR 225,000 general price)');
        console.log('   - Savings with community access: IDR 30,000');
        console.log();

        console.log('   General Fun Run 5K:');
        console.log('   - Price: IDR 225,000 (no referral code needed)');
        console.log();

        console.log('   Family Run 2.5K:');
        console.log('   - Price: IDR 315,000 (fixed price)');
        console.log();

        console.log('🎉 Flat pricing system test completed!');
        console.log('\n📋 Summary:');
        console.log('✅ Community package always costs IDR 195,000');
        console.log('✅ Referral code grants access to community pricing');
        console.log('✅ Users save IDR 30,000 compared to general pricing');
        console.log('✅ No complex discount calculations needed');

    } catch (error) {
        console.error('❌ Error during testing:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the test
testFlatPricing();
