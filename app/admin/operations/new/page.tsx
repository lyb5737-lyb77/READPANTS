'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { createOperationsPost } from '@/lib/db/operations-board';
import { getUsers } from '@/lib/db/users';
import { useAuthStore } from '@/lib/store/auth-store';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ArrowLeft, Loader2, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface AdminUser {
    uid: string;
    nickname?: string;
    email?: string;
    role?: string;
}

export default function NewOperationsPostPage() {
    const router = useRouter();
    const { user, userProfile } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [selectedAdmins, setSelectedAdmins] = useState<string[]>([]);
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [uploadingImages, setUploadingImages] = useState(false);

    useEffect(() => {
        const fetchAdmins = async () => {
            const allUsers = await getUsers();
            const adminUsers = allUsers.filter(u => u.role === 'admin');
            setAdmins(adminUsers as AdminUser[]);
        };
        fetchAdmins();
    }, []);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + images.length > 5) {
            toast.warning('최대 5개의 이미지만 업로드할 수 있습니다.');
            return;
        }

        setImages(prev => [...prev, ...files]);

        // Create previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleAdminToggle = (adminId: string) => {
        setSelectedAdmins(prev =>
            prev.includes(adminId)
                ? prev.filter(id => id !== adminId)
                : [...prev, adminId]
        );
    };

    const uploadImages = async (): Promise<string[]> => {
        if (images.length === 0) return [];

        setUploadingImages(true);
        const uploadedUrls: string[] = [];

        try {
            for (const image of images) {
                const fileName = `operations/${Date.now()}_${image.name}`;
                const storageRef = ref(storage, fileName);
                await uploadBytes(storageRef, image);
                const url = await getDownloadURL(storageRef);
                uploadedUrls.push(url);
            }
        } catch (error) {
            console.error('Failed to upload images:', error);
            throw error;
        } finally {
            setUploadingImages(false);
        }

        return uploadedUrls;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error('로그인이 필요합니다.');
            return;
        }

        if (!title.trim() || !content.trim()) {
            toast.warning('제목과 내용을 입력해주세요.');
            return;
        }

        setLoading(true);

        try {
            // Upload images first
            const imageUrls = await uploadImages();

            await createOperationsPost({
                title,
                content,
                authorId: user.uid,
                authorName: userProfile?.nickname || user.displayName || '관리자',
                authorProfileUrl: userProfile?.profileImageUrl,
                targetAdmins: selectedAdmins.length > 0 ? selectedAdmins : undefined,
                images: imageUrls.length > 0 ? imageUrls : undefined,
            });

            toast.success('게시글이 등록되었습니다.');
            router.push('/admin/operations');
        } catch (error) {
            console.error('Failed to create post:', error);
            toast.error('게시글 등록에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="-ml-2"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    돌아가기
                </Button>
                <h1 className="text-xl font-bold ml-auto">새 게시글 작성</h1>
            </div>

            <div className="bg-white rounded-lg shadow border p-6 max-w-3xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">제목 <span className="text-red-500">*</span></Label>
                        <Input
                            id="title"
                            placeholder="게시글 제목을 입력하세요"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">내용 <span className="text-red-500">*</span></Label>
                        <Textarea
                            id="content"
                            placeholder="게시글 내용을 입력하세요"
                            className="min-h-[300px] resize-none"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        />
                    </div>

                    {/* Admin Selection */}
                    <div className="space-y-2">
                        <Label>읽어야 할 관리자 선택 (선택 안 하면 전체 공개)</Label>
                        <div className="border rounded-lg p-4 max-h-[200px] overflow-y-auto space-y-2">
                            {admins.map(admin => (
                                <div key={admin.uid} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={admin.uid}
                                        checked={selectedAdmins.includes(admin.uid)}
                                        onCheckedChange={() => handleAdminToggle(admin.uid)}
                                    />
                                    <label
                                        htmlFor={admin.uid}
                                        className="text-sm cursor-pointer flex-1"
                                    >
                                        {admin.nickname || admin.email}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label>이미지 첨부 (최대 5개)</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageSelect}
                                className="hidden"
                                id="image-upload"
                                disabled={images.length >= 5}
                            />
                            <label
                                htmlFor="image-upload"
                                className={`flex flex-col items-center justify-center cursor-pointer ${images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500">
                                    클릭하여 이미지 선택 ({images.length}/5)
                                </span>
                            </label>
                        </div>

                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 mt-3">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <Image
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            width={200}
                                            height={200}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            취소
                        </Button>
                        <Button
                            type="submit"
                            className="bg-red-600 hover:bg-red-700"
                            disabled={loading || uploadingImages}
                        >
                            {loading || uploadingImages ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {uploadingImages ? '이미지 업로드 중...' : '등록 중...'}
                                </>
                            ) : (
                                '등록하기'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
