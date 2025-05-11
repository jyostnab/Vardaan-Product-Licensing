import React from "react";
import { License } from "@/types/license";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Globe, PcCase } from "lucide-react";
import { LicenseStatus } from "./LicenseStatus";
import { cn } from "@/lib/utils";

export interface LicenseCardProps {
  license: License;
  onClick?: () => void;
  className?: string; // Added className prop
}

export const LicenseCard: React.FC<LicenseCardProps> = ({ 
  license, 
  onClick,
  className
}) => {
  const getLicenseTypeBadge = (licenseType: string) => {
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
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card
      className={cn("bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer", className)}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold line-clamp-1">{license.customer?.name || 'N/A'}</h3>
        <p className="text-muted-foreground text-sm mt-1 line-clamp-1">
          {license.customer?.email || license.customer?.location || 'No Contact Info'}
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
          {getLicenseTypeBadge(license.licenseType)}
          <LicenseStatus license={license} />
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 border-t">
        <span className="text-sm text-muted-foreground">License ID: {license.id}</span>
        {license.expiryDate && (
          <span className="text-sm text-muted-foreground">
            Expires: {new Date(license.expiryDate).toLocaleDateString()}
          </span>
        )}
      </CardFooter>
    </Card>
  );
};
