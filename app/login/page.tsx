'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogIn, ArrowRight, Sparkles, Orbit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Non-deterministic but stable keys for background elements
const STARS = Array.from({ length: 30 }).map((_, i) => ({
    id: `star-${i}`,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    scale: Math.random() * 2,
    duration: 2 + Math.random() * 4,
}));

export default function LoginPage() {
    return (
        <div className="relative min-h-screen bg-[#050508] text-zinc-100 flex items-center justify-center overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Nebula Glow */}
                <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-600/10 blur-[120px] rounded-full" />
                
                {/* Saturn Rings Effect */}
                <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] opacity-20" viewBox="0 0 1000 1000">
                    <ellipse cx="500" cy="500" rx="450" ry="150" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" transform="rotate(-15 500 500)" />
                    <ellipse cx="500" cy="500" rx="480" ry="160" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" transform="rotate(-15 500 500)" />
                    <ellipse cx="500" cy="500" rx="510" ry="170" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" transform="rotate(-15 500 500)" />
                </svg>
                
                {/* Stars */}
                {STARS.map((star) => (
                    <motion.div
                        key={star.id}
                        className="absolute w-px h-px bg-white rounded-full"
                        initial={{ opacity: 0.2 }}
                        animate={{ opacity: [0.2, 0.8, 0.2] }}
                        transition={{ duration: star.duration, repeat: Infinity }}
                        style={{
                            top: star.top,
                            left: star.left,
                            transform: `scale(${star.scale})`,
                        }}
                    />
                ))}
            </div>

            {/* ... rest of the file ... */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md px-4"
            >
                <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="space-y-1 flex flex-col items-center text-center pb-8">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-2xl shadow-blue-500/20"
                        >
                            <Orbit className="w-10 h-10 text-white" />
                        </motion.div>
                        <CardTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
                            Welcome Back
                        </CardTitle>
                        <CardDescription className="text-zinc-500 text-lg">
                            Continue your journey across the rings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Button
                            asChild
                            variant="outline"
                            className={cn(
                                "group relative flex items-center justify-center w-full h-14 rounded-xl",
                                "bg-white text-black hover:bg-zinc-100 hover:text-black border-none font-semibold text-lg transition-all duration-300",
                                "hover:scale-[1.02] active:scale-[0.98]",
                                "shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                            )}
                        >
                            <a href={`${process.env.NEXT_PUBLIC_API_URL}/login`}>
                                <span className="flex items-center gap-3">
                                    <LogIn className="w-5 h-5" />
                                    Sign in with WorkOS
                                </span>
                                <ArrowRight className="absolute right-6 w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </a>
                        </Button>

                        <div className="relative flex items-center justify-center py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-800" />
                            </div>
                            <span className="relative z-10 px-4 bg-[#0a0a0c] text-xs font-medium uppercase tracking-[0.2em] text-zinc-600">
                                Orbital Access
                            </span>
                        </div>

                        <div className="text-center">
                            <p className="text-zinc-500 text-sm">
                                Don't have an account?{' '}
                                <Link href="/register" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                                    Create an account
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500">
                        <Sparkles className="w-3 h-3 text-blue-400" />
                        Next-Gen Auth
                    </div>
                </div>
            </motion.div>

            {/* Subtle Footer branding */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-20 flex items-center gap-2 select-none">
                <div className="w-8 h-[1px] bg-zinc-500" />
                <span className="text-[10px] uppercase tracking-[0.4em] font-light">Saturn OS</span>
                <div className="w-8 h-[1px] bg-zinc-500" />
            </div>
        </div>
    );
}
