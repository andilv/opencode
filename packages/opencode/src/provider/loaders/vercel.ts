import { createVercel } from "@ai-sdk/vercel"
import type { Loader } from "./types"

const loader: Loader = {
  id: "vercel",
  async load() {
    return {
      autoload: false,
      options: {
        headers: {
          "http-referer": "https://opencode.ai/",
          "x-title": "opencode",
        },
      },
    }
  },
  bundled: {
    "@ai-sdk/vercel": createVercel,
  },
}

export default loader
