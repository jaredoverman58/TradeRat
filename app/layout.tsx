import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import Script from 'next/script';
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  variable: '--font-playfair',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Trade Rat - Fantasy Football Trade Advice",
  description: "Get expert fantasy football trade advice from The Trade Rat, The Badger, and The Monkey",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${dmSans.variable}`} style={{ backgroundColor: '#0C0A07', margin: 0, padding: 0 }}>
        {/* Google Ads Conversion Tracking */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18405181508"
          strategy="afterInteractive"
        />
        <Script id="google-ads-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18405181508');
          `}
        </Script>

        {children}
      </body>
    </html>
  );
}
