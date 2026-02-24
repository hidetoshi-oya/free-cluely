# Free Cluely

透明オーバーレイ型のデスクトップAIアシスタント（Electron + React + TypeScript）

## アーキテクチャ

```
electron/                      → Electronメインプロセス（Node.js）
  main.ts                      → AppState シングルトン（エントリーポイント）
  ipcHandlers.ts               → IPC通信ハンドラ（全API集約）
  shortcuts.ts                 → グローバルショートカット
  WindowHelper.ts              → 透明ウィンドウ管理
  ScreenshotHelper.ts          → スクリーンショット撮影
  LLMHelper.ts                 → AI連携（Gemini / Ollama）
  ProcessingHelper.ts          → スクリーンショット・音声の処理オーケストレーション
  LiveTranscriptionHelper.ts   → AmiVoice WebSocketリアルタイム文字起こし
  prompts/                     → AIシステムプロンプト

src/                           → Reactレンダラープロセス
  _pages/                      → ページコンポーネント（Queue, Solutions）
  components/                  → UIコンポーネント（Queue/, Solutions/, ui/）
  hooks/                       → カスタムフック（useSpeakerTranscription等）
  types/                       → TypeScript型定義
  lib/                         → ユーティリティ
```

## テックスタック

- **Runtime**: Electron 33 + Node.js
- **Frontend**: React 18 + TypeScript 5.6 + Vite 5
- **Styling**: TailwindCSS 3 + Radix UI
- **AI**: Google Gemini (`@google/genai`) / Ollama（ローカル）
- **音声文字起こし**: AmiVoice Cloud Platform（`ws` WebSocket経由）
- **画像処理**: Sharp + screenshot-desktop
- **テスト**: Vitest（TDD）

## コマンド

| コマンド | 説明 |
|---------|------|
| `pnpm start` | 開発モード起動（Vite + Electron） |
| `pnpm dev` | Vite devサーバーのみ（port 5180） |
| `pnpm build` | プロダクションビルド |
| `pnpm dist` | Electronパッケージング（release/） |
| `pnpm clean` | dist, dist-electron削除 |
| `pnpm test` | テスト実行（watchモード） |
| `pnpm test:run` | テスト実行（単発） |

## コーディング規約

- **PascalCase**: クラス、Reactコンポーネント
- **camelCase**: 関数、変数
- **SCREAMING_SNAKE_CASE**: 定数（PROCESSING_EVENTS等）
- Helperクラスはモジュール単位で分離（1クラス1ファイル）
- IPC通信はipcHandlers.tsに集約
- UIはTailwindユーティリティクラス + Radix UIプリミティブ

## 重要な注意事項

- `.env`にAPIキー（GEMINI_API_KEY, AMIVOICE_APPKEY等）→ **絶対にコミットしない**
- `.env.example`に必要な環境変数テンプレートあり
- `renderer/`は旧コード（未使用）→触らない
- tsconfig: `tsconfig.json`（React/Vite用）と `electron/tsconfig.json`（Electron用）は別
- テスト: Vitest（TDDで開発）

## AmiVoice文字起こし

- `LiveTranscriptionHelper`がAmiVoice Cloud PlatformのWebSocket API（`wss://acp-api.amivoice.com/v1/`）に接続
- 音声フォーマット: LSB16K（16kHz 16bit PCM リトルエンディアン）
- エンジン: `-a2-ja-general`（汎用日本語）
- 自動リトライ: 最大3回、指数バックオフ（1s, 2s, 4s）
- IPC: `start-speaker-transcription`, `stop-speaker-transcription`, `speaker-audio-chunk`
