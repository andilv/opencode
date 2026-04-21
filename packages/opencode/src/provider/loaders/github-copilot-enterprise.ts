import { shouldUseCopilotResponsesApi } from "./github-copilot"
import type { CustomLoader } from "./types"

export const bundledProviders = {}

export const loader: CustomLoader = async () => {
  return {
    autoload: false,
    async getModel(sdk: any, modelID: string, _options?: Record<string, any>) {
      if (sdk.responses === undefined && sdk.chat === undefined) return sdk.languageModel(modelID)
      return shouldUseCopilotResponsesApi(modelID) ? sdk.responses(modelID) : sdk.chat(modelID)
    },
    options: {},
  }
}
