
import { License, LicenseVerificationResult } from "@/types/license";
import axios from "axios";

// Set up axios instance
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

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

      const response = await api.post('/licenses/verify', {
        licenseId: license.id,
        addUser: addingUser,
        macAddress,
        countryCode,
        deviceInfo
      });

      return response.data;
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
      const response = await api.get(`/licenses/${licenseId}/logs`);
      return response.data;
    } catch (error) {
      console.error("Error fetching verification logs:", error);
      throw error;
    }
  }
}
