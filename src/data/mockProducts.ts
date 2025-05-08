
import { Product, ProductVersion } from "@/types/license";

// Mock product versions
export const mockProductVersions: ProductVersion[] = [
  {
    id: "v1",
    productId: "p1",
    version: "1.0.0",
    releaseDate: new Date("2023-01-15"),
    notes: "Initial release",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15")
  },
  {
    id: "v2",
    productId: "p1",
    version: "1.1.0",
    releaseDate: new Date("2023-03-20"),
    notes: "Added user management features",
    createdAt: new Date("2023-03-20"),
    updatedAt: new Date("2023-03-20")
  },
  {
    id: "v3",
    productId: "p2",
    version: "2.0.0",
    releaseDate: new Date("2023-02-10"),
    notes: "Initial release",
    createdAt: new Date("2023-02-10"),
    updatedAt: new Date("2023-02-10")
  },
  {
    id: "v4",
    productId: "p2",
    version: "2.1.0",
    releaseDate: new Date("2023-05-05"),
    notes: "Performance improvements",
    createdAt: new Date("2023-05-05"),
    updatedAt: new Date("2023-05-05")
  }
];

// Mock products
export const mockProducts: Product[] = [
  {
    id: "p1",
    name: "Enterprise CRM",
    description: "Customer relationship management system for large enterprises",
    versions: mockProductVersions.filter(v => v.productId === "p1"),
    createdAt: new Date("2023-01-10"),
    updatedAt: new Date("2023-03-20")
  },
  {
    id: "p2",
    name: "SecureAuth Pro",
    description: "Advanced authentication and security system",
    versions: mockProductVersions.filter(v => v.productId === "p2"),
    createdAt: new Date("2023-02-05"),
    updatedAt: new Date("2023-05-05")
  }
];

// Helper functions
export function getAllProducts(): Product[] {
  return mockProducts;
}

export function getProductById(productId: string): Product | undefined {
  return mockProducts.find(p => p.id === productId);
}

export function getProductVersionById(versionId: string): ProductVersion | undefined {
  return mockProductVersions.find(v => v.id === versionId);
}

export function getVersionsByProductId(productId: string): ProductVersion[] {
  return mockProductVersions.filter(v => v.productId === productId);
}

// Function to add a new product
export function addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'versions'>): Product {
  const newProduct: Product = {
    id: `p${mockProducts.length + 1}`,
    ...product,
    versions: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  mockProducts.push(newProduct);
  return newProduct;
}

// Function to add a new product version
export function addProductVersion(version: Omit<ProductVersion, 'id' | 'createdAt' | 'updatedAt'>): ProductVersion {
  const newVersion: ProductVersion = {
    id: `v${mockProductVersions.length + 1}`,
    ...version,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  mockProductVersions.push(newVersion);
  
  // Update the product's versions array
  const product = mockProducts.find(p => p.id === version.productId);
  if (product) {
    product.versions.push(newVersion);
    product.updatedAt = new Date();
  }
  
  return newVersion;
}
