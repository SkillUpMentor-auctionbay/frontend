'use client';

import { userAPI } from '@/services/api';
import { useMutation } from '@tanstack/react-query';
import { ChangeEvent, useState } from 'react';

export interface PasswordData {
  currentPassword: string;
  newPassword: string;
  repeatNewPassword: string;
}

export interface PasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  repeatNewPassword?: string;
}

export interface PasswordChangeOptions {
  onSuccess?: () => void;
}

export interface PasswordChangeResult {
  passwordData: PasswordData;
  errors: PasswordErrors;
  isSubmitting: boolean;
  handlePasswordChange: (field: keyof PasswordData) => (e: ChangeEvent<HTMLInputElement>) => void;
  submitPasswordChange: () => Promise<void>;
  resetPasswordForm: () => void;
}

export function usePasswordChange(options: PasswordChangeOptions = {}): PasswordChangeResult {
  const { onSuccess } = options;

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    repeatNewPassword: '',
  });

  const [errors, setErrors] = useState<PasswordErrors>({});

  const validatePasswordForm = (): boolean => {
    const newErrors: PasswordErrors = {};
    let isValid = true;

    if (!passwordData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
      isValid = false;
    }

    if (!passwordData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
      isValid = false;
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters long';
      isValid = false;
    }

    if (
      passwordData.newPassword &&
      passwordData.currentPassword &&
      passwordData.newPassword === passwordData.currentPassword
    ) {
      newErrors.newPassword = 'New password must be different from current password';
      isValid = false;
    }

    if (!passwordData.repeatNewPassword.trim()) {
      newErrors.repeatNewPassword = 'Please repeat your new password';
      isValid = false;
    } else if (passwordData.repeatNewPassword !== passwordData.newPassword) {
      newErrors.repeatNewPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const passwordChangeMutation = useMutation({
    mutationFn: async () => {
      if (!validatePasswordForm()) {
        throw new Error('Validation failed');
      }

      await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
    },
    onSuccess: () => {
      resetPasswordForm();
      onSuccess?.();
    },
    onError: (error) => {
      if (error.message === 'Validation failed') {        
        return;
      }
    },
  });

  const handlePasswordChange =
    (field: keyof PasswordData) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setPasswordData((prev) => ({
        ...prev,
        [field]: newValue,
      }));

      setErrors({});
    };

  const submitPasswordChange = async (): Promise<void> => {
    passwordChangeMutation.mutate();
  };

  const resetPasswordForm = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      repeatNewPassword: '',
    });
    setErrors({});
  };

  return {
    passwordData,
    errors,
    isSubmitting: passwordChangeMutation.isPending,
    handlePasswordChange,
    submitPasswordChange,
    resetPasswordForm,
  };
}