import { bundled } from "./bundled-only"
import type { BundledProviders, CustomLoader, Loader } from "./types"

const skip = new Set(["bundled-only.ts", "index.ts", "types.ts"])
const files = Array.from(new Bun.Glob("*.ts").scanSync({ cwd: import.meta.dir }))
  .filter((file) => !skip.has(file))
  .sort()

const all = await Promise.all(files.map((file) => import(new URL(file, import.meta.url).href))).then((mods) =>
  mods.map((mod) => mod.default as Loader),
)

export const CUSTOM_LOADERS: Record<string, CustomLoader> = Object.fromEntries(all.map((item) => [item.id, item.load]))

export const BUNDLED_PROVIDERS: BundledProviders = all
  .map((item) => item.bundled ?? {})
  .reduce((acc, item) => ({ ...acc, ...item }), { ...bundled })
