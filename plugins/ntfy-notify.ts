import { readFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"
import type { Plugin } from "@opencode-ai/plugin"

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

export const NtfyNotify: Plugin = async () => {
  const config = loadConfig()
  if (!config) return {}

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

  return {
    event: async ({ event }) => {
      const type = String(event.type)
      if (type === "permission.asked") {
        await notify("Permission requested")
      }
      if (type === "session.idle") {
        await notify("Session completed")
      }
      if (type === "session.error") {
        await notify("Session error")
      }
    },
  }
}
