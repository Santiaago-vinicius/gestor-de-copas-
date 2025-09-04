// src/app/campeonatos/[id]/ConfrontationModeSelector.tsx
'use client';

import { useTransition } from 'react';
import { updateConfrontationMode } from './actions';

type SelectorProps = {
  championshipId: string;
  currentMode: string | null;
};

export default function ConfrontationModeSelector({ championshipId, currentMode }: SelectorProps) {
  const [isPending, startTransition] = useTransition();

  const handleModeChange = (mode: string) => {
    startTransition(() => {
      updateConfrontationMode(championshipId, mode);
    });
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg mt-4">
      <h3 className="text-lg font-semibold mb-2">Modo de Confronto dos Grupos</h3>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="confrontationMode"
            checked={currentMode === 'INTRA_GROUP' || !currentMode}
            onChange={() => handleModeChange('INTRA_GROUP')}
            disabled={isPending}
            className="w-4 h-4"
          />
          Times do mesmo grupo se enfrentam
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="confrontationMode"
            checked={currentMode === 'INTER_GROUP'}
            onChange={() => handleModeChange('INTER_GROUP')}
            disabled={isPending}
            className="w-4 h-4"
          />
          Um grupo enfrenta o outro
        </label>
      </div>
    </div>
  );
}