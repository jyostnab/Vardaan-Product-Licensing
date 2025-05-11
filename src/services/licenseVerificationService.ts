
import { License, LicenseVerificationResult } from "@/types/license";
import { verifyLicense, getLicenseVerificationLogs, updateUserCount, validateLicenseKey } from "@/services/directDatabaseService";

export class LicenseVerificationService {
  /**
   * Verify if a license is valid
   * @param license The license to verify
   * @param addingUser Whether the verification is for adding a new user
   * @returns License verification result
   */
  static async verifyLicense(license: License, addingUser: boolean = false): Promise<LicenseVerificationResult> {
    try {
      // Get device info from client
      const deviceInfo = navigator.userAgent;
      
      // Use the MAC address and country code if provided, otherwise use defaults from the license
      const macAddress = license.macAddresses?.[0] || null;
      const countryCode = license.allowedCountries?.[0] || license.customer?.country || null;

      // Use API endpoint for verification
      const result = await verifyLicense(
        license,
        addingUser,
        deviceInfo,
        undefined, // IP address will be determined by the server
        macAddress,
        countryCode
      );
      
      // If adding user and verification succeeded, update user count
      if (addingUser && result.isValid && license.licenseType === 'user_count_based' || license.licenseType === 'mixed') {
        try {
          await this.updateUserCount(license.id, true);
          console.log("User count updated successfully");
        } catch (error) {
          console.warn("Error updating user count:", error);
          result.warningMessage = (result.warningMessage || '') + 
            ' User was added but there was an issue updating the count.';
        }
      }
      
      // Ensure status is one of the valid values in LicenseVerificationResult
      const status = result.status as "valid" | "warning" | "expired";
      
      return {
        isValid: result.isValid,
        status: status,
        warningMessage: result.warningMessage,
        errorMessage: result.errorMessage,
        expiresIn: result.expiresIn
      };
    } catch (error) {
      console.error("License verification error:", error);
      
      return {
        isValid: false,
        status: 'expired',
        errorMessage: 'Error verifying license. Please try again.'
      };
    }
  }

  /**
   * Verify a license using a license key
   * @param licenseKey The license key to verify
   * @param macAddress Optional MAC address for MAC-based licenses
   * @param countryCode Optional country code for country-based licenses
   * @returns License verification result
   */
  static async verifyLicenseByKey(licenseKey: string, macAddress?: string, countryCode?: string): Promise<LicenseVerificationResult> {
    try {
      // Use API endpoint for verification
      const result = await validateLicenseKey(
        licenseKey,
        navigator.userAgent,
        macAddress,
        countryCode
      );
      
      // Ensure status is one of the valid values in LicenseVerificationResult
      const status = result.status as "valid" | "warning" | "expired";
      
      return {
        isValid: result.isValid,
        status: status,
        warningMessage: result.warningMessage,
        errorMessage: result.errorMessage,
        expiresIn: result.expiresIn
      };
    } catch (error) {
      console.error("License key verification error:", error);
      
      return {
        isValid: false,
        status: 'expired',
        errorMessage: 'Error verifying license key. Please try again.'
      };
    }
  }

  /**
   * Get verification logs for a license
   * @param licenseId The license ID
   * @returns Array of verification logs
   */
  static async getVerificationLogs(licenseId: string) {
    try {
      return await getLicenseVerificationLogs(licenseId);
    } catch (error) {
      console.error("Error fetching verification logs:", error);
      throw error;
    }
  }
  
  /**
   * Update user count for a license
   * @param licenseId The license ID to update
   * @param increment Whether to increment (true) or decrement (false) the count
   * @returns Updated license
   */
  static async updateUserCount(licenseId: string, increment: boolean = true): Promise<License> {
    try {
      // Call the API to update the user count
      const updatedLicense = await updateUserCount(licenseId, increment);
      return updatedLicense;
    } catch (error) {
      console.error("Error updating user count:", error);
      throw error;
    }
  }
}
