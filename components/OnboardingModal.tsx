
import React, { useState } from 'react';
import { Modal } from './Modal.tsx';

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const OnboardingModal = ({ isOpen, onClose }: OnboardingModalProps) => {
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: "Bem-vindo ao Assistente PEI",
            content: "Nossa IA ajuda você a criar Planos Educacionais Individualizados (PEI) de forma rápida e com embasamento pedagógico.",
            icon: "fa-brain"
        },
        {
            title: "Geração Inteligente",
            content: "Preencha os dados básicos e use o ícone de varinha mágica para que a IA gere sugestões de adaptações, metas e metodologias.",
            icon: "fa-wand-magic-sparkles"
        },
        {
            title: "Análise SMART",
            content: "Clique no ícone de checklist em metas para validar se seus objetivos são Específicos, Mensuráveis, Atingíveis, Relevantes e com Tempo definido.",
            icon: "fa-clipboard-check"
        },
        {
            title: "Ficheiros de Apoio",
            content: "Anexe documentos do aluno para que a IA tenha mais contexto e gere respostas personalizadas para a realidade dele.",
            icon: "fa-paperclip"
        }
    ];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {}} // Disable closing by clicking outside
            title={steps[step].title}
            footer={
                <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors w-full sm:w-auto"
                >
                    {step === steps.length - 1 ? "Começar Agora" : "Próximo"}
                </button>
            }
        >
            <div className="text-center py-4">
                <div className="text-6xl text-indigo-500 mb-6">
                    <i className={`fa-solid ${steps[step].icon}`}></i>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                    {steps[step].content}
                </p>
                <div className="flex justify-center gap-2 mt-8">
                    {steps.map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-200'}`} 
                        />
                    ))}
                </div>
            </div>
        </Modal>
    );
};
