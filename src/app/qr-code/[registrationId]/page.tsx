import { getPrismaClient } from '@/lib/prisma';
import QRCode from 'qrcode';
import { notFound } from 'next/navigation';
import { decrypt } from '@/lib/encryption';

async function generateQRCode(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text);
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw new Error('Failed to generate QR code');
  }
}

const getCategoryDisplay = (category: string) => {
  switch (category) {
    case 'fun':
      return '5K Fun Run';
    case 'family':
      return '2.5K Family Run';
    case 'kids':
      return 'Kids Dash';
    default:
      return category;
  }
};

const getPackageTypeDisplay = (category: string, packageType: string | null) => {
  if (category === 'fun') {
    switch (packageType) {
      case 'full':
        return 'BIB + Medali + Jersey';
      case 'basic':
        return 'BIB + Medali';
      case 'bibOnly':
        return 'BIB Only';
      default:
        return packageType || '-';
    }
  }
  
  if (category === 'kids') {
    switch (packageType) {
      case 'new':
        return 'Baru';
      case 'po':
        return 'PO (Family Run)';
      default:
        return packageType || '-';
    }
  }
  
  return packageType || '-';
};

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

    const familyPackageData = registration.familyPackageData as {
      parentPackageType: string;
      childPackageType: string;
      parentCount: number;
      childCount: number;
      parentShirtSizes?: string;
      childShirtSizes?: string;
    } | null;

    return (
      <div className="min-h-screen bg-gradient-to-b from-dudulurun-cream to-dudulurun-cream/50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-8">
              <h1 className="text-2xl font-bold text-dudulurun-teal text-center mb-6">
                E-Ticket Dudulurun 2025
              </h1>
              
              <div className="flex justify-center mb-8">
                <div className="p-4 bg-white rounded-lg shadow-md">
                  <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h2 className="text-lg font-semibold text-dudulurun-blue mb-2">
                    Informasi Peserta
                  </h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">Nama</div>
                    <div className="font-medium text-right text-dudulurun-teal">{registration.name}</div>
                    
                    <div className="text-gray-600">Kategori</div>
                    <div className="font-medium text-right text-dudulurun-teal">
                      {getCategoryDisplay(registration.category)}
                    </div>

                    {registration.category === 'family' ? (
                      <>
                        <div className="text-gray-600">Paket Parent</div>
                        <div className="font-medium text-right text-dudulurun-teal">
                          {familyPackageData?.parentCount}x {familyPackageData?.parentPackageType === 'parentFull' ? 'BIB + Jersey' : 'BIB Only'}
                        </div>

                        <div className="text-gray-600">Paket Anak</div>
                        <div className="font-medium text-right text-dudulurun-teal">
                          {familyPackageData?.childCount}x {familyPackageData?.childPackageType === 'childFull' ? 'BIB + Jersey' : 'BIB Only'}
                        </div>

                        {familyPackageData?.parentShirtSizes && (
                          <>
                            <div className="text-gray-600">Ukuran Baju Parent</div>
                            <div className="font-medium text-right text-dudulurun-teal">
                              {familyPackageData.parentShirtSizes}
                            </div>
                          </>
                        )}

                        {familyPackageData?.childShirtSizes && (
                          <>
                            <div className="text-gray-600">Ukuran Baju Anak</div>
                            <div className="font-medium text-right text-dudulurun-teal">
                              {familyPackageData.childShirtSizes}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="text-gray-600">Paket</div>
                        <div className="font-medium text-right text-dudulurun-teal">
                          {getPackageTypeDisplay(registration.category, registration.packageType)}
                        </div>

                        {registration.shirtSize && (
                          <>
                            <div className="text-gray-600">Ukuran Baju</div>
                            <div className="font-medium text-right text-dudulurun-teal">{registration.shirtSize}</div>
                          </>
                        )}
                      </>
                    )}

                    <div className="text-gray-600">Status Tiket</div>
                    {registration.race && (
                      <>
                        <div className="text-gray-600">Foto Race Pack</div>
                        <div className="font-medium text-right text-dudulurun-teal">
                          <img src={registration.race.racePackPhotoUrl} alt="Race Pack" className="w-24 h-24" />
                        </div>
                        <div className="text-gray-600">No. BIB</div>
                        <div className="font-medium text-right text-dudulurun-teal">{registration.race.id}</div>
                      </>
                    )}

                    <div className={`font-medium text-right ${registration.race ? registration.race.checkedIn ? 'text-green-500' : 'text-red-500' : 'text-red-500'}`}>
                      {registration.race ? registration.race.checkedIn ? 'Siap untuk Race!' : 'Belum Check In' : 'Belum Ambil Race Pack'}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 text-center">
                    Tunjukkan QR code ini saat pengambilan race pack.
                    <br />
                    Mohon simpan baik-baik dan jangan dibagikan ke orang lain.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } finally {
    await prisma.$disconnect();
  }
} 