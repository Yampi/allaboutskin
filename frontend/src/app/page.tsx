import { Metadata } from 'next';
import MobileAppContainer from '@/components/mobile/MobileAppContainer';

export const metadata: Metadata = {
  title: 'Allabout.skin — Mobile App & Auditoría Científica de Skincare',
  description: 'Sistema de diseño móvil de Allabout.skin: Perfil de Skin Cycling 4 Fases, Escáner AR INCI, Calendario de Ciclado y Biblioteca de Activos Cosméticos.',
};

export default function Home() {
  return <MobileAppContainer />;
}

