"use client"

import * as React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { InputField } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useProfilePicture } from "@/hooks/useProfilePicture"
import { useProfilePictureUpload } from "@/hooks/useProfilePictureUpload"
import { generateInitials } from "@/utils/imageUtils"
import { useQueryClient } from "@tanstack/react-query"

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

// Helper function to get title based on current view
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
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    // Profile picture upload state
    const [profilePictureFile, setProfilePictureFile] = React.useState<File | null>(null)
    const [profilePicturePreview, setProfilePicturePreview] = React.useState<string | null>(null)
    const [uploadError, setUploadError] = React.useState<string | null>(null)

    // Profile picture upload hook
    const {
      uploadProfilePicture,
      isUploading: isProfilePictureUploading,
      error: uploadErrorData,
      data: uploadResult,
      reset: resetUpload
    } = useProfilePictureUpload({
      onSuccess: (imageUrl) => {
        console.log("Profile picture uploaded successfully:", imageUrl);
        // Close dialog immediately to prevent flash of old image
        onCancel?.();
        // Clear local state after dialog starts closing
        setProfilePictureFile(null);
        setProfilePicturePreview(null);
        setUploadError(null);
        // Invalidate user query to refresh user data across the app
        queryClient.invalidateQueries({ queryKey: ["user"] });
      },
      onError: (error) => {
        setUploadError(error.message);
      }
    });

    const initials = generateInitials(user?.name, user?.surname)
    const showProfilePicture = profilePictureUrl && !error && !isLoading

    // Ref for hidden file input
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleInputChange = (field: keyof ProfileSettingsData) => (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.value
      }))

      // Clear error states when user starts typing
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
    }

    const handleViewChange = (view: ViewType) => {
      setCurrentView(view)
      // Clear errors when switching views
      setErrors({})
      setShowNameError(false)
      setShowSurnameError(false)
      setShowEmailError(false)
      setUploadError(null)
      // Notify parent of view change
      onViewChange?.(view)
    }

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file
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

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Store file for upload
      setProfilePictureFile(file);
      setUploadError(null);
    }

    const handleRemoveProfilePicture = () => {
      setProfilePictureFile(null);
      setProfilePicturePreview(null);
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

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      setIsSubmitting(true)

      try {
        if (currentView === 'profile') {
          await onSubmit?.(formData)
        } else if (currentView === 'password') {
          await onSubmit?.(passwordData)
        } else if (currentView === 'picture' && profilePictureFile) {
          // Upload profile picture
          await uploadProfilePicture(profilePictureFile)
          // Clear state after successful upload
          setProfilePictureFile(null)
          setProfilePicturePreview(null)
        }
      } catch (error) {
        console.error("Failed to update profile:", error)
      } finally {
        setIsSubmitting(false)
      }
    }

    const handleCancel = () => {
      // Reset forms to original data
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

      // Clear profile picture upload state
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


          {/* Dynamic Content based on current view */}
          <div className="flex flex-col gap-6">
            {currentView === 'profile' && (
              <>
                {/* Form Fields */}
                <div className="flex flex-col gap-4">
                  {/* Name and Surname in same row */}
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

                  {/* Email field taking full width */}
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

                {/* Navigation Links */}
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
                </div>

                <div className="space-y-2">
                  <InputField
                    label="New password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange("newPassword")}
                    type="password"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <InputField
                    label="Repeat new password"
                    value={passwordData.repeatNewPassword}
                    onChange={handlePasswordChange("repeatNewPassword")}
                    type="password"
                    disabled={isSubmitting}
                  />
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

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />

                {/* Upload button */}
                <Button
                  variant="tertiary"
                  disabled={isSubmitting || isProfilePictureUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full max-w-[200px]"
                >
                  {isProfilePictureUploading ? "Uploading..." : "Upload new picture"}
                </Button>

                {/* Error message */}
                {uploadError && (
                  <p className="text-sm text-coral-50 text-center max-w-[200px]">
                    {uploadError}
                  </p>
                )}

                </div>
            )}
          </div>

          {/* Action Buttons */}
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