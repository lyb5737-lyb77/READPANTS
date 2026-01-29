"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { Plus, Trash2, Save } from "lucide-react";

interface Region {
    id: string;
    country: string;
    region: string;
    label: string;
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
                fetchedRegions.push({ id: doc.id, ...doc.data() } as Region);
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
            alert("모든 필드를 입력해주세요.");
            return;
        }

        try {
            const id = `${newRegion.country}-${newRegion.region}`.toLowerCase();
            await setDoc(doc(db, "regions", id), newRegion);
            await fetchRegions();
            setNewRegion({ country: "", region: "", label: "" });
            alert("지역이 추가되었습니다.");
        } catch (error) {
            console.error("Failed to add region:", error);
            alert("지역 추가에 실패했습니다.");
        }
    };

    const handleDeleteRegion = async (id: string) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;

        try {
            await deleteDoc(doc(db, "regions", id));
            await fetchRegions();
            alert("지역이 삭제되었습니다.");
        } catch (error) {
            console.error("Failed to delete region:", error);
            alert("지역 삭제에 실패했습니다.");
        }
    };

    const handleInitialize = async () => {
        if (!confirm("초기 지역 데이터를 생성하시겠습니까?")) return;

        try {
            const initialRegions = [
                { country: "Thailand", region: "Pattaya", label: "태국 파타야" },
                { country: "Vietnam", region: "Haiphong", label: "베트남 하이퐁" },
            ];

            for (const region of initialRegions) {
                const id = `${region.country}-${region.region}`.toLowerCase();
                await setDoc(doc(db, "regions", id), region);
            }

            await fetchRegions();
            alert("초기 데이터가 생성되었습니다.");
        } catch (error) {
            console.error("Failed to initialize regions:", error);
            alert("초기화에 실패했습니다.");
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
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                                <div>
                                    <div className="font-semibold">{region.label}</div>
                                    <div className="text-sm text-gray-600">
                                        {region.country} · {region.region}
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
