/**
 * 👤 ENTERPRISE AVATAR COMPONENT
 * Clean user avatars with fallback initials
 */

import React from 'react';
import { User } from 'lucide-react';

export type AvatarSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  initials?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  base: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  busy: 'bg-red-500',
  away: 'bg-yellow-500',
};

const statusSizes: Record<AvatarSize, string> = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  base: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4',
};

export function Avatar({
  src,
  alt = 'User',
  size = 'base',
  initials,
  status,
  className = '',
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  
  const showFallback = !src || imageError;
  
  return (
    <div className={`relative inline-flex ${className}`}>
      <div className={`
        ${sizeStyles[size]}
        rounded-full
        overflow-hidden
        bg-gray-200
        flex items-center justify-center
        flex-shrink-0
      `}>
        {!showFallback ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : initials ? (
          <span className="font-medium text-gray-600 uppercase">
            {initials}
          </span>
        ) : (
          <User className="w-1/2 h-1/2 text-gray-500" />
        )}
      </div>
      
      {/* Status indicator */}
      {status && (
        <span 
          className={`
            absolute bottom-0 right-0
            ${statusSizes[size]}
            rounded-full
            ${statusColors[status]}
            border-2 border-white
          `}
        />
      )}
    </div>
  );
}

export interface AvatarGroupProps {
  avatars: AvatarProps[];
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export function AvatarGroup({
  avatars,
  max = 3,
  size = 'base',
  className = '',
}: AvatarGroupProps) {
  const displayAvatars = avatars.slice(0, max);
  const remaining = Math.max(0, avatars.length - max);
  
  return (
    <div className={`flex items-center ${className}`}>
      {displayAvatars.map((avatar, index) => (
        <div
          key={index}
          className="-ml-2 first:ml-0"
          style={{ zIndex: displayAvatars.length - index }}
        >
          <Avatar {...avatar} size={size} className="ring-2 ring-white" />
        </div>
      ))}
      
      {remaining > 0 && (
        <div className={`
          -ml-2
          ${sizeStyles[size]}
          rounded-full
          bg-gray-300
          flex items-center justify-center
          text-xs font-medium text-gray-700
          ring-2 ring-white
        `}>
          +{remaining}
        </div>
      )}
    </div>
  );
}
