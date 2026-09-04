import React from 'react';
import { User, Camera, Loader2 } from 'lucide-react';
import { getAvatarSrc } from '../../utils/avatarUtils';

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

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
  };

  const containerSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`relative group rounded-full ${containerSize} ${className}`}>

      <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />

      <div className="absolute -inset-px rounded-full border border-white/10 opacity-40" />

      <div className="absolute inset-0 rounded-full bg-[#0a0a0a] border border-white/10 overflow-hidden flex items-center justify-center shadow-inner group-hover:border-indigo-500/30 transition-colors duration-500">

        <img
          src={getAvatarSrc(src, initials)}
          alt={alt || initials || 'Avatar'}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextSibling.style.display = 'flex';
          }}
        />

        <div
          className="w-full h-full flex items-center justify-center bg-linear-to-br from-indigo-500/20 via-black to-purple-500/20"
          style={{ display: src ? 'none' : 'flex' }}
        >
          <span className="text-white font-black uppercase tracking-tighter opacity-80 select-none" style={{ fontSize: size === 'xl' ? '3rem' : '1rem' }}>
            {initials?.substring(0, 2) || <User className="w-1/2 h-1/2 opacity-20" />}
          </span>
        </div>

        {editable && (
          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 backdrop-blur-sm z-20 rounded-full">
            {uploading ? (
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            ) : (
              <>
                <Camera className="w-6 h-6 text-indigo-400 mb-1" />
                {size !== 'sm' && (
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Key Update</span>
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
