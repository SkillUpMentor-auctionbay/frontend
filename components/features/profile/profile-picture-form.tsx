'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/primitives/avatar';
import { Button } from '@/components/ui/primitives/button';
import * as React from 'react';

export interface ProfilePictureFormProps {
  previewUrl: string | null;
  selectedFile: File | null;
  profilePictureUrl: string | null | undefined;
  isLoading: boolean;
  uploadError: string | null;
  isUploading: boolean;
  initials: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  disabled?: boolean;
  onProfilePictureChange: (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => Promise<void>;
  onSelectPictureClick: (e: React.MouseEvent) => void;
}

const ProfilePictureForm = React.forwardRef<
  HTMLDivElement,
  ProfilePictureFormProps
>(
  (
    {
      previewUrl,
      profilePictureUrl,
      isLoading,
      uploadError,
      isUploading,
      initials,
      fileInputRef,
      disabled = false,
      onProfilePictureChange,
      onSelectPictureClick,
    },
    ref,
  ) => {
    const showProfilePicture = profilePictureUrl && !isLoading && !uploadError;

    return (
      <div ref={ref}>
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Avatar size="lg" className="size-14">
              {previewUrl ? (
                <AvatarImage src={previewUrl} alt="Profile picture preview" />
              ) : showProfilePicture ? (
                <AvatarImage src={profilePictureUrl} alt="User avatar" />
              ) : (
                <AvatarFallback className="bg-primary-50 text-gray-90 font-medium text-lg">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onProfilePictureChange}
            className="hidden"
          />

          <Button
            type="button"
            variant="tertiary"
            disabled={disabled || isUploading}
            onClick={onSelectPictureClick}
            className="w-full max-w-[200px]"
          >
            Select new picture
          </Button>

          {uploadError && (
            <p className="text-sm text-coral-50 text-center max-w-[200px]">
              {uploadError}
            </p>
          )}
        </div>
      </div>
    );
  },
);

ProfilePictureForm.displayName = 'ProfilePictureForm';

export { ProfilePictureForm };
