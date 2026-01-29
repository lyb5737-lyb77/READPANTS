import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Heart } from "lucide-react";
import RecentJoins from "@/components/home/recent-joins";
import { AdminInquiryDialog } from "@/components/home/admin-inquiry-dialog";

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
  const country = params.country || 'Thailand';
  const region = params.region || 'Pattaya';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-red-50 to-white">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-50 animate-pulse" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-50" />

        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm font-medium text-red-600 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-red-600 mr-2 animate-pulse"></span>
              지금 가장 핫한 동남아 골프 조인
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
              혼자라도 괜찮아, <br className="hidden sm:inline" />
              <span className="text-primary">빨간바지</span>와 함께라면!
            </h1>
            <p className="max-w-[700px] text-lg md:text-xl text-gray-600">
              설레는 해외 라운딩, 낯선 곳에서의 특별한 만남. <br />
              검증된 매너 골퍼들과 함께 안전하고 즐거운 여행을 떠나보세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
              <Link href="/join">
                <Button size="lg" className="rounded-full text-base px-8 h-14 bg-primary hover:bg-red-700 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  지금 조인 참여하기
                </Button>
              </Link>
              <Link href="/guide">
                <Button size="lg" variant="outline" className="rounded-full text-base px-8 h-14 border-2 hover:bg-gray-50">
                  이용 가이드 보기
                </Button>
              </Link>
            </div>

            {/* Stats / Trust Indicators */}
            <div className="pt-12 grid grid-cols-3 gap-4 md:gap-16 text-center">
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl font-bold text-gray-900">1,204+</span>
                <span className="text-sm text-gray-500 font-medium">누적 매칭</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl font-bold text-gray-900">98%</span>
                <span className="text-sm text-gray-500 font-medium">매너 만족도</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl font-bold text-gray-900">0건</span>
                <span className="text-sm text-gray-500 font-medium">노쇼</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Joins Section */}
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
              {/* Since image generation failed, we use a placeholder or existing image if available. 
                   Ideally this would be the generated image. For now using a gradient placeholder 
                   that matches the description "gradient background". 
                   If the user provides an image later, we can swap it. */}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800/80 to-transparent z-10" />
              {/* Placeholder for the image - in real scenario, use <Image src="..." ... /> */}
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
