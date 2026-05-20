export function Footer() {
    return (
        <footer className="py-12 bg-white text-sm text-gray-600 border-t border-gray-200">
            <div className="container px-4 md:px-6 max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
                    {/* Left Section - Logos */}
                    <div className="flex-shrink-0 flex items-center justify-center lg:pt-4">
                        <img 
                            src="/gts/KakaoTalk_20260520_165026666.png" 
                            alt="GTS Logo" 
                            className="max-w-[280px] object-contain hidden" 
                        />
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center">
                                <img src="/gts/logo_GTS.png" alt="GTS Logo" className="h-16 md:h-24 object-contain" />
                            </div>
                            <div className="relative">
                                <img src="/gts/sign2.png" alt="Sign" className="h-16 md:h-20 object-contain" />
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Information */}
                    <div className="flex-1 space-y-3 text-center lg:text-left text-xs md:text-sm text-gray-500">
                        <h3 className="font-bold text-gray-800 text-base mb-2">GTS VINA CO.,LTD ( Golf & Tour Service Vietman )</h3>
                        
                        <p>Vietnam Business Registration Number : 0202334213 (Mã số doanh nghiệp)</p>
                        <p>Service Center : 1F, No.149 Van Cao Str, Dang Giang Ward, Ngo Quyen Dist, Hai Phong City, Vietnam (Sunflower Village Gate 3)</p>
                        <p>Head office : 405, 4th Floor, EIC Hai Phong Building, No. 1/10B Le Hong Phong Street, Hai An Ward, Hai Phong City, Vietnam</p>
                        <p>
                            Homepage : <a href="http://www.sologolf.co.kr" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">http://www.sologolf.co.kr</a>{' '}
                            <a href="http://www.sologolf.vn" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">http://www.sologolf.vn</a>
                        </p>

                        <div className="flex flex-col md:flex-row items-center lg:items-start gap-4 pt-4 mt-4 border-t border-gray-100">
                            <div className="flex-shrink-0 flex flex-col items-center border border-gray-300 p-2 rounded-sm">
                                <img src="/gts/QR1.png" alt="QR Code" className="w-16 h-16 object-contain" />
                            </div>
                            <div className="space-y-1 pt-1">
                                <p className="font-semibold text-gray-700">CEO Justin Kim</p>
                                <p>Email : icicu@daum.net / ceo@sologolf.co.kr</p>
                                <p>Direct Vietnam (+84) 0383-981-557 Thailand (+66)096-590-4621 Korea (+82)010-2000-9182</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
