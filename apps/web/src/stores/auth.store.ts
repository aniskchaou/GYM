import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  gymId?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, accessToken, refreshToken) => {
        set({ user, accessToken, refreshToken });
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        }
      },
      clearAuth: () => {
        set({ user: null, accessToken: null, refreshToken: null });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      },
      isAuthenticated: () => !!get().user && !!get().accessToken,
    }),
    { name: 'gymflow-auth', partialize: (s) => ({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken }) },
  ),
);

/** Redirect path based on role */
export function getRoleDashboard(role: string): string {
  const routes: Record<string, string> = {
    SUPER_ADMIN: '/dashboard/super-admin',
    GYM_OWNER: '/dashboard/owner',
    BRANCH_MANAGER: '/dashboard/owner',
    RECEPTIONIST: '/dashboard/reception',
    TRAINER: '/dashboard/trainer',
    MEMBER: '/dashboard/member',
  };
  return routes[role] ?? '/dashboard/member';
}
