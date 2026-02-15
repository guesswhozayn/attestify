import React from 'react';
import { Search, Filter, RefreshCw, Download, Upload } from 'lucide-react';
import Button from '../shared/Button';

const CredentialsFilter = ({ 
    searchQuery, 
    setSearchQuery, 
    typeFilter, 
    setTypeFilter, 
    statusFilter, 
    setStatusFilter,
    dateRange,
    setDateRange,
    onRefresh,
    onBulkIssue
}) => {
    return (
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 backdrop-blur-sm space-y-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                
                {/* Search Bar */}
                <div className="relative w-full lg:max-w-md group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by student name, wallet address, or credential ID..."
                        className="block w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/[0.05] rounded-xl text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all focus:bg-black/40"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex w-full lg:w-auto gap-2">
                    <Button 
                        onClick={onRefresh}
                        variant="ghost" 
                        className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10"
                        title="Refresh Data"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </Button>
                    <Button 
                        onClick={onBulkIssue}
                        variant="secondary" 
                        icon={Upload}
                        className="flex-1 lg:flex-none whitespace-nowrap bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/20"
                    >
                        Bulk Issue
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2 border-t border-white/[0.05]">
                {/* Filter Label */}
                <div className="flex items-center text-sm text-gray-500 mr-2">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters:
                </div>

                {/* Type Filter */}
                <select 
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-black/20 text-gray-300 text-sm rounded-lg border border-white/[0.1] px-3 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none hover:bg-white/5 transition-colors"
                >
                    <option value="all">All Types</option>
                    <option value="TRANSCRIPT">Transcripts</option>
                    <option value="CERTIFICATION">Certificates</option>
                </select>

                {/* Status Filter */}
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-black/20 text-gray-300 text-sm rounded-lg border border-white/[0.1] px-3 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none hover:bg-white/5 transition-colors"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="revoked">Revoked</option>
                </select>

                {/* Clear Filters (Only show if filters are active) */}
                {(typeFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
                    <button 
                        onClick={() => {
                            setTypeFilter('all');
                            setStatusFilter('all');
                            setSearchQuery('');
                        }}
                        className="ml-auto text-xs text-red-400 hover:text-red-300 hover:underline px-2 py-1"
                    >
                        Clear Filters
                    </button>
                )}
            </div>
        </div>
    );
};

export default CredentialsFilter;
