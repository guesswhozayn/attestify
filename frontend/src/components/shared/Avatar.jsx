import React from 'react';
import { User, Camera, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Avatar = ({ 
  src, 
  alt, 
  initials, 
  size = 'md', 
  editable = false, 
  uploading = false, 
  onUpload,
  className = ''
}) => {
  
  // Size variants
  const sizeClasses = {
    sm: 'w-10 h-10',      // Header, small lists
    md: 'w-16 h-16',      // Cards
    lg: 'w-32 h-32',      // Profile Hero
    xl: 'w-40 h-40',      // Large Profile Hero
  };

  const containerSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`relative group ${containerSize} ${className}`}>
      
      {/* 1. Outer Glow (Static) */}
      <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />

      {/* 2. Rotating Orbital Ring (Creative Element) */}
      {/* Gradient border ring that spins slowly */}
      <div className="absolute -inset-[3px] rounded-full border border-transparent border-t-indigo-500/60 border-r-purple-500/60 border-b-transparent border-l-transparent animate-[spin_4s_linear_infinite] opacity-80" />
      
      {/* 3. Counter-rotating inner ring (Subtle detail) */}
      <div className="absolute -inset-[1px] rounded-full border border-white/5 border-t-transparent border-l-transparent animate-[spin_6s_linear_infinite_reverse] opacity-40" />

      {/* 4. Static Glass Container */}
      <div className="absolute inset-0 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 overflow-hidden flex items-center justify-center">
        
        {src ? (
          <img 
            src={src} 
            alt={alt || "Avatar"} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/50 to-purple-900/50">
            {initials ? (
              <span className={`font-bold text-white tracking-widest ${size === 'sm' ? 'text-xs' : size === 'lg' || size === 'xl' ? 'text-3xl' : 'text-lg'}`}>
                {initials.substring(0, 2).toUpperCase()}
              </span>
            ) : (
              <User className="text-white/50 w-1/2 h-1/2" />
            )}
          </div>
        )}

        {/* 5. Upload Overlay (if editable) */}
        {editable && (
          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 backdrop-blur-[2px] z-20">
            {uploading ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <>
                <Camera className="w-6 h-6 text-white mb-1" />
                {size !== 'sm' && (
                    <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest">Update</span>
                )}
              </>
            )}
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={onUpload}
              disabled={uploading}
            />
          </label>
        )}
      </div>

    </div>
  );
};

export default Avatar;
