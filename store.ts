
import { create } from 'zustand';
import type { ViewType } from './types.ts';

interface AppState {
  currentView: ViewType;
  editingPeiId: string | null;
  viewingActivityId: string | null;
  hasAgreedToPrivacy: boolean;
  navigateToView: (view: ViewType) => void;
  navigateToEditPei: (peiId: string) => void;
  navigateToNewPei: () => void;
  navigateToActivityDetail: (activityId: string) => void;
  setHasAgreedToPrivacy: (agreed: boolean) => void;
}

const getInitialView = (): ViewType => {
    const params = new URLSearchParams(window.location.search);
    const viewFromUrl = params.get('view') as ViewType;
    const validViews: ViewType[] = ['pei-form-view', 'activity-bank-view', 'pei-list-view', 'files-view', 'privacy-policy-view', 'activity-detail-view'];
    
    if (viewFromUrl && validViews.includes(viewFromUrl)) {
        window.history.replaceState({}, document.title, window.location.pathname);
        return viewFromUrl;
    }
    return 'pei-form-view';
};

export const useAppStore = create<AppState>((set) => ({
  currentView: getInitialView(),
  editingPeiId: null,
  viewingActivityId: null,
  hasAgreedToPrivacy: localStorage.getItem('privacyPolicyAgreed') === 'true',
  
  navigateToView: (view) => set({ 
      currentView: view, 
      editingPeiId: null,
      viewingActivityId: null
  }),
  
  navigateToEditPei: (peiId) => set({ 
      currentView: 'pei-form-view', 
      editingPeiId: peiId,
      viewingActivityId: null
  }),
  
  navigateToNewPei: () => set({ 
      currentView: 'pei-form-view', 
      editingPeiId: null,
      viewingActivityId: null
  }),

  navigateToActivityDetail: (activityId) => set({
      currentView: 'activity-detail-view',
      viewingActivityId: activityId
  }),

  setHasAgreedToPrivacy: (agreed) => {
    localStorage.setItem('privacyPolicyAgreed', String(agreed));
    set({ hasAgreedToPrivacy: agreed });
  },
}));
