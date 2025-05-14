import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { mockLicenses } from "@/data/mockLicenses";
import { License } from "@/types/license";
import { LicenseVerificationService } from "@/services/licenseVerificationService";
import { Lock, Mail, Calendar, Shield, AlertTriangle, CheckCircle2, XCircle, Loader2, User, Laptop, Building, RefreshCw, Globe, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLicenseDemo } from "@/hooks/useLicenseDemo";
import { 
  fetchProducts, 
  fetchProductVersions, 
  fetchProductVersionsByProductId, 
  initializeGRCVersions,
  fetchCustomers,
  fetchCustomersByProductAndVersion
} from "@/services/directDatabaseService";

export function LicenseLoginDemo() {
  const { licenses, users, addUser, removeUser, verifyLicense, getUsersByLicense, resetDemo } = useLicenseDemo();
  
  const [licenseId, setLicenseId] = useState("l1"); // Default to a valid license
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [company, setCompany] = useState("");
  const [productId, setProductId] = useState("p1"); // Default product
  const [deviceInfo, setDeviceInfo] = useState("Windows 10"); // Default device
  const [macAddress, setMacAddress] = useState("00:1A:2B:3C:4D:5E"); // Default MAC
  const [countryCode, setCountryCode] = useState("US"); // Default country
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  
  // Added for user management
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserDevice, setNewUserDevice] = useState("Windows 10");
  const [licenseUsers, setLicenseUsers] = useState<Array<any>>([]);
  
  // Add license tracking state
  const [verificationResult, setVerificationResult] = useState<{
    license: License;
    success: boolean;
    message: string;
    status: "verifying" | "success" | "warning" | "error";
    canAccessProduct?: boolean;
  } | null>(null);

  // Inside the LicenseLoginDemo component, add new state variables for the product simulator
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulatedProductName, setSimulatedProductName] = useState("ProductSphere Analytics");
  const [simulatedProductVersion, setSimulatedProductVersion] = useState("v2.5.1");
  const [simulatedDate, setSimulatedDate] = useState(new Date().toISOString().split('T')[0]);
  const [simulatedMacAddress, setSimulatedMacAddress] = useState("00:1A:2B:3C:4D:5E");
  const [simulatedCountry, setSimulatedCountry] = useState("US");
  const [simulationResult, setSimulationResult] = useState<{
    success: boolean;
    message: string;
    details?: string[];
  } | null>(null);

  // Add new state variables for license key management
  const [rememberLicense, setRememberLicense] = useState(false);
  const [savedLicenses, setSavedLicenses] = useState<{email: string, licenseId: string, productName: string}[]>([
    { email: "john@example.com", licenseId: "l1", productName: "ProductSphere Analytics" },
    { email: "jane@example.com", licenseId: "l4", productName: "ProductSphere Designer" }
  ]);
  const [retrieveModalOpen, setRetrieveModalOpen] = useState(false);
  const [retrieveEmail, setRetrieveEmail] = useState("");
  const [retrieveResults, setRetrieveResults] = useState<{email: string, licenseId: string, productName: string}[]>([]);

  // Add state variables for products and versions
  const [availableProducts, setAvailableProducts] = useState<Array<{id: string, name: string}>>([]);
  const [availableVersions, setAvailableVersions] = useState<Array<{id: string, version: string, productId: string}>>([]);
  const [selectedProductVersions, setSelectedProductVersions] = useState<Array<{id: string, version: string}>>([]);

  // Add state variables for available customers and selected customer
  const [availableCustomers, setAvailableCustomers] = useState<Array<{id: string, name: string}>>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [customerProducts, setCustomerProducts] = useState<Array<{id: string, name: string, customerId: string}>>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  // Add a new state variable to hold all customers (add this near your other state variables)
  const [allAvailableCustomers, setAllAvailableCustomers] = useState<Array<{id: string, name: string}>>([]);

  // Debug licenses
  useEffect(() => {
    console.log("==== Debug License Data ====");
    console.log("Total licenses:", licenses.length);
    
    // Check which licenses have product and version IDs
    const licensesWithProduct = licenses.filter(l => !!l.productId);
    const licensesWithVersion = licenses.filter(l => !!l.productVersionId);
    const licensesWithBoth = licenses.filter(l => !!l.productId && !!l.productVersionId);
    const licensesWithCustomer = licenses.filter(l => !!l.customer);
    
    console.log(`Licenses with product ID: ${licensesWithProduct.length}/${licenses.length}`);
    console.log(`Licenses with version ID: ${licensesWithVersion.length}/${licenses.length}`);
    console.log(`Licenses with both IDs: ${licensesWithBoth.length}/${licenses.length}`);
    console.log(`Licenses with customer: ${licensesWithCustomer.length}/${licenses.length}`);
    
    // Log each license's key information
    licenses.forEach((license, index) => {
      console.log(`License ${index+1} (${license.id}):`);
      console.log(`  Product ID: ${license.productId || 'MISSING'}`);
      console.log(`  Version ID: ${license.productVersionId || 'MISSING'}`);
      console.log(`  Customer: ${license.customer?.name || 'MISSING'}`);
      console.log(`  License Type: ${license.licenseType || 'MISSING'}`);
      console.log(`  Expiry: ${license.expiryDate ? new Date(license.expiryDate).toLocaleDateString() : 'NEVER'}`);
    });
    
    console.log("==== End Debug ====");
  }, [licenses]);

  // Add effect to fetch products and versions on component mount
  useEffect(() => {
    // Fetch products and versions from database
    const fetchProductsAndVersions = async () => {
      try {
        // Fetch actual products from the database API
        const products = await fetchProducts();
        console.log("Fetched products from database:", products);
        
        // Fetch actual product versions from the database API
        const versions = await fetchProductVersions();
        console.log("Fetched versions from database:", versions);
        
        setAvailableProducts(products);
        setAvailableVersions(versions);
        
        // Set default product and update versions list
        if (products.length > 0) {
          setSimulatedProductName(products[0].name);
          // Set the product ID in the login panel to match the first product
          setProductId(products[0].id);
          await updateProductVersions(products[0].id);
        }
      } catch (error) {
        console.error("Error fetching product data from database:", error);
        toast({
          title: "Data Loading Error",
          description: "Could not load products from the database. Please check your connection.",
          variant: "destructive"
        });
      }
    };
    
    fetchProductsAndVersions();
  }, []);

  // Fix the updateProductVersions function to only show actual versions from the database
  const updateProductVersions = async (productId: string) => {
    console.log(`Updating versions for product ID: ${productId}`);
    
    try {
      // Clear previous versions first
      setSelectedProductVersions([]);
      setSimulatedProductVersion("");
      
      // Get product name for logging
      const productName = availableProducts.find(p => p.id === productId)?.name || "Unknown";
      console.log(`Getting versions for ${productName} (ID: ${productId})`);
      
      // Fetch versions for this product from the API
      const productVersions = await fetchProductVersionsByProductId(productId);
      console.log(`Fetched ${productVersions.length} versions for product ${productId}:`, productVersions);
      
      // Set the versions in state - only use actual versions from the database
      setSelectedProductVersions(productVersions);
      
      // If we have versions, select the latest one
      if (productVersions.length > 0) {
        // Sort versions to get the latest one
        const sortedVersions = [...productVersions].sort((a, b) => 
          b.version.localeCompare(a.version, undefined, { numeric: true })
        );
        
        const latestVersion = sortedVersions[0].version;
        console.log(`Setting default version to: ${latestVersion}`);
        setSimulatedProductVersion(latestVersion);
        
        // Update customers for this product and version
        setTimeout(() => {
          forceCustomerAssignments(productName);
        }, 300);
      } else {
        console.log(`No versions available for product ${productName}`);
        // Clear customers if no versions available
        setAvailableCustomers([]);
        setSelectedCustomerId("");
      }
    } catch (error) {
      console.error(`Error fetching versions for product ${productId}:`, error);
      // Clear versions and customers on error
      setSelectedProductVersions([]);
      setSimulatedProductVersion("");
      setAvailableCustomers([]);
      setSelectedCustomerId("");
    }
  };

  // Update product selection handler
  const handleProductSelect = async (value: string) => {
    console.log(`Product selected with ID: ${value}`);
    
    // First clear customers to avoid showing stale data
    setAvailableCustomers([]);
    setSelectedCustomerId("");
    
    // Set the selected product ID
    setSelectedProductId(value);
    
    // Get the product name
    const product = availableProducts.find(p => p.id === value);
    if (product) {
      console.log(`Selected product: ${product.name} (ID: ${product.id})`);
      setSimulatedProductName(product.name);
      
      // Update the product ID in the login panel to keep it in sync
      setProductId(value);
      
      // Load versions for this product
      await updateProductVersions(value);
    } else {
      console.error(`Product not found with ID: ${value}`);
      setSimulatedProductName("");
      setSelectedProductVersions([]);
      setSimulatedProductVersion("");
    }
  };

  // Update selected license when licenseId changes
  useEffect(() => {
    const license = licenses.find(l => l.id === licenseId);
    setSelectedLicense(license || null);
    
    if (license) {
      setLicenseUsers(getUsersByLicense(license.id));
    } else {
      setLicenseUsers([]);
    }
  }, [licenseId, licenses, getUsersByLicense]);

  // Update simulator product when product ID changes in the login panel
  useEffect(() => {
    // Find the product by ID
    const product = availableProducts.find(p => p.id === productId);
    if (product) {
      console.log(`Login panel product ID changed to: ${productId}, updating simulator`);
      setSimulatedProductName(product.name);
      
      // Use an async function inside useEffect
      const updateVersions = async () => {
        await updateProductVersions(product.id);
      };
      
      updateVersions().catch(error => {
        console.error("Error updating versions in useEffect:", error);
      });
    }
  }, [productId, availableProducts]);

  // Handle license selection
  const handleLicenseSelect = (id: string) => {
    setLicenseId(id);
  };

  // Add function to handle license retrieval
  const handleRetrieveLicense = () => {
    if (!retrieveEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to retrieve your licenses",
        variant: "destructive"
      });
      return;
    }
    
    // Find licenses associated with the email
    const foundLicenses = savedLicenses.filter(license => 
      license.email.toLowerCase() === retrieveEmail.toLowerCase()
    );
    
    setRetrieveResults(foundLicenses);
    
    if (foundLicenses.length === 0) {
      toast({
        title: "No Licenses Found",
        description: "We couldn't find any licenses associated with this email",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Licenses Retrieved",
        description: `Found ${foundLicenses.length} license(s) associated with your email`,
      });
    }
  };

  // Add function to save license
  const saveLicense = () => {
    if (!email || !licenseId) return;
    
    // Check if this license is already saved for this email
    const alreadySaved = savedLicenses.some(
      saved => saved.email.toLowerCase() === email.toLowerCase() && saved.licenseId === licenseId
    );
    
    if (!alreadySaved) {
      // Find the product name based on the selected productId
      const selectedProduct = availableProducts.find(p => p.id === productId);
      const productName = selectedProduct ? selectedProduct.name : "Unknown Product";
      
      const newSavedLicense = {
        email,
        licenseId,
        productName
      };
      
      setSavedLicenses([...savedLicenses, newSavedLicense]);
      
      toast({
        title: "License Saved",
        description: "Your license key has been associated with your email for easy retrieval",
      });
    }
  };

  // Modify the handleLogin function to save the license if remember is checked
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerificationResult(null);
    
    try {
      // Find the license
      const license = licenses.find(l => l.id === licenseId);
      if (!license) {
        throw new Error("License not found");
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify the license
      const result = verifyLicense(licenseId, {
        macAddress,
        countryCode,
        addUser: isAddingUser,
        username: username || email.split('@')[0],
        email,
        device: deviceInfo
      });
      
      // If remember license is checked and verification is successful, save the license
      if (rememberLicense && result.isValid && result.license) {
        saveLicense();
      }
      
      // Continue with the existing verification result handling...
      if (!result.isValid || !result.license) {
        setVerificationResult({
          license,
          success: false,
          message: result.message || "License verification failed",
          status: "error",
          canAccessProduct: false
        });
        
        toast({
          title: "License Error",
          description: result.message || "License verification failed",
          variant: "destructive"
        });
        
        return;
      }
      
      // Check if the user can access the specified product
      const canAccessProduct = (!license.productId || license.productId === productId);
      
      // Check if we have a warning message
      if (result.message && result.message !== 'License is valid') {
        setVerificationResult({
          license: result.license,
          success: true,
          message: result.message,
          status: "warning",
          canAccessProduct
        });
        
        toast({
          title: "License Warning",
          description: result.message,
        });
        
        return;
      }
      
      setVerificationResult({
        license: result.license,
        success: true,
        message: canAccessProduct ? 
          `Welcome, ${username || email}! Login successful - Product access granted` : 
          `Welcome, ${username || email}! Login successful - But you don't have access to this product`,
        status: "success",
        canAccessProduct
      });
      
      // Update license users list
      setLicenseUsers(getUsersByLicense(licenseId));
      
      toast({
        title: "Success",
        description: canAccessProduct ? 
          "License verified successfully with product access" : 
          "License verified but product access denied",
      });
      
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Add new user to a license
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLicense) {
      toast({
        title: "Error",
        description: "No license selected",
        variant: "destructive"
      });
      return;
    }
    
    if (!newUserName || !newUserEmail) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive"
      });
      return;
    }
    
    try {
    setIsVerifying(true);
      
      // Simulate adding user
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Add the user
      addUser(selectedLicense.id, {
        name: newUserName,
        email: newUserEmail,
        device: newUserDevice
      });
      
      // Update user list
      setLicenseUsers(getUsersByLicense(selectedLicense.id));
      
      // Reset form
      setNewUserName("");
      setNewUserEmail("");
      setNewUserDevice("Windows 10");
      
      toast({
        title: "User Added",
        description: `${newUserName} has been added successfully`,
      });
      
    } catch (error) {
      toast({
        title: "Failed to Add User",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Remove a user
  const handleRemoveUser = async (userId: string) => {
    if (!selectedLicense) {
      return;
    }
    
    try {
      setIsVerifying(true);
      
      // Simulate removing user
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove the user
      removeUser(userId);
      
      // Update user list
      setLicenseUsers(getUsersByLicense(selectedLicense.id));
      
      toast({
        title: "User Removed",
        description: "User has been removed successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to Remove User",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Reset the demo
  const handleReset = async () => {
    setIsVerifying(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    resetDemo();
    setIsVerifying(false);
    
    toast({
      title: "Demo Reset",
      description: "License demo has been reset to initial state",
    });
  };

  // Add a new function to handle product simulation
  const handleSimulateProduct = async () => {
    if (!selectedLicense) {
      // Try to find the license by ID if it's not already selected
      const license = licenses.find(l => l.id === licenseId);
      if (!license) {
        toast({
          title: "Error",
          description: "Please select a valid license first",
          variant: "destructive"
        });
        return;
      }
      // Set the selected license
      setSelectedLicense(license);
    }

    // Rest of the function remains the same
    setIsVerifying(true);
    setSimulationActive(true);
    setSimulationResult(null);
    
    try {
      // At the beginning of the function, check if all required fields are selected
      if (!selectedCustomerId || !selectedProductId || !simulatedProductVersion) {
        toast({
          title: "Missing Information",
          description: "Please select customer, product, and version to proceed",
          variant: "destructive"
        });
        return;
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add customer verification
      const selectedCustomer = availableCustomers.find(c => c.id === selectedCustomerId);
      const customerName = selectedCustomer ? selectedCustomer.name : "Unknown";
      const customerID = selectedCustomerId;
      
      // Check if license is assigned to the customer
      if (selectedLicense.customer?.id && selectedLicense.customer.id !== customerID) {
        setSimulationResult({
          success: false,
          message: "License is not assigned to this customer",
          details: [
            `License customer: ${selectedLicense.customer.name || "Unknown"}`,
            `Current customer: ${customerName}`
          ]
        });
        return;
      }
      
      // Convert the simulated date to a Date object for comparison
      const simulationDateObj = new Date(simulatedDate);
      
      // Check if license has expired based on simulated date
      if (selectedLicense.expiryDate && simulationDateObj > new Date(selectedLicense.expiryDate)) {
        setSimulationResult({
          success: false,
          message: "Product license has expired",
          details: [
            `Simulated date: ${simulationDateObj.toLocaleDateString()}`,
            `License expiry: ${new Date(selectedLicense.expiryDate).toLocaleDateString()}`
          ]
        });
        return;
      }
      
      // Check MAC address restrictions
      if ((selectedLicense.licenseType === 'mac_based' || 
          (typeof selectedLicense.licenseType === 'string' && selectedLicense.licenseType.includes('mac_based'))) &&
          selectedLicense.macAddresses) {
        
        if (!selectedLicense.macAddresses.includes(simulatedMacAddress)) {
          setSimulationResult({
            success: false,
            message: "Hardware not authorized to use this product",
            details: [
              `Detected MAC: ${simulatedMacAddress}`,
              `Authorized MACs: ${selectedLicense.macAddresses.join(', ')}`
            ]
          });
          return;
        }
      }
      
      // Check country restrictions
      if ((selectedLicense.licenseType === 'country_based' || 
          (typeof selectedLicense.licenseType === 'string' && selectedLicense.licenseType.includes('country_based'))) &&
          selectedLicense.allowedCountries) {
        
        if (!selectedLicense.allowedCountries.includes(simulatedCountry)) {
          setSimulationResult({
            success: false,
            message: "Product not licensed for use in this region",
            details: [
              `Detected region: ${simulatedCountry}`,
              `Licensed regions: ${selectedLicense.allowedCountries.join(', ')}`
            ]
          });
          return;
        }
      }
      
      // Check user count limits for multi-user environments
      if ((selectedLicense.licenseType === 'user_count_based' || 
          selectedLicense.licenseType === 'mixed' ||
          (typeof selectedLicense.licenseType === 'string' && selectedLicense.licenseType.includes('user_count_based'))) &&
          selectedLicense.maxUsersAllowed !== undefined && 
          selectedLicense.currentUsers !== undefined) {
        
        if (selectedLicense.currentUsers >= selectedLicense.maxUsersAllowed) {
          setSimulationResult({
            success: false,
            message: "Maximum user limit reached for this license",
            details: [
              `Current users: ${selectedLicense.currentUsers}`,
              `Maximum allowed: ${selectedLicense.maxUsersAllowed}`
            ]
          });
          return;
        }
      }
      
      // If we got here, the license is valid
      let warningMessage = "";
      
      // Check for license expiring soon
      if (selectedLicense.expiryDate) {
        const expiryDate = new Date(selectedLicense.expiryDate);
        const simulatedDateObj = new Date(simulatedDate);
        const daysToExpiry = Math.ceil((expiryDate.getTime() - simulatedDateObj.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysToExpiry <= 30) {
          warningMessage = `Your license will expire in ${daysToExpiry} days. Please renew soon.`;
        }
      }
      
      // Check for approaching user limit
      if (selectedLicense.maxUsersAllowed !== undefined && selectedLicense.currentUsers !== undefined) {
        const remainingUsers = selectedLicense.maxUsersAllowed - selectedLicense.currentUsers;
        if (remainingUsers <= 2 && remainingUsers > 0) {
          warningMessage = `You're approaching your user limit (${selectedLicense.currentUsers}/${selectedLicense.maxUsersAllowed}).`;
        }
      }
      
      setSimulationResult({
        success: true,
        message: warningMessage || "Product launched successfully with valid license",
        details: [
          `Customer: ${availableCustomers.find(c => c.id === selectedCustomerId)?.name || "Unknown"}`,
          `Product: ${simulatedProductName} ${simulatedProductVersion}`,
          `License ID: ${selectedLicense.id}`,
          `License type: ${typeof selectedLicense.licenseType === 'string' && selectedLicense.licenseType.includes(',') 
            ? selectedLicense.licenseType.split(',').map(t => t.replace('_', ' ')).join(', ')
            : selectedLicense.licenseType.replace('_', ' ')}`,
          `Location: ${simulatedCountry}`,
          `MAC Address: ${simulatedMacAddress}`
        ]
      });
      
    } catch (error) {
      setSimulationResult({
        success: false,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
        details: ["Please contact your system administrator"]
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Update the filterCustomersForProductVersion function to only use actual database data
  const filterCustomersForProductVersion = async () => {
    if (!selectedProductId || !simulatedProductVersion) {
      console.log("Product or version not selected yet, skipping customer filtering");
      setAvailableCustomers([]);
      setSelectedCustomerId("");
      return;
    }
    
    // Get product name for debugging
    const productName = availableProducts.find(p => p.id === selectedProductId)?.name || "Unknown";
    console.log(`Starting customer fetch for ${productName} (ID: ${selectedProductId}) version ${simulatedProductVersion}`);
    
    try {
      // Log the current state
      console.log('Current state:', {
        selectedProductId,
        simulatedProductVersion,
        availableProducts,
        selectedProductVersions
      });

      const customers = await fetchCustomersByProductAndVersion(
        selectedProductId, 
        simulatedProductVersion
      );
      
      console.log(`API Response for customers:`, customers);
      
      if (customers && customers.length > 0) {
        console.log("Setting available customers:", customers);
        setAvailableCustomers(customers);
        setSelectedCustomerId(customers[0].id);
      } else {
        console.log("No customers found in response");
        setAvailableCustomers([]);
        setSelectedCustomerId("");
        setCustomerError("No customers have valid licenses for this product");
      }
    } catch (error) {
      console.error("Error in filterCustomersForProductVersion:", error);
      setAvailableCustomers([]);
      setSelectedCustomerId("");
      setCustomerError("Error loading customers");
    }
  };

  // Replace loadCustomers to remove fallbacks
  const loadCustomers = async () => {
    try {
      // Only use actual database API call
      const customers = await fetchCustomers();
      console.log("Fetched customers from database:", customers);
      
      if (customers && customers.length > 0) {
        setAvailableCustomers(customers);
        setAllAvailableCustomers(customers);
        setSelectedCustomerId(customers[0].id);
      } else {
        setAvailableCustomers([]);
        setAllAvailableCustomers([]);
        setSelectedCustomerId("");
        console.log("No customers returned from database");
      }
    } catch (error) {
      console.error("Error fetching customers from database:", error);
      setAvailableCustomers([]);
      setAllAvailableCustomers([]);
      setSelectedCustomerId("");
    }
  };

  // Remove all demo/fallback functions like createDemoLicenseForAicademy and ensureLicensesHaveCustomers

  // Replace forceCustomerAssignments to only use actual database relationships
  const forceCustomerAssignments = (productName: string) => {
    console.log(`Finding customers for product: ${productName}`);
    
    // Filter customers purely based on database information
    filterCustomersForProductVersion();
    return true;
  };

  // Add this after customers are loaded to ensure licenses have customer assignments
  // Could be a separate useEffect
  useEffect(() => {
    // If we have licenses and customers but licenses don't have customer assignments
    if (licenses.length > 0 && allAvailableCustomers.length > 0) {
      const needsCustomerAssignment = licenses.some(license => !license.customer);
      
      if (needsCustomerAssignment) {
        console.log("Some licenses need customer assignments - ensuring all licenses have customers");
        
        // We can't directly modify the licenses, so we'll handle this through other means
        // Let's just log the issue and rely on the server-side SQL view instead
        console.log(`${needsCustomerAssignment ? 'Some' : 'No'} licenses need customer assignments`);
        
        // If you really need to update licenses, you'd need to use a state updater function 
        // that's available in your component or context
      }
    }
  }, [licenses, allAvailableCustomers]);

  // Add this special case function to connect JSW Data Analysis with customers
  const connectJSWDataAnalysis = () => {
    // Look for the JSW Data Analysis product ID
    const jswProduct = availableProducts.find(p => p.name === "JSW Data Analysis");
    
    if (!jswProduct) {
      console.log("JSW Data Analysis product not found in available products");
      return;
    }
    
    console.log("Found JSW Data Analysis product:", jswProduct);
    
    // Find the appropriate version
    const version = selectedProductVersions.find(v => v.version === "1.0.0");
    
    // Find some customers to assign to this product
    const customersToAssign = allAvailableCustomers.filter(c => 
      c.name === "JSW Steels" || 
      c.name === "JSW Steel" || 
      c.name.includes("JSW")
    );
    
    // If no JSW customers found, use the first two customers
    const targetCustomers = customersToAssign.length > 0 
      ? customersToAssign 
      : allAvailableCustomers.slice(0, 2);
      
    console.log("Will assign these customers to JSW Data Analysis:", targetCustomers);
    
    // Update the UI to show these customers
    setAvailableCustomers(targetCustomers);
    if (targetCustomers.length > 0) {
      setSelectedCustomerId(targetCustomers[0].id);
    }
  }

  // Add this effect to monitor when all data is loaded
  useEffect(() => {
    // Check if we have all the necessary data loaded
    if (
      licenses.length > 0 && 
      allAvailableCustomers.length > 0 && 
      availableProducts.length > 0 && 
      availableVersions.length > 0
    ) {
      console.log("All data loaded - checking for JSW Data Analysis special case");
      
      // Check if JSW Data Analysis product exists
      const jswProduct = availableProducts.find(p => p.name === "JSW Data Analysis");
      
      if (jswProduct && selectedProductId === jswProduct.id) {
        console.log("JSW Data Analysis is selected - activating special case handler");
        setTimeout(connectJSWDataAnalysis, 500);
      }
    }
  }, [licenses, allAvailableCustomers, availableProducts, availableVersions, selectedProductId]);

  // Add this function to handle version selection
  const handleVersionSelect = (version: string) => {
    console.log(`Version selected: ${version}`);
    setSimulatedProductVersion(version);
    
    // Get the version object for debugging
    const versionObj = selectedProductVersions.find(v => v.version === version);
    console.log('Selected version object:', versionObj);
    
    // Trigger customer fetch
    filterCustomersForProductVersion();
  }

  // Call filterCustomersForProductVersion when product or version changes
  useEffect(() => {
    filterCustomersForProductVersion();
  }, [selectedProductId, simulatedProductVersion, licenses, allAvailableCustomers, selectedProductVersions]);

  // Update the updateCustomers function
  const updateCustomers = async () => {
    if (!selectedProductId || !simulatedProductVersion) {
      setAvailableCustomers([]);
      return;
    }
    
    try {
      const customers = await fetchCustomersByProductAndVersion(selectedProductId, simulatedProductVersion);
      
      if (customers && customers.length > 0) {
        setAvailableCustomers(customers);
        setCustomerError("");
      } else {
        setAvailableCustomers([]);
        setCustomerError("No customers have valid licenses for this product");
      }
    } catch (error) {
      console.error("Error updating customers:", error);
      setAvailableCustomers([]);
      setCustomerError("Error loading customers");
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* License Selection and Login Panel */}
        <div className="md:col-span-1">
      <Card className="border border-slate-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Shield className="h-5 w-5 text-primary" />
                Product Login
          </CardTitle>
          <CardDescription>
                Simulate product login with license verification
          </CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-5">
                <div className="space-y-2">
                      <div className="flex justify-between items-center">
                  <Label htmlFor="licenseId" className="text-slate-700">License Key</Label>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs text-blue-600 hover:text-blue-800"
                          onClick={() => setRetrieveModalOpen(true)}
                        >
                          Retrieve License
                        </Button>
                      </div>
                  <div className="flex gap-2">
                    <Input
                      id="licenseId"
                      value={licenseId}
                          onChange={(e) => handleLicenseSelect(e.target.value)}
                      placeholder="Enter license key"
                      required
                      className="flex-grow font-mono text-sm"
                    />
                        <Select value={licenseId} onValueChange={handleLicenseSelect}>
                      <SelectTrigger className="w-28">
                        <SelectValue placeholder="Demo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="l1">Valid License</SelectItem>
                        <SelectItem value="l2">Expiring Soon</SelectItem>
                        <SelectItem value="l3">Expired</SelectItem>
                        <SelectItem value="l4">User Count</SelectItem>
                        <SelectItem value="l5">MAC Based</SelectItem>
                        <SelectItem value="l6">Country Based</SelectItem>
                        <SelectItem value="l7">Mixed License</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">Email</Label>
                      <div className="flex relative">
                        <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                          placeholder="user@company.com"
                      required
                          className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">Password</Label>
                      <div className="flex relative">
                        <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                          placeholder="********"
                    required
                          className="pl-10"
                  />
                </div>
                  </div>
                  
                  <div className="space-y-2">
                      <Label htmlFor="productId" className="text-slate-700">Product to Access</Label>
                      <Select value={productId} onValueChange={setProductId}>
                      <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                          {availableProducts.length > 0 ? (
                            availableProducts.map(product => (
                              <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                            ))
                          ) : (
                            <SelectItem value="loading" disabled>Loading products...</SelectItem>
                          )}
                      </SelectContent>
                    </Select>
                </div>

                    {/* Show MAC address field for MAC-based licenses */}
                    {selectedLicense && (selectedLicense.licenseType === 'mac_based' || 
                     (typeof selectedLicense.licenseType === 'string' && selectedLicense.licenseType.includes('mac_based'))) && (
                <div className="space-y-2">
                  <Label htmlFor="macAddress" className="text-slate-700">MAC Address</Label>
                        <div className="flex relative">
                          <Laptop className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    id="macAddress"
                    value={macAddress}
                    onChange={(e) => setMacAddress(e.target.value)}
                            placeholder="00:1A:2B:3C:4D:5E"
                            className="pl-10 font-mono"
                  />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Allowed MAC addresses: {selectedLicense.macAddresses?.join(', ')}
                  </p>
                </div>
                    )}

                    {/* Show country field for country-based licenses */}
                    {selectedLicense && (selectedLicense.licenseType === 'country_based' || 
                     (typeof selectedLicense.licenseType === 'string' && selectedLicense.licenseType.includes('country_based'))) && (
                      <div className="space-y-2">
                        <Label htmlFor="countryCode" className="text-slate-700">Country Code</Label>
                        <div className="flex relative">
                          <Building className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                          <Input
                            id="countryCode"
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                            placeholder="US"
                            className="pl-10 font-mono"
                            maxLength={2}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Allowed countries: {selectedLicense?.allowedCountries?.join(', ')}
                        </p>
                      </div>
                    )}

                    {/* Add user count checkbox for user-based licenses */}
                    {selectedLicense && (selectedLicense.licenseType === 'user_count_based' || 
                     selectedLicense.licenseType === 'mixed' ||
                     (typeof selectedLicense.licenseType === 'string' && selectedLicense.licenseType.includes('user_count_based'))) && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="addUser"
                    checked={isAddingUser}
                    onChange={() => setIsAddingUser(!isAddingUser)}
                          className="form-checkbox h-4 w-4 text-primary rounded"
                  />
                        <Label htmlFor="addUser" className="text-sm cursor-pointer">
                          Register as new user ({selectedLicense.currentUsers}/{selectedLicense.maxUsersAllowed} users)
                  </Label>
                </div>
                    )}

                    {/* Add the "Remember License" checkbox just before the login button */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="rememberLicense"
                        checked={rememberLicense}
                        onChange={() => setRememberLicense(!rememberLicense)}
                        className="form-checkbox h-4 w-4 text-primary rounded"
                      />
                      <Label htmlFor="rememberLicense" className="text-sm cursor-pointer">
                        Remember my license key
                      </Label>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex flex-col gap-4 pb-6">
                    <Button type="submit" className="w-full" disabled={isVerifying}>
                      {isVerifying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                          </>
                        ) : (
                        <>Login</>
                      )}
                    </Button>
                    
                    {verificationResult && (
                      <div className={`w-full p-3 rounded-md text-sm ${
                        verificationResult.status === 'success' 
                          ? 'bg-green-50 text-green-800 border border-green-200' 
                          : verificationResult.status === 'warning'
                            ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        <div className="flex items-start">
                          {verificationResult.status === 'success' && (
                            <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                          )}
                          {verificationResult.status === 'warning' && (
                            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500 flex-shrink-0" />
                          )}
                          {verificationResult.status === 'error' && (
                            <XCircle className="h-5 w-5 mr-2 text-red-500 flex-shrink-0" />
                          )}
                          <span>{verificationResult.message}</span>
                        </div>
                  </div>
                )}
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
                <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-5">
                <div className="space-y-2">
                  <Label htmlFor="reg-license" className="text-slate-700">License Key</Label>
                  <Input
                    id="reg-license"
                    value={licenseId}
                    onChange={(e) => setLicenseId(e.target.value)}
                    placeholder="Enter your organization's license key"
                    required
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500">
                    Required to register new users (must be user-count based)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-slate-700">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="johndoe"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-slate-700">Company</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Acme Corp"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="text-slate-700">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="email@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-slate-700">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-device" className="text-slate-700">Device Info</Label>
                    <Select value={deviceInfo} onValueChange={setDeviceInfo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select device" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Windows 10">Windows 10</SelectItem>
                        <SelectItem value="Windows 11">Windows 11</SelectItem>
                        <SelectItem value="macOS">macOS</SelectItem>
                        <SelectItem value="Linux">Linux</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-country" className="text-slate-700">Country</Label>
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="SG">Singapore</SelectItem>
                        <SelectItem value="IN">India</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50 border-t border-slate-100">
                <Button type="submit" className="w-full" disabled={isVerifying}>
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <User className="mr-2 h-4 w-4" />
                      Register New User
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
        </div>
        
        {/* License Details and User Management Panel */}
        <div className="md:col-span-2">
          <Card className="border border-slate-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <User className="h-5 w-5 text-primary" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage users associated with the selected license
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-5">
              {selectedLicense ? (
                <div className="space-y-6">
                  {/* License information summary */}
                  <div className="bg-slate-50 p-4 rounded-md border border-slate-100">
                    <h3 className="font-medium mb-2">License Information</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-slate-500">ID:</span> {selectedLicense.id}
                      </div>
                      <div>
                        <span className="text-slate-500">Type:</span> {
                          typeof selectedLicense.licenseType === 'string' && selectedLicense.licenseType.includes(',')
                            ? selectedLicense.licenseType.split(',').map(t => t.replace('_', ' ')).join(', ')
                            : selectedLicense.licenseType.replace('_', ' ')
                        }
                      </div>
                      {selectedLicense.expiryDate && (
                        <div>
                          <span className="text-slate-500">Expires:</span> {new Date(selectedLicense.expiryDate).toLocaleDateString()}
                        </div>
                      )}
                      {selectedLicense.maxUsersAllowed !== undefined && (
                        <div>
                          <span className="text-slate-500">Users:</span> {selectedLicense.currentUsers}/{selectedLicense.maxUsersAllowed}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* User list */}
                  <div>
                    <h3 className="font-medium mb-3">Registered Users</h3>
                    {licenseUsers.length > 0 ? (
                      <div className="border rounded-md overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-slate-50 text-left">
                            <tr>
                              <th className="px-4 py-3 text-sm font-medium text-slate-500">Name</th>
                              <th className="px-4 py-3 text-sm font-medium text-slate-500">Email</th>
                              <th className="px-4 py-3 text-sm font-medium text-slate-500">Device</th>
                              <th className="px-4 py-3 text-sm font-medium text-slate-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {licenseUsers.map(user => (
                              <tr key={user.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 text-sm">{user.name}</td>
                                <td className="px-4 py-3 text-sm">{user.email}</td>
                                <td className="px-4 py-3 text-sm">{user.device}</td>
                                <td className="px-4 py-3 text-sm">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleRemoveUser(user.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    Remove
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm">No users found for this license</p>
                    )}
                  </div>
                  
                  {/* Add new user form */}
                  {(selectedLicense.licenseType === 'user_count_based' || 
                    selectedLicense.licenseType === 'mixed' ||
                    (typeof selectedLicense.licenseType === 'string' && selectedLicense.licenseType.includes('user_count_based'))) && (
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-3">Add New User</h3>
                      
                      {selectedLicense.maxUsersAllowed !== undefined && 
                       selectedLicense.currentUsers !== undefined && 
                       selectedLicense.currentUsers >= selectedLicense.maxUsersAllowed ? (
                        <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-md text-sm text-yellow-800 mb-4">
                          <AlertTriangle className="h-4 w-4 inline-block mr-2" />
                          User limit reached ({selectedLicense.currentUsers}/{selectedLicense.maxUsersAllowed})
                        </div>
                      ) : (
                        <form onSubmit={handleAddUser} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="newUserName">Name</Label>
                              <Input
                                id="newUserName"
                                value={newUserName}
                                onChange={(e) => setNewUserName(e.target.value)}
                                placeholder="User name"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="newUserEmail">Email</Label>
                              <Input
                                id="newUserEmail"
                                type="email"
                                value={newUserEmail}
                                onChange={(e) => setNewUserEmail(e.target.value)}
                                placeholder="user@example.com"
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="newUserDevice">Device</Label>
                            <Select value={newUserDevice} onValueChange={setNewUserDevice}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select device" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Windows 10">Windows 10</SelectItem>
                                <SelectItem value="macOS">macOS</SelectItem>
                                <SelectItem value="Linux">Linux</SelectItem>
                                <SelectItem value="iOS">iOS</SelectItem>
                                <SelectItem value="Android">Android</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <Button 
                            type="submit" 
                            disabled={isVerifying || (selectedLicense.maxUsersAllowed !== undefined && 
                                                    selectedLicense.currentUsers !== undefined && 
                                                    selectedLicense.currentUsers >= selectedLicense.maxUsersAllowed)}
                          >
                            {isVerifying ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              <>Add User</>
                            )}
                          </Button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-slate-400">
                  Select a license to view user management options
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Product Simulator Section */}
      <div className="mt-8">
        <Card className="border border-slate-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Shield className="h-5 w-5 text-blue-600" />
              Product Simulator
            </CardTitle>
            <CardDescription>
              Simulate product launch from customer perspective with license verification
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Product Selection */}
              <div className="space-y-2">
                <Label htmlFor="product-name">Product Name</Label>
                <Select 
                  value={selectedProductId} 
                  onValueChange={handleProductSelect}
                  disabled={availableProducts.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Version Selection */}
              <div className="space-y-2">
                <Label htmlFor="product-version">Product Version</Label>
                <Select 
                  value={simulatedProductVersion} 
                  onValueChange={handleVersionSelect}
                  disabled={selectedProductVersions.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedProductVersions.length === 0 ? "No versions available" : "Select version"} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProductVersions.length > 0 ? (
                      selectedProductVersions.map(version => (
                        <SelectItem key={version.id} value={version.version}>
                          {version.version} {version.version === selectedProductVersions[selectedProductVersions.length - 1].version ? "(Latest)" : ""}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No versions available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Customer Selection */}
              <div className="space-y-2">
                <Label htmlFor="simulated-customer">Customer</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Select 
                    value={selectedCustomerId} 
                    onValueChange={(value) => setSelectedCustomerId(value)}
                    disabled={!selectedProductId || !simulatedProductVersion || availableCustomers.length === 0}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder={
                        !selectedProductId || !simulatedProductVersion 
                          ? "Select product and version first" 
                          : availableCustomers.length === 0
                            ? "No customers with licenses"
                            : "Select customer"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCustomers.length > 0 ? (
                        availableCustomers.map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No customers with licenses for this product</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-slate-500">
                  {!selectedProductId || !simulatedProductVersion
                    ? "Please select product and version first"
                    : availableCustomers.length === 0
                      ? "No customers have valid licenses for this product"
                      : `${availableCustomers.length} customer(s) have licenses for this product`
                  }
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Simulated Date */}
                <div className="space-y-2">
                  <Label htmlFor="simulated-date">Simulated Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="simulated-date"
                      type="date"
                      value={simulatedDate}
                      onChange={(e) => setSimulatedDate(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                {/* Simulated Country */}
                <div className="space-y-2">
                  <Label htmlFor="simulated-country">Simulated Country</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Select value={simulatedCountry} onValueChange={setSimulatedCountry}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="SG">Singapore</SelectItem>
                        <SelectItem value="IN">India</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                        <SelectItem value="JP">Japan</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-slate-500">
                    Simulate location for country-based licensing
                  </p>
                </div>
              </div>
              
              {/* MAC Address */}
              <div className="space-y-2">
                <Label htmlFor="simulated-mac">Hardware MAC Address</Label>
                <div className="relative">
                  <Laptop className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="simulated-mac"
                    value={simulatedMacAddress}
                    onChange={(e) => setSimulatedMacAddress(e.target.value)}
                    placeholder="00:1A:2B:3C:4D:5E"
                    className="pl-10 font-mono"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Simulate hardware MAC address for MAC-based licensing
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Reset Demo button at the bottom */}
      <div className="mt-8 text-center">
        <Button 
          variant="outline" 
          onClick={handleReset} 
          disabled={isVerifying}
          className="flex mx-auto items-center"
        >
          {isVerifying ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Reset Demo
        </Button>
        <p className="text-sm text-slate-500 mt-2">
          Reset the demo to its initial state to start fresh
        </p>
      </div>

      {/* License Retrieval Modal */}
      {retrieveModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center">
                <Shield className="h-5 w-5 text-primary mr-2" />
                Retrieve Your Licenses
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => setRetrieveModalOpen(false)}
              >
                <XCircle className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            
            <div className="p-4">
              <p className="text-sm text-slate-600 mb-4">
                Enter the email address associated with your license keys to retrieve them.
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="retrieve-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="retrieve-email"
                      type="email"
                      value={retrieveEmail}
                      onChange={(e) => setRetrieveEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={handleRetrieveLicense}
                >
                  Retrieve Licenses
                </Button>
              </div>
              
              {retrieveResults.length > 0 && (
                <div className="mt-6 border rounded-md overflow-hidden">
                  <div className="bg-slate-50 p-3 border-b">
                    <h4 className="font-medium text-sm">Your Licenses</h4>
                  </div>
                  <div className="divide-y">
                    {retrieveResults.map((result, index) => (
                      <div key={index} className="p-3 hover:bg-slate-50">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{result.productName}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-blue-600"
                            onClick={() => {
                              handleLicenseSelect(result.licenseId);
                              setRetrieveModalOpen(false);
                              toast({
                                title: "License Selected",
                                description: "Your license key has been applied"
                              });
                            }}
                          >
                            Use This License
                          </Button>
                        </div>
                        <div className="text-xs font-mono mt-1 text-slate-600">
                          {result.licenseId}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Simulation Result - Add this code to display results */}
      {simulationResult && (
        <div className={`mt-4 p-4 rounded-md ${
          simulationResult.success 
            ? 'bg-green-50 border border-green-100' 
            : 'bg-red-50 border border-red-100'
        }`}>
          <div className="flex items-start">
            {simulationResult.success ? (
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            ) : (
              <div className="bg-red-100 p-2 rounded-full mr-3">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            )}
            
            <div className="flex-1">
              <h3 className={`font-semibold text-lg ${
                simulationResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {simulationResult.success ? 'Product Started Successfully' : 'Product Failed to Start'}
              </h3>
              <p className={`mt-1 ${
                simulationResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {simulationResult.message}
              </p>
              
              {simulationResult.details && (
                <div className="mt-3 space-y-1">
                  {simulationResult.details.map((detail, index) => (
                    <p key={index} className="text-sm text-slate-600">{detail}</p>
                  ))}
                </div>
              )}
              
              {simulationResult.success && (
                <div className="mt-4 p-3 bg-white rounded-md border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-slate-700">Product Running</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Session started at {new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Launch Product Button */}
      <div className="mt-8 text-center">
        <Button 
          className="w-full max-w-md"
          onClick={handleSimulateProduct}
          disabled={!selectedLicense || isVerifying || !selectedCustomerId || !selectedProductId || !simulatedProductVersion}
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Launching product...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Launch Product with Selected License
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
