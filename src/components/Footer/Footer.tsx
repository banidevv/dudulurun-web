import React from 'react';

export const Footer = () => {
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
    };

    return (
        <footer id="footer" className="bg-gray-900 text-white py-8 sm:py-12">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    <div className="sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center space-x-2 mb-4">
                            <img src="/images/logo-white.png" className="w-20 h-16 sm:w-24 sm:h-20 lg:w-[120px] lg:h-[100px]" alt="DuduluRun Logo" />
                        </div>
                        <div className="flex space-x-4">
                            <span className="text-gray-400 hover:text-white cursor-pointer touch-manipulation">
                                <i className="fa-brands fa-instagram text-lg sm:text-xl"></i>
                            </span>
                            <span className="text-gray-400 hover:text-white cursor-pointer touch-manipulation">
                                <i className="fa-brands fa-tiktok text-lg sm:text-xl"></i>
                            </span>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li>
                                <span
                                    onClick={() => scrollToSection('beranda')}
                                    className="hover:text-white cursor-pointer text-sm sm:text-base touch-manipulation block py-1"
                                >
                                    Beranda
                                </span>
                            </li>
                            <li>
                                <span
                                    onClick={() => scrollToSection('tentang')}
                                    className="hover:text-white cursor-pointer text-sm sm:text-base touch-manipulation block py-1"
                                >
                                    About Us
                                </span>
                            </li>
                            <li>
                                <span
                                    onClick={() => scrollToSection('jadwal')}
                                    className="hover:text-white cursor-pointer text-sm sm:text-base touch-manipulation block py-1"
                                >
                                    Event Schedule
                                </span>
                            </li>
                            <li>
                                <span
                                    onClick={() => scrollToSection('registrasi')}
                                    className="hover:text-white cursor-pointer text-sm sm:text-base touch-manipulation block py-1"
                                >
                                    Registration
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Categories</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li>
                                <span
                                    onClick={() => scrollToSection('kategori')}
                                    className="hover:text-white cursor-pointer text-sm sm:text-base touch-manipulation block py-1"
                                >
                                    Fun Run
                                </span>
                            </li>
                            <li>
                                <span
                                    onClick={() => scrollToSection('kategori')}
                                    className="hover:text-white cursor-pointer text-sm sm:text-base touch-manipulation block py-1"
                                >
                                    Family Run
                                </span>
                            </li>
                            <li>
                                <span
                                    onClick={() => scrollToSection('regulasi')}
                                    className="hover:text-white cursor-pointer text-sm sm:text-base touch-manipulation block py-1"
                                >
                                    Regulation
                                </span>
                            </li>
                            <li>
                                <span
                                    onClick={() => scrollToSection('faq')}
                                    className="hover:text-white cursor-pointer text-sm sm:text-base touch-manipulation block py-1"
                                >
                                    FAQ
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400">
                    <p className="text-xs sm:text-sm">© 2025 DuduluRun Fun Run. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
