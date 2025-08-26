import React from 'react';

export default function Regulation() {
  return (
    <section id="regulation" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4">Regulation</h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div id="general-rules" className="space-y-6">
              <h3 className="text-2xl font-semibold text-primary mb-4">Peraturan Umum</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-accent mt-1 text-sm"></i>
                  <div className="text-gray-700 text-sm">Peserta wajib dalam kondisi sehat saat mengikuti lomba.</div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-accent mt-1 text-sm"></i>
                  <div className="text-gray-700 text-sm">Peserta wajib (terdaftar) memiliki kartu BPJS Kesehatan atau kartu sehat.</div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-accent mt-1 text-sm"></i>
                  <div className="text-gray-700 text-sm">Peserta harus datang tepat waktu. Keterlambatan &gt;15 menit dari waktu start dapat menyebabkan diskualifikasi.</div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-accent mt-1 text-sm"></i>
                  <div className="text-gray-700 text-sm">Tiket yang telah dibeli tidak dapat dikembalikan atau refund.</div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-accent mt-1 text-sm"></i>
                  <div className="text-gray-700 text-sm">Bukti Pembayaran di perlihatkan ketika pengambilan Racepack.</div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-accent mt-1 text-sm"></i>
                  <div className="text-gray-700 text-sm">Pendaftaran tidak dapat dipindah tangankan.</div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-accent mt-1 text-sm"></i>
                  <div className="text-gray-700 text-sm">Data yang sudah di isi tidak dapat diganti.</div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-accent mt-1 text-sm"></i>
                  <div className="text-gray-700 text-sm">Binatang peliharaan atau segala bentuk objek roda untuk transportasi misalnya; sepeda, sepeda motor (kecuali kursi roda / troller dan sepeda yang disetujui oleh panitia), skate, spatu roda, dan lainnya adalah dilarang berada dalam rute lomba.</div>
                </div>


              </div>
            </div>

            <div id="special-rules" className="space-y-6">
              <h3 className="text-2xl font-semibold text-primary mb-4">Peraturan Khusus</h3>
              <div className="space-y-6">
                <div className="border-l-4 border-accent pl-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Kategori Fun Run 5K: Quota 250 Peserta</h4>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <i className="fa-solid fa-circle-check text-accent mt-1 text-sm"></i>
                      <div className="text-gray-700 text-sm">Satu tiket berlaku untuk 1 orang.</div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <i className="fa-solid fa-circle-check text-accent mt-1 text-sm"></i>
                      <div className="text-gray-700 text-sm">Minimal usia 13 tahun ke atas.</div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <i className="fa-solid fa-circle-check text-accent mt-1 text-sm"></i>
                      <div className="text-gray-700 text-sm">Peserta di bawah 18 tahun wajib mendapatkan izin tertulis dari orang tua/wali.</div>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-accent pl-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Kategori Family Run 2.5K: Quota 200 Peserta</h4>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <i className="fa-solid fa-circle-check text-accent mt-1 text-sm"></i>
                      <div className="text-gray-700 text-sm">Satu tiket berlaku untuk satu tim yang terdaftar.</div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <i className="fa-solid fa-circle-check text-accent mt-1 text-sm"></i>
                      <div className="text-gray-700 text-sm">Satu tim maksimal 2 dewasa dan 2 anak.</div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <i className="fa-solid fa-circle-check text-accent mt-1 text-sm"></i>
                      <div className="text-gray-700 text-sm">Anak wajib ditemani orang tua/wali sepanjang rute.</div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <i className="fa-solid fa-circle-check text-accent mt-1 text-sm"></i>
                      <div className="text-gray-700 text-sm">Anak Min 5-12 th.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3">Penting untuk Diperhatikan:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Peserta yang tidak hadir tidak dapat refund</li>
              <li>• Dilarang mentransfer BIB number kepada orang lain</li>
              <li>• Keputusan juri tidak dapat diganggu gugat</li>
              <li>• Peserta dianggap menyetujui semua peraturan dengan mendaftar</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
} 