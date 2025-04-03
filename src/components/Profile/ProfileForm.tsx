
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingButton } from '@/components/ui/loading-button';
import { UserRole } from '@/context/UserContext';

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  skills: string;
  role: UserRole;
}

interface ProfileFormProps {
  formData: ProfileFormData;
  formErrors?: Partial<Record<keyof ProfileFormData, string>>;
  isEditing: boolean;
  isAdmin: boolean;
  isSubmitting?: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleRoleChange: (value: string) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  formData,
  formErrors = {},
  isEditing,
  isAdmin,
  isSubmitting = false,
  onSubmit,
  onCancel,
  handleInputChange,
  handleRoleChange,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            disabled={!isEditing || isSubmitting}
            className={formErrors.firstName ? "border-red-500" : ""}
          />
          {formErrors.firstName && (
            <p className="text-red-500 text-sm">{formErrors.firstName}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            disabled={!isEditing || isSubmitting}
            className={formErrors.lastName ? "border-red-500" : ""}
          />
          {formErrors.lastName && (
            <p className="text-red-500 text-sm">{formErrors.lastName}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          value={formData.email}
          disabled={true} // Email should not be editable here
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          disabled={!isEditing || isSubmitting}
          value={formData.role}
          onValueChange={handleRoleChange}
        >
          <SelectTrigger className={formErrors.role ? "border-red-500" : ""}>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {/* Only show admin option if user is already an admin */}
            {isAdmin && <SelectItem value="admin">Administrator</SelectItem>}
            <SelectItem value="recruiter">Recruiter</SelectItem>
            <SelectItem value="candidate">Candidate</SelectItem>
          </SelectContent>
        </Select>
        {formErrors.role && (
          <p className="text-red-500 text-sm">{formErrors.role}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          disabled={!isEditing || isSubmitting}
          rows={4}
          className={formErrors.bio ? "border-red-500" : ""}
        />
        {formErrors.bio && (
          <p className="text-red-500 text-sm">{formErrors.bio}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills">Skills (comma separated)</Label>
        <Textarea
          id="skills"
          name="skills"
          value={formData.skills}
          onChange={handleInputChange}
          disabled={!isEditing || isSubmitting}
          rows={3}
          className={formErrors.skills ? "border-red-500" : ""}
        />
        {formErrors.skills && (
          <p className="text-red-500 text-sm">{formErrors.skills}</p>
        )}
      </div>

      {isEditing && (
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <LoadingButton 
            type="submit" 
            isLoading={isSubmitting}
            loadingText="Saving..."
          >
            Save Changes
          </LoadingButton>
        </div>
      )}
    </form>
  );
};

export default ProfileForm;
