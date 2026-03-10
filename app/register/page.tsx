'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserPlus, ArrowRight, Sparkles, Orbit, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const STARS = Array.from({ length: 30 }).map((_, i) => ({
    id: `reg-star-${i}`,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    duration: 3 + Math.random() * 5,
    delay: Math.random() * 2,
}));

const FEATURES = [
    { icon: Sparkles, text: "Access premium features" },
    { icon: ShieldCheck, text: "Secure enterprise-grade authentication" },
    { icon: Orbit, text: "Connect with the Saturn ecosystem" },
];

export default function RegisterPage() {
    return (
        <div className="relative min-h-screen bg-background text-foreground flex items-center justify-center overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full" />
                
                {/* Orbital Path Line */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-border to-transparent rotate-[-15deg]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[80%] bg-gradient-to-b from-transparent via-border to-transparent rotate-[-15deg]" />

                {/* Stars */}
                {STARS.map((star) => (
                    <motion.div
                        key={star.id}
                        className="absolute w-px h-px bg-foreground/20 rounded-full"
                        initial={{ opacity: 0.1 }}
                        animate={{ opacity: [0.1, 0.5, 0.1] }}
                        transition={{ duration: star.duration, repeat: Infinity, delay: star.delay }}
                        style={{
                            top: star.top,
                            left: star.left,
                        }}
                    />
                ))}
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-md px-4"
            >
                <Card className="border-border bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-blue-500/50 to-primary/50" />
                    <CardHeader className="space-y-1 flex flex-col items-center text-center pb-8 p-8">
                        <motion.div
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-2xl shadow-primary/20"
                        >
                            <UserPlus className="w-8 h-8 text-primary-foreground" />
                        </motion.div>
                        <CardTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
                            Join the Orbit
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-lg">
                            Create your account and start exploring.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 p-8 pt-0">

                        <Button
                            asChild
                            className={cn(
                                "group relative flex items-center justify-center w-full h-14 rounded-xl",
                                "bg-gradient-to-r from-primary to-blue-600 text-primary-foreground hover:opacity-90 font-semibold text-lg transition-all duration-300",
                                "hover:scale-[1.02] active:scale-[0.98]",
                                "shadow-lg shadow-primary/20"
                            )}
                        >
                            <a href={`${process.env.NEXT_PUBLIC_API_URL}/login`}>
                                <span className="flex items-center gap-3 font-bold">
                                    Register Now
                                </span>
                                <ArrowRight className="absolute right-6 w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </a>
                        </Button>

                        <div className="text-center pt-2">
                            <p className="text-muted-foreground text-sm">
                                Already a member?{' '}
                                <Link href="/login" className="text-primary hover:text-primary/80 transition-colors font-bold">
                                    Sign in instead
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
