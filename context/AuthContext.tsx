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
            const response = await api.get('/api/me');
            if (response.data.authenticated) {
                setUser(response.data);
            } else {
                setUser(null);
            }
        } catch (error: any) {
            if (error.response?.status === 401) {
                setUser(null);
            } else {
                console.error('Failed to fetch user:', error);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setUser(null);
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
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
