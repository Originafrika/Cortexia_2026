/**
 * Avatar Helpers - Production Ready
 * Generate real user avatars with intelligent fallbacks
 */

/**
 * Get avatar URL with intelligent fallback
 * Priority:
 * 1. User uploaded avatar
 * 2. Generated avatar from ui-avatars.com with username
 * 3. Fallback with user ID
 */
export function getAvatarUrl(
  avatarUrl?: string | null,
  username?: string | null,
  userId?: string
): string {
  // ✅ Priority 1: Use uploaded avatar if exists
  if (avatarUrl && avatarUrl.trim() && !avatarUrl.includes('unsplash')) {
    return avatarUrl;
  }

  // ✅ Priority 2: Generate from username
  const displayName = formatUsername(username || userId || 'User');
  
  // Generate with ui-avatars.com
  const encodedName = encodeURIComponent(displayName);
  return `https://ui-avatars.com/api/?name=${encodedName}&background=6366f1&color=fff&size=128&bold=true`;
}

/**
 * Format username for display
 * Removes auth0| prefix and truncates long IDs
 */
export function formatUsername(username: string): string {
  if (!username) return 'User';
  
  // Remove auth0| or user_ prefix
  if (username.startsWith('auth0|') || username.startsWith('user_')) {
    const cleaned = username.split('|')[1] || username.split('_')[1];
    return cleaned?.slice(0, 12) || username.slice(0, 12);
  }
  
  // Remove @cortexia_user prefix
  if (username === '@cortexia_user') {
    return 'Creator';
  }
  
  // Clean @ symbol
  const withoutAt = username.replace('@', '');
  
  return withoutAt.slice(0, 20);
}

/**
 * Get initials from username for avatar generation
 */
export function getInitials(username?: string): string {
  if (!username) return 'U';
  
  const cleaned = formatUsername(username);
  const words = cleaned.split(/[\s_-]+/);
  
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  
  return cleaned.slice(0, 2).toUpperCase();
}

/**
 * Check if avatar URL is a mock/placeholder
 */
export function isMockAvatar(avatarUrl?: string): boolean {
  if (!avatarUrl) return true;
  
  return (
    avatarUrl.includes('unsplash.com') ||
    avatarUrl.includes('placeholder') ||
    avatarUrl.includes('lorem') ||
    avatarUrl === ''
  );
}
