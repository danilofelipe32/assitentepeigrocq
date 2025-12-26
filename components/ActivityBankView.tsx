
import React, { useState, useEffect, useMemo } from 'react';
import { getAllActivities, saveActivities, addActivityToPei } from '../services/storageService.ts';
import { useAppStore } from '../store.ts';
import { ActivityCard } from './ActivityCard.tsx';
import { Modal } from './Modal.tsx';
import { disciplineOptions } from '../constants.tsx';
import { callGenerativeAI } from '../services/geminiService.ts';

export const ActivityBankView = () => {
    const [activities, setActivities] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);
    const [showRefinement, setShowRefinement] = useState(false);
    const [refinementText, setRefinementText] = useState('');
    const [isRefining, setIsRefining] = useState(false);
    
    const { editingPeiId, navigateToEditPei } = useAppStore();

    useEffect(() => {
        setActivities(getAllActivities());
    }, []);

    const filteredActivities = useMemo(() => {
        return activities
            .filter(activity => {
                if (showOnlyFavorites && !activity.isFavorited) {
                    return false;
                }
                if (searchTerm.trim() === '') {
                    return true;
                }
                const lowerCaseSearch = searchTerm.toLowerCase();
                return (
                    activity.title.toLowerCase().includes(lowerCaseSearch) ||
                    activity.description.toLowerCase().includes(lowerCaseSearch) ||
                    activity.discipline.toLowerCase().includes(lowerCaseSearch)
                );
            })
            .sort((a, b) => (b.isFavorited ? 1 : 0) - (a.isFavorited ? 1 : 0));
    }, [activities, searchTerm, showOnlyFavorites]);

    const favoriteCount = useMemo(() => activities.filter(a => a.isFavorited).length, [activities]);

    const updateAndSaveActivities = (updatedActivities) => {
        setActivities(updatedActivities);
        saveActivities(updatedActivities);
    };

    const handleDelete = (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta atividade?')) {
            const updated = activities.filter(a => a.id !== id);
            updateAndSaveActivities(updated);
        }
    };

    const handleToggleFavorite = (id) => {
        const updated = activities.map(a => 
            a.id === id ? { ...a, isFavorited: !a.isFavorited } : a
        );
        updateAndSaveActivities(updated);
    };
    
    const handleAddToPei = (activity) => {
        if (!editingPeiId) {
            alert('Abra um PEI antes de adicionar atividades.');
            return;
        }
        addActivityToPei(editingPeiId, activity);
        alert(`Atividade "${activity.title}" adicionada.`);
        navigateToEditPei(editingPeiId);
    };

    const handleOpenEditModal = (activity) => {
        setEditingActivity({ ...activity });
        setIsEditModalOpen(true);
        setShowRefinement(false);
        setRefinementText('');
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingActivity(null);
    };

    const handleSaveEditedActivity = () => {
        if (!editingActivity) return;

        const skillsArray = typeof editingActivity.skills === 'string'
            ? (editingActivity.skills).split(',').map(s => s.trim()).filter(Boolean)
            : editingActivity.skills;

        const needsArray = typeof editingActivity.needs === 'string'
            ? (editingActivity.needs).split(',').map(s => s.trim()).filter(Boolean)
            : editingActivity.needs;

        const finalActivity = {
            ...editingActivity,
            skills: skillsArray,
            needs: needsArray,
        };
        
        const updated = activities.map(a => 
            a.id === finalActivity.id ? finalActivity : a
        );
        updateAndSaveActivities(updated);
        handleCloseEditModal();
    };

    const handleRefineDescription = async () => {
        if (!editingActivity || !refinementText.trim()) return;

        setIsRefining(true);
        try {
            const prompt = `Você está editando a descrição da atividade "${editingActivity.title}".
A descrição atual é:
"${editingActivity.description}"

O usuário deseja refinar este conteúdo com a seguinte instrução:
"${refinementText}"

Reescreva a descrição seguindo a instrução e mantenha o tom profissional e pedagógico. Retorne APENAS o novo texto.`;
            
            const response = await callGenerativeAI(prompt);
            setEditingActivity(prev => prev ? { ...prev, description: response } : null);
            setRefinementText('');
            setShowRefinement(false);
        } catch (error) {
            alert(`Erro ao refinar: ${error.message}`);
        } finally {
            setIsRefining(false);
        }
    };

    const handleEditFormChange = (e) => {
        if (!editingActivity) return;
        const { id, value } = e.target;
        setEditingActivity(prev => ({ ...prev, [id]: value }));
    };

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Banco de Atividades</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center text-xl">
                        <i className="fa-solid fa-layer-group"></i>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total</p>
                        <p className="text-2xl font-bold text-gray-800">{activities.length}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="bg-amber-50 text-amber-600 w-12 h-12 rounded-lg flex items-center justify-center text-xl">
                        <i className="fa-solid fa-star"></i>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Favoritos</p>
                        <p className="text-2xl font-bold text-gray-800">{favoriteCount}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm mb-8 border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-grow w-full">
                        <div className="relative">
                            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Pesquisar atividades..."
                                className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-gray-50 text-gray-800 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                        </div>
                    </div>
                    <div className="flex items-center whitespace-nowrap px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                         <input
                            id="filter-favorites"
                            type="checkbox"
                            checked={showOnlyFavorites}
                            onChange={(e) => setShowOnlyFavorites(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="filter-favorites" className="ml-2 text-sm font-semibold text-gray-600">
                            Apenas favoritos
                        </label>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredActivities.length > 0 ? (
                    filteredActivities.map(activity => (
                        <ActivityCard
                            key={activity.id}
                            activity={activity}
                            onDelete={handleDelete}
                            onToggleFavorite={handleToggleFavorite}
                            onAddToPei={handleAddToPei}
                            onEdit={handleOpenEditModal}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                        <div className="text-5xl text-gray-300 mb-4"><i className="fa-regular fa-lightbulb"></i></div>
                        <h3 className="text-lg font-bold text-gray-700">Nenhuma atividade</h3>
                        <p className="text-gray-400 mt-1">Tente outros filtros ou gere novas atividades.</p>
                    </div>
                )}
            </div>

            {editingActivity && (
                <Modal
                    title="Editar Atividade"
                    isOpen={isEditModalOpen}
                    onClose={handleCloseEditModal}
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
                                <button onClick={handleCloseEditModal} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg">Cancelar</button>
                                <button onClick={handleSaveEditedActivity} className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg shadow-md shadow-indigo-100">Salvar</button>
                             </div>
                        </div>
                    }
                    wide
                >
                    <div className="space-y-4">
                        {showRefinement && (
                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 animate-fade-in mb-4">
                                <label className="block text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Refinar descrição</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text"
                                        className="flex-grow p-2.5 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-300 outline-none text-sm"
                                        placeholder="Ex: Deixe a descrição mais lúdica..."
                                        value={refinementText}
                                        onChange={(e) => setRefinementText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleRefineDescription()}
                                        autoFocus
                                    />
                                    <button 
                                        disabled={isRefining || !refinementText.trim()}
                                        onClick={handleRefineDescription}
                                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                                    >
                                        {isRefining ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Refinar'}
                                    </button>
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Título</label>
                            <input
                                type="text"
                                id="title"
                                value={editingActivity.title}
                                onChange={handleEditFormChange}
                                className="w-full p-2.5 border rounded-lg bg-gray-50 border-gray-200 focus:ring-2 focus:ring-indigo-200 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Descrição</label>
                            <textarea
                                id="description"
                                rows={8}
                                value={editingActivity.description}
                                onChange={handleEditFormChange}
                                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all resize-none font-sans text-gray-700 leading-relaxed"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Disciplina</label>
                            <select
                                id="discipline"
                                value={editingActivity.discipline}
                                onChange={handleEditFormChange}
                                className="w-full p-2.5 border rounded-lg bg-gray-50 border-gray-200 focus:ring-2 focus:ring-indigo-200 outline-none"
                            >
                                {disciplineOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
