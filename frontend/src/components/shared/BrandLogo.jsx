import React from 'react';

const BrandLogo = ({ textSize = "text-2xl", className = "", dotColor = "", textColor = "" }) => {
  return (
    <span 
      className={`font-sans ${textSize} font-black tracking-[-0.05em] lowercase ${className}`}
      style={textColor ? { color: textColor } : { color: '#ffffff' }}
    >
      attestify<span className={dotColor ? "" : "text-indigo-500"} style={dotColor ? { color: dotColor } : { color: '#6366f1' }}>.</span>
    </span>
  );
};

export default BrandLogo;
 