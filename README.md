# Chrome Extension Sample: GitHub Pages での公開ガイド

このリポジトリは、WXT を使った Chrome 拡張を GitHub Pages 経由で公開・自動更新するまでのフルスタック手順をサンプルとしてまとめています。

---

## 🚀 目次

1. [前提条件](#-前提条件)
2. [ローカルでのビルド](#-ローカルでのビルド)
3. [ブラウザからの ](#-ブラウザからの-pem-鍵生成)[`.pem`](#-ブラウザからの-pem-鍵生成)[ 鍵生成](#-ブラウザからの-pem-鍵生成)
4. [拡張機能 ID の確認](#-拡張機能-id-の確認)
5. [GitHub リポジトリの設定](#-github-リポジトリの設定)
6. [CI/CD (GitHub Actions) の導入](#-cicd-github-actions-の導入)
7. [Chrome Enterprise Core での配布設定](#-chrome-enterprise-core-での配布設定)
8. [ライセンス](#-ライセンス)

---

## 🛠 前提条件

- **Node.js v22** / **npm**
- **VS Code**（またはお好みのエディタ）
- **Google Chrome**（開発モード用）
- **Google Workspace 管理者権限**（Chrome Enterprise Core 経由で配布する場合）

---

## 🔨 ローカルでのビルド

1. リポジトリをクローン
   ```bash
   git clone https://github.com/<ユーザー名>/<リポジトリ名>.git
   cd <リポジトリ名>
   ```
2. 依存ライブラリをインストール
   ```bash
   npm ci
   ```
3. ビルド
   ```bash
   npm run build
   ```
4. 出力先:  `.output/chrome-mv3/` に manifest.json やバンドル済みファイルが生成されます。

---

## 🔑 ブラウザからの `.pem` 鍵生成

開発モードの Chrome から `.crx` と `.pem` を一度手動で作成し、後の CI/CD で同じ鍵を使い回します。

1. Chrome で `chrome://extensions/` を開く
2. 右上の **デベロッパーモード** を ON にする
3. **パッケージ化されていない拡張機能をパック** をクリック
   - 拡張機能のルートに `.output/chrome-mv3/` を指定
   - 秘密鍵ファイル: 空欄で OK → `key.pem` が生成される
4. 生成された `extension.crx` と `key.pem` をローカルに保存

---

## 🆔 拡張機能 ID の確認

1. `extension.crx` をドラッグ＆ドロップで Chrome にインストール
2. `chrome://extensions/` で「ID」を確認
3. 後続の自動更新用マニフェストに使うのでメモしておく

---

## 📦 GitHub リポジトリの設定

### 1. GitHub Pages の有効化

- リポジトリ **Settings > Pages** から、**gh-pages** ブランチを公開ソースに指定

### 2. Secrets / Variables の登録

| 種類              | Key               | Value                         | 用途                                                 |
| --------------- | ----------------- | ----------------------------- | -------------------------------------------------- |
| Secret          | `PRIVATE_KEY_PEM` | `key.pem` を Base64 エンコードした文字列 | Actions 実行時に `key.pem` を復元                         |
| Secret/Variable | `EXTENSION_ID`    | step 3 で確認した拡張機能の ID          | `updates.xml` / `manifest.json` の `update_url` に使用 |

```bash
# mac/linux での Base64 エンコード例
base64 key.pem | pbcopy
```

```powershell
# Windows PowerShell の例
[Convert]::ToBase64String([IO.File]::ReadAllBytes("key.pem")) | clip
```

---

## 🤖 CI/CD (GitHub Actions) の導入

- ワークフロー定義: `.github/workflows/deploy.yml`
- 主な処理フロー:
  1. `checkout` → `npm ci` → `npm run build`
  2. `scripts/sync-manifest-version.cjs` で `package.json` の version を `manifest.json` に反映
  3. 自動で `git add/commit`（バージョンバンプ）
  4. `crx3` で `.crx` を生成（`-p key.pem -o dist/extension-v${VERSION}.crx`）
  5. `updates.xml` を `dist/` に出力
  6. `peaceiris/actions-gh-pages` で `dist/` を `gh-pages` ブランチへデプロイ

**ポイント**:

- `permissions: contents: write` + `persist-credentials: true` で自動コミットを許可
- `PRIVATE_KEY_PEM` を復元し `key.pem` を作成
- `${{ vars.EXTENSION_ID }}`（または `${{ secrets.EXTENSION_ID }}`）を `env:` にセット

---

## 🏢 Chrome Enterprise Core での配布設定

1. **Google 管理コンソール** に管理者でログイン
2. **Apps > Chrome > Apps and extensions** を開く
3. **追加 > Custom app** → **Upload a Chrome extension**
4. 手順 3 で作成した `updates.xml` の URL（例: `https://<ユーザー名>.github.io/<リポジトリ名>/updates.xml`）を指定
5. 必要に応じて対象組織・OU を選択し、ポリシーを公開

これで、管理下の Chrome クライアントへ強制的に拡張機能が配布され、自動更新も有効になります。

---

## 📝 ライセンス

This project is licensed under the MIT License.\
© 2025 marumo
