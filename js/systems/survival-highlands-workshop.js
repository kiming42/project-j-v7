/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 全地圖橋樑修復、羅盤全貌大圖與機關解謎模組 (survival-highlands-workshop.js - v11.4 單一完整版)
 * 全地圖檢視修正重點：
 *   1. 【修復 1~6 區所有橋樑移位消失】：修正因地圖高度擴大 (640➔1180) 導致原版 .dom-bridge (top:50%) 下移至 y=590 的問題，強制鎖回 y=320 道路中央！
 *   2. 【左下角 N/E/S/W 圓形羅盤 + 點擊放大全區大圖】：自動替換左下角舊方框小地圖，點擊羅盤即彈出包含地形、橋樑、懸崖與紅叉(✖)的全區鳥瞰大圖！
 *   3. 【修正全地圖機關陣座標衝突】：將火盆順序陣、石像轉向陣與三連拉桿陣移至西南開闊谷地 (x:230, y:880)，徹底避開 x=1030 河道！
 *   4. 【各區河道主題色對齊】：火山繪製赤紅熔岩河、峽谷繪製深淵斷崖、雪原繪製冰封河道、森林/海岸繪製碧藍河水。
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  // ================= 1. 注入全地圖橋樑定位修復、圓形羅盤、全區大圖與格仔工坊 CSS =================
  function injectSurvivalRpgStyles() {
    if (document.getElementById("srpg-kenney-v114-styles")) return;
    const style = document.createElement("style");
    style.id = "srpg-kenney-v114-styles";
    style.textContent = `
      /* Kenney 16x16 像素地貌底圖 Canvas */
      .kenney-terrain-canvas {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        pointer-events: none !important;
        z-index: 0 !important;
        image-rendering: pixelated !important;
      }
      #world-terrain-layer .dom-dirt-blob {
        opacity: 0 !important;
      }
      #world-terrain-layer .dom-dirt-blob.ocean-atoll {
        opacity: 1 !important;
      }

      /* ★ 關鍵修復：強制所有地圖的河流與過河橋樑 (.dom-bridge) 鎖定在原本 y=320 道路中央，絕不因地圖拉高而移位消失！ */
      #world-terrain-layer .dom-river {
        z-index: 2 !important;
      }
      #world-terrain-layer .dom-bridge,
      #world-terrain-layer [class*="bridge"] {
        top: 320px !important;
        transform: translateY(-50%) !important;
        z-index: 6 !important;
      }
      #world-terrain-layer .dom-coast-beach { z-index: 2 !important; }
      #world-terrain-layer .dom-coast-sea   { z-index: 3 !important; }
      #world-terrain-layer .dom-wooden-pier { z-index: 4 !important; }

      /* 左下角 N/E/S/W 圓形羅盤小地圖 */
      #minimap-box, .srpg-compass-box {
        position: absolute !important;
        width: 80px !important;
        height: 80px !important;
        bottom: 8px !important;
        left: 8px !important;
        border-radius: 50% !important;
        border: 5px solid #4a2511 !important;
        background: #102542 !important;
        box-shadow: 0 3px 10px rgba(0,0,0,0.9), inset 0 0 6px rgba(0,0,0,0.85) !important;
        overflow: visible !important;
        cursor: pointer !important;
        pointer-events: auto !important;
        z-index: 75 !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      #minimap-box:active, .srpg-compass-box:active {
        transform: scale(0.94) !important;
      }
      #minimap-canvas, .srpg-compass-canvas {
        width: 100% !important;
        height: 100% !important;
        border-radius: 50% !important;
        display: block !important;
        image-rendering: pixelated !important;
        pointer-events: auto !important;
        cursor: pointer !important;
        border: none !important;
      }
      .compass-dir-tag {
        position: absolute;
        font-size: 9px;
        font-weight: 900;
        color: #f5e6c4;
        background: #4a2511;
        padding: 0px 3px;
        border-radius: 3px;
        line-height: 1.1;
        text-shadow: 1px 1px 0 #000;
        pointer-events: none;
        z-index: 78;
      }
      .compass-dir-n { top: -8px; left: 50%; transform: translateX(-50%); color: #ffd166; }
      .compass-dir-s { bottom: -8px; left: 50%; transform: translateX(-50%); }
      .compass-dir-w { left: -8px; top: 50%; transform: translateY(-50%); }
      .compass-dir-e { right: -8px; top: 50%; transform: translateY(-50%); }
      .compass-zoom-hint {
        position: absolute;
        bottom: -9px;
        right: -12px;
        background: #1d3557;
        color: #ffd166;
        border: 1px solid #f5b700;
        border-radius: 4px;
        font-size: 8.5px;
        font-weight: 900;
        padding: 0 3px;
        pointer-events: none;
        z-index: 79;
        box-shadow: 0 1px 3px #000;
      }

      /* 點擊放大「全區全貌大圖」檢視器 */
      .fullmap-stage-wrap {
        position: relative;
        width: 100%;
        background: #0f2942;
        border: 3px solid #d9a066;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 14px rgba(0,0,0,0.85);
      }
      #srpg-fullmap-canvas {
        width: 100%;
        height: auto;
        display: block;
        image-rendering: pixelated;
        cursor: crosshair;
      }
      .fullmap-legend-bar {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 4px;
        background: #181316;
        border: 1.5px solid #594950;
        border-radius: 6px;
        padding: 6px 8px;
        margin-top: 6px;
        font-size: 11px;
        color: #cbd5e1;
      }

      @keyframes srpgHitShake {
        0%, 100% { transform: translate(0, 0) scale(1); }
        25% { transform: translate(-3px, 1px) scale(0.92); }
        50% { transform: translate(3px, -2px) scale(1.06); }
        75% { transform: translate(-2px, 0px) scale(0.96); }
      }
      .srpg-node-hit {
        animation: srpgHitShake 0.22s ease-in-out !important;
      }
      .srpg-particle {
        position: absolute;
        width: 5px;
        height: 5px;
        border: 1px solid #141013;
        pointer-events: none;
        z-index: 45;
        transition: transform 0.42s ease-out, opacity 0.42s ease-out;
      }

      .dom-label.ladder-spot-lbl { background: #4a2c11; color: #ffd166; border: 1.5px solid #f5b700; font-weight: 900; }
      .dom-label.crypt-door-lbl  { background: #2d1442; color: #ffd166; border: 1.5px solid #e0aaff; font-weight: 900; }
      .dom-label.dig-spot-lbl    { background: #3d2314; color: #ffd166; border: 1.5px solid #f5b700; font-weight: 900; }
      .dom-label.puzzle-mech-lbl { background: #102542; color: #fff3b0; border: 1.5px solid #38b6ff; font-weight: 900; }
      .dom-label.puzzle-mech-on  { background: #1e3a2f; color: #5ac54f; border: 1.5px solid #5ac54f; font-weight: 900; }

      /* 格仔分類工坊 UI */
      #panel-modal #modal-body { overflow-y: auto !important; padding-bottom: 42px !important; }
      .wk-top-control-panel { background: #141013; padding-bottom: 4px; }
      .wk-inspector-box {
        background: linear-gradient(180deg, #261c14 0%, #18120e 100%);
        border: 2px solid #f5b700;
        border-radius: 8px;
        padding: 7px 9px;
        margin-bottom: 6px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.8);
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
    `;
    document.head.appendChild(style);
  }

  // ================= 2. 強制掛載左下角「N/E/S/W 圓形羅盤小地圖」並綁定點擊放大全圖 =================
  function mountGuaranteedCompassWidget() {
    const upper = document.getElementById("upper-screen");
    if (!upper) return null;

    // 隱藏舊版黑底方框小地圖
    const upperRect = upper.getBoundingClientRect();
    Array.from(upper.children).forEach(function(ch) {
      if (ch.id === "srpg-compass-widget" || ch.id === "world-viewport" ||
          ch.id === "hud-overlay" || ch.id === "hud-hearts-box" ||
          ch.id === "weather-fx-layer" || ch.id === "sleep-transition-overlay") {
        return;
      }
      const r = ch.getBoundingClientRect();
      if (ch.id === "minimap-box" || ch.id === "minimap" ||
          (r.width > 25 && r.width < 135 && r.height > 20 && r.height < 115 && (r.left - upperRect.left) < 40 && (upperRect.bottom - r.bottom) < 40)) {
        ch.style.display = "none";
      }
    });

    let widget = document.getElementById("srpg-compass-widget");
    let canvas = document.getElementById("srpg-compass-canvas");

    if (!widget) {
      widget = document.createElement("div");
      widget.id = "srpg-compass-widget";
      widget.className = "srpg-compass-box";
      widget.title = "點擊放大檢視【全區全貌探索地圖】";

      canvas = document.createElement("canvas");
      canvas.id = "srpg-compass-canvas";
      canvas.className = "srpg-compass-canvas";
      canvas.width = 96;
      canvas.height = 96;
      widget.appendChild(canvas);

      ["N", "S", "W", "E"].forEach(function(dir) {
        const span = document.createElement("span");
        span.className = "compass-dir-tag compass-dir-" + dir.toLowerCase();
        span.innerText = dir;
        widget.appendChild(span);
      });

      const hint = document.createElement("span");
      hint.className = "compass-zoom-hint";
      hint.innerText = "🔍全圖";
      widget.appendChild(hint);

      const openMapFn = function(ev) {
        if (ev) { ev.stopPropagation(); ev.preventDefault(); }
        if (window.Aetheria.Audio && window.Aetheria.Audio.sfxTalkBlip) window.Aetheria.Audio.sfxTalkBlip();
        if (window.Aetheria.HighlandsWorkshop) window.Aetheria.HighlandsWorkshop.openFullZoneMapModal();
      };
      widget.onclick = openMapFn;
      canvas.onclick = openMapFn;

      upper.appendChild(widget);
    }
    return canvas;
  }

  // ================= 3. Kenney 16x16 自然地貌與全地圖主題河道/橋樑渲染器 =================
  const KENNEY_PALETTES = {
    forest:  { bg1: "#4d8036", bg2: "#43732e", bg3: "#599140", path: "#c29b61", pathEdge: "#9c7844", cliffTop: "#bfa065", rock1: "#7a4928", rock2: "#5e361c", rockHi: "#965d36", rockDark: "#381e0e", river: "#2978d4", riverHi: "#8ce0ff", bank: "#d4b06a", bridge: "#9c6347", bridgeRail: "#d9a066" },
    cave:    { bg1: "#282332", bg2: "#211d2a", bg3: "#322c3e", path: "#4a4258", pathEdge: "#393246", cliffTop: "#5c526e", rock1: "#3d354b", rock2: "#2b2536", rockHi: "#685d7c", rockDark: "#17131d", river: "#1d3557", riverHi: "#38b6ff", bank: "#393246", bridge: "#64748b", bridgeRail: "#94a3b8" },
    canyon:  { bg1: "#c79452", bg2: "#ba8745", bg3: "#d4a260", path: "#e0b97d", pathEdge: "#ad7b3b", cliffTop: "#deb878", rock1: "#8f4b26", rock2: "#703819", rockHi: "#ab5e34", rockDark: "#45200b", river: "#2b1508", riverHi: "#472411", bank: "#703819", bridge: "#9c6347", bridgeRail: "#f5b700" },
    coast:   { bg1: "#599140", bg2: "#4d8036", bg3: "#68a34d", path: "#e6c88c", pathEdge: "#c4a366", cliffTop: "#d9bc82", rock1: "#755233", rock2: "#593d24", rockHi: "#8f6743", rockDark: "#362312", river: "#1d5eb8", riverHi: "#8ce0ff", bank: "#e6c88c", bridge: "#9c6347", bridgeRail: "#ffffff" },
    snow:    { bg1: "#dce8f2", bg2: "#c9d9e8", bg3: "#edf4fa", path: "#9eb3c7", pathEdge: "#7e96ad", cliffTop: "#ffffff", rock1: "#5a718a", rock2: "#43566b", rockHi: "#7b93ad", rockDark: "#293645", river: "#3898ff", riverHi: "#ffffff", bank: "#9eb3c7", bridge: "#64748b", bridgeRail: "#e2e8f0" },
    volcano: { bg1: "#3b2321", bg2: "#301b19", bg3: "#4a2c29", path: "#633933", pathEdge: "#472723", cliffTop: "#73423b", rock1: "#52241d", rock2: "#381712", rockHi: "#8c382b", rockDark: "#1f0b08", river: "#e03c4b", riverHi: "#ffd166", bank: "#1f0b08", bridge: "#475569", bridgeRail: "#94a3b8" },
    sky:     { bg1: "#487a6b", bg2: "#3d6b5d", bg3: "#568f7e", path: "#e8dfc5", pathEdge: "#c4b89b", cliffTop: "#f5eedc", rock1: "#6e7885", rock2: "#525b66", rockHi: "#8e99a8", rockDark: "#333940", river: "#191233", riverHi: "#e0aaff", bank: "#c4b89b", bridge: "#f5b700", bridgeRail: "#ffffff" }
  };

  let cachedTerrainCanvas = null;
  let cachedTerrainZoneId = "";

  function seededHash(x, y, seed) {
    let h = (x * 374761393 + y * 668265263 + (seed || 0) * 1442695041) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  function isNaturalPathTile(px, py, mapObj) {
    const blobs = mapObj.dirtBlobs || [];
    const wave = Math.sin(px * 0.025) * 14 + Math.cos(py * 0.025) * 14;
    for (let i = 0; i < blobs.length; i++) {
      const b = blobs[i];
      if (b.cx !== undefined && b.cy !== undefined) {
        const rx = (b.rx || 80) + wave;
        const ry = (b.ry || 60) + wave * 0.7;
        const dx = (px - b.cx) / Math.max(20, rx);
        const dy = (py - b.cy) / Math.max(20, ry);
        if (dx * dx + dy * dy <= 1.0) return true;
      } else if (b.x !== undefined && b.y !== undefined) {
        if (px >= b.x && px <= b.x + (b.w || 100) && py >= b.y && py <= b.y + (b.h || 80)) return true;
      }
    }
    return false;
  }

  function isNaturalPlateauTile(px, py, hasHighland) {
    if (!hasHighland) return false;
    const curveTop = Math.sin(px * 0.03) * 8;
    const curveBottom = Math.sin(px * 0.04) * 6;
    const inTopWing = (px >= 388 && px <= 902 && py >= 798 + curveTop && py <= 918 + curveBottom);
    const inRightWing = (px >= 708 && px <= 902 && py >= 912 && py <= 1058 + curveBottom);
    return inTopWing || inRightWing;
  }

  // 檢查某地圖的過河橋樑工程是否已修復完成
  function isMapBridgeBuilt(mapObj, s) {
    if (!mapObj || !s || !s.projectsBuilt) return false;
    const zId = mapObj.id;
    if (zId === "zone1_forest")  return Boolean(s.projectsBuilt.proj_z1_bridge);
    if (zId === "zone2_canyon")  return Boolean(s.projectsBuilt.proj_z2_rope || s.projectsBuilt.proj_z2_bridge);
    if (zId === "zone3_coast")   return Boolean(s.projectsBuilt.proj_z3_raft || (s.boatTier && s.boatTier >= 2));
    if (zId === "zone5_volcano") return Boolean(s.projectsBuilt.proj_z5_bridge);
    if (zId === "zone6_sky")     return Boolean(s.projectsBuilt.proj_z6_bridge);
    const projDeco = (mapObj.decos || []).find(function(d) { return d && d.isProjectSite && d.projectId; });
    if (projDeco) return Boolean(s.projectsBuilt[projDeco.projectId]);
    return true;
  }

  // 取得該地圖過河道路與橋樑的精準 Y 座標（預設 y=320）
  function getMapBridgeY(mapObj) {
    if (!mapObj) return 320;
    const rx = mapObj.riverX || 1030;
    const projDeco = (mapObj.decos || []).find(function(d) {
      return d && d.isProjectSite && Math.abs(d.x - rx) < 85;
    });
    if (projDeco && projDeco.y) return projDeco.y;
    return mapObj.bridgeY || 320;
  }

  function renderKenneyNaturalTerrainCanvas(mapObj, terrainLayer) {
    if (!mapObj || !terrainLayer) return;
    if (mapObj.id === "ocean_sea") {
      cachedTerrainCanvas = null;
      cachedTerrainZoneId = "ocean_sea";
      return;
    }
    const oldCanvas = terrainLayer.querySelector(".kenney-terrain-canvas");
    if (oldCanvas) oldCanvas.remove();

    const W = mapObj.width || 1200;
    const H = mapObj.height || 680;
    const canvas = document.createElement("canvas");
    canvas.className = "kenney-terrain-canvas";
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    const ctx = canvas.getContext("2d");
    const pal = KENNEY_PALETTES[mapObj.theme] || KENNEY_PALETTES.forest;
    const hasHighland = Boolean(HIGHLAND_ZONES[mapObj.id]);
    const cols = Math.ceil(W / 16);
    const rows = Math.ceil(H / 16);

    for (let ty = 0; ty < rows; ty++) {
      for (let tx = 0; tx < cols; tx++) {
        const px = tx * 16;
        const py = ty * 16;
        const r = seededHash(tx, ty, 11);
        ctx.fillStyle = (r < 0.45) ? pal.bg1 : (r < 0.80) ? pal.bg2 : pal.bg3;
        ctx.fillRect(px, py, 16, 16);

        if (r > 0.72) {
          ctx.fillStyle = pal.bg3;
          ctx.fillRect(px + 4, py + 6, 2, 4);
          ctx.fillRect(px + 7, py + 5, 2, 5);
          ctx.fillRect(px + 10, py + 7, 2, 3);
        } else if (r < 0.08) {
          ctx.fillStyle = pal.pathEdge;
          ctx.fillRect(px + 6, py + 9, 4, 3);
          ctx.fillStyle = pal.path;
          ctx.fillRect(px + 7, py + 9, 2, 2);
        }
      }
    }

    for (let ty = 0; ty < rows; ty++) {
      for (let tx = 0; tx < cols; tx++) {
        const px = tx * 16 + 8;
        const py = ty * 16 + 8;
        if (!isNaturalPathTile(px, py, mapObj)) continue;

        const x0 = tx * 16;
        const y0 = ty * 16;
        ctx.fillStyle = pal.path;
        ctx.fillRect(x0, y0, 16, 16);

        const nUp    = !isNaturalPathTile(px, py - 16, mapObj);
        const nDown  = !isNaturalPathTile(px, py + 16, mapObj);
        const nLeft  = !isNaturalPathTile(px - 16, py, mapObj);
        const nRight = !isNaturalPathTile(px + 16, py, mapObj);

        ctx.fillStyle = pal.pathEdge;
        if (nUp)    ctx.fillRect(x0, y0, 16, 3);
        if (nDown)  ctx.fillRect(x0, y0 + 13, 16, 3);
        if (nLeft)  ctx.fillRect(x0, y0, 3, 16);
        if (nRight) ctx.fillRect(x0 + 13, y0, 3, 16);
      }
    }

    // ★ 按各區主題色繪製河道（森林藍水、峽谷深淵、火山赤紅熔岩河）與過河橋樑
    if (mapObj.hasRiver) {
      const rx = mapObj.riverX || 1030;
      ctx.fillStyle = pal.bank;
      ctx.fillRect(rx - 6, 0, 52, H);
      ctx.fillStyle = pal.river;
      ctx.fillRect(rx, 0, 40, H);
      ctx.fillStyle = pal.riverHi;
      ctx.fillRect(rx + 6, 0, 4, H);

      const bridgeY = getMapBridgeY(mapObj);
      const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
      const built = isMapBridgeBuilt(mapObj, s);
      const bx = rx - 10;
      const bw = 60;
      const by = bridgeY - 22;
      const bh = 44;

      if (built) {
        ctx.fillStyle = "#141013";
        ctx.fillRect(bx, by - 3, bw, bh + 6);
        ctx.fillStyle = pal.bridge;
        ctx.fillRect(bx + 2, by, bw - 4, bh);
        ctx.fillStyle = pal.bridgeRail;
        ctx.fillRect(bx, by - 2, bw, 5);
        ctx.fillRect(bx, by + bh - 3, bw, 5);
      } else {
        ctx.fillStyle = pal.bridge;
        ctx.fillRect(bx, by, 14, bh);
        ctx.fillRect(bx + bw - 14, by, 14, bh);
      }
    }

    if (mapObj.id === "camp_hub") {
      ctx.fillStyle = "#e6c88c";
      ctx.fillRect(0, 356, W, 124);
      ctx.fillStyle = "#1d5eb8";
      ctx.fillRect(0, 392, W, 88);
      ctx.fillStyle = "#8ce0ff";
      ctx.fillRect(0, 392, W, 5);
      ctx.fillStyle = "#8f563b";
      ctx.fillRect(421, 358, 48, 76);
    }

    if (hasHighland) {
      for (let ty = 48; ty < rows; ty++) {
        for (let tx = 22; tx < cols; tx++) {
          const px = tx * 16 + 8;
          const py = ty * 16 + 8;
          if (!isNaturalPlateauTile(px, py, true)) continue;

          const x0 = tx * 16;
          const y0 = ty * 16;
          ctx.fillStyle = pal.cliffTop;
          ctx.fillRect(x0, y0, 16, 16);

          const pUp    = isNaturalPlateauTile(px, py - 16, true);
          const pDown  = isNaturalPlateauTile(px, py + 16, true);
          const pLeft  = isNaturalPlateauTile(px - 16, py, true);
          const pRight = isNaturalPlateauTile(px + 16, py, true);

          ctx.fillStyle = pal.rockDark;
          if (!pUp)    ctx.fillRect(x0, y0, 16, 3);
          if (!pLeft)  ctx.fillRect(x0, y0, 3, 16);
          if (!pRight) ctx.fillRect(x0 + 13, y0, 3, 16);

          if (!pDown) {
            ctx.fillStyle = pal.rockDark;
            ctx.fillRect(x0, y0 + 13, 16, 3);
            for (let wy = 1; wy <= 3; wy++) {
              const wy0 = y0 + wy * 16;
              ctx.fillStyle = (wy % 2 === 1) ? pal.rock1 : pal.rock2;
              ctx.fillRect(x0, wy0, 16, 16);
              ctx.fillStyle = pal.rockHi;
              ctx.fillRect(x0 + 2, wy0 + 2, 5, 6);
              ctx.fillRect(x0 + 9, wy0 + 6, 5, 6);
              ctx.fillStyle = pal.rockDark;
              ctx.fillRect(x0, wy0, 2, 16);
              if (wy === 3) {
                ctx.fillRect(x0, wy0 + 13, 16, 3);
                ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
                ctx.fillRect(x0, wy0 + 16, 16, 8);
              }
            }
          }
        }
      }

      const cx = 472, cy = 920;
      ctx.fillStyle = pal.rockDark;
      ctx.fillRect(cx - 4, cy - 4, 56, 48);
      ctx.fillStyle = pal.rock2;
      ctx.fillRect(cx, cy, 48, 44);
      ctx.fillStyle = "#09060a";
      ctx.fillRect(cx + 6, cy + 8, 36, 36);
    }

    cachedTerrainCanvas = canvas;
    cachedTerrainZoneId = mapObj.id;
    terrainLayer.insertBefore(canvas, terrainLayer.firstChild);
  }

  // ★ 在 #world-terrain-layer 同步確保原版 .dom-bridge 固定於 y=320，並補上高圖層實體橋面
  function syncDomRiverBridge(mapObj, terrainLayer) {
    if (!mapObj || !terrainLayer || !mapObj.hasRiver) return;
    const bridgeY = getMapBridgeY(mapObj);
    const rx = mapObj.riverX || 1030;
    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
    const built = isMapBridgeBuilt(mapObj, s);
    const pal = KENNEY_PALETTES[mapObj.theme] || KENNEY_PALETTES.forest;

    // 1. 修正原版 .dom-bridge 的 Y 座標至道路中央 (y=320)
    const nativeBridges = terrainLayer.querySelectorAll(".dom-bridge, [class*='bridge']");
    nativeBridges.forEach(function(nb) {
      if (!nb.classList.contains("srpg-dom-river-bridge")) {
        nb.style.top = bridgeY + "px";
        nb.style.zIndex = "6";
      }
    });

    // 2. 掛載保證可見的實體像素過河橋面 (z-index: 6)
    let bridgeEl = terrainLayer.querySelector(".srpg-dom-river-bridge");
    if (!bridgeEl) {
      bridgeEl = document.createElement("div");
      bridgeEl.className = "srpg-dom-river-bridge";
      terrainLayer.appendChild(bridgeEl);
    }

    const bw = 56, bh = 42;
    bridgeEl.style.cssText =
      "position:absolute; left:" + (rx - 8) + "px; top:" + (bridgeY - 21) + "px; " +
      "width:" + bw + "px; height:" + bh + "px; z-index:6; pointer-events:none; box-sizing:border-box;";

    if (built) {
      bridgeEl.style.background =
        "repeating-linear-gradient(90deg, " + pal.bridge + " 0px, " + pal.bridge + " 6px, #2b1508 6px, #2b1508 9px)";
      bridgeEl.style.borderTop = "4px solid " + pal.bridgeRail;
      bridgeEl.style.borderBottom = "4px solid " + pal.bridgeRail;
      bridgeEl.style.outline = "2px solid #141013";
      bridgeEl.style.boxShadow = "0 4px 8px rgba(0,0,0,0.6)";
    } else {
      bridgeEl.style.background =
        "linear-gradient(90deg, " + pal.bridge + " 0%, " + pal.bridge + " 22%, transparent 22%, transparent 78%, " + pal.bridge + " 78%, " + pal.bridge + " 100%)";
      bridgeEl.style.borderTop = "3px dashed " + pal.bridgeRail;
      bridgeEl.style.borderBottom = "3px dashed " + pal.bridgeRail;
      bridgeEl.style.outline = "none";
      bridgeEl.style.boxShadow = "none";
    }
  }

  function drawTreasureXMarkerOnCanvas(ctx, x, y, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffd166";
    ctx.fill();
    ctx.lineWidth = Math.max(1.5, radius * 0.25);
    ctx.strokeStyle = "#141013";
    ctx.stroke();

    const r = radius * 0.52;
    ctx.beginPath();
    ctx.moveTo(x - r, y - r);
    ctx.lineTo(x + r, y + r);
    ctx.moveTo(x + r, y - r);
    ctx.lineTo(x - r, y + r);
    ctx.strokeStyle = "#e03c4b";
    ctx.lineWidth = Math.max(2, radius * 0.36);
    ctx.stroke();
    ctx.restore();
  }

  // 即時繪製左下角圓形羅盤小地圖
  function renderCompassMinimap(mapObj, s) {
    const mmCanvas = mountGuaranteedCompassWidget();
    if (!mmCanvas || !mapObj || !s) return;

    const ctx = mmCanvas.getContext("2d");
    ctx.clearRect(0, 0, 96, 96);
    ctx.fillStyle = "#1d5eb8";
    ctx.fillRect(0, 0, 96, 96);

    const viewSpan = 680;
    const sx = (s.heroX || 300) - viewSpan / 2;
    const sy = (s.heroY || 240) - viewSpan / 2;
    const scale = 96 / viewSpan;

    if (cachedTerrainCanvas && cachedTerrainZoneId === mapObj.id) {
      ctx.drawImage(cachedTerrainCanvas, sx, sy, viewSpan, viewSpan, 0, 0, 96, 96);
    } else if (mapObj.id === "ocean_sea") {
      (mapObj.dirtBlobs || []).forEach(function(b) {
        const bx = ((b.cx || 0) - sx) * scale;
        const by = ((b.cy || 0) - sy) * scale;
        ctx.fillStyle = "#e6c88c";
        ctx.beginPath(); ctx.arc(bx, by, (b.rx || 80) * scale, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#599140";
        ctx.beginPath(); ctx.arc(bx, by, (b.rx || 80) * scale * 0.65, 0, Math.PI * 2); ctx.fill();
      });
    }

    ctx.fillStyle = "#2d5a27";
    (mapObj.trees || []).forEach(function(t) {
      const tx = (t.x - sx) * scale;
      const ty = (t.y - sy) * scale;
      if (tx >= -4 && tx <= 100 && ty >= -4 && ty <= 100) {
        ctx.fillRect(tx - 1.5, ty - 1.5, 3, 3);
      }
    });

    (mapObj.nodes || []).forEach(function(n) {
      if (n.opened) return;
      const nx = (n.x - sx) * scale;
      const ny = (n.y - sy) * scale;
      if (nx < -6 || nx > 102 || ny < -6 || ny > 102) return;
      if (n.isBuriedSpot && !(s.dugSpots && s.dugSpots[n.id])) {
        drawTreasureXMarkerOnCanvas(ctx, nx, ny, 4.5);
      } else if (n.type === "chest") {
        ctx.fillStyle = "#f5b700";
        ctx.fillRect(nx - 2.5, ny - 2.5, 5, 5);
      }
    });

    (mapObj.portals || []).forEach(function(p) {
      const px = (p.x - sx) * scale;
      const py = (p.y - sy) * scale;
      if (px >= -4 && px <= 100 && ty >= -4 && py <= 100) {
        ctx.fillStyle = "#38b6ff";
        ctx.fillRect(px - 2.5, py - 2.5, 5, 5);
      }
    });

    ctx.beginPath();
    ctx.arc(48, 48, 4.2, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#141013";
    ctx.stroke();
  }

  function spawnHarvestParticles(nodeX, nodeY, colorHex) {
    const entityLayer = document.getElementById("world-entity-layer");
    if (!entityLayer) return;
    for (let i = 0; i < 6; i++) {
      const p = document.createElement("div");
      p.className = "srpg-particle";
      p.style.left = nodeX + "px";
      p.style.top = (nodeY - 8) + "px";
      p.style.background = colorHex || "#ffd166";
      entityLayer.appendChild(p);
      const angle = (Math.PI * 2 * i) / 6 + (Math.random() * 0.5 - 0.25);
      const dist = 14 + Math.random() * 16;
      requestAnimationFrame(function() {
        p.style.transform = "translate(" + (Math.cos(angle) * dist).toFixed(1) + "px, " + (Math.sin(angle) * dist - 6).toFixed(1) + "px)";
        p.style.opacity = "0";
      });
      setTimeout(function() { if (p.parentNode) p.parentNode.removeChild(p); }, 430);
    }
  }

  // ================= 4. 註冊像素圖示 =================
  function registerSurvivalRpgSprites() {
    const S = window.Aetheria.Data && window.Aetheria.Data.Sprites;
    if (!S || !S.getDataURL) return;

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

    const origGetDataURL = S.getDataURL.bind(S);
    S.getDataURL = function(key) {
      if (customUrls[key]) return customUrls[key];
      if (key === "mat_potionHeal" || key === "mat_potionHint") return origGetDataURL("icon_potion");
      return origGetDataURL(key);
    };
  }

  // ================= 5. 素材、6大工具與工坊配方定義 =================
  const CLEAN_SRPG_MATERIALS = {
    cryptKey:    { id: "cryptKey",    name: "遠古遺跡鑰匙", tier: 2, desc: "【尋寶挖掘】用探險鐵鏟挖掘地面唯一「✖」藏寶記號獲得，可解鎖各區的【🔒遠古地底遺跡】！" },
    coal:        { id: "coal",        name: "黑曜木炭",     tier: 1, desc: "【高台/山洞礦產】採集自懸崖高台與岩壁山洞，可用於配製高效炸彈。" },
    quartz:      { id: "quartz",      name: "透明石英砂",   tier: 2, desc: "【高台晶礦】採集自懸崖高台與山洞，可用於燒製藥水瓶與探礦照明。" },
    rockSalt:    { id: "rockSalt",    name: "結晶岩鹽",     tier: 1, desc: "【高台礦產】採集自懸崖高台，可醃製長效保存的岩鹽風乾肉脯。" },
    ropeLadder:  { id: "ropeLadder",  name: "攀岩繩梯",     tier: 1, desc: "【高低差開路工具】由麻繩與原木編織而成，可架設在各區南側懸崖壁上攀爬至高台礦區！" },
    rationJerky: { id: "rationJerky", name: "風乾肉脯",     tier: 2, desc: "【頂級求生口糧】以岩鹽醃製鮮魚，食用立即恢復 +80% 飽食度與 +90 HP！" }
  };

  const REMOVED_BLOAT_MATERIAL_IDS = [
    "ancientGem", "elixirAtk", "elixirHp", "elixirDef",
    "venomSac", "treeBark", "cactusFruit", "chitin", "rawHide", "thickPelt", "sulfur",
    "curedLeather", "steelIngot",
    "gear_gasMask", "gear_lantern", "gear_goggles", "gear_diving", "gear_furCoat", "gear_heatShield", "gear_skyAegis"
  ];

  const REMOVED_BLOAT_RECIPE_IDS = [
    "wk_crypt_key", "wk_gear_gasmask", "wk_gear_lantern", "wk_gear_goggles",
    "wk_gear_diving", "wk_gear_furcoat", "wk_gear_heatshield", "wk_gear_skyaegis",
    "wk_charcoal", "wk_steel_ingot", "wk_cured_leather", "wk_bark_rope",
    "wk_elixir_atk", "wk_elixir_hp", "wk_elixir_def", "wk_cactus_ration"
  ];

  const BUILTIN_TOOLS_DB = {
    axe: {
      id: "axe", name: "伐木手斧", iconKey: "icon_axe",
      tiers: {
        0: { name: "徒手拾荒", desc: "尚未裝備手斧，僅能拾取散落枯枝。" },
        1: { name: "Lv.1 燧石手斧", cost: { branch: 2, flint: 2 }, gold: 0, desc: "可砍伐 1 階翠風原木、堅韌藤蔓、微光菇與琥珀松脂。" },
        2: { name: "Lv.2 精鐵伐木斧", cost: { iron: 2, wood: 2 }, gold: 80, desc: "可砍伐 2 階荒野亞麻、向陽太陽花與極地冰蓮。" },
        3: { name: "Lv.3 流沙秘銀斧", cost: { mithril: 2, plank: 2 }, gold: 220, desc: "可砍伐 3 階黃金世界樹葉與全大陸高階神木！" }
      }
    },
    pickaxe: {
      id: "pickaxe", name: "採礦十字鎬", iconKey: "icon_pickaxe",
      tiers: {
        0: { name: "徒手拾荒", desc: "尚未裝備十字鎬，僅能拾取燧石、黏土與高台裸露礦脈。" },
        1: { name: "Lv.1 燧石十字鎬", cost: { branch: 2, flint: 2 }, gold: 0, desc: "可開採 1 階藍晶鐵礦脈。" },
        2: { name: "Lv.2 精鐵十字鎬", cost: { iron: 3, wood: 2 }, gold: 80, desc: "可開採 2 階玄武岩塊、流沙秘銀與深海珊瑚。" },
        3: { name: "Lv.3 秘銀破岩鎬", cost: { mithril: 2, basalt: 2 }, gold: 220, desc: "可開採 3 階熔岩黑曜石與深淵星隕鐵！" }
      }
    },
    shovel: {
      id: "shovel", name: "探險鐵鏟", iconKey: "icon_shovel",
      tiers: {
        0: { name: "尚未持有鐵鏟", desc: "製作鐵鏟後，可對照【全區放大地圖】挖掘地面唯一「✖ 藏寶記號」獲取遺跡鑰匙！" },
        1: { name: "Lv.1 精鐵探險鏟", cost: { wood: 2, iron: 1 }, gold: 0, desc: "【★尋寶必備】可挖掘全大陸地面唯一「✖」藏寶點，挖出【遠古遺跡鑰匙】與稀有礦石！" },
        2: { name: "Lv.2 秘銀尋寶鏟", cost: { plank: 2, mithril: 1 }, gold: 120, desc: "挖掘「✖」藏寶點時金幣收穫加倍，且額外挖出流沙秘銀！" },
        3: { name: "Lv.3 星隕考古神鏟", cost: { obsidian: 1, starIron: 1, quartz: 2 }, gold: 260, desc: "傳奇考古神鏟！挖掘「✖」藏寶點必定獲得高階星隕鐵與大量金幣！" }
      }
    },
    rod: {
      id: "rod", name: "垂釣魚竿", iconKey: "fishing_spot",
      tiers: {
        0: { name: "尚未持有魚竿", desc: "製作魚竿後可於各區水波釣魚點進行看準時機垂釣。" },
        1: { name: "Lv.1 翠竹釣魚竿", cost: { wood: 2, vine: 2 }, gold: 0, desc: "解鎖水波釣魚點垂釣功能，可釣起銀鱗鮮魚與河畔黏土。" },
        2: { name: "Lv.2 韌麻海釣竿", cost: { rope: 2, iron: 1 }, gold: 100, desc: "垂釣綠色完美命中區加寬 25%，更容易釣起深海珊瑚！" },
        3: { name: "Lv.3 秘銀大師竿", cost: { mithril: 2, steelCable: 1 }, gold: 240, desc: "垂釣完美命中區大幅加寬，且每次釣魚額外多獲 1 條鮮魚！" }
      }
    },
    hook: {
      id: "hook", name: "飛索鉤爪", iconKey: "icon_compass",
      tiers: {
        0: { name: "尚未持有鉤爪", desc: "用於跨越峽谷斷崖與險峻地形的輔助工具。" },
        1: { name: "Lv.1 精鐵飛索鉤", cost: { iron: 2, rope: 2 }, gold: 100, desc: "裝備後可快速跨越險峻地形，採集暴擊率 +10%。" },
        2: { name: "Lv.2 秘銀飛索鉤", cost: { mithril: 2, steelCable: 1 }, gold: 240, desc: "頂級探險鉤爪，野外採集額外獲得雙倍收穫機率 +20%！" }
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

  const COMPLETE_WORKSHOP_RECIPES = [
    { id: "wk_rope_ladder",    name: "攀岩繩梯 x1",           category: "explore",  toKey: "ropeLadder",  toCount: 1, cost: { rope: 1, wood: 2 },          desc: "【★高低差開路必備】架設於各區南側的岩石懸崖壁上，即可爬上高台採集稀有礦脈！" },
    { id: "wk_torch",          name: "松脂火把 x2",           category: "explore",  toKey: "torchItem",   toCount: 2, cost: { branch: 1, resin: 1 },       desc: "【地牢與黑夜照明】點燃後照亮黑霧地牢，並在黑夜戰鬥直接燒毀夜魔 1 層暗夜護盾！" },
    { id: "wk_quartz_lantern", name: "石英探礦提燈 (火把x4)", category: "explore",  toKey: "torchItem",   toCount: 4, cost: { iron: 1, quartz: 1, coal: 1 }, desc: "【強光照明】以鐵礦、石英砂與木炭打造，一次產出相當於 4 支火把的長效照明！" },
    { id: "wk_bomb",           name: "爆破炸彈 x2",           category: "explore",  toKey: "bombItem",    toCount: 2, cost: { flint: 2, clay: 1, resin: 1 }, desc: "【秘境開路】可炸開各區與荒島地牢的「裂縫岩壁」開啟隱藏秘寶箱！" },
    { id: "wk_coal_bomb",      name: "黑火藥重型炸彈 x3",     category: "explore",  toKey: "bombItem",    toCount: 3, cost: { coal: 2, flint: 1 },         desc: "【高效爆破】以高台黑曜木炭調配火藥，一次大量製造 3 顆爆破炸彈！" },
    { id: "wk_plank",          name: "加工厚木板 x1",         category: "smelt",    toKey: "plank",       toCount: 1, cost: { wood: 2 },                   desc: "【工程建材】將 2 塊翠風原木裁切為堅固的厚木板，用於修橋與升級大帆船。" },
    { id: "wk_rope",           name: "強化麻繩索 x1",         category: "smelt",    toKey: "rope",        toCount: 1, cost: { vine: 2 },                   desc: "【工程建材】將 2 條堅韌藤蔓編織為麻繩索，是製作【攀岩繩梯】與吊橋的必備材料。" },
    { id: "wk_rope_hemp",      name: "亞麻編織繩 x2",         category: "smelt",    toKey: "rope",        toCount: 2, cost: { hemp: 2 },                   desc: "【高效製繩】以峽谷荒野亞麻一次編織出 2 條強韌麻繩索。" },
    { id: "wk_pitch",          name: "防水松脂膠 x1",         category: "smelt",    toKey: "pitch",       toCount: 1, cost: { resin: 2, clay: 1 },         desc: "【造船建材】混合琥珀松脂與河畔黏土熬製的防水塗料。" },
    { id: "wk_nails",          name: "鍛造鐵釘 x2",           category: "smelt",    toKey: "nails",       toCount: 2, cost: { iron: 1 },                   desc: "【工程建材】將藍晶鐵礦鍛打為工程鐵釘。" },
    { id: "wk_steel_cable",    name: "秘銀強化鋼索 x1",       category: "smelt",    toKey: "steelCable",  toCount: 1, cost: { mithril: 1, rope: 1 },       desc: "【高階建材】融合流沙秘銀與麻繩索打造的超強韌鋼索。" },
    { id: "wk_heavy_sail",     name: "防風重帆布 x1",         category: "smelt",    toKey: "heavySail",   toCount: 1, cost: { sailCloth: 2, rope: 1 },     desc: "【遠航建材】縫合幽靈古帆布與麻繩，用於建造破浪遠洋大帆船。" },
    { id: "wk_warm_fur",       name: "禦寒獸毛氈 x1",         category: "smelt",    toKey: "warmFur",     toCount: 1, cost: { sinew: 2, hemp: 1 },         desc: "【極地建材】搭建雪原防風避難屋與高階防寒護甲的保暖毛氈。" },
    { id: "wk_ration_jerky",   name: "岩鹽風乾肉脯 x2",       category: "survival", toKey: "rationJerky", toCount: 2, cost: { fish: 1, rockSalt: 1 },      desc: "【頂級口糧】以高台結晶岩鹽醃製鮮魚，食用每份恢復 +80% 飽食度與 +90 HP！" },
    { id: "wk_ration_herb",    name: "烘烤微光菇乾 x2",       category: "survival", toKey: "rationHerb",  toCount: 2, cost: { herb: 1, branch: 1 },        desc: "【基礎口糧】食用每份可恢復 +35% 飽食度與 +25 HP。" },
    { id: "wk_ration_fish",    name: "炭烤鮮魚乾 x2",         category: "survival", toKey: "rationFish",  toCount: 2, cost: { fish: 1, branch: 1 },        desc: "【進階口糧】食用每份可恢復 +60% 飽食度與 +60 HP。" },
    { id: "wk_alchemy_heal",   name: "精煉生命藥水 x2",       category: "survival", toKey: "potionHeal",  toCount: 2, cost: { herb: 2, quartz: 1 },        desc: "【隨身提煉】以微光菇 x2 與高台石英砂燒製的玻璃瓶，免費提煉 2 瓶生命藥水！" },
    { id: "wk_alchemy_hint",   name: "精煉洞察藥水 x2",       category: "survival", toKey: "potionHint",  toCount: 2, cost: { flower: 1, resin: 1, quartz: 1 }, desc: "【隨身提煉】以太陽花、松脂與高台石英砂提煉 2 瓶洞察藥水！" }
  ];

  const REMOVED_DUPLICATE_WEAPON_IDS = ["w_srpg_machete", "w_srpg_quartz_blade", "w_srpg_highland_axe"];
  const REMOVED_DUPLICATE_ARMOR_IDS  = ["a_srpg_leather", "a_srpg_steel_mail", "a_srpg_highland_plate"];

  function registerSrpgDataIntoGame() {
    const Data = window.Aetheria.Data;
    if (!Data) return;

    if (Data.MATERIALS) {
      REMOVED_BLOAT_MATERIAL_IDS.forEach(function(k) { delete Data.MATERIALS[k]; });
      Object.keys(CLEAN_SRPG_MATERIALS).forEach(function(k) { Data.MATERIALS[k] = CLEAN_SRPG_MATERIALS[k]; });
    }
    if (Data.WEAPONS) {
      REMOVED_DUPLICATE_WEAPON_IDS.forEach(function(wid) { delete Data.WEAPONS[wid]; });
    }
    if (Data.ARMORS) {
      REMOVED_DUPLICATE_ARMOR_IDS.forEach(function(aid) { delete Data.ARMORS[aid]; });
    }

    const s = window.Aetheria.State && window.Aetheria.State.data;
    if (s) {
      if (!s.tools) s.tools = { axe: 0, pickaxe: 0, shovel: 0, rod: 0, hook: 0, pouch: 0 };
      if (s.tools.shovel === undefined) s.tools.shovel = 0;
      if (!s.dugSpots) s.dugSpots = {};
      if (!s.solvedExplorePuzzles) s.solvedExplorePuzzles = {};
      if (!s.claimedExplorePuzzleChests) s.claimedExplorePuzzleChests = {};
    }

    if (Array.isArray(Data.WORKSHOP_RECIPES)) {
      Data.WORKSHOP_RECIPES = Data.WORKSHOP_RECIPES.filter(function(r) {
        return r && REMOVED_BLOAT_RECIPE_IDS.indexOf(r.id) === -1;
      });
      COMPLETE_WORKSHOP_RECIPES.forEach(function(rec) {
        if (!Data.WORKSHOP_RECIPES.some(function(r) { return r.id === rec.id; })) {
          Data.WORKSHOP_RECIPES.push(rec);
        }
      });
    } else {
      Data.WORKSHOP_RECIPES = COMPLETE_WORKSHOP_RECIPES.slice();
    }
  }

  // ================= 6. 營地三帳篷上移防誤入 ＆ 全地圖西南谷地機關陣 (cx: 230, cy: 880) =================
  function adjustCampTentsUpward(campMap) {
    if (!campMap || campMap.id !== "camp_hub") return campMap;

    campMap.decos = (campMap.decos || []).filter(function(d) {
      return !d.isCampHerbFarm && !d.isCampFishTrap && !d.isMuseumBuilding && !d.isTrainingDummy;
    });
    campMap.portals = (campMap.portals || []).filter(function(p) {
      return p.id !== "p_enter_museum";
    });

    (campMap.decos || []).forEach(function(d) {
      const spr = String(d.sprite || "");
      if (d.id === "deco_hero_tent_ext" || spr.indexOf("tent") !== -1 || (d.y !== undefined && d.y <= 95 && (d.w >= 40 || d.h >= 36))) {
        d.y = 18;
      }
    });

    (campMap.portals || []).forEach(function(p) {
      if (p.targetZone === "tent_guild" || p.targetZone === "tent_hero" || p.targetZone === "tent_forge") {
        p.y = 72;
      }
    });

    if (campMap.trees) {
      campMap.trees = campMap.trees.filter(function(t) {
        return !(t.y < 78 && ((t.x >= 60 && t.x <= 185) || (t.x >= 255 && t.x <= 365) || (t.x >= 435 && t.x <= 565)));
      });
    }

    const Maps = window.Aetheria.Data && window.Aetheria.Data.Maps;
    if (Maps && Maps.getMap) {
      ["tent_guild", "tent_hero", "tent_forge"].forEach(function(tZone) {
        const tm = Maps.getMap(tZone);
        if (tm && tm.portals) {
          tm.portals.forEach(function(ep) {
            if (ep.targetZone === "camp_hub") ep.targetY = 108;
          });
        }
      });
    }
    return campMap;
  }

  // ★ 修正全地圖機關陣座標：統一設於西南側開闊谷地 (cx: 230, cy: 880)，100% 避開 x=1030 河道與 x=390 懸崖！
  const DIR_SYMBOLS = ["▲北", "▶東", "▼南", "◀西"];

  const ZONE_EXPLORE_PUZZLES = {
    zone1_forest: {
      type: "brazier_order", cx: 230, cy: 880,
      riddle: "📜【森林古碑謎語】：「依日出至星夜之序點燃四方聖火：先點『東之晨(1)』➔ 次燃『南之日(2)』➔ 再亮『西之霞(3)』➔ 終耀『北之星(4)』！」",
      items: [
        { dx: 52, dy: 0, order: 1, label: "東之晨" }, { dx: 0, dy: 48, order: 2, label: "南之日" },
        { dx: -52, dy: 0, order: 3, label: "西之霞" }, { dx: 0, dy: -48, order: 4, label: "北之星" }
      ]
    },
    cave1_mushroom: {
      type: "lever_toggle", cx: 230, cy: 860,
      riddle: "📜【礦洞機關銘文】：「三座連動機括（①動①②、②動①②③、③動②③）。令三座拉桿同時處於【🟢開啟】即可解開秘寶！」"
    },
    zone2_canyon: {
      type: "statue_rotate", cx: 230, cy: 880,
      riddle: "📜【法老方位碑】：「令四方石像共鳴：『西衛望東(▶東)』、『東衛望西(◀西)』、『北衛俯視南境(▼南)』、『南衛仰望北辰(▲北)』！」",
      statues: [
        { dx: -52, dy: 0, initDir: 0, targetDir: 1, name: "西衛" }, { dx: 52, dy: 0, initDir: 1, targetDir: 3, name: "東衛" },
        { dx: 0, dy: -48, initDir: 3, targetDir: 2, name: "北衛" }, { dx: 0, dy: 48, initDir: 2, targetDir: 0, name: "南衛" }
      ]
    },
    zone3_coast: {
      type: "lever_toggle", cx: 230, cy: 880,
      riddle: "📜【沉船水閘銘文】：「三座連動水閘（①動①②、②動①②③、③動②③）。令三座水閘同時處於【🟢開啟】即可浮起海神秘寶！」"
    },
    zone4_snow: {
      type: "brazier_order", cx: 230, cy: 880,
      riddle: "📜【冰原融霜碑】：「逆風點燃四聖火：先燃『北之極光(1)』➔ 次點『西之寒星(2)』➔ 再亮『南之暖陽(3)』➔ 終耀『東之破曉(4)』！」",
      items: [
        { dx: 0, dy: -48, order: 1, label: "北之極光" }, { dx: -52, dy: 0, order: 2, label: "西之寒星" },
        { dx: 0, dy: 48, order: 3, label: "南之暖陽" },  { dx: 52, dy: 0, order: 4, label: "東之破曉" }
      ]
    },
    zone5_volcano: {
      type: "lever_toggle", cx: 230, cy: 880,
      riddle: "📜【熔岩閥門銘文】：「三座連動熔岩閥（①動①②、②動①②③、③動②③）。令三座閥門同時處於【🟢開啟】即可冷卻秘寶箱！」"
    },
    zone6_sky: {
      type: "statue_rotate", cx: 230, cy: 880,
      riddle: "📜【天界星象碑】：「四聖像背心向外守護八方：『北像朝北(▲北)』、『東像朝東(▶東)』、『南像朝南(▼南)』、『西像朝西(◀西)』！」",
      statues: [
        { dx: 0, dy: -48, initDir: 2, targetDir: 0, name: "北像" }, { dx: 52, dy: 0, initDir: 3, targetDir: 1, name: "東像" },
        { dx: 0, dy: 48, initDir: 0, targetDir: 2, name: "南像" },  { dx: -52, dy: 0, initDir: 1, targetDir: 3, name: "西像" }
      ]
    }
  };

  function injectExplorationPuzzlesIntoMap(mapObj) {
    const pCfg = ZONE_EXPLORE_PUZZLES[mapObj.id];
    if (!pCfg) return;
    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
    const solved = Boolean(s.solvedExplorePuzzles && s.solvedExplorePuzzles[mapObj.id]);
    const chestClaimed = Boolean(s.claimedExplorePuzzleChests && s.claimedExplorePuzzleChests[mapObj.id]);
    const cx = pCfg.cx, cy = pCfg.cy;

    mapObj.dirtBlobs.push({ cx: cx, cy: cy, rx: 95, ry: 80, isExpandedBlob: true });

    mapObj.decos.push({
      id: "exp_puz_tablet_" + mapObj.id,
      x: cx - 64, y: cy - 52, sprite: "seal_pillar_on", w: 26, h: 30, solid: true,
      isHighlandElement: true, isExplorePuzzleTablet: true, riddleText: pCfg.riddle, zoneId: mapObj.id
    });

    mapObj.nodes.push({
      id: "exp_puz_chest_" + mapObj.id,
      x: cx, y: cy, type: "chest", name: "古遺跡機關寶箱",
      isHighlandOre: true, isExplorePuzzleChest: true, zoneId: mapObj.id, opened: chestClaimed
    });

    if (pCfg.type === "brazier_order") {
      mapObj._brazierStep = solved ? 4 : 0;
      pCfg.items.forEach(function(it, idx) {
        mapObj.decos.push({
          id: "exp_puz_brazier_" + mapObj.id + "_" + idx,
          x: cx + it.dx, y: cy + it.dy, sprite: solved ? "brazier_on" : "brazier_off", w: 26, h: 28, solid: true,
          isHighlandElement: true, isPuzzleOrderBrazier: true, lit: solved, orderNum: it.order, brazierLabel: it.label, zoneId: mapObj.id
        });
      });
    } else if (pCfg.type === "statue_rotate") {
      pCfg.statues.forEach(function(st, idx) {
        const curDir = solved ? st.targetDir : st.initDir;
        mapObj.decos.push({
          id: "exp_puz_statue_" + mapObj.id + "_" + idx,
          x: cx + st.dx, y: cy + st.dy, sprite: "ancient_statue", w: 28, h: 30, solid: true,
          isHighlandElement: true, isPuzzleRotateStatue: true, curDir: curDir, targetDir: st.targetDir, statueName: st.name, zoneId: mapObj.id
        });
      });
    } else if (pCfg.type === "lever_toggle") {
      const initStates = solved ? [true, true, true] : [true, false, false];
      [-48, 0, 48].forEach(function(dx, idx) {
        const isOn = initStates[idx];
        mapObj.decos.push({
          id: "exp_puz_lever_" + mapObj.id + "_" + idx,
          x: cx + dx, y: cy + 48, sprite: isOn ? "lever_on" : "lever_off", w: 26, h: 26, solid: true,
          isHighlandElement: true, isPuzzleToggleLever: true, leverIdx: idx, leverOn: isOn, zoneId: mapObj.id
        });
      });
    }
  }

  // ================= 7. 各區高低差懸崖、山洞 (grotto_*) 與隱藏地底遺跡 (crypt_*) =================
  const HIGHLAND_ZONES = {
    zone1_forest:   { targetW: 1680, targetH: 1180, ores: ["iron", "rockSalt", "quartz", "coal"],        grottoOres: ["coal", "iron", "rockSalt", "quartz"],   cryptName: "翠風古老樹根地窖", cryptBoss: "★遠古樹根守衛魔像" },
    cave1_mushroom: { targetW: 1580, targetH: 1140, ores: ["coal", "mithril", "quartz", "rockSalt"],     grottoOres: ["coal", "mithril", "quartz", "basalt"], cryptName: "幽窟地底秘銀聖堂", cryptBoss: "★秘銀晶簇鎮守魔像" },
    zone2_canyon:   { targetW: 1680, targetH: 1180, ores: ["mithril", "quartz", "rockSalt", "coal"],     grottoOres: ["coal", "mithril", "quartz", "basalt"], cryptName: "流沙埋沒法老王陵", cryptBoss: "★荒漠王陵黃金魔像" },
    zone3_coast:    { targetW: 1680, targetH: 1180, ores: ["coral", "rockSalt", "quartz", "coal"],       grottoOres: ["coal", "coral", "rockSalt", "mithril"],cryptName: "海底亞特蘭蒂斯密室", cryptBoss: "★深海遺跡三叉戟魔像" },
    zone4_snow:     { targetW: 1680, targetH: 1180, ores: ["obsidian", "rockSalt", "quartz", "mithril"], grottoOres: ["coal", "obsidian", "quartz", "mithril"],cryptName: "永凍冰河遠古神殿", cryptBoss: "★極寒永凍冰晶魔像" },
    zone5_volcano:  { targetW: 1680, targetH: 1180, ores: ["starIron", "obsidian", "coal", "quartz"],    grottoOres: ["coal", "starIron", "obsidian", "quartz"],cryptName: "地心黑曜熔爐秘殿", cryptBoss: "★地心黑曜神鐵魔像" },
    zone6_sky:      { targetW: 1680, targetH: 1180, ores: ["starIron", "goldLeaf", "quartz", "obsidian"],grottoOres: ["starIron", "obsidian", "quartz", "mithril"],cryptName: "星界破曉創世密室", cryptBoss: "★創世星隕守護神像" }
  };

  const grottoMapsCache = {};
  const cryptMapsCache = {};

  function buildCliffGrottoMap(parentZoneId) {
    const cfg = HIGHLAND_ZONES[parentZoneId] || HIGHLAND_ZONES.zone1_forest;
    const matsDB = (window.Aetheria.Data && window.Aetheria.Data.MATERIALS) || {};
    const parentMap = (window.Aetheria.Data && window.Aetheria.Data.Maps && window.Aetheria.Data.Maps.getMap(parentZoneId)) || { recLv: 3 };
    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};

    const nodes = [];
    [{ x: 130, y: 110 }, { x: 240, y: 95 }, { x: 350, y: 110 }, { x: 145, y: 195 }, { x: 335, y: 195 }, { x: 240, y: 145 }].forEach(function(pt, idx) {
      const giveKey = cfg.grottoOres[idx % cfg.grottoOres.length];
      const mInfo = matsDB[giveKey] || { name: giveKey };
      nodes.push({
        id: "grotto_node_" + parentZoneId + "_" + idx + "_" + Date.now(),
        x: pt.x, y: pt.y, type: "crystal", giveKey: giveKey, reqTool: "pickaxe", reqToolLv: 0,
        perfect: true, isClusterBoulder: true, name: mInfo.name, opened: false
      });
    });

    const grottoDigId = "dig_perm_grotto_" + parentZoneId;
    if (!(s.dugSpots && s.dugSpots[grottoDigId])) {
      nodes.push({
        id: grottoDigId, x: 240, y: 205, type: "crystal", giveKey: "cryptKey",
        isBuriedSpot: true, reqToolLv: 0, name: "✖藏寶點", opened: false
      });
    }

    return {
      id: "grotto_" + parentZoneId, parentZoneId: parentZoneId, _refreshToken: Date.now(),
      name: "岩壁礦洞", recLv: parentMap.recLv || 3, bgm: "cave", theme: "cave",
      rain: false, fog: false, hasRiver: false, width: 480, height: 320,
      dirtBlobs: [{ cx: 240, cy: 155, rx: 185, ry: 110 }], trees: [],
      decos: [{ x: 185, y: 78, sprite: "brazier_on", w: 24, h: 26, solid: true }, { x: 295, y: 78, sprite: "brazier_on", w: 24, h: 26, solid: true }],
      nodes: nodes, npcs: [], monsters: [],
      portals: [{ id: "p_exit_grotto_" + parentZoneId, name: "離開山洞 ▾", x: 240, y: 278, targetZone: parentZoneId, targetX: 495, targetY: 995, icon: "stairs" }]
    };
  }

  function buildAncientCryptMap(parentZoneId) {
    const cfg = HIGHLAND_ZONES[parentZoneId] || HIGHLAND_ZONES.zone1_forest;
    const matsDB = (window.Aetheria.Data && window.Aetheria.Data.MATERIALS) || {};
    const parentMap = (window.Aetheria.Data && window.Aetheria.Data.Maps && window.Aetheria.Data.Maps.getMap(parentZoneId)) || { recLv: 5 };
    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
    const vaultClaimed = Boolean(s.claimedCryptVaults && s.claimedCryptVaults[parentZoneId]);

    const nodes = [{
      id: "crypt_vault_" + parentZoneId, x: 280, y: 85, type: "chest",
      name: "遠古聖物石棺", isCryptVaultChest: true, parentZoneId: parentZoneId, opened: vaultClaimed
    }];

    [{ x: 115, y: 115 }, { x: 445, y: 115 }, { x: 115, y: 245 }, { x: 445, y: 245 }].forEach(function(pt, idx) {
      const giveKey = cfg.ores[idx % cfg.ores.length];
      const mInfo = matsDB[giveKey] || { name: giveKey };
      nodes.push({
        id: "crypt_ore_" + parentZoneId + "_" + idx + "_" + Date.now(),
        x: pt.x, y: pt.y, type: "crystal", giveKey: giveKey, reqTool: "pickaxe", reqToolLv: 0,
        perfect: true, isClusterBoulder: true, name: "遺跡" + mInfo.name, opened: false
      });
    });

    const bossLv = Math.max(4, (parentMap.recLv || 3) + 2);
    return {
      id: "crypt_" + parentZoneId, parentZoneId: parentZoneId, _refreshToken: Date.now(),
      name: cfg.cryptName || "遠古地底遺跡", recLv: bossLv, bgm: "cave", theme: "cave",
      rain: false, fog: false, hasRiver: false, width: 560, height: 360,
      dirtBlobs: [{ cx: 280, cy: 175, rx: 220, ry: 135 }], trees: [],
      decos: [
        { x: 205, y: 82, sprite: "brazier_on", w: 26, h: 28, solid: true },
        { x: 355, y: 82, sprite: "brazier_on", w: 26, h: 28, solid: true },
        { x: 205, y: 175, sprite: "seal_pillar_on", w: 28, h: 32, solid: true },
        { x: 355, y: 175, sprite: "seal_pillar_on", w: 28, h: 32, solid: true }
      ],
      nodes: nodes, npcs: [],
      monsters: [{
        id: "crypt_guardian_" + parentZoneId + "_" + Date.now(),
        name: cfg.cryptBoss || "★遠古遺跡守衛魔像", lv: bossLv, x: 280, y: 165, homeX: 280, homeY: 165,
        type: "boss", isBoss: false, isShiny: true, isCryptGuardian: true, alive: true
      }],
      portals: [{ id: "p_exit_crypt_" + parentZoneId, name: "離開地底遺跡 ▾", x: 280, y: 318, targetZone: parentZoneId, targetX: 935, targetY: 1055, icon: "stairs" }]
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

    if (mapObj.trees) {
      mapObj.trees = mapObj.trees.filter(function(t) {
        if (t.isExpandedPerimeterTree) return false;
        if (t.y >= oldH - 72) return false;
        if (t.x >= oldW - 68) return false;
        if (t.x >= 130 && t.x <= 1010 && t.y >= 740 && t.y <= 1120) return false;
        return true;
      });

      for (let bx = 20; bx < mapObj.width - 20; bx += 42) {
        if (mapObj.hasRiver && Math.abs(bx - (mapObj.riverX || 1030)) < 52) continue;
        mapObj.trees.push({ x: bx, y: mapObj.height - 42, isExpandedPerimeterTree: true });
        if (bx >= oldW - 40) mapObj.trees.push({ x: bx, y: 18, isExpandedPerimeterTree: true });
      }
      for (let by = 58; by < mapObj.height - 42; by += 42) {
        mapObj.trees.push({ x: mapObj.width - 42, y: by, isExpandedPerimeterTree: true });
        if (by >= oldH - 40) mapObj.trees.push({ x: 18, y: by, isExpandedPerimeterTree: true });
      }
    }

    if (mapObj.monsters) {
      mapObj.monsters.forEach(function(m) {
        if (!m.isBoss && isBlockedByCliffFromLowland(m.x, m.y)) {
          m.x = 240; m.y = 720; m.homeX = 240; m.homeY = 720;
        }
      });
    }

    mapObj.dirtBlobs = (mapObj.dirtBlobs || []).filter(function(b) { return !b.isExpandedBlob; });
    mapObj.dirtBlobs.push(
      { cx: 230,  cy: 780,  rx: 105, ry: 220, isExpandedBlob: true },
      { cx: 520,  cy: 1025, rx: 195, ry: 75,  isExpandedBlob: true },
      { cx: 945,  cy: 1025, rx: 75,  ry: 65,  isExpandedBlob: true },
      { cx: 1360, cy: 420,  rx: 155, ry: 220, isExpandedBlob: true },
      { cx: 1320, cy: 900,  rx: 165, ry: 150, isExpandedBlob: true }
    );

    mapObj.decos = (mapObj.decos || []).filter(function(d) { return !d.isHighlandElement; });
    mapObj.nodes = (mapObj.nodes || []).filter(function(n) { return !n.isHighlandOre; });
    mapObj.portals = (mapObj.portals || []).filter(function(p) { return !p.isCliffCavePortal; });

    mapObj.portals.push({
      id: "p_cliff_cave_" + mapObj.id, name: "山洞", x: 495, y: 948,
      targetZone: "grotto_" + mapObj.id, targetX: 240, targetY: 235, icon: "abyss", isCliffCavePortal: true
    });

    mapObj.decos.push(
      { id: "cliff_ladder_north_" + mapObj.id, x: 560, y: 800, sprite: rigged ? "rope_ladder" : "cliff_stake", w: 30, h: 38, solid: false, isHighlandElement: true, isCliffLadderSpot: true, ladderSide: "north", zoneId: mapObj.id },
      { id: "cliff_ladder_south_" + mapObj.id, x: 625, y: 940, sprite: rigged ? "rope_ladder" : "cliff_stake", w: 30, h: 46, solid: false, isHighlandElement: true, isCliffLadderSpot: true, ladderSide: "south", zoneId: mapObj.id },
      { id: "crypt_entrance_" + mapObj.id,     x: 935, y: 1015, sprite: cryptUnlocked ? "crypt_door_open" : "crypt_door_locked", w: 34, h: 34, solid: false, isHighlandElement: true, isCryptEntrance: true, zoneId: mapObj.id }
    );

    [{ x: 485, y: 845 }, { x: 655, y: 870 }, { x: 785, y: 940 }, { x: 785, y: 1015 }].forEach(function(pt, idx) {
      const giveKey = cfg.ores[idx % cfg.ores.length];
      const mInfo = matsDB[giveKey] || { name: giveKey };
      mapObj.nodes.push({
        id: "hl_ore_" + mapObj.id + "_" + idx + "_" + token,
        x: pt.x, y: pt.y, type: "crystal", giveKey: giveKey, reqTool: "pickaxe", reqToolLv: 0,
        perfect: true, isHighlandOre: true, isClusterBoulder: true, reqHighland: true, name: "高台" + mInfo.name, opened: false
      });
    });

    // 固定唯一挖寶點（全遊戲只限挖一次）
    [
      { x: 265,  y: 625,  reqHighland: false },
      { x: 585,  y: 1045, reqHighland: false },
      { x: 565,  y: 865,  reqHighland: true  },
      { x: 1380, y: 620,  reqHighland: false }
    ].forEach(function(bpt, idx) {
      const permDigId = "dig_perm_" + mapObj.id + "_" + idx;
      if (s.dugSpots && s.dugSpots[permDigId]) return;
      mapObj.nodes.push({
        id: permDigId, x: bpt.x, y: bpt.y, type: "crystal", giveKey: "cryptKey", reqToolLv: 0,
        isHighlandOre: true, isBuriedSpot: true, reqHighland: bpt.reqHighland, name: "✖藏寶點", opened: false
      });
    });

    [
      { x: 150,  y: 690, key: "coal",     type: "crystal" },
      { x: 310,  y: 710, key: "rockSalt", type: "crystal" },
      { x: 1240, y: 260, key: "quartz",   type: "crystal" },
      { x: 1380, y: 440, key: "coal",     type: "crystal" },
      { x: 1320, y: 760, key: "rockSalt", type: "crystal" },
      { x: 1220, y: 960, key: "quartz",   type: "crystal" }
    ].forEach(function(ec, idx) {
      const mInfo = matsDB[ec.key] || { name: ec.key };
      mapObj.nodes.push({
        id: "exp_srpg_node_" + mapObj.id + "_" + idx + "_" + token,
        x: ec.x, y: ec.y, type: ec.type, giveKey: ec.key, reqTool: "pickaxe", reqToolLv: 0,
        perfect: false, isHighlandOre: true, isClusterBoulder: true, reqHighland: false, name: mInfo.name, opened: false
      });
    });

    injectExplorationPuzzlesIntoMap(mapObj);
    return mapObj;
  }

  // ================= 8. 全區全貌放大地圖與格仔工坊管理系統 =================
  const WorkshopUIManager = {
    curTab: "workshop",
    curSubFilter: "all",
    selectedItemId: null,
    savedScrollTop: 0,
    currentFilteredMap: {},

    openFullZoneMapModal: function() {
      const s = window.Aetheria.State.data;
      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
      if (!mapObj) return;

      window.Aetheria.UI.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML =
        "🧭 【" + (mapObj.name || "當前區域") + "】全區全貌探索地圖";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const wrap = document.createElement("div");
      wrap.className = "fullmap-stage-wrap";
      const canvas = document.createElement("canvas");
      canvas.id = "srpg-fullmap-canvas";

      const W = mapObj.width || 1200;
      const H = mapObj.height || 680;
      const outW = 480;
      const outH = Math.round(outW * (H / W));
      canvas.width = outW;
      canvas.height = outH;
      wrap.appendChild(canvas);
      body.appendChild(wrap);

      const ctx = canvas.getContext("2d");
      const scaleX = outW / W;
      const scaleY = outH / H;

      ctx.fillStyle = "#16427d";
      ctx.fillRect(0, 0, outW, outH);

      if (cachedTerrainCanvas && cachedTerrainZoneId === mapObj.id) {
        ctx.drawImage(cachedTerrainCanvas, 0, 0, W, H, 0, 0, outW, outH);
      } else if (mapObj.id === "ocean_sea") {
        (mapObj.dirtBlobs || []).forEach(function(b) {
          ctx.fillStyle = "#e6c88c";
          ctx.beginPath(); ctx.arc((b.cx || 0) * scaleX, (b.cy || 0) * scaleY, (b.rx || 80) * scaleX, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#599140";
          ctx.beginPath(); ctx.arc((b.cx || 0) * scaleX, (b.cy || 0) * scaleY, (b.rx || 80) * scaleX * 0.68, 0, Math.PI * 2); ctx.fill();
        });
      }

      ctx.fillStyle = "#264e22";
      (mapObj.trees || []).forEach(function(t) {
        ctx.fillRect(t.x * scaleX - 2, t.y * scaleY - 2, 4, 4);
      });

      (mapObj.portals || []).forEach(function(p) {
        const px = p.x * scaleX, py = p.y * scaleY;
        ctx.fillStyle = p.isCliffCavePortal ? "#09060a" : "#38b6ff";
        ctx.fillRect(px - 5, py - 5, 10, 10);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px - 5, py - 5, 10, 10);
      });

      (mapObj.decos || []).forEach(function(d) {
        const dx = d.x * scaleX, dy = d.y * scaleY;
        if (d.isCryptEntrance) {
          ctx.fillStyle = "#9d4edd";
          ctx.fillRect(dx - 5, dy - 5, 10, 10);
          ctx.strokeStyle = "#ffd166";
          ctx.strokeRect(dx - 5, dy - 5, 10, 10);
        } else if (d.isExplorePuzzleTablet) {
          ctx.fillStyle = "#38b6ff";
          ctx.beginPath(); ctx.arc(dx, dy, 5.5, 0, Math.PI * 2); ctx.fill();
        }
      });

      (mapObj.nodes || []).forEach(function(n) {
        if (n.opened) return;
        const nx = n.x * scaleX, ny = n.y * scaleY;
        if (n.isBuriedSpot && !(s.dugSpots && s.dugSpots[n.id])) {
          drawTreasureXMarkerOnCanvas(ctx, nx, ny, 7.5);
        } else if (n.type === "chest") {
          ctx.fillStyle = "#f5b700";
          ctx.fillRect(nx - 4.5, ny - 4.5, 9, 9);
          ctx.strokeStyle = "#141013";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(nx - 4.5, ny - 4.5, 9, 9);
        }
      });

      (mapObj.monsters || []).forEach(function(m) {
        if (m.alive === false || !m.isBoss) return;
        const mx = m.x * scaleX, my = m.y * scaleY;
        ctx.beginPath(); ctx.arc(mx, my, 6.5, 0, Math.PI * 2);
        ctx.fillStyle = "#e03c4b"; ctx.fill();
        ctx.strokeStyle = "#ffd166"; ctx.lineWidth = 1.5; ctx.stroke();
      });

      const hx = (s.heroX || 300) * scaleX, hy = (s.heroY || 240) * scaleY;
      ctx.beginPath(); ctx.arc(hx, hy, 7.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(56, 182, 255, 0.45)"; ctx.fill();
      ctx.beginPath(); ctx.arc(hx, hy, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff"; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = "#141013"; ctx.stroke();

      const legend = document.createElement("div");
      legend.className = "fullmap-legend-bar";
      legend.innerHTML =
        '<span>⚪ <b>你的位置</b></span>' +
        '<span><b style="color:#e03c4b; background:#ffd166; padding:0 3px; border-radius:50%;">✖</b> <b>唯一藏寶點(鐵鏟)</b></span>' +
        '<span>🟨 <b>秘寶箱/機關陣</b></span>' +
        '<span>🟪 <b>地底遺跡門</b></span>' +
        '<span>🟦 <b>山洞/傳送口</b></span>' +
        '<span>🔴 <b>區域首領</b></span>';
      body.appendChild(legend);

      canvas.onclick = function(ev) {
        const rect = canvas.getBoundingClientRect();
        const clickX = Math.round(((ev.clientX - rect.left) / rect.width) * W);
        const clickY = Math.round(((ev.clientY - rect.top) / rect.height) * H);
        window.Aetheria.UI.showToast("🧭 地圖座標 (" + clickX + ", " + clickY + ")｜對照黃圈紅 ✖ 與地形前往探索吧！");
      };
    },

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
      if (id.indexOf("torch") !== -1 || id.indexOf("bomb") !== -1 || id.indexOf("ladder") !== -1 || id.indexOf("lantern") !== -1) return "explore";
      if (id.indexOf("ration") !== -1 || id.indexOf("heal") !== -1 || id.indexOf("hint") !== -1 || id.indexOf("jerky") !== -1) return "survival";
      return "smelt";
    },

    switchTab: function(tabId) {
      if (window.Aetheria.Audio && window.Aetheria.Audio.sfxTalkBlip) window.Aetheria.Audio.sfxTalkBlip();
      this.curTab = tabId; this.curSubFilter = "all"; this.selectedItemId = null; this.savedScrollTop = 0;
      this.renderGridWorkshopModal(tabId);
    },

    switchFilter: function(filterId) {
      if (window.Aetheria.Audio && window.Aetheria.Audio.sfxTalkBlip) window.Aetheria.Audio.sfxTalkBlip();
      this.curSubFilter = filterId; this.selectedItemId = null; this.savedScrollTop = 0;
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
        window.Aetheria.UI.showToast("⚠️ 合成材料不足！請查看上方檢視盒中標示紅色的材料。");
        return;
      }
      Object.entries(rec.cost || {}).forEach(function(entry) {
        s.inventory[entry[0]] = Math.max(0, (s.inventory[entry[0]] || 0) - entry[1]);
      });
      if (rec.goldCost) s.gold = Math.max(0, (s.gold || 0) - rec.goldCost);
      const outKey = rec.toKey || rec.giveKey || rec.outKey;
      const outCnt = rec.toCount || rec.count || rec.qty || 1;
      if (outKey) s.inventory[outKey] = (s.inventory[outKey] || 0) + outCnt;

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
        if (!s.tools) s.tools = { axe: 0, pickaxe: 0, shovel: 0, rod: 0, hook: 0, pouch: 0 };
        Object.entries(selectedObj.costMap || {}).forEach(function(entry) {
          s.inventory[entry[0]] = Math.max(0, (s.inventory[entry[0]] || 0) - entry[1]);
        });
        if (selectedObj.goldCost) s.gold = Math.max(0, (s.gold || 0) - selectedObj.goldCost);
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
          if (!selectedObj.canCraft) { window.Aetheria.Audio.sfxWrong(); UI.showToast("⚠️ 鍛造此武器的材料或金幣不足！"); return; }
          Object.entries(selectedObj.costMap || {}).forEach(function(entry) { s.inventory[entry[0]] -= entry[1]; });
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
          if (!selectedObj.canCraft) { window.Aetheria.Audio.sfxWrong(); UI.showToast("⚠️ 鍛造此防具的材料或金幣不足！"); return; }
          Object.entries(selectedObj.costMap || {}).forEach(function(entry) { s.inventory[entry[0]] -= entry[1]; });
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
        if (selectedObj.unlocked || !selectedObj.canCraft) return;
        Object.entries(selectedObj.costMap || {}).forEach(function(entry) { s.inventory[entry[0]] -= entry[1]; });
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
        const recipeMap = {}, seenNames = {};
        COMPLETE_WORKSHOP_RECIPES.forEach(function(r) { recipeMap[r.id] = r; seenNames[r.name] = true; });
        const rawWks = Array.isArray(Data.WORKSHOP_RECIPES)
          ? Data.WORKSHOP_RECIPES
          : (Data.WORKSHOP_RECIPES && typeof Data.WORKSHOP_RECIPES === "object" ? Object.values(Data.WORKSHOP_RECIPES) : []);
        rawWks.forEach(function(r, idx) {
          if (!r || !r.name) return;
          const rid = r.id || r.wkId || ("wk_legacy_" + idx);
          if (REMOVED_BLOAT_RECIPE_IDS.indexOf(rid) !== -1) return;
          r.id = rid;
          if (!recipeMap[rid] && !seenNames[r.name]) { recipeMap[rid] = r; seenNames[r.name] = true; }
        });

        Object.values(recipeMap).forEach(function(r) {
          const subCat = self.getRecipeSubCategory(r);
          const outKey = r.toKey || r.giveKey || r.outKey;
          const owned = (s.inventory && s.inventory[outKey]) || 0;
          const canDo = self.canAffordRecipe(s, r.cost, r.goldCost || 0);
          itemsList.push({
            uid: r.id, raw: r, itemType: "recipe", subCat: subCat, iconKey: "mat_" + outKey,
            shortName: r.name.replace(/\s*x\d+$/i, "").replace(/\s*\([^)]*\)/g, ""),
            fullName: r.name, badgeText: "持有 " + owned, canCraft: canDo,
            costMap: r.cost, goldCost: r.goldCost || 0, desc: r.desc || "工坊合成加工品。"
          });
        });
      } else if (tab === "tools") {
        ["axe", "pickaxe", "shovel", "rod", "hook", "pouch"].forEach(function(tKey) {
          const tDef = BUILTIN_TOOLS_DB[tKey] || (Data.TOOLS && Data.TOOLS[tKey]);
          if (!tDef) return;
          const curLv = (s.tools && s.tools[tKey]) || 0;
          const nextTier = tDef.tiers && tDef.tiers[curLv + 1];
          const curTierObj = (tDef.tiers && tDef.tiers[curLv]) || { name: tDef.name, desc: "" };
          const isMax = !nextTier;
          const canDo = !isMax && self.canAffordRecipe(s, nextTier.cost, nextTier.gold || 0);
          itemsList.push({
            uid: "tool_" + tKey, toolKey: tKey, itemType: "tool", subCat: "all", iconKey: tDef.iconKey || "icon_axe",
            shortName: tDef.name, fullName: tDef.name + " (當前：" + curTierObj.name + ")",
            badgeText: isMax ? "★滿級" : ("Lv." + curLv), canCraft: canDo, isMax: isMax,
            costMap: nextTier ? nextTier.cost : null, goldCost: nextTier ? (nextTier.gold || 0) : 0,
            desc: nextTier ? ("下一階【" + nextTier.name + "】：" + (nextTier.desc || "")) : ("已達最高階級！" + (curTierObj.desc || ""))
          });
        });
      } else if (tab === "weapons") {
        const seenWId = {}, seenWName = {};
        const wList = Object.values(Data.WEAPONS || {}).filter(function(w) {
          if (!w || !w.id || !w.name || REMOVED_DUPLICATE_WEAPON_IDS.indexOf(w.id) !== -1) return false;
          if (seenWId[w.id] || seenWName[w.name]) return false;
          seenWId[w.id] = true; seenWName[w.name] = true; return true;
        });
        wList.sort(function(a, b) { return (a.tier || 1) - (b.tier || 1); });
        wList.forEach(function(w) {
          const unlocked = Boolean(s.unlockedWeapons && s.unlockedWeapons.indexOf(w.id) !== -1);
          const equipped = (s.equippedWeapon === w.id);
          const canDo = !unlocked && self.canAffordRecipe(s, w.cost, w.gold || 0);
          itemsList.push({
            uid: w.id, raw: w, itemType: "weapon", subCat: (w.tier <= 4) ? "low" : "high", iconKey: "icon_sword",
            shortName: w.name, fullName: w.name + " (ATK +" + w.atk + ")",
            badgeText: equipped ? "已裝備" : (unlocked ? "已擁有" : ("T" + (w.tier || 1))),
            canCraft: canDo, unlocked: unlocked, equipped: equipped, costMap: w.cost, goldCost: w.gold || 0,
            desc: w.desc || ("基礎攻擊力 +" + w.atk)
          });
        });
      } else if (tab === "armors") {
        const seenAId = {}, seenAName = {};
        const aList = Object.values(Data.ARMORS || {}).filter(function(a) {
          if (!a || !a.id || !a.name || REMOVED_DUPLICATE_ARMOR_IDS.indexOf(a.id) !== -1) return false;
          if (seenAId[a.id] || seenAName[a.name]) return false;
          seenAId[a.id] = true; seenAName[a.name] = true; return true;
        });
        aList.sort(function(a, b) { return (a.tier || 1) - (b.tier || 1); });
        aList.forEach(function(a) {
          const unlocked = Boolean(s.unlockedArmors && s.unlockedArmors.indexOf(a.id) !== -1);
          const equipped = (s.equippedArmor === a.id);
          const canDo = !unlocked && self.canAffordRecipe(s, a.cost, a.gold || 0);
          itemsList.push({
            uid: a.id, raw: a, itemType: "armor", subCat: "armor", iconKey: "icon_shield",
            shortName: a.name, fullName: a.name + " (DEF +" + a.def + " / HP +" + (a.hp || 0) + ")",
            badgeText: equipped ? "穿戴中" : (unlocked ? "已擁有" : ("T" + (a.tier || 1))),
            canCraft: canDo, unlocked: unlocked, equipped: equipped, costMap: a.cost, goldCost: a.gold || 0,
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
            uid: rel.id, raw: rel, itemType: "relic", subCat: "relic", iconKey: "crystal",
            shortName: rel.name, fullName: "【聖物】" + rel.name, badgeText: unlocked ? "★已共鳴" : "聖物",
            canCraft: canDo, unlocked: unlocked, costMap: rel.cost, goldCost: rel.gold || 0,
            desc: rel.desc || "永久被動聖物加成。"
          });
        });
      }

      let subFilters = [];
      if (tab === "workshop") {
        subFilters = [
          { id: "all", label: "全部(" + itemsList.length + ")" }, { id: "can", label: "✅可製作" },
          { id: "explore", label: "🧗開路/照明" }, { id: "smelt", label: "🔥建材加工" }, { id: "survival", label: "🍖口糧補給" }
        ];
      } else if (tab === "weapons") {
        subFilters = [
          { id: "all", label: "全部武器(" + itemsList.length + ")" }, { id: "can", label: "✅可鍛造/已擁有" },
          { id: "low", label: "T1~T4 初中階" }, { id: "high", label: "T5~T10 傳奇階" }
        ];
      } else if (tab === "armors") {
        subFilters = [
          { id: "all", label: "全部(" + itemsList.length + ")" }, { id: "armor", label: "🛡️防具護甲" }, { id: "relic", label: "💎遠古聖物" }
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
      filteredItems.forEach(function(it) { self.currentFilteredMap[it.uid] = it; });

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
            const mKey = entry[0], req = entry[1];
            const have = (s.inventory && s.inventory[mKey]) || 0;
            const mName = (matsDB[mKey] && matsDB[mKey].name) || mKey;
            const ok = have >= req;
            chipsHtml += '<span class="wk-mat-chip ' + (ok ? 'ok' : 'lack') + '">' + S.iconHtml("mat_" + mKey, true) + mName + ' ' + have + '/' + req + (ok ? ' ✓' : '') + '</span>';
          });
        }
        if (selectedObj.goldCost > 0 && !selectedObj.unlocked && !selectedObj.isMax) {
          const gOk = (s.gold || 0) >= selectedObj.goldCost;
          chipsHtml += '<span class="wk-mat-chip ' + (gOk ? 'ok' : 'lack') + '">💰 ' + selectedObj.goldCost + ' G</span>';
        }

        let actionBtnHtml = "";
        if (selectedObj.itemType === "recipe") {
          const outKey = selectedObj.raw.toKey || selectedObj.raw.giveKey;
          const canEatJerky = (outKey === "rationJerky") && ((s.inventory && s.inventory.rationJerky) || 0) > 0;
          actionBtnHtml =
            '<div style="display:flex; flex-direction:column; gap:4px;">' +
              '<button class="na-btn ' + (selectedObj.canCraft ? 'highlight' : '') + '" style="padding:7px 12px; font-size:13px; white-space:nowrap;" onclick="Aetheria.HighlandsWorkshop.craftOrAct(\'' + selectedObj.uid + '\')">🔨 立即製作</button>' +
              (canEatJerky ? '<button class="na-btn" style="padding:4px 8px; font-size:11px; border-color:#5ac54f; color:#5ac54f;" onclick="Aetheria.HighlandsWorkshop.useSrpgConsumable(\'rationJerky\')">🍖 立即食用</button>' : '') +
            '</div>';
        } else if (selectedObj.itemType === "tool") {
          actionBtnHtml = selectedObj.isMax
            ? '<span style="color:#5ac54f; font-weight:900; white-space:nowrap;">★ 已滿級</span>'
            : '<button class="na-btn ' + (selectedObj.canCraft ? 'highlight' : '') + '" style="padding:7px 12px; white-space:nowrap;" onclick="Aetheria.HighlandsWorkshop.craftOrAct(\'' + selectedObj.uid + '\')">⛏️ 升級工具</button>';
        } else if (selectedObj.itemType === "weapon" || selectedObj.itemType === "armor") {
          if (selectedObj.equipped) actionBtnHtml = '<span style="color:#ffd166; font-weight:900; white-space:nowrap;">✓ 裝備中</span>';
          else if (selectedObj.unlocked) actionBtnHtml = '<button class="na-btn highlight" style="padding:7px 12px; white-space:nowrap;" onclick="Aetheria.HighlandsWorkshop.craftOrAct(\'' + selectedObj.uid + '\')">⚡ 立即裝備</button>';
          else actionBtnHtml = '<button class="na-btn ' + (selectedObj.canCraft ? 'highlight' : '') + '" style="padding:7px 12px; white-space:nowrap;" onclick="Aetheria.HighlandsWorkshop.craftOrAct(\'' + selectedObj.uid + '\')">🔨 鍛造</button>';
        } else if (selectedObj.itemType === "relic") {
          actionBtnHtml = selectedObj.unlocked
            ? '<span style="color:#5ac54f; font-weight:900;">★ 生效中</span>'
            : '<button class="na-btn ' + (selectedObj.canCraft ? 'highlight' : '') + '" style="padding:7px 12px; white-space:nowrap;" onclick="Aetheria.HighlandsWorkshop.craftOrAct(\'' + selectedObj.uid + '\')">💎 合成聖物</button>';
        }

        inspectorInnerHtml =
          '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">' +
            '<div style="flex:1;">' +
              '<div style="font-size:13.5px; font-weight:900; color:#ffd166;">' + S.iconHtml(selectedObj.iconKey, true) + selectedObj.fullName + '</div>' +
              '<div style="font-size:11px; color:#cbd5e1; margin-top:2px; line-height:1.3;">' + selectedObj.desc + '</div>' +
              (chipsHtml ? '<div style="margin-top:4px;">' + chipsHtml + '</div>' : '') +
            '</div>' +
            actionBtnHtml +
          '</div>';
      } else {
        inspectorInnerHtml = '<div style="color:#94a3b8; font-size:12px; text-align:center;">此分類下暫無項目</div>';
      }

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
            (showQuickBtn ? ('<button class="wk-cell-quick-btn" onclick="event.stopPropagation(); Aetheria.HighlandsWorkshop.craftOrAct(\'' + item.uid + '\')">' + quickBtnLabel + '</button>') : '') +
          '</div>';
      });

      body.innerHTML =
        '<div class="wk-top-control-panel">' +
          this.buildMainTabBarHtml(tab) +
          filterBarHtml +
          '<div class="wk-inspector-box" id="wk-inspector-box">' + inspectorInnerHtml + '</div>' +
        '</div>' +
        '<div class="wk-icon-grid">' + gridCellsHtml + '</div>';

      if (this.savedScrollTop > 0) body.scrollTop = this.savedScrollTop;
    }
  };

  window.Aetheria.HighlandsWorkshop = WorkshopUIManager;

  // ================= 9. 掛載系統 =================
  function hookSystemsForHighlandsAndWorkshop() {
    const St   = window.Aetheria.State;
    const Maps = window.Aetheria.Data && window.Aetheria.Data.Maps;
    const Exp  = window.Aetheria.Explore;
    const Ren  = window.Aetheria.Renderer;
    const UI   = window.Aetheria.UI;

    if (St && St.recalcMaxHp) {
      const origMaxHp = St.recalcMaxHp.bind(St);
      St.recalcMaxHp = function() {
        origMaxHp();
        if (this.data) {
          const pouchLv = (this.data.tools && this.data.tools.pouch) || 0;
          const pouchHp = (pouchLv >= 2) ? 70 : (pouchLv === 1) ? 30 : 0;
          this.data.maxHp += pouchHp;
          if (this.data.hp > this.data.maxHp) this.data.hp = this.data.maxHp;
        }
      };
    }

    if (Maps && Maps.getMap) {
      const origGetMap = Maps.getMap.bind(Maps);
      Maps.getMap = function(zoneId) {
        if (zoneId && zoneId.indexOf("grotto_") === 0) {
          const pZone = zoneId.replace("grotto_", "");
          if (!grottoMapsCache[zoneId]) grottoMapsCache[zoneId] = buildCliffGrottoMap(pZone);
          return grottoMapsCache[zoneId];
        }
        if (zoneId && zoneId.indexOf("crypt_") === 0) {
          const cZone = zoneId.replace("crypt_", "");
          if (!cryptMapsCache[zoneId]) cryptMapsCache[zoneId] = buildAncientCryptMap(cZone);
          return cryptMapsCache[zoneId];
        }
        const m = origGetMap(zoneId);
        if (m) {
          if (m.id === "camp_hub") adjustCampTentsUpward(m);
          else if (HIGHLAND_ZONES[m.id]) injectHighlandCliffIntoMap(m);
        }
        return m;
      };

      const origRefresh = Maps.refreshAllResources.bind(Maps);
      Maps.refreshAllResources = function() {
        origRefresh();
        Object.keys(grottoMapsCache).forEach(function(k) { delete grottoMapsCache[k]; });
        Object.keys(cryptMapsCache).forEach(function(k) { delete cryptMapsCache[k]; });
        const camp = origGetMap("camp_hub");
        if (camp) adjustCampTentsUpward(camp);
        Object.keys(HIGHLAND_ZONES).forEach(function(zId) {
          const m = origGetMap(zId);
          if (m) { m._highlandInjectedToken = null; injectHighlandCliffIntoMap(m); }
        });
      };
    }

    if (Exp) {
      if (Exp.triggerPortal) {
        const origPortal = Exp.triggerPortal.bind(Exp);
        Exp.triggerPortal = function(portal) {
          const s = window.Aetheria.State.data;
          if (s && s.currentZone === "camp_hub" && portal &&
              (portal.targetZone === "tent_guild" || portal.targetZone === "tent_hero" || portal.targetZone === "tent_forge")) {
            const dist = Math.hypot((s.heroX || 0) - portal.x, (s.heroY || 0) - portal.y);
            if (dist > 15 || s.heroY > 84) return;
          }
          origPortal(portal);
        };
      }

      const origUpdateStep = Exp.updateStep.bind(Exp);
      Exp.updateStep = function() {
        const s = window.Aetheria.State.data;
        const prevX = s.heroX, prevY = s.heroY, prevZone = s.currentZone;
        origUpdateStep();
        if (s.currentZone !== prevZone || !HIGHLAND_ZONES[s.currentZone]) {
          s.onHighland = false;
          return;
        }
        if (s.onHighland) {
          if (!isInsideHighlandPlateau(s.heroX, s.heroY)) { s.heroX = prevX; s.heroY = prevY; }
        } else {
          if (isBlockedByCliffFromLowland(s.heroX, s.heroY)) { s.heroX = prevX; s.heroY = prevY; }
        }
      };

      if (Exp.updateMonstersAI) {
        const origAI = Exp.updateMonstersAI.bind(Exp);
        Exp.updateMonstersAI = function(mapObj, s) {
          const hasCliff = Boolean(mapObj && HIGHLAND_ZONES[mapObj.id]);
          const prevCoords = [];
          if (hasCliff && mapObj.monsters) {
            mapObj.monsters.forEach(function(m, idx) { prevCoords[idx] = { x: m.x, y: m.y }; });
          }
          origAI(mapObj, s);
          if (hasCliff && mapObj.monsters) {
            mapObj.monsters.forEach(function(m, idx) {
              if (!m || m.alive === false) return;
              if (isBlockedByCliffFromLowland(m.x, m.y)) {
                if (prevCoords[idx] && !isBlockedByCliffFromLowland(prevCoords[idx].x, prevCoords[idx].y)) {
                  m.x = prevCoords[idx].x; m.y = prevCoords[idx].y;
                } else {
                  m.x = 240; m.y = 720;
                }
                m.vx = -(m.vx || 0); m.vy = -(m.vy || 0);
              }
            });
          }
        };
      }

      const origInteract = Exp.interactNearby.bind(Exp);
      Exp.interactNearby = function() {
        const s = window.Aetheria.State.data;
        if (!s.solvedExplorePuzzles) s.solvedExplorePuzzles = {};
        const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);

        if (mapObj && mapObj.decos) {
          for (let i = 0; i < mapObj.decos.length; i++) {
            const d = mapObj.decos[i];
            if (!d) continue;

            if (d.isExplorePuzzleTablet && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 48) {
              window.Aetheria.Audio.sfxTalkBlip();
              window.Aetheria.UI.showToast(d.riddleText || "古老的機關銘文。");
              return;
            }

            if (d.isPuzzleOrderBrazier && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 46) {
              if (s.solvedExplorePuzzles[mapObj.id]) {
                window.Aetheria.UI.showToast("✨ 此處四象火盆陣已解開並永久鎖定！");
                return;
              }
              const nextOrder = (mapObj._brazierStep || 0) + 1;
              if (d.orderNum === nextOrder) {
                d.lit = true; d.sprite = "brazier_on"; mapObj._brazierStep = nextOrder;
                window.Aetheria.Audio.sfxGather();
                if (nextOrder >= 4) {
                  s.solvedExplorePuzzles[mapObj.id] = true;
                  window.Aetheria.State.save();
                  window.Aetheria.Audio.sfxLevelUp();
                  window.Aetheria.UI.spawnFloatingText("🔓四象火盆共鳴!", "#5ac54f", true);
                  window.Aetheria.UI.showToast("🎉 四象聖火順序完全正確！中央的【古遺跡機關寶箱】已解鎖！");
                } else {
                  window.Aetheria.UI.showToast("🔥 點燃【" + d.brazierLabel + "】(" + nextOrder + "/4)！請繼續點燃下一座！");
                }
              } else {
                mapObj._brazierStep = 0;
                (mapObj.decos || []).forEach(function(bd) { if (bd.isPuzzleOrderBrazier) { bd.lit = false; bd.sprite = "brazier_off"; } });
                window.Aetheria.Audio.sfxWrong();
                window.Aetheria.UI.showToast("⚠️ 點燃順序錯誤！聖火已全部熄滅重置，請先閱讀左上方的【📜古碑謎語】！");
              }
              return;
            }

            if (d.isPuzzleRotateStatue && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 46) {
              if (s.solvedExplorePuzzles[mapObj.id]) {
                window.Aetheria.UI.showToast("✨ 四方守衛石像已共鳴並永久鎖定！");
                return;
              }
              d.curDir = ((d.curDir || 0) + 1) % 4;
              window.Aetheria.Audio.sfxGather();
              const allStatues = (mapObj.decos || []).filter(function(sd) { return sd.isPuzzleRotateStatue; });
              if (allStatues.length > 0 && allStatues.every(function(sd) { return sd.curDir === sd.targetDir; })) {
                s.solvedExplorePuzzles[mapObj.id] = true;
                window.Aetheria.State.save();
                window.Aetheria.Audio.sfxLevelUp();
                window.Aetheria.UI.spawnFloatingText("🔓石像方位共鳴!", "#5ac54f", true);
                window.Aetheria.UI.showToast("🎉 四方石像方位完全吻合！中央的【古遺跡機關寶箱】已解鎖！");
              } else {
                window.Aetheria.UI.showToast("🗿 旋轉【" + d.statueName + "】朝向為：" + DIR_SYMBOLS[d.curDir]);
              }
              return;
            }

            if (d.isPuzzleToggleLever && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 46) {
              if (s.solvedExplorePuzzles[mapObj.id]) {
                window.Aetheria.UI.showToast("✨ 三連拉桿機關已解開並永久鎖定！");
                return;
              }
              const allLevers = (mapObj.decos || []).filter(function(ld) { return ld.isPuzzleToggleLever; });
              const toggleTargets = (d.leverIdx === 0) ? [0, 1] : (d.leverIdx === 1) ? [0, 1, 2] : [1, 2];
              allLevers.forEach(function(ld) {
                if (toggleTargets.indexOf(ld.leverIdx) !== -1) {
                  ld.leverOn = !ld.leverOn;
                  ld.sprite = ld.leverOn ? "lever_on" : "lever_off";
                }
              });
              window.Aetheria.Audio.sfxGather();
              if (allLevers.length > 0 && allLevers.every(function(ld) { return ld.leverOn; })) {
                s.solvedExplorePuzzles[mapObj.id] = true;
                window.Aetheria.State.save();
                window.Aetheria.Audio.sfxLevelUp();
                window.Aetheria.UI.spawnFloatingText("🔓三連拉桿解鎖!", "#5ac54f", true);
                window.Aetheria.UI.showToast("🎉 三座連動拉桿全部開啟！中央的【古遺跡機關寶箱】已解鎖！");
              }
              return;
            }

            if (d.isCryptEntrance && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 62) {
              if (!s.unlockedCrypts) s.unlockedCrypts = {};
              const zId = d.zoneId || mapObj.id;
              if (!s.unlockedCrypts[zId]) {
                if ((s.inventory.cryptKey || 0) <= 0) {
                  window.Aetheria.Audio.sfxWrong();
                  window.Aetheria.UI.showToast("🔒 古老的地底遺跡石門緊閉！請點擊左下角【羅盤小地圖】查看紅 ✖ 位置，用【探險鐵鏟】挖出【遠古遺跡鑰匙】！");
                  return;
                }
                s.inventory.cryptKey--;
                s.unlockedCrypts[zId] = true;
                d.sprite = "crypt_door_open";
                if (window.Aetheria.Renderer) window.Aetheria.Renderer.builtZoneKey = null;
                window.Aetheria.Audio.sfxLevelUp();
                window.Aetheria.UI.showToast("🗝️ 使用【遠古遺跡鑰匙】解開了封印！正在進入地底古老遺跡……");
              } else {
                window.Aetheria.Audio.sfxGather();
              }

              window.Aetheria.Data.Maps.getMap("crypt_" + zId);
              s.currentZone = "crypt_" + zId;
              s.onHighland = false;
              s.heroX = 280; s.heroY = 275; s.petX = 258; s.petY = 278;
              if (window.Aetheria.Renderer) {
                window.Aetheria.Renderer.builtZoneKey = null;
                window.Aetheria.Renderer.renderWorld();
              }
              if (window.Aetheria.Audio && window.Aetheria.Audio.playBgm) window.Aetheria.Audio.playBgm("cave");
              window.Aetheria.State.save();
              window.Aetheria.UI.updateAllHud();
              return;
            }

            if (d.isCliffLadderSpot && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 68) {
              if (!s.riggedCliffs) s.riggedCliffs = {};
              if (!s.riggedCliffs[mapObj.id]) {
                if ((s.inventory.ropeLadder || 0) <= 0) {
                  window.Aetheria.Audio.sfxWrong();
                  window.Aetheria.UI.showToast("🧗 陡峭的懸崖岩壁！請先在【工坊 ➔ 🔨加工】合成【攀岩繩梯 x1】(麻繩x1+原木x2) 架設！");
                  return;
                }
                s.inventory.ropeLadder--;
                s.riggedCliffs[mapObj.id] = true;
                (mapObj.decos || []).forEach(function(dc) { if (dc.isCliffLadderSpot) dc.sprite = "rope_ladder"; });
                if (window.Aetheria.Renderer) window.Aetheria.Renderer.builtZoneKey = null;
              }

              window.Aetheria.Audio.sfxGather();
              if (s.onHighland) {
                s.onHighland = false;
                s.heroX = d.x; s.heroY = (d.ladderSide === "north") ? 772 : 982;
                window.Aetheria.UI.showToast("🧗 順着攀岩繩梯爬下了平地！");
              } else {
                s.onHighland = true;
                s.heroX = d.x; s.heroY = (d.ladderSide === "north") ? 835 : 895;
                window.Aetheria.UI.showToast("🧗 順着攀岩繩梯爬上了【岩石高台礦區】！");
              }
              s.petX = s.heroX - 20; s.petY = s.heroY;
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
              if (!d) continue;
              if (d.isExplorePuzzleTablet && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 48) { hintEl.innerText = "閱讀古碑"; return; }
              if (d.isPuzzleOrderBrazier && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 46)  { hintEl.innerText = "點燃火盆"; return; }
              if (d.isPuzzleRotateStatue && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 46)  { hintEl.innerText = "旋轉石像"; return; }
              if (d.isPuzzleToggleLever && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 46)   { hintEl.innerText = "扳動拉桿"; return; }
              if (d.isCryptEntrance && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 62) {
                const open = Boolean(s.unlockedCrypts && s.unlockedCrypts[d.zoneId || mapObj.id]);
                hintEl.innerText = open ? "進入遺跡" : "鑰匙開鎖";
                return;
              }
              if (d.isCliffLadderSpot && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 68) {
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

      const origHarvest = Exp.harvestNode.bind(Exp);
      Exp.harvestNode = function(node) {
        const s = window.Aetheria.State.data;
        if (node && node.reqHighland && !s.onHighland) {
          window.Aetheria.Audio.sfxWrong();
          window.Aetheria.UI.showToast("🧗 此位置位於高台上！請先從懸崖邊的【🧗繩梯】爬上高台！");
          return;
        }

        if (node && node.isExplorePuzzleChest) {
          if (!s.solvedExplorePuzzles || !s.solvedExplorePuzzles[node.zoneId]) {
            window.Aetheria.Audio.sfxWrong();
            window.Aetheria.UI.showToast("🔒 機關寶箱被結界鎖定！請先閱讀左上方的【📜古碑謎語】並解開周圍的現場機關！");
            return;
          }
          if (!s.claimedExplorePuzzleChests) s.claimedExplorePuzzleChests = {};
          if (node.opened || s.claimedExplorePuzzleChests[node.zoneId]) {
            node.opened = true;
            window.Aetheria.UI.showToast("此古遺跡機關寶箱已經領取過了！");
            return;
          }
          node.opened = true;
          s.claimedExplorePuzzleChests[node.zoneId] = true;
          s.gold = (s.gold || 0) + 280;
          s.inventory.cryptKey = (s.inventory.cryptKey || 0) + 1;
          s.inventory.mithril = (s.inventory.mithril || 0) + 2;
          s.inventory.rationJerky = (s.inventory.rationJerky || 0) + 2;
          window.Aetheria.Audio.sfxLevelUp();
          window.Aetheria.State.save();
          window.Aetheria.UI.updateAllHud();
          window.Aetheria.UI.showToast("🏆 解開古遺跡機關寶箱！獲得【280G、🗝️遠古遺跡鑰匙+1、流沙秘銀+2、風乾肉脯+2】！");
          return;
        }

        if (node) {
          const pColor = (node.type === "wood") ? "#5ac54f" : (node.isBuriedSpot ? "#d9a066" : "#8ce0ff");
          spawnHarvestParticles(node.x, node.y, pColor);
          if (window.Aetheria.Renderer && window.Aetheria.Renderer.domPool && window.Aetheria.Renderer.domPool.nodes) {
            const domItem = window.Aetheria.Renderer.domPool.nodes[node.id];
            if (domItem && domItem.el) {
              domItem.el.classList.remove("srpg-node-hit");
              void domItem.el.offsetWidth;
              domItem.el.classList.add("srpg-node-hit");
            }
          }
        }

        if (node && node.isBuriedSpot) {
          if (!s.dugSpots) s.dugSpots = {};
          if (node.opened || s.dugSpots[node.id]) {
            node.opened = true;
            window.Aetheria.UI.showToast("此藏寶點已經挖掘過了！");
            return;
          }
          const shovelLv = (s.tools && s.tools.shovel) || 0;
          if (shovelLv < 1) {
            window.Aetheria.Audio.sfxWrong();
            window.Aetheria.UI.showToast("🥄 地面有神秘的「✖」藏寶記號！請先在【工坊 ➔ ⛏️工具】打造【Lv.1 精鐵探險鏟】(原木x2+鐵礦x1) 挖掘！");
            return;
          }
          node.opened = true;
          s.dugSpots[node.id] = true;
          if (window.Aetheria.Renderer && window.Aetheria.Renderer.domPool && window.Aetheria.Renderer.domPool.nodes) {
            const domNode = window.Aetheria.Renderer.domPool.nodes[node.id];
            if (domNode && domNode.el) domNode.el.style.display = "none";
          }
          window.Aetheria.Audio.sfxLevelUp();

          const zId = (s.currentZone || "").replace("grotto_", "");
          const cryptAlreadyOpen = Boolean(s.unlockedCrypts && s.unlockedCrypts[zId]);
          const hasKeyInBag = ((s.inventory && s.inventory.cryptKey) || 0) > 0;
          const goldGain = (65 + (s.lv || 1) * 6) * (shovelLv >= 2 ? 2 : 1);
          s.gold = (s.gold || 0) + goldGain;

          if (!cryptAlreadyOpen && !hasKeyInBag) {
            s.inventory.cryptKey = (s.inventory.cryptKey || 0) + 1;
            s.inventory.mithril = (s.inventory.mithril || 0) + 1;
            window.Aetheria.UI.showToast("🥄 挖開唯一藏寶點！獲得【🗝️遠古遺跡鑰匙 +1、流沙秘銀 +1】與 " + goldGain + " G！");
          } else {
            s.inventory.mithril = (s.inventory.mithril || 0) + (shovelLv >= 2 ? 2 : 1);
            s.inventory.quartz = (s.inventory.quartz || 0) + 2;
            if (shovelLv >= 3) s.inventory.starIron = (s.inventory.starIron || 0) + 1;
            window.Aetheria.UI.showToast("🥄 挖開唯一藏寶點：獲得【流沙秘銀、透明石英砂 +2】與 " + goldGain + " G！");
          }
          window.Aetheria.State.save();
          window.Aetheria.UI.updateAllHud();
          return;
        }

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
          s.inventory.tabletShard = (s.inventory.tabletShard || 0) + 1;
          s.inventory.obsidian = (s.inventory.obsidian || 0) + 2;
          window.Aetheria.Audio.sfxLevelUp();
          window.Aetheria.State.save();
          window.Aetheria.UI.updateAllHud();
          window.Aetheria.UI.showToast("🏆 開啟遠古聖物石棺！獲【350G、古文明聖碑殘片x1、熔岩黑曜石x2】！");
          return;
        }

        origHarvest(node);
      };
    }

    if (Ren) {
      if (Ren.updateMinimap) {
        Ren.updateMinimap = function(mapObj, s) {
          renderCompassMinimap(mapObj, s);
        };
      }

      const origBuild = Ren.buildSceneDOM.bind(Ren);
      Ren.buildSceneDOM = function(mapObj) {
        if (mapObj) {
          if (mapObj.id === "camp_hub") adjustCampTentsUpward(mapObj);
          else if (HIGHLAND_ZONES[mapObj.id]) injectHighlandCliffIntoMap(mapObj);
        }
        origBuild(mapObj);

        mountGuaranteedCompassWidget();

        const terrainLayer = document.getElementById("world-terrain-layer");
        const S = window.Aetheria.Data.Sprites;
        if (!terrainLayer || !mapObj) return;

        renderKenneyNaturalTerrainCanvas(mapObj, terrainLayer);
        syncDomRiverBridge(mapObj, terrainLayer);

        Object.keys(this.domPool.decos || {}).forEach(function(k) {
          const item = Ren.domPool.decos[k];
          if (!item || !item.data || !item.el) return;
          const d = item.data;
          if ((d.isCliffLadderSpot || d.isCryptEntrance || d.isExplorePuzzleTablet ||
               d.isPuzzleOrderBrazier || d.isPuzzleRotateStatue || d.isPuzzleToggleLever) && !item.lbl) {
            const lbl = document.createElement("div");
            lbl.className = "dom-label";
            item.el.appendChild(lbl);
            item.lbl = lbl;
          }
        });

        Object.keys(this.domPool.nodes || {}).forEach(function(nId) {
          const item = Ren.domPool.nodes[nId];
          if (!item || !item.data || !S) return;
          if (item.data.isBuriedSpot) {
            item.el.innerHTML = '<img src="' + S.getDataURL("buried_x_spot") + '" alt="">';
            if (item.lbl) { item.lbl.className = "dom-label dig-spot-lbl"; item.el.appendChild(item.lbl); }
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
          const mapObj = window.Aetheria.Data && window.Aetheria.Data.Maps && window.Aetheria.Data.Maps.getMap(s.currentZone);
          const rigged = Boolean(s && s.riggedCliffs && s.riggedCliffs[s.currentZone]);
          const cryptOpen = Boolean(s && s.unlockedCrypts && s.unlockedCrypts[s.currentZone]);

          if (mapObj) {
            renderCompassMinimap(mapObj, s);
          }

          Object.keys(this.domPool.decos || {}).forEach(function(k) {
            const item = Ren.domPool.decos[k];
            if (!item || !item.data) return;
            const d = item.data;

            if (d.isCliffLadderSpot) {
              if (item.img && S) item.img.src = S.getDataURL(rigged ? "rope_ladder" : "cliff_stake");
              if (item.lbl) {
                item.lbl.style.display = "block";
                item.lbl.className = "dom-label ladder-spot-lbl";
                item.lbl.innerText = rigged ? (s.onHighland ? "🧗爬下懸崖" : "🧗爬上高台") : "🧗架設繩梯";
              }
            } else if (d.isCryptEntrance) {
              if (item.img && S) item.img.src = S.getDataURL(cryptOpen ? "crypt_door_open" : "crypt_door_locked");
              if (item.lbl) {
                item.lbl.style.display = "block";
                item.lbl.className = "dom-label crypt-door-lbl";
                item.lbl.innerText = cryptOpen ? "🏛️地底遺跡(已開)" : "🔒地底遺跡[需鑰匙]";
              }
            } else if (d.isExplorePuzzleTablet && item.lbl) {
              item.lbl.style.display = "block";
              item.lbl.className = "dom-label puzzle-mech-lbl";
              item.lbl.innerText = "📜古碑謎語";
            } else if (d.isPuzzleOrderBrazier) {
              if (item.img && S) item.img.src = S.getDataURL(d.lit ? "brazier_on" : "brazier_off");
              if (item.lbl) {
                item.lbl.style.display = "block";
                item.lbl.className = "dom-label " + (d.lit ? "puzzle-mech-on" : "puzzle-mech-lbl");
                item.lbl.innerText = (d.lit ? "🔥" : "") + d.brazierLabel;
              }
            } else if (d.isPuzzleRotateStatue) {
              if (item.img && S) item.img.src = S.getDataURL("ancient_statue");
              if (item.lbl) {
                const matched = (d.curDir === d.targetDir);
                item.lbl.style.display = "block";
                item.lbl.className = "dom-label " + (matched ? "puzzle-mech-on" : "puzzle-mech-lbl");
                item.lbl.innerText = d.statueName + ":" + DIR_SYMBOLS[d.curDir || 0];
              }
            } else if (d.isPuzzleToggleLever) {
              if (item.img && S) item.img.src = S.getDataURL(d.leverOn ? "lever_on" : "lever_off");
              if (item.lbl) {
                item.lbl.style.display = "block";
                item.lbl.className = "dom-label " + (d.leverOn ? "puzzle-mech-on" : "puzzle-mech-lbl");
                item.lbl.innerText = "拉桿" + (d.leverIdx + 1) + (d.leverOn ? "[🟢開]" : "[🔴關]");
              }
            }
          });

          Object.keys(this.domPool.nodes || {}).forEach(function(nId) {
            const item = Ren.domPool.nodes[nId];
            if (!item || !item.data || !item.lbl) return;
            const n = item.data;
            if (n.opened || (n.isBuriedSpot && s.dugSpots && s.dugSpots[n.id])) {
              item.el.style.display = "none";
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
      injectSurvivalRpgStyles();
      registerSurvivalRpgSprites();
      registerSrpgDataIntoGame();
      mountGuaranteedCompassWidget();
      hookSystemsForHighlandsAndWorkshop();

      const Maps = window.Aetheria.Data && window.Aetheria.Data.Maps;
      if (Maps && Maps.getMap) {
        const camp = Maps.getMap("camp_hub");
        if (camp) adjustCampTentsUpward(camp);
        Object.keys(HIGHLAND_ZONES).forEach(function(zId) {
          const m = Maps.getMap(zId);
          if (m) { m._highlandInjectedToken = null; injectHighlandCliffIntoMap(m); }
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
      console.error("Survival RPG All-Maps Fix v11.4 init error:", err);
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
