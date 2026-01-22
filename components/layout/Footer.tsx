export function Footer() {
    return (
        <footer className="border-t border-border bg-muted/30">
            <div className="container py-10 px-4 flex flex-col md:flex-row justify-between gap-8">
                <div>
                    <h3 className="text-lg font-bold text-primary mb-2">빨간바지 솔로 골프</h3>
                    <p className="text-sm text-muted-foreground">
                        해외 골프 여행의 모든 것, <br />
                        신뢰할 수 있는 골프 조인 커뮤니티
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
                    <div className="flex flex-col gap-2">
                        <h4 className="font-semibold">서비스</h4>
                        <a href="#" className="text-sm text-muted-foreground hover:text-foreground">골프 조인</a>
                        <a href="#" className="text-sm text-muted-foreground hover:text-foreground">정보 나눔</a>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h4 className="font-semibold">지원</h4>
                        <a href="#" className="text-sm text-muted-foreground hover:text-foreground">문의하기</a>
                        <a href="#" className="text-sm text-muted-foreground hover:text-foreground">이용약관</a>
                    </div>
                </div>
            </div>
            <div className="border-t border-border py-6 text-center text-sm text-muted-foreground">
                © 2026 Red Pants Solo Golf. All rights reserved.
            </div>
        </footer>
    );
}
