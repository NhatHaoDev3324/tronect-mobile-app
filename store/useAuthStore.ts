import { RoleType } from "@/types/authType";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { useChatRealtimeStore } from "./useChatRealtimeStore";

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

  reset: async () => {
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("user_location_v1");

    try {
      useChatRealtimeStore.getState().resetStore();
    } catch (e) {
      console.error("Failed to reset chat store:", e);
    }

    set({
      userID: undefined,
      role: "user" as RoleType,
      urlImg: "",
      userName: "",
      provider: "",
      phone: "",
      created: "",
    })
  },
}));
