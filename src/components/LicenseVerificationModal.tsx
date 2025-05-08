
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { License } from "@/types/license";
import { LicenseStatus } from "./LicenseStatus";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface LicenseVerificationModalProps {
  license: License | null;
  isOpen: boolean;
  onClose: () => void;
  onVerify: (license: License, addUser: boolean) => void;
}

export function LicenseVerificationModal({ 
  license, 
  isOpen, 
  onClose, 
  onVerify 
}: LicenseVerificationModalProps) {
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!license) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>License Verification</DialogTitle>
          <DialogDescription>
            Verify license for {license.customer?.name || "Unknown Customer"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-muted p-4 rounded-md">
            <h4 className="font-medium mb-2">License Information</h4>
            <div className="grid gap-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">License ID:</span>
                <span>{license.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="capitalize">{license.licenseType.replace('_', ' ')}</span>
              </div>
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
            </div>
          </div>
          
          <div className="p-4 border rounded-md">
            <LicenseStatus 
              license={license} 
              addingUser={isAddingUser}
              showDetails={true}
            />
          </div>
          
          {license.licenseType === 'user_count_based' || license.licenseType === 'mixed' && license.maxUsersAllowed && (
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
          <Button onClick={handleVerify} disabled={isVerifying}>
            {isVerifying ? "Verifying..." : "Verify License"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
