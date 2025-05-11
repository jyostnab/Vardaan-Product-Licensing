import type { Customer, License, Product, ProductVersion, LicenseVerificationResult } from "@/types/license";

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Helper function for API requests
async function apiRequest(endpoint: string, method: string = 'GET', data?: any) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}/${endpoint}`, options);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${errorText}`);
  }
  return response.json();
}

// Product Services
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const data = await apiRequest('products');
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const createProduct = async (product: Omit<Product, "id" | "createdAt" | "updatedAt" | "versions">): Promise<Product> => {
  try {
    const data = await apiRequest('products', 'POST', product);
    return data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  try {
    const data = await apiRequest(`products/${id}`, 'PUT', product);
    return data.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await apiRequest(`products/${id}`, 'DELETE');
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Product Version Services
export const fetchProductVersions = async (): Promise<ProductVersion[]> => {
  try {
    const data = await apiRequest('productVersions');
    return data;
  } catch (error) {
    console.error("Error fetching product versions:", error);
    throw error;
  }
};

export const createProductVersion = async (version: Omit<ProductVersion, "id" | "createdAt" | "updatedAt">): Promise<ProductVersion> => {
  try {
    const data = await apiRequest('productVersions', 'POST', version);
    return data;
  } catch (error) {
    console.error("Error creating product version:", error);
    throw error;
  }
};

export const updateProductVersion = async (id: string, version: Partial<ProductVersion>): Promise<ProductVersion> => {
  try {
    const data = await apiRequest(`productVersions/${id}`, 'PUT', version);
    return data.data;
  } catch (error) {
    console.error("Error updating product version:", error);
    throw error;
  }
};

export const deleteProductVersion = async (id: string): Promise<void> => {
  try {
    await apiRequest(`productVersions/${id}`, 'DELETE');
  } catch (error) {
    console.error("Error deleting product version:", error);
    throw error;
  }
};

// Customer Services
export const fetchCustomers = async (): Promise<Customer[]> => {
  try {
    const data = await apiRequest('customers');
    return data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
};

export const createCustomer = async (customer: Omit<Customer, "id" | "createdAt" | "updatedAt">): Promise<Customer> => {
  try {
    const data = await apiRequest('customers', 'POST', customer);
    return data;
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error;
  }
};

export const updateCustomer = async (id: string, customer: Partial<Customer>): Promise<Customer> => {
  try {
    const data = await apiRequest(`customers/${id}`, 'PUT', customer);
    return data.data;
  } catch (error) {
    console.error("Error updating customer:", error);
    throw error;
  }
};

export const deleteCustomer = async (id: string): Promise<void> => {
  try {
    await apiRequest(`customers/${id}`, 'DELETE');
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw error;
  }
};

// License Services
export const fetchLicenses = async (): Promise<License[]> => {
  try {
    const data = await apiRequest('licenses');
    return data;
  } catch (error) {
    console.error("Error fetching licenses:", error);
    throw error;
  }
};

export const createLicense = async (license: Omit<License, "id" | "createdAt" | "updatedAt">): Promise<License> => {
  try {
    const data = await apiRequest('licenses', 'POST', license);
    return data;
  } catch (error) {
    console.error("Error creating license:", error);
    throw error;
  }
};

export const updateLicense = async (id: string, license: Partial<License>): Promise<License> => {
  try {
    const data = await apiRequest(`licenses/${id}`, 'PUT', license);
    return data.data;
  } catch (error) {
    console.error("Error updating license:", error);
    throw error;
  }
};

export const deleteLicense = async (id: string): Promise<void> => {
  try {
    await apiRequest(`licenses/${id}`, 'DELETE');
  } catch (error) {
    console.error("Error deleting license:", error);
    throw error;
  }
};

// License verification
export const verifyLicense = async (
  license: License,
  addingUser: boolean = false,
  deviceInfo: string = navigator.userAgent,
  ipAddress?: string,
  macAddress?: string,
  countryCode?: string
) => {
  try {
    const data = await apiRequest(`licenses/verify`, 'POST', {
      licenseId: license.id,
      addUser: addingUser,
      deviceInfo,
      ipAddress,
      macAddress,
      countryCode
    });
    
    return data;
  } catch (error) {
    console.error("Error verifying license:", error);
    throw error;
  }
};

// Update user count for a license
export const updateUserCount = async (
  licenseId: string,
  increment: boolean = true
) => {
  try {
    const data = await apiRequest(`licenses/${licenseId}/user-count`, 'PUT', {
      increment
    });
    
    return data;
  } catch (error) {
    console.error("Error updating user count:", error);
    throw error;
  }
};

export const getLicenseVerificationLogs = async (licenseId: string) => {
  try {
    const data = await apiRequest(`licenses/${licenseId}/logs`);
    return data;
  } catch (error) {
    console.error("Error fetching license verification logs:", error);
    throw error;
  }
};

// New function to check license status
export const checkLicenseStatus = async (licenseId: string): Promise<LicenseVerificationResult> => {
  try {
    const data = await apiRequest(`licenses/${licenseId}/status`);
    return data;
  } catch (error) {
    console.error("Error checking license status:", error);
    throw error;
  }
};

// New function to generate license key
export const generateLicenseKey = async (licenseDetails: {
  productId: string;
  customerId: string;
  licenseType: string;
  licenseScope?: string;
  expiryDate?: Date;
  maxUsersAllowed?: number;
}) => {
  try {
    const data = await apiRequest('licenses/generate-key', 'POST', licenseDetails);
    return data;
  } catch (error) {
    console.error("Error generating license key:", error);
    throw error;
  }
};

// New function to validate a license key from an external system
export const validateLicenseKey = async (licenseKey: string, deviceInfo?: string, macAddress?: string, countryCode?: string) => {
  try {
    const data = await apiRequest('licenses/validate-key', 'POST', {
      licenseKey,
      deviceInfo: deviceInfo || navigator.userAgent,
      macAddress,
      countryCode
    });
    return data;
  } catch (error) {
    console.error("Error validating license key:", error);
    throw error;
  }
};

// New function to get license details by key
export const getLicenseByKey = async (licenseKey: string): Promise<License> => {
  try {
    const data = await apiRequest(`licenses/by-key/${licenseKey}`);
    return data;
  } catch (error) {
    console.error("Error fetching license by key:", error);
    throw error;
  }
};

// Auth Services
export const register = async (username: string, email: string, password: string, role?: string) => {
  try {
    const data = await apiRequest('auth/register', 'POST', { username, email, password, role });
    return data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const login = async (username: string, password: string) => {
  try {
    const data = await apiRequest('auth/login', 'POST', { username, password });
    return data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const logout = () => {
  // Clear local storage or session storage
  localStorage.removeItem("currentUser");
};

export const getCurrentUser = async () => {
  const mockUser = localStorage.getItem("currentUser");
  return mockUser ? JSON.parse(mockUser) : null;
};
