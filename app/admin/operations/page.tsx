'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getOperationsPosts, deleteOperationsPost } from '@/lib/db/operations-board';
import { OperationsPost } from '@/types/operations-board';
import { useAuthStore } from '@/lib/store/auth-store';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function OperationsBoardPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [posts, setPosts] = useState<OperationsPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, [user]);

    const fetchPosts = async () => {
        setLoading(true);
        const data = await getOperationsPosts();
        // Filter posts: show if no targetAdmins or if current user is in targetAdmins
        const filteredData = data.filter(post =>
            !post.targetAdmins ||
            post.targetAdmins.length === 0 ||
            (user && post.targetAdmins.includes(user.uid))
        );
        setPosts(filteredData);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) return;

        try {
            await deleteOperationsPost(id);
            toast.success('게시글이 삭제되었습니다.');
            fetchPosts();
        } catch (error) {
            console.error('Failed to delete post:', error);
            toast.error('게시글 삭제에 실패했습니다.');
        }
    };

    const isUnread = (post: OperationsPost) => {
        return user ? !post.readBy.includes(user.uid) : false;
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">운영 게시판</h1>
                    <p className="text-sm text-gray-500 mt-1">관리자 간 정보 공유 및 히스토리 관리</p>
                </div>
                <Button
                    onClick={() => router.push('/admin/operations/new')}
                    className="bg-red-600 hover:bg-red-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    새 게시글
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg border">
                    <p className="text-gray-500">등록된 게시글이 없습니다.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                    순번
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                    날짜
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                    작성자
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    제목
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                    읽음
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                    작업
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {posts.map((post, index) => {
                                const unread = isUnread(post);
                                return (
                                    <tr
                                        key={post.id}
                                        onClick={() => router.push(`/admin/operations/${post.id}`)}
                                        className={`cursor-pointer transition-colors ${unread ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {posts.length - index}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDistanceToNow(new Date(post.createdAt), {
                                                addSuffix: true,
                                                locale: ko,
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {post.authorName}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                {unread && (
                                                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                                                )}
                                                <span className={`${unread ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                                                    {post.title}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {unread ? (
                                                <EyeOff className="w-4 h-4 text-gray-400 mx-auto" />
                                            ) : (
                                                <Eye className="w-4 h-4 text-green-500 mx-auto" />
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {user?.uid === post.authorId && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(post.id);
                                                    }}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
