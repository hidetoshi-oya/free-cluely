import { ipcMain, app } from "electron"
import { AppState } from "./main"
import { GeminiProvider, OpenAIProvider, ClaudeProvider, OllamaProvider } from "./llm"

export function initializeIpcHandlers(appState: AppState): void {
  ipcMain.handle(
    "update-content-dimensions",
    async (_event, { width, height }: { width: number; height: number }) => {
      if (width && height) {
        appState.setWindowDimensions(width, height)
      }
    }
  )

  ipcMain.handle("delete-screenshot", async (_event, path: string) => {
    return appState.deleteScreenshot(path)
  })

  ipcMain.handle("take-screenshot", async () => {
    const screenshotPath = await appState.takeScreenshot()
    const preview = await appState.getImagePreview(screenshotPath)
    return { path: screenshotPath, preview }
  })

  ipcMain.handle("get-screenshots", async () => {
    const queue =
      appState.getView() === "queue"
        ? appState.getScreenshotQueue()
        : appState.getExtraScreenshotQueue()

    return Promise.all(
      queue.map(async (path) => ({
        path,
        preview: await appState.getImagePreview(path)
      }))
    )
  })

  ipcMain.handle("toggle-window", async () => {
    appState.toggleMainWindow()
  })

  ipcMain.handle("reset-queues", async () => {
    try {
      appState.clearQueues()
      console.log("Screenshot queues have been cleared.")
      return { success: true }
    } catch (error: any) {
      console.error("Error resetting queues:", error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("analyze-audio-base64", async (_event, data: string, mimeType: string) => {
    return appState.processingHelper.processAudioBase64(data, mimeType)
  })

  ipcMain.handle("analyze-audio-file", async (_event, path: string) => {
    return appState.processingHelper.processAudioFile(path)
  })

  ipcMain.handle("analyze-image-file", async (_event, path: string) => {
    return appState.processingHelper.getLLMHelper().analyzeImageFile(path)
  })

  ipcMain.handle("gemini-chat", async (_event, message: string) => {
    return appState.processingHelper.getLLMHelper().chatWithGemini(message)
  })

  ipcMain.handle("quit-app", () => {
    app.quit()
  })

  // Window movement handlers
  ipcMain.handle("move-window-left", async () => appState.moveWindowLeft())
  ipcMain.handle("move-window-right", async () => appState.moveWindowRight())
  ipcMain.handle("move-window-up", async () => appState.moveWindowUp())
  ipcMain.handle("move-window-down", async () => appState.moveWindowDown())
  ipcMain.handle("center-and-show-window", async () => appState.centerAndShowWindow())

  // LLM Model Management
  ipcMain.handle("get-current-llm-config", async () => {
    const llmHelper = appState.processingHelper.getLLMHelper()
    return {
      provider: llmHelper.getCurrentProvider(),
      model: llmHelper.getCurrentModel(),
      isOllama: llmHelper.isUsingOllama()
    }
  })

  ipcMain.handle("get-available-ollama-models", async () => {
    return appState.processingHelper.getLLMHelper().getOllamaModels()
  })

  ipcMain.handle("switch-to-ollama", async (_, model?: string, url?: string) => {
    try {
      await appState.processingHelper.getLLMHelper().switchToOllama(model, url)
      return { success: true }
    } catch (error: any) {
      console.error("Error switching to Ollama:", error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("switch-to-gemini", async (_, apiKey?: string) => {
    try {
      await appState.processingHelper.getLLMHelper().switchToGemini(apiKey)
      return { success: true }
    } catch (error: any) {
      console.error("Error switching to Gemini:", error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("test-llm-connection", async () => {
    try {
      return await appState.processingHelper.getLLMHelper().testConnection()
    } catch (error: any) {
      console.error("Error testing LLM connection:", error)
      return { success: false, error: error.message }
    }
  })

  // Speaker transcription (Gemini Live API)
  ipcMain.handle("start-speaker-transcription", async (_event, language: string) => {
    const helper = appState.getLiveTranscriptionHelper()
    if (!helper) return { success: false, error: "GEMINI_API_KEY not set" }

    const mainWindow = appState.getMainWindow()
    if (!mainWindow) return { success: false, error: "No main window" }

    try {
      await helper.connect(mainWindow, language)
      return { success: true }
    } catch (error: any) {
      console.error("Error starting speaker transcription:", error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("stop-speaker-transcription", async () => {
    await appState.getLiveTranscriptionHelper()?.disconnect()
    return { success: true }
  })

  ipcMain.on("speaker-audio-chunk", (_event, base64Pcm: string) => {
    appState.getLiveTranscriptionHelper()?.sendAudioChunk(base64Pcm)
  })

  // === Multi-Provider Settings API (Phase 1.3) ===

  ipcMain.handle("get-settings", async () => {
    return appState.settingsHelper.getAll()
  })

  ipcMain.handle("update-settings", async (_, partial: Record<string, any>) => {
    try {
      appState.settingsHelper.updateAll(partial)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("get-available-providers", async () => {
    return [
      { id: "gemini", name: "Google Gemini", supportsVision: true, supportsAudio: true },
      { id: "openai", name: "OpenAI", supportsVision: true, supportsAudio: false },
      { id: "claude", name: "Anthropic Claude", supportsVision: true, supportsAudio: false },
      { id: "ollama", name: "Ollama (Local)", supportsVision: true, supportsAudio: false },
    ]
  })

  ipcMain.handle("set-provider-api-key", async (_, providerId: string, apiKey: string) => {
    try {
      if (providerId === "ollama") {
        return { success: false, error: "Ollama does not use API keys" }
      }
      appState.settingsHelper.setApiKey(providerId as "gemini" | "openai" | "claude", apiKey)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("set-active-provider", async (_, providerId: string, config?: { model?: string; apiKey?: string; url?: string }) => {
    try {
      const llmHelper = appState.processingHelper.getLLMHelper()
      const registry = llmHelper.getRegistry()

      if (providerId === "gemini") {
        const apiKey = config?.apiKey || appState.settingsHelper.getApiKey("gemini") || process.env.GEMINI_API_KEY
        if (!apiKey) return { success: false, error: "No Gemini API key configured" }
        registry.register(new GeminiProvider(apiKey, config?.model))
        registry.setActiveProvider("gemini")
      } else if (providerId === "openai") {
        const apiKey = config?.apiKey || appState.settingsHelper.getApiKey("openai")
        if (!apiKey) return { success: false, error: "No OpenAI API key configured" }
        registry.register(new OpenAIProvider(apiKey, config?.model))
        registry.setActiveProvider("openai")
      } else if (providerId === "claude") {
        const apiKey = config?.apiKey || appState.settingsHelper.getApiKey("claude")
        if (!apiKey) return { success: false, error: "No Claude API key configured" }
        registry.register(new ClaudeProvider(apiKey, config?.model))
        registry.setActiveProvider("claude")
      } else if (providerId === "ollama") {
        const url = config?.url || "http://localhost:11434"
        registry.register(new OllamaProvider(config?.model || "llama3.2", url))
        registry.setActiveProvider("ollama")
      } else {
        return { success: false, error: `Unknown provider: ${providerId}` }
      }

      // Persist
      appState.settingsHelper.set("activeProvider", providerId)
      if (config?.apiKey && providerId !== "ollama") {
        appState.settingsHelper.setApiKey(providerId as "gemini" | "openai" | "claude", config.apiKey)
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("test-provider-connection", async (_, providerId?: string) => {
    try {
      if (!providerId) {
        return appState.processingHelper.getLLMHelper().testConnection()
      }
      const registry = appState.processingHelper.getLLMHelper().getRegistry()
      const provider = registry.getProvider(providerId)
      if (!provider) return { success: false, error: `Provider "${providerId}" not registered` }
      return provider.testConnection()
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("get-provider-models", async (_, providerId: string) => {
    try {
      const registry = appState.processingHelper.getLLMHelper().getRegistry()
      const provider = registry.getProvider(providerId)
      if (!provider) return []
      return provider.getAvailableModels()
    } catch {
      return []
    }
  })
}
