'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Users, LayoutDashboard, Settings, LogOut, Map, Hotel, UserCog, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
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
        { name: "골프장 관리", href: "/admin/resources", icon: Map },
        { name: "숙소 관리", href: "/admin/accommodations", icon: Hotel },
        { name: "식당 관리", href: "/admin/restaurants", icon: Utensils },
        { name: "커뮤니티 관리", href: "/admin/community", icon: Users },
        { name: "데이터 진단", href: "/admin/diagnostic", icon: Settings },
        { name: "설정", href: "/admin/settings", icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md hidden md:flex flex-col fixed h-full">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold text-red-600 flex items-center gap-2">
                        <span className="w-6 h-6 bg-red-600 rounded-full"></span>
                        관리자 센터
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
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
                <div className="p-4 border-t">
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

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
