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
  return getImageUrl(profilePictureUrl);
}