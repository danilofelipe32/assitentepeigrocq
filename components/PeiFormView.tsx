
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { fieldOrderForPreview, disciplineOptions } from '../constants.tsx';
import { TextAreaWithActions } from './TextAreaWithActions.tsx';
import { callGenerativeAI } from '../services/geminiService.ts';
import { savePei, getPeiById, getAllRagFiles, addActivitiesToBank } from '../services/storageService.ts';
import { Modal } from './Modal.tsx';
import { Activity, PeiData, NewPeiRecordData } from '../types.ts';

const helpTexts = {
    'id-diagnostico': 'Descreva o diagnóstico do aluno (se houver) e as necessidades educacionais específicas decorrentes dele. Ex: TDAH, Dislexia, TEA.',
    'id-contexto': 'Apresente um breve resumo do contexto familiar e da trajetória escolar do aluno.',
    'aval-habilidades': 'Detalhe as competências e dificuldades do aluno em áreas acadêmicas.',
    'aval-social': 'Descreva a interação social e comportamento do aluno.',
    'aval-coord': 'Aborde coordenação motora e autonomia.',
    'metas-curto': "Objetivos específicos para os próximos 3 meses.",
    'metas-medio': 'Objetivos para os próximos 6 meses.',
    'metas-longo': 'Objetivo principal para o final do ano letivo.',
    'est-adaptacoes': 'Adaptações em materiais, avaliações e ambiente.',
    'est-metodologias': 'Abordagens pedagógicas recomendadas.',
    'est-parcerias': 'Colaboração com família e outros profissionais.',
    'resp-regente': 'Responsabilidades do professor regente.',
    'resp-coord': 'Papel do coordenador pedagógico.',
    'resp-familia': 'Participação da família no processo.',
    'resp-apoio': 'Outros profissionais envolvidos.',
    'revisao': 'Periodicidade e critérios de avaliação do progresso.',
    'revisao-ajustes': 'Resumo das modificações desde a última revisão.',
    'atividades-content': 'Sugestões de atividades adaptadas baseadas no PEI.',
    'dua-content': 'Aplicação dos princípios do DUA no plano.'
};

const sectionColors = [
    'bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 
    'bg-sky-600', 'bg-violet-600', 'bg-orange-600', 'bg-teal-600'
];

const requiredFields = [
    ...fieldOrderForPreview.find(s => s.title.startsWith("1."))!.fields.map(f => f.id),
    ...fieldOrderForPreview.find(s => s.title.startsWith("2."))!.fields.map(f => f.id)
];

