import StatCard from '../shared/StatCard';
import { Shield, Activity, Users, Filter } from 'lucide-react';

const CredentialsStats = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard
                label="Total issued"
                value={stats.total || 0}
                icon={Shield}
                subtext="All credentials"
                gradient="from-indigo-500/10 to-transparent"
                iconBg="bg-indigo-500/15"
                delay={0}
            />
            <StatCard
                label="Active"
                value={stats.active || 0}
                icon={Activity}
                subtext="Valid credentials"
                gradient="from-emerald-500/10 to-transparent"
                iconBg="bg-emerald-500/15"
                delay={0.1}
            />
            <StatCard
                label="Soulbound"
                value={stats.sbtCount || 0}
                icon={Users}
                subtext="Locked to wallet"
                gradient="from-indigo-500/10 to-transparent"
                iconBg="bg-indigo-500/15"
                delay={0.2}
            />
            <StatCard
                label="Revoked"
                value={stats.revoked || 0}
                icon={Filter}
                subtext="Revoked credentials"
                gradient="from-rose-500/10 to-transparent"
                iconBg="bg-rose-500/15"
                delay={0.3}
            />
        </div>
    );
};

export default CredentialsStats;
