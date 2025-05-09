
import { supabase } from "@/integrations/supabase/client";
import type { Customer, License, Product, ProductVersion } from "@/types/license";

// Product Services
export const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*');
  
  if (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
  
  return data.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description,
    versions: [],
    createdAt: new Date(product.created_at),
    updatedAt: new Date(product.updated_at)
  })) || [];
};

export const createProduct = async (product: Omit<Product, "id" | "createdAt" | "updatedAt" | "versions">): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: product.name,
      description: product.description
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating product:", error);
    throw error;
  }
  
  return {
    id: data.id,
    name: data.name, 
    description: data.description,
    versions: [],
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};

// Product Version Services
export const fetchProductVersions = async (): Promise<ProductVersion[]> => {
  const { data, error } = await supabase
    .from('product_versions')
    .select('*');
  
  if (error) {
    console.error("Error fetching product versions:", error);
    throw error;
  }
  
  return data.map(version => ({
    id: version.id,
    productId: version.product_id,
    version: version.version,
    releaseDate: new Date(version.release_date),
    notes: version.notes,
    createdAt: new Date(version.created_at),
    updatedAt: new Date(version.updated_at)
  })) || [];
};

export const createProductVersion = async (version: Omit<ProductVersion, "id" | "createdAt" | "updatedAt">): Promise<ProductVersion> => {
  const { data, error } = await supabase
    .from('product_versions')
    .insert({
      product_id: version.productId,
      version: version.version,
      release_date: version.releaseDate.toISOString().split('T')[0],
      notes: version.notes
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating product version:", error);
    throw error;
  }
  
  return {
    id: data.id,
    productId: data.product_id,
    version: data.version,
    releaseDate: new Date(data.release_date),
    notes: data.notes,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};

// Customer Services
export const fetchCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*');
  
  if (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
  
  return data.map(customer => ({
    id: customer.id,
    name: customer.name,
    location: customer.location,
    country: customer.country,
    contact: customer.contact,
    mobile: customer.mobile,
    email: customer.email,
    createdAt: new Date(customer.created_at),
    updatedAt: new Date(customer.updated_at)
  })) || [];
};

export const createCustomer = async (customer: Omit<Customer, "id" | "createdAt" | "updatedAt">): Promise<Customer> => {
  const { data, error } = await supabase
    .from('customers')
    .insert({
      name: customer.name,
      location: customer.location,
      country: customer.country,
      contact: customer.contact,
      mobile: customer.mobile,
      email: customer.email
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating customer:", error);
    throw error;
  }
  
  return {
    id: data.id,
    name: data.name,
    location: data.location,
    country: data.country,
    contact: data.contact,
    mobile: data.mobile,
    email: data.email,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};

// License Services
export const fetchLicenses = async (): Promise<License[]> => {
  const { data, error } = await supabase
    .from('licenses')
    .select(`
      *,
      customers:customer_id (*)
    `);
  
  if (error) {
    console.error("Error fetching licenses:", error);
    throw error;
  }
  
  return data.map(license => {
    // Handle converting database fields to match our type structure
    const { customers, product_id, product_version_id, customer_id, license_type, license_scope, 
            licensing_period, renewable_alert_message, grace_period_days, expiry_date, 
            max_users_allowed, current_users, created_at, updated_at, ...rest } = license;
    
    return {
      ...rest,
      productId: product_id,
      productVersionId: product_version_id,
      customerId: customer_id,
      customer: customers ? {
        id: customers.id,
        name: customers.name,
        location: customers.location,
        country: customers.country,
        contact: customers.contact,
        mobile: customers.mobile,
        email: customers.email,
        createdAt: new Date(customers.created_at),
        updatedAt: new Date(customers.updated_at)
      } : undefined,
      licenseType: license_type as any,
      licenseScope: license_scope as any,
      licensingPeriod: licensing_period,
      renewableAlertMessage: renewable_alert_message || '',
      gracePeriodDays: grace_period_days,
      expiryDate: expiry_date ? new Date(expiry_date) : undefined,
      maxUsersAllowed: max_users_allowed,
      currentUsers: current_users,
      createdAt: new Date(created_at),
      updatedAt: new Date(updated_at)
    };
  }) || [];
};

export const createLicense = async (license: Omit<License, "id" | "createdAt" | "updatedAt">): Promise<License> => {
  // First, insert the main license record
  const { data, error } = await supabase
    .from('licenses')
    .insert({
      customer_id: license.customerId,
      product_id: license.productId,
      product_version_id: license.productVersionId,
      license_type: license.licenseType,
      license_scope: license.licenseScope,
      licensing_period: license.licensingPeriod,
      renewable_alert_message: license.renewableAlertMessage,
      grace_period_days: license.gracePeriodDays,
      expiry_date: license.expiryDate ? license.expiryDate.toISOString().split('T')[0] : null,
      max_users_allowed: license.maxUsersAllowed,
      current_users: license.currentUsers || 0
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating license:", error);
    throw error;
  }
  
  // Now handle MAC addresses if they exist
  if (license.macAddresses && license.macAddresses.length > 0) {
    const macAddressInserts = license.macAddresses.map(mac => ({
      license_id: data.id,
      mac_address: mac
    }));
    
    const { error: macError } = await supabase
      .from('license_mac_addresses')
      .insert(macAddressInserts);
      
    if (macError) {
      console.error("Error adding MAC addresses:", macError);
    }
  }
  
  // Handle allowed countries if they exist
  if (license.allowedCountries && license.allowedCountries.length > 0) {
    const countryInserts = license.allowedCountries.map(country => ({
      license_id: data.id,
      country_code: country
    }));
    
    const { error: countryError } = await supabase
      .from('license_allowed_countries')
      .insert(countryInserts);
      
    if (countryError) {
      console.error("Error adding allowed countries:", countryError);
    }
  }
  
  // Fetch the full license with customer data
  const { data: fullLicense, error: fetchError } = await supabase
    .from('licenses')
    .select(`
      *,
      customers:customer_id (*)
    `)
    .eq('id', data.id)
    .single();
    
  if (fetchError) {
    console.error("Error fetching complete license:", fetchError);
    throw fetchError;
  }
  
  // Convert to our type structure
  const { customers, product_id, product_version_id, customer_id, license_type, license_scope, 
          licensing_period, renewable_alert_message, grace_period_days, expiry_date, 
          max_users_allowed, current_users, created_at, updated_at, ...rest } = fullLicense;
  
  return {
    ...rest,
    productId: product_id,
    productVersionId: product_version_id,
    customerId: customer_id,
    customer: customers ? {
      id: customers.id,
      name: customers.name,
      location: customers.location,
      country: customers.country,
      contact: customers.contact,
      mobile: customers.mobile,
      email: customers.email,
      createdAt: new Date(customers.created_at),
      updatedAt: new Date(customers.updated_at)
    } : undefined,
    licenseType: license_type as any,
    licenseScope: license_scope as any,
    licensingPeriod: licensing_period,
    renewableAlertMessage: renewable_alert_message || '',
    gracePeriodDays: grace_period_days,
    expiryDate: expiry_date ? new Date(expiry_date) : undefined,
    maxUsersAllowed: max_users_allowed,
    currentUsers: current_users,
    macAddresses: license.macAddresses,
    allowedCountries: license.allowedCountries,
    createdAt: new Date(created_at),
    updatedAt: new Date(updated_at)
  };
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
  const { error } = await supabase
    .from('license_verification_logs')
    .insert({
      license_id: licenseId,
      is_valid: isValid,
      ip_address: details.ipAddress,
      mac_address: details.macAddress,
      country_code: details.countryCode,
      device_info: details.deviceInfo,
      message: details.message
    });
    
  if (error) {
    console.error("Error logging license verification:", error);
    throw error;
  }
};

export const getLicenseVerificationLogs = async (licenseId: string) => {
  const { data, error } = await supabase
    .from('license_verification_logs')
    .select('*')
    .eq('license_id', licenseId)
    .order('verification_date', { ascending: false });
    
  if (error) {
    console.error("Error fetching license verification logs:", error);
    throw error;
  }
  
  return data || [];
};
