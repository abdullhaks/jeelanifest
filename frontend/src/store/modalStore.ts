import { create } from 'zustand';

interface ModalState {
  liveModalOpen: boolean;
  finalModalOpen: boolean;
  selectedEventId: string | null;
  openLiveModal: (eventId: string) => void;
  closeLiveModal: () => void;
  openFinalModal: () => void;
  closeFinalModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  liveModalOpen: false,
  finalModalOpen: false,
  selectedEventId: null,
  openLiveModal: (eventId) => set({ liveModalOpen: true, selectedEventId: eventId }),
  closeLiveModal: () => set({ liveModalOpen: false, selectedEventId: null }),
  openFinalModal: () => set({ finalModalOpen: true }),
  closeFinalModal: () => set({ finalModalOpen: false }),
}));
