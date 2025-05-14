import React from "react";
import { License } from "@/types/license";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Globe, PcCase } from "lucide-react";
import { LicenseStatus } from "./LicenseStatus";
import { cn } from "@/lib/utils";
import { useData } from "@/context/DataContext"; // Import useData hook

export interface LicenseCardProps {
  license: License;
  onClick?: () => void;
  className?: string;
}

export function LicenseCard({ license, onClick, className }: LicenseCardProps) {
  // Get products and versions from the data context
  const { products, productVersions } = useData();
  
  // Format dates if they exist
  const expiryDate = license.expiryDate ? new Date(license.expiryDate).toLocaleDateString() : "No expiration";
  
  // Get product and version information
  const product = products.find(p => p.id === license.productId);
  const version = productVersions.find(v => v.id === license.productVersionId);
  
  // Display product and version info
  const productInfo = product ? product.name : "Unknown Product";
  const versionInfo = version ? version.version : "";
  const productDisplay = versionInfo ? `${productInfo} ${versionInfo}` : productInfo;
  
  const getLicenseTypeBadge = (licenseType: string) => {
    // Handle comma-separated license types
    if (typeof licenseType === 'string' && licenseType.includes(',')) {
      const types = licenseType.split(',');
      
      // Check for mac_based type first (prioritize this since it's the focus of the fix)
      if (types.includes('mac_based')) {
        return (
          <Badge variant="secondary">
            <PcCase className="mr-2 h-4 w-4" />
            MAC Based
          </Badge>
        );
      }
      // Then check for other types in order of priority
      else if (types.includes('date_based')) {
        return (
          <Badge variant="secondary">
            <Calendar className="mr-2 h-4 w-4" />
            Date Based
          </Badge>
        );
      }
      else if (types.includes('user_count_based')) {
        return (
          <Badge variant="secondary">
            <Users className="mr-2 h-4 w-4" />
            User Count
          </Badge>
        );
      }
      else if (types.includes('country_based')) {
        return (
          <Badge variant="secondary">
            <Globe className="mr-2 h-4 w-4" />
            Country Based
          </Badge>
        );
      }
      // If none of the above match, treat as mixed
      return (
        <Badge variant="secondary">
          <Calendar className="mr-2 h-4 w-4" />
          Mixed
        </Badge>
      );
    }
    
    // For non-comma-separated types, use the original switch
    switch (licenseType) {
      case "date_based":
        return (
          <Badge variant="secondary">
            <Calendar className="mr-2 h-4 w-4" />
            Date Based
          </Badge>
        );
      case "user_count_based":
        return (
          <Badge variant="secondary">
            <Users className="mr-2 h-4 w-4" />
            User Count
          </Badge>
        );
      case "mac_based":
        return (
          <Badge variant="secondary">
            <PcCase className="mr-2 h-4 w-4" />
            MAC Based
          </Badge>
        );
      case "country_based":
        return (
          <Badge variant="secondary">
            <Globe className="mr-2 h-4 w-4" />
            Country Based
          </Badge>
        );
      case "mixed":
        return (
          <Badge variant="secondary">
            <Calendar className="mr-2 h-4 w-4" />
            Mixed
          </Badge>
        );
      default:
        // For any other unknown types, show the actual type instead of just "Unknown"
        return (
          <Badge variant="secondary">
            {licenseType || "Unknown"}
          </Badge>
        );
    }
  };

  return (
    <Card 
      className={cn(
        "transition-all hover:shadow-md cursor-pointer",
        className
      )} 
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="font-medium text-lg">{license.customer?.name || "Unknown Customer"}</div>
        <div className="text-muted-foreground text-sm">
          {license.customer?.email || "No email provided"}
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="mb-3">
          <div className="text-sm font-medium mb-1 text-primary">
            {typeof license.licenseType === 'string' && license.licenseType.includes(',') 
              ? license.licenseType.split(',').map(t => t.replace(/_/g, ' ')).join(', ')
              : (license.licenseType || "Unknown").replace(/_/g, ' ')}
          </div>
        </div>
        
        <LicenseStatus license={license} />
      </CardContent>
      
      <CardFooter className="flex flex-col items-start pt-0">
        {license.customer?.name && (
          <div className="text-xs text-muted-foreground mt-2">
            <span className="font-medium">Customer:</span> {license.customer.name}
          </div>
        )}
        
        {/* Replace License ID with Product and Version */}
        <div className="text-xs text-muted-foreground mt-1">
          <span className="font-medium">Product:</span> {productDisplay}
        </div>
        
        <div className="text-xs text-muted-foreground mt-1">
          <span className="font-medium">Expires:</span> {expiryDate}
        </div>
      </CardFooter>
    </Card>
  );
}
