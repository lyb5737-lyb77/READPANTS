export interface GolfCourse {
    id?: string;
    name: string; // 골프장 이름 (예: 그린우드 골프 클럽)
    enName: string; // 영문 이름 (예: Greenwood Golf Club)

    // 기본 정보
    holes: number; // 홀 수 (예: 27)
    yards?: string; // 전장 (예: 10380 야드)
    designer?: string; // 디자이너

    // 운영 정보
    teeOffTime?: {
        weekday: string;
        weekend: string;
    };
    facilities?: string; // 시설 정보 (텍스트)

    // 요금 및 규정
    caddyTip?: string; // 캐디팁 안내
    cartInfo?: string; // 카트 규정
    galleryInfo?: {
        available: boolean;
        fee?: string;
    };

    // 기타
    description?: string; // 기타 주의사항 등
    address?: string; // 주소
    googleMapUrl?: string; // 구글맵 링크

    // 이미지
    images: string[]; // 이미지 URL 배열

    createdAt?: any;
    updatedAt?: any;
}
