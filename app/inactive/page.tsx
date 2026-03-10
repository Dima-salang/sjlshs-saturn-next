'use client';

import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, LogOut, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InactiveAccountPage() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If they are actually active, bounce them to the dashboard
        if (!loading && user?.is_active) {
            router.push('/admin/attendance');
        }
        
        // If they have no session at all, they shouldn't be here
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Don't flash content while checking auth state
    if (loading || user?.is_active) {
        return (
            <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
                <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center overflow-hidden bg-background">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 z-0">
                <div className="absolute -left-[10%] -top-[10%] h-[50vh] w-[50vh] rounded-full bg-red-500/5 dark:bg-red-900/10 blur-[100px]" />
                <div className="absolute -right-[10%] -bottom-[10%] h-[60vh] w-[60vh] rounded-full bg-orange-500/5 dark:bg-orange-900/10 blur-[120px]" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="z-10 w-full max-w-md px-6"
            >
                <div className="relative overflow-hidden rounded-3xl border border-border bg-card/50 p-8 pt-10 backdrop-blur-xl shadow-2xl shadow-red-500/5 dark:shadow-red-900/10">
                    
                    {/* Glowing corner indicator */}
                    <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-red-500/10 dark:bg-red-500/20 blur-xl" />

                    <div className="mb-6 flex justify-center">
                        <div className="relative">
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: [0.8, 1.1, 1] }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-b from-red-500/10 to-transparent border border-red-500/20 shadow-inner shadow-red-500/10"
                            >
                                <ShieldAlert className="h-10 w-10 text-red-600 dark:text-red-500" strokeWidth={1.5} />
                            </motion.div>
                            <motion.div
                                animate={{ opacity: [0.3, 0.8, 0.3] }}
                                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                                className="absolute inset-0 rounded-2xl border border-red-500/30"
                            />
                        </div>
                    </div>

                    <div className="space-y-3 text-center mb-8">
                        <motion.h1 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="font-mono text-2xl tracking-tighter text-foreground"
                        >
                            ACCOUNT PENDING
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-sm font-medium text-muted-foreground leading-relaxed"
                        >
                            Your account is currently inactive. You must contact a system administrator to verify your credentials and activate your access.
                        </motion.p>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mb-8 overflow-hidden rounded-xl border border-orange-500/20 bg-orange-500/5 dark:bg-orange-500/10 p-4 relative"
                    >
                        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-orange-400 to-red-600" />
                        <div className="flex items-start gap-3 pl-2">
                            <Clock className="mt-0.5 h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0" />
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-semibold tracking-tight text-orange-700 dark:text-orange-300">Awaiting Activation</span>
                                <span className="text-xs text-orange-950/60 dark:text-orange-200/70 leading-relaxed">
                                    You created an account as <strong>{user?.name}</strong>. An administrator must check your account before you can use the app.
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col gap-3"
                    >
                        <Button
                            onClick={() => logout()}
                            className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg shadow-primary/20"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            End Session
                        </Button>
                    </motion.div>

                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground"
                >
                    <AlertTriangle className="h-3 w-3" />
                    <span>Saturn OS Automated Security</span>
                </motion.div>
            </motion.div>
        </div>
    );
}
