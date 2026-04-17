import { Auth } from "../../auth"
import { Env } from "../../env"
import { iife } from "@/util/iife"
import type { Entry } from "./types"

const entry: Entry = {
  id: "cloudflare-workers-ai",
  async loader(input) {
    const accountId = Env.get("CLOUDFLARE_ACCOUNT_ID")
    if (!accountId) return { autoload: false }

    const apiKey = await iife(async () => {
      const envToken = Env.get("CLOUDFLARE_API_KEY")
      if (envToken) return envToken
      const auth = await Auth.get(input.id)
      if (auth?.type === "api") return auth.key
      return undefined
    })

    return {
      autoload: !!apiKey,
      options: {
        apiKey,
        baseURL: `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1`,
      },
      async getModel(sdk: any, modelID: string) {
        return sdk.languageModel(modelID)
      },
    }
  },
}

export default entry
