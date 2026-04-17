import path from "path"
import { pathToFileURL } from "url"
import { Glob } from "@/util/glob"
import { bundled as bundledOnly } from "./bundled-only"
import type { BundledProviders, CustomLoader, Entry } from "./types"

const skip = new Set(["index.ts", "index.js", "types.ts", "types.js", "bundled-only.ts", "bundled-only.js"])

async function init() {
  const custom: Record<string, CustomLoader> = {}
  const bundled: BundledProviders = { ...bundledOnly }
  const files = Glob.scanSync("*.{ts,js}", {
    cwd: import.meta.dirname,
    absolute: true,
  }).sort()

  for (const file of files) {
    const base = path.basename(file)
    if (skip.has(base)) continue
    const mod = await import(pathToFileURL(file).href)
    const data = mod.default as Entry | undefined
    if (!data) continue
    custom[data.id] = data.loader
    if (data.bundled) {
      Object.assign(bundled, data.bundled)
    }
  }

  return {
    custom,
    bundled,
  }
}

const data = await init()

export const CUSTOM_LOADERS = data.custom
export const BUNDLED_PROVIDERS = data.bundled
