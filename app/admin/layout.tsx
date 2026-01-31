'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Users, LayoutDashboard, Settings, LogOut, Map, Hotel, UserCog, Utensils, Menu, X, MessageSquare, Globe, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { isAdmin } from "@/lib/db/users";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);



    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }

        // This is a basic client-side check. 
        // Real security should be in Firestore rules or Middleware (if using edge functions)
        // But for now, we trust the profile loaded from Firestore + the isAdmin logic.
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex bg-gray-50 h-screen w-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return null; // Redirecting...
    }

    const sidebarItems = [
        { name: "대시보드", href: "/admin", icon: LayoutDashboard },
        { name: "회원 정보 관리", href: "/admin/members", icon: UserCog },
        { name: "골프 조인 관리", href: "/admin/joins", icon: Users },
        { name: "커뮤니티 관리", href: "/admin/community", icon: Users },
        { name: "커스텀 요청 관리", href: "/admin/requests", icon: MessageSquare },
        { name: "골프장 관리", href: "/admin/resources", icon: Map },
        { name: "지역 관리", href: "/admin/regions", icon: Globe },
        { name: "배너 관리", href: "/admin/banners", icon: LayoutDashboard }, // Added Banner Management
        { name: "유튜브 관리", href: "/admin/youtube", icon: Youtube },
        { name: "데이터 진단", href: "/admin/diagnostic", icon: Settings },
        { name: "설정", href: "/admin/settings", icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Mobile Header (Logo only) */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-30 flex items-center justify-center px-4">
                <h1 className="text-lg font-bold text-red-600 flex items-center gap-2">
                    <span className="w-5 h-5 bg-red-600 rounded-full"></span>
                    관리자 센터
                </h1>
            </div>

            {/* Sidebar (Desktop: Fixed, Mobile: Slide-over) */}
            <aside className={cn(
                "w-64 bg-white shadow-md flex flex-col fixed h-full z-50 transition-transform duration-300 md:translate-x-0 pt-0",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 border-b hidden md:block">
                    <h1 className="text-xl font-bold text-red-600 flex items-center gap-2">
                        <span className="w-6 h-6 bg-red-600 rounded-full"></span>
                        관리자 센터
                    </h1>
                </div>

                {/* Mobile Sidebar Header with Close Button */}
                <div className="md:hidden p-4 border-b flex items-center justify-between bg-gray-50">
                    <span className="font-bold text-gray-700">전체 메뉴</span>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto pb-24 md:pb-4">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                pathname === item.href
                                    ? "bg-red-50 text-red-700"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t mt-auto bg-white">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                            {user.email?.[0].toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">{user.email}</p>
                            <p className="text-xs text-gray-500">관리자</p>
                        </div>
                    </div>
                    <button
                        onClick={() => auth.signOut()}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        로그아웃
                    </button>
                </div>
            </aside>

            {/* Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 pb-24 md:pb-8">
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t h-16 z-30 flex items-center justify-around px-2 shadow-[0_-1px_3px_rgba(0,0,0,0.1)]">
                <Link href="/admin" className={cn("flex flex-col items-center justify-center w-full h-full space-y-1", pathname === "/admin" ? "text-red-600" : "text-gray-500")}>
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="text-[10px] font-medium">홈</span>
                </Link>
                <Link href="/admin/members" className={cn("flex flex-col items-center justify-center w-full h-full space-y-1", pathname.startsWith("/admin/members") ? "text-red-600" : "text-gray-500")}>
                    <UserCog className="w-5 h-5" />
                    <span className="text-[10px] font-medium">회원</span>
                </Link>
                <Link href="/admin/joins" className={cn("flex flex-col items-center justify-center w-full h-full space-y-1", pathname.startsWith("/admin/joins") ? "text-red-600" : "text-gray-500")}>
                    <Users className="w-5 h-5" />
                    <span className="text-[10px] font-medium">조인</span>
                </Link>
                <Link href="/admin/requests" className={cn("flex flex-col items-center justify-center w-full h-full space-y-1", pathname.startsWith("/admin/requests") ? "text-red-600" : "text-gray-500")}>
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-[10px] font-medium">요청</span>
                </Link>
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className={cn("flex flex-col items-center justify-center w-full h-full space-y-1", isMobileMenuOpen ? "text-red-600" : "text-gray-500")}
                >
                    <Menu className="w-5 h-5" />
                    <span className="text-[10px] font-medium">전체</span>
                </button>
            </div>
        </div>
    );
}
