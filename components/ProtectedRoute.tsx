'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * A wrapper component that protects routes.
 * If not authenticated, redirects to the home page.
 * If inactive, redirects to the inactive page.
 */
export function ProtectedRoute({ children }: Readonly<{ children: React.ReactNode }>) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not logged in -> Home
                router.push('/');
            } else if (!user.is_active && pathname !== '/inactive') {
                // Logged in but inactive -> Inactive page
                router.push('/inactive');
            }
        }
    }, [user, loading, router, pathname]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#050508]">
                <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect in useEffect
    }

    if (!user.is_active && pathname !== '/inactive') {
        return null; // Will redirect in useEffect
    }

    return <>{children}</>;
}
