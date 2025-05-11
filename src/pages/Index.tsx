
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LicenseDashboard } from "@/components/LicenseDashboard";
import { LicenseLoginDemo } from "@/components/LicenseLoginDemo";
import { ProductsTab } from "@/components/ProductsTab";
import { CreateLicenseForm } from "@/components/CreateLicenseForm";
import { DatabaseSchemaGuide } from "@/components/DatabaseSchemaGuide";
import { DatabaseConnectionCheck } from "@/components/DatabaseConnectionCheck";
import { Shield, Terminal, Package, FileText, Database, LayoutDashboard } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground shadow-lg">
        <div className="container py-5 flex items-center">
          <Shield className="h-10 w-10 mr-3 bg-white p-1.5 rounded-lg shadow-inner" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">License Guardian Shield</h1>
            <p className="text-sm opacity-90">
              Enterprise Software License Management System
            </p>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-7xl">
        <DatabaseConnectionCheck />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 rounded-xl overflow-hidden shadow-sm">
            <TabsTrigger value="dashboard" className="text-base py-3 data-[state=active]:shadow-md">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="products" className="text-base py-3 data-[state=active]:shadow-md">
              <Package className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="create" className="text-base py-3 data-[state=active]:shadow-md" id="create-tab">
              <FileText className="h-4 w-4 mr-2" />
              Create License
            </TabsTrigger>
            <TabsTrigger value="demo" className="text-base py-3 data-[state=active]:shadow-md">
              <Terminal className="h-4 w-4 mr-2" />
              Login Demo
            </TabsTrigger>
            <TabsTrigger value="database" className="text-base py-3 data-[state=active]:shadow-md">
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

      <footer className="bg-slate-900 text-white py-8 mt-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 mr-2" />
                <h3 className="text-lg font-semibold">License Guardian Shield</h3>
              </div>
              <p className="text-sm text-slate-300">
                Secure license management for enterprise software applications. Control, track, and manage software licenses with ease.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• License Key Management</li>
                <li>• User Count Tracking</li>
                <li>• Product Version Control</li>
                <li>• Geographic Restrictions</li>
                <li>• MAC Address Binding</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>support@licenseguardian.com</li>
                <li>+1 (555) 123-4567</li>
                <li>123 Software Plaza, Suite 456</li>
                <li>San Francisco, CA 94105</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>License Guardian Shield &copy; {new Date().getFullYear()} - All rights reserved</p>
            <p className="mt-1">Secure • Reliable • Enterprise-grade</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
