import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, CheckCircle2, XCircle, Loader2, Calendar, Globe, Laptop } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { fetchCustomersByProductAndVersion, fetchProducts } from "@/services/directDatabaseService";

export function AICADEMYSimulator() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    success: boolean;
    message: string;
    details?: string[];
  } | null>(null);
  const [simulatedDate, setSimulatedDate] = useState(new Date().toISOString().split('T')[0]);
  const [simulatedCountry, setSimulatedCountry] = useState("US");
  const [simulatedMacAddress, setSimulatedMacAddress] = useState("00:1A:2B:3C:4D:5E");
  const [availableCustomers, setAvailableCustomers] = useState<Array<{id: string, name: string}>>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  // Fetch customers with valid licenses for AICADEMY 1.0.0
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // Fetch all products and find AICADEMY by name
        const products = await fetchProducts();
        const acadProduct = products.find(p => p.name === "AICADEMY");
        if (!acadProduct) {
          toast({ title: "Error", description: "AICADEMY product not found", variant: "destructive" });
          return;
        }
        // Use the product ID, not the name
        const customers = await fetchCustomersByProductAndVersion(acadProduct.id, "1.0.0");
        setAvailableCustomers(customers);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast({
          title: "Error",
          description: "Failed to fetch customers with valid licenses",
          variant: "destructive"
        });
      }
    };

    fetchCustomers();
  }, []);

  const handleSimulateProduct = async () => {
    if (!selectedCustomerId) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    setSimulationResult(null);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check if customer has a valid license
      const customer = availableCustomers.find(c => c.id === selectedCustomerId);
      if (!customer) {
        setSimulationResult({
          success: false,
          message: "No valid license found for this customer",
          details: [
            "Customer does not have a valid license for AICADEMY 1.0.0",
            "Please contact your administrator to obtain a license"
          ]
        });
        return;
      }

      // If we got here, the license is valid
      setSimulationResult({
        success: true,
        message: "AICADEMY launched successfully with valid license",
        details: [
          `Customer: ${customer.name}`,
          `Product: AICADEMY 1.0.0`,
          `Location: ${simulatedCountry}`,
          `MAC Address: ${simulatedMacAddress}`
        ]
      });
    } catch (error) {
      setSimulationResult({
        success: false,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
        details: ["Please contact your system administrator"]
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="container py-6">
      <Card className="border border-slate-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Shield className="h-5 w-5 text-blue-600" />
            AICADEMY Product Simulator
          </CardTitle>
          <CardDescription>
            Simulate AICADEMY launch from customer perspective with license verification
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Customer Selection */}
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select 
                value={selectedCustomerId} 
                onValueChange={setSelectedCustomerId}
                disabled={availableCustomers.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {availableCustomers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                {availableCustomers.length === 0
                  ? "No customers have valid licenses for AICADEMY 1.0.0"
                  : `${availableCustomers.length} customer(s) have licenses for AICADEMY 1.0.0`
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Simulated Date */}
              <div className="space-y-2">
                <Label htmlFor="simulated-date">Simulated Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="simulated-date"
                    type="date"
                    value={simulatedDate}
                    onChange={(e) => setSimulatedDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Simulated Country */}
              <div className="space-y-2">
                <Label htmlFor="simulated-country">Simulated Country</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Select value={simulatedCountry} onValueChange={setSimulatedCountry}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="SG">Singapore</SelectItem>
                      <SelectItem value="IN">India</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="JP">Japan</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* MAC Address */}
            <div className="space-y-2">
              <Label htmlFor="simulated-mac">Hardware MAC Address</Label>
              <div className="relative">
                <Laptop className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="simulated-mac"
                  value={simulatedMacAddress}
                  onChange={(e) => setSimulatedMacAddress(e.target.value)}
                  placeholder="00:1A:2B:3C:4D:5E"
                  className="pl-10 font-mono"
                />
              </div>
            </div>

            {/* Launch Button */}
            <Button 
              className="w-full"
              onClick={handleSimulateProduct}
              disabled={!selectedCustomerId || isVerifying}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Launching AICADEMY...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Launch AICADEMY with Selected License
                </>
              )}
            </Button>

            {/* Simulation Result */}
            {simulationResult && (
              <div className={`mt-4 p-4 rounded-md ${
                simulationResult.success 
                  ? 'bg-green-50 border border-green-100' 
                  : 'bg-red-50 border border-red-100'
              }`}>
                <div className="flex items-start">
                  {simulationResult.success ? (
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                  ) : (
                    <div className="bg-red-100 p-2 rounded-full mr-3">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg ${
                      simulationResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {simulationResult.success ? 'AICADEMY Started Successfully' : 'AICADEMY Failed to Start'}
                    </h3>
                    <p className={`mt-1 ${
                      simulationResult.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {simulationResult.message}
                    </p>
                    
                    {simulationResult.details && (
                      <div className="mt-3 space-y-1">
                        {simulationResult.details.map((detail, index) => (
                          <p key={index} className="text-sm text-slate-600">{detail}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 