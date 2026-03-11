'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import api from '@/lib/api';

interface User {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    is_admin: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            console.log('[AuthContext] Initializing CSRF and fetching user...');
            
            // In cross-domain production, we MUST hit the CSRF endpoint first 
            // to establish the session handshake, even for GET requests.
            await api.get('/sanctum/csrf-cookie');
            
            const response = await api.get('/api/me');
            console.log('[AuthContext] User response:', response.data);
            
            if (response.data.authenticated) {
                setUser(response.data);
            } else {
                setUser(null);
            }
        } catch (error: any) {
            if (error.response?.status === 401) {
                console.log('[AuthContext] 401: Unauthorized');
                setUser(null);
            } else {
                console.error('[AuthContext] Error:', error);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const logout = async () => {
        setUser(null);
        try {
            // Use /api/logout (not /logout) — the API route returns JSON with the WorkOS logout URL.
            // The web /logout route returns a raw redirect which axios can't use for page navigation.
            const response = await api.post('/api/logout');

            console.log('[logout] response:', response.data);

            // If the backend provided a full SSO logout URL (WorkOS), navigate the browser to it.
            // This ends the WorkOS session so the user gets the account picker on next login.
            if (response.data?.url) {
                console.log('[logout] redirecting to WorkOS logout URL:', response.data.url);
                window.location.href = response.data.url;
                return;
            }

            console.warn('[logout] no WorkOS URL returned, falling back to /login');
        } catch (error) {
            console.error('[logout] failed:', error);
        }

        // Fallback: no SSO URL, just go to login
        window.location.href = '/login';
    };

    const value = useMemo(() => ({
        user,
        loading,
        logout,
        refreshUser: fetchUser
    }), [user, loading, fetchUser]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
