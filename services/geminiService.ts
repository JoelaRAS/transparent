/**
 * Analyses an image to generate a title and description automatically.
 * In this demo we keep it offline: instant mock without any Gemini key.
 */
export const analyzeImageForMetadata = async (base64Image: string) => {
  return {
    title: "New Observation",
    description: "Visual evidence uploaded by user.",
    tags: ["evidence", "uncategorized"]
  };
};

/**
 * Verifies the context of an event using Grounding.
 * Stubbed for demo: no network, no key needed.
 */
export const verifyEventContext = async (query: string) => {
   return "AI verification disabled in this build.";
}
