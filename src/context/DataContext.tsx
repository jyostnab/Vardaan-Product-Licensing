import React, { createContext, useContext, useState, useEffect } from "react";
import { Customer, License, Product, ProductVersion } from "@/types/license";
import { toast } from "@/hooks/use-toast";
import { 
  fetchProducts, createProduct, updateProduct as updateProductApi, deleteProduct,
  fetchProductVersions, createProductVersion, updateProductVersion as updateProductVersionApi, deleteProductVersion,
  fetchCustomers, createCustomer, updateCustomer as updateCustomerApi, deleteCustomer,
  fetchLicenses, createLicense, updateLicense as updateLicenseApi, deleteLicense
} from "@/services/directDatabaseService";

type DataContextType = {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  productVersions: ProductVersion[];
  setProductVersions: React.Dispatch<React.SetStateAction<ProductVersion[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  licenses: License[];
  setLicenses: React.Dispatch<React.SetStateAction<License[]>>;
  
  // Product operations
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt" | "versions">) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<Product>;
  removeProduct: (id: string) => Promise<void>;
  
  // Version operations
  addProductVersion: (version: Omit<ProductVersion, "id" | "createdAt" | "updatedAt">) => Promise<ProductVersion>;
  updateProductVersion: (id: string, version: Partial<ProductVersion>) => Promise<ProductVersion>;
  removeProductVersion: (id: string) => Promise<void>;
  
  // Customer operations
  addCustomer: (customer: Omit<Customer, "id" | "createdAt" | "updatedAt">) => Promise<Customer>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<Customer>;
  removeCustomer: (id: string) => Promise<void>;
  
  // License operations
  addLicense: (license: Omit<License, "id" | "createdAt" | "updatedAt">) => Promise<License>;
  updateLicense: (id: string, license: Partial<License>) => Promise<License>;
  removeLicense: (id: string) => Promise<void>;
  
  isLoading: boolean;
  refreshData: () => Promise<void>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
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

      // Map backend data model to frontend model if necessary
      const mappedVersions = versionsData.map((v: any) => ({
        id: v.id,
        productId: v.product_id,
        version: v.version,
        releaseDate: new Date(v.release_date),
        notes: v.notes || "",
        createdAt: new Date(v.created_at),
        updatedAt: new Date(v.updated_at)
      }));

      // Link versions to products
      const productsWithVersions = productsData.map((product: any) => {
        const productVersionsList = mappedVersions.filter(v => v.productId === product.id);
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          versions: productVersionsList,
          createdAt: new Date(product.created_at),
          updatedAt: new Date(product.updated_at)
        };
      });

      setProducts(productsWithVersions);
      setProductVersions(mappedVersions);
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

  // Product operations
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

  const updateProduct = async (id: string, product: Partial<Product>) => {
    try {
      const updatedProduct = await updateProductApi(id, product);
      
      setProducts(prev => 
        prev.map(p => p.id === id ? { ...p, ...updatedProduct, versions: p.versions } : p)
      );
      
      return updatedProduct;
    } catch (error) {
      toast({
        title: "Error updating product",
        description: "Failed to update the product in the database.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const removeProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Product deleted",
        description: "The product has been removed successfully."
      });
    } catch (error) {
      toast({
        title: "Error deleting product",
        description: "Failed to delete the product from the database.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Version operations
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

  const updateProductVersion = async (id: string, version: Partial<ProductVersion>) => {
    try {
      const updatedVersion = await updateProductVersionApi(id, version);
      
      setProductVersions(prev => 
        prev.map(v => v.id === id ? { ...v, ...updatedVersion } : v)
      );
      
      // Update the version in the product.versions array as well
      setProducts(prev => {
        return prev.map(product => {
          if (product.versions.some(v => v.id === id)) {
            return {
              ...product,
              versions: product.versions.map(v => 
                v.id === id ? { ...v, ...updatedVersion } : v
              )
            };
          }
          return product;
        });
      });
      
      return updatedVersion;
    } catch (error) {
      toast({
        title: "Error updating product version",
        description: "Failed to update the product version in the database.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const removeProductVersion = async (id: string) => {
    try {
      await deleteProductVersion(id);
      
      const versionToRemove = productVersions.find(v => v.id === id);
      
      setProductVersions(prev => prev.filter(v => v.id !== id));
      
      // Also remove the version from the product.versions array
      if (versionToRemove) {
        setProducts(prev => {
          return prev.map(product => {
            if (product.id === versionToRemove.productId) {
              return {
                ...product,
                versions: product.versions.filter(v => v.id !== id)
              };
            }
            return product;
          });
        });
      }
      
      toast({
        title: "Version deleted",
        description: "The product version has been removed successfully."
      });
    } catch (error) {
      toast({
        title: "Error deleting version",
        description: "Failed to delete the product version from the database.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Customer operations
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

  const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    try {
      const updatedCustomer = await updateCustomerApi(id, customer);
      setCustomers(prev => 
        prev.map(c => c.id === id ? { ...c, ...updatedCustomer } : c)
      );
      return updatedCustomer;
    } catch (error) {
      toast({
        title: "Error updating customer",
        description: "Failed to update the customer in the database.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const removeCustomer = async (id: string) => {
    try {
      await deleteCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Customer deleted",
        description: "The customer has been removed successfully."
      });
    } catch (error) {
      toast({
        title: "Error deleting customer",
        description: "Failed to delete the customer from the database.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // License operations
  const addLicense = async (license: Omit<License, "id" | "createdAt" | "updatedAt">) => {
    try {
      // Calculate expiryDate based on licensing period if not provided
      if (!license.expiryDate && license.licensingPeriod) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + license.licensingPeriod);
        license.expiryDate = expiryDate;
      }
      
      // Calculate licensing period based on expiryDate if not provided
      if (!license.licensingPeriod && license.expiryDate) {
        const today = new Date();
        const diffTime = new Date(license.expiryDate).getTime() - today.getTime();
        license.licensingPeriod = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      
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

  const updateLicense = async (id: string, license: Partial<License>) => {
    try {
      // Update expiryDate or licensingPeriod if one changes
      if (license.licensingPeriod && !license.expiryDate) {
        const currentLicense = licenses.find(l => l.id === id);
        if (currentLicense) {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + license.licensingPeriod);
          license.expiryDate = expiryDate;
        }
      } else if (license.expiryDate && !license.licensingPeriod) {
        const currentLicense = licenses.find(l => l.id === id);
        if (currentLicense) {
          const today = new Date();
          const diffTime = new Date(license.expiryDate).getTime() - today.getTime();
          license.licensingPeriod = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
      }
      
      const updatedLicense = await updateLicenseApi(id, license);
      setLicenses(prev => 
        prev.map(l => l.id === id ? { ...l, ...updatedLicense } : l)
      );
      return updatedLicense;
    } catch (error) {
      toast({
        title: "Error updating license",
        description: "Failed to update the license in the database.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const removeLicense = async (id: string) => {
    try {
      await deleteLicense(id);
      setLicenses(prev => prev.filter(l => l.id !== id));
      toast({
        title: "License deleted",
        description: "The license has been removed successfully."
      });
    } catch (error) {
      toast({
        title: "Error deleting license",
        description: "Failed to delete the license from the database.",
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
        updateProduct,
        removeProduct,
        addProductVersion,
        updateProductVersion,
        removeProductVersion,
        addCustomer,
        updateCustomer,
        removeCustomer,
        addLicense,
        updateLicense,
        removeLicense,
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
