
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LicenseDashboard } from "@/components/LicenseDashboard";
import { LicenseLoginDemo } from "@/components/LicenseLoginDemo";
import { ProductsTab } from "@/components/ProductsTab";
import { CreateLicenseForm } from "@/components/CreateLicenseForm";
import { DatabaseSchemaGuide } from "@/components/DatabaseSchemaGuide";
import { Shield, Terminal, Package, FileText, Database } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container py-4 flex items-center">
          <Shield className="h-8 w-8 mr-2" />
          <div>
            <h1 className="text-2xl font-bold">License Guardian Shield</h1>
            <p className="text-xs opacity-80">
              Enterprise Software License Management
            </p>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="dashboard" className="text-base py-3">
              <Shield className="h-4 w-4 mr-2" />
              Licenses
            </TabsTrigger>
            <TabsTrigger value="products" className="text-base py-3">
              <Package className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="create" className="text-base py-3">
              <FileText className="h-4 w-4 mr-2" />
              Create License
            </TabsTrigger>
            <TabsTrigger value="demo" className="text-base py-3">
              <Terminal className="h-4 w-4 mr-2" />
              Login Demo
            </TabsTrigger>
            <TabsTrigger value="database" className="text-base py-3">
              <Database className="h-4 w-4 mr-2" />
              Database
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <LicenseDashboard />
          </TabsContent>
          <TabsContent value="products">
            <ProductsTab />
          </TabsContent>
          <TabsContent value="create">
            <CreateLicenseForm />
          </TabsContent>
          <TabsContent value="demo">
            <LicenseLoginDemo />
          </TabsContent>
          <TabsContent value="database">
            <DatabaseSchemaGuide />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-muted py-4 mt-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>License Guardian Shield &copy; {new Date().getFullYear()}</p>
          <p className="text-xs mt-1">Secure license management for enterprise software</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
