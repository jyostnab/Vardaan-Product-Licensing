import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, Shield, Check, X, AlertTriangle, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/context/DataContext";
import { Customer, License, Product, ProductVersion, LicenseVerificationResult } from "@/types/license";

const LicenseVerificationTab: React.FC = () => {
  const { products, productVersions, customers, licenses } = useData();
  
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  
  const [availableVersions, setAvailableVersions] = useState<ProductVersion[]>([]);
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<LicenseVerificationResult | null>(null);
  const [activeTab, setActiveTab] = useState("verify");
  const [licenseDetails, setLicenseDetails] = useState<License | null>(null);

  // Update available versions when product selection changes
  useEffect(() => {
    if (selectedProductId) {
      const filteredVersions = productVersions.filter(v => v.productId === selectedProductId);
      setAvailableVersions(filteredVersions);
      setSelectedVersionId(""); // Reset version when product changes
    } else {
      setAvailableVersions([]);
      setSelectedVersionId("");
    }
  }, [selectedProductId, productVersions]);

  const handleVerify = async () => {
    if (!selectedProductId || !selectedVersionId || !selectedCustomerId) {
      toast({
        title: "Error",
        description: "Please select product, version, and customer",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    try {
      // Find if a license exists with this combination
      const matchingLicense = licenses.find(l => 
        l.productId === selectedProductId && 
        l.productVersionId === selectedVersionId && 
        l.customerId === selectedCustomerId
      );

      if (!matchingLicense) {
        // Instead of throwing an error, set a custom verification result
        setVerificationResult({
          isValid: false,
          status: 'expired',
          errorMessage: "No license found for the selected combination",
          licenseNotFound: true
        });
        
        // Still clear any previous license details
        setLicenseDetails(null);
        
        setIsVerifying(false);
        return;
      }

      setLicenseDetails(matchingLicense);
      
      // Call the API to verify the license
      const response = await fetch("http://localhost:3002/api/licenses/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          licenseId: matchingLicense.id,
          addUser: false // Not adding a user during verification
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const result = await response.json();
      setVerificationResult(result);
      
      toast({
        title: result.isValid ? "Success" : "Verification Failed",
        description: result.warningMessage || result.errorMessage || "License verification complete",
        variant: result.isValid ? "default" : "destructive"
      });
      
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify license. Please try again.",
        variant: "destructive"
      });
      setVerificationResult(null);
    } finally {
      setIsVerifying(false);
    }
  };

  // Helper to get check icon
  const getStatusIcon = (isValid: boolean) => {
    if (isValid) return <Check className="h-4 w-4 text-green-500" />;
    return <X className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Shield className="w-6 h-6 mr-2 text-primary" />
        <h2 className="text-2xl font-bold">License Verification</h2>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Verify License</CardTitle>
          <CardDescription>
            Select product, version, and customer to verify license status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Product Selection */}
            <div>
              <div className="mb-2 text-sm font-medium">Product</div>
              <Select
                value={selectedProductId}
                onValueChange={setSelectedProductId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Version Selection */}
            <div>
              <div className="mb-2 text-sm font-medium">Version</div>
              <Select
                value={selectedVersionId}
                onValueChange={setSelectedVersionId}
                disabled={!selectedProductId || availableVersions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedProductId 
                      ? "Select a product first" 
                      : availableVersions.length === 0 
                        ? "No versions available" 
                        : "Select Version"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availableVersions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      {version.version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Customer Selection */}
            <div>
              <div className="mb-2 text-sm font-medium">Customer</div>
              <Select
                value={selectedCustomerId}
                onValueChange={setSelectedCustomerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={handleVerify} 
              disabled={isVerifying || !selectedProductId || !selectedVersionId || !selectedCustomerId}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying
                </>
              ) : "Verify License"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="verify">Verification Status</TabsTrigger>
          <TabsTrigger value="details" disabled={!verificationResult?.isValid}>Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="verify">
          <Card>
            <CardHeader>
              <CardTitle>License Status</CardTitle>
            </CardHeader>
            <CardContent>
              {!verificationResult && !isVerifying && (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <Info className="h-12 w-12 mb-2" />
                  <p>Select product, version, and customer above and click "Verify License" to see the status</p>
                </div>
              )}
              
              {isVerifying && (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
                  <p className="text-center">Verifying license...</p>
                </div>
              )}
              
              {verificationResult && !isVerifying && (
                <div>
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-full mr-4 ${verificationResult.isValid ? 'bg-green-100' : verificationResult.licenseNotFound ? 'bg-orange-100' : 'bg-red-100'}`}>
                      {verificationResult.isValid && !verificationResult.warningMessage ? (
                        <Check className="h-6 w-6 text-green-600" />
                      ) : verificationResult.isValid && verificationResult.warningMessage ? (
                        <AlertTriangle className="h-6 w-6 text-yellow-600" />
                      ) : verificationResult.licenseNotFound ? (
                        <Info className="h-6 w-6 text-orange-600" />
                      ) : (
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">
                        {verificationResult.isValid && !verificationResult.warningMessage ? "License is Valid" : 
                         verificationResult.isValid && verificationResult.warningMessage ? "License is Valid with Warnings" :
                         verificationResult.licenseNotFound ? "License Not Found" :
                         "License Verification Failed"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {verificationResult.warningMessage || verificationResult.errorMessage || "License is valid and active"}
                      </p>
                    </div>
                  </div>
                  
                  {verificationResult.licenseNotFound ? (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                      <Info className="h-12 w-12 text-orange-500 mb-3" />
                      <h4 className="text-lg font-medium text-orange-800 mb-2">No License Found</h4>
                      <p className="text-orange-700">
                        There is no license available for the combination of product, version, and customer you selected.
                      </p>
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setVerificationResult(null);
                            setLicenseDetails(null);
                          }}
                        >
                          Try Different Selection
                        </Button>
                      </div>
                    </div>
                  ) : licenseDetails && (
                    <div className="border rounded-lg p-4 mb-4">
                      <h4 className="font-medium mb-2">License Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">License Type:</span>
                          <Badge variant="outline">{licenseDetails.licenseType}</Badge>
                        </div>
                        {licenseDetails.expiryDate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Expires On:</span>
                            <span>{new Date(licenseDetails.expiryDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {verificationResult.expiresIn !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Days Until Expiry:</span>
                            <span>{verificationResult.expiresIn > 0 ? verificationResult.expiresIn : "Expired"}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            {verificationResult && verificationResult.isValid && (
              <CardFooter className="flex justify-end">
                <Button variant="default" onClick={() => setActiveTab("details")}>
                  View Details
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="details">
          {verificationResult && verificationResult.isValid && licenseDetails && (
            <Card>
              <CardHeader>
                <CardTitle>License Details</CardTitle>
                <CardDescription>
                  Detailed information about the license
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">License Information</h3>
                    <div className="grid grid-cols-2 gap-4 border-b pb-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Product</p>
                        <p>{products.find(p => p.id === selectedProductId)?.name || "Unknown"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Version</p>
                        <p>{availableVersions.find(v => v.id === selectedVersionId)?.version || "Unknown"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Customer</p>
                        <p>{customers.find(c => c.id === selectedCustomerId)?.name || "Unknown"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">License Type</p>
                        <p className="capitalize">{licenseDetails.licenseType.replace('_', ' ')}</p>
                      </div>
                      {licenseDetails.licenseKey && (
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground">License Key</p>
                          <p className="font-mono text-xs">{licenseDetails.licenseKey}</p>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-medium mb-2">License Parameters</h3>
                    <div className="space-y-3">
                      {licenseDetails.expiryDate && (
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">Valid Until:</span>
                          <span>{new Date(licenseDetails.expiryDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {licenseDetails.maxUsersAllowed && (
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">Maximum Users:</span>
                          <span>{licenseDetails.maxUsersAllowed}</span>
                        </div>
                      )}
                      {licenseDetails.currentUsers !== undefined && (
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">Current Users:</span>
                          <span>{licenseDetails.currentUsers}</span>
                        </div>
                      )}
                      {licenseDetails.gracePeriodDays && (
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">Grace Period:</span>
                          <span>{licenseDetails.gracePeriodDays} days</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => setActiveTab("verify")}>
                  Back to Verification
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LicenseVerificationTab;