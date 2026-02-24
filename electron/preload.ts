import { contextBridge, ipcRenderer } from "electron"

// Types for the exposed Electron API
interface ElectronAPI {
  updateContentDimensions: (dimensions: {
    width: number
    height: number
  }) => Promise<void>
  getScreenshots: () => Promise<Array<{ path: string; preview: string }>>
  deleteScreenshot: (
    path: string
  ) => Promise<{ success: boolean; error?: string }>
  onScreenshotTaken: (
    callback: (data: { path: string; preview: string }) => void
  ) => () => void
  onSolutionsReady: (callback: (solutions: string) => void) => () => void
  onResetView: (callback: () => void) => () => void
  onSolutionStart: (callback: () => void) => () => void
  onDebugStart: (callback: () => void) => () => void
  onDebugSuccess: (callback: (data: any) => void) => () => void
  onSolutionError: (callback: (error: string) => void) => () => void
  onProcessingNoScreenshots: (callback: () => void) => () => void
  onProblemExtracted: (callback: (data: any) => void) => () => void
  onSolutionSuccess: (callback: (data: any) => void) => () => void

  onUnauthorized: (callback: () => void) => () => void
  onDebugError: (callback: (error: string) => void) => () => void
  takeScreenshot: () => Promise<void>
  moveWindowLeft: () => Promise<void>
  moveWindowRight: () => Promise<void>
  moveWindowUp: () => Promise<void>
  moveWindowDown: () => Promise<void>
  analyzeAudioFromBase64: (data: string, mimeType: string) => Promise<{ text: string; timestamp: number }>
  analyzeAudioFile: (path: string) => Promise<{ text: string; timestamp: number }>
  analyzeImageFile: (path: string) => Promise<void>
  quitApp: () => Promise<void>

  // LLM Model Management (legacy)
  getCurrentLlmConfig: () => Promise<{ provider: "ollama" | "gemini"; model: string; isOllama: boolean }>
  getAvailableOllamaModels: () => Promise<string[]>
  switchToOllama: (model?: string, url?: string) => Promise<{ success: boolean; error?: string }>
  switchToGemini: (apiKey?: string) => Promise<{ success: boolean; error?: string }>
  testLlmConnection: () => Promise<{ success: boolean; error?: string }>

  // Multi-Provider API
  getSettings: () => Promise<any>
  updateSettings: (partial: Record<string, any>) => Promise<{ success: boolean; error?: string }>
  getAvailableProviders: () => Promise<Array<{ id: string; name: string; supportsVision: boolean; supportsAudio: boolean }>>
  setProviderApiKey: (providerId: string, apiKey: string) => Promise<{ success: boolean; error?: string }>
  setActiveProvider: (providerId: string, config?: { model?: string; apiKey?: string; url?: string }) => Promise<{ success: boolean; error?: string }>
  testProviderConnection: (providerId?: string) => Promise<{ success: boolean; error?: string }>
  getProviderModels: (providerId: string) => Promise<Array<{ id: string; name: string; supportsVision: boolean; supportsAudio: boolean }>>

  // Speaker transcription (Gemini Live API)
  startSpeakerTranscription: (language: string) => Promise<{ success: boolean; error?: string }>
  stopSpeakerTranscription: () => Promise<{ success: boolean }>
  sendSpeakerAudioChunk: (base64Pcm: string) => void
  onSpeakerTranscription: (callback: (data: { text: string; isFinal: boolean; timestamp: number }) => void) => () => void
  onSpeakerTranscriptionStatus: (callback: (data: { status: string }) => void) => () => void

  invoke: (channel: string, ...args: any[]) => Promise<any>
}

export const PROCESSING_EVENTS = {
  UNAUTHORIZED: "procesing-unauthorized",
  NO_SCREENSHOTS: "processing-no-screenshots",
  INITIAL_START: "initial-start",
  PROBLEM_EXTRACTED: "problem-extracted",
  SOLUTION_SUCCESS: "solution-success",
  INITIAL_SOLUTION_ERROR: "solution-error",
  DEBUG_START: "debug-start",
  DEBUG_SUCCESS: "debug-success",
  DEBUG_ERROR: "debug-error"
} as const

/**
 * Creates a subscribable IPC event listener that returns an unsubscribe function.
 */
function onIpcEvent<T = void>(channel: string): (callback: (data: T) => void) => () => void {
  return (callback: (data: T) => void) => {
    const handler = (_: any, data: T) => callback(data)
    ipcRenderer.on(channel, handler)
    return () => ipcRenderer.removeListener(channel, handler)
  }
}

