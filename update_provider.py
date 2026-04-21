import re

with open("packages/opencode/src/provider/provider.ts", "r") as f:
    content = f.read()

# 1. Remove direct imports for bundled providers
# They start from "// Direct imports for bundled providers" to "import { ProviderTransform } from "./transform""
content = re.sub(
    r'// Direct imports for bundled providers.*?import \{ ProviderTransform \} from "\./transform"',
    'import { ProviderTransform } from "./transform"',
    content,
    flags=re.DOTALL
)

# 2. Add new imports after import { Filesystem } from "../util/filesystem"
new_imports = """
import { CUSTOM_LOADERS, BUNDLED_PROVIDERS } from "./loaders"
import type { CustomLoader, CustomModelLoader } from "./loaders/types"
"""
content = content.replace(
    'import { Filesystem } from "../util/filesystem"\n',
    'import { Filesystem } from "../util/filesystem"\n' + new_imports
)

# 3. Remove isGpt5OrLater and shouldUseCopilotResponsesApi
content = re.sub(
    r'  function isGpt5OrLater.*?function googleVertexVars',
    '  function googleVertexVars',
    content,
    flags=re.DOTALL
)

# 4. Remove BUNDLED_PROVIDERS
content = re.sub(
    r'  const BUNDLED_PROVIDERS: Record<string, \(options: any\) => SDK> = \{.*?  \}\n',
    '',
    content,
    flags=re.DOTALL
)

# 5. Remove CustomModelLoader and CustomLoader types
content = re.sub(
    r'  type CustomModelLoader =.*?\n  \}\>\n',
    '',
    content,
    flags=re.DOTALL
)

# 6. Remove CUSTOM_LOADERS
content = re.sub(
    r'  const CUSTOM_LOADERS: Record<string, CustomLoader> = \{.*?  \}\n\n  export const Model = z',
    '  export const Model = z',
    content,
    flags=re.DOTALL
)

with open("packages/opencode/src/provider/provider.ts", "w") as f:
    f.write(content)

print("Done updating provider.ts")
