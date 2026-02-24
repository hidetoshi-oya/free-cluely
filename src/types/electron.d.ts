interface ElectronAPI {
  updateContentDimensions: (dimensions: {
    width: number
    height: number
  }) => Promise<void>
  getScreenshots: () => Promise<Array<{ path: string; preview: string }>>
  deleteScreenshot: (path: string) => Promise<{ success: boolean; error?: string }>
  onScreenshotTaken: (callback: (data: { path: string; preview: string }) => void) => () => void
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
  onSpeakerTranscriptionStatus: (callback: (data: { status: "connected" | "disconnected" }) => void) => () => void

  invoke: (channel: string, ...args: any[]) => Promise<any>
}

interface Window {
  electronAPI: ElectronAPI
}
