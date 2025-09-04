// src/app/campeonatos/[id]/AddTeamButton.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { addTeam } from './actions';

type AddTeamButtonProps = {
  championshipId: string;
};

export default function AddTeamButton({ championshipId }: AddTeamButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Efeito para focar no input quando o modal abre
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isModalOpen) {
      inputRef.current?.focus();
    }
  }, [isModalOpen]);


  const handleAction = async (formData: FormData) => {
    await addTeam(formData, championshipId);
    formRef.current?.reset(); // Limpa o formulário
    setIsModalOpen(false); // Fecha o modal
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
      >
        + Adicionar Time
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Adicionar Novo Time</h2>
            <form ref={formRef} action={handleAction}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Nome do Time
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              {/* Futuramente, aqui entrará o campo para upload do logo */}
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Salvar Time
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}