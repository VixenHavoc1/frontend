// src/app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; // Import global CSS

// Google font setup
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Voxella AI",
  description: "Your AI sexting chatbot",
  viewport: "width=device-width, initial-scale=1.0", 
  icons: {
    icon: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic34.png", // ✅ Add this line
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
