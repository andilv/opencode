import { Env } from "../../env"
import type { Loader } from "./types"

const loader: Loader = {
  id: "azure-cognitive-services",
  async load() {
    const resource = Env.get("AZURE_COGNITIVE_SERVICES_RESOURCE_NAME")
    return {
      autoload: false,
      async getModel(sdk: any, modelID: string, options?: Record<string, any>) {
        if (options?.["useCompletionUrls"]) {
          return sdk.chat(modelID)
        }
        return sdk.responses(modelID)
      },
      options: {
        baseURL: resource ? `https://${resource}.cognitiveservices.azure.com/openai` : undefined,
      },
    }
  },
}

export default loader
