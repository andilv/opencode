import { describe, expect, test } from "bun:test"
import { buildPrompt, findLastAssistantText, findLastUserMessage, findNextVisibleMessage, parseRevert } from "../src/cli/cmd/tui/routes/session/actions"

describe("session actions helpers", () => {
  test("findNextVisibleMessage skips synthetic or ignored messages", () => {
    const messages = [
      { id: "1", role: "user" },
      { id: "2", role: "assistant" },
      { id: "3", role: "user" },
    ] as any
    const parts = {
      "1": [{ type: "text", synthetic: false, ignored: false }],
      "2": [{ type: "text", synthetic: true, ignored: false }],
      "3": [{ type: "text", synthetic: false, ignored: false }],
    }
    const children = [
      { id: "1", y: 0 },
      { id: "2", y: 20 },
      { id: "3", y: 40 },
    ]

    expect(findNextVisibleMessage(children, messages, parts, 5, "next")).toBe("3")
    expect(findNextVisibleMessage(children, messages, parts, 35, "prev")).toBe("1")
  })

  test("findLastUserMessage respects revert id and valid text", () => {
    const messages = [
      { id: "1", role: "user" },
      { id: "2", role: "user" },
      { id: "3", role: "user" },
    ] as any
    const parts = {
      "1": [{ type: "text", synthetic: false, ignored: false }],
      "2": [{ type: "text", synthetic: true, ignored: false }],
      "3": [{ type: "text", synthetic: false, ignored: false }],
    }

    expect(findLastUserMessage(messages, parts)?.id).toBe("3")
    expect(findLastUserMessage(messages, parts, "3")?.id).toBe("1")
  })

  test("buildPrompt collects text and files", () => {
    const result = buildPrompt([
      { type: "text", text: "hello ", synthetic: false },
      { type: "text", text: "hidden", synthetic: true },
      { type: "file", filename: "a.ts" },
      { type: "text", text: "world", synthetic: false },
    ] as any)

    expect(result.input).toBe("hello world")
    expect(result.parts).toHaveLength(1)
  })

  test("findLastAssistantText joins text parts", () => {
    const messages = [
      { id: "1" },
      { id: "2" },
    ] as any
    const parts = {
      "1": [{ type: "text", text: "old" }],
      "2": [{ type: "text", text: "new" }, { type: "text", text: "text" }],
    }

    expect(findLastAssistantText(messages, parts)).toBe("new\ntext")
    expect(findLastAssistantText(messages, parts, "2")).toBe("old")
  })

  test("parseRevert summarizes patch files", () => {
    const diff = [
      "diff --git a/a.ts b/a.ts",
      "--- a/a.ts",
      "+++ b/a.ts",
      "@@ -1 +1,2 @@",
      "-a",
      "+b",
      "+c",
    ].join("\n")

    expect(parseRevert(diff)).toEqual([{ filename: "a.ts", additions: 2, deletions: 1 }])
  })
})
