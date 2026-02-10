'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash, MapPin } from 'lucide-react';
import { Accommodation } from '@/types/accommodation';
import { getAccommodations, deleteAccommodation } from '@/lib/db/accommodations';
import { AccommodationFormDialog } from '@/components/admin/accommodations/accommodation-form-dialog';
import { toast } from 'sonner';

export default function AccommodationsPage() {
    const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | undefined>(undefined);

    const fetchAccommodations = async () => {
        setIsLoading(true);
        try {
            const data = await getAccommodations();
            setAccommodations(data);
        } catch (error) {
            console.error("Failed to fetch accommodations:", error);
            toast.error("Failed to load accommodations");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAccommodations();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this accommodation?")) return;
        try {
            await deleteAccommodation(id);
            toast.success("Accommodation deleted");
            fetchAccommodations();
        } catch (error) {
            console.error("Failed to delete accommodation:", error);
            toast.error("Failed to delete accommodation");
        }
    };

    const handleEdit = (accommodation: Accommodation) => {
        setSelectedAccommodation(accommodation);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setSelectedAccommodation(undefined);
        setIsDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setSelectedAccommodation(undefined);
        }
    };

    const handleSuccess = () => {
        fetchAccommodations();
        setIsDialogOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">숙소 관리</h2>
                    <p className="text-muted-foreground">
                        견적 요청 시 사용될 숙소 목록을 관리합니다.
                    </p>
                </div>
                <Button onClick={handleCreate} className="gap-2 bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4" />
                    숙소 등록
                </Button>
            </div>

            <AccommodationFormDialog
                open={isDialogOpen}
                onOpenChange={handleDialogClose}
                accommodation={selectedAccommodation}
                onSuccess={handleSuccess}
            />

            {isLoading ? (
                <div className="text-center py-20">Loading...</div>
            ) : accommodations.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground mb-4">등록된 숙소가 없습니다.</p>
                    <Button onClick={handleCreate} variant="outline">
                        첫 번째 숙소 등록하기
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accommodations.map((acc) => (
                        <div key={acc.id} className="bg-white rounded-lg shadow border overflow-hidden flex flex-col">
                            <div className="h-48 bg-gray-200 relative">
                                {acc.images && acc.images.length > 0 ? (
                                    <img src={acc.images[0]} alt={acc.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 bg-white/80 hover:bg-white" onClick={() => handleEdit(acc)}>
                                        <Edit className="w-4 h-4 text-blue-600" />
                                    </Button>
                                    <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDelete(acc.id)}>
                                        <Trash className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-lg mb-1">{acc.name}</h3>
                                <div className="flex items-center text-sm text-gray-500 mb-2">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {acc.country} {acc.region}
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
                                    {acc.description || "설명 없음"}
                                </p>
                                <div className="mt-auto pt-4 border-t">
                                    <div className="text-xs font-semibold text-gray-500 mb-2">객실 타입 ({acc.roomTypes?.length || 0})</div>
                                    <div className="flex flex-wrap gap-1">
                                        {acc.roomTypes?.slice(0, 3).map((rt) => (
                                            <span key={rt.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                {rt.name}
                                            </span>
                                        ))}
                                        {(acc.roomTypes?.length || 0) > 3 && (
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">+{acc.roomTypes.length - 3}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
