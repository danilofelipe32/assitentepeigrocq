
import React from 'react';
import { useAppStore } from '../store.ts';
import { 
    BrainIcon, 
    EditorIcon, 
    ActivityIcon, 
    ArchiveIcon, 
    PaperclipIcon, 
    ShieldIcon 
} from '../constants.tsx';

interface SidebarProps {
    isSidebarOpen: boolean;
    onNavigate: (view: string) => void;
}

export const Sidebar = ({ isSidebarOpen, onNavigate }: SidebarProps) => {
    const { currentView } = useAppStore();

    const navItems = [
        { id: 'pei-form-view', label: 'Editor PEI', icon: <EditorIcon /> },
        { id: 'activity-bank-view', label: 'Banco Atividades', icon: <ActivityIcon /> },
        { id: 'pei-list-view', label: 'PEIs Salvos', icon: <ArchiveIcon /> },
        { id: 'files-view', label: 'Ficheiros', icon: <PaperclipIcon /> },
        { id: 'privacy-policy-view', label: 'Privacidade', icon: <ShieldIcon /> },
    ];

    return (
        <aside className={`fixed md:relative z-40 w-64 h-full bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out 
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}>
            
            <div className="flex items-center gap-3 p-6 border-b border-gray-100">
                <div className="text-3xl text-indigo-600"><BrainIcon /></div>
                <h1 className="text-xl font-bold text-gray-800 tracking-tight">Assistente PEI</h1>
            </div>

            <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                            ${currentView === item.id 
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                                : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}`}
                    >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Modo Google Gemini Pro Ativado</p>
            </div>
        </aside>
    );
};
