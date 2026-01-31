"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, UserCog, Loader2 } from "lucide-react";
import { getUsers, UserProfile } from "@/lib/db/users";
import { LevelBadge } from "@/components/ui/level-badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { sendNotification } from "@/lib/db/notifications";
import { MessageSquare } from "lucide-react";

export default function MembersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);

    const handleSendMessage = async () => {
        if (!selectedUser || !message.trim()) return;

        setSending(true);
        try {
            await sendNotification(selectedUser.uid, message, 'notice');
            alert("메시지가 전송되었습니다.");
            setSelectedUser(null);
            setMessage("");
        } catch (error) {
            console.error("Failed to send message:", error);
            alert("메시지 전송 실패");
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getUsers();
                setUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredUsers = users.filter(user =>
        user.email.includes(searchTerm) || user.nickname.includes(searchTerm)
    );

    if (loading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">회원 정보 관리</h2>
                    <p className="text-gray-500">
                        등록된 회원의 정보를 조회하고 수정할 수 있습니다.
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 bg-white p-4 rounded-lg border shadow-sm">
                <Search className="w-5 h-5 text-gray-400" />
                <Input
                    placeholder="이름 또는 이메일 검색..."
                    className="max-w-sm border-none shadow-none focus-visible:ring-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 uppercase">
                            <tr>
                                <th className="px-6 py-3">닉네임 / 이메일</th>
                                <th className="px-6 py-3">커뮤니티 등급</th>
                                <th className="px-6 py-3">골프 실력</th>
                                <th className="px-6 py-3">활동 포인트</th>
                                <th className="px-6 py-3">권한</th>
                                <th className="px-6 py-3">가입일</th>
                                <th className="px-6 py-3 text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.uid} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{user.nickname}</div>
                                        <div className="text-gray-500 text-xs">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <LevelBadge
                                            type="community"
                                            level={user.communityLevel || 1}
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        <div className="flex flex-col gap-1 items-start">
                                            <LevelBadge
                                                type="golf"
                                                level={user.golfSkillLevel || 1}
                                            />
                                            <span className="text-xs text-gray-400 pl-1">{user.avgScore}타</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {user.activityPoints ?? 0} P
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.role === 'admin' ? (
                                            <span className="flex items-center text-red-600 font-bold text-xs">
                                                <UserCog className="w-3 h-3 mr-1" /> 관리자
                                            </span>
                                        ) : (
                                            <span className="text-gray-500 text-xs">일반 회원</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {user.createdAt}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/admin/members/${user.uid}`}>
                                            <Button variant="outline" size="sm" className="mr-2">
                                                <Edit className="w-4 h-4 mr-1" /> 수정
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedUser(user)}
                                        >
                                            <MessageSquare className="w-4 h-4 mr-1" /> 메시지
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y">
                    {filteredUsers.map((user) => (
                        <div key={user.uid} className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-gray-900">{user.nickname}</h3>
                                        {user.role === 'admin' && (
                                            <span className="text-red-600 font-bold text-xs flex items-center bg-red-50 px-1.5 py-0.5 rounded">
                                                <UserCog className="w-3 h-3 mr-1" /> 관리자
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-0.5">{user.email}</div>
                                </div>
                                <div className="flex flex-col gap-1 items-end">
                                    <LevelBadge
                                        type="community"
                                        level={user.communityLevel || 1}
                                    />
                                    <LevelBadge
                                        type="golf"
                                        level={user.golfSkillLevel || 1}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-gray-50 p-2 rounded flex justify-between items-center">
                                    <span className="text-gray-500 text-xs">평균 타수</span>
                                    <span className="font-medium">{user.avgScore}타</span>
                                </div>
                                <div className="bg-gray-50 p-2 rounded flex justify-between items-center">
                                    <span className="text-gray-500 text-xs">포인트</span>
                                    <span className="font-medium text-green-600">{user.activityPoints ?? 0} P</span>
                                </div>
                                <div className="bg-gray-50 p-2 rounded col-span-2 flex justify-between items-center">
                                    <span className="text-gray-500 text-xs">가입일</span>
                                    <span className="text-gray-700">{user.createdAt}</span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Link href={`/admin/members/${user.uid}`} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full">
                                        <Edit className="w-4 h-4 mr-2" /> 정보 수정
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => setSelectedUser(user)}
                                >
                                    <MessageSquare className="w-4 h-4 mr-2" /> 메시지
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                {filteredUsers.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        검색 결과가 없습니다.
                    </div>
                )}
            </div>

            <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>메시지 보내기</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
                            <p className="font-medium">수신자: {selectedUser?.nickname} ({selectedUser?.email})</p>
                        </div>
                        <Textarea
                            placeholder="전송할 메시지를 입력하세요."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={5}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedUser(null)}>취소</Button>
                        <Button onClick={handleSendMessage} disabled={sending || !message.trim()} className="bg-red-600 hover:bg-red-700">
                            {sending ? "전송 중..." : "전송하기"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
