import StatCard from '../shared/StatCard';
import { Award, CheckCircle2, AlertTriangle } from 'lucide-react';

const CredentialsStats = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
                label="Total issued"
                value={stats.total ?? 0}
                icon={Award}
                subtext="All certificates"
                delay={0}
            />
            <StatCard
                label="Active"
                value={stats.active ?? 0}
                icon={CheckCircle2}
                subtext="Valid and verifiable"
                delay={0.05}
            />
            <StatCard
                label="Revoked"
                value={stats.revoked ?? 0}
                icon={AlertTriangle}
                subtext="Inactive credentials"
                delay={0.1}
            />
        </div>
    );
};

export default CredentialsStats;
