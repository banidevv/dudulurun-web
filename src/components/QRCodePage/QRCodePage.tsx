'use client';

import PhotoPreviewer from '../PhotoPreviewer/PhotoPreviewer';

interface QRCodePageProps {
    registration: {
        id: number;
        name: string;
        category: string;
        packageType: string | null;
        shirtSize: string | null;
        familyPackageData: any;
        race: {
            id: number;
            checkedIn: boolean;
            racePackPhotoUrl: string;
        } | null;
    };
    qrCodeUrl: string;
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

export default function QRCodeDisplay({ registration, qrCodeUrl }: QRCodePageProps) {
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

                                    <div className={`font-medium text-right ${registration.race ? registration.race.checkedIn ? 'text-green-500' : 'text-red-500' : 'text-red-500'}`}>
                                        {registration.race ? registration.race.checkedIn ? 'Siap untuk Race!' : 'Belum Check In' : 'Belum Ambil Race Pack'}
                                    </div>
                                </div>

                                {registration.race && (
                                    <>
                                        <div className="flex flex-row justify-between py-4">
                                            <div className="text-gray-600">Foto Race Pack</div>
                                            <PhotoPreviewer
                                                src={registration.race.racePackPhotoUrl}
                                                alt="Race Pack"
                                                className="w-24 h-24"
                                            />
                                        </div>
                                        <div className="flex flex-row justify-between">
                                            <div className="text-gray-600">No. BIB</div>
                                            <div className="font-medium text-right text-dudulurun-teal">{registration.race.id}</div>
                                        </div>
                                    </>
                                )}
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
}
