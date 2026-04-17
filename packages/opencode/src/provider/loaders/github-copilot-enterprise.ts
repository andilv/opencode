import { shouldUseCopilotResponsesApi } from "./github-copilot"
import type { Entry } from "./types"

const entry: Entry = {
  id: "github-copilot-enterprise",
  async loader() {
    return {
      autoload: false,
      async getModel(sdk: any, modelID: string, _options?: Record<string, any>) {
        if (sdk.responses === undefined && sdk.chat === undefined) return sdk.languageModel(modelID)
        return shouldUseCopilotResponsesApi(modelID) ? sdk.responses(modelID) : sdk.chat(modelID)
      },
      options: {},
    }
  },
}

export default entry
