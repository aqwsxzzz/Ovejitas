import type { IUser } from "@/features/auth/types/auth-types";
import { create } from "zustand";

interface IAuthStore {
    userData: IUser | null;
    setUserData: (data: IUser | null) => void;
}

export const useAuthStore = create<IAuthStore>((set) => ({
    userData: null,
    setUserData: (data) => set({ userData: data }),
}));
