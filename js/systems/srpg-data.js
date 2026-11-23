/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — SRPG 核心資料庫、樣式與像素圖示模組 (srpg-data.js - v14.5)
 * 【File 1 / 8】負責：共享工具、CSS 樣式、像素精靈快取、素材/配方/工具/謎題資料庫
 * v14.5 修正 (#5)：移除「等級達標自動通橋」後門，避免新玩家勤力溫習升級後跳過修橋任務
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.SRPG = window.Aetheria.SRPG || {};

(function() {
  const SRPG = window.Aetheria.SRPG;

  // ================= 1. 效能防抖與共用工具 =================
  const utils = {
    setTextIfChanged: function(el, newText) {
      if (!el) return;
      if (el._lastTxt !== newText) {
        el._lastTxt = newText;
        el.textContent = newText;
      }
    },
    setClassIfChanged: function(el, newCls) {
      if (!el) return;
      if (el._lastCls !== newCls) {
        el._lastCls = newCls;
        el.className = newCls;
      }
    },
    setDisplayIfChanged: function(el, newDisp) {
      if (!el) return;
      if (el._lastDisp !== newDisp) {
        el._lastDisp = newDisp;
        el.style.display = newDisp;
      }
    },
    lockHintElementSetter: function() {
      const hintEl = document.getElementById("a-btn-hint");
      if (!hintEl || hintEl._setterLocked) return;
      hintEl._setterLocked = true;
      let currentHintVal = hintEl.textContent || "";
      try {
        Object.defineProperty(hintEl, "innerText", {
          get: function() { return currentHintVal; },
          set: function(val) {
            const str = String(val || "");
            if (str === currentHintVal) return;
            currentHintVal = str;
            hintEl.textContent = str;
          },
          configurable: true
        });
      } catch (e) {}
    },
    seededHash: function(x, y, seed) {
      let h = (x * 374761393 + y * 668265263 + (seed || 0) * 1442695041) | 0;
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    },
    findMatKeyByNameKeyword: function(keyword, fallbackKey) {
      const mats = (window.Aetheria.Data && window.Aetheria.Data.MATERIALS) || {};
      const found = Object.keys(mats).find(function(k) {
        return mats[k] && mats[k].name && mats[k].name.indexOf(keyword) !== -1;
      });
      return found || fallbackKey;
    }
  };
  SRPG.utils = utils;

  // ================= 2. 注入全域 CSS 樣式 =================
  SRPG.injectStyles = function() {
    if (document.getElementById("srpg-modular-v145-styles")) return;
    const style = document.createElement("style");
    style.id = "srpg-modular-v145-styles";
    style.textContent = `
      .kenney-terrain-canvas {
        position: absolute !important; left: 0 !important; top: 0 !important;
        pointer-events: none !important; z-index: 0 !important; image-rendering: pixelated !important;
      }
      #world-terrain-layer .dom-dirt-blob { opacity: 0 !important; }
      #world-terrain-layer .dom-dirt-blob.ocean-atoll { opacity: 1 !important; }
      #world-terrain-layer .dom-river { z-index: 2 !important; }
      #world-terrain-layer .dom-bridge { z-index: 6 !important; }
      #world-terrain-layer .dom-coast-beach { z-index: 2 !important; }
      #world-terrain-layer .dom-coast-sea   { z-index: 3 !important; }
      #world-terrain-layer .dom-wooden-pier { z-index: 4 !important; }

      /* 固定下半屏任務框高度，防止擠壓方向鍵與 A 鍵 */
      #quest-tracker, #quest-banner, #quest-box, .quest-tracker-box {
        height: 76px !important; max-height: 76px !important; min-height: 76px !important;
        overflow-y: auto !important; box-sizing: border-box !important; padding: 4px 8px !important;
      }
      #srpg-inline-puzzle-guide {
        margin-top: 4px; padding-top: 3px; border-top: 1px dashed #8f563b;
        font-size: 11px; font-weight: 900; color: #1d3557; cursor: pointer; line-height: 1.25;
      }

      /* 隱藏舊版黑框點陣小地圖 */
      #minimap-box, #minimap, #minimap-canvas, #hud-minimap, .minimap-box, .minimap-container {
        display: none !important; visibility: hidden !important; opacity: 0 !important;
        left: -9999px !important; pointer-events: none !important;
      }

      /* 左下角圓形羅盤小地圖 */
      #srpg-compass-widget {
        position: absolute !important; width: 76px !important; height: 76px !important;
        bottom: 8px !important; left: 8px !important; border-radius: 50% !important;
        border: 4px solid #4a2511 !important; background: #102542 !important;
        box-shadow: 0 3px 8px rgba(0,0,0,0.85), inset 0 0 6px rgba(0,0,0,0.85) !important;
        overflow: visible !important; cursor: pointer !important; pointer-events: auto !important;
        z-index: 18 !important; padding: 0 !important; margin: 0 !important;
        display: block !important; visibility: visible !important; opacity: 1 !important;
      }
      #srpg-compass-widget:active { transform: scale(0.94) !important; }
      #toast-box, #dialog-box, #msg-box, #story-box,
      [id*="toast"], [class*="toast"], [id*="dialog"], [class*="dialog"] { z-index: 95 !important; }

      #srpg-compass-canvas {
        width: 100% !important; height: 100% !important; border-radius: 50% !important;
        display: block !important; image-rendering: pixelated !important;
        pointer-events: auto !important; cursor: pointer !important; border: none !important;
      }
      .compass-dir-tag {
        position: absolute; font-size: 9px; font-weight: 900; color: #f5e6c4;
        background: #4a2511; padding: 0px 3px; border-radius: 3px; line-height: 1.1;
        text-shadow: 1px 1px 0 #000; pointer-events: none; z-index: 19;
      }
      .compass-dir-n { top: -7px; left: 50%; transform: translateX(-50%); color: #ffd166; }
      .compass-dir-s { bottom: -7px; left: 50%; transform: translateX(-50%); }
      .compass-dir-w { left: -7px; top: 50%; transform: translateY(-50%); }
      .compass-dir-e { right: -7px; top: 50%; transform: translateY(-50%); }
      .compass-zoom-hint {
        position: absolute; bottom: -8px; right: -10px; background: #1d3557; color: #ffd166;
        border: 1px solid #f5b700; border-radius: 4px; font-size: 8.5px; font-weight: 900;
        padding: 0 3px; pointer-events: none; z-index: 20; box-shadow: 0 1px 3px #000;
      }

      #srpg-chain-tracker {
        position: absolute; top: 30px; right: 6px; z-index: 18;
        background: rgba(29, 53, 87, 0.92); color: #ffd166; border: 1.5px solid #38b6ff;
        border-radius: 6px; padding: 3px 8px; font-size: 10.5px; font-weight: 900;
        cursor: pointer; pointer-events: auto; box-shadow: 0 2px 6px rgba(0,0,0,0.85); display: none;
      }
      #srpg-chain-tracker.chain-done { border-color: #5ac54f; color: #5ac54f; background: rgba(20, 42, 30, 0.92); }

      .fullmap-stage-wrap {
        position: relative; width: 100%; background: #0f2942; border: 3px solid #d9a066;
        border-radius: 8px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.85);
      }
      #srpg-fullmap-canvas { width: 100%; height: auto; display: block; image-rendering: pixelated; cursor: crosshair; }
      .fullmap-legend-bar {
        display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px;
        background: #181316; border: 1.5px solid #594950; border-radius: 6px;
        padding: 6px 8px; margin-top: 6px; font-size: 11px; color: #cbd5e1;
      }

      @keyframes srpgHitShake {
        0%, 100% { transform: translate(0, 0) scale(1); }
        25% { transform: translate(-3px, 1px) scale(0.92); }
        50% { transform: translate(3px, -2px) scale(1.06); }
        75% { transform: translate(-2px, 0px) scale(0.96); }
      }
      .srpg-node-hit { animation: srpgHitShake 0.22s ease-in-out !important; }
      .srpg-particle {
        position: absolute; width: 5px; height: 5px; border: 1px solid #141013;
        pointer-events: none; z-index: 45; transition: transform 0.42s ease-out, opacity 0.42s ease-out;
      }

      .dom-label.ladder-spot-lbl { background: #4a2c11; color: #ffd166; border: 1.5px solid #f5b700; font-weight: 900; }
      .dom-label.crypt-door-lbl  { background: #2d1442; color: #ffd166; border: 1.5px solid #e0aaff; font-weight: 900; }
      .dom-label.dig-spot-lbl    { background: #3d2314; color: #ffd166; border: 1.5px solid #f5b700; font-weight: 900; }
      .dom-label.puzzle-mech-lbl { background: #102542; color: #fff3b0; border: 1.5px solid #38b6ff; font-weight: 900; }
      .dom-label.puzzle-mech-on  { background: #1e3a2f; color: #5ac54f; border: 1.5px solid #5ac54f; font-weight: 900; }
      .dom-label.tool-gate-lbl   { background: #5c1d24; color: #ffd166; border: 1.5px solid #ff758f; font-weight: 900; }

      /* 格仔分類工坊與圖鑑 UI */
      #panel-modal #modal-body { overflow-y: auto !important; padding-bottom: 42px !important; }
      .wk-top-control-panel { background: #141013; padding-bottom: 4px; }
      .wk-inspector-box {
        background: linear-gradient(180deg, #261c14 0%, #18120e 100%);
        border: 2px solid #f5b700; border-radius: 8px; padding: 7px 9px;
        margin-bottom: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.8);
      }
      .wk-subfilter-bar { display: flex; gap: 4px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 5px; }
      .wk-filter-pill {
        background: #1c1619; color: #cbd5e1; border: 1.5px solid #594950;
        border-radius: 14px; padding: 3px 9px; font-size: 11px; font-weight: 900; white-space: nowrap; cursor: pointer;
      }
      .wk-filter-pill.active { background: #1d3557; color: #ffd166; border-color: #38b6ff; }
      .wk-icon-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; padding: 2px 2px 44px 2px; }
      .wk-grid-cell {
        position: relative; background: #181316; border: 2px solid #4a3e44; border-radius: 7px;
        padding: 16px 4px 6px; display: flex; flex-direction: column; align-items: center;
        justify-content: space-between; text-align: center; cursor: pointer; min-height: 70px; user-select: none;
      }
      .wk-grid-cell.can-craft { border-color: #5ac54f; background: linear-gradient(180deg, #18281c 0%, #141815 100%); }
      .wk-grid-cell.selected  { border-color: #ffd166 !important; box-shadow: 0 0 9px rgba(245, 183, 0, 0.85); background: linear-gradient(180deg, #332614 0%, #1c150c 100%); }
      .wk-cell-badge     { position: absolute; top: 2px; right: 3px; font-size: 9.5px; font-weight: 900; padding: 0 4px; border-radius: 4px; background: rgba(0,0,0,0.75); color: #cbd5e1; pointer-events: none; }
      .wk-cell-craft-dot { position: absolute; top: 2px; left: 4px; font-size: 9px; font-weight: 900; color: #5ac54f; pointer-events: none; }
      .wk-cell-name      { font-size: 11px; font-weight: 900; color: #ffffff; margin-top: 2px; line-height: 1.15; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; pointer-events: none; }
      .wk-cell-quick-btn { margin-top: 3px; width: 92%; background: #f5b700; color: #141013; border: 1px solid #000; border-radius: 4px; padding: 2px 0; font-size: 10.5px; font-weight: 900; cursor: pointer; }
      .wk-mat-chip       { display: inline-flex; align-items: center; gap: 2px; font-size: 11px; font-weight: 900; padding: 2px 6px; border-radius: 4px; margin: 2px 4px 2px 0; background: #141013; border: 1px solid #4a3e44; }
      .wk-mat-chip.ok    { color: #5ac54f; border-color: #5ac54f; background: rgba(45, 106, 79, 0.25); }
      .wk-mat-chip.lack  { color: #ff758f; border-color: #ff595e; background: rgba(157, 2, 8, 0.22); }

      .codex-card {
        background: linear-gradient(180deg, #1e171b 0%, #141013 100%);
        border: 1.5px solid #4a3e44; border-left: 4px solid #f5b700;
        border-radius: 7px; padding: 7px 9px; margin-bottom: 6px;
      }
      .codex-card.owned { border-left-color: #5ac54f; }
      .codex-tag {
        display: inline-block; font-size: 10px; font-weight: 900; padding: 1px 6px;
        border-radius: 4px; background: #261c14; color: #ffd166; border: 1px solid #8f563b;
      }
    `;
    document.head.appendChild(style);
  };

  // ================= 3. 16x16 像素圖示庫（含快取池） =================
  const spriteDataUrlCache = {};
  SRPG.sprites = {
    cache: spriteDataUrlCache,
    register: function() {
      const S = window.Aetheria.Data && window.Aetheria.Data.Sprites;
      if (!S || !S.getDataURL || S._srpgSpritesHooked) return;
      S._srpgSpritesHooked = true;

      function buildGridDataUrl(grid, palette) {
        const c = document.createElement("canvas");
        c.width = 16; c.height = 16;
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

      const customUrls = {
        gate_briar_vines: buildGridDataUrl([
          "..KK....KK....KK",".KGGK..KGGK..KGG","KGGGGKKGGGGKKGGG","KGRGGGGGGGGGRGGG",
          ".KGGGGKKKKGGGGK.","..KGGKYYYYKGGK..","..KGGKYRRYKGGK..",".KGGGGKKKKGGGGK.",
          "KGGGGGGGGGGGGGGK","KGRGGGGGGGGGRGGK",".KGGGGGGGGGGGGK.","..KKGGGGGGGGKK..",
          "....KKKKKKKK....","................","................","................"
        ], { K: "#141013", G: "#2d6a4f", R: "#e03c4b", Y: "#ffd166" }),
        gate_sunken_chest: buildGridDataUrl([
          "......WWWW......","....WWBBBBWW....","..WWBBBBBBBBWW..",".WBBBBKKKKBBBBW.",
          ".WBBKKYYYYKKBBW.","WBBKYYDDDDYYKBBW","WBBKKKKKKKKKKBBW","WBBKDDDDDDDDKBBW",
          ".WBBKKKKKKKKBBW.",".WWBBBBBBBBBBWW.","...WWBBBBBBWW...",".....WWWWWW.....",
          "................","................","................","................"
        ], { K: "#141013", W: "#8ce0ff", B: "#1d5eb8", Y: "#ffd166", D: "#9c6347" }),
        gate_gear_pillar: buildGridDataUrl([
          "...KKKKKKKKKK...","..KGGGGGGGGGGK..",".KGGKKKKKKKKGGK.",".KGKYYYYYYYYKGK.",
          ".KGKYKKKKKKYKGK.",".KGKYKRRRRKYKGK.",".KGKYKRRRRKYKGK.",".KGKYKKKKKKYKGK.",
          ".KGKYYYYYYYYKGK.",".KGGKKKKKKKKGGK.","..KDDDDDDDDDDK..","..KGGGGGGGGGGK..",
          ".KDDDDDDDDDDDDK.",".KKKKKKKKKKKKKK.","................","................"
        ], { K: "#141013", G: "#94a3b8", D: "#475569", Y: "#f5b700", R: "#e03c4b" }),
        gate_element_geode: buildGridDataUrl([
          "......KKKK......","....KKCCCCKK....","...KCCWWWWCCK...","..KCCWYYYYWCCK..",
          ".KCCWYYYYYYWCCK.","KCCWYYKKKKYYWCCK","KCCWYKRRRRKYWCCK","KCCWYKRRRRKYWCCK",
          "KCCWYYKKKKYYWCCK",".KCCWYYYYYYWCCK.","..KCCWWWWWWCCK..","...KKCCCCCCKK...",
          ".....KKKKKK.....","................","................","................"
        ], { K: "#141013", C: "#38b6ff", W: "#ffffff", Y: "#ffd166", R: "#ff595e" }),
        mat_briarSickle: buildGridDataUrl([
          "......KKKKKK....","....KKCCCCCCKK..","...KCCWWWWWWCCK.","..KCCWKKKKKKCCK.",
          "..KCCK......KKK.","..KCCK..........","...KCCK.........","....KCCKK.......",
          ".....KKLLK......","......KLLDK.....",".....KLLDK......","....KLLDK.......",
          "...KLLDK........","...KKKK.........","................","................"
        ], { K: "#141013", C: "#d9a066", W: "#ffd166", L: "#8f563b", D: "#5c3824" }),
        mat_salvageHook: buildGridDataUrl([
          "......KKKK......",".....KLLLLK.....",".....KLLLLK.....","......KKKK......",
          ".......KK.......",".......KK.......","...KKKK..KKKK...","..KRRRR..BBBBK..",
          "..KRRRR..BBBBK..","..KCCCC..CCCCK..","..KCCCCCCCCCCK..","...KCCCCCCCCK...",
          "....KKKKKKKK....","................","................","................"
        ], { K: "#141013", L: "#d9a066", R: "#ff595e", B: "#38b6ff", C: "#94a3b8" }),
        mat_ancientGear: buildGridDataUrl([
          "......KKKK......","...KKKYYYYKKK...","..KYYYYYYYYYYK..",".KYYYYKKKKYYYYK.",
          ".KYYYK....KYYYK.","KYYYYK....KYYYYK","KYYYYK....KYYYYK",".KYYYK....KYYYK.",
          ".KYYYYKKKKYYYYK.","..KYYYYYYYYYYK..","...KKKYYYYKKK...","......KKKK......",
          "................","................","................","................"
        ], { K: "#141013", Y: "#f5b700" }),
        mat_magnifyingLens: buildGridDataUrl([
          "....KKKKKK......","..KKYYYYYYKK....",".KYYCCCCCCYYK...","KYYCWWWWWWCYYK..",
          "KYYCWCCCCWCYYK..","KYYCCCCCCCCYYK..",".KYYCCCCCCYYK...","..KKYYYYYYKK....",
          "....KKKKKKLLK...",".........KLLDK..","..........KLLDK.","...........KLLDK",
          "............KKKK","................","................","................"
        ], { K: "#141013", Y: "#f5b700", C: "#8ce0ff", W: "#ffffff", L: "#8f563b", D: "#5c3824" }),
        mat_thermitePowder: buildGridDataUrl([
          ".......YY.......","......YYYY......",".....YYRRYY.....","....YYRRRRYY....",
          "...KKRRRRRRKK...","..KDDGGGGGGDDK..",".KDDGYYYYYYGDDK.",".KDGYYRRRRYYGDK.",
          ".KDDGYYYYYYGDDK.","..KDDGGGGGGDDK..","...KKKKKKKKKK...","................",
          "................","................","................","................"
        ], { K: "#141013", Y: "#ffd166", R: "#ff595e", D: "#475569", G: "#94a3b8" }),
        mat_frostEssence: buildGridDataUrl([
          "......KKKK......",".....KLLLLK.....","......KCCK......","....KKCWWCKK....",
          "...KCCWWWWCCK...","..KCCWWBBWWCCK..","..KCCWBBBBWCCK..","..KCCWWBBWWCCK..",
          "...KCCWWWWCCK...","....KKKKKKKK....","................","................",
          "................","................","................","................"
        ], { K: "#141013", L: "#d9a066", C: "#8ce0ff", W: "#ffffff", B: "#1d5eb8" }),
        mat_spicedStew: buildGridDataUrl([
          "....YY....YY....","...YYYY..YYYY...","................","..KKKKKKKKKKKK..",
          ".KRRRRRRRRRRRRK.","KRRYYYYRRGGGGYYK","KRRYWWYRRGWWGYYK","KDDDDDDDDDDDDDDK",
          ".KDDDDDDDDDDDDK.","..KKDDDDDDDDKK..","....KKKKKKKK....","................",
          "................","................","................","................"
        ], { K: "#141013", Y: "#ffd166", R: "#e03c4b", G: "#5ac54f", W: "#ffffff", D: "#8f563b" }),
        mat_copperOre: buildGridDataUrl([
          "....KKKKKKKK....","..KKDDDDDDDDKK..",".KDDCCCCCCCCDDK.","KDDCCYYYYYYCCDDK",
          "KDDCYYDDDDYYCDDK","KDDCCYYYYYYCCDDK",".KDDCCCCCCCCDDK.","..KKDDDDDDDDKK..",
          "....KKKKKKKK....","................","................","................",
          "................","................","................","................"
        ], { K: "#141013", D: "#5c3824", C: "#d97706", Y: "#fbbf24" }),
        mat_tinOre: buildGridDataUrl([
          "....KKKKKKKK....","..KKGGGGGGGGKK..",".KGGCCCCCCCCGGK.","KGGCCWWWWWWCCGGK",
          "KGGCWGGGGGGWCGGK","KGGCCWWWWWWCCGGK",".KGGCCCCCCCCGGK.","..KKGGGGGGGGKK..",
          "....KKKKKKKK....","................","................","................",
          "................","................","................","................"
        ], { K: "#141013", G: "#64748b", C: "#cbd5e1", W: "#ffffff" }),
        mat_bronzeIngot: buildGridDataUrl([
          "................","....KKKKKKKK....","...KYYYYYYYYK...","..KYCCCCCCCCYK..",
          ".KYCCCCCCCCCCYK.","KYYYYYYYYYYYYYYK","KCCCCCCCCCCCCCCK","KDDDDDDDDDDDDDDK",
          ".KKKKKKKKKKKKKK.","................","................","................",
          "................","................","................","................"
        ], { K: "#141013", Y: "#fde68a", C: "#d97706", D: "#92400e" }),
        ancient_statue: buildGridDataUrl([
          ".....KKKKKK.....","....KGGGGGGK....","...KGGYYYYGGK...","...KGYKKKKYGK...",
          "...KGGYYYYGGK...","....KGGGGGGK....","..KKKKDDDDKKKK..",".KGGGGDDDDGGGGK.",
          ".KGGDDDDDDDDGGK.","..KKKKDDDDKKKK..","....KDDDDDDK....","...KGGGGGGGGK...",
          "..KDDDDDDDDDDK..","..KKKKKKKKKKKK..","................","................"
        ], { K: "#141013", G: "#94a3b8", D: "#475569", Y: "#ffd166" }),
        lever_off: buildGridDataUrl([
          "................","..KKKK..........",".KRRRRK.........",".KRRRRK.........",
          "..KKLLK.........","....KLLK........",".....KLLK.......","......KLLK......",
          ".......KLLK.....","....KKKKKKKK....","...KGGGGGGGGK...","..KDDDDDDDDDDK..",
          "..KKKKKKKKKKKK..","................","................","................"
        ], { K: "#141013", R: "#ff595e", L: "#d9a066", G: "#94a3b8", D: "#334155" }),
        lever_on: buildGridDataUrl([
          "................","..........KKKK..",".........KGGGGK.",".........KGGGGK.",
          ".........KLLKK..","........KLLK....",".......KLLK.....","......KLLK......",
          ".....KLLK.......","....KKKKKKKK....","...KYYYYYYYYK...","..KDDDDDDDDDDK..",
          "..KKKKKKKKKKKK..","................","................","................"
        ], { K: "#141013", G: "#5ac54f", L: "#d9a066", Y: "#ffd166", D: "#334155" }),
        icon_shovel: buildGridDataUrl([
          "...........KKKK.","..........KLLLLK",".........KLDDDDK",".........KLLLLK.",
          "........KKLKK...",".......KLLK.....","......KLLK......",".....KLLK.......",
          "....KKKK........","..KKCCCCKK......",".KCCWWWWCCK.....","KCCWWWWWWCCK....",
          "KCCWWWWCCCCK....",".KCCCCCCCCK.....","..KKKKKKKK......","................"
        ], { K: "#141013", L: "#d9a066", D: "#8f563b", C: "#94a3b8", W: "#ffffff" }),
        buried_x_spot: buildGridDataUrl([
          "....KKKKKKKK....","..KKYYYYYYYYKK..",".KYYRRRRYYYYRRK.","KYYRRRRRRYYRRRYK",
          "KYYRYYYYRRRRYYYK","KYYYYRRRRRRRRYYK","KYYYYYRRRRRRYYYK","KYYYYRRRRRRRRYYK",
          "KYYRYYYYRRRRYYYK","KYYRRRRRRYYRRRYK",".KYYRRRRYYYYRRK.","..KKYYYYYYYYKK..",
          "....KKKKKKKK....","................","................","................"
        ], { K: "#141013", Y: "#ffd166", R: "#e03c4b" }),
        mat_cryptKey: buildGridDataUrl([
          "....KKKKKK......","...KYYYYYYK.....","..KYYKKKKYYK....","..KYYK..KYYK....",
          "..KYYKKKKYYK....","...KYYYYYYK.....","....KKYYKK......",".....KYYK.......",
          ".....KYYK.......",".....KYYKKKK....",".....KYYYYYK....",".....KYYKKKK....",
          ".....KYYK.......",".....KYYYYYK....",".....KKKKKKK....","................"
        ], { K: "#141013", Y: "#ffd166" }),
        crypt_door_locked: buildGridDataUrl([
          "....KKKKKKKK....","..KKGGGGGGGGKK..",".KGGDDDDDDDDGGK.","KGGDKKKKKKKKDGGK",
          "KGDKPPPPPPPPKDGK","KGDKPYYYYYYPKDGK","KGDKPYKKKKYPKDGK","KGDKPYKYYKYPKDGK",
          "KGDKPYKKKKYPKDGK","KGDKPPPYYPPPPDGK","KGDKPPPYYPPPPDGK","KGDKPPPPPPPPKDGK",
          "KGGDKKKKKKKKDGGK","KGGGGGGGGGGGGGGK","KKKKKKKKKKKKKKKK","................"
        ], { K: "#141013", G: "#64748b", D: "#334155", P: "#2d1442", Y: "#f5b700" }),
        crypt_door_open: buildGridDataUrl([
          "....KKKKKKKK....","..KKGGGGGGGGKK..",".KGGDDDDDDDDGGK.","KGGDKKKKKKKKDGGK",
          "KGDKOOOOOOOOODGK","KGDKOOOOOOOOODGK","KGDKOOCCCCCCODGK","KGDKOOOOOOOOODGK",
          "KGDKOOCCCCCCODGK","KGDKOOOOOOOOODGK","KGDKOOCCCCCCODGK","KGDKOOOOOOOOODGK",
          "KGGDKKKKKKKKDGGK","KGGGGGGGGGGGGGGK","KKKKKKKKKKKKKKKK","................"
        ], { K: "#141013", G: "#64748b", D: "#334155", O: "#090608", C: "#5ac54f" }),
        cluster_boulder: buildGridDataUrl([
          "....KKKKKK......","...KLLLLLLK.....","..KLGGGGGGGK....","..KLGGGGGGGK....",
          ".KKKKGGGGKKKKKK.","KLLLLKGGKLLLLLLK","KLGGGKGGKLGGGGGK","KLGGGGGGKLGGGGGK",
          "KGGGGGGGGGGGGGGK","KDDDDGGGGDDDDDDK",".KDDDDDDDDDDDDK.","..KKKKKKKKKKKK..",
          "................","................","................","................"
        ], { K: "#2b2623", L: "#9ca3af", G: "#6b7280", D: "#4b5563" }),
        cliff_stake: buildGridDataUrl([
          ".......YY.......","......YYYY......",".....YYKKYY.....","....YYKYYKYY....",
          "......KYYK......","..KK..KYYK..KK..",".KLLK.KYYK.KLLK.",".KDDK..KK..KDDK.",
          ".KDDKYYYYYYKDDK.",".KDDKDDDDDDKDDK.",".KDDK......KDDK.",".KDDK......KDDK.",
          ".KDDK......KDDK.","..KK........KK..","................","................"
        ], { K: "#141013", Y: "#ffd166", L: "#d9a066", D: "#8f563b" }),
        rope_ladder: buildGridDataUrl([
          "..KK........KK..","..KRK......KRK..","..KWWWWWWWWWWK..","..KDDDDDDDDDDK..",
          "..KRK......KRK..","..KRK......KRK..","..KWWWWWWWWWWK..","..KDDDDDDDDDDK..",
          "..KRK......KRK..","..KRK......KRK..","..KWWWWWWWWWWK..","..KDDDDDDDDDDK..",
          "..KRK......KRK..","..KRK......KRK..","..KWWWWWWWWWWK..","..KK........KK.."
        ], { K: "#141013", R: "#d9a066", W: "#f5b700", D: "#8f563b" }),
        mat_torchItem: buildGridDataUrl([
          ".......YY.......","......YYYY......",".....YYRRYY.....","....YYRRRRYY....",
          "....YRRRRRRY....",".....YYYYYY.....","......KKKK......","......KDDK......",
          "......KDDK......","......KLLK......","......KDDK......","......KDDK......",
          "......KLLK......","......KDDK......","......KKKK......","................"
        ], { K: "#141013", Y: "#ffd166", R: "#ff595e", D: "#8f563b", L: "#d9a066" }),
        mat_bombItem: buildGridDataUrl([
          ".........YY.....","........YYYY....",".......KK.......","......KLLK......",
          "....KKKKKKKK....","...KDDDDDDDDK...","..KDDWWWWDDDDK..","..KDDWDDDDDDDK..",
          "..KDDDDDDDDDDK..","..KDDDDDDDDDDK..","..KDDDDDDDDDDK..","...KDDDDDDDDK...",
          "....KKKKKKKK....","................","................","................"
        ], { K: "#141013", Y: "#ffd166", L: "#d9a066", D: "#334155", W: "#ffffff" }),
        mat_coal: buildGridDataUrl([
          "................",".....KKKKKK.....","...KKDDDDDDKK...","..KDDGGGGGGDDK..",
          ".KDDGKKKKKKGDDK.",".KDGKKKKKKKKGDK.","KDDGKKRRRRKKGDDK","KDGKKRYYYYRKKGDK",
          "KDGKKRRRRRRKKGDK",".KDGKKKKKKKKGDK.",".KDDGGGGGGGGDDK.","..KKDDDDDDDDKK..",
          "....KKKKKKKK....","................","................","................"
        ], { K: "#141013", D: "#2b2623", G: "#475569", R: "#e03c4b", Y: "#ffd166" }),
        mat_rockSalt: buildGridDataUrl([
          ".......KK.......","......KWWK......",".....KWWWWK.....","...KKWCCCCWKK...",
          "..KWWCCCCCCWWK..",".KWWCCCCCCCCWWK.",".KWCCWWWWWWCCWK.","KWWCWWWWWWWWCWWK",
          "KCCCCCCCCCCCCCCK",".KCCCCCCCCCCCCK.","..KKCCCCCCCCKK..","....KKKKKKKK....",
          "................","................","................","................"
        ], { K: "#141013", W: "#ffffff", C: "#cbd5e1" }),
        mat_quartz: buildGridDataUrl([
          ".......KK.......","......KCCK......",".....KCWWCK.....","..KK.KCWWCK.KK..",
          ".KCCKKCWWCKKCCK.",".KCWWCWWWWCWWCK.","KCCWWWWWWWWWWCCK",".KCCWWWWWWWWCCK.",
          "..KCCCCCCCCCCK..","...KKKKKKKKKK...","................","................",
          "................","................","................","................"
        ], { K: "#141013", C: "#8ce0ff", W: "#ffffff" }),
        mat_rationJerky: buildGridDataUrl([
          "................","....KKKKKKKK....","..KKRRRRRRRRKK..",".KRRWWWWWWWWRRK.",
          ".KRRDDDDDDDDRRK.","KRRDDDDDDDDDDRRK","KRRDDWWDDDDDDRRK",".KRRDDDDDDDDRRK.",
          "..KKRRRRRRRRKK..","....KKKKKKKK....","................","................",
          "................","................","................","................"
        ], { K: "#141013", R: "#9d0208", D: "#6a040f", W: "#f8fafc" })
      };
      customUrls.mat_ropeLadder = customUrls.rope_ladder;

      Object.keys(customUrls).forEach(function(k) { spriteDataUrlCache[k] = customUrls[k]; });

      const origGetDataURL = S.getDataURL.bind(S);
      S.getDataURL = function(key) {
        if (spriteDataUrlCache[key]) return spriteDataUrlCache[key];
        const realKey = (key === "mat_potionHeal" || key === "mat_potionHint") ? "icon_potion" : key;
        const res = origGetDataURL(realKey);
        if (res) spriteDataUrlCache[key] = res;
        return res;
      };
    }
  };

  // ================= 4. 核心靜態資料庫 =================
  const db = {};
  SRPG.db = db;

  db.DIR_SYMBOLS = ["▲北", "▶東", "▼南", "◀西"];

  db.KENNEY_PALETTES = {
    forest:  { bg1: "#4d8036", bg2: "#43732e", bg3: "#599140", path: "#c29b61", pathEdge: "#9c7844", cliffTop: "#bfa065", rock1: "#7a4928", rock2: "#5e361c", rockHi: "#965d36", rockDark: "#381e0e", river: "#2978d4", riverHi: "#8ce0ff", bank: "#d4b06a", bridge: "#9c6347", bridgeRail: "#d9a066" },
    cave:    { bg1: "#282332", bg2: "#211d2a", bg3: "#322c3e", path: "#4a4258", pathEdge: "#393246", cliffTop: "#5c526e", rock1: "#3d354b", rock2: "#2b2536", rockHi: "#685d7c", rockDark: "#17131d", river: "#1d3557", riverHi: "#38b6ff", bank: "#393246", bridge: "#64748b", bridgeRail: "#94a3b8" },
    canyon:  { bg1: "#c79452", bg2: "#ba8745", bg3: "#d4a260", path: "#e0b97d", pathEdge: "#ad7b3b", cliffTop: "#deb878", rock1: "#8f4b26", rock2: "#703819", rockHi: "#ab5e34", rockDark: "#45200b", river: "#2b1508", riverHi: "#472411", bank: "#703819", bridge: "#9c6347", bridgeRail: "#f5b700" },
    coast:   { bg1: "#599140", bg2: "#4d8036", bg3: "#68a34d", path: "#e6c88c", pathEdge: "#c4a366", cliffTop: "#d9bc82", rock1: "#755233", rock2: "#593d24", rockHi: "#8f6743", rockDark: "#362312", river: "#1d5eb8", riverHi: "#8ce0ff", bank: "#e6c88c", bridge: "#9c6347", bridgeRail: "#ffffff" },
    snow:    { bg1: "#dce8f2", bg2: "#c9d9e8", bg3: "#edf4fa", path: "#9eb3c7", pathEdge: "#7e96ad", cliffTop: "#ffffff", rock1: "#5a718a", rock2: "#43566b", rockHi: "#7b93ad", rockDark: "#293645", river: "#3898ff", riverHi: "#ffffff", bank: "#9eb3c7", bridge: "#64748b", bridgeRail: "#e2e8f0" },
    volcano: { bg1: "#3b2321", bg2: "#301b19", bg3: "#4a2c29", path: "#633933", pathEdge: "#472723", cliffTop: "#73423b", rock1: "#52241d", rock2: "#381712", rockHi: "#8c382b", rockDark: "#1f0b08", river: "#e03c4b", riverHi: "#ffd166", bank: "#1f0b08", bridge: "#475569", bridgeRail: "#94a3b8" },
    sky:     { bg1: "#487a6b", bg2: "#3d6b5d", bg3: "#568f7e", path: "#e8dfc5", pathEdge: "#c4b89b", cliffTop: "#f5eedc", rock1: "#6e7885", rock2: "#525b66", rockHi: "#8e99a8", rockDark: "#333940", river: "#191233", riverHi: "#e0aaff", bank: "#c4b89b", bridge: "#f5b700", bridgeRail: "#ffffff" }
  };

  db.CLEAN_SRPG_MATERIALS = {
    copperOre:      { id: "copperOre",      name: "赤銅礦石",       tier: 1, desc: "【基礎金屬礦】採集自懸崖高台與山洞，可冶煉青銅合金錠。" },
    tinOre:         { id: "tinOre",         name: "白錫礦石",       tier: 1, desc: "【基礎金屬礦】採集自洞窟與高台，用於合成青銅合金錠。" },
    bronzeIngot:    { id: "bronzeIngot",    name: "青銅合金錠",     tier: 2, desc: "【冶煉合金】由赤銅礦與白錫礦熔煉而成，可用於鍛造遺跡鑰匙。" },
    ancientGear:    { id: "ancientGear",    name: "精密青銅齒輪",   tier: 2, desc: "【★尋寶零件】用鐵礦x1+燧石x1即可打造，放入野外【⚙️齒輪機關柱】即送修橋建材！" },
    briarSickle:    { id: "briarSickle",    name: "除荊開路鐮刀",   tier: 2, desc: "【★永久尋寶工具】用原木x1+燧石x1即可打造，可斬開【🌿荊棘魔藤】領取厚木板，且砍樹收穫 +1！" },
    salvageHook:    { id: "salvageHook",    name: "深水打撈磁鉤",   tier: 2, desc: "【★永久尋寶工具】用鐵礦x1+藤蔓x1即可打造，可打撈水邊【⚓沉船寶箱】，且釣魚收穫 +1！" },
    magnifyingLens: { id: "magnifyingLens", name: "水晶鑑定放大鏡", tier: 2, desc: "【★永久尋寶工具】以透明石英砂打磨的透鏡，持有後全地圖採集額外獲得稀有晶礦機率 +35%！" },
    thermitePowder: { id: "thermitePowder", name: "高熱鋁熱火種",   tier: 2, desc: "【★破障火種】用枯枝x2+燧石x1即可製作，能瞬間融化洞窟與雪原的【🧊玄冰晶殼】領取流沙秘銀！" },
    frostEssence:   { id: "frostEssence",   name: "極寒急凍晶瓶",   tier: 2, desc: "【★破障冰瓶】用石英砂x1+黏土x1即可製作，能震碎火山的【🔥熔岩黑曜殼】領取耐火磚！" },
    spicedStew:     { id: "spicedStew",     name: "香辛海陸燉肉",   tier: 3, desc: "【★增益料理】以鮮魚、微光菇與岩鹽精燉，食用恢復 +100% 飽食、+150 HP，並永久提升最大生命 +15！" },
    cryptKey:       { id: "cryptKey",       name: "遠古遺跡鑰匙",   tier: 2, desc: "【尋寶挖掘/工坊鍛造】用探險鐵鏟挖掘地面「✖」藏寶點或於工坊鍛造，可解鎖各區的【🔒遠古地底遺跡】！" },
    coal:           { id: "coal",           name: "黑曜木炭",       tier: 1, desc: "【高台/山洞礦產】由枯枝悶燒或於高台山洞開採，是配製炸彈與冶煉的燃料。" },
    quartz:         { id: "quartz",         name: "透明石英砂",     tier: 2, desc: "【高台晶礦】採集自懸崖高台與山洞，可用於燒製急凍晶瓶、放大鏡、探礦提燈與藥水瓶。" },
    rockSalt:       { id: "rockSalt",       name: "結晶岩鹽",       tier: 1, desc: "【高台礦產】採集自懸崖高台，可醃製風乾肉脯與烹調香辛海陸燉肉。" },
    ropeLadder:     { id: "ropeLadder",     name: "攀岩繩梯",       tier: 1, desc: "【高低差開路工具】由藤蔓與原木編織而成，可架設在各區懸崖壁上爬上高台礦區！" },
    rationJerky:    { id: "rationJerky",    name: "風乾肉脯",       tier: 2, desc: "【頂級求生口糧】以岩鹽醃製鮮魚，食用立即恢復 +80% 飽食度與 +90 HP！" }
  };

  db.SURVIVAL_CODEX_DATABASE = [
    { cat: "puzzle", key: "briarSickle",    icon: "mat_briarSickle",    name: "除荊開路鐮刀",   source: "工坊1步合成：翠風原木x1 + 尖銳燧石x1",  use: "【永久工具】斬開【🌿荊棘魔藤】免費拎厚木板x3，且砍樹收穫 +1" },
    { cat: "puzzle", key: "thermitePowder", icon: "mat_thermitePowder", name: "高熱鋁熱火種",   source: "工坊1步合成：散落枯枝x2 + 尖銳燧石x1",  use: "【破障火種】融化洞窟與雪原的【🧊玄冰晶殼】免費拎流沙秘銀x2！" },
    { cat: "puzzle", key: "ancientGear",    icon: "mat_ancientGear",    name: "精密青銅齒輪",   source: "工坊1步合成：藍晶鐵礦x1 + 尖銳燧石x1",  use: "【機關零件】放入【⚙️齒輪機關柱】免費拎麻繩與秘銀！" },
    { cat: "puzzle", key: "salvageHook",    icon: "mat_salvageHook",    name: "深水打撈磁鉤",   source: "工坊1步合成：藍晶鐵礦x1 + 堅韌藤蔓x1",  use: "【永久工具】打撈水邊【⚓沉船寶箱】拎古帆布與珊瑚，且釣魚 +1" },
    { cat: "puzzle", key: "frostEssence",   icon: "mat_frostEssence",   name: "極寒急凍晶瓶",   source: "工坊1步合成：透明石英砂x1 + 河畔黏土x1",use: "【破障冰瓶】震碎火山【🔥熔岩晶殼】免費拎黑曜耐火磚x3！" },
    { cat: "puzzle", key: "ropeLadder",     icon: "mat_ropeLadder",     name: "攀岩繩梯",       source: "工坊1步合成：翠風原木x1 + 堅韌藤蔓x1",  use: "【高低差開路】架設於懸崖壁，爬上岩石高台挖寶石" },
    { cat: "puzzle", key: "magnifyingLens", icon: "mat_magnifyingLens", name: "水晶鑑定放大鏡", source: "工坊1步合成：透明石英砂x1 + 藍晶鐵礦x1",use: "【永久神器】持有後全地圖採集 35% 機率額外獲得寶石礦物" },
    { cat: "puzzle", key: "cryptKey",       icon: "mat_cryptKey",       name: "遠古遺跡鑰匙",   source: "鐵鏟挖「✖」藏寶點 / 工坊鐵礦x1+木炭x1", use: "【迷宮開鎖】開啟各區的【🔒地底遺跡石門】拎大寶箱" },
    { cat: "puzzle", key: "bombItem",       icon: "mat_bombItem",       name: "爆破炸彈",       source: "工坊合成：燧石x2+黏土x1+松脂x1",         use: "【秘境開路】炸開各區與荒島地牢的「裂縫岩壁」開啟隱藏秘寶箱" },
    { cat: "basic",  key: "branch",         icon: "mat_branch",         name: "散落枯枝",       source: "0~6區地面徒手拾取",                   use: "修復熔爐、高熱鋁熱火種、松脂火把、Lv.1工具、烤魚乾/菇乾" },
    { cat: "basic",  key: "flint",          icon: "mat_flint",          name: "尖銳燧石",       source: "0~6區地面徒手拾取",                   use: "修復熔爐、除荊鐮刀、高熱火種、精密齒輪、Lv.1工具、炸彈" },
    { cat: "basic",  key: "clay",           icon: "mat_clay",           name: "河畔黏土",       source: "水岸徒手拾取 / 釣魚點垂釣",           use: "修復熔爐、防水松脂膠、極寒急凍晶瓶、爆破炸彈、黑曜耐火磚" },
    { cat: "basic",  key: "fish",           icon: "mat_fish",           name: "銀鱗鮮魚",       source: "各區水波釣魚點持魚竿垂釣",            use: "炭烤鮮魚乾(+60%飽食)、岩鹽風乾肉脯(+80%飽食)、香辛海陸燉肉(永久HP+15)" },
    { cat: "basic",  key: "copperOre",      icon: "mat_copperOre",      name: "赤銅礦石",       source: "1~2區懸崖高台與岩壁礦洞(免工具)",     use: "與白錫礦冶煉【青銅合金錠】" },
    { cat: "basic",  key: "tinOre",         icon: "mat_tinOre",         name: "白錫礦石",       source: "1~3區懸崖高台與岩壁礦洞(免工具)",     use: "與赤銅礦冶煉【青銅合金錠】" },
    { cat: "basic",  key: "coal",           icon: "mat_coal",           name: "黑曜木炭",       source: "各區高台與山洞開採 / 工坊枯枝x2燒製", use: "黑火藥重型炸彈、鍛造遺跡鑰匙、石英探礦提燈" },
    { cat: "basic",  key: "rockSalt",       icon: "mat_rockSalt",       name: "結晶岩鹽",       source: "1~6區懸崖高台與岩壁礦洞開採",         use: "醃製岩鹽風乾肉脯、烹調香辛海陸燉肉" },
    { cat: "basic",  key: "quartz",         icon: "mat_quartz",         name: "透明石英砂",     source: "1~6區高台與山洞開採 / 鐵鏟挖寶",      use: "極寒急凍晶瓶、水晶鑑定放大鏡、石英探礦提燈、生命/洞察藥水" },
    { cat: "tiered", key: "wood",           icon: "mat_wood",           name: "翠風原木",       source: "1.翠風森林砍伐 (需 Lv.1 手斧)",       use: "裁切厚木板、攀岩繩梯、除荊鐮刀、Lv.1探險鐵鏟、建造近海木帆船" },
    { cat: "tiered", key: "vine",           icon: "mat_vine",           name: "堅韌藤蔓",       source: "1.翠風森林砍伐 (需 Lv.1 手斧)",       use: "編織強化麻繩索、攀岩繩梯、深水打撈磁鉤、Lv.1翠竹釣竿" },
    { cat: "tiered", key: "herb",           icon: "mat_herb",           name: "紅傘微光菇",     source: "1.森林與蘑菇洞窟採集 (需 Lv.1 手斧)", use: "烘烤微光菇乾、提煉生命藥水、烹調香辛海陸燉肉" },
    { cat: "tiered", key: "resin",          icon: "mat_resin",          name: "琥珀松脂",       source: "1.翠風森林採集 (需 Lv.1 手斧)",       use: "松脂火把、防水松脂膠、爆破炸彈、洞察藥水" },
    { cat: "tiered", key: "iron",           icon: "mat_iron",           name: "藍晶鐵礦",       source: "1~2區礦脈與山洞 (需 Lv.1 十字鎬)",    use: "鍛造鐵釘、精密齒輪、打撈磁鉤、Lv.2精鐵工具" },
    { cat: "tiered", key: "hemp",           icon: "mat_hemp",           name: "荒野亞麻",       source: "2.流沙峽谷採集 (需 Lv.2 手斧)",       use: "高效編織麻繩索(x2)、禦寒獸毛氈、幽靈古帆布、Lv.1亞麻擴容袋" },
    { cat: "tiered", key: "flower",         icon: "mat_flower",         name: "向陽太陽花",     source: "2.流沙峽谷採集 (需 Lv.2 手斧)",       use: "提煉精煉洞察藥水(答題排除錯誤選項)" },
    { cat: "tiered", key: "basalt",         icon: "mat_basalt",         name: "玄武岩塊",       source: "2~3區峽谷與山洞 (需 Lv.2 十字鎬)",    use: "砌築蘑菇洞窟燈塔、升級 Lv.3 秘銀破岩鎬、燒製黑曜耐火磚" },
    { cat: "tiered", key: "mithril",        icon: "mat_mithril",        name: "流沙秘銀",       source: "2~6區礦脈、山洞與鐵鏟挖寶 (Lv.2 鎬)", use: "砌築燈塔、秘銀強化鋼索、升級 Lv.3 連鎖神斧/破岩鎬、鍛造裝備" },
    { cat: "tiered", key: "coral",          icon: "mat_coral",          name: "深海珊瑚",       source: "3.翡翠海岸開採或海釣 (Lv.2 鎬/釣竿)", use: "共鳴合成海妖核心、鍛造海洋系武器防具" },
    { cat: "tiered", key: "iceLotus",       icon: "mat_iceLotus",       name: "極地冰蓮",       source: "4.霜語雪原採集 (需 Lv.2 手斧)",       use: "鍛造冰霜系武防、提煉高階藥水" },
    { cat: "tiered", key: "obsidian",       icon: "mat_obsidian",       name: "熔岩黑曜石",     source: "4~6區高台與火山開採 (需 Lv.3 十字鎬)",use: "燒製黑曜耐火磚、提煉熔岩龍鱗與炎魔熔核、Lv.3星隕考古鏟" },
    { cat: "tiered", key: "starIron",       icon: "mat_starIron",       name: "深淵星隕鐵",     source: "5~6區火山與天界開採 (需 Lv.3 十字鎬)",use: "Lv.3星隕考古神鏟、修復古文明聖碑殘片、鍛造 T9~T10 傳奇神裝" },
    { cat: "tiered", key: "goldLeaf",       icon: "mat_goldLeaf",       name: "黃金世界樹葉",   source: "6.天界聖殿砍伐 (需 Lv.3 手斧)",       use: "鍛造 T10 艾瑟瑞亞破曉神刃/神聖鎧甲、共鳴遠古聖物" },
    { cat: "smelt",  key: "plank",          icon: "mat_plank",          name: "加工厚木板",     source: "工坊合成：翠風原木x2 (或斬荊棘免費拎)",     use: "修復第1區森林木橋、升級工具、建造大帆船" },
    { cat: "smelt",  key: "rope",           icon: "mat_rope",           name: "強化麻繩索",     source: "工坊合成：堅韌藤蔓x2 (或荒野亞麻x2➔2條)",  use: "修復峽谷吊橋與造船" },
    { cat: "smelt",  key: "steelCable",     icon: "mat_steelCable",     name: "秘銀強化鋼索",   source: "工坊合成：流沙秘銀x1 + 強化麻繩索x1",       use: "修復高階橋樑、升級 Lv.3 秘銀大師竿與飛索鉤爪" },
    { cat: "smelt",  key: "sailCloth",      icon: "mat_sailCloth",      name: "幽靈古帆布",     source: "3區海岸高台/打怪保底 / 工坊亞麻x2+藤蔓x1",  use: "縫製【防風重帆布】以建造破浪遠洋大帆船" },
    { cat: "smelt",  key: "warmFur",        icon: "mat_warmFur",        name: "禦寒獸毛氈",     source: "工坊合成：強韌獸筋x2 + 荒野亞麻x1",         use: "搭建第4區雪原防風避難屋、升級 Lv.2 秘銀遠征袋" },
    { cat: "smelt",  key: "tabletShard",    icon: "crystal",            name: "古文明聖碑殘片", source: "開啟各區地底遺跡石棺 / 工坊星隕鐵+黑曜石",  use: "推進終章天界聖殿主線與共鳴遠古聖物" },
    { cat: "food",   key: "spicedStew",     icon: "mat_spicedStew",     name: "香辛海陸燉肉",   source: "工坊烹調：銀鱗鮮魚x1 + 微光菇x1 + 岩鹽x1", use: "【極品料理】恢復 100% 飽食 + 150 HP，並永久提升最大生命 +15！" },
    { cat: "food",   key: "rationJerky",    icon: "mat_rationJerky",    name: "岩鹽風乾肉脯",   source: "工坊醃製：銀鱗鮮魚x1 + 結晶岩鹽x1 (產2份)", use: "【頂級口糧】每份立即恢復 +80% 飽食度 與 +90 HP" },
    { cat: "food",   key: "rationFish",     icon: "mat_rationFish",     name: "炭烤鮮魚乾",     source: "工坊烘烤：銀鱗鮮魚x1 + 散落枯枝x1 (產2份)", use: "【進階口糧】每份立即恢復 +60% 飽食度 與 +60 HP" },
    { cat: "food",   key: "rationHerb",     icon: "mat_rationHerb",     name: "烘烤微光菇乾",   source: "工坊烘烤：紅傘微光菇x1 + 散落枯枝x1 (產2份)",use: "【基礎口糧】每份立即恢復 +35% 飽食度 與 +25 HP" },
    { cat: "food",   key: "potionHeal",     icon: "icon_potion",        name: "精煉生命藥水",   source: "工坊提煉：紅傘微光菇x2 + 透明石英砂x1",     use: "戰鬥與野外探索中立即恢復大量生命值" },
    { cat: "food",   key: "potionHint",     icon: "icon_potion",        name: "精煉洞察藥水",   source: "工坊提煉：太陽花x1 + 松脂x1 + 石英砂x1",    use: "在知識詠唱問答中直接排除錯誤選項" }
  ];

  db.REMOVED_BLOAT_MATERIAL_IDS = [
    "ancientGem", "elixirAtk", "elixirHp", "elixirDef",
    "venomSac", "treeBark", "cactusFruit", "chitin", "rawHide", "thickPelt", "sulfur",
    "curedLeather", "steelIngot",
    "gear_gasMask", "gear_lantern", "gear_goggles", "gear_diving", "gear_furCoat", "gear_heatShield", "gear_skyAegis"
  ];

  db.REMOVED_BLOAT_RECIPE_IDS = [
    "wk_gear_gasmask", "wk_gear_lantern", "wk_gear_goggles",
    "wk_gear_diving", "wk_gear_furcoat", "wk_gear_heatshield", "wk_gear_skyaegis",
    "wk_steel_ingot", "wk_cured_leather", "wk_bark_rope",
    "wk_elixir_atk", "wk_elixir_hp", "wk_elixir_def", "wk_cactus_ration"
  ];

  db.REMOVED_DUPLICATE_WEAPON_IDS = ["w_srpg_machete", "w_srpg_quartz_blade", "w_srpg_highland_axe"];
  db.REMOVED_DUPLICATE_ARMOR_IDS  = ["a_srpg_leather", "a_srpg_steel_mail", "a_srpg_highland_plate"];

  db.BUILTIN_TOOLS_DB = {
    axe: {
      id: "axe", name: "伐木手斧", iconKey: "icon_axe",
      tiers: {
        0: { name: "徒手拾荒", desc: "尚未裝備手斧，僅能拾取散落枯枝。" },
        1: { name: "Lv.1 燧石手斧", cost: { branch: 2, flint: 2 }, gold: 0, desc: "可砍伐 1 階翠風原木、堅韌藤蔓、微光菇與琥珀松脂。" },
        2: { name: "Lv.2 精鐵伐木斧", cost: { iron: 2, wood: 2 }, gold: 80, desc: "【工具質變】可砍伐 2 階亞麻/太陽花/冰蓮，且每次砍伐 50% 機率獲得雙倍木材！" },
        3: { name: "Lv.3 秘銀連鎖神斧", cost: { mithril: 2, plank: 2 }, gold: 220, desc: "【★終極質變：連鎖砍伐】可砍伐 3 階黃金樹葉，且砍樹時自動震波連鎖採集周圍 155px 內所有草木！" }
      }
    },
    pickaxe: {
      id: "pickaxe", name: "採礦十字鎬", iconKey: "icon_pickaxe",
      tiers: {
        0: { name: "徒手拾荒", desc: "尚未裝備十字鎬，僅能拾取燧石、黏土與高台裸露礦脈。" },
        1: { name: "Lv.1 燧石十字鎬", cost: { branch: 2, flint: 2 }, gold: 0, desc: "可開採 1 階藍晶鐵礦、赤銅礦與白錫礦。" },
        2: { name: "Lv.2 精鐵十字鎬", cost: { iron: 3, wood: 2 }, gold: 80, desc: "【工具質變】可開採 2 階玄武岩/秘銀/珊瑚，且每次挖礦 50% 機率獲得雙倍礦石！" },
        3: { name: "Lv.3 秘銀震波破岩鎬", cost: { mithril: 2, basalt: 2 }, gold: 220, desc: "【★終極質變：連鎖挖礦】可開採 3 階黑曜石/星隕鐵，且挖礦時自動震波連鎖開採周圍 155px 內所有礦脈！" }
      }
    },
    shovel: {
      id: "shovel", name: "探險鐵鏟", iconKey: "icon_shovel",
      tiers: {
        0: { name: "尚未持有鐵鏟", desc: "製作鐵鏟後，可對照【全區放大地圖】挖掘地面唯一「✖ 藏寶記號」獲取遺跡鑰匙！" },
        1: { name: "Lv.1 精鐵探險鏟", cost: { wood: 1, iron: 1 }, gold: 0, desc: "【★尋寶必備】可挖掘全大陸地面唯一「✖」藏寶點，挖出【遠古遺跡鑰匙】與流沙秘銀！" },
        2: { name: "Lv.2 秘銀尋寶鏟", cost: { plank: 1, mithril: 1 }, gold: 120, desc: "挖掘「✖」藏寶點時金幣收穫加倍，且額外挖出流沙秘銀與精密齒輪！" },
        3: { name: "Lv.3 星隕考古神鏟", cost: { obsidian: 1, starIron: 1 }, gold: 260, desc: "傳奇考古神鏟！挖掘「✖」藏寶點必定獲得高階星隕鐵與大量金幣！" }
      }
    },
    rod: {
      id: "rod", name: "垂釣魚竿", iconKey: "fishing_spot",
      tiers: {
        0: { name: "尚未持有魚竿", desc: "製作魚竿後可於各區水波釣魚點進行看準時機垂釣。" },
        1: { name: "Lv.1 翠竹釣魚竿", cost: { wood: 1, vine: 1 }, gold: 0, desc: "解鎖水波釣魚點垂釣功能，可釣起銀鱗鮮魚與河畔黏土。" },
        2: { name: "Lv.2 韌麻海釣竿", cost: { rope: 1, iron: 1 }, gold: 100, desc: "垂釣綠色完美命中區加寬 25%，更容易釣起深海珊瑚！" },
        3: { name: "Lv.3 秘銀大師竿", cost: { mithril: 2, steelCable: 1 }, gold: 240, desc: "垂釣完美命中區大幅加寬，且每次釣魚額外多獲 2 條鮮魚！" }
      }
    },
    hook: {
      id: "hook", name: "飛索鉤爪", iconKey: "icon_compass",
      tiers: {
        0: { name: "尚未持有鉤爪", desc: "用於跨越峽谷斷崖與抵抗流沙漩渦的輔助工具。" },
        1: { name: "Lv.1 精鐵飛索鉤", cost: { iron: 2, rope: 1 }, gold: 100, desc: "裝備後可免疫流沙漩渦吸力，採集暴擊率 +15%。" },
        2: { name: "Lv.2 秘銀飛索鉤", cost: { mithril: 2, steelCable: 1 }, gold: 240, desc: "頂級探險鉤爪，野外採集額外獲得雙倍收穫機率 +30%！" }
      }
    },
    pouch: {
      id: "pouch", name: "探險行囊", iconKey: "icon_bag",
      tiers: {
        0: { name: "標準隨身行囊", desc: "基礎探險背包。" },
        1: { name: "Lv.1 亞麻擴容袋", cost: { hemp: 2, rope: 1 }, gold: 100, desc: "強化負重與體魄，永久提升最大生命值 +30！" },
        2: { name: "Lv.2 秘銀遠征袋", cost: { warmFur: 1, mithril: 1 }, gold: 240, desc: "頂級遠征行囊，永久提升最大生命值 +70，飽食消耗減緩！" }
      }
    }
  };

  db.COMPLETE_WORKSHOP_RECIPES = [
    { id: "wk_rope_ladder",     name: "攀岩繩梯 x1",           category: "explore",  toKey: "ropeLadder",     toCount: 1, cost: { wood: 1, vine: 1 },           desc: "【★高低差開路】用原木x1+藤蔓x1即可製作！架設在懸崖壁上爬上高台礦區！" },
    { id: "wk_briar_sickle",    name: "除荊開路鐮刀",          category: "explore",  toKey: "briarSickle",    toCount: 1, isUniqueGear: true, cost: { wood: 1, flint: 1 }, desc: "【★尋寶工具：斬荊棘】用原木x1+燧石x1即可打造！永久可斬開【🌿荊棘魔藤】免費拎厚木板x3！" },
    { id: "wk_thermite_powder", name: "高熱鋁熱火種 x2",       category: "explore",  toKey: "thermitePowder", toCount: 2, cost: { branch: 2, flint: 1 },        desc: "【★尋寶火種：融玄冰】用枯枝x2+燧石x1即可製作！可融化洞窟與雪原的【🧊玄冰晶殼】免費拎流沙秘銀！" },
    { id: "wk_ancient_gear",    name: "精密青銅齒輪 x2",       category: "explore",  toKey: "ancientGear",    toCount: 2, cost: { iron: 1, flint: 1 },          desc: "【★尋寶零件：開齒輪柱】用鐵礦x1+燧石x1即可打造！放入【⚙️齒輪機關柱】免費拎麻繩與秘銀！" },
    { id: "wk_salvage_hook",    name: "深水打撈磁鉤",          category: "explore",  toKey: "salvageHook",    toCount: 1, isUniqueGear: true, cost: { iron: 1, vine: 1 },  desc: "【★尋寶工具：撈沉船箱】用鐵礦x1+藤蔓x1即可打造！永久可打撈水邊【⚓沉船寶箱】！" },
    { id: "wk_frost_essence",   name: "極寒急凍晶瓶 x2",       category: "explore",  toKey: "frostEssence",   toCount: 2, cost: { quartz: 1, clay: 1 },         desc: "【★尋寶冰瓶：碎熔岩殼】用石英砂x1+黏土x1即可製作！可震碎火山【🔥熔岩晶殼】免費拎耐火磚x3！" },
    { id: "wk_magnifying_lens", name: "水晶鑑定放大鏡",        category: "explore",  toKey: "magnifyingLens", toCount: 1, isUniqueGear: true, cost: { quartz: 1, iron: 1 },desc: "【★尋寶神器】持有後全地圖採集額外獲得稀有寶石與雙倍礦物機率 +35%！" },
    { id: "wk_crypt_key",       name: "鍛造遺跡鑰匙 x1",       category: "explore",  toKey: "cryptKey",       toCount: 1, cost: { iron: 1, coal: 1 },           desc: "【★地底遺跡開鎖】除用鐵鏟挖掘地面「✖」獲得外，亦可用鐵礦x1+木炭x1直接鍛造！" },
    { id: "wk_torch",           name: "松脂火把 x3",           category: "explore",  toKey: "torchItem",      toCount: 3, cost: { branch: 1, resin: 1 },        desc: "【地牢與黑夜照明】點燃後照亮黑霧蘑菇洞窟，並在黑夜戰鬥直接燒毀夜魔 1 層暗夜護盾！" },
    { id: "wk_quartz_lantern",  name: "石英探礦提燈 (火把x5)", category: "explore",  toKey: "torchItem",      toCount: 5, cost: { quartz: 1, coal: 1 },         desc: "【強光照明】以石英砂與木炭打造，一次產出 5 支長效照明火把！" },
    { id: "wk_bomb",            name: "爆破炸彈 x2",           category: "explore",  toKey: "bombItem",       toCount: 2, cost: { flint: 2, clay: 1 },          desc: "【秘境開路】可炸開各區與荒島地牢的「裂縫岩壁」開啟隱藏秘寶箱！" },
    { id: "wk_coal_bomb",       name: "黑火藥重型炸彈 x3",     category: "explore",  toKey: "bombItem",       toCount: 3, cost: { coal: 1, flint: 1 },          desc: "【高效爆破】以高台黑曜木炭調配火藥，一次大量製造 3 顆爆破炸彈！" },
    { id: "wk_charcoal_kiln",   name: "窯燒黑曜木炭 x2",       category: "smelt",    toKey: "coal",           toCount: 2, cost: { branch: 2 },                  desc: "【舊資源再利用】將 2 根散落枯枝悶燒成 2 塊黑曜木炭！" },
    { id: "wk_bronze_ingot",    name: "冶煉青銅合金錠 x1",     category: "smelt",    toKey: "bronzeIngot",    toCount: 1, cost: { copperOre: 1, tinOre: 1 },    desc: "【合金冶煉】將赤銅礦與白錫礦熔煉為青銅合金錠。" },
    { id: "wk_plank",           name: "加工厚木板 x1",         category: "smelt",    toKey: "plank",          toCount: 1, cost: { wood: 2 },                    desc: "【工程建材】將 2 塊翠風原木裁切為堅固的厚木板，用於修橋與升級大帆船。" },
    { id: "wk_rope",            name: "強化麻繩索 x1",         category: "smelt",    toKey: "rope",           toCount: 1, cost: { vine: 2 },                    desc: "【工程建材】將 2 條堅韌藤蔓編織為麻繩索，用於修復峽谷吊橋與造船。" },
    { id: "wk_rope_hemp",       name: "亞麻編織繩 x2",         category: "smelt",    toKey: "rope",           toCount: 2, cost: { hemp: 2 },                    desc: "【高效製繩】以峽谷荒野亞麻一次編織出 2 條強韌麻繩索。" },
    { id: "wk_pitch",           name: "防水松脂膠 x1",         category: "smelt",    toKey: "pitch",          toCount: 1, cost: { resin: 2, clay: 1 },          desc: "【造船建材】混合琥珀松脂與河畔黏土熬製的防水塗料。" },
    { id: "wk_nails",           name: "鍛造鐵釘 x2",           category: "smelt",    toKey: "nails",          toCount: 2, cost: { iron: 1 },                    desc: "【工程建材】將藍晶鐵礦鍛打為工程鐵釘。" },
    { id: "wk_steel_cable",     name: "秘銀強化鋼索 x1",       category: "smelt",    toKey: "steelCable",     toCount: 1, cost: { mithril: 1, rope: 1 },        desc: "【高階建材】融合流沙秘銀與麻繩索打造的超強韌鋼索。" },
    { id: "wk_heavy_sail",      name: "防風重帆布 x1",         category: "smelt",    toKey: "heavySail",      toCount: 1, cost: { sailCloth: 2, rope: 1 },      desc: "【遠航建材】縫合幽靈古帆布與麻繩，用於建造破浪遠洋大帆船。" },
    { id: "wk_warm_fur",        name: "禦寒獸毛氈 x1",         category: "smelt",    toKey: "warmFur",        toCount: 1, cost: { sinew: 2, hemp: 1 },          desc: "【極地建材】搭建雪原防風避難屋與高階防寒護甲的保暖毛氈。" },
    { id: "wk_spiced_stew",     name: "香辛海陸燉肉 x1",       category: "survival", toKey: "spicedStew",     toCount: 1, cost: { fish: 1, herb: 1, rockSalt: 1 }, desc: "【★極品增益料理】食用立即恢復 100% 飽食度 + 150 HP，並永久提升主角最大生命值 +15！" },
    { id: "wk_ration_jerky",    name: "岩鹽風乾肉脯 x2",       category: "survival", toKey: "rationJerky",    toCount: 2, cost: { fish: 1, rockSalt: 1 },       desc: "【頂級口糧】以高台結晶岩鹽醃製鮮魚，食用每份恢復 +80% 飽食度與 +90 HP！" },
    { id: "wk_ration_herb",     name: "烘烤微光菇乾 x2",       category: "survival", toKey: "rationHerb",     toCount: 2, cost: { herb: 1, branch: 1 },         desc: "【基礎口糧】食用每份可恢復 +35% 飽食度與 +25 HP。" },
    { id: "wk_ration_fish",     name: "炭烤鮮魚乾 x2",         category: "survival", toKey: "rationFish",     toCount: 2, cost: { fish: 1, branch: 1 },         desc: "【進階口糧】食用每份可恢復 +60% 飽食度與 +60 HP。" },
    { id: "wk_alchemy_heal",    name: "精煉生命藥水 x2",       category: "survival", toKey: "potionHeal",     toCount: 2, cost: { herb: 2, quartz: 1 },         desc: "【隨身提煉】以微光菇 x2 與高台石英砂燒製的玻璃瓶，免費提煉 2 瓶生命藥水！" },
    { id: "wk_alchemy_hint",    name: "精煉洞察藥水 x2",       category: "survival", toKey: "potionHint",     toCount: 2, cost: { flower: 1, resin: 1, quartz: 1 }, desc: "【隨身提煉】以太陽花、松脂與高台石英砂提煉 2 瓶洞察藥水！" }
  ];

  db.ZONE_STORY_CHAINS = {
    zone1_forest: {
      zoneId: "zone1_forest", title: "第一章・翠風森林 5 大解題任務指引", npcName: "斥候・里奧",
      storyIntro: "完成以下解題任務，即可免費獲得修橋用的【厚木板、麻繩】、地底遺跡鑰匙，並削弱千年樹妖王 2 層護盾！",
      step1GateId: "tg_z1_briar", step2GateId: "tg_z1_sunken",
      tasks: [
        { id: "cliff",  x: 560, y: 800, short: "【解題1:爬高台】於工坊用(原木1+藤蔓1)造【攀岩繩梯】➔ 去懸崖(560,800)爬上高台", detail: "① 在【工坊➔🧗解謎工具】用「翠風原木x1+堅韌藤蔓x1」合成【攀岩繩梯】 ➔ 走到懸崖邊(x:560, y:800)按 A 鍵架設，即可爬上高台與進入山洞！" },
        { id: "gate1",  x: 420, y: 540, short: "【解題2:斬荊棘】於工坊用(原木1+燧石1)造【除荊鐮刀】➔ 去(420,540)斬開🌿荊棘魔藤(送厚木板x3)", detail: "② 在【工坊➔🧗解謎工具】用「翠風原木x1+尖銳燧石x1」合成【✂️除荊開路鐮刀】 ➔ 走到(x:420, y:540)按 A 鍵斬開【🌿荊棘魔藤】，直接送修橋厚木板x3+麻繩x2！" },
        { id: "puzzle", x: 230, y: 880, short: "【解題3:點火盆】去機關區(230,880)順着數字點燃【🔥火盆①➔②➔③➔④】開機關寶箱", detail: "③ 走到機關區古碑陣(x:230, y:880)，順着火盆頭頂的數字次序「🔥火盆①(東) ➔ 🔥火盆②(南) ➔ 🔥火盆③(西) ➔ 🔥火盆④(北)」按 A 鍵點燃，再按中間寶箱領獎！" },
        { id: "gate2",  x: 985, y: 480, short: "【解題4:撈沉寶】於工坊用(鐵礦1+藤蔓1)造【打撈磁鉤】➔ 去河邊(985,480)撈起⚓沉沒寶箱", detail: "④ 在【工坊➔🧗解謎工具】用「藍晶鐵礦x1+堅韌藤蔓x1」合成【🧲深水打撈磁鉤】 ➔ 走到河邊水泡點(x:985, y:480)按 A 鍵撈起【⚓沉沒寶箱】！" },
        { id: "crypt",  x: 944, y: 1015, short: "【解題5:挖地宮】於工坊➔⛏️工具造【Lv.1探險鐵鏟】➔ 挖地面「✖」拎鑰匙開(944,1015)地底遺跡", detail: "⑤ 在【工坊➔⛏️工具】用「原木x1+鐵礦x1」升級【Lv.1 精鐵探險鏟】 ➔ 對準地面「✖藏寶點」按 A 鍵挖出【🗝️遠古遺跡鑰匙】 ➔ 開啟遺跡處(x:944, y:1015)的【🔒地底遺跡】！" }
      ],
      bossDebuffMsg: "🌟【森林解題加成】：千年樹妖王護盾上限已削弱 -2！"
    },
    cave1_mushroom: {
      zoneId: "cave1_mushroom", title: "第二章前篇・蘑菇洞窟 5 大解題任務指引", npcName: "矮人探勘員",
      storyIntro: "完成以下解題任務，可直接免費獲得砌築【永明聖火燈塔】所需的【玄武岩塊、流沙秘銀、黏土與松脂】！",
      step1GateId: "tg_c1_ice", step2GateId: "tg_c1_briar",
      tasks: [
        { id: "cliff",  x: 352, y: 768, short: "【解題1:爬高台】用【攀岩繩梯(原木1+藤蔓1)】去懸崖(352,768)爬上高台挖玄武岩與秘銀", detail: "① 在【工坊】合成【攀岩繩梯】(原木x1+藤蔓x1) ➔ 到洞窟懸崖(x:352, y:768)爬上高台與進入岩壁礦洞，直接開採燈塔所需的【玄武岩塊】與【流沙秘銀】！" },
        { id: "gate1",  x: 860, y: 640, short: "【解題2:融玄冰】於工坊用(枯枝2+燧石1)造【高熱火種】➔ 去(860,640)融化🧊玄冰晶殼(送秘銀+玄武岩)", detail: "② 在【工坊➔🧗解謎工具】用「散落枯枝x2+尖銳燧石x1」合成【🔥高熱鋁熱火種】 ➔ 走到(x:860, y:640)按 A 鍵融化【🧊玄冰晶殼】，直接獲得流沙秘銀x2+玄武岩塊x2！" },
        { id: "puzzle", x: 810, y: 880, short: "【解題3:開拉桿】去機關區(810,880)按 A 鍵將【拉桿①、②、③】全部推成綠色[🟢開]拎寶箱", detail: "③ 走到機關區(x:810, y:880)，對準「拉桿①、拉桿②、拉桿③」按 A 鍵，將 3 個拉桿全部變成綠色【🟢開】，即可打開中間的機關寶箱！" },
        { id: "gate2",  x: 680, y: 480, short: "【解題4:斬魔藤】用【除荊鐮刀(原木1+燧石1)】去(680,480)斬開🌿幽窟魔藤(送玄武岩+黏土+松脂)", detail: "④ 帶着【✂️除荊開路鐮刀】走到洞窟中段(x:680, y:480)按 A 鍵斬開【🌿幽窟魔藤】，免費領取玄武岩塊x2+河畔黏土x3+琥珀松脂x3！" },
        { id: "crypt",  x: 608, y: 1010, short: "【解題5:挖地宮】用【探險鐵鏟】挖地面「✖」拎鑰匙 ➔ 開啟(608,1010)地底秘銀聖堂", detail: "⑤ 用【探險鐵鏟】挖掘洞窟地面「✖藏寶點」取得【🗝️遠古遺跡鑰匙】 ➔ 前往遺跡處(x:608, y:1010)進入【🔒幽窟地底秘銀聖堂】！" }
      ],
      bossDebuffMsg: "🌟【幽窟解題加成】：洞窟首領護盾上限已削弱 -2！"
    },
    zone2_canyon: {
      zoneId: "zone2_canyon", title: "第二章後篇・流沙峽谷 5 大解題任務指引", npcName: "斥候隊長・凱爾",
      storyIntro: "完成以下解題任務，即可獲得修復峽谷吊橋所需的【強化麻繩、秘銀鋼索】並削弱流沙巨蠍王 2 層護盾！",
      step1GateId: "tg_z2_gear", step2GateId: "tg_z2_sunken",
      tasks: [
        { id: "cliff",  x: 560, y: 704, short: "【解題1:爬高台】用【攀岩繩梯(原木1+藤蔓1)】去中央懸崖(560,704)爬上高台挖流沙秘銀", detail: "① 用【攀岩繩梯】爬上峽谷中央高台(x:560, y:704)與岩壁礦洞，開採高純度流沙秘銀、赤銅礦與透明石英砂！" },
        { id: "gate1",  x: 720, y: 540, short: "【解題2:嵌齒輪】於工坊用(鐵礦1+燧石1)造【精密齒輪】➔ 放入中央(720,540)⚙️齒輪柱(送麻繩+鋼索)", detail: "② 在【工坊➔🧗解謎工具】用「藍晶鐵礦x1+尖銳燧石x1」合成【⚙️精密青銅齒輪】 ➔ 走到流沙盆地中央(x:720, y:540)放入【⚙️齒輪機關柱】，直接送強化麻繩x3+秘銀鋼索x2！" },
        { id: "puzzle", x: 810, y: 970, short: "【解題3:轉石像】去機關區(810,970)按 A 鍵將 4 座石像轉去頭頂寫住的目標方向變綠色[✅]", detail: "③ 走到機關區石像陣(x:810, y:970)，看每座石像頭頂寫住的目標（如「西衛[轉去▶東]」），按 A 鍵將 4 座石像都轉成綠色【✅】，即可打開中間的寶箱！" },
        { id: "gate2",  x: 985, y: 520, short: "【解題4:撈沉寶】用【打撈磁鉤(鐵礦1+藤蔓1)】去河岸(985,520)撈起⚓峽谷沉寶", detail: "④ 帶着【🧲深水打撈磁鉤】走到峽谷東側河岸(x:985, y:520)按 A 鍵，打撈起【⚓峽谷沉寶】獲取秘銀與玄武岩！" },
        { id: "crypt",  x: 185, y: 950, short: "【解題5:挖王陵】用【探險鐵鏟】挖地面「✖」拎鑰匙 ➔ 開啟(185,950)流沙法老王陵", detail: "⑤ 用【探險鐵鏟】挖掘地面「✖藏寶點」取得【🗝️遠古遺跡鑰匙】 ➔ 開啟遺跡處(x:185, y:950)的【🔒流沙埋沒法老王陵】！" }
      ],
      bossDebuffMsg: "🌟【峽谷解題加成】：流沙巨蠍王護盾上限已削弱 -2！"
    },
    zone3_coast: {
      zoneId: "zone3_coast", title: "第三章・翡翠海岸 5 大解題任務指引", npcName: "老船匠・達克",
      storyIntro: "完成以下解題任務，即可獲得升級遠洋大帆船所需的【防風重帆布、防水松脂膠、深海珊瑚】並削弱幽靈船長！",
      step1GateId: "tg_z3_sunken", step2GateId: "tg_z3_gear",
      tasks: [
        { id: "cliff",  x: 520, y: 784, short: "【解題1:爬高台】用【攀岩繩梯】爬上懸崖(520,784)採集深海珊瑚與幽靈古帆布", detail: "① 用【攀岩繩梯】爬上海岸 U 型高台(x:520, y:784)與岩壁礦洞，直接採集深海珊瑚與幽靈古帆布！" },
        { id: "gate1",  x: 760, y: 580, short: "【解題2:撈沉船】用【打撈磁鉤(鐵礦1+藤蔓1)】去新月海灣(760,580)撈起⚓深海沉船箱(送重帆布)", detail: "② 帶着【🧲深水打撈磁鉤】走到中央新月海灣(x:760, y:580)按 A 鍵撈起【⚓深海沉船箱】，直接獲得防風重帆布x2+幽靈古帆布x3+防水松脂膠x2！" },
        { id: "puzzle", x: 520, y: 1015, short: "【解題3:開水閘】去機關區(520,1015)將【水閘拉桿①、②、③】全部按成綠色[🟢開]拎寶箱", detail: "③ 走到機關區水閘陣(x:520, y:1015)，對準 3 個水閘拉桿按 A 鍵，將它們全部推成綠色【🟢開】，即可打開中間的海神寶箱！" },
        { id: "gate2",  x: 560, y: 660, short: "【解題4:嵌齒輪】用【精密齒輪(鐵礦1+燧石1)】放入(560,660)⚙️海神齒輪柱(送珊瑚+厚木板)", detail: "④ 在【工坊】用「鐵礦x1+燧石x1」合成【⚙️精密青銅齒輪】 ➔ 走到(x:560, y:660)放入【⚙️海神齒輪柱】，獲得深海珊瑚x3+厚木板x3！" },
        { id: "crypt",  x: 948, y: 990, short: "【解題5:挖密室】用【探險鐵鏟】挖地面「✖」拎鑰匙 ➔ 開啟(948,990)海底亞特蘭蒂斯密室", detail: "⑤ 用【探險鐵鏟】挖掘海岸「✖藏寶點」取得【🗝️遠古遺跡鑰匙】 ➔ 開啟遺跡處(x:948, y:990)的【🔒海底亞特蘭蒂斯密室】！" }
      ],
      bossDebuffMsg: "🌟【海岸解題加成】：深海幽靈船長護盾上限已削弱 -2！"
    },
    zone4_snow: {
      zoneId: "zone4_snow", title: "第四章・霜語雪原 5 大解題任務指引", npcName: "冰原獵手・弗雷",
      storyIntro: "完成以下解題任務，即可獲得搭建防風避難屋所需的【禦寒獸毛氈、強韌獸筋】並削弱極寒冰龍王 2 層護盾！",
      step1GateId: "tg_z4_ice1", step2GateId: "tg_z4_briar",
      tasks: [
        { id: "cliff",  x: 720, y: 768, short: "【解題1:爬高台】用【攀岩繩梯】爬上懸崖(720,768)採集熔岩黑曜石、強韌獸筋與冰蓮", detail: "① 用【攀岩繩梯】爬上雪原東南高台(x:720, y:768)與岩壁礦洞，直接採集熔岩黑曜石、強韌獸筋與極地冰蓮！" },
        { id: "gate1",  x: 700, y: 540, short: "【解題2:融冰棺】用【高熱火種(枯枝2+燧石1)】去鏡湖(700,540)融化🧊萬年玄冰棺(送禦寒獸毛氈)", detail: "② 在【工坊】用「枯枝x2+燧石x1」合成【🔥高熱鋁熱火種】 ➔ 走到中央鏡湖(x:700, y:540)融化【🧊萬年玄冰棺】，直接送禦寒獸毛氈x2+獸筋x3！" },
        { id: "puzzle", x: 260, y: 960, short: "【解題3:點火盆】去機關區(260,960)順着數字點燃【🔥火盆①➔②➔③➔④】開機關寶箱", detail: "③ 走到機關區融霜陣(x:260, y:960)，順着火盆頭頂數字次序「🔥火盆①(北) ➔ 🔥火盆②(西) ➔ 🔥火盆③(南) ➔ 🔥火盆④(東)」點燃，打開中間寶箱！" },
        { id: "gate2",  x: 880, y: 660, short: "【解題4:斬霜棘】用【除荊鐮刀(原木1+燧石1)】去(880,660)斬開🌿霜棘魔藤(送冰蓮+黑曜石)", detail: "④ 帶着【✂️除荊開路鐮刀】走到(x:880, y:660)按 A 鍵斬開【🌿霜棘魔藤】，領取極地冰蓮x3+熔岩黑曜石x2！" },
        { id: "crypt",  x: 185, y: 690, short: "【解題5:挖神殿】用【探險鐵鏟】挖地面「✖」拎鑰匙 ➔ 開啟(185,690)永凍冰河遠古神殿", detail: "⑤ 用【探險鐵鏟】挖掘雪原「✖藏寶點」取得【🗝️遠古遺跡鑰匙】 ➔ 開啟遺跡處(x:185, y:690)的【🔒永凍冰河遠古神殿】！" }
      ],
      bossDebuffMsg: "🌟【雪原解題加成】：極寒冰龍王護盾上限已削弱 -2！"
    },
    zone5_volcano: {
      zoneId: "zone5_volcano", title: "第五章・熔岩火山 5 大解題任務指引", npcName: "紅蓮學者・伊格",
      storyIntro: "完成以下解題任務，即可直接獲得鋪設火山石拱橋所需的【黑曜耐火磚x3、炎魔熔核x1、熔岩龍鱗x2】並削弱火山龍皇！",
      step1GateId: "tg_z5_magma", step2GateId: "tg_z5_gear",
      tasks: [
        { id: "cliff",  x: 352, y: 768, short: "【解題1:爬高台】用【攀岩繩梯】爬上懸崖(352,768)採集熔岩龍鱗、炎魔熔核與石英砂", detail: "① 用【攀岩繩梯】爬上火山西南高台(x:352, y:768)與岩壁礦洞，直接開採【熔岩龍鱗】、【炎魔熔核】與【透明石英砂】！" },
        { id: "gate1",  x: 720, y: 560, short: "【解題2:碎熔岩】於工坊用(石英砂1+黏土1)造【急凍晶瓶】➔ 去火口(720,560)震碎🔥熔岩殼(送耐火磚x3+熔核)", detail: "② 在【工坊➔🧗解謎工具】用「透明石英砂x1+河畔黏土x1」合成【❄️極寒急凍晶瓶】 ➔ 去中央火口(x:720, y:560)震碎【🔥熔岩黑曜殼】，直接送黑曜耐火磚x3+炎魔熔核x1！" },
        { id: "puzzle", x: 830, y: 930, short: "【解題3:開閥門】去機關區(830,930)將【冷卻拉桿①、②、③】全部按成綠色[🟢開]拎寶箱", detail: "③ 走到機關區熔爐閥門(x:830, y:930)，將 3 個冷卻閥門拉桿全部按成綠色【🟢開】，即可打開中間的機關寶箱！" },
        { id: "gate2",  x: 880, y: 660, short: "【解題4:嵌齒輪】用【精密齒輪(鐵礦1+燧石1)】放入(880,660)⚙️熔爐齒輪柱(送黑曜石+秘銀)", detail: "④ 用「鐵礦x1+燧石x1」合成【⚙️精密青銅齒輪】 ➔ 走到(x:880, y:660)放入【⚙️熔爐齒輪柱】，獲得熔岩黑曜石x3+流沙秘銀x3！" },
        { id: "crypt",  x: 1120, y: 240, short: "【解題5:戰龍皇】去河邊(980,240)鋪好耐火石拱橋 ➔ 過東岸(1120,240)擊敗守關領主・紅蓮火山龍皇", detail: "⑤ 集齊耐火磚後到熔岩河邊工程牌(x:980, y:240)鋪好石拱橋 ➔ 過橋到東岸(x:1120, y:240)挑戰【守關領主・紅蓮火山龍皇】！" }
      ],
      bossDebuffMsg: "🌟【火山解題加成】：紅蓮火山龍皇護盾上限已削弱 -2！"
    },
    zone6_sky: {
      zoneId: "zone6_sky", title: "最終章・天界聖殿 5 大解題任務指引", npcName: "破曉大賢者",
      storyIntro: "完成以下解題任務，即可獲得【古文明聖碑殘片、深淵星隕鐵、黃金世界樹葉】鍛造 T10 破曉神裝並削弱最終領主！",
      step1GateId: "tg_z6_gear", step2GateId: "tg_z6_magma",
      tasks: [
        { id: "cliff",  x: 592, y: 784, short: "【解題1:爬高台】用【攀岩繩梯】爬上懸崖(592,784)採集深淵星隕鐵與黃金世界樹葉", detail: "① 用【攀岩繩梯】爬上天界中央聖台(x:592, y:784)與岩壁礦洞，開採最高階【深淵星隕鐵】與【黃金世界樹葉】！" },
        { id: "gate1",  x: 720, y: 550, short: "【解題2:啟星柱】用【精密齒輪(鐵礦1+燧石1)】放入中央(720,550)⚙️星界齒輪柱(送聖碑殘片+星隕鐵)", detail: "② 用「鐵礦x1+燧石x1」合成【⚙️精密青銅齒輪】 ➔ 走到中央星壇(x:720, y:550)放入【⚙️星界齒輪柱】，直接獲得古文明聖碑殘片x1+深淵星隕鐵x3！" },
        { id: "puzzle", x: 205, y: 965, short: "【解題3:轉星像】去機關區(205,965)按 A 鍵將 4 座星像轉去頭頂寫住的目標方向變綠色[✅]", detail: "③ 走到機關區星壇(x:205, y:965)，按 A 鍵將 4 座星像轉向頭頂提示的方向（北▲北、東▶東、南▼南、西◀西）全部變綠【✅】，打開寶箱！" },
        { id: "gate2",  x: 880, y: 660, short: "【解題4:碎星核】用【急凍晶瓶(石英砂1+黏土1)】去(880,660)震碎🔥星核晶殼(送星隕鐵+金葉)", detail: "④ 用「透明石英砂x1+河畔黏土x1」合成【❄️極寒急凍晶瓶】 ➔ 走到(x:880, y:660)震碎【🔥星核晶殼】，獲得星隕鐵x3+黃金樹葉x2！" },
        { id: "crypt",  x: 925, y: 985, short: "【解題5:挖密室】用【探險鐵鏟】挖「✖」拎鑰匙 ➔ 開(925,985)星界創世密室拎聖碑殘片", detail: "⑤ 用【探險鐵鏟】挖掘「✖藏寶點」取得【🗝️遠古遺跡鑰匙】 ➔ 開啟遺跡處(x:925, y:985)的【🔒星界破曉創世密室】開啟聖物石棺！" }
      ],
      bossDebuffMsg: "🌟【星界解題加成】：天界最終領主護盾上限已削弱 -2！"
    }
  };

  db.ZONE_TOOL_GATE_OBSTACLES = {
    zone1_forest: [
      { id: "tg_z1_briar",  x: 420, y: 540, gateType: "briar",  sprite: "gate_briar_vines",  name: "🌿荊棘魔藤[用除荊鐮刀]", reqKey: "briarSickle",    consume: false, rewardGold: 220, rewardMats: { plank: 3, rope: 2, herb: 3 } },
      { id: "tg_z1_sunken", x: 985, y: 480, gateType: "sunken", sprite: "gate_sunken_chest", name: "⚓沉沒寶箱[用打撈磁鉤]", reqKey: "salvageHook",    consume: false, rewardGold: 260, rewardMats: { iron: 3, quartz: 2, fish: 4 } }
    ],
    cave1_mushroom: [
      { id: "tg_c1_ice",    x: 860, y: 640, gateType: "ice",    sprite: "gate_element_geode",name: "🧊玄冰晶殼[用高熱火種]", reqKey: "thermitePowder", consume: true,  rewardGold: 320, rewardMats: { mithril: 2, basalt: 2, cryptKey: 1 } },
      { id: "tg_c1_briar",  x: 680, y: 480, gateType: "briar",  sprite: "gate_briar_vines",  name: "🌿幽窟魔藤[用除荊鐮刀]", reqKey: "briarSickle",    consume: false, rewardGold: 250, rewardMats: { basalt: 2, clay: 3, resin: 3 } }
    ],
    zone2_canyon: [
      { id: "tg_z2_gear",   x: 720, y: 540, gateType: "gear",   sprite: "gate_gear_pillar",  name: "⚙️齒輪機關柱[用精密齒輪]", reqKey: "ancientGear",    consume: true,  rewardGold: 300, rewardMats: { rope: 3, steelCable: 2, mithril: 2 } },
      { id: "tg_z2_sunken", x: 985, y: 520, gateType: "sunken", sprite: "gate_sunken_chest", name: "⚓峽谷沉寶[用打撈磁鉤]",   reqKey: "salvageHook",    consume: false, rewardGold: 280, rewardMats: { mithril: 2, basalt: 3, cryptKey: 1 } }
    ],
    zone3_coast: [
      { id: "tg_z3_sunken", x: 760, y: 580, gateType: "sunken", sprite: "gate_sunken_chest", name: "⚓深海沉船箱[用打撈磁鉤]", reqKey: "salvageHook",    consume: false, rewardGold: 360, rewardMats: { heavySail: 2, sailCloth: 3, pitch: 2 } },
      { id: "tg_z3_gear",   x: 560, y: 660, gateType: "gear",   sprite: "gate_gear_pillar",  name: "⚙️海神齒輪柱[用精密齒輪]", reqKey: "ancientGear",    consume: true,  rewardGold: 340, rewardMats: { coral: 3, plank: 3, cryptKey: 1 } }
    ],
    zone4_snow: [
      { id: "tg_z4_ice1",   x: 700, y: 540, gateType: "ice",    sprite: "gate_element_geode",name: "🧊萬年玄冰棺[用高熱火種]", reqKey: "thermitePowder", consume: true,  rewardGold: 420, rewardMats: { warmFur: 2, sinew: 3, iceLotus: 3 } },
      { id: "tg_z4_briar",  x: 880, y: 660, gateType: "briar",  sprite: "gate_briar_vines",  name: "🌿霜棘魔藤[用除荊鐮刀]",   reqKey: "briarSickle",    consume: false, rewardGold: 380, rewardMats: { iceLotus: 3, obsidian: 2, cryptKey: 1 } }
    ],
    zone5_volcano: [
      { id: "tg_z5_magma",  x: 720, y: 560, gateType: "magma",  sprite: "gate_element_geode",name: "🔥熔岩黑曜殼[用急凍晶瓶]", reqKey: "frostEssence",   consume: true,  rewardGold: 480, rewardMats: { obsidian: 3, starIron: 2, cryptKey: 1 } },
      { id: "tg_z5_gear",   x: 880, y: 660, gateType: "gear",   sprite: "gate_gear_pillar",  name: "⚙️熔爐齒輪柱[用精密齒輪]", reqKey: "ancientGear",    consume: true,  rewardGold: 450, rewardMats: { obsidian: 3, mithril: 3 } }
    ],
    zone6_sky: [
      { id: "tg_z6_gear",   x: 720, y: 550, gateType: "gear",   sprite: "gate_gear_pillar",  name: "⚙️星界齒輪柱[用精密齒輪]", reqKey: "ancientGear",    consume: true,  rewardGold: 600, rewardMats: { starIron: 3, goldLeaf: 2, tabletShard: 1 } },
      { id: "tg_z6_magma",  x: 880, y: 660, gateType: "magma",  sprite: "gate_element_geode",name: "🔥星核晶殼[用急凍晶瓶]",   reqKey: "frostEssence",   consume: true,  rewardGold: 600, rewardMats: { starIron: 3, goldLeaf: 2 } }
    ]
  };

  db.ZONE_EXPLORE_PUZZLES = {
    zone1_forest: {
      type: "brazier_order", cx: 230, cy: 880,
      riddle: "📜【森林小提示】：「請順着數字次序，由 ① 到 ④ 點燃四個火盆（火盆① ➔ 火盆② ➔ 火盆③ ➔ 火盆④），就能打開中間的寶箱！」",
      items: [
        { dx: 64, dy: 0, order: 1, label: "火盆①(東)" }, { dx: 0, dy: 58, order: 2, label: "火盆②(南)" },
        { dx: -64, dy: 0, order: 3, label: "火盆③(西)" }, { dx: 0, dy: -58, order: 4, label: "火盆④(北)" }
      ]
    },
    cave1_mushroom: {
      type: "lever_toggle", cx: 810, cy: 880,
      riddle: "📜【礦洞小提示】：「走到下面 3 個拉桿旁邊按 A 鍵，將『拉桿①、拉桿②、拉桿③』全部變成綠色【🟢開】，就能打開中間的寶箱！」"
    },
    zone2_canyon: {
      type: "statue_rotate", cx: 810, cy: 970,
      riddle: "📜【石像小提示】：「走到每座石像旁按 A 鍵轉動方向，只要 4 座石像都轉去頭頂寫住的目標方向變成綠色【✅】，寶箱就會打開！」",
      statues: [
        { dx: -64, dy: 0, initDir: 0, targetDir: 1, name: "西衛" }, { dx: 64, dy: 0, initDir: 1, targetDir: 3, name: "東衛" },
        { dx: 0, dy: -58, initDir: 3, targetDir: 2, name: "北衛" }, { dx: 0, dy: 58, initDir: 2, targetDir: 0, name: "南衛" }
      ]
    },
    zone3_coast: {
      type: "lever_toggle", cx: 520, cy: 1015,
      riddle: "📜【水閘小提示】：「走到下面 3 個水閘拉桿旁按 A 鍵，將 3 個拉桿全部變成綠色【🟢開】，就能打開中間的海神寶箱！」"
    },
    zone4_snow: {
      type: "brazier_order", cx: 260, cy: 960,
      riddle: "📜【冰原小提示】：「請順着數字次序，由 ① 到 ④ 點燃四個融霜火盆（火盆① ➔ 火盆② ➔ 火盆③ ➔ 火盆④），就能打開寶箱！」",
      items: [
        { dx: 0, dy: -58, order: 1, label: "火盆①(北)" }, { dx: -64, dy: 0, order: 2, label: "火盆②(西)" },
        { dx: 0, dy: 58, order: 3, label: "火盆③(南)" },  { dx: 64, dy: 0, order: 4, label: "火盆④(東)" }
      ]
    },
    zone5_volcano: {
      type: "lever_toggle", cx: 830, cy: 930,
      riddle: "📜【火山小提示】：「走到下面 3 個冷卻閥門拉桿旁按 A 鍵，將 3 個拉桿全部變成綠色【🟢開】，就能打開寶箱拎耐火磚！」"
    },
    zone6_sky: {
      type: "statue_rotate", cx: 205, cy: 965,
      riddle: "📜【星象小提示】：「按 A 鍵轉動 4 座星像，令每座星像都對準頭頂寫住的目標方向變成綠色【✅】，就能打開天界寶箱！」",
      statues: [
        { dx: 0, dy: -58, initDir: 2, targetDir: 0, name: "北像" }, { dx: 64, dy: 0, initDir: 3, targetDir: 1, name: "東像" },
        { dx: 0, dy: 58, initDir: 0, targetDir: 2, name: "南像" },  { dx: -64, dy: 0, initDir: 1, targetDir: 3, name: "西像" }
      ]
    }
  };

  db.HIGHLAND_ZONES = {
    zone1_forest:   { targetW: 1680, targetH: 1180, ores: ["copperOre", "tinOre", "quartz", "rockSalt"],  grottoOres: ["copperOre", "tinOre", "coal", "quartz"],    cryptName: "翠風古老樹根地窖", cryptBoss: "★遠古樹根守衛魔像" },
    cave1_mushroom: { targetW: 1580, targetH: 1140, ores: ["basalt", "mithril", "copperOre", "tinOre"],   grottoOres: ["basalt", "mithril", "tinOre", "copperOre"], cryptName: "幽窟地底秘銀聖堂", cryptBoss: "★秘銀晶簇鎮守魔像" },
    zone2_canyon:   { targetW: 1680, targetH: 1180, ores: ["copperOre", "tinOre", "mithril", "quartz"],   grottoOres: ["copperOre", "tinOre", "mithril", "basalt"], cryptName: "流沙埋沒法老王陵", cryptBoss: "★荒漠王陵黃金魔像" },
    zone3_coast:    { targetW: 1680, targetH: 1180, ores: ["coral", "sailCloth", "rockSalt", "quartz"],   grottoOres: ["coral", "sailCloth", "tinOre", "mithril"],  cryptName: "海底亞特蘭蒂斯密室", cryptBoss: "★深海遺跡三叉戟魔像" },
    zone4_snow:     { targetW: 1680, targetH: 1180, ores: ["obsidian", "sinew", "iceLotus", "quartz"],    grottoOres: ["obsidian", "sinew", "coal", "mithril"],     cryptName: "永凍冰河遠古神殿", cryptBoss: "★極寒永凍冰晶魔像" },
    zone5_volcano:  { targetW: 1680, targetH: 1180, ores: ["obsidian", "starIron", "coal", "quartz"],     grottoOres: ["obsidian", "starIron", "coal", "quartz"],   cryptName: "地心黑曜熔爐秘殿", cryptBoss: "★紅蓮火山龍皇・分身" },
    zone6_sky:      { targetW: 1680, targetH: 1180, ores: ["starIron", "goldLeaf", "quartz", "obsidian"], grottoOres: ["starIron", "goldLeaf", "quartz", "obsidian"],cryptName: "星界破曉創世密室", cryptBoss: "★創世星隕守護神像" }
  };

  // ================= 5. 資料註冊與進度查詢邏輯 =================
  const dataMgr = {
    dynamicGuaranteedRecipes: [],

    buildGuaranteedQuestMaterialRecipes: function() {
      const Data = window.Aetheria.Data;
      if (!Data || !Data.MATERIALS) return;
      const mats = Data.MATERIALS;
      const existingOutKeys = {};

      db.COMPLETE_WORKSHOP_RECIPES.forEach(function(r) { existingOutKeys[r.toKey] = true; });
      const rawWks = Array.isArray(Data.WORKSHOP_RECIPES)
        ? Data.WORKSHOP_RECIPES
        : (Data.WORKSHOP_RECIPES && typeof Data.WORKSHOP_RECIPES === "object" ? Object.values(Data.WORKSHOP_RECIPES) : []);
      rawWks.forEach(function(r) {
        if (r) existingOutKeys[r.toKey || r.giveKey || r.outKey] = true;
      });

      this.dynamicGuaranteedRecipes = [];
      const self = this;

      Object.keys(mats).forEach(function(mKey) {
        if (db.REMOVED_BLOAT_MATERIAL_IDS.indexOf(mKey) !== -1) return;
        const mObj = mats[mKey];
        if (!mObj || !mObj.name) return;
        const mName = mObj.name;

        let costMap = null, count = 1, descText = "";
        if (mName.indexOf("耐火磚") !== -1 && !existingOutKeys[mKey]) {
          costMap = { obsidian: 1, basalt: 1, clay: 1 };
          descText = "【★六章拱橋建材】以熔岩黑曜石、玄武岩與黏土燒製的耐火石磚，用於鋪設火山石拱橋！";
        } else if (mName.indexOf("龍鱗") !== -1 && !existingOutKeys[mKey]) {
          costMap = { obsidian: 1, coal: 1 };
          descText = "【★六章任務保底】除討伐火山魔物與採集高台獲得外，亦可用黑曜石與黑木炭直接提煉【" + mName + "】！";
        } else if (mName.indexOf("熔核") !== -1 && !existingOutKeys[mKey]) {
          costMap = { obsidian: 1, mithril: 1 };
          descText = "【★六章任務保底】除擊敗火山精英/領主掉落外，亦可在工坊凝聚黑曜石與秘銀直接合成【" + mName + "】！";
        } else if (mName.indexOf("海妖") !== -1 && !existingOutKeys[mKey]) {
          costMap = { coral: 1, mithril: 1 };
          descText = "【★遠洋大帆船核心保底】除擊敗深海頭目獲得外，亦可用深海珊瑚與秘銀共鳴合成【" + mName + "】！";
        } else if (mName.indexOf("帆布") !== -1 && mKey !== "heavySail" && !existingOutKeys[mKey]) {
          costMap = { hemp: 1, vine: 1 }; count = 2;
          descText = "【★四章海岸建材保底】以荒野亞麻與藤蔓編織【" + mName + "】，不用再苦刷海岸怪物掉落！";
        } else if (mName.indexOf("獸筋") !== -1 && !existingOutKeys[mKey]) {
          costMap = { rope: 1, resin: 1 }; count = 2;
          descText = "【★五章雪原建材保底】以強化麻繩浸潤琥珀松脂製成【" + mName + "】，輕鬆合成禦寒獸毛氈！";
        } else if ((mName.indexOf("聖碑") !== -1 || mName.indexOf("殘片") !== -1) && !existingOutKeys[mKey]) {
          costMap = { starIron: 1, quartz: 1 };
          descText = "【★終章聖碑保底】除開啟各區地底遺跡石棺獲得外，亦可用星隕鐵與石英砂修復合成【" + mName + "】！";
        } else if ((mName.indexOf("浮空") !== -1 || mName.indexOf("天界") !== -1 || mName.indexOf("星輝") !== -1) && !existingOutKeys[mKey]) {
          costMap = { starIron: 1, quartz: 1 };
          descText = "【★終章天界建材保底】以深淵星隕鐵與透明石英砂鍛造【" + mName + "】！";
        }

        if (costMap) {
          existingOutKeys[mKey] = true;
          self.dynamicGuaranteedRecipes.push({
            id: "wk_auto_guarantee_" + mKey,
            name: mName + (count > 1 ? (" x" + count) : " x1"),
            category: "smelt", toKey: mKey, toCount: count, cost: costMap, desc: descText
          });
        }
      });
    },

    registerIntoGame: function() {
      const Data = window.Aetheria.Data;
      if (!Data) return;

      if (Data.MATERIALS) {
        db.REMOVED_BLOAT_MATERIAL_IDS.forEach(function(k) { delete Data.MATERIALS[k]; });
        Object.keys(db.CLEAN_SRPG_MATERIALS).forEach(function(k) { Data.MATERIALS[k] = db.CLEAN_SRPG_MATERIALS[k]; });
      }
      if (Data.WEAPONS) {
        db.REMOVED_DUPLICATE_WEAPON_IDS.forEach(function(wid) { delete Data.WEAPONS[wid]; });
      }
      if (Data.ARMORS) {
        db.REMOVED_DUPLICATE_ARMOR_IDS.forEach(function(aid) { delete Data.ARMORS[aid]; });
      }

      const s = window.Aetheria.State && window.Aetheria.State.data;
      if (s) {
        if (!s.tools) s.tools = { axe: 0, pickaxe: 0, shovel: 0, rod: 0, hook: 0, pouch: 0 };
        if (s.tools.shovel === undefined) s.tools.shovel = 0;
        if (!s.dugSpots) s.dugSpots = {};
        if (!s.clearedToolGates) s.clearedToolGates = {};
        if (!s.solvedExplorePuzzles) s.solvedExplorePuzzles = {};
        if (!s.claimedExplorePuzzleChests) s.claimedExplorePuzzleChests = {};
        if (!s.projectsBuilt) s.projectsBuilt = {};

        // ★ v14.5 修正 #5：僅以「已擊敗該區首領」或「已解鎖下一章地圖」兼容舊存檔，絕不因答題升級而自動跳過修橋任務
        const uz = Array.isArray(s.unlockedZones) ? s.unlockedZones : [];
        if ((s.bossesDefeated && s.bossesDefeated.zone1_forest) || uz.indexOf("zone2_canyon") !== -1) {
          s.projectsBuilt.proj_z1_bridge = true;
        }
        if ((s.bossesDefeated && s.bossesDefeated.zone2_canyon) || uz.indexOf("zone3_coast") !== -1) {
          s.projectsBuilt.proj_z2_rope = true;
          s.projectsBuilt.proj_z2_bridge = true;
        }
        if ((s.bossesDefeated && s.bossesDefeated.zone3_coast) || uz.indexOf("zone4_snow") !== -1 || (s.boatTier && s.boatTier >= 2)) {
          s.projectsBuilt.proj_z3_raft = true;
          s.projectsBuilt.proj_z3_bridge = true;
        }

        if (Array.isArray(s.unlockedWeapons)) {
          s.unlockedWeapons = s.unlockedWeapons.filter(function(id) { return db.REMOVED_DUPLICATE_WEAPON_IDS.indexOf(id) === -1; });
        }
        if (s.equippedWeapon && db.REMOVED_DUPLICATE_WEAPON_IDS.indexOf(s.equippedWeapon) !== -1) {
          s.equippedWeapon = (s.unlockedWeapons && s.unlockedWeapons.length > 0) ? s.unlockedWeapons[s.unlockedWeapons.length - 1] : "w_wood";
        }
        if (Array.isArray(s.unlockedArmors)) {
          s.unlockedArmors = s.unlockedArmors.filter(function(id) { return db.REMOVED_DUPLICATE_ARMOR_IDS.indexOf(id) === -1; });
        }
        if (s.equippedArmor && db.REMOVED_DUPLICATE_ARMOR_IDS.indexOf(s.equippedArmor) !== -1) {
          s.equippedArmor = (s.unlockedArmors && s.unlockedArmors.length > 0) ? s.unlockedArmors[s.unlockedArmors.length - 1] : "a_cloth";
        }

        if (s.projectsBuilt && s.projectsBuilt.proj_z5_bridge && Data.MATERIALS) {
          Object.keys(Data.MATERIALS).forEach(function(mk) {
            const m = Data.MATERIALS[mk];
            if (m && m.name && m.name.indexOf("耐火磚") !== -1) {
              if ((s.inventory[mk] || 0) < 3) s.inventory[mk] = 3;
            }
          });
        }
      }

      this.buildGuaranteedQuestMaterialRecipes();

      if (Array.isArray(Data.WORKSHOP_RECIPES)) {
        Data.WORKSHOP_RECIPES = Data.WORKSHOP_RECIPES.filter(function(r) {
          return r && db.REMOVED_BLOAT_RECIPE_IDS.indexOf(r.id) === -1;
        });
        db.COMPLETE_WORKSHOP_RECIPES.concat(this.dynamicGuaranteedRecipes).forEach(function(rec) {
          const idx = Data.WORKSHOP_RECIPES.findIndex(function(r) { return r.id === rec.id; });
          if (idx !== -1) Data.WORKSHOP_RECIPES[idx] = rec;
          else Data.WORKSHOP_RECIPES.push(rec);
        });
      } else {
        Data.WORKSHOP_RECIPES = db.COMPLETE_WORKSHOP_RECIPES.concat(this.dynamicGuaranteedRecipes);
      }
    },

    getZoneStoryProgress: function(zoneId, s) {
      const chain = db.ZONE_STORY_CHAINS[zoneId];
      if (!chain || !s) return null;

      const cliffDone  = Boolean(s.riggedCliffs && s.riggedCliffs[zoneId]);
      const gate1Done  = Boolean(s.clearedToolGates && s.clearedToolGates[chain.step1GateId]);
      const puzzleDone = Boolean((s.solvedExplorePuzzles && s.solvedExplorePuzzles[zoneId]) && (s.claimedExplorePuzzleChests && s.claimedExplorePuzzleChests[zoneId]));
      const gate2Done  = Boolean(s.clearedToolGates && s.clearedToolGates[chain.step2GateId]);
      const cryptDone  = Boolean((s.unlockedCrypts && s.unlockedCrypts[zoneId]) || (zoneId === "zone5_volcano" && s.bossesDefeated && s.bossesDefeated.zone5_volcano));

      const statusMap = { cliff: cliffDone, gate1: gate1Done, puzzle: puzzleDone, gate2: gate2Done, crypt: cryptDone };
      const doneCount = (cliffDone ? 1 : 0) + (gate1Done ? 1 : 0) + (puzzleDone ? 1 : 0) + (gate2Done ? 1 : 0) + (cryptDone ? 1 : 0);
      const nextTask = chain.tasks.find(function(t) { return !statusMap[t.id]; }) || null;

      return {
        chain: chain, statusMap: statusMap, doneCount: doneCount, totalCount: 5,
        nextTask: nextTask, allDone: (doneCount >= 5), bossWeakened: (gate1Done || puzzleDone)
      };
    },

    isZoneExplorePuzzleSolved: function(mapObj, s) {
      if (!mapObj || !s) return false;
      if (s.solvedExplorePuzzles && s.solvedExplorePuzzles[mapObj.id]) return true;

      const decos = mapObj.decos || [];
      const statues = decos.filter(function(d) { return d && d.isPuzzleRotateStatue; });
      if (statues.length > 0 && statues.every(function(d) { return d.curDir === d.targetDir; })) {
        if (!s.solvedExplorePuzzles) s.solvedExplorePuzzles = {};
        s.solvedExplorePuzzles[mapObj.id] = true;
        return true;
      }

      const levers = decos.filter(function(d) { return d && d.isPuzzleToggleLever; });
      if (levers.length > 0 && levers.every(function(d) { return d.leverOn; })) {
        if (!s.solvedExplorePuzzles) s.solvedExplorePuzzles = {};
        s.solvedExplorePuzzles[mapObj.id] = true;
        return true;
      }

      const braziers = decos.filter(function(d) { return d && d.isPuzzleOrderBrazier; });
      if (braziers.length > 0 && braziers.every(function(d) { return d.lit; })) {
        if (!s.solvedExplorePuzzles) s.solvedExplorePuzzles = {};
        s.solvedExplorePuzzles[mapObj.id] = true;
        return true;
      }

      return false;
    },

    // ★ v14.5 修正 #5：移除等級自動通橋條件，確保新玩家完整體驗修橋任務
    isMapBridgeBuilt: function(mapObj, s) {
      if (!mapObj || !s) return false;
      const pb = s.projectsBuilt || {};
      const bd = s.bossesDefeated || {};
      const uz = Array.isArray(s.unlockedZones) ? s.unlockedZones : [];
      const zId = mapObj.id;

      if (zId === "zone1_forest")  return Boolean(pb.proj_z1_bridge || bd.zone1_forest || uz.indexOf("zone2_canyon") !== -1);
      if (zId === "zone2_canyon")  return Boolean(pb.proj_z2_rope || pb.proj_z2_bridge || bd.zone2_canyon || uz.indexOf("zone3_coast") !== -1);
      if (zId === "zone3_coast")   return Boolean(pb.proj_z3_raft || pb.proj_z3_bridge || bd.zone3_coast || uz.indexOf("zone4_snow") !== -1 || (s.boatTier && s.boatTier >= 2));
      if (zId === "zone4_snow")    return Boolean(pb.proj_z4_bridge || pb.proj_z4_shelter || bd.zone4_snow || uz.indexOf("zone5_volcano") !== -1);
      if (zId === "zone5_volcano") return Boolean(pb.proj_z5_bridge || bd.zone5_volcano || uz.indexOf("zone6_sky") !== -1);
      if (zId === "zone6_sky")     return Boolean(pb.proj_z6_bridge || bd.zone6_sky);

      const projDeco = (mapObj.decos || []).find(function(d) { return d && d.isProjectSite && d.projectId; });
      if (projDeco) return Boolean(pb[projDeco.projectId]);
      return true;
    },

    getMapBridgeY: function(mapObj) {
      if (!mapObj) return 275;
      const rx = mapObj.riverX || 1030;
      const projDeco = (mapObj.decos || []).find(function(d) {
        return d && (d.isProjectSite || d.projectId) && Math.abs(d.x - rx) < 110;
      });
      if (projDeco && projDeco.y) return projDeco.y + 20;
      return mapObj.bridgeY || 275;
    }
  };
  SRPG.data = dataMgr;
})();
