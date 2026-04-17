import type { Entry } from "./types"

const entry: Entry = {
  id: "kilo",
  async loader() {
    return {
      autoload: false,
      options: {
        headers: {
          "HTTP-Referer": "https://opencode.ai/",
          "X-Title": "opencode",
        },
      },
    }
  },
}

export default entry
