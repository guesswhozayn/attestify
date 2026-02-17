import { Search, RefreshCw, Upload, SlidersHorizontal, X } from 'lucide-react';
import Button from '../shared/Button';

const CredentialsFilter = ({ 
    searchQuery, 
    setSearchQuery, 
    typeFilter, 
    setTypeFilter, 
    statusFilter, 
    setStatusFilter,
    onRefresh,
    onBulkIssue
}) => {
    return (
        <div className="bg-[#0b0b0b]/50 border border-white/[0.04] rounded-[2.5rem] p-6 backdrop-blur-3xl shadow-2xl space-y-6">
            <div className="flex flex-col xl:flex-row gap-6 items-center justify-between">
                
                {/* Search Bar */}
                <div className="relative w-full xl:max-w-2xl group">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Registry by name, wallet, or record ID..."
                        className="block w-full pl-14 pr-14 py-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500/30 transition-all focus:bg-white/[0.03] shadow-inner"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-6 flex items-center text-zinc-600 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Main Actions */}
                <div className="flex items-center gap-3 w-full xl:w-auto">
                    <Button 
                        onClick={onRefresh}
                        variant="ghost" 
                        className="p-4 text-zinc-500 hover:text-white hover:bg-white/5 rounded-2xl border border-white/[0.04] hover:border-white/10 transition-all shadow-xl active:scale-90"
                        title="Sync Registry"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </Button>
                    
                    <div className="h-10 w-[1px] bg-white/5 mx-2 hidden xl:block"></div>

                    <Button 
                        onClick={onBulkIssue}
                        variant="secondary" 
                        icon={Upload}
                        className="flex-1 xl:flex-none py-4 px-8 bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700 group shadow-xl rounded-2xl"
                    >
                        <span className="font-black uppercase tracking-widest text-[11px]">Bulk Sync</span>
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-white/[0.04]">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-600" />
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active Filters</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Type Toggle */}
                        <div className="flex p-1 bg-black/40 border border-white/[0.04] rounded-xl shadow-inner">
                            {['all', 'TRANSCRIPT', 'CERTIFICATION'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setTypeFilter(type)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                        typeFilter === type 
                                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                                            : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                >
                                    {type === 'all' ? 'All' : type === 'TRANSCRIPT' ? 'Academic' : 'Certificates'}
                                </button>
                            ))}
                        </div>

                        {/* Status Toggle */}
                        <div className="flex p-1 bg-black/40 border border-white/[0.04] rounded-xl shadow-inner">
                            {['all', 'active', 'revoked'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                        statusFilter === status 
                                            ? (status === 'revoked' ? 'bg-red-500 shadow-red-500/20' : 'bg-emerald-500 shadow-emerald-500/20') + ' text-white shadow-lg'
                                            : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stats / Clear */}
                <div className="flex items-center gap-4">
                    {(typeFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
                        <button 
                            onClick={() => {
                                setTypeFilter('all');
                                setStatusFilter('all');
                                setSearchQuery('');
                            }}
                            className="flex items-center gap-2 text-[10px] font-black text-red-500/60 hover:text-red-400 uppercase tracking-widest transition-colors px-4 py-2 border border-red-500/10 hover:border-red-500/30 rounded-xl"
                        >
                            <X className="w-3.5 h-3.5" />
                            Clear Archive
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CredentialsFilter;
