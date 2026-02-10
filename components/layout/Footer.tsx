export function Footer() {
    return (
        <footer className="py-12 bg-gray-50 text-sm text-gray-500 border-t border-gray-100">
            <div className="container px-4 md:px-6">
                <div className="space-y-2 text-center md:text-left">
                    <h3 className="font-bold text-gray-900 mb-4">GTS (Golf Tour Service)</h3>
                    <div className="flex flex-col md:flex-row md:gap-4 justify-center md:justify-start">
                        <span>지티에스</span>
                        <span className="hidden md:inline">|</span>
                        <span>대표자 : 김진정</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:gap-4 justify-center md:justify-start">
                        <span>사업자등록번호 : 165-13-02625</span>
                        <span className="hidden md:inline">|</span>
                        <span>통신판매업신고 : (신청중)</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:gap-4 justify-center md:justify-start">
                        <span>대표번호 : 070-8860-9182</span>
                        <span className="hidden md:inline">|</span>
                        <span>이메일 : icicu@daum.net</span>
                    </div>
                    <div>
                        주소 : 서울시 강서구 강서로 56가길 63, 505호 (등촌동, 서우빌딩)
                    </div>
                    <div className="flex flex-col md:flex-row md:gap-4 justify-center md:justify-start">
                        <span>개인정보보호책임자 : 이영배</span>
                        <span className="hidden md:inline">|</span>
                        <span>호스팅제공자 : Firebase</span>
                    </div>
                    <div className="pt-8 mt-8 border-t border-gray-200 text-center md:text-left text-xs text-gray-400">
                        (C) GTS INC. (Golf Tour Service) RED PANTS SOLOGOLF. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
}
