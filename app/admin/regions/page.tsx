"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

interface Region {
    id: string;
    country: string;
    region: string;
    label: string;
    isActive: boolean;
}

export default function RegionsPage() {
    const [regions, setRegions] = useState<Region[]>([]);
    const [loading, setLoading] = useState(true);
    const [newRegion, setNewRegion] = useState({
        country: "",
        region: "",
        label: "",
    });

    useEffect(() => {
        fetchRegions();
    }, []);

    const fetchRegions = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "regions"));
            const fetchedRegions: Region[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                fetchedRegions.push({
                    id: doc.id,
                    country: data.country,
                    region: data.region,
                    label: data.label,
                    isActive: data.isActive !== false, // 기본값 true
                } as Region);
            });
            setRegions(fetchedRegions);
        } catch (error) {
            console.error("Failed to fetch regions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRegion = async () => {
        if (!newRegion.country || !newRegion.region || !newRegion.label) {
            toast.warning("모든 필드를 입력해주세요.");
            return;
        }

        try {
            const id = `${newRegion.country}-${newRegion.region}`.toLowerCase();
            await setDoc(doc(db, "regions", id), {
                ...newRegion,
                isActive: true, // 새 지역은 기본적으로 활성화
            });
            await fetchRegions();
            setNewRegion({ country: "", region: "", label: "" });
            toast.success("지역이 추가되었습니다.");
        } catch (error) {
            console.error("Failed to add region:", error);
            toast.error("지역 추가에 실패했습니다.");
        }
    };

    const handleDeleteRegion = async (id: string) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;

        try {
            await deleteDoc(doc(db, "regions", id));
            await fetchRegions();
            toast.success("지역이 삭제되었습니다.");
        } catch (error) {
            console.error("Failed to delete region:", error);
            toast.error("지역 삭제에 실패했습니다.");
        }
    };

    const handleToggleActive = async (region: Region) => {
        try {
            await updateDoc(doc(db, "regions", region.id), {
                isActive: !region.isActive,
            });
            setRegions(regions.map(r =>
                r.id === region.id ? { ...r, isActive: !r.isActive } : r
            ));
        } catch (error) {
            console.error("Failed to toggle region:", error);
            toast.error("상태 변경에 실패했습니다.");
        }
    };

    const handleInitialize = async () => {
        if (!confirm("초기 지역 데이터를 생성하시겠습니까?")) return;

        try {
            const initialRegions = [
                { country: "Thailand", region: "Pattaya", label: "태국 파타야", isActive: true },
                { country: "Vietnam", region: "Haiphong", label: "베트남 하이퐁", isActive: true },
            ];

            for (const region of initialRegions) {
                const id = `${region.country}-${region.region}`.toLowerCase();
                await setDoc(doc(db, "regions", id), region);
            }

            await fetchRegions();
            toast.success("초기 데이터가 생성되었습니다.");
        } catch (error) {
            console.error("Failed to initialize regions:", error);
            toast.error("초기화에 실패했습니다.");
        }
    };

    if (loading) {
        return <div className="p-8">로딩 중...</div>;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">지역 관리</h1>
                {regions.length === 0 && (
                    <Button onClick={handleInitialize} className="bg-blue-600">
                        초기 데이터 생성
                    </Button>
                )}
            </div>

            {/* Add New Region */}
            <div className="bg-white p-6 rounded-xl border mb-6">
                <h2 className="text-xl font-bold mb-4">새 지역 추가</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">국가</label>
                        <input
                            type="text"
                            value={newRegion.country}
                            onChange={(e) =>
                                setNewRegion({ ...newRegion, country: e.target.value })
                            }
                            placeholder="Thailand"
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">지역</label>
                        <input
                            type="text"
                            value={newRegion.region}
                            onChange={(e) =>
                                setNewRegion({ ...newRegion, region: e.target.value })
                            }
                            placeholder="Pattaya"
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">표시명</label>
                        <input
                            type="text"
                            value={newRegion.label}
                            onChange={(e) =>
                                setNewRegion({ ...newRegion, label: e.target.value })
                            }
                            placeholder="태국 파타야"
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                </div>
                <Button onClick={handleAddRegion} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    지역 추가
                </Button>
            </div>

            {/* Regions List */}
            <div className="bg-white p-6 rounded-xl border">
                <h2 className="text-xl font-bold mb-4">등록된 지역</h2>
                {regions.length === 0 ? (
                    <p className="text-gray-500">등록된 지역이 없습니다.</p>
                ) : (
                    <div className="space-y-3">
                        {regions.map((region) => (
                            <div
                                key={region.id}
                                className={`flex items-center justify-between p-4 rounded-lg transition-colors ${region.isActive ? 'bg-gray-50' : 'bg-gray-100 opacity-60'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleToggleActive(region)}
                                        className={`transition-colors ${region.isActive ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-500'
                                            }`}
                                        title={region.isActive ? '활성 상태 (클릭하여 비활성화)' : '비활성 상태 (클릭하여 활성화)'}
                                    >
                                        {region.isActive ? (
                                            <ToggleRight className="h-8 w-8" />
                                        ) : (
                                            <ToggleLeft className="h-8 w-8" />
                                        )}
                                    </button>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{region.label}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${region.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                {region.isActive ? '활성' : '비활성'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {region.country} · {region.region}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteRegion(region.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

