import { createVercel } from "@ai-sdk/vercel"
import type { Entry } from "./types"

const entry: Entry = {
  id: "vercel",
  async loader() {
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

export default entry
