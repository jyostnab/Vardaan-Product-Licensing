const db = require("../models");
const License = db.licenses;
const Customer = db.customers;
const LicenseAllowedCountry = db.licenseAllowedCountries;
const LicenseMacAddress = db.licenseMacAddresses;
const { Op } = require("sequelize");
const crypto = require('crypto');

// Create and Save a new License
exports.create = async (req, res) => {
  const t = await db.sequelize.transaction();
  
  try {
    // Validate request
    if (!req.body.customer_id || !req.body.product_id || !req.body.product_version_id || !req.body.license_type) {
      return res.status(400).json({ 
        message: "Customer ID, Product ID, Product Version ID and License Type are required" 
      });
    }

    // Create a License
    const license = {
      customer_id: req.body.customer_id,
      product_id: req.body.product_id,
      product_version_id: req.body.product_version_id,
      license_type: req.body.license_type,
      license_scope: req.body.license_scope || 'local',
      licensing_period: req.body.licensing_period || 365,
      renewable_alert_message: req.body.renewable_alert_message,
      grace_period_days: req.body.grace_period_days || 0,
      expiry_date: req.body.expiry_date,
      max_users_allowed: req.body.max_users_allowed,
      current_users: req.body.current_users || 0
    };

    // Save License in the database
    const newLicense = await License.create(license, { transaction: t });
    
    // Handle MAC addresses if provided
    if (req.body.mac_addresses && req.body.mac_addresses.length > 0) {
      const macAddresses = req.body.mac_addresses.map(mac => ({
        license_id: newLicense.id,
        mac_address: mac
      }));
      
      await LicenseMacAddress.bulkCreate(macAddresses, { transaction: t });
    }
    
    // Handle allowed countries if provided
    if (req.body.allowed_countries && req.body.allowed_countries.length > 0) {
      const countries = req.body.allowed_countries.map(country => ({
        license_id: newLicense.id,
        country_code: country
      }));
      
      await LicenseAllowedCountry.bulkCreate(countries, { transaction: t });
    }
    
    await t.commit();
    
    // Return the created license with associations
    const result = await License.findByPk(newLicense.id, {
      include: [
        {
          model: Customer,
          as: "customer"
        },
        {
          model: LicenseAllowedCountry,
          as: "allowed_countries"
        },
        {
          model: LicenseMacAddress,
          as: "mac_addresses"
        }
      ]
    });
    
    return res.status(201).json(result);
  } catch (err) {
    await t.rollback();
    return res.status(500).json({
      message: err.message || "Some error occurred while creating the License."
    });
  }
};

// Retrieve all Licenses from the database
exports.findAll = async (req, res) => {
  try {
    const data = await License.findAll({
      include: [
        {
          model: Customer,
          as: "customer"
        },
        {
          model: LicenseAllowedCountry,
          as: "allowed_countries"
        },
        {
          model: LicenseMacAddress,
          as: "mac_addresses"
        }
      ]
    });
    
    // Format the response to match the frontend's expected format
    const formattedData = data.map(license => {
      const plainLicense = license.get({ plain: true });
      return {
        ...plainLicense,
        customerId: plainLicense.customer_id,
        productId: plainLicense.product_id,
        productVersionId: plainLicense.product_version_id,
        licenseType: plainLicense.license_type,
        licenseScope: plainLicense.license_scope,
        licensingPeriod: plainLicense.licensing_period,
        renewableAlertMessage: plainLicense.renewable_alert_message,
        gracePeriodDays: plainLicense.grace_period_days,
        expiryDate: plainLicense.expiry_date,
        maxUsersAllowed: plainLicense.max_users_allowed,
        currentUsers: plainLicense.current_users,
        createdAt: plainLicense.created_at,
        updatedAt: plainLicense.updated_at,
        allowedCountries: plainLicense.allowed_countries ? 
          plainLicense.allowed_countries.map(country => country.country_code) : [],
        macAddresses: plainLicense.mac_addresses ? 
          plainLicense.mac_addresses.map(mac => mac.mac_address) : [],
        customer: plainLicense.customer ? {
          id: plainLicense.customer.id,
          name: plainLicense.customer.name,
          location: plainLicense.customer.location,
          country: plainLicense.customer.country,
          contact: plainLicense.customer.contact,
          mobile: plainLicense.customer.mobile,
          email: plainLicense.customer.email,
          createdAt: plainLicense.customer.created_at,
          updatedAt: plainLicense.customer.updated_at
        } : null
      };
    });
    
    return res.json(formattedData);
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Some error occurred while retrieving licenses."
    });
  }
};

