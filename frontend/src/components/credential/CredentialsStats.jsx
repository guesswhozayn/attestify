import React from 'react';
import StatCard from '../shared/StatCard';
import { Shield, Activity, Users, Filter } from 'lucide-react';

const CredentialsStats = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
                label="Total Issued" 
                value={stats.total || 0} 
                icon={Shield} 
                subtext="All time credentials"
                gradient="from-indigo-500/10 to-purple-500/5"
                iconBg="bg-indigo-500/20"
                delay={0}
            />
            <StatCard 
                label="Active" 
                value={stats.active || 0} 
                icon={Activity} 
                subtext="Valid status"
                gradient="from-emerald-500/10 to-teal-500/5"
                iconBg="bg-emerald-500/20"
                delay={0.1}
            />
            <StatCard 
                label="Soulbound" 
                value={stats.sbtCount || 0} 
                icon={Users} 
                subtext="Permanent (SBT)"
                gradient="from-purple-500/10 to-pink-500/5"
                iconBg="bg-purple-500/20"
                delay={0.2}
            />
            <StatCard 
                label="Revoked" 
                value={stats.revoked || 0} 
                icon={Filter} 
                subtext="Revocation list"
                gradient="from-red-500/10 to-orange-500/5"
                iconBg="bg-red-500/20"
                delay={0.3}
            />
        </div>
    );
};

export default CredentialsStats;
