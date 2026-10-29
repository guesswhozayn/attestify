import React from 'react';
import {
    FileText,
    Award,
    ExternalLink,
    ShieldAlert,
    ChevronRight,
    Search
} from 'lucide-react';
import { SkeletonTable } from '../shared/Skeleton';

const CredentialTable = ({ credentials, onView, onRevoke, loading }) => {
    if (loading) {
        return (
            <div className="py-2">
                <SkeletonTable rows={5} />
            </div>
        );
    }

    if (credentials.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-stone-200">
                <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center mb-3 border border-stone-200/80 text-stone-400">
                    <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-stone-900 mb-1">No credentials found</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    No certificates match your query or selected filters.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-[#EAECF0] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="border-b border-[#F2F4F7] text-stone-400 font-medium bg-stone-50/60">
                            <th className="py-3 px-5">Student</th>
                            <th className="py-3 px-4">Credential title</th>
                            <th className="py-3 px-4">Type</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Issued date</th>
                            <th className="py-3 px-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2F4F7]">
                        {credentials.map((cred) => {
                            const id = cred._id || cred.id;
                            const isRevoked = cred.isRevoked;
                            const isTranscript = (cred.type || '').toUpperCase() === 'TRANSCRIPT';
                            const title = cred.transcriptData?.program ||
                                          cred.certificationData?.title ||
                                          cred.courseName ||
                                          cred.degreeName ||
                                          cred.title ||
                                          'Certificate of Completion';

                            return (
                                <tr
                                    key={id}
                                    onClick={() => onView(cred)}
                                    className="hover:bg-stone-50/80 transition-colors cursor-pointer group"
                                >
                                    <td className="py-3.5 px-5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800 font-semibold text-xs uppercase">
                                                {(cred.studentName || 'S')[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <span className="font-medium text-stone-900 block truncate max-w-[180px]">
                                                    {cred.studentName || 'Student'}
                                                </span>
                                                <span className="text-[10px] text-stone-400 font-mono block truncate max-w-[140px]">
                                                    {cred.studentWalletAddress
                                                        ? `${cred.studentWalletAddress.slice(0, 6)}...${cred.studentWalletAddress.slice(-4)}`
                                                        : 'On account'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="py-3.5 px-4">
                                        <span className="text-stone-700 font-medium block truncate max-w-[240px]">
                                            {title}
                                        </span>
                                    </td>

                                    <td className="py-3.5 px-4">
                                        <span className="text-stone-500 font-medium">
                                            {isTranscript ? 'Transcript' : 'Certificate'}
                                        </span>
                                    </td>

                                    <td className="py-3.5 px-4">
                                        <span className={`font-medium ${
                                            isRevoked
                                                ? 'text-rose-600'
                                                : cred.status === 'FAILED'
                                                ? 'text-rose-600'
                                                : cred.status === 'PROCESSING' || cred.status === 'PENDING'
                                                ? 'text-amber-600'
                                                : 'text-emerald-700'
                                        }`}>
                                            {isRevoked
                                                ? 'Revoked'
                                                : cred.status === 'FAILED'
                                                ? 'Failed'
                                                : cred.status === 'PROCESSING' || cred.status === 'PENDING'
                                                ? 'Processing'
                                                : 'Valid'}
                                        </span>
                                    </td>

                                    <td className="py-3.5 px-4 text-stone-500">
                                        {(cred.issueDate || cred.createdAt)
                                            ? new Date(cred.issueDate || cred.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                            : 'Recent'}
                                    </td>

                                    <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1.5">
                                            {cred.transactionHash && (
                                                <a
                                                    href={`https://sepolia.etherscan.io/tx/${cred.transactionHash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                                                    title="View on Etherscan"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                            {onRevoke && !isRevoked && cred.status === 'COMPLETED' && (
                                                <button
                                                    onClick={() => onRevoke(cred)}
                                                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                    title="Revoke credential"
                                                >
                                                    <ShieldAlert className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => onView(cred)}
                                                className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                                                title="View details"
                                            >
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default React.memo(CredentialTable);
