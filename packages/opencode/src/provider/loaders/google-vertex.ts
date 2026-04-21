import { createVertex } from "@ai-sdk/google-vertex"
import { GoogleAuth } from "google-auth-library"
import { Env } from "../../env"
import type { CustomLoader } from "./types"

export const bundledProviders = {
  "@ai-sdk/google-vertex": createVertex,
}

export const loader: CustomLoader = async (provider) => {
  const project =
    provider.options?.project ?? Env.get("GOOGLE_CLOUD_PROJECT") ?? Env.get("GCP_PROJECT") ?? Env.get("GCLOUD_PROJECT")

  const location =
    provider.options?.location ?? Env.get("GOOGLE_CLOUD_LOCATION") ?? Env.get("VERTEX_LOCATION") ?? "us-central1"

  const autoload = Boolean(project)
  if (!autoload) return { autoload: false }
  return {
    autoload: true,
    options: {
      project,
      location,
      fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
        const auth = new GoogleAuth()
        const client = await auth.getApplicationDefault()
        const token = await client.credential.getAccessToken()

        const headers = new Headers(init?.headers)
        headers.set("Authorization", `Bearer ${token.token}`)

        return fetch(input, { ...init, headers })
      },
    },
    async getModel(sdk: any, modelID: string) {
      const id = String(modelID).trim()
      return sdk.languageModel(id)
    },
  }
}
