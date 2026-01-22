export interface UserLevel {
    id: number;
    name: string;
    label: string;
    description: string;
}

export const USER_LEVELS: UserLevel[] = [
    { id: 1, name: "씨앗", label: "Lv.1 씨앗", description: "골프에 입문한 단계" },
    { id: 2, name: "새싹", label: "Lv.2 새싹", description: "필드 경험을 쌓아가는 단계" },
    { id: 3, name: "비기너", label: "Lv.3 비기너", description: "기본기를 다지는 단계" },
    { id: 4, name: "아마추어", label: "Lv.4 아마추어", description: "안정적인 플레이를 하는 단계" },
    { id: 5, name: "세미프로", label: "Lv.5 세미프로", description: "상급자 수준의 실력" },
    { id: 6, name: "프로", label: "Lv.6 프로", description: "전문가 수준의 실력" },
    { id: 7, name: "투어프로", label: "Lv.7 투어프로", description: "최상위권 실력자" },
    { id: 8, name: "마스터", label: "Lv.8 마스터", description: "골프의 통달한 경지" },
    { id: 9, name: "그랜드마스터", label: "Lv.9 그랜드마스터", description: "존경받는 최고수" },
    { id: 10, name: "레전드", label: "Lv.10 레전드", description: "전설적인 존재" },
];

export const getUserLevel = (levelName: string): UserLevel => {
    return USER_LEVELS.find(l => l.name === levelName) || USER_LEVELS[0];
};
