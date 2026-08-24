import { Metadata } from 'next';
import MobileAppContainer from '@/components/mobile/MobileAppContainer';

export const metadata: Metadata = {
  title: 'Allabout.skin — Mobile App & Auditoría Científica de Skincare',
  description: 'Sistema de diseño móvil de Allabout.skin: Perfil de Skin Cycling 4 Fases, Escáner AR INCI, Calendario de Ciclado y Biblioteca de Activos Cosméticos.',
  openGraph: {
    title: 'Allabout.skin — Mobile App & Auditoría Científica de Skincare',
    description: 'Sistema de diseño móvil de Allabout.skin: Perfil de Skin Cycling 4 Fases, Escáner AR INCI, Calendario de Ciclado y Biblioteca de Activos Cosméticos.',
    url: 'https://allaboutskin.vercel.app',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Allabout.skin — Mobile App & Auditoría Científica de Skincare',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Allabout.skin — Mobile App & Auditoría Científica de Skincare',
    description: 'Sistema de diseño móvil de Allabout.skin: Perfil de Skin Cycling 4 Fases, Escáner AR INCI, Calendario de Ciclado y Biblioteca de Activos Cosméticos.',
    images: ['/og-image.jpg'],
  },
};

export default function Home() {
  return <MobileAppContainer />;
}

