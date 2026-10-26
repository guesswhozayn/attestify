import React from 'react';
import { Search, X, RefreshCw } from 'lucide-react';

const CredentialsFilter = ({
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    onRefresh,
    loading = false
}) => {
    return (
        <div className="bg-white border border-[#EAECF0] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:max-w-md group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-stone-400 group-focus-within:text-stone-700 transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search student, title, or wallet..."
                        className="block w-full pl-10 pr-9 py-2 bg-stone-50 hover:bg-white focus:bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400 transition-all"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-3 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                    <div className="flex p-0.5 bg-stone-100 rounded-xl border border-stone-200/60">
                        {['all', 'TRANSCRIPT', 'CERTIFICATION'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                                    typeFilter === type
                                        ? 'bg-white text-stone-900 shadow-xs'
                                        : 'text-stone-600 hover:text-stone-900'
                                }`}
                            >
                                {type === 'all' ? 'All types' : type === 'TRANSCRIPT' ? 'Transcripts' : 'Certificates'}
                            </button>
                        ))}
                    </div>

                    <div className="flex p-0.5 bg-stone-100 rounded-xl border border-stone-200/60">
                        {['all', 'active', 'revoked'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                                    statusFilter === status
                                        ? 'bg-white text-stone-900 shadow-xs'
                                        : 'text-stone-600 hover:text-stone-900'
                                }`}
                            >
                                {status === 'all' ? 'All status' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={onRefresh}
                        disabled={loading}
                        className="p-2 rounded-xl bg-white border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors shadow-2xs"
                        title="Refresh list"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-stone-900' : ''}`} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CredentialsFilter;
