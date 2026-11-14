/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 正統 Survival RPG 深度重製模組 (survival-highlands-workshop.js - v10.2)
 * v10.2 三大升級（探險鐵鏟挖寶 ✖ ＋ 隱藏地底遺跡 ＋ 領悟配方系統）：
 *   1. 【第6工具：探險鐵鏟 & ✖ 藏寶點】：於工坊工具分頁新增「探險鐵鏟 (Lv.1~Lv.3)」，可挖掘各區地面「✖」記號獲取【遠古遺跡鑰匙】與【遠古秘寶晶石】
 *   2. 【隱藏地底遺跡子迷宮 (crypt_*)】：各區高台旁設有鎖住的【地底遺跡石門】，用鑰匙解鎖後可進入地底挑戰「遺跡守衛魔像」並開啟「遠古聖物石棺」
 *   3. 【💡 領悟配方系統 & 33項配方】：獲得新素材時即時彈出「💡領悟新配方」提示；工坊支援切換「已領悟 / 🔒未領悟」並新增遠古晶石永久屬性秘藥
 *   4. 完整保留 v10.1 的 2100x1320 大地圖、高低差懸崖山洞、6區環境求生裝、安全區保底素材與 15 項日誌求生懸賞
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  // ================= 1. 注入高低差懸崖、地底遺跡、挖寶點與格仔工坊 CSS =================
  function injectHighlandsAndWorkshopStyles() {
    if (document.getElementById("highlands-wk-v102-styles")) return;
    const style = document.createElement("style");
    style.id = "highlands-wk-v102-styles";
    style.textContent = `
      /* ================= A. L型高低差黃土高台與深啡色垂直懸崖壁 ================= */
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

      #srpg-hazard-banner {
        position: absolute;
        top: 28px;
        right: 6px;
        z-index: 24;
        padding: 2px 7px;
        border-radius: 5px;
        font-size: 10px;
        font-weight: 900;
        display: none;
        pointer-events: none;
        box-shadow: 0 2px 6px rgba(0,0,0,0.8);
      }
      #srpg-hazard-banner.hazard-danger {
        display: block;
        background: rgba(157, 2, 8, 0.92);
        color: #ffd166;
        border: 1.5px solid #ff595e;
        animation: bobQuest 0.9s infinite ease-in-out;
      }
      #srpg-hazard-banner.hazard-safe {
        display: block;
        background: rgba(20, 54, 42, 0.88);
        color: #5ac54f;
        border: 1.5px solid #5ac54f;
      }

      .dom-label.ladder-spot-lbl {
        background: linear-gradient(90deg, #5c3824 0%, #8f563b 100%);
        color: #ffd166;
        border: 1.5px solid #f5b700;
        box-shadow: 0 0 6px rgba(245, 183, 0, 0.85);
        font-weight: 900;
      }
      .dom-label.crypt-door-lbl {
        background: linear-gradient(90deg, #2d1442 0%, #4a154b 100%);
        color: #ffd166;
        border: 1.5px solid #e0aaff;
        box-shadow: 0 0 7px rgba(224, 170, 255, 0.85);
        font-weight: 900;
      }
      .dom-label.dig-spot-lbl {
        background: #4a2c11;
        color: #ffd166;
        border: 1.5px solid #f5b700;
        font-weight: 900;
      }
      .dom-label.elite-mon-lbl {
        background: linear-gradient(90deg, #6a040f 0%, #3c096c 100%);
        color: #ffd166;
        border: 1.5px solid #ff758f;
        box-shadow: 0 0 6px rgba(255, 89, 94, 0.8);
      }

      /* ================= B. 格仔分類工坊 UI ================= */
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
        padding: 3px 8px;
        font-size: 10.5px;
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
      .wk-grid-cell.undiscovered {
        opacity: 0.72;
        border-style: dashed;
        border-color: #64748b;
      }
      .wk-grid-cell.selected {
        border-color: #ffd166 !important;
        border-style: solid !important;
        opacity: 1 !important;
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
      .wk-cell-lock-dot {
        position: absolute;
        top: 2px;
        left: 4px;
        font-size: 9px;
        font-weight: 900;
        color: #e0aaff;
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

    const upper = document.getElementById("upper-screen");
    if (upper && !document.getElementById("srpg-hazard-banner")) {
      const banner = document.createElement("div");
      banner.id = "srpg-hazard-banner";
      upper.appendChild(banner);
    }
  }

  // ================= 2. 註冊《Survival RPG》像素圖示（新增鐵鏟、✖挖寶點、遺跡鑰匙、遺跡石門、遠古晶石） =================
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

    // 🥄 第 6 把核心工具：探險鐵鏟 (icon_shovel)
    const shovelIconUrl = buildGridDataUrl([
      "...........KKKK.",
      "..........KLLLLK",
      ".........KLDDDDK",
      ".........KLLLLK.",
      "........KKLKK...",
      ".......KLLK.....",
      "......KLLK......",
      ".....KLLK.......",
      "....KKKK........",
      "..KKCCCCKK......",
      ".KCCWWWWCCK.....",
      "KCCWWWWWWCCK....",
      "KCCWWWWCCCCK....",
      ".KCCCCCCCCK.....",
      "..KKKKKKKK......",
      "................"
    ], { K: "#141013", L: "#d9a066", D: "#8f563b", C: "#94a3b8", W: "#ffffff" });

    // ✖ 地面隱藏挖寶記號 (buried_x_spot)
    const buriedXSpotUrl = buildGridDataUrl([
      "................",
      "................",
      "..KKK......KKK..",
      ".KDDDK....KDDDK.",
      ".KDYYDK..KDYYDK.",
      "..KDYYDKKDYYDK..",
      "...KDYYYYYYDK...",
      "....KDYYYYDK....",
      "....KDYYYYDK....",
      "...KDYYYYYYDK...",
      "..KDYYDKKDYYDK..",
      ".KDYYDK..KDYYDK.",
      ".KDDDK....KDDDK.",
      "..KKK......KKK..",
      "................",
      "................"
    ], { K: "#2b1508", D: "#8f563b", Y: "#ffd166" });

    // 🗝️ 遠古遺跡鑰匙 (mat_cryptKey)
    const cryptKeyUrl = buildGridDataUrl([
      "....KKKKKK......",
      "...KYYYYYYK.....",
      "..KYYKKKKYYK....",
      "..KYYK..KYYK....",
      "..KYYKKKKYYK....",
      "...KYYYYYYK.....",
      "....KKYYKK......",
      ".....KYYK.......",
      ".....KYYK.......",
      ".....KYYKKKK....",
      ".....KYYYYYK....",
      ".....KYYKKKK....",
      ".....KYYK.......",
      ".....KYYYYYK....",
      ".....KKKKKKK....",
      "................"
    ], { K: "#141013", Y: "#ffd166" });

    // 🔮 遠古秘寶晶石 (mat_ancientGem)
    const ancientGemUrl = buildGridDataUrl([
      "......KKKK......",
      "....KKPPPPKK....",
      "...KPPWWWWPPK...",
      "..KPPWYYYYWPPK..",
      ".KPPWYYYYYYWPPK.",
      "KPPWYYWWWWYYWPPK",
      "KPPWYYWWWWYYWPPK",
      "KPPWYYYYYYYYWPPK",
      ".KPPWYYYYYYWPPK.",
      "..KPPWWWWWWPPK..",
      "...KPPPPPPPPK...",
      "....KKPPPPKK....",
      "......KKKK......",
      "................",
      "................",
      "................"
    ], { K: "#141013", P: "#9d4edd", W: "#ffffff", Y: "#ffd166" });

    // 🔒 遠古地底遺跡石門 (crypt_door_locked / crypt_door_open)
    const cryptDoorLockedUrl = buildGridDataUrl([
      "....KKKKKKKK....",
      "..KKGGGGGGGGKK..",
      ".KGGDDDDDDDDGGK.",
      "KGGDKKKKKKKKDGGK",
      "KGDKPPPPPPPPKDGK",
      "KGDKPYYYYYYPKDGK",
      "KGDKPYKKKKYPKDGK",
      "KGDKPYKYYKYPKDGK",
      "KGDKPYKKKKYPKDGK",
      "KGDKPPPYYPPPPDGK",
      "KGDKPPPYYPPPPDGK",
      "KGDKPPPPPPPPKDGK",
      "KGGDKKKKKKKKDGGK",
      "KGGGGGGGGGGGGGGK",
      "KKKKKKKKKKKKKKKK",
      "................"
    ], { K: "#141013", G: "#64748b", D: "#334155", P: "#2d1442", Y: "#f5b700" });

    const cryptDoorOpenUrl = buildGridDataUrl([
      "....KKKKKKKK....",
      "..KKGGGGGGGGKK..",
      ".KGGDDDDDDDDGGK.",
      "KGGDKKKKKKKKDGGK",
      "KGDKOOOOOOOOODGK",
      "KGDKOOOOOOOOODGK",
      "KGDKOOCCCCCCODGK",
      "KGDKOOOOOOOOODGK",
      "KGDKOOCCCCCCODGK",
      "KGDKOOOOOOOOODGK",
      "KGDKOOCCCCCCODGK",
      "KGDKOOOOOOOOODGK",
      "KGGDKKKKKKKKDGGK",
      "KGGGGGGGGGGGGGGK",
      "KKKKKKKKKKKKKKKK",
      "................"
    ], { K: "#141013", G: "#64748b", D: "#334155", O: "#090608", C: "#5ac54f" });

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

    const venomSacUrl = buildGridDataUrl([
      "......KKKK......",
      "....KKPPPPKK....",
      "...KPPGGGGPPK...",
      "..KPPGWWWWGPPK..",
      "..KPPGWPPWGPPK..",
      ".KPPPPGGGGPPPPK.",
      ".KPPPPPPPPPPPPK.",
      ".KPPPGGGGGGPPPK.",
      "..KPPGGGGGGPPK..",
      "...KKPPPPPPKK...",
      ".....KKKKKK.....",
      "................",
      "................",
      "................",
      "................",
      "................"
    ], { K: "#141013", P: "#7209b7", G: "#5ac54f", W: "#ffffff" });

    const cactusUrl = buildGridDataUrl([
      "......KKKK......",
      ".....KGGGGK.....",
      ".KK..KGWGGK..KK.",
      "KGGK.KGGGGK.KGGK",
      "KGGKKKGGGGKKKGGK",
      "KGGGGGGGGGGGGGGK",
      ".KKKKKGWGGKKKKK.",
      ".....KGGGGK.....",
      ".....KGGGGK.....",
      "....KYYYYYYK....",
      "...KDDDDDDDDK...",
      "...KKKKKKKKKK...",
      "................",
      "................",
      "................",
      "................"
    ], { K: "#141013", G: "#5ac54f", W: "#ffffff", Y: "#f5b700", D: "#8f563b" });

    const survivalGearUrl = buildGridDataUrl([
      "....KKKKKKKK....",
      "..KKYYYYYYYYKK..",
      ".KYYBBBBBBBBYYK.",
      ".KYBBWWWWWWBBYK.",
      "KYBBWCCCCCCWBBYK",
      "KYBBWCCCCCCWBBYK",
      ".KYBBWWWWWWBBYK.",
      ".KYYBBBBBBBBYYK.",
      "..KKYYYYYYYYKK..",
      "...KDDDDDDDDK...",
      "..KDDDDDDDDDDK..",
      "..KKKKKKKKKKKK..",
      "................",
      "................",
      "................",
      "................"
    ], { K: "#141013", Y: "#f5b700", B: "#1d5eb8", W: "#ffffff", C: "#8ce0ff", D: "#5c3824" });

    const customUrls = {
      icon_shovel: shovelIconUrl,
      buried_x_spot: buriedXSpotUrl,
      crypt_door_locked: cryptDoorLockedUrl,
      crypt_door_open: cryptDoorOpenUrl,
      mat_cryptKey: cryptKeyUrl,
      mat_ancientGem: ancientGemUrl,
      mat_elixirAtk: ancientGemUrl,
      mat_elixirHp: ancientGemUrl,
      mat_elixirDef: ancientGemUrl,
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
      mat_thickPelt: leatherUrl,
      mat_treeBark: leatherUrl,
      mat_curedLeather: leatherUrl,
      mat_steelIngot: steelIngotUrl,
      mat_rationJerky: jerkyUrl,
      mat_venomSac: venomSacUrl,
      mat_cactusFruit: cactusUrl,
      mat_chitin: rockSaltUrl,
      mat_sulfur: coalUrl,
      mat_gear_gasMask: survivalGearUrl,
      mat_gear_lantern: torchSpriteUrl,
      mat_gear_goggles: survivalGearUrl,
      mat_gear_diving: survivalGearUrl,
      mat_gear_furCoat: leatherUrl,
      mat_gear_heatShield: survivalGearUrl,
      mat_gear_skyAegis: survivalGearUrl
    };

    const origGetDataURL = S.getDataURL.bind(S);
    S.getDataURL = function(key) {
      if (customUrls[key]) return customUrls[key];
      if (key === "mat_potionHeal" || key === "mat_potionHint") return origGetDataURL("icon_potion");
      return origGetDataURL(key);
    };
  }

  // ================= 3. 六大區域環境危機定義 =================
  const ZONE_HAZARD_RULES = {
    zone1_forest: {
      zoneId: "zone1_forest",
      name: "☠️ 劇毒瘴氣林",
      gearKey: "gear_gasMask",
      gearName: "清毒草藥香囊",
      minX: 660,
      hpDrain: 5,
      hungerDrain: 1,
      warnMsg: "☠️ 踏入深林【劇毒瘴氣區】！請先在西側安全區採集毒囊與樹皮，於工坊合成【清毒草藥香囊】免疫！"
    },
    cave1_mushroom: {
      zoneId: "cave1_mushroom",
      name: "🌑 蝕心暗黑孢子",
      gearKey: "gear_lantern",
      gearName: "永明石英提燈",
      minX: 660,
      hpDrain: 6,
      hungerDrain: 2,
      allowTorchBypass: true,
      warnMsg: "🌑 洞窟深處【暗黑孢子侵蝕】！請點燃火把或在工坊合成【永明石英提燈】永久免疫！"
    },
    zone2_canyon: {
      zoneId: "zone2_canyon",
      name: "🌪️ 酷熱流沙風暴",
      gearKey: "gear_goggles",
      gearName: "防沙護目水壺",
      minX: 660,
      hpDrain: 6,
      hungerDrain: 3,
      slowFactor: 0.72,
      warnMsg: "🌪️ 遭遇【酷熱流沙風暴】！請先在西側採集仙人掌與石英，於工坊合成【防沙護目水壺】免疫！"
    },
    zone3_coast: {
      zoneId: "zone3_coast",
      name: "🌊 暗礁蝕骨海風",
      gearKey: "gear_diving",
      gearName: "深海避水呼吸器",
      minX: 660,
      hpDrain: 8,
      hungerDrain: 2,
      warnMsg: "🌊 踏入【深海暗礁急流區】！請先在西側採集甲殼與珊瑚，於工坊合成【深海避水呼吸器】免疫！"
    },
    zone4_snow: {
      zoneId: "zone4_snow",
      name: "❄️ 極寒凍傷暴雪",
      gearKey: "gear_furCoat",
      gearName: "極地厚毛防寒斗篷",
      minX: 660,
      hpDrain: 11,
      hungerDrain: 3,
      slowFactor: 0.75,
      warnMsg: "❄️ 暴風雪【極寒凍傷】！請先在西側收集極地厚獸毛，於工坊縫製【極地厚毛防寒斗篷】永久禦寒！"
    },
    zone5_volcano: {
      zoneId: "zone5_volcano",
      name: "🔥 煉獄火毒灼燒",
      gearKey: "gear_heatShield",
      gearName: "冰蓮隔熱護心鏡",
      minX: 660,
      hpDrain: 14,
      hungerDrain: 3,
      warnMsg: "🔥 火山【煉獄高溫火毒】！請先在西側採集硫磺晶並結合冰蓮，於工坊打造【冰蓮隔熱護心鏡】！"
    },
    zone6_sky: {
      zoneId: "zone6_sky",
      name: "⚡ 星界落雷威壓",
      gearKey: "gear_skyAegis",
      gearName: "星隕避雷聖徽",
      minX: 660,
      hpDrain: 16,
      hungerDrain: 2,
      warnMsg: "⚡ 天界【星界落雷威壓】！請在工坊合成【星隕避雷聖徽】免疫雷罰！"
    }
  };

  function hasSurvivalGear(s, gearKey) {
    if (!s || !s.inventory) return false;
    return (s.inventory[gearKey] || 0) > 0;
  }

  // ================= 4. 定義《Survival RPG》素材、6大工具與 33 項遞進式配方 =================
  const NEW_SRPG_MATERIALS = {
    cryptKey:        { id: "cryptKey",        name: "遠古遺跡鑰匙",     tier: 2, desc: "【尋寶挖掘/工坊鍛造】用探險鐵鏟挖掘地面「✖」藏寶記號獲得，可解鎖各區的【🔒遠古地底遺跡】！" },
    ancientGem:      { id: "ancientGem",      name: "遠古秘寶晶石",     tier: 3, desc: "【地底遺跡/挖寶秘寶】蘊含遠古神力的璀璨晶石，可於工坊提煉永久提升攻防血量的遠古秘藥！" },
    elixirAtk:       { id: "elixirAtk",       name: "遠古力量秘藥",     tier: 3, desc: "【永久屬性秘藥】點擊「✨使用強化」飲用後，主角永久攻擊力 +6！" },
    elixirHp:        { id: "elixirHp",        name: "遠古生命聖水",     tier: 3, desc: "【永久屬性秘藥】點擊「✨使用強化」飲用後，主角永久最大生命值 +30！" },
    elixirDef:       { id: "elixirDef",       name: "遠古鐵壁靈液",     tier: 3, desc: "【永久屬性秘藥】點擊「✨使用強化」飲用後，主角永久防禦力 +5！" },
    venomSac:        { id: "venomSac",        name: "毒囊孢子",         tier: 1, desc: "【1區森林特產】採集自迷霧森林西側或毒菇妖掉落，可用於提煉抗瘴氣香囊。" },
    treeBark:        { id: "treeBark",        name: "堅韌樹皮",         tier: 1, desc: "【1區森林特產】剝自古老神木的厚樹皮，是製作清毒香囊與繩索的材料。" },
    coal:            { id: "coal",            name: "黑曜木炭",         tier: 1, desc: "【洞窟/高台礦產】由枯枝窯燒或於岩壁山洞開採，是冶煉精鋼錠與黑火藥的核心燃料。" },
    quartz:          { id: "quartz",          name: "透明石英砂",       tier: 2, desc: "【高台晶礦】採集自懸崖高台與山洞，可用於燒製永明石英提燈、護目鏡片與藥瓶。" },
    cactusFruit:     { id: "cactusFruit",     name: "多汁仙人掌",       tier: 2, desc: "【2區峽谷特產】富含清甜汁液的荒漠植物，可製作防沙護目水壺與解渴口糧。" },
    rockSalt:        { id: "rockSalt",        name: "結晶岩鹽",         tier: 1, desc: "【高台/海岸礦產】採集自懸崖高台，可醃製長效保存的岩鹽風乾肉脯。" },
    chitin:          { id: "chitin",          name: "堅硬甲殼",         tier: 2, desc: "【3區海岸/峽谷特產】巨蟹與毒蠍的防水甲殼，用於打造深海避水呼吸器。" },
    rawHide:         { id: "rawHide",         name: "荒野獸皮",         tier: 1, desc: "【狩獵戰利品】討伐野外魔物掉落，可加工為堅韌的鞣製硬皮革。" },
    thickPelt:       { id: "thickPelt",       name: "極地厚獸毛",       tier: 3, desc: "【4區雪原特產】極寒霜狼與雪原採集的厚重毛皮，是縫製防寒斗篷的核心材料。" },
    sulfur:          { id: "sulfur",          name: "火山硫磺晶",       tier: 3, desc: "【5區火山特產】採集自火山口的高純度硫磺，可打造隔熱護心鏡與重型炸彈。" },
    curedLeather:    { id: "curedLeather",    name: "鞣製硬皮革",       tier: 2, desc: "【進階強化材】以獸皮與松脂鞣製而成，點擊「✨使用強化」可永久提升防禦力 +3、最大HP +12！" },
    steelIngot:      { id: "steelIngot",      name: "百煉精鋼錠",       tier: 2, desc: "【高階強化材】以藍晶鐵礦與黑曜木炭高溫鍛打而成，點擊「✨使用強化」可永久提升攻擊力 +4！" },
    ropeLadder:      { id: "ropeLadder",      name: "攀岩繩梯",         tier: 1, desc: "【高低差開路工具】由麻繩與原木編織而成，可架設在各區南側懸崖壁上攀爬至高台礦區！" },
    rationJerky:     { id: "rationJerky",     name: "風乾肉脯",         tier: 2, desc: "【頂級求生口糧】以岩鹽醃製鮮魚與獸肉，食用立即恢復 +80% 飽食度與 +90 HP！" },
    gear_gasMask:    { id: "gear_gasMask",    name: "清毒草藥香囊",     tier: 2, desc: "【1區森林求生裝】佩戴後永久免疫翠風森林深處的「劇毒瘴氣」，並提升最大生命 +25！" },
    gear_lantern:    { id: "gear_lantern",    name: "永明石英提燈",     tier: 2, desc: "【洞窟求生裝】持有後永久免疫蘑菇洞窟與深淵地牢的「暗黑孢子侵蝕」，且不耗火把步數！" },
    gear_goggles:    { id: "gear_goggles",    name: "防沙護目水壺",     tier: 2, desc: "【2區峽谷求生裝】持有後永久免疫流沙峽谷的「酷熱流沙減速與脫水」，移動恢復敏捷！" },
    gear_diving:     { id: "gear_diving",     name: "深海避水呼吸器",   tier: 3, desc: "【3區海岸求生裝】持有後永久免疫翡翠海岸的「暗礁海蝕冷風」，並提升防禦力 +6！" },
    gear_furCoat:    { id: "gear_furCoat",    name: "極地厚毛防寒斗篷", tier: 3, desc: "【4區雪原求生裝】穿戴後永久免疫霜語雪原的「極寒暴雪凍傷」，並提升最大生命 +50！" },
    gear_heatShield: { id: "gear_heatShield", name: "冰蓮隔熱護心鏡",   tier: 4, desc: "【5區火山求生裝】持有後永久免疫熔岩火山的「煉獄火毒灼燒」，並提升攻擊力 +10！" },
    gear_skyAegis:   { id: "gear_skyAegis",   name: "星隕避雷聖徽",     tier: 4, desc: "【6區天界求生裝】持有後永久免疫天界聖殿的「星界落雷威壓」，且答對破盾威力強化！" }
  };

  // ★ 6 大採集與探索工具（新增第 6 把核心工具：shovel 探險鐵鏟，排成完美 3x2 六宮格！）
  const BUILTIN_TOOLS_DB = {
    axe: {
      id: "axe",
      name: "伐木手斧",
      iconKey: "icon_axe",
      tiers: {
        0: { name: "徒手拾荒", desc: "尚未裝備手斧，僅能拾取散落枯枝與初階特產。" },
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
    shovel: {
      id: "shovel",
      name: "探險鐵鏟",
      iconKey: "icon_shovel",
      tiers: {
        0: { name: "尚未持有鐵鏟", desc: "製作鐵鏟後，可挖掘各區地面上的「✖ 藏寶記號」獲取地底遺跡鑰匙與秘寶！" },
        1: { name: "Lv.1 精鐵探險鏟", cost: { wood: 2, iron: 1 }, gold: 0, desc: "【★尋寶必備】可挖掘全大陸地面「✖」藏寶點，挖出【遠古遺跡鑰匙】與【遠古秘寶晶石】！" },
        2: { name: "Lv.2 秘銀尋寶鏟", cost: { plank: 2, mithril: 1, steelIngot: 1 }, gold: 120, desc: "挖掘「✖」藏寶點時金幣收穫加倍，且必定額外挖出流沙秘銀或石英砂！" },
        3: { name: "Lv.3 星隕考古神鏟", cost: { obsidian: 1, starIron: 1, quartz: 2 }, gold: 260, desc: "傳奇考古神鏟！挖掘「✖」藏寶點必定獲得雙倍【遠古秘寶晶石】！" }
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

  // starter: true 代表初始預設已知配方；其餘進階配方會在玩家獲得任一關鍵材料時彈出「💡 領悟新配方」！
  const COMPLETE_WORKSHOP_RECIPES = [
    // --- 🛡️ 環境求生裝備與開路鑰匙 (gear) ---
    {
      id: "wk_rope_ladder",
      name: "攀岩繩梯 x1",
      category: "gear",
      starter: true,
      toKey: "ropeLadder",
      toCount: 1,
      cost: { rope: 1, wood: 2 },
      desc: "【★高低差開路必備】架設於各區南側的深啡色懸崖壁上，即可爬上黃土高台採集稀有礦脈！"
    },
    {
      id: "wk_crypt_key",
      name: "鍛造遺跡銅匙 x1",
      category: "gear",
      starter: false,
      unlockBy: ["coal", "steelIngot", "cryptKey", "quartz"],
      toKey: "cryptKey",
      toCount: 1,
      cost: { steelIngot: 1, coal: 2, quartz: 1 },
      desc: "【★地底遺跡開鎖】除用鐵鏟挖寶外，亦可用精鋼錠與石英砂直接鍛造【遠古遺跡鑰匙】，開啟各區地底遺跡！"
    },
    {
      id: "wk_gear_gasmask",
      name: "清毒草藥香囊",
      category: "gear",
      starter: true,
      unlockBy: ["venomSac", "treeBark"],
      toKey: "gear_gasMask",
      toCount: 1,
      isUniqueGear: true,
      cost: { venomSac: 2, treeBark: 2, herb: 2 },
      desc: "【★1區森林求生裝】永久免疫翠風森林深處的「☠️劇毒瘴氣」，並永久提升最大生命 +25！"
    },
    {
      id: "wk_gear_lantern",
      name: "永明石英提燈",
      category: "gear",
      starter: false,
      unlockBy: ["quartz", "coal"],
      toKey: "gear_lantern",
      toCount: 1,
      isUniqueGear: true,
      cost: { quartz: 2, coal: 2, iron: 1 },
      desc: "【★洞窟求生裝】永久照亮蘑菇洞窟與深淵地牢，免疫「🌑暗黑孢子侵蝕」且不耗火把！"
    },
    {
      id: "wk_gear_goggles",
      name: "防沙護目水壺",
      category: "gear",
      starter: false,
      unlockBy: ["cactusFruit", "curedLeather"],
      toKey: "gear_goggles",
      toCount: 1,
      isUniqueGear: true,
      cost: { cactusFruit: 2, quartz: 2, curedLeather: 1 },
      desc: "【★2區峽谷求生裝】永久免疫流沙峽谷的「🌪️酷熱流沙減速與脫水」，恢復全速移動！"
    },
    {
      id: "wk_gear_diving",
      name: "深海避水呼吸器",
      category: "gear",
      starter: false,
      unlockBy: ["chitin", "coral"],
      toKey: "gear_diving",
      toCount: 1,
      isUniqueGear: true,
      cost: { chitin: 2, coral: 2, quartz: 1 },
      desc: "【★3區海岸求生裝】永久免疫翡翠海岸的「🌊暗礁蝕骨海風」，並永久提升防禦力 +6！"
    },
    {
      id: "wk_gear_furcoat",
      name: "極地厚毛防寒斗篷",
      category: "gear",
      starter: false,
      unlockBy: ["thickPelt", "iceLotus"],
      toKey: "gear_furCoat",
      toCount: 1,
      isUniqueGear: true,
      cost: { thickPelt: 2, curedLeather: 2, coal: 2 },
      desc: "【★4區雪原求生裝】永久免疫霜語雪原的「❄️極寒暴雪凍傷」，並永久提升最大生命 +50！"
    },
    {
      id: "wk_gear_heatshield",
      name: "冰蓮隔熱護心鏡",
      category: "gear",
      starter: false,
      unlockBy: ["sulfur", "obsidian"],
      toKey: "gear_heatShield",
      toCount: 1,
      isUniqueGear: true,
      cost: { sulfur: 2, iceLotus: 2, steelIngot: 1 },
      desc: "【★5區火山求生裝】永久免疫熔岩火山的「🔥煉獄火毒灼燒」，並永久提升攻擊力 +10！"
    },
    {
      id: "wk_gear_skyaegis",
      name: "星隕避雷聖徽",
      category: "gear",
      starter: false,
      unlockBy: ["starIron", "goldLeaf"],
      toKey: "gear_skyAegis",
      toCount: 1,
      isUniqueGear: true,
      cost: { starIron: 1, obsidian: 1, quartz: 2 },
      desc: "【★6區天界求生裝】永久免疫天界聖殿的「⚡星界落雷威壓」，並提升破盾能力！"
    },
    {
      id: "wk_torch",
      name: "松脂火把 x2",
      category: "gear",
      starter: true,
      toKey: "torchItem",
      toCount: 2,
      cost: { branch: 1, resin: 1 },
      desc: "【地牢與黑夜照明】點燃後照亮黑霧地牢，並在黑夜戰鬥直接燒毀夜魔 1 層暗夜護盾！"
    },
    {
      id: "wk_bomb",
      name: "爆破炸彈 x2",
      category: "gear",
      starter: true,
      toKey: "bombItem",
      toCount: 2,
      cost: { flint: 2, clay: 1, resin: 1 },
      desc: "【秘境開路】可炸開各區與荒島地牢的「裂縫岩壁」開啟隱藏秘寶箱！"
    },
    {
      id: "wk_coal_bomb",
      name: "硫磺黑火藥炸彈 x3",
      category: "gear",
      starter: false,
      unlockBy: ["coal", "sulfur"],
      toKey: "bombItem",
      toCount: 3,
      cost: { coal: 2, flint: 1 },
      desc: "【高效爆破】以黑曜木炭調配火藥，一次大量製造 3 顆爆破炸彈！"
    },

    // --- 🔥 冶煉與加工建材 (smelt) ---
    {
      id: "wk_charcoal",
      name: "窯燒黑木炭 x2",
      category: "smelt",
      starter: true,
      toKey: "coal",
      toCount: 2,
      cost: { branch: 3 },
      desc: "【基礎冶煉】將 3 根散落枯枝悶燒成 2 塊高熱能黑曜木炭，用於冶煉精鋼錠。"
    },
    {
      id: "wk_steel_ingot",
      name: "百煉精鋼錠 x1",
      category: "smelt",
      starter: false,
      unlockBy: ["coal", "iron"],
      toKey: "steelIngot",
      toCount: 1,
      cost: { iron: 2, coal: 2 },
      desc: "【高溫冶煉】以鐵礦 x2 與黑曜木炭 x2 鍛造成精鋼錠（點擊「✨使用強化」永久提升主角攻擊力 +4！）。"
    },
    {
      id: "wk_cured_leather",
      name: "鞣製硬皮革 x1",
      category: "smelt",
      starter: false,
      unlockBy: ["rawHide"],
      toKey: "curedLeather",
      toCount: 1,
      cost: { rawHide: 2, resin: 1 },
      desc: "【皮革加工】將荒野獸皮與松脂鞣製成硬皮革（點擊「✨使用強化」永久提升防禦 +3 / 最大生命 +12！）。"
    },
    {
      id: "wk_bark_rope",
      name: "樹皮編織繩 x1",
      category: "smelt",
      starter: true,
      unlockBy: ["treeBark"],
      toKey: "rope",
      toCount: 1,
      cost: { treeBark: 2 },
      desc: "【森林製繩】將 2 塊堅韌樹皮搓成強韌麻繩索，方便快速合成攀岩繩梯。"
    },
    {
      id: "wk_plank",
      name: "加工厚木板 x1",
      category: "smelt",
      starter: true,
      toKey: "plank",
      toCount: 1,
      cost: { wood: 2 },
      desc: "【工程建材】將 2 塊翠風原木裁切為堅固的厚木板，用於修橋與升級大帆船。"
    },
    {
      id: "wk_rope",
      name: "強化麻繩索 x1",
      category: "smelt",
      starter: true,
      toKey: "rope",
      toCount: 1,
      cost: { vine: 2 },
      desc: "【工程建材】將 2 條堅韌藤蔓編織為麻繩索，是製作【攀岩繩梯】與吊橋的必備材料。"
    },
    {
      id: "wk_rope_hemp",
      name: "亞麻編織繩 x2",
      category: "smelt",
      starter: false,
      unlockBy: ["hemp"],
      toKey: "rope",
      toCount: 2,
      cost: { hemp: 2 },
      desc: "【高效製繩】以峽谷荒野亞麻一次編織出 2 條強韌麻繩索。"
    },
    {
      id: "wk_pitch",
      name: "防水松脂膠 x1",
      category: "smelt",
      starter: true,
      toKey: "pitch",
      toCount: 1,
      cost: { resin: 2, clay: 1 },
      desc: "【造船建材】混合琥珀松脂與河畔黏土熬製的防水塗料。"
    },
    {
      id: "wk_nails",
      name: "鍛造鐵釘 x2",
      category: "smelt",
      starter: true,
      toKey: "nails",
      toCount: 2,
      cost: { iron: 1 },
      desc: "【工程建材】將藍晶鐵礦鍛打為工程鐵釘。"
    },
    {
      id: "wk_steel_cable",
      name: "秘銀強化鋼索 x1",
      category: "smelt",
      starter: false,
      unlockBy: ["mithril"],
      toKey: "steelCable",
      toCount: 1,
      cost: { mithril: 1, rope: 1 },
      desc: "【高階建材】融合流沙秘銀與麻繩索打造的超強韌鋼索。"
    },
    {
      id: "wk_heavy_sail",
      name: "防風重帆布 x1",
      category: "smelt",
      starter: false,
      unlockBy: ["sailCloth"],
      toKey: "heavySail",
      toCount: 1,
      cost: { sailCloth: 2, rope: 1 },
      desc: "【遠航建材】縫合幽靈古帆布與麻繩，用於建造破浪遠洋大帆船。"
    },
    {
      id: "wk_warm_fur",
      name: "禦寒獸毛氈 x1",
      category: "smelt",
      starter: false,
      unlockBy: ["sinew", "thickPelt"],
      toKey: "warmFur",
      toCount: 1,
      cost: { sinew: 2, hemp: 1 },
      desc: "【極地建材】搭建雪原防風避難屋與高階防寒護甲的保暖毛氈。"
    },

    // --- 🍖 口糧、靈藥與遠古秘寶鍊金 (survival) ---
    {
      id: "wk_elixir_atk",
      name: "遠古力量秘藥 (ATK+6)",
      category: "survival",
      starter: false,
      unlockBy: ["ancientGem"],
      toKey: "elixirAtk",
      toCount: 1,
      cost: { ancientGem: 1, quartz: 1, herb: 2 },
      desc: "【★地底遺跡秘傳】將遠古秘寶晶石提煉為力量秘藥，點擊「✨使用強化」永久提升主角攻擊力 +6！"
    },
    {
      id: "wk_elixir_hp",
      name: "遠古生命聖水 (HP+30)",
      category: "survival",
      starter: false,
      unlockBy: ["ancientGem"],
      toKey: "elixirHp",
      toCount: 1,
      cost: { ancientGem: 1, flower: 1, herb: 2 },
      desc: "【★地底遺跡秘傳】將遠古秘寶晶石提煉為生命聖水，點擊「✨使用強化」永久提升最大生命 +30！"
    },
    {
      id: "wk_elixir_def",
      name: "遠古鐵壁靈液 (DEF+5)",
      category: "survival",
      starter: false,
      unlockBy: ["ancientGem"],
      toKey: "elixirDef",
      toCount: 1,
      cost: { ancientGem: 1, iron: 2 },
      desc: "【★地底遺跡秘傳】將遠古秘寶晶石提煉為鐵壁靈液，點擊「✨使用強化」永久提升主角防禦力 +5！"
    },
    {
      id: "wk_ration_jerky",
      name: "岩鹽風乾肉脯 x2",
      category: "survival",
      starter: false,
      unlockBy: ["rockSalt"],
      toKey: "rationJerky",
      toCount: 2,
      cost: { fish: 1, rockSalt: 1 },
      desc: "【頂級口糧】以高台結晶岩鹽醃製鮮魚，食用每份恢復 +80% 飽食度與 +90 HP！"
    },
    {
      id: "wk_cactus_ration",
      name: "仙人掌清涼飲 x2",
      category: "survival",
      starter: false,
      unlockBy: ["cactusFruit"],
      toKey: "rationFish",
      toCount: 2,
      cost: { cactusFruit: 1, herb: 1 },
      desc: "【沙漠甘露】將多汁仙人掌與微光菇調製成清涼補給飲（等同 2 份鮮魚乾口糧，+60%飽食/+60HP）！"
    },
    {
      id: "wk_ration_herb",
      name: "烘烤微光菇乾 x2",
      category: "survival",
      starter: true,
      toKey: "rationHerb",
      toCount: 2,
      cost: { herb: 1, branch: 1 },
      desc: "【基礎口糧】食用每份可恢復 +35% 飽食度與 +25 HP。"
    },
    {
      id: "wk_ration_fish",
      name: "炭烤鮮魚乾 x2",
      category: "survival",
      starter: true,
      toKey: "rationFish",
      toCount: 2,
      cost: { fish: 1, branch: 1 },
      desc: "【進階口糧】食用每份可恢復 +60% 飽食度與 +60 HP。"
    },
    {
      id: "wk_alchemy_heal",
      name: "精煉生命藥水 x2",
      category: "survival",
      starter: false,
      unlockBy: ["quartz"],
      toKey: "potionHeal",
      toCount: 2,
      cost: { herb: 2, quartz: 1 },
      desc: "【隨身鍊金】以微光菇 x2 與高台石英砂燒製的玻璃瓶，免費提煉 2 瓶生命藥水！"
    },
    {
      id: "wk_alchemy_hint",
      name: "精煉洞察藥水 x2",
      category: "survival",
      starter: false,
      unlockBy: ["quartz", "flower"],
      toKey: "potionHint",
      toCount: 2,
      cost: { flower: 1, resin: 1, quartz: 1 },
      desc: "【隨身鍊金】以太陽花、松脂與高台石英砂提煉 2 瓶洞察藥水！"
    }
  ];

  const REMOVED_DUPLICATE_WEAPON_IDS = ["w_srpg_machete", "w_srpg_quartz_blade", "w_srpg_highland_axe"];
  const REMOVED_DUPLICATE_ARMOR_IDS  = ["a_srpg_leather", "a_srpg_steel_mail", "a_srpg_highland_plate"];

  // ================= 5. 完整 15 項公會求生、鐵鏟挖寶與地底遺跡懸賞任務 =================
  const EXTRA_SURVIVAL_QUESTS = [
    {
      id: "sq_01_ladder",
      title: "1.【高台開拓】編織攀岩繩梯",
      giver: "老獵人・雷恩",
      zone: "1.翠風迷霧森林",
      desc: "在工坊合成【攀岩繩梯 x1】(麻繩x1+原木x2)，並前往第1區森林南側懸崖架設繩梯爬上黃土高台。",
      rewardExp: 140,
      rewardGold: 160,
      check: function(s) {
        return Boolean((s.riggedCliffs && Object.keys(s.riggedCliffs).length > 0) || (s.inventory && s.inventory.ropeLadder > 0));
      }
    },
    {
      id: "sq_01b_shovel",
      title: "2.【尋寶工具】打造精鐵探險鏟",
      giver: "矮人鐵匠・巴爾",
      zone: "0.曙光營地",
      desc: "在【工坊 ➔ ⛏️工具】使用翠風原木x2與藍晶鐵礦x1，打造出第6把核心工具【Lv.1 精鐵探險鏟】。",
      rewardExp: 150,
      rewardGold: 180,
      check: function(s) { return Boolean(s.tools && (s.tools.shovel || 0) >= 1); }
    },
    {
      id: "sq_01c_dig",
      title: "3.【地底尋寶】挖掘「✖」藏寶記號",
      giver: "行商・奇奇",
      zone: "各區野外草地與高台",
      desc: "持探險鐵鏟走到野外地面的「✖ 藏寶點」按 A 鍵挖掘，找尋埋藏的【遠古遺跡鑰匙】與【遠古秘寶晶石】。",
      rewardExp: 200,
      rewardGold: 240,
      check: function(s) {
        return Boolean(
          s.dugTreasureOnce ||
          (s.inventory && (s.inventory.cryptKey > 0 || s.inventory.ancientGem > 0)) ||
          (s.unlockedCrypts && Object.keys(s.unlockedCrypts).length > 0)
        );
      }
    },
    {
      id: "sq_01d_crypt",
      title: "4.【地底遺跡】解鎖古老遺跡石門",
      giver: "公會會長・艾莉婭",
      zone: "各區高台東側 (x:925, y:1015)",
      desc: "使用挖寶或鍛造獲得的【遠古遺跡鑰匙 x1】，解鎖任意區域的【🔒地底遺跡石門】並進入探索。",
      rewardExp: 320,
      rewardGold: 360,
      check: function(s) { return Boolean(s.unlockedCrypts && Object.keys(s.unlockedCrypts).length > 0); }
    },
    {
      id: "sq_02_grotto",
      title: "5.【岩壁秘境】開採高台石英與木炭",
      giver: "矮人鐵匠・巴爾",
      zone: "各區南側懸崖山洞",
      desc: "進入懸崖壁上的黑色山洞或爬上黃土高台，開採獲得【透明石英砂 x1】與【黑曜木炭 x1】。",
      rewardExp: 160,
      rewardGold: 180,
      check: function(s) {
        return Boolean(
          (s.inventory && (s.inventory.quartz > 0 || s.inventory.coal > 0)) ||
          hasSurvivalGear(s, "gear_lantern") ||
          (s.srpgBonusAtk || 0) > 0
        );
      }
    },
    {
      id: "sq_03_gasmask",
      title: "6.【森林求生】對抗劇毒瘴氣",
      giver: "草藥師・梅姑",
      zone: "1.翠風迷霧森林",
      desc: "在森林西側安全區採集毒囊孢子x2、堅韌樹皮x2、微光菇x2，於工坊合成【清毒草藥香囊】免疫森林毒瘴。",
      rewardExp: 200,
      rewardGold: 220,
      check: function(s) { return hasSurvivalGear(s, "gear_gasMask"); }
    },
    {
      id: "sq_04_lantern",
      title: "7.【幽窟求生】打造永明石英提燈",
      giver: "矮人鐵匠・巴爾",
      zone: "1-B.微光蘑菇洞窟",
      desc: "收集透明石英砂x2、黑曜木炭x2、藍晶鐵礦x1，於工坊合成【永明石英提燈】免疫洞窟暗黑孢子。",
      rewardExp: 250,
      rewardGold: 280,
      check: function(s) { return hasSurvivalGear(s, "gear_lantern"); }
    },
    {
      id: "sq_05_steel",
      title: "8.【高溫冶煉】鍛打百煉精鋼錠",
      giver: "矮人鐵匠・巴爾",
      zone: "0.曙光營地",
      desc: "以藍晶鐵礦x2與黑曜木炭x2冶煉出【百煉精鋼錠】，並可點擊「使用強化」永久提升攻擊力。",
      rewardExp: 280,
      rewardGold: 300,
      check: function(s) { return Boolean((s.srpgBonusAtk || 0) > 0 || (s.inventory && s.inventory.steelIngot > 0)); }
    },
    {
      id: "sq_06_leather",
      title: "9.【皮革鞣製】加固鞣製硬皮革",
      giver: "老獵人・雷恩",
      zone: "0.曙光營地",
      desc: "討伐魔物收集荒野獸皮x2並結合琥珀松脂x1，於工坊加工出【鞣製硬皮革】強化防具。",
      rewardExp: 280,
      rewardGold: 300,
      check: function(s) {
        return Boolean(
          (s.srpgBonusDef || 0) > 0 ||
          (s.inventory && s.inventory.curedLeather > 0) ||
          hasSurvivalGear(s, "gear_goggles") ||
          hasSurvivalGear(s, "gear_furCoat")
        );
      }
    },
    {
      id: "sq_07_jerky",
      title: "10.【荒野醃製】製作岩鹽風乾肉脯",
      giver: "老漁夫・阿海",
      zone: "0.曙光營地",
      desc: "在懸崖高台採集結晶岩鹽x1並結合銀鱗鮮魚x1，於工坊醃製出頂級口糧【岩鹽風乾肉脯】。",
      rewardExp: 240,
      rewardGold: 260,
      check: function(s) { return Boolean(s.craftedJerkyOnce || (s.inventory && s.inventory.rationJerky > 0)); }
    },
    {
      id: "sq_08_goggles",
      title: "11.【峽谷求生】穿越酷熱流沙風暴",
      giver: "斥候隊長・凱爾",
      zone: "2.流沙繩索峽谷",
      desc: "在峽谷西側採集多汁仙人掌x2、透明石英砂x2與硬皮革x1，合成【防沙護目水壺】免疫流沙減速。",
      rewardExp: 380,
      rewardGold: 400,
      check: function(s) { return hasSurvivalGear(s, "gear_goggles"); }
    },
    {
      id: "sq_09_diving",
      title: "12.【海岸求生】深海避水呼吸器",
      giver: "老船匠・達克",
      zone: "3.翡翠沉船海岸",
      desc: "在海岸西側收集堅硬甲殼x2、深海珊瑚x2與石英砂x1，合成【深海避水呼吸器】克服暗礁急流。",
      rewardExp: 500,
      rewardGold: 520,
      check: function(s) { return hasSurvivalGear(s, "gear_diving"); }
    },
    {
      id: "sq_10_furcoat",
      title: "13.【極地求生】抵禦暴雪凍傷",
      giver: "冰原獵手・弗雷",
      zone: "4.霜語極寒雪原",
      desc: "在雪原西側收集極地厚獸毛x2、鞣製硬皮革x2與黑木炭x2，縫製【極地厚毛防寒斗篷】免疫凍傷。",
      rewardExp: 680,
      rewardGold: 700,
      check: function(s) { return hasSurvivalGear(s, "gear_furCoat"); }
    },
    {
      id: "sq_11_heatshield",
      title: "14.【火山求生】打造冰蓮隔熱鏡",
      giver: "紅蓮學者・伊格",
      zone: "5.赤紅熔岩火山",
      desc: "收集火山硫磺晶x2、極地冰蓮x2與百煉精鋼錠x1，合成【冰蓮隔熱護心鏡】免疫火山煉獄火毒。",
      rewardExp: 880,
      rewardGold: 920,
      check: function(s) { return hasSurvivalGear(s, "gear_heatShield"); }
    },
    {
      id: "sq_12_skyaegis",
      title: "15.【天界求生】凝聚星隕避雷聖徽",
      giver: "破曉大賢者",
      zone: "6.天界浮空聖殿",
      desc: "收集深淵星隕鐵x1、熔岩黑曜石x1與透明石英砂x2，合成【星隕避雷聖徽】免疫天界落雷威壓。",
      rewardExp: 1200,
      rewardGold: 1500,
      check: function(s) { return hasSurvivalGear(s, "gear_skyAegis"); }
    }
  ];

  // ================= 6. 💡 領悟配方檢定系統 (Recipe Discovery Engine) =================
  function syncDiscoveredMaterialsAndRecipes(s, notifyNew) {
    if (!s) return;
    if (!s.knownMaterials) s.knownMaterials = {};
    if (!s.discoveredRecipes) s.discoveredRecipes = {};

    // 記錄背包中所有持有過的材料
    Object.keys(s.inventory || {}).forEach(function(matKey) {
      if ((s.inventory[matKey] || 0) > 0) {
        s.knownMaterials[matKey] = true;
      }
    });

    const newlyInspired = [];
    COMPLETE_WORKSHOP_RECIPES.forEach(function(rec) {
      if (s.discoveredRecipes[rec.id]) return;

      if (rec.starter) {
        s.discoveredRecipes[rec.id] = true;
        return;
      }

      // 只要玩家曾經收集過此配方的任一關鍵材料（或任何一項合成材料），即自動領悟該配方！
      const unlockKeys = rec.unlockBy || Object.keys(rec.cost || {});
      const hasSeenKey = unlockKeys.some(function(k) {
        return Boolean(s.knownMaterials[k] || (s.inventory && s.inventory[k] > 0));
      });

      if (hasSeenKey) {
        s.discoveredRecipes[rec.id] = true;
        newlyInspired.push(rec.name.replace(/\s*x\d+$/i, ""));
      }
    });

    if (notifyNew && newlyInspired.length > 0 && window.Aetheria.UI) {
      setTimeout(function() {
        window.Aetheria.UI.showToast("💡 領悟新配方：【" + newlyInspired.slice(0, 2).join("、") + "】！可於工坊查看！");
      }, 380);
    }
  }

  function isRecipeDiscovered(s, rec) {
    if (!rec) return true;
    if (rec.starter) return true;
    if (s && s.discoveredRecipes && s.discoveredRecipes[rec.id]) return true;
    const costKeys = Object.keys(rec.cost || {});
    return costKeys.some(function(k) {
      return Boolean((s && s.knownMaterials && s.knownMaterials[k]) || (s && s.inventory && s.inventory[k] > 0));
    });
  }

  function registerSrpgDataIntoGame() {
    const Data = window.Aetheria.Data;
    if (!Data) return;

    if (Data.MATERIALS) {
      Object.keys(NEW_SRPG_MATERIALS).forEach(function(k) {
        Data.MATERIALS[k] = NEW_SRPG_MATERIALS[k];
      });
    }

    if (Data.WEAPONS) {
      REMOVED_DUPLICATE_WEAPON_IDS.forEach(function(wid) {
        delete Data.WEAPONS[wid];
      });
    }
    if (Data.ARMORS) {
      REMOVED_DUPLICATE_ARMOR_IDS.forEach(function(aid) {
        delete Data.ARMORS[aid];
      });
    }

    const s = window.Aetheria.State && window.Aetheria.State.data;
    if (s) {
      if (!s.tools) s.tools = { axe: 0, pickaxe: 0, shovel: 0, rod: 0, hook: 0, pouch: 0 };
      if (s.tools.shovel === undefined) s.tools.shovel = 0;

      if (Array.isArray(s.unlockedWeapons)) {
        s.unlockedWeapons = s.unlockedWeapons.filter(function(id) {
          return REMOVED_DUPLICATE_WEAPON_IDS.indexOf(id) === -1;
        });
      }
      if (s.equippedWeapon && REMOVED_DUPLICATE_WEAPON_IDS.indexOf(s.equippedWeapon) !== -1) {
        s.equippedWeapon = (s.unlockedWeapons && s.unlockedWeapons.length > 0)
          ? s.unlockedWeapons[s.unlockedWeapons.length - 1]
          : "w_wood";
      }
      if (Array.isArray(s.unlockedArmors)) {
        s.unlockedArmors = s.unlockedArmors.filter(function(id) {
          return REMOVED_DUPLICATE_ARMOR_IDS.indexOf(id) === -1;
        });
      }
      if (s.equippedArmor && REMOVED_DUPLICATE_ARMOR_IDS.indexOf(s.equippedArmor) !== -1) {
        s.equippedArmor = (s.unlockedArmors && s.unlockedArmors.length > 0)
          ? s.unlockedArmors[s.unlockedArmors.length - 1]
          : "a_cloth";
      }

      syncDiscoveredMaterialsAndRecipes(s, false);
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

  // ================= 7. 各區配置、山洞 (grotto_*) 與隱藏地底遺跡 (crypt_*) 子迷宮 =================
  const HIGHLAND_ZONES = {
    zone1_forest: {
      targetW: 2100, targetH: 1320,
      ores: ["quartz", "coal", "rockSalt", "quartz"],
      grottoOres: ["quartz", "coal", "quartz", "rockSalt", "coal", "iron"],
      safeZoneNodes: [
        { key: "venomSac", type: "wood" }, { key: "treeBark", type: "wood" },
        { key: "venomSac", type: "wood" }, { key: "treeBark", type: "wood" },
        { key: "venomSac", type: "wood" }, { key: "treeBark", type: "wood" },
        { key: "herb",     type: "wood" }
      ],
      deepBiomeNodes: [
        { key: "wood",     type: "wood" },    { key: "vine",     type: "wood" },
        { key: "herb",     type: "wood" },    { key: "resin",    type: "wood" },
        { key: "iron",     type: "crystal" }, { key: "venomSac", type: "wood" },
        { key: "treeBark", type: "wood" },    { key: "iron",     type: "crystal" }
      ],
      eliteName: "★劇毒瘴氣樹魔",
      cryptName: "翠風古老樹根地窖",
      cryptBoss: "★遠古樹根守衛魔像"
    },
    cave1_mushroom: {
      targetW: 1960, targetH: 1260,
      ores: ["quartz", "coal", "mithril", "quartz"],
      grottoOres: ["quartz", "coal", "mithril", "quartz", "coal", "basalt"],
      safeZoneNodes: [
        { key: "quartz", type: "crystal" }, { key: "coal",   type: "crystal" },
        { key: "quartz", type: "crystal" }, { key: "coal",   type: "crystal" },
        { key: "quartz", type: "crystal" }, { key: "coal",   type: "crystal" },
        { key: "iron",   type: "crystal" }
      ],
      deepBiomeNodes: [
        { key: "mithril", type: "crystal" }, { key: "herb",    type: "wood" },
        { key: "basalt",  type: "crystal" }, { key: "mithril", type: "crystal" },
        { key: "quartz",  type: "crystal" }, { key: "iron",    type: "crystal" }
      ],
      eliteName: "★蝕心晶簇巨怪",
      cryptName: "幽窟地底秘銀聖堂",
      cryptBoss: "★秘銀晶簇鎮守魔像"
    },
    zone2_canyon: {
      targetW: 2100, targetH: 1320,
      ores: ["quartz", "mithril", "rockSalt", "coal"],
      grottoOres: ["quartz", "coal", "mithril", "quartz", "basalt", "rockSalt"],
      safeZoneNodes: [
        { key: "cactusFruit", type: "wood" },    { key: "quartz",      type: "crystal" },
        { key: "cactusFruit", type: "wood" },    { key: "quartz",      type: "crystal" },
        { key: "cactusFruit", type: "wood" },    { key: "hemp",        type: "wood" },
        { key: "resin",       type: "wood" }
      ],
      deepBiomeNodes: [
        { key: "mithril",     type: "crystal" }, { key: "basalt",      type: "crystal" },
        { key: "flower",      type: "wood" },    { key: "hemp",        type: "wood" },
        { key: "chitin",      type: "crystal" }, { key: "mithril",     type: "crystal" }
      ],
      eliteName: "★狂沙重甲蠍王",
      cryptName: "流沙埋沒法老王陵",
      cryptBoss: "★荒漠王陵黃金魔像"
    },
    zone3_coast: {
      targetW: 2100, targetH: 1320,
      ores: ["coral", "rockSalt", "quartz", "mithril"],
      grottoOres: ["coral", "quartz", "rockSalt", "coal", "mithril", "coral"],
      safeZoneNodes: [
        { key: "chitin",   type: "crystal" }, { key: "coral",    type: "crystal" },
        { key: "chitin",   type: "crystal" }, { key: "coral",    type: "crystal" },
        { key: "chitin",   type: "crystal" }, { key: "coral",    type: "crystal" },
        { key: "quartz",   type: "crystal" }
      ],
      deepBiomeNodes: [
        { key: "sailCloth", type: "wood" },    { key: "coral",     type: "crystal" },
        { key: "mithril",   type: "crystal" }, { key: "rockSalt",  type: "crystal" },
        { key: "hemp",      type: "wood" },    { key: "chitin",    type: "crystal" }
      ],
      eliteName: "★暗礁鐵甲海魔",
      cryptName: "海底亞特蘭蒂斯密室",
      cryptBoss: "★深海遺跡三叉戟魔像"
    },
    zone4_snow: {
      targetW: 2100, targetH: 1320,
      ores: ["obsidian", "rockSalt", "quartz", "iceLotus"],
      grottoOres: ["coal", "obsidian", "quartz", "mithril", "coal", "rockSalt"],
      safeZoneNodes: [
        { key: "thickPelt", type: "wood" },    { key: "coal",      type: "crystal" },
        { key: "thickPelt", type: "wood" },    { key: "coal",      type: "crystal" },
        { key: "thickPelt", type: "wood" },    { key: "iceLotus",  type: "wood" },
        { key: "iceLotus",  type: "wood" }
      ],
      deepBiomeNodes: [
        { key: "iceLotus",  type: "wood" },    { key: "obsidian",  type: "crystal" },
        { key: "sinew",     type: "wood" },    { key: "thickPelt", type: "wood" },
        { key: "obsidian",  type: "crystal" }, { key: "basalt",    type: "crystal" }
      ],
      eliteName: "★極寒暴雪魔狼皇",
      cryptName: "永凍冰河遠古神殿",
      cryptBoss: "★極寒永凍冰晶魔像"
    },
    zone5_volcano: {
      targetW: 2100, targetH: 1320,
      ores: ["starIron", "obsidian", "sulfur", "quartz"],
      grottoOres: ["sulfur", "starIron", "obsidian", "coal", "sulfur", "iron"],
      safeZoneNodes: [
        { key: "sulfur",   type: "crystal" }, { key: "coal",     type: "crystal" },
        { key: "sulfur",   type: "crystal" }, { key: "iron",     type: "crystal" },
        { key: "sulfur",   type: "crystal" }, { key: "iceLotus", type: "wood" },
        { key: "obsidian", type: "crystal" }
      ],
      deepBiomeNodes: [
        { key: "obsidian", type: "crystal" }, { key: "starIron", type: "crystal" },
        { key: "sulfur",   type: "crystal" }, { key: "obsidian", type: "crystal" },
        { key: "mithril",  type: "crystal" }, { key: "starIron", type: "crystal" }
      ],
      eliteName: "★煉獄硫磺炎魔將",
      cryptName: "地心黑曜熔爐秘殿",
      cryptBoss: "★地心黑曜神鐵魔像"
    },
    zone6_sky: {
      targetW: 2100, targetH: 1320,
      ores: ["starIron", "goldLeaf", "quartz", "obsidian"],
      grottoOres: ["starIron", "obsidian", "quartz", "goldLeaf", "starIron", "quartz"],
      safeZoneNodes: [
        { key: "starIron", type: "crystal" }, { key: "obsidian", type: "crystal" },
        { key: "quartz",   type: "crystal" }, { key: "quartz",   type: "crystal" },
        { key: "starIron", type: "crystal" }, { key: "obsidian", type: "crystal" },
        { key: "goldLeaf", type: "wood" }
      ],
      deepBiomeNodes: [
        { key: "starIron", type: "crystal" }, { key: "goldLeaf", type: "wood" },
        { key: "obsidian", type: "crystal" }, { key: "goldLeaf", type: "wood" },
        { key: "starIron", type: "crystal" }, { key: "quartz",   type: "crystal" }
      ],
      eliteName: "★星界雷罰審判者",
      cryptName: "星界破曉創世密室",
      cryptBoss: "★創世星隕守護神像"
    }
  };

  const grottoMapsCache = {};
  const cryptMapsCache = {};

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
        perfect: true,
        isClusterBoulder: true,
        name: mInfo.name,
        opened: false
      });
    });

    // 山洞內亦埋藏 1 個 ✖ 藏寶挖掘點
    nodes.push({
      id: "grotto_dig_" + parentZoneId + "_" + Date.now(),
      x: 240,
      y: 205,
      type: "crystal",
      giveKey: "cryptKey",
      isBuriedSpot: true,
      reqToolLv: 0,
      name: "✖藏寶點",
      opened: false
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

  // ★ 建立【🗝️ 隱藏地底古老遺跡 (crypt_<zoneId>)】獨立子迷宮
  function buildAncientCryptMap(parentZoneId) {
    const cfg = HIGHLAND_ZONES[parentZoneId] || HIGHLAND_ZONES.zone1_forest;
    const matsDB = (window.Aetheria.Data && window.Aetheria.Data.MATERIALS) || {};
    const parentMap = (window.Aetheria.Data && window.Aetheria.Data.Maps && window.Aetheria.Data.Maps.getMap(parentZoneId)) || { recLv: 5 };
    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
    const vaultClaimed = Boolean(s.claimedCryptVaults && s.claimedCryptVaults[parentZoneId]);

    const nodes = [
      // 頂部中央：遠古聖物石棺寶箱（需擊敗遺跡守衛魔像方可開啟）
      {
        id: "crypt_vault_" + parentZoneId,
        x: 280,
        y: 85,
        type: "chest",
        name: "遠古聖物石棺",
        isCryptVaultChest: true,
        parentZoneId: parentZoneId,
        opened: vaultClaimed
      }
    ];

    // 四角富集礦脈
    const cryptOrePos = [
      { x: 115, y: 115 }, { x: 445, y: 115 },
      { x: 115, y: 245 }, { x: 445, y: 245 }
    ];
    cryptOrePos.forEach(function(pt, idx) {
      const giveKey = cfg.ores[idx % cfg.ores.length];
      const mInfo = matsDB[giveKey] || { name: giveKey };
      nodes.push({
        id: "crypt_ore_" + parentZoneId + "_" + idx + "_" + Date.now(),
        x: pt.x,
        y: pt.y,
        type: "crystal",
        giveKey: giveKey,
        reqTool: "pickaxe",
        reqToolLv: 0,
        perfect: true,
        isClusterBoulder: true,
        name: "遺跡" + mInfo.name,
        opened: false
      });
    });

    const bossLv = Math.max(4, (parentMap.recLv || 3) + 3);
    const monsters = [
      {
        id: "crypt_guardian_" + parentZoneId + "_" + Date.now(),
        name: cfg.cryptBoss || "★遠古遺跡守衛魔像",
        lv: bossLv,
        x: 280,
        y: 165,
        homeX: 280,
        homeY: 165,
        type: "boss",
        isBoss: false,
        isShiny: true,
        isSrpgElite: true,
        isCryptGuardian: true,
        alive: true
      }
    ];

    return {
      id: "crypt_" + parentZoneId,
      parentZoneId: parentZoneId,
      _refreshToken: Date.now(),
      name: cfg.cryptName || "遠古地底遺跡",
      recLv: bossLv,
      bgm: "cave",
      theme: "cave",
      rain: false,
      fog: false,
      hasRiver: false,
      width: 560,
      height: 360,
      dirtBlobs: [
        { cx: 280, cy: 175, rx: 220, ry: 135 }
      ],
      trees: [],
      decos: [
        { x: 205, y: 82,  sprite: "brazier_on",   w: 26, h: 28, solid: true },
        { x: 355, y: 82,  sprite: "brazier_on",   w: 26, h: 28, solid: true },
        { x: 205, y: 175, sprite: "seal_pillar_on", w: 28, h: 32, solid: true },
        { x: 355, y: 175, sprite: "seal_pillar_on", w: 28, h: 32, solid: true }
      ],
      nodes: nodes,
      npcs: [],
      monsters: monsters,
      portals: [
        {
          id: "p_exit_crypt_" + parentZoneId,
          name: "離開地底遺跡 ▾",
          x: 280,
          y: 318,
          targetZone: parentZoneId,
          targetX: 935,
          targetY: 1055,
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
    const cryptUnlocked = Boolean(s.unlockedCrypts && s.unlockedCrypts[mapObj.id]);

    const oldW = mapObj._origBaseWidth || mapObj.width || 1200;
    const oldH = mapObj._origBaseHeight || mapObj.height || 680;
    mapObj._origBaseWidth = oldW;
    mapObj._origBaseHeight = oldH;

    mapObj.width = Math.max(oldW, cfg.targetW);
    mapObj.height = Math.max(oldH, cfg.targetH);

    const SHIFT_DX = 650;
    if (!mapObj._deepSanctumShifted) {
      mapObj._deepSanctumShifted = true;
      if (mapObj.hasRiver) {
        mapObj.riverX = (mapObj.riverX || 1030) + SHIFT_DX;
      }
      (mapObj.decos || []).forEach(function(d) {
        if (d.x >= 960) d.x += SHIFT_DX;
      });
      (mapObj.portals || []).forEach(function(p) {
        if (p.x >= 960) p.x += SHIFT_DX;
      });
      (mapObj.npcs || []).forEach(function(n) {
        if (n.x >= 960) n.x += SHIFT_DX;
      });
      (mapObj.dirtBlobs || []).forEach(function(b) {
        if (b.cx && b.cx >= 960) b.cx += SHIFT_DX;
        if (b.x && b.x >= 960) b.x += SHIFT_DX;
      });
    }

    (mapObj.portals || []).forEach(function(p) {
      if (p.targetZone && HIGHLAND_ZONES[p.targetZone] && p.targetX && p.targetX >= 920 && p.targetX < 1500 && !p._targetShifted) {
        p._targetShifted = true;
        p.targetX += SHIFT_DX;
      }
    });

    (mapObj.monsters || []).forEach(function(m) {
      if (m.isBoss && m.x < 1500 && mapObj.width >= 2000) {
        m.x += SHIFT_DX;
        m.homeX = m.x;
      }
    });
    (mapObj.nodes || []).forEach(function(n) {
      if (n.type === "chest" && !n.isPuzzleVaultChest && n.x >= 960 && n.x < 1500 && !n._chestShifted) {
        n._chestShifted = true;
        n.x += SHIFT_DX;
      }
    });

    if (mapObj.trees) {
      mapObj.trees = mapObj.trees.filter(function(t) {
        if (t.isExpandedPerimeterTree) return false;
        if (t.y >= oldH - 72) return false;
        if (t.x >= oldW - 68) return false;
        if (t.x >= 180 && t.x <= 990 && t.y >= 740 && t.y <= 1120) return false;
        if (mapObj.hasRiver && Math.abs(t.x - (mapObj.riverX || 1680)) < 55) return false;
        return true;
      });

      for (let bx = 20; bx < mapObj.width - 20; bx += 42) {
        if (mapObj.hasRiver && Math.abs(bx - (mapObj.riverX || 1680)) < 52) continue;
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
      const midForestCoords = [
        { x: 1080, y: 180 }, { x: 1240, y: 220 }, { x: 1420, y: 160 },
        { x: 1150, y: 480 }, { x: 1360, y: 520 }, { x: 1510, y: 440 },
        { x: 1080, y: 780 }, { x: 1280, y: 860 }, { x: 1460, y: 740 },
        { x: 1160, y: 1080 }, { x: 1380, y: 1120 }, { x: 345, y: 1065 }, { x: 405, y: 1080 }
      ];
      midForestCoords.forEach(function(pt) {
        mapObj.trees.push({ x: pt.x, y: pt.y, isExpandedPerimeterTree: true });
      });
    }

    if (mapObj.nodes) {
      mapObj.nodes.forEach(function(n, idx) {
        if (n.isHighlandOre || n.type === "chest") return;
        const inCliff = isBlockedByCliffFromLowland(n.x, n.y);
        const inRiver = Boolean(mapObj.hasRiver && Math.abs(n.x - (mapObj.riverX || 1680)) < 52);
        if (inCliff || inRiver) {
          n.x = 980 + ((idx * 95) % 520);
          n.y = 180 + ((idx * 130) % 520);
        }
      });
    }
    if (mapObj.monsters) {
      mapObj.monsters.forEach(function(m, idx) {
        if (m.isBoss) return;
        const inCliff = isBlockedByCliffFromLowland(m.x, m.y);
        const inRiver = Boolean(mapObj.hasRiver && Math.abs(m.x - (mapObj.riverX || 1680)) < 52);
        if (inCliff || inRiver) {
          m.x = 960 + ((idx * 110) % 540);
          m.y = 220 + ((idx * 140) % 480);
          m.homeX = m.x;
          m.homeY = m.y;
        }
      });
    }

    mapObj.dirtBlobs = (mapObj.dirtBlobs || []).filter(function(b) { return !b.isExpandedBlob; });
    mapObj.dirtBlobs.push(
      { cx: 280,  cy: 820,  rx: 95,  ry: 210, isExpandedBlob: true },
      { cx: 520,  cy: 1025, rx: 195, ry: 75,  isExpandedBlob: true },
      { cx: 955,  cy: 1025, rx: 85,  ry: 70,  isExpandedBlob: true }, // 地底遺跡門前石板路
      { cx: 1280, cy: 340,  rx: 260, ry: 130, isExpandedBlob: true },
      { cx: 1320, cy: 680,  rx: 220, ry: 140, isExpandedBlob: true },
      { cx: 1320, cy: 1020, rx: 240, ry: 135, isExpandedBlob: true },
      { cx: 1860, cy: 640,  rx: 150, ry: 280, isExpandedBlob: true }
    );

    mapObj.decos = (mapObj.decos || []).filter(function(d) { return !d.isHighlandElement; });
    mapObj.nodes = (mapObj.nodes || []).filter(function(n) { return !n.isHighlandOre; });
    mapObj.portals = (mapObj.portals || []).filter(function(p) { return !p.isCliffCavePortal; });
    mapObj.monsters = (mapObj.monsters || []).filter(function(m) { return !m.isSrpgElite; });

    // 1. 懸崖壁上的黑色山洞口
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

    // 2. 南北雙向攀岩繩梯錨點 + ★ 高台東側【🔒 地底遺跡石門 (x: 935, y: 1015)】
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
        zoneId: mapObj.id
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
        zoneId: mapObj.id
      },
      {
        id: "crypt_entrance_" + mapObj.id,
        x: 935,
        y: 1015,
        sprite: cryptUnlocked ? "crypt_door_open" : "crypt_door_locked",
        w: 34,
        h: 34,
        solid: false,
        isHighlandElement: true,
        isCryptEntrance: true,
        zoneId: mapObj.id
      }
    );

    // 3. 高台上的 4 簇高純度礦石
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

    // ★ 4. 在各區埋藏 4 個地面【✖ 藏寶挖掘點】（西側安全區 2 個、高台 1 個、東側深處 1 個）
    const buriedSpotsCoords = [
      { x: 265,  y: 625, reqHighland: false }, // 西側安全區南下幹道旁（新手一造好鐵鏟就能即刻挖！）
      { x: 585,  y: 1045,reqHighland: false }, // 懸崖山洞前方谷地
      { x: 565,  y: 865, reqHighland: true  }, // 黃土高台中央
      { x: 1260, y: 485, reqHighland: false }  // 東側深淵腹地
    ];
    buriedSpotsCoords.forEach(function(bpt, idx) {
      mapObj.nodes.push({
        id: "buried_x_" + mapObj.id + "_" + idx + "_" + token,
        x: bpt.x,
        y: bpt.y,
        type: "crystal",
        giveKey: "cryptKey",
        reqToolLv: 0,
        isHighlandOre: true,
        isBuriedSpot: true,
        reqHighland: bpt.reqHighland,
        name: "✖藏寶點",
        opened: false
      });
    });

    // 5. 西側外圍安全區 (x < 640) 保底 7 個特產採集點
    const safeCoords = [
      { x: 185, y: 180 }, { x: 310, y: 165 },
      { x: 195, y: 490 }, { x: 325, y: 540 },
      { x: 215, y: 720 }, { x: 315, y: 740 },
      { x: 245, y: 940 }
    ];
    const safePool = cfg.safeZoneNodes || [];
    safeCoords.forEach(function(pt, idx) {
      const tpl = safePool[idx % safePool.length] || { key: "coal", type: "crystal" };
      const mInfo = matsDB[tpl.key] || { name: tpl.key };
      const isCluster = (tpl.key === "coal" || tpl.key === "rockSalt" || tpl.key === "quartz" || tpl.key === "sulfur");
      mapObj.nodes.push({
        id: "safe_srpg_node_" + mapObj.id + "_" + idx + "_" + token,
        x: pt.x,
        y: pt.y,
        type: tpl.type,
        giveKey: tpl.key,
        reqTool: tpl.type === "wood" ? "axe" : "pickaxe",
        reqToolLv: 0,
        perfect: false,
        isHighlandOre: true,
        isClusterBoulder: isCluster,
        reqHighland: false,
        name: mInfo.name,
        opened: false
      });
    });

    // 6. 中東段深淵危險區 (x: 980 ~ 1560) 高純度豐厚資源點
    const deepCoords = [
      { x: 1020, y: 260 }, { x: 1220, y: 340 }, { x: 1440, y: 280 },
      { x: 1120, y: 620 }, { x: 1360, y: 680 }, { x: 1520, y: 580 },
      { x: 1080, y: 960 }, { x: 1340, y: 1020 },{ x: 1540, y: 920 }
    ];
    const deepPool = cfg.deepBiomeNodes || [];
    deepCoords.forEach(function(pt, idx) {
      const tpl = deepPool[idx % deepPool.length] || { key: "coal", type: "crystal" };
      const mInfo = matsDB[tpl.key] || { name: tpl.key };
      const isCluster = (tpl.key === "coal" || tpl.key === "rockSalt" || tpl.key === "quartz" || tpl.key === "sulfur");
      mapObj.nodes.push({
        id: "deep_srpg_node_" + mapObj.id + "_" + idx + "_" + token,
        x: pt.x,
        y: pt.y,
        type: tpl.type,
        giveKey: tpl.key,
        reqTool: tpl.type === "wood" ? "axe" : "pickaxe",
        reqToolLv: 0,
        perfect: true,
        isHighlandOre: true,
        isClusterBoulder: isCluster,
        reqHighland: false,
        name: "高純度" + mInfo.name,
        opened: false
      });
    });

    // 7. 中東段深處 4 隻【★精英鎮守魔物】
    const baseRecLv = mapObj.recLv || 3;
    const eliteCoords = [
      { x: 1120, y: 340, lvAdd: 2 },
      { x: 1380, y: 520, lvAdd: 3 },
      { x: 1260, y: 940, lvAdd: 3 },
      { x: 1540, y: 380, lvAdd: 4 }
    ];
    eliteCoords.forEach(function(ep, idx) {
      mapObj.monsters.push({
        id: "srpg_elite_" + mapObj.id + "_" + idx + "_" + token,
        name: cfg.eliteName || "★荒野精英魔將",
        lv: baseRecLv + ep.lvAdd,
        x: ep.x,
        y: ep.y,
        homeX: ep.x,
        homeY: ep.y,
        type: (idx % 2 === 0) ? "skull" : "bamboo",
        isBoss: false,
        isShiny: true,
        isSrpgElite: true,
        alive: true
      });
    });

    return mapObj;
  }

  function checkAndNotifyQuestCompletion() {
    const s = window.Aetheria.State && window.Aetheria.State.data;
    if (!s) return;
    syncDiscoveredMaterialsAndRecipes(s, true);

    if (!s.claimedSrpgQuests) s.claimedSrpgQuests = {};
    if (!s._notifiedSrpgQuests) s._notifiedSrpgQuests = {};

    for (let i = 0; i < EXTRA_SURVIVAL_QUESTS.length; i++) {
      const q = EXTRA_SURVIVAL_QUESTS[i];
      if (!s.claimedSrpgQuests[q.id] && !s._notifiedSrpgQuests[q.id] && q.check(s)) {
        s._notifiedSrpgQuests[q.id] = true;
        setTimeout(function() {
          if (window.Aetheria.UI) {
            window.Aetheria.UI.showToast("🎖️ 懸賞達成：" + q.title + "！請打開【日誌】領取獎賞！");
          }
        }, 650);
        break;
      }
    }
  }

  // ================= 8. 全新格仔化分類工坊系統（支援 💡已領悟 / 🔒未領悟 切換） =================
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
      if (id.indexOf("torch") !== -1 || id.indexOf("bomb") !== -1 || id.indexOf("ladder") !== -1 || id.indexOf("gear_") !== -1 || id.indexOf("key") !== -1) {
        return "gear";
      }
      if (id.indexOf("ration") !== -1 || id.indexOf("heal") !== -1 || id.indexOf("hint") !== -1 || id.indexOf("jerky") !== -1 || id.indexOf("cactus") !== -1 || id.indexOf("elixir") !== -1) {
        return "survival";
      }
      return "smelt";
    },

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

      const outKey = rec.toKey || rec.giveKey || rec.outKey;
      if (rec.isUniqueGear && (s.inventory[outKey] || 0) >= 1) {
        window.Aetheria.UI.showToast("✨ 你已經擁有並裝備了【" + rec.name + "】，效果正永久生效中！");
        return;
      }

      if (!this.canAffordRecipe(s, rec.cost, rec.goldCost || 0)) {
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.showToast("⚠️ 合成材料不足！請查看上方檢視盒中標示紅色的材料。");
        return;
      }

      Object.entries(rec.cost || {}).forEach(function(entry) {
        s.inventory[entry[0]] = Math.max(0, (s.inventory[entry[0]] || 0) - entry[1]);
      });
      if (rec.goldCost) {
        s.gold = Math.max(0, (s.gold || 0) - rec.goldCost);
      }

      const outCnt = rec.toCount || rec.count || rec.qty || 1;
      if (outKey) {
        s.inventory[outKey] = (s.inventory[outKey] || 0) + outCnt;
      }
      if (outKey === "rationJerky") {
        s.craftedJerkyOnce = true;
      }
      if (!s.discoveredRecipes) s.discoveredRecipes = {};
      s.discoveredRecipes[rec.id] = true;

      window.Aetheria.State.recalcMaxHp();
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      window.Aetheria.UI.updateAllHud();
      window.Aetheria.UI.showToast(
        rec.isUniqueGear
          ? ("🛡️ 求生裝備合成成功！【" + rec.name + "】已永久生效！")
          : ("🔨 合成成功！獲得【" + rec.name + "】！")
      );
      checkAndNotifyQuestCompletion();
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
        if (!s.tools) s.tools = { axe: 0, pickaxe: 0, shovel: 0, rod: 0, hook: 0, pouch: 0 };
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
        checkAndNotifyQuestCompletion();
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
        s.craftedJerkyOnce = true;
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
      } else if (matKey === "elixirAtk") {
        s.inventory.elixirAtk--;
        s.srpgBonusAtk = (s.srpgBonusAtk || 0) + 6;
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.UI.showToast("🔮 飲用【遠古力量秘藥】：主角永久攻擊力 +6！");
      } else if (matKey === "elixirHp") {
        s.inventory.elixirHp--;
        s.srpgBonusHp = (s.srpgBonusHp || 0) + 30;
        window.Aetheria.State.recalcMaxHp();
        s.hp = Math.min(s.maxHp, s.hp + 30);
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.UI.showToast("🔮 飲用【遠古生命聖水】：主角永久最大生命 +30！");
      } else if (matKey === "elixirDef") {
        s.inventory.elixirDef--;
        s.srpgBonusDef = (s.srpgBonusDef || 0) + 5;
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.UI.showToast("🔮 飲用【遠古鐵壁靈液】：主角永久防禦力 +5！");
      }
      window.Aetheria.State.save();
      this.renderGridWorkshopModal(this.curTab);
      window.Aetheria.UI.updateAllHud();
      checkAndNotifyQuestCompletion();
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
      let discoveredCount = 0;
      let undiscoveredCount = 0;

      if (tab === "workshop") {
        const recipeMap = {};
        const seenNames = {};
        COMPLETE_WORKSHOP_RECIPES.forEach(function(r) {
          recipeMap[r.id] = r;
          seenNames[r.name] = true;
        });
        const rawWks = Array.isArray(Data.WORKSHOP_RECIPES)
          ? Data.WORKSHOP_RECIPES
          : (Data.WORKSHOP_RECIPES && typeof Data.WORKSHOP_RECIPES === "object" ? Object.values(Data.WORKSHOP_RECIPES) : []);
        rawWks.forEach(function(r, idx) {
          if (!r || !r.name) return;
          const rid = r.id || r.wkId || ("wk_legacy_" + idx);
          r.id = rid;
          if (!recipeMap[rid] && !seenNames[r.name]) {
            recipeMap[rid] = r;
            seenNames[r.name] = true;
          }
        });

        Object.values(recipeMap).forEach(function(r) {
          const subCat = self.getRecipeSubCategory(r);
          const outKey = r.toKey || r.giveKey || r.outKey;
          const owned = (s.inventory && s.inventory[outKey]) || 0;
          const alreadyGotUnique = Boolean(r.isUniqueGear && owned >= 1);
          const canDo = !alreadyGotUnique && self.canAffordRecipe(s, r.cost, r.goldCost || 0);
          const isDisc = isRecipeDiscovered(s, r) || canDo || alreadyGotUnique;

          if (isDisc) discoveredCount++;
          else undiscoveredCount++;

          itemsList.push({
            uid: r.id,
            raw: r,
            itemType: "recipe",
            subCat: subCat,
            isDiscovered: isDisc,
            iconKey: "mat_" + outKey,
            shortName: r.name.replace(/\s*x\d+$/i, "").replace(/\s*\([^)]*\)/g, ""),
            fullName: r.name,
            badgeText: alreadyGotUnique ? "★已生效" : ("持有 " + owned),
            canCraft: canDo,
            unlocked: alreadyGotUnique,
            costMap: r.cost,
            goldCost: r.goldCost || 0,
            desc: r.desc || "工坊合成加工品。"
          });
        });
      }

      // ★ 顯示 6 大核心工具（含新增的第 6 把工具：探險鐵鏟 shovel）
      else if (tab === "tools") {
        ["axe", "pickaxe", "shovel", "rod", "hook", "pouch"].forEach(function(tKey) {
          const tDef = BUILTIN_TOOLS_DB[tKey] || (Data.TOOLS && Data.TOOLS[tKey]);
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
            isDiscovered: true,
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
        const seenWId = {};
        const seenWName = {};
        const wList = Object.values(Data.WEAPONS || {}).filter(function(w) {
          if (!w || !w.id || !w.name) return false;
          if (REMOVED_DUPLICATE_WEAPON_IDS.indexOf(w.id) !== -1) return false;
          if (seenWId[w.id] || seenWName[w.name]) return false;
          seenWId[w.id] = true;
          seenWName[w.name] = true;
          return true;
        });

        wList.sort(function(a, b) {
          return (a.tier || 1) - (b.tier || 1);
        });

        wList.forEach(function(w) {
          const unlocked = Boolean(s.unlockedWeapons && s.unlockedWeapons.indexOf(w.id) !== -1);
          const equipped = (s.equippedWeapon === w.id);
          const canDo = !unlocked && self.canAffordRecipe(s, w.cost, w.gold || 0);
          itemsList.push({
            uid: w.id,
            raw: w,
            itemType: "weapon",
            subCat: (w.tier <= 4) ? "low" : "high",
            isDiscovered: true,
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
        const seenAId = {};
        const seenAName = {};
        const aList = Object.values(Data.ARMORS || {}).filter(function(a) {
          if (!a || !a.id || !a.name) return false;
          if (REMOVED_DUPLICATE_ARMOR_IDS.indexOf(a.id) !== -1) return false;
          if (seenAId[a.id] || seenAName[a.name]) return false;
          seenAId[a.id] = true;
          seenAName[a.name] = true;
          return true;
        });

        aList.sort(function(a, b) {
          return (a.tier || 1) - (b.tier || 1);
        });

        aList.forEach(function(a) {
          const unlocked = Boolean(s.unlockedArmors && s.unlockedArmors.indexOf(a.id) !== -1);
          const equipped = (s.equippedArmor === a.id);
          const canDo = !unlocked && self.canAffordRecipe(s, a.cost, a.gold || 0);
          itemsList.push({
            uid: a.id,
            raw: a,
            itemType: "armor",
            subCat: "armor",
            isDiscovered: true,
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

        const seenRId = {};
        Object.values(Data.RELICS || {}).forEach(function(rel) {
          if (!rel || !rel.id || seenRId[rel.id]) return;
          seenRId[rel.id] = true;
          const unlocked = Boolean(s.unlockedRelics && s.unlockedRelics.indexOf(rel.id) !== -1);
          const canDo = !unlocked && self.canAffordRecipe(s, rel.cost, rel.gold || 0);
          itemsList.push({
            uid: rel.id,
            raw: rel,
            itemType: "relic",
            subCat: "relic",
            isDiscovered: true,
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
          { id: "all",      label: "💡已領悟(" + discoveredCount + ")" },
          { id: "can",      label: "✅可製作" },
          { id: "gear",     label: "🛡️求生/開路" },
          { id: "smelt",    label: "🔥冶煉/建材" },
          { id: "survival", label: "🍖口糧/秘藥" },
          { id: "locked",   label: "🔒未領悟(" + undiscoveredCount + ")" }
        ];
      } else if (tab === "weapons") {
        subFilters = [
          { id: "all",  label: "全部武器(" + itemsList.length + ")" },
          { id: "can",  label: "✅可鍛造/已擁有" },
          { id: "low",  label: "T1~T4 初中階" },
          { id: "high", label: "T5~T10 傳奇階" }
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
        if (tab === "workshop") {
          if (self.curSubFilter === "locked") return !item.isDiscovered;
          if (self.curSubFilter === "all") return item.isDiscovered;
          if (self.curSubFilter === "can") return item.canCraft || item.unlocked;
          return item.isDiscovered && item.subCat === self.curSubFilter;
        }
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
          const isBuffConsumable = (
            outKey === "steelIngot" || outKey === "curedLeather" || outKey === "rationJerky" ||
            outKey === "elixirAtk"  || outKey === "elixirHp"     || outKey === "elixirDef"
          );
          const canUseBuff = isBuffConsumable && ((s.inventory && s.inventory[outKey]) || 0) > 0;

          if (selectedObj.unlocked) {
            actionBtnHtml = '<span style="color:#5ac54f; font-weight:900; white-space:nowrap;">★ 已生效</span>';
          } else {
            actionBtnHtml =
              '<div style="display:flex; flex-direction:column; gap:4px;">' +
                '<button class="na-btn ' + (selectedObj.canCraft ? 'highlight' : '') + '" style="padding:7px 12px; font-size:13px; white-space:nowrap;" onclick="Aetheria.HighlandsWorkshop.craftOrAct(\'' + selectedObj.uid + '\')">🔨 立即製作</button>' +
                (canUseBuff
                  ? '<button class="na-btn" style="padding:4px 8px; font-size:11px; border-color:#5ac54f; color:#5ac54f;" onclick="Aetheria.HighlandsWorkshop.useSrpgConsumable(\'' + outKey + '\')">✨ 使用強化</button>'
                  : '') +
              '</div>';
          }
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
                (!selectedObj.isDiscovered ? ' <span style="font-size:10.5px; color:#e0aaff;">(🔒收集下方任一材料即可領悟)</span>' : '') +
              '</div>' +
              '<div style="font-size:11px; color:#cbd5e1; margin-top:2px; line-height:1.3;">' + selectedObj.desc + '</div>' +
              (chipsHtml ? '<div style="margin-top:4px;">' + chipsHtml + '</div>' : '') +
            '</div>' +
            actionBtnHtml +
          '</div>';
      } else {
        inspectorInnerHtml =
          '<div style="color:#94a3b8; font-size:12px; text-align:center;">' +
            (self.curSubFilter === "locked" ? '🎉 恭喜！你已領悟全部工坊配方！' : '此分類下暫無項目') +
          '</div>';
      }

      let gridCellsHtml = "";
      filteredItems.forEach(function(item) {
        const isSel = (selectedObj && selectedObj.uid === item.uid);
        const cls = "wk-grid-cell" +
          (item.canCraft ? " can-craft" : "") +
          (!item.isDiscovered ? " undiscovered" : "") +
          (isSel ? " selected" : "");
        const showQuickBtn = item.canCraft || (item.unlocked && !item.equipped && (item.itemType === "weapon" || item.itemType === "armor"));
        const quickBtnLabel = item.unlocked ? "⚡裝備" : (item.itemType === "tool" ? "⛏️升級" : "🔨製作");

        gridCellsHtml +=
          '<div class="' + cls + '" onclick="Aetheria.HighlandsWorkshop.selectItem(\'' + item.uid + '\')">' +
            (item.canCraft
              ? '<span class="wk-cell-craft-dot">●可做</span>'
              : (!item.isDiscovered ? '<span class="wk-cell-lock-dot">🔒未知</span>' : '')) +
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
    },

    claimSurvivalQuest: function(qId) {
      const s = window.Aetheria.State.data;
      if (!s.claimedSrpgQuests) s.claimedSrpgQuests = {};
      if (s.claimedSrpgQuests[qId]) return;

      const q = EXTRA_SURVIVAL_QUESTS.find(function(x) { return x.id === qId; });
      if (!q || !q.check(s)) return;

      s.claimedSrpgQuests[qId] = true;
      window.Aetheria.State.gainRewards(q.rewardExp, q.rewardGold, 30);
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      window.Aetheria.UI.openQuestLogModal();
      window.Aetheria.UI.updateAllHud();
      window.Aetheria.UI.showToast("🎖️ 完成求生懸賞【" + q.title + "】！獲 +" + q.rewardExp + " EXP、+" + q.rewardGold + " G！");
    }
  };

  window.Aetheria.HighlandsWorkshop = WorkshopUIManager;

  // ================= 9. 掛載鐵鏟挖寶 ✖、地底遺跡開鎖、領悟配方與戰鬥系統 =================
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
          const s = this.data || {};
          const heatBonus = hasSurvivalGear(s, "gear_heatShield") ? 10 : 0;
          return origAtk() + (s.srpgBonusAtk || 0) + heatBonus;
        };
      }
      if (St.getTotalDef) {
        const origDef = St.getTotalDef.bind(St);
        St.getTotalDef = function() {
          const s = this.data || {};
          const diveBonus = hasSurvivalGear(s, "gear_diving") ? 6 : 0;
          return origDef() + (s.srpgBonusDef || 0) + diveBonus;
        };
      }
      if (St.recalcMaxHp) {
        const origMaxHp = St.recalcMaxHp.bind(St);
        St.recalcMaxHp = function() {
          origMaxHp();
          if (this.data) {
            const s = this.data;
            const pouchLv = (s.tools && s.tools.pouch) || 0;
            const pouchHp = (pouchLv >= 2) ? 70 : (pouchLv === 1) ? 30 : 0;
            const maskHp  = hasSurvivalGear(s, "gear_gasMask") ? 25 : 0;
            const furHp   = hasSurvivalGear(s, "gear_furCoat") ? 50 : 0;
            s.maxHp += ((s.srpgBonusHp || 0) + pouchHp + maskHp + furHp);
            if (s.hp > s.maxHp) s.hp = s.maxHp;
          }
        };
      }
      if (St.getBonusShieldBreak) {
        const origBreak = St.getBonusShieldBreak.bind(St);
        St.getBonusShieldBreak = function() {
          const s = this.data || {};
          return origBreak() + (hasSurvivalGear(s, "gear_skyAegis") ? 1 : 0);
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
        if (zoneId && zoneId.indexOf("crypt_") === 0) {
          const cZone = zoneId.replace("crypt_", "");
          if (!cryptMapsCache[zoneId]) {
            cryptMapsCache[zoneId] = buildAncientCryptMap(cZone);
          }
          return cryptMapsCache[zoneId];
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
        Object.keys(grottoMapsCache).forEach(function(k) { delete grottoMapsCache[k]; });
        Object.keys(cryptMapsCache).forEach(function(k) { delete cryptMapsCache[k]; });
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
      let hazardStepCounter = 0;
      let lastHazardWarnTime = 0;

      const origUpdateStep = Exp.updateStep.bind(Exp);
      Exp.updateStep = function() {
        const s = window.Aetheria.State.data;
        const prevX = s.heroX;
        const prevY = s.heroY;
        const prevZone = s.currentZone;

        const hzRule = ZONE_HAZARD_RULES[s.currentZone];
        const inHazardArea = Boolean(hzRule && s.heroX >= hzRule.minX);
        const isProtected = Boolean(
          hzRule && (
            hasSurvivalGear(s, hzRule.gearKey) ||
            (hzRule.allowTorchBypass && s.torchTicks > 0) ||
            (s.currentZone === "zone4_snow" && s.projectsBuilt && s.projectsBuilt.proj_z4_shelter)
          )
        );

        const savedDX = this.moveDX;
        const savedDY = this.moveDY;
        if (this.isMoving && inHazardArea && !isProtected && hzRule.slowFactor) {
          this.moveDX = savedDX * hzRule.slowFactor;
          this.moveDY = savedDY * hzRule.slowFactor;
        }

        origUpdateStep();

        this.moveDX = savedDX;
        this.moveDY = savedDY;

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

        if (this.isMoving && inHazardArea && !isProtected) {
          hazardStepCounter++;
          if (hazardStepCounter >= 38) {
            hazardStepCounter = 0;
            s.hp = Math.max(1, (s.hp || 100) - (hzRule.hpDrain || 6));
            s.hunger = Math.max(0, (s.hunger !== undefined ? s.hunger : 100) - (hzRule.hungerDrain || 1));
            window.Aetheria.UI.spawnFloatingText(hzRule.name + " -" + hzRule.hpDrain + "HP", "#ff595e", false);
            window.Aetheria.UI.updateAllHud();

            const now = Date.now();
            if (now - lastHazardWarnTime > 9000) {
              lastHazardWarnTime = now;
              window.Aetheria.UI.showToast(hzRule.warnMsg);
            }
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

      // ★ 懸崖繩梯攀爬 ＆ 【🗝️ 地底遺跡石門開鎖進入】互動
      const origInteract = Exp.interactNearby.bind(Exp);
      Exp.interactNearby = function() {
        const s = window.Aetheria.State.data;
        const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
        if (mapObj && mapObj.decos) {
          for (let i = 0; i < mapObj.decos.length; i++) {
            const d = mapObj.decos[i];

            // 1. 🗝️ 遠古地底遺跡石門互動
            if (d && d.isCryptEntrance && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 62) {
              if (!s.unlockedCrypts) s.unlockedCrypts = {};
              const zId = d.zoneId || mapObj.id;
              const isOpen = Boolean(s.unlockedCrypts[zId]);

              if (!isOpen) {
                if ((s.inventory.cryptKey || 0) <= 0) {
                  window.Aetheria.Audio.sfxWrong();
                  window.Aetheria.UI.showToast("🔒 古老的地底遺跡石門緊閉！請先在【工坊➔⛏️工具】造出【探險鐵鏟】挖掘地面的「✖藏寶點」取得【遠古遺跡鑰匙】！");
                  return;
                }
                s.inventory.cryptKey--;
                s.unlockedCrypts[zId] = true;
                d.sprite = "crypt_door_open";
                if (window.Aetheria.Renderer) window.Aetheria.Renderer.builtZoneKey = null;
                window.Aetheria.Audio.sfxLevelUp();
                window.Aetheria.UI.showToast("🗝️ 使用【遠古遺跡鑰匙】解開了千古封印！正在進入地底古老遺跡……");
                checkAndNotifyQuestCompletion();
              } else {
                window.Aetheria.Audio.sfxGather();
              }

              // 傳送進入地底遺跡子地圖 (crypt_<zoneId>)
              const cryptMap = window.Aetheria.Data.Maps.getMap("crypt_" + zId);
              s.currentZone = "crypt_" + zId;
              s.onHighland = false;
              s.heroX = 280;
              s.heroY = 275;
              s.petX = 258;
              s.petY = 278;
              if (window.Aetheria.Renderer) {
                window.Aetheria.Renderer.builtZoneKey = null;
                window.Aetheria.Renderer.renderWorld();
              }
              if (cryptMap && window.Aetheria.Audio && window.Aetheria.Audio.playBgm) {
                window.Aetheria.Audio.playBgm("cave");
              }
              window.Aetheria.State.save();
              window.Aetheria.UI.updateAllHud();
              return;
            }

            // 2. 🧗 懸崖攀岩繩梯互動
            if (d && d.isCliffLadderSpot && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 68) {
              if (!s.riggedCliffs) s.riggedCliffs = {};
              const isRigged = Boolean(s.riggedCliffs[mapObj.id]);

              if (!isRigged) {
                if ((s.inventory.ropeLadder || 0) <= 0) {
                  window.Aetheria.Audio.sfxWrong();
                  window.Aetheria.UI.showToast("🧗 陡峭的懸崖岩壁！請先在【工坊 ➔ 🛡️求生/開路】合成【攀岩繩梯 x1】(麻繩x1+原木x2) 架設！");
                  return;
                }
                s.inventory.ropeLadder--;
                s.riggedCliffs[mapObj.id] = true;
                (mapObj.decos || []).forEach(function(dc) {
                  if (dc.isCliffLadderSpot) {
                    dc.sprite = "rope_ladder";
                  }
                });
                if (window.Aetheria.Renderer) window.Aetheria.Renderer.builtZoneKey = null;
                checkAndNotifyQuestCompletion();
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
        if (hintEl && mapObj) {
          if (mapObj.decos) {
            for (let i = 0; i < mapObj.decos.length; i++) {
              const d = mapObj.decos[i];
              if (d && d.isCryptEntrance && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 62) {
                const open = Boolean(s.unlockedCrypts && s.unlockedCrypts[d.zoneId || mapObj.id]);
                hintEl.innerText = open ? "進入遺跡" : "鑰匙開鎖";
                return;
              }
              if (d && d.isCliffLadderSpot && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 68) {
                const rigged = Boolean(s.riggedCliffs && s.riggedCliffs[mapObj.id]);
                hintEl.innerText = !rigged ? "架設繩梯" : (s.onHighland ? "爬下懸崖" : "爬上高台");
                return;
              }
            }
          }
          if (mapObj.nodes) {
            for (let j = 0; j < mapObj.nodes.length; j++) {
              const n = mapObj.nodes[j];
              if (n && !n.opened && n.isBuriedSpot && Math.hypot(s.heroX - n.x, s.heroY - n.y) < 42) {
                hintEl.innerText = "鐵鏟挖寶";
                return;
              }
            }
          }
        }
        origHint(mapObj, s);
      };

      // ★ 處理【✖ 藏寶點鐵鏟挖掘】與【🏆 地底遺跡聖物石棺】
      const origHarvest = Exp.harvestNode.bind(Exp);
      Exp.harvestNode = function(node) {
        const s = window.Aetheria.State.data;
        if (node && node.reqHighland && !s.onHighland) {
          window.Aetheria.Audio.sfxWrong();
          window.Aetheria.UI.showToast("🧗 此位置位於高台上！請先從懸崖邊的【🧗繩梯】爬上高台！");
          return;
        }

        // 1. ✖ 藏寶挖掘點檢定（需持有 Lv.1+ 探險鐵鏟）
        if (node && node.isBuriedSpot) {
          const shovelLv = (s.tools && s.tools.shovel) || 0;
          if (shovelLv < 1) {
            window.Aetheria.Audio.sfxWrong();
            window.Aetheria.UI.showToast("🥄 地面有神秘的「✖」藏寶記號！請先在【工坊 ➔ ⛏️工具】打造【Lv.1 精鐵探險鏟】(原木x2+鐵礦x1) 挖掘！");
            return;
          }

          node.opened = true;
          s.dugTreasureOnce = true;
          window.Aetheria.Audio.sfxLevelUp();

          const zId = (s.currentZone || "").replace("grotto_", "");
          const cryptAlreadyOpen = Boolean(s.unlockedCrypts && s.unlockedCrypts[zId]);
          const hasKeyInBag = ((s.inventory && s.inventory.cryptKey) || 0) > 0;
          const goldGain = (55 + (s.lv || 1) * 5) * (shovelLv >= 2 ? 2 : 1);
          s.gold = (s.gold || 0) + goldGain;

          // 若該區地底遺跡尚未解鎖且背包無鑰匙，保底優先挖出【遠古遺跡鑰匙 x1】！
          if (!cryptAlreadyOpen && !hasKeyInBag) {
            s.inventory.cryptKey = (s.inventory.cryptKey || 0) + 1;
            s.inventory.ancientGem = (s.inventory.ancientGem || 0) + 1;
            window.Aetheria.UI.showToast("🥄 鐵鏟挖寶大發現！挖出【🗝️遠古遺跡鑰匙 +1、🔮遠古秘寶晶石 +1】與 " + goldGain + " G！");
          } else {
            const gemCnt = (shovelLv >= 3) ? 2 : 1;
            s.inventory.ancientGem = (s.inventory.ancientGem || 0) + gemCnt;
            s.inventory.quartz = (s.inventory.quartz || 0) + 1;
            if (Math.random() < 0.45) {
              s.inventory.cryptKey = (s.inventory.cryptKey || 0) + 1;
              window.Aetheria.UI.showToast("🥄 鐵鏟挖寶收穫：獲【🔮遠古秘寶晶石 +" + gemCnt + "、🗝️遺跡鑰匙 +1、石英砂 +1】與 " + goldGain + " G！");
            } else {
              window.Aetheria.UI.showToast("🥄 鐵鏟挖寶收穫：獲【🔮遠古秘寶晶石 +" + gemCnt + "、透明石英砂 +1】與 " + goldGain + " G！");
            }
          }

          window.Aetheria.State.save();
          window.Aetheria.UI.updateAllHud();
          checkAndNotifyQuestCompletion();
          return;
        }

        // 2. 🏆 地底遺跡聖物石棺檢定（需先擊敗地底遺跡守衛魔像）
        if (node && node.isCryptVaultChest) {
          const curMap = window.Aetheria.Data.Maps.getMap(s.currentZone);
          const guardianAlive = curMap && (curMap.monsters || []).some(function(m) {
            return m.isCryptGuardian && m.alive !== false;
          });
          if (guardianAlive) {
            window.Aetheria.Audio.sfxWrong();
            window.Aetheria.UI.showToast("⚔️ 遠古聖物石棺受結界保護！請先擊敗前方的【★地底遺跡守衛魔像】！");
            return;
          }

          if (!s.claimedCryptVaults) s.claimedCryptVaults = {};
          const pZone = node.parentZoneId || s.currentZone;
          if (node.opened || s.claimedCryptVaults[pZone]) {
            node.opened = true;
            window.Aetheria.UI.showToast("此遠古聖物石棺已經開啟過了！");
            return;
          }

          node.opened = true;
          s.claimedCryptVaults[pZone] = true;
          s.gold = (s.gold || 0) + 350;
          s.inventory.ancientGem = (s.inventory.ancientGem || 0) + 2;
          s.inventory.tabletShard = (s.inventory.tabletShard || 0) + 1;
          s.srpgBonusAtk = (s.srpgBonusAtk || 0) + 5;
          s.srpgBonusHp  = (s.srpgBonusHp || 0) + 25;
          window.Aetheria.State.recalcMaxHp();
          s.hp = s.maxHp;

          window.Aetheria.Audio.sfxLevelUp();
          window.Aetheria.State.save();
          window.Aetheria.UI.updateAllHud();
          window.Aetheria.UI.showToast("🏆 開啟遠古聖物石棺！獲【350G、🔮遠古秘寶晶石x2、聖碑殘片x1】，且永久 ATK+5 / HP+25！");
          checkAndNotifyQuestCompletion();
          return;
        }

        origHarvest(node);
        checkAndNotifyQuestCompletion();
      };
    }

    if (Bat) {
      if (Bat.startBattle) {
        const origStart = Bat.startBattle.bind(Bat);
        Bat.startBattle = function(mapMonsterNode, customMode, customQuestionId) {
          origStart(mapMonsterNode, customMode, customQuestionId);

          const s = window.Aetheria.State.data;
          const e = this.enemy;
          if (!e || this.mode !== "combat") return;

          const hzRule = ZONE_HAZARD_RULES[s.currentZone];
          if (hzRule && s.heroX >= hzRule.minX && !hasSurvivalGear(s, hzRule.gearKey) && !(hzRule.allowTorchBypass && s.torchTicks > 0)) {
            e.maxShield = (e.maxShield || 1) + 1;
            e.shield = (e.shield || 1) + 1;
            e.atk = Math.round((e.atk || 20) * 1.25);
          }

          if (mapMonsterNode && mapMonsterNode.isSrpgElite) {
            e.isSrpgElite = true;
            e.maxHp = Math.round(e.maxHp * 1.55);
            e.hp = e.maxHp;
            e.atk = Math.round((e.atk || 20) * 1.35);
            e.maxShield = Math.max(3, (e.maxShield || 2) + 1);
            e.shield = e.maxShield;
          }

          if (e.isBoss) {
            e.maxHp = Math.round(e.maxHp * 1.35);
            e.hp = e.maxHp;
            e.atk = Math.round((e.atk || 25) * 1.25);
            e.maxShield = Math.max(4, (e.maxShield || 3) + 1);
            e.shield = e.maxShield;
            e._enrageUsed = false;
          }

          this.updateBattleHUD();
        };
      }

      if (Bat.executeEnemyCounterPhase) {
        const origCounter = Bat.executeEnemyCounterPhase.bind(Bat);
        Bat.executeEnemyCounterPhase = function(answeredRight) {
          const e = this.enemy;
          if (e && e.isBoss && !e._enrageUsed && e.hp > 0 && e.hp <= e.maxHp * 0.50) {
            e._enrageUsed = true;
            e.broken = false;
            e.shield = Math.max(2, Math.ceil(e.maxShield * 0.75));
            e.atk = Math.round(e.atk * 1.20);
            window.Aetheria.Audio.sfxWrong();
            window.Aetheria.UI.spawnFloatingText("⚡領主狂暴・護盾再生!", "#ff595e", true);
            window.Aetheria.UI.showToast("⚡ 首領進入半血狂暴狀態！護盾已重新凝聚，請善用 BP 增幅破盾！");
          }
          origCounter(answeredRight);
        };
      }

      if (Bat.winBattle) {
        const origWin = Bat.winBattle.bind(Bat);
        Bat.winBattle = function() {
          const isCombat = (this.mode === "combat");
          const ref = this.mapMonsterRef;
          const isElite = Boolean(ref && ref.isSrpgElite);
          const isCryptBoss = Boolean(ref && ref.isCryptGuardian);
          origWin();

          if (isCombat) {
            const s = window.Aetheria.State.data;
            if (isCryptBoss) {
              s.inventory.ancientGem = (s.inventory.ancientGem || 0) + 2;
              s.inventory.cryptKey = (s.inventory.cryptKey || 0) + 1;
              window.Aetheria.State.save();
              setTimeout(function() {
                window.Aetheria.UI.showToast("🔮 擊敗地底遺跡守衛！掉落【遠古秘寶晶石 x2、遠古遺跡鑰匙 x1】，後方石棺結界已解除！");
              }, 450);
            } else if (isElite) {
              s.inventory.rawHide = (s.inventory.rawHide || 0) + 2;
              const zCfg = HIGHLAND_ZONES[s.currentZone];
              if (zCfg && zCfg.safeZoneNodes && zCfg.safeZoneNodes[0]) {
                const bKey = zCfg.safeZoneNodes[0].key;
                s.inventory[bKey] = (s.inventory[bKey] || 0) + 2;
              }
              window.Aetheria.State.save();
            } else if (Math.random() < 0.65) {
              s.inventory.rawHide = (s.inventory.rawHide || 0) + 1;
              window.Aetheria.State.save();
            }
            checkAndNotifyQuestCompletion();
          }
        };
      }
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
          if (!item || !item.data || !item.el) return;
          if ((item.data.isCliffLadderSpot || item.data.isCryptEntrance) && !item.lbl) {
            const lbl = document.createElement("div");
            lbl.className = item.data.isCryptEntrance ? "dom-label crypt-door-lbl" : "dom-label ladder-spot-lbl";
            item.el.appendChild(lbl);
            item.lbl = lbl;
          }
        });

        Object.keys(this.domPool.nodes || {}).forEach(function(nId) {
          const item = Ren.domPool.nodes[nId];
          if (!item || !item.data || !S) return;
          if (item.data.isBuriedSpot) {
            item.el.innerHTML = '<img src="' + S.getDataURL("buried_x_spot") + '" alt="">';
            if (item.lbl) {
              item.lbl.className = "dom-label dig-spot-lbl";
              item.el.appendChild(item.lbl);
            }
          } else if (item.data.isClusterBoulder) {
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
          const cryptOpen = Boolean(s && s.unlockedCrypts && s.unlockedCrypts[s.currentZone]);

          const banner = document.getElementById("srpg-hazard-banner");
          const hzRule = ZONE_HAZARD_RULES[s.currentZone];
          if (banner) {
            if (hzRule && s.heroX >= hzRule.minX) {
              const prot = hasSurvivalGear(s, hzRule.gearKey) ||
                           (hzRule.allowTorchBypass && s.torchTicks > 0) ||
                           (s.currentZone === "zone4_snow" && s.projectsBuilt && s.projectsBuilt.proj_z4_shelter);
              banner.className = prot ? "hazard-safe" : "hazard-danger";
              banner.innerText = prot
                ? (hzRule.name + " (🛡️" + hzRule.gearName + "已免疫)")
                : (hzRule.name + " (⚠️未穿" + hzRule.gearName + ")");
            } else {
              banner.className = "";
              banner.style.display = "none";
            }
          }

          Object.keys(this.domPool.decos || {}).forEach(function(k) {
            const item = Ren.domPool.decos[k];
            if (!item || !item.data) return;
            if (item.data.isCliffLadderSpot) {
              if (item.img && S) {
                item.img.src = S.getDataURL(rigged ? "rope_ladder" : "cliff_stake");
              }
              if (item.lbl) {
                item.lbl.style.display = "block";
                item.lbl.className = "dom-label ladder-spot-lbl";
                item.lbl.innerText = rigged ? (s.onHighland ? "🧗爬下懸崖" : "🧗爬上高台") : "🧗架設繩梯";
              }
            } else if (item.data.isCryptEntrance) {
              if (item.img && S) {
                item.img.src = S.getDataURL(cryptOpen ? "crypt_door_open" : "crypt_door_locked");
              }
              if (item.lbl) {
                item.lbl.style.display = "block";
                item.lbl.className = "dom-label crypt-door-lbl";
                item.lbl.innerText = cryptOpen ? "🏛️地底遺跡(已開)" : "🔒地底遺跡[需鑰匙]";
              }
            }
          });

          Object.keys(this.domPool.monsters || {}).forEach(function(mId) {
            const item = Ren.domPool.monsters[mId];
            if (item && item.data && item.data.isSrpgElite && item.data.alive !== false && item.lbl) {
              item.lbl.className = "dom-label elite-mon-lbl";
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
            item.lbl.style.display = (dist < (n.isBuriedSpot ? 85 : 62)) ? "block" : "none";
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

      if (UI.openQuestLogModal) {
        const origQuestLog = UI.openQuestLogModal.bind(UI);
        UI.openQuestLogModal = function() {
          origQuestLog();
          const body = document.getElementById("modal-body");
          if (!body || document.getElementById("srpg-bounty-section")) return;

          const s = window.Aetheria.State.data;
          if (!s.claimedSrpgQuests) s.claimedSrpgQuests = {};

          const header = document.createElement("div");
          header.id = "srpg-bounty-section";
          header.style.cssText = "color:var(--na-gold); font-weight:900; margin:10px 0 4px; font-size:13px;";
          header.innerText = "【🧭 區域環境求生、鐵鏟尋寶與地底遺跡懸賞 (共 15 項)】";
          body.appendChild(header);

          EXTRA_SURVIVAL_QUESTS.forEach(function(q) {
            const done = q.check(s);
            const claimed = Boolean(s.claimedSrpgQuests[q.id]);
            const card = document.createElement("div");
            card.className = "sys-card";
            card.style.borderColor = claimed ? "#3d3136" : (done ? "#5ac54f" : "#38b6ff");
            card.innerHTML =
              '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">' +
                '<div>' +
                  '<b style="color:' + (claimed ? '#94a3b8' : (done ? '#5ac54f' : '#ffd166')) + '; font-size:12.5px;">' + q.title + '</b>' +
                  '<div style="font-size:11px; color:#8ce0ff;">委託人：' + q.giver + ' (' + q.zone + ')</div>' +
                  '<div style="font-size:11.5px; color:#cbd5e1; margin-top:2px;">' + q.desc + '</div>' +
                  '<div style="font-size:11px; color:#ffd166; margin-top:2px;">獎賞：' + q.rewardExp + ' EXP ＋ ' + q.rewardGold + ' G</div>' +
                '</div>' +
                (claimed
                  ? '<span style="color:#5ac54f; font-weight:900; white-space:nowrap; font-size:11.5px;">✓ 已完成</span>'
                  : (done
                      ? '<button class="na-btn highlight" style="padding:6px 10px; white-space:nowrap;" onclick="Aetheria.HighlandsWorkshop.claimSurvivalQuest(\'' + q.id + '\')">領取獎賞</button>'
                      : '<span style="color:#94a3b8; white-space:nowrap; font-size:11px;">進行中</span>')) +
              '</div>';
            body.appendChild(card);
          });
        };
      }

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
      console.error("Survival RPG Overhaul v10.2 init error:", err);
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
