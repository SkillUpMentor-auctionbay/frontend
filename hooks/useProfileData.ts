'use client';

import { userAPI } from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChangeEvent, useState } from 'react';

export interface ProfileData {
  name: string;
  surname: string;
  email: string;
}

export interface ProfileDataOptions {
  user?: any;
  onSuccess?: () => void;
}

export interface ProfileDataResult {
  formData: ProfileData;
  errors: Partial<ProfileData>;
  showNameError: boolean;
  showSurnameError: boolean;
  showEmailError: boolean;
  isSubmitting: boolean;
  handleInputChange: (
    field: keyof ProfileData,
  ) => (e: ChangeEvent<HTMLInputElement>) => void;
  submitProfileUpdate: () => Promise<void>;
  resetProfileForm: () => void;
}

export function useProfileData(
  options: ProfileDataOptions = {},
): ProfileDataResult {
  const { user, onSuccess } = options;
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ProfileData>({
    name: user?.name || '',
    surname: user?.surname || '',
    email: user?.email || '',
  });

  const [errors, setErrors] = useState<Partial<ProfileData>>({});
  const [showNameError, setShowNameError] = useState(false);
  const [showSurnameError, setShowSurnameError] = useState(false);
  const [showEmailError, setShowEmailError] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileData> = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      setShowNameError(true);
      isValid = false;
    }

    if (!formData.surname.trim()) {
      newErrors.surname = 'Surname is required';
      setShowSurnameError(true);
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      setShowEmailError(true);
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
      setShowEmailError(true);
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const profileUpdateMutation = useMutation({
    mutationFn: async () => {
      const isDataUnchanged =
        formData.name === user?.name &&
        formData.surname === user?.surname &&
        formData.email === user?.email;

      if (isDataUnchanged) {
        onSuccess?.();
        return;
      }

      if (!validateForm()) {
        throw new Error('Validation failed');
      }

      await userAPI.updateUserProfile({
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      onSuccess?.();
    },
    onError: (error) => {
      if (error.message !== 'Validation failed') {
        // Don't set inline errors for API errors to avoid duplicate messaging
      }
    },
  });

  const handleInputChange =
    (field: keyof ProfileData) => (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: newValue,
      }));

      if (field === 'name') setShowNameError(false);
      if (field === 'surname') setShowSurnameError(false);
      if (field === 'email') setShowEmailError(false);

      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    };

  const submitProfileUpdate = async (): Promise<void> => {
    profileUpdateMutation.mutate();
  };

  const resetProfileForm = () => {
    setFormData({
      name: user?.name || '',
      surname: user?.surname || '',
      email: user?.email || '',
    });
    setErrors({});
    setShowNameError(false);
    setShowSurnameError(false);
    setShowEmailError(false);
  };

  return {
    formData,
    errors,
    showNameError,
    showSurnameError,
    showEmailError,
    isSubmitting: profileUpdateMutation.isPending,
    handleInputChange,
    submitProfileUpdate,
    resetProfileForm,
  };
}
