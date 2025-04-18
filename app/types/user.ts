import { UserType } from '@prisma/client';

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  userType: UserType;
  credits: number;
  status: boolean;
  phone?: string;
  address?: string;
  location?: string;
  dob?: string;
  gender?: string;
  created_at: string;
  company?: {
    id: string;
    name: string;
  };
  vehicles?: {
    vrn: string;
  }[];
  companyId?: string;
}

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

export interface Company {
  id: string;
  name: string;
  email: string;
  address: string;
  ownerName: string;
  ownerPhone: string;
  contactName: string;
  contactPhone: string;
  status: boolean;
  image?: string;
  gstin?: string;
  pan?: string;
  cin?: string;
  created_at?: Date;
  updated_at?: Date;
}