import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Plus, Edit } from "lucide-react";
import { useData } from "@/context/DataContext";
import { Product } from "@/types/license";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Product description is required"),
});

export function ProductForm({ product, onSuccess }: { product?: Product, onSuccess?: () => void }) {
  const { addProduct, updateProduct, addProductVersion } = useData();
  const [open, setOpen] = useState(false);
  
  const isEditing = !!product;

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || ""
    }
  });
  
  // Update form values when product changes
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description
      });
    }
  }, [product, form]);

  async function onSubmit(data: z.infer<typeof productSchema>) {
    try {
      if (isEditing && product) {
        // Update existing product
        await updateProduct(product.id, {
          name: data.name,
          description: data.description
        });
        
        toast({
          title: "Product updated",
          description: `${data.name} has been updated successfully.`
        });
      } else {
        // Add new product
        const newProduct = await addProduct({
          name: data.name,
          description: data.description
        });
        
        // Add default version 1.0.0
        await addProductVersion({
          productId: newProduct.id,
          version: "1.0.0",
          releaseDate: new Date(),
          notes: "First version with basic features"
        });
        
        toast({
          title: "Product added",
          description: `${data.name} has been added successfully with version 1.0.0.`
        });
      }
      
      form.reset();
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      let errorMessage = "Failed to save product";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Extract nested API error if present
        if (error.message.includes("API request failed")) {
          try {
            const jsonMatch = error.message.match(/\{.*\}/);
            if (jsonMatch) {
              const errorJson = JSON.parse(jsonMatch[0]);
              errorMessage = errorJson.message || errorMessage;
            }
          } catch {
            // Fallback to the original error message
          }
        }
      }
      
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Product
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the product details.' 
              : 'Enter the product details. You can add versions after creating the product.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enterprise Suite" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Comprehensive enterprise solution for business management"
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{isEditing ? 'Update' : 'Add'} Product</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
