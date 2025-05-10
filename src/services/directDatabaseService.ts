
import mysql from 'mysql2/promise';
import type { Customer, License, Product, ProductVersion } from "@/types/license";

// Database connection configuration
const dbConfig = {
  host: import.meta.env.VITE_DB_HOST || 'localhost',
  user: import.meta.env.VITE_DB_USER || 'root',
  password: import.meta.env.VITE_DB_PASSWORD || '',
  database: import.meta.env.VITE_DB_NAME || 'vardaan_licensing',
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Helper function to format database rows to match frontend types
const formatProduct = (row: any): Product => ({
  id: row.id,
  name: row.name,
  description: row.description,
  versions: [],
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
});

const formatProductVersion = (row: any): ProductVersion => ({
  id: row.id,
  productId: row.product_id,
  version: row.version,
  releaseDate: new Date(row.release_date),
  notes: row.notes,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
});

const formatCustomer = (row: any): Customer => ({
  id: row.id,
  name: row.name,
  location: row.location,
  country: row.country,
  contact: row.contact,
  mobile: row.mobile,
  email: row.email,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
});

const formatLicense = (row: any, customer?: any, macAddresses?: string[], allowedCountries?: string[]): License => ({
  id: row.id,
  customerId: row.customer_id,
  customer: customer ? formatCustomer(customer) : undefined,
  productId: row.product_id,
  productVersionId: row.product_version_id,
  licenseType: row.license_type,
  licenseScope: row.license_scope,
  licensingPeriod: row.licensing_period,
  renewableAlertMessage: row.renewable_alert_message,
  gracePeriodDays: row.grace_period_days,
  expiryDate: row.expiry_date ? new Date(row.expiry_date) : undefined,
  maxUsersAllowed: row.max_users_allowed,
  currentUsers: row.current_users,
  macAddresses: macAddresses || [],
  allowedCountries: allowedCountries || [],
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
});

// Product Services
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const connection = await pool.getConnection();
    try {
      const [productsRows] = await connection.execute('SELECT * FROM products');
      const products = (productsRows as any[]).map(formatProduct);
      
      // Fetch versions for each product
      for (const product of products) {
        const [versionsRows] = await connection.execute(
          'SELECT * FROM product_versions WHERE product_id = ?',
          [product.id]
        );
        product.versions = (versionsRows as any[]).map(formatProductVersion);
      }
      
      return products;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const createProduct = async (product: Omit<Product, "id" | "createdAt" | "updatedAt" | "versions">): Promise<Product> => {
  try {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO products (name, description) VALUES (?, ?)',
        [product.name, product.description]
      );
      
      const insertId = (result as any).insertId;
      const [rows] = await connection.execute('SELECT * FROM products WHERE id = ?', [insertId]);
      return formatProduct((rows as any[])[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  try {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE products SET name = ?, description = ? WHERE id = ?',
        [product.name, product.description, id]
      );
      
      const [rows] = await connection.execute('SELECT * FROM products WHERE id = ?', [id]);
      const updatedProduct = formatProduct((rows as any[])[0]);
      
      // Fetch versions
      const [versionsRows] = await connection.execute(
        'SELECT * FROM product_versions WHERE product_id = ?',
        [id]
      );
      updatedProduct.versions = (versionsRows as any[]).map(formatProductVersion);
      
      return updatedProduct;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    try {
      // Delete associated versions first due to foreign key constraints
      await connection.execute('DELETE FROM product_versions WHERE product_id = ?', [id]);
      
      // Then delete the product
      await connection.execute('DELETE FROM products WHERE id = ?', [id]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Product Version Services
export const fetchProductVersions = async (): Promise<ProductVersion[]> => {
  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM product_versions');
      return (rows as any[]).map(formatProductVersion);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching product versions:", error);
    throw error;
  }
};

export const createProductVersion = async (version: Omit<ProductVersion, "id" | "createdAt" | "updatedAt">): Promise<ProductVersion> => {
  try {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO product_versions (product_id, version, release_date, notes) VALUES (?, ?, ?, ?)',
        [version.productId, version.version, version.releaseDate.toISOString().split('T')[0], version.notes]
      );
      
      const insertId = (result as any).insertId;
      const [rows] = await connection.execute('SELECT * FROM product_versions WHERE id = ?', [insertId]);
      return formatProductVersion((rows as any[])[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error creating product version:", error);
    throw error;
  }
};

export const updateProductVersion = async (id: string, version: Partial<ProductVersion>): Promise<ProductVersion> => {
  try {
    const connection = await pool.getConnection();
    try {
      const updates = [];
      const params = [];
      
      if (version.version) {
        updates.push('version = ?');
        params.push(version.version);
      }
      
      if (version.releaseDate) {
        updates.push('release_date = ?');
        params.push(version.releaseDate.toISOString().split('T')[0]);
      }
      
      if (version.notes !== undefined) {
        updates.push('notes = ?');
        params.push(version.notes);
      }
      
      params.push(id);
      
      await connection.execute(
        `UPDATE product_versions SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
      
      const [rows] = await connection.execute('SELECT * FROM product_versions WHERE id = ?', [id]);
      return formatProductVersion((rows as any[])[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error updating product version:", error);
    throw error;
  }
};

export const deleteProductVersion = async (id: string): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    try {
      await connection.execute('DELETE FROM product_versions WHERE id = ?', [id]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error deleting product version:", error);
    throw error;
  }
};

// Customer Services
export const fetchCustomers = async (): Promise<Customer[]> => {
  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM customers');
      return (rows as any[]).map(formatCustomer);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
};

export const createCustomer = async (customer: Omit<Customer, "id" | "createdAt" | "updatedAt">): Promise<Customer> => {
  try {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO customers (name, location, country, contact, mobile, email) VALUES (?, ?, ?, ?, ?, ?)',
        [customer.name, customer.location, customer.country, customer.contact, customer.mobile, customer.email]
      );
      
      const insertId = (result as any).insertId;
      const [rows] = await connection.execute('SELECT * FROM customers WHERE id = ?', [insertId]);
      return formatCustomer((rows as any[])[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error;
  }
};

export const updateCustomer = async (id: string, customer: Partial<Customer>): Promise<Customer> => {
  try {
    const connection = await pool.getConnection();
    try {
      const updates = [];
      const params = [];
      
      if (customer.name) {
        updates.push('name = ?');
        params.push(customer.name);
      }
      
      if (customer.location) {
        updates.push('location = ?');
        params.push(customer.location);
      }
      
      if (customer.country) {
        updates.push('country = ?');
        params.push(customer.country);
      }
      
      if (customer.contact) {
        updates.push('contact = ?');
        params.push(customer.contact);
      }
      
      if (customer.mobile) {
        updates.push('mobile = ?');
        params.push(customer.mobile);
      }
      
      if (customer.email) {
        updates.push('email = ?');
        params.push(customer.email);
      }
      
      params.push(id);
      
      await connection.execute(
        `UPDATE customers SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
      
      const [rows] = await connection.execute('SELECT * FROM customers WHERE id = ?', [id]);
      return formatCustomer((rows as any[])[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error updating customer:", error);
    throw error;
  }
};

export const deleteCustomer = async (id: string): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    try {
      // First check if customer has licenses
      const [licenseRows] = await connection.execute('SELECT id FROM licenses WHERE customer_id = ?', [id]);
      
      if ((licenseRows as any[]).length > 0) {
        throw new Error("Cannot delete customer with existing licenses");
      }
      
      await connection.execute('DELETE FROM customers WHERE id = ?', [id]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw error;
  }
};

// License Services
export const fetchLicenses = async (): Promise<License[]> => {
  try {
    const connection = await pool.getConnection();
    try {
      // Get all licenses
      const [licenseRows] = await connection.execute(`
        SELECT l.*, c.* 
        FROM licenses l
        LEFT JOIN customers c ON l.customer_id = c.id
      `);
      
      const licenses: License[] = [];
      
      for (const row of licenseRows as any[]) {
        // Get MAC addresses for this license
        const [macRows] = await connection.execute(
          'SELECT mac_address FROM license_mac_addresses WHERE license_id = ?',
          [row.id]
        );
        
        const macAddresses = (macRows as any[]).map(m => m.mac_address);
        
        // Get allowed countries for this license
        const [countryRows] = await connection.execute(
          'SELECT country_code FROM license_allowed_countries WHERE license_id = ?',
          [row.id]
        );
        
        const allowedCountries = (countryRows as any[]).map(c => c.country_code);
        
        // Create customer object from joined data
        const customer = {
          id: row.customer_id,
          name: row.name,
          location: row.location,
          country: row.country,
          contact: row.contact,
          mobile: row.mobile,
          email: row.email,
          created_at: row.created_at,
          updated_at: row.updated_at
        };
        
        // Format and add the license
        licenses.push(formatLicense(row, customer, macAddresses, allowedCountries));
      }
      
      return licenses;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching licenses:", error);
    throw error;
  }
};

export const createLicense = async (license: Omit<License, "id" | "createdAt" | "updatedAt">): Promise<License> => {
  try {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Insert the license
      const [result] = await connection.execute(
        `INSERT INTO licenses 
        (customer_id, product_id, product_version_id, license_type, license_scope, 
         licensing_period, renewable_alert_message, grace_period_days, 
         expiry_date, max_users_allowed, current_users) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          license.customerId,
          license.productId,
          license.productVersionId,
          license.licenseType,
          license.licenseScope,
          license.licensingPeriod,
          license.renewableAlertMessage,
          license.gracePeriodDays,
          license.expiryDate ? license.expiryDate.toISOString().split('T')[0] : null,
          license.maxUsersAllowed,
          license.currentUsers || 0
        ]
      );
      
      const licenseId = (result as any).insertId;
      
      // Insert MAC addresses if provided
      if (license.macAddresses && license.macAddresses.length > 0) {
        for (const mac of license.macAddresses) {
          await connection.execute(
            'INSERT INTO license_mac_addresses (license_id, mac_address) VALUES (?, ?)',
            [licenseId, mac]
          );
        }
      }
      
      // Insert allowed countries if provided
      if (license.allowedCountries && license.allowedCountries.length > 0) {
        for (const country of license.allowedCountries) {
          await connection.execute(
            'INSERT INTO license_allowed_countries (license_id, country_code) VALUES (?, ?)',
            [licenseId, country]
          );
        }
      }
      
      await connection.commit();
      
      // Fetch the complete license with all related data
      return (await fetchLicenses()).find(l => l.id === licenseId)!;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error creating license:", error);
    throw error;
  }
};

export const updateLicense = async (id: string, license: Partial<License>): Promise<License> => {
  try {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Update license fields
      const updates = [];
      const params = [];
      
      if (license.customerId) {
        updates.push('customer_id = ?');
        params.push(license.customerId);
      }
      
      if (license.productId) {
        updates.push('product_id = ?');
        params.push(license.productId);
      }
      
      if (license.productVersionId) {
        updates.push('product_version_id = ?');
        params.push(license.productVersionId);
      }
      
      if (license.licenseType) {
        updates.push('license_type = ?');
        params.push(license.licenseType);
      }
      
      if (license.licenseScope) {
        updates.push('license_scope = ?');
        params.push(license.licenseScope);
      }
      
      if (license.licensingPeriod !== undefined) {
        updates.push('licensing_period = ?');
        params.push(license.licensingPeriod);
      }
      
      if (license.renewableAlertMessage !== undefined) {
        updates.push('renewable_alert_message = ?');
        params.push(license.renewableAlertMessage);
      }
      
      if (license.gracePeriodDays !== undefined) {
        updates.push('grace_period_days = ?');
        params.push(license.gracePeriodDays);
      }
      
      if (license.expiryDate) {
        updates.push('expiry_date = ?');
        params.push(license.expiryDate.toISOString().split('T')[0]);
      }
      
      if (license.maxUsersAllowed !== undefined) {
        updates.push('max_users_allowed = ?');
        params.push(license.maxUsersAllowed);
      }
      
      if (license.currentUsers !== undefined) {
        updates.push('current_users = ?');
        params.push(license.currentUsers);
      }
      
      if (updates.length > 0) {
        params.push(id);
        await connection.execute(
          `UPDATE licenses SET ${updates.join(', ')} WHERE id = ?`,
          params
        );
      }
      
      // Update MAC addresses if provided
      if (license.macAddresses) {
        // Delete existing
        await connection.execute('DELETE FROM license_mac_addresses WHERE license_id = ?', [id]);
        
        // Insert new
        if (license.macAddresses.length > 0) {
          for (const mac of license.macAddresses) {
            await connection.execute(
              'INSERT INTO license_mac_addresses (license_id, mac_address) VALUES (?, ?)',
              [id, mac]
            );
          }
        }
      }
      
      // Update allowed countries if provided
      if (license.allowedCountries) {
        // Delete existing
        await connection.execute('DELETE FROM license_allowed_countries WHERE license_id = ?', [id]);
        
        // Insert new
        if (license.allowedCountries.length > 0) {
          for (const country of license.allowedCountries) {
            await connection.execute(
              'INSERT INTO license_allowed_countries (license_id, country_code) VALUES (?, ?)',
              [id, country]
            );
          }
        }
      }
      
      await connection.commit();
      
      // Fetch the complete updated license
      return (await fetchLicenses()).find(l => l.id === id)!;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error updating license:", error);
    throw error;
  }
};

export const deleteLicense = async (id: string): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Delete related records first
      await connection.execute('DELETE FROM license_mac_addresses WHERE license_id = ?', [id]);
      await connection.execute('DELETE FROM license_allowed_countries WHERE license_id = ?', [id]);
      await connection.execute('DELETE FROM license_verification_logs WHERE license_id = ?', [id]);
      
      // Delete the license
      await connection.execute('DELETE FROM licenses WHERE id = ?', [id]);
      
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Verify license logic
      let isValid = true;
      let status = 'valid';
      let warningMessage = null;
      let errorMessage = null;
      let expiresIn = null;
      
      // Check if license has expired
      if (license.expiryDate) {
        const expiryDate = new Date(license.expiryDate);
        const today = new Date();
        
        // Calculate days until expiry
        const timeDiff = expiryDate.getTime() - today.getTime();
        expiresIn = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (expiryDate < today) {
          // Check grace period
          const gracePeriodDate = new Date(expiryDate);
          gracePeriodDate.setDate(gracePeriodDate.getDate() + license.gracePeriodDays);
          
          if (today <= gracePeriodDate) {
            status = 'warning';
            warningMessage = `License has expired but is in grace period. Expires in ${license.gracePeriodDays - Math.ceil((today.getTime() - expiryDate.getTime()) / (1000 * 3600 * 24))} days.`;
          } else {
            isValid = false;
            status = 'expired';
            errorMessage = 'License has expired and grace period has ended.';
          }
        } else if (expiresIn <= 30) {
          status = 'warning';
          warningMessage = `License will expire in ${expiresIn} days.`;
        }
      }
      
      // Check user count if license is user_count_based or mixed
      if ((license.licenseType === 'user_count_based' || license.licenseType === 'mixed') && 
          license.maxUsersAllowed !== undefined) {
        
        if (addingUser && (license.currentUsers! >= license.maxUsersAllowed)) {
          isValid = false;
          status = 'expired';
          errorMessage = `User limit reached. License allows ${license.maxUsersAllowed} users, currently has ${license.currentUsers}.`;
        }
        else if (!addingUser && license.currentUsers! >= license.maxUsersAllowed) {
          status = 'warning';
          warningMessage = `User limit reached. License allows ${license.maxUsersAllowed} users, currently has ${license.currentUsers}.`;
        }
      }
      
      // Check MAC address if license is mac_based or mixed
      if ((license.licenseType === 'mac_based' || license.licenseType === 'mixed') && 
          macAddress && license.macAddresses && license.macAddresses.length > 0) {
        
        if (!license.macAddresses.includes(macAddress)) {
          isValid = false;
          status = 'expired';
          errorMessage = 'Device MAC address is not authorized to use this license.';
        }
      }
      
      // Check country if license is country_based or mixed
      if ((license.licenseType === 'country_based' || license.licenseType === 'mixed') && 
          countryCode && license.allowedCountries && license.allowedCountries.length > 0) {
        
        if (!license.allowedCountries.includes(countryCode)) {
          isValid = false;
          status = 'expired';
          errorMessage = 'This license is not valid in your country.';
        }
      }
      
      // If verification is successful and addUser flag is true, increment user count
      if (isValid && addingUser && 
         (license.licenseType === 'user_count_based' || license.licenseType === 'mixed') &&
         license.maxUsersAllowed !== undefined) {
        
        await connection.execute(
          'UPDATE licenses SET current_users = current_users + 1 WHERE id = ?',
          [license.id]
        );
      }
      
      // Log the verification attempt
      await connection.execute(
        `INSERT INTO license_verification_logs 
        (license_id, is_valid, ip_address, mac_address, country_code, device_info, message) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          license.id,
          isValid,
          ipAddress || null,
          macAddress || null,
          countryCode || null,
          deviceInfo,
          errorMessage || warningMessage
        ]
      );
      
      await connection.commit();
      
      return {
        isValid,
        status,
        warningMessage,
        errorMessage,
        expiresIn,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error verifying license:", error);
    throw error;
  }
};

export const getLicenseVerificationLogs = async (licenseId: string) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM license_verification_logs WHERE license_id = ? ORDER BY verification_date DESC',
        [licenseId]
      );
      
      return rows;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching license verification logs:", error);
    throw error;
  }
};

// Auth Services
export const register = async (username: string, email: string, password: string, role?: string) => {
  try {
    const connection = await pool.getConnection();
    try {
      // Hash password (this would be done in the backend)
      // Frontend should not do this directly for security reasons
      // This is only for demonstration purposes
      
      const [result] = await connection.execute(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, password, role || 'user']
      );
      
      const userId = (result as any).insertId;
      const [rows] = await connection.execute('SELECT id, username, email, role FROM users WHERE id = ?', [userId]);
      
      return (rows as any[])[0];
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const login = async (username: string, password: string) => {
  try {
    const connection = await pool.getConnection();
    try {
      // Find user by username
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      
      if ((rows as any[]).length === 0) {
        throw new Error("User not found");
      }
      
      const user = (rows as any[])[0];
      
      // In a real implementation, compare hashed passwords
      if (user.password !== password) {
        throw new Error("Invalid password");
      }
      
      // For security reasons, don't return password
      const { password: _, ...userWithoutPassword } = user;
      
      return {
        user: userWithoutPassword,
        token: "mock-token" // In a real implementation, generate JWT
      };
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const logout = () => {
  // In a direct DB connection context, logout is just clearing client-side state
  // No database operation needed
};

export const getCurrentUser = async () => {
  // In a direct DB connection, this would require the frontend to
  // securely store and retrieve user information
  // This is one of the security concerns with direct DB access
  
  // For demo purposes, return a mock user based on client-side storage
  const mockUser = localStorage.getItem("currentUser");
  return mockUser ? JSON.parse(mockUser) : null;
};
