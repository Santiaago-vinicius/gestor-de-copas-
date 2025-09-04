// src/app/campeonatos/[id]/page.tsx - VERSÃO COM CORREÇÃO DA TABELA

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import AddTeamButton from './AddTeamButton';
import GroupManager from './GroupManager';
import GameRow from './GameRow';
import StandingsTable from './StandingsTable';
import TeamList from './TeamList';
import ConfrontationModeSelector from './ConfrontationModeSelector';

type CampeonatoDetalhesPageProps = {
  params: {
    id: string;
  };
};

export default async function CampeonatoDetalhesPage({ params }: CampeonatoDetalhesPageProps) {
  const campeonato = await prisma.championship.findUnique({
    where: { id: params.id },
    include: {
      teams: { orderBy: { name: 'asc' } },
      groups: {
        include: { teams: { orderBy: { name: 'asc' } } },
        orderBy: { name: 'asc' },
      },
      games: {
        include: { homeTeam: true, awayTeam: true },
        orderBy: { id: 'asc' },
      },
    },
  });

  if (!campeonato) {
    return (
      <main className="container mx-auto p-8">
        <h1 className="text-4xl font-bold">Campeonato não encontrado</h1>
        <Link href="/campeonatos" className="text-blue-500 hover:underline mt-4 inline-block">
          &larr; Voltar para a lista de campeonatos
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">{campeonato.name}</h1>
          <p className="text-lg text-gray-500">Formato: {campeonato.format}</p>
        </div>
        <Link href="/campeonatos" className="text-blue-500 hover:underline">
          &larr; Voltar para a lista
        </Link>
      </div>

      {campeonato.format === 'GROUP_KNOCKOUT' && (
        <ConfrontationModeSelector 
          championshipId={campeonato.id}
          currentMode={campeonato.confrontationMode}
        />
      )}

      <div className="mb-8 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-semibold">Times</h2>
          <AddTeamButton championshipId={campeonato.id} />
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          {campeonato.teams.length === 0 ? (
            <p className="text-center text-gray-400">Nenhum time adicionado ainda.</p>
          ) : (
            <TeamList teams={campeonato.teams} championshipId={campeonato.id} />
          )}
        </div>
      </div>

      {campeonato.format === 'GROUP_KNOCKOUT' && (
        <GroupManager
          championshipId={campeonato.id}
          teams={campeonato.teams}
          groups={campeonato.groups}
        />
      )}

      <div className="space-y-10 mt-8">
        <div>
          <h2 className="text-3xl font-semibold mb-4">Classificação</h2>
          {campeonato.groups.length > 0 ? (
            <div className="space-y-6">
              {campeonato.groups.map(group => {
                
                // ===== A LÓGICA DE FILTRAGEM DE JOGOS FOI CORRIGIDA AQUI =====
                const groupTeamIds = group.teams.map(team => team.id);
                const groupGames = campeonato.games.filter(game => 
                  (game.homeTeamScore !== null && game.awayTeamScore !== null) &&
                  (groupTeamIds.includes(game.homeTeamId) || groupTeamIds.includes(game.awayTeamId))
                );

                return (
                  <div key={group.id}>
                    <h3 className="text-2xl font-bold mb-3">{group.name}</h3>
                    <StandingsTable 
                      teams={group.teams}
                      games={groupGames}
                    />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-gray-800 p-6 rounded-lg">
              <p className="text-center text-gray-400">Crie grupos e gere os jogos para ver a classificação.</p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-3xl font-semibold mb-4">Jogos</h2>
          <div className="bg-gray-800 p-6 rounded-lg">
            {campeonato.games.length === 0 ? (
              <p className="text-center text-gray-400">Nenhum jogo gerado ainda.</p>
            ) : (
              <div className="space-y-4">
                {campeonato.games.map((game) => (
                  <GameRow key={game.id} game={game} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
    </main>
  );
}