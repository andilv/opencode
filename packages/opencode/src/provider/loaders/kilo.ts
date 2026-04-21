import type { CustomLoader } from "./types"

export const bundledProviders = {}

export const loader: CustomLoader = async () => {
  return {
    autoload: false,
    options: {
      headers: {
        "HTTP-Referer": "https://opencode.ai/",
        "X-Title": "opencode",
      },
    },
  }
}
