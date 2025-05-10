
import axios from "axios";
import type { Customer, License, Product, ProductVersion } from "@/types/license";

// Set up axios instance
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Helper function to set auth token for API requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Product Services
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get("/products");
    
    return response.data.map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      versions: product.versions?.map((version: any) => ({
        id: version.id,
        productId: version.product_id,
        version: version.version,
        releaseDate: new Date(version.release_date),
        notes: version.notes,
        createdAt: new Date(version.created_at),
        updatedAt: new Date(version.updated_at)
      })) || [],
      createdAt: new Date(product.created_at),
      updatedAt: new Date(product.updated_at)
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const createProduct = async (product: Omit<Product, "id" | "createdAt" | "updatedAt" | "versions">): Promise<Product> => {
  try {
    const response = await api.post("/products", {
      name: product.name,
      description: product.description
    });
    
    return {
      id: response.data.id,
      name: response.data.name,
      description: response.data.description,
      versions: [],
      createdAt: new Date(response.data.created_at),
      updatedAt: new Date(response.data.updated_at)
    };
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  try {
    const response = await api.put(`/products/${id}`, {
      name: product.name,
      description: product.description
    });
    
    // The API returns a success message, not the full product
    // We need to fetch the product again to get the updated data
    const updatedProduct = await api.get(`/products/${id}`);
    
    return {
      id: updatedProduct.data.id,
      name: updatedProduct.data.name,
      description: updatedProduct.data.description,
      versions: updatedProduct.data.versions?.map((version: any) => ({
        id: version.id,
        productId: version.product_id,
        version: version.version,
        releaseDate: new Date(version.release_date),
        notes: version.notes,
        createdAt: new Date(version.created_at),
        updatedAt: new Date(version.updated_at)
      })) || [],
      createdAt: new Date(updatedProduct.data.created_at),
      updatedAt: new Date(updatedProduct.data.updated_at)
    };
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await api.delete(`/products/${id}`);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Product Version Services
export const fetchProductVersions = async (): Promise<ProductVersion[]> => {
  try {
    const response = await api.get("/product-versions");
    
    return response.data.map((version: any) => ({
      id: version.id,
      productId: version.product_id,
      version: version.version,
      releaseDate: new Date(version.release_date),
      notes: version.notes,
      createdAt: new Date(version.created_at),
      updatedAt: new Date(version.updated_at)
    }));
  } catch (error) {
    console.error("Error fetching product versions:", error);
    throw error;
  }
};

export const createProductVersion = async (version: Omit<ProductVersion, "id" | "createdAt" | "updatedAt">): Promise<ProductVersion> => {
  try {
    const response = await api.post("/product-versions", {
      product_id: version.productId,
      version: version.version,
      release_date: version.releaseDate.toISOString(),
      notes: version.notes
    });
    
    return {
      id: response.data.id,
      productId: response.data.product_id,
      version: response.data.version,
      releaseDate: new Date(response.data.release_date),
      notes: response.data.notes,
      createdAt: new Date(response.data.created_at),
      updatedAt: new Date(response.data.updated_at)
    };
  } catch (error) {
    console.error("Error creating product version:", error);
    throw error;
  }
};

export const updateProductVersion = async (id: string, version: Partial<ProductVersion>): Promise<ProductVersion> => {
  try {
    const updateData: any = {};
    
    if (version.version) updateData.version = version.version;
    if (version.releaseDate) updateData.release_date = version.releaseDate.toISOString();
    if (version.notes) updateData.notes = version.notes;
    
    const response = await api.put(`/product-versions/${id}`, updateData);
    
    // The API returns a success message, not the full version
    // We need to fetch the version again to get the updated data
    const updatedVersion = await api.get(`/product-versions/${id}`);
    
    return {
      id: updatedVersion.data.id,
      productId: updatedVersion.data.product_id,
      version: updatedVersion.data.version,
      releaseDate: new Date(updatedVersion.data.release_date),
      notes: updatedVersion.data.notes,
      createdAt: new Date(updatedVersion.data.created_at),
      updatedAt: new Date(updatedVersion.data.updated_at)
    };
  } catch (error) {
    console.error("Error updating product version:", error);
    throw error;
  }
};

export const deleteProductVersion = async (id: string): Promise<void> => {
  try {
    await api.delete(`/product-versions/${id}`);
  } catch (error) {
    console.error("Error deleting product version:", error);
    throw error;
  }
};

// Customer Services
export const fetchCustomers = async (): Promise<Customer[]> => {
  try {
    const response = await api.get("/customers");
    
    return response.data.map((customer: any) => ({
      id: customer.id,
      name: customer.name,
      location: customer.location,
      country: customer.country,
      contact: customer.contact,
      mobile: customer.mobile,
      email: customer.email,
      createdAt: new Date(customer.created_at),
      updatedAt: new Date(customer.updated_at)
    }));
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
};

export const createCustomer = async (customer: Omit<Customer, "id" | "createdAt" | "updatedAt">): Promise<Customer> => {
  try {
    const response = await api.post("/customers", {
      name: customer.name,
      location: customer.location,
      country: customer.country,
      contact: customer.contact,
      mobile: customer.mobile,
      email: customer.email
    });
    
    return {
      id: response.data.id,
      name: response.data.name,
      location: response.data.location,
      country: response.data.country,
      contact: response.data.contact,
      mobile: response.data.mobile,
      email: response.data.email,
      createdAt: new Date(response.data.created_at),
      updatedAt: new Date(response.data.updated_at)
    };
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error;
  }
};

export const updateCustomer = async (id: string, customer: Partial<Customer>): Promise<Customer> => {
  try {
    const updateData: any = {};
    
    if (customer.name) updateData.name = customer.name;
    if (customer.location) updateData.location = customer.location;
    if (customer.country) updateData.country = customer.country;
    if (customer.contact) updateData.contact = customer.contact;
    if (customer.mobile) updateData.mobile = customer.mobile;
    if (customer.email) updateData.email = customer.email;
    
    const response = await api.put(`/customers/${id}`, updateData);
    
    // The API returns a success message, not the full customer
    // We need to fetch the customer again to get the updated data
    const updatedCustomer = await api.get(`/customers/${id}`);
    
    return {
      id: updatedCustomer.data.id,
      name: updatedCustomer.data.name,
      location: updatedCustomer.data.location,
      country: updatedCustomer.data.country,
      contact: updatedCustomer.data.contact,
      mobile: updatedCustomer.data.mobile,
      email: updatedCustomer.data.email,
      createdAt: new Date(updatedCustomer.data.created_at),
      updatedAt: new Date(updatedCustomer.data.updated_at)
    };
  } catch (error) {
    console.error("Error updating customer:", error);
    throw error;
  }
};

export const deleteCustomer = async (id: string): Promise<void> => {
  try {
    await api.delete(`/customers/${id}`);
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw error;
  }
};

// License Services
export const fetchLicenses = async (): Promise<License[]> => {
  try {
    const response = await api.get("/licenses");
    return response.data;  // The API already formats this to match our frontend types
  } catch (error) {
    console.error("Error fetching licenses:", error);
    throw error;
  }
};

export const createLicense = async (license: Omit<License, "id" | "createdAt" | "updatedAt">): Promise<License> => {
  try {
    // Convert frontend field names to backend field names
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
    
    const response = await api.post("/licenses", licenseData);
    return response.data;  // The API already formats this to match our frontend types
  } catch (error) {
    console.error("Error creating license:", error);
    throw error;
  }
};

export const updateLicense = async (id: string, license: Partial<License>): Promise<License> => {
  try {
    // Convert frontend field names to backend field names
    const updateData: any = {};
    
    if (license.customerId) updateData.customer_id = license.customerId;
    if (license.productId) updateData.product_id = license.productId;
    if (license.productVersionId) updateData.product_version_id = license.productVersionId;
    if (license.licenseType) updateData.license_type = license.licenseType;
    if (license.licenseScope) updateData.license_scope = license.licenseScope;
    if (license.licensingPeriod !== undefined) updateData.licensing_period = license.licensingPeriod;
    if (license.renewableAlertMessage !== undefined) updateData.renewable_alert_message = license.renewableAlertMessage;
    if (license.gracePeriodDays !== undefined) updateData.grace_period_days = license.gracePeriodDays;
    if (license.expiryDate) updateData.expiry_date = license.expiryDate.toISOString();
    if (license.maxUsersAllowed !== undefined) updateData.max_users_allowed = license.maxUsersAllowed;
    if (license.currentUsers !== undefined) updateData.current_users = license.currentUsers;
    if (license.macAddresses) updateData.mac_addresses = license.macAddresses;
    if (license.allowedCountries) updateData.allowed_countries = license.allowedCountries;
    
    const response = await api.put(`/licenses/${id}`, updateData);
    return response.data.data;  // The API already formats this to match our frontend types
  } catch (error) {
    console.error("Error updating license:", error);
    throw error;
  }
};

export const deleteLicense = async (id: string): Promise<void> => {
  try {
    await api.delete(`/licenses/${id}`);
  } catch (error) {
    console.error("Error deleting license:", error);
    throw error;
  }
};

// License verification
export const logLicenseVerification = async (
  licenseId: string, 
  isValid: boolean, 
  details: {
    ipAddress?: string;
    macAddress?: string;
    countryCode?: string;
    deviceInfo?: string;
    message?: string;
  }
): Promise<void> => {
  try {
    await api.post(`/licenses/verify`, {
      licenseId,
      isValid,
      ipAddress: details.ipAddress,
      macAddress: details.macAddress,
      countryCode: details.countryCode,
      deviceInfo: details.deviceInfo,
      message: details.message
    });
  } catch (error) {
    console.error("Error logging license verification:", error);
    throw error;
  }
};

export const getLicenseVerificationLogs = async (licenseId: string) => {
  try {
    const response = await api.get(`/licenses/${licenseId}/logs`);
    return response.data;
  } catch (error) {
    console.error("Error fetching license verification logs:", error);
    throw error;
  }
};

// Auth Services
export const register = async (username: string, email: string, password: string, role?: string) => {
  try {
    const response = await api.post("/auth/register", {
      username,
      email,
      password,
      role
    });
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const login = async (username: string, password: string) => {
  try {
    const response = await api.post("/auth/login", {
      username,
      password
    });
    
    // Set the token for future API calls
    if (response.data.token) {
      localStorage.setItem("auth-token", response.data.token);
      setAuthToken(response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("auth-token");
  setAuthToken(null);
};

export const getCurrentUser = async () => {
  try {
    // Check if we have a token in local storage
    const token = localStorage.getItem("auth-token");
    if (!token) {
      return null;
    }
    
    // Set token in axios headers
    setAuthToken(token);
    
    // Get user info
    const response = await api.get("/auth/me");
    return response.data.user;
  } catch (error) {
    console.error("Error getting current user:", error);
    logout(); // Clear invalid token
    return null;
  }
};
