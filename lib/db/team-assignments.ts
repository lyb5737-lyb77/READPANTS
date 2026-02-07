import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    Timestamp
} from "firebase/firestore";

const COLLECTION_NAME = "team_assignments";

export interface TeamMember {
    oderId: string;
    oderedAt: string;
    userId: string;
    nickname: string;
    profileImageUrl?: string;
    avgScore: number;
    gender: 'male' | 'female' | 'other';
    phone?: string;
}

export interface Team {
    teamNumber: number;
    members: TeamMember[];
    averageScore: number;
    teeTime?: string;
}

export interface TeamAssignment {
    id: string;
    joinId: string;
    date: string;
    courseId: string;
    courseName: string;
    teams: Team[];
    status: 'pending' | 'assigned' | 'notified';
    createdAt: string;
    notifiedAt?: string;
}

// 조 편성 생성
export async function createTeamAssignment(
    joinId: string,
    date: string,
    courseId: string,
    courseName: string,
    teams: Team[]
): Promise<string> {
    const id = `${joinId}_${Date.now()}`;
    const assignment: TeamAssignment = {
        id,
        joinId,
        date,
        courseId,
        courseName,
        teams,
        status: 'assigned',
        createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, COLLECTION_NAME, id), assignment);
    return id;
}

// 조인별 조 편성 조회
export async function getTeamAssignmentByJoin(joinId: string): Promise<TeamAssignment | null> {
    const q = query(
        collection(db, COLLECTION_NAME),
        where("joinId", "==", joinId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as TeamAssignment;
}

// 날짜별 조 편성 목록 조회
export async function getTeamAssignmentsByDate(date: string): Promise<TeamAssignment[]> {
    const q = query(
        collection(db, COLLECTION_NAME),
        where("date", "==", date)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as TeamAssignment);
}

// 조 편성 상태 업데이트
export async function updateTeamAssignmentStatus(
    id: string,
    status: 'pending' | 'assigned' | 'notified'
): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updates: Partial<TeamAssignment> = { status };

    if (status === 'notified') {
        updates.notifiedAt = new Date().toISOString();
    }

    await updateDoc(docRef, updates);
}

// 자동 조 편성 (실력 기준 밸런스)
export function autoAssignTeams(members: TeamMember[]): Team[] {
    if (members.length < 4) return [];

    // 평균 타수 기준 정렬
    const sorted = [...members].sort((a, b) => a.avgScore - b.avgScore);

    // 4명씩 조 편성 (스네이크 방식으로 밸런스)
    const teamCount = Math.floor(sorted.length / 4);
    const teams: Team[] = [];

    for (let i = 0; i < teamCount; i++) {
        teams.push({
            teamNumber: i + 1,
            members: [],
            averageScore: 0
        });
    }

    // 스네이크 배치: 1,2,3,4 -> 4,3,2,1 -> 1,2,3,4 ...
    let teamIndex = 0;
    let direction = 1;

    for (const member of sorted) {
        if (teams[teamIndex]) {
            teams[teamIndex].members.push(member);
        }

        teamIndex += direction;

        if (teamIndex >= teamCount || teamIndex < 0) {
            direction *= -1;
            teamIndex += direction;
        }
    }

    // 각 조 평균 타수 계산
    teams.forEach(team => {
        if (team.members.length > 0) {
            const sum = team.members.reduce((acc, m) => acc + m.avgScore, 0);
            team.averageScore = Math.round(sum / team.members.length * 10) / 10;
        }
    });

    // 남은 인원 처리 (4명 미만)
    const remaining = sorted.slice(teamCount * 4);
    if (remaining.length > 0 && teams.length > 0) {
        // 마지막 조에 추가
        const lastTeam = teams[teams.length - 1];
        remaining.forEach(m => lastTeam.members.push(m));

        const sum = lastTeam.members.reduce((acc, m) => acc + m.avgScore, 0);
        lastTeam.averageScore = Math.round(sum / lastTeam.members.length * 10) / 10;
    }

    return teams.filter(t => t.members.length > 0);
}
