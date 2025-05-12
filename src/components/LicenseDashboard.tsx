
import { useEffect, useState, useMemo } from "react";
import { License } from "@/types/license";
import { LicenseCard } from "./LicenseCard";
import { LicenseVerificationModal } from "./LicenseVerificationModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, RefreshCw, Filter } from "lucide-react";
import { useData } from "@/context/DataContext";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LicenseDashboard() {
  const { licenses, customers, isLoading, refreshData } = useData();
  const [filteredLicenses, setFilteredLicenses] = useState<License[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "expiring">("newest");

  // Process licenses to include customer data - done with useMemo to prevent infinite loops
  const licensesWithCustomer = useMemo(() => {
    return licenses.map(license => {
      const customer = customers.find(c => c.id === license.customerId) || license.customer;
      return { ...license, customer };
    });
  }, [licenses, customers]);

  // Filter and sort licenses with useMemo to prevent unnecessary recalculations
  useEffect(() => {
    let filtered = [...licensesWithCustomer];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(license => 
        license.id.toLowerCase().includes(query) ||
        license.customer?.name.toLowerCase().includes(query) ||
        license.customer?.email?.toLowerCase().includes(query) ||
        license.customer?.location?.toLowerCase().includes(query)
      );
    }
    
    // Apply tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter(license => license.licenseType === activeTab);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === "expiring") {
        // Handle null/undefined expiry dates
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      }
      return 0;
    });
    
    setFilteredLicenses(filtered);
  }, [licensesWithCustomer, activeTab, searchQuery, sortBy]);

  const handleLicenseClick = (license: License) => {
    setSelectedLicense(license);
    setModalOpen(true);
  };

  const handleVerifyLicense = (license: License, addingUser: boolean) => {
    console.log("License verified:", license, "Adding user:", addingUser);
    // In a real app, you'd update the license status here
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const renderLicenseGrid = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-[200px] w-full" />
          ))}
        </div>
      );
    }
    
    if (filteredLicenses.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLicenses.map((license) => (
            <LicenseCard 
              key={license.id} 
              license={license} 
              onClick={() => handleLicenseClick(license)}
              className="animate-fade-in"
            />
          ))}
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-lg border border-slate-100 shadow-sm">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-lg">No licenses found</h3>
        <p className="text-muted-foreground max-w-sm mt-1">
          {searchQuery 
            ? `No licenses match "${searchQuery}". Try a different search term.` 
            : "No licenses found for the selected filter."}
        </p>
        {licenses.length === 0 && (
          <Button 
            className="mt-4" 
            onClick={() => window.document.getElementById("create-tab")?.click()}
          >
            Create Your First License
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            License Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and verify your software licenses
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isLoading || refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button 
            size="sm" 
            onClick={() => window.document.getElementById("create-tab")?.click()}
            disabled={isLoading}
          >
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
          <TabsList className="rounded-lg shadow-sm">
            <TabsTrigger value="all" className="relative data-[state=active]:shadow-sm">
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
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search"
                placeholder="Search licenses..."
                className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="px-2">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Sort licenses by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setSortBy("newest")}
                  className={sortBy === "newest" ? "bg-primary/10" : ""}
                >
                  Newest first
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortBy("oldest")}
                  className={sortBy === "oldest" ? "bg-primary/10" : ""}
                >
                  Oldest first
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortBy("expiring")}
                  className={sortBy === "expiring" ? "bg-primary/10" : ""}
                >
                  Expiring soon
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0 animate-fade-in">
          {renderLicenseGrid()}
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
