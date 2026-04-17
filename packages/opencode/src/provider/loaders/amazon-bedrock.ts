import { fromNodeProviderChain } from "@aws-sdk/credential-providers"
import { createAmazonBedrock, type AmazonBedrockProviderSettings } from "@ai-sdk/amazon-bedrock"
import { Auth } from "../../auth"
import { Config } from "../../config/config"
import { Env } from "../../env"
import { iife } from "@/util/iife"
import type { Entry } from "./types"

const entry: Entry = {
  id: "amazon-bedrock",
  async loader() {
    const config = await Config.get()
    const providerConfig = config.provider?.["amazon-bedrock"]

    const auth = await Auth.get("amazon-bedrock")

    // Region precedence: 1) config file, 2) env var, 3) default
    const configRegion = providerConfig?.options?.region
    const envRegion = Env.get("AWS_REGION")
    const defaultRegion = configRegion ?? envRegion ?? "us-east-1"

    // Profile: config file takes precedence over env var
    const configProfile = providerConfig?.options?.profile
    const envProfile = Env.get("AWS_PROFILE")
    const profile = configProfile ?? envProfile

    const awsAccessKeyId = Env.get("AWS_ACCESS_KEY_ID")

    // TODO: Using process.env directly because Env.set only updates a process.env shallow copy,
    // until the scope of the Env API is clarified (test only or runtime?)
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

    const providerOptions: AmazonBedrockProviderSettings = {
      region: defaultRegion,
    }

    // Only use credential chain if no bearer token exists
    // Bearer token takes precedence over credential chain (profiles, access keys, IAM roles, web identity tokens)
    if (!awsBearerToken) {
      // Build credential provider options (only pass profile if specified)
      const credentialProviderOptions = profile ? { profile } : {}

      providerOptions.credentialProvider = fromNodeProviderChain(credentialProviderOptions)
    }

    // Add custom endpoint if specified (endpoint takes precedence over baseURL)
    const endpoint = providerConfig?.options?.endpoint ?? providerConfig?.options?.baseURL
    if (endpoint) {
      providerOptions.baseURL = endpoint
    }

    return {
      autoload: true,
      options: providerOptions,
      async getModel(sdk: any, modelID: string, options?: Record<string, any>) {
        // Skip region prefixing if model already has a cross-region inference profile prefix
        // Models from models.dev may already include prefixes like us., eu., global., etc.
        const crossRegionPrefixes = ["global.", "us.", "eu.", "jp.", "apac.", "au."]
        if (crossRegionPrefixes.some((prefix) => modelID.startsWith(prefix))) {
          return sdk.languageModel(modelID)
        }

        // Region resolution precedence (highest to lowest):
        // 1. options.region from opencode.json provider config
        // 2. defaultRegion from AWS_REGION environment variable
        // 3. Default "us-east-1" (baked into defaultRegion)
        const region = options?.region ?? defaultRegion

        let regionPrefix = region.split("-")[0]

        switch (regionPrefix) {
          case "us": {
            const modelRequiresPrefix = ["nova-micro", "nova-lite", "nova-pro", "nova-premier", "nova-2", "claude", "deepseek"].some((m) =>
              modelID.includes(m),
            )
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
              // Tokyo region uses jp. prefix for cross-region inference
              const modelRequiresPrefix = ["claude", "nova-lite", "nova-micro", "nova-pro"].some((m) =>
                modelID.includes(m),
              )
              if (modelRequiresPrefix) {
                regionPrefix = "jp"
                modelID = `${regionPrefix}.${modelID}`
              }
            } else {
              // Other APAC regions use apac. prefix
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

export default entry
