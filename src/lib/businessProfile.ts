import { supabase } from './supabase';
import { BusinessProfile } from '../types';

export interface BusinessProfileFormData {
  business_name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  npwp: string;
  terms: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_holder: string;
}

export const defaultBusinessProfile: BusinessProfileFormData = {
  business_name: 'WorkOrder Pro',
  email: 'support@workorder.app',
  phone: '+62 812-3456-7890',
  address: 'Jakarta, Indonesia',
  website: '',
  npwp: '',
  terms: 'Semua pekerjaan dijamin hingga 30 hari. Hubungi kami jika ada pertanyaan terkait layanan ini.',
  bank_name: '',
  bank_account_number: '',
  bank_account_holder: '',
};

const sanitizeBusinessProfile = (payload?: Partial<BusinessProfile> | null): BusinessProfileFormData => ({
  business_name: payload?.business_name ?? defaultBusinessProfile.business_name,
  email: payload?.email ?? defaultBusinessProfile.email,
  phone: payload?.phone ?? defaultBusinessProfile.phone,
  address: payload?.address ?? defaultBusinessProfile.address,
  website: payload?.website ?? defaultBusinessProfile.website,
  npwp: payload?.npwp ?? defaultBusinessProfile.npwp,
  terms: payload?.terms ?? defaultBusinessProfile.terms,
  bank_name: payload?.bank_name ?? defaultBusinessProfile.bank_name,
  bank_account_number: payload?.bank_account_number ?? defaultBusinessProfile.bank_account_number,
  bank_account_holder: payload?.bank_account_holder ?? defaultBusinessProfile.bank_account_holder,
});

export async function getBusinessProfile(userId?: string): Promise<BusinessProfileFormData> {
  if (!userId) return defaultBusinessProfile;

  const { data, error } = await supabase
    .from('business_profiles')
    .select('business_name, email, phone, address, website, npwp, terms, bank_name, bank_account_number, bank_account_holder')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return defaultBusinessProfile;
  }

  return sanitizeBusinessProfile(data);
}
