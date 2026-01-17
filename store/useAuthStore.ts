import { RoleType } from "@/types/authType";
import { create } from "zustand";

type AuthState = {
  userID?: string;
  role: RoleType;
  urlImg: string;
  userName: string;
  provider: string;
  phone: string;
  created: string

  setUserID: (id?: string) => void;
  setRole: (role: RoleType) => void;
  setUrlImg: (url: string) => void;
  setUserName: (name: string) => void;
  setProvider: (provider: string) => void;
  setPhone: (phone: string) => void;
  setCreated: (created: string) => void;

  reset: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  userID: undefined,
  role: "user" as RoleType,
  urlImg: "",
  userName: "",
  provider: "",
  phone: "",
  created: "",

  setUserID: (id) => set({ userID: id }),
  setRole: (role) => set({ role }),
  setUrlImg: (url) => set({ urlImg: url }),
  setUserName: (name) => set({ userName: name }),
  setProvider: (provider) => set({ provider }),
  setPhone: (phone) => set({ phone }),
  setCreated: (created) => set({ created }),

  reset: () =>
    set({
      userID: undefined,
      role: "user" as RoleType,
      urlImg: "",
      userName: "",
      provider: "",
      phone: "",
      created: "",
    }),
}));
