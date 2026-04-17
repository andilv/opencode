import os from "os"
import { createGitLab, VERSION as GITLAB_PROVIDER_VERSION } from "@gitlab/gitlab-ai-provider"
import { Auth } from "../../auth"
import { Config } from "../../config/config"
import { Env } from "../../env"
import { Installation } from "../../installation"
import type { Entry } from "./types"

const entry: Entry = {
  id: "gitlab",
  async loader(input) {
    const instanceUrl = Env.get("GITLAB_INSTANCE_URL") || "https://gitlab.com"

    const auth = await Auth.get(input.id)
    const apiKey = await (async () => {
      if (auth?.type === "oauth") return auth.access
      if (auth?.type === "api") return auth.key
      return Env.get("GITLAB_TOKEN")
    })()

    const config = await Config.get()
    const providerConfig = config.provider?.["gitlab"]

    const aiGatewayHeaders = {
      "User-Agent": `opencode/${Installation.VERSION} gitlab-ai-provider/${GITLAB_PROVIDER_VERSION} (${os.platform()} ${os.release()}; ${os.arch()})`,
      ...(providerConfig?.options?.aiGatewayHeaders || {}),
    }

    return {
      autoload: !!apiKey,
      options: {
        instanceUrl,
        apiKey,
        aiGatewayHeaders,
        featureFlags: {
          duo_agent_platform_agentic_chat: true,
          duo_agent_platform: true,
          ...(providerConfig?.options?.featureFlags || {}),
        },
      },
      async getModel(sdk: ReturnType<typeof createGitLab>, modelID: string) {
        return sdk.agenticChat(modelID, {
          aiGatewayHeaders,
          featureFlags: {
            duo_agent_platform_agentic_chat: true,
            duo_agent_platform: true,
            ...(providerConfig?.options?.featureFlags || {}),
          },
        })
      },
    }
  },
  bundled: {
    "@gitlab/gitlab-ai-provider": createGitLab,
  },
}

export default entry
