
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store.ts';
import { getAllActivities } from '../services/storageService.ts';
import { Activity } from '../types.ts';

export const ActivityDetailView = () => {
    const { viewingActivityId, navigateToView } = useAppStore();
    const [activity, setActivity] = useState<Activity | null>(null);

    useEffect(() => {
        if (viewingActivityId) {
            const all = getAllActivities();
            const found = all.find(a => a.id === viewingActivityId);
            if (found) setActivity(found);
        }
    }, [viewingActivityId]);

    if (!activity) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Atividade não encontrada.</p>
                <button onClick={() => navigateToView('activity-bank-view')} className="mt-4 text-indigo-600 hover:underline">
                    Voltar ao Banco
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <button 
                onClick={() => navigateToView('activity-bank-view')}
                className="mb-6 flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors"
            >
                <i className="fa-solid fa-arrow-left"></i>
                Voltar ao Banco de Atividades
            </button>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className={`p-8 ${activity.isDUA ? 'bg-indigo-50' : 'bg-gray-50'} border-b border-gray-100`}>
                    <div className="flex justify-between items-start">
                        <div>
                            {activity.isDUA && (
                                <span className="inline-block px-3 py-1 bg-indigo-200 text-indigo-700 text-xs font-bold rounded-full mb-3">
                                    DESENHO UNIVERSAL PARA A APRENDIZAGEM (DUA)
                                </span>
                            )}
                            <h2 className="text-3xl font-bold text-gray-800">{activity.title}</h2>
                            <p className="text-indigo-600 font-semibold mt-1">{activity.discipline}</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    <section>
                        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <i className="fa-solid fa-align-left text-indigo-400"></i>
                            Descrição da Atividade
                        </h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {activity.description}
                        </p>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section>
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <i className="fa-solid fa-bullseye text-green-400"></i>
                                Habilidades Desenvolvidas
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {(Array.isArray(activity.skills) ? activity.skills : [activity.skills]).map((skill: any, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <i className="fa-solid fa-person-walking-with-cane text-sky-400"></i>
                                Necessidades Atendidas
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {(Array.isArray(activity.needs) ? activity.needs : [activity.needs]).map((need: any, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-sky-50 text-sky-700 rounded-lg text-sm border border-sky-100">
                                        {need}
                                    </span>
                                ))}
                            </div>
                        </section>
                    </div>

                    {activity.comments && (
                        <section className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                            <h3 className="text-lg font-bold text-amber-800 mb-2 flex items-center gap-2">
                                <i className="fa-solid fa-comment-dots text-amber-400"></i>
                                Notas do Professor
                            </h3>
                            <p className="text-amber-700 text-sm">
                                {activity.comments}
                            </p>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};
