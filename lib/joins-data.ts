import { courses } from "./courses-data";

export interface Join {
    id: string;
    courseId: string;
    courseName: string;
    country: string;
    region: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    greenFee: number;
    caddyFee: number;
    cartFee: number;
    transportFee?: number; // 교통비 (선택)
    currentMembers: number;
    maxMembers: number;
    hostName: string;
    hostId?: string;
    hostLevel: string; // e.g., "골드", "실버"
    description: string;
    status: "open" | "closed" | "full";
}

// Helper to get random course
const getRandomCourse = () => courses[Math.floor(Math.random() * courses.length)];

// Generate some mock joins
export const joins: Join[] = [
    {
        id: "join-1",
        courseId: "siam-country-club-old-course",
        courseName: "시암 컨트리 클럽 올드 코스",
        country: "Thailand",
        region: "Pattaya",
        date: "2026-02-15",
        time: "08:30",
        greenFee: 4500,
        caddyFee: 450,
        cartFee: 800,
        currentMembers: 2,
        maxMembers: 4,
        hostName: "김골프",
        hostLevel: "골드",
        description: "명랑 골프 하실 분 구합니다. 초보 환영!",
        status: "open"
    },
    {
        id: "join-2",
        courseId: "laem-chabang-international-country-club",
        courseName: "람차방 인터내셔널 컨트리 클럽",
        country: "Thailand",
        region: "Pattaya",
        date: "2026-02-16",
        time: "12:00",
        greenFee: 3800,
        caddyFee: 400,
        cartFee: 700,
        currentMembers: 1,
        maxMembers: 4,
        hostName: "이싱글",
        hostLevel: "다이아",
        description: "진지하게 치실 분만 오세요. 내기 없음.",
        status: "open"
    },
    {
        id: "join-3",
        courseId: "chee-chan-golf-resort",
        courseName: "치찬 골프 리조트",
        country: "Thailand",
        region: "Pattaya",
        date: "2026-02-20",
        time: "07:00",
        greenFee: 4200,
        caddyFee: 450,
        cartFee: 800,
        currentMembers: 3,
        maxMembers: 4,
        hostName: "박버디",
        hostLevel: "실버",
        description: "부부 동반입니다. 한 분 더 모십니다.",
        status: "open"
    },
    {
        id: "join-4",
        courseId: "phoenix-gold-golf-country-club-pattaya",
        courseName: "피닉스 골드 골프 앤 컨트리 클럽 (파타야)",
        country: "Thailand",
        region: "Pattaya",
        date: "2026-02-22",
        time: "13:30",
        greenFee: 2500,
        caddyFee: 350,
        cartFee: 600,
        currentMembers: 4,
        maxMembers: 4,
        hostName: "최이글",
        hostLevel: "골드",
        description: "마감되었습니다.",
        status: "full"
    },
    {
        id: "join-5",
        courseId: "burapha-golf-and-resort",
        courseName: "부라파 골프 앤 리조트",
        country: "Thailand",
        region: "Pattaya",
        date: "2026-02-25",
        time: "09:10",
        greenFee: 2800,
        caddyFee: 350,
        cartFee: 600,
        currentMembers: 1,
        maxMembers: 4,
        hostName: "정파",
        hostLevel: "브론즈",
        description: "편하게 치실 분~",
        status: "open"
    }
];
