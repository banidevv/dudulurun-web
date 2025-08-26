import React from 'react';

export const RaceCategory: React.FC = () => {
  return (
    <section id="kategori" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4">Kategori Lomba</h2>
          {/* <p className="text-gray-600 text-lg">Pilih kategori yang sesuai dengan kemampuan Anda</p> */}
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div id="funrun-category" className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-person-running text-primary text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-2">Fun Run</h3>
              <div className="text-accent text-3xl font-bold">5KM</div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-check text-primary"></i>
                <span className="text-gray-700">BIB Number</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-check text-primary"></i>
                <span className="text-gray-700">Jersey & Finisher Medali</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-check text-primary"></i>
                <span className="text-gray-700">E-Certificate</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-check text-primary"></i>
                <span className="text-gray-700">Product Sponsor</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-check text-primary"></i>
                <span className="text-gray-700">Refresher & Special Gift</span>
              </div>
            </div>
            <div className="mt-8">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-600">Biaya Pendaftaran</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                  <div className="text-lg font-bold text-primary mb-1">Rp 225.000</div>
                  <div className="text-sm text-gray-600 font-medium">Umum</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl border border-accent/20">
                  <div className="text-lg font-bold text-accent mb-1">Rp 195.000</div>
                  <div className="text-sm text-gray-600 font-medium">Komunitas</div>
                </div>
              </div>
              <div className="text-center mt-3">
                <div className="text-xs text-gray-500">*Harga komunitas untuk member komunitas terdaftar</div>
              </div>
            </div>
          </div>

          <div id="familyrun-category" className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-people-group text-accent text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-2">Family Run</h3>
              <div className="text-accent text-3xl font-bold">2,5KM</div>
            </div>
            <div className="space-y-4">
            <div className="flex items-center space-x-3">
                <i className="fa-solid fa-check text-primary"></i>
                <span className="text-gray-700">BIB Number</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-check text-primary"></i>
                <span className="text-gray-700">Jersey & Finisher Medali</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-check text-primary"></i>
                <span className="text-gray-700">E-Certificate (1 Parent + 1 Child)</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-check text-primary"></i>
                <span className="text-gray-700">Product Sponsor</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-check text-primary"></i>
                <span className="text-gray-700">Refresher & Special Gift</span>
              </div>
            </div>
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Biaya Pendaftaran:</div>
              <div className="text-2xl font-bold text-primary">Rp 315.000</div>
              <div className="text-sm text-gray-500">Per paket keluarga (1 Parent + 1 Child)</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 