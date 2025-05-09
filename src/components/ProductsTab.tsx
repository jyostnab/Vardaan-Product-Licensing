
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Tag, Calendar, Info, Edit, Trash2 } from "lucide-react";
import { ProductForm } from "./ProductForm";
import { ProductVersionForm } from "./ProductVersionForm";
import { useData } from "@/context/DataContext";
import { Product, ProductVersion } from "@/types/license";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProductsTab() {
  const { products, removeProduct, removeProductVersion } = useData();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const selectedProduct = products.find(p => p.id === selectedProductId) || null;
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: 'product' | 'version', id: string} | null>(null);
  
  // Handle product deletion
  const confirmDeleteProduct = (id: string) => {
    setItemToDelete({type: 'product', id});
    setDeleteDialogOpen(true);
  };
  
  // Handle version deletion
  const confirmDeleteVersion = (id: string) => {
    setItemToDelete({type: 'version', id});
    setDeleteDialogOpen(true);
  };
  
  // Handle actual deletion
  const handleDelete = async () => {
    try {
      if (!itemToDelete) return;
      
      if (itemToDelete.type === 'product') {
        await removeProduct(itemToDelete.id);
        if (selectedProductId === itemToDelete.id) {
          setSelectedProductId(null);
        }
      } else {
        await removeProductVersion(itemToDelete.id);
      }
      
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Deletion failed",
        description: "There was a problem deleting the item. Please try again.",
        variant: "destructive",
      });
    }
  };

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
                <CardHeader className="py-4 flex flex-row justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      {product.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {product.description}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        // Open edit form for product (re-use the same form with the product data)
                      }}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDeleteProduct(product.id);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                              <div className="flex items-center">
                                <div className="flex items-center text-sm text-muted-foreground mr-2">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {new Date(version.releaseDate).toLocaleDateString()}
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <span className="sr-only">Open menu</span>
                                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-red-600"
                                      onClick={() => confirmDeleteVersion(version.id)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
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
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {itemToDelete?.type} and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
