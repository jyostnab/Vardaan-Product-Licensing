import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { License } from "@/types/license";
import { LicenseStatus } from "./LicenseStatus";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { useData } from "@/context/DataContext"; // Import useData hook

interface LicenseVerificationModalProps {
  license: License | null;
  isOpen: boolean;
  onClose: () => void;
  onVerify: (license: License, addUser: boolean) => void;
  refreshData?: () => Promise<void>;
}

export function LicenseVerificationModal({ 
  license, 
  isOpen, 
  onClose, 
  onVerify,
  refreshData
}: LicenseVerificationModalProps) {
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  // Get products and versions from the data context
  const { products, productVersions } = useData();

  if (!license) return null;

  // Get product and version information
  const product = products.find(p => p.id === license.productId);
  const version = productVersions.find(v => v.id === license.productVersionId);
  
  // Display product and version info
  const productInfo = product ? product.name : "Unknown Product";
  const versionInfo = version ? version.version : "";
  const productDisplay = versionInfo ? `${productInfo} ${versionInfo}` : productInfo;

  const handleVerify = async () => {
    setIsVerifying(true);
    
    try {
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      onVerify(license, isAddingUser);
      
      toast({
        title: "License verified",
        description: "Your license verification was successful.",
      });
      
      onClose();
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        title: "Verification failed",
        description: "There was an error verifying your license.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetUsers = async () => {
    if (!license) return;
    
    setIsVerifying(true);
    try {
      // In a real implementation, you'd call your API here
      // For now, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Display success message
      toast({
        title: "Users Reset",
        description: "User count has been reset to 0.",
      });
      
      // Close modal and refresh data
      onClose();
      if (refreshData) {
        await refreshData();
      }
    } catch (error) {
      console.error("Error resetting users:", error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset user count. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>License Verification</DialogTitle>
          <DialogDescription>
            Verify license for {license.customer?.name || "Unknown Customer"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customer" className="text-right">
              Customer
            </Label>
            <div id="customer" className="col-span-3">
              {license.customer?.name || "Unknown"}
            </div>
          </div>
          
          {/* Replace License ID with Product and Version */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="product" className="text-right">
              Product
            </Label>
            <div id="product" className="col-span-3">
              {productDisplay}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              License Type
            </Label>
            <div id="type" className="col-span-3">
              {typeof license.licenseType === 'string' && license.licenseType.includes(',') 
                ? license.licenseType.split(',').map(t => t.replace(/_/g, ' ')).join(', ')
                : (license.licenseType || "Unknown").replace(/_/g, ' ')}
            </div>
          </div>
          
          <div className="grid gap-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Scope:</span>
              <span className="capitalize">{license.licenseScope}</span>
            </div>
            {license.expiryDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expiry Date:</span>
                <span>{new Date(license.expiryDate).toLocaleDateString()}</span>
              </div>
            )}
            {license.maxUsersAllowed !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Users:</span>
                <span>{license.currentUsers} / {license.maxUsersAllowed}</span>
              </div>
            )}
            {(license.licenseType === 'mac_based' || 
              (typeof license.licenseType === 'string' && license.licenseType.includes('mac_based'))) && 
              license.macAddresses && license.macAddresses.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">MAC Addresses:</span>
                <span>{license.macAddresses.join(', ')}</span>
              </div>
            )}
            {(license.licenseType === 'country_based' || 
              (typeof license.licenseType === 'string' && license.licenseType.includes('country_based'))) && 
              license.allowedCountries && license.allowedCountries.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Countries:</span>
                <span>{license.allowedCountries.join(', ')}</span>
              </div>
            )}
          </div>
          
          <div className="p-4 border rounded-md">
            <LicenseStatus 
              license={license} 
              addingUser={isAddingUser}
              showDetails={true}
            />
          </div>
          
          {(license.licenseType === 'user_count_based' || 
            license.licenseType === 'mixed' || 
            (typeof license.licenseType === 'string' && license.licenseType.includes('user_count_based'))) && 
            license.maxUsersAllowed && (
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="form-checkbox h-4 w-4 text-primary border-gray-300 rounded mr-2"
                  checked={isAddingUser}
                  onChange={() => setIsAddingUser(!isAddingUser)}
                />
                <span>Verify for adding new user</span>
              </label>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          
          {(license.licenseType === 'user_count_based' || 
            license.licenseType === 'mixed' || 
            (typeof license.licenseType === 'string' && license.licenseType.includes('user_count_based'))) && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleResetUsers}
              disabled={isVerifying}
              className="mr-2"
            >
              Reset Users
            </Button>
          )}
          
          <Button onClick={handleVerify} disabled={isVerifying}>
            {isVerifying ? "Verifying..." : "Verify License"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
