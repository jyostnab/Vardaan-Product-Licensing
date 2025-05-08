
import { Customer, License } from "@/types/license";

// Mock customers
export const mockCustomers: Customer[] = [
  {
    id: "c1",
    name: "Acme Corporation",
    location: "San Francisco",
    country: "US",
    contact: "John Doe",
    mobile: "+1-555-123-4567",
    email: "john.doe@acmecorp.com",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01")
  },
  {
    id: "c2",
    name: "TechGlobal Ltd",
    location: "London",
    country: "GB",
    contact: "Jane Smith",
    mobile: "+44-20-1234-5678",
    email: "jane.smith@techglobal.com",
    createdAt: new Date("2023-02-15"),
    updatedAt: new Date("2023-02-15")
  },
  {
    id: "c3",
    name: "Innovate Solutions",
    location: "Singapore",
    country: "SG",
    contact: "Mike Johnson",
    mobile: "+65-9123-4567",
    email: "mike.johnson@innovate.sg",
    createdAt: new Date("2023-03-10"),
    updatedAt: new Date("2023-03-10")
  }
];

// Calculate date for licenses
const today = new Date();
const thirtyDaysFromNow = new Date(today);
thirtyDaysFromNow.setDate(today.getDate() + 30);

const sixtyDaysFromNow = new Date(today);
sixtyDaysFromNow.setDate(today.getDate() + 60);

const pastDate = new Date(today);
pastDate.setDate(today.getDate() - 10);

// Mock licenses
export const mockLicenses: License[] = [
  // Date based license (valid)
  {
    id: "l1",
    customerId: "c1",
    productId: "p1",
    productVersionId: "v2",
    licenseType: "date_based",
    licenseScope: "international",
    licensingPeriod: 365,
    renewableAlertMessage: "Your annual license will expire soon. Please contact sales to renew.",
    gracePeriodDays: 14,
    expiryDate: sixtyDaysFromNow,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01")
  },
  // Date based license (warning - about to expire)
  {
    id: "l2",
    customerId: "c1",
    productId: "p1",
    productVersionId: "v1",
    licenseType: "date_based",
    licenseScope: "international",
    licensingPeriod: 365,
    renewableAlertMessage: "Your annual license will expire soon. Please contact sales to renew.",
    gracePeriodDays: 14,
    expiryDate: thirtyDaysFromNow,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01")
  },
  // Date based license (expired)
  {
    id: "l3",
    customerId: "c2",
    productId: "p2",
    productVersionId: "v3",
    licenseType: "date_based",
    licenseScope: "local",
    licensingPeriod: 180,
    renewableAlertMessage: "Your license has expired. Please renew to continue using the software.",
    gracePeriodDays: 7,
    expiryDate: pastDate,
    createdAt: new Date("2023-02-15"),
    updatedAt: new Date("2023-02-15")
  },
  // User count based license
  {
    id: "l4",
    customerId: "c2",
    productId: "p1",
    productVersionId: "v2",
    licenseType: "user_count_based",
    licenseScope: "international",
    licensingPeriod: 365,
    renewableAlertMessage: "Your user licenses will expire soon. Please contact sales to renew.",
    gracePeriodDays: 14,
    maxUsersAllowed: 10,
    currentUsers: 8,
    createdAt: new Date("2023-02-15"),
    updatedAt: new Date("2023-02-15")
  },
  // MAC based license
  {
    id: "l5",
    customerId: "c3",
    productId: "p2",
    productVersionId: "v4",
    licenseType: "mac_based",
    licenseScope: "local",
    licensingPeriod: 365,
    renewableAlertMessage: "Your hardware license will expire soon. Please contact sales to renew.",
    gracePeriodDays: 0,
    macAddresses: ["00:1A:2B:3C:4D:5E", "12:34:56:78:9A:BC"],
    createdAt: new Date("2023-03-10"),
    updatedAt: new Date("2023-03-10")
  },
  // Country based license
  {
    id: "l6",
    customerId: "c3",
    productId: "p2",
    productVersionId: "v3",
    licenseType: "country_based",
    licenseScope: "international",
    licensingPeriod: 365,
    renewableAlertMessage: "Your regional license will expire soon. Please contact sales to renew.",
    gracePeriodDays: 0,
    allowedCountries: ["SG", "MY", "ID", "TH"],
    createdAt: new Date("2023-03-10"),
    updatedAt: new Date("2023-03-10")
  },
  // Mixed license
  {
    id: "l7",
    customerId: "c1",
    productId: "p1",
    productVersionId: "v2",
    licenseType: "mixed",
    licenseScope: "international",
    licensingPeriod: 365,
    renewableAlertMessage: "Your enterprise license will expire soon. Please contact sales to renew.",
    gracePeriodDays: 30,
    expiryDate: sixtyDaysFromNow,
    maxUsersAllowed: 50,
    currentUsers: 42,
    allowedCountries: ["US", "CA", "MX"],
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01")
  }
];

// Helper function to get license with customer data
export function getLicenseWithCustomer(licenseId: string): License | undefined {
  const license = mockLicenses.find(l => l.id === licenseId);
  if (!license) return undefined;
  
  const customer = mockCustomers.find(c => c.id === license.customerId);
  
  return {
    ...license,
    customer
  };
}

export function getAllLicensesWithCustomers(): License[] {
  return mockLicenses.map(license => {
    const customer = mockCustomers.find(c => c.id === license.customerId);
    return {
      ...license,
      customer
    };
  });
}
