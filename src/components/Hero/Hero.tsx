import React from 'react';

interface HeroProps {
  title: string;
  description: string;
  backgroundType: 'video' | 'image' | 'youtube';
  backgroundSrc?: string;
  videoMobileFallback?: string;
  youtubeConfig?: {
    videoId: string;
    startTime?: number;
  };
}

export const Hero: React.FC<HeroProps> = ({
  title,
  description,
  backgroundType,
  backgroundSrc,
  videoMobileFallback,
  youtubeConfig
}) => {
  const scrollToRegistration = () => {
    const element = document.getElementById('registrasi');
    if (element) {
      const headerHeight = 80;
      const targetPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  const scrollToAbout = () => {
    const element = document.getElementById('tentang');
    if (element) {
      const headerHeight = 80;
      const targetPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  const renderBackground = () => {
    if (backgroundType === 'video' && backgroundSrc) {
      return (
        <>
          {/* Video Background on the right side */}
          <div className="absolute right-0 top-0 w-full md:w-3/5 h-full overflow-hidden">
            <video
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src={backgroundSrc} type="video/mp4" />
              {/* Fallback image for mobile or if video fails */}
              <img
                src={videoMobileFallback || "/images/hero-bg.jpg"}
                alt="Hero background"
                className="w-full h-full object-cover"
              />
            </video>
          </div>

          {/* Smooth gradient overlay from left to right */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/100 via-primary/95 via-primary/80 via-primary/60 via-primary/40 to-transparent"></div>
        </>
      );
    }

    // Fallback to image
    return (
      <>
        <img
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          src={videoMobileFallback || "/images/hero-bg.jpg"}
          alt="runners in marathon race with mountain landscape background, cinematic style"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </>
    );
  };

  return (
    <section id="beranda" className="pt-20 bg-gradient-to-br from-primary to-teal-800 text-white h-screen relative overflow-hidden">
      {renderBackground()}

      <div className="container mx-auto px-6 relative z-10 h-full flex items-center">
        <div className="max-w-2xl md:max-w-xl lg:max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {title}
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-200">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <span
              onClick={scrollToRegistration}
              className="bg-accent text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-orange-600 transition-colors inline-flex items-center justify-center cursor-pointer"
            >
              <i className="fa-solid fa-user-plus mr-2"></i>
              Daftar Sekarang
            </span>
            <span
              onClick={scrollToAbout}
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-primary transition-colors inline-flex items-center justify-center cursor-pointer"
            >
              <i className="fa-solid fa-info-circle mr-2"></i>
              Pelajari Lebih Lanjut
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}; 