'use client';

import React, { useState } from 'react';
import { SkincareProvider, useSkincare } from '@/context/SkincareContext';
import GlobalNavbar from './GlobalNavbar';
import MobileDock from './MobileDock';
import ProfileModal from '@/components/mobile/ProfileModal';
import MicroscopyModal from '@/components/mobile/MicroscopyModal';

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { userProfile, updateProfile } = useSkincare();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDiagnosisOpen, setIsDiagnosisOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#2D2825] selection:bg-[#8FA89B]/30 antialiased">
      {/* 1. Universal Responsive Navbar */}
      <GlobalNavbar
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenDiagnosis={() => setIsDiagnosisOpen(true)}
      />

      {/* 2. Main Page Content */}
      <main className="flex-1 w-full pb-24 lg:pb-12">
        {children}
      </main>

      {/* 3. Universal Mobile Bottom Dock (Hidden on >= lg) */}
      <MobileDock />

      {/* 4. Global Modals */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={updateProfile}
      />

      <MicroscopyModal
        isOpen={isDiagnosisOpen}
        onClose={() => setIsDiagnosisOpen(false)}
        userProfile={userProfile}
      />
    </div>
  );
}

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <SkincareProvider>
      <LayoutInner>{children}</LayoutInner>
    </SkincareProvider>
  );
}
