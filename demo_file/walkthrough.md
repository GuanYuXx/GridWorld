# 網格世界強化學習實作 (GridWorld RL Implementation)

這項實作已經完全遵循藍圖（Blueprint）中的三大階段與各項核心技術開發完成。

## 系統架構

1. **Phase 1 (網頁後端建立 / 競技場建置)**
   - 使用 **Flask** 作為後端框架。
   - [templates/index.html](file:///c:/Users/absol/MainProject/GridWorld/templates/index.html)：使用 Jinja2 動態渲染 `N x N` 網格，並提供動態滑桿可切換長寬。
   - [static/style.css](file:///c:/Users/absol/MainProject/GridWorld/static/style.css)：套用現代化的科技暗黑風格 (Dark Mode / Glassmorphism) 樣式，提供直觀的視覺體驗。
   - [static/script.js](file:///c:/Users/absol/MainProject/GridWorld/static/script.js)：實作左鍵點擊切換網格狀態（起點、終點、陷阱、障礙物）。
   - **除錯地雷防範**：靜態檔案皆採用 `url_for()` 動態載入，避免路徑寫死的 `404 Error` 發生。

2. **Phase 2 (強化學習與環境互動 / 策略評估非同步渲染)**
   - 使用 jQuery AJAX 以 `POST /calculate` 實作「非同步單次傳遞 (Asynchronous Trap Prevention)」，由前端呼叫單次計算回合，避免伺服器因 `while True` 卡死。
   - 伺服器端實作馬可夫決策過程 (MDP) 核心模型，結合轉移機率 (Noise) 與折現因子 (Discount Factor)。

3. **Phase 3 (尋找最佳策略 / 價值迭代)**
   - 於伺服器端採用標準雙陣列更新（複製當前回合陣列 `new_V = np.copy(V)` 進行 `max_a` 賦值），避免單一阵列迭代覆寫所帶來的數學不正確問題。
   - **動態展示**：前端渲染回傳之數值動態改變背景透明度（類似 Heatmap）與四方策略箭頭（↑, →, ↓, ←）。
   - **策略路徑繪製**：透過策略萃取 (Policy Extraction)，於畫面上動態用 SVG 繪製從 Start 出發的黃綠色「最佳路徑 (Best Path)」，並在 JS 邏輯中設有 `maxSteps` 防呆機制，避免發生陷入撞牆或無窮迴圈的瀏覽器當機。

## 如何運行程式

因為我們使用 Flask，只需要打開終端機，移動到 `GridWorld` 資料夾並啟動：

```bash
cd MainProject\GridWorld
pip install flask numpy
python app.py
```

接著打開瀏覽器存取 `http://127.0.0.1:5000` 即可試玩整套強化學習引擎。

## 核心檔案位置
* [app.py](file:///c:/Users/absol/MainProject/GridWorld/app.py): Flask 與 MDP Python 數學處理引擎
* [templates/index.html](file:///c:/Users/absol/MainProject/GridWorld/templates/index.html): 前端 Jinja UI 與排版結構 
* [static/style.css](file:///c:/Users/absol/MainProject/GridWorld/static/style.css): 樣式、美學設計主題 
* [static/script.js](file:///c:/Users/absol/MainProject/GridWorld/static/script.js): 前端 AJAX 非同步請求處理、網格動態控制與 SVG 路徑繪製邏輯
