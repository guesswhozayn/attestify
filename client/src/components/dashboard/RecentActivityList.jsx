import React from 'react';
import { Clock } from 'lucide-react';
import CredentialTable from '../credential/CredentialTable';
import { SkeletonTable } from '../shared/Skeleton';

const RecentActivityList = ({ credentials, onCredentialClick, loading }) => {
    if (loading) {
        return (
            <div className="py-2">
                <SkeletonTable rows={3} />
            </div>
        );
    }

    if (!credentials || credentials.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-[#E8E4DC] text-center shadow-[0_1px_3px_rgba(28,25,23,0.02)]">
                <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mb-4 border border-stone-200/80">
                    <Clock className="w-6 h-6 text-stone-500" />
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-1">No recent activity</h3>
                <p className="text-stone-500 text-sm font-normal">No credentials have been issued recently.</p>
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
