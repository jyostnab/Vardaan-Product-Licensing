
import { useEffect, useState } from "react";
import { getAllLicensesWithCustomers, mockLicenses } from "@/data/mockLicenses";
import { License } from "@/types/license";
import { LicenseCard } from "./LicenseCard";
import { LicenseVerificationModal } from "./LicenseVerificationModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, RefreshCw } from "lucide-react";

export function LicenseDashboard() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [filteredLicenses, setFilteredLicenses] = useState<License[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data from a backend
    const loadLicenses = async () => {
      setIsLoading(true);
      try {
        // Wait a bit to simulate network request
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Get all licenses with customer data
        const loadedLicenses = getAllLicensesWithCustomers();
        setLicenses(loadedLicenses);
        setFilteredLicenses(loadedLicenses);
      } catch (error) {
        console.error("Error loading licenses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLicenses();
  }, []);

  useEffect(() => {
    let filtered = licenses;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(license => 
        license.id.toLowerCase().includes(query) ||
        license.customer?.name.toLowerCase().includes(query) ||
        license.customer?.email.toLowerCase().includes(query)
      );
    }
    
    // Apply tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter(license => license.licenseType === activeTab);
    }
    
    setFilteredLicenses(filtered);
  }, [licenses, activeTab, searchQuery]);

  const handleLicenseClick = (license: License) => {
    setSelectedLicense(license);
    setModalOpen(true);
  };

  const handleVerifyLicense = (license: License, addingUser: boolean) => {
    console.log("License verified:", license, "Adding user:", addingUser);
    // In a real app, you'd update the license status here
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const loadedLicenses = getAllLicensesWithCustomers();
    setLicenses(loadedLicenses);
    setFilteredLicenses(loadedLicenses);
    setIsLoading(false);
  };

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">License Guardian Shield</h1>
          <p className="text-muted-foreground mt-1">
            Manage and verify your software licenses
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create License
          </Button>
        </div>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all" className="relative">
              All
              <Badge variant="outline" className="ml-2 bg-background">
                {licenses.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="date_based">Date Based</TabsTrigger>
            <TabsTrigger value="user_count_based">User Count</TabsTrigger>
            <TabsTrigger value="mac_based">MAC Based</TabsTrigger>
            <TabsTrigger value="country_based">Country Based</TabsTrigger>
            <TabsTrigger value="mixed">Mixed</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search"
              placeholder="Search licenses..."
              className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-card border rounded-lg p-6 h-[200px] animate-pulse">
                  <div className="h-5 bg-muted rounded w-2/3 mb-4"></div>
                  <div className="h-4 bg-muted rounded w-1/3 mb-6"></div>
                  <div className="h-4 bg-muted rounded w-full mb-3"></div>
                  <div className="h-4 bg-muted rounded w-4/5"></div>
                </div>
              ))}
            </div>
          ) : filteredLicenses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLicenses.map((license) => (
                <LicenseCard 
                  key={license.id} 
                  license={license} 
                  onClick={() => handleLicenseClick(license)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg">No licenses found</h3>
              <p className="text-muted-foreground max-w-sm mt-1">
                {searchQuery 
                  ? `No licenses match "${searchQuery}". Try a different search term.` 
                  : "No licenses found for the selected filter."}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <LicenseVerificationModal
        license={selectedLicense}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onVerify={handleVerifyLicense}
      />
    </div>
  );
}
