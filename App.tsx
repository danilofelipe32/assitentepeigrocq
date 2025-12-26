
import React, { useState, useEffect } from 'react';
import { useAppStore } from './store.ts';

// Components
import { PeiFormView } from './components/PeiFormView.tsx';
import { ActivityBankView } from './components/ActivityBankView.tsx';
import { PeiListView } from './components/PeiListView.tsx';
import { SupportFilesView } from './components/SupportFilesView.tsx';
import { PrivacyPolicyView } from './components/PrivacyPolicyView.tsx';
import { ActivityDetailView } from './components/ActivityDetailView.tsx';
import { OnboardingModal } from './components/OnboardingModal.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { BrainIcon } from './constants.tsx';

const App = () => {
    const { currentView, editingPeiId, hasAgreedToPrivacy, navigateToView, navigateToNewPei } = useAppStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
        if (hasAgreedToPrivacy && !hasCompletedOnboarding) {
            setShowOnboarding(true);
        }
    }, [hasAgreedToPrivacy]);

    const handleOnboardingFinish = () => {
        localStorage.setItem('hasCompletedOnboarding', 'true');
        setShowOnboarding(false);
    };

    const handleNavigation = (targetView: any) => {
        if (targetView === 'pei-form-view') {
            navigateToNewPei();
        } else {
            navigateToView(targetView);
        }
        setIsSidebarOpen(false);
    };

    if (!hasAgreedToPrivacy) {
        return (
            <div className="h-screen w-full flex items-center justify-center p-4 bg-gray-100">
                <PrivacyPolicyView />
            </div>
        );
    }

    const renderCurrentView = () => {
        switch (currentView) {
            case 'pei-form-view':
                return <PeiFormView key={editingPeiId || 'new'} editingPeiId={editingPeiId} onSaveSuccess={() => navigateToView('pei-list-view')} />;
            case 'activity-bank-view':
                return <ActivityBankView />;
            case 'pei-list-view':
                return <PeiListView />;
            case 'files-view':
                return <SupportFilesView />;
            case 'privacy-policy-view':
                return <PrivacyPolicyView />;
            case 'activity-detail-view':
                return <ActivityDetailView />;
            default:
                return <div className="p-8 text-center text-gray-500">Página não encontrada</div>;
        }
    };

    return (
        <div className="h-screen w-full bg-gray-100 flex flex-col md:flex-row font-sans overflow-hidden">
            <OnboardingModal isOpen={showOnboarding} onClose={handleOnboardingFinish} />
            
            {/* Mobile Header */}
            <header className="md:hidden flex justify-between items-center p-4 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
                 <div className="flex items-center gap-3">
                    <div className="text-2xl text-indigo-600"><BrainIcon /></div>
                    <h1 className="text-xl font-bold text-gray-800">Assistente PEI</h1>
                </div>
                <button type="button" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600 focus:outline-none">
                    <i className={`fa-solid ${isSidebarOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
                </button>
            </header>
            
            <Sidebar 
                isSidebarOpen={isSidebarOpen} 
                onNavigate={handleNavigation}
            />
            
            <main className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
                 <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {renderCurrentView()}
                 </div>
            </main>

            {/* Bottom Nav Mobile */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg flex justify-around p-2 z-30">
                <button onClick={() => handleNavigation('pei-form-view')} className={`flex flex-col items-center p-2 text-xs ${currentView === 'pei-form-view' ? 'text-indigo-600' : 'text-gray-500'}`}>
                    <i className="fa-solid fa-file-lines mb-1"></i>
                    <span>Editor</span>
                </button>
                <button onClick={() => handleNavigation('activity-bank-view')} className={`flex flex-col items-center p-2 text-xs ${currentView === 'activity-bank-view' ? 'text-indigo-600' : 'text-gray-500'}`}>
                    <i className="fa-solid fa-lightbulb mb-1"></i>
                    <span>Banco</span>
                </button>
                <button onClick={() => handleNavigation('pei-list-view')} className={`flex flex-col items-center p-2 text-xs ${currentView === 'pei-list-view' ? 'text-indigo-600' : 'text-gray-500'}`}>
                    <i className="fa-solid fa-box-archive mb-1"></i>
                    <span>Salvos</span>
                </button>
                <button onClick={() => handleNavigation('files-view')} className={`flex flex-col items-center p-2 text-xs ${currentView === 'files-view' ? 'text-indigo-600' : 'text-gray-500'}`}>
                    <i className="fa-solid fa-paperclip mb-1"></i>
                    <span>Arquivos</span>
                </button>
            </nav>
        </div>
    );
};

export default App;
