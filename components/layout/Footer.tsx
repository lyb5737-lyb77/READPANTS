export function Footer() {
    return (
        <footer className="py-12 bg-white text-sm text-gray-600 border-t border-gray-200">
            <div className="container px-4 md:px-6 max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-6 lg:gap-10">
                    {/* Left Section - Logo */}
                    <div className="flex-shrink-0 flex items-center justify-center">
                        <img 
                            src="/gts/logo_sign.png" 
                            alt="GTS Logo" 
                            className="h-40 md:h-56 lg:h-64 object-contain" 
                        />
                    </div>

                    {/* Right Section - Information */}
                    <div className="flex-1 space-y-1.5 text-center lg:text-left text-[11px] md:text-xs text-gray-500 leading-snug">
                        <h3 className="font-bold text-gray-800 text-sm mb-1.5">GTS VINA CO.,LTD ( Golf & Tour Service Vietman )</h3>
                        
                        <p>Vietnam Business Registration Number : 0202334213 (Mã số doanh nghiệp)</p>
                        <p>International Tour Operator Licence No 31-0130/2026</p>
                        <p>Service Center : 1F, No.149 Van Cao Str, Dang Giang Ward, Ngo Quyen Dist, Hai Phong City, Vietnam</p>
                        <p>Head office : 405, 4th Floor, EIC Hai Phong Building, No. 1/10B Le Hong Phong Street, Hai An Ward, Hai Phong City, Vietnam</p>
                        <p>
                            Homepage : <a href="http://www.sologolf.co.kr" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">http://www.sologolf.co.kr</a>{' '}
                            | <a href="http://www.sologolf.vn" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">http://www.sologolf.vn</a>
                        </p>

                        <div className="flex flex-col md:flex-row items-center lg:items-center gap-3 pt-2 mt-2 border-t border-gray-100">
                            <div className="flex-shrink-0 flex flex-col items-center border border-gray-200 p-1.5 rounded-sm bg-white">
                                <img src="/gts/QR1.png" alt="QR Code" className="w-12 h-12 object-contain" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="font-semibold text-gray-700">CEO Justin Kim</p>
                                <p>Email : icicu@daum.net / ceo@sologolf.co.kr</p>
                                <p>Direct Vietnam (+84) 0383-981-557 | Thailand (+66)096-590-4621 | Korea (+82)010-2000-9182</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
