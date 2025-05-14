import * as React from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"
import { Check, ChevronRight, Circle } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"

import { cn } from "@/lib/utils"

const MenubarMenu = MenubarPrimitive.Menu

const MenubarGroup = MenubarPrimitive.Group

const MenubarPortal = MenubarPrimitive.Portal

const MenubarSub = MenubarPrimitive.Sub

const MenubarRadioGroup = MenubarPrimitive.RadioGroup

const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn(
      "flex h-10 items-center space-x-1 rounded-md border bg-background p-1",
      className
    )}
    {...props}
  />
))
Menubar.displayName = MenubarPrimitive.Root.displayName

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      className
    )}
    {...props}
  />
))
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </MenubarPrimitive.SubTrigger>
))
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(
  (
    { className, align = "start", alignOffset = -4, sideOffset = 8, ...props },
    ref
  ) => (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  )
)
MenubarContent.displayName = MenubarPrimitive.Content.displayName

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
MenubarItem.displayName = MenubarPrimitive.Item.displayName

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
))
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
))
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
MenubarLabel.displayName = MenubarPrimitive.Label.displayName

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName

const MenubarShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
MenubarShortcut.displayname = "MenubarShortcut"

// Customer state
const [availableCustomers, setAvailableCustomers] = useState<Array<{id: string, name: string, email: string}>>([]);
const [selectedCustomerId, setSelectedCustomerId] = useState("");

// Simulation state
const [simulatedCustomerId, setSimulatedCustomerId] = useState("");

useEffect(() => {
  const fetchAllData = async () => {
    try {
      // Fetch customers first
      const customers = await fetchCustomers();
      console.log("Fetched customers from database:", customers);
      setAvailableCustomers(customers);
      
      if (customers.length > 0) {
        setSelectedCustomerId(customers[0].id);
        setSimulatedCustomerId(customers[0].id);
      }
      
      // Then fetch products
      const products = await fetchProducts();
      console.log("Fetched products from database:", products);
      setAvailableProducts(products);
      
      // Set default product and fetch versions
      if (products.length > 0) {
        setSimulatedProductName(products[0].name);
        setProductId(products[0].id);
        await updateProductVersions(products[0].id);
      }
      
      // Then fetch available licenses for the selected customer
      if (customers.length > 0 && products.length > 0) {
        await fetchCustomerLicenses(customers[0].id);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast({
        title: "Data Loading Error",
        description: "Could not load data from the database",
        variant: "destructive"
      });
    }
  };
  
  fetchAllData();
}, []);

const fetchCustomerLicenses = async (customerId: string) => {
  try {
    // This would call your API endpoint for customer-specific licenses
    const customerLicenses = await fetchLicensesByCustomerId(customerId);
    
    // If customer has licenses, select the first one by default
    if (customerLicenses.length > 0) {
      setLicenseId(customerLicenses[0].id);
      
      // Check if the license matches the currently selected product
      const matchingLicense = customerLicenses.find(license => 
        license.productId === productId
      );
      
      if (matchingLicense) {
        setLicenseId(matchingLicense.id);
      }
    }
    
    return customerLicenses;
  } catch (error) {
    console.error(`Error fetching licenses for customer ${customerId}:`, error);
    return [];
  }
};

const handleCustomerSelect = async (customerId: string) => {
  setSelectedCustomerId(customerId);
  
  // Update available licenses for this customer
  await fetchCustomerLicenses(customerId);
};

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsVerifying(true);
  setVerificationResult(null);
  
  try {
    // Check if customer exists
    const customer = availableCustomers.find(c => c.id === selectedCustomerId);
    if (!customer) {
      throw new Error("Customer not found");
    }
    
    // Find the customer's license for the selected product
    const license = licenses.find(l => 
      l.customerId === selectedCustomerId && 
      l.productId === productId
    );
    
    if (!license) {
      setVerificationResult({
        license: {} as License, // TypeScript placeholder
        success: false,
        message: `Customer ${customer.name} does not have a license for this product`,
        status: "error",
        canAccessProduct: false
      });
      
      toast({
        title: "License Error",
        description: `Customer ${customer.name} does not have a license for this product`,
        variant: "destructive"
      });
      
      return;
    }
    
    // Continue with existing verification logic using the found license
    // ...
  } catch (error) {
    // Error handling
  } finally {
    setIsVerifying(false);
  }
};

const handleSimulateProduct = async () => {
  if (!simulatedCustomerId) {
    toast({
      title: "Error",
      description: "Please select a customer",
      variant: "destructive"
    });
    return;
  }

  setIsVerifying(true);
  setSimulationActive(true);
  setSimulationResult(null);
  
  try {
    const customer = availableCustomers.find(c => c.id === simulatedCustomerId);
    if (!customer) {
      throw new Error("Customer not found");
    }
    
    // Find product ID from name
    const product = availableProducts.find(p => p.name === simulatedProductName);
    if (!product) {
      throw new Error("Product not found");
    }
    
    // Find the customer's license for the selected product
    const license = licenses.find(l => 
      l.customerId === simulatedCustomerId && 
      l.productId === product.id
    );
    
    if (!license) {
      setSimulationResult({
        success: false,
        message: `Customer ${customer.name} does not have a license for ${simulatedProductName}`,
        details: [
          `Customer: ${customer.name}`,
          `Product: ${simulatedProductName}`,
          `Result: No valid license found`
        ]
      });
      return;
    }
    
    // Convert the simulated date to a Date object for comparison
    const simulationDateObj = new Date(simulatedDate);
    
    // Check if license has expired based on simulated date
    if (license.expiryDate && simulationDateObj > new Date(license.expiryDate)) {
      setSimulationResult({
        success: false,
        message: "Product license has expired",
        details: [
          `Customer: ${customer.name}`,
          `Simulated date: ${simulationDateObj.toLocaleDateString()}`,
          `License expiry: ${new Date(license.expiryDate).toLocaleDateString()}`
        ]
      });
      return;
    }
    
    // Continue with existing verification checks (MAC address, country, etc.)
    // ...
    
    // Check if product version is allowed
    const isVersionAllowed = true; // Implement your version verification logic here
    
    if (!isVersionAllowed) {
      setSimulationResult({
        success: false,
        message: `This license does not allow access to version ${simulatedProductVersion}`,
        details: [
          `Customer: ${customer.name}`,
          `Product: ${simulatedProductName}`,
          `Requested version: ${simulatedProductVersion}`,
          `License allows: [list of allowed versions]`
        ]
      });
      return;
    }
    
    // If all checks pass, show success
    setSimulationResult({
      success: true,
      message: "Product launched successfully with valid license",
      details: [
        `Customer: ${customer.name}`,
        `Product: ${simulatedProductName} ${simulatedProductVersion}`,
        `License ID: ${license.id}`,
        `License type: ${license.licenseType}`
      ]
    });
  } catch (error) {
    // Error handling
  } finally {
    setIsVerifying(false);
  }
};

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
}
