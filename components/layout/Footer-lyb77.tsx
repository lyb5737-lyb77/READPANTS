import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
            <div className="container px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white">빨간바지 <span className="text-red-500">솔로 골프</span></h3>
                        <p className="text-sm text-gray-400">
                            혼자라도 즐거운 골프 여행.<br />
                            검증된 동반자와 함께 떠나는<br />
                            프리미엄 골프 조인 플랫폼
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">서비스</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/join" className="hover:text-red-500 transition-colors">실시간 조인</Link></li>
                            <li><Link href="/courses" className="hover:text-red-500 transition-colors">골프장 찾기</Link></li>
                            <li><Link href="/premium" className="hover:text-red-500 transition-colors">프리미엄 멤버십</Link></li>
                            <li><Link href="/events" className="hover:text-red-500 transition-colors">이벤트</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">고객지원</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/notice" className="hover:text-red-500 transition-colors">공지사항</Link></li>
                            <li><Link href="/faq" className="hover:text-red-500 transition-colors">자주 묻는 질문</Link></li>
                            <li><Link href="/inquiry" className="hover:text-red-500 transition-colors">1:1 문의하기</Link></li>
                            <li><Link href="/terms" className="hover:text-red-500 transition-colors">이용약관</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">고객센터</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>서울시 강남구 테헤란로 123</li>
                            <li>고객센터: 1588-0000</li>
                            <li>이메일: help@redpants.com</li>
                            <li>운영시간: 평일 09:00 - 18:00</li>
                        </ul>
                        <div className="flex gap-4 mt-4">
                            <Link href="#" className="hover:text-red-500 transition-colors"><Instagram className="h-5 w-5" /></Link>
                            <Link href="#" className="hover:text-red-500 transition-colors"><Facebook className="h-5 w-5" /></Link>
                            <Link href="#" className="hover:text-red-500 transition-colors"><Youtube className="h-5 w-5" /></Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Redpants Solo Golf. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">이용약관</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
