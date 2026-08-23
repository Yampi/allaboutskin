'use client';

import React, { useState, useEffect } from 'react';
import { NavTab, UserProfile, ActiveIngredient, ProductShelfItem } from './types';
import { initialUserProfile, activeIngredientsList, productShelfList } from './skincareData';
import TopBar from './TopBar';
import BottomNavBar from './BottomNavBar';
import HomeScreen from './HomeScreen';
import ScannerScreen from './ScannerScreen';
import CycleScreen from './CycleScreen';
import LibraryScreen from './LibraryScreen';
import IngredientDetailModal from './IngredientDetailModal';
import MicroscopyModal from './MicroscopyModal';
import ProfileModal from './ProfileModal';
import { Sparkles, ShieldCheck, SlidersHorizontal, CheckCircle2, Award } from 'lucide-react';

const STORAGE_KEY_PROFILE = 'allabout_skin_user_profile_v2';
const STORAGE_KEY_SHELF = 'allabout_skin_shelf_items_v2';

export default function MobileAppContainer() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
  const [shelfItems, setShelfItems] = useState<ProductShelfItem[]>(productShelfList);
  const [isLoaded, setIsLoaded] = useState(false);

  // Modals
  const [selectedIngredient, setSelectedIngredient] = useState<ActiveIngredient | null>(null);
  const [isMicroscopyOpen, setIsMicroscopyOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Load real user state from localStorage on client mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }

      const savedShelf = localStorage.getItem(STORAGE_KEY_SHELF);
      if (savedShelf) {
        setShelfItems(JSON.parse(savedShelf));
      }
    } catch (e) {
      console.warn('Could not read from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Persist profile updates
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(next));
      } catch (e) {
        console.warn('Could not save profile to localStorage:', e);
      }
      return next;
    });

    showToast('Perfil dermatológico calibrado con éxito.');
  };

  // Complete a cycling night
  const handleCompleteNight = (completedNight: number) => {
    setUserProfile((prev) => {
      const next: UserProfile = {
        ...prev,
        cycleStreakDays: prev.cycleStreakDays + 1,
        activeNight: (completedNight % 4) + 1,
      };
      try {
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(next));
      } catch (e) {
        console.warn('Could not save streak to localStorage:', e);
      }
      return next;
    });
  };

  // Add real evaluated product from camera/scanner to shelf
  const handleAddProductToShelf = (newProduct: ProductShelfItem) => {
    setShelfItems((prev) => {
      const exists = prev.some((p) => p.name.toLowerCase() === newProduct.name.toLowerCase());
      const next = exists ? prev : [newProduct, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY_SHELF, JSON.stringify(next));
      } catch (e) {
        console.warn('Could not save shelf to localStorage:', e);
      }
      return next;
    });

    showToast(`"${newProduct.name}" añadido a tu estantería.`);
  };

  const showToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D2825] flex flex-col selection:bg-[#8FA89B]/30 antialiased">
      {/* 1. Global Responsive Top Bar (Sticky 72px-80px on Desktop, 56px on Mobile) */}
      <TopBar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        userProfile={userProfile}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenDiagnosis={() => setIsMicroscopyOpen(true)}
      />

      {/* 2. Dynamic Screens Container (max-w-7xl on desktop, full width on mobile) */}
      <main className="flex-1 w-full pb-20 lg:pb-10">
        {activeTab === 'home' && (
          <HomeScreen
            userProfile={userProfile}
            shelfItems={shelfItems}
            onChangeTab={setActiveTab}
            onOpenProfileModal={() => setIsProfileOpen(true)}
            onOpenMicroscopyModal={() => setIsMicroscopyOpen(true)}
            onSelectIngredient={(ing) => setSelectedIngredient(ing)}
          />
        )}

        {activeTab === 'scanner' && (
          <ScannerScreen
            onAddProductToShelf={handleAddProductToShelf}
            onSelectIngredient={(ing) => setSelectedIngredient(ing)}
            onUpdateProfile={handleUpdateProfile}
            userProfile={userProfile}
          />
        )}

        {activeTab === 'cycle' && (
          <CycleScreen
            userProfile={userProfile}
            onCompleteNight={handleCompleteNight}
          />
        )}

        {activeTab === 'library' && (
          <LibraryScreen
            onSelectIngredient={(ing) => setSelectedIngredient(ing)}
          />
        )}

        {activeTab === 'profile' && (
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in">
            {/* Header Profile Card */}
            <div className="card-sand p-6 border border-[#E2D9CD] rounded-[24px] shadow-diffuse flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                  <div
                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#4A6B5B] rounded-full border-2 border-[#FAF8F5] flex items-center justify-center text-white text-[10px]"
                    title="Validación Activa"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-sans font-bold text-[#4A6B5B] uppercase tracking-wider block">
                    Expediente Dermatológico
                  </span>
                  <h2 className="font-serif text-[24px] sm:text-[28px] font-semibold text-[#2D2825] leading-tight">
                    {userProfile.name}
                  </h2>
                  <p className="text-[13px] text-[#7E756F] mt-0.5">
                    Biotipo: <strong className="text-[#2D2825]">{userProfile.skinType}</strong> • {userProfile.secondaryBiotype}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="px-4 py-2 rounded-[16px] bg-white border border-[#E2D9CD] text-center">
                  <span className="text-[10px] uppercase font-bold text-[#7E756F] block">
                    Racha de Ciclado
                  </span>
                  <span className="font-serif text-[18px] font-bold text-[#4A6B5B]">
                    {userProfile.cycleStreakDays} Días
                  </span>
                </div>
                <div className="px-4 py-2 rounded-[16px] bg-white border border-[#E2D9CD] text-center">
                  <span className="text-[10px] uppercase font-bold text-[#7E756F] block">
                    TEWL Cutáneo
                  </span>
                  <span className="font-serif text-[18px] font-bold text-[#4A6B5B]">
                    {userProfile.tewlScore}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setIsProfileOpen(true)}
                className="card-white p-5 border border-[#E8E1D7] rounded-[20px] flex items-center justify-between hover:border-[#8FA89B] hover:shadow-diffuse-elevated transition cursor-pointer text-left shadow-diffuse group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#F2ECE4] group-hover:bg-[#EBF1EE] flex items-center justify-center text-[#4A6B5B] transition">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-serif font-semibold text-[17px] text-[#2D2825] block">
                      Configuración de Biotipo
                    </span>
                    <span className="text-[12px] text-[#7E756F]">
                      Sensibilidades, alergias y tolerancia a retinoides
                    </span>
                  </div>
                </div>
                <span className="text-[#8FA89B] font-semibold text-[16px] group-hover:translate-x-1 transition">&gt;</span>
              </button>

              <button
                onClick={() => setIsMicroscopyOpen(true)}
                className="card-white p-5 border border-[#E8E1D7] rounded-[20px] flex items-center justify-between hover:border-[#8FA89B] hover:shadow-diffuse-elevated transition cursor-pointer text-left shadow-diffuse group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#EBF1EE] group-hover:bg-[#8FA89B]/20 flex items-center justify-center text-[#4A6B5B] transition">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-serif font-semibold text-[17px] text-[#2D2825] block">
                      Informe de Integridad Epidérmica
                    </span>
                    <span className="text-[12px] text-[#7E756F]">
                      Microscopía óptica y biomarcadores de barrera
                    </span>
                  </div>
                </div>
                <span className="text-[#8FA89B] font-semibold text-[16px] group-hover:translate-x-1 transition">&gt;</span>
              </button>
            </div>

            {/* Clinical Ethics Box */}
            <div className="p-5 rounded-[22px] bg-[#EBF1EE] border border-[#8FA89B]/30 text-[13px] text-[#2D4A3E] space-y-1.5 shadow-diffuse">
              <span className="font-bold flex items-center gap-2 text-[14px]">
                <Sparkles className="w-4 h-4 text-[#4A6B5B]" />
                Compromiso de Privacidad y Rigor Científico
              </span>
              <p className="leading-relaxed text-[#4A433E]">
                Tus datos de diagnóstico se almacenan de forma local en tu dispositivo y las fórmulas se evalúan en tiempo real contra los registros oficiales de CosIng (UE) y literatura indexada en PubMed (NCBI).
              </p>
            </div>
          </div>
        )}
      </main>

      {/* 3. Global Fixed Bottom Navigation Bar (Hidden on Desktop via lg:hidden) */}
      <BottomNavBar activeTab={activeTab} onChangeTab={setActiveTab} />


      {/* Global Toast Notification */}
      {successToast && (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto animate-in slide-in-from-top duration-300">
          <div className="p-3.5 rounded-full bg-[#4A6B5B] text-white shadow-2xl flex items-center justify-between px-4 border border-[#8FA89B]">
            <span className="text-[12.5px] font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#DFCAAC]" />
              {successToast}
            </span>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <IngredientDetailModal
        ingredient={selectedIngredient}
        onClose={() => setSelectedIngredient(null)}
      />

      <MicroscopyModal
        isOpen={isMicroscopyOpen}
        onClose={() => setIsMicroscopyOpen(false)}
        userProfile={userProfile}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={handleUpdateProfile}
      />
    </div>
  );
}