'use client';

import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Head from 'next/head';

interface TicketData {
  id: number;
  name: string;
  category: string;
  packageType?: string;
  shirtSize?: string;
  familyPackageData?: {
    parentPackageType: string;
    childPackageType: string;
    parentCount: number;
    childCount: number;
    parentShirtSizes?: string;
    childShirtSizes?: string;
  };
}

interface ScanResult {
  success: boolean;
  message: string;
  data?: {
    name: string;
    category: string;
    packageDetails: {
      type: string;
      shirtSize: string;
      familyDetails: {
        parentPackageType: string;
        childPackageType: string;
        parentCount: number;
        childCount: number;
        parentShirtSizes?: string;
        childShirtSizes?: string;
      } | null;
    };
    ticketUsed: boolean;
  };
}

export default function Scanner() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: Math.min(window.innerWidth - 48, 250),
        height: Math.min(window.innerWidth - 48, 250),
      },
      fps: 10,
      aspectRatio: 1,
      showTorchButtonIfSupported: true,
      rememberLastUsedCamera: true,
    }, false);

    const handleScan = async (decodedText: string) => {
      try {
        let ticketData: TicketData;
        try {
          ticketData = JSON.parse(decodedText);
        } catch {
          setScanResult({
            success: false,
            message: 'Invalid QR code format',
          });
          return;
        }

        const response = await fetch('/api/scanner/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ticketData }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to validate ticket');
        }

        setScanResult({
          success: true,
          message: result.message,
          data: result.data,
        });
        setIsScanning(false);
        scanner.clear();
      } catch (err) {
        setScanResult({
          success: false,
          message: err instanceof Error ? err.message : 'Failed to validate ticket',
        });
      }
    };

    scanner.render(handleScan, (error) => {
      console.error('QR Scanner error:', error);
    });

    return () => {
      scanner.clear();
    };
  }, []);

  const handleReset = () => {
    setIsScanning(true);
    window.location.reload();
  };

  const categoryNames = {
    fun: "5K Fun Run",
    family: "2,5K Family Run",
    kids: "50M Kids Dash"
  };

  const packageNames = {
    // Fun Run packages
    full: "BIB + Jersey + Medal",
    basic: "BIB + Medal",
    bibOnly: "BIB Only",
    // Family Run packages
    parentFull: "Parent: BIB + Jersey",
    parentBibOnly: "Parent: BIB Only",
    childFull: "Child: BIB + Jersey",
    childBibOnly: "Child: BIB Only",
    // Kids Dash packages
    new: "Baru",
    po: "PO"
  };

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <div className="min-h-[100dvh] bg-gradient-to-b from-dudulurun-cream to-dudulurun-cream/50 py-6 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <h1 className="text-xl sm:text-2xl font-bold text-dudulurun-teal text-center mb-6">
              Ticket Scanner
            </h1>

            {isScanning ? (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden p-4 sm:p-8">
                <div id="reader" className="w-full max-w-[600px] mx-auto"></div>
                <style jsx global>{`
                  #reader {
                    border: none !important;
                    min-height: 300px;
                  }
                  #reader__scan_region {
                    min-height: 300px;
                    background: #000;
                  }
                  #reader__scan_region video {
                    max-width: 100% !important;
                    object-fit: cover !important;
                  }
                  #reader__dashboard_section_swaplink {
                    text-decoration: none !important;
                    color: #4A90E2 !important;
                    padding: 8px !important;
                    margin: 4px !important;
                  }
                  #reader__dashboard_section_csr button {
                    padding: 8px !important;
                    margin: 4px !important;
                  }
                  #reader * {
                    border: none !important;
                  }
                `}</style>
                <p className="text-center text-gray-600 mt-4 text-sm sm:text-base">
                  Point the camera at a ticket QR code
                </p>
              </div>
            ) : scanResult && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden p-6 sm:p-8">
                <div className={`text-center mb-6 ${scanResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  <div className="text-lg sm:text-xl font-bold mb-2">
                    {scanResult.success ? '✓ Valid Ticket' : '✗ Invalid Ticket'}
                  </div>
                  <div className="text-gray-600 text-sm sm:text-base">
                    {scanResult.message}
                  </div>
                </div>

                {scanResult.data && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-medium text-dudulurun-blue mb-3">Ticket Details</h3>
                    <div className="space-y-3 text-sm sm:text-base">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Name</span>
                        <span className="font-medium">{scanResult.data.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Category</span>
                        <span className="font-medium">{categoryNames[scanResult.data.category as keyof typeof categoryNames] || scanResult.data.category}</span>
                      </div>
                      {scanResult.data.packageDetails.familyDetails ? (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Parent Package</span>
                            <span className="font-medium">
                              {scanResult.data.packageDetails.familyDetails.parentCount}x {packageNames[scanResult.data.packageDetails.familyDetails.parentPackageType as keyof typeof packageNames]}
                            </span>
                          </div>
                          {scanResult.data.packageDetails.familyDetails.parentShirtSizes && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Parent Shirt Sizes</span>
                              <span className="font-medium">{scanResult.data.packageDetails.familyDetails.parentShirtSizes}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Child Package</span>
                            <span className="font-medium">
                              {scanResult.data.packageDetails.familyDetails.childCount}x {packageNames[scanResult.data.packageDetails.familyDetails.childPackageType as keyof typeof packageNames]}
                            </span>
                          </div>
                          {scanResult.data.packageDetails.familyDetails.childShirtSizes && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Child Shirt Sizes</span>
                              <span className="font-medium">{scanResult.data.packageDetails.familyDetails.childShirtSizes}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Package</span>
                            <span className="font-medium">{packageNames[scanResult.data.packageDetails.type as keyof typeof packageNames] || scanResult.data.packageDetails.type}</span>
                          </div>
                          {scanResult.data.packageDetails.shirtSize !== 'N/A' && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Shirt Size</span>
                              <span className="font-medium">{scanResult.data.packageDetails.shirtSize}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleReset}
                  className="w-full mt-6 bg-dudulurun-teal text-white py-3 px-4 rounded-lg hover:bg-dudulurun-teal/90 transition-colors text-base font-medium active:transform active:scale-[0.98]"
                >
                  Scan Another Ticket
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 