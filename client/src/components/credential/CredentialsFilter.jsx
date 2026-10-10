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
        <div className="bg-white border border-[#E8E4DC] rounded-2xl p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(28,25,23,0.03)] space-y-5">
            <div className="flex flex-col xl:flex-row gap-5 items-center justify-between">

                <div className="relative w-full xl:max-w-2xl group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-stone-400 group-focus-within:text-stone-800 transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search credentials by name, wallet, or ID..."
                        className="block w-full pl-11 pr-11 py-3 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white transition-all"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3 w-full xl:w-auto">
                    <Button
                        onClick={onRefresh}
                        loading={loading}
                        variant="outline"
                        icon={RefreshCw}
                        className="text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-50 border-stone-200 aspect-square !p-0 flex items-center justify-center w-10 h-10 shadow-2xs"
                        title="Refresh"
                    />
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-5 border-t border-[#E8E4DC]">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
                        <span className="text-xs font-semibold text-stone-600">Filters</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex p-1 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl">
                            {['all', 'TRANSCRIPT', 'CERTIFICATION'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setTypeFilter(type)}
                                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                        typeFilter === type
                                            ? 'bg-stone-900 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                                    }`}
                                >
                                    {type === 'all' ? 'All' : type === 'TRANSCRIPT' ? 'Academic' : 'Certificates'}
                                </button>
                            ))}
                        </div>

                        <div className="flex p-1 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl">
                            {['all', 'active', 'revoked'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                        statusFilter === status
                                            ? status === 'revoked'
                                                ? 'bg-[#FDF0EE] text-[#9E2D2D] border border-[#F7D4CF]'
                                                : status === 'active'
                                                ? 'bg-[#EDF5EE] text-[#25562C] border border-[#CFE6D3]'
                                                : 'bg-stone-900 text-white shadow-xs'
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
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                            Clear filters
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

CredentialsFilter.displayName = 'CredentialsFilter';
export default React.memo(CredentialsFilter);
