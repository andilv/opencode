import { createAmazonBedrock, type AmazonBedrockProviderSettings } from "@ai-sdk/amazon-bedrock"
import { fromNodeProviderChain } from "@aws-sdk/credential-providers"
import { Auth } from "../../auth"
import { Config } from "../../config/config"
import { Env } from "../../env"
import { iife } from "@/util/iife"
import type { Loader } from "./types"

const loader: Loader = {
  id: "amazon-bedrock",
  async load() {
    const config = await Config.get()
    const provider = config.provider?.["amazon-bedrock"]

    const auth = await Auth.get("amazon-bedrock")

    const configRegion = provider?.options?.region
    const envRegion = Env.get("AWS_REGION")
    const defaultRegion = configRegion ?? envRegion ?? "us-east-1"

    const configProfile = provider?.options?.profile
    const envProfile = Env.get("AWS_PROFILE")
    const profile = configProfile ?? envProfile

    const awsAccessKeyId = Env.get("AWS_ACCESS_KEY_ID")

    const awsBearerToken = iife(() => {
      const envToken = process.env.AWS_BEARER_TOKEN_BEDROCK
      if (envToken) return envToken
      if (auth?.type === "api") {
        process.env.AWS_BEARER_TOKEN_BEDROCK = auth.key
        return auth.key
      }
      return undefined
    })

    const awsWebIdentityTokenFile = Env.get("AWS_WEB_IDENTITY_TOKEN_FILE")

    const containerCreds = Boolean(
      process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI || process.env.AWS_CONTAINER_CREDENTIALS_FULL_URI,
    )

    if (!profile && !awsAccessKeyId && !awsBearerToken && !awsWebIdentityTokenFile && !containerCreds)
      return { autoload: false }

    const opts: AmazonBedrockProviderSettings = {
      region: defaultRegion,
    }

    if (!awsBearerToken) {
      const providerOpts = profile ? { profile } : {}
      opts.credentialProvider = fromNodeProviderChain(providerOpts)
    }

    const endpoint = provider?.options?.endpoint ?? provider?.options?.baseURL
    if (endpoint) {
      opts.baseURL = endpoint
    }

    return {
      autoload: true,
      options: opts,
      async getModel(sdk: any, modelID: string, options?: Record<string, any>) {
        const prefixes = ["global.", "us.", "eu.", "jp.", "apac.", "au."]
        if (prefixes.some((prefix) => modelID.startsWith(prefix))) {
          return sdk.languageModel(modelID)
        }

        const region = options?.region ?? defaultRegion

        let regionPrefix = region.split("-")[0]

        switch (regionPrefix) {
          case "us": {
            const modelRequiresPrefix = [
              "nova-micro",
              "nova-lite",
              "nova-pro",
              "nova-premier",
              "nova-2",
              "claude",
              "deepseek",
            ].some((m) => modelID.includes(m))
            const isGovCloud = region.startsWith("us-gov")
            if (modelRequiresPrefix && !isGovCloud) {
              modelID = `${regionPrefix}.${modelID}`
            }
            break
          }
          case "eu": {
            const regionRequiresPrefix = [
              "eu-west-1",
              "eu-west-2",
              "eu-west-3",
              "eu-north-1",
              "eu-central-1",
              "eu-south-1",
              "eu-south-2",
            ].some((r) => region.includes(r))
            const modelRequiresPrefix = ["claude", "nova-lite", "nova-micro", "llama3", "pixtral"].some((m) =>
              modelID.includes(m),
            )
            if (regionRequiresPrefix && modelRequiresPrefix) {
              modelID = `${regionPrefix}.${modelID}`
            }
            break
          }
          case "ap": {
            const isAustraliaRegion = ["ap-southeast-2", "ap-southeast-4"].includes(region)
            const isTokyoRegion = region === "ap-northeast-1"
            if (
              isAustraliaRegion &&
              ["anthropic.claude-sonnet-4-5", "anthropic.claude-haiku"].some((m) => modelID.includes(m))
            ) {
              regionPrefix = "au"
              modelID = `${regionPrefix}.${modelID}`
            } else if (isTokyoRegion) {
              const modelRequiresPrefix = ["claude", "nova-lite", "nova-micro", "nova-pro"].some((m) =>
                modelID.includes(m),
              )
              if (modelRequiresPrefix) {
                regionPrefix = "jp"
                modelID = `${regionPrefix}.${modelID}`
              }
            } else {
              const modelRequiresPrefix = ["claude", "nova-lite", "nova-micro", "nova-pro"].some((m) =>
                modelID.includes(m),
              )
              if (modelRequiresPrefix) {
                regionPrefix = "apac"
                modelID = `${regionPrefix}.${modelID}`
              }
            }
            break
          }
        }

        return sdk.languageModel(modelID)
      },
    }
  },
  bundled: {
    "@ai-sdk/amazon-bedrock": createAmazonBedrock,
  },
}

export default loader
