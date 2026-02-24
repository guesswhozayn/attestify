export const getAvatarSrc = (src, name) => {
  if (src) return src;
  const seed = encodeURIComponent((name || 'User').trim());
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundColor=6366f1&textColor=ffffff&radius=50&fontSize=38`;
};
