import React from 'react';
import {
    ShieldAlert,
    ExternalLink,
    FileText,
    Award,
    Calendar,
    User,
    ChevronRight,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../shared/Button';
import { SkeletonTable } from '../shared/Skeleton';
import { getCredentialMeta } from '../../utils/credential';

const CredentialTableRow = React.memo(({ cred, idx, onView, onRevoke }) => {
    const isRevoked = cred.isRevoked;
    const isSBT = !!cred.tokenId;
    const isTranscript = getCredentialMeta(cred)?.isTranscript;
    const Icon = isTranscript ? FileText : Award;
    
    const accent = isTranscript ? {
        orb: 'bg-amber-500/[0.02]',
        iconBg: 'bg-stone-100 border-stone-200/80',
        iconText: 'text-stone-800'
    } : {
        orb: 'bg-stone-400/[0.02]',
        iconBg: 'bg-stone-100 border-stone-200/80',
        iconText: 'text-stone-800'
    };

    const getStatusStyles = () => {
        if (isRevoked) {
            return {
                text: 'text-rose-600',
                dot: 'bg-rose-600',
                label: 'Revoked'
            };
        }
        switch (cred.status) {
            case 'PENDING':
                return {
                    text: 'text-amber-700',
                    dot: 'bg-amber-600 animate-pulse',
                    label: 'Pending'
                };
            case 'PROCESSING':
                return {
                    text: 'text-amber-700',
                    dot: 'bg-amber-600 animate-pulse',
                    label: 'Processing'
                };
            case 'FAILED':
                return {
                    text: 'text-rose-600',
                    dot: 'bg-rose-600',
                    label: 'Failed'
                };
            case 'COMPLETED':
            default:
                return {
                    text: 'text-emerald-700',
                    dot: 'bg-emerald-600 animate-pulse',
                    label: 'Active'
                };
        }
    };
    const statusStyles = getStatusStyles();

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ delay: idx * 0.04, duration: 0.4 }}
            onClick={() => onView(cred)}
            className="group relative bg-white border border-[#E8E4DC] hover:border-stone-300 rounded-2xl p-5 lg:p-6 transition-all duration-200 cursor-pointer overflow-hidden mb-3.5 active:scale-[0.99] shadow-[0_1px_3px_rgba(28,25,23,0.02),0_4px_16px_-4px_rgba(28,25,23,0.03)] hover:shadow-[0_6px_20px_-4px_rgba(28,25,23,0.06)] hover:-translate-y-0.5"
        >
            <div className="hidden lg:flex lg:flex-row lg:items-center gap-8 relative z-10">

                <div className="lg:w-[32%] flex items-center gap-4">
                    <div className={`p-3.5 rounded-2xl ${accent.iconBg} border shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-2xs`}>
                        <Icon className={`w-6 h-6 ${accent.iconText}`} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-0.5">Credential</span>
                        <h3 className="text-base font-bold text-stone-900 truncate leading-snug group-hover:text-stone-700 transition-colors">
                            {cred.transcriptData?.program || cred.certificationData?.title || cred.courseName || cred.degreeName || 'Untitled credential'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-stone-500 font-mono">
                            <span>{cred._id ? `#${cred._id.substring(cred._id.length - 8)}` : 'ID-SYSTEM'}</span>
                            <span className="font-sans font-medium text-stone-400">• {isSBT ? 'Direct record' : 'Certificate'}</span>
                        </div>
                    </div>
                </div>

                <div className="lg:w-[23%] flex items-center gap-3.5 border-l border-stone-200/80 lg:pl-6">
                     <div className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden shrink-0">
                        {cred.studentImage ? (
                            <img src={cred.studentImage} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-4 h-4 text-stone-500" />
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-0.5">Recipient</span>
                        <span className="text-sm font-semibold text-stone-900 truncate">{cred.studentName}</span>
                        <span className="text-[11px] text-stone-500 font-mono tracking-tight mt-0.5">
                            {cred.studentWalletAddress ? `${cred.studentWalletAddress.substring(0, 8)}...${cred.studentWalletAddress.substring(36)}` : 'No wallet address'}
                        </span>
                    </div>
                </div>

                <div className="lg:w-[18%] flex flex-col items-start justify-center border-l border-stone-200/80 lg:pl-6">
                    <div className="flex flex-col items-start">
                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Date issued</span>
                        <div className="flex items-center gap-2 text-stone-700 font-medium text-xs whitespace-nowrap">
                            <Calendar className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                            {new Date(cred.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                </div>

                <div className="lg:w-[27%] flex items-center justify-end gap-5 lg:pl-6 border-l border-stone-200/80">
                    <div className={`text-xs font-medium flex items-center gap-2 shrink-0 ${statusStyles.text}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`}></div>
                        {statusStyles.label}
                    </div>

                    <div className="flex items-center gap-2">
                        {cred.transactionHash && (
                            <a
                                href={`https://sepolia.etherscan.io/tx/${cred.transactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
                                title="View on Etherscan"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}

                        {onRevoke && !cred.isRevoked && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRevoke(cred);
                                }}
                                className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                title="Revoke credential"
                            >
                                <ShieldAlert className="w-4 h-4" />
                            </button>
                        )}
                        <div className="p-2 bg-stone-100 border border-stone-200/80 rounded-xl text-stone-600 group-hover:bg-stone-900 group-hover:text-white transition-all">
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:hidden relative z-10 space-y-3.5">

                <div className="flex items-start justify-between gap-3 border-b border-stone-200/80 pb-3">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${accent.iconBg} border shrink-0`}>
                            <Icon className={`w-5 h-5 ${accent.iconText}`} />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Credential</span>
                            <h3 className="text-base font-bold text-stone-900 truncate leading-snug mt-0.5">
                                {cred.transcriptData?.program || cred.certificationData?.title || cred.courseName || cred.degreeName || 'Untitled credential'}
                            </h3>
                        </div>
                    </div>

                    <div className={`text-xs font-medium flex items-center gap-1.5 shrink-0 ${statusStyles.text}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`}></div>
                        {statusStyles.label}
                    </div>
                </div>

                <div className="flex items-center justify-between bg-stone-50 rounded-xl border border-stone-200/70 p-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden shrink-0">
                            {cred.studentImage ? (
                                <img src={cred.studentImage} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-4 h-4 text-stone-500" />
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-stone-900 truncate">{cred.studentName}</span>
                            <span className="text-[10px] text-stone-500 font-mono tracking-tight">
                                {cred.studentWalletAddress ? `${cred.studentWalletAddress.substring(0, 8)}...${cred.studentWalletAddress.substring(36)}` : 'No wallet address'}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-0.5 text-right">
                        <span className="text-[11px] font-medium text-stone-600">{isSBT ? 'Direct record' : 'Certificate'}</span>
                        <span className="text-[10px] font-mono text-stone-400">
                            #{cred._id ? cred._id.substring(cred._id.length - 6) : 'ID'}
                        </span>
                    </div>
                </div>

                <div className="pt-1 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-stone-500 font-semibold text-[10px] tracking-wider uppercase">
                        <Calendar className="w-3 h-3" />
                         {new Date(cred.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>

                    <div className="flex items-center gap-1">
                         {cred.transactionHash && (
                            <a
                                href={`https://sepolia.etherscan.io/tx/${cred.transactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                        {onRevoke && !cred.isRevoked && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRevoke(cred);
                                }}
                                className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            >
                                <ShieldAlert className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </motion.div>
    );
});
CredentialTableRow.displayName = 'CredentialTableRow';

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
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-dashed border-stone-200 shadow-xs">
                <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mb-6 border border-stone-200">
                    <FileText className="w-8 h-8 text-stone-400" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">No credentials found</h3>
                <p className="text-stone-500 max-w-sm mx-auto text-sm font-normal">
                    No credentials match your current filters.
                </p>
                <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-stone-100 border border-stone-200/80 rounded-xl text-xs font-semibold text-stone-700">
                    <Search className="w-3.5 h-3.5" />
                    Search complete
                </div>
            </div>
        );
    }

    return (
        <div className="pb-10">
            <AnimatePresence mode="popLayout">
                {credentials.map((cred, idx) => (
                    <CredentialTableRow
                        key={cred._id || idx}
                        cred={cred}
                        idx={idx}
                        onView={onView}
                        onRevoke={onRevoke}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

CredentialTable.displayName = 'CredentialTable';
export default React.memo(CredentialTable);
