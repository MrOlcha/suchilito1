import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { initializeMonitoring } from '../lib/init-monitoring';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'POS - Sistema de Ventas',
  description: 'Sistema de punto de venta para administración',
  icons: {
    icon: '/pos/images/favicon.png',
  },
};

// Inicializar monitoreo al arrancar el servidor
initializeMonitoring().catch(console.error);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/pos/images/favicon.png" type="image/png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}