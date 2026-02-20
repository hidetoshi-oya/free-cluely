# [Sponsored by Recall AI - API for desktop recording](https://www.recall.ai/product/desktop-recording-sdk?utm_source=github&utm_medium=sponsorship&utm_campaign=prat011-free-cluely)
If you’re looking for a hosted desktop recording API, consider checking out [Recall.ai](https://www.recall.ai/product/desktop-recording-sdk?utm_source=github&utm_medium=sponsorship&utm_campaign=prat011-free-cluely), an API that records Zoom, Google Meet, Microsoft Teams, in-person meetings, and more.

# Cluely

[Cluely](https://cluely.com) - ミーティング、面接、プレゼン中にリアルタイムでAIサポートを提供する、透明デスクトップアシスタント。

デスクトップ録画APIをお探しなら [Recall.ai](https://www.recall.ai/product/desktop-recording-sdk?utm_source=github&utm_medium=sponsorship&utm_campaign=prat011-free-cluely) をチェック。Zoom、Google Meet、Microsoft Teams等の録画に対応。

## クイックスタート

### 前提条件

- Node.js（最新LTS）
- Git
- **いずれか**: Gemini APIキー（[Google AI Studio](https://makersuite.google.com/app/apikey) で取得）**または** ローカルAI用の [Ollama](https://ollama.ai)

### インストール

```bash
git clone [repository-url]
cd free-cluely

# 通常のインストール
pnpm install

# Sharp/Pythonビルドエラーが出る場合
SHARP_IGNORE_GLOBAL_LIBVIPS=1 pnpm install --ignore-scripts
pnpm rebuild sharp
```

### 環境変数の設定

ルートに `.env` ファイルを作成:

**Gemini（クラウドAI）の場合:**
```env
GEMINI_API_KEY=your_api_key_here
```

**Ollama（ローカルAI）の場合:**
```env
USE_OLLAMA=true
OLLAMA_MODEL=llama3.2
OLLAMA_URL=http://localhost:11434
```

### 起動

```bash
# 開発モード（初回はこちら推奨）
pnpm start

# プロダクションビルド → release/ に出力
pnpm dist
```

## AIプロバイダ

### Ollama（プライバシー重視ならこっち）

- データが外に出ない（100%ローカル処理）
- API費用ゼロ、オフライン動作可
- llama3.2, codellama, mistral等に対応

```bash
# セットアップ
ollama pull llama3.2
```

### Google Gemini

- 最新のAI技術、最速レスポンス
- 複雑なタスクで最高精度
- 要APIキー・インターネット接続、データはGoogleサーバーに送信

## キーボードショートカット

| ショートカット | 動作 |
|---------------|------|
| `Cmd/Ctrl + Shift + Space` | ウィンドウ表示・中央に配置 |
| `Cmd/Ctrl + H` | スクリーンショット撮影 |
| `Cmd/Ctrl + Enter` | ソリューション取得 |
| `Cmd/Ctrl + B` | ウィンドウの表示/非表示切替 |
| `Cmd/Ctrl + R` | キュー全クリア |
| `Cmd/Ctrl + 矢印キー` | ウィンドウ移動 |

## 主な機能

### 透明AIアシスタント
- 半透明・常に最前面のオーバーレイウィンドウ
- グローバルホットキーで即座に表示/非表示
- 全アプリケーション上で動作

### スクリーンショット分析
- `Cmd/Ctrl + H` で画面キャプチャ
- 画像・ドキュメント・プレゼン・コードをAIが即座に分析
- 解説・回答・ソリューションをリアルタイムで返答

### 音声分析
- 音声ファイル・録音の処理
- リアルタイム文字起こし・分析
- ミーティング議事録やコンテンツレビューに最適

### コンテキストチャット
- 画面上のコンテンツについてAIとチャット
- 会話コンテキストを保持
- フォローアップで深掘り

### プライバシーファースト
- Ollamaで100%ローカル処理が可能
- スクリーンショットは処理後に自動削除
- データのトラッキング・保存なし

### クロスプラットフォーム
- **macOS**: ネイティブウィンドウ管理
- **Windows 10/11**: フルサポート
- **Ubuntu/Linux**: 主要ディストリビューション対応

## ユースケース

**学習・アカデミック**
- プレゼン中のリアルタイムサポート
- 翻訳・解説
- 数学・理科の問題解決

**ビジネス**
- 営業コール中の対応支援
- 技術面接のコーチング
- クライアントプレゼンのサポート

**開発**
- エラーメッセージの即座デバッグ
- コード解説・最適化
- アルゴリズム・設計ガイダンス

## 他サービスとの比較

| 項目 | Free Cluely | 商用サービス |
|------|-------------|-------------|
| 費用 | 無料 | $29-99/月 |
| プライバシー | ローカルAI対応 | クラウドのみ |
| オープンソース | 完全公開 | クローズド |
| カスタマイズ | 自由 | 制限あり |
| データ管理 | 自分で管理 | 第三者サーバー |
| オフライン | 可（Ollama） | 不可 |

## 対応AIモデル

- **Gemini 2.0 Flash** - Google最新AI（画像認識対応）
- **Llama 3.2** - Meta製ローカルモデル（Ollama経由）
- **CodeLlama** - コーディング特化
- **Mistral** - 軽量・高速
- **カスタムモデル** - Ollama互換モデル全般

## システム要件

| レベル | スペック |
|--------|---------|
| 最小 | 4GB RAM, デュアルコアCPU, 2GB ストレージ |
| 推奨 | 8GB+ RAM, クアッドコアCPU, 5GB+ ストレージ |
| ローカルAI推奨 | 16GB+ RAM |

## トラブルシューティング

### Sharp/Pythonビルドエラー

```bash
rm -rf node_modules pnpm-lock.yaml
SHARP_IGNORE_GLOBAL_LIBVIPS=1 pnpm install --ignore-scripts
pnpm rebuild sharp
```

### アプリが起動しない

```bash
# ポート5180を使用しているプロセスを確認
lsof -i :5180
kill [PID]
```

Ollamaユーザーは `ollama serve` が起動していることを確認。

### アプリの終了

- `Cmd + Q`（Mac）/ `Ctrl + Q`（Windows/Linux）で終了
- またはActivity Monitor / タスクマネージャーから `Interview Coder` を終了
- Xボタンは現在動作しない（既知の問題）

### その他

1. `node_modules` と `pnpm-lock.yaml` を削除
2. `pnpm install` を再実行
3. `pnpm start` で起動

## コントリビュート

PRを歓迎します！

- バグ修正・安定性向上
- 新機能・AIモデル連携
- ドキュメント改善
- 翻訳・i18n対応
- UI/UX改善

商用連携・カスタム開発については [Twitter](https://x.com/prathitjoshi_) まで。

## ライセンス

ISC License - 個人利用・商用利用ともに無料。

---

`ai-assistant` `meeting-notes` `interview-helper` `presentation-support` `ollama` `gemini-ai` `electron-app` `cross-platform` `privacy-focused` `open-source` `local-ai` `screenshot-analysis`
