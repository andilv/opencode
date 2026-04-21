import type { CustomLoader } from "./types"
import type { Provider as SDK } from "ai"

import * as anthropic from "./anthropic"
import * as opencode from "./opencode"
import * as openai from "./openai"
import * as githubCopilot from "./github-copilot"
import * as githubCopilotEnterprise from "./github-copilot-enterprise"
import * as azure from "./azure"
import * as azureCognitiveServices from "./azure-cognitive-services"
import * as amazonBedrock from "./amazon-bedrock"
import * as openrouter from "./openrouter"
import * as vercel from "./vercel"
import * as googleVertex from "./google-vertex"
import * as googleVertexAnthropic from "./google-vertex-anthropic"
import * as sapAiCore from "./sap-ai-core"
import * as zenmux from "./zenmux"
import * as gitlab from "./gitlab"
import * as cloudflareWorkersAi from "./cloudflare-workers-ai"
import * as cloudflareAiGateway from "./cloudflare-ai-gateway"
import * as cerebras from "./cerebras"
import * as kilo from "./kilo"
import * as bundledOnly from "./bundled-only"

// Registry for CUSTOM_LOADERS keyed by provider ID
export const CUSTOM_LOADERS: Record<string, CustomLoader> = {
  anthropic: anthropic.loader,
  opencode: opencode.loader,
  openai: openai.loader,
  "github-copilot": githubCopilot.loader,
  "github-copilot-enterprise": githubCopilotEnterprise.loader,
  azure: azure.loader,
  "azure-cognitive-services": azureCognitiveServices.loader,
  "amazon-bedrock": amazonBedrock.loader,
  openrouter: openrouter.loader,
  vercel: vercel.loader,
  "google-vertex": googleVertex.loader,
  "google-vertex-anthropic": googleVertexAnthropic.loader,
  "sap-ai-core": sapAiCore.loader,
  zenmux: zenmux.loader,
  gitlab: gitlab.loader,
  "cloudflare-workers-ai": cloudflareWorkersAi.loader,
  "cloudflare-ai-gateway": cloudflareAiGateway.loader,
  cerebras: cerebras.loader,
  kilo: kilo.loader,
}

// Registry for BUNDLED_PROVIDERS keyed by npm package name
// @ts-ignore
export const BUNDLED_PROVIDERS: Record<string, (options: any) => SDK> = {
  ...bundledOnly.bundledProviders,
  ...anthropic.bundledProviders,
  ...opencode.bundledProviders,
  ...openai.bundledProviders,
  ...githubCopilot.bundledProviders,
  ...githubCopilotEnterprise.bundledProviders,
  ...azure.bundledProviders,
  ...azureCognitiveServices.bundledProviders,
  ...amazonBedrock.bundledProviders,
  ...openrouter.bundledProviders,
  ...vercel.bundledProviders,
  ...googleVertex.bundledProviders,
  ...googleVertexAnthropic.bundledProviders,
  ...sapAiCore.bundledProviders,
  ...zenmux.bundledProviders,
  ...gitlab.bundledProviders,
  ...cloudflareWorkersAi.bundledProviders,
  ...cloudflareAiGateway.bundledProviders,
  ...cerebras.bundledProviders,
  ...kilo.bundledProviders,
}
