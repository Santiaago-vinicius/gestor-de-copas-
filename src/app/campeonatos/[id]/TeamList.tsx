// src/app/campeonatos/[id]/TeamList.tsx
'use client';

import { Team } from '@prisma/client';
import { deleteTeam } from './actions';
import { useTransition } from 'react';

type TeamListProps = {
  teams: Team[];
  championshipId: string;
};

export default function TeamList({ teams, championshipId }: TeamListProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (teamId: string, teamName: string) => {
    if (window.confirm(`Tem a certeza que deseja excluir o time "${teamName}"? Todos os jogos com este time também serão apagados.`)) {
      startTransition(() => {
        deleteTeam(teamId, championshipId);
      });
    }
  };

  return (
    <ul className="space-y-3">
      {teams.map((team) => (
        <li key={team.id} className={`bg-gray-700 p-3 rounded-md flex justify-between items-center transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
          <span className="font-medium">{team.name}</span>
          <button
            onClick={() => handleDelete(team.id, team.name)}
            disabled={isPending}
            className="text-red-400 hover:text-red-500 disabled:text-gray-500"
            aria-label={`Excluir ${team.name}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  );
}