import AsyncStorage from "@react-native-async-storage/async-storage"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export type User = {
    id: string
    userName: string
    phone: string
    role: "tenant" | "landlord"
    img: string
}

type AuthState = {
    user: User | null
    setUser: (user: User) => void
    updateUser: (data: Partial<User>) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,

            setUser: (user) => set({ user }),

            updateUser: (data) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...data } : null,
                })),

            logout: () => set({ user: null }),
        }),
        {
            name: "auth-user-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
)