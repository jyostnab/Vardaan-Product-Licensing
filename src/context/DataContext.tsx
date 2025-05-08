
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Customer, License, Product, ProductVersion } from "@/types/license";

type DataContextType = {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  productVersions: ProductVersion[];
  setProductVersions: React.Dispatch<React.SetStateAction<ProductVersion[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  licenses: License[];
  setLicenses: React.Dispatch<React.SetStateAction<License[]>>;
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt" | "versions">) => Product;
  addProductVersion: (version: Omit<ProductVersion, "id" | "createdAt" | "updatedAt">) => ProductVersion;
  addCustomer: (customer: Omit<Customer, "id" | "createdAt" | "updatedAt">) => Customer;
  addLicense: (license: Omit<License, "id" | "createdAt" | "updatedAt">) => License;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [productVersions, setProductVersions] = useState<ProductVersion[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);

  const generateId = () => {
    return Math.random().toString(36).substring(2, 9);
  };

  const addProduct = (product: Omit<Product, "id" | "createdAt" | "updatedAt" | "versions">) => {
    const now = new Date();
    const newProduct: Product = {
      id: `p${generateId()}`,
      ...product,
      versions: [],
      createdAt: now,
      updatedAt: now
    };
    setProducts((prev) => [...prev, newProduct]);
    return newProduct;
  };

  const addProductVersion = (version: Omit<ProductVersion, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date();
    const newVersion: ProductVersion = {
      id: `v${generateId()}`,
      ...version,
      createdAt: now,
      updatedAt: now
    };

    setProductVersions((prev) => [...prev, newVersion]);

    // Update product with version reference
    setProducts((prevProducts) => {
      return prevProducts.map((product) => {
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
  };

  const addCustomer = (customer: Omit<Customer, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date();
    const newCustomer: Customer = {
      id: `c${generateId()}`,
      ...customer,
      createdAt: now,
      updatedAt: now
    };
    setCustomers((prev) => [...prev, newCustomer]);
    return newCustomer;
  };

  const addLicense = (license: Omit<License, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date();
    const newLicense: License = {
      id: `l${generateId()}`,
      ...license,
      createdAt: now,
      updatedAt: now
    };
    setLicenses((prev) => [...prev, newLicense]);
    return newLicense;
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
        addLicense
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
