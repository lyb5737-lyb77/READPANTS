export interface Notification {
    id: string;
    userId: string;
    message: string;
    isRead: boolean;
    type: 'notice' | 'reply';
    createdAt: string; // ISO string
    relatedId?: string; // ID of the related custom request or other entity
}

export interface CustomRequest {
    id: string;
    userId: string;
    userEmail?: string; // For display convenience
    userName?: string; // For display convenience
    courseName: string;
    date: string;
    time: string;
    people: string;
    memo: string;
    status: 'pending' | 'replied' | 'completed';
    createdAt: string; // ISO string
    replyMessage?: string; // Optional: store reply directly or link via notification
}
