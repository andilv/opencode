import { createOpenAI } from "@ai-sdk/openai"
import type { CustomLoader } from "./types"

export const bundledProviders = {
  "@ai-sdk/openai": createOpenAI,
}

export const loader: CustomLoader = async () => {
  return {
    autoload: false,
    async getModel(sdk: any, modelID: string, _options?: Record<string, any>) {
      return sdk.responses(modelID)
    },
    options: {},
  }
}
