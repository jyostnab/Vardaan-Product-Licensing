import { useState } from "react";
import { License } from "@/types/license";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LicenseCard } from "./LicenseCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Tag, CheckSquare } from "lucide-react";

interface ProductVersion {
  id: string;
  version: string;
  licenses: License[];
}

interface ProductLicensesGroup {
  product: {
    id: string;
    name: string;
  };
  versions: ProductVersion[];
  licenses: License[];
}

interface ProductLicenseViewProps {
  productLicenses: ProductLicensesGroup[];
  onLicenseClick: (license: License) => void;
  isLoading: boolean;
  searchQuery: string;
}

export function ProductLicenseView({ 
  productLicenses, 
  onLicenseClick,
  isLoading,
  searchQuery
}: ProductLicenseViewProps) {
  const [expandedProducts, setExpandedProducts] = useState<string[]>([]);
  const [expandedVersions, setExpandedVersions] = useState<string[]>([]);
  
  // Filter by search query if provided
  const filteredProducts = searchQuery 
    ? productLicenses.filter(group => 
        group.product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : productLicenses;
    
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
  
  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-100">
        <Package className="h-8 w-8 mx-auto text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No products found</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          {searchQuery 
            ? `No products match "${searchQuery}". Try a different search term.` 
            : "No products with licenses are available."}
        </p>
      </div>
    );
  }
  
  const toggleExpandedVersion = (versionId: string) => {
    setExpandedVersions(prev => 
      prev.includes(versionId) ? 
        prev.filter(id => id !== versionId) : 
        [...prev, versionId]
    );
  };
  
  return (
    <Accordion
      type="multiple"
      value={expandedProducts}
      onValueChange={setExpandedProducts}
      className="space-y-4"
    >
      {filteredProducts.map(({ product, versions, licenses }) => (
        <AccordionItem 
          key={product.id} 
          value={product.id}
          className="border rounded-lg shadow-sm overflow-hidden"
        >
          <AccordionTrigger className="px-6 py-4 hover:bg-slate-50">
            <div className="flex flex-col items-start text-left">
              <div className="font-semibold text-lg flex items-center">
                <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                {product.name}
                <Badge variant="outline" className="ml-3">
                  {licenses.length} License{licenses.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-1 flex gap-4">
                <span className="flex items-center">
                  <Tag className="h-3 w-3 mr-1 inline" />
                  {versions.length} Version{versions.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </AccordionTrigger>
          
          <AccordionContent>
            {versions.length > 0 ? (
              <div className="px-4 py-2 space-y-4">
                {versions.map(version => (
                  <div key={version.id} className="border rounded-md overflow-hidden">
                    <div 
                      className="flex justify-between items-center p-3 bg-slate-50 cursor-pointer"
                      onClick={() => toggleExpandedVersion(version.id)}
                    >
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Version {version.version}</span>
                        <Badge variant="outline" className="ml-2">
                          {version.licenses.length} License{version.licenses.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <CheckSquare className={`h-4 w-4 transition-transform ${
                        expandedVersions.includes(version.id) ? 'rotate-180' : ''
                      }`} />
                    </div>
                    
                    {expandedVersions.includes(version.id) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white">
                        {version.licenses.map(license => (
                          <LicenseCard
                            key={license.id}
                            license={license}
                            onClick={() => onLicenseClick(license)}
                            className="h-full"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-muted-foreground">
                No version information available for this product
              </div>
            )}
            
            {/* Show non-versioned licenses if any */}
            {licenses.some(license => !license.productVersionId) && (
              <div className="px-4 pb-4 mt-4">
                <div className="text-sm font-medium mb-2 text-muted-foreground">Licenses without version information:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {licenses
                    .filter(license => !license.productVersionId)
                    .map(license => (
                      <LicenseCard
                        key={license.id}
                        license={license}
                        onClick={() => onLicenseClick(license)}
                        className="h-full"
                      />
                    ))
                  }
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
} 