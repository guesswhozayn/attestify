import React from 'react';
import StatCard from '../shared/StatCard';
import { Shield, Activity, Users, Building } from 'lucide-react';

const StudentStats = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
                label="Owned Credentials" 
                value={stats.total || 0} 
                icon={Shield} 
                subtext="Total records"
                gradient="from-indigo-500/10 to-purple-500/5"
                iconBg="bg-indigo-500/20"
                delay={0}
            />
            <StatCard 
                label="Active Status" 
                value={stats.active || 0} 
                icon={Activity} 
                subtext="Currently valid"
                gradient="from-emerald-500/10 to-teal-500/5"
                iconBg="bg-emerald-500/20"
                delay={0.1}
            />
            <StatCard 
                label="Soulbound Tokens" 
                value={stats.sbtCount || 0} 
                icon={Users} 
                subtext="Permanent (SBT)"
                gradient="from-purple-500/10 to-pink-500/5"
                iconBg="bg-purple-500/20"
                delay={0.2}
            />
            <StatCard 
                label="Issuing Institutions" 
                value={stats.uniqueIssuers || 0} 
                icon={Building} 
                subtext="Trusted sources"
                gradient="from-blue-500/10 to-cyan-500/5"
                iconBg="bg-blue-500/20"
                delay={0.3}
            />
        </div>
    );
};

export default StudentStats;
