import React from 'react';
import { Clock, User, FileText, Activity, AlertCircle, Shield, Hash, ArrowRight } from 'lucide-react';

const InstituteLogTable = ({ logs, loading }) => {
  const getActionIcon = (action) => {
    switch (action) {
      case 'CREDENTIAL_ISSUED':
        return <FileText className="w-4 h-4 text-green-400" />;
      case 'CREDENTIAL_REVOKED':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'ADMIN_CREATED':
        return <User className="w-4 h-4 text-blue-400" />;
      default:
        return <Activity className="w-4 h-4 text-purple-400" />;
    }
  };

  const FormatAction = ({ action }) => {
      const displayAction = action.replace('ADMIN', 'INSTITUTE');
      const parts = displayAction.split('_');
      return (
          <span className="font-medium">
             {parts.join(' ')}
          </span>
      );
  }

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        <p className="text-gray-500 mt-4 text-sm">Loading activity logs...</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
           <Activity className="w-6 h-6 text-gray-700" />
        </div>
        <p className="text-gray-400 font-medium">No activity recorded yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-900/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
          <tr>
            <th className="px-6 py-4 font-medium">Event</th>
            <th className="px-6 py-4 font-medium">Performed By</th>
            <th className="px-6 py-4 font-medium">Details</th>
            <th className="px-6 py-4 font-medium text-right">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800 text-sm">
          {logs.map((log) => (
            <tr key={log._id} className="hover:bg-gray-800/30 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-gray-800 border border-gray-700 group-hover:border-gray-600 transition-colors`}>
                    {getActionIcon(log.action)}
                  </div>
                  <div>
                    <div className="text-white font-medium">
                        <FormatAction action={log.action} />
                    </div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5">
                        ID: {log._id.slice(-6)}
                    </div>
                  </div>
                </div>
              </td>
              
              <td className="px-6 py-4">
                <div className="flex items-center space-x-2 text-gray-300">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>{log.performedBy?.name || 'System'}</span>
                </div>
              </td>

              <td className="px-6 py-4">
                <div className="space-y-1.5">
                    {log.targetCredential && (
                        <div className="flex items-center text-xs text-gray-400 bg-gray-900/50 px-2 py-1 rounded w-fit border border-gray-800">
                            <FileText className="w-3 h-3 mr-1.5 opacity-70" />
                            ID: <span className="text-gray-300 ml-1 font-mono">
                                {typeof log.targetCredential === 'object' ? log.targetCredential._id.slice(-6) : log.targetCredential.slice(-6)}
                            </span>
                        </div>
                    )}
                    {log.details?.transactionHash && (
                        <a 
                            href={`https://sepolia.etherscan.io/tx/${log.details.transactionHash}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-xs text-blue-400/80 hover:text-blue-300 hover:underline decoration-blue-500/30 w-fit"
                        >
                            <Hash className="w-3 h-3 mr-1" />
                            Transaction
                            <ArrowRight className="w-3 h-3 ml-1 -rotate-45" />
                        </a>
                    )}
                </div>
              </td>

              <td className="px-6 py-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end text-gray-400 group-hover:text-gray-300">
                   <Clock className="w-4 h-4 mr-2 opacity-50" />
                   {new Date(log.createdAt).toLocaleDateString()}
                   <span className="mx-1.5 opacity-30">|</span>
                   {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InstituteLogTable;
