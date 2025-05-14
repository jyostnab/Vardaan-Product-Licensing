import { useState } from "react";
import { License } from "@/types/license";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LicenseCard } from "./LicenseCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, MapPin } from "lucide-react";

interface CustomerLicensesGroup {
  customer: {
    id: string;
    name: string;
    email?: string;
    location?: string;
  };
  licenses: License[];
}

interface CustomerLicenseViewProps {
  customerLicenses: CustomerLicensesGroup[];
  onLicenseClick: (license: License) => void;
  isLoading: boolean;
  searchQuery: string;
}

export function CustomerLicenseView({ 
  customerLicenses, 
  onLicenseClick,
  isLoading,
  searchQuery
}: CustomerLicenseViewProps) {
  const [expandedCustomers, setExpandedCustomers] = useState<string[]>([]);
  
  // Filter by search query if provided
  const filteredCustomers = searchQuery 
    ? customerLicenses.filter(group => 
        group.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.customer.email && group.customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (group.customer.location && group.customer.location.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : customerLicenses;
    
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="p-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-36 mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }
  
  if (filteredCustomers.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-100">
        <User className="h-8 w-8 mx-auto text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No customers found</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          {searchQuery 
            ? `No customers match "${searchQuery}". Try a different search term.` 
            : "No customers with licenses are available."}
        </p>
      </div>
    );
  }
  
  return (
    <Accordion
      type="multiple"
      value={expandedCustomers}
      onValueChange={setExpandedCustomers}
      className="space-y-4"
    >
      {filteredCustomers.map(({ customer, licenses }) => (
        <AccordionItem 
          key={customer.id} 
          value={customer.id}
          className="border rounded-lg shadow-sm overflow-hidden"
        >
          <AccordionTrigger className="px-6 py-4 hover:bg-slate-50">
            <div className="flex flex-col items-start text-left">
              <div className="font-semibold text-lg flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                {customer.name}
                <Badge variant="outline" className="ml-3">
                  {licenses.length} License{licenses.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-1 flex gap-4">
                {customer.email && (
                  <span className="flex items-center">
                    <Mail className="h-3 w-3 mr-1 inline" />
                    {customer.email}
                  </span>
                )}
                {customer.location && (
                  <span className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1 inline" />
                    {customer.location}
                  </span>
                )}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50/50">
              {licenses.map(license => (
                <LicenseCard
                  key={license.id}
                  license={license}
                  onClick={() => onLicenseClick(license)}
                  className="h-full"
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
} 