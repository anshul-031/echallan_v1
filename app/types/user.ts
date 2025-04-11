export interface ProfileUpdateData {
  name?: string;
  gender?: string;
  dob?: string | Date;
  doj?: string | Date;
  designation?: string;
  reportTo?: string;
  location?: string;
  address?: string;
}

export interface PasswordChangeData {
  oldPassword: string;
  newPassword: string;
}