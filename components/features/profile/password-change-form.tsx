'use client';

import { InputField } from '@/components/ui/primitives/input';
import {
  type PasswordData,
  type PasswordErrors,
} from '@/hooks/usePasswordChange';
import * as React from 'react';

export interface PasswordChangeFormProps {
  passwordData: PasswordData;
  passwordErrors: PasswordErrors;
  isSubmitting: boolean;
  onPasswordChange: (
    field: keyof PasswordData,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const PasswordChangeForm = React.forwardRef<
  HTMLDivElement,
  PasswordChangeFormProps
>(
  (
    {
      passwordData,
      passwordErrors,
      isSubmitting,
      onPasswordChange,
      disabled = false,
    },
    ref,
  ) => {
    return (
      <div ref={ref}>
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <InputField
              label="Current password"
              value={passwordData.currentPassword}
              onChange={onPasswordChange('currentPassword')}
              type="password"
              disabled={isSubmitting || disabled}
            />
            {passwordErrors.currentPassword && (
              <p className="text-sm text-coral-50">
                {passwordErrors.currentPassword}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <InputField
              label="New password"
              value={passwordData.newPassword}
              onChange={onPasswordChange('newPassword')}
              type="password"
              disabled={isSubmitting || disabled}
            />
            {passwordErrors.newPassword && (
              <p className="text-sm text-coral-50">
                {passwordErrors.newPassword}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <InputField
              label="Repeat new password"
              value={passwordData.repeatNewPassword}
              onChange={onPasswordChange('repeatNewPassword')}
              type="password"
              disabled={isSubmitting || disabled}
            />
            {passwordErrors.repeatNewPassword && (
              <p className="text-sm text-coral-50">
                {passwordErrors.repeatNewPassword}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  },
);

PasswordChangeForm.displayName = 'PasswordChangeForm';

export { PasswordChangeForm };
