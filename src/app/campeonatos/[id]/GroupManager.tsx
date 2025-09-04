// src/app/campeonatos/[id]/GroupManager.tsx
'use client';

import { Team, Group } from '@prisma/client';
import { createGroup, assignTeamToGroup,generateGroupStageGames  } from './actions';
import { useTransition } from 'react';

type GroupWithTeams = Group & { teams: Team[] };

type GroupManagerProps = {
  championshipId: string;
  teams: Team[];
  groups: GroupWithTeams[];
};

export default function GroupManager({ championshipId, teams, groups }: GroupManagerProps) {
  const [isPending, startTransition] = useTransition();

  const unassignedTeams = teams.filter((team) => !team.groupId);

  const handleAssignTeam = (teamId: string, groupId: string) => {
    startTransition(() => {
      assignTeamToGroup(teamId, groupId, championshipId);
    });
  };

  const handleCreateGroup = () => {
    startTransition(() => {
        createGroup(championshipId);
    });
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
  <h2 className="text-3xl font-semibold">Grupos</h2>
  <div className="flex gap-4">
    <button
        onClick={() => startTransition(() => createGroup(championshipId))}
        disabled={isPending}
        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-purple-400"
    >
        + Criar Grupo
    </button>
    <button
        onClick={() => startTransition(() => generateGroupStageGames(championshipId))}
        disabled={isPending}
        className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 disabled:bg-cyan-400"
    >
        Gerar Jogos
    </button>
  </div>
</div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Coluna para Times Sem Grupo */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="font-bold text-xl mb-3 text-center">Times Sem Grupo</h3>
          <div className="space-y-2">
            {unassignedTeams.map((team) => (
              <div key={team.id} className="bg-gray-700 p-2 rounded-md text-center">
                {team.name}
              </div>
            ))}
            {unassignedTeams.length === 0 && <p className="text-sm text-gray-400 text-center">Todos os times foram atribuídos.</p>}
          </div>
        </div>

        {/* Colunas para cada Grupo */}
        {groups.map((group) => (
          <div key={group.id} className="bg-gray-800 p-4 rounded-lg">
            <h3 className="font-bold text-xl mb-3 text-center">{group.name}</h3>
            <div className="space-y-2 min-h-[100px]">
                {group.teams.map(team => (
                    <div key={team.id} className="bg-gray-700 p-2 rounded-md text-center">
                        {team.name}
                    </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Menu de Atribuição */}
      <div className="mt-6 bg-gray-800 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">Atribuir Time a um Grupo:</h3>
        {unassignedTeams.map(team => (
            <div key={team.id} className="flex items-center gap-4 mb-2">
                <span className="flex-1">{team.name}</span>
                <select 
                    onChange={(e) => handleAssignTeam(team.id, e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-md p-1"
                    defaultValue=""
                >
                    <option value="" disabled>Selecione um grupo</option>
                    {groups.map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                </select>
            </div>
        ))}
      </div>
    </div>
  );
}