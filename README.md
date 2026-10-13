# 仙途遠征 · 乾坤界（程式／圖資分離版）

```
index.html            頁面骨架與載入順序
css/style.css         樣式
js/safe-storage.js    localStorage 備援
js/sprite-map.js      圖資描述：精靈圖路徑 + 95 筆圖塊座標（改圖只動這裡與 assets/）
js/core.js            遊戲主體（地圖、3D、戰鬥、存檔）
js/features.js        擴充：法相、神識鎖定、八脈、煉丹…
js/fx-lib.js          Canvas 特效庫（純 2D，不依賴遊戲）
js/fx-bridge.js       把特效接到 attackFx / vatsShot / enemyTurn
js/main.js            啟動
assets/img/           zen / zen2 / zen3 .png（精靈圖）
assets/img/sheets-inline.js   僅 file:// 雙擊開啟時使用的 data-URI 備援
fx-preview.html       特效預覽頁（不用進遊戲即可測試每個角色，請用 http 開啟）
```

## 執行
- 建議：在此資料夾執行 `python3 -m http.server`，開 http://localhost:8000/
- 也可直接雙擊 index.html（file://），會自動改用 sheets-inline.js。
- three.js / rot.js 仍從 CDN 載入，需連網。

## 角色特效（fx-lib.js）
| 角色 | 鍵 | 效果 |
|---|---|---|
| 蜀山弟子 | sword | 青白三道月牙劍痕＋劍氣星火 |
| 妙手醫仙 | heal | 聚氣青蓮靈珠，拋物線飛行，蓮瓣綻放 |
| 靈犬哮天 | dog | 上下利齒合咬＋三道赤紅爪痕＋塵土 |
| 葉空 | talisman | 旋轉黃符，命中浮現「敕」字旋轉法陣 |
| 凌雪 | thunder | 掌心聚電、細雷牽引、九天巨雷落下＋電弧 |
| 趙烈 | dragonfire | 四條蜿蜒火龍飛馳，爆裂火球＋熱浪＋飛灰 |
| 散修劍客 | swordqi | 月牙劍氣破空（殘影），十字交斬 |
| 護法法相 | fa | 金色飛劍自天而降，末位出手光柱沖天 |
| 神識鎖定 | v0/v1/v2 | 準星貫穿／震盪波／四向切痕 |
| 妖魔反擊 | e_claw/slash/fire/poison/dark | 依怪物種類 |

新增角色：在 `fx-bridge.js` 的 `BY_CHAR` 加 emoji → 特效鍵；新特效在 `fx-lib.js` 的 `FXS` 加一個函式即可。
