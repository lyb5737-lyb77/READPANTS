import { RecentJoinRequests } from "@/components/admin/recent-join-requests";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { RecentMembers } from "@/components/admin/recent-members";
import { JoinCalendar } from "@/components/admin/join-calendar";

export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">대시보드</h2>

            {/* Stats Overview */}
            <DashboardStats />

            {/* Join Calendar */}
            <div className="grid gap-4">
                <JoinCalendar />
            </div>

            {/* Recent Activity Placeholder */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <RecentJoinRequests />
                <RecentMembers />
            </div>
        </div>
    );
}
