import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Check, X, Plus, Trash } from "lucide-react";
import { CustomerForm } from "./CustomerForm";
import { useData } from "@/context/DataContext";
import { License, LicenseType, LicenseScope } from "@/types/license";

const licenseFormSchema = z.object({
  customerId: z.string().min(1, { message: "Customer is required" }),
  productId: z.string().min(1, { message: "Product is required" }),
  productVersionId: z.string().min(1, { message: "Product version is required" }),
  licenseType: z.string().min(1, { message: "License type is required" }),
  licenseScope: z.enum(["international", "local"]),
  licensingPeriod: z.coerce.number().min(1, { message: "Licensing period is required" }),
  renewableAlertMessage: z.string().min(1, { message: "Renewable alert message is required" }),
  gracePeriodDays: z.coerce.number().min(0),
  
  // Optional fields based on license type
  expiryDate: z.string().optional(),
  maxUsersAllowed: z.coerce.number().optional(),
  currentUsers: z.coerce.number().optional(),
  macAddresses: z.string().optional(),
  allowedCountries: z.string().optional()
});

export function CreateLicenseForm() {
  const { customers, products, addLicense } = useData();
  const [isDateBased, setIsDateBased] = useState(false);
  const [isUserCountBased, setIsUserCountBased] = useState(false);
  const [isMacBased, setIsMacBased] = useState(false);
  const [isCountryBased, setIsCountryBased] = useState(false);
  const [productVersions, setProductVersions] = useState<any[]>([]);
  const [macAddresses, setMacAddresses] = useState<string[]>([]);
  const [newMacAddress, setNewMacAddress] = useState("");
  const [allowedCountries, setAllowedCountries] = useState<string[]>([]);
  const [newCountry, setNewCountry] = useState("");
  
  const form = useForm<z.infer<typeof licenseFormSchema>>({
    resolver: zodResolver(licenseFormSchema),
    defaultValues: {
      customerId: "",
      productId: "",
      productVersionId: "",
      licenseType: "",
      licenseScope: "international",
      licensingPeriod: 365,
      renewableAlertMessage: "Your license will expire soon. Please contact your administrator to renew.",
      gracePeriodDays: 14,
      expiryDate: "",
      maxUsersAllowed: 0,
      currentUsers: 0,
      macAddresses: "",
      allowedCountries: ""
    }
  });
  
  // When product selection changes, load its versions
  const handleProductChange = (productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct && selectedProduct.versions) {
      setProductVersions(selectedProduct.versions);
    } else {
      setProductVersions([]);
    }
    form.setValue("productVersionId", "");
  };
  
  // Handle license type changes
  const handleLicenseTypeChange = (type: string) => {
    const licenseTypes = type.split(',');
    
    setIsDateBased(licenseTypes.includes("date_based"));
    setIsUserCountBased(licenseTypes.includes("user_count_based"));
    setIsMacBased(licenseTypes.includes("mac_based"));
    setIsCountryBased(licenseTypes.includes("country_based"));
    
    // Set the licenseType field directly
    form.setValue("licenseType", licenseTypes.length > 0 ? licenseTypes.join(',') : "");
  };
  
  // Handle MAC addresses
  const addMacAddress = () => {
    if (newMacAddress && !macAddresses.includes(newMacAddress)) {
      const updatedMacs = [...macAddresses, newMacAddress];
      setMacAddresses(updatedMacs);
      form.setValue("macAddresses", updatedMacs.join(','));
      setNewMacAddress("");
    }
  };
  
  const removeMacAddress = (mac: string) => {
    const updatedMacs = macAddresses.filter(m => m !== mac);
    setMacAddresses(updatedMacs);
    form.setValue("macAddresses", updatedMacs.join(','));
  };
  
  // Handle countries
  const addCountry = () => {
    if (newCountry && !allowedCountries.includes(newCountry)) {
      const updatedCountries = [...allowedCountries, newCountry];
      setAllowedCountries(updatedCountries);
      form.setValue("allowedCountries", updatedCountries.join(','));
      setNewCountry("");
    }
  };
  
  const removeCountry = (country: string) => {
    const updatedCountries = allowedCountries.filter(c => c !== country);
    setAllowedCountries(updatedCountries);
    form.setValue("allowedCountries", updatedCountries.join(','));
  };
  
  const onSubmit = async (data: z.infer<typeof licenseFormSchema>) => {
    console.log("Form values:", data);
    
    // Ensure license type is properly set
    let licenseType: LicenseType = "mixed";
    if (isDateBased && !isUserCountBased && !isMacBased && !isCountryBased) {
      licenseType = "date_based";
    } else if (!isDateBased && isUserCountBased && !isMacBased && !isCountryBased) {
      licenseType = "user_count_based";
    } else if (!isDateBased && !isUserCountBased && isMacBased && !isCountryBased) {
      licenseType = "mac_based";
    } else if (!isDateBased && !isUserCountBased && !isMacBased && isCountryBased) {
      licenseType = "country_based";
    }
    
    // Create complete license object with all required fields
    const license: Omit<License, "id" | "createdAt" | "updatedAt"> = {
      customerId: data.customerId,
      productId: data.productId,
      productVersionId: data.productVersionId,
      licenseType,
      licenseScope: data.licenseScope as LicenseScope,
      licensingPeriod: data.licensingPeriod,
      renewableAlertMessage: data.renewableAlertMessage,
      gracePeriodDays: data.gracePeriodDays,
    };
    
    // Add optional fields based on license type
    if (isDateBased && data.expiryDate) {
      license.expiryDate = new Date(data.expiryDate);
    }
    
    if (isUserCountBased) {
      license.maxUsersAllowed = data.maxUsersAllowed;
      license.currentUsers = data.currentUsers;
    }
    
    if (isMacBased && macAddresses.length > 0) {
      license.macAddresses = macAddresses;
    }
    
    if (isCountryBased && allowedCountries.length > 0) {
      license.allowedCountries = allowedCountries;
    }
    
    console.log("License being submitted:", license);
    
    try {
      await addLicense(license);
      toast({
        title: "Success",
        description: "License created successfully"
      });
      // Only reset form on success
      form.reset();
      // Reset other state
      setMacAddresses([]);
      setAllowedCountries([]);
      setIsDateBased(false);
      setIsUserCountBased(false);
      setIsMacBased(false);
      setIsCountryBased(false);
    } catch (error) {
      console.error("License creation failed:", error);
      toast({
        title: "Error",
        description: "Failed to create license",
        variant: "destructive"
      });
      // Don't reset form on error
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create New License</CardTitle>
        <CardDescription>
          Fill out the form below to create a new license for a customer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Selection */}
              <div>
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <div className="flex gap-2 items-center">
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map(customer => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <CustomerForm onSuccess={() => form.setValue("customerId", "")} />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Product Selection */}
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleProductChange(value);
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Product Version Selection */}
              <FormField
                control={form.control}
                name="productVersionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Version</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={productVersions.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select version" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {productVersions.map(version => (
                          <SelectItem key={version.id} value={version.id}>
                            {version.version}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {productVersions.length === 0 && (
                      <FormDescription>
                        Select a product first to view available versions
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* License Scope */}
              <FormField
                control={form.control}
                name="licenseScope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Scope</FormLabel>
                    <Select 
                      onValueChange={field.onChange as (value: string) => void} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select scope" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="international">International</SelectItem>
                        <SelectItem value="local">Local</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* License Type Selection */}
            <div className="space-y-4">
              <FormLabel>License Type</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="type-date"
                    checked={isDateBased}
                    onCheckedChange={() => setIsDateBased(!isDateBased)}
                    onClick={() => {
                      const types = [];
                      if (!isDateBased) types.push("date_based");
                      if (isUserCountBased) types.push("user_count_based");
                      if (isMacBased) types.push("mac_based");
                      if (isCountryBased) types.push("country_based");
                      handleLicenseTypeChange(types.join(','));
                    }}
                  />
                  <label 
                    htmlFor="type-date"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Date based
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="type-user"
                    checked={isUserCountBased}
                    onCheckedChange={() => setIsUserCountBased(!isUserCountBased)}
                    onClick={() => {
                      const types = [];
                      if (isDateBased) types.push("date_based");
                      if (!isUserCountBased) types.push("user_count_based");
                      if (isMacBased) types.push("mac_based");
                      if (isCountryBased) types.push("country_based");
                      handleLicenseTypeChange(types.join(','));
                    }}
                  />
                  <label 
                    htmlFor="type-user"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    User count based
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="type-mac"
                    checked={isMacBased}
                    onCheckedChange={() => setIsMacBased(!isMacBased)}
                    onClick={() => {
                      const types = [];
                      if (isDateBased) types.push("date_based");
                      if (isUserCountBased) types.push("user_count_based");
                      if (!isMacBased) types.push("mac_based");
                      if (isCountryBased) types.push("country_based");
                      handleLicenseTypeChange(types.join(','));
                    }}
                  />
                  <label 
                    htmlFor="type-mac"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    MAC based
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="type-country"
                    checked={isCountryBased}
                    onCheckedChange={() => setIsCountryBased(!isCountryBased)}
                    onClick={() => {
                      const types = [];
                      if (isDateBased) types.push("date_based");
                      if (isUserCountBased) types.push("user_count_based");
                      if (isMacBased) types.push("mac_based");
                      if (!isCountryBased) types.push("country_based");
                      handleLicenseTypeChange(types.join(','));
                    }}
                  />
                  <label 
                    htmlFor="type-country"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Country based
                  </label>
                </div>
              </div>
              
              {/* Hidden field to bind licenseType with form */}
              <FormField
                control={form.control}
                name="licenseType"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {(!isDateBased && !isUserCountBased && !isMacBased && !isCountryBased) && (
                <p className="text-sm text-destructive">Please select at least one license type</p>
              )}
              
              {form.formState.errors.licenseType && (
                <p className="text-sm text-destructive">{form.formState.errors.licenseType.message}</p>
              )}
            </div>
            
            {/* Common license fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="licensingPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Licensing Period (days)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gracePeriodDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grace Period (days)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="renewableAlertMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Renewable Alert Message</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Date-based license fields */}
            {isDateBased && (
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        value={field.value || ""}  
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {/* User-based license fields */}
            {isUserCountBased && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="maxUsersAllowed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Users Allowed</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          value={field.value || 0}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="currentUsers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Users</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          value={field.value || 0}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {/* MAC-based license fields */}
            {isMacBased && (
              <div className="space-y-4">
                <FormLabel>MAC Addresses</FormLabel>
                <div className="flex items-center space-x-2">
                  <Input 
                    value={newMacAddress}
                    onChange={(e) => setNewMacAddress(e.target.value)} 
                    placeholder="00:1A:2B:3C:4D:5E"
                  />
                  <Button 
                    type="button"
                    onClick={addMacAddress}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {macAddresses.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {macAddresses.map((mac, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                        <span className="text-sm">{mac}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMacAddress(mac)}
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No MAC addresses added yet</p>
                )}
              </div>
            )}
            
            {/* Country-based license fields */}
            {isCountryBased && (
              <div className="space-y-4">
                <FormLabel>Allowed Countries</FormLabel>
                <div className="flex items-center space-x-2">
                  <Input 
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)} 
                    placeholder="US, CA, GB, etc."
                  />
                  <Button 
                    type="button"
                    onClick={addCountry}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {allowedCountries.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {allowedCountries.map((country, index) => (
                      <div key={index} className="inline-flex items-center bg-muted px-2 py-1 rounded text-sm">
                        {country}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 ml-1"
                          onClick={() => removeCountry(country)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No countries added yet</p>
                )}
              </div>
            )}
            
            <Button type="submit" className="w-full">Create License</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
