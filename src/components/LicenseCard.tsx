
import { License } from "@/types/license";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Globe, Laptop, Shield } from "lucide-react";
import { format } from "date-fns";
import { LicenseStatus } from "./LicenseStatus";

interface LicenseCardProps {
  license: License;
  onClick?: () => void;
}

export function LicenseCard({ license, onClick }: LicenseCardProps) {
  const licenseTypeMap = {
    date_based: { label: "Date Based", icon: <Calendar className="h-4 w-4 mr-1" /> },
    user_count_based: { label: "User Count", icon: <Users className="h-4 w-4 mr-1" /> },
    mac_based: { label: "MAC Based", icon: <Laptop className="h-4 w-4 mr-1" /> },
    country_based: { label: "Country Based", icon: <Globe className="h-4 w-4 mr-1" /> },
    mixed: { label: "Mixed License", icon: <Shield className="h-4 w-4 mr-1" /> }
  };

  const { label, icon } = licenseTypeMap[license.licenseType];

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            {license.customer?.name || "Unknown Customer"}
          </CardTitle>
          <Badge className="flex items-center">{icon} {label}</Badge>
        </div>
        <CardDescription className="flex items-center">
          <Shield className="h-4 w-4 mr-1" />
          ID: {license.id}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid gap-1">
          {license.expiryDate && (
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Expires: {format(new Date(license.expiryDate), 'PPP')}</span>
            </div>
          )}
          
          {license.maxUsersAllowed !== undefined && (
            <div className="flex items-center text-sm">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{license.currentUsers} / {license.maxUsersAllowed} Users</span>
            </div>
          )}
          
          {license.macAddresses && license.macAddresses.length > 0 && (
            <div className="flex items-center text-sm">
              <Laptop className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{license.macAddresses.length} Device{license.macAddresses.length !== 1 ? 's' : ''}</span>
            </div>
          )}
          
          {license.allowedCountries && license.allowedCountries.length > 0 && (
            <div className="flex items-center text-sm">
              <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{license.allowedCountries.join(', ')}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <LicenseStatus license={license} />
      </CardFooter>
    </Card>
  );
}
