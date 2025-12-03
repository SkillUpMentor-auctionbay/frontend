'use client';

import { InputField } from '@/components/ui/primitives/input';
import { type ProfileData } from '@/hooks/useProfileData';
import * as React from 'react';

export interface ProfileFormProps {
  formData: ProfileData;
  errors: Partial<ProfileData>;
  showNameError: boolean;
  showSurnameError: boolean;
  showEmailError: boolean;
  isSubmitting: boolean;
  disabled?: boolean;
  onInputChange: (field: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileForm = React.forwardRef<
  HTMLDivElement,
  ProfileFormProps
>(
  (
    {
      formData,
      errors,
      showNameError,
      showSurnameError,
      showEmailError,
      isSubmitting,
      disabled = false,
      onInputChange,
    },
    ref
  ) => {
    return (
      <div ref={ref}>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <InputField
                label="Name"
                value={formData.name}
                onChange={onInputChange('name')}
                placeholder="Enter your name"
                disabled={isSubmitting || disabled}
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
                onChange={onInputChange('surname')}
                placeholder="Enter your surname"
                disabled={isSubmitting || disabled}
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
              onChange={onInputChange('email')}
              placeholder="Enter your email"
              type="email"
              disabled={isSubmitting || disabled}
            />
            {showEmailError && (
              <p className="text-sm text-coral-50">
                {formData.email.trim()
                  ? 'Invalid email format'
                  : 'Email is required'}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ProfileForm.displayName = 'ProfileForm';

export { ProfileForm };