import { createVercel } from "@ai-sdk/vercel"
import type { CustomLoader } from "./types"

export const bundledProviders = {
  "@ai-sdk/vercel": createVercel,
}

export const loader: CustomLoader = async () => {
  return {
    autoload: false,
    options: {
      headers: {
        "http-referer": "https://opencode.ai/",
        "x-title": "opencode",
      },
    },
  }
}
