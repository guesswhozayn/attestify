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
                delay={0}
            />
            <StatCard
                label="Active credentials"
                value={stats.active || 0}
                icon={Activity}
                subtext="Valid now"
                delay={0.1}
            />
            <StatCard
                label="Direct records"
                value={stats.sbtCount || 0}
                icon={Users}
                subtext="Issued directly to you"
                delay={0.2}
            />
            <StatCard
                label="Institutions"
                value={stats.uniqueIssuers || 0}
                icon={Building}
                subtext="Issuing schools"
                delay={0.3}
            />
        </div>
    );
};

export default React.memo(StudentStats);
