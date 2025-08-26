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
        <footer id="footer" className="bg-gray-900 text-white py-12">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            {/* <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <i className="fa-solid fa-person-running text-white"></i>
                            </div> */}
                            {/* <span className="text-xl font-bold">DuduluRun</span> */}
                            <img src="/images/logo-white.png" className="w-[120px] h-[100px]" />
                        </div>
                        {/* <p className="text-gray-400 mb-4">
                            Event lari terbaik untuk semua kalangan dengan pengalaman yang tak terlupakan.
                        </p> */}
                        <div className="flex space-x-4">
                            
                            <span className="text-gray-400 hover:text-white cursor-pointer">
                                <i className="fa-brands fa-instagram text-xl"></i>
                            </span>
                            <span className="text-gray-400 hover:text-white cursor-pointer">
                                <i className="fa-brands fa-tiktok text-xl"></i>
                            </span>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li>
                                <span
                                    onClick={() => scrollToSection('beranda')}
                                    className="hover:text-white cursor-pointer"
                                >
                                    Beranda
                                </span>
                            </li>
                            <li>
                                <span
                                    onClick={() => scrollToSection('tentang')}
                                    className="hover:text-white cursor-pointer"
                                >
                                    About Us
                                </span>
                            </li>
                            <li>
                                <span
                                    onClick={() => scrollToSection('jadwal')}
                                    className="hover:text-white cursor-pointer"
                                >
                                    Event Schedule
                                </span>
                            </li>
                            <li>
                                <span
                                    onClick={() => scrollToSection('registrasi')}
                                    className="hover:text-white cursor-pointer"
                                >
                                    Registration
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Categories</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li>
                                <span
                                    onClick={() => scrollToSection('kategori')}
                                    className="hover:text-white cursor-pointer"
                                >
                                    Fun Run
                                </span>
                            </li>
                            <li>
                                <span
                                    onClick={() => scrollToSection('kategori')}
                                    className="hover:text-white cursor-pointer"
                                >
                                    Family Run
                                </span>
                            </li>
                            <li>
                                <span
                                    onClick={() => scrollToSection('regulasi')}
                                    className="hover:text-white cursor-pointer"
                                >
                                    Regulation
                                </span>
                            </li>
                            <li>
                                <span
                                    onClick={() => scrollToSection('faq')}
                                    className="hover:text-white cursor-pointer"
                                >
                                    FAQ
                                </span>
                            </li>
                        </ul>
                    </div>


                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                    <p>© 2025 DuduluRun Fun Run. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
