
import { useState, useEffect } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, RefreshCw, Database } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function DatabaseConnectionCheck() {
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "success" | "error">("checking");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [dbDetails, setDbDetails] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [apiUrl, setApiUrl] = useState("");

  const checkConnection = async () => {
    setIsChecking(true);
    setConnectionStatus("checking");
    
    try {
      // Use API endpoint to check DB connection instead of direct connection
      const apiUrl = `${import.meta.env.VITE_API_URL}/check-connection`;
      setApiUrl(apiUrl);
      console.log("Checking connection with:", apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setConnectionStatus("success");
        setDbDetails(data);
        console.log("Database connection successful:", data);
        toast({
          title: "Database connected",
          description: "Successfully connected to MySQL database",
        });
      } else {
        setConnectionStatus("error");
        setErrorMessage(data.message || "Unknown error");
        setDbDetails(data.config || null);
        console.error("Connection check failed:", data);
        toast({
          title: "Database connection failed",
          description: data.message || "Could not connect to database",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Connection check error:", error);
      setConnectionStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to connect to the database");
      toast({
        title: "Connection error",
        description: "Could not reach the API server",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="mb-6 mt-4">
      {connectionStatus === "checking" || isChecking ? (
        <Alert className="bg-muted">
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          <AlertTitle>Checking database connection...</AlertTitle>
          <AlertDescription>Connecting to {apiUrl || "API"}</AlertDescription>
        </Alert>
      ) : connectionStatus === "success" ? (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
          <AlertTitle className="text-green-700">Database connection successful</AlertTitle>
          <AlertDescription className="text-green-600 mt-2">
            <p>Your application is properly connected to the MySQL database:</p>
            {dbDetails && (
              <div className="mt-1 text-sm bg-green-100 p-2 rounded flex items-center">
                <Database className="h-3 w-3 mr-1" />
                <span>
                  Connected to database <strong>{dbDetails.database}</strong> on host <strong>{dbDetails.host}</strong>
                </span>
              </div>
            )}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-red-50 border-red-200">
          <XCircle className="h-4 w-4 text-red-500 mr-2" />
          <AlertTitle className="text-red-700">Database connection failed</AlertTitle>
          <AlertDescription className="text-red-600 mt-2">
            <p>Error: {errorMessage}</p>
            <p className="mt-2">Please check:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>MySQL server is running on your local system</li>
              <li>Database credentials in .env file are correct (user: root, password: root_123)</li>
              <li>Database <strong>"{dbDetails?.database || import.meta.env.VITE_DB_NAME || 'vardaan_licensing'}"</strong> exists on <strong>{dbDetails?.host || 'localhost'}</strong></li>
              <li>Server is running on port 8080</li>
              <li>API URL is configured correctly: {apiUrl || import.meta.env.VITE_API_URL}</li>
            </ul>
            <div className="mt-3 p-2 bg-red-100 rounded text-sm">
              <strong>Database Setup:</strong>
              <ol className="list-decimal pl-5 mt-1">
                <li>Make sure MySQL is installed and running on your computer</li>
                <li>Create a database named "vardaan_licensing" if it doesn't exist:
                  <pre className="bg-slate-800 text-white p-2 mt-1 rounded text-xs overflow-x-auto">
                    CREATE DATABASE vardaan_licensing;
                  </pre>
                </li>
                <li>We've updated .env file with credentials: root/root_123</li>
                <li>Restart the server after making these changes</li>
              </ol>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 border-red-300 text-red-600 hover:bg-red-50"
              onClick={checkConnection}
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin mr-2" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Retry Connection
                </>
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
