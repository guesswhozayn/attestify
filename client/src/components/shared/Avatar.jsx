import React from 'react';
import { User, Camera, Loader2 } from 'lucide-react';
import { getAvatarSrc } from '../../utils/avatarUtils';

const sizeClasses = {
  sm: 'w-9 h-9',
  md: 'w-14 h-14',
  lg: 'w-28 h-28',
  xl: 'w-36 h-36',
};

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
  const containerSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`relative group rounded-full ${containerSize} ${className}`}>
      <div className="absolute inset-0 rounded-full bg-stone-100 border border-stone-200/90 overflow-hidden flex items-center justify-center shadow-2xs group-hover:border-stone-400 transition-colors duration-200">
        <img
          src={getAvatarSrc(src, initials)}
          alt={alt || initials || 'Avatar'}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.nextSibling) {
              e.currentTarget.nextSibling.style.display = 'flex';
            }
          }}
        />
        <div
          className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-800"
          style={{ display: src ? 'none' : 'flex' }}
        >
          <span className="text-stone-800 font-bold uppercase tracking-tight select-none" style={{ fontSize: size === 'xl' ? '2.5rem' : size === 'lg' ? '1.75rem' : size === 'sm' ? '0.75rem' : '1.1rem' }}>
            {initials?.substring(0, 2) || <User className="w-1/2 h-1/2 text-stone-500" />}
          </span>
        </div>
        {editable && (
          <label className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 backdrop-blur-xs z-20 rounded-full text-white">
            {uploading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <>
                <Camera className="w-5 h-5 text-white mb-0.5" />
                {size !== 'sm' && (
                  <span className="text-[9px] font-bold text-white uppercase tracking-wider">Update</span>
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

export default React.memo(Avatar);
