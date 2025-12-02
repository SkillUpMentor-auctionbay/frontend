const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export function getImageUrl(imageUrl?: string): string | undefined {
  if (!imageUrl) return undefined;

  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  if (imageUrl.startsWith('/')) {
    return `${BACKEND_URL}${imageUrl}`;
  }

  return `${BACKEND_URL}/${imageUrl}`;
}

export function getProfilePictureUrl(profilePictureUrl?: string): string | undefined {
  if (!profilePictureUrl) return undefined;

  const url = getImageUrl(profilePictureUrl);

  // Add cache-busting timestamp to profile pictures to ensure they update after changes
  if (url && profilePictureUrl.includes('/profile-pictures/')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}_t=${Date.now()}`;
  }

  return url;
}


export function generateInitials(name?: string, surname?: string): string {
  if (!name && !surname) return "U";

  const nameInitial = name?.charAt(0).toUpperCase() || "";
  const surnameInitial = surname?.charAt(0).toUpperCase() || "";

  const initials = `${nameInitial}${surnameInitial}`.trim();
  return initials || "U";
}