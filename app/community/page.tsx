
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getPosts, Post } from "@/lib/community";
import { useAuthStore } from "@/lib/store/auth-store";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

export default function CommunityPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const { posts } = await getPosts();
                setPosts(posts);
            } catch (error) {
                console.error("Failed to fetch posts", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const handleWriteClick = () => {
        if (!user) {
            alert("로그인이 필요합니다.");
            router.push("/login");
            return;
        }
        router.push("/community/new");
    };

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">커뮤니티</h1>
                <Button onClick={handleWriteClick}>글쓰기</Button>
            </div>

            {loading ? (
                <div className="text-center py-10">로딩 중...</div>
            ) : posts.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    게시글이 없습니다. 첫 번째 글을 작성해보세요!
                </div>
            ) : (
                <div className="grid gap-4">
                    {posts.map((post) => (
                        <Link href={`/community/${post.id}`} key={post.id}>
                            <Card className="hover:bg-accent/5 transition-colors cursor-pointer">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl">{post.title}</CardTitle>
                                        <span className="text-sm text-muted-foreground">
                                            {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: ko })}
                                        </span>
                                    </div>
                                    <CardDescription>
                                        작성자: {post.authorName} | 댓글 {post.commentCount}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="line-clamp-2 text-muted-foreground">
                                        {post.content}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
