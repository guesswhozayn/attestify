import React from 'react';

const BrandLogo = ({ textSize = "text-2xl", className = "" }) => {
  return (
    <span className={`font-sans ${textSize} font-black tracking-[-0.05em] text-white lowercase ${className}`}>
      attestify<span className="text-indigo-500">.</span>
    </span>
  );
};

export default BrandLogo;
 