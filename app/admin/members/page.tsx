"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, UserCog, Loader2 } from "lucide-react";
import { getUsers, UserProfile } from "@/lib/db/users";
import { UserLevelBadge } from "@/components/ui/user-level-badge";

export default function MembersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

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
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 uppercase">
                            <tr>
                                <th className="px-6 py-3">닉네임 / 이메일</th>
                                <th className="px-6 py-3">등급</th>
                                <th className="px-6 py-3">평균 타수</th>
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
                                        <UserLevelBadge levelName={user.level} />
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        {user.avgScore}
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
                                            <Button variant="outline" size="sm">
                                                <Edit className="w-4 h-4 mr-1" /> 수정
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        검색 결과가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}
