"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { subscribeToNotifications, markNotificationAsRead } from "@/lib/db/notifications";
import { Notification } from "@/types/custom-features";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export function NotificationList() {
    const { user } = useAuthStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!user) return;

        const unsubscribe = subscribeToNotifications(user.uid, (data) => {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        }, (error) => {
            console.error("Notification subscription error:", error);
            // Optionally set an error state or ignore
        });

        return () => unsubscribe();
    }, [user]);

    const handleMarkAsRead = async (notification: Notification) => {
        if (!notification.isRead) {
            await markNotificationAsRead(notification.id);
        }
    };

    if (!user) return null;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-gray-600" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-600 text-[10px] font-bold text-white flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                    <h4 className="font-semibold text-sm">알림</h4>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-gray-500">
                            새로운 알림이 없습니다.
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-red-50/50' : ''}`}
                                    onClick={() => handleMarkAsRead(notification)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notification.isRead ? 'bg-red-600' : 'bg-gray-300'}`} />
                                        <div className="flex-1 space-y-1">
                                            <p className={`text-sm ${!notification.isRead ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {format(new Date(notification.createdAt), "M월 d일 a h:mm", { locale: ko })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
