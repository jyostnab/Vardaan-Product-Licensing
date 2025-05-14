import { createProduct, createProductVersion } from "@/services/directDatabaseService";

export const initializeAICADEMY = async () => {
  try {
    // Create AICADEMY product
    const product = await createProduct({
      name: "AICADEMY",
      description: "AI-powered learning platform"
    });

    // Create version 1.0.0
    const version = await createProductVersion({
      productId: product.id,
      version: "1.0.0",
      releaseDate: new Date(),
      notes: "Initial release with core AI learning features"
    });

    console.log("AICADEMY product and version initialized successfully");
    return { product, version };
  } catch (error) {
    console.error("Error initializing AICADEMY:", error);
    throw error;
  }
}; 