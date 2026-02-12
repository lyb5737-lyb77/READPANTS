"use client";

import { useEffect, useState } from "react";
import { getHotelRooms, createHotelRoom, updateHotelRoom, deleteHotelRoom, HotelRoom } from "@/lib/db/hotel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

export default function AdminHotelPage() {
    const [rooms, setRooms] = useState<HotelRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<HotelRoom | null>(null);

    // Form states
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [currency, setCurrency] = useState("VND");
    const [capacity, setCapacity] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        setLoading(true);
        const data = await getHotelRooms();
        setRooms(data);
        setLoading(false);
    };

    const resetForm = () => {
        setName("");
        setDescription("");
        setPrice("");
        setCurrency("VND");
        setCapacity("2");
        setEditingRoom(null);
    };

    const handleOpenDialog = (room?: HotelRoom) => {
        if (room) {
            setEditingRoom(room);
            setName(room.name);
            setDescription(room.description);
            setPrice(room.price.toString());
            setCurrency(room.currency);
            setCapacity(room.capacity.toString());
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !price || !capacity) {
            toast.error("필수 항목을 모두 입력해주세요.");
            return;
        }

        setSubmitting(true);
        try {
            const roomData = {
                hotelName: "Sunflower Hotel",
                name,
                description,
                price: Number(price),
                currency,
                capacity: Number(capacity),
            };

            if (editingRoom) {
                await updateHotelRoom(editingRoom.id, roomData);
                toast.success("객실 정보가 수정되었습니다.");
            } else {
                await createHotelRoom(roomData);
                toast.success("새 객실이 추가되었습니다.");
            }

            setIsDialogOpen(false);
            fetchRooms();
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error("저장 중 오류가 발생했습니다.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;

        try {
            await deleteHotelRoom(id);
            toast.success("객실이 삭제되었습니다.");
            fetchRooms();
        } catch (error) {
            console.error(error);
            toast.error("삭제 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">호텔 객실 관리</h2>
                    <p className="text-gray-500">썬플라워 호텔의 객실 타입과 요금을 관리합니다.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4 mr-2" />
                    객실 추가
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>객실명</TableHead>
                                <TableHead>설명</TableHead>
                                <TableHead className="text-right">기본 요금</TableHead>
                                <TableHead className="text-center">최대 인원</TableHead>
                                <TableHead className="text-right w-[100px]">관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10">
                                        <Loader2 className="animate-spin h-6 w-6 mx-auto text-gray-400" />
                                    </TableCell>
                                </TableRow>
                            ) : rooms.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                                        등록된 객실이 없습니다.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rooms.map((room) => (
                                    <TableRow key={room.id}>
                                        <TableCell className="font-medium">{room.name}</TableCell>
                                        <TableCell className="max-w-[300px] truncate text-gray-500">
                                            {room.description || "-"}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {new Intl.NumberFormat('ko-KR').format(room.price)} {room.currency}
                                        </TableCell>
                                        <TableCell className="text-center">{room.capacity}명</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenDialog(room)}
                                                    className="h-8 w-8 text-gray-500 hover:text-blue-600"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(room.id)}
                                                    className="h-8 w-8 text-gray-500 hover:text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingRoom ? "객실 정보 수정" : "새 객실 추가"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">객실명</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="예: Deluxe King Room"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">설명</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="객실에 대한 간단한 설명을 입력하세요."
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">1박 요금</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="0"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="currency">화폐 단위</Label>
                                <Input
                                    id="currency"
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    placeholder="VND"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="capacity">최대 수용 인원</Label>
                            <Input
                                id="capacity"
                                type="number"
                                value={capacity}
                                onChange={(e) => setCapacity(e.target.value)}
                                placeholder="2"
                                required
                            />
                        </div>
                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>취소</Button>
                            <Button type="submit" disabled={submitting} className="bg-red-600 hover:bg-red-700">
                                {submitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                                {editingRoom ? "수정 저장" : "추가하기"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
