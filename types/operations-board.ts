export interface OperationsPost {
    id: string;
    title: string;
    content: string;
    authorId: string;
    authorName: string;
    authorProfileUrl?: string;
    targetAdmins?: string[]; // Array of user IDs who should read this post
    images?: string[]; // Array of image URLs
    readBy: string[]; // Array of user IDs who have read this post
    createdAt: string;
    updatedAt: string;
}
