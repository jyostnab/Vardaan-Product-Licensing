import { useState, useEffect } from 'react';
import { License } from '@/types/license';
import { mockLicenses } from '@/data/mockLicenses';

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  device: string;
  licenseId: string;
};

export function useLicenseDemo() {
  const [licenses, setLicenses] = useState<License[]>([...mockLicenses]);
  const [users, setUsers] = useState<DemoUser[]>([
    { id: "1", name: "John Doe", email: "john@example.com", device: "Windows 10", licenseId: "l4" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", device: "macOS", licenseId: "l4" }
  ]);

  // Add a user to a license
  const addUser = (licenseId: string, user: Omit<DemoUser, 'id' | 'licenseId'>) => {
    const license = licenses.find(l => l.id === licenseId);
    
    if (!license) {
      throw new Error('License not found');
    }

    // Check if the license is user count based and has reached its limit
    if ((license.licenseType === 'user_count_based' || 
        license.licenseType === 'mixed' || 
        (typeof license.licenseType === 'string' && license.licenseType.includes('user_count_based')))) {
      
      if (license.maxUsersAllowed !== undefined && 
          license.currentUsers !== undefined && 
          license.currentUsers >= license.maxUsersAllowed) {
        throw new Error(`User limit reached (${license.currentUsers}/${license.maxUsersAllowed})`);
      }

      // Update license user count
      const updatedLicenses = licenses.map(l => {
        if (l.id === licenseId && l.currentUsers !== undefined) {
          return {
            ...l,
            currentUsers: l.currentUsers + 1
          };
        }
        return l;
      });
      
      setLicenses(updatedLicenses);
    }

    // Add the user
    const newUser: DemoUser = {
      id: Date.now().toString(),
      licenseId,
      ...user
    };
    
    setUsers([...users, newUser]);
    return newUser;
  };

  // Remove a user from a license
  const removeUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Find the license and update user count if applicable
    const license = licenses.find(l => l.id === user.licenseId);
    
    if (license && 
        (license.licenseType === 'user_count_based' || 
         license.licenseType === 'mixed' || 
         (typeof license.licenseType === 'string' && license.licenseType.includes('user_count_based')))) {
      
      // Update license user count
      const updatedLicenses = licenses.map(l => {
        if (l.id === user.licenseId && l.currentUsers !== undefined) {
          return {
            ...l,
            currentUsers: Math.max(0, l.currentUsers - 1)
          };
        }
        return l;
      });
      
      setLicenses(updatedLicenses);
    }

    // Remove the user
    setUsers(users.filter(u => u.id !== userId));
  };

  // Verify if a license is valid with specific parameters
  const verifyLicense = (
    licenseId: string, 
    params: { 
      macAddress?: string; 
      countryCode?: string; 
      addUser?: boolean;
      username?: string;
      email?: string;
      device?: string;
    }
  ) => {
    const license = licenses.find(l => l.id === licenseId);
    
    if (!license) {
      return {
        isValid: false,
        message: 'License not found',
        license: null
      };
    }

    // Check expiry date
    if (license.expiryDate && new Date(license.expiryDate) < new Date()) {
      return {
        isValid: false,
        message: 'License has expired',
        license
      };
    }

    // Check MAC address
    if ((license.licenseType === 'mac_based' || 
         (typeof license.licenseType === 'string' && license.licenseType.includes('mac_based'))) && 
        license.macAddresses && params.macAddress) {
      
      if (!license.macAddresses.includes(params.macAddress)) {
        return {
          isValid: false,
          message: 'MAC address not authorized for this license',
          license
        };
      }
    }

    // Check country restrictions
    if ((license.licenseType === 'country_based' || 
         (typeof license.licenseType === 'string' && license.licenseType.includes('country_based'))) && 
        license.allowedCountries && params.countryCode) {
      
      if (!license.allowedCountries.includes(params.countryCode)) {
        return {
          isValid: false,
          message: `Country ${params.countryCode} not authorized for this license`,
          license
        };
      }
    }

    // Check user count limits
    if ((license.licenseType === 'user_count_based' || 
         license.licenseType === 'mixed' || 
         (typeof license.licenseType === 'string' && license.licenseType.includes('user_count_based'))) && 
        license.maxUsersAllowed !== undefined && license.currentUsers !== undefined) {
      
      if (params.addUser && license.currentUsers >= license.maxUsersAllowed) {
        return {
          isValid: false,
          message: `User limit reached (${license.currentUsers}/${license.maxUsersAllowed})`,
          license
        };
      }

      // If valid and we should add a user
      if (params.addUser && params.username && params.email) {
        try {
          addUser(licenseId, {
            name: params.username,
            email: params.email,
            device: params.device || 'Unknown device'
          });
        } catch (error) {
          return {
            isValid: false,
            message: error instanceof Error ? error.message : 'Failed to add user',
            license
          };
        }
      }
    }

    // Get days to expiry if date-based
    let expiryWarning = '';
    if (license.expiryDate) {
      const today = new Date();
      const expiry = new Date(license.expiryDate);
      const daysToExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysToExpiry <= 30) {
        expiryWarning = `License will expire in ${daysToExpiry} days`;
      }
    }

    return {
      isValid: true,
      message: expiryWarning || 'License is valid',
      license
    };
  };

  // Get users for a specific license
  const getUsersByLicense = (licenseId: string) => {
    return users.filter(user => user.licenseId === licenseId);
  };

  // Reset to initial state
  const resetDemo = () => {
    setLicenses([...mockLicenses]);
    setUsers([
      { id: "1", name: "John Doe", email: "john@example.com", device: "Windows 10", licenseId: "l4" },
      { id: "2", name: "Jane Smith", email: "jane@example.com", device: "macOS", licenseId: "l4" }
    ]);
  };

  return {
    licenses,
    users,
    addUser,
    removeUser,
    verifyLicense,
    getUsersByLicense,
    resetDemo
  };
} 