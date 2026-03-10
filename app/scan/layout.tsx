'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function ScanLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ProtectedRoute>
            {children}
        </ProtectedRoute>
    );
}
