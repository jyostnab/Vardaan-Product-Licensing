
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { mockLicenses } from "@/data/mockLicenses";
import { License } from "@/types/license";
import { LicenseVerificationService } from "@/services/licenseVerificationService";
import { Lock, Mail, Calendar, Shield, AlertTriangle, CheckCircle2, XCircle, Loader2, User, Laptop } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function LicenseLoginDemo() {
  const [licenseId, setLicenseId] = useState("l1"); // Default to a valid license
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [productId, setProductId] = useState("p1"); // Default product
  const [deviceInfo, setDeviceInfo] = useState("Windows 10"); // Default device
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    license: License;
    success: boolean;
    message: string;
    status: "verifying" | "success" | "warning" | "error";
    canAccessProduct?: boolean;
  } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerificationResult(null);
    
    try {
      // Find the license
      const license = mockLicenses.find(l => l.id === licenseId);
      if (!license) {
        throw new Error("License not found");
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify the license, with user addition if selected
      const result = await LicenseVerificationService.verifyLicense(license, isAddingUser);
      
      // Update user count if verification was successful and adding user
      let updatedLicense = {...license};
      if (result.isValid && isAddingUser && license.currentUsers !== undefined && license.maxUsersAllowed !== undefined) {
        updatedLicense = {
          ...license,
          currentUsers: Math.min(license.currentUsers + 1, license.maxUsersAllowed)
        };
        // In a real application, this would be persisted to the database
      }
      
      // Check if the user can access the specified product
      const canAccessProduct = result.isValid && 
        (!license.productId || license.productId === productId);
      
      if (!result.isValid) {
        setVerificationResult({
          license: updatedLicense,
          success: false,
          message: result.errorMessage || "License verification failed",
          status: "error",
          canAccessProduct: false
        });
        
        toast({
          title: "License Error",
          description: result.errorMessage || "License verification failed",
          variant: "destructive"
        });
        
        return;
      }
      
      if (result.warningMessage) {
        setVerificationResult({
          license: updatedLicense,
          success: true,
          message: result.warningMessage,
          status: "warning",
          canAccessProduct
        });
        
        toast({
          title: "License Warning",
          description: result.warningMessage,
        });
        
        return;
      }
      
      setVerificationResult({
        license: updatedLicense,
        success: true,
        message: canAccessProduct ? 
          "Login successful - Product access granted" : 
          "Login successful - But you don't have access to this product",
        status: "success",
        canAccessProduct
      });
      
      toast({
        title: "Success",
        description: canAccessProduct ? 
          "License verified successfully with product access" : 
          "License verified but product access denied",
      });
      
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            License Login Demo
          </CardTitle>
          <CardDescription>
            Test the license verification system with different license IDs
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="licenseId">License ID</Label>
              <div className="flex gap-2">
                <Input
                  id="licenseId"
                  value={licenseId}
                  onChange={(e) => setLicenseId(e.target.value)}
                  placeholder="Enter license ID"
                  required
                />
                <div className="w-28">
                  <select 
                    className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md"
                    value={licenseId}
                    onChange={(e) => setLicenseId(e.target.value)}
                  >
                    <option value="l1">Valid</option>
                    <option value="l2">Warning</option>
                    <option value="l3">Expired</option>
                    <option value="l4">User Count</option>
                    <option value="l5">MAC Based</option>
                    <option value="l6">Country</option>
                    <option value="l7">Mixed</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Select a demo license or enter a license ID
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productId">Product to Access</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="p1">Product 1 (Default)</SelectItem>
                  <SelectItem value="p2">Product 2</SelectItem>
                  <SelectItem value="p3">Product 3</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select which product you are trying to access
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deviceInfo">Device Information</Label>
              <div className="relative">
                <Laptop className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="deviceInfo"
                  placeholder="Device Information"
                  value={deviceInfo}
                  onChange={(e) => setDeviceInfo(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Device info used for MAC-based verification
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="addUser"
                checked={isAddingUser}
                onChange={() => setIsAddingUser(!isAddingUser)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="addUser" className="text-sm cursor-pointer">
                Add user to license (for user count-based licenses)
              </Label>
            </div>
            
            {verificationResult && (
              <div className={`p-4 rounded-md ${
                verificationResult.status === "success" ? "bg-green-50 border border-green-100" :
                verificationResult.status === "warning" ? "bg-yellow-50 border border-yellow-100" :
                "bg-red-50 border border-red-100"
              }`}>
                <div className="flex items-center gap-2">
                  {verificationResult.status === "success" && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  {verificationResult.status === "warning" && (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                  {verificationResult.status === "error" && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className={`font-medium ${
                    verificationResult.status === "success" ? "text-green-700" :
                    verificationResult.status === "warning" ? "text-yellow-700" :
                    "text-red-700"
                  }`}>
                    {verificationResult.status === "success" 
                      ? "License Valid" 
                      : verificationResult.status === "warning"
                        ? "License Warning"
                        : "License Invalid"
                    }
                  </span>
                </div>
                <p className={`mt-1 text-sm ${
                  verificationResult.status === "success" ? "text-green-600" :
                  verificationResult.status === "warning" ? "text-yellow-600" :
                  "text-red-600"
                }`}>
                  {verificationResult.message}
                </p>

                {verificationResult.canAccessProduct !== undefined && (
                  <div className={`mt-2 flex items-center gap-1 text-sm ${
                    verificationResult.canAccessProduct ? "text-green-600" : "text-red-600"
                  }`}>
                    {verificationResult.canAccessProduct ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Product access granted</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        <span>Product access denied</span>
                      </>
                    )}
                  </div>
                )}
                
                {verificationResult.license.expiryDate && (
                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    Expires: {new Date(verificationResult.license.expiryDate).toLocaleDateString()}
                  </div>
                )}

                {verificationResult.license.currentUsers !== undefined && 
                verificationResult.license.maxUsersAllowed !== undefined && (
                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-1" />
                    Users: {verificationResult.license.currentUsers} / {verificationResult.license.maxUsersAllowed}
                    {isAddingUser && verificationResult.status !== "error" && (
                      <span className="ml-1 text-green-600">
                        {verificationResult.license.currentUsers < verificationResult.license.maxUsersAllowed ? 
                          "(User added)" : "(Maximum users reached)"}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isVerifying}>
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying License...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Login & Verify License
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <div className="mt-6 bg-muted rounded-md p-4">
        <h3 className="font-medium mb-2 flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          License Testing Guide
        </h3>
        <div className="text-sm space-y-2 text-muted-foreground">
          <p><strong>l1</strong> - Valid date-based license (expires in 60 days)</p>
          <p><strong>l2</strong> - Warning date-based license (expires in 30 days)</p>
          <p><strong>l3</strong> - Expired date-based license</p>
          <p><strong>l4</strong> - User count-based license (8/10 users)</p>
          <p><strong>l5</strong> - MAC-based license</p>
          <p><strong>l6</strong> - Country-based license</p>
          <p><strong>l7</strong> - Mixed license type</p>
        </div>
      </div>
    </div>
  );
}
