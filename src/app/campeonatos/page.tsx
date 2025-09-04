// src/app/campeonatos/page.tsx
import Link from 'next/link';
import { prisma } from '@/lib/prisma'; // Criaremos este arquivo a seguir

export default async function CampeonatosPage() {
  const campeonatos = await prisma.championship.findMany();

  return (
    <main className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Meus Campeonatos</h1>
        <Link href="/campeonatos/novo" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          + Criar Novo Campeonato
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {campeonatos.map((camp) => (
        <Link href={`/campeonatos/${camp.id}`} key={camp.id}>
          <div key={camp.id} className="border rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold mb-2">{camp.name}</h2>
            <p className="text-gray-600">Formato: {camp.format}</p>
          </div>
        </Link>  
        ))}
        {campeonatos.length === 0 && (
          <p>Você ainda não criou nenhum campeonato. Comece agora!</p>
        )}
      </div>
    </main>
  );
}