
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
   * @param license The license to update
   * @param increment Whether to increment (true) or decrement (false) the count
   * @returns Updated license
   */
  static async updateUserCount(licenseId: string, increment: boolean = true): Promise<License> {
    try {
      // This is a placeholder - in a real app, this would call the server API
      const mockLicense = await this.getMockLicense(licenseId);
      
      if (!mockLicense) {
        throw new Error("License not found");
      }
      
      if (mockLicense.currentUsers === undefined || mockLicense.maxUsersAllowed === undefined) {
        throw new Error("License does not support user count management");
      }
      
      // Update user count
      if (increment) {
        if (mockLicense.currentUsers >= mockLicense.maxUsersAllowed) {
          throw new Error("License user limit reached");
        }
        mockLicense.currentUsers += 1;
      } else {
        mockLicense.currentUsers = Math.max(0, mockLicense.currentUsers - 1);
      }
      
      return mockLicense;
    } catch (error) {
      console.error("Error updating user count:", error);
      throw error;
    }
  }
  
  /**
   * Get a license by ID (mock implementation)
   * @param licenseId License ID
   * @returns License or undefined if not found
   */
  private static async getMockLicense(licenseId: string): Promise<License | undefined> {
    // In a real implementation, this would call the API
    const { mockLicenses } = await import('@/data/mockLicenses');
    return mockLicenses.find(l => l.id === licenseId);
  }
}
