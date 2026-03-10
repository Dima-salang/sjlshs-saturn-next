'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Globe, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
    const { user, loading, logout } = useAuth();

    return (
        <div className="relative min-h-[calc(100vh-64px)] overflow-hidden flex flex-col items-center justify-center font-sans px-4 bg-background">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-background" />
                <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-blue-600/5 dark:bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-purple-600/5 dark:bg-purple-600/10 blur-[120px] rounded-full" />
                
                {/* Orbital Rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] border border-border/50 rounded-[100%] rotate-[-15deg]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] border border-border/30 rounded-[100%] rotate-[-15deg]" />
            </div>

            <main className="relative z-10 max-w-5xl mx-auto text-center py-20 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border mb-8 shadow-sm"
                >
                    <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Saturn</span>
                </motion.div>

                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60"
                >
                    The Modern Way to <br />
                    Manage Your School.
                </motion.h1>

                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12"
                >
                    The all-in-one platform for attendance and records. 
                    Sync students, teachers, and logs instantly with zero friction.
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    {!loading && user ? (
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button asChild className="h-14 px-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-bold shadow-lg shadow-primary/20">
                                <Link href="/scan">
                                    Scan QR Codes
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                            </Button>
                            <Button 
                                onClick={() => logout()}
                                variant="outline" 
                                className="h-14 px-8 rounded-full border-destructive/20 bg-destructive/5 hover:bg-destructive hover:text-destructive-foreground text-destructive text-lg font-bold transition-all"
                            >
                                Logout Account
                            </Button>
                        </div>
                    ) : (
                        <Button asChild className="h-14 px-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-bold shadow-lg shadow-primary/20">
                            <Link href="/login">
                                Get Started
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </Button>
                    )}
                    {user && (
                        <Button asChild variant="outline" className="h-14 px-8 rounded-full border-border bg-background/50 hover:bg-accent text-foreground text-lg">
                            <Link href="/test-api">Developer API</Link>
                        </Button>
                    )}
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left">
                    <FeatureCard 
                        icon={<Shield className="w-6 h-6 text-blue-500" />}
                        title="Secure Identity"
                        description="Professional security powered by industry standards."
                    />
                    <FeatureCard 
                        icon={<Zap className="w-6 h-6 text-purple-500" />}
                        title="Instant Sync"
                        description="Attendance records show up on your dashboard in real-time."
                    />
                    <FeatureCard 
                        icon={<Globe className="w-6 h-6 text-indigo-500" />}
                        title="Easy Access"
                        description="Manage your school records from any device, anywhere."
                    />
                </div>
            </main>
        </div>
    );
}

function FeatureCard({ icon, title, description }: Readonly<{ icon: React.ReactNode, title: string, description: string }>) {
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="p-6 rounded-2xl bg-card border border-border backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
        >
            <div className="mb-4">{icon}</div>
            <h3 className="text-lg font-semibold text-card-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </motion.div>
    );
}
