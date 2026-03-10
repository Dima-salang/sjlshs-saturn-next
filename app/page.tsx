'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Globe, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
    const { user, loading } = useAuth();

    return (
        <div className="relative min-h-[calc(100vh-64px)] overflow-hidden flex flex-col items-center justify-center font-sans px-4">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#050508]" />
                <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full" />
                
                {/* Orbital Rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] border border-zinc-800/30 rounded-[100%] rotate-[-15deg]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] border border-zinc-800/10 rounded-[100%] rotate-[-15deg]" />
            </div>

            <main className="relative z-10 max-w-5xl mx-auto text-center py-20 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 mb-8"
                >
                    <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">Saturn V1.0 - Live Intelligence</span>
                </motion.div>

                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500"
                >
                    Manage Your Educational <br />
                    Universe in Hub-Time.
                </motion.h1>

                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg md:text-xl text-zinc-500 max-w-2xl mb-12"
                >
                    The next-generation attendance and management core for SJLSHS. 
                    Synchronize students, teachers, and records with zero friction.
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    {!loading && user ? (
                        <Button asChild className="h-14 px-8 rounded-full bg-white text-black hover:bg-zinc-200 text-lg font-bold">
                            <Link href="/scan">
                                Open Scanner
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </Button>
                    ) : (
                        <Button asChild className="h-14 px-8 rounded-full bg-white text-black hover:bg-zinc-200 text-lg font-bold">
                            <Link href="/login">
                                Get Started
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </Button>
                    )}
                    <Button asChild variant="outline" className="h-14 px-8 rounded-full border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-300 text-lg">
                        <Link href="/test-api">Access Lab</Link>
                    </Button>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left">
                    <FeatureCard 
                        icon={<Shield className="w-6 h-6 text-blue-400" />}
                        title="Secure Identity"
                        description="Powered by WorkOS AuthKit for enterprise-grade security."
                    />
                    <FeatureCard 
                        icon={<Zap className="w-6 h-6 text-purple-400" />}
                        title="Instant Sync"
                        description="Watch attendance records appear in dashboard in real-time."
                    />
                    <FeatureCard 
                        icon={<Globe className="w-6 h-6 text-indigo-400" />}
                        title="Orbital Reach"
                        description="Access your school management dashboard from any planet (or device)."
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
            className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-sm"
        >
            <div className="mb-4">{icon}</div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
        </motion.div>
    );
}
