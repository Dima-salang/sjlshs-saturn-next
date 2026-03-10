'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Orbit, Scan, LogOut, User, LayoutDashboard, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Navbar() {
    const { user, logout, loading } = useAuth();

    let authSection;
    if (loading) {
        authSection = <div className="h-8 w-8 rounded-full bg-zinc-900 animate-pulse" />;
    } else if (user) {
        authSection = (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-zinc-800/50 transition-colors">
                        <Avatar className="h-9 w-9 border border-zinc-800">
                            <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
                            <AvatarFallback className="bg-zinc-900 text-zinc-400">
                                {user.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-zinc-900 border-zinc-800 text-zinc-100" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none text-white">{user.name}</p>
                            <p className="text-xs leading-none text-zinc-500">{user.email}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem className="hover:bg-zinc-800 cursor-pointer text-zinc-300">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-zinc-800 cursor-pointer text-zinc-300">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem 
                        onClick={() => logout()}
                        className="hover:bg-red-950/30 hover:text-red-400 cursor-pointer text-red-500"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    } else {
        authSection = (
            <div className="flex items-center gap-2">
                <Button asChild variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800/50">
                    <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-white text-black hover:bg-zinc-200 font-semibold rounded-full px-5">
                    <Link href="/register">Join Orbit</Link>
                </Button>
            </div>
        );
    }

    return (
        <motion.nav 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-[#050508]/80 backdrop-blur-md"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                            <Orbit className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
                            SATURN
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {user && (
                            <>
                                <NavLink href="/scan" icon={<Scan className="w-4 h-4" />}>
                                    Scan QR
                                </NavLink>
                                <NavLink href="/admin/teachers" icon={<Users className="w-4 h-4" />}>
                                    Teachers
                                </NavLink>
                                <NavLink href="/admin/sections" icon={<LayoutDashboard className="w-4 h-4" />}>
                                    Classes
                                </NavLink>
                                <NavLink href="/admin/students" icon={<Users className="w-4 h-4" />}>
                                    Students
                                </NavLink>
                                <NavLink href="/admin/attendance" icon={<Settings className="w-4 h-4" />}>
                                    Attendance
                                </NavLink>
                                {user.is_admin && (
                                    <NavLink href="/test-api" icon={<Settings className="w-4 h-4" />}>
                                        API Test
                                    </NavLink>
                                )}
                            </>
                        )}
                    </div>

                    {/* User Actions */}
                    <div className="flex items-center gap-4">
                        {authSection}
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}

function NavLink({ href, children, icon }: Readonly<{ href: string; children: React.ReactNode; icon: React.ReactNode }>) {
    return (
        <Link 
            href={href}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all group"
        >
            <span className="text-zinc-500 group-hover:text-blue-400 transition-colors">
                {icon}
            </span>
            {children}
        </Link>
    );
}
