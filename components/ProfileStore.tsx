import { create } from 'zustand';

export interface ActivityLogEntry {
    id: string;
    action: string;
    entityType: string | null;
    entityId: string | null;
    description: string | null;
    ipAddress: string | null;
    createdAt: string;
}

interface ProfileState {
    id: string;
    name: string;
    email: string;
    phone: string;
    opd: string;
    role: string;
    avatarUrl: string;
    logs: ActivityLogEntry[];
    loaded: boolean;
    loading: boolean;
    saving: boolean;
    error: string | null;
    setAvatar: (url: string) => void;
    loadProfile: () => Promise<void>;
    loadLogs: () => Promise<void>;
    saveProfile: (input: {
        name?: string;
        email?: string;
        phone?: string;
        opdName?: string;
        password?: string;
        currentPassword?: string;
    }) => Promise<{ ok: boolean; error?: string }>;
}

export const ProfileStore = create<ProfileState>((set, get) => ({
    id: '',
    name: '',
    email: '',
    phone: '',
    opd: '',
    role: '',
    avatarUrl: '/logo_siap.png',
    logs: [],
    loaded: false,
    loading: false,
    saving: false,
    error: null,

    setAvatar: (url) => set({ avatarUrl: url }),

    loadProfile: async () => {
        if (get().loading) return;
        set({ loading: true, error: null });
        try {
            const res = await fetch('/api/auth/me', { cache: 'no-store' });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                set({ loading: false, error: data.error ?? 'Failed to load profile' });
                return;
            }
            const u = await res.json();
            set({
                id: u.id,
                name: u.name ?? '',
                email: u.email ?? '',
                phone: u.phone ?? '',
                opd: u.opd?.name ?? '',
                role: u.role ?? '',
                loaded: true,
                loading: false,
            });
        } catch (e) {
            set({ loading: false, error: 'Failed to load profile' });
        }
    },

    loadLogs: async () => {
        try {
            const res = await fetch('/api/profile/activity', { cache: 'no-store' });
            if (!res.ok) return;
            const logs = await res.json();
            set({ logs });
        } catch {
            // ignore
        }
    },

    saveProfile: async (input) => {
        set({ saving: true, error: null });
        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: input.name,
                    email: input.email,
                    phone: input.phone,
                    opdName: input.opdName,
                    password: input.password || undefined,
                    currentPassword: input.currentPassword || undefined,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                set({ saving: false, error: data.error ?? 'Save failed' });
                return { ok: false, error: data.error ?? 'Save failed' };
            }
            const u = await res.json();
            set({
                id: u.id,
                name: u.name ?? '',
                email: u.email ?? '',
                phone: u.phone ?? '',
                opd: u.opd?.name ?? '',
                role: u.role ?? '',
                saving: false,
            });
            await get().loadLogs();
            return { ok: true };
        } catch {
            set({ saving: false, error: 'Save failed' });
            return { ok: false, error: 'Save failed' };
        }
    },
}));
