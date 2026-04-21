import type { Provider as SDK } from "ai"
import { createOpenaiCompatible } from "../sdk/copilot"
import type { Loader } from "./types"

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

const loader: Loader = {
  id: "github-copilot",
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
  bundled: {
    "@ai-sdk/github-copilot": createOpenaiCompatible as unknown as (options: any) => SDK,
  },
}

export default loader