contextBridge.exposeInMainWorld("electronAPI", {
  updateContentDimensions: (dimensions: { width: number; height: number }) =>
    ipcRenderer.invoke("update-content-dimensions", dimensions),
  takeScreenshot: () => ipcRenderer.invoke("take-screenshot"),
  getScreenshots: () => ipcRenderer.invoke("get-screenshots"),
  deleteScreenshot: (path: string) =>
    ipcRenderer.invoke("delete-screenshot", path),

  // Event listeners
  onScreenshotTaken: onIpcEvent<{ path: string; preview: string }>("screenshot-taken"),
  onSolutionsReady: onIpcEvent<string>("solutions-ready"),
  onResetView: onIpcEvent("reset-view"),
  onSolutionStart: onIpcEvent(PROCESSING_EVENTS.INITIAL_START),
  onDebugStart: onIpcEvent(PROCESSING_EVENTS.DEBUG_START),
  onDebugSuccess: onIpcEvent<any>("debug-success"),
  onDebugError: onIpcEvent<string>(PROCESSING_EVENTS.DEBUG_ERROR),
  onSolutionError: onIpcEvent<string>(PROCESSING_EVENTS.INITIAL_SOLUTION_ERROR),
  onProcessingNoScreenshots: onIpcEvent(PROCESSING_EVENTS.NO_SCREENSHOTS),
  onProblemExtracted: onIpcEvent<any>(PROCESSING_EVENTS.PROBLEM_EXTRACTED),
  onSolutionSuccess: onIpcEvent<any>(PROCESSING_EVENTS.SOLUTION_SUCCESS),
  onUnauthorized: onIpcEvent(PROCESSING_EVENTS.UNAUTHORIZED),

  moveWindowLeft: () => ipcRenderer.invoke("move-window-left"),
  moveWindowRight: () => ipcRenderer.invoke("move-window-right"),
  moveWindowUp: () => ipcRenderer.invoke("move-window-up"),
  moveWindowDown: () => ipcRenderer.invoke("move-window-down"),
  analyzeAudioFromBase64: (data: string, mimeType: string) => ipcRenderer.invoke("analyze-audio-base64", data, mimeType),
  analyzeAudioFile: (path: string) => ipcRenderer.invoke("analyze-audio-file", path),
  analyzeImageFile: (path: string) => ipcRenderer.invoke("analyze-image-file", path),
  quitApp: () => ipcRenderer.invoke("quit-app"),

  // LLM Model Management (legacy)
  getCurrentLlmConfig: () => ipcRenderer.invoke("get-current-llm-config"),
  getAvailableOllamaModels: () => ipcRenderer.invoke("get-available-ollama-models"),
  switchToOllama: (model?: string, url?: string) => ipcRenderer.invoke("switch-to-ollama", model, url),
  switchToGemini: (apiKey?: string) => ipcRenderer.invoke("switch-to-gemini", apiKey),
  testLlmConnection: () => ipcRenderer.invoke("test-llm-connection"),

  // Multi-Provider API (Phase 1.3)
  getSettings: () => ipcRenderer.invoke("get-settings"),
  updateSettings: (partial: Record<string, any>) => ipcRenderer.invoke("update-settings", partial),
  getAvailableProviders: () => ipcRenderer.invoke("get-available-providers"),
  setProviderApiKey: (providerId: string, apiKey: string) => ipcRenderer.invoke("set-provider-api-key", providerId, apiKey),
  setActiveProvider: (providerId: string, config?: { model?: string; apiKey?: string; url?: string }) => ipcRenderer.invoke("set-active-provider", providerId, config),
  testProviderConnection: (providerId?: string) => ipcRenderer.invoke("test-provider-connection", providerId),
  getProviderModels: (providerId: string) => ipcRenderer.invoke("get-provider-models", providerId),

  // Speaker transcription (Gemini Live API)
  startSpeakerTranscription: (language: string) => ipcRenderer.invoke("start-speaker-transcription", language),
  stopSpeakerTranscription: () => ipcRenderer.invoke("stop-speaker-transcription"),
  sendSpeakerAudioChunk: (base64Pcm: string) => ipcRenderer.send("speaker-audio-chunk", base64Pcm),
  onSpeakerTranscription: onIpcEvent<{ text: string; isFinal: boolean; timestamp: number }>("speaker-transcription"),
  onSpeakerTranscriptionStatus: onIpcEvent<{ status: string }>("speaker-transcription-status"),

  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args)
} as ElectronAPI)
