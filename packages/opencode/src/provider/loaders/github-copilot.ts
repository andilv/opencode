import { createOpenaiCompatible as createGitHubCopilotOpenAICompatible } from "../sdk/copilot"
import type { Entry } from "./types"

function isGpt5OrLater(modelID: string): boolean {
  const match = /^gpt-(\d+)/.exec(modelID)
  if (!match) {
    return false
  }
  return Number(match[1]) >= 5
}

export function shouldUseCopilotResponsesApi(modelID: string): boolean {
  return isGpt5OrLater(modelID) && !modelID.startsWith("gpt-5-mini")
}

const entry: Entry = {
  id: "github-copilot",
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
  bundled: {
    // @ts-ignore (TODO: kill this code so we dont have to maintain it)
    "@ai-sdk/github-copilot": createGitHubCopilotOpenAICompatible,
  },
}

export default entry
