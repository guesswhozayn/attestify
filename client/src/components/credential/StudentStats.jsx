import React from 'react';
import StatCard from '../shared/StatCard';
import { Shield, Activity, Users, Building } from 'lucide-react';

const StudentStats = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard
                label="Total credentials"
                value={stats.total || 0}
                icon={Shield}
                subtext="All credentials"
                gradient="from-indigo-500/10 to-transparent"
                iconBg="bg-indigo-500/15"
                delay={0}
            />
            <StatCard
                label="Active credentials"
                value={stats.active || 0}
                icon={Activity}
                subtext="Valid now"
                gradient="from-emerald-500/10 to-transparent"
                iconBg="bg-emerald-500/15"
                delay={0.1}
            />
            <StatCard
                label="Soulbound credentials"
                value={stats.sbtCount || 0}
                icon={Users}
                subtext="Locked to your wallet"
                gradient="from-indigo-500/10 to-transparent"
                iconBg="bg-indigo-500/15"
                delay={0.2}
            />
            <StatCard
                label="Institutions"
                value={stats.uniqueIssuers || 0}
                icon={Building}
                subtext="Issuing schools"
                gradient="from-slate-500/10 to-transparent"
                iconBg="bg-slate-500/15"
                delay={0.3}
            />
        </div>
    );
};

export default React.memo(StudentStats);
