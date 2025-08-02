import { create } from "zustand";

const useNavigationStore = create((set) => ({
  previousRoute: null,
  backHandlingEnabled: false,

  setPreviousRoute: (route) => set({ previousRoute: route }),
  clearPreviousRoute: () => set({ previousRoute: null }),
  enableBackHandling: () => set({ backHandlingEnabled: true }),
  disableBackHandling: () => set({ backHandlingEnabled: false }),
}));

export default useNavigationStore;
