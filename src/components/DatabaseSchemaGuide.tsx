
import { databaseTablesGuide } from "@/utils/databaseSchema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Database, File } from "lucide-react";

export function DatabaseSchemaGuide() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Database Schema Guide</h2>
          <p className="text-muted-foreground">
            Recommended tables structure for your licensing system
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Database className="h-4 w-4 mr-2" />
          SQL
        </Badge>
      </div>

      <div className="grid gap-6">
        <p>
          Below is the recommended database schema for implementing your licensing system in Supabase.
          Create these tables to manage products, customers, and licenses with all required fields.
        </p>

        <Accordion type="single" collapsible className="w-full">
          {databaseTablesGuide.map((table) => (
            <AccordionItem key={table.name} value={table.name}>
              <AccordionTrigger className="text-left">
                <div className="flex items-center">
                  <File className="h-4 w-4 mr-2" />
                  <span className="font-mono">{table.name}</span>
                  <Badge variant="outline" className="ml-3 text-xs">
                    {table.requiredFields.length + table.optionalFields.length} fields
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 p-2">
                  <p className="text-sm text-muted-foreground">{table.description}</p>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Field Name</TableHead>
                          <TableHead>Required</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {table.requiredFields.map((field) => (
                          <TableRow key={`${table.name}-${field}`}>
                            <TableCell className="font-mono">{field}</TableCell>
                            <TableCell>
                              <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                Required
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                        {table.optionalFields.map((field) => (
                          <TableRow key={`${table.name}-${field}`}>
                            <TableCell className="font-mono">{field}</TableCell>
                            <TableCell>
                              <Badge variant="outline">Optional</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Implementation Notes</CardTitle>
          <CardDescription>
            Important considerations when implementing this database schema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">Relationships</h4>
            <p className="text-sm text-muted-foreground">
              Make sure to maintain proper foreign key relationships between tables for data integrity.
              For example, license records must reference valid customers and products.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">License Types</h4>
            <p className="text-sm text-muted-foreground">
              The licensing system supports four primary types: date-based, user count-based,
              MAC-based, and country-based. The 'mixed' type combines multiple licensing models.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">MAC Addresses & Countries</h4>
            <p className="text-sm text-muted-foreground">
              MAC addresses and allowed countries are stored in separate tables to support
              multiple values per license. This follows database normalization principles.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Verification Logging</h4>
            <p className="text-sm text-muted-foreground">
              The license_verification_logs table tracks all verification attempts,
              allowing you to monitor usage patterns and identify potential abuse.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
