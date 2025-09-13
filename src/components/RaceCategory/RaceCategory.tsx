import React from 'react';

export const RaceCategory: React.FC = () => {
  return (
    <section id="kategori" className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-4">Kategori Lomba</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
          <div id="funrun-category" className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-person-running text-primary text-2xl sm:text-3xl"></i>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-primary mb-2">Fun Run</h3>
              <div className="text-accent text-2xl sm:text-3xl font-bold">5KM</div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-check text-primary text-sm"></i>
                <span className="text-gray-700 text-sm sm:text-base">BIB Number</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-check text-primary text-sm"></i>
                <span className="text-gray-700 text-sm sm:text-base">Jersey & Finisher Medali</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-check text-primary text-sm"></i>
                <span className="text-gray-700 text-sm sm:text-base">E-Certificate</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-check text-primary text-sm"></i>
                <span className="text-gray-700 text-sm sm:text-base">Product Sponsor</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-check text-primary text-sm"></i>
                <span className="text-gray-700 text-sm sm:text-base">Refresher & Special Gift</span>
              </div>
            </div>
            <div className="mt-6 sm:mt-8">
              <div className="text-center mb-4">
                <div className="text-xs sm:text-sm text-gray-600">Biaya Pendaftaran</div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                  <div className="text-sm sm:text-lg font-bold text-primary mb-1">Rp 225.000</div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">Umum</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl border border-accent/20">
                  <div className="text-sm sm:text-lg font-bold text-accent mb-1">Rp 195.000</div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">Komunitas</div>
                </div>
              </div>
              <div className="text-center mt-3">
                <div className="text-xs text-gray-500">*Harga komunitas untuk member komunitas terdaftar</div>
              </div>
            </div>
          </div>

          <div id="familyrun-category" className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-people-group text-accent text-2xl sm:text-3xl"></i>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-primary mb-2">Family Run</h3>
              <div className="text-accent text-2xl sm:text-3xl font-bold">2,5KM</div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-check text-primary text-sm"></i>
                <span className="text-gray-700 text-sm sm:text-base">BIB Number</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-check text-primary text-sm"></i>
                <span className="text-gray-700 text-sm sm:text-base">Jersey & Finisher Medali</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-check text-primary text-sm"></i>
                <span className="text-gray-700 text-sm sm:text-base">E-Certificate (1 Parent + 1 Child)</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-check text-primary text-sm"></i>
                <span className="text-gray-700 text-sm sm:text-base">Product Sponsor</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-check text-primary text-sm"></i>
                <span className="text-gray-700 text-sm sm:text-base">Refresher & Special Gift</span>
              </div>
            </div>
            <div className="mt-6 sm:mt-8 p-4 bg-gray-50 rounded-lg">
              <div className="text-xs sm:text-sm text-gray-600 mb-2">Biaya Pendaftaran:</div>
              <div className="text-xl sm:text-2xl font-bold text-primary">Rp 315.000</div>
              <div className="text-xs sm:text-sm text-gray-500">Per paket keluarga (1 Parent + 1 Child)</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 