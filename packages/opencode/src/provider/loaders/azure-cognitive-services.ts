import { Env } from "../../env"
import type { Entry } from "./types"

const entry: Entry = {
  id: "azure-cognitive-services",
  async loader() {
    const resourceName = Env.get("AZURE_COGNITIVE_SERVICES_RESOURCE_NAME")
    return {
      autoload: false,
      async getModel(sdk: any, modelID: string, options?: Record<string, any>) {
        if (options?.["useCompletionUrls"]) {
          return sdk.chat(modelID)
        }
        return sdk.responses(modelID)
      },
      options: {
        baseURL: resourceName ? `https://${resourceName}.cognitiveservices.azure.com/openai` : undefined,
      },
    }
  },
}

export default entry
