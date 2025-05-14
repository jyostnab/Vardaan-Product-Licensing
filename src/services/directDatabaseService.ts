import type { Customer, License, Product, ProductVersion, LicenseVerificationResult } from "@/types/license";

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Helper function for API requests
async function apiRequest(endpoint: string, method: string = 'GET', data?: any) {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    console.log(`Making ${method} request to ${API_BASE_URL}/${endpoint}`);
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed: ${response.status} ${errorText}`);
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error(`API request error for ${endpoint}:`, error);
    throw error;
  }
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

export const fetchProductVersionsByProductId = async (productId: string): Promise<ProductVersion[]> => {
  try {
    const data = await apiRequest(`productVersions/by-product/${productId}`);
    return data;
  } catch (error) {
    console.error(`Error fetching product versions for product ${productId}:`, error);
    throw error;
  }
};

export const createProductVersion = async (version: Omit<ProductVersion, "id" | "createdAt" | "updatedAt">): Promise<ProductVersion> => {
  try {
    // Map the frontend model to the backend model
    const versionData = {
      product_id: version.productId,
      version: version.version,
      release_date: new Date(version.releaseDate),
      notes: version.notes
    };
    
    const data = await apiRequest('productVersions', 'POST', versionData);
    
    // Map the response back to the frontend model format
    return {
      id: data.id,
      productId: data.product_id,
      version: data.version,
      releaseDate: new Date(data.release_date),
      notes: data.notes || "",
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error("Error creating product version:", error);
    throw error;
  }
};

export const updateProductVersion = async (id: string, version: Partial<ProductVersion>): Promise<ProductVersion> => {
  try {
    // Map the frontend model to the backend model for update
    const versionData: any = {};
    if (version.version) versionData.version = version.version;
    if (version.releaseDate) versionData.release_date = new Date(version.releaseDate);
    if (version.notes !== undefined) versionData.notes = version.notes;
    
    const data = await apiRequest(`productVersions/${id}`, 'PUT', versionData);
    
    // Return expected format even though the API might return { message: "..." }
    return {
      id,
      ...(version as any), // Include the partial updates
      updatedAt: new Date()
    };
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

export const fetchCustomersByProductAndVersion = async (productId: string, versionStr: string) => {
  try {
    console.log(`Fetching customers for product ID: ${productId}, version: ${versionStr}`);
    
    // Get product name for the query
    const product = await apiRequest(`products/${productId}`);
    if (!product) {
      console.error(`Product not found with ID: ${productId}`);
      return [];
    }

    // Use the apiRequest helper function to get customers with valid licenses
    const data = await apiRequest(`licenses/customers-by-product`, 'POST', {
      productName: product.name,
      version: versionStr
    });
    
    console.log('API Response:', data);
    
    if (!data) {
      console.error('No data returned from API');
      return [];
    }
    
    // If the response is a single customer object, convert it to an array
    const customers = Array.isArray(data) ? data : [data];
    
    return customers;
  } catch (error) {
    console.error("Failed to fetch customers by product and version:", error);
    return [];
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
    // Transform camelCase to snake_case for backend
    const licenseData = {
      customer_id: license.customerId,
      product_id: license.productId,
      product_version_id: license.productVersionId,
      license_type: license.licenseType,
      license_scope: license.licenseScope,
      licensing_period: license.licensingPeriod,
      renewable_alert_message: license.renewableAlertMessage,
      grace_period_days: license.gracePeriodDays,
      expiry_date: license.expiryDate ? license.expiryDate.toISOString() : undefined,
      max_users_allowed: license.maxUsersAllowed,
      current_users: license.currentUsers || 0,
      mac_addresses: license.macAddresses,
      allowed_countries: license.allowedCountries
    };
    
    console.log("Transformed license data for API:", licenseData);
    const data = await apiRequest('licenses', 'POST', licenseData);
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

// Add helper function to initialize test data for GRC product
export const initializeGRCVersions = async (grcProductId: string): Promise<ProductVersion[]> => {
  try {
    console.log(`Initializing test versions for GRC product ${grcProductId}`);
    
    // Check if versions already exist for GRC
    const existingVersions = await fetchProductVersionsByProductId(grcProductId);
    
    if (existingVersions.length > 0) {
      console.log(`GRC product already has ${existingVersions.length} versions`);
      return existingVersions;
    }
    
    // Create sample versions for GRC
    const versions = [
      {
        productId: grcProductId,
        version: "1.0.0",
        releaseDate: new Date(),
        notes: "Initial release"
      },
      {
        productId: grcProductId,
        version: "1.5.0",
        releaseDate: new Date(),
        notes: "Feature update"
      },
      {
        productId: grcProductId,
        version: "2.0.0",
        releaseDate: new Date(),
        notes: "Major release"
      }
    ];
    
    // Create each version
    const createdVersions = [];
    for (const version of versions) {
      const createdVersion = await createProductVersion(version);
      createdVersions.push(createdVersion);
    }
    
    console.log(`Created ${createdVersions.length} versions for GRC product`);
    return createdVersions;
  } catch (error) {
    console.error("Error initializing GRC versions:", error);
    throw error;
  }
};
