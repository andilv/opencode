import { createVertexAnthropic } from "@ai-sdk/google-vertex/anthropic"
import { Env } from "../../env"
import type { Loader } from "./types"

const loader: Loader = {
  id: "google-vertex-anthropic",
  async load() {
    const project = Env.get("GOOGLE_CLOUD_PROJECT") ?? Env.get("GCP_PROJECT") ?? Env.get("GCLOUD_PROJECT")
    const location = Env.get("GOOGLE_CLOUD_LOCATION") ?? Env.get("VERTEX_LOCATION") ?? "global"
    const autoload = Boolean(project)
    if (!autoload) return { autoload: false }
    return {
      autoload: true,
      options: {
        project,
        location,
      },
      async getModel(sdk: any, modelID: string) {
        const id = String(modelID).trim()
        return sdk.languageModel(id)
      },
    }
  },
  bundled: {
    "@ai-sdk/google-vertex/anthropic": createVertexAnthropic,
  },
}

export default loader
