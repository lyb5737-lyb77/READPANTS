'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAccommodation } from '@/lib/db/accommodations';
import { Accommodation } from '@/types/accommodation';
import { Loader2, MapPin, Phone, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AccommodationDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string>("");

    useEffect(() => {
        const fetchAccommodation = async () => {
            if (!id) return;
            try {
                const data = await getAccommodation(id);
                setAccommodation(data);
                if (data?.images?.length) {
                    setSelectedImage(data.images[0]);
                }
            } catch (error) {
                console.error("Failed to fetch accommodation:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAccommodation();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
        );
    }

    if (!accommodation) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen gap-4">
                <p className="text-xl font-semibold text-gray-900">숙소 정보를 찾을 수 없습니다.</p>
                <Link href="/">
                    <Button variant="outline">홈으로 돌아가기</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Header / Navigation */}
            <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-4">
                <button onClick={() => window.close()} className="p-2 hover:bg-gray-100 rounded-full md:hidden">
                    {/* Mobile verify close logic if opened in new window, else back */}
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-bold truncate flex-1">{accommodation.name}</h1>
            </div>

            <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="aspect-video w-full bg-gray-100 rounded-xl overflow-hidden relative">
                        {selectedImage ? (
                            <img src={selectedImage} alt={accommodation.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">이미지 없음</div>
                        )}
                    </div>
                    {accommodation.images && accommodation.images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {accommodation.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(img)}
                                    className={`relative w-24 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-red-600 ring-2 ring-red-100' : 'border-transparent hover:border-gray-300'}`}
                                >
                                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{accommodation.name}</h2>
                            <div className="flex items-center text-gray-600 gap-4">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4 text-red-500" />
                                    <span>{accommodation.country} &gt; {accommodation.region}</span>
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm mt-1">{accommodation.address}</p>
                        </div>

                        <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                            {accommodation.description}
                        </div>

                        {accommodation.amenities && accommodation.amenities.length > 0 && (
                            <div>
                                <h3 className="font-bold text-lg mb-3">편의 시설</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {accommodation.amenities.map(item => (
                                        <div key={item} className="flex items-center gap-2 text-gray-600">
                                            <Check className="w-4 h-4 text-green-500" />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Room Types Sidebar */}
                    <div className="md:col-span-1">
                        <div className="bg-gray-50 rounded-xl p-6 border shadow-sm sticky top-24">
                            <h3 className="font-bold text-lg mb-4">객실 타입 및 요금</h3>
                            <div className="space-y-4">
                                {accommodation.roomTypes.map(room => (
                                    <div key={room.id} className="bg-white p-4 rounded-lg border">
                                        <h4 className="font-bold text-gray-900">{room.name}</h4>
                                        {room.description && <p className="text-sm text-gray-500 mb-2 text-xs">{room.description}</p>}
                                        <div className="space-y-1 mt-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">1인실</span>
                                                <span className="font-bold text-red-600">{room.priceSingle.toLocaleString()} {room.currency}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">2인실</span>
                                                <span className="font-bold text-red-600">{room.priceDouble.toLocaleString()} {room.currency}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 pt-6 border-t text-sm text-gray-500">
                                <p>※ 위 요금은 예상 견적이며, 날짜와 시즌에 따라 변동될 수 있습니다.</p>
                                <p className="mt-2 text-xs text-gray-400">문의: {accommodation.contact || "고객센터"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
