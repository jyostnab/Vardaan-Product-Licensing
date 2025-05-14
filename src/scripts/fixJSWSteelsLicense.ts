import { supabase } from '@/lib/supabaseClient';

export const fixJSWSteelsLicense = async () => {
  try {
    // Find the JSW Steels license with the issue
    const { data: licenses, error: findError } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_type', 'mixed')
      .eq('current_users', 9)
      .eq('max_users_allowed', 9);
      
    if (findError) throw findError;
    
    if (licenses && licenses.length > 0) {
      console.log(`Found ${licenses.length} licenses to fix`);
      
      // Update each matching license
      for (const license of licenses) {
        const { data, error } = await supabase
          .from('licenses')
          .update({ current_users: 0 })
          .eq('id', license.id);
          
        if (error) {
          console.error(`Error updating license ${license.id}:`, error);
        } else {
          console.log(`Successfully updated license ${license.id}`);
        }
      }
    } else {
      console.log('No matching licenses found');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error fixing licenses:', error);
    return { success: false, error };
  }
};

// Execute the function if this file is run directly
if (require.main === module) {
  fixJSWSteelsLicense()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} 