import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">페이지를 찾을 수 없습니다</h2>
            <p className="text-gray-600 mb-8">
                요청하신 페이지가 존재하지 않거나, 주소가 변경되었을 수 있습니다.
            </p>
            <Link href="/">
                <Button>
                    홈으로 돌아가기
                </Button>
            </Link>
        </div>
    );
}
