import { getPrismaClient } from '@/lib/prisma';
import QRCode from 'qrcode';
import { notFound } from 'next/navigation';
import { decrypt } from '@/lib/encryption';
import QRCodeDisplay from '@/components/QRCodePage/QRCodePage';

async function generateQRCode(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text);
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw new Error('Failed to generate QR code');
  }
}


export default async function QRCodePage({ params }: { params: { registrationId: string } }) {
  const prisma = getPrismaClient();

  try {
    let decryptedId: string;
    try {
      decryptedId = decrypt(decodeURIComponent(params.registrationId));
    } catch (error) {
      console.error('Failed to decrypt registration ID:', error);
      notFound();
      return;
    }

    const registration = await prisma.registration.findUnique({
      where: { id: parseInt(decryptedId, 10) },
      include: {
        payment: true,
        race: true,
      }
    });

    if (!registration || registration.payment?.status !== 'paid') {
      notFound();
    }

    const qrCodeData = JSON.stringify({
      id: registration.id,
      name: registration.name,
      category: registration.category,
      packageType: registration.packageType,
      familyPackageData: registration.familyPackageData,
      racePackPhotoUrl: registration.race?.racePackPhotoUrl,
      ticketUsed: registration.race ? true : false,
    });

    const qrCodeUrl = await generateQRCode(qrCodeData);

    return <QRCodeDisplay registration={registration} qrCodeUrl={qrCodeUrl} />;
  } finally {
    await prisma.$disconnect();
  }
} 