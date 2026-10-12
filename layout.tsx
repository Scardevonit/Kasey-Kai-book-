import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kasey Kai — Private Gift Boutique | Book Kasey Kai Today",
  description:
    "The official Kasey Kai gift boutique. Purchase & send luxury gift cards securely in one private place. Only Kasey Kai — Book Kasey Kai Today.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Outfit:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0d070d] text-[#fff7f2] antialiased">{children}</body>
    </html>
  );
}
