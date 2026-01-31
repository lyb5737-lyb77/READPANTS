"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut, LayoutDashboard, X } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/store/auth-store";
import { isAdmin } from "@/lib/db/users";
import { UserLevelBadge } from "@/components/ui/user-level-badge";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { NotificationList } from "@/components/layout/notification-list";
import { RegionSelector } from "@/components/layout/region-selector";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LevelBadge } from "@/components/ui/level-badge";

function HeaderContent() {
    const { user, userProfile, loading } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const country = searchParams.get('country') || 'Thailand';
    const region = searchParams.get('region') || 'Pattaya';
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setMobileMenuOpen(false);
            router.push("/");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const getLinkWithParams = (href: string) => {
        return `${href}?country=${country}&region=${region}`;
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
            <div className="container flex h-20 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-3">
                    <Link href={getLinkWithParams("/")} className="flex items-center gap-2">
                        <motion.img
                            layoutId="main-logo"
                            src="/images/logo-v2.png"
                            alt="Red Pants Logo"
                            className="h-10 w-auto object-contain"
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                        />
                    </Link>
                    <div className="hidden md:block h-6 w-px bg-gray-300" />
                    <RegionSelector />
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    {[
                        { href: "/join", label: "GOLF JOIN", subLabel: "골프 조인" },
                        { href: "/courses", label: "COURSES", subLabel: "골프장 소개" },
                        { href: "/reviews", label: "REVIEWS", subLabel: region ? `${region === 'Pattaya' ? '파타야' : region === 'Haiphong' ? '하이퐁' : region} 탐방 후기` : "이용 후기" },
                        { href: "/quotes", label: "QUOTES", subLabel: "여행 견적" },
                        { href: "/guide", label: "GUIDE", subLabel: "이용 가이드" },
                    ].map((item) => (
                        <Link
                            key={item.href}
                            href={getLinkWithParams(item.href)}
                            className="group relative flex flex-col items-center justify-center px-2 py-1"
                        >
                            <span className="text-[13px] font-bold tracking-widest text-gray-900 group-hover:text-red-600 transition-colors duration-300">
                                {item.label}
                            </span>
                            <span className="text-[11px] font-medium text-gray-500 mt-0.5 group-hover:text-gray-900 transition-colors duration-300">
                                {item.subLabel}
                            </span>
                            <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-red-600 -translate-x-1/2 transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100" />
                        </Link>
                    ))}


                    <div className="h-4 w-px bg-gray-300 mx-2" />

                    {/* Premium Well Link */}
                    <Link
                        href="/premium"
                        className="flex items-center justify-center p-2 rounded-full hover:bg-gray-50 transition-colors group relative"
                        title="정보나눔 우물터 (골드 등급 이상)"
                    >
                        <div className="relative w-7 h-7">
                            <Image
                                src="/images/well-icon.png"
                                alt="Well"
                                fill
                                className="object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                            />
                        </div>
                    </Link>

                    {/* YouTube Link */}
                    <Link
                        href="/youtube"
                        className="flex items-center justify-center p-2 rounded-full hover:bg-gray-50 transition-colors group"
                        title="골프 유튜브 커뮤니티"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0" className="text-gray-400 group-hover:text-red-600 transition-colors duration-300"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2">
                        {!loading && (
                            user ? (
                                <div className="flex items-center gap-3">
                                    <NotificationList />

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-transparent">
                                                <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 border border-red-100 shadow-sm transition-transform active:scale-95">
                                                    <User className="h-5 w-5" />
                                                </div>
                                                {userProfile?.role === 'admin' && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 border-2 border-white">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                                    </div>
                                                )}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-56" align="end" forceMount>
                                            <DropdownMenuLabel className="font-normal">
                                                <div className="flex flex-col space-y-1">
                                                    <p className="text-sm font-medium leading-none">{userProfile?.nickname || user.displayName || "User"}</p>
                                                    <p className="text-xs leading-none text-muted-foreground">{userProfile?.email || user.email}</p>
                                                    <div className="flex gap-1 mt-1">
                                                        <LevelBadge
                                                            type="community"
                                                            level={userProfile?.communityLevel || 1}
                                                            size="sm"
                                                        />
                                                        <LevelBadge
                                                            type="golf"
                                                            level={userProfile?.golfSkillLevel || 1}
                                                            size="sm"
                                                        />
                                                    </div>
                                                </div>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {userProfile?.role === 'admin' && (
                                                <DropdownMenuGroup>
                                                    <Link href="/admin">
                                                        <DropdownMenuItem className="cursor-pointer text-red-600 bg-red-50/50 hover:bg-red-50 focus:bg-red-50">
                                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                                            <span>관리자 페이지</span>
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <DropdownMenuSeparator />
                                                </DropdownMenuGroup>
                                            )}
                                            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-gray-700 focus:text-red-600">
                                                <LogOut className="mr-2 h-4 w-4" />
                                                <span>로그아웃</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ) : (
                                <>
                                    <Link href="/login">
                                        <Button variant="ghost" size="sm" className="text-gray-700 hover:text-red-600 font-medium">
                                            로그인
                                        </Button>
                                    </Link>
                                    <Link href="/signup">
                                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white rounded-full px-5 font-semibold shadow-md shadow-red-100">
                                            회원가입
                                        </Button>
                                    </Link>
                                </>
                            )
                        )}
                    </div>

                    {/* Mobile Notification Bell */}
                    <div className="md:hidden flex items-center mr-1">
                        {!loading && user && <NotificationList />}
                    </div>

                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                        <span className="sr-only">메뉴 {mobileMenuOpen ? '닫기' : '열기'}</span>
                    </Button>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {
                mobileMenuOpen && (
                    <div className="md:hidden border-t bg-white">
                        <div className="container px-4 py-4 space-y-4">
                            {/* Navigation Links */}
                            <nav className="flex flex-col gap-3">
                                {[
                                    { href: "/join", label: "GOLF JOIN", subLabel: "골프 조인" },
                                    { href: "/courses", label: "COURSES", subLabel: "골프장 소개" },
                                    { href: "/reviews", label: "REVIEWS", subLabel: region ? `${region === 'Pattaya' ? '파타야' : region === 'Haiphong' ? '하이퐁' : region} 탐방 후기` : "이용 후기" },
                                    { href: "/quotes", label: "QUOTES", subLabel: "여행 견적" },
                                    { href: "/guide", label: "GUIDE", subLabel: "이용 가이드" },
                                ].map((item) => (
                                    <Link
                                        key={item.href}
                                        href={getLinkWithParams(item.href)}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex flex-col px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-sm font-bold tracking-wider text-gray-900">
                                            {item.label}
                                        </span>
                                        <span className="text-xs text-gray-500 mt-0.5">
                                            {item.subLabel}
                                        </span>
                                    </Link>
                                ))}
                                {/* Mobile Premium Well */}
                                <Link
                                    href="/premium"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="relative w-6 h-6">
                                        <Image src="/images/well-icon.png" alt="Well" fill className="object-contain" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold tracking-wider text-gray-900">WELL</span>
                                        <span className="text-xs text-gray-500 mt-0.5">정보나눔 우물터 (Gold+)</span>
                                    </div>
                                </Link>
                            </nav>
                            <nav className="flex gap-4">
                                {isAdmin(userProfile) && (
                                    <Link
                                        href="/admin"
                                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-slate-800 rounded-md hover:bg-slate-700 transition-colors border border-slate-700 shadow-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        관리자
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                    로그아웃
                                </button>
                            </nav>
                            {/* Divider */}
                            <div className="border-t" />

                            {/* Auth Section */}
                            {!loading && (
                                user ? (
                                    <div className="space-y-3">
                                        {/* User Info */}
                                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {userProfile?.nickname || user.displayName || user.email?.split('@')[0]}님
                                                    </span>
                                                    {userProfile?.level && (
                                                        <UserLevelBadge levelName={userProfile.level} className="h-5 px-1.5 text-[10px]" />
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-500">{user.email}</span>
                                            </div>
                                        </div>

                                        {/* Admin Button */}
                                        {userProfile?.role === 'admin' && (
                                            <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                                                <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                                                    <LayoutDashboard className="h-4 w-4 mr-2" />
                                                    관리자 페이지
                                                </Button>
                                            </Link>
                                        )}

                                        {/* Logout Button */}
                                        <Button
                                            variant="outline"
                                            className="w-full text-gray-700 hover:text-red-600 hover:border-red-200"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            로그아웃
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                            <Button variant="outline" className="w-full text-gray-700 hover:text-red-600 hover:border-red-200">
                                                로그인
                                            </Button>
                                        </Link>
                                        <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                                            <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                                                회원가입
                                            </Button>
                                        </Link>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )
            }
        </header >
    );
}

export function Header() {
    return (
        <Suspense fallback={<header className="sticky top-0 z-50 w-full border-b bg-white/80 h-20" />}>
            <HeaderContent />
        </Suspense>
    );
}
