
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, ThumbsUp, ThumbsDown, Image as ImageIcon, MessageSquare, Search, Eye, ArrowUpDown, ChevronLeft, Trash2 } from "lucide-react";
import { LevelBadge } from "@/components/ui/level-badge";
import Link from "next/link";
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp, doc, updateDoc, increment, deleteDoc, where, arrayUnion, arrayRemove } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { formatDistanceToNow, format } from "date-fns";
import { ko } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

interface PremiumPost {
    id: string;
    title: string;
    content: string;
    authorId: string;
    authorName: string;
    authorLevel: number;
    images: string[];
    likes: number;
    dislikes: number;
    views: number;
    createdAt: any;
    likedBy: string[];
    dislikedBy: string[];
}

type SortOption = 'latest' | 'likes' | 'dislikes' | 'views';

export default function PremiumBoardPage() {
    const { user, userProfile, loading } = useAuthStore();
    const router = useRouter();
    const [posts, setPosts] = useState<PremiumPost[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [writeOpen, setWriteOpen] = useState(false);

    // View State
    const [selectedPost, setSelectedPost] = useState<PremiumPost | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>('latest');

    // Access Control
    useEffect(() => {
        if (!loading) {
            if (!user) {
                alert("로그인이 필요합니다.");
                router.push("/login");
                return;
            }
        }
    }, [user, loading, router]);

    // Fetch Posts
    const fetchPosts = async () => {
        try {
            // Basic fetch only. Client-side Search/Sort for simplicity with small dataset.
            // Production would need Firestore composite indexes for "orderBy(field) + where(search)"
            const q = query(collection(db, "premium_posts"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const postsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                title: doc.data().title || "(제목 없음)", // Retrofit
                views: doc.data().views || 0,
                ...doc.data()
            } as PremiumPost));
            setPosts(postsData);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        if (userProfile?.communityLevel && (userProfile.communityLevel >= 5 || userProfile.role === 'admin')) {
            fetchPosts();
        } else if (!loading && userProfile) {
            setPageLoading(false);
        }
    }, [userProfile, loading]);

    const hasAccess = (userProfile?.communityLevel || 0) >= 5 || userProfile?.role === 'admin';

    // Increment View Count
    const handlePostClick = async (post: PremiumPost) => {
        setSelectedPost(post);
        // Optimistic UI for list view?

        try {
            const postRef = doc(db, "premium_posts", post.id);
            await updateDoc(postRef, {
                views: increment(1)
            });
            // Update local state views
            setPosts(prev => prev.map(p => p.id === post.id ? { ...p, views: p.views + 1 } : p));
            setSelectedPost(prev => prev ? { ...prev, views: prev.views + 1 } : null);
        } catch (e) {
            console.error("Failed to increment view count", e);
        }
    };

    const handleDelete = async (postId: string) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        try {
            await deleteDoc(doc(db, "premium_posts", postId));
            alert("삭제되었습니다.");
            setSelectedPost(null);
            fetchPosts();
        } catch (error) {
            console.error("Delete error:", error);
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    // Filter & Sort Logic
    const filteredPosts = posts
        .filter(post => post.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            switch (sortBy) {
                case 'latest': return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
                case 'likes': return b.likes - a.likes;
                case 'dislikes': return b.dislikes - a.dislikes;
                case 'views': return b.views - a.views;
                default: return 0;
            }
        });

    if (loading || pageLoading) {
        return <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin h-8 w-8 text-red-600" /></div>;
    }

    if (!hasAccess) {
        return (
            <div className="container px-4 py-20 flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl">👑</span>
                </div>
                <h1 className="text-3xl font-bold">골드 등급 이상 전용 공간</h1>
                <p className="text-gray-600 max-w-md">
                    'VIP 정보 나눔터'는 커뮤니티 활동을 열심히 해주신 골드(Lv.5) 등급 이상 회원님들만 이용하실 수 있는 프리미엄 공간입니다.
                </p>
                <div className="p-6 bg-gray-50 rounded-lg w-full max-w-sm">
                    <div className="text-sm font-medium text-gray-500 mb-2">나의 현재 등급</div>
                    <div className="flex justify-center mb-4">
                        <LevelBadge type="community" level={userProfile?.communityLevel || 1} size="lg" />
                    </div>
                    <Link href="/guide">
                        <Button variant="outline" className="w-full">등급 정책 보러가기</Button>
                    </Link>
                </div>
                <Button onClick={() => router.back()}>뒤로 가기</Button>
            </div>
        );
    }

    return (
        <div className="container px-4 py-8 max-w-5xl mx-auto min-h-screen">
            <div className="flex justify-between items-end mb-6 border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900">
                        <span>👑</span> VIP 골드회원 정보 나눔터
                    </h1>
                    <p className="text-gray-500 mt-1">골드 회원님들의 알짜배기 정보 공유 공간</p>
                </div>
                {!selectedPost && (
                    <WritePostDialog
                        user={user!}
                        userProfile={userProfile!}
                        onPostCreated={fetchPosts}
                        open={writeOpen}
                        onOpenChange={setWriteOpen}
                    />
                )}
            </div>

            {selectedPost ? (
                // DETAIL VIEW
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <Button
                        variant="ghost"
                        onClick={() => setSelectedPost(null)}
                        className="mb-4 pl-0 hover:pl-2 transition-all"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" /> 목록으로 돌아가기
                    </Button>

                    <Card className="overflow-hidden">
                        <CardHeader className="bg-gray-50/50 pb-4 border-b">
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-gray-900 leading-tight">{selectedPost.title}</h2>
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-medium text-gray-900">{selectedPost.authorName}</span>
                                            <LevelBadge type="community" level={selectedPost.authorLevel} size="sm" />
                                        </div>
                                        <span className="w-px h-3 bg-gray-300" />
                                        <span>{selectedPost.createdAt?.seconds ? format(new Date(selectedPost.createdAt.seconds * 1000), "yyyy.MM.dd HH:mm") : '-'}</span>
                                        <span className="w-px h-3 bg-gray-300" />
                                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {selectedPost.views}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {(user?.uid === selectedPost.authorId || userProfile?.role === 'admin') && (
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedPost.id)}>
                                            <Trash2 className="h-4 w-4 mr-1" /> 삭제
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 min-h-[300px]">
                            {/* Images */}
                            {selectedPost.images && selectedPost.images.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    {selectedPost.images.map((img, idx) => (
                                        <div key={idx} className="relative rounded-lg overflow-hidden border bg-gray-100 aspect-video">
                                            <Image
                                                src={img}
                                                alt={`첨부이미-${idx}`}
                                                fill
                                                className="object-contain"
                                                unoptimized
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Content */}
                            <div className="prose max-w-none text-gray-800 whitespace-pre-wrap leading-loose text-lg">
                                {selectedPost.content}
                            </div>
                        </CardContent>

                        {/* Vote Section */}
                        <CardFooter className="justify-center py-8 bg-gray-50 border-t">
                            <VoteButtons
                                post={selectedPost}
                                currentUserId={user!.uid}
                                onVote={(updatedPost) => {
                                    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
                                    setSelectedPost(updatedPost);
                                }}
                            />
                        </CardFooter>
                    </Card>
                </div>
            ) : (
                // LIST VIEW
                <div className="space-y-4 animate-in fade-in duration-300">
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-lg border shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium whitespace-nowrap">정렬:</span>
                            <Select value={sortBy} onValueChange={(v: SortOption) => setSortBy(v)}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="정렬" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="latest">최신순</SelectItem>
                                    <SelectItem value="views">조회순</SelectItem>
                                    <SelectItem value="likes">좋아요순</SelectItem>
                                    <SelectItem value="dislikes">싫어요순</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="relative w-full md:w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="제목 검색..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="w-[80px] text-center">번호</TableHead>
                                    <TableHead className="text-center w-[80px]">이미지</TableHead>
                                    <TableHead className="w-[50%] md:w-auto">제목</TableHead>
                                    <TableHead className="text-center w-[120px]">글쓴이</TableHead>
                                    <TableHead className="text-center w-[100px]">날짜</TableHead>
                                    <TableHead className="text-center w-[80px]">조회</TableHead>
                                    <TableHead className="text-center w-[80px]">추천</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPosts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-40 text-center text-gray-500">
                                            게시글이 없습니다.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPosts.map((post, index) => (
                                        <TableRow key={post.id} className="hover:bg-gray-50 cursor-pointer group" onClick={() => handlePostClick(post)}>
                                            <TableCell className="text-center font-medium text-gray-500">
                                                {posts.length - index} {/* 역순 번호 (전체 기준 아님, 필터링 시 주의, 여기선 단순 표시) */}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {post.images && post.images.length > 0 ? (
                                                    <div className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded text-gray-500">
                                                        <ImageIcon className="h-4 w-4" />
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-300">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                                                    {post.title}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <span className="text-sm text-gray-900">{post.authorName}</span>
                                                    <LevelBadge type="community" level={post.authorLevel} size="sm" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center text-sm text-gray-500 whitespace-nowrap">
                                                {post.createdAt?.seconds ? format(new Date(post.createdAt.seconds * 1000), "MM.dd") : "-"}
                                            </TableCell>
                                            <TableCell className="text-center text-sm text-gray-600">
                                                {post.views}
                                            </TableCell>
                                            <TableCell className="text-center text-sm">
                                                {post.likes > 0 ? <span className="text-red-500 font-bold">{post.likes}</span> : <span className="text-gray-400">0</span>}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
}

function VoteButtons({ post, currentUserId, onVote }: { post: PremiumPost, currentUserId: string, onVote: (p: PremiumPost) => void }) {
    const [voting, setVoting] = useState(false);

    const handleVote = async (type: 'like' | 'dislike') => {
        if (voting) return;

        // Check if already voted
        if (post.likedBy?.includes(currentUserId) || post.dislikedBy?.includes(currentUserId)) {
            alert("이미 평가하셨습니다.");
            return;
        }

        setVoting(true);
        try {
            const postRef = doc(db, "premium_posts", post.id);
            const field = type === 'like' ? 'likes' : 'dislikes';
            const listField = type === 'like' ? 'likedBy' : 'dislikedBy';

            await updateDoc(postRef, {
                [field]: increment(1),
                [listField]: arrayUnion(currentUserId)
            });

            // Optimistic update
            const updatedPost = {
                ...post,
                [field]: post[field] + 1,
                [listField]: [...(post[listField as keyof PremiumPost] as string[] || []), currentUserId]
            };
            onVote(updatedPost);
        } catch (error) {
            console.error("Vote error", error);
            alert("오류가 발생했습니다.");
        } finally {
            setVoting(false);
        }
    };

    return (
        <div className="flex gap-4">
            <Button
                variant="outline"
                size="lg"
                className="gap-2 min-w-[100px] border-blue-200 hover:bg-blue-50 text-blue-600"
                onClick={(e) => { e.stopPropagation(); handleVote('like'); }}
                disabled={voting || post.likedBy?.includes(currentUserId) || post.dislikedBy?.includes(currentUserId)}
            >
                <ThumbsUp className={`h-5 w-5 ${post.likedBy?.includes(currentUserId) ? "fill-current" : ""}`} />
                <span>좋아요 {post.likes}</span>
            </Button>
            <Button
                variant="outline"
                size="lg"
                className="gap-2 min-w-[100px] border-red-200 hover:bg-red-50 text-red-600"
                onClick={(e) => { e.stopPropagation(); handleVote('dislike'); }}
                disabled={voting || post.likedBy?.includes(currentUserId) || post.dislikedBy?.includes(currentUserId)}
            >
                <ThumbsDown className={`h-5 w-5 ${post.dislikedBy?.includes(currentUserId) ? "fill-current" : ""}`} />
                <span>싫어요 {post.dislikes}</span>
            </Button>
        </div>
    );
}

function WritePostDialog({ user, userProfile, onPostCreated, open, onOpenChange }: any) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const { toast } = useToast(); // Assuming standard toast hook or alert

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImages(prev => [...prev, ...files]);

            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviews(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            alert("제목과 내용을 모두 입력해주세요.");
            return;
        }
        setUploading(true);
        try {
            const imageUrls: string[] = [];

            // Upload Images
            if (images.length > 0) {
                for (const file of images) {
                    const storageRef = ref(storage, `premium/${user.uid}/${Date.now()}_${file.name}`);
                    await uploadBytes(storageRef, file);
                    const url = await getDownloadURL(storageRef);
                    imageUrls.push(url);
                }
            }

            // Save Post
            await addDoc(collection(db, "premium_posts"), {
                title,
                content,
                authorId: user.uid,
                authorName: userProfile.nickname || user.displayName,
                authorLevel: userProfile.communityLevel || 1,
                images: imageUrls,
                likes: 0,
                dislikes: 0,
                views: 0,
                likedBy: [],
                dislikedBy: [],
                createdAt: serverTimestamp()
            });

            setTitle("");
            setContent("");
            setImages([]);
            setPreviews([]);
            onOpenChange(false);
            onPostCreated();
        } catch (error) {
            console.error("Write error:", error);
            alert("작성 중 오류가 발생했습니다.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700">
                    <MessageSquare className="mr-2 h-4 w-4" /> 글쓰기
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>새로운 정보 공유</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">제목</Label>
                        <Input
                            id="title"
                            placeholder="제목을 입력해주세요"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">내용</Label>
                        <Textarea
                            id="content"
                            placeholder="내용을 입력해주세요"
                            className="min-h-[200px]"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>이미지 첨부</Label>
                        <div className="border border-dashed rounded-lg p-4 bg-gray-50 flex flex-col items-center justify-center gap-2">
                            <input
                                type="file"
                                id="image-upload"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                            <Label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400 mb-2 hover:text-red-600 transition-colors">
                                    <ImageIcon className="h-6 w-6" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">이미지 선택하기</span>
                                <span className="text-xs text-gray-400 mt-1">({images.length}개 선택됨)</span>
                            </Label>
                        </div>
                    </div>

                    {previews.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                            {previews.map((src, idx) => (
                                <div key={idx} className="relative aspect-square">
                                    <Image src={src} alt="preview" fill className="object-cover rounded-md" unoptimized />
                                    <button
                                        onClick={() => {
                                            setImages(prev => prev.filter((_, i) => i !== idx));
                                            setPreviews(prev => prev.filter((_, i) => i !== idx));
                                        }}
                                        className="absolute -top-1 -right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
                    <Button onClick={handleSubmit} disabled={uploading} className="bg-red-600 hover:bg-red-700">
                        {uploading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                        등록하기
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Mock toast for now or remove if not used explicitly
function useToast() { return { toast: (props: any) => console.log(props) } }
