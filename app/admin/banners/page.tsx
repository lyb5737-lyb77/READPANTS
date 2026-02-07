"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, ExternalLink, ArrowUp, ArrowDown } from "lucide-react";
import { getBanners, deleteBanner, updateBanner, Banner } from "@/lib/db/banners";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AdminBannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchBanners = async () => {
        try {
            const data = await getBanners(false); // Fetch all (active & inactive)
            setBanners(data);
        } catch (error) {
            console.error("Failed to fetch banners:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleDelete = async (id: string, imageUrl: string) => {
        if (!confirm("정말 이 배너를 삭제하시겠습니까?")) return;

        try {
            await deleteBanner(id, imageUrl);
            setBanners(banners.filter(b => b.id !== id));
            toast.success("배너가 삭제되었습니다.");
        } catch (error) {
            console.error("Failed to delete banner:", error);
            toast.error("배너 삭제 중 오류가 발생했습니다.");
        }
    };

    const handleToggleActive = async (banner: Banner) => {
        try {
            await updateBanner(banner.id, { isActive: !banner.isActive });
            setBanners(banners.map(b =>
                b.id === banner.id ? { ...b, isActive: !b.isActive } : b
            ));
        } catch (error) {
            console.error("Failed to update banner status:", error);
        }
    };

    const handleOrderChange = async (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === banners.length - 1)
        ) return;

        const newBanners = [...banners];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap array elements
        [newBanners[index], newBanners[targetIndex]] = [newBanners[targetIndex], newBanners[index]];

        // Optimistically update UI
        setBanners(newBanners);

        try {
            // Update orders in DB
            await Promise.all([
                updateBanner(newBanners[index].id, { order: index + 1 }), // Assuming 1-based order logic or just relative
                updateBanner(newBanners[targetIndex].id, { order: targetIndex + 1 })
            ]);
            // Re-fetch to ensure sync
            fetchBanners();
        } catch (error) {
            console.error("Failed to reorder banners:", error);
            fetchBanners(); // Revert on error
        }
    };

    if (loading) {
        return <div className="p-8 text-center">배너 목록을 불러오는 중...</div>;
    }

    return (
        <div className="container mx-auto max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">배너 관리</h1>
                    <p className="text-gray-500">메인 페이지 상단에 노출될 배너를 관리합니다.</p>
                </div>
                <Link href="/admin/banners/new">
                    <Button className="bg-red-600 hover:bg-red-700">
                        <Plus className="w-4 h-4 mr-2" />
                        새 배너 등록
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">순서</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">이미지</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">제목 / 링크</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">상태</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {banners.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    등록된 배너가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            banners.map((banner, index) => (
                                <tr key={banner.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => handleOrderChange(index, 'up')}
                                                disabled={index === 0}
                                                className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                                            >
                                                <ArrowUp className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <button
                                                onClick={() => handleOrderChange(index, 'down')}
                                                disabled={index === banners.length - 1}
                                                className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                                            >
                                                <ArrowDown className="w-4 h-4 text-gray-600" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative w-32 h-16 rounded-lg overflow-hidden border bg-gray-100">
                                            <Image
                                                src={banner.imageUrl}
                                                alt={banner.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{banner.title}</div>
                                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                            <ExternalLink className="w-3 h-3" />
                                            <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-[200px]">
                                                {banner.linkUrl}
                                            </a>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleToggleActive(banner)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${banner.isActive
                                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                }`}
                                        >
                                            {banner.isActive ? "노출중" : "숨김"}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/banners/${banner.id}/edit`}>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <Edit className="w-4 h-4 text-gray-500" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                                onClick={() => handleDelete(banner.id, banner.imageUrl)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
