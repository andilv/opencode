import type { Provider as SDK } from "ai"
import type { Provider } from "../provider"

export type CustomModelLoader = (sdk: any, modelID: string, options?: Record<string, any>) => Promise<any>

export type CustomLoader = (provider: Provider.Info) => Promise<{
  autoload: boolean
  getModel?: CustomModelLoader
  options?: Record<string, any>
}>

export type BundledProviders = Record<string, (options: any) => SDK>

export interface Entry {
  id: string
  loader: CustomLoader
  bundled?: BundledProviders
}
