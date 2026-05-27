/**
 * Utility to resolve relative image paths from the backend.
 * Prepend the backend server domain if the path starts with /uploads
 */
export const getImageUrl = (url) => {
  if (!url) return '';
  
  // If it's already a full URL or data URI, return as-is
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:')
  ) {
    return url;
  }

  // Ensure it starts with a slash
  const cleanPath = url.startsWith('/') ? url : `/${url}`;

  // If VITE_UPLOADS_URL is defined, use it to resolve uploads
  const uploadsBase = import.meta.env.VITE_UPLOADS_URL;
  if (uploadsBase) {
    // If the path starts with /uploads, replace it or append it to the base URL
    if (cleanPath.startsWith('/uploads')) {
      return `${uploadsBase}${cleanPath.replace('/uploads', '')}`;
    }
  }

  // Fallback to checking VITE_API_URL's host origin if set
  const apiBase = import.meta.env.VITE_API_URL;
  if (apiBase && apiBase.startsWith('http')) {
    try {
      const origin = new URL(apiBase).origin;
      return `${origin}${cleanPath}`;
    } catch (e) {
      console.error('Invalid VITE_API_URL for origin parsing:', e);
    }
  }

  // Fallback to relative path resolving on the frontend host
  return cleanPath;
};
