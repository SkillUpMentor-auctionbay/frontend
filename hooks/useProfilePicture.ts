'use client';

import { useAuth } from '@/hooks/useAuth';
import { getProfilePictureUrl } from '@/utils/imageUtils';
import { useMemo } from 'react';

export function useProfilePicture() {
  const { user } = useAuth();

  const profilePictureUrl = useMemo(() => {
    return getProfilePictureUrl(user?.profilePictureUrl);
  }, [user?.profilePictureUrl]);

  return {
    data: profilePictureUrl,
    isLoading: false,
    error: null,
    isSuccess: !!profilePictureUrl,
  };
}
