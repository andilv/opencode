import { createAzure } from "@ai-sdk/azure"
import type { CustomLoader } from "./types"

export const bundledProviders = {
  "@ai-sdk/azure": createAzure,
}

export const loader: CustomLoader = async () => {
  return {
    autoload: false,
    async getModel(sdk: any, modelID: string, options?: Record<string, any>) {
      if (options?.["useCompletionUrls"]) {
        return sdk.chat(modelID)
      } else {
        return sdk.responses(modelID)
      }
    },
    options: {},
  }
}
