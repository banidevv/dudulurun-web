'use client';

import { Navigation } from '@/components/Navigation/Navigation';
import { Hero } from '@/components/Hero/Hero';
import { About } from '@/components/About/About';
import { Schedule } from '@/components/Schedule/Schedule';
import { RaceCategory } from '@/components/RaceCategory/RaceCategory';
import { FAQ } from '@/components/FAQ/FAQ';
import Regulation from '@/components/Regulation/Regulation';
import { Footer } from '@/components/Footer/Footer';
import { Registration } from '@/components/Registration/Registration';

export default function Home() {

  return (
    <main className="min-h-screen">
      <Navigation />
      <div id="beranda">
        <Hero
          title="MENANG KALAH DUDULURUN"
          description="Bukan untuk jadi yang tercepat tapi untuk menciptakan momen yang paling hangat"
          backgroundType="video"
          backgroundSrc="/video/footage.mp4"
          videoMobileFallback="/images/hero-bg.jpg"
        />
      </div>

      <div id="tentang">
        <About
        />
      </div>
      <div id="jadwal">
        <Schedule />
      </div>
      <div id="kategori">
        <RaceCategory />
      </div>
      <div id="regulasi">
        <Regulation />
      </div>
      <div id="faq">
        <FAQ />
      </div>
      <div id="registrasi">
        <Registration />
      </div>
      <Footer />
    </main>
  );
}
