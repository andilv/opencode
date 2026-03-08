import { describe, expect, test } from "bun:test"
import z from "zod"
import { BatchTool } from "../src/tool/batch"
import { ToolRegistry } from "../src/tool/registry"
import { Instance } from "../src/project/instance"
import { tmpdir } from "./fixture/fixture"

describe("BatchTool", () => {
  test("returns session-scoped attachments", async () => {
    await using tmp = await tmpdir({ git: true })
    await Instance.provide({
      directory: tmp.path,
      fn: async () => {
        await ToolRegistry.register({
          id: "stub_batch_attachment",
          init: async () => ({
            description: "stub",
            parameters: z.object({}),
            execute: async () => ({
              title: "stub",
              output: "ok",
              metadata: {},
              attachments: [
                {
                  type: "file",
                  mime: "text/plain",
                  url: "data:text/plain;base64,Zm9v",
                },
              ],
            }),
          }),
        })

        const batch = await BatchTool.init()
        const result = await batch.execute(
          {
            tool_calls: [
              { tool: "stub_batch_attachment", parameters: {} },
              { tool: "stub_batch_attachment", parameters: {} },
            ],
          },
          {
            sessionID: "session_test",
            messageID: "message_test",
            agent: "general",
            abort: new AbortController().signal,
            messages: [],
            metadata() {},
            ask: async () => {},
          },
        )

        expect(result.attachments).toHaveLength(2)
        expect(result.attachments?.every((item) => item.sessionID === "session_test")).toBe(true)
        expect(result.attachments?.every((item) => item.messageID === "message_test")).toBe(true)
        expect(result.attachments?.every((item) => item.id.startsWith("part_"))).toBe(true)
      },
    })
  })
})
