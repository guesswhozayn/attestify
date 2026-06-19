import React from 'react';
import { Search, Upload, SlidersHorizontal, X } from 'lucide-react';
import Button from '../shared/Button';
import RefreshButton from '../shared/RefreshButton';

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
        <div className="bg-[#0b0b0b]/50 border border-white/4 rounded-[2.5rem] p-6 backdrop-blur-3xl shadow-2xl space-y-6">
            <div className="flex flex-col xl:flex-row gap-6 items-center justify-between">

                <div className="relative w-full xl:max-w-2xl group">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Registry by name, wallet, or record ID..."
                        className="block w-full pl-14 pr-14 py-4 bg-white/1 border border-white/4 rounded-2xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500/30 transition-all focus:bg-white/3 shadow-inner"
                    />
                    {searchQuery && (
                        <Button
                            onClick={() => setSearchQuery('')}
                            variant="ghost"
                            rounded="full"
                            size="sm"
                            className="absolute inset-y-0 right-0 pr-6! flex items-center text-zinc-600 hover:text-white bg-transparent! border-none!"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-3 w-full xl:w-auto">
                    <RefreshButton
                        onClick={onRefresh}
                        loading={loading}
                        variant="ghost"
                        className="text-zinc-500 hover:text-white hover:bg-white/5 border border-white/4 hover:border-white/10 shadow-xl active:scale-90"
                        title="Sync Registry"
                    />

                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-white/4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/2 border border-white/4 rounded-xl">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-600" />
                        <span className="text-[11px] font-bold text-zinc-500">Active Filters</span>
                    </div>

                    <div className="flex items-center gap-3">

                        <div className="flex p-1 bg-black/40 border border-white/4 rounded-xl shadow-inner">
                            {['all', 'TRANSCRIPT', 'CERTIFICATION'].map((type) => (
                                <Button
                                    key={type}
                                    onClick={() => setTypeFilter(type)}
                                    variant={typeFilter === type ? 'primary' : 'ghost'}
                                    rounded="lg"
                                    className={`px-5 py-1 text-[11px] font-bold shadow-none! ${
                                        typeFilter === type
                                            ? 'text-white'
                                            : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                >
                                    {type === 'all' ? 'All' : type === 'TRANSCRIPT' ? 'Academic' : 'Certificates'}
                                </Button>
                            ))}
                        </div>

                        <div className="flex p-1 bg-black/40 border border-white/4 rounded-xl shadow-inner">
                            {['all', 'active', 'revoked'].map((status) => (
                                <Button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    variant={statusFilter === status ? (status === 'revoked' ? 'danger' : 'success') : 'ghost'}
                                    rounded="lg"
                                    className={`px-5 py-1 text-[11px] font-bold shadow-none! ${
                                        statusFilter === status
                                            ? 'text-white'
                                            : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {(typeFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
                        <Button
                            onClick={() => {
                                setTypeFilter('all');
                                setStatusFilter('all');
                                setSearchQuery('');
                            }}
                            variant="ghost"
                            size="sm"
                            rounded="full"
                            icon={X}
                            className="text-[11px] font-bold text-red-500/60 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/30 border-red-500/10! transition-all"
                        >
                            Clear Archive
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

CredentialsFilter.displayName = 'CredentialsFilter';
export default React.memo(CredentialsFilter);
