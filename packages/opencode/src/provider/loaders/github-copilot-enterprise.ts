import { shouldUseCopilotResponsesApi } from "./github-copilot"
import type { Loader } from "./types"

const loader: Loader = {
  id: "github-copilot-enterprise",
  async load() {
    return {
      autoload: false,
      async getModel(sdk: any, modelID: string) {
        if (sdk.responses === undefined && sdk.chat === undefined) return sdk.languageModel(modelID)
        return shouldUseCopilotResponsesApi(modelID) ? sdk.responses(modelID) : sdk.chat(modelID)
      },
      options: {},
    }
  },
}

export default loader
