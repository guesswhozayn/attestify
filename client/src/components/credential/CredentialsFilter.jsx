import React from 'react';
import { Search, SlidersHorizontal, X, RefreshCw } from 'lucide-react';
import Button from '../shared/Button';

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
        <div className="bg-white border border-[#EAECF0] rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(16,24,40,0.02)] space-y-5">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">

                <div className="relative w-full sm:max-w-xl group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-stone-400 group-focus-within:text-stone-800 transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search credentials by student name, wallet address, or ID..."
                        className="block w-full pl-10 pr-10 py-2.5 bg-[#F8F9FA] hover:bg-white focus:bg-white border border-stone-200/80 rounded-xl text-xs font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400/20 focus:border-stone-400 transition-all shadow-2xs"
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

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button
                        onClick={onRefresh}
                        loading={loading}
                        variant="outline"
                        icon={RefreshCw}
                        className="text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-50 border-[#EAECF0] rounded-xl px-3 py-2 text-xs font-semibold shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                        <span>Refresh</span>
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-[#F2F4F7]">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Filter</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="flex p-1 bg-[#F8F9FA] border border-[#EAECF0] rounded-xl">
                            {['all', 'TRANSCRIPT', 'CERTIFICATION'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setTypeFilter(type)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                        typeFilter === type
                                            ? 'bg-stone-900 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                                    }`}
                                >
                                    {type === 'all' ? 'All' : type === 'TRANSCRIPT' ? 'Academic' : 'Certificates'}
                                </button>
                            ))}
                        </div>

                        <div className="flex p-1 bg-[#F8F9FA] border border-[#EAECF0] rounded-xl">
                            {['all', 'active', 'revoked'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                        statusFilter === status
                                            ? 'bg-stone-900 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                                    }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {(typeFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
                        <button
                            type="button"
                            onClick={() => {
                                setTypeFilter('all');
                                setStatusFilter('all');
                                setSearchQuery('');
                            }}
                            className="flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                            <span>Reset</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

CredentialsFilter.displayName = 'CredentialsFilter';
export default React.memo(CredentialsFilter);
