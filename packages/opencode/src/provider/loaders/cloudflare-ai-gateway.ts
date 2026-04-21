import { Auth } from "../../auth"
import { Env } from "../../env"
import { iife } from "@/util/iife"
import type { Loader } from "./types"

const loader: Loader = {
  id: "cloudflare-ai-gateway",
  async load(input) {
    const accountId = Env.get("CLOUDFLARE_ACCOUNT_ID")
    const gateway = Env.get("CLOUDFLARE_GATEWAY_ID")

    if (!accountId || !gateway) return { autoload: false }

    const apiToken = await (async () => {
      const envToken = Env.get("CLOUDFLARE_API_TOKEN") || Env.get("CF_AIG_TOKEN")
      if (envToken) return envToken
      const auth = await Auth.get(input.id)
      if (auth?.type === "api") return auth.key
      return undefined
    })()

    if (!apiToken) {
      throw new Error(
        "CLOUDFLARE_API_TOKEN (or CF_AIG_TOKEN) is required for Cloudflare AI Gateway. " +
          "Set it via environment variable or run `opencode auth cloudflare-ai-gateway`.",
      )
    }

    const { createAiGateway } = await import("ai-gateway-provider")
    const { createUnified } = await import("ai-gateway-provider/providers/unified")

    const metadata = iife(() => {
      if (input.options?.metadata) return input.options.metadata
      try {
        return JSON.parse(input.options?.headers?.["cf-aig-metadata"])
      } catch {
        return undefined
      }
    })
    const opts = {
      metadata,
      cacheTtl: input.options?.cacheTtl,
      cacheKey: input.options?.cacheKey,
      skipCache: input.options?.skipCache,
      collectLog: input.options?.collectLog,
    }

    const aigateway = createAiGateway({
      accountId,
      gateway,
      apiKey: apiToken,
      ...(Object.values(opts).some((v) => v !== undefined) ? { options: opts } : {}),
    })
    const unified = createUnified()

    return {
      autoload: true,
      async getModel(_sdk: any, modelID: string) {
        return aigateway(unified(modelID))
      },
      options: {},
    }
  },
}

export default loader
