import { createAzure } from "@ai-sdk/azure"
import type { Entry } from "./types"

const entry: Entry = {
  id: "azure",
  async loader() {
    return {
      autoload: false,
      async getModel(sdk: any, modelID: string, options?: Record<string, any>) {
        if (options?.["useCompletionUrls"]) {
          return sdk.chat(modelID)
        }
        return sdk.responses(modelID)
      },
      options: {},
    }
  },
  bundled: {
    "@ai-sdk/azure": createAzure,
  },
}

export default entry
