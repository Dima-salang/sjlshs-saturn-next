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
    { icon: Sparkles, text: "Access premium orbital features" },
    { icon: ShieldCheck, text: "Secure enterprise-grade authentication" },
    { icon: Orbit, text: "Connect with the Saturn ecosystem" },
];

export default function RegisterPage() {
    return (
        <div className="relative min-h-screen bg-[#050508] text-zinc-100 flex items-center justify-center overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-600/10 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full" />
                
                {/* Orbital Path Line */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent rotate-[-15deg]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[80%] bg-gradient-to-b from-transparent via-zinc-800 to-transparent rotate-[-15deg]" />

                {/* Stars */}
                {STARS.map((star) => (
                    <motion.div
                        key={star.id}
                        className="absolute w-px h-px bg-white rounded-full"
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
                <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="space-y-1 flex flex-col items-center text-center pb-8">
                        <motion.div
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-2xl shadow-purple-500/20"
                        >
                            <UserPlus className="w-8 h-8 text-white" />
                        </motion.div>
                        <CardTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
                            Join the Orbit
                        </CardTitle>
                        <CardDescription className="text-zinc-500 text-lg">
                            Create your account and start exploring.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl backdrop-blur-sm mb-2">
                            <ul className="space-y-4">
                                {FEATURES.map((item) => (
                                    <li key={item.text} className="flex items-center gap-3 text-sm text-zinc-400">
                                        <item.icon className="w-4 h-4 text-purple-400" />
                                        {item.text}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Button
                            asChild
                            className={cn(
                                "group relative flex items-center justify-center w-full h-14 rounded-xl",
                                "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500 font-semibold text-lg transition-all duration-300",
                                "hover:scale-[1.02] active:scale-[0.98]",
                                "shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)]"
                            )}
                        >
                            <a href={`${process.env.NEXT_PUBLIC_API_URL}/login`}>
                                <span className="flex items-center gap-3">
                                    Claim Your Access
                                </span>
                                <ArrowRight className="absolute right-6 w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </a>
                        </Button>

                        <div className="text-center pt-2">
                            <p className="text-zinc-500 text-sm">
                                Already a member?{' '}
                                <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
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
