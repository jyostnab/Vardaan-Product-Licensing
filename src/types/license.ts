
export type LicenseType = 'date_based' | 'user_count_based' | 'mac_based' | 'country_based' | 'mixed';

export type LicenseScope = 'international' | 'local';

export interface Product {
  id: string;
  name: string;
  description: string;
  versions: ProductVersion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVersion {
  id: string;
  productId: string;
  version: string;
  releaseDate: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  location: string;
  country: string;
  contact: string;
  mobile: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface License {
  id: string;
  customerId: string;
  customer?: Customer;
  productId: string;
  productVersionId: string;
  licenseType: LicenseType;
  licenseScope: LicenseScope;
  licensingPeriod: number; // in days
  renewableAlertMessage: string;
  gracePeriodDays: number;
  
  // Date-based licensing
  expiryDate?: Date;
  
  // User count-based licensing
  maxUsersAllowed?: number;
  currentUsers?: number;
  
  // MAC-based licensing
  macAddresses?: string[]; // Array of allowed MAC addresses
  
  // Country-based licensing
  allowedCountries?: string[]; // Array of allowed country codes
  
  createdAt: Date;
  updatedAt: Date;
}

export type LicenseVerificationResult = {
  isValid: boolean;
  warningMessage?: string;
  errorMessage?: string;
  expiresIn?: number; // Days until expiry
  status: 'valid' | 'warning' | 'expired';
};
