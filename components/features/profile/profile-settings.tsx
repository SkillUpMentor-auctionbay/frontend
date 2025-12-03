'use client';

import { Button } from '@/components/ui/primitives/button';
import { useAuth } from '@/contexts/auth-context';
import { usePasswordChange, type PasswordData } from '@/hooks/usePasswordChange';
import { useProfileData, type ProfileData } from '@/hooks/useProfileData';
import { useProfilePicture } from '@/hooks/useProfilePicture';
import { useProfilePictureUpload } from '@/hooks/useProfilePictureUpload';
import { PasswordChangeForm } from './password-change-form';
import { ProfileForm } from './profile-form';
import { ProfilePictureForm } from './profile-picture-form';
import { generateInitials } from '@/utils/imageUtils';
import * as React from 'react';

export interface ProfileSettingsProps {
  className?: string;
  onSubmit?: (data: ProfileSettingsData | PasswordData) => Promise<void>;
  onCancel?: () => void;
  onViewChange?: (view: ViewType) => void;
}

export type ProfileSettingsData = ProfileData;

export type ViewType = 'profile' | 'password' | 'picture';

const getViewTitle = (view: ViewType): string => {
  switch (view) {
    case 'password':
      return 'Change password';
    case 'picture':
      return 'Change profile picture';
    default:
      return 'Profile settings';
  }
};

const ProfileSettings = React.forwardRef<HTMLDivElement, ProfileSettingsProps>(
  ({ className, onSubmit, onCancel, onViewChange, ...props }, ref) => {
    const { user } = useAuth();
    const { data: profilePictureUrl, isLoading, error } = useProfilePicture();

    const [currentView, setCurrentView] = React.useState<ViewType>('profile');

    const {
      formData,
      errors,
      showNameError,
      showSurnameError,
      showEmailError,
      isSubmitting,
      handleInputChange,
      submitProfileUpdate,
      resetProfileForm,
    } = useProfileData({
      user,
      onSuccess: () => {
        onCancel?.();
      },
    });

    const {
      passwordData,
      errors: passwordErrors,
      isSubmitting: isPasswordSubmitting,
      handlePasswordChange,
      submitPasswordChange,
      resetPasswordForm,
    } = usePasswordChange({
      onSuccess: () => {
        onCancel?.();
      },
    });

    
    const {
      previewUrl,
      selectedFile,
      error: uploadError,
      isUploading,
      generatePreview,
      uploadSelectedFile,
      clearPreview,
    } = useProfilePictureUpload({
      onSuccess: () => {
        onCancel?.();
      },
    });

    const initials = generateInitials(user?.name, user?.surname);
    const showProfilePicture = profilePictureUrl && !error && !isLoading;

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    
    const handleViewChange = (view: ViewType) => {
      setCurrentView(view);

      if (view !== 'profile') {
        resetProfileForm();
      }

      if (view !== 'password') {
        resetPasswordForm();
      }

      onViewChange?.(view);
    };

    const handleProfilePictureChange = async (
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const file = e.target.files?.[0];
      if (!file) return;

      await generatePreview(file);
    };

    const handleSelectPictureClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      fileInputRef.current?.click();
    };

    
    
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (currentView === 'profile') {
        await submitProfileUpdate();
      } else if (currentView === 'password') {
        await submitPasswordChange();
      } else if (currentView === 'picture' && selectedFile) {
        uploadSelectedFile();
      } else if (currentView === 'picture') {
        onCancel?.();
      }
    };

    const handleCancel = () => {
      setCurrentView('profile');

      resetProfileForm();
      resetPasswordForm();
      clearPreview();

      onCancel?.();
    };

    return (
      <div ref={ref} className={className} {...props}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            {currentView === 'profile' && (
              <>
                <ProfileForm
                  formData={formData}
                  errors={errors}
                  showNameError={showNameError}
                  showSurnameError={showSurnameError}
                  showEmailError={showEmailError}
                  isSubmitting={isSubmitting}
                  disabled={isPasswordSubmitting}
                  onInputChange={handleInputChange}
                />

                <div className="flex flex-col gap-4">
                  <span
                    className="text-gray-50 text-[16px] leading-6 font-normal hover:underline cursor-pointer"
                    onClick={() => handleViewChange('password')}
                  >
                    Change password
                  </span>
                  <span
                    className="text-gray-50 text-[16px] leading-6 font-normal hover:underline cursor-pointer"
                    onClick={() => handleViewChange('picture')}
                  >
                    Change profile picture
                  </span>
                </div>
              </>
            )}

            {currentView === 'password' && (
              <PasswordChangeForm
                passwordData={passwordData}
                passwordErrors={passwordErrors}
                isSubmitting={isPasswordSubmitting}
                onPasswordChange={handlePasswordChange}
                disabled={isSubmitting}
              />
            )}

            {currentView === 'picture' && (
              <ProfilePictureForm
                previewUrl={previewUrl}
                selectedFile={selectedFile}
                profilePictureUrl={profilePictureUrl}
                isLoading={isLoading}
                uploadError={uploadError}
                isUploading={isUploading}
                initials={initials}
                fileInputRef={fileInputRef}
                disabled={isSubmitting || isPasswordSubmitting}
                onProfilePictureChange={handleProfilePictureChange}
                onSelectPictureClick={handleSelectPictureClick}
              />
            )}
          </div>

          <div className="flex gap-4 pt-2 justify-end">
            <Button
              variant="alternative"
              onClick={handleCancel}
              disabled={isSubmitting || isPasswordSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting || isPasswordSubmitting || isUploading || !!uploadError}>
              {isSubmitting || isPasswordSubmitting || isUploading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    );
  },
);

ProfileSettings.displayName = 'ProfileSettings';

export { getViewTitle, ProfileSettings };
