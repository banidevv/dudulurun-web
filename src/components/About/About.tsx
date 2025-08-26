import React from 'react';

export const About = () => {
  return (
    <section id="tentang" className="py-20 bg-white h-screen">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Bukan sekedar event lari !</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Event ini adalah tempat di mana orang-orang dari segala kalangan — muda, tua, keluarga, teman, bahkan yang baru kenal — bisa ngariung, lari bareng, jadi dulur. Dengan tema “Sadulur Sasarengan”, Dudulurun mengajak urang Bandung dan luar Bandung buat gerak bareng dalam suasana fun, rame, dan menyenangkan.
            </p>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <i className="fa-solid fa-users text-primary text-2xl"></i>
                </div>
                <h3 className="font-semibold text-gray-800">400+</h3>
                <p className="text-sm text-gray-600">Peserta</p>
              </div>
              <div className="text-center">
                <div className="bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <i className="fa-solid fa-route text-accent text-2xl"></i>
                </div>
                <h3 className="font-semibold text-gray-800">2</h3>
                <p className="text-sm text-gray-600">Kategori Event</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <i className="fa-solid fa-trophy text-primary text-2xl"></i>
                </div>
                <h3 className="font-semibold text-gray-800">50+</h3>
                <p className="text-sm text-gray-600">Hadiah</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <img
              className="rounded-2xl shadow-lg w-full h-[500px] object-cover"
              src="https://ik.imagekit.io/waters2021/sehataqua/uploads/fun-run-adalah-20240611091711.jpg?tr=w-660,h-371,q-50,fo-auto,f-webp"
              alt="diverse group of people running together in fun run event, community sports illustration, healthy lifestyle"
            />
            <div className="absolute -bottom-6 -left-6 bg-accent rounded-2xl p-6 text-white">
              <h4 className="font-bold text-xl mb-2">Daftara Sekarang!</h4>
              <p className="text-sm opacity-90">Bergabung dengan ratusan peserta lainnya</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 