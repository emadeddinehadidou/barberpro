import { create } from "zustand";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  authChecked: boolean;
  setUser: (user: User | null) => void;
  setAuthChecked: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  authChecked: false,
  setUser: (user) => set({ user }),
  setAuthChecked: (value) => set({ authChecked: value }),
  logout: () => set({ user: null, authChecked: true }),
}));