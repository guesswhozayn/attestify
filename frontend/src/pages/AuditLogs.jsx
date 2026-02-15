import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Activity, Clock, Filter, Search, Zap, Coins } from 'lucide-react';
import { auditAPI } from '../services/api';
import IssuerLogTable from '../components/issuer/IssuerLogTable';

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
      const statsResponse = await auditAPI.getDashboardStats({ period });
      if (isMounted.current) {
         setStats(statsResponse.data.stats);
      }
      
      const logsResponse = auditAPI.getLogs 
        ? await auditAPI.getLogs({ 
            limit: 50,
            action: ['CREDENTIAL_ISSUED', 'CREDENTIAL_REVOKED'],
            search: searchQuery
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
    <div className="min-h-screen bg-transparent text-gray-100 pb-20">


      <main className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
        
        {/* Header & Period Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div className="relative">
             <div className="absolute -left-4 top-0 w-1 h-full bg-indigo-500 rounded-full hidden md:block"></div>
             <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
                Credential Activity
             </h1>
             <p className="text-gray-400 max-w-xl">
                Monitor real-time issuance, revocation events, and blockchain gas metrics.
             </p>
          </div>
          
          <div className="bg-white/[0.03] p-1.5 rounded-xl border border-white/[0.08] flex space-x-1 backdrop-blur-xl">
            {['week', 'month', 'year', 'all'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 capitalize ${
                  period === p 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-gray-500 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard 
             title="Issued"
             value={stats?.totalCertificates || '0'}
             subtitle={`In selected ${period}`}
             icon={FileText}
             color="blue"
             delay={0.2}
          />
          <StatCard 
             title="Revocations"
             value={stats?.totalRevocations || '0'}
             subtitle="Security actions"
             icon={Activity}
             color="red"
             delay={0.3}
          />
          <StatCard 
             title="Gas Used"
             value={stats?.totalGasUsed ? parseFloat(stats.totalGasUsed).toLocaleString() : '0'}
             subtitle="Units of gas"
             icon={Zap}
             color="amber"
             delay={0.4}
          />
          <StatCard 
             title="Total Cost"
             value={`${stats?.totalCostEth || '0.00'} ETH`}
             subtitle="Blockchain fees"
             icon={Coins}
             color="purple"
             delay={0.5}
          />
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="space-y-6"
        >
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02] p-2 rounded-2xl border border-white/[0.05] backdrop-blur-sm">
              <div className="flex items-center px-4 py-2">
                 <Clock className="w-5 h-5 mr-3 text-indigo-400" />
                 <h3 className="text-lg font-semibold text-white">Recent Logs</h3>
              </div>
              
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                 <div className="relative flex-1 sm:flex-none sm:w-80 group">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Search Wallet Address..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                      className="w-full bg-black/20 border border-white/[0.05] text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-gray-100 placeholder-gray-500"
                    />
                 </div>
                 <button 
                   onClick={fetchData}
                   className="p-2.5 bg-black/20 border border-white/[0.05] rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all"
                 >
                    <Filter className="w-4 h-4" />
                 </button>
              </div>
           </div>
           
           <div className="bg-white/[0.01] border border-white/[0.05] rounded-3xl overflow-hidden backdrop-blur-sm">
              <IssuerLogTable logs={logs} loading={loading} />
           </div>
        </motion.div>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon: Icon, color, delay = 0 }) => {
  const colorStyles = {
    blue: { text: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", gradient: "from-indigo-600/10 to-transparent" },
    red: { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", gradient: "from-red-600/10 to-transparent" },
    amber: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", gradient: "from-amber-600/10 to-transparent" },
    purple: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", gradient: "from-purple-600/10 to-transparent" },
  };

  const style = colorStyles[color] || colorStyles.blue;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={`group relative p-6 rounded-3xl bg-gray-900/40 border border-white/[0.06] backdrop-blur-xl hover:bg-white/[0.03] transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl overflow-hidden`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
      <div className={`absolute -right-6 -top-6 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 transform group-hover:rotate-12`}>
         <Icon className="w-32 h-32" />
      </div>
      
      <div className="relative z-10 flex flex-col h-full justify-between">
         <div className="flex items-center space-x-3 mb-6">
            <div className={`p-3 rounded-2xl ${style.bg} ${style.border} border backdrop-blur-sm shadow-inner`}>
               <Icon className={`w-5 h-5 ${style.text}`} />
            </div>
            <span className="text-xs font-semibold text-gray-400 tracking-widest uppercase">{title}</span>
         </div>
         
         <div>
            <div className="text-3xl font-bold text-white mb-1 tracking-tight truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all duration-300" title={value}>{value}</div>
            <div className={`text-xs font-medium ${style.text} opacity-80 flex items-center`}>
               <div className={`w-1.5 h-1.5 rounded-full ${style.bg.replace('/10', '')} mr-2`}></div>
               {subtitle}
            </div>
         </div>
      </div>
    </motion.div>
  );
};

export default AuditLogs;
