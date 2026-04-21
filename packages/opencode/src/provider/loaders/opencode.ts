import { Auth } from "../../auth"
import { Config } from "../../config/config"
import { Env } from "../../env"
import type { Loader } from "./types"

const loader: Loader = {
  id: "opencode",
  async load(input) {
    const has = await (async () => {
      const env = Env.all()
      if (input.env.some((item) => env[item])) return true
      if (await Auth.get(input.id)) return true
      const config = await Config.get()
      if (config.provider?.["opencode"]?.options?.apiKey) return true
      return false
    })()

    if (!has) {
      for (const [key, value] of Object.entries(input.models)) {
        if (value.cost.input === 0) continue
        delete input.models[key]
      }
    }

    return {
      autoload: Object.keys(input.models).length > 0,
      options: has ? {} : { apiKey: "public" },
    }
  },
}

export default loader
