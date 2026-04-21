import { create } from 'zustand';

interface Activity {
    title: string;
    desc: string;
    time: string;
    date: string;
}

interface ProfileState {
    name: string;
    email: string;
    opd: string;
    role: string;
    updateProfile: (data: Partial<ProfileState>) => void;
    logs: Activity[];
    addLog: (log: Activity) => void;
    avatarUrl: string;
    setAvatar: (url: string) => void;
}

export const ProfileStore = create<ProfileState>((set) => ({
    avatarUrl: "/logo_siap.png", // Default image
    setAvatar: (url) => set({ avatarUrl: url }),
    name: "Jodi Darmawan",
    email: "jodi.d@siap.com",
    opd: "Dinas Komunikasi dan Informatika",
    role: "Admin",
    logs: [],
    addLog: (log) => set((state) => ({ logs: [log, ...state.logs] })),
    updateProfile: (data) => set((state) => ({ ...state, ...data })),
}));