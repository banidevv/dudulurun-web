import React from 'react';

export default function Regulation() {
  return (
    <section id="regulation" className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-4">Regulation</h2>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div id="general-rules" className="space-y-4 sm:space-y-6">
              <h3 className="text-xl sm:text-2xl font-semibold text-primary mb-3 sm:mb-4">Peraturan Umum</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-accent mt-1 text-sm flex-shrink-0"></i>
                  <div className="text-gray-700 text-sm sm:text-base">Peserta wajib dalam kondisi sehat saat mengikuti lomba.</div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-accent mt-1 text-sm flex-shrink-0"></i>
                  <div className="text-gray-700 text-sm sm:text-base">Peserta wajib (terdaftar) memiliki kartu BPJS Kesehatan atau kartu sehat.</div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-accent mt-1 text-sm flex-shrink-0"></i>
                  <div className="text-gray-700 text-sm sm:text-base">Peserta harus datang tepat waktu. Keterlambatan &gt;15 menit dari waktu start dapat menyebabkan diskualifikasi.</div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-accent mt-1 text-sm flex-shrink-0"></i>
                  <div className="text-gray-700 text-sm sm:text-base">Tiket yang telah dibeli tidak dapat dikembalikan atau refund.</div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-accent mt-1 text-sm flex-shrink-0"></i>
                  <div className="text-gray-700 text-sm sm:text-base">Bukti Pembayaran di perlihatkan ketika pengambilan Racepack.</div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-accent mt-1 text-sm flex-shrink-0"></i>
                  <div className="text-gray-700 text-sm sm:text-base">Pendaftaran tidak dapat dipindah tangankan.</div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-accent mt-1 text-sm flex-shrink-0"></i>
                  <div className="text-gray-700 text-sm sm:text-base">Data yang sudah di isi tidak dapat diganti.</div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-accent mt-1 text-sm flex-shrink-0"></i>
                  <div className="text-gray-700 text-sm sm:text-base">Binatang peliharaan atau segala bentuk objek roda untuk transportasi misalnya; sepeda, sepeda motor (kecuali kursi roda / troller dan sepeda yang disetujui oleh panitia), skate, spatu roda, dan lainnya adalah dilarang berada dalam rute lomba.</div>
                </div>
              </div>
            </div>

            <div id="special-rules" className="space-y-4 sm:space-y-6">
              <h3 className="text-xl sm:text-2xl font-semibold text-primary mb-3 sm:mb-4">Peraturan Khusus</h3>
              <div className="space-y-4 sm:space-y-6">
                <div className="border-l-4 border-accent pl-3 sm:pl-4">
                  <h4 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">Kategori Fun Run 5K: Quota 250 Peserta</h4>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start space-x-3">
                      <i className="fa-solid fa-circle-check text-accent mt-1 text-sm flex-shrink-0"></i>
                      <div className="text-gray-700 text-sm sm:text-base">Satu tiket berlaku untuk 1 orang.</div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <i className="fa-solid fa-circle-check text-accent mt-1 text-sm flex-shrink-0"></i>
                      <div className="text-gray-700 text-sm sm:text-base">Minimal usia 14 tahun ke atas.</div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <i className="fa-solid fa-circle-check text-accent mt-1 text-sm flex-shrink-0"></i>
                      <div className="text-gray-700 text-sm sm:text-base">Peserta di bawah 18 tahun wajib mendapatkan izin tertulis dari orang tua/wali.</div>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-accent pl-3 sm:pl-4">
                  <h4 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">Kategori Family Run 2.5K: Quota 200 Peserta</h4>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start space-x-3">
                      <i className="fa-solid fa-circle-check text-accent mt-1 text-sm flex-shrink-0"></i>
                      <div className="text-gray-700 text-sm sm:text-base">Satu tiket berlaku untuk satu tim yang terdaftar.</div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <i className="fa-solid fa-circle-check text-accent mt-1 text-sm flex-shrink-0"></i>
                      <div className="text-gray-700 text-sm sm:text-base">Satu tim maksimal 2 dewasa dan 2 anak.</div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <i className="fa-solid fa-circle-check text-accent mt-1 text-sm flex-shrink-0"></i>
                      <div className="text-gray-700 text-sm sm:text-base">Anak wajib ditemani orang tua/wali sepanjang rute.</div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <i className="fa-solid fa-circle-check text-accent mt-1 text-sm flex-shrink-0"></i>
                      <div className="text-gray-700 text-sm sm:text-base">Anak usia 7-12 tahun.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Penting untuk Diperhatikan:</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
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