import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SidebarWrapper from '@/components/SidebarWrapper';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "COP - Control de Operaciones Públicas",
  description: "Plataforma SaaS para la gestión de expedientes y bienes públicos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased bg-[#F4F5f7]`}>
        <SidebarWrapper>
          {children}
        </SidebarWrapper>
      </body>
    </html>
  );
}
