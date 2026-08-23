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
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D2825] flex flex-col items-center justify-start selection:bg-[#8FA89B]/30 antialiased">
      {/* Real Full Responsive App Shell (No Fake Phone Frames, No Fake Hardware Bezels) */}
      <div className="w-full max-w-2xl min-h-screen flex flex-col bg-[#FAF8F5] relative sm:border-x sm:border-[#E8E1D7] sm:shadow-sm">
        {/* 1. Global Top Bar */}
        <TopBar
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenDiagnosis={() => setIsMicroscopyOpen(true)}
        />

        {/* 2. Dynamic Screens Container */}
        <main className="flex-1 overflow-y-auto">
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
            <div className="px-4 py-4 max-w-md mx-auto space-y-4 animate-in fade-in pb-24">
              <div className="card-sand p-4 border border-[#E2D9CD]">
                <div className="flex items-center gap-3">
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                  <div>
                    <h2 className="font-serif text-[20px] font-semibold text-[#2D2825]">
                      {userProfile.name}
                    </h2>
                    <p className="text-[12px] text-[#7E756F]">
                      {userProfile.skinType} • {userProfile.secondaryBiotype}
                    </p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-[#EBF1EE] text-[#4A6B5B] text-[10.5px] font-bold">
                      Racha: {userProfile.cycleStreakDays} Días Activos
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Cards */}
              <button
                onClick={() => setIsProfileOpen(true)}
                className="w-full card-white p-3.5 border border-[#E8E1D7] flex items-center justify-between hover:border-[#8FA89B] transition cursor-pointer text-left shadow-diffuse"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#F2ECE4] flex items-center justify-center text-[#4A6B5B]">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-serif font-semibold text-[15px] text-[#2D2825] block">
                      Configuración de Biotipo
                    </span>
                    <span className="text-[11.5px] text-[#7E756F]">
                      Sensibilidades y tolerancia a retinoides
                    </span>
                  </div>
                </div>
                <span className="text-[#8FA89B] text-[13px] font-semibold">&gt;</span>
              </button>

              <button
                onClick={() => setIsMicroscopyOpen(true)}
                className="w-full card-white p-3.5 border border-[#E8E1D7] flex items-center justify-between hover:border-[#8FA89B] transition cursor-pointer text-left shadow-diffuse"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#EBF1EE] flex items-center justify-center text-[#4A6B5B]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-serif font-semibold text-[15px] text-[#2D2825] block">
                      Informe de Integridad Epidérmica
                    </span>
                    <span className="text-[11.5px] text-[#7E756F]">
                      TEWL {userProfile.tewlScore} • 94% Salud Lipídica
                    </span>
                  </div>
                </div>
                <span className="text-[#8FA89B] text-[13px] font-semibold">&gt;</span>
              </button>

              {/* Clinical Ethics Box */}
              <div className="p-4 rounded-[20px] bg-[#EBF1EE] border border-[#8FA89B]/30 text-[12px] text-[#2D4A3E] space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#4A6B5B]" />
                  Compromiso Científico Allabout.skin
                </span>
                <p className="leading-relaxed">
                  Tus datos dermatológicos son procesados en local y contrastados en tiempo real con literatura médica indexada de PubMed y CosIng.
                </p>
              </div>
            </div>
          )}
        </main>

        {/* 3. Global Fixed Bottom Navigation Bar (64px) */}
        <BottomNavBar activeTab={activeTab} onChangeTab={setActiveTab} />
      </div>

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