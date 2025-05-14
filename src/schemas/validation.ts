import { z } from "zod";

/**
 * Reusable validation schemas for forms
 */
export const validationSchemas = {
  // Common validations
  requiredString: z.string().min(1, { message: "This field is required" }),
  
  // Date validations
  futureDate: z.string()
    .refine(date => !date || new Date(date) > new Date(), {
      message: "Date must be in the future"
    }),
  
  // Number validations
  positiveNumber: z.coerce.number()
    .min(0, { message: "Value cannot be negative" }),
  
  positiveInteger: z.coerce.number()
    .min(1, { message: "Value must be at least 1" })
    .refine(n => Number.isInteger(n), { 
      message: "Value must be a whole number" 
    }),
  
  // License specific
  licenseType: z.enum(["date_based", "user_count_based", "mac_based", "country_based", "mixed"]),
  
  licenseScope: z.enum(["international", "local"])
};
