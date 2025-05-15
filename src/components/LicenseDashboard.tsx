import { useEffect, useState, useMemo } from "react";
import { License } from "@/types/license";
import { LicenseCard } from "./LicenseCard";
import { LicenseVerificationModal } from "./LicenseVerificationModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, Plus, RefreshCw, Filter, User, Package, Calendar, Clock, AlertTriangle, 
  CheckCircle2, Globe, PcCase, UserCheck, Layers, Tag
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerLicenseView } from "./CustomerLicenseView";
import { ProductLicenseView } from "./ProductLicenseView";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from "recharts";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LicenseDashboard() {
  const { licenses, customers, products, productVersions, isLoading, refreshData } = useData();
  const [filteredLicenses, setFilteredLicenses] = useState<License[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "expiring">("newest");
  const [viewType, setViewType] = useState<"license" | "customer" | "product">("license");

  // Process licenses to include customer data
  const licensesWithCustomer = useMemo(() => {
    return licenses.map(license => {
      const customer = customers.find(c => c.id === license.customerId) || license.customer;
      return { ...license, customer };
    });
  }, [licenses, customers]);

  // Group licenses by customer for the customer-wise view
  const licensesByCustomer = useMemo(() => {
    const customerMap = new Map();
    
    licensesWithCustomer.forEach(license => {
      if (!license.customer) return;
      
      const customerId = license.customer.id;
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          customer: license.customer,
          licenses: []
        });
      }
      
      customerMap.get(customerId).licenses.push(license);
    });
    
    // Convert map to array and sort by customer name
    return Array.from(customerMap.values())
      .sort((a, b) => a.customer.name.localeCompare(b.customer.name));
  }, [licensesWithCustomer]);
  
  // Group licenses by product for the product-wise view
  const licensesByProduct = useMemo(() => {
    const productMap = new Map();
    
    licensesWithCustomer.forEach(license => {
      if (!license.productId) return;
      
      const productId = license.productId;
      if (!productMap.has(productId)) {
        // Find the product name
        const product = products.find(p => p.id === productId);
        
        productMap.set(productId, {
          product: {
            id: productId,
            name: product ? product.name : "Unknown Product"
          },
          versions: new Map(),
          licenses: []
        });
      }
      
      // Add license to product
      productMap.get(productId).licenses.push(license);
      
      // Group by version if available
      if (license.productVersionId) {
        const versionsMap = productMap.get(productId).versions;
        if (!versionsMap.has(license.productVersionId)) {
          // Find version info
          const version = productVersions.find(v => v.id === license.productVersionId);
          
          versionsMap.set(license.productVersionId, {
            id: license.productVersionId,
            version: version ? version.version : "Unknown Version",
            licenses: []
          });
        }
        
        // Add license to version group
        versionsMap.get(license.productVersionId).licenses.push(license);
      }
    });
    
    // Process the map to create the final structure
    const result = Array.from(productMap.values()).map(item => {
      return {
        ...item,
        versions: Array.from(item.versions.values())
          .sort((a, b) => a.version.localeCompare(b.version))
      };
    });
    
    // Sort products by name
    return result.sort((a, b) => a.product.name.localeCompare(b.product.name));
  }, [licensesWithCustomer, products, productVersions]);

  // Filter and sort licenses
  useEffect(() => {
    let filtered = [...licensesWithCustomer];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(license => 
        license.customer?.name?.toLowerCase().includes(query) ||
        license.customer?.email?.toLowerCase().includes(query) ||
        license.customer?.location?.toLowerCase().includes(query)
      );
    }
    
    // Apply tab filter if not in customer view
    if (activeTab !== "all" && viewType === "license") {
      filtered = filtered.filter(license => {
        if (typeof license.licenseType === 'string' && license.licenseType.includes(',')) {
          const licenseTypes = license.licenseType.split(',');
          return licenseTypes.includes(activeTab);
        }
        return license.licenseType === activeTab;
      });
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
  }, [licensesWithCustomer, activeTab, searchQuery, sortBy, viewType]);

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

  // Calculate license statistics
  const licenseStats = useMemo(() => {
    if (isLoading || !licenses.length) return null;

    // By license type
    const byType = {};
    licenses.forEach(license => {
      const type = license.licenseType;
      byType[type] = (byType[type] || 0) + 1;
    });
    
    // By expiry status
    const today = new Date();
    const expired = licenses.filter(l => l.expiryDate && new Date(l.expiryDate) < today).length;
    const expiringIn30Days = licenses.filter(l => {
      if (!l.expiryDate) return false;
      const expiry = new Date(l.expiryDate);
      const days = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return days >= 0 && days <= 30;
    }).length;
    const valid = licenses.filter(l => !l.expiryDate || new Date(l.expiryDate) >= today).length;
    
    // By customer
    const customerCounts = {};
    licenses.forEach(license => {
      const customer = license.customer?.name || "Unknown";
      customerCounts[customer] = (customerCounts[customer] || 0) + 1;
    });
    
    // By product
    const productCounts = {};
    licenses.forEach(license => {
      const product = products.find(p => p.id === license.productId)?.name || "Unknown";
      productCounts[product] = (productCounts[product] || 0) + 1;
    });
    
    // Create chart data
    const typeData = Object.entries(byType).map(([name, value]) => ({
      name: name.replace('_', ' ').replace('based', '').trim(),
      value
    }));
    
    const statusData = [
      { name: 'Valid', value: valid - expiringIn30Days, color: '#22c55e' },
      { name: 'Expiring Soon', value: expiringIn30Days, color: '#f59e0b' },
      { name: 'Expired', value: expired, color: '#ef4444' }
    ];

    // Top customers data (top 5)
    const topCustomersData = Object.entries(customerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, licenses: count }));
      
    // Top products data (top 5)
    const topProductsData = Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, licenses: count }));
      
    return {
      typeData,
      statusData,
      topCustomersData,
      topProductsData,
      totalLicenses: licenses.length,
      totalActiveUsers: licenses.reduce((sum, license) => sum + (license.currentUsers || 0), 0),
      totalCustomers: Object.keys(customerCounts).length,
      totalProducts: Object.keys(productCounts).length,
      expiringIn30Days,
      expired
    };
  }, [licenses, products, isLoading]);
  
  const renderLicenseStats = () => {
    if (isLoading) {
      return (
        <div className="space-y-6 mb-8">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[100px] w-full" />
        </div>
      );
    }
    
    if (!licenseStats) return null;
    
    // Color scheme for pie charts
    const COLORS = ['#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316'];
    
    return (
      <div className="space-y-6 mb-8 animate-fade-in">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Licenses</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{licenseStats.totalLicenses}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{licenseStats.totalActiveUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{licenseStats.expiringIn30Days}</div>
              <p className="text-xs text-muted-foreground">Within 30 days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{licenseStats.expired}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Licenses by Type</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={licenseStats.typeData} 
                  margin={{ left: 20, right: 20, top: 20, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    label={{ 
                      value: 'License Type', 
                      position: 'insideBottom', 
                      offset: -10 
                    }}
                    tick={{fontSize: 12}}
                  />
                  <YAxis 
                    label={{ 
                      value: 'Number of Licenses', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' }
                    }}
                    tickCount={6}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} licenses`, 'Count']}
                    labelFormatter={(label) => `Type: ${label}`}
                  />
                  <Bar 
                    dataKey="value" 
                    name="Licenses" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                    label={{ 
                      position: 'top', 
                      formatter: (value) => value, 
                      fill: '#374151',
                      fontSize: 12
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Licenses by Status</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={licenseStats.statusData}
                  margin={{ top: 20, right: 30, left: 50, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name"
                    label={{ 
                      value: 'License Status', 
                      position: 'insideBottom', 
                      offset: -10 
                    }}
                  />
                  <YAxis 
                    label={{ 
                      value: 'Number of Licenses', 
                      angle: -90, 
                      position: 'insideLeft' 
                    }}
                    allowDecimals={false}
                  />
                  <Tooltip formatter={(value) => [`${value} licenses`, 'Count']} />
                  <Bar 
                    dataKey="value" 
                    name="Licenses" 
                    label={{ 
                      position: 'top', 
                      formatter: (value) => value, 
                      fill: '#374151',
                      fontSize: 12
                    }}
                  >
                    {licenseStats.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Licenses</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {licenseStats.topCustomersData.map((item) => (
                    <TableRow key={item.name}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{item.licenses}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Licenses</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {licenseStats.topProductsData.map((item) => (
                    <TableRow key={item.name}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{item.licenses}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
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

      {/* View toggle at top - Updated with Product View */}
      <div className="flex mb-4 border rounded-lg overflow-hidden shadow-sm">
        <button 
          className={`flex-1 py-2 px-4 text-sm font-medium ${viewType === 'license' ? 'bg-primary text-white' : 'bg-background hover:bg-muted'}`}
          onClick={() => setViewType('license')}
        >
          License View
        </button>
        <button 
          className={`flex-1 py-2 px-4 text-sm font-medium ${viewType === 'customer' ? 'bg-primary text-white' : 'bg-background hover:bg-muted'}`}
          onClick={() => setViewType('customer')}
        >
          Customer View
        </button>
        <button 
          className={`flex-1 py-2 px-4 text-sm font-medium ${viewType === 'product' ? 'bg-primary text-white' : 'bg-background hover:bg-muted'}`}
          onClick={() => setViewType('product')}
        >
          Product View
        </button>
      </div>
      
      {viewType === 'product' ? (
        // Product view
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Licenses by Product</h2>
            <div className="relative w-full sm:w-auto max-w-sm ml-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search"
                placeholder="Search by product..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          
          <ProductLicenseView 
            productLicenses={licensesByProduct}
            onLicenseClick={handleLicenseClick}
            isLoading={isLoading}
            searchQuery={searchQuery}
          />
        </div>
      ) : viewType === 'customer' ? (
        // Customer view
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Licenses by Customer</h2>
            <div className="relative w-full sm:w-auto max-w-sm ml-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search"
                placeholder="Search by customer..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          
          <CustomerLicenseView 
            customerLicenses={licensesByCustomer}
            onLicenseClick={handleLicenseClick}
            isLoading={isLoading}
            searchQuery={searchQuery}
          />
        </div>
      ) : (
        // License view
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <TabsList className="rounded-lg shadow-sm">
              <TabsTrigger value="all" className="relative data-[state=active]:shadow-sm">
                <Layers className="h-4 w-4 mr-2" />
                All
                <Badge variant="outline" className="ml-2 bg-background">
                  {licenses.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="date_based">
                <Calendar className="h-4 w-4 mr-2" />
                Date Based
                <Badge variant="outline" className="ml-2 bg-background">
                  {licenses.filter(l => 
                    l.licenseType === 'date_based' || 
                    (typeof l.licenseType === 'string' && l.licenseType.includes('date_based'))
                  ).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="user_count_based">
                <UserCheck className="h-4 w-4 mr-2" />
                User Count
                <Badge variant="outline" className="ml-2 bg-background">
                  {licenses.filter(l => 
                    l.licenseType === 'user_count_based' || 
                    (typeof l.licenseType === 'string' && l.licenseType.includes('user_count_based'))
                  ).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="mac_based">
                <PcCase className="h-4 w-4 mr-2" />
                MAC Based
                <Badge variant="outline" className="ml-2 bg-background">
                  {licenses.filter(l => 
                    l.licenseType === 'mac_based' || 
                    (typeof l.licenseType === 'string' && l.licenseType.includes('mac_based'))
                  ).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="country_based">
                <Globe className="h-4 w-4 mr-2" />
                Country Based
                <Badge variant="outline" className="ml-2 bg-background">
                  {licenses.filter(l => 
                    l.licenseType === 'country_based' || 
                    (typeof l.licenseType === 'string' && l.licenseType.includes('country_based'))
                  ).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="mixed">
                <Tag className="h-4 w-4 mr-2" />
                Mixed
                <Badge variant="outline" className="ml-2 bg-background">
                  {licenses.filter(l => l.licenseType === 'mixed').length}
                </Badge>
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search"
                  placeholder="Search by customer..."
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
            {activeTab === "all" && renderLicenseStats()}
            {renderLicenseGrid()}
          </TabsContent>
        </Tabs>
      )}

      <LicenseVerificationModal
        license={selectedLicense}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onVerify={handleVerifyLicense}
        refreshData={refreshData}
      />
    </div>
  );
}
