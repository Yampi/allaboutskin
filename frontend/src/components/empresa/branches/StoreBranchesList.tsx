'use client';

import React from 'react';
import { BusinessBranchItem } from '@/lib/api';
import StoreBranchCard from './StoreBranchCard';

interface StoreBranchesListProps {
  branches: BusinessBranchItem[];
  onEdit: (b: BusinessBranchItem) => void;
  onDelete: (id: number) => void;
  onCopySlug: (slug: string) => void;
  copiedSlug: string | null;
}

export default function StoreBranchesList({
  branches,
  onEdit,
  onDelete,
  onCopySlug,
  copiedSlug,
}: StoreBranchesListProps) {
  if (branches.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-xs text-slate-500 shadow-xs">
        No hay sucursales registradas. Haz clic en "Añadir Sucursal" para agregar la primera.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {branches.map((b) => (
        <StoreBranchCard
          key={b.id}
          branch={b}
          canDelete={branches.length > 1}
          onEdit={onEdit}
          onDelete={onDelete}
          onCopySlug={onCopySlug}
          isCopied={copiedSlug === b.slug}
        />
      ))}
    </div>
  );
}
