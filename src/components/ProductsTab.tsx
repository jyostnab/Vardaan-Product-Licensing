
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Tag, Calendar, Info } from "lucide-react";
import { ProductForm } from "./ProductForm";
import { ProductVersionForm } from "./ProductVersionForm";
import { useData } from "@/context/DataContext";
import { Product } from "@/types/license";

export function ProductsTab() {
  const { products } = useData();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const selectedProduct = products.find(p => p.id === selectedProductId) || null;

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your software products and versions
          </p>
        </div>
        <ProductForm onSuccess={() => setSelectedProductId(null)} />
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-medium mb-3">Products</h2>
            {products.map((product) => (
              <Card 
                key={product.id} 
                className={`cursor-pointer transition-colors ${
                  selectedProductId === product.id ? "border-primary" : ""
                }`}
                onClick={() => setSelectedProductId(product.id)}
              >
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    {product.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="py-3 text-xs text-muted-foreground border-t">
                  {(product.versions?.length || 0) > 0 ? (
                    <Badge variant="outline" className="mr-2">
                      {product.versions?.length} Versions
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 mr-2">
                      No Versions
                    </Badge>
                  )}
                  <span>Created: {new Date(product.createdAt).toLocaleDateString()}</span>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selectedProduct ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{selectedProduct.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {selectedProduct.description}
                      </CardDescription>
                    </div>
                    <ProductVersionForm 
                      product={selectedProduct} 
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-medium text-lg mb-3">Versions</h3>
                  {selectedProduct.versions && selectedProduct.versions.length > 0 ? (
                    <div className="space-y-3">
                      {selectedProduct.versions.map((version) => (
                        <Card key={version.id}>
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                              <div className="flex items-center mb-2 md:mb-0">
                                <Tag className="h-4 w-4 mr-2" />
                                <h4 className="font-medium">Version {version.version}</h4>
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(version.releaseDate).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-sm mt-1 flex items-start">
                              <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                              <p>{version.notes}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 border rounded-lg bg-muted/20">
                      <Tag className="h-10 w-10 mx-auto text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">No versions yet</h3>
                      <p className="text-muted-foreground mt-1 mb-4">
                        Add a version to this product to get started
                      </p>
                      <ProductVersionForm 
                        product={selectedProduct}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="text-center p-10 border rounded-lg">
                <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No product selected</h3>
                <p className="text-muted-foreground mt-1">
                  Select a product from the list or add a new one
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 border rounded-lg">
          <Package className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="mt-4 text-xl font-medium">No products yet</h2>
          <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
            Create your first product to get started with license management
          </p>
          <ProductForm />
        </div>
      )}
    </div>
  );
}
