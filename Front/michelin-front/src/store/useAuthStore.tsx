import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { IAuthState } from "../types/IAuthState";

export const useAuthStore = create<IAuthState>()(
  persist(
    (set) => ({
      loggedIn: false,
      memberGrade: null,
      activeModal: "NONE",
      accessToken: localStorage.getItem("accessToken") || null,
      toastMessage: null,
      introUnlocked: false,

      login: (grade: string, token: string) => {
        set({ loggedIn: true, memberGrade: grade, accessToken: token });
      },

      logout: () => {
        set({ loggedIn: false, memberGrade: null, activeModal: "NONE", accessToken: null });
      },

      setAccessToken: (token: string | null) => {
        set({ accessToken: token });
      },

      setActiveModal: (state: string) => {
        set({ activeModal: state });
      },

      closeModal: () => {
        set({ activeModal: "NONE" });
      },

      setToastMessage: (msg: string | null) => {
        set({ toastMessage: msg });
      },

      setIntroUnlocked: () => {
        set({ introUnlocked: true })
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage), // ← localStorage → sessionStorage
      partialize: (state) => ({
        accessToken: state.accessToken,
        loggedIn: state.loggedIn,
        memberGrade: state.memberGrade,
        introUnlocked: state.introUnlocked,
      }),
    }
  )
);