
import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    where,
    serverTimestamp,
    DocumentData,
    writeBatch
} from "firebase/firestore";

export type YouTubeType = 'ranking' | 'recommend' | 'redpants';

export interface YouTubeChannel {
    id: string;
    title: string;
    channelName: string;
    url: string;
    thumbnailUrl: string; // Channel Profile or Video Thumbnail
    type: YouTubeType;
    rank?: number; // Only for ranking
    description?: string;
    subscriberCount?: string; // e.g. "30만"
    createdAt: string;
    updatedAt: string;
}

const COLLECTION_NAME = "youtube_channels";

// Initial Data for Seeding
const INITIAL_RANKING_DATA: Omit<YouTubeChannel, "id" | "createdAt" | "updatedAt">[] = [
    {
        title: "김국진TV_거침없는 골프",
        channelName: "김국진TV",
        url: "https://www.youtube.com/@gookjin_tv",
        thumbnailUrl: "https://ui-avatars.com/api/?name=Kim+Guk+Jin+TV&background=random&size=512",
        type: 'ranking',
        rank: 1,
        subscriberCount: "50만+",
        description: "연예계 골프 고수 김국진의 리얼 골프 예능"
    },
    {
        title: "홍인규 골프TV",
        channelName: "홍인규 골프TV",
        url: "https://www.youtube.com/channel/UCUXDKiEsZH9Kcad-hksAK7g",
        thumbnailUrl: "https://img.youtube.com/vi/s_w0g_K3kC8/maxresdefault.jpg", // Confirmed Video ID
        type: 'ranking',
        rank: 2,
        subscriberCount: "40만+",
        description: "개그맨 홍인규의 유쾌한 골프 도전기"
    },
    {
        title: "SIMZZANG [심짱골프]",
        channelName: "심짱골프",
        url: "https://www.youtube.com/channel/UCWpE_a0FvR0_Ld6Yc36sD7g",
        thumbnailUrl: "https://ui-avatars.com/api/?name=Sim+Zzang&background=random&size=512",
        type: 'ranking',
        rank: 3,
        subscriberCount: "40만+",
        description: "대한민국 대표 골프 레슨 & 예능 채널"
    },
    {
        title: "조윤성프로 스윙교과서",
        channelName: "조윤성프로",
        url: "https://www.youtube.com/@davidyoonseong",
        thumbnailUrl: "https://ui-avatars.com/api/?name=David+Yoon&background=random&size=512",
        type: 'ranking',
        rank: 4,
        subscriberCount: "35만+",
        description: "정석적이고 깔끔한 스윙 레슨의 정석"
    },
    {
        title: "에임하이골프",
        channelName: "에임하이골프",
        url: "https://www.youtube.com/@AimHighGolf",
        thumbnailUrl: "https://ui-avatars.com/api/?name=Aim+High&background=random&size=512",
        type: 'ranking',
        rank: 5,
        subscriberCount: "30만+",
        description: "실전 필드 레슨과 다양한 골프 팁"
    },
    {
        title: "박하림프로",
        channelName: "박하림프로",
        url: "https://www.youtube.com/@hln4444",
        thumbnailUrl: "https://ui-avatars.com/api/?name=Park+Ha+Rim&background=random&size=512",
        type: 'ranking',
        rank: 6,
        subscriberCount: "30만+",
        description: "쉽고 재미있는 골프 레슨"
    },
    {
        title: "이지골프스튜디오",
        channelName: "이기호프로",
        url: "https://www.youtube.com/@easygolfstudio",
        thumbnailUrl: "https://ui-avatars.com/api/?name=Easy+Golf&background=random&size=512",
        type: 'ranking',
        rank: 7,
        subscriberCount: "25만+",
        description: "과학적이고 체계적인 골프 분석"
    },
    {
        title: "골프의신",
        channelName: "골프의신",
        url: "https://www.youtube.com/@GodofGolf",
        thumbnailUrl: "https://ui-avatars.com/api/?name=God+of+Golf&background=random&size=512",
        type: 'ranking',
        rank: 8,
        subscriberCount: "20만+",
        description: "다양한 골프 컨텐츠 집합소"
    },
    {
        title: "나연이즈백",
        channelName: "최나연",
        url: "https://www.youtube.com/@nayeon_choi",
        thumbnailUrl: "https://ui-avatars.com/api/?name=Na+Yeon+Choi&background=random&size=512",
        type: 'ranking',
        rank: 9,
        subscriberCount: "20만+",
        description: "LPGA 레전드 최나연 프로의 골프 라이프"
    },
    {
        title: "도깨비골프",
        channelName: "도깨비골프",
        url: "https://www.youtube.com/@dokkebi_golf",
        thumbnailUrl: "https://ui-avatars.com/api/?name=Dokkebi&background=random&size=512",
        type: 'ranking',
        rank: 10,
        subscriberCount: "15만+",
        description: "신비한 골프 비법 전수"
    }
];

export async function getYoutubeChannels(type?: YouTubeType): Promise<YouTubeChannel[]> {
    try {
        let q = query(collection(db, COLLECTION_NAME));

        if (type) {
            q = query(q, where("type", "==", type));
        }

        // Sort by rank for ranking type, or createdAt for others
        // We handle sort in client or here.
        // If type is ranking, order by rank Asc
        if (type === 'ranking') {
            q = query(q, orderBy("rank", "asc"));
        } else {
            q = query(q, orderBy("createdAt", "desc"));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate?.().toISOString() || new Date().toISOString(),
            } as YouTubeChannel;
        });
    } catch (error) {
        console.error("Error fetching youtube channels:", error);
        return [];
    }
}


export async function getYoutubeChannel(id: string): Promise<YouTubeChannel | null> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate?.().toISOString() || new Date().toISOString(),
            } as YouTubeChannel;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching youtube channel:", error);
        return null;
    }
}

export async function createYoutubeChannel(channel: Omit<YouTubeChannel, "id" | "createdAt" | "updatedAt">): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...channel,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating youtube channel:", error);
        throw error;
    }
}

export async function updateYoutubeChannel(id: string, updates: Partial<YouTubeChannel>): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error updating youtube channel:", error);
        throw error;
    }
}

export async function deleteYoutubeChannel(id: string): Promise<void> {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
        console.error("Error deleting youtube channel:", error);
        throw error;
    }
}

// Seed function to be called once
export async function seedInitialYoutubeData(): Promise<void> {
    const channels = await getYoutubeChannels('ranking');
    if (channels.length === 0) {
        console.log("Seeding YouTube Ranking Data...");
        const batch = writeBatch(db);

        INITIAL_RANKING_DATA.forEach((channel) => {
            const docRef = doc(collection(db, COLLECTION_NAME));
            batch.set(docRef, {
                ...channel,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        });

        await batch.commit();
        console.log("Seeding Complete.");
    }
}

export async function resetYoutubeData(): Promise<void> {
    try {
        console.log("Resetting all youtube data...");
        // 1. Delete all existing data
        const channels = await getYoutubeChannels();
        const batch = writeBatch(db);

        channels.forEach(channel => {
            batch.delete(doc(db, COLLECTION_NAME, channel.id));
        });

        await batch.commit();
        console.log("Deleted all channels.");

        // 2. Reseed
        await seedInitialYoutubeData();
        console.log("Reset complete.");
    } catch (e) {
        console.error("Reset failed:", e);
        throw e;
    }
}
