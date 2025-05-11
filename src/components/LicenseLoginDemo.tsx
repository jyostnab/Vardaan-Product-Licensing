
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { mockLicenses } from "@/data/mockLicenses";
import { License } from "@/types/license";
import { LicenseVerificationService } from "@/services/licenseVerificationService";
import { Lock, Mail, Calendar, Shield, AlertTriangle, CheckCircle2, XCircle, Loader2, User, Laptop, Building } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LicenseLoginDemo() {
  const [licenseId, setLicenseId] = useState("l1"); // Default to a valid license
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [company, setCompany] = useState("");
  const [productId, setProductId] = useState("p1"); // Default product
  const [deviceInfo, setDeviceInfo] = useState("Windows 10"); // Default device
  const [macAddress, setMacAddress] = useState("00:1A:2B:3C:4D:5E"); // Default MAC
  const [countryCode, setCountryCode] = useState("US"); // Default country
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    license: License;
    success: boolean;
    message: string;
    status: "verifying" | "success" | "warning" | "error";
    canAccessProduct?: boolean;
  } | null>(null);
  const [activeTab, setActiveTab] = useState("login");

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
          `Welcome, ${username || email}! Login successful - Product access granted` : 
          `Welcome, ${username || email}! Login successful - But you don't have access to this product`,
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    
    try {
      // Validate form
      if (!email || !password || !username || !company || !licenseId) {
        throw new Error("All fields are required for registration");
      }
      
      // Simulate registration and license check
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find the license
      const license = mockLicenses.find(l => l.id === licenseId);
      if (!license) {
        throw new Error("Invalid license ID");
      }
      
      // Check if license supports additional users
      if (license.licenseType === 'user_count_based' || license.licenseType === 'mixed') {
        if (license.currentUsers !== undefined && license.maxUsersAllowed !== undefined) {
          if (license.currentUsers >= license.maxUsersAllowed) {
            throw new Error(`License user limit reached (${license.currentUsers}/${license.maxUsersAllowed})`);
          }
        }
      }
      
      // Registration successful, increment user count
      const result = await LicenseVerificationService.verifyLicense(license, true);
      
      if (!result.isValid) {
        throw new Error(result.errorMessage || "License validation failed");
      }
      
      toast({
        title: "Registration Successful",
        description: `Welcome ${username}! Your account has been created with ${company}.`
      });
      
      // Switch to login tab
      setActiveTab("login");
      
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card className="border border-slate-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Shield className="h-5 w-5 text-primary" />
            ProductSphere License Manager
          </CardTitle>
          <CardDescription>
            Enter your license details to access your software
          </CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-5">
                <div className="space-y-2">
                  <Label htmlFor="licenseId" className="text-slate-700">License Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="licenseId"
                      value={licenseId}
                      onChange={(e) => setLicenseId(e.target.value)}
                      placeholder="Enter license key"
                      required
                      className="flex-grow font-mono text-sm"
                    />
                    <Select value={licenseId} onValueChange={setLicenseId}>
                      <SelectTrigger className="w-28">
                        <SelectValue placeholder="Demo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="l1">Valid License</SelectItem>
                        <SelectItem value="l2">Expiring Soon</SelectItem>
                        <SelectItem value="l3">Expired</SelectItem>
                        <SelectItem value="l4">User Count</SelectItem>
                        <SelectItem value="l5">MAC Based</SelectItem>
                        <SelectItem value="l6">Country Based</SelectItem>
                        <SelectItem value="l7">Mixed License</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productId" className="text-slate-700">Product to Access</Label>
                  <Select value={productId} onValueChange={setProductId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="p1">ProductSphere Analytics</SelectItem>
                      <SelectItem value="p2">ProductSphere Designer</SelectItem>
                      <SelectItem value="p3">ProductSphere Enterprise Suite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deviceInfo" className="text-slate-700">Device Info</Label>
                    <Select value={deviceInfo} onValueChange={setDeviceInfo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select device" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Windows 10">Windows 10</SelectItem>
                        <SelectItem value="Windows 11">Windows 11</SelectItem>
                        <SelectItem value="macOS">macOS</SelectItem>
                        <SelectItem value="Linux">Linux</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="countryCode" className="text-slate-700">Country</Label>
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="SG">Singapore</SelectItem>
                        <SelectItem value="IN">India</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="macAddress" className="text-slate-700">MAC Address</Label>
                  <Input
                    id="macAddress"
                    placeholder="00:00:00:00:00:00"
                    value={macAddress}
                    onChange={(e) => setMacAddress(e.target.value)}
                    className="font-mono"
                  />
                  <p className="text-xs text-slate-500">
                    For MAC-based licenses (format: xx:xx:xx:xx:xx:xx)
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
                  <Label htmlFor="addUser" className="text-sm cursor-pointer text-slate-600">
                    Register as new user (increments user count for user-based licenses)
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
                      <div className="flex items-center mt-2 text-sm text-slate-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        Expires: {new Date(verificationResult.license.expiryDate).toLocaleDateString()}
                      </div>
                    )}

                    {verificationResult.license.currentUsers !== undefined && 
                    verificationResult.license.maxUsersAllowed !== undefined && (
                      <div className="flex items-center mt-2 text-sm text-slate-600">
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
              <CardFooter className="bg-slate-50 border-t border-slate-100">
                <Button type="submit" className="w-full" disabled={isVerifying}>
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying License...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Login & Verify License
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4 pt-5">
                <div className="space-y-2">
                  <Label htmlFor="reg-license" className="text-slate-700">License Key</Label>
                  <Input
                    id="reg-license"
                    value={licenseId}
                    onChange={(e) => setLicenseId(e.target.value)}
                    placeholder="Enter your organization's license key"
                    required
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500">
                    Required to register new users (must be user-count based)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-slate-700">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="johndoe"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-slate-700">Company</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Acme Corp"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="text-slate-700">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="email@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-slate-700">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-device" className="text-slate-700">Device Info</Label>
                    <Select value={deviceInfo} onValueChange={setDeviceInfo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select device" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Windows 10">Windows 10</SelectItem>
                        <SelectItem value="Windows 11">Windows 11</SelectItem>
                        <SelectItem value="macOS">macOS</SelectItem>
                        <SelectItem value="Linux">Linux</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-country" className="text-slate-700">Country</Label>
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="SG">Singapore</SelectItem>
                        <SelectItem value="IN">India</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50 border-t border-slate-100">
                <Button type="submit" className="w-full" disabled={isVerifying}>
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <User className="mr-2 h-4 w-4" />
                      Register New User
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
      
      <div className="mt-6 bg-slate-50 rounded-md p-4 border border-slate-200">
        <h3 className="font-medium mb-2 flex items-center text-slate-700">
          <Shield className="h-4 w-4 mr-2 text-primary" />
          License Testing Guide
        </h3>
        <div className="text-sm space-y-1 text-slate-600">
          <p><strong>l1</strong> - Valid date-based license (expires in 60 days)</p>
          <p><strong>l2</strong> - Warning date-based license (expires in 30 days)</p>
          <p><strong>l3</strong> - Expired date-based license</p>
          <p><strong>l4</strong> - User count-based license (8/10 users)</p>
          <p><strong>l5</strong> - MAC-based license (00:1A:2B:3C:4D:5E, 12:34:56:78:9A:BC)</p>
          <p><strong>l6</strong> - Country-based license (SG, MY, ID, TH allowed)</p>
          <p><strong>l7</strong> - Mixed license type</p>
        </div>
      </div>
    </div>
  );
}
