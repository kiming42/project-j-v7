/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 擴大地圖、高低差懸崖山洞與格仔分類工坊模組 (survival-highlands-workshop.js - v9.6)
 * 終極修正重點：
 *   1. 【100% 修復紅框檢視器與格仔點擊無反應】：全面改用 HTML 內聯 onclick="Aetheria.HighlandsWorkshop.xxx()"，免疫底層 Emoji 轉圖示器的 innerHTML 重寫！
 *   2. 【100% 修復「⛏️工具」分頁消失】：內建完整 5 大採集工具 (手斧/十字鎬/釣竿/鉤爪/行囊 Lv.0~Lv.3) 升級系統，點擊工具分頁即刻顯示！
 *   3. 【補齊所有加工品像素圖示】：為松脂火把、石英提燈、炸彈、木板、麻繩、藥水補齊專屬圖示映射，不再出現空白格仔
 *   4. 保留 1560x1180 擴大地圖、南側高低差懸崖山洞 (y:800~1070)、怪物防穿懸崖與去標籤化
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  // ================= 1. 注入高低差懸崖地形與修正版格仔工坊 CSS =================
  function injectHighlandsAndWorkshopStyles() {
    if (document.getElementById("highlands-wk-v96-styles")) return;
    const style = document.createElement("style");
    style.id = "highlands-wk-v96-styles";
    style.textContent = `
      /* ================= A. 參考圖風格：L型高低差黃土高台與深啡色垂直懸崖壁 ================= */
      .srpg-plateau-top {
        position: absolute;
        background-color: #c6a664;
        background-image:
          radial-gradient(#b08d4c 15%, transparent 16%),
          radial-gradient(#d8bc7d 15%, transparent 16%);
        background-size: 16px 16px;
        background-position: 0 0, 8px 8px;
        border-top: 5px solid #6e3b1e;
        border-left: 5px solid #6e3b1e;
        border-right: 5px solid #6e3b1e;
        border-radius: 10px 10px 0 0;
        pointer-events: none;
        z-index: 2;
      }
      .srpg-cliff-wall {
        position: absolute;
        background:
          repeating-linear-gradient(
            90deg,
            #7a4424 0px,
            #7a4424 14px,
            #5c3118 14px,
            #5c3118 18px,
            #8c5230 18px,
            #8c5230 28px
          );
        border-top: 4px solid #472411;
        border-bottom: 5px solid #2b1508;
        box-shadow: 0 8px 12px rgba(0, 0, 0, 0.55);
        pointer-events: none;
        z-index: 3;
      }
      .srpg-cliff-side-wall {
        position: absolute;
        background:
          repeating-linear-gradient(
            180deg,
            #6e3b1e 0px,
            #6e3b1e 12px,
            #4f2913 12px,
            #4f2913 16px
          );
        border-left: 3px solid #3b1d0b;
        border-right: 3px solid #3b1d0b;
        pointer-events: none;
        z-index: 3;
      }
      .srpg-cave-arch {
        position: absolute;
        width: 56px;
        height: 46px;
        background: radial-gradient(circle at 50% 65%, #090608 45%, #241418 85%, #472411 100%);
        border: 4px solid #472411;
        border-bottom: none;
        border-radius: 28px 28px 0 0;
        box-shadow: inset 0 6px 12px #000000;
        pointer-events: none;
        z-index: 4;
      }

      .dom-label.ladder-spot-lbl {
        background: linear-gradient(90deg, #5c3824 0%, #8f563b 100%);
        color: #ffd166;
        border: 1.5px solid #f5b700;
        box-shadow: 0 0 6px rgba(245, 183, 0, 0.85);
        font-weight: 900;
      }

      /* ================= B. 修正版格仔分類工坊 UI ================= */
      #panel-modal #modal-body {
        overflow-y: auto !important;
        padding-bottom: 42px !important;
      }
      .wk-top-control-panel {
        background: #141013;
        padding-bottom: 4px;
      }
      .wk-inspector-box {
        background: linear-gradient(180deg, #261c14 0%, #18120e 100%);
        border: 2px solid #f5b700;
        border-radius: 8px;
        padding: 7px 9px;
        margin-bottom: 6px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.8);
        transition: border-color 0.15s ease;
      }
      .wk-subfilter-bar {
        display: flex;
        gap: 4px;
        overflow-x: auto;
        padding-bottom: 4px;
        margin-bottom: 5px;
      }
      .wk-filter-pill {
        background: #1c1619;
        color: #cbd5e1;
        border: 1.5px solid #594950;
        border-radius: 14px;
        padding: 3px 9px;
        font-size: 11px;
        font-weight: 900;
        white-space: nowrap;
        cursor: pointer;
      }
      .wk-filter-pill.active {
        background: #1d3557;
        color: #ffd166;
        border-color: #38b6ff;
      }
      .wk-icon-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
        padding: 2px 2px 44px 2px;
      }
      .wk-grid-cell {
        position: relative;
        background: #181316;
        border: 2px solid #4a3e44;
        border-radius: 7px;
        padding: 16px 4px 6px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        text-align: center;
        cursor: pointer;
        min-height: 70px;
        user-select: none;
        transition: transform 0.1s ease, border-color 0.15s ease;
      }
      .wk-grid-cell:active {
        transform: scale(0.96);
      }
      .wk-grid-cell.can-craft {
        border-color: #5ac54f;
        background: linear-gradient(180deg, #18281c 0%, #141815 100%);
      }
      .wk-grid-cell.selected {
        border-color: #ffd166 !important;
        box-shadow: 0 0 9px rgba(245, 183, 0, 0.85);
        background: linear-gradient(180deg, #332614 0%, #1c150c 100%);
      }
      .wk-cell-badge {
        position: absolute;
        top: 2px;
        right: 3px;
        font-size: 9.5px;
        font-weight: 900;
        padding: 0px 4px;
        border-radius: 4px;
        background: rgba(0,0,0,0.75);
        color: #cbd5e1;
        pointer-events: none;
      }
      .wk-cell-craft-dot {
        position: absolute;
        top: 2px;
        left: 4px;
        font-size: 9px;
        font-weight: 900;
        color: #5ac54f;
        pointer-events: none;
      }
      .wk-cell-name {
        font-size: 11px;
        font-weight: 900;
        color: #ffffff;
        margin-top: 2px;
        line-height: 1.15;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        pointer-events: none;
      }
      .wk-cell-quick-btn {
        margin-top: 3px;
        width: 92%;
        background: #f5b700;
        color: #141013;
        border: 1px solid #000;
        border-radius: 4px;
        padding: 2px 0;
        font-size: 10.5px;
        font-weight: 900;
        cursor: pointer;
        box-shadow: 0 1px 0 #000;
      }
      .wk-mat-chip {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        font-size: 11px;
        font-weight: 900;
        padding: 2px 6px;
        border-radius: 4px;
        margin: 2px 4px 2px 0;
        background: #141013;
        border: 1px solid #4a3e44;
      }
      .wk-mat-chip.ok {
        color: #5ac54f;
        border-color: #5ac54f;
        background: rgba(45, 106, 79, 0.25);
      }
      .wk-mat-chip.lack {
        color: #ff758f;
        border-color: #ff595e;
        background: rgba(157, 2, 8, 0.22);
      }
    `;
    document.head.appendChild(style);
  }

  // ================= 2. 註冊《Survival RPG》像素圖示並補齊所有加工品圖示映射 =================
  function registerSurvivalRpgSprites() {
    const S = window.Aetheria.Data && window.Aetheria.Data.Sprites;
    if (!S || !S.getDataURL) return;

    function buildGridDataUrl(grid, palette) {
      const c = document.createElement("canvas");
      c.width = 16;
      c.height = 16;
      const ctx = c.getContext("2d");
      for (let y = 0; y < 16; y++) {
        const row = grid[y] || "";
        for (let x = 0; x < 16; x++) {
          const ch = row[x];
          if (ch && ch !== "." && palette[ch]) {
            ctx.fillStyle = palette[ch];
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
      return c.toDataURL();
    }

    const clusterBoulderUrl = buildGridDataUrl([
      "....KKKKKK......",
      "...KLLLLLLK.....",
      "..KLGGGGGGGK....",
      "..KLGGGGGGGK....",
      ".KKKKGGGGKKKKKK.",
      "KLLLLKGGKLLLLLLK",
      "KLGGGKGGKLGGGGGK",
      "KLGGGGGGKLGGGGGK",
      "KGGGGGGGGGGGGGGK",
      "KDDDDGGGGDDDDDDK",
      ".KDDDDDDDDDDDDK.",
      "..KKKKKKKKKKKK..",
      "................",
      "................",
      "................",
      "................"
    ], { K: "#2b2623", L: "#9ca3af", G: "#6b7280", D: "#4b5563" });

    const cliffStakeUrl = buildGridDataUrl([
      ".......YY.......",
      "......YYYY......",
      ".....YYKKYY.....",
      "....YYKYYKYY....",
      "......KYYK......",
      "..KK..KYYK..KK..",
      ".KLLK.KYYK.KLLK.",
      ".KDDK..KK..KDDK.",
      ".KDDKYYYYYYKDDK.",
      ".KDDKDDDDDDKDDK.",
      ".KDDK......KDDK.",
      ".KDDK......KDDK.",
      ".KDDK......KDDK.",
      "..KK........KK..",
      "................",
      "................"
    ], { K: "#141013", Y: "#ffd166", L: "#d9a066", D: "#8f563b" });

    const ropeLadderUrl = buildGridDataUrl([
      "..KK........KK..",
      "..KRK......KRK..",
      "..KWWWWWWWWWWK..",
      "..KDDDDDDDDDDK..",
      "..KRK......KRK..",
      "..KRK......KRK..",
      "..KWWWWWWWWWWK..",
      "..KDDDDDDDDDDK..",
      "..KRK......KRK..",
      "..KRK......KRK..",
      "..KWWWWWWWWWWK..",
      "..KDDDDDDDDDDK..",
      "..KRK......KRK..",
      "..KRK......KRK..",
      "..KWWWWWWWWWWK..",
      "..KK........KK.."
    ], { K: "#141013", R: "#d9a066", W: "#f5b700", D: "#8f563b" });

    const torchSpriteUrl = buildGridDataUrl([
      ".......YY.......",
      "......YYYY......",
      ".....YYRRYY.....",
      "....YYRRRRYY....",
      "....YRRRRRRY....",
      ".....YYYYYY.....",
      "......KKKK......",
      "......KDDK......",
      "......KDDK......",
      "......KLLK......",
      "......KDDK......",
      "......KDDK......",
      "......KLLK......",
      "......KDDK......",
      "......KKKK......",
      "................"
    ], { K: "#141013", Y: "#ffd166", R: "#ff595e", D: "#8f563b", L: "#d9a066" });

    const bombSpriteUrl = buildGridDataUrl([
      ".........YY.....",
      "........YYYY....",
      ".......KK.......",
      "......KLLK......",
      "....KKKKKKKK....",
      "...KDDDDDDDDK...",
      "..KDDWWWWDDDDK..",
      "..KDDWDDDDDDDK..",
      "..KDDDDDDDDDDK..",
      "..KDDDDDDDDDDK..",
      "..KDDDDDDDDDDK..",
      "...KDDDDDDDDK...",
      "....KKKKKKKK....",
      "................",
      "................",
      "................"
    ], { K: "#141013", Y: "#ffd166", L: "#d9a066", D: "#334155", W: "#ffffff" });

    const coalUrl = buildGridDataUrl([
      "................",
      ".....KKKKKK.....",
      "...KKDDDDDDKK...",
      "..KDDGGGGGGDDK..",
      ".KDDGKKKKKKGDDK.",
      ".KDGKKKKKKKKGDK.",
      "KDDGKKRRRRKKGDDK",
      "KDGKKRYYYYRKKGDK",
      "KDGKKRRRRRRKKGDK",
      ".KDGKKKKKKKKGDK.",
      ".KDDGGGGGGGGDDK.",
      "..KKDDDDDDDDKK..",
      "....KKKKKKKK....",
      "................",
      "................",
      "................"
    ], { K: "#141013", D: "#2b2623", G: "#475569", R: "#e03c4b", Y: "#ffd166" });

    const rockSaltUrl = buildGridDataUrl([
      ".......KK.......",
      "......KWWK......",
      ".....KWWWWK.....",
      "...KKWCCCCWKK...",
      "..KWWCCCCCCWWK..",
      ".KWWCCCCCCCCWWK.",
      ".KWCCWWWWWWCCWK.",
      "KWWCWWWWWWWWCWWK",
      "KCCCCCCCCCCCCCCK",
      ".KCCCCCCCCCCCCK.",
      "..KKCCCCCCCCKK..",
      "....KKKKKKKK....",
      "................",
      "................",
      "................",
      "................"
    ], { K: "#141013", W: "#ffffff", C: "#cbd5e1" });

    const quartzUrl = buildGridDataUrl([
      ".......KK.......",
      "......KCCK......",
      ".....KCWWCK.....",
      "..KK.KCWWCK.KK..",
      ".KCCKKCWWCKKCCK.",
      ".KCWWCWWWWCWWCK.",
      "KCCWWWWWWWWWWCCK",
      ".KCCWWWWWWWWCCK.",
      "..KCCCCCCCCCCK..",
      "...KKKKKKKKKK...",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ], { K: "#141013", C: "#8ce0ff", W: "#ffffff" });

    const leatherUrl = buildGridDataUrl([
      "..KKKK....KKKK..",
      ".KDDDDKKKKDDDDK.",
      ".KDDDDDDDDDDDDK.",
      "KDDLLLLLLLLLLDDK",
      "KDDLLLLLLLLLLDDK",
      ".KDDLLLLLLLLDDK.",
      "..KDDLLLLLLDDK..",
      "..KDDLLLLLLDDK..",
      ".KDDLLLLLLLLDDK.",
      "KDDLLLLLLLLLLDDK",
      "KDDDDDDDDDDDDDDK",
      ".KDDDDKKKKDDDDK.",
      "..KKKK....KKKK..",
      "................",
      "................",
      "................"
    ], { K: "#141013", D: "#8f563b", L: "#d9a066" });

    const steelIngotUrl = buildGridDataUrl([
      "................",
      "....KKKKKKKK....",
      "...KWWWWWWWWK...",
      "..KWCCCCCCCCWK..",
      ".KWCCCCCCCCCCWK.",
      "KWWWWWWWWWWWWWWK",
      "KGGGGGGGGGGGGGGK",
      "KDDDDDDDDDDDDDDK",
      ".KKKKKKKKKKKKKK.",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ], { K: "#141013", W: "#ffffff", C: "#94a3b8", G: "#64748b", D: "#334155" });

    const jerkyUrl = buildGridDataUrl([
      "................",
      "....KKKKKKKK....",
      "..KKRRRRRRRRKK..",
      ".KRRWWWWWWWWRRK.",
      ".KRRDDDDDDDDRRK.",
      "KRRDDDDDDDDDDRRK",
      "KRRDDWWDDDDDDRRK",
      ".KRRDDDDDDDDRRK.",
      "..KKRRRRRRRRKK..",
      "....KKKKKKKK....",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ], { K: "#141013", R: "#9d0208", D: "#6a040f", W: "#f8fafc" });

    const customUrls = {
      cluster_boulder: clusterBoulderUrl,
      cliff_stake: cliffStakeUrl,
      rope_ladder: ropeLadderUrl,
      mat_ropeLadder: ropeLadderUrl,
      mat_torchItem: torchSpriteUrl,
      mat_bombItem: bombSpriteUrl,
      mat_coal: coalUrl,
      mat_rockSalt: rockSaltUrl,
      mat_quartz: quartzUrl,
      mat_rawHide: leatherUrl,
      mat_curedLeather: leatherUrl,
      mat_steelIngot: steelIngotUrl,
      mat_rationJerky: jerkyUrl
    };

    const origGetDataURL = S.getDataURL.bind(S);
    S.getDataURL = function(key) {
      if (customUrls[key]) return customUrls[key];
      if (key === "mat_potionHeal" || key === "mat_potionHint") return origGetDataURL("icon_potion");
      return origGetDataURL(key);
    };
  }

  // ================= 3. 完整定義《Survival RPG》新素材、加工配方、5大工具與新武防 =================
  const NEW_SRPG_MATERIALS = {
    coal:         { id: "coal",         name: "黑曜木炭",   tier: 1, desc: "【冶煉燃料】由枯枝窯燒或於高台山洞開採，是冶煉百煉精鋼錠與炸藥的核心燃料。" },
    rockSalt:     { id: "rockSalt",     name: "結晶岩鹽",   tier: 1, desc: "【高台礦產】採集自懸崖高台或岩壁礦洞，可醃製長效保存的岩鹽風乾肉脯。" },
    quartz:       { id: "quartz",       name: "透明石英砂", tier: 2, desc: "【高台晶礦】採集自懸崖高台，可用於燒製鍊金藥瓶、探礦提燈與共鳴戰刃。" },
    rawHide:      { id: "rawHide",      name: "荒野獸皮",   tier: 1, desc: "【狩獵戰利品】討伐野外魔物掉落，可加工為堅韌的鞣製硬皮革。" },
    curedLeather: { id: "curedLeather", name: "鞣製硬皮革", tier: 2, desc: "【進階加工材】以獸皮與松脂鞣製而成，用於鍛造高級皮甲與獵刀握柄。" },
    steelIngot:   { id: "steelIngot",   name: "百煉精鋼錠", tier: 2, desc: "【高階冶煉材】以藍晶鐵礦與黑曜木炭高溫鍛打而成，可鍛造精鋼武器或直接打磨強化。" },
    ropeLadder:   { id: "ropeLadder",   name: "攀岩繩梯",   tier: 1, desc: "【高低差開路工具】由麻繩與原木編織而成，可架設在野外懸崖峭壁上攀爬至高台礦區！" },
    rationJerky:  { id: "rationJerky",  name: "風乾肉脯",   tier: 2, desc: "【頂級求生口糧】以岩鹽醃製鮮魚與獸肉，食用立即恢復 +80% 飽食度與 +90 HP！" }
  };

  // ★ 內建完整 5 大採集工具升級資料庫（確保「⛏️工具」分頁 100% 顯示並可升級！）
  const BUILTIN_TOOLS_DB = {
    axe: {
      id: "axe",
      name: "伐木手斧",
      iconKey: "icon_axe",
      tiers: {
        0: { name: "徒手拾荒", desc: "尚未裝備手斧，僅能拾取散落枯枝。" },
        1: { name: "Lv.1 燧石手斧", cost: { branch: 2, flint: 2 }, gold: 0, desc: "可砍伐 1 階翠風原木、堅韌藤蔓、微光菇與琥珀松脂。" },
        2: { name: "Lv.2 精鐵伐木斧", cost: { iron: 2, wood: 2 }, gold: 80, desc: "可砍伐 2 階荒野亞麻、向陽太陽花與極地冰蓮。" },
        3: { name: "Lv.3 流沙秘銀斧", cost: { mithril: 2, plank: 2 }, gold: 220, desc: "可砍伐 3 階黃金世界樹葉與全大陸高階神木！" }
      }
    },
    pickaxe: {
      id: "pickaxe",
      name: "採礦十字鎬",
      iconKey: "icon_pickaxe",
      tiers: {
        0: { name: "徒手拾荒", desc: "尚未裝備十字鎬，僅能拾取燧石、黏土與高台裸露礦脈。" },
        1: { name: "Lv.1 燧石十字鎬", cost: { branch: 2, flint: 2 }, gold: 0, desc: "可開採 1 階藍晶鐵礦脈。" },
        2: { name: "Lv.2 精鐵十字鎬", cost: { iron: 3, wood: 2 }, gold: 80, desc: "可開採 2 階玄武岩塊、流沙秘銀與深海珊瑚。" },
        3: { name: "Lv.3 秘銀破岩鎬", cost: { mithril: 2, basalt: 2 }, gold: 220, desc: "可開採 3 階熔岩黑曜石與深淵星隕鐵！" }
      }
    },
    rod: {
      id: "rod",
      name: "垂釣魚竿",
      iconKey: "fishing_spot",
      tiers: {
        0: { name: "尚未持有魚竿", desc: "製作魚竿後可於各區水波釣魚點進行看準時機垂釣。" },
        1: { name: "Lv.1 翠竹釣魚竿", cost: { wood: 2, vine: 2 }, gold: 0, desc: "解鎖水波釣魚點垂釣功能，可釣起銀鱗鮮魚與河畔黏土。" },
        2: { name: "Lv.2 韌麻海釣竿", cost: { rope: 2, iron: 1 }, gold: 100, desc: "垂釣綠色完美命中區加寬 25%，更容易釣起深海珊瑚！" },
        3: { name: "Lv.3 秘銀大師竿", cost: { mithril: 2, steelCable: 1 }, gold: 240, desc: "垂釣完美命中區大幅加寬，且每次釣魚額外多獲 1 條鮮魚！" }
      }
    },
    hook: {
      id: "hook",
      name: "飛索鉤爪",
      iconKey: "icon_compass",
      tiers: {
        0: { name: "尚未持有鉤爪", desc: "用於跨越峽谷斷崖與險峻地形的輔助工具。" },
        1: { name: "Lv.1 精鐵飛索鉤", cost: { iron: 2, rope: 2 }, gold: 100, desc: "裝備後可快速跨越險峻地形，採集暴擊率 +10%。" },
        2: { name: "Lv.2 秘銀飛索鉤", cost: { mithril: 2, steelCable: 1 }, gold: 240, desc: "頂級探險鉤爪，野外採集額外獲得雙倍收穫機率 +20%！" }
      }
    },
    pouch: {
      id: "pouch",
      name: "探險行囊",
      iconKey: "icon_bag",
      tiers: {
        0: { name: "標準隨身行囊", desc: "基礎探險背包。" },
        1: { name: "Lv.1 亞麻擴容袋", cost: { hemp: 2, rope: 1 }, gold: 100, desc: "強化負重與體魄，永久提升最大生命值 +30！" },
        2: { name: "Lv.2 硬皮遠征袋", cost: { curedLeather: 2, mithril: 1 }, gold: 240, desc: "頂級遠征行囊，永久提升最大生命值 +70，飽食消耗減緩！" }
      }
    }
  };

  const COMPLETE_WORKSHOP_RECIPES = [
    {
      id: "wk_rope_ladder",
      name: "攀岩繩梯 x1",
      category: "explore",
      toKey: "ropeLadder",
      toCount: 1,
      cost: { rope: 1, wood: 2 },
      desc: "【★高低差開路必備】架設於各區南側的深啡色懸崖壁上，即可爬上黃土高台採集稀有礦脈！"
    },
    {
      id: "wk_torch",
      name: "松脂火把 x2",
      category: "explore",
      toKey: "torchItem",
      toCount: 2,
      cost: { branch: 1, resin: 1 },
      desc: "【地牢與黑夜照明】點燃後照亮黑霧地牢，並在黑夜戰鬥直接燒毀夜魔 1 層暗夜護盾！"
    },
    {
      id: "wk_quartz_lantern",
      name: "石英探礦提燈 (火把x4)",
      category: "explore",
      toKey: "torchItem",
      toCount: 4,
      cost: { iron: 1, quartz: 1, coal: 1 },
      desc: "【★新配方・強光照明】以鐵礦、石英砂與木炭打造，一次產出相當於 4 支火把的長效照明！"
    },
    {
      id: "wk_bomb",
      name: "爆破炸彈 x2",
      category: "explore",
      toKey: "bombItem",
      toCount: 2,
      cost: { flint: 2, clay: 1, resin: 1 },
      desc: "【秘境開路】可炸開各區與荒島地牢的「裂縫岩壁」開啟隱藏秘寶箱！"
    },
    {
      id: "wk_coal_bomb",
      name: "黑火藥重型炸彈 x3",
      category: "explore",
      toKey: "bombItem",
      toCount: 3,
      cost: { coal: 2, flint: 1, clay: 1 },
      desc: "【★新配方・高效爆破】以黑曜木炭調配黑火藥，一次大量製造 3 顆爆破炸彈！"
    },
    {
      id: "wk_charcoal",
      name: "窯燒黑木炭 x2",
      category: "smelt",
      toKey: "coal",
      toCount: 2,
      cost: { branch: 3 },
      desc: "【★新配方・基礎冶煉】將 3 根散落枯枝悶燒成 2 塊高熱能黑曜木炭，用於冶煉精鋼錠。"
    },
    {
      id: "wk_steel_ingot",
      name: "百煉精鋼錠 x1",
      category: "smelt",
      toKey: "steelIngot",
      toCount: 1,
      cost: { iron: 2, coal: 2 },
      desc: "【★新配方・高溫冶煉】以鐵礦 x2 與黑曜木炭 x2 鍛造成精鋼錠（可造新武器，或按「使用強化」永久 ATK+4！）。"
    },
    {
      id: "wk_cured_leather",
      name: "鞣製硬皮革 x1",
      category: "smelt",
      toKey: "curedLeather",
      toCount: 1,
      cost: { rawHide: 2, resin: 1 },
      desc: "【★新配方・皮革加工】將荒野獸皮與松脂鞣製成硬皮革（可造新皮甲，或按「使用強化」永久 DEF+3 / HP+12！）。"
    },
    {
      id: "wk_plank",
      name: "加工厚木板 x1",
      category: "smelt",
      toKey: "plank",
      toCount: 1,
      cost: { wood: 2 },
      desc: "【工程建材】將 2 塊翠風原木裁切為堅固的厚木板，用於修橋與升級大帆船。"
    },
    {
      id: "wk_rope",
      name: "強化麻繩索 x1",
      category: "smelt",
      toKey: "rope",
      toCount: 1,
      cost: { vine: 2 },
      desc: "【工程建材】將 2 條堅韌藤蔓編織為麻繩索，是製作【攀岩繩梯】與吊橋的必備材料。"
    },
    {
      id: "wk_rope_hemp",
      name: "亞麻編織繩 x2",
      category: "smelt",
      toKey: "rope",
      toCount: 2,
      cost: { hemp: 2 },
      desc: "【高效製繩】以峽谷荒野亞麻一次編織出 2 條強韌麻繩索。"
    },
    {
      id: "wk_pitch",
      name: "防水松脂膠 x1",
      category: "smelt",
      toKey: "pitch",
      toCount: 1,
      cost: { resin: 2, clay: 1 },
      desc: "【造船建材】混合琥珀松脂與河畔黏土熬製的防水塗料。"
    },
    {
      id: "wk_nails",
      name: "鍛造鐵釘 x2",
      category: "smelt",
      toKey: "nails",
      toCount: 2,
      cost: { iron: 1 },
      desc: "【工程建材】將藍晶鐵礦鍛打為工程鐵釘。"
    },
    {
      id: "wk_steel_cable",
      name: "秘銀強化鋼索 x1",
      category: "smelt",
      toKey: "steelCable",
      toCount: 1,
      cost: { mithril: 1, rope: 1 },
      desc: "【高階建材】融合流沙秘銀與麻繩索打造的超強韌鋼索。"
    },
    {
      id: "wk_heavy_sail",
      name: "防風重帆布 x1",
      category: "smelt",
      toKey: "heavySail",
      toCount: 1,
      cost: { sailCloth: 2, rope: 1 },
      desc: "【遠航建材】縫合幽靈古帆布與麻繩，用於建造破浪遠洋大帆船。"
    },
    {
      id: "wk_warm_fur",
      name: "禦寒獸毛氈 x1",
      category: "smelt",
      toKey: "warmFur",
      toCount: 1,
      cost: { sinew: 2, hemp: 1 },
      desc: "【極地建材】搭建雪原防風避難屋與高階防寒護甲的保暖毛氈。"
    },
    {
      id: "wk_ration_jerky",
      name: "岩鹽風乾肉脯 x2",
      category: "survival",
      toKey: "rationJerky",
      toCount: 2,
      cost: { fish: 1, rockSalt: 1 },
      desc: "【★新配方・頂級口糧】以高台結晶岩鹽醃製鮮魚，食用每份恢復 +80% 飽食度與 +90 HP！"
    },
    {
      id: "wk_ration_herb",
      name: "烘烤微光菇乾 x2",
      category: "survival",
      toKey: "rationHerb",
      toCount: 2,
      cost: { herb: 1, branch: 1 },
      desc: "【基礎口糧】食用每份可恢復 +35% 飽食度與 +25 HP。"
    },
    {
      id: "wk_ration_fish",
      name: "炭烤鮮魚乾 x2",
      category: "survival",
      toKey: "rationFish",
      toCount: 2,
      cost: { fish: 1, branch: 1 },
      desc: "【進階口糧】食用每份可恢復 +60% 飽食度與 +60 HP。"
    },
    {
      id: "wk_alchemy_heal",
      name: "精煉生命藥水 x2",
      category: "survival",
      toKey: "potionHeal",
      toCount: 2,
      cost: { herb: 2, quartz: 1 },
      desc: "【★新配方・隨身鍊金】以微光菇 x2 與高台石英砂燒製的玻璃瓶，免費提煉 2 瓶生命藥水！"
    },
    {
      id: "wk_alchemy_hint",
      name: "精煉洞察藥水 x2",
      category: "survival",
      toKey: "potionHint",
      toCount: 2,
      cost: { flower: 1, resin: 1, quartz: 1 },
      desc: "【★新配方・隨身鍊金】以太陽花、松脂與高台石英砂提煉 2 瓶洞察藥水！"
    }
  ];

  const NEW_SRPG_WEAPONS = {
    w_srpg_machete: {
      id: "w_srpg_machete",
      name: "荒野開山獵刀",
      tier: 2,
      atk: 34,
      gold: 120,
      cost: { steelIngot: 2, curedLeather: 1, wood: 2 },
      desc: "【★新配方武器】以百煉精鋼錠與鞣製硬皮革打造的求生獵刀，兼具高攻擊力與破盾手感！"
    },
    w_srpg_quartz_blade: {
      id: "w_srpg_quartz_blade",
      name: "石英共鳴戰刃",
      tier: 3,
      atk: 56,
      gold: 260,
      cost: { steelIngot: 3, quartz: 3, mithril: 2 },
      desc: "【★新配方武器】將透明石英砂熔入精鋼與秘銀鍛造的晶刃，大幅提升知識詠唱威力！"
    },
    w_srpg_highland_axe: {
      id: "w_srpg_highland_axe",
      name: "高原破岩巨斧",
      tier: 4,
      atk: 82,
      gold: 450,
      cost: { steelIngot: 4, obsidian: 2, curedLeather: 2 },
      desc: "【★新配方武器】結合精鋼錠與熔岩黑曜石的重型戰斧，擁有摧枯拉朽的破壞力！"
    }
  };

  const NEW_SRPG_ARMORS = {
    a_srpg_leather: {
      id: "a_srpg_leather",
      name: "荒野硬化皮甲",
      tier: 2,
      def: 18,
      hp: 50,
      gold: 110,
      cost: { curedLeather: 2, rope: 1 },
      desc: "【★新配方防具】以鞣製硬皮革縫製的輕便獵裝，大幅提升野外生存力（DEF+18 / HP+50）。"
    },
    a_srpg_steel_mail: {
      id: "a_srpg_steel_mail",
      name: "百煉精鋼鎖甲",
      tier: 3,
      def: 34,
      hp: 95,
      gold: 250,
      cost: { steelIngot: 3, curedLeather: 2 },
      desc: "【★新配方防具】精鋼環扣內襯硬皮革的中階重甲，堅不可摧（DEF+34 / HP+95）。"
    },
    a_srpg_highland_plate: {
      id: "a_srpg_highland_plate",
      name: "高原守護重鎧",
      tier: 4,
      def: 52,
      hp: 150,
      gold: 420,
      cost: { steelIngot: 4, quartz: 3, obsidian: 2 },
      desc: "【★新配方防具】鑲嵌高台石英與黑曜石的精鋼全套重鎧（DEF+52 / HP+150）！"
    }
  };

  function registerSrpgDataIntoGame() {
    const Data = window.Aetheria.Data;
    if (!Data) return;

    if (Data.MATERIALS) {
      Object.keys(NEW_SRPG_MATERIALS).forEach(function(k) {
        Data.MATERIALS[k] = NEW_SRPG_MATERIALS[k];
      });
    }

    if (Data.WEAPONS) {
      Object.keys(NEW_SRPG_WEAPONS).forEach(function(wk) {
        Data.WEAPONS[wk] = NEW_SRPG_WEAPONS[wk];
      });
    }

    if (Data.ARMORS) {
      Object.keys(NEW_SRPG_ARMORS).forEach(function(ak) {
        Data.ARMORS[ak] = NEW_SRPG_ARMORS[ak];
      });
    }

    if (Array.isArray(Data.WORKSHOP_RECIPES)) {
      COMPLETE_WORKSHOP_RECIPES.forEach(function(rec) {
        if (!Data.WORKSHOP_RECIPES.some(function(r) { return r.id === rec.id; })) {
          Data.WORKSHOP_RECIPES.push(rec);
        }
      });
    } else if (Data.WORKSHOP_RECIPES && typeof Data.WORKSHOP_RECIPES === "object") {
      COMPLETE_WORKSHOP_RECIPES.forEach(function(rec) {
        if (!Data.WORKSHOP_RECIPES[rec.id]) {
          Data.WORKSHOP_RECIPES[rec.id] = rec;
        }
      });
    } else {
      Data.WORKSHOP_RECIPES = COMPLETE_WORKSHOP_RECIPES.slice();
    }
  }

  // ================= 4. 擴大地圖尺寸至 1560x1180，將高低差懸崖設於 y:800~1070 =================
  const HIGHLAND_ZONES = {
    zone1_forest:   { targetW: 1560, targetH: 1180, ores: ["iron", "rockSalt", "quartz", "coal"],        grottoOres: ["coal", "iron", "rockSalt", "quartz"] },
    cave1_mushroom: { targetW: 1480, targetH: 1140, ores: ["coal", "mithril", "quartz", "rockSalt"],     grottoOres: ["coal", "mithril", "quartz", "basalt"] },
    zone2_canyon:   { targetW: 1560, targetH: 1180, ores: ["mithril", "quartz", "rockSalt", "coal"],     grottoOres: ["coal", "mithril", "quartz", "basalt"] },
    zone3_coast:    { targetW: 1560, targetH: 1180, ores: ["coral", "rockSalt", "quartz", "coal"],       grottoOres: ["coal", "coral", "rockSalt", "mithril"] },
    zone4_snow:     { targetW: 1560, targetH: 1180, ores: ["obsidian", "rockSalt", "quartz", "mithril"], grottoOres: ["coal", "obsidian", "quartz", "mithril"] },
    zone5_volcano:  { targetW: 1560, targetH: 1180, ores: ["starIron", "obsidian", "coal", "quartz"],    grottoOres: ["coal", "starIron", "obsidian", "quartz"] },
    zone6_sky:      { targetW: 1560, targetH: 1180, ores: ["starIron", "goldLeaf", "quartz", "obsidian"],grottoOres: ["starIron", "obsidian", "quartz", "mithril"] }
  };

  const grottoMapsCache = {};

  function buildCliffGrottoMap(parentZoneId) {
    const cfg = HIGHLAND_ZONES[parentZoneId] || HIGHLAND_ZONES.zone1_forest;
    const matsDB = (window.Aetheria.Data && window.Aetheria.Data.MATERIALS) || {};
    const parentMap = (window.Aetheria.Data && window.Aetheria.Data.Maps && window.Aetheria.Data.Maps.getMap(parentZoneId)) || { recLv: 3, name: "野外" };

    const nodes = [];
    const orePositions = [
      { x: 130, y: 110 }, { x: 240, y: 95 },  { x: 350, y: 110 },
      { x: 145, y: 195 }, { x: 335, y: 195 }, { x: 240, y: 145 }
    ];

    orePositions.forEach(function(pt, idx) {
      const giveKey = cfg.grottoOres[idx % cfg.grottoOres.length];
      const mInfo = matsDB[giveKey] || { name: giveKey };
      nodes.push({
        id: "grotto_node_" + parentZoneId + "_" + idx + "_" + Date.now(),
        x: pt.x,
        y: pt.y,
        type: "crystal",
        giveKey: giveKey,
        reqTool: "pickaxe",
        reqToolLv: 0,
        perfect: (idx % 2 === 0),
        isClusterBoulder: true,
        name: mInfo.name,
        opened: false
      });
    });

    return {
      id: "grotto_" + parentZoneId,
      parentZoneId: parentZoneId,
      _refreshToken: Date.now(),
      name: "岩壁礦洞",
      recLv: parentMap.recLv || 3,
      bgm: "cave",
      theme: "cave",
      rain: false,
      fog: false,
      hasRiver: false,
      width: 480,
      height: 320,
      dirtBlobs: [{ cx: 240, cy: 155, rx: 185, ry: 110 }],
      trees: [],
      decos: [
        { x: 185, y: 78, sprite: "brazier_on", w: 24, h: 26, solid: true },
        { x: 295, y: 78, sprite: "brazier_on", w: 24, h: 26, solid: true }
      ],
      nodes: nodes,
      npcs: [],
      monsters: [],
      portals: [
        {
          id: "p_exit_grotto_" + parentZoneId,
          name: "離開山洞 ▾",
          x: 240,
          y: 278,
          targetZone: parentZoneId,
          targetX: 495,
          targetY: 995,
          icon: "stairs"
        }
      ]
    };
  }

  function isInsideHighlandPlateau(x, y) {
    const inTopWing   = (x >= 395 && x <= 895 && y >= 802 && y <= 920);
    const inRightWing = (x >= 715 && x <= 895 && y >= 915 && y <= 1058);
    return inTopWing || inRightWing;
  }

  function isBlockedByCliffFromLowland(x, y) {
    if (x >= 385 && x <= 710 && y >= 795 && y <= 965) return true;
    if (x >= 705 && x <= 910 && y >= 795 && y <= 1098) return true;
    return false;
  }

  function injectHighlandCliffIntoMap(mapObj) {
    if (!mapObj || !HIGHLAND_ZONES[mapObj.id]) return mapObj;
    const token = mapObj._refreshToken || "init";
    if (mapObj._highlandInjectedToken === token) return mapObj;
    mapObj._highlandInjectedToken = token;

    const cfg = HIGHLAND_ZONES[mapObj.id];
    const matsDB = (window.Aetheria.Data && window.Aetheria.Data.MATERIALS) || {};
    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
    const rigged = Boolean(s.riggedCliffs && s.riggedCliffs[mapObj.id]);

    const oldW = mapObj._origBaseWidth || mapObj.width || 1200;
    const oldH = mapObj._origBaseHeight || mapObj.height || 680;
    mapObj._origBaseWidth = oldW;
    mapObj._origBaseHeight = oldH;

    mapObj.width = Math.max(oldW, cfg.targetW);
    mapObj.height = Math.max(oldH, cfg.targetH);

    if (mapObj.trees) {
      mapObj.trees = mapObj.trees.filter(function(t) {
        if (t.isExpandedPerimeterTree) return false;
        if (t.y >= oldH - 72) return false;
        if (t.x >= oldW - 68) return false;
        if (t.x >= 180 && t.x <= 960 && t.y >= 740 && t.y <= 1120) return false;
        return true;
      });

      for (let bx = 20; bx < mapObj.width - 20; bx += 42) {
        if (mapObj.hasRiver && Math.abs(bx - (mapObj.riverX || 1030)) < 48) continue;
        mapObj.trees.push({ x: bx, y: mapObj.height - 42, isExpandedPerimeterTree: true });
        if (bx >= oldW - 40) {
          mapObj.trees.push({ x: bx, y: 18, isExpandedPerimeterTree: true });
        }
      }
      for (let by = 58; by < mapObj.height - 42; by += 42) {
        mapObj.trees.push({ x: mapObj.width - 42, y: by, isExpandedPerimeterTree: true });
        if (by >= oldH - 40) {
          mapObj.trees.push({ x: 18, y: by, isExpandedPerimeterTree: true });
        }
      }
      mapObj.trees.push(
        { x: 345, y: 1065, isExpandedPerimeterTree: true },
        { x: 405, y: 1080, isExpandedPerimeterTree: true }
      );
    }

    if (mapObj.monsters) {
      mapObj.monsters.forEach(function(m) {
        if (!m.isBoss && isBlockedByCliffFromLowland(m.x, m.y)) {
          m.x = 240;
          m.y = 920;
          m.homeX = 240;
          m.homeY = 920;
        }
      });
    }

    mapObj.dirtBlobs = (mapObj.dirtBlobs || []).filter(function(b) { return !b.isExpandedBlob; });
    mapObj.dirtBlobs.push(
      { cx: 280,  cy: 820,  rx: 95,  ry: 210, isExpandedBlob: true },
      { cx: 520,  cy: 1025, rx: 195, ry: 75,  isExpandedBlob: true },
      { cx: 1320, cy: 380,  rx: 145, ry: 190, isExpandedBlob: true },
      { cx: 1280, cy: 860,  rx: 155, ry: 140, isExpandedBlob: true }
    );

    mapObj.decos = (mapObj.decos || []).filter(function(d) { return !d.isHighlandElement; });
    mapObj.nodes = (mapObj.nodes || []).filter(function(n) { return !n.isHighlandOre; });
    mapObj.portals = (mapObj.portals || []).filter(function(p) { return !p.isCliffCavePortal; });

    mapObj.portals.push({
      id: "p_cliff_cave_" + mapObj.id,
      name: "山洞",
      x: 495,
      y: 948,
      targetZone: "grotto_" + mapObj.id,
      targetX: 240,
      targetY: 235,
      icon: "abyss",
      isCliffCavePortal: true
    });

    mapObj.decos.push(
      {
        id: "cliff_ladder_north_" + mapObj.id,
        x: 560,
        y: 800,
        sprite: rigged ? "rope_ladder" : "cliff_stake",
        w: 30,
        h: 38,
        solid: false,
        isHighlandElement: true,
        isCliffLadderSpot: true,
        ladderSide: "north",
        zoneId: mapObj.id,
        ladderTitle: rigged ? "🧗繩梯(上下)" : "🧗架設繩梯"
      },
      {
        id: "cliff_ladder_south_" + mapObj.id,
        x: 625,
        y: 940,
        sprite: rigged ? "rope_ladder" : "cliff_stake",
        w: 30,
        h: 46,
        solid: false,
        isHighlandElement: true,
        isCliffLadderSpot: true,
        ladderSide: "south",
        zoneId: mapObj.id,
        ladderTitle: rigged ? "🧗繩梯(上下)" : "🧗架設繩梯"
      }
    );

    const plateauOreCoords = [
      { x: 485, y: 845 },
      { x: 655, y: 870 },
      { x: 785, y: 940 },
      { x: 785, y: 1015 }
    ];

    plateauOreCoords.forEach(function(pt, idx) {
      const giveKey = cfg.ores[idx % cfg.ores.length];
      const mInfo = matsDB[giveKey] || { name: giveKey };
      mapObj.nodes.push({
        id: "hl_ore_" + mapObj.id + "_" + idx + "_" + token,
        x: pt.x,
        y: pt.y,
        type: "crystal",
        giveKey: giveKey,
        reqTool: "pickaxe",
        reqToolLv: 0,
        perfect: true,
        isHighlandOre: true,
        isClusterBoulder: true,
        reqHighland: true,
        name: "高台" + mInfo.name,
        opened: false
      });
    });

    const extraExpansionCoords = [
      { x: 210,  y: 860,  key: "coal",     type: "crystal" },
      { x: 260,  y: 1020, key: "rockSalt", type: "crystal" },
      { x: 1240, y: 260,  key: "quartz",   type: "crystal" },
      { x: 1380, y: 440,  key: "coal",     type: "crystal" },
      { x: 1320, y: 760,  key: "rockSalt", type: "crystal" },
      { x: 1220, y: 960,  key: "quartz",   type: "crystal" }
    ];
    extraExpansionCoords.forEach(function(ec, idx) {
      const mInfo = matsDB[ec.key] || { name: ec.key };
      mapObj.nodes.push({
        id: "exp_srpg_node_" + mapObj.id + "_" + idx + "_" + token,
        x: ec.x,
        y: ec.y,
        type: ec.type,
        giveKey: ec.key,
        reqTool: "pickaxe",
        reqToolLv: 0,
        perfect: false,
        isHighlandOre: true,
        isClusterBoulder: true,
        reqHighland: false,
        name: mInfo.name,
        opened: false
      });
    });

    return mapObj;
  }

  // ================= 5. 全新格仔化分類工坊系統（100% 內聯 onclick 免疫重寫 + 內建 5 大工具） =================
  const WorkshopUIManager = {
    curTab: "workshop",
    curSubFilter: "all",
    selectedItemId: null,
    savedScrollTop: 0,
    currentFilteredMap: {},

    canAffordRecipe: function(s, costMap, goldCost) {
      if (goldCost && (s.gold || 0) < goldCost) return false;
      if (!costMap) return true;
      return Object.entries(costMap).every(function(entry) {
        return ((s.inventory && s.inventory[entry[0]]) || 0) >= entry[1];
      });
    },

    getRecipeSubCategory: function(rec) {
      if (rec.category) return rec.category;
      const id = String(rec.id || "");
      if (id.indexOf("torch") !== -1 || id.indexOf("bomb") !== -1 || id.indexOf("ladder") !== -1 || id.indexOf("lantern") !== -1) {
        return "explore";
      }
      if (id.indexOf("ration") !== -1 || id.indexOf("heal") !== -1 || id.indexOf("hint") !== -1 || id.indexOf("jerky") !== -1) {
        return "survival";
      }
      return "smelt";
    },

    // ★ 供 HTML 內聯 onclick 直接呼叫的 4 個公開方法（不受 MutationObserver 重寫影響！）
    switchTab: function(tabId) {
      if (window.Aetheria.Audio && window.Aetheria.Audio.sfxTalkBlip) window.Aetheria.Audio.sfxTalkBlip();
      this.curTab = tabId;
      this.curSubFilter = "all";
      this.selectedItemId = null;
      this.savedScrollTop = 0;
      this.renderGridWorkshopModal(tabId);
    },

    switchFilter: function(filterId) {
      if (window.Aetheria.Audio && window.Aetheria.Audio.sfxTalkBlip) window.Aetheria.Audio.sfxTalkBlip();
      this.curSubFilter = filterId;
      this.selectedItemId = null;
      this.savedScrollTop = 0;
      this.renderGridWorkshopModal(this.curTab);
    },

    selectItem: function(uid) {
      if (window.Aetheria.Audio && window.Aetheria.Audio.sfxTalkBlip) window.Aetheria.Audio.sfxTalkBlip();
      const body = document.getElementById("modal-body");
      if (body) this.savedScrollTop = body.scrollTop;
      this.selectedItemId = uid;
      this.renderGridWorkshopModal(this.curTab);
    },

    craftOrAct: function(uid) {
      const targetUid = uid || this.selectedItemId;
      const item = this.currentFilteredMap[targetUid];
      if (!item) return;
      this.selectedItemId = targetUid;
      this.executePrimaryItemAction(item);
    },

    executeCraftRecipe: function(rec) {
      const s = window.Aetheria.State.data;
      if (!rec) return;

      if (!this.canAffordRecipe(s, rec.cost, rec.goldCost || 0)) {
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.showToast("⚠️ 合成材料不足！請查看紅框檢視盒中標示紅色的材料。");
        return;
      }

      Object.entries(rec.cost || {}).forEach(function(entry) {
        s.inventory[entry[0]] = Math.max(0, (s.inventory[entry[0]] || 0) - entry[1]);
      });
      if (rec.goldCost) {
        s.gold = Math.max(0, (s.gold || 0) - rec.goldCost);
      }

      const outKey = rec.toKey || rec.giveKey || rec.outKey;
      const outCnt = rec.toCount || rec.count || rec.qty || 1;
      if (outKey) {
        s.inventory[outKey] = (s.inventory[outKey] || 0) + outCnt;
      }

      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      window.Aetheria.UI.updateAllHud();
      window.Aetheria.UI.showToast("🔨 合成成功！獲得【" + rec.name + "】！");
    },

    executePrimaryItemAction: function(selectedObj) {
      const s = window.Aetheria.State.data;
      const UI = window.Aetheria.UI;
      if (!selectedObj) return;

      const modalBody = document.getElementById("modal-body");
      if (modalBody) this.savedScrollTop = modalBody.scrollTop;

      if (selectedObj.itemType === "recipe") {
        this.executeCraftRecipe(selectedObj.raw);
        this.renderGridWorkshopModal(this.curTab);
        return;
      }

      if (selectedObj.itemType === "tool") {
        if (selectedObj.isMax) return;
        if (!selectedObj.canCraft) {
          window.Aetheria.Audio.sfxWrong();
          UI.showToast("⚠️ 升級此工具的材料或金幣不足！");
          return;
        }
        const tKey = selectedObj.toolKey;
        if (!s.tools) s.tools = { axe: 0, pickaxe: 0, rod: 0, hook: 0, pouch: 0 };
        Object.entries(selectedObj.costMap || {}).forEach(function(entry) {
          s.inventory[entry[0]] = Math.max(0, (s.inventory[entry[0]] || 0) - entry[1]);
        });
        if (selectedObj.goldCost) {
          s.gold = Math.max(0, (s.gold || 0) - selectedObj.goldCost);
        }
        s.tools[tKey] = (s.tools[tKey] || 0) + 1;
        window.Aetheria.State.recalcMaxHp();
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.State.save();
        UI.updateAllHud();
        UI.showToast("⛏️ 工具升級成功！【" + selectedObj.shortName + "】已升至 Lv." + s.tools[tKey] + "！");
        this.renderGridWorkshopModal(this.curTab);
        return;
      }

      if (selectedObj.itemType === "weapon") {
        const wId = selectedObj.uid;
        if (selectedObj.unlocked) {
          s.equippedWeapon = wId;
          window.Aetheria.Audio.sfxGather();
          window.Aetheria.State.save();
          UI.updateAllHud();
          UI.showToast("⚔️ 已裝備武器：【" + selectedObj.shortName + "】！");
        } else {
          if (!selectedObj.canCraft) {
            window.Aetheria.Audio.sfxWrong();
            UI.showToast("⚠️ 鍛造此武器的材料或金幣不足！");
            return;
          }
          Object.entries(selectedObj.costMap || {}).forEach(function(entry) {
            s.inventory[entry[0]] -= entry[1];
          });
          if (selectedObj.goldCost) s.gold -= selectedObj.goldCost;
          if (!s.unlockedWeapons) s.unlockedWeapons = [];
          if (s.unlockedWeapons.indexOf(wId) === -1) s.unlockedWeapons.push(wId);
          s.equippedWeapon = wId;
          window.Aetheria.Audio.sfxLevelUp();
          window.Aetheria.State.save();
          UI.updateAllHud();
          UI.showToast("⚔️ 武器鍛造成功並已自動裝備：【" + selectedObj.shortName + "】！");
        }
        this.renderGridWorkshopModal(this.curTab);
        return;
      }

      if (selectedObj.itemType === "armor") {
        const aId = selectedObj.uid;
        if (selectedObj.unlocked) {
          s.equippedArmor = aId;
          window.Aetheria.State.recalcMaxHp();
          window.Aetheria.Audio.sfxGather();
          window.Aetheria.State.save();
          UI.updateAllHud();
          UI.showToast("🛡️ 已穿戴防具：【" + selectedObj.shortName + "】！");
        } else {
          if (!selectedObj.canCraft) {
            window.Aetheria.Audio.sfxWrong();
            UI.showToast("⚠️ 鍛造此防具的材料或金幣不足！");
            return;
          }
          Object.entries(selectedObj.costMap || {}).forEach(function(entry) {
            s.inventory[entry[0]] -= entry[1];
          });
          if (selectedObj.goldCost) s.gold -= selectedObj.goldCost;
          if (!s.unlockedArmors) s.unlockedArmors = [];
          if (s.unlockedArmors.indexOf(aId) === -1) s.unlockedArmors.push(aId);
          s.equippedArmor = aId;
          window.Aetheria.State.recalcMaxHp();
          s.hp = s.maxHp;
          window.Aetheria.Audio.sfxLevelUp();
          window.Aetheria.State.save();
          UI.updateAllHud();
          UI.showToast("🛡️ 防具鍛造成功並已穿戴：【" + selectedObj.shortName + "】！");
        }
        this.renderGridWorkshopModal(this.curTab);
        return;
      }

      if (selectedObj.itemType === "relic") {
        if (selectedObj.unlocked) return;
        if (!selectedObj.canCraft) {
          window.Aetheria.Audio.sfxWrong();
          UI.showToast("⚠️ 合成此聖物的材料或金幣不足！");
          return;
        }
        Object.entries(selectedObj.costMap || {}).forEach(function(entry) {
          s.inventory[entry[0]] -= entry[1];
        });
        if (selectedObj.goldCost) s.gold -= selectedObj.goldCost;
        if (!s.unlockedRelics) s.unlockedRelics = [];
        s.unlockedRelics.push(selectedObj.uid);
        window.Aetheria.State.recalcMaxHp();
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.State.save();
        UI.updateAllHud();
        UI.showToast("💎 遠古聖物共鳴成功：【" + selectedObj.shortName + "】永久生效！");
        this.renderGridWorkshopModal(this.curTab);
      }
    },

    useSrpgConsumable: function(matKey) {
      const s = window.Aetheria.State.data;
      if (!s.inventory || (s.inventory[matKey] || 0) <= 0) return;

      if (matKey === "rationJerky") {
        s.inventory.rationJerky--;
        window.Aetheria.State.restoreHunger(80, 90);
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.UI.showToast("🍖 食用【岩鹽風乾肉脯】：恢復 +80% 飽食度與 +90 HP！");
      } else if (matKey === "steelIngot") {
        s.inventory.steelIngot--;
        s.srpgBonusAtk = (s.srpgBonusAtk || 0) + 4;
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.UI.showToast("⚔️ 使用【百煉精鋼錠】打磨武器：主角永久攻擊力 +4！");
      } else if (matKey === "curedLeather") {
        s.inventory.curedLeather--;
        s.srpgBonusDef = (s.srpgBonusDef || 0) + 3;
        s.srpgBonusHp  = (s.srpgBonusHp || 0) + 12;
        window.Aetheria.State.recalcMaxHp();
        s.hp = Math.min(s.maxHp, s.hp + 12);
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.UI.showToast("🛡️ 使用【鞣製硬皮革】加固內甲：永久防禦 +3、最大生命 +12！");
      }
      window.Aetheria.State.save();
      this.renderGridWorkshopModal(this.curTab);
      window.Aetheria.UI.updateAllHud();
    },

    buildMainTabBarHtml: function(activeTab) {
      const tabs = [
        { id: "workshop", label: "🔨加工" },
        { id: "tools",    label: "⛏️工具" },
        { id: "weapons",  label: "⚔️武器" },
        { id: "armors",   label: "🛡️防具" },
        { id: "reforge",  label: "✨洗煉" }
      ];
      let html = '<div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:3px; margin-bottom:5px;">';
      tabs.forEach(function(t) {
        const cls = "na-btn" + (activeTab === t.id ? " highlight" : "");
        html += '<button class="' + cls + '" style="padding:5px 2px; font-size:11.5px;" onclick="Aetheria.HighlandsWorkshop.switchTab(\'' + t.id + '\')">' + t.label + '</button>';
      });
      html += '</div>';
      return html;
    },

    renderGridWorkshopModal: function(activeTab) {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const Data = window.Aetheria.Data;
      const UI = window.Aetheria.UI;
      const self = this;

      registerSrpgDataIntoGame();

      if (activeTab) this.curTab = activeTab;
      const tab = this.curTab;

      UI.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML =
        S.iconHtml("icon_forge") + "巴爾隨身工坊與鍛造台 (💰 " + (s.gold || 0) + " G)";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      if (tab === "reforge" && window.Aetheria.Reforge && window.Aetheria.Reforge.renderReforgeTab) {
        const topWrap = document.createElement("div");
        topWrap.innerHTML = this.buildMainTabBarHtml("reforge");
        body.appendChild(topWrap.firstElementChild);
        window.Aetheria.Reforge.renderReforgeTab(body);
        return;
      }

      const itemsList = [];
      const matsDB = Data.MATERIALS || {};

      if (tab === "workshop") {
        const recipeMap = {};
        COMPLETE_WORKSHOP_RECIPES.forEach(function(r) { recipeMap[r.id] = r; });
        const rawWks = Array.isArray(Data.WORKSHOP_RECIPES)
          ? Data.WORKSHOP_RECIPES
          : (Data.WORKSHOP_RECIPES && typeof Data.WORKSHOP_RECIPES === "object" ? Object.values(Data.WORKSHOP_RECIPES) : []);
        rawWks.forEach(function(r, idx) {
          if (!r) return;
          const rid = r.id || r.wkId || ("wk_legacy_" + idx);
          r.id = rid;
          if (!recipeMap[rid]) recipeMap[rid] = r;
        });

        Object.values(recipeMap).forEach(function(r) {
          const subCat = self.getRecipeSubCategory(r);
          const canDo = self.canAffordRecipe(s, r.cost, r.goldCost || 0);
          const outKey = r.toKey || r.giveKey || r.outKey;
          const owned = (s.inventory && s.inventory[outKey]) || 0;
          itemsList.push({
            uid: r.id,
            raw: r,
            itemType: "recipe",
            subCat: subCat,
            iconKey: "mat_" + outKey,
            shortName: r.name.replace(/\s*x\d+$/i, "").replace(/\s*\([^)]*\)/g, ""),
            fullName: r.name,
            badgeText: "持有 " + owned,
            canCraft: canDo,
            costMap: r.cost,
            goldCost: r.goldCost || 0,
            desc: r.desc || "工坊合成加工品。"
          });
        });
      }

      // ★ 100% 內建顯示 5 大採集工具 (伐木手斧、採礦十字鎬、垂釣魚竿、飛索鉤爪、探險行囊)
      else if (tab === "tools") {
        const toolsSource = (Data.TOOLS && Object.keys(Data.TOOLS).length >= 3) ? Data.TOOLS : BUILTIN_TOOLS_DB;
        ["axe", "pickaxe", "rod", "hook", "pouch"].forEach(function(tKey) {
          const tDef = toolsSource[tKey] || BUILTIN_TOOLS_DB[tKey];
          if (!tDef) return;
          const curLv = (s.tools && s.tools[tKey]) || 0;
          const nextTier = tDef.tiers && tDef.tiers[curLv + 1];
          const curTierObj = (tDef.tiers && tDef.tiers[curLv]) || { name: tDef.name, desc: "" };
          const isMax = !nextTier;
          const canDo = !isMax && self.canAffordRecipe(s, nextTier.cost, nextTier.gold || 0);

          itemsList.push({
            uid: "tool_" + tKey,
            toolKey: tKey,
            itemType: "tool",
            subCat: "all",
            iconKey: tDef.iconKey || "icon_axe",
            shortName: tDef.name,
            fullName: tDef.name + " (當前：" + curTierObj.name + ")",
            badgeText: isMax ? "★滿級" : ("Lv." + curLv),
            canCraft: canDo,
            isMax: isMax,
            costMap: nextTier ? nextTier.cost : null,
            goldCost: nextTier ? (nextTier.gold || 0) : 0,
            desc: nextTier ? ("下一階【" + nextTier.name + "】：" + (nextTier.desc || "")) : ("已達最高階級！" + (curTierObj.desc || ""))
          });
        });
      }

      else if (tab === "weapons") {
        Object.values(Data.WEAPONS || {}).forEach(function(w) {
          const unlocked = Boolean(s.unlockedWeapons && s.unlockedWeapons.indexOf(w.id) !== -1);
          const equipped = (s.equippedWeapon === w.id);
          const canDo = !unlocked && self.canAffordRecipe(s, w.cost, w.gold || 0);
          itemsList.push({
            uid: w.id,
            raw: w,
            itemType: "weapon",
            subCat: (w.tier <= 2) ? "low" : "high",
            iconKey: "icon_sword",
            shortName: w.name,
            fullName: w.name + " (ATK +" + w.atk + ")",
            badgeText: equipped ? "已裝備" : (unlocked ? "已擁有" : ("T" + (w.tier || 1))),
            canCraft: canDo,
            unlocked: unlocked,
            equipped: equipped,
            costMap: w.cost,
            goldCost: w.gold || 0,
            desc: w.desc || ("基礎攻擊力 +" + w.atk)
          });
        });
      }

      else if (tab === "armors") {
        Object.values(Data.ARMORS || {}).forEach(function(a) {
          const unlocked = Boolean(s.unlockedArmors && s.unlockedArmors.indexOf(a.id) !== -1);
          const equipped = (s.equippedArmor === a.id);
          const canDo = !unlocked && self.canAffordRecipe(s, a.cost, a.gold || 0);
          itemsList.push({
            uid: a.id,
            raw: a,
            itemType: "armor",
            subCat: "armor",
            iconKey: "icon_shield",
            shortName: a.name,
            fullName: a.name + " (DEF +" + a.def + " / HP +" + (a.hp || 0) + ")",
            badgeText: equipped ? "穿戴中" : (unlocked ? "已擁有" : ("T" + (a.tier || 1))),
            canCraft: canDo,
            unlocked: unlocked,
            equipped: equipped,
            costMap: a.cost,
            goldCost: a.gold || 0,
            desc: a.desc || ("防禦力 +" + a.def + "，最大生命 +" + (a.hp || 0))
          });
        });
        Object.values(Data.RELICS || {}).forEach(function(rel) {
          const unlocked = Boolean(s.unlockedRelics && s.unlockedRelics.indexOf(rel.id) !== -1);
          const canDo = !unlocked && self.canAffordRecipe(s, rel.cost, rel.gold || 0);
          itemsList.push({
            uid: rel.id,
            raw: rel,
            itemType: "relic",
            subCat: "relic",
            iconKey: "crystal",
            shortName: rel.name,
            fullName: "【聖物】" + rel.name,
            badgeText: unlocked ? "★已共鳴" : "聖物",
            canCraft: canDo,
            unlocked: unlocked,
            costMap: rel.cost,
            goldCost: rel.gold || 0,
            desc: rel.desc || "永久被動聖物加成。"
          });
        });
      }

      let subFilters = [];
      if (tab === "workshop") {
        subFilters = [
          { id: "all",      label: "全部(" + itemsList.length + ")" },
          { id: "can",      label: "✅可製作" },
          { id: "explore",  label: "🧗開路/照明" },
          { id: "smelt",    label: "🔥冶煉/建材" },
          { id: "survival", label: "🍖口糧/靈藥" }
        ];
      } else if (tab === "weapons") {
        subFilters = [
          { id: "all",  label: "全部武器(" + itemsList.length + ")" },
          { id: "can",  label: "✅可鍛造/已擁有" },
          { id: "low",  label: "T1~T2 初中階" },
          { id: "high", label: "T3~T4 高階" }
        ];
      } else if (tab === "armors") {
        subFilters = [
          { id: "all",   label: "全部(" + itemsList.length + ")" },
          { id: "armor", label: "🛡️防具護甲" },
          { id: "relic", label: "💎遠古聖物" }
        ];
      }

      let filterBarHtml = "";
      if (subFilters.length > 0) {
        filterBarHtml = '<div class="wk-subfilter-bar">';
        subFilters.forEach(function(sf) {
          const cls = "wk-filter-pill" + (self.curSubFilter === sf.id ? " active" : "");
          filterBarHtml += '<button class="' + cls + '" onclick="Aetheria.HighlandsWorkshop.switchFilter(\'' + sf.id + '\')">' + sf.label + '</button>';
        });
        filterBarHtml += '</div>';
      }

      const filteredItems = itemsList.filter(function(item) {
        if (self.curSubFilter === "all") return true;
        if (self.curSubFilter === "can") return item.canCraft || item.unlocked;
        return item.subCat === self.curSubFilter;
      });

      this.currentFilteredMap = {};
      filteredItems.forEach(function(it) {
        self.currentFilteredMap[it.uid] = it;
      });

      if (!this.selectedItemId || !this.currentFilteredMap[this.selectedItemId]) {
        const firstCraftable = filteredItems.find(function(x) { return x.canCraft; });
        this.selectedItemId = firstCraftable ? firstCraftable.uid : (filteredItems[0] && filteredItems[0].uid);
      }

      const selectedObj = this.currentFilteredMap[this.selectedItemId] || filteredItems[0];

      // 建立紅框檢視盒 HTML（全部按鈕均使用內聯 onclick）
      let inspectorInnerHtml = "";
      if (selectedObj) {
        let chipsHtml = "";
        if (selectedObj.costMap && !selectedObj.unlocked && !selectedObj.isMax) {
          Object.entries(selectedObj.costMap).forEach(function(entry) {
            const mKey = entry[0];
            const req = entry[1];
            const have = (s.inventory && s.inventory[mKey]) || 0;
            const mName = (matsDB[mKey] && matsDB[mKey].name) || mKey;
            const ok = have >= req;
            chipsHtml +=
              '<span class="wk-mat-chip ' + (ok ? 'ok' : 'lack') + '">' +
                S.iconHtml("mat_" + mKey, true) + mName + ' ' + have + '/' + req + (ok ? ' ✓' : '') +
              '</span>';
          });
        }
        if (selectedObj.goldCost > 0 && !selectedObj.unlocked && !selectedObj.isMax) {
          const gOk = (s.gold || 0) >= selectedObj.goldCost;
          chipsHtml +=
            '<span class="wk-mat-chip ' + (gOk ? 'ok' : 'lack') + '">💰 ' + selectedObj.goldCost + ' G</span>';
        }

        let actionBtnHtml = "";
        if (selectedObj.itemType === "recipe") {
          const outKey = selectedObj.raw.toKey || selectedObj.raw.giveKey;
          const canUseBuff = (outKey === "steelIngot" || outKey === "curedLeather" || outKey === "rationJerky") &&
                             ((s.inventory && s.inventory[outKey]) || 0) > 0;
          actionBtnHtml =
            '<div style="display:flex; flex-direction:column; gap:4px;">' +
              '<button class="na-btn ' + (selectedObj.canCraft ? 'highlight' : '') + '" style="padding:7px 12px; font-size:13px; white-space:nowrap;" onclick="Aetheria.HighlandsWorkshop.craftOrAct(\'' + selectedObj.uid + '\')">🔨 立即製作</button>' +
              (canUseBuff
                ? '<button class="na-btn" style="padding:4px 8px; font-size:11px; border-color:#5ac54f; color:#5ac54f;" onclick="Aetheria.HighlandsWorkshop.useSrpgConsumable(\'' + outKey + '\')">✨ 使用強化</button>'
                : '') +
            '</div>';
        } else if (selectedObj.itemType === "tool") {
          actionBtnHtml = selectedObj.isMax
            ? '<span style="color:#5ac54f; font-weight:900; white-space:nowrap;">★ 已滿級</span>'
            : '<button class="na-btn ' + (selectedObj.canCraft ? 'highlight' : '') + '" style="padding:7px 12px; white-space:nowrap;" onclick="Aetheria.HighlandsWorkshop.craftOrAct(\'' + selectedObj.uid + '\')">⛏️ 升級工具</button>';
        } else if (selectedObj.itemType === "weapon" || selectedObj.itemType === "armor") {
          if (selectedObj.equipped) {
            actionBtnHtml = '<span style="color:#ffd166; font-weight:900; white-space:nowrap;">✓ 裝備中</span>';
          } else if (selectedObj.unlocked) {
            actionBtnHtml = '<button class="na-btn highlight" style="padding:7px 12px; white-space:nowrap;" onclick="Aetheria.HighlandsWorkshop.craftOrAct(\'' + selectedObj.uid + '\')">⚡ 立即裝備</button>';
          } else {
            actionBtnHtml = '<button class="na-btn ' + (selectedObj.canCraft ? 'highlight' : '') + '" style="padding:7px 12px; white-space:nowrap;" onclick="Aetheria.HighlandsWorkshop.craftOrAct(\'' + selectedObj.uid + '\')">🔨 鍛造</button>';
          }
        } else if (selectedObj.itemType === "relic") {
          actionBtnHtml = selectedObj.unlocked
            ? '<span style="color:#5ac54f; font-weight:900;">★ 生效中</span>'
            : '<button class="na-btn ' + (selectedObj.canCraft ? 'highlight' : '') + '" style="padding:7px 12px; white-space:nowrap;" onclick="Aetheria.HighlandsWorkshop.craftOrAct(\'' + selectedObj.uid + '\')">💎 合成聖物</button>';
        }

        inspectorInnerHtml =
          '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">' +
            '<div style="flex:1;">' +
              '<div style="font-size:13.5px; font-weight:900; color:#ffd166;">' +
                S.iconHtml(selectedObj.iconKey, true) + selectedObj.fullName +
              '</div>' +
              '<div style="font-size:11px; color:#cbd5e1; margin-top:2px; line-height:1.3;">' + selectedObj.desc + '</div>' +
              (chipsHtml ? '<div style="margin-top:4px;">' + chipsHtml + '</div>' : '') +
            '</div>' +
            actionBtnHtml +
          '</div>';
      } else {
        inspectorInnerHtml = '<div style="color:#94a3b8; font-size:12px; text-align:center;">此分類下暫無項目</div>';
      }

      // 建立下方 3 欄格仔 HTML（每個格仔與黃色製作鈕均使用內聯 onclick！）
      let gridCellsHtml = "";
      filteredItems.forEach(function(item) {
        const isSel = (selectedObj && selectedObj.uid === item.uid);
        const cls = "wk-grid-cell" + (item.canCraft ? " can-craft" : "") + (isSel ? " selected" : "");
        const showQuickBtn = item.canCraft || (item.unlocked && !item.equipped && (item.itemType === "weapon" || item.itemType === "armor"));
        const quickBtnLabel = item.unlocked ? "⚡裝備" : (item.itemType === "tool" ? "⛏️升級" : "🔨製作");

        gridCellsHtml +=
          '<div class="' + cls + '" onclick="Aetheria.HighlandsWorkshop.selectItem(\'' + item.uid + '\')">' +
            (item.canCraft ? '<span class="wk-cell-craft-dot">●可做</span>' : '') +
            '<span class="wk-cell-badge">' + item.badgeText + '</span>' +
            '<div style="pointer-events:none;">' + S.iconHtml(item.iconKey) + '</div>' +
            '<div class="wk-cell-name">' + item.shortName + '</div>' +
            (showQuickBtn
              ? ('<button class="wk-cell-quick-btn" onclick="event.stopPropagation(); Aetheria.HighlandsWorkshop.craftOrAct(\'' + item.uid + '\')">' + quickBtnLabel + '</button>')
              : '') +
          '</div>';
      });

      body.innerHTML =
        '<div class="wk-top-control-panel">' +
          this.buildMainTabBarHtml(tab) +
          filterBarHtml +
          '<div class="wk-inspector-box" id="wk-inspector-box">' + inspectorInnerHtml + '</div>' +
        '</div>' +
        '<div class="wk-icon-grid">' + gridCellsHtml + '</div>';

      if (this.savedScrollTop > 0) {
        body.scrollTop = this.savedScrollTop;
      }
    }
  };

  window.Aetheria.HighlandsWorkshop = WorkshopUIManager;

  // ================= 6. 掛載高低差移動碰撞、怪物防穿懸崖、雙繩梯攀爬與格仔工坊 =================
  function hookSystemsForHighlandsAndWorkshop() {
    const St   = window.Aetheria.State;
    const Maps = window.Aetheria.Data && window.Aetheria.Data.Maps;
    const Exp  = window.Aetheria.Explore;
    const Ren  = window.Aetheria.Renderer;
    const Bat  = window.Aetheria.Battle;
    const UI   = window.Aetheria.UI;

    if (St) {
      if (St.getTotalAtk) {
        const origAtk = St.getTotalAtk.bind(St);
        St.getTotalAtk = function() {
          return origAtk() + ((this.data && this.data.srpgBonusAtk) || 0);
        };
      }
      if (St.getTotalDef) {
        const origDef = St.getTotalDef.bind(St);
        St.getTotalDef = function() {
          return origDef() + ((this.data && this.data.srpgBonusDef) || 0);
        };
      }
      if (St.recalcMaxHp) {
        const origMaxHp = St.recalcMaxHp.bind(St);
        St.recalcMaxHp = function() {
          origMaxHp();
          if (this.data) {
            const pouchLv = (this.data.tools && this.data.tools.pouch) || 0;
            const pouchHp = (pouchLv >= 2) ? 70 : (pouchLv === 1) ? 30 : 0;
            this.data.maxHp += ((this.data.srpgBonusHp || 0) + pouchHp);
            if (this.data.hp > this.data.maxHp) this.data.hp = this.data.maxHp;
          }
        };
      }
    }

    if (Maps && Maps.getMap) {
      const origGetMap = Maps.getMap.bind(Maps);
      Maps.getMap = function(zoneId) {
        if (zoneId && zoneId.indexOf("grotto_") === 0) {
          const pZone = zoneId.replace("grotto_", "");
          if (!grottoMapsCache[zoneId]) {
            grottoMapsCache[zoneId] = buildCliffGrottoMap(pZone);
          }
          return grottoMapsCache[zoneId];
        }
        const m = origGetMap(zoneId);
        if (m && HIGHLAND_ZONES[m.id]) {
          injectHighlandCliffIntoMap(m);
        }
        return m;
      };

      const origRefresh = Maps.refreshAllResources.bind(Maps);
      Maps.refreshAllResources = function() {
        origRefresh();
        Object.keys(grottoMapsCache).forEach(function(k) {
          delete grottoMapsCache[k];
        });
        Object.keys(HIGHLAND_ZONES).forEach(function(zId) {
          const m = origGetMap(zId);
          if (m) {
            m._highlandInjectedToken = null;
            injectHighlandCliffIntoMap(m);
          }
        });
      };
    }

    if (Exp) {
      const origUpdateStep = Exp.updateStep.bind(Exp);
      Exp.updateStep = function() {
        const s = window.Aetheria.State.data;
        const prevX = s.heroX;
        const prevY = s.heroY;
        const prevZone = s.currentZone;

        origUpdateStep();

        if (s.currentZone !== prevZone) {
          s.onHighland = false;
          return;
        }

        if (!HIGHLAND_ZONES[s.currentZone]) {
          s.onHighland = false;
          return;
        }

        if (s.onHighland) {
          if (!isInsideHighlandPlateau(s.heroX, s.heroY)) {
            s.heroX = prevX;
            s.heroY = prevY;
          }
        } else {
          if (isBlockedByCliffFromLowland(s.heroX, s.heroY)) {
            s.heroX = prevX;
            s.heroY = prevY;
          }
        }
      };

      if (Exp.updateMonstersAI) {
        const origAI = Exp.updateMonstersAI.bind(Exp);
        Exp.updateMonstersAI = function(mapObj, s) {
          const hasCliff = Boolean(mapObj && HIGHLAND_ZONES[mapObj.id]);
          const prevCoords = [];
          if (hasCliff && mapObj.monsters) {
            mapObj.monsters.forEach(function(m, idx) {
              prevCoords[idx] = { x: m.x, y: m.y };
            });
          }

          origAI(mapObj, s);

          if (hasCliff && mapObj.monsters) {
            mapObj.monsters.forEach(function(m, idx) {
              if (!m || m.alive === false) return;
              if (isBlockedByCliffFromLowland(m.x, m.y)) {
                if (prevCoords[idx] && !isBlockedByCliffFromLowland(prevCoords[idx].x, prevCoords[idx].y)) {
                  m.x = prevCoords[idx].x;
                  m.y = prevCoords[idx].y;
                } else {
                  m.x = 240;
                  m.y = 920;
                }
                m.vx = -(m.vx || 0);
                m.vy = -(m.vy || 0);
              }
            });
          }
        };
      }

      const origInteract = Exp.interactNearby.bind(Exp);
      Exp.interactNearby = function() {
        const s = window.Aetheria.State.data;
        const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
        if (mapObj && mapObj.decos) {
          for (let i = 0; i < mapObj.decos.length; i++) {
            const d = mapObj.decos[i];
            if (d && d.isCliffLadderSpot && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 68) {
              if (!s.riggedCliffs) s.riggedCliffs = {};
              const isRigged = Boolean(s.riggedCliffs[mapObj.id]);

              if (!isRigged) {
                if ((s.inventory.ropeLadder || 0) <= 0) {
                  window.Aetheria.Audio.sfxWrong();
                  window.Aetheria.UI.showToast("🧗 陡峭的懸崖岩壁！請先在【工坊 ➔ 🔨加工】合成【攀岩繩梯 x1】(麻繩x1+原木x2) 架設！");
                  return;
                }
                s.inventory.ropeLadder--;
                s.riggedCliffs[mapObj.id] = true;
                (mapObj.decos || []).forEach(function(dc) {
                  if (dc.isCliffLadderSpot) {
                    dc.sprite = "rope_ladder";
                    dc.ladderTitle = "🧗繩梯(上下)";
                  }
                });
                if (window.Aetheria.Renderer) window.Aetheria.Renderer.builtZoneKey = null;
              }

              window.Aetheria.Audio.sfxGather();
              if (s.onHighland) {
                s.onHighland = false;
                if (d.ladderSide === "north") {
                  s.heroX = d.x;
                  s.heroY = 772;
                } else {
                  s.heroX = d.x;
                  s.heroY = 982;
                }
                s.petX = s.heroX - 20;
                s.petY = s.heroY;
                window.Aetheria.UI.showToast("🧗 順着攀岩繩梯爬下了平地！");
              } else {
                s.onHighland = true;
                if (d.ladderSide === "north") {
                  s.heroX = d.x;
                  s.heroY = 835;
                } else {
                  s.heroX = d.x;
                  s.heroY = 895;
                }
                s.petX = s.heroX - 20;
                s.petY = s.heroY;
                window.Aetheria.UI.showToast("🧗 順着攀岩繩梯爬上了【黃土高台礦區】！");
              }
              window.Aetheria.State.save();
              window.Aetheria.UI.updateAllHud();
              return;
            }
          }
        }
        origInteract();
      };

      const origHint = Exp.updateContextHint.bind(Exp);
      Exp.updateContextHint = function(mapObj, s) {
        const hintEl = document.getElementById("a-btn-hint");
        if (hintEl && mapObj && mapObj.decos) {
          for (let i = 0; i < mapObj.decos.length; i++) {
            const d = mapObj.decos[i];
            if (d && d.isCliffLadderSpot && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 68) {
              const rigged = Boolean(s.riggedCliffs && s.riggedCliffs[mapObj.id]);
              hintEl.innerText = !rigged ? "架設繩梯" : (s.onHighland ? "爬下懸崖" : "爬上高台");
              return;
            }
          }
        }
        origHint(mapObj, s);
      };

      const origHarvest = Exp.harvestNode.bind(Exp);
      Exp.harvestNode = function(node) {
        const s = window.Aetheria.State.data;
        if (node && node.reqHighland && !s.onHighland) {
          window.Aetheria.Audio.sfxWrong();
          window.Aetheria.UI.showToast("🧗 此礦簇位於高台上！請先從懸崖邊的【🧗繩梯】爬上高台再開採！");
          return;
        }
        origHarvest(node);
      };
    }

    if (Bat && Bat.winBattle) {
      const origWin = Bat.winBattle.bind(Bat);
      Bat.winBattle = function() {
        const isCombat = (this.mode === "combat");
        origWin();
        if (isCombat && Math.random() < 0.60) {
          const s = window.Aetheria.State.data;
          s.inventory.rawHide = (s.inventory.rawHide || 0) + 1;
          window.Aetheria.State.save();
        }
      };
    }

    if (Ren) {
      const origBuild = Ren.buildSceneDOM.bind(Ren);
      Ren.buildSceneDOM = function(mapObj) {
        if (mapObj && HIGHLAND_ZONES[mapObj.id]) {
          injectHighlandCliffIntoMap(mapObj);
        }
        origBuild(mapObj);

        const terrainLayer = document.getElementById("world-terrain-layer");
        const S = window.Aetheria.Data.Sprites;
        if (!terrainLayer || !mapObj) return;

        if (HIGHLAND_ZONES[mapObj.id]) {
          const platTop = document.createElement("div");
          platTop.className = "srpg-plateau-top";
          platTop.style.cssText = "left:390px; top:800px; width:515px; height:122px;";
          terrainLayer.appendChild(platTop);

          const platRight = document.createElement("div");
          platRight.className = "srpg-plateau-top";
          platRight.style.cssText = "left:710px; top:914px; width:195px; height:148px; border-top:none; border-radius:0;";
          terrainLayer.appendChild(platRight);

          const cliffMain = document.createElement("div");
          cliffMain.className = "srpg-cliff-wall";
          cliffMain.style.cssText = "left:390px; top:918px; width:324px; height:46px;";
          terrainLayer.appendChild(cliffMain);

          const cliffStepSide = document.createElement("div");
          cliffStepSide.className = "srpg-cliff-side-wall";
          cliffStepSide.style.cssText = "left:704px; top:918px; width:14px; height:144px;";
          terrainLayer.appendChild(cliffStepSide);

          const cliffRightBottom = document.createElement("div");
          cliffRightBottom.className = "srpg-cliff-wall";
          cliffRightBottom.style.cssText = "left:710px; top:1058px; width:195px; height:44px;";
          terrainLayer.appendChild(cliffRightBottom);

          const caveArch = document.createElement("div");
          caveArch.className = "srpg-cave-arch";
          caveArch.style.cssText = "left:468px; top:920px;";
          terrainLayer.appendChild(caveArch);
        }

        Object.keys(this.domPool.decos || {}).forEach(function(k) {
          const item = Ren.domPool.decos[k];
          if (item && item.data && item.data.isCliffLadderSpot && item.el) {
            if (!item.lbl) {
              const lbl = document.createElement("div");
              lbl.className = "dom-label ladder-spot-lbl";
              item.el.appendChild(lbl);
              item.lbl = lbl;
            }
          }
        });

        Object.keys(this.domPool.nodes || {}).forEach(function(nId) {
          const item = Ren.domPool.nodes[nId];
          if (item && item.data && item.data.isClusterBoulder && S) {
            item.el.innerHTML = '<img src="' + S.getDataURL("cluster_boulder") + '" alt="">';
            if (item.lbl) item.el.appendChild(item.lbl);
          }
        });
      };

      const origRender = Ren.renderWorld.bind(Ren);
      Ren.renderWorld = function() {
        origRender();
        try {
          const s = window.Aetheria.State.data;
          const S = window.Aetheria.Data.Sprites;
          const rigged = Boolean(s && s.riggedCliffs && s.riggedCliffs[s.currentZone]);

          Object.keys(this.domPool.decos || {}).forEach(function(k) {
            const item = Ren.domPool.decos[k];
            if (item && item.data && item.data.isCliffLadderSpot) {
              if (item.img && S) {
                item.img.src = S.getDataURL(rigged ? "rope_ladder" : "cliff_stake");
              }
              if (item.lbl) {
                item.lbl.style.display = "block";
                item.lbl.className = "dom-label ladder-spot-lbl";
                item.lbl.innerText = rigged ? (s.onHighland ? "🧗爬下懸崖" : "🧗爬上高台") : "🧗架設繩梯";
              }
            }
          });

          Object.keys(this.domPool.nodes || {}).forEach(function(nId) {
            const item = Ren.domPool.nodes[nId];
            if (!item || !item.data || !item.lbl) return;
            const n = item.data;
            if (n.opened) {
              item.lbl.style.display = "none";
              return;
            }
            if (n.type === "chest") return;
            const dist = Math.hypot((s.heroX || 0) - n.x, (s.heroY || 0) - n.y);
            item.lbl.style.display = (dist < 62) ? "block" : "none";
          });
        } catch (e) {}
      };
    }

    if (UI) {
      UI.openForgeModal = function(activeTab) {
        const s = window.Aetheria.State && window.Aetheria.State.data;
        const forgeUnlocked = Boolean(
          s && ((s.projectsBuilt && s.projectsBuilt.proj_camp_forge) || s.equippedWeapon || (s.lv && s.lv > 1))
        );
        if (!forgeUnlocked) {
          window.Aetheria.Audio.sfxWrong();
          UI.showToast("🔨 巴爾的鍛造爐尚未修復！請先在營地拾取枯枝x3、燧石x3、黏土x2修復熔爐！");
          return;
        }
        WorkshopUIManager.renderGridWorkshopModal(activeTab || WorkshopUIManager.curTab || "workshop");
      };

      if (UI.openRationQuickModal) {
        const origRation = UI.openRationQuickModal.bind(UI);
        UI.openRationQuickModal = function() {
          origRation();
          const s = window.Aetheria.State.data;
          const jerkyCnt = (s.inventory && s.inventory.rationJerky) || 0;
          const body = document.getElementById("modal-body");
          if (body && !document.getElementById("quick-eat-jerky-card")) {
            const S = window.Aetheria.Data.Sprites;
            const card = document.createElement("div");
            card.id = "quick-eat-jerky-card";
            card.className = "sys-card";
            card.style.borderColor = "#f5b700";
            card.innerHTML =
              '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<div>' +
                  '<b>' + S.iconHtml("mat_rationJerky", true) + '岩鹽風乾肉脯 (持有：' + jerkyCnt + ')</b>' +
                  '<div style="font-size:11.5px; color:#ffd166;">立即恢復 +80% 飽食度 與 +90 HP</div>' +
                '</div>' +
                '<button class="na-btn ' + (jerkyCnt > 0 ? 'highlight' : '') + '" style="padding:6px 12px;" onclick="Aetheria.HighlandsWorkshop.useSrpgConsumable(\'rationJerky\'); Aetheria.UI.openRationQuickModal();">食用</button>' +
              '</div>';
            body.insertBefore(card, body.firstChild);
          }
        };
      }
    }
  }

  function initHighlandsAndWorkshopModule() {
    try {
      injectHighlandsAndWorkshopStyles();
      registerSurvivalRpgSprites();
      registerSrpgDataIntoGame();
      hookSystemsForHighlandsAndWorkshop();

      const Maps = window.Aetheria.Data && window.Aetheria.Data.Maps;
      if (Maps && Maps.getMap) {
        Object.keys(HIGHLAND_ZONES).forEach(function(zId) {
          const m = Maps.getMap(zId);
          if (m) {
            m._highlandInjectedToken = null;
            injectHighlandCliffIntoMap(m);
          }
        });
      }

      if (window.Aetheria.State && window.Aetheria.State.recalcMaxHp) {
        window.Aetheria.State.recalcMaxHp();
      }
      if (window.Aetheria.Renderer) {
        window.Aetheria.Renderer.builtZoneKey = null;
        window.Aetheria.Renderer.renderWorld();
      }
      if (window.Aetheria.UI && window.Aetheria.UI.updateAllHud) {
        window.Aetheria.UI.updateAllHud();
      }
    } catch (err) {
      console.error("Survival Highlands & Grid Workshop v9.6 init error:", err);
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(initHighlandsAndWorkshopModule, 185);
  } else {
    window.addEventListener("load", function() {
      setTimeout(initHighlandsAndWorkshopModule, 185);
    });
  }
})();
