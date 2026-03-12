'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * A wrapper component that protects routes.
 * If not authenticated, redirects to the home page.
 * If inactive, redirects to the inactive page.
 * If adminOnly is true and user is not an admin, redirects to home.
 */
export function ProtectedRoute({ 
    children,
    adminOnly = false
}: Readonly<{ 
    children: React.ReactNode;
    adminOnly?: boolean;
}>) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not logged in -> Login page
                router.push('/login');
            } else if (!user.is_active && pathname !== '/inactive') {
                // Logged in but inactive -> Inactive page
                router.push('/inactive');
            } else if (adminOnly && !user.is_admin) {
                // Admin only but user is not admin -> Home
                router.push('/');
            }
        }
    }, [user, loading, router, pathname, adminOnly]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect in useEffect
    }

    if (!user.is_active && pathname !== '/inactive') {
        return null; // Will redirect in useEffect
    }

    if (adminOnly && !user.is_admin) {
        return null; // Will redirect in useEffect
    }

    return <>{children}</>;
}
