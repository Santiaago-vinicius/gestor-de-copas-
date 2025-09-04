// src/app/campeonatos/[id]/actions.ts
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Game } from '@prisma/client';

export async function addTeam(formData: FormData, championshipId: string) {
  const name = formData.get('name')?.toString();

  if (!name) {
    // Tratar erro de nome vazio aqui se desejar
    return;
  }

  await prisma.team.create({
    data: {
      name: name,
      championshipId: championshipId,
    },
  });

  // Essa linha é a mágica! Ela diz ao Next.js para recarregar os dados
  // da página do campeonato, fazendo o novo time aparecer instantaneamente.
  revalidatePath(`/campeonatos/${championshipId}`);
}
export async function createGroup(championshipId: string) {
  // Descobre qual letra de grupo usar (A, B, C...)
  const existingGroups = await prisma.group.count({
    where: { championshipId },
  });
  const nextGroupLetter = String.fromCharCode(65 + existingGroups); // 65 é 'A' em ASCII

  await prisma.group.create({
    data: {
      name: `Grupo ${nextGroupLetter}`,
      championshipId: championshipId,
    },
  });

  revalidatePath(`/campeonatos/${championshipId}`);
}

export async function assignTeamToGroup(
  teamId: string,
  groupId: string | null,
  championshipId: string
) {
  await prisma.team.update({
    where: { id: teamId },
    data: {
      groupId: groupId,
    },
  });

  revalidatePath(`/campeonatos/${championshipId}`);
}

export async function generateGroupStageGames(championshipId: string) {
  const championship = await prisma.championship.findUnique({
    where: { id: championshipId },
    select: { confrontationMode: true }
  });

  // Limpa jogos existentes
  await prisma.game.deleteMany({
    where: { championshipId: championshipId, round: 1 },
  });

  const groups = await prisma.group.findMany({
    where: { championshipId },
    include: { teams: true },
    orderBy: { name: 'asc' }
  });

  const newGames: Omit<Game, 'id' | 'gameDate'>[] = [];

  // NOVO: Lógica condicional baseada no modo
  if (championship?.confrontationMode === 'INTER_GROUP') {
    // Lógica para "Um grupo contra o outro"
    // Esta versão assume 2 grupos. Times do grupo 0 vs times do grupo 1.
    if (groups.length >= 2) {
      const groupA = groups[0].teams;
      const groupB = groups[1].teams;
      for (const teamA of groupA) {
        for (const teamB of groupB) {
          newGames.push({
            round: 1, homeTeamId: teamA.id, awayTeamId: teamB.id,
            championshipId: championshipId, groupId: null, // O jogo não pertence a um grupo específico
            homeTeamScore: null, awayTeamScore: null, yellowCards: 0, redCards: 0,
          });
        }
      }
    }
  } else {
    // Lógica padrão "Dentro do mesmo grupo" (a que já tínhamos)
    for (const group of groups) {
      const teams = group.teams;
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          newGames.push({
            round: 1, homeTeamId: teams[i].id, awayTeamId: teams[j].id,
            championshipId: championshipId, groupId: group.id,
            homeTeamScore: null, awayTeamScore: null, yellowCards: 0, redCards: 0,
          });
        }
      }
    }
  }

  if (newGames.length > 0) {
    await prisma.game.createMany({ data: newGames });
  }

  revalidatePath(`/campeonatos/${championshipId}`);
}


export async function deleteTeam(teamId: string, championshipId: string) {
  // Passo 1: Apagar todos os jogos em que o time participou (como anfitrião ou visitante)
  await prisma.game.deleteMany({
    where: {
      championshipId: championshipId,
      OR: [
        { homeTeamId: teamId },
        { awayTeamId: teamId }
      ],
    },
  });

  // Passo 2: Agora que não há mais jogos associados, apagar o time
  await prisma.team.delete({
    where: { id: teamId },
  });

  // Passo 3: Atualizar a página
  revalidatePath(`/campeonatos/${championshipId}`);
}



export async function updateGameScore(
  gameId: string,
  homeScore: number,
  awayScore: number,
  yellowCards: number,
  redCards: number,
  championshipId: string
) {
  await prisma.game.update({
    where: { id: gameId },
    data: {
      homeTeamScore: homeScore,
      awayTeamScore: awayScore,
      yellowCards: yellowCards,
      redCards: redCards,
    },
  });

  revalidatePath(`/campeonatos/${championshipId}`);
}

export async function updateConfrontationMode(championshipId: string, mode: string) {
  // Regra de Ouro: Mudar o modo de confronto invalida o calendário de jogos
  await prisma.game.deleteMany({
    where: {
      championshipId: championshipId,
      round: 1, // Fase de Grupos
    },
  });

  await prisma.championship.update({
    where: { id: championshipId },
    data: {
      confrontationMode: mode,
    },
  });

  revalidatePath(`/campeonatos/${championshipId}`);
}