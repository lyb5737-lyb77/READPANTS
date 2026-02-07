'use client';

import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    ArrowLeft, Users, MapPin, Clock, Loader2,
    Shuffle, Send, CheckCircle, AlertCircle
} from 'lucide-react';
import { getJoins } from '@/lib/db/joins';
import { getCourse } from '@/lib/db/courses';
import { getJoinParticipants, JoinParticipant } from '@/lib/db/participants';
import { getUser } from '@/lib/db/users';
import { createTeamAssignment, autoAssignTeams, TeamMember, Team, getTeamAssignmentByJoin } from '@/lib/db/team-assignments';
import { sendNotification } from '@/lib/db/notifications';
import { Join } from '@/lib/joins-data';
import Link from 'next/link';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

interface JoinWithDetails extends Join {
    participants: ParticipantWithUser[];
    teamAssignment?: { status: string; teams?: Team[] };
}

interface ParticipantWithUser extends JoinParticipant {
    nickname?: string;
    profileImageUrl?: string;
    avgScore?: number;
    gender?: string;
    phone?: string;
}

export default function CalendarDatePage({ params }: { params: Promise<{ date: string }> }) {
    const resolvedParams = use(params);
    const dateStr = resolvedParams.date;

    const [joins, setJoins] = useState<JoinWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedJoin, setSelectedJoin] = useState<JoinWithDetails | null>(null);
    const [teamDialogOpen, setTeamDialogOpen] = useState(false);
    const [proposedTeams, setProposedTeams] = useState<Team[]>([]);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const allJoins = await getJoins();
                const dateJoins = allJoins.filter(j => j.date === dateStr);

                const joinsWithDetails = await Promise.all(
                    dateJoins.map(async (join) => {
                        const course = await getCourse(join.courseId);
                        const participants = await getJoinParticipants(join.id);

                        // 참가자 상세 정보 가져오기
                        const participantsWithUser = await Promise.all(
                            participants.map(async (p) => {
                                const user = await getUser(p.userId);
                                return {
                                    ...p,
                                    nickname: user?.nickname || p.userName || '알 수 없음',
                                    profileImageUrl: user?.profileImageUrl,
                                    avgScore: user?.avgScore || 90,
                                    gender: user?.gender || 'other',
                                    phone: user?.phone,
                                };
                            })
                        );

                        // 조 편성 상태 확인
                        const teamAssignment = await getTeamAssignmentByJoin(join.id);

                        return {
                            ...join,
                            courseName: course?.name || join.courseName || '알 수 없음',
                            participants: participantsWithUser,
                            teamAssignment: teamAssignment ? {
                                status: teamAssignment.status,
                                teams: teamAssignment.teams
                            } : undefined
                        };
                    })
                );

                setJoins(joinsWithDetails);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dateStr]);

    const handleAutoAssign = (join: JoinWithDetails) => {
        setSelectedJoin(join);

        // 참가자를 TeamMember 형식으로 변환
        const members: TeamMember[] = join.participants.map(p => ({
            oderId: `${p.joinId}_${p.userId}`,
            oderedAt: p.appliedAt || new Date().toISOString(),
            userId: p.userId,
            nickname: p.nickname || '알 수 없음',
            profileImageUrl: p.profileImageUrl,
            avgScore: p.avgScore || 90,
            gender: (p.gender as 'male' | 'female' | 'other') || 'other',
            phone: p.phone,
        }));

        const teams = autoAssignTeams(members);
        setProposedTeams(teams);
        setTeamDialogOpen(true);
    };

    const handleConfirmTeams = async () => {
        if (!selectedJoin || proposedTeams.length === 0) return;

        setAssigning(true);
        try {
            // 조 편성 저장
            await createTeamAssignment(
                selectedJoin.id,
                selectedJoin.date,
                selectedJoin.courseId,
                selectedJoin.courseName || '',
                proposedTeams
            );

            // 참가자들에게 알림 발송
            for (const team of proposedTeams) {
                const memberNames = team.members.map(m => m.nickname).join(', ');

                for (const member of team.members) {
                    await sendNotification(
                        member.userId,
                        `[${selectedJoin.courseName}] ${format(parseISO(selectedJoin.date), 'M/d', { locale: ko })} 조 편성 완료! ${team.teamNumber}조: ${memberNames}`,
                        'notice',
                        selectedJoin.id
                    );
                }
            }

            alert('조 편성이 완료되었고, 참가자들에게 알림이 발송되었습니다!');
            setTeamDialogOpen(false);

            // 페이지 새로고침
            window.location.reload();
        } catch (error) {
            console.error('Error assigning teams:', error);
            alert('조 편성 중 오류가 발생했습니다.');
        } finally {
            setAssigning(false);
        }
    };

    const formattedDate = format(parseISO(dateStr), 'yyyy년 M월 d일 (EEEE)', { locale: ko });

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-red-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center gap-4">
                <Link href="/admin/calendar">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">📅 {formattedDate}</h2>
                    <p className="text-muted-foreground">
                        {joins.length}개의 조인이 예정되어 있습니다.
                    </p>
                </div>
            </div>

            {joins.length === 0 ? (
                <Card>
                    <CardContent className="py-20 text-center">
                        <p className="text-gray-500">이 날짜에 예정된 조인이 없습니다.</p>
                        <Link href="/admin/joins/new">
                            <Button variant="outline" className="mt-4">
                                새 조인 등록
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {joins.map((join) => (
                        <Card key={join.id} className="overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-green-600" />
                                            {join.courseName}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-4 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {join.time}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {join.participants.length}/{join.maxMembers}명
                                            </span>
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        {join.teamAssignment?.status === 'assigned' || join.teamAssignment?.status === 'notified' ? (
                                            <span className="flex items-center gap-1 text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm font-medium">
                                                <CheckCircle className="w-4 h-4" />
                                                조 편성 완료
                                            </span>
                                        ) : join.participants.length >= 4 ? (
                                            <Button
                                                onClick={() => handleAutoAssign(join)}
                                                className="gap-2 bg-blue-600 hover:bg-blue-700"
                                            >
                                                <Shuffle className="w-4 h-4" />
                                                조 편성하기
                                            </Button>
                                        ) : (
                                            <span className="flex items-center gap-1 text-amber-600 bg-amber-100 px-3 py-1 rounded-full text-sm font-medium">
                                                <AlertCircle className="w-4 h-4" />
                                                4명 이상 필요
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                {/* 조 편성된 경우 */}
                                {join.teamAssignment?.teams && join.teamAssignment.teams.length > 0 ? (
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-700">조 편성 결과</h4>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {join.teamAssignment.teams.map((team) => (
                                                <div key={team.teamNumber} className="bg-gray-50 rounded-lg p-4 border">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h5 className="font-bold text-lg">{team.teamNumber}조</h5>
                                                        <span className="text-sm text-gray-500">
                                                            평균 {team.averageScore}타
                                                        </span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {team.members.map((member) => (
                                                            <div key={member.userId} className="flex items-center gap-3 bg-white p-2 rounded-lg border">
                                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                                                    {member.profileImageUrl ? (
                                                                        <Image
                                                                            src={member.profileImageUrl}
                                                                            alt={member.nickname}
                                                                            width={40}
                                                                            height={40}
                                                                            className="object-cover w-full h-full"
                                                                            unoptimized
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                            <Users className="w-5 h-5" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-medium text-gray-900 truncate">
                                                                        {member.nickname}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {member.gender === 'male' ? '남' : member.gender === 'female' ? '여' : ''} · 평균 {member.avgScore}타
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    /* 참가자 리스트 */
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-gray-700">참가자 목록</h4>
                                        {join.participants.length === 0 ? (
                                            <p className="text-gray-500 text-sm py-4 text-center">
                                                아직 등록된 참가자가 없습니다.
                                            </p>
                                        ) : (
                                            <div className="grid gap-2 md:grid-cols-2">
                                                {join.participants.map((participant, index) => (
                                                    <div
                                                        key={`${participant.joinId}_${participant.userId}_${index}`}
                                                        className={`flex items-center gap-3 p-3 rounded-lg border relative group ${participant.status === 'pending' ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                                                            }`}
                                                    >
                                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                                            {participant.profileImageUrl ? (
                                                                <Image
                                                                    src={participant.profileImageUrl}
                                                                    alt={participant.nickname || ''}
                                                                    width={48}
                                                                    height={48}
                                                                    className="object-cover w-full h-full"
                                                                    unoptimized
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                    <Users className="w-6 h-6" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-medium text-gray-900">
                                                                    {participant.nickname}
                                                                </p>
                                                                {participant.status === 'pending' && (
                                                                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-yellow-200 text-yellow-800 rounded">
                                                                        대기
                                                                    </span>
                                                                )}
                                                                {participant.status === 'approved' && (
                                                                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-200 text-green-800 rounded">
                                                                        승인
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                <span className={`px-1.5 py-0.5 rounded text-xs ${participant.gender === 'male'
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : participant.gender === 'female'
                                                                        ? 'bg-pink-100 text-pink-700'
                                                                        : 'bg-gray-100 text-gray-700'
                                                                    }`}>
                                                                    {participant.gender === 'male' ? '남' : participant.gender === 'female' ? '여' : '-'}
                                                                </span>
                                                                <span>평균 {participant.avgScore}타</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right text-sm">
                                                            <div className="text-gray-500 mb-1">
                                                                {participant.phone?.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3')}
                                                            </div>
                                                            {participant.status === 'pending' && (
                                                                <Link href={`/admin/joins/${join.id}`}>
                                                                    <Button size="sm" variant="outline" className="h-7 text-xs border-yellow-300 hover:bg-yellow-100 text-yellow-800">
                                                                        승인 하기 &gt;
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* 조 편성 확인 다이얼로그 */}
            <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shuffle className="w-5 h-5 text-blue-600" />
                            조 편성 미리보기
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        {proposedTeams.map((team) => (
                            <div key={team.teamNumber} className="bg-gray-50 rounded-lg p-4 border">
                                <div className="flex items-center justify-between mb-3">
                                    <h5 className="font-bold text-lg">{team.teamNumber}조</h5>
                                    <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
                                        평균 {team.averageScore}타
                                    </span>
                                </div>
                                <div className="grid gap-2 md:grid-cols-2">
                                    {team.members.map((member) => (
                                        <div key={member.userId} className="flex items-center gap-2 bg-white p-2 rounded border">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                                                {member.nickname.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{member.nickname}</p>
                                                <p className="text-xs text-gray-500">
                                                    {member.gender === 'male' ? '남' : member.gender === 'female' ? '여' : ''} · {member.avgScore}타
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <DialogFooter className="flex gap-2">
                        <Button variant="outline" onClick={() => setTeamDialogOpen(false)}>
                            취소
                        </Button>
                        <Button
                            onClick={handleConfirmTeams}
                            disabled={assigning}
                            className="bg-blue-600 hover:bg-blue-700 gap-2"
                        >
                            {assigning && <Loader2 className="animate-spin w-4 h-4" />}
                            <Send className="w-4 h-4" />
                            확정 및 알림 발송
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
