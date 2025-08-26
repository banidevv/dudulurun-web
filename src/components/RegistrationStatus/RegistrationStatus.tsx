'use client';

import { useState, useEffect } from 'react';

interface RegistrationStatusData {
  name: string;
  registrationNumber: string;
  category: string;
  shirtSize: string;
  paymentStatus: 'pending' | 'paid' | 'expired';
  paymentDue: string;
  paymentAmount: number;
}

export const RegistrationStatus = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<RegistrationStatusData | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/registration-status');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Gagal mengambil data status pendaftaran');
        }

        setStatusData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'expired':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Lunas';
      case 'pending':
        return 'Menunggu Pembayaran';
      case 'expired':
        return 'Kadaluarsa';
      default:
        return 'Status Tidak Diketahui';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-dudulurun-blue">Memuat data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!statusData) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-dudulurun-blue">Data tidak ditemukan</div>
      </div>
    );
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-dudulurun-cream to-dudulurun-cream/50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-dudulurun-teal mb-4">Status Pendaftaran</h2>
          <p className="text-lg text-dudulurun-blue">
            Detail status pendaftaran DuduLuran Marathon 2024
          </p>
        </div>

        <div className="bg-dudulurun-white p-8 rounded-xl shadow-lg border border-dudulurun-teal/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-dudulurun-blue">Nomor Registrasi</h3>
                <p className="text-xl font-semibold text-dudulurun-teal">{statusData.registrationNumber}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-dudulurun-blue">Nama Peserta</h3>
                <p className="text-lg text-dudulurun-teal">{statusData.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-dudulurun-blue">Kategori</h3>
                <p className="text-lg text-dudulurun-teal">{statusData.category}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-dudulurun-blue">Ukuran Baju</h3>
                <p className="text-lg text-dudulurun-teal">{statusData.shirtSize}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-dudulurun-blue">Status Pembayaran</h3>
                <p className={`text-xl font-semibold ${getPaymentStatusColor(statusData.paymentStatus)}`}>
                  {getPaymentStatusText(statusData.paymentStatus)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-dudulurun-blue">Jumlah Pembayaran</h3>
                <p className="text-lg text-dudulurun-teal">
                  Rp {statusData.paymentAmount.toLocaleString('id-ID')}
                </p>
              </div>
              {statusData.paymentStatus === 'pending' && (
                <div>
                  <h3 className="text-sm font-medium text-dudulurun-blue">Batas Waktu Pembayaran</h3>
                  <p className="text-lg text-dudulurun-teal">{statusData.paymentDue}</p>
                </div>
              )}
            </div>
          </div>

          {statusData.paymentStatus === 'pending' && (
            <div className="mt-8">
              <button
                className="w-full bg-dudulurun-teal text-dudulurun-white py-3 px-6 rounded-lg hover:bg-dudulurun-blue transition-colors duration-200 font-semibold text-lg"
                onClick={() => window.location.href = '/payment'}
              >
                Lanjutkan ke Pembayaran
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}; 