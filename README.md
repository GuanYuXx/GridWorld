# GridWorld RL - 強化學習價值迭代展示系統 (Static Version)

![GridWorld Demo](https://github.com/GuanYuXx/GridWorld/raw/main/demo_file/demo_main.gif)

## Overview
這是一個基於瀏覽器的互動式 **GridWorld 強化學習環境** (純靜態前端版本)。
專案藉由視覺化的方式呈現馬可夫決策過程 (Markov Decision Process, MDP) 中的 **價值迭代 (Value Iteration)** 演算法與 **策略萃取 (Policy Extraction)**。
**此 `non_flask` 分支專為 GitHub Pages 部署設計**，將所有原先後端的數學運算完全移植至 JavaScript 執行，無需依賴任何伺服器即可順暢遊玩。

## Project Structure
```text
GridWorld/
├── index.html             # 網站的主入口點 (取代了原先的 Flask templates)
├── static/                # 靜態資源目錄
│   ├── script.js          # 核心邏輯：控制網格互動、包含完整的 Value Iteration 演算法
│   └── style.css          # 視覺設計、深色模式主題與動畫
├── demo_file/             # 展示媒體與問答紀錄
│   ├── demo_main.mp4      
│   ├── demo_short.gif     
│   └── QA_record.md       
└── README.md              # 專案說明文件
```

## Key Features
1. **純前端本地運算**：所有的 Q-values 計算、策略更新皆由 Client 端的 `script.js` 閉環處理，效能極佳。
2. **動態互動網格介面**：支援 5x5 ~ 9x9 大小的靈活網格，透過點擊（Toggle）直覺地繪製各種元件。
3. **單一終點與障礙物防呆機制**：嚴格控管 `N` 的維度，限制障礙物數量上限 (N-2個) 並提供隱藏式的無干擾提示。
4. **即時 RL 參數調整**：支援以滑桿調整折扣因子 `Gamma (γ)`、轉移雜訊 `Noise (b)` 以及步數獎勵 `Step Reward`。
5. **雙模式迭代運算**：支援「單步迭代」詳細觀察狀態價值的漸進擴散過程，或直接一鍵「執行至收斂」。
6. **視覺化策略萃取**：不僅顯示每一格的數值，更以箭頭標示出最優 Policy，並支援生成從起點到終點的實際路徑軌跡。

## 環境需求 (Environment Requirements)
此專案的純前端架構具備極高的相容性。若開發者欲進行源碼修改或使用 Docker 容器化技術發布，建議具備以下環境版本：
*   **HTML5 / CSS3 / JavaScript**: (ES6+ 標準)
*   **Java**: 11+ (若未來需擴充 Java Backend 模組)
*   **Python**: 3.8+ (供 `requirements.txt` 依賴紀錄，以及本地簡易伺服器測試用)

## Deployment (部署至 GitHub Pages)
此分支 (`non_flask`) 滿足 GitHub Pages 的所有靜態網站需求：
1. 進入 Repository 的 **Settings** -> **Pages**。
2. 將 **Source** 分支設定為 `non_flask`。
3. 儲存後，便可獲得能在任何瀏覽器中運行的專屬網址。

## GitHub Pages (線上遊玩)
您可以直接點擊以下連結，在瀏覽器中即時體驗網格繪製與價值迭代的運算過程：
> [👉 前往 GridWorld RL 線上展示頁面](https://guanyuxx.github.io/GridWorld/)