export const PeiFormView = (props) => {
    const { editingPeiId, onSaveSuccess } = props;
    const [currentPeiId, setCurrentPeiId] = useState(editingPeiId);
    const [peiData, setPeiData] = useState<PeiData>({});
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    const [aiGeneratedFields, setAiGeneratedFields] = useState(new Set<string>());
    const [smartAnalysisResults, setSmartAnalysisResults] = useState({});
    const [errors, setErrors] = useState({});
    const [autoSaveStatus, setAutoSaveStatus] = useState('ocioso');
    
    // States for Edit Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editModalData, setEditModalData] = useState<{ id: string, label: string, value: string } | null>(null);
    const [showRefinement, setShowRefinement] = useState(false);
    const [refinementText, setRefinementText] = useState('');

    const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>(() => {
        const initial: Record<number, boolean> = {};
        fieldOrderForPreview.forEach((_, idx) => {
            initial[idx] = idx === 0;
        });
        return initial;
    });

    const autoSaveDataRef = useRef({ peiData, aiGeneratedFields, smartAnalysisResults, currentPeiId });

    useEffect(() => {
        autoSaveDataRef.current = { peiData, aiGeneratedFields, smartAnalysisResults, currentPeiId };
    }, [peiData, aiGeneratedFields, smartAnalysisResults, currentPeiId]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            const { peiData: currentPeiData, aiGeneratedFields: currentAiFields, smartAnalysisResults: currentSmartResults, currentPeiId: currentId } = autoSaveDataRef.current;
            const studentName = currentPeiData['aluno-nome']?.trim();
            if (studentName) {
                setAutoSaveStatus('salvando');
                const recordData: NewPeiRecordData = {
                    data: currentPeiData,
                    aiGeneratedFields: Array.from(currentAiFields),
                    smartAnalysisResults: currentSmartResults,
                };
                const savedRecord = savePei(recordData, currentId, studentName);
                if (!currentId && savedRecord.id) setCurrentPeiId(savedRecord.id);
                setTimeout(() => {
                    setAutoSaveStatus('salvo');
                    setTimeout(() => setAutoSaveStatus('ocioso'), 2000);
                }, 500);
            }
        }, 5000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (editingPeiId) {
            const peiToLoad = getPeiById(editingPeiId);
            if (peiToLoad) {
                setCurrentPeiId(peiToLoad.id);
                setPeiData(peiToLoad.data);
                setAiGeneratedFields(new Set(peiToLoad.aiGeneratedFields || []));
                setSmartAnalysisResults(peiToLoad.smartAnalysisResults || {});
            }
        }
    }, [editingPeiId]);

    const areRequiredFieldsFilled = useMemo(() => {
        return requiredFields.every(fieldId => peiData[fieldId]?.trim());
    }, [peiData]);

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;
        for (const fieldId of requiredFields) {
            if (!peiData[fieldId]?.trim()) {
                newErrors[fieldId] = 'Obrigatório.';
                isValid = false;
            }
        }
        setErrors(newErrors);
        return isValid;
    };

    const handleTextAreaChange = useCallback((id, value) => {
        setPeiData(prev => ({ ...prev, [id]: value }));
        setAiGeneratedFields(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
    }, []);

    const toggleSection = (idx: number) => {
        setExpandedSections(prev => ({
            ...prev,
            [idx]: !prev[idx]
        }));
    };

    /**
     * Helper centralizado para execução de tarefas de IA.
     * Gerencia estados de loading e exibição de erros.
     */
    const runAiTask = useCallback(async (taskId: string, taskFn: () => Promise<void>) => {
        setLoadingStates(prev => ({ ...prev, [taskId]: true }));
        try {
            await taskFn();
        } catch (error: any) {
            console.error(`Erro na tarefa de IA (${taskId}):`, error);
            alert(`Erro na IA: ${error.message || 'Ocorreu um erro inesperado.'}`);
        } finally {
            setLoadingStates(prev => ({ ...prev, [taskId]: false }));
        }
    }, []);

    const handleOpenEditModal = (id: string, label: string) => {
        setEditModalData({ id, label, value: peiData[id] || '' });
        setIsEditModalOpen(true);
        setShowRefinement(false);
        setRefinementText('');
    };

    const handleSaveEditModal = () => {
        if (editModalData) {
            handleTextAreaChange(editModalData.id, editModalData.value);
            setIsEditModalOpen(false);
            setEditModalData(null);
        }
    };

    const handleRefine = async () => {
        if (!editModalData || !refinementText.trim()) return;

        await runAiTask('refine-modal', async () => {
            const prompt = `Você está editando o campo "${editModalData.label}" de um PEI.
O conteúdo atual é:
"${editModalData.value}"

O usuário deseja refinar este conteúdo com a seguinte instrução:
"${refinementText}"

Reescreva o conteúdo seguindo a instrução e mantenha o tom profissional e pedagógico. Retorne APENAS o novo texto.`;
            
            const response = await callGenerativeAI(prompt);
            setEditModalData(prev => prev ? { ...prev, value: response } : null);
            setRefinementText('');
            setShowRefinement(false);
        });
    };

    const handleActionClick = async (fieldId, action) => {
        if (action === 'ai' && !areRequiredFieldsFilled) {
            validateForm();
            alert("Preencha a Identificação e Avaliação Inicial antes de usar a IA.");
            return;
        }

        const taskId = `${fieldId}-${action}`;

        await runAiTask(taskId, async () => {
            const fieldLabel = fieldOrderForPreview.flatMap(s => s.fields).find(f => f.id === fieldId)?.label || '';
            let response = '';
            
            if (action === 'ai') {
                const context = Object.entries(peiData).map(([k, v]) => `${k}: ${v}`).join('\n');
                const prompt = `Gere o conteúdo para o campo "${fieldLabel}" do PEI. Contexto atual:\n${context}\nResponda apenas com o texto do campo.`;
                response = await callGenerativeAI(prompt);
                setPeiData(prev => ({ ...prev, [fieldId]: response }));
                setAiGeneratedFields(prev => new Set(prev).add(fieldId));
            } else if (action === 'smart') {
                const goal = peiData[fieldId] || '';
                const prompt = `Analise a meta "${goal}" no formato SMART. Retorne um JSON:\n{"isSpecific": {"critique": "...", "suggestion": "..."}, "isMeasurable": {...}, "isAchievable": {...}, "isRelevant": {...}, "isTimeBound": {...}}`;
                response = await callGenerativeAI(prompt);
                const json = JSON.parse(response.substring(response.indexOf('{'), response.lastIndexOf('}') + 1));
                setSmartAnalysisResults(prev => ({ ...prev, [fieldId]: json }));
            } else if (action === 'suggest') {
                const context = Object.entries(peiData).map(([k, v]) => `${k}: ${v}`).join('\n');
                const prompt = `Com base no seguinte PEI, sugira atividades pedagógicas específicas para a meta "${peiData[fieldId]}":\n\n${context}`;
                response = await callGenerativeAI(prompt);
                setPeiData(prev => ({ 
                    ...prev, 
                    ['atividades-content']: (prev['atividades-content'] || '') + '\n\n' + response 
                }));
            }
        });
    };

    const handleClearForm = () => {
        setPeiData({});
        setAiGeneratedFields(new Set<string>());
        setErrors({});
        setCurrentPeiId(null);
    };

    const renderField = (field) => {
        const { id, label } = field;
        const isTextArea = id.includes('diagnostico') || id.includes('contexto') || id.includes('aval') || id.includes('metas') || id.includes('est-') || id.includes('resp') || id.includes('revisao') || id.includes('content');
        
        if (isTextArea) {
            const isGoalField = id.includes('metas');
            return (
                <div key={id} className="md:col-span-2">
                    <TextAreaWithActions
                        id={id}
                        label={label}
                        value={peiData[id] || ''}
                        onChange={(val) => handleTextAreaChange(id, val)}
                        onAiClick={() => handleActionClick(id, 'ai')}
                        onSmartClick={isGoalField ? () => handleActionClick(id, 'smart') : undefined}
                        onSuggestClick={isGoalField ? () => handleActionClick(id, 'suggest') : undefined}
                        onEditClick={() => handleOpenEditModal(id, label)}
                        isAiLoading={loadingStates[`${id}-ai`]}
                        isSmartLoading={loadingStates[`${id}-smart`]}
                        isSuggestLoading={loadingStates[`${id}-suggest`]}
                        isGoal={isGoalField}
                        isAiActionDisabled={!areRequiredFieldsFilled}
                        placeholder={`Preencha o campo ${label}...`}
                        helpText={helpTexts[id]}
                        error={errors[id]}
                    />
                </div>
            );
        }

        return (
            <div key={id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                    type={id.includes('nasc') || id.includes('data') ? 'date' : 'text'}
                    id={id}
                    value={peiData[id] || ''}
                    onChange={(e) => setPeiData(prev => ({ ...prev, [id]: e.target.value }))}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 outline-none"
                />
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Editor de PEI</h2>
                <div className="flex items-center justify-center gap-2 mt-2 text-indigo-600 font-medium">
                    <i className="fa-solid fa-bolt"></i>
                    <span>Modo Google Gemini Ativado</span>
                </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); if(validateForm()) alert("PEI Salvo!"); }} className="space-y-4">
                {fieldOrderForPreview.map((section, idx) => {
                    const isExpanded = expandedSections[idx];
                    const match = section.title.match(/^(\d+)\.\s+(.*)$/);
                    const num = match ? match[1] : (idx + 1);
                    const title = match ? match[2] : section.title;
                    const color = sectionColors[idx % sectionColors.length];

                    return (
                        <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md">
                            <button
                                type="button"
                                onClick={() => toggleSection(idx)}
                                className="w-full flex justify-between items-center p-5 text-left transition-colors focus:outline-none"
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`flex-shrink-0 w-8 h-8 rounded-full ${color} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
                                        {num}
                                    </span>
                                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                                </div>
                                <i className={`fa-solid fa-chevron-down transition-transform duration-300 text-gray-400 ${isExpanded ? 'rotate-180' : ''}`}></i>
                            </button>
                            
                            {isExpanded && (
                                <div className="px-6 pb-6 animate-fade-in border-t border-gray-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-6">
                                        {section.fields.map(renderField)}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                <div className="bg-white p-4 rounded-xl shadow-md flex justify-end items-center gap-3 border border-gray-200 sticky bottom-4 z-10 md:static">
                    <div className="mr-auto text-xs text-gray-400 font-medium">
                        {autoSaveStatus === 'salvando' ? 'Sincronizando...' : 'Alterações segvas'}
                    </div>
                    <button type="button" onClick={handleClearForm} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">Limpar</button>
                    <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all">Salvar PEI</button>
                </div>
            </form>

            {/* Field Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={`Editando: ${editModalData?.label}`}
                wide
                footer={
                    <div className="flex flex-col sm:flex-row justify-between w-full gap-3">
                         <div className="flex gap-2">
                             <button 
                                onClick={() => setShowRefinement(!showRefinement)}
                                className="px-4 py-2 text-sm font-bold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
                             >
                                <i className="fa-solid fa-wand-sparkles"></i>
                                Assim mas...
                             </button>
                         </div>
                         <div className="flex gap-2">
                            <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg">Cancelar</button>
                            <button onClick={handleSaveEditModal} className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg shadow-md shadow-indigo-100">Aplicar Alterações</button>
                         </div>
                    </div>
                }
            >
                {editModalData && (
                    <div className="space-y-4">
                        {showRefinement && (
                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 animate-fade-in">
                                <label className="block text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Refinar texto</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text"
                                        className="flex-grow p-2.5 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-300 outline-none text-sm"
                                        placeholder="Ex: Deixe mais focado em habilidades sociais..."
                                        value={refinementText}
                                        onChange={(e) => setRefinementText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                                        autoFocus
                                    />
                                    <button 
                                        disabled={loadingStates['refine-modal'] || !refinementText.trim()}
                                        onClick={handleRefine}
                                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                                    >
                                        {loadingStates['refine-modal'] ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Refinar'}
                                    </button>
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mb-2">Conteúdo do Campo</p>
                        <textarea
                            className="w-full h-96 p-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all resize-none font-sans text-gray-700 leading-relaxed"
                            value={editModalData.value}
                            onChange={(e) => setEditModalData({ ...editModalData, value: e.target.value })}
                            placeholder={`Digite o conteúdo de ${editModalData.label}...`}
                            autoFocus={!showRefinement}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};
