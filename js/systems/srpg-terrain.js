/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 地貌渲染、懸崖遺跡生成與圓形羅盤模組 (srpg-terrain.js - v14.0)
 * 【File 2 / 4】負責：6大差異化地貌自癒繪製、懸崖/山洞/地底遺跡注入、木橋對齊、圓形羅盤小地圖
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.SRPG = window.Aetheria.SRPG || {};

(function() {
  const SRPG = window.Aetheria.SRPG;

  let cachedCompassCanvas = null;
  let cachedTerrainCanvas = null;
  let cachedTerrainZoneId = "";
  let lastMinimapHeroX = -999;
  let lastMinimapHeroY = -999;
  let lastMinimapZone = "";

  const grottoMapsCache = {};
  const cryptMapsCache = {};

  const terrain = {};
  SRPG.terrain = terrain;

  // ================= 1. 移除舊版黑框小地圖 ＆ 掛載圓形羅盤與指引標籤 =================
  terrain.hideLegacyBlackMinimap = function() {
    const upper = document.getElementById("upper-screen");
    if (!upper) return;
    const upperRect = upper.getBoundingClientRect();

    const containers = [upper, document.getElementById("hud-overlay")].filter(Boolean);
    containers.forEach(function(parent) {
      Array.from(parent.children).forEach(function(ch) {
        if (!ch || ch.id === "srpg-compass-widget" || ch.id === "srpg-chain-tracker" ||
            ch.id === "world-viewport" || ch.id === "hud-overlay" || ch.id === "hud-hearts-box" ||
            ch.id === "weather-fx-layer" || ch.id === "sleep-transition-overlay") {
          return;
        }
        const r = ch.getBoundingClientRect();
        const isBottomLeftMini =
          r.width > 25 && r.width < 145 && r.height > 20 && r.height < 120 &&
          (r.left - upperRect.left) < 45 && (upperRect.bottom - r.bottom) < 45;

        if (ch.id === "minimap-box" || ch.id === "minimap" || ch.id === "minimap-canvas" || isBottomLeftMini) {
          ch.style.setProperty("display", "none", "important");
          ch.style.setProperty("visibility", "hidden", "important");
          ch.style.setProperty("left", "-9999px", "important");
          ch.style.setProperty("pointer-events", "none", "important");
        }
      });
    });
  };

  terrain.mountGuaranteedCompassWidget = function() {
    terrain.hideLegacyBlackMinimap();
    if (SRPG.ui && SRPG.ui.lockLowerScreenControlsPosition) {
      SRPG.ui.lockLowerScreenControlsPosition();
    }

    const upper = document.getElementById("upper-screen");
    if (!upper) return null;

    if (!document.getElementById("srpg-chain-tracker")) {
      const tracker = document.createElement("div");
      tracker.id = "srpg-chain-tracker";
      tracker.onclick = function(ev) {
        ev.stopPropagation();
        if (window.Aetheria.Audio && window.Aetheria.Audio.sfxTalkBlip) window.Aetheria.Audio.sfxTalkBlip();
        if (window.Aetheria.HighlandsWorkshop) window.Aetheria.HighlandsWorkshop.openZoneStoryChainModal();
      };
      upper.appendChild(tracker);
    }

    if (cachedCompassCanvas && document.body.contains(cachedCompassCanvas)) {
      return cachedCompassCanvas;
    }

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
    cachedCompassCanvas = canvas;
    return canvas;
  };

  // ================= 2. 6 大差異化自然地貌自癒繪製引擎 =================
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

  function drawUniqueZoneLandmarkOnCanvas(ctx, mapObj, W, H) {
    const zId = mapObj.id;

    if (zId === "zone1_forest") {
      ctx.fillStyle = "#2d4c2b";
      ctx.beginPath(); ctx.ellipse(420, 540, 95, 65, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#3c1642";
      ctx.beginPath(); ctx.ellipse(420, 540, 62, 38, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#5ac54f"; ctx.lineWidth = 2;
      ctx.strokeRect(165, 815, 130, 130);
    } else if (zId === "cave1_mushroom") {
      ctx.fillStyle = "#102542";
      ctx.beginPath();
      ctx.moveTo(0, 560);
      ctx.bezierCurveTo(380, 490, 680, 660, W, 540);
      ctx.lineTo(W, 600);
      ctx.bezierCurveTo(680, 720, 380, 550, 0, 620);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#38b6ff";
      ctx.beginPath(); ctx.ellipse(860, 640, 75, 45, 0, 0, Math.PI * 2); ctx.fill();
    } else if (zId === "zone2_canyon") {
      for (let r = 110; r >= 25; r -= 25) {
        ctx.fillStyle = (r % 50 === 0) ? "#b07d3b" : "#e0b97d";
        ctx.beginPath(); ctx.ellipse(720, 540, r * 1.3, r * 0.85, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = "#b5833d";
      ctx.fillRect(150, 800, 160, 160);
      ctx.strokeStyle = "#ffd166"; ctx.lineWidth = 3;
      ctx.strokeRect(154, 804, 152, 152);
    } else if (zId === "zone3_coast") {
      ctx.fillStyle = "#e6c88c";
      ctx.beginPath(); ctx.ellipse(760, 580, 210, 125, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#1d5eb8";
      ctx.beginPath(); ctx.ellipse(760, 580, 175, 95, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#38b6ff";
      ctx.beginPath(); ctx.ellipse(750, 575, 130, 65, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#e6c88c";
      ctx.beginPath(); ctx.ellipse(690, 565, 36, 22, 0, 0, Math.PI * 2); ctx.fill();
    } else if (zId === "zone4_snow") {
      ctx.fillStyle = "#7bdff2";
      ctx.beginPath(); ctx.ellipse(700, 540, 195, 110, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#b2f7ef";
      ctx.beginPath(); ctx.ellipse(695, 535, 155, 82, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(580, 520); ctx.lineTo(660, 550); ctx.lineTo(740, 510); ctx.lineTo(810, 560);
      ctx.stroke();
    } else if (zId === "zone5_volcano") {
      ctx.fillStyle = "#1f0b08";
      ctx.beginPath(); ctx.ellipse(720, 560, 175, 105, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#e03c4b";
      ctx.beginPath(); ctx.ellipse(720, 560, 135, 75, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffd166";
      ctx.beginPath(); ctx.ellipse(720, 560, 65, 35, 0, 0, Math.PI * 2); ctx.fill();
      for (let sx = 600; sx <= 840; sx += 48) {
        ctx.fillStyle = "#475569";
        ctx.fillRect(sx - 16, 544, 32, 32);
      }
    } else if (zId === "zone6_sky") {
      ctx.fillStyle = "#191233";
      ctx.beginPath(); ctx.ellipse(720, 550, 180, 100, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#e0aaff"; ctx.lineWidth = 3;
      ctx.strokeRect(590, 480, 260, 140);
      ctx.fillStyle = "#f5eedc";
      ctx.beginPath(); ctx.arc(720, 550, 58, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#f5b700"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(720, 550, 54, 0, Math.PI * 2); ctx.stroke();
    }
  }

  terrain.paintTerrainOntoContext = function(ctx, mapObj, W, H, built) {
    const db = SRPG.db;
    const pal = db.KENNEY_PALETTES[mapObj.theme] || db.KENNEY_PALETTES.forest;
    const hasHighland = Boolean(db.HIGHLAND_ZONES[mapObj.id]);
    const cols = Math.ceil(W / 16);
    const rows = Math.ceil(H / 16);

    ctx.fillStyle = pal.bg1;
    ctx.fillRect(0, 0, W, H);

    for (let ty = 0; ty < rows; ty++) {
      for (let tx = 0; tx < cols; tx++) {
        const px = tx * 16;
        const py = ty * 16;
        const r = SRPG.utils.seededHash(tx, ty, 11);
        if (r >= 0.45) {
          ctx.fillStyle = (r < 0.80) ? pal.bg2 : pal.bg3;
          ctx.fillRect(px, py, 16, 16);
        }

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

    drawUniqueZoneLandmarkOnCanvas(ctx, mapObj, W, H);

    if (mapObj.hasRiver) {
      const rx = mapObj.riverX || 1030;
      ctx.fillStyle = pal.bank;
      ctx.fillRect(rx - 6, 0, 52, H);
      ctx.fillStyle = pal.river;
      ctx.fillRect(rx, 0, 40, H);
      ctx.fillStyle = pal.riverHi;
      ctx.fillRect(rx + 6, 0, 4, H);

      const bridgeY = SRPG.data.getMapBridgeY(mapObj);
      const bx = rx - 10;
      const bw = 60;
      const by = bridgeY - 34;
      const bh = 68;

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
  };

  terrain.renderKenneyNaturalTerrainCanvas = function(mapObj, terrainLayer) {
    if (!mapObj || !terrainLayer) return;
    if (mapObj.id === "ocean_sea") {
      cachedTerrainCanvas = null;
      cachedTerrainZoneId = "ocean_sea";
      return;
    }

    const oldCanvases = terrainLayer.querySelectorAll(".kenney-terrain-canvas");
    oldCanvases.forEach(function(oc) {
      oc.width = 0;
      oc.height = 0;
      oc.remove();
    });

    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
    const W = mapObj.width || 1200;
    const H = mapObj.height || 680;
    const built = SRPG.data.isMapBridgeBuilt(mapObj, s);

    const canvas = document.createElement("canvas");
    canvas.className = "kenney-terrain-canvas";
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    const ctx = canvas.getContext("2d");
    terrain.paintTerrainOntoContext(ctx, mapObj, W, H, built);

    cachedTerrainCanvas = canvas;
    cachedTerrainZoneId = mapObj.id;
    lastMinimapZone = "";
    terrainLayer.insertBefore(canvas, terrainLayer.firstChild);
  };

  terrain.ensureActiveTerrainCanvas = function(mapObj) {
    if (!mapObj || mapObj.id === "ocean_sea") return null;
    const terrainLayer = document.getElementById("world-terrain-layer");
    if (!terrainLayer) return cachedTerrainCanvas;

    const existing = terrainLayer.querySelector(".kenney-terrain-canvas");
    if (!existing || !cachedTerrainCanvas || cachedTerrainZoneId !== mapObj.id || cachedTerrainCanvas.width === 0) {
      terrain.renderKenneyNaturalTerrainCanvas(mapObj, terrainLayer);
      terrain.syncDomRiverBridge(mapObj, terrainLayer);
    }
    return cachedTerrainCanvas;
  };

  terrain.syncDomRiverBridge = function(mapObj, terrainLayer) {
    if (!mapObj || !terrainLayer || !mapObj.hasRiver) return;
    const bridgeY = SRPG.data.getMapBridgeY(mapObj);
    const rx = mapObj.riverX || 1030;
    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
    const built = SRPG.data.isMapBridgeBuilt(mapObj, s);
    const pal = SRPG.db.KENNEY_PALETTES[mapObj.theme] || SRPG.db.KENNEY_PALETTES.forest;

    const nativeBridges = terrainLayer.querySelectorAll(".dom-bridge");
    nativeBridges.forEach(function(nb) {
      nb.style.top = bridgeY + "px";
      nb.style.transform = "translateY(-50%)";
      nb.style.zIndex = "6";
    });

    let bridgeEl = terrainLayer.querySelector(".srpg-dom-river-bridge");
    if (!bridgeEl) {
      bridgeEl = document.createElement("div");
      bridgeEl.className = "srpg-dom-river-bridge";
      terrainLayer.appendChild(bridgeEl);
    }

    const bw = 58, bh = 68;
    bridgeEl.style.cssText =
      "position:absolute; left:" + (rx - 9) + "px; top:" + (bridgeY - 34) + "px; " +
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
  };

  // ================= 3. 羅盤小地圖 ＆ 採集粒子特效 =================
  terrain.drawTreasureXMarkerOnCanvas = function(ctx, x, y, radius) {
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
  };

  terrain.renderCompassMinimap = function(mapObj, s, forceRedraw) {
    if (!mapObj || !s) return;

    if (SRPG.ui && SRPG.ui.updateInlinePuzzleGuideInQuestBox) {
      SRPG.ui.updateInlinePuzzleGuideInQuestBox();
    }

    const tracker = document.getElementById("srpg-chain-tracker");
    if (tracker) {
      const prog = SRPG.data.getZoneStoryProgress(mapObj.id, s);
      if (prog) {
        SRPG.utils.setDisplayIfChanged(tracker, "block");
        SRPG.utils.setClassIfChanged(tracker, prog.allDone ? "chain-done" : "");
        SRPG.utils.setTextIfChanged(
          tracker,
          prog.allDone
            ? ("🌟解題全滿 (" + prog.doneCount + "/5)")
            : ("🎯解題任務指引: " + prog.doneCount + "/5")
        );
      } else {
        SRPG.utils.setDisplayIfChanged(tracker, "none");
      }
    }

    const activeTerrain = terrain.ensureActiveTerrainCanvas(mapObj);

    const hx = s.heroX || 300;
    const hy = s.heroY || 240;
    if (!forceRedraw && lastMinimapZone === mapObj.id && Math.hypot(hx - lastMinimapHeroX, hy - lastMinimapHeroY) < 4) {
      return;
    }
    lastMinimapHeroX = hx;
    lastMinimapHeroY = hy;
    lastMinimapZone = mapObj.id;

    const mmCanvas = cachedCompassCanvas || terrain.mountGuaranteedCompassWidget();
    if (!mmCanvas) return;

    const ctx = mmCanvas.getContext("2d");
    ctx.clearRect(0, 0, 96, 96);
    ctx.fillStyle = "#1d5eb8";
    ctx.fillRect(0, 0, 96, 96);

    const viewSpan = 680;
    const sx = hx - viewSpan / 2;
    const sy = hy - viewSpan / 2;
    const scale = 96 / viewSpan;

    if (activeTerrain) {
      ctx.drawImage(activeTerrain, sx, sy, viewSpan, viewSpan, 0, 0, 96, 96);
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
        terrain.drawTreasureXMarkerOnCanvas(ctx, nx, ny, 4.5);
      } else if (n.isToolGateObstacle && !(s.clearedToolGates && s.clearedToolGates[n.id])) {
        ctx.fillStyle = "#ff758f";
        ctx.fillRect(nx - 3, ny - 3, 6, 6);
      } else if (n.type === "chest") {
        ctx.fillStyle = "#f5b700";
        ctx.fillRect(nx - 2.5, ny - 2.5, 5, 5);
      }
    });

    (mapObj.portals || []).forEach(function(p) {
      const px = (p.x - sx) * scale;
      const py = (p.y - sy) * scale;
      if (px >= -4 && px <= 100 && py >= -4 && py <= 100) {
        ctx.fillStyle = "#38b6ff";
        ctx.fillRect(px - 2.5, py - 2.5, 5, 5);
      }
    });

    (mapObj.monsters || []).forEach(function(m) {
      if (m.alive === false || !m.isBoss) return;
      const mx = (m.x - sx) * scale;
      const my = (m.y - sy) * scale;
      if (mx >= -4 && mx <= 100 && my >= -4 && my <= 100) {
        ctx.beginPath(); ctx.arc(mx, my, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#e03c4b"; ctx.fill();
      }
    });

    ctx.beginPath();
    ctx.arc(48, 48, 4.2, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#141013";
    ctx.stroke();
  };

  terrain.spawnHarvestParticles = function(nodeX, nodeY, colorHex) {
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
  };

  // ================= 4. 營地帳篷、懸崖高台、岩壁山洞與地底遺跡生成 =================
  terrain.adjustCampTentsUpward = function(campMap) {
    if (!campMap || campMap.id !== "camp_hub") return campMap;
    const token = campMap._refreshToken || "init";
    if (campMap._campTentsAdjustedToken === token) return campMap;
    campMap._campTentsAdjustedToken = token;

    campMap.decos = (campMap.decos || []).filter(function(d) {
      return !d.isCampHerbFarm && !d.isCampFishTrap && !d.isMuseumBuilding && !d.isTrainingDummy;
    });
    campMap.portals = (campMap.portals || []).filter(function(p) {
      return p.id !== "p_enter_museum";
    });

    (campMap.decos || []).forEach(function(d) {
      const spr = String(d.sprite || "");
      if (d.id === "deco_hero_tent_ext" || spr.indexOf("tent") !== -1 || (d.y !== undefined && d.y <= 95 && (d.w >= 40 || d.h >= 36))) {
        d.y = 14;
        d.solid = false;
      }
    });

    (campMap.portals || []).forEach(function(p) {
      if (p.targetZone === "tent_guild")      { p.y = 52; p.name = "公會帳篷"; }
      else if (p.targetZone === "tent_hero")  { p.y = 52; p.name = "主角帳篷"; }
      else if (p.targetZone === "tent_forge") { p.y = 52; p.name = "鐵匠帳篷"; }
    });

    if (campMap.trees) {
      campMap.trees = campMap.trees.filter(function(t) {
        return !(t.y < 85 && ((t.x >= 60 && t.x <= 185) || (t.x >= 255 && t.x <= 365) || (t.x >= 435 && t.x <= 565)));
      });
    }

    const Maps = window.Aetheria.Data && window.Aetheria.Data.Maps;
    if (Maps && Maps.getMap) {
      ["tent_guild", "tent_hero", "tent_forge"].forEach(function(tZone) {
        const tm = Maps.getMap(tZone);
        if (tm && tm.portals) {
          tm.portals.forEach(function(ep) {
            if (ep.targetZone === "camp_hub") ep.targetY = 96;
          });
        }
      });
    }
    return campMap;
  };

  function injectExplorationPuzzlesIntoMap(mapObj) {
    const db = SRPG.db;
    const pCfg = db.ZONE_EXPLORE_PUZZLES[mapObj.id];
    if (!pCfg) return;
    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
    const solved = Boolean(s.solvedExplorePuzzles && s.solvedExplorePuzzles[mapObj.id]);
    const chestClaimed = Boolean(s.claimedExplorePuzzleChests && s.claimedExplorePuzzleChests[mapObj.id]);
    const cx = pCfg.cx, cy = pCfg.cy;

    mapObj.dirtBlobs.push({ cx: cx, cy: cy, rx: 105, ry: 90, isExpandedBlob: true });

    mapObj.decos.push({
      id: "exp_puz_tablet_" + mapObj.id,
      x: cx - 72, y: cy - 62, sprite: "seal_pillar_on", w: 26, h: 30, solid: false,
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
          x: cx + it.dx, y: cy + it.dy, sprite: solved ? "brazier_on" : "brazier_off", w: 26, h: 28, solid: false,
          isHighlandElement: true, isPuzzleOrderBrazier: true, lit: solved, orderNum: it.order, brazierLabel: it.label, zoneId: mapObj.id
        });
      });
    } else if (pCfg.type === "statue_rotate") {
      pCfg.statues.forEach(function(st, idx) {
        const curDir = solved ? st.targetDir : st.initDir;
        mapObj.decos.push({
          id: "exp_puz_statue_" + mapObj.id + "_" + idx,
          x: cx + st.dx, y: cy + st.dy, sprite: "ancient_statue", w: 28, h: 30, solid: false,
          isHighlandElement: true, isPuzzleRotateStatue: true, curDir: curDir, targetDir: st.targetDir, statueName: st.name, zoneId: mapObj.id
        });
      });
    } else if (pCfg.type === "lever_toggle") {
      const initStates = solved ? [true, true, true] : [false, false, false];
      [-56, 0, 56].forEach(function(dx, idx) {
        const isOn = initStates[idx];
        mapObj.decos.push({
          id: "exp_puz_lever_" + mapObj.id + "_" + idx,
          x: cx + dx, y: cy + 56, sprite: isOn ? "lever_on" : "lever_off", w: 26, h: 26, solid: false,
          isHighlandElement: true, isPuzzleToggleLever: true, leverIdx: idx, leverOn: isOn, zoneId: mapObj.id
        });
      });
    }

    const gateList = db.ZONE_TOOL_GATE_OBSTACLES[mapObj.id] || [];
    gateList.forEach(function(gt) {
      if (s.clearedToolGates && s.clearedToolGates[gt.id]) return;
      mapObj.nodes.push({
        id: gt.id, x: gt.x, y: gt.y, type: "crystal", giveKey: "cryptKey", reqToolLv: 0,
        isHighlandOre: true, isToolGateObstacle: true, gateCfg: gt, gateSprite: gt.sprite,
        name: gt.name, opened: false
      });
    });
  }

  terrain.buildCliffGrottoMap = function(parentZoneId) {
    const cfg = SRPG.db.HIGHLAND_ZONES[parentZoneId] || SRPG.db.HIGHLAND_ZONES.zone1_forest;
    const matsDB = (window.Aetheria.Data && window.Aetheria.Data.MATERIALS) || {};
    const parentMap = (window.Aetheria.Data && window.Aetheria.Data.Maps && window.Aetheria.Data.Maps.getMap(parentZoneId)) || { recLv: 3 };
    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};

    const grottoPool = cfg.grottoOres.slice();
    if (parentZoneId === "zone5_volcano") {
      grottoPool.push(SRPG.utils.findMatKeyByNameKeyword("龍鱗", "obsidian"));
      grottoPool.push(SRPG.utils.findMatKeyByNameKeyword("熔核", "starIron"));
    } else if (parentZoneId === "zone3_coast") {
      grottoPool.push(SRPG.utils.findMatKeyByNameKeyword("海妖", "coral"));
    }

    const nodes = [];
    [{ x: 130, y: 110 }, { x: 240, y: 95 }, { x: 350, y: 110 }, { x: 145, y: 195 }, { x: 335, y: 195 }, { x: 240, y: 145 }].forEach(function(pt, idx) {
      const giveKey = grottoPool[idx % grottoPool.length];
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
  };

  terrain.buildAncientCryptMap = function(parentZoneId) {
    const cfg = SRPG.db.HIGHLAND_ZONES[parentZoneId] || SRPG.db.HIGHLAND_ZONES.zone1_forest;
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
        type: "boss", isBoss: (parentZoneId === "zone5_volcano"), isShiny: true, isCryptGuardian: true, alive: true
      }],
      portals: [{ id: "p_exit_crypt_" + parentZoneId, name: "離開地底遺跡 ▾", x: 280, y: 318, targetZone: parentZoneId, targetX: 935, targetY: 1055, icon: "stairs" }]
    };
  };

  terrain.getGrottoMap = function(zoneId) {
    if (!grottoMapsCache[zoneId]) {
      grottoMapsCache[zoneId] = terrain.buildCliffGrottoMap(zoneId.replace("grotto_", ""));
    }
    return grottoMapsCache[zoneId];
  };

  terrain.getCryptMap = function(zoneId) {
    if (!cryptMapsCache[zoneId]) {
      cryptMapsCache[zoneId] = terrain.buildAncientCryptMap(zoneId.replace("crypt_", ""));
    }
    return cryptMapsCache[zoneId];
  };

  terrain.clearSubMapsCache = function() {
    Object.keys(grottoMapsCache).forEach(function(k) { delete grottoMapsCache[k]; });
    Object.keys(cryptMapsCache).forEach(function(k) { delete cryptMapsCache[k]; });
  };

  terrain.isInsideHighlandPlateau = function(x, y) {
    const inTopWing   = (x >= 395 && x <= 895 && y >= 802 && y <= 920);
    const inRightWing = (x >= 715 && x <= 895 && y >= 915 && y <= 1058);
    return inTopWing || inRightWing;
  };

  terrain.isBlockedByCliffFromLowland = function(x, y) {
    if (x >= 385 && x <= 710 && y >= 795 && y <= 965) return true;
    if (x >= 705 && x <= 910 && y >= 795 && y <= 1098) return true;
    return false;
  };

  terrain.injectHighlandCliffIntoMap = function(mapObj) {
    if (!mapObj || !SRPG.db.HIGHLAND_ZONES[mapObj.id]) return mapObj;
    const token = mapObj._refreshToken || "init";
    if (mapObj._highlandInjectedToken === token) return mapObj;
    mapObj._highlandInjectedToken = token;

    const cfg = SRPG.db.HIGHLAND_ZONES[mapObj.id];
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
      mapObj.monsters = mapObj.monsters.filter(function(m) { return !m.isVolcanoHelperSubBoss; });
      mapObj.monsters.forEach(function(m) {
        if (!m.isBoss && terrain.isBlockedByCliffFromLowland(m.x, m.y)) {
          m.x = 240; m.y = 720; m.homeX = 240; m.homeY = 720;
        }
      });

      if (mapObj.id === "zone5_volcano") {
        let volcanoBoss = mapObj.monsters.find(function(m) { return m && m.isBoss; });
        if (volcanoBoss) {
          volcanoBoss.name = "守關領主・紅蓮火山龍皇";
          volcanoBoss.x = 1120; volcanoBoss.y = 240; volcanoBoss.homeX = 1120; volcanoBoss.homeY = 240;
        } else {
          mapObj.monsters.push({
            id: "boss_zone5_volcano_dragon", name: "守關領主・紅蓮火山龍皇",
            lv: (mapObj.recLv || 22) + 3, x: 1120, y: 240, homeX: 1120, homeY: 240,
            type: "boss", isBoss: true, alive: true
          });
        }

        mapObj.monsters.push({
          id: "volcano_flame_core_subboss_" + token, name: "★紅蓮炎魔將[掉熔核]",
          lv: mapObj.recLv || 22, x: 780, y: 420, homeX: 780, homeY: 420,
          type: "skull", isBoss: false, isShiny: true, isVolcanoHelperSubBoss: true, alive: true
        });
      }
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

    const plateauOres = cfg.ores.slice();
    if (mapObj.id === "zone5_volcano") {
      plateauOres[1] = SRPG.utils.findMatKeyByNameKeyword("龍鱗", "obsidian");
      plateauOres[2] = SRPG.utils.findMatKeyByNameKeyword("熔核", "starIron");
    }

    [{ x: 485, y: 845 }, { x: 655, y: 870 }, { x: 785, y: 940 }, { x: 785, y: 1015 }].forEach(function(pt, idx) {
      const giveKey = plateauOres[idx % plateauOres.length];
      const mInfo = matsDB[giveKey] || { name: giveKey };
      mapObj.nodes.push({
        id: "hl_ore_" + mapObj.id + "_" + idx + "_" + token,
        x: pt.x, y: pt.y, type: "crystal", giveKey: giveKey, reqTool: "pickaxe", reqToolLv: 0,
        perfect: true, isHighlandOre: true, isClusterBoulder: true, reqHighland: true, name: "高台" + mInfo.name, opened: false
      });
    });

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
      { x: 150,  y: 690, key: "copperOre", type: "crystal" },
      { x: 310,  y: 710, key: "tinOre",    type: "crystal" },
      { x: 1240, y: 260, key: "quartz",    type: "crystal" },
      { x: 1380, y: 440, key: "coal",      type: "crystal" },
      { x: 1320, y: 760, key: "rockSalt",  type: "crystal" },
      { x: 1220, y: 960, key: "copperOre", type: "crystal" }
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
  };
})();
