/**
 * Calculate the number of days between two dates
 */
export const calculateDaysBetween = (startDate: Date, endDate: Date): number => {
  const differenceInTime = endDate.getTime() - startDate.getTime();
  return Math.ceil(differenceInTime / (1000 * 3600 * 24));
};

/**
 * Check if a date string represents a date in the future
 */
export const isDateInFuture = (date: string): boolean => {
  return new Date(date) > new Date();
};

/**
 * Get the current date in YYYY-MM-DD format for min date attributes
 */
export const getMinDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Validate a MAC address format
 */
export const isValidMacAddress = (mac: string): boolean => {
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return macRegex.test(mac);
};

/**
 * Validate a country code (assuming ISO 3166-1 alpha-2)
 */
export const isValidCountryCode = (code: string): boolean => {
  const countryRegex = /^[A-Z]{2}$/;
  return countryRegex.test(code);
};
