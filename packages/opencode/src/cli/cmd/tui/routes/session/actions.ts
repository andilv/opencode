import type { AssistantMessage, Part, UserMessage } from "@opencode-ai/sdk/v2"
import type { PromptInfo } from "../../component/prompt/history"
import { Clipboard } from "../../util/clipboard"
import { DialogConfirm } from "@tui/ui/dialog-confirm"
import { DialogExportOptions } from "../../ui/dialog-export-options"
import { formatTranscript } from "../../util/transcript"
import { Editor } from "../../util/editor"
import path from "path"
import { parsePatch } from "diff"

type TextPart = Extract<Part, { type: "text" }>
type FilePart = Extract<Part, { type: "file" }>
type Msg = UserMessage | AssistantMessage

type Export = {
  dialog: Parameters<typeof DialogExportOptions.show>[0]
  session: Parameters<typeof formatTranscript>[0]
  messages: Msg[]
  parts: Record<string, Part[] | undefined>
  thinking: boolean
  toolDetails: boolean
  assistantMetadata: boolean
  renderer: Parameters<typeof Editor.open>[0]["renderer"]
}

function visible(parts?: Part[]) {
  if (!parts) return false
  return parts.some((part) => part.type === "text" && !part.synthetic && !part.ignored)
}

export function findNextVisibleMessage(
  children: Array<{ id?: string; y: number }>,
  messages: Msg[],
  parts: Record<string, Part[] | undefined>,
  top: number,
  direction: "next" | "prev",
) {
  const items = children
    .filter((child) => {
      if (!child.id) return false
      const msg = messages.find((item) => item.id === child.id)
      if (!msg) return false
      return visible(parts[msg.id])
    })
    .sort((a, b) => a.y - b.y)

  if (direction === "next") return items.find((child) => child.y > top + 10)?.id ?? null
  return [...items].reverse().find((child) => child.y < top - 10)?.id ?? null
}

export function findLastUserMessage(messages: UserMessage[], parts: Record<string, Part[] | undefined>, revertID?: string) {
  return messages.findLast((msg) => (!revertID || msg.id < revertID) && visible(parts[msg.id]))
}

export function buildPrompt(parts: Part[]) {
  return parts.reduce(
    (agg, part) => {
      if (part.type === "text" && !part.synthetic) agg.input += part.text
      if (part.type === "file") agg.parts.push(part)
      return agg
    },
    { input: "", parts: [] as PromptInfo["parts"] },
  )
}

export function findLastAssistantText(
  messages: AssistantMessage[],
  parts: Record<string, Part[] | undefined>,
  revertID?: string,
) {
  const msg = messages.findLast((item) => !revertID || item.id < revertID)
  if (!msg) return
  const text = (parts[msg.id] ?? [])
    .flatMap((part) => (part.type === "text" ? [part.text] : []))
    .join("\n")
    .trim()
  if (!text) return
  return text
}

export async function copyTranscript(args: Omit<Export, "dialog" | "renderer">) {
  await Clipboard.copy(
    formatTranscript(
      args.session,
      args.messages.map((msg) => ({ info: msg, parts: args.parts[msg.id] ?? [] })),
      {
        thinking: args.thinking,
        toolDetails: args.toolDetails,
        assistantMetadata: args.assistantMetadata,
      },
    ),
  )
}

export async function exportTranscript(args: Export) {
  const opts = await DialogExportOptions.show(
    args.dialog,
    `session-${args.session.id.slice(0, 8)}.md`,
    args.thinking,
    args.toolDetails,
    args.assistantMetadata,
    false,
  )
  if (opts === null) return
  const text = formatTranscript(
    args.session,
    args.messages.map((msg) => ({ info: msg, parts: args.parts[msg.id] ?? [] })),
    {
      thinking: opts.thinking,
      toolDetails: opts.toolDetails,
      assistantMetadata: opts.assistantMetadata,
    },
  )
  if (opts.openWithoutSaving) {
    await Editor.open({ value: text, renderer: args.renderer })
    return opts.filename
  }
  const file = path.join(process.cwd(), opts.filename.trim())
  await Bun.write(file, text)
  const next = await Editor.open({ value: text, renderer: args.renderer })
  if (next !== undefined) await Bun.write(file, next)
  return opts.filename
}

export function confirmRedo(dialog: Parameters<typeof DialogConfirm.show>[0]) {
  return DialogConfirm.show(dialog, "Confirm Redo", "Are you sure you want to restore the reverted messages?")
}

export function parseRevert(diffText?: string) {
  if (!diffText) return []
  try {
    return parsePatch(diffText).map((patch) => ({
      filename: (patch.newFileName || patch.oldFileName || "unknown").replace(/^[ab]\//, ""),
      additions: patch.hunks.reduce((sum, hunk) => sum + hunk.lines.filter((line) => line.startsWith("+")).length, 0),
      deletions: patch.hunks.reduce((sum, hunk) => sum + hunk.lines.filter((line) => line.startsWith("-")).length, 0),
    }))
  } catch {
    return []
  }
}