// Find a single License with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const license = await License.findByPk(id, {
      include: [
        {
          model: Customer,
          as: "customer"
        },
        {
          model: LicenseAllowedCountry,
          as: "allowed_countries"
        },
        {
          model: LicenseMacAddress,
          as: "mac_addresses"
        }
      ]
    });
    
    if (license) {
      const plainLicense = license.get({ plain: true });
      const formattedLicense = {
        ...plainLicense,
        customerId: plainLicense.customer_id,
        productId: plainLicense.product_id,
        productVersionId: plainLicense.product_version_id,
        licenseType: plainLicense.license_type,
        licenseScope: plainLicense.license_scope,
        licensingPeriod: plainLicense.licensing_period,
        renewableAlertMessage: plainLicense.renewable_alert_message,
        gracePeriodDays: plainLicense.grace_period_days,
        expiryDate: plainLicense.expiry_date,
        maxUsersAllowed: plainLicense.max_users_allowed,
        currentUsers: plainLicense.current_users,
        createdAt: plainLicense.created_at,
        updatedAt: plainLicense.updated_at,
        allowedCountries: plainLicense.allowed_countries ? 
          plainLicense.allowed_countries.map(country => country.country_code) : [],
        macAddresses: plainLicense.mac_addresses ? 
          plainLicense.mac_addresses.map(mac => mac.mac_address) : [],
        customer: plainLicense.customer ? {
          id: plainLicense.customer.id,
          name: plainLicense.customer.name,
          location: plainLicense.customer.location,
          country: plainLicense.customer.country,
          contact: plainLicense.customer.contact,
          mobile: plainLicense.customer.mobile,
          email: plainLicense.customer.email,
          createdAt: plainLicense.customer.created_at,
          updatedAt: plainLicense.customer.updated_at
        } : null
      };
      
      return res.json(formattedLicense);
    } else {
      return res.status(404).json({
        message: `License with id=${id} was not found.`
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: `Error retrieving License with id=${id}`
    });
  }
};

// Update a License by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;
  const t = await db.sequelize.transaction();

  try {
    // Update the license basic info
    const updateData = {};
    
    if (req.body.customer_id) updateData.customer_id = req.body.customer_id;
    if (req.body.product_id) updateData.product_id = req.body.product_id;
    if (req.body.product_version_id) updateData.product_version_id = req.body.product_version_id;
    if (req.body.license_type) updateData.license_type = req.body.license_type;
    if (req.body.license_scope) updateData.license_scope = req.body.license_scope;
    if (req.body.licensing_period !== undefined) updateData.licensing_period = req.body.licensing_period;
    if (req.body.renewable_alert_message !== undefined) updateData.renewable_alert_message = req.body.renewable_alert_message;
    if (req.body.grace_period_days !== undefined) updateData.grace_period_days = req.body.grace_period_days;
    if (req.body.expiry_date) updateData.expiry_date = req.body.expiry_date;
    if (req.body.max_users_allowed !== undefined) updateData.max_users_allowed = req.body.max_users_allowed;
    if (req.body.current_users !== undefined) updateData.current_users = req.body.current_users;
    
    const num = await License.update(updateData, {
      where: { id: id },
      transaction: t
    });

    if (num[0] === 0) {
      await t.rollback();
      return res.status(404).json({
        message: `Cannot update License with id=${id}. Maybe License was not found or req.body is empty!`
      });
    }

    // Handle MAC addresses if provided
    if (req.body.mac_addresses) {
      // Delete existing MAC addresses
      await LicenseMacAddress.destroy({
        where: { license_id: id },
        transaction: t
      });
      
      // Insert new MAC addresses
      if (req.body.mac_addresses.length > 0) {
        const macAddresses = req.body.mac_addresses.map(mac => ({
          license_id: id,
          mac_address: mac
        }));
        
        await LicenseMacAddress.bulkCreate(macAddresses, { transaction: t });
      }
    }
    
    // Handle allowed countries if provided
    if (req.body.allowed_countries) {
      // Delete existing allowed countries
      await LicenseAllowedCountry.destroy({
        where: { license_id: id },
        transaction: t
      });
      
      // Insert new allowed countries
      if (req.body.allowed_countries.length > 0) {
        const countries = req.body.allowed_countries.map(country => ({
          license_id: id,
          country_code: country
        }));
        
        await LicenseAllowedCountry.bulkCreate(countries, { transaction: t });
      }
    }
    
    await t.commit();
    
    // Fetch the updated license with its associations
    const updatedLicense = await exports.findOne({
      params: { id },
      json: () => {}
    }, { json: (data) => data });
    
    return res.json({
      message: "License was updated successfully.",
      data: updatedLicense
    });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({
      message: `Error updating License with id=${id}: ${err.message}`
    });
  }
};

