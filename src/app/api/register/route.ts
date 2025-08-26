import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { createPaymentRequest } from '@/lib/tripay';
import { sendWhatsAppMessage } from '@/lib/onesender';

interface FamilyPackage {
  parentPackageType: 'parentFull' | 'parentBibOnly';
  childPackageType: 'childFull' | 'childBibOnly';
  parentCount: number;
  childCount: number;
  parentShirtSizes?: string;
  childShirtSizes?: string;
}

const categoryNames = {
  fun: "fun",
  family: "family",
} as const;

const packageNames = {
  // Fun Run packages
  full: "BIB + Jersey + Medal",
  basic: "BIB + Jersey + Medal",
  bibOnly: "BIB Only",
  // Family Run packages
  parentFull: "Parent: BIB + Jersey + Medal",
  parentBibOnly: "Parent: BIB + Jersey + Medal",
  childFull: "Child: BIB + Jersey + Medal",
  childBibOnly: "Child: BIB + Jersey + Medal",
  // Kids Dash packages
  new: "Baru",
  po: "PO"
} as const;

type Category = keyof typeof categoryNames;
type FunPackageType = 'community' | 'general';
type KidsPackageType = 'new' | 'po';
type NonFamilyPackageType = FunPackageType | KidsPackageType;

export async function POST(request: Request) {
  const prisma = getPrismaClient();
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      category,
      packageType,
      shirtSize,
      method,
      familyPackage,
      voucherCode,
      referralCodeId,
      // Add referral tracking data
      referralSource,
      fbclid,
      utmSource,
      utmMedium,
      utmCampaign,
    } = body;

    // Validate and process referral code if provided
    let referralCodeData = null;

    if (referralCodeId) {
      const referralCode = await prisma.referralCode.findUnique({
        where: { id: referralCodeId },
        include: { usages: true },
      });

      if (referralCode && referralCode.isActive) {
        // Check if max claims reached
        if (referralCode.usedClaims < referralCode.maxClaims) {
          // Check validity dates
          const now = new Date();
          const validFromCheck = !referralCode.validFrom || now >= referralCode.validFrom;
          const validUntilCheck = !referralCode.validUntil || now <= referralCode.validUntil;

          if (validFromCheck && validUntilCheck) {
            // All referral codes now apply to all categories
            referralCodeData = referralCode;
          }
        }
      }
    }

    // Create registration record with family package data if present
    const registration = await prisma.registration.create({
      data: {
        name,
        email,
        phone,
        category,
        packageType: category === 'family' ? undefined : packageType,
        shirtSize: category === 'family' ? undefined : shirtSize,
        // Add voucher code for fun run community (legacy)
        ...(voucherCode ? { voucherCode } : {}),
        // Add referral code ID (new system)
        ...(referralCodeId ? { referralCodeId } : {}),
        // Add family package data if category is family
        ...(category === 'family' && familyPackage ? {
          familyPackageData: {
            parentPackageType: familyPackage.parentPackageType,
            childPackageType: familyPackage.childPackageType,
            parentCount: familyPackage.parentCount,
            childCount: familyPackage.childCount,
            parentShirtSizes: familyPackage.parentShirtSizes,
            childShirtSizes: familyPackage.childShirtSizes,
          }
        } : {}),
        // Add referral tracking data
        referralSource,
        fbclid,
        utmSource,
        utmMedium,
        utmCampaign,
      },
    });

    // Create payment request with Tripay
    try {
      // Calculate final amount - for community package, always use flat 195k
      let finalAmount;
      if (category === 'family') {
        finalAmount = 315000;
      } else if (packageType === 'general') {
        finalAmount = 225000;
      } else if (packageType === 'community') {
        // Community package is always flat 195k regardless of referral code
        finalAmount = 195000;
      } else {
        finalAmount = 225000; // Default fallback
      }

      const paymentData = await createPaymentRequest({
        name,
        email,
        phone,
        amount: finalAmount,
        category: category as Category,
        packageType: category === 'family' ? undefined : packageType as NonFamilyPackageType,
        shirtSize: category === 'family' ? undefined : shirtSize,
        method,
        familyPackage: category === 'family' ? familyPackage as FamilyPackage : undefined,
      });

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          registrationId: registration.id,
          merchantRef: paymentData.merchant_ref,
          amount: paymentData.amount,
          paymentUrl: paymentData.checkout_url,
          tripayReference: paymentData.reference,
        },
      });

      // If referral code was used, create usage record and increment used claims
      if (referralCodeData) {
        await prisma.$transaction([
          // Create referral usage record
          prisma.referralUsage.create({
            data: {
              referralCodeId: referralCodeData.id,
              registrationId: registration.id,
            },
          }),
          // Increment used claims
          prisma.referralCode.update({
            where: { id: referralCodeData.id },
            data: { usedClaims: { increment: 1 } },
          }),
        ]);
      }

      // Send WhatsApp notification
      try {
        let packageInfo = '';
        if (category === 'family' && familyPackage) {
          const parentInfo = `${familyPackage.parentCount}x ${packageNames[familyPackage.parentPackageType as keyof typeof packageNames]}`;
          const childInfo = `${familyPackage.childCount}x ${packageNames[familyPackage.childPackageType as keyof typeof packageNames]}`;
          packageInfo = `\n- Paket Parent: ${parentInfo}\n- Paket Child: ${childInfo}`;
          if (familyPackage.parentShirtSizes) {
            packageInfo += `\n- Ukuran Baju Parent: ${familyPackage.parentShirtSizes}`;
          }
          if (familyPackage.childShirtSizes) {
            packageInfo += `\n- Ukuran Baju Child: ${familyPackage.childShirtSizes}`;
          }
        } else {
          packageInfo = `\n- Paket: ${packageNames[packageType as keyof typeof packageNames]}`;
          if (shirtSize) {
            packageInfo += `\n- Ukuran Baju: ${shirtSize}`;
          }
        }

        const message = `Halo ${name}! 👋\n\nTerima kasih telah mendaftar di DuduLuRun 2025! 🏃‍♂️\n\nDetail pendaftaran Anda:\n- Kategori: ${categoryNames[category as keyof typeof categoryNames]}${packageInfo}\n\nUntuk menyelesaikan pendaftaran, silakan lakukan pembayaran melalui link berikut:\n${payment.paymentUrl}\n\nJika ada pertanyaan, silakan hubungi kami di nomor ini.\n\nSampai jumpa di garis start! 🎉`;

        await sendWhatsAppMessage({
          to: phone,
          message: message
        });
      } catch (whatsappError) {
        // Log WhatsApp error but don't fail the registration
        console.error('Failed to send WhatsApp message:', whatsappError);
      }

      return NextResponse.json(
        {
          registration,
          payment: {
            ...payment,
            payment_url: payment.paymentUrl,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Failed to create payment:', error);
      // Delete the registration if payment creation fails
      await prisma.registration.delete({
        where: { id: registration.id }
      });
      throw error;
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    console.error('Failed to create registration:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mendaftar' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 