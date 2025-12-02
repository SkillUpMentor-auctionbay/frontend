"use client"

import * as React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/primitives/avatar"
import { InputField } from "@/components/ui/primitives/input"
import { Button } from "@/components/ui/primitives/button"
import { useAuth } from "@/contexts/auth-context"
import { useProfilePicture } from "@/hooks/useProfilePicture"
import { useProfilePictureUpload } from "@/hooks/useProfilePictureUpload"
import { generateInitials } from "@/utils/imageUtils"
import { useQueryClient } from "@tanstack/react-query"
import { userAPI } from "@/services/api"

export interface ProfileSettingsProps {
  className?: string
  onSubmit?: (data: ProfileSettingsData | PasswordData) => Promise<void>
  onCancel?: () => void
  onViewChange?: (view: ViewType) => void
}

export interface ProfileSettingsData {
  name: string
  surname: string
  email: string
}

export interface PasswordData {
  currentPassword: string
  newPassword: string
  repeatNewPassword: string
}

export type ViewType = 'profile' | 'password' | 'picture'

const getViewTitle = (view: ViewType): string => {
  switch (view) {
    case 'password':
      return 'Change password'
    case 'picture':
      return 'Change profile picture'
    default:
      return 'Profile settings'
  }
}

const ProfileSettings = React.forwardRef<HTMLDivElement, ProfileSettingsProps>(
  ({ className, onSubmit, onCancel, onViewChange, ...props }, ref) => {
    const { user } = useAuth()
    const { data: profilePictureUrl, isLoading, error } = useProfilePicture()
    const queryClient = useQueryClient()

    const [currentView, setCurrentView] = React.useState<ViewType>('profile')
    const [formData, setFormData] = React.useState<ProfileSettingsData>({
      name: user?.name || "",
      surname: user?.surname || "",
      email: user?.email || "",
    })

    const [passwordData, setPasswordData] = React.useState<PasswordData>({
      currentPassword: "",
      newPassword: "",
      repeatNewPassword: "",
    })

    const [errors, setErrors] = React.useState<Partial<ProfileSettingsData | PasswordData>>({})
    const [showNameError, setShowNameError] = React.useState(false)
    const [showSurnameError, setShowSurnameError] = React.useState(false)
    const [showEmailError, setShowEmailError] = React.useState(false)
    const [showCurrentPasswordError, setShowCurrentPasswordError] = React.useState(false)
    const [showNewPasswordError, setShowNewPasswordError] = React.useState(false)
    const [showRepeatPasswordError, setShowRepeatPasswordError] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const [profilePictureFile, setProfilePictureFile] = React.useState<File | null>(null)
    const [profilePicturePreview, setProfilePicturePreview] = React.useState<string | null>(null)
    const [uploadError, setUploadError] = React.useState<string | null>(null)

    const {
      uploadProfilePicture,
      isUploading: isProfilePictureUploading,
      error: uploadErrorData,
      data: uploadResult,
      reset: resetUpload
    } = useProfilePictureUpload({
      onSuccess: async (profilePictureUrl) => {
        setUploadError(null);
        await queryClient.invalidateQueries({ queryKey: ["user"] });
        await queryClient.refetchQueries({ queryKey: ["user"] });
        onCancel?.();
      },
      onError: (error) => {
        setUploadError(error.message);
      }
    });

    const initials = generateInitials(user?.name, user?.surname)
    const showProfilePicture = profilePictureUrl && !error && !isLoading

    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleInputChange = (field: keyof ProfileSettingsData) => (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.value
      }))

      if (field === "name") setShowNameError(false)
      if (field === "surname") setShowSurnameError(false)
      if (field === "email") setShowEmailError(false)
    }

    const handlePasswordChange = (field: keyof PasswordData) => (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      setPasswordData(prev => ({
        ...prev,
        [field]: e.target.value
      }))

      if (field === "currentPassword") setShowCurrentPasswordError(false)
      if (field === "newPassword") setShowNewPasswordError(false)
      if (field === "repeatNewPassword") setShowRepeatPasswordError(false)
    }

    const handleViewChange = (view: ViewType) => {
      setCurrentView(view)
      setErrors({})
      setShowNameError(false)
      setShowSurnameError(false)
      setShowEmailError(false)
      setShowCurrentPasswordError(false)
      setShowNewPasswordError(false)
      setShowRepeatPasswordError(false)
      setUploadError(null)
      onViewChange?.(view)
    }

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

      if (file.size > maxSizeInBytes) {
        setUploadError("Image must be less than 5MB");
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        setUploadError("Image must be in JPEG, JPG, PNG, or WebP format");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      setProfilePictureFile(file);
      setUploadError(null);
    }

    const validateForm = (): boolean => {
      let isValid = true

      if (!formData.name.trim()) {
        setShowNameError(true)
        isValid = false
      }

      if (!formData.surname.trim()) {
        setShowSurnameError(true)
        isValid = false
      }

      if (!formData.email.trim()) {
        setShowEmailError(true)
        isValid = false
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setShowEmailError(true)
        isValid = false
      }

      return isValid
    }

    const validatePasswordForm = (): boolean => {
      let isValid = true

      if (!passwordData.currentPassword.trim()) {
        setShowCurrentPasswordError(true)
        isValid = false
      }

      if (!passwordData.newPassword.trim()) {
        setShowNewPasswordError(true)
        isValid = false
      } else if (passwordData.newPassword.length < 6) {
        setShowNewPasswordError(true)
        isValid = false
      }

      if (passwordData.newPassword && passwordData.currentPassword &&
          passwordData.newPassword === passwordData.currentPassword) {
        setShowNewPasswordError(true)
        isValid = false
      }

      if (!passwordData.repeatNewPassword.trim()) {
        setShowRepeatPasswordError(true)
        isValid = false
      } else if (passwordData.repeatNewPassword !== passwordData.newPassword) {
        setShowRepeatPasswordError(true)
        isValid = false
      }

      return isValid
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      try {
        if (currentView === 'profile') {
          const isDataUnchanged =
            formData.name === user?.name &&
            formData.surname === user?.surname &&
            formData.email === user?.email

          if (isDataUnchanged) {
            onCancel?.()
            return
          }

          if (!validateForm()) {
            return
          }

          setIsSubmitting(true)

          await userAPI.updateUserProfile({
            name: formData.name,
            surname: formData.surname,
            email: formData.email,
          })

          queryClient.invalidateQueries({ queryKey: ["user"] })

          onCancel?.()

        } else if (currentView === 'password') {
          if (!validatePasswordForm()) {
            return
          }

          setIsSubmitting(true)

          await userAPI.changePassword({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          })

          onCancel?.()

        } else if (currentView === 'picture' && profilePictureFile) {
          setIsSubmitting(true)
          uploadProfilePicture(profilePictureFile)
        }
      } finally {
        setIsSubmitting(false)
      }
    }

    const handleCancel = () => {
      setFormData({
        name: user?.name || "",
        surname: user?.surname || "",
        email: user?.email || "",
      })
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        repeatNewPassword: "",
      })
      setCurrentView('profile')
      setErrors({})
      setShowNameError(false)
      setShowSurnameError(false)
      setShowEmailError(false)
      setShowCurrentPasswordError(false)
      setShowNewPasswordError(false)
      setShowRepeatPasswordError(false)

      setProfilePictureFile(null)
      setProfilePicturePreview(null)
      setUploadError(null)

      
      onCancel?.()
    }

    return (
      <div
        ref={ref}
        className={className}
        {...props}
      >
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
                        onChange={handleInputChange("name")}
                        placeholder="Enter your name"
                        disabled={isSubmitting}
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
                        onChange={handleInputChange("surname")}
                        placeholder="Enter your surname"
                        disabled={isSubmitting}
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
                      onChange={handleInputChange("email")}
                      placeholder="Enter your email"
                      type="email"
                      disabled={isSubmitting}
                    />
                    {showEmailError && (
                      <p className="text-sm text-coral-50">
                        {!formData.email.trim() ? "Email is required" : "Invalid email format"}
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
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <InputField
                    label="Current password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange("currentPassword")}
                    type="password"
                    disabled={isSubmitting}
                  />
                  {showCurrentPasswordError && (
                    <p className="text-sm text-coral-50">
                      Current password is required
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <InputField
                    label="New password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange("newPassword")}
                    type="password"
                    disabled={isSubmitting}
                  />
                  {showNewPasswordError && (
                    <p className="text-sm text-coral-50">
                      {!passwordData.newPassword.trim()
                        ? "New password is required"
                        : passwordData.newPassword === passwordData.currentPassword
                        ? "New password must be different from current password"
                        : "New password must be at least 6 characters long"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <InputField
                    label="Repeat new password"
                    value={passwordData.repeatNewPassword}
                    onChange={handlePasswordChange("repeatNewPassword")}
                    type="password"
                    disabled={isSubmitting}
                  />
                  {showRepeatPasswordError && (
                    <p className="text-sm text-coral-50">
                      {!passwordData.repeatNewPassword.trim()
                        ? "Please repeat your new password"
                        : "Passwords do not match"}
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentView === 'picture' && (
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <Avatar size="lg" className="size-14">
                    {profilePicturePreview ? (
                      <AvatarImage
                        src={profilePicturePreview}
                        alt="Profile picture preview"
                      />
                    ) : showProfilePicture ? (
                      <AvatarImage
                        src={profilePictureUrl}
                        alt="User avatar"
                      />
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
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />

                <Button
                  variant="tertiary"
                  disabled={isSubmitting || isProfilePictureUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full max-w-[200px]"
                >
                  {isProfilePictureUploading ? "Uploading..." : "Upload new picture"}
                </Button>

                {uploadError && (
                  <p className="text-sm text-coral-50 text-center max-w-[200px]">
                    {uploadError}
                  </p>
                )}

                </div>
            )}
          </div>

          <div className="flex gap-4 pt-2 justify-end">
            <Button
              variant="alternative"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}

            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    )
  }
)

ProfileSettings.displayName = "ProfileSettings"

export { ProfileSettings, getViewTitle }