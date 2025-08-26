import React from 'react';

export const Schedule: React.FC = () => {
  return (
    <section id="jadwal" className="py-20 bg-gray-50 h-screen">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Event Schedule</h2>
          <div className="w-24 h-1 bg-accent mx-auto mb-8"></div>
        </div>

        <div className="mx-auto h-full">
          <div className="grid md:grid-cols-4 gap-8 h-full">
            {/* <div id="registration-schedule" className="bg-white rounded-lg shadow-lg p-8 text-center border-t-4 border-primary">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-user-plus text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Pendaftaran</h3>
              <div className="text-2xl font-bold text-primary mb-2">1 Jan - 15 Maret</div>
              <div className="text-gray-600 mb-4">2025</div>
              <p className="text-gray-700">
                Periode pendaftaran online melalui website resmi dengan early bird discount
              </p>
            </div> */}
            <img src="/images/ddlrn-fun-run.png" className="w-[320px] h-[350px]" />

            {/* <div id="racepack-schedule" className="bg-white rounded-lg shadow-lg p-8 text-center border-t-4 border-accent">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-box text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Race Pack</h3>
              <div className="text-2xl font-bold text-accent mb-2">20 - 22 Maret</div>
              <div className="text-gray-600 mb-4">2025</div>
              <p className="text-gray-700">
                Pengambilan race pack di venue utama dengan verifikasi dokumen peserta
              </p>
            </div> */}

            <img src="/images/ddlrn-fam-run.png" className="w-[320px] h-[350px]" />

            {/* <div id="raceday-schedule" className="bg-white rounded-lg shadow-lg p-8 text-center border-t-4 border-green-500">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-flag-checkered text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Race Day</h3>
              <div className="text-2xl font-bold text-green-500 mb-2">23 Maret</div>
              <div className="text-gray-600 mb-4">2025</div>
              <p className="text-gray-700">
                Hari perlombaan dimulai pukul 06.00 WIB dengan berbagai kategori
              </p>
            </div> */}

            <img src="/images/ddlrn-race-expo.png" className="w-[320px] h-[350px]" />
            <img src="/images/ddlrn-race-day.png" className="w-[320px] h-[350px]" />
          </div>
        </div>
      </div>
    </section>
  );
}; 