
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getPost, getComments, addComment, deletePost, Post, Comment } from "@/lib/community";
import { addPoints } from "@/lib/ranking";
import { useAuthStore } from "@/lib/store/auth-store";
import { formatDistanceToNow, format } from "date-fns";
import { ko } from "date-fns/locale";

export default function PostDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submittingComment, setSubmittingComment] = useState(false);

    const { user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const [postData, commentsData] = await Promise.all([
                    getPost(id),
                    getComments(id)
                ]);
                setPost(postData);
                setComments(commentsData);
            } catch (error) {
                console.error("Failed to fetch post data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert("로그인이 필요합니다.");
            router.push("/login");
            return;
        }
        if (!newComment.trim()) return;

        setSubmittingComment(true);
        try {
            await addComment(id, newComment, user);
            await addPoints(user.uid, 'comment'); // Add points for comment
            const updatedComments = await getComments(id);
            setComments(updatedComments);
            setNewComment("");

            // Re-fetch post to update comment count if needed, or just increment locally
            const updatedPost = await getPost(id);
            if (updatedPost) setPost(updatedPost);

        } catch (error) {
            console.error("Failed to add comment", error);
            alert("댓글 작성에 실패했습니다.");
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) return;

        try {
            await deletePost(id);
            router.push("/community");
        } catch (error) {
            console.error("Failed to delete post", error);
            alert("게시글 삭제에 실패했습니다.");
        }
    };

    if (loading) return <div className="container py-10 text-center">로딩 중...</div>;
    if (!post) return <div className="container py-10 text-center">게시글을 찾을 수 없습니다.</div>;

    const isAuthor = user?.uid === post.authorId;

    return (
        <div className="container mx-auto py-10 max-w-3xl">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4 pl-0 hover:bg-transparent">
                &larr; 목록으로 돌아가기
            </Button>

            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2 break-keep">{post.title}</h1>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <div className="flex gap-4">
                        <span>{post.authorName}</span>
                        <span>{format(post.createdAt, "yyyy. MM. dd HH:mm")}</span>
                    </div>
                    {isAuthor && (
                        <Button variant="destructive" size="sm" onClick={handleDelete}>
                            삭제
                        </Button>
                    )}
                </div>
            </div>

            <Separator className="my-6" />

            <div className="min-h-[200px] whitespace-pre-wrap leading-relaxed mb-10">
                {post.content}
            </div>

            <Separator className="my-6" />

            <div className="space-y-6">
                <h3 className="text-xl font-semibold">댓글 {comments.length}</h3>

                <div className="space-y-4">
                    {comments.map((comment) => (
                        <Card key={comment.id} className="bg-muted/50">
                            <CardHeader className="py-3">
                                <div className="flex justify-between text-sm">
                                    <span className="font-semibold">{comment.authorName}</span>
                                    <span className="text-muted-foreground">
                                        {formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: ko })}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="py-2 pb-4 text-sm whitespace-pre-wrap">
                                {comment.content}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <form onSubmit={handleCommentSubmit} className="space-y-4">
                    <Textarea
                        placeholder={user ? "댓글을 입력하세요..." : "로그인이 필요합니다."}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={!user || submittingComment}
                    />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={!user || submittingComment || !newComment.trim()}>
                            댓글 작성
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
