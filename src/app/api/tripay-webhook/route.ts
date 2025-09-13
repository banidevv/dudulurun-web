import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import crypto from 'crypto';
import { sendWhatsAppMessage } from '@/lib/onesender';
import { encrypt } from '@/lib/encryption';

const TRIPAY_PRIVATE_KEY = process.env.TRIPAY_PRIVATE_KEY || '';

interface TripayWebhookPayload {
  reference: string;
  merchant_ref: string;
  payment_method_code: string;
  status: string;
  paid_at: string | null;
  amount_received: number;
}

function createSignature(payload: string, privateKey: string): string {
  return crypto
    .createHmac('sha256', privateKey)
    .update(payload)
    .digest('hex');
}

function getStatusMessage(status: string, name: string, merchantRef: string, registrationId: string): string {
  switch (status) {
    case 'paid':
      const encryptedId = encrypt(registrationId);
      const qrCodeUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/qr-code/${encodeURIComponent(encryptedId)}`;
      return `Halo ${name}! 🎉\n\nPembayaran Anda untuk Dudulurun 2025 dengan nomor referensi ${merchantRef} telah berhasil!\n\nSilakan akses e-ticket Anda di link berikut:\n${qrCodeUrl}\n\nTerima kasih atas partisipasi Anda. Kami akan mengirimkan informasi lebih lanjut mengenai pengambilan race pack melalui email.\n\nSampai jumpa di garis start! 🏃‍♂️`;
    case 'expired':
      return `Halo ${name},\n\nMohon maaf, pembayaran Anda untuk Dudulurun 2025 dengan nomor referensi ${merchantRef} telah kedaluwarsa.\n\nJika Anda masih ingin berpartisipasi, silakan melakukan pendaftaran ulang di website kami.\n\nTerima kasih! 🙏`;
    case 'failed':
      return `Halo ${name},\n\nMohon maaf, pembayaran Anda untuk Dudulurun 2025 dengan nomor referensi ${merchantRef} gagal diproses.\n\nSilakan coba lagi atau gunakan metode pembayaran lain.\n\nJika butuh bantuan, silakan hubungi kami di nomor ini. 🙏`;
    default:
      return '';
  }
}

export async function POST(request: Request) {
  const prisma = getPrismaClient();

  try {
    // Get the raw payload and signature
    const payload = await request.text();
    const signature = request.headers.get('X-Callback-Signature');

    // Validate request
    if (!signature) {
      console.error('Webhook error: Missing signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify signature
    const expectedSignature = createSignature(payload, TRIPAY_PRIVATE_KEY);
    if (signature !== expectedSignature) {
      console.error('Webhook error: Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );   
    }

    // Parse and validate payload
    let data: TripayWebhookPayload;
    try {
      data = JSON.parse(payload);
    } catch (error) {
      console.error('Webhook error: Invalid JSON payload', error);
      return NextResponse.json(
        { error: 'Invalid payload format' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!data.reference || !data.status) {
      console.error('Webhook error: Missing required fields', data);
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Map Tripay status to our status
    const statusMap: { [key: string]: string } = {
      UNPAID: 'pending',
      PAID: 'paid',
      EXPIRED: 'expired',
      FAILED: 'failed',
      REFUND: 'refunded'
    };

    const mappedStatus = statusMap[data.status];
    if (!mappedStatus) {
      console.error('Webhook error: Unknown payment status', data.status);
      return NextResponse.json(
        { error: 'Unknown payment status' },
        { status: 400 }
      );
    }

    // Update payment record
    const payment = await prisma.payment.update({
      where: { tripayReference: data.reference },
      data: {
        status: mappedStatus,
        updatedAt: new Date(),
      },
      include: {
        registration: true,
      },
    });

    // Send WhatsApp notification for status changes that need notification
    if (['paid', 'expired', 'failed'].includes(mappedStatus)) {
      try {
        const message = getStatusMessage(
          mappedStatus,
          payment.registration.name,
          payment.merchantRef,
          payment.registrationId.toString()
        );

        if (message) {
          await sendWhatsAppMessage({
            to: payment.registration.phone,
            message: message
          });
        }
      } catch (whatsappError) {
        // Log WhatsApp error but don't fail the webhook
        console.error('Failed to send WhatsApp notification:', whatsappError);
      }
    }

    // Log successful payment
    if (mappedStatus === 'paid') {
      console.log('Payment successful', {
        reference: data.reference,
        merchantRef: data.merchant_ref,
        amount: data.amount_received,
        method: data.payment_method_code,
        paidAt: data.paid_at,
        registrationId: payment.registrationId,
        customerName: payment.registration.name,
        customerEmail: payment.registration.email,
      });
    }

    return NextResponse.json({
      success: true,
      status: mappedStatus,
      reference: data.reference,
    });
  } catch (error) {
    // Log the error with details
    console.error('Webhook processing error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 