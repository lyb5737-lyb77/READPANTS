'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getOperationsPost, markAsRead, deleteOperationsPost } from '@/lib/db/operations-board';
import { getUsers } from '@/lib/db/users';
import { OperationsPost } from '@/types/operations-board';
import { useAuthStore } from '@/lib/store/auth-store';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ArrowLeft, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface UserProfile {
    uid: string;
    nickname?: string;
    profileImageUrl?: string;
}

export default function OperationsPostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const [post, setPost] = useState<OperationsPost | null>(null);
    const [readers, setReaders] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const id = params.id as string;
            if (!id) return;

            const postData = await getOperationsPost(id);
            setPost(postData);

            if (postData && user) {
                // Mark as read if not already read
                if (!postData.readBy.includes(user.uid)) {
                    await markAsRead(id, user.uid);
                    postData.readBy.push(user.uid);
                }

                // Fetch reader profiles
                try {
                    const allUsers = await getUsers();
                    const readerProfiles = allUsers.filter(u => postData.readBy.includes(u.uid));
                    setReaders(readerProfiles as UserProfile[]);
                } catch (error) {
                    console.error('Failed to fetch readers:', error);
                }
            }

            setLoading(false);
        };

        fetchData();
    }, [params.id, user]);

    const handleDelete = async () => {
        if (!post) return;
        if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) return;

        try {
            await deleteOperationsPost(post.id);
            toast.success('게시글이 삭제되었습니다.');
            router.push('/admin/operations');
        } catch (error) {
            console.error('Failed to delete post:', error);
            toast.error('게시글 삭제에 실패했습니다.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="p-6">
                <p className="text-center text-gray-500">게시글을 찾을 수 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    목록으로
                </Button>
                {user?.uid === post.authorId && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDelete}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        삭제
                    </Button>
                )}
            </div>

            <div className="bg-white rounded-lg shadow border p-6 md:p-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="border-b pb-4 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">{post.title}</h1>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                            <span className="font-medium text-gray-700">{post.authorName}</span>
                            <span>
                                {formatDistanceToNow(new Date(post.createdAt), {
                                    addSuffix: true,
                                    locale: ko,
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="prose max-w-none mb-8">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {post.content}
                    </div>
                </div>

                {/* Images */}
                {post.images && post.images.length > 0 && (
                    <div className="border-t pt-6 mb-8">
                        <h2 className="text-sm font-semibold text-gray-900 mb-3">첨부 이미지</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {post.images.map((imageUrl, index) => (
                                <div key={index} className="relative aspect-square">
                                    <Image
                                        src={imageUrl}
                                        alt={`첨부 이미지 ${index + 1}`}
                                        fill
                                        className="object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => window.open(imageUrl, '_blank')}
                                        unoptimized
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Read Status */}
                <div className="border-t pt-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-3">
                        읽은 사람 ({readers.length}명)
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {readers.map((reader) => (
                            <div
                                key={reader.uid}
                                className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-2"
                                title={reader.nickname || '관리자'}
                            >
                                {reader.profileImageUrl ? (
                                    <Image
                                        src={reader.profileImageUrl}
                                        alt={reader.nickname || '프로필'}
                                        width={24}
                                        height={24}
                                        className="w-6 h-6 rounded-full object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                                        <User className="w-4 h-4 text-gray-600" />
                                    </div>
                                )}
                                <span className="text-sm text-gray-700">{reader.nickname || '관리자'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
