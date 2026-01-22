"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut, LayoutDashboard, X } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { UserLevelBadge } from "@/components/ui/user-level-badge";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Header() {
    const { user, userProfile, loading } = useAuthStore();
    const router = useRouter();
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

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
            <div className="container flex h-20 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/images/logo-v2.png"
                            alt="Red Pants Logo"
                            width={120}
                            height={40}
                            className="h-10 w-auto object-contain"
                            priority
                        />
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    {[
                        { href: "/join", label: "GOLF JOIN", subLabel: "골프 조인" },
                        { href: "/courses", label: "COURSES", subLabel: "골프장 소개" },
                        { href: "/reviews", label: "REVIEWS", subLabel: "이용 후기" },
                        { href: "/guide", label: "GUIDE", subLabel: "이용 가이드" },
                    ].map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
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
                </nav>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2">
                        {!loading && (
                            user ? (
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <span>{user.displayName || user.email?.split('@')[0]}님</span>
                                        {userProfile?.level && (
                                            <UserLevelBadge levelName={userProfile.level} className="h-5 px-1.5 text-[10px]" />
                                        )}
                                    </div>
                                    {userProfile?.role === 'admin' && (
                                        <Link href="/admin">
                                            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                                                <LayoutDashboard className="h-4 w-4 mr-1" />
                                                관리자
                                            </Button>
                                        </Link>
                                    )}
                                    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500 hover:text-red-600">
                                        <LogOut className="h-4 w-4 mr-1" />
                                        로그아웃
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Link href="/login">
                                        <Button variant="ghost" size="sm" className="text-gray-700 hover:text-red-600">
                                            로그인
                                        </Button>
                                    </Link>
                                    <Link href="/signup">
                                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                                            회원가입
                                        </Button>
                                    </Link>
                                </>
                            )
                        )}
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
            {mobileMenuOpen && (
                <div className="md:hidden border-t bg-white">
                    <div className="container px-4 py-4 space-y-4">
                        {/* Navigation Links */}
                        <nav className="flex flex-col gap-3">
                            {[
                                { href: "/join", label: "GOLF JOIN", subLabel: "골프 조인" },
                                { href: "/courses", label: "COURSES", subLabel: "골프장 소개" },
                                { href: "/reviews", label: "REVIEWS", subLabel: "이용 후기" },
                                { href: "/guide", label: "GUIDE", subLabel: "이용 가이드" },
                            ].map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
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
                                                    {user.displayName || user.email?.split('@')[0]}님
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
            )}
        </header>
    );
}
