import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-xl font-bold text-red-600">빨간바지</span>
                        <span className="hidden sm:inline-block font-semibold text-gray-900">솔로 골프</span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/join" className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">
                        골프 조인
                    </Link>
                    <Link href="/courses" className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">
                        골프장 소개
                    </Link>
                    <Link href="/reviews" className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">
                        이용 후기
                    </Link>
                    <Link href="/guide" className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">
                        이용 가이드
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-gray-700 hover:text-red-600">
                            로그인
                        </Button>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                            회원가입
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">메뉴 열기</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}
