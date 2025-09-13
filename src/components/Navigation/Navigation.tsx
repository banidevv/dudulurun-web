import React, { useState, useEffect } from 'react';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Home', href: 'beranda' },
  { label: 'About Us', href: 'tentang' },
  { label: 'Event Schedule', href: 'jadwal' },
  { label: 'Categories', href: 'kategori' },
  { label: 'Regulation', href: 'regulasi' },
  { label: 'FAQ', href: 'faq' },
];

export const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeItem, setActiveItem] = useState('beranda');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px',
      threshold: 0,
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveItem(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    // Observe all sections
    navItems.forEach((item) => {
      const element = document.getElementById(item.href);
      if (element) observer.observe(element);
    });

    return () => {
      navItems.forEach((item) => {
        const element = document.getElementById(item.href);
        if (element) observer.unobserve(element);
      });
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80;
      const targetPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
    setActiveItem(sectionId);
    setIsMobileMenuOpen(false);
  };

  const scrollToRegistration = () => {
    scrollToSection('registrasi');
  };

  return (
    <header id="header" className="bg-white shadow-md fixed top-0 w-full z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/images/logo.png" className="w-20 h-16 sm:w-24 sm:h-20 md:w-[120px] md:h-[100px]" alt="DuduluRun Logo" />
          </div>

          <nav id="main-nav" className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navItems.map((item) => (
              <span
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className={`font-medium transition-colors cursor-pointer text-sm lg:text-base ${activeItem === item.href ? 'text-primary' : 'text-gray-700 hover:text-primary'
                  }`}
              >
                {item.label}
              </span>
            ))}
            <span
              onClick={scrollToRegistration}
              className="bg-accent text-white px-4 lg:px-6 py-2 rounded-full font-semibold hover:bg-orange-600 transition-colors cursor-pointer text-sm lg:text-base touch-manipulation"
            >
              Daftar Sekarang
            </span>
          </nav>

          <button
            id="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-700 p-2 touch-manipulation"
            aria-label="Toggle mobile menu"
          >
            <i className={`fa-solid ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col space-y-1 pt-4">
              {navItems.map((item) => (
                <span
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className={`py-3 px-4 font-medium transition-colors cursor-pointer touch-manipulation rounded-lg ${activeItem === item.href ? 'text-primary bg-gray-50' : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                    }`}
                >
                  {item.label}
                </span>
              ))}
              <span
                onClick={scrollToRegistration}
                className="bg-accent text-white px-4 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors cursor-pointer text-center mt-2 touch-manipulation"
              >
                Daftar Sekarang
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}; 