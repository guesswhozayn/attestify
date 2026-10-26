import React from 'react';
import VerificationPortal from '../components/verification/VerificationPortal';

const VerifyPage = () => {
  return (
    <div className="w-full flex-1 flex flex-col justify-center items-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8 selection:bg-stone-900 selection:text-white">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        <VerificationPortal />
      </div>
    </div>
  );
};

export default VerifyPage;
