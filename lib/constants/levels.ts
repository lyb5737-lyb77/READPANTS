export interface LevelInfo {
    level: number;
    name: {
        en: string;
        ko: string;
    };
    icon: string; // 이모지나 아이콘 경로
    description: string;
    threshold: number; // 필요 포인트 또는 타수 기준
}

export const COMMUNITY_LEVELS: LevelInfo[] = [
    { level: 1, name: { en: "Stone", ko: "스톤" }, icon: "🪨", description: "가입 즉시 부여", threshold: 0 },
    { level: 2, name: { en: "Iron", ko: "아이언" }, icon: "⛏️", description: "활동 시작", threshold: 100 },
    { level: 3, name: { en: "Bronze", ko: "브론즈" }, icon: "🥉", description: "성실한 활동", threshold: 300 },
    { level: 4, name: { en: "Silver", ko: "실버" }, icon: "🛡️", description: "주목받는 활동", threshold: 600 },
    { level: 5, name: { en: "Gold", ko: "골드" }, icon: "👑", description: "활발한 활동", threshold: 1000 },
    { level: 6, name: { en: "Platinum", ko: "플래티넘" }, icon: "🪽", description: "영향력 있는 유저", threshold: 2000 },
    { level: 7, name: { en: "Diamond", ko: "다이아" }, icon: "💎", description: "커뮤니티 리더", threshold: 4000 },
    { level: 8, name: { en: "Master", ko: "마스터" }, icon: "⭐", description: "존경받는 유저", threshold: 7000 },
    { level: 9, name: { en: "Grand Master", ko: "그랜드 마스터" }, icon: "🌟", description: "전설적인 유저 (관리자 권한)", threshold: 10000 },
    { level: 10, name: { en: "Red Pants", ko: "레드팬츠" }, icon: "🔴", description: "REDPANTS 그 자체 (관리자 권한)", threshold: 20000 },
];

export const GOLF_SKILL_LEVELS: LevelInfo[] = [
    { level: 1, name: { en: "Seed", ko: "씨앗" }, icon: "🌱", description: "골프 입문 (120타 초과)", threshold: 121 },
    { level: 2, name: { en: "Sprout", ko: "새싹" }, icon: "🌿", description: "머리 올리기 전후 (111~120타)", threshold: 111 },
    { level: 3, name: { en: "Beginner", ko: "비기너" }, icon: "🍃", description: "백돌이/백순이 탈출 (101~110타)", threshold: 101 },
    { level: 4, name: { en: "Amateur", ko: "아마추어" }, icon: "🌳", description: "안정적인 90대 타수 (91~100타)", threshold: 91 },
    { level: 5, name: { en: "Semi-Pro", ko: "세미프로" }, icon: "🥉", description: "보기 플레이어 (86~90타)", threshold: 86 },
    { level: 6, name: { en: "Pro", ko: "프로" }, icon: "🥈", description: "싱글 도전 (81~85타)", threshold: 81 },
    { level: 7, name: { en: "Tour Pro", ko: "투어프로" }, icon: "🥇", description: "싱글 플레이어 (76~80타)", threshold: 76 },
    { level: 8, name: { en: "Master", ko: "마스터" }, icon: "🏆", description: "이븐파 도전 (73~75타)", threshold: 73 },
    { level: 9, name: { en: "Top Ranker", ko: "탑랭커" }, icon: "🏅", description: "스크래치 골퍼 (71~72타)", threshold: 71 },
    { level: 10, name: { en: "G.O.A.T", ko: "G.O.A.T" }, icon: "👑", description: "신의 경지 (70타 이하)", threshold: 0 },
];

export function calculateCommunityLevel(points: number = 0): LevelInfo {
    // 포인트를 넘지 않는 가장 높은 레벨 찾기 (내림차순 정렬되어 있다고 가정하거나 역순 탐색)
    // 여기서는 오름차순이므로 뒤에서부터 탐색
    for (let i = COMMUNITY_LEVELS.length - 1; i >= 0; i--) {
        if (points >= COMMUNITY_LEVELS[i].threshold) {
            return COMMUNITY_LEVELS[i];
        }
    }
    return COMMUNITY_LEVELS[0];
}

export function calculateGolfSkillLevel(avgScore: number): LevelInfo {
    if (!avgScore || avgScore <= 0) return GOLF_SKILL_LEVELS[0]; // 데이터 없음

    // 타수는 낮을수록 높은 레벨
    // G.O.A.T: 70 이하 (threshold 0으로 설정했지만 로직상 처리)
    if (avgScore <= 70) return GOLF_SKILL_LEVELS[9];

    // 나머지 레벨: threshold보다 크거나 같으면 해당 레벨 (위에서부터 내림차순 검사 필요)
    // 하지만 배열은 오름차순(레벨1->10)으로 정의되어 있고 threshold는 내림차순(121 -> 71)임.
    // 씨앗(121+), 새싹(111+), ... 탑랭커(71+)

    // 타수가 threshold보다 크거나 같으면 그 레벨이다? -> 
    // 예: 115타 -> 새싹(111) 통과, 비기너(101) 탈락. -> 새싹.

    // Correct Logic: Iterate from worst level (Seed) to best level (Top Ranker)
    // Seed (Level 1) Threshold 121. If score >= 121, return Seed.
    // ...
    // Top Ranker (Level 9) Threshold 71. If score >= 71, return Top Ranker.
    // If none match, score < 71 -> G.O.A.T (Level 10).

    for (let i = 0; i < GOLF_SKILL_LEVELS.length - 1; i++) {
        // G.O.A.T is last element, which has threshold 0, ignore in loop check logic or handle implicitly
        if (GOLF_SKILL_LEVELS[i].threshold > 0 && avgScore >= GOLF_SKILL_LEVELS[i].threshold) {
            return GOLF_SKILL_LEVELS[i];
        }
    }

    return GOLF_SKILL_LEVELS[9]; // G.O.A.T (70 이하)
}
