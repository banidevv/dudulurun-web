'use client';

import { useState } from 'react';

interface PhotoPreviewerProps {
    src: string;
    alt: string;
    className?: string;
}

export default function PhotoPreviewer({ src, alt, className = "" }: PhotoPreviewerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    return (
        <>
            {/* Clickable image */}
            <img
                src={src}
                alt={alt}
                className={`cursor-pointer hover:opacity-80 transition-opacity ${className}`}
                onClick={openModal}
            />

            {/* Modal overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={closeModal}
                >
                    {/* Modal content */}
                    <div
                        className="relative max-w-4xl max-h-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={closeModal}
                            className="absolute -top-10 right-0 text-white text-2xl font-bold hover:text-gray-300 transition-colors"
                        >
                            ✕
                        </button>

                        {/* Image */}
                        <img
                            src={src}
                            alt={alt}
                            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