// Delete a License with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;
  const t = await db.sequelize.transaction();

  try {
    // Delete associated MAC addresses
    await LicenseMacAddress.destroy({
      where: { license_id: id },
      transaction: t
    });
    
    // Delete associated allowed countries
    await LicenseAllowedCountry.destroy({
      where: { license_id: id },
      transaction: t
    });
    
    // Delete the license
    const num = await License.destroy({
      where: { id: id },
      transaction: t
    });

    if (num == 1) {
      await t.commit();
      return res.json({
        message: "License was deleted successfully!"
      });
    } else {
      await t.rollback();
      return res.status(404).json({
        message: `Cannot delete License with id=${id}. Maybe License was not found!`
      });
    }
  } catch (err) {
    await t.rollback();
    return res.status(500).json({
      message: `Could not delete License with id=${id}`
    });
  }
};

// Verification and User Count Management
exports.verifyLicense = async (req, res) => {
  try {
    const { licenseId, addUser, macAddress, countryCode, deviceInfo } = req.body;

    if (!licenseId) {
      return res.status(400).json({ message: "License ID is required" });
    }

    // Find the license with all its relations
    const license = await License.findByPk(licenseId, {
      include: [
        {
          model: LicenseAllowedCountry,
          as: "allowed_countries"
        },
        {
          model: LicenseMacAddress,
          as: "mac_addresses"
        }
      ]
    });

    if (!license) {
      return res.status(404).json({ message: "License not found" });
    }

    // Perform verification logic
    let isValid = true;
    let status = 'valid';
    let warningMessage = null;
    let errorMessage = null;
    let expiresIn = null;

    // Check if license has expired
    if (license.expiry_date) {
      const expiryDate = new Date(license.expiry_date);
      const today = new Date();
      
      // Calculate days until expiry
      const timeDiff = expiryDate.getTime() - today.getTime();
      expiresIn = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      if (expiryDate < today) {
        // Check grace period
        const gracePeriodDate = new Date(expiryDate);
        gracePeriodDate.setDate(gracePeriodDate.getDate() + license.grace_period_days);
        
        if (today <= gracePeriodDate) {
          status = 'warning';
          warningMessage = `License has expired but is in grace period. Expires in ${license.grace_period_days - Math.ceil((today - expiryDate) / (1000 * 3600 * 24))} days.`;
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
    if ((license.license_type === 'user_count_based' || license.license_type === 'mixed') && 
        license.max_users_allowed !== null) {
      
      if (addUser && (license.current_users >= license.max_users_allowed)) {
        isValid = false;
        status = 'expired';
        errorMessage = `User limit reached. License allows ${license.max_users_allowed} users, currently has ${license.current_users}.`;
      }
      else if (!addUser && license.current_users >= license.max_users_allowed) {
        status = 'warning';
        warningMessage = `User limit reached. License allows ${license.max_users_allowed} users, currently has ${license.current_users}.`;
      }
    }

    // Check MAC address if license is mac_based or mixed
    if ((license.license_type === 'mac_based' || license.license_type === 'mixed') && 
        macAddress && license.mac_addresses && license.mac_addresses.length > 0) {
      
      const allowedMacs = license.mac_addresses.map(mac => mac.mac_address);
      if (!allowedMacs.includes(macAddress)) {
        isValid = false;
        status = 'expired';
        errorMessage = 'Device MAC address is not authorized to use this license.';
      }
    }

    // Check country if license is country_based or mixed
    if ((license.license_type === 'country_based' || license.license_type === 'mixed') && 
        countryCode && license.allowed_countries && license.allowed_countries.length > 0) {
      
      const allowedCountries = license.allowed_countries.map(country => country.country_code);
      if (!allowedCountries.includes(countryCode)) {
        isValid = false;
        status = 'expired';
        errorMessage = 'This license is not valid in your country.';
      }
    }

    // If verification is successful and addUser flag is true, increment user count
    if (isValid && addUser && 
       (license.license_type === 'user_count_based' || license.license_type === 'mixed') &&
       license.max_users_allowed !== null && license.current_users < license.max_users_allowed) {
      
      await License.update(
        { current_users: license.current_users + 1 },
        { where: { id: licenseId } }
      );
      
      // Update the value for the response
      license.current_users += 1;
    }

    // Log the verification attempt
    await db.licenseVerificationLogs.create({
      license_id: licenseId,
      is_valid: isValid,
      ip_address: req.ip,
      mac_address: macAddress,
      country_code: countryCode,
      device_info: deviceInfo,
      message: errorMessage || warningMessage
    });

    return res.json({
      isValid,
      status,
      warningMessage,
      errorMessage,
      expiresIn,
      currentUsers: license.current_users,
      maxUsersAllowed: license.max_users_allowed
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Error occurred during license verification."
    });
  }
};

// Update user count for a license
exports.updateUserCount = async (req, res) => {
  try {
    const licenseId = req.params.id;
    const { increment } = req.body;
    
    // Increment defaults to true if not specified
    const shouldIncrement = increment !== false;
    
    // Get the license
    const license = await License.findByPk(licenseId);
    
    if (!license) {
      return res.status(404).json({ 
        message: "License not found" 
      });
    }
    
    // Check if license supports user count
    if (license.max_users_allowed === null || 
        (license.license_type !== 'user_count_based' && license.license_type !== 'mixed')) {
      return res.status(400).json({ 
        message: "This license does not support user count management" 
      });
    }
    
    let newUserCount;
    
    if (shouldIncrement) {
      // Check if max users is reached
      if (license.current_users >= license.max_users_allowed) {
        return res.status(400).json({ 
          message: `License user limit reached (${license.current_users}/${license.max_users_allowed})` 
        });
      }
      
      newUserCount = license.current_users + 1;
    } else {
      // Don't go below 0
      newUserCount = Math.max(0, license.current_users - 1);
    }
    
    // Update the license
    await License.update(
      { current_users: newUserCount },
      { where: { id: licenseId } }
    );
    
    return res.json({
      message: `User count ${shouldIncrement ? 'incremented' : 'decremented'} successfully`,
      currentUsers: newUserCount,
      maxUsersAllowed: license.max_users_allowed
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Error updating user count"
    });
  }
};

// Get verification logs for a license
exports.getVerificationLogs = async (req, res) => {
  const licenseId = req.params.id;

  try {
    const logs = await db.licenseVerificationLogs.findAll({
      where: { license_id: licenseId },
      order: [['verification_date', 'DESC']]
    });
    
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Error retrieving verification logs."
    });
  }
};

// Get license status
exports.getLicenseStatus = async (req, res) => {
  const id = req.params.id;

  try {
    const license = await License.findByPk(id, {
      include: [
        {
          model: LicenseAllowedCountry,
          as: "allowed_countries"
        },
        {
          model: LicenseMacAddress,
          as: "mac_addresses"
        }
      ]
    });
    
    if (!license) {
      return res.status(404).json({
        message: `License with id=${id} was not found.`
      });
    }
    
    // Check if license has expired
    let isValid = true;
    let status = 'valid';
    let warningMessage = null;
    let errorMessage = null;
    let expiresIn = null;
    
    if (license.expiry_date) {
      const expiryDate = new Date(license.expiry_date);
      const today = new Date();
      
      // Calculate days until expiry
      const timeDiff = expiryDate.getTime() - today.getTime();
      expiresIn = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      if (expiryDate < today) {
        // Check grace period
        const gracePeriodDate = new Date(expiryDate);
        gracePeriodDate.setDate(gracePeriodDate.getDate() + license.grace_period_days);
        
        if (today <= gracePeriodDate) {
          status = 'warning';
          warningMessage = `License has expired but is in grace period. Expires in ${license.grace_period_days - Math.ceil((today - expiryDate) / (1000 * 3600 * 24))} days.`;
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
    if ((license.license_type === 'user_count_based' || license.license_type === 'mixed') && 
        license.max_users_allowed !== null) {
      
      if (license.current_users >= license.max_users_allowed) {
        status = 'warning';
        warningMessage = `User limit reached. License allows ${license.max_users_allowed} users, currently has ${license.current_users}.`;
      }
    }
    
    return res.json({
      isValid,
      status,
      warningMessage,
      errorMessage,
      expiresIn,
      currentUsers: license.current_users,
      maxUsersAllowed: license.max_users_allowed
    });
    
  } catch (err) {
    return res.status(500).json({
      message: `Error retrieving license status for id=${id}: ${err.message}`
    });
  }
};

// Generate a new license key
exports.generateLicenseKey = async (req, res) => {
  try {
    const { productId, customerId, licenseType, licenseScope, expiryDate, maxUsersAllowed } = req.body;
    
    if (!productId || !customerId || !licenseType) {
      return res.status(400).json({
        message: "Product ID, Customer ID, and License Type are required"
      });
    }
    
    // Generate a unique license key
    // Format: XXXX-XXXX-XXXX-XXXX (where X is alphanumeric)
    const generateSegment = () => {
      return crypto.randomBytes(2).toString('hex').toUpperCase();
    };
    
    const licenseKey = `${generateSegment()}-${generateSegment()}-${generateSegment()}-${generateSegment()}`;
    
    // Create license object (similar to the create method)
    const license = {
      customer_id: customerId,
      product_id: productId,
      product_version_id: req.body.productVersionId || productId, // Default to product ID if version not specified
      license_type: licenseType,
      license_scope: licenseScope || 'local',
      licensing_period: req.body.licensingPeriod || 365,
      renewable_alert_message: req.body.renewableAlertMessage,
      grace_period_days: req.body.gracePeriodDays || 0,
      expiry_date: expiryDate,
      max_users_allowed: maxUsersAllowed,
      current_users: 0,
      license_key: licenseKey // Add the generated license key
    };
    
    // Save License in the database
    const newLicense = await License.create(license);
    
    // Handle MAC addresses if provided
    if (req.body.macAddresses && req.body.macAddresses.length > 0) {
      const macAddresses = req.body.macAddresses.map(mac => ({
        license_id: newLicense.id,
        mac_address: mac
      }));
      
      await db.licenseMacAddresses.bulkCreate(macAddresses);
    }
    
    // Handle allowed countries if provided
    if (req.body.allowedCountries && req.body.allowedCountries.length > 0) {
      const countries = req.body.allowedCountries.map(country => ({
        license_id: newLicense.id,
        country_code: country
      }));
      
      await db.licenseAllowedCountries.bulkCreate(countries);
    }
    
    return res.status(201).json({
      id: newLicense.id,
      licenseKey,
      message: "License created successfully with new license key"
    });
    
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Some error occurred while generating license key."
    });
  }
};

// Validate a license key from external system
exports.validateLicenseKey = async (req, res) => {
  try {
    const { licenseKey, deviceInfo, macAddress, countryCode } = req.body;
    
    if (!licenseKey) {
      return res.status(400).json({
        message: "License key is required"
      });
    }
    
    // Find the license with the given key
    const license = await License.findOne({
      where: { license_key: licenseKey },
      include: [
        {
          model: Customer,
          as: "customer"
        },
        {
          model: LicenseAllowedCountry,
          as: "allowed_countries"
        },
        {
          model: LicenseMacAddress,
          as: "mac_addresses"
        }
      ]
    });
    
    if (!license) {
      return res.status(404).json({
        isValid: false,
        status: 'expired',
        errorMessage: 'Invalid license key.'
      });
    }
    
    // Perform verification logic (similar to verifyLicense method)
    let isValid = true;
    let status = 'valid';
    let warningMessage = null;
    let errorMessage = null;
    let expiresIn = null;

    // Check if license has expired
    if (license.expiry_date) {
      const expiryDate = new Date(license.expiry_date);
      const today = new Date();
      
      // Calculate days until expiry
      const timeDiff = expiryDate.getTime() - today.getTime();
      expiresIn = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      if (expiryDate < today) {
        // Check grace period
        const gracePeriodDate = new Date(expiryDate);
        gracePeriodDate.setDate(gracePeriodDate.getDate() + license.grace_period_days);
        
        if (today <= gracePeriodDate) {
          status = 'warning';
          warningMessage = `License has expired but is in grace period. Expires in ${license.grace_period_days - Math.ceil((today - expiryDate) / (1000 * 3600 * 24))} days.`;
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

    // Check MAC address if license is mac_based or mixed
    if ((license.license_type === 'mac_based' || license.license_type === 'mixed') && 
        macAddress && license.mac_addresses && license.mac_addresses.length > 0) {
      
      const allowedMacs = license.mac_addresses.map(mac => mac.mac_address);
      if (!allowedMacs.includes(macAddress)) {
        isValid = false;
        status = 'expired';
        errorMessage = 'Device MAC address is not authorized to use this license.';
      }
    }

    // Check country if license is country_based or mixed
    if ((license.license_type === 'country_based' || license.license_type === 'mixed') && 
        countryCode && license.allowed_countries && license.allowed_countries.length > 0) {
      
      const allowedCountries = license.allowed_countries.map(country => country.country_code);
      if (!allowedCountries.includes(countryCode)) {
        isValid = false;
        status = 'expired';
        errorMessage = 'This license is not valid in your country.';
      }
    }
    
    // Log the verification attempt
    await db.licenseVerificationLogs.create({
      license_id: license.id,
      is_valid: isValid,
      ip_address: req.ip,
      mac_address: macAddress,
      country_code: countryCode,
      device_info: deviceInfo,
      message: errorMessage || warningMessage
    });
    
    return res.json({
      isValid,
      status,
      warningMessage,
      errorMessage,
      expiresIn,
      licenseId: license.id,
      customerId: license.customer_id,
      productId: license.product_id,
      licenseType: license.license_type
    });
    
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Error occurred during license key validation."
    });
  }
};

// Get license by key
exports.getLicenseByKey = async (req, res) => {
  const key = req.params.key;
  
  try {
    const license = await License.findOne({
      where: { license_key: key },
      include: [
        {
          model: Customer,
          as: "customer"
        },
        {
          model: LicenseAllowedCountry,
          as: "allowed_countries"
        },
        {
          model: LicenseMacAddress,
          as: "mac_addresses"
        }
      ]
    });
    
    if (license) {
      const plainLicense = license.get({ plain: true });
      const formattedLicense = {
        ...plainLicense,
        customerId: plainLicense.customer_id,
        productId: plainLicense.product_id,
        productVersionId: plainLicense.product_version_id,
        licenseType: plainLicense.license_type,
        licenseScope: plainLicense.license_scope,
        licensingPeriod: plainLicense.licensing_period,
        renewableAlertMessage: plainLicense.renewable_alert_message,
        gracePeriodDays: plainLicense.grace_period_days,
        expiryDate: plainLicense.expiry_date,
        maxUsersAllowed: plainLicense.max_users_allowed,
        currentUsers: plainLicense.current_users,
        createdAt: plainLicense.created_at,
        updatedAt: plainLicense.updated_at,
        licenseKey: plainLicense.license_key,
        allowedCountries: plainLicense.allowed_countries ? 
          plainLicense.allowed_countries.map(country => country.country_code) : [],
        macAddresses: plainLicense.mac_addresses ? 
          plainLicense.mac_addresses.map(mac => mac.mac_address) : [],
        customer: plainLicense.customer ? {
          id: plainLicense.customer.id,
          name: plainLicense.customer.name,
          location: plainLicense.customer.location,
          country: plainLicense.customer.country,
          contact: plainLicense.customer.contact,
          mobile: plainLicense.customer.mobile,
          email: plainLicense.customer.email,
          createdAt: plainLicense.customer.created_at,
          updatedAt: plainLicense.customer.updated_at
        } : null
      };
      
      return res.json(formattedLicense);
    } else {
      return res.status(404).json({
        message: `License with key=${key} was not found.`
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: `Error retrieving License with key=${key}: ${err.message}`
    });
  }
};
