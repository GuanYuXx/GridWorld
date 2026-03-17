# GridWorld RL (Value Iteration)

## Overview
This project implements a GridWorld environment to demonstrate the core concepts of Reinforcement Learning (RL), specifically focusing on **Value Iteration**. Users can interactively design their own GridWorld by placing a start point, goals, traps, and obstacles. The application visualizes how the State Value Function ($V$) and the corresponding Policy ($\pi$) evolve iteratively based on the Markov Decision Process (MDP) parameters such as Discount Factor ($\gamma$), Transition Noise, and Step Reward. 

## Project Structure
```

```
# GridWorld RL - GitHub Pages Static Version

## 版本目標 (Version Goals)
這個分支 (`non_flask`) 是特別為部署到 **GitHub Pages** 所重構的純前端版本。
原本在 `main` 分支中依賴 Flask (Python Backend) 來處理的「價值迭代算法」數學運算，在這個版本中已完全轉移至前端執行，不再需要 Python 伺服器，**可以直接透過靜態檔案 (HTML/CSS/JS) 運行**。

## 系統架構變更 (Architecture Changes)

---
### 1. 前端邏輯核心 (JavaScript)
後端的數學計算已成功轉移到瀏覽器本地端執行，並改由 JS 動態生成網頁元素。

#### `static/script.js`
- **URL 參數解析**：讀取網址的 `?n=X` 參數來決定網格維度（預設為 5，並進行 `5~9` 的鉗制檢驗）。
- **網格動態生成**：原本由 Flask 產生的 `<div class="cell">` 網格結構，改由 JavaScript 在網頁載入時動態生成並插入到 `#grid` 中。
- **演算法移植**：原本 Python 的 `calculate()` 函數（包含計算 Q-values、Value、Policy、Transitions 的兩層 for 迴圈）已被完整翻譯成 JavaScript 的本地函式 `calculateRLStep()`。
- **本地運算**：不再依賴發送 AJAX API 呼叫給後端，徹底消除網路延遲，提升單步迭代與執行至收斂的運算速度。

---
### 2. 靜態網頁 (HTML)
移除了所有 Flask 的 Jinja 樣板語法 (`{{ ... }}` 和 `{% ... %}`)，成為符合 GitHub Pages 規範的標準 HTML 文件。

#### `index.html`
- 所有 CSS 與 JS 靜態檔案的載入已替換為相對路徑 (`./static/...`)。
- 為了讓 GitHub Pages 能直接讀取作為網站入口，這個檔案已被從 `templates/` 移動至專案的根目錄 `index.html`。

---
### 3. 後端伺服器 (Python)
既然完全轉移為純前端，傳統的 Web 伺服器已不再被需要。

#### `app.py`
- 在此分支中已被刪除。所有強化學習 (Value Iteration) 邏輯皆已轉移至客戶端。

## 部署與測試 (Deployment and Testing)
### GitHub Pages 部署
1. 前往遠端 Repository 的 Settings -> Pages。
2. 尋找 **Build and deployment** > Source。
3. 將來源設定為 Deploy from a branch，並選擇 `non_flask` 這個分支。
4. 儲存後稍等幾分鐘，GitHub 就會分配專屬的網址供任何人線上遊玩。

### 本地測試 (Local Testing)
1. 使用 Python 內建的簡易靜態伺服器來啟動專案目錄：`python -m http.server 8000`。
2. 開啟瀏覽器 `http://localhost:8000/index.html` 即可完整運行。
