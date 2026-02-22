/**
 * Returns a deterministic avatar URL for a user.
 *  - If `src` is a truthy URL, it is returned as-is.
 *  - Otherwise a DiceBear "initials" avatar is generated from `name`.
 *    This requires no npm install — the image is served from the DiceBear CDN.
 *
 * @param {string|null|undefined} src  - Uploaded avatar URL from the backend
 * @param {string|null|undefined} name - Display name used as the seed
 * @returns {string} An image URL, never null
 */
export const getAvatarSrc = (src, name) => {
  if (src) return src;
  const seed = encodeURIComponent((name || 'User').trim());
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundColor=6366f1&textColor=ffffff&radius=50&fontSize=38`;
};
