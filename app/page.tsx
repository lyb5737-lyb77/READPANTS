import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Heart } from "lucide-react";
import { JoinCalendar } from "@/components/home/join-calendar";
import { AdminInquiryDialog } from "@/components/home/admin-inquiry-dialog";
import { BannerCarousel } from "@/components/home/banner-carousel";
import RecentJoins from "@/components/home/recent-joins";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; region?: string }>;
}) {
  // Await searchParams (Next.js 15+)
  const params = await searchParams;
  const country = params.country || 'Vietnam';
  const region = params.region || 'Haiphong';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Join Calendar Section (Hero 통합) */}
      <JoinCalendar />


      {/* Banner Section */}
      <section className="py-6 bg-white">
        <div className="container px-4 md:px-6">
          <BannerCarousel />
        </div>
      </section>

      {/* 마감 임박 조인 섹션 */}
      <RecentJoins country={country} region={region} />

      {/* Feature Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              나의 완벽한 <span className="text-green-600">골프 메이트</span> 찾기
            </h2>
            <p className="text-lg text-gray-600">
              골프 실력부터 여행 스타일까지, 딱 맞는 동반자를 찾아드려요.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative overflow-hidden rounded-2xl border bg-white p-6 hover:shadow-xl transition-all duration-300 hover:border-red-200">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">믿을 수 있는 조인</h3>
              <p className="text-gray-500">
                철저한 본인 인증과 매너 평가 시스템으로 검증된 회원끼리 매칭됩니다.
              </p>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border bg-white p-6 hover:shadow-xl transition-all duration-300 hover:border-green-200">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">엄선된 해외 골프장</h3>
              <p className="text-gray-500">
                빨간바지 MD가 직접 검증한 동남아 명문 골프장과 리조트를 소개합니다.
              </p>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border bg-white p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-200">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">취향 존중 친구 찾기</h3>
              <p className="text-gray-500">
                #명랑골프 #진지모드 #관광포함 등 여행 스타일에 맞는 친구를 찾아보세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="relative rounded-[2.5rem] overflow-hidden min-h-[300px] flex items-center">
            {/* Background Image with Gradient Overlay */}
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800/80 to-transparent z-10" />
              <Image
                src="/images/custom-rounding.png"
                alt="Background"
                fill
                className="object-cover object-center opacity-50 grayscale mix-blend-overlay"
                priority
              />
            </div>

            <div className="relative z-20 w-full px-6 py-16 md:px-12 md:py-20 flex flex-col sm:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl text-center sm:text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                  궁금한 점이 있으신가요?<br />
                  <span className="text-red-400">무엇이든 물어보세요!</span>
                </h2>
                <p className="text-gray-300 text-lg">
                  빨간바지 솔로 골프 이용 방법부터 조인 매칭까지,<br className="hidden sm:inline" />
                  관리자가 친절하게 답변해 드립니다.
                </p>
              </div>
              <AdminInquiryDialog>
                <Button size="lg" className="rounded-full bg-white text-gray-900 hover:bg-gray-100 px-8 h-14 text-lg font-bold shadow-lg shrink-0">
                  관리자에게 문의하기
                </Button>
              </AdminInquiryDialog>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

