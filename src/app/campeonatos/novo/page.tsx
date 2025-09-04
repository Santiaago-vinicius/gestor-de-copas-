// src/app/campeonatos/novo/page.tsx
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default function NovoCampeonatoPage() {

  async function createChampionship(formData: FormData) {
    'use server';

    const name = formData.get('name')?.toString();
    const format = formData.get('format')?.toString();

    if (!name || !format) {
      return;
    }

    await prisma.championship.create({
      data: {
        name: name,
        format: format,
      },
    });

    redirect('/campeonatos');
  }

  return (
    <main className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-6">Criar Novo Campeonato</h1>
      <form action={createChampionship} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-lg font-medium text-gray-700">
            Nome do Campeonato
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="format" className="block text-lg font-medium text-gray-700">
            Formato do Campeonato
          </label>
          <select
            name="format"
            id="format"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecione um formato</option>
            <option value="KNOCKOUT">Mata-Mata</option>
            <option value="ROUND_ROBIN">Pontos Corridos</option>
            <option value="GROUP_KNOCKOUT">Fase de Grupos + Mata-Mata</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 font-semibold text-lg"
        >
          Salvar Campeonato
        </button>
      </form>
    </main>
  );
}