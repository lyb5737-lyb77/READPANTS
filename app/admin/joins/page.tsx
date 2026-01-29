"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, Calendar, MapPin, Users, Plus, Loader2 } from "lucide-react";
import { getJoins, deleteJoin } from "@/lib/db/joins";
import { Join } from "@/lib/joins-data";

export default function AdminJoinsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [joins, setJoins] = useState<Join[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJoins = async () => {
            try {
                const data = await getJoins();
                setJoins(data);
            } catch (error) {
                console.error("Error fetching joins:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchJoins();
    }, []);

    const filteredJoins = joins.filter(join =>
        join.courseName.includes(searchTerm) || join.hostName.includes(searchTerm)
    );

    const handleDelete = async (id: string) => {
        if (confirm("정말로 이 조인을 삭제하시겠습니까?")) {
            try {
                await deleteJoin(id);
                setJoins(joins.filter(j => j.id !== id));
                alert("삭제되었습니다.");
            } catch (error) {
                console.error("Error deleting join:", error);
                alert("삭제 중 오류가 발생했습니다.");
            }
        }
    };

    if (loading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">골프 조인 관리</h2>
                    <p className="text-gray-500">
                        등록된 조인 모집글을 관리할 수 있습니다.
                    </p>
                </div>
                <Link href="/admin/joins/new">
                    <Button className="bg-red-600 hover:bg-red-700">
                        <Plus className="w-4 h-4 mr-2" />
                        조인 등록
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-2 bg-white p-4 rounded-lg border shadow-sm">
                <Search className="w-5 h-5 text-gray-400" />
                <Input
                    placeholder="골프장 또는 호스트 검색..."
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
                                <th className="px-6 py-3">골프장 / 일시</th>
                                <th className="px-6 py-3">지역</th>
                                <th className="px-6 py-3">호스트</th>
                                <th className="px-6 py-3">그린피</th>
                                <th className="px-6 py-3">참여 현황</th>
                                <th className="px-6 py-3">상태</th>
                                <th className="px-6 py-3 text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredJoins.map((join) => (
                                <tr key={join.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{join.courseName}</div>
                                        <div className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                                            <Calendar className="w-3 h-3" /> {join.date} {join.time}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-gray-700">
                                            <MapPin className="w-3 h-3 text-red-500" />
                                            <span className="text-xs">{join.country} / {join.region}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium">{join.hostName}</div>
                                        <div className="text-xs text-gray-500">{join.hostLevel}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        {join.greenFee.toLocaleString()} 바트
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4 text-gray-400" />
                                            <span>{join.currentMembers} / {join.maxMembers}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${join.status === 'open' ? 'bg-green-50 text-green-700 border-green-200' :
                                            join.status === 'full' ? 'bg-red-50 text-red-700 border-red-200' :
                                                'bg-gray-50 text-gray-700 border-gray-200'
                                            }`}>
                                            {join.status === 'open' ? '모집중' :
                                                join.status === 'full' ? '마감' : '종료'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/admin/joins/${join.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(join.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y">
                    {filteredJoins.map((join) => (
                        <div key={join.id} className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-gray-900">{join.courseName}</h3>
                                    <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                        <Calendar className="w-3 h-3" /> {join.date} {join.time}
                                    </div>
                                    <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                        <MapPin className="w-3 h-3 text-red-500" />
                                        {join.country} / {join.region}
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${join.status === 'open' ? 'bg-green-50 text-green-700 border-green-200' :
                                    join.status === 'full' ? 'bg-red-50 text-red-700 border-red-200' :
                                        'bg-gray-50 text-gray-700 border-gray-200'
                                    }`}>
                                    {join.status === 'open' ? '모집중' :
                                        join.status === 'full' ? '마감' : '종료'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-gray-50 p-2 rounded">
                                    <span className="text-gray-500 text-xs block">호스트</span>
                                    <span className="font-medium">{join.hostName}</span>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                    <span className="text-gray-500 text-xs block">그린피</span>
                                    <span className="font-medium">{join.greenFee.toLocaleString()} 바트</span>
                                </div>
                                <div className="bg-gray-50 p-2 rounded col-span-2 flex justify-between items-center">
                                    <span className="text-gray-500 text-xs">참여 현황</span>
                                    <div className="flex items-center gap-1 font-medium">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span>{join.currentMembers} / {join.maxMembers}명</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Link href={`/admin/joins/${join.id}`} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full">
                                        <Edit className="w-4 h-4 mr-2" /> 수정
                                    </Button>
                                </Link>
                                <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:bg-red-50" onClick={() => handleDelete(join.id)}>
                                    <Trash2 className="w-4 h-4 mr-2" /> 삭제
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                {filteredJoins.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        검색 결과가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}
