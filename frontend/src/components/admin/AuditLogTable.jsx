import React from 'react';
import { Clock, User, FileText, Activity, AlertCircle } from 'lucide-react';

const AuditLogTable = ({ logs, loading }) => {
  const getActionIcon = (action) => {
    switch (action) {
      case 'CREDENTIAL_ISSUED':
        return <FileText className="w-5 h-5 text-green-400" />;
      case 'CREDENTIAL_REVOKED':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'ADMIN_CREATED':
        return <User className="w-5 h-5 text-blue-400" />;
      default:
        return <Activity className="w-5 h-5 text-purple-400" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREDENTIAL_ISSUED':
        return 'text-green-400';
      case 'CREDENTIAL_REVOKED':
        return 'text-red-400';
      case 'ADMIN_CREATED':
        return 'text-blue-400';
      default:
        return 'text-purple-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <p className="text-gray-400 mt-4">Loading audit logs...</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-8 text-center">
        <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No audit logs found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <div className="divide-y divide-gray-800">
        {logs.map((log) => (
          <div key={log._id} className="p-6 hover:bg-gray-800 transition">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                {getActionIcon(log.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-medium ${getActionColor(log.action)}`}>
                    {log.action.replace(/_/g, ' ')}
                  </h3>
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-400 text-sm mb-3">
                  <User className="w-4 h-4" />
                  <span>Performed by: {log.performedBy?.name || 'System'}</span>
                </div>

                {log.details && (
                  <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                    {log.details.studentId && (
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-gray-500">Student ID:</span>
                        <span className="text-white font-mono">{log.details.studentId}</span>
                      </div>
                    )}
                    {log.details.transactionHash && (
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-gray-500">Transaction:</span>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${log.details.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 font-mono text-xs truncate"
                        >
                          {log.details.transactionHash}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditLogTable;
