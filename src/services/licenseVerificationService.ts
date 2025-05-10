
import { License, LicenseVerificationResult } from "@/types/license";
import { verifyLicense, getLicenseVerificationLogs } from "@/services/directDatabaseService";

export class LicenseVerificationService {
  /**
   * Verify if a license is valid
   * @param license The license to verify
   * @param addingUser Whether the verification is for adding a new user
   * @returns License verification result
   */
  static async verifyLicense(license: License, addingUser: boolean = false): Promise<LicenseVerificationResult> {
    try {
      // Get client's MAC address and country (in a real environment)
      // For demo purposes, we simulate these values
      const macAddress = license.macAddresses?.[0] || null;
      const countryCode = license.allowedCountries?.[0] || license.customer?.country || null;
      const deviceInfo = navigator.userAgent;

      // Use direct database call instead of API
      return await verifyLicense(
        license,
        addingUser,
        deviceInfo,
        undefined, // IP address will be determined by the server
        macAddress,
        countryCode
      );
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
}
