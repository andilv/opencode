import { Env } from "../../env"
import type { CustomLoader } from "./types"

export const bundledProviders = {}

export const loader: CustomLoader = async () => {
  const resourceName = Env.get("AZURE_COGNITIVE_SERVICES_RESOURCE_NAME")
  return {
    autoload: false,
    async getModel(sdk: any, modelID: string, options?: Record<string, any>) {
      if (options?.["useCompletionUrls"]) {
        return sdk.chat(modelID)
      } else {
        return sdk.responses(modelID)
      }
    },
    options: {
      baseURL: resourceName ? `https://${resourceName}.cognitiveservices.azure.com/openai` : undefined,
    },
  }
}
