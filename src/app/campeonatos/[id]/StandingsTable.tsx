// src/app/campeonatos/[id]/StandingsTable.tsx - VERSÃO CORRIGIDA E MAIS ROBUSTA
import { Team, Game } from '@prisma/client';

type StandingsTableProps = {
  teams: Team[];
  games: Game[];
};

interface TeamStats {
  id: string;
  name: string;
  P: number;
  J: number;
  V: number;
  E: number;
  D: number;
  GP: number;
  GC: number;
  SG: number;
}

export default function StandingsTable({ teams, games }: StandingsTableProps) {
  const stats: Map<string, TeamStats> = new Map(
    teams.map((team) => [
      team.id,
      { id: team.id, name: team.name, P: 0, J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0, SG: 0 },
    ])
  );

  // A filtragem de jogos completos continua a mesma
  const completedGames = games.filter(
    (game) => game.homeTeamScore !== null && game.awayTeamScore !== null
  );

  for (const game of completedGames) {
    const homeStats = stats.get(game.homeTeamId); // Retiramos o '!' para permitir que seja undefined
    const awayStats = stats.get(game.awayTeamId); // Retiramos o '!' para permitir que seja undefined
    const homeScore = game.homeTeamScore!;
    const awayScore = game.awayTeamScore!;

    // ===== AQUI ESTÁ A CORREÇÃO CRÍTICA =====
    // Só atualizamos as estatísticas se o time pertencer a este grupo (ou seja, se for encontrado no 'stats' Map)
    if (homeStats) {
      homeStats.J += 1;
      homeStats.GP += homeScore;
      homeStats.GC += awayScore;
      if (homeScore > awayScore) { homeStats.V += 1; homeStats.P += 3; }
      else if (homeScore < awayScore) { homeStats.D += 1; }
      else { homeStats.E += 1; homeStats.P += 1; }
    }

    if (awayStats) {
      awayStats.J += 1;
      awayStats.GP += awayScore;
      awayStats.GC += homeScore;
      if (awayScore > homeScore) { awayStats.V += 1; awayStats.P += 3; }
      else if (awayScore < homeScore) { awayStats.D += 1; }
      else { awayStats.E += 1; awayStats.P += 1; }
    }
  }

  const standings = Array.from(stats.values()).map(stat => ({
    ...stat,
    SG: stat.GP - stat.GC,
  }));

  standings.sort((a, b) => {
    if (b.P !== a.P) return b.P - a.P;
    if (b.SG !== a.SG) return b.SG - a.SG;
    if (b.GP !== a.GP) return b.GP - a.GP;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-700 rounded-lg text-sm">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-2 text-left">#</th>
            <th className="p-2 text-left">Time</th>
            <th className="p-2">P</th>
            <th className="p-2">J</th>
            <th className="p-2">V</th>
            <th className="p-2">E</th>
            <th className="p-2">D</th>
            <th className="p-2">GP</th>
            <th className="p-2">GC</th>
            <th className="p-2">SG</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, index) => (
            <tr key={team.id} className="border-t border-gray-600">
              <td className="p-2 font-bold">{index + 1}</td>
              <td className="p-2 font-bold">{team.name}</td>
              <td className="p-2 text-center">{team.P}</td>
              <td className="p-2 text-center">{team.J}</td>
              <td className="p-2 text-center">{team.V}</td>
              <td className="p-2 text-center">{team.E}</td>
              <td className="p-2 text-center">{team.D}</td>
              <td className="p-2 text-center">{team.GP}</td>
              <td className="p-2 text-center">{team.GC}</td>
              <td className="p-2 text-center">{team.SG}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}