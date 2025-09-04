// src/app/campeonatos/[id]/GameRow.tsx - VERSÃO CORRIGIDA

'use client';

import { useState, useTransition } from 'react';
import { Game } from '@prisma/client';
import { updateGameScore } from './actions';

type GameWithTeams = Game & {
  homeTeam: { name: string };
  awayTeam: { name: string };
};

type GameRowProps = {
  game: GameWithTeams;
};

export default function GameRow({ game }: GameRowProps) {
  // CORREÇÃO: Garantimos que o estado inicial seja sempre uma string
  const [homeScore, setHomeScore] = useState(game.homeTeamScore?.toString() ?? '');
  const [awayScore, setAwayScore] = useState(game.awayTeamScore?.toString() ?? '');
  const [yellowCards, setYellowCards] = useState(game.yellowCards?.toString() ?? '');
  const [redCards, setRedCards] = useState(game.redCards?.toString() ?? '');

  const [isPending, startTransition] = useTransition();

  // A lógica do 'isDirty' agora compara strings, o que é mais seguro aqui
  const isDirty =
    homeScore !== (game.homeTeamScore?.toString() ?? '') ||
    awayScore !== (game.awayTeamScore?.toString() ?? '') ||
    yellowCards !== (game.yellowCards?.toString() ?? '') ||
    redCards !== (game.redCards?.toString() ?? '');

  const handleFormAction = (formData: FormData) => {
    // A conversão para número acontece aqui, na hora de enviar para o servidor
    const home = parseInt(formData.get('homeScore') as string, 10);
    const away = parseInt(formData.get('awayScore') as string, 10);
    const yellows = parseInt(formData.get('yellowCards') as string, 10) || 0;
    const reds = parseInt(formData.get('redCards') as string, 10) || 0;

    if (!isNaN(home) && !isNaN(away)) {
      startTransition(() => {
        updateGameScore(game.id, home, away, yellows, reds, game.championshipId);
      });
    }
  };

  return (
    <form
      action={handleFormAction}
      className="bg-gray-700 p-4 rounded-md"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="w-1/3 text-right font-bold">{game.homeTeam.name}</span>
        <div className="flex-grow flex items-center justify-center gap-2">
          <input
            type="number"
            name="homeScore"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            className="w-14 text-center bg-gray-600 rounded-md p-2 text-lg font-semibold"
            min="0"
          />
          <span className="text-gray-400">X</span>
          <input
            type="number"
            name="awayScore"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            className="w-14 text-center bg-gray-600 rounded-md p-2 text-lg font-semibold"
            min="0"
          />
        </div>
        <span className="w-1/3 text-left font-bold">{game.awayTeam.name}</span>
        <div className="w-24 text-right">
          {isDirty && (
            <button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isPending ? 'A guardar...' : 'Guardar'}
            </button>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-6 bg-yellow-400 rounded-sm"></div>
          <label htmlFor={`yellow-${game.id}`} className="text-sm">Amarelos</label>
          <input
            type="number"
            id={`yellow-${game.id}`}
            name="yellowCards"
            value={yellowCards}
            onChange={(e) => setYellowCards(e.target.value)}
            className="w-12 text-center bg-gray-600 rounded-md p-1 text-sm"
            min="0"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-6 bg-red-600 rounded-sm"></div>
          <label htmlFor={`red-${game.id}`} className="text-sm">Vermelhos</label>
          <input
            type="number"
            id={`red-${game.id}`}
            name="redCards"
            value={redCards}
            onChange={(e) => setRedCards(e.target.value)}
            className="w-12 text-center bg-gray-600 rounded-md p-1 text-sm"
            min="0"
          />
        </div>
      </div>
    </form>
  );
}