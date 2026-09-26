import { readFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"
import { Plugin } from "@opencode/plugin"

type NtfyConfig = {
  url: string
  token: string
}

function loadConfig(): NtfyConfig | null {
  const base = process.env.XDG_CONFIG_HOME || join(homedir(), ".config")
  try {
    const parsed = JSON.parse(readFileSync(join(base, "opencode", "ntfy.json"), "utf8"))
    if (!parsed || typeof parsed.url !== "string" || parsed.url.length === 0) {
      return null
    }
    return {
      url: parsed.url,
      token: typeof parsed.token === "string" ? parsed.token : "",
    }
  } catch {
    return null
  }
}

export default Plugin.define({
  id: "ntfy-notify",
  setup(ctx) {
    const config = loadConfig()
    if (!config) return

    const notify = async (body: string) => {
      try {
        const headers: Record<string, string> = {
          Title: "OpenCode",
          Tags: "robot",
        }
        if (config.token) headers.Authorization = `Bearer ${config.token}`
        await fetch(config.url, { method: "POST", headers, body })
      } catch {
        // ignore notification failures
      }
    }

    const controller = new AbortController()
    let lastCompletedAt = 0

    const notifyCompleted = async () => {
      // session.status{idle} and legacy session.idle can both fire per completion
      const now = Date.now()
      if (now - lastCompletedAt < 10_000) return
      lastCompletedAt = now
      await notify("Session completed")
    }

    void (async () => {
      try {
        for await (const event of ctx.event.subscribe({ signal: controller.signal })) {
          const type = String(event.type)
          if (type === "permission.asked") {
            await notify("Permission requested")
          }
          if (type === "session.idle") {
            await notifyCompleted()
          }
          if (type === "session.status") {
            const status = (event.data as { status?: { type?: string } } | undefined)?.status?.type
            if (status === "idle") await notifyCompleted()
          }
          if (type === "session.execution.failed" || type === "session.error") {
            await notify("Session error")
          }
        }
      } catch {
        // ignore subscription errors (e.g. abort on unload)
      }
    })()

    return () => controller.abort()
  },
})
