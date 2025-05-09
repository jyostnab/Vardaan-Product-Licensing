
import { License } from "@/types/license";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Package, MapPin } from "lucide-react";
import { LicenseStatus } from "./LicenseStatus";
import { useData } from "@/context/DataContext";

interface LicenseCardProps {
  license: License;
  onClick?: () => void;
}

export function LicenseCard({ license, onClick }: LicenseCardProps) {
  const { products, productVersions } = useData();
  
  // Look up product and version details
  const product = products.find(p => p.id === license.productId);
  const version = productVersions.find(v => v.id === license.productVersionId);
  
  // Format license details for display
  const licensePeriodText = license.licensingPeriod === 1 
    ? '1 day' 
    : `${license.licensingPeriod} days`;
  
  const licenseTypeMap = {
    'date_based': 'Date based',
    'user_count_based': 'User count based',
    'mac_based': 'MAC based',
    'country_based': 'Country based',
    'mixed': 'Mixed'
  };

  const licenseTypeLabel = licenseTypeMap[license.licenseType] || license.licenseType;
  
  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1 mr-2">
            <h3 className="font-medium text-lg truncate">{license.customer?.name}</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <Badge variant="outline" className="mr-2 rounded-sm">
                {licenseTypeLabel}
              </Badge>
              <span>{license.licenseScope}</span>
            </div>
          </div>
          <LicenseStatus license={license} />
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center">
            <Package className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="font-medium mr-1">Product:</span>
            <span className="truncate">{product?.name}{version ? ` (${version.version})` : ''}</span>
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="font-medium mr-1">Period:</span>
            <span>{licensePeriodText}</span>
          </div>
          
          {license.licenseType === 'user_count_based' && (
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium mr-1">Users:</span>
              <span>{license.currentUsers} / {license.maxUsersAllowed}</span>
            </div>
          )}
          
          {license.licenseType === 'country_based' && license.allowedCountries && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium mr-1">Countries:</span>
              <span className="truncate">{license.allowedCountries.join(', ')}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 text-xs text-muted-foreground">
        <div className="w-full flex justify-between items-center">
          <span>ID: {license.id.substring(0, 8)}...</span>
          <span>{license.expiryDate && new Date(license.expiryDate).toLocaleDateString()}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
