'use client';

import { useState } from 'react';
import { Check, Loader2, MapPin, Navigation } from 'lucide-react';
import { CityPreset, LocationStatus, PRESET_CITIES } from '@/hooks/useNearbyBranches';

interface LocationBarProps {
  location: CityPreset;
  status: LocationStatus;
  onRequestGps: () => void;
  onSelectCity: (city: CityPreset) => void;
}

export default function LocationBar({ location, status, onRequestGps, onSelectCity }: LocationBarProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <div className="space-y-2">
      <div className="inline-flex flex-wrap items-center gap-2.5 bg-white border border-[#E8E1D7] px-4 py-2 rounded-2xl shadow-2xs text-xs">
        {status === 'asking' ? (
          <>
            <Loader2 className="w-4 h-4 text-[#2E7D5B] animate-spin shrink-0" />
            <span className="text-[#66615C]">Buscando tu ubicación…</span>
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4 text-[#2E7D5B] shrink-0" />
            <span className="text-[#66615C]">Buscando cerca de:</span>
            <span className="font-bold text-[#2D2825]">{location.name}</span>
          </>
        )}
        <button
          type="button"
          onClick={() => setIsPickerOpen((open) => !open)}
          className="px-3 py-1 bg-[#FAF8F5] hover:bg-[#E6F4EC] hover:text-[#2E7D5B] text-[#2D2825] border border-[#E8E1D7] rounded-xl font-bold text-[11px] transition cursor-pointer"
        >
          Cambiar
        </button>
      </div>

      {status === 'denied' && (
        <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 max-w-xl">
          No pudimos usar tu ubicación, así que te mostramos tiendas en {location.shortName}. Puedes permitir la
          ubicación en tu navegador o elegir otra ciudad con «Cambiar».
        </p>
      )}

      {isPickerOpen && (
        <div className="bg-white border border-[#E8E1D7] rounded-2xl p-2 shadow-xs max-w-sm space-y-1">
          <button
            type="button"
            onClick={() => {
              onRequestGps();
              setIsPickerOpen(false);
            }}
            className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-[#E6F4EC] text-[#2E7D5B] text-xs font-bold hover:bg-[#D5E2DB] transition cursor-pointer text-left"
          >
            <Navigation className="w-4 h-4" />
            <span>Usar mi ubicación actual</span>
          </button>
          {PRESET_CITIES.map((city) => {
            const isSelected = status === 'city' && location.name === city.name;
            return (
              <button
                key={city.name}
                type="button"
                onClick={() => {
                  onSelectCity(city);
                  setIsPickerOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition cursor-pointer text-left ${
                  isSelected ? 'bg-[#FAF8F5] font-bold text-[#2D2825]' : 'text-[#66615C] hover:bg-[#FAF8F5]'
                }`}
              >
                <span>{city.name}</span>
                {isSelected && <Check className="w-4 h-4 text-[#2E7D5B]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
