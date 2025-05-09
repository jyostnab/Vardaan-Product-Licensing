
import { License, LicenseVerificationResult } from "@/types/license";
import { useEffect, useState } from "react";
import { LicenseVerificationService } from "@/services/licenseVerificationService";
import { Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LicenseStatusProps {
  license: License;
  addingUser?: boolean;
  showDetails?: boolean;
  className?: string;
}

export function LicenseStatus({ license, addingUser = false, showDetails = true, className }: LicenseStatusProps) {
  const [verificationResult, setVerificationResult] = useState<LicenseVerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const verifyLicense = async () => {
      setIsLoading(true);
      try {
        const result = await LicenseVerificationService.verifyLicense(license, addingUser);
        if (isMounted) {
          setVerificationResult(result);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error verifying license:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifyLicense();
    
    return () => {
      isMounted = false;
    };
  }, [license, addingUser]);

  if (isLoading) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <Shield className="h-5 w-5 text-muted-foreground" />
        <span className="text-muted-foreground text-sm">Verifying license...</span>
      </div>
    );
  }

  if (!verificationResult) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <Shield className="h-5 w-5 text-destructive" />
        <span className="text-destructive text-sm">License verification failed</span>
      </div>
    );
  }

  const statusColors = {
    valid: "text-license-valid",
    warning: "text-license-warning",
    expired: "text-license-expired"
  };

  const StatusIcon = verificationResult.status === "valid" 
    ? CheckCircle2 
    : verificationResult.status === "warning" 
      ? AlertCircle 
      : Shield;

  return (
    <div className={className}>
      <div className="flex items-center space-x-2">
        <StatusIcon className={cn("h-5 w-5", statusColors[verificationResult.status])} />
        <span className={cn("font-medium", statusColors[verificationResult.status])}>
          {verificationResult.status === "valid" && "License Valid"}
          {verificationResult.status === "warning" && "Warning"}
          {verificationResult.status === "expired" && "License Invalid"}
        </span>
      </div>
      
      {showDetails && (
        <div className="mt-1 text-sm">
          {verificationResult.warningMessage && (
            <p className="text-license-warning">{verificationResult.warningMessage}</p>
          )}
          {verificationResult.errorMessage && (
            <p className="text-license-expired">{verificationResult.errorMessage}</p>
          )}
          {verificationResult.status === "valid" && !verificationResult.warningMessage && (
            <p className="text-muted-foreground">
              {verificationResult.expiresIn 
                ? `Valid for ${verificationResult.expiresIn} more days` 
                : "License is valid"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
