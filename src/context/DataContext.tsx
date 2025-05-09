
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Customer, License, Product, ProductVersion } from "@/types/license";
import { toast } from "@/hooks/use-toast";
import { 
  fetchProducts, createProduct,
  fetchProductVersions, createProductVersion,
  fetchCustomers, createCustomer,
  fetchLicenses, createLicense
} from "@/services/databaseService";

type DataContextType = {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  productVersions: ProductVersion[];
  setProductVersions: React.Dispatch<React.SetStateAction<ProductVersion[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  licenses: License[];
  setLicenses: React.Dispatch<React.SetStateAction<License[]>>;
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt" | "versions">) => Promise<Product>;
  addProductVersion: (version: Omit<ProductVersion, "id" | "createdAt" | "updatedAt">) => Promise<ProductVersion>;
  addCustomer: (customer: Omit<Customer, "id" | "createdAt" | "updatedAt">) => Promise<Customer>;
  addLicense: (license: Omit<License, "id" | "createdAt" | "updatedAt">) => Promise<License>;
  isLoading: boolean;
  refreshData: () => Promise<void>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [productVersions, setProductVersions] = useState<ProductVersion[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load data from Supabase when the component mounts
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load all data in parallel
      const [productsData, versionsData, customersData, licensesData] = await Promise.all([
        fetchProducts(),
        fetchProductVersions(),
        fetchCustomers(),
        fetchLicenses()
      ]);

      // Link versions to products
      const productsWithVersions = productsData.map(product => {
        const productVersionsList = versionsData.filter(v => v.productId === product.id);
        return {
          ...product,
          versions: productVersionsList
        };
      });

      setProducts(productsWithVersions);
      setProductVersions(versionsData);
      setCustomers(customersData);
      setLicenses(licensesData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error loading data",
        description: "Failed to load data from the database. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    await loadData();
    toast({
      title: "Data refreshed",
      description: "The latest data has been loaded from the database."
    });
  };

  const addProduct = async (product: Omit<Product, "id" | "createdAt" | "updatedAt" | "versions">) => {
    try {
      const newProduct = await createProduct(product);
      setProducts(prev => [...prev, { ...newProduct, versions: [] }]);
      return newProduct;
    } catch (error) {
      toast({
        title: "Error adding product",
        description: "Failed to add the product to the database.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const addProductVersion = async (version: Omit<ProductVersion, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newVersion = await createProductVersion(version);
      
      setProductVersions(prev => [...prev, newVersion]);
      
      // Update product with version reference
      setProducts(prevProducts => {
        return prevProducts.map(product => {
          if (product.id === version.productId) {
            return { 
              ...product, 
              versions: [...(product.versions || []), newVersion] 
            };
          }
          return product;
        });
      });
      
      return newVersion;
    } catch (error) {
      toast({
        title: "Error adding product version",
        description: "Failed to add the product version to the database.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const addCustomer = async (customer: Omit<Customer, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newCustomer = await createCustomer(customer);
      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer;
    } catch (error) {
      toast({
        title: "Error adding customer",
        description: "Failed to add the customer to the database.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const addLicense = async (license: Omit<License, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newLicense = await createLicense(license);
      setLicenses(prev => [...prev, newLicense]);
      return newLicense;
    } catch (error) {
      toast({
        title: "Error adding license",
        description: "Failed to add the license to the database.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return (
    <DataContext.Provider
      value={{
        products,
        setProducts,
        productVersions,
        setProductVersions,
        customers,
        setCustomers,
        licenses,
        setLicenses,
        addProduct,
        addProductVersion,
        addCustomer,
        addLicense,
        isLoading,
        refreshData
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
