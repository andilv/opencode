import { createOpenAI } from "@ai-sdk/openai"
import type { Entry } from "./types"

const entry: Entry = {
  id: "openai",
  async loader() {
    return {
      autoload: false,
      async getModel(sdk: any, modelID: string, _options?: Record<string, any>) {
        return sdk.responses(modelID)
      },
      options: {},
    }
  },
  bundled: {
    "@ai-sdk/openai": createOpenAI,
  },
}

export default entry
