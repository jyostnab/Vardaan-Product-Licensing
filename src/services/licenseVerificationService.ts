
import { License, LicenseVerificationResult } from "@/types/license";

export class LicenseVerificationService {
  /**
   * Verify if a date-based license is valid
   */
  static verifyDateBasedLicense(license: License): LicenseVerificationResult {
    if (!license.expiryDate) {
      return {
        isValid: false,
        errorMessage: "This license does not have an expiry date.",
        status: "expired"
      };
    }

    const today = new Date();
    const expiryDate = new Date(license.expiryDate);
    const timeDiff = expiryDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // If the license has expired
    if (today > expiryDate) {
      return {
        isValid: false,
        errorMessage: "The license has expired. Please renew your license to continue.",
        status: "expired"
      };
    }
    
    // If the license will expire in less than 30 days
    if (daysRemaining <= 30) {
      return {
        isValid: true,
        warningMessage: `${license.renewableAlertMessage || "Your license will expire soon."} Only ${daysRemaining} days remaining.`,
        expiresIn: daysRemaining,
        status: "warning"
      };
    }
    
    // License is valid and not about to expire
    return {
      isValid: true,
      expiresIn: daysRemaining,
      status: "valid"
    };
  }

  /**
   * Verify if a user count-based license is valid
   */
  static verifyUserCountBasedLicense(license: License, addingUser = false): LicenseVerificationResult {
    if (license.maxUsersAllowed === undefined || license.currentUsers === undefined) {
      return {
        isValid: false,
        errorMessage: "This license does not have user count information.",
        status: "expired"
      };
    }
    
    const currentUsers = license.currentUsers;
    const maxUsers = license.maxUsersAllowed;
    const projectedUsers = addingUser ? currentUsers + 1 : currentUsers;
    
    // If we're already at or above max users
    if (projectedUsers > maxUsers) {
      return {
        isValid: false,
        errorMessage: `Maximum user limit (${maxUsers}) reached. Please upgrade your license to add more users.`,
        status: "expired"
      };
    }
    
    // If we're approaching the user limit
    if (projectedUsers >= maxUsers * 0.8) {
      return {
        isValid: true,
        warningMessage: `You are approaching your user limit. Currently using ${currentUsers} of ${maxUsers} licenses.`,
        status: "warning"
      };
    }
    
    // License is valid with plenty of users available
    return {
      isValid: true,
      status: "valid"
    };
  }

  /**
   * Verify if a MAC-based license is valid
   */
  static async verifyMacBasedLicense(license: License): Promise<LicenseVerificationResult> {
    if (!license.macAddresses || license.macAddresses.length === 0) {
      return {
        isValid: false,
        errorMessage: "This license does not have MAC address information.",
        status: "expired"
      };
    }
    
    try {
      // Note: In a browser environment, getting the actual MAC address is not possible
      // for security and privacy reasons. This is a simplified simulation.
      // In a real-world scenario, you would use Node.js or another backend approach
      const currentMac = await this.simulateGetMacAddress();
      
      if (!license.macAddresses.includes(currentMac)) {
        return {
          isValid: false,
          errorMessage: "This device is not authorized to use this license.",
          status: "expired"
        };
      }
      
      return {
        isValid: true,
        status: "valid"
      };
    } catch (error) {
      return {
        isValid: false,
        errorMessage: "Failed to verify MAC address.",
        status: "expired"
      };
    }
  }

  /**
   * Verify if a country-based license is valid
   */
  static async verifyCountryBasedLicense(license: License): Promise<LicenseVerificationResult> {
    if (!license.allowedCountries || license.allowedCountries.length === 0) {
      return {
        isValid: false,
        errorMessage: "This license does not have country restriction information.",
        status: "expired"
      };
    }
    
    try {
      const currentCountry = await this.simulateGetCountryFromIP();
      
      if (!license.allowedCountries.includes(currentCountry)) {
        return {
          isValid: false,
          errorMessage: `This license is not valid in your current location (${currentCountry}).`,
          status: "expired"
        };
      }
      
      return {
        isValid: true,
        status: "valid"
      };
    } catch (error) {
      return {
        isValid: false,
        errorMessage: "Failed to verify country location.",
        status: "expired"
      };
    }
  }

  /**
   * Verify a mixed license type (combination of multiple license types)
   */
  static async verifyMixedLicense(license: License, addingUser = false): Promise<LicenseVerificationResult> {
    const results: LicenseVerificationResult[] = [];
    
    // Check date-based licensing if applicable
    if (license.expiryDate) {
      results.push(this.verifyDateBasedLicense(license));
    }
    
    // Check user count-based licensing if applicable
    if (license.maxUsersAllowed !== undefined && license.currentUsers !== undefined) {
      results.push(this.verifyUserCountBasedLicense(license, addingUser));
    }
    
    // Check MAC-based licensing if applicable
    if (license.macAddresses && license.macAddresses.length > 0) {
      results.push(await this.verifyMacBasedLicense(license));
    }
    
    // Check country-based licensing if applicable
    if (license.allowedCountries && license.allowedCountries.length > 0) {
      results.push(await this.verifyCountryBasedLicense(license));
    }
    
    // Find any failed verifications
    const failedResults = results.filter(result => !result.isValid);
    if (failedResults.length > 0) {
      // Return the first failed result
      return failedResults[0];
    }
    
    // Find any warnings
    const warningResults = results.filter(result => result.status === "warning");
    if (warningResults.length > 0) {
      // Return the first warning result
      return warningResults[0];
    }
    
    // If all passed, license is valid
    return {
      isValid: true,
      status: "valid"
    };
  }
  
  /**
   * Verify a license based on its type
   */
  static async verifyLicense(license: License, addingUser = false): Promise<LicenseVerificationResult> {
    switch (license.licenseType) {
      case 'date_based':
        return this.verifyDateBasedLicense(license);
      
      case 'user_count_based':
        return this.verifyUserCountBasedLicense(license, addingUser);
      
      case 'mac_based':
        return await this.verifyMacBasedLicense(license);
      
      case 'country_based':
        return await this.verifyCountryBasedLicense(license);
      
      case 'mixed':
        return await this.verifyMixedLicense(license, addingUser);
      
      default:
        return {
          isValid: false,
          errorMessage: "Unknown license type.",
          status: "expired"
        };
    }
  }
  
  // Simulate getting the MAC address
  // In a real implementation, this would be handled by the backend
  private static async simulateGetMacAddress(): Promise<string> {
    // For demo purposes, let's simulate a MAC address
    // In a real application, you would get this from the server-side
    return "00:1A:2B:3C:4D:5E"; 
  }
  
  // Simulate getting the country from IP
  // In a real implementation, this would be handled by the backend
  private static async simulateGetCountryFromIP(): Promise<string> {
    // For demo purposes, let's simulate a country code
    // In a real application, you would use a geo-IP service
    return "US"; 
  }
}
