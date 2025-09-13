import React from 'react';

export const About = () => {
  return (
    <section id="tentang" className="py-12 sm:py-16 lg:py-20 bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">Bukan sekedar event lari !</h2>
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
              Event ini adalah tempat di mana orang-orang dari segala kalangan — muda, tua, keluarga, teman, bahkan yang baru kenal — bisa ngariung, lari bareng, jadi dulur. Dengan tema "Sadulur Sasarengan", Dudulurun mengajak urang Bandung dan luar Bandung buat gerak bareng dalam suasana fun, rame, dan menyenangkan.
            </p>
            <div className="grid grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <i className="fa-solid fa-users text-primary text-lg sm:text-2xl"></i>
                </div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">400+</h3>
                <p className="text-xs sm:text-sm text-gray-600">Peserta</p>
              </div>
              <div className="text-center">
                <div className="bg-accent/10 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <i className="fa-solid fa-route text-accent text-lg sm:text-2xl"></i>
                </div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">2</h3>
                <p className="text-xs sm:text-sm text-gray-600">Kategori Event</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <i className="fa-solid fa-trophy text-primary text-lg sm:text-2xl"></i>
                </div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">50+</h3>
                <p className="text-xs sm:text-sm text-gray-600">Hadiah</p>
              </div>
            </div>
          </div>
          <div className="relative order-1 lg:order-2">
            <img
              className="rounded-2xl shadow-lg w-full h-64 sm:h-80 lg:h-[500px] object-cover"
              src="https://ik.imagekit.io/waters2021/sehataqua/uploads/fun-run-adalah-20240611091711.jpg?tr=w-660,h-371,q-50,fo-auto,f-webp"
              alt="diverse group of people running together in fun run event, community sports illustration, healthy lifestyle"
            />
            <div className="absolute -bottom-3 -left-3 sm:-bottom-6 sm:-left-6 bg-accent rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
              <h4 className="font-bold text-lg sm:text-xl mb-1 sm:mb-2">Daftar Sekarang!</h4>
              <p className="text-xs sm:text-sm opacity-90">Bergabung dengan ratusan peserta lainnya</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 