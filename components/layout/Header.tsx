"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut, LayoutDashboard, X, Users, MapPin, Star, FileText, HelpCircle, Youtube, Sparkles } from "lucide-react";
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
    const country = searchParams.get('country') || 'Vietnam';
    const region = searchParams.get('region') || 'Haiphong';
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

                    {/* VIP Room Link */}
                    <Link
                        href="/premium"
                        className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gradient-to-b hover:from-amber-50 hover:to-yellow-50 transition-all group relative"
                        title="VIP룸 (골드 등급 이상)"
                    >
                        <div className="relative w-8 h-8">
                            <Image
                                src="/images/vip-badge-v2.png"
                                alt="VIP"
                                fill
                                className="object-contain group-hover:scale-110 transition-transform duration-300"
                            />
                        </div>
                        <span className="text-[10px] font-bold text-amber-600 group-hover:text-amber-700 mt-0.5">VIP룸</span>
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
                                                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-red-50 flex items-center justify-center text-red-600 border-2 border-red-100 shadow-sm transition-transform active:scale-95">
                                                    {userProfile?.profileImageUrl ? (
                                                        <Image
                                                            src={userProfile.profileImageUrl}
                                                            alt="프로필"
                                                            width={40}
                                                            height={40}
                                                            className="object-cover w-full h-full rounded-full"
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <User className="h-5 w-5" />
                                                    )}
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
                                            <Link href="/profile">
                                                <DropdownMenuItem className="cursor-pointer">
                                                    <User className="mr-2 h-4 w-4" />
                                                    <span>개인정보 설정</span>
                                                </DropdownMenuItem>
                                            </Link>
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
                    <button
                        type="button"
                        className="md:hidden relative z-50 flex items-center justify-center w-12 h-12 -mr-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
                    >
                        {mobileMenuOpen ? (
                            <X className="h-7 w-7 text-gray-700" />
                        ) : (
                            <Menu className="h-7 w-7 text-gray-700" />
                        )}
                    </button>
                </div>
            </div>


            {/* Mobile Menu Drawer - Premium Grid Design */}
            {mobileMenuOpen && (
                <motion.div
                    className="md:hidden fixed inset-x-0 top-20 bg-white/95 backdrop-blur-lg border-b shadow-xl z-40"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="container px-4 py-5 max-h-[calc(100vh-6rem)] overflow-y-auto">
                        {/* User Section - Compact for logged in users */}
                        {!loading && user && (
                            <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-red-600 border border-red-100">
                                    <User className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-gray-900 truncate">
                                            {userProfile?.nickname || user.displayName || '회원'}님
                                        </span>
                                        <div className="flex gap-1">
                                            <LevelBadge type="community" level={userProfile?.communityLevel || 1} size="sm" />
                                            <LevelBadge type="golf" level={userProfile?.golfSkillLevel || 1} size="sm" />
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    title="로그아웃"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        {/* Login/Signup for non-logged users */}
                        {!loading && !user && (
                            <div className="flex gap-2 mb-4">
                                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full text-gray-700 hover:text-red-600 hover:border-red-300">
                                        로그인
                                    </Button>
                                </Link>
                                <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                                    <Button size="sm" className="w-full bg-red-600 hover:bg-red-700 text-white shadow-md">
                                        회원가입
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Navigation Grid - 2 columns */}
                        <nav className="grid grid-cols-2 gap-2">
                            {[
                                { href: "/join", icon: Users, label: "골프 조인", color: "text-blue-600", bg: "bg-blue-50" },
                                { href: "/courses", icon: MapPin, label: "골프장 소개", color: "text-green-600", bg: "bg-green-50" },
                                { href: "/reviews", icon: Star, label: region === 'Pattaya' ? '파타야 후기' : region === 'Haiphong' ? '하이퐁 후기' : '탐방 후기', color: "text-yellow-600", bg: "bg-yellow-50" },
                                { href: "/quotes", icon: FileText, label: "여행 견적", color: "text-purple-600", bg: "bg-purple-50" },
                                { href: "/guide", icon: HelpCircle, label: "이용 가이드", color: "text-cyan-600", bg: "bg-cyan-50" },
                                { href: "/premium", icon: Sparkles, label: "VIP룸", color: "text-amber-600", bg: "bg-amber-50" },
                            ].map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href === "/premium" ? "/premium" : getLinkWithParams(item.href)}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 p-3 rounded-xl ${item.bg} hover:scale-[0.98] active:scale-95 transition-all duration-200`}
                                >
                                    <item.icon className={`h-5 w-5 ${item.color}`} />
                                    <span className="text-sm font-medium text-gray-800">{item.label}</span>
                                </Link>
                            ))}
                        </nav>

                        {/* Bottom Actions */}
                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                            {/* YouTube Link */}
                            <Link
                                href="/youtube"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex-1 flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors"
                            >
                                <Youtube className="h-5 w-5 text-red-500" />
                                <span className="text-sm font-medium text-gray-700">유튜브</span>
                            </Link>

                            {/* Admin Link - only for admins */}
                            {userProfile?.role === 'admin' && (
                                <Link
                                    href="/admin"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex-1 flex items-center justify-center gap-2 p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                                >
                                    <LayoutDashboard className="h-5 w-5 text-red-600" />
                                    <span className="text-sm font-medium text-red-700">관리자</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
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
