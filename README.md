# Hugo Kingsley

**Hugo Kingsley** 是一個離線優先的國際象棋網頁應用程式，可透過 Capacitor 封裝為 Android APK。它包含完整棋規、三檔本地 AI、本機雙人、10 分鐘時計、PGN 匯出與外觀工作室。應用程式不會將 AI 偽裝成真人對手。

## 專案內容

| 項目 | 說明 |
|---|---|
| AI 對弈 | 3 個搜尋深度等級，由獨立 Web Worker 執行，避免阻塞介面。 |
| 本機雙人 | 兩位玩家共用同一台裝置輪流走子。 |
| 離線棋規 | 使用本地 `chess.js` ESM 模組，包含易位、吃過路兵、升變、將死與和棋判定。 |
| 外觀工作室 | 8 組主題、多種棋盤／棋子材質及自訂配色；設定以 `localStorage` 保存。 |
| Android 封裝 | 以 Capacitor 建立 Android 容器，GitHub Actions 可自動產出 APK。 |

> **真人連線對戰並未實作。** 真正線上對弈需要獨立的伺服器端配對、房間、權威時計、棋步驗證和帳號系統；本儲存庫不包含這些服務。

## 目錄結構

```text
hugo-kingsley/
├── .github/workflows/
│   ├── build-apk.yml          # Push / 手動執行時建立 Debug APK
│   └── build-release.yml      # 手動執行的簽章 Release APK
├── scripts/
│   ├── prepare-vendor.mjs     # 將 chess.js 複製到 www/vendor
│   └── verify-project.mjs     # 建置前的必要檔案與離線設定檢查
├── www/
│   ├── ai-worker.js           # 本地 AI 搜尋 Worker
│   ├── index.html             # 單頁前端應用程式
│   └── vendor/                # 建置時生成的本地第三方資源
├── capacitor.config.json
├── package.json
└── LICENSE
```

## 上傳到 GitHub

先在 GitHub 建立一個空白儲存庫，不要勾選自動建立 README 或 `.gitignore`。在本機解壓此專案後，執行：

```bash
git init
git add .
git commit -m "Initial Hugo Kingsley project"
git branch -M main
git remote add origin https://github.com/你的帳號/hugo-kingsley.git
git push -u origin main
```

推送至 `main` 後，**Build Debug APK** 工作流程會自動開始。你也可以進入 GitHub 儲存庫的 **Actions** 分頁，選取該流程並按 **Run workflow** 手動執行。

## 下載 Debug APK

建置成功後，開啟該次 Actions 執行紀錄，在頁面底部的 **Artifacts** 下載 `hugo-kingsley-debug-apk`。解壓後的 `app-debug.apk` 可安裝到 Android 裝置；Android 可能要求你允許該來源安裝未知應用程式。

## 本機開發與建置

請先安裝 Node.js 20 或 22、JDK 21 與 Android SDK。接著執行：

```bash
npm install
npm run prepare-vendor
npm run verify
npm run android:add
npm run sync:android
npm run android:debug
```

Debug APK 位於：

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

若只想在電腦瀏覽器測試，請使用 HTTP 伺服器開啟 `www/`，不要直接雙擊 `index.html`，因為 `file://` 會封鎖 ES Module Worker：

```bash
npx serve www
```

## 建立簽章 Release APK

`build-release.yml` 只可手動觸發，且需要在 GitHub 儲存庫的 **Settings → Secrets and variables → Actions** 設定以下 4 個 Secrets。

| Secret | 內容 |
|---|---|
| `KEYSTORE_B64` | Android keystore 檔案的單行 Base64 內容。 |
| `KEYSTORE_PASSWORD` | Keystore 密碼。 |
| `KEY_ALIAS` | 簽章金鑰別名。 |
| `KEY_PASSWORD` | 該金鑰的密碼。 |

可用以下指令建立 keystore 與 Base64 檔案：

```bash
keytool -genkeypair -v -keystore hugo-kingsley.keystore -alias hugo-kingsley \
  -keyalg RSA -keysize 2048 -validity 10000
base64 -w 0 hugo-kingsley.keystore > keystore.b64
```

請將 `keystore.b64` 的完整內容設為 `KEYSTORE_B64`，並妥善保管 keystore 與所有密碼。遺失正式簽章金鑰會使日後無法對同一 Android 套件更新簽署。

## 可選：棋子字型

應用程式會先嘗試採用系統符號字型。若某些裝置將國際象棋符號顯示為方框，可自行放入：

```text
www/vendor/NotoSansSymbols2-Regular.woff2
```

此檔案被 `.gitignore` 排除，故不會被提交或打包。若你決定把它納入版本控制，請移除 `.gitignore` 內對應的那一行。

## 授權與第三方元件

本專案的原始程式碼採用 MIT 授權。棋規功能使用 [chess.js](https://github.com/jhlywa/chess.js)，其授權條款為 BSD-2-Clause。
