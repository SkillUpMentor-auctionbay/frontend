'use client';

import { Button } from '@/components/ui/primitives/button';
import { InputField } from '@/components/ui/primitives/input';
import { useAuth } from '@/contexts/auth-context';
import { usePasswordChange, type PasswordData } from '@/hooks/usePasswordChange';
import { useProfilePicture } from '@/hooks/useProfilePicture';
import { useProfilePictureUpload } from '@/hooks/useProfilePictureUpload';
import { PasswordChangeForm } from './password-change-form';
import { ProfilePictureForm } from './profile-picture-form';
import { userAPI } from '@/services/api';
import { generateInitials } from '@/utils/imageUtils';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

export interface ProfileSettingsProps {
  className?: string;
  onSubmit?: (data: ProfileSettingsData | PasswordData) => Promise<void>;
  onCancel?: () => void;
  onViewChange?: (view: ViewType) => void;
}

export interface ProfileSettingsData {
  name: string;
  surname: string;
  email: string;
}

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
    const queryClient = useQueryClient();

    const [currentView, setCurrentView] = React.useState<ViewType>('profile');
    const [formData, setFormData] = React.useState<ProfileSettingsData>({
      name: user?.name || '',
      surname: user?.surname || '',
      email: user?.email || '',
    });

    const [errors, setErrors] = React.useState<Partial<ProfileSettingsData>>({});
    const [showNameError, setShowNameError] = React.useState(false);
    const [showSurnameError, setShowSurnameError] = React.useState(false);
    const [showEmailError, setShowEmailError] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

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

    const handleInputChange =
      (field: keyof ProfileSettingsData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
          ...prev,
          [field]: e.target.value,
        }));

        if (field === 'name') setShowNameError(false);
        if (field === 'surname') setShowSurnameError(false);
        if (field === 'email') setShowEmailError(false);
      };

    const handleViewChange = (view: ViewType) => {
      setCurrentView(view);
      setErrors({});
      setShowNameError(false);
      setShowSurnameError(false);
      setShowEmailError(false);

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

    const validateForm = (): boolean => {
      let isValid = true;

      if (!formData.name.trim()) {
        setShowNameError(true);
        isValid = false;
      }

      if (!formData.surname.trim()) {
        setShowSurnameError(true);
        isValid = false;
      }

      if (!formData.email.trim()) {
        setShowEmailError(true);
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setShowEmailError(true);
        isValid = false;
      }

      return isValid;
    };

    
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        if (currentView === 'profile') {
          const isDataUnchanged =
            formData.name === user?.name &&
            formData.surname === user?.surname &&
            formData.email === user?.email;

          if (isDataUnchanged) {
            onCancel?.();
            return;
          }

          if (!validateForm()) {
            return;
          }

          setIsSubmitting(true);

          await userAPI.updateUserProfile({
            name: formData.name,
            surname: formData.surname,
            email: formData.email,
          });

          queryClient.invalidateQueries({ queryKey: ['user'] });

          onCancel?.();
        } else if (currentView === 'password') {
          await submitPasswordChange();
        } else if (currentView === 'picture' && selectedFile) {
          setIsSubmitting(true);
          uploadSelectedFile();
        } else if (currentView === 'picture') {
          onCancel?.();
        }
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleCancel = () => {
      setFormData({
        name: user?.name || '',
        surname: user?.surname || '',
        email: user?.email || '',
      });
      setCurrentView('profile');
      setErrors({});
      setShowNameError(false);
      setShowSurnameError(false);
      setShowEmailError(false);

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
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <InputField
                        label="Name"
                        value={formData.name}
                        onChange={handleInputChange('name')}
                        placeholder="Enter your name"
                        disabled={isSubmitting || isPasswordSubmitting}
                      />
                      {showNameError && (
                        <p className="text-sm text-coral-50">
                          Name is required
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <InputField
                        label="Surname"
                        value={formData.surname}
                        onChange={handleInputChange('surname')}
                        placeholder="Enter your surname"
                        disabled={isSubmitting || isPasswordSubmitting}
                      />
                      {showSurnameError && (
                        <p className="text-sm text-coral-50">
                          Surname is required
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <InputField
                      label="Email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      placeholder="Enter your email"
                      type="email"
                      disabled={isSubmitting || isPasswordSubmitting}
                    />
                    {showEmailError && (
                      <p className="text-sm text-coral-50">
                        {!formData.email.trim()
                          ? 'Email is required'
                          : 'Invalid email format'}
                      </p>
                    )}
                  </div>
                </div>

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
