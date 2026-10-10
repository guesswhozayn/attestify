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
                delay={0}
            />
            <StatCard
                label="Active"
                value={stats.active || 0}
                icon={Activity}
                subtext="Valid credentials"
                delay={0.1}
            />
            <StatCard
                label="Direct records"
                value={stats.sbtCount || 0}
                icon={Users}
                subtext="Issued to recipients"
                delay={0.2}
            />
            <StatCard
                label="Revoked"
                value={stats.revoked || 0}
                icon={Filter}
                subtext="Revoked credentials"
                delay={0.3}
            />
        </div>
    );
};

export default CredentialsStats;
