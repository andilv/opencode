import { createOpenAI } from "@ai-sdk/openai"
import type { Loader } from "./types"

const loader: Loader = {
  id: "openai",
  async load() {
    return {
      autoload: false,
      async getModel(sdk: any, modelID: string) {
        return sdk.responses(modelID)
      },
      options: {},
    }
  },
  bundled: {
    "@ai-sdk/openai": createOpenAI,
  },
}

export default loader
