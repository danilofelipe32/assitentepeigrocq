
import React from 'react';

const Tag = ({ children, colorClass }: { children: React.ReactNode, colorClass: string }) => {
    return (
        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${colorClass}`}>
            {children}
        </span>
    );
};

export const ActivityCard = (props: any) => {
    const { activity, onDelete, onToggleFavorite, onAddToPei, onEdit } = props;
    
    return (
        <div className={`flex flex-col h-full bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md hover:border-indigo-100 group overflow-hidden ${activity.isDUA ? 'border-blue-100 ring-1 ring-blue-50' : 'border-gray-200'}`}>
            <div className={`p-5 flex flex-col flex-1`}>
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-bold text-gray-800 pr-2 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                        {activity.title}
                    </h3>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button
                            onClick={() => onEdit(activity)}
                            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                            title="Editar"
                        >
                            <i className="fa-solid fa-pencil text-[10px]"></i>
                        </button>
                        <button
                            onClick={() => onDelete(activity.id)}
                            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                            title="Excluir"
                        >
                            <i className="fa-solid fa-trash-can text-[10px]"></i>
                        </button>
                    </div>
                </div>
                
                <p className="text-gray-500 text-sm mb-4 leading-relaxed line-clamp-4 flex-1">
                    {activity.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-gray-50">
                    {activity.isDUA && <Tag colorClass="bg-blue-100 text-blue-700">DUA</Tag>}
                    <Tag colorClass="bg-indigo-50 text-indigo-600">{activity.discipline}</Tag>
                    {(Array.isArray(activity.skills) ? activity.skills : []).slice(0, 1).map((skill: string) => (
                        <Tag key={skill} colorClass="bg-emerald-50 text-emerald-700">{skill}</Tag>
                    ))}
                </div>
            </div>

            <div className="bg-gray-50 px-5 py-3 flex justify-between items-center border-t border-gray-100">
                <button
                    onClick={() => onToggleFavorite(activity.id)}
                    className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors
                        ${activity.isFavorited ? 'text-amber-500' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <i className={`fa-solid fa-star ${activity.isFavorited ? '' : 'fa-regular'}`}></i>
                    {activity.isFavorited ? 'Favorito' : 'Favoritar'}
                </button>

                <button
                    onClick={() => onAddToPei(activity)}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                    <i className="fa-solid fa-plus"></i>
                    Add ao PEI
                </button>
            </div>
        </div>
    );
};
