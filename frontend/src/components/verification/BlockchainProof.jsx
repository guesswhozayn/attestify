import React from 'react';
import { ExternalLink, Check, Hash, Clock } from 'lucide-react';
import Button from '../shared/Button';

const BlockchainProof = ({ transactionHash, blockNumber, timestamp, studentId }) => {
  const etherscanUrl = `https://sepolia.etherscan.io/tx/${transactionHash}`;

  return (
    <div className="bg-gray-900 rounded-lg p-6 space-y-4">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center">
          <Check className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Blockchain Verified</h3>
          <p className="text-gray-400 text-sm">Certificate is authentic</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <Hash className="w-5 h-5 text-gray-500 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-gray-400 text-sm">Transaction Hash</p>
            <p className="text-white font-mono text-sm break-all">{transactionHash}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-gray-400 text-sm">Block Number</p>
            <p className="text-white">{blockNumber?.toLocaleString()}</p>
          </div>
        </div>

        {timestamp && (
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-gray-400 text-sm">Timestamp</p>
              <p className="text-white">{new Date(timestamp).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={() => window.open(etherscanUrl, '_blank')}
        variant="outline"
        className="w-full"
        icon={ExternalLink}
      >
        View on Etherscan
      </Button>
    </div>
  );
};

export default BlockchainProof;
