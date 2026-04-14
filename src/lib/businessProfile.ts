import { supabase } from './supabase';
import { BusinessProfile } from '../types';

export interface BusinessProfileFormData {
  business_name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  npwp: string;
}

export const defaultBusinessProfile: BusinessProfileFormData = {
  business_name: 'WorkOrder Pro',
  email: 'support@workorder.app',
  phone: '+62 812-3456-7890',
  address: 'Jakarta, Indonesia',
  website: '',
  npwp: '',
};

const sanitizeBusinessProfile = (payload?: Partial<BusinessProfile> | null): BusinessProfileFormData => ({
  business_name: payload?.business_name ?? defaultBusinessProfile.business_name,
  email: payload?.email ?? defaultBusinessProfile.email,
  phone: payload?.phone ?? defaultBusinessProfile.phone,
  address: payload?.address ?? defaultBusinessProfile.address,
  website: payload?.website ?? defaultBusinessProfile.website,
  npwp: payload?.npwp ?? defaultBusinessProfile.npwp,
});

export async function getBusinessProfile(userId?: string): Promise<BusinessProfileFormData> {
  if (!userId) return defaultBusinessProfile;

  const { data, error } = await supabase
    .from('business_profiles')
    .select('business_name, email, phone, address, website, npwp')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return defaultBusinessProfile;
  }

  return sanitizeBusinessProfile(data);
}
