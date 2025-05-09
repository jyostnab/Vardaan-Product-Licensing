
# Product Licensing System

A comprehensive software licensing management system built with React, TypeScript, and Supabase.

## Features

- **Product Management**: Create and manage software products and their versions
- **Customer Management**: Maintain a database of customers who purchase licenses
- **License Management**: Create and verify different types of licenses:
  - Date-based licenses (with expiration dates)
  - User count-based licenses (limit by number of users)
  - MAC address-based licenses (limit by hardware)
  - Country-based licenses (limit by geographic location)
  - Mixed licenses (combination of above restrictions)
- **License Verification**: Verify licenses and track usage

## Database Schema

The application uses a Supabase PostgreSQL database with the following structure:

### Products Table
- id (UUID): Primary key
- name (VARCHAR): Product name
- description (TEXT): Product description
- created_at (TIMESTAMP): Creation timestamp
- updated_at (TIMESTAMP): Last update timestamp

### Product Versions Table
- id (UUID): Primary key
- product_id (UUID): Foreign key to Products table
- version (VARCHAR): Version number/name
- release_date (DATE): Release date
- notes (TEXT): Release notes
- created_at (TIMESTAMP): Creation timestamp
- updated_at (TIMESTAMP): Last update timestamp

### Customers Table
- id (UUID): Primary key
- name (VARCHAR): Customer name
- location (VARCHAR): Customer location
- country (VARCHAR): Two-letter country code
- contact (VARCHAR): Contact person name
- mobile (VARCHAR): Contact mobile number
- email (VARCHAR): Contact email address
- created_at (TIMESTAMP): Creation timestamp
- updated_at (TIMESTAMP): Last update timestamp

### Licenses Table
- id (UUID): Primary key
- customer_id (UUID): Foreign key to Customers table
- product_id (UUID): Foreign key to Products table
- product_version_id (UUID): Foreign key to Product Versions table
- license_type (VARCHAR): Type of license ('date_based', 'user_count_based', 'mac_based', 'country_based', 'mixed')
- license_scope (VARCHAR): Scope of license ('international', 'local')
- licensing_period (INTEGER): License period in days
- renewable_alert_message (TEXT): Message displayed when license needs renewal
- grace_period_days (INTEGER): Days allowed after expiry
- expiry_date (DATE): Expiration date (for date-based licenses)
- max_users_allowed (INTEGER): Maximum number of users (for user count-based licenses)
- current_users (INTEGER): Current number of users
- created_at (TIMESTAMP): Creation timestamp
- updated_at (TIMESTAMP): Last update timestamp

### License MAC Addresses Table
- id (UUID): Primary key
- license_id (UUID): Foreign key to Licenses table
- mac_address (VARCHAR): MAC address string (00:1A:2B:3C:4D:5E format)
- created_at (TIMESTAMP): Creation timestamp

### License Allowed Countries Table
- id (UUID): Primary key
- license_id (UUID): Foreign key to Licenses table
- country_code (VARCHAR): Two-letter country code
- created_at (TIMESTAMP): Creation timestamp

### License Verification Logs Table
- id (UUID): Primary key
- license_id (UUID): Foreign key to Licenses table
- verification_date (TIMESTAMP): Date and time of verification
- is_valid (BOOLEAN): Whether license was valid
- ip_address (VARCHAR): IP address of verification request
- mac_address (VARCHAR): MAC address of verification request
- country_code (VARCHAR): Country code of verification request
- device_info (TEXT): Device information
- message (TEXT): Validation message
