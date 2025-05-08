
import { useState } from "react";
import { 
  getAllProducts, 
  addProduct, 
  addProductVersion 
} from "@/data/mockProducts";
import { Product, ProductVersion } from "@/types/license";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Package, Tag, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Form schema for adding a new product
const productSchema = z.object({
  name: z.string().min(1, { message: "Product name is required" }),
  description: z.string().min(1, { message: "Product description is required" })
});

// Form schema for adding a new version
const versionSchema = z.object({
  productId: z.string().min(1, { message: "Product ID is required" }),
  version: z.string().min(1, { message: "Version number is required" }),
  notes: z.string().optional(),
  releaseDate: z.string().min(1, { message: "Release date is required" })
});

export function ProductsTab() {
  const [products, setProducts] = useState<Product[]>(getAllProducts());
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  // Forms
  const productForm = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: ""
    }
  });

  const versionForm = useForm<z.infer<typeof versionSchema>>({
    resolver: zodResolver(versionSchema),
    defaultValues: {
      productId: "",
      version: "",
      notes: "",
      releaseDate: new Date().toISOString().split('T')[0]
    }
  });

  // Handle product creation
  const handleCreateProduct = (data: z.infer<typeof productSchema>) => {
    const newProduct = addProduct({
      name: data.name,
      description: data.description
    });
    
    setProducts([...products, newProduct]);
    setIsProductDialogOpen(false);
    productForm.reset();
    
    toast({
      title: "Product created",
      description: `${data.name} has been successfully added.`
    });
  };

  // Handle version creation
  const handleCreateVersion = (data: z.infer<typeof versionSchema>) => {
    const newVersion = addProductVersion({
      productId: data.productId,
      version: data.version,
      notes: data.notes || "",
      releaseDate: new Date(data.releaseDate)
    });
    
    // Update the products state to reflect the new version
    setProducts(prevProducts => 
      prevProducts.map(p => 
        p.id === data.productId 
          ? { ...p, versions: [...p.versions, newVersion], updatedAt: new Date() } 
          : p
      )
    );
    
    setIsVersionDialogOpen(false);
    versionForm.reset();
    
    toast({
      title: "Version added",
      description: `Version ${data.version} has been added successfully.`
    });
  };

  // Open version dialog for a specific product
  const openAddVersionDialog = (product: Product) => {
    setSelectedProduct(product);
    versionForm.setValue("productId", product.id);
    setIsVersionDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Products Management</h2>
          <p className="text-muted-foreground">Manage your software products and versions</p>
        </div>
        <Button onClick={() => setIsProductDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg">No products found</h3>
          <p className="text-muted-foreground max-w-sm mt-1">
            Create your first product to start managing licenses.
          </p>
          <Button className="mt-4" onClick={() => setIsProductDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription className="mt-1">{product.description}</CardDescription>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => openAddVersionDialog(product)}>
                    <Tag className="h-4 w-4 mr-2" />
                    Add Version
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span>{product.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span>{product.updatedAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Versions</span>
                    <Badge variant="outline">{product.versions.length}</Badge>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Available Versions</h4>
                  {product.versions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Version</TableHead>
                          <TableHead>Release Date</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.versions.map((version) => (
                          <TableRow key={version.id}>
                            <TableCell className="font-medium">{version.version}</TableCell>
                            <TableCell>{version.releaseDate.toLocaleDateString()}</TableCell>
                            <TableCell className="max-w-xs truncate">{version.notes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No versions available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog for creating a new product */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Enter the details for your new software product.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...productForm}>
            <form onSubmit={productForm.handleSubmit(handleCreateProduct)} className="space-y-4">
              <FormField
                control={productForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={productForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter product description"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsProductDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Product</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog for creating a new version */}
      <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Version</DialogTitle>
            <DialogDescription>
              {selectedProduct && `Add a new version for ${selectedProduct.name}.`}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...versionForm}>
            <form onSubmit={versionForm.handleSubmit(handleCreateVersion)} className="space-y-4">
              <FormField
                control={versionForm.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1.0.0" {...field} />
                    </FormControl>
                    <FormDescription>
                      Use semantic versioning (e.g., 1.0.0)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={versionForm.control}
                name="releaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Release Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={versionForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Release Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter version release notes"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsVersionDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Version</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
