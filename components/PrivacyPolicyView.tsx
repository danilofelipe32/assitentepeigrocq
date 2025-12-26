
import React from 'react';
import { useAppStore } from '../store.ts';

export const PrivacyPolicyView = () => {
  const { setHasAgreedToPrivacy, navigateToNewPei } = useAppStore();

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col h-full max-w-4xl mx-auto p-8 overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Política de Privacidade</h2>
        
        <div className="space-y-6 text-gray-600 leading-relaxed">
            <section>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">1. Armazenamento Local</h3>
                <p>Todos os dados que você insere, incluindo nomes de alunos, diagnósticos e planos, são armazenados <strong>exclusivamente no seu dispositivo</strong> (LocalStorage). Nós não coletamos nem mantemos esses dados em nossos servidores.</p>
            </section>

            <section>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">2. Processamento de IA (Google Gemini)</h3>
                <p>Para fornecer as funcionalidades de geração de conteúdo e análise, os dados contextuais do PEI são enviados de forma segura para os servidores da <strong>Google Gemini API</strong>. Esses dados são processados apenas para gerar a resposta solicitada e o processamento é regido pelas políticas de privacidade da Google Cloud API.</p>
            </section>

            <section>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">3. Responsabilidade</h3>
                <p>Como profissional da educação, você é responsável por garantir que o processamento de dados sensíveis de alunos esteja em conformidade com as diretrizes da sua instituição de ensino e legislações locais (como a LGPD).</p>
            </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
            <button 
                onClick={() => { setHasAgreedToPrivacy(true); navigateToNewPei(); }}
                className="w-full px-6 py-3 text-lg font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
                Li e Concordo com os Termos
            </button>
        </div>
    </div>
  );
};
