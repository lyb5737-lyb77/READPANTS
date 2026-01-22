import { CheckCircle, Search, UserPlus, CalendarCheck, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GuidePage() {
    const steps = [
        {
            icon: UserPlus,
            title: "1. 회원가입 및 프로필 작성",
            description: "간편하게 회원가입하고 나만의 골프 프로필을 작성하세요. 핸디캡, 선호하는 스타일 등을 입력하면 더 잘 맞는 동반자를 찾을 수 있습니다."
        },
        {
            icon: Search,
            title: "2. 조인 찾기",
            description: "원하는 날짜와 골프장을 검색해보세요. 호스트의 프로필과 조건을 확인하고 마음에 드는 조인을 선택합니다."
        },
        {
            icon: CheckCircle,
            title: "3. 참여 신청",
            description: "참여 신청 버튼을 누르면 호스트에게 알림이 갑니다. 호스트가 승인하면 예약이 확정됩니다."
        },
        {
            icon: CalendarCheck,
            title: "4. 예약 확정 및 준비",
            description: "확정된 일정과 장소를 다시 한번 확인하세요. 채팅 기능을 통해 동반자들과 미리 인사를 나눌 수 있습니다."
        },
        {
            icon: Smile,
            title: "5. 즐거운 라운딩",
            description: "약속된 시간에 골프장에서 만나 즐거운 라운딩을 즐기세요! 라운딩 후에는 서로에 대한 매너 평가를 남길 수 있습니다."
        }
    ];

    return (
        <div className="container py-12 px-4 md:px-6 max-w-4xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
                    이용 가이드
                </h1>
                <p className="text-lg text-gray-600">
                    빨간바지 솔로 골프를 100% 즐기는 방법을 알려드립니다.
                </p>
            </div>

            <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {steps.map((step, index) => (
                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* Icon */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-red-600 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                            <step.icon className="w-5 h-5" />
                        </div>

                        {/* Card */}
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-xl border shadow-sm">
                            <h3 className="font-bold text-lg mb-2 text-gray-900">{step.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-20 text-center bg-gray-50 p-10 rounded-2xl">
                <h2 className="text-2xl font-bold mb-4">지금 바로 시작해보세요!</h2>
                <p className="text-gray-600 mb-8">
                    새로운 골프 친구들이 당신을 기다리고 있습니다.
                </p>
                <div className="flex justify-center gap-4">
                    <Link href="/join">
                        <Button size="lg" className="bg-red-600 hover:bg-red-700 text-lg px-8">
                            조인 둘러보기
                        </Button>
                    </Link>
                    <Button size="lg" variant="outline" className="text-lg px-8">
                        회원가입 하기
                    </Button>
                </div>
            </div>
        </div>
    );
}
