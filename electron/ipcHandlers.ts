import { ipcMain, app } from "electron"
import { AppState } from "./main"

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
}
