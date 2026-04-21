import type { Provider as SDK } from "ai"

type LoaderModel = {
  cost: {
    input: number
  }
}

type LoaderInfo = {
  id: string
  env: string[]
  options: Record<string, any>
  models: Record<string, LoaderModel>
}

export type CustomModelLoader = (sdk: any, modelID: string, options?: Record<string, any>) => Promise<any>

export type CustomLoader = (provider: LoaderInfo) => Promise<{
  autoload: boolean
  getModel?: CustomModelLoader
  options?: Record<string, any>
}>

export type BundledProviders = Record<string, (options: any) => SDK>

export type Loader = {
  id: string
  load: CustomLoader
  bundled?: BundledProviders
}
