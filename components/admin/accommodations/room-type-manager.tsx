"use client";

import { useState } from "react";
import { Plus, Trash, Edit, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoomType } from "@/types/accommodation";

interface RoomTypeManagerProps {
    roomTypes: RoomType[];
    onChange: (roomTypes: RoomType[]) => void;
}

export function RoomTypeManager({ roomTypes, onChange }: RoomTypeManagerProps) {
    const [newRoom, setNewRoom] = useState<Partial<RoomType>>({
        name: "",
        priceSingle: 0,
        priceDouble: 0,
        description: "",
        currency: "USD",
    });

    const handleAddRoomType = () => {
        if (!newRoom.name || !newRoom.priceSingle || !newRoom.priceDouble) {
            alert("Please fill in all required fields (Name, Prices).");
            return;
        }

        const room: RoomType = {
            id: crypto.randomUUID(),
            name: newRoom.name || "",
            priceSingle: Number(newRoom.priceSingle),
            priceDouble: Number(newRoom.priceDouble),
            description: newRoom.description || "",
            currency: newRoom.currency || "USD",
        };

        onChange([...roomTypes, room]);
        setNewRoom({ name: "", priceSingle: 0, priceDouble: 0, description: "", currency: "USD" });
    };

    const handleRemoveRoomType = (id: string) => {
        onChange(roomTypes.filter((rt) => rt.id !== id));
    };

    return (
        <div className="space-y-4 border p-4 rounded-md bg-gray-50">
            <h3 className="font-semibold text-lg">객실 타입 관리</h3>

            {/* List of existing Room Types */}
            <div className="space-y-2">
                {roomTypes.map((rt) => (
                    <div key={rt.id} className="flex items-center justify-between bg-white p-3 rounded shadow-sm border">
                        <div>
                            <div className="font-bold">{rt.name}</div>
                            <div className="text-sm text-gray-500">
                                1인실: {rt.priceSingle.toLocaleString()} {rt.currency} /
                                2인실: {rt.priceDouble.toLocaleString()} {rt.currency}
                            </div>
                            {rt.description && <div className="text-xs text-gray-400 mt-1">{rt.description}</div>}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveRoomType(rt.id)} className="text-red-500 hover:text-red-700">
                            <Trash className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
            </div>

            {/* Add New Room Type Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div className="space-y-2">
                    <Label>객실 타입 이름 (예: 디럭스룸)</Label>
                    <Input
                        value={newRoom.name}
                        onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                        placeholder="객실 이름 입력"
                    />
                </div>
                <div className="space-y-2">
                    <Label>통화 (Currency)</Label>
                    <Input
                        value={newRoom.currency}
                        onChange={(e) => setNewRoom({ ...newRoom, currency: e.target.value })}
                        placeholder="USD, KRW, THB"
                    />
                </div>
                <div className="space-y-2">
                    <Label>1인실 가격</Label>
                    <Input
                        type="number"
                        value={newRoom.priceSingle || ""}
                        onChange={(e) => setNewRoom({ ...newRoom, priceSingle: Number(e.target.value) })}
                        placeholder="1인실 가격"
                    />
                </div>
                <div className="space-y-2">
                    <Label>2인실 가격</Label>
                    <Input
                        type="number"
                        value={newRoom.priceDouble || ""}
                        onChange={(e) => setNewRoom({ ...newRoom, priceDouble: Number(e.target.value) })}
                        placeholder="2인실 가격"
                    />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label>설명 (선택)</Label>
                    <Input
                        value={newRoom.description}
                        onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                        placeholder="객실에 대한 간단한 설명"
                    />
                </div>
                <div className="col-span-1 md:col-span-2">
                    <Button onClick={handleAddRoomType} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        객실 타입 추가
                    </Button>
                </div>
            </div>
        </div>
    );
}
