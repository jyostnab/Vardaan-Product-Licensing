
import { useState, useEffect } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";

export function DatabaseConnectionCheck() {
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "success" | "error">("checking");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    setConnectionStatus("checking");
    
    try {
      // Use API endpoint to check DB connection instead of direct connection
      const apiUrl = `${import.meta.env.VITE_API_URL}/check-connection`;
      console.log("Checking connection with:", apiUrl);
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.success) {
        setConnectionStatus("success");
      } else {
        setConnectionStatus("error");
        setErrorMessage(data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Connection check error:", error);
      setConnectionStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to connect to the database");
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
        </Alert>
      ) : connectionStatus === "success" ? (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
          <AlertTitle className="text-green-700">Database connection successful</AlertTitle>
          <AlertDescription className="text-green-600 mt-2">
            Your application is properly connected to the MySQL database.
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
              <li>MySQL server is running</li>
              <li>Database credentials in .env file are correct</li>
              <li>Database "{import.meta.env.VITE_DB_NAME}" exists</li>
              <li>Server is running on port 8080</li>
            </ul>
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
