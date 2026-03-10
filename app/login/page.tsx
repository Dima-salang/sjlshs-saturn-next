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
        <div className="relative min-h-screen bg-background text-foreground flex items-center justify-center overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Nebula Glow */}
                <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full" />
                
                {/* Saturn Rings Effect */}
                <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] opacity-20" viewBox="0 0 1000 1000">
                    <ellipse cx="500" cy="500" rx="450" ry="150" fill="none" stroke="currentColor" className="text-border/30" strokeWidth="0.5" transform="rotate(-15 500 500)" />
                    <ellipse cx="500" cy="500" rx="480" ry="160" fill="none" stroke="currentColor" className="text-border/30" strokeWidth="0.5" transform="rotate(-15 500 500)" />
                    <ellipse cx="500" cy="500" rx="510" ry="170" fill="none" stroke="currentColor" className="text-border/30" strokeWidth="0.5" transform="rotate(-15 500 500)" />
                </svg>
                
                {/* Stars */}
                {STARS.map((star) => (
                    <motion.div
                        key={star.id}
                        className="absolute w-px h-px bg-foreground/20 rounded-full"
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
                <Card className="border-border bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-blue-500/50 to-primary/50" />
                    <CardHeader className="space-y-1 flex flex-col items-center text-center pb-8">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-2xl shadow-primary/20"
                        >
                            <Orbit className="w-10 h-10 text-primary-foreground" />
                        </motion.div>
                        <CardTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
                            Welcome Back
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-lg">
                            Continue your journey across the rings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Button
                            asChild
                            className={cn(
                                "group relative flex items-center justify-center w-full h-14 rounded-xl",
                                "bg-primary text-primary-foreground hover:opacity-90 font-semibold text-lg transition-all duration-300",
                                "hover:scale-[1.02] active:scale-[0.98]",
                                "shadow-lg shadow-primary/20"
                            )}
                        >
                            <a href={`${process.env.NEXT_PUBLIC_API_URL}/login`}>
                                <span className="flex items-center gap-3 font-bold">
                                    <LogIn className="w-5 h-5" />
                                    Sign in with WorkOS
                                </span>
                                <ArrowRight className="absolute right-6 w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </a>
                        </Button>

                        <div className="relative flex items-center justify-center py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border" />
                            </div>
                            <span className="relative z-10 px-4 bg-card text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                Register
                            </span>
                        </div>

                        <div className="text-center">
                            <p className="text-muted-foreground text-sm">
                                Don't have an account?{' '}
                                <Link href="/register" className="text-primary hover:text-primary/80 transition-colors font-bold">
                                    Create an account
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border text-[10px] uppercase tracking-widest text-muted-foreground">
                        <Sparkles className="w-3 h-3 text-primary" />
                        Next-Gen Auth
                    </div>
                </div>
            </motion.div>

            {/* Subtle Footer branding */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-20 flex items-center gap-2 select-none">
                <div className="w-8 h-[1px] bg-foreground/50" />
                <span className="text-[10px] uppercase tracking-[0.4em] font-light text-foreground">Saturn OS</span>
                <div className="w-8 h-[1px] bg-foreground/50" />
            </div>
        </div>
    );
}
