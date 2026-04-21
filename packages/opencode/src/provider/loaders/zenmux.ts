import type { Loader } from "./types"

const loader: Loader = {
  id: "zenmux",
  async load() {
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

export default loader
