
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
import { Product, ProductVersion } from "@/types/license";

const versionSchema = z.object({
  version: z.string().min(1, "Version number is required"),
  releaseDate: z.string().min(1, "Release date is required"),
  notes: z.string().min(1, "Release notes are required"),
});

export function ProductVersionForm({ 
  product,
  version,
  onSuccess 
}: { 
  product: Product, 
  version?: ProductVersion,
  onSuccess?: () => void 
}) {
  const { addProductVersion, updateProductVersion } = useData();
  const [open, setOpen] = useState(false);
  
  const isEditing = !!version;

  const form = useForm<z.infer<typeof versionSchema>>({
    resolver: zodResolver(versionSchema),
    defaultValues: {
      version: version?.version || "",
      releaseDate: version ? new Date(version.releaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: version?.notes || ""
    }
  });
  
  // Update form values when version changes
  useEffect(() => {
    if (version) {
      form.reset({
        version: version.version,
        releaseDate: new Date(version.releaseDate).toISOString().split('T')[0],
        notes: version.notes || ""
      });
    }
  }, [version, form]);

  async function onSubmit(data: z.infer<typeof versionSchema>) {
    try {
      // Convert string date to Date object
      const releaseDate = new Date(data.releaseDate);
      
      if (isEditing && version) {
        // Update existing version
        await updateProductVersion(version.id, {
          version: data.version,
          releaseDate,
          notes: data.notes
        });
        
        toast({
          title: "Version updated",
          description: `Version ${data.version} has been updated.`
        });
      } else {
        // Create new version
        await addProductVersion({
          productId: product.id,
          version: data.version,
          releaseDate,
          notes: data.notes
        });
        
        toast({
          title: "Version added",
          description: `Version ${data.version} has been added to ${product.name}.`
        });
      }
      
      form.reset({
        version: "",
        releaseDate: new Date().toISOString().split('T')[0],
        notes: ""
      });
      
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving version:", error);
      toast({
        title: `Error ${isEditing ? 'updating' : 'adding'} version`,
        description: `Failed to ${isEditing ? 'update' : 'add'} the version. Please try again.`,
        variant: "destructive"
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Version
          </Button>
        ) : (
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Version
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing 
              ? `Edit Version ${version?.version}`
              : `Add Version for ${product.name}`
            }
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the version details."
              : "Enter the version details for this product."
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Version Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="1.0.0" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="releaseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Release Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Release Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Initial release with core functionality"
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
              <Button type="submit">{isEditing ? 'Update' : 'Add'} Version</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
