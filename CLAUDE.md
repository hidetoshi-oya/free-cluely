# Free Cluely

透明オーバーレイ型のデスクトップAIアシスタント（Electron + React + TypeScript）

## アーキテクチャ

```
electron/          → Electronメインプロセス（Node.js）
  main.ts          → AppState シングルトン（エントリーポイント）
  WindowHelper.ts  → 透明ウィンドウ管理
  ScreenshotHelper → スクリーンショット撮影
  LLMHelper.ts     → AI連携（Gemini / Ollama）
  ProcessingHelper → スクリーンショット・音声の処理オーケストレーション
  ipcHandlers.ts   → IPC通信ハンドラ
  shortcuts.ts     → グローバルショートカット
  prompts/         → AIシステムプロンプト

src/               → Reactレンダラープロセス
  _pages/          → ページコンポーネント（Queue, Solutions）
  components/      → UIコンポーネント（Queue/, Solutions/, ui/）
  types/           → TypeScript型定義
  lib/             → ユーティリティ
```

## テックスタック

- **Runtime**: Electron 33 + Node.js
- **Frontend**: React 18 + TypeScript 5.6 + Vite 5
- **Styling**: TailwindCSS 3 + Radix UI
- **AI**: Google Gemini (`@google/genai`) / Ollama（ローカル）
- **画像処理**: Sharp + screenshot-desktop

## コマンド

| コマンド | 説明 |
|---------|------|
| `pnpm start` | 開発モード起動（Vite + Electron） |
| `pnpm dev` | Vite devサーバーのみ（port 5180） |
| `pnpm build` | プロダクションビルド |
| `pnpm dist` | Electronパッケージング（release/） |
| `pnpm clean` | dist, dist-electron削除 |

## コーディング規約

- **PascalCase**: クラス、Reactコンポーネント
- **camelCase**: 関数、変数
- **SCREAMING_SNAKE_CASE**: 定数（PROCESSING_EVENTS等）
- Helperクラスはモジュール単位で分離（WindowHelper, LLMHelper等）
- IPC通信はipcHandlers.tsに集約
- UIはTailwindユーティリティクラス + Radix UIプリミティブ

## 重要な注意事項

- `.env`にAPIキー（GEMINI_API_KEY等）→ **絶対にコミットしない**
- `renderer/`は旧コード（未使用）→触らない
- tsconfig: `tsconfig.json`（React/Vite用）と `electron/tsconfig.json`（Electron用）は別
- テスト未導入（Jest/Vitest等なし）
