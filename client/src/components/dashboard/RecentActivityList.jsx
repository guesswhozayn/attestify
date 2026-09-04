import React from 'react';
import { Clock } from 'lucide-react';
import CredentialTable from '../credential/CredentialTable';

const RecentActivityList = ({ credentials, onCredentialClick, loading }) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-black/20 rounded-4xl border border-white/4 border-dashed">
                <div className="relative">
                    <div className="w-12 h-12 border-2 border-indigo-500/20 rounded-full"></div>
                    <div className="absolute top-0 w-12 h-12 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
                </div>
                <div className="text-zinc-600 text-xs font-black uppercase tracking-[0.2em] mt-6 animate-pulse">Scanning Registry...</div>
            </div>
        );
    }

    if (!credentials || credentials.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center p-20 bg-black/20 rounded-4xl border border-white/4 border-dashed text-center">
                <div className="w-16 h-16 bg-white/2 rounded-3xl flex items-center justify-center mb-6 border border-white/4">
                    <Clock className="w-8 h-8 text-zinc-700" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Registry Silent</h3>
                <p className="text-zinc-500 text-sm font-medium">No recent credentials found on our servers.</p>
             </div>
        );
    }

    return (
        <CredentialTable
            credentials={credentials}
            onView={onCredentialClick}
        />
    );
};

export default React.memo(RecentActivityList);
