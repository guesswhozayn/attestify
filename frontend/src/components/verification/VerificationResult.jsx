import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const VerificationResult = ({ result }) => {
  if (!result) return null;

  const getIcon = () => {
    if (result.valid) return <CheckCircle className="w-8 h-8 text-green-500" />;
    if (result.revoked) return <AlertCircle className="w-8 h-8 text-orange-500" />;
    return <XCircle className="w-8 h-8 text-red-500" />;
  };

  const getColor = () => {
    if (result.valid) return 'border-green-500 bg-green-500';
    if (result.revoked) return 'border-orange-500 bg-orange-500';
    return 'border-red-500 bg-red-500';
  };

  const getTitle = () => {
    if (result.valid) return 'Certificate Verified ✓';
    if (result.revoked) return 'Certificate Revoked';
    return 'Verification Failed ✗';
  };

  return (
    <div className={`border-2 ${getColor()} bg-opacity-10 rounded-lg p-6`}>
      <div className="flex items-start space-x-4">
        {getIcon()}
        <div className="flex-1">
          <h3 className={`text-xl font-bold mb-2 ${
            result.valid ? 'text-green-400' : result.revoked ? 'text-orange-400' : 'text-red-400'
          }`}>
            {getTitle()}
          </h3>
          <p className="text-gray-300 mb-4">{result.message}</p>

          {result.credential && (
            <div className="bg-gray-800 rounded-lg p-4 space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500">Student Name:</span>
                  <p className="text-white font-medium">{result.credential.studentName}</p>
                </div>
                <div>
                  <span className="text-gray-500">Student ID:</span>
                  <p className="text-white font-medium">{result.credential.studentId}</p>
                </div>
                <div>
                  <span className="text-gray-500">University:</span>
                  <p className="text-white font-medium">{result.credential.university}</p>
                </div>
                <div>
                  <span className="text-gray-500">Issue Date:</span>
                  <p className="text-white font-medium">
                    {new Date(result.credential.issueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {result.credential.transactionHash && (
                <div className="pt-3 border-t border-gray-700">
                  <span className="text-gray-500 text-xs">Blockchain Transaction:</span>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${result.credential.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-xs break-all block mt-1"
                  >
                    {result.credential.transactionHash}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationResult;
