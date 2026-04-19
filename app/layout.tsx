import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SIAP - Sistem Informasi Aduan Publik",
  description: "Layanan Aduan Diskominfo Karanganyar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}