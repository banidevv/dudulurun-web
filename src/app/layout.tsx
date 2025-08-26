import type { Metadata } from "next";
import { Poppins, Orbitron } from "next/font/google";
import "./globals.css";
import WhatsAppButton from "@/components/WhatsAppButton/WhatsAppButton";
import MetaPixel from "@/components/MetaPixel/MetaPixel";
import { Suspense } from "react";
import Script from "next/script";

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  subsets: ["latin"],
});

const orbitron = Orbitron({
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-orbitron',
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DuduluRun Fun Run 2025",
  description: "Berlari Bersama, Meraih Impian Bersama",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ scrollBehavior: 'smooth' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body
        className={`${poppins.variable} ${orbitron.variable} antialiased font-sans bg-gray-50`}
      >
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <MetaPixel />
        <Suspense fallback={<div>Loading...</div>}>
          {children}
        </Suspense>
        <WhatsAppButton />
      </body>
    </html>
  );
}
