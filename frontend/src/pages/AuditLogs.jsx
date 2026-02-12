import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { FileText, Activity, Clock, Filter, Search, Zap, Coins } from 'lucide-react';
import { auditAPI } from '../services/api';
import InstituteLogTable from '../components/institute/InstituteLogTable';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const AuditLogs = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [searchQuery, setSearchQuery] = useState('');

  const isMounted = React.useRef(true);

  useEffect(() => {
    isMounted.current = true;
    fetchData();
    return () => { isMounted.current = false; };
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Get Stats
      const statsResponse = await auditAPI.getDashboardStats({ period });
      if (isMounted.current) {
         setStats(statsResponse.data.stats);
      }
      
      // Get Recent Logs (Filter for only Issuance and Revocation events)
      const logsResponse = auditAPI.getLogs 
        ? await auditAPI.getLogs({ 
            limit: 50,
            action: ['CREDENTIAL_ISSUED', 'CREDENTIAL_REVOKED'],
            search: searchQuery // Pass search query to API
          }) 
        : { data: { logs: [] } };
      
      if (isMounted.current) {
         setLogs(logsResponse.data.logs || []);
      }

    } catch (error) {
       if (isMounted.current) {
           console.error('Failed to fetch audit data', error);
       }
    } finally {
       if (isMounted.current) {
           setLoading(false);
       }
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-12">
      <Header title="Audit & Analytics" showSearch={false} />

      <main className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header & Period Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
             <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Certificate Activity
             </h1>
             <p className="text-gray-400 mt-1">
                Monitor issuance, revocation, and blockchain metrics.
             </p>
          </div>
          
          <div className="bg-gray-900/50 p-1 rounded-lg border border-gray-800 flex space-x-1">
            {['week', 'month', 'year', 'all'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 capitalize ${
                  period === p 
                    ? 'bg-gray-800 text-white shadow-sm border border-gray-700' 
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
             title="Issued"
             value={stats?.totalCertificates || '0'}
             subtitle={`In selected ${period}`}
             icon={FileText}
             color="blue"
          />
          <StatCard 
             title="Revocations"
             value={stats?.totalRevocations || '0'}
             subtitle="Security actions"
             icon={Activity}
             color="red"
          />
          <StatCard 
             title="Gas Used"
             value={stats?.totalGasUsed ? parseFloat(stats.totalGasUsed).toLocaleString() : '0'}
             subtitle="Units of gas"
             icon={Zap}
             color="amber"
          />
          <StatCard 
             title="Total Cost"
             value={`${stats?.totalCostEth || '0.00'} ETH`}
             subtitle="Blockchain fees"
             icon={Coins}
             color="purple"
          />
        </div>

        {/* Recent Activity Section */}
        <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm">
           <div className="p-6 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-xl font-semibold flex items-center">
                 <Clock className="w-5 h-5 mr-3 text-gray-400" />
                 Recent Logs
              </h3>
              <div className="flex items-center space-x-3">
                 <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Search Wallet Address..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                      className="bg-gray-950 border border-gray-800 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-indigo-500 w-full sm:w-64 transition-colors"
                    />
                 </div>
                 <button 
                   onClick={fetchData}
                   className="p-2 bg-gray-950 border border-gray-800 rounded-lg text-gray-400 hover:text-white hover:border-gray-700 transition-colors"
                 >
                    <Filter className="w-4 h-4" />
                 </button>
              </div>
           </div>
           
           <div className="p-0">
              <InstituteLogTable logs={logs} loading={loading} />
           </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => {
  const colorStyles = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/40",
    red: "text-red-400 bg-red-500/10 border-red-500/20 group-hover:border-red-500/40",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20 group-hover:border-amber-500/40",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20 group-hover:border-purple-500/40",
  };

  const style = colorStyles[color] || colorStyles.blue;

  return (
    <div className={`group relative p-6 rounded-2xl bg-gray-900/50 border transition-all duration-300 hover:-translate-y-1 ${style.split(' ').slice(2).join(' ')} border-gray-800`}>
      <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
         <Icon className="w-24 h-24" />
      </div>
      
      <div className="relative z-10 flex flex-col h-full justify-between">
         <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2.5 rounded-lg ${style.split(' ').slice(1, 2).join(' ')} ${style.split(' ').slice(0, 1).join(' ')}`}>
               <Icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-400 tracking-wide">{title}</span>
         </div>
         
         <div>
            <div className="text-2xl font-bold text-white mb-1 tracking-tight truncate" title={value}>{value}</div>
            <div className={`text-xs font-medium ${style.split(' ').slice(0, 1).join(' ')} opacity-80`}>
               {subtitle}
            </div>
         </div>
      </div>
    </div>
  );
};

export default AuditLogs;
