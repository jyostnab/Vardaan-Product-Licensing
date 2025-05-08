
/**
 * Database Schema Guide for License Management System
 * 
 * This file provides the recommended database structure for implementing
 * the licensing system in Supabase or any SQL database.
 */

/**
 * Products Table
 * Stores information about software products
 * 
 * SQL CREATE TABLE:
 * ```
 * CREATE TABLE products (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   name VARCHAR(255) NOT NULL,
 *   description TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
 * );
 * ```
 */

/**
 * Product Versions Table
 * Stores information about different versions of products
 * 
 * SQL CREATE TABLE:
 * ```
 * CREATE TABLE product_versions (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   product_id UUID NOT NULL REFERENCES products(id),
 *   version VARCHAR(100) NOT NULL,
 *   release_date DATE NOT NULL,
 *   notes TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 *   UNIQUE(product_id, version)
 * );
 * ```
 */

/**
 * Customers Table
 * Stores information about customers who purchase licenses
 * 
 * SQL CREATE TABLE:
 * ```
 * CREATE TABLE customers (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   name VARCHAR(255) NOT NULL,
 *   location VARCHAR(255),
 *   country VARCHAR(2),
 *   contact VARCHAR(255),
 *   mobile VARCHAR(50),
 *   email VARCHAR(255),
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
 * );
 * ```
 */

/**
 * Licenses Table
 * Stores license information
 * 
 * SQL CREATE TABLE:
 * ```
 * CREATE TABLE licenses (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   customer_id UUID NOT NULL REFERENCES customers(id),
 *   product_id UUID NOT NULL REFERENCES products(id),
 *   product_version_id UUID NOT NULL REFERENCES product_versions(id),
 *   license_type VARCHAR(50) NOT NULL, -- 'date_based', 'user_count_based', 'mac_based', 'country_based', 'mixed'
 *   license_scope VARCHAR(50) NOT NULL, -- 'international', 'local'
 *   licensing_period INTEGER NOT NULL, -- in days
 *   renewable_alert_message TEXT,
 *   grace_period_days INTEGER NOT NULL DEFAULT 0,
 *   expiry_date DATE,
 *   max_users_allowed INTEGER,
 *   current_users INTEGER,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
 * );
 * ```
 */

/**
 * License Mac Addresses Table
 * Stores MAC addresses associated with licenses
 * 
 * SQL CREATE TABLE:
 * ```
 * CREATE TABLE license_mac_addresses (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   license_id UUID NOT NULL REFERENCES licenses(id),
 *   mac_address VARCHAR(17) NOT NULL, -- Format: 00:1A:2B:3C:4D:5E
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 *   UNIQUE(license_id, mac_address)
 * );
 * ```
 */

/**
 * License Allowed Countries Table
 * Stores countries where licenses are valid
 * 
 * SQL CREATE TABLE:
 * ```
 * CREATE TABLE license_allowed_countries (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   license_id UUID NOT NULL REFERENCES licenses(id),
 *   country_code VARCHAR(2) NOT NULL,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 *   UNIQUE(license_id, country_code)
 * );
 * ```
 */

/**
 * License Verification Log Table
 * Logs license verification attempts
 * 
 * SQL CREATE TABLE:
 * ```
 * CREATE TABLE license_verification_logs (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   license_id UUID NOT NULL REFERENCES licenses(id),
 *   verification_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 *   is_valid BOOLEAN NOT NULL,
 *   ip_address VARCHAR(45),
 *   mac_address VARCHAR(17),
 *   country_code VARCHAR(2),
 *   device_info TEXT,
 *   message TEXT
 * );
 * ```
 */

/**
 * License Activations Table
 * Tracks active license installations/activations
 * 
 * SQL CREATE TABLE:
 * ```
 * CREATE TABLE license_activations (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   license_id UUID NOT NULL REFERENCES licenses(id),
 *   activation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 *   device_identifier VARCHAR(255) NOT NULL,
 *   mac_address VARCHAR(17),
 *   ip_address VARCHAR(45),
 *   country_code VARCHAR(2),
 *   device_info TEXT,
 *   is_active BOOLEAN NOT NULL DEFAULT true,
 *   deactivation_date TIMESTAMP WITH TIME ZONE,
 *   UNIQUE(license_id, device_identifier)
 * );
 * ```
 */

/**
 * License Renewal History Table
 * Tracks license renewal history
 * 
 * SQL CREATE TABLE:
 * ```
 * CREATE TABLE license_renewal_history (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   license_id UUID NOT NULL REFERENCES licenses(id),
 *   renewal_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 *   previous_expiry_date DATE,
 *   new_expiry_date DATE,
 *   renewal_notes TEXT
 * );
 * ```
 */

export type DatabaseTablesGuide = {
  name: string;
  description: string;
  requiredFields: string[];
  optionalFields: string[];
};

export const databaseTablesGuide: DatabaseTablesGuide[] = [
  {
    name: "products",
    description: "Stores information about software products",
    requiredFields: ["id", "name"],
    optionalFields: ["description", "created_at", "updated_at"]
  },
  {
    name: "product_versions",
    description: "Stores information about different versions of products",
    requiredFields: ["id", "product_id", "version", "release_date"],
    optionalFields: ["notes", "created_at", "updated_at"]
  },
  {
    name: "customers",
    description: "Stores information about customers who purchase licenses",
    requiredFields: ["id", "name"],
    optionalFields: ["location", "country", "contact", "mobile", "email", "created_at", "updated_at"]
  },
  {
    name: "licenses",
    description: "Stores license information",
    requiredFields: [
      "id", "customer_id", "product_id", "product_version_id", 
      "license_type", "license_scope", "licensing_period"
    ],
    optionalFields: [
      "renewable_alert_message", "grace_period_days", "expiry_date",
      "max_users_allowed", "current_users", "created_at", "updated_at"
    ]
  },
  {
    name: "license_mac_addresses",
    description: "Stores MAC addresses associated with licenses",
    requiredFields: ["id", "license_id", "mac_address"],
    optionalFields: ["created_at"]
  },
  {
    name: "license_allowed_countries",
    description: "Stores countries where licenses are valid",
    requiredFields: ["id", "license_id", "country_code"],
    optionalFields: ["created_at"]
  },
  {
    name: "license_verification_logs",
    description: "Logs license verification attempts",
    requiredFields: ["id", "license_id", "verification_date", "is_valid"],
    optionalFields: ["ip_address", "mac_address", "country_code", "device_info", "message"]
  },
  {
    name: "license_activations",
    description: "Tracks active license installations/activations",
    requiredFields: ["id", "license_id", "activation_date", "device_identifier", "is_active"],
    optionalFields: ["mac_address", "ip_address", "country_code", "device_info", "deactivation_date"]
  },
  {
    name: "license_renewal_history",
    description: "Tracks license renewal history",
    requiredFields: ["id", "license_id", "renewal_date"],
    optionalFields: ["previous_expiry_date", "new_expiry_date", "renewal_notes"]
  }
];
