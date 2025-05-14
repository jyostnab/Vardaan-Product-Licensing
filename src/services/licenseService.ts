import { supabase } from '@/lib/supabaseClient';

export const createLicense = async (licenseData: Partial<License>): Promise<License> => {
  // Ensure currentUsers starts at 0 for user_count_based licenses
  if (
    licenseData.licenseType === 'user_count_based' || 
    licenseData.licenseType === 'mixed' || 
    (typeof licenseData.licenseType === 'string' && licenseData.licenseType.includes('user_count_based'))
  ) {
    licenseData.currentUsers = 0; // Force currentUsers to 0 for new licenses
  }
  
  try {
    // Add your actual license creation logic here
    const { data, error } = await supabase
      .from('licenses')
      .insert(licenseData)
      .select('*')
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating license:', error);
    throw error;
  }
}; 