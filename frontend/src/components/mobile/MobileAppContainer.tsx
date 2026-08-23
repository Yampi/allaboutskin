'use client';

import React, { useState } from 'react';
import { NavTab, UserProfile, ActiveIngredient } from './types';
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
import { Smartphone, Monitor, Sparkles, ShieldCheck, Heart, SlidersHorizontal } from 'lucide-react';

export default function MobileAppContainer() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);

  // Modals
  const [selectedIngredient, setSelectedIngredient] = useState<ActiveIngredient | null>(null);
  const [isMicroscopyOpen, setIsMicroscopyOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Desktop Device Frame Simulator toggle (default true for desktop)
  const [isDeviceFrame, setIsDeviceFrame] = useState(true);

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updated }));
  };

  const handleCompleteNight = (completedNight: number) => {
    setUserProfile((prev) => ({
      ...prev,
      cycleStreakDays: prev.cycleStreakDays + 1,
      activeNight: (completedNight % 4) + 1,
    }));
  };

  const handleAddProductToShelf = (productName: string, brand: string) => {
    // Add success toast or internal update
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D2825] flex flex-col items-center justify-start selection:bg-[#8FA89B]/30">
      {/* Desktop Preview Header Switcher (Visible on Large Screens for Paired Design Review) */}
      <div className="hidden lg:flex items-center justify-between w-full max-w-5xl px-6 py-3 border-b border-[#E8E1D7] text-[12px] text-[#7E756F]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#4A6B5B]" />
          <span className="font-serif font-semibold text-[#2D2825] text-[14px]">
            Allabout.skin — Mobile App Design System
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#EBF1EE] text-[#4A6B5B] text-[10px] font-bold">
            Fase 4 Noches • Playfair + Inter
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDeviceFrame(!isDeviceFrame)}
            className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition border cursor-pointer ${
              isDeviceFrame
                ? 'bg-[#4A6B5B] text-white border-[#4A6B5B]'
                : 'bg-white text-[#2D2825] border-[#E8E1D7] hover:border-[#8FA89B]'
            }`}
          >
            {isDeviceFrame ? (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>Modo Frame Móvil (390px)</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span>Modo Pantalla Completa</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Mobile App Wrapper */}
      <div
        className={`w-full transition-all duration-300 flex flex-col ${
          isDeviceFrame
            ? 'max-w-[430px] my-0 sm:my-6 rounded-none sm:rounded-[36px] border-0 sm:border-[8px] sm:border-[#2D2825] shadow-none sm:shadow-2xl overflow-hidden bg-[#FAF8F5] min-h-[850px] relative'
            : 'max-w-md w-full bg-[#FAF8F5]'
        }`}
      >
        {/* iOS-Style Notch Bar / Top Indicator in Frame Mode */}
        {isDeviceFrame && (
          <div className="hidden sm:flex items-center justify-between px-6 pt-3 pb-1 bg-[#FAF8F5] text-[12px] font-semibold text-[#2D2825] border-b border-[#E8E1D7]/30">
            <span>9:41</span>
            <div className="w-20 h-4 bg-[#2D2825] rounded-full mx-auto" />
            <div className="flex items-center gap-1.5 text-[10px]">
              <span>5G</span>
              <div className="w-4 h-2.5 border border-[#2D2825] rounded-xs p-0.5 flex items-center">
                <div className="w-full h-full bg-[#2D2825] rounded-2xs" />
              </div>
            </div>
          </div>
        )}

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
                  Tus datos dermatológicos son procesados exclusivamente en local y contrastados con literatura médica de acceso abierto de PubMed y CosIng.
                </p>
              </div>
            </div>
          )}
        </main>

        {/* 3. Global Fixed Bottom Navigation Bar (64px) */}
        <BottomNavBar activeTab={activeTab} onChangeTab={setActiveTab} />
      </div>

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