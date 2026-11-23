/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 六大差異化物理骨架與環境互動模組 (srpg-biomes.js - v14.5)
 * 【File 8 / 8】獨立外掛模組
 * v14.5 修正：
 *   1. (#1) L型與U型高台交界處重疊 16px，徹底消除高台內部的 10px 隱形牆
 *   2. (#6) 雙繩梯互動改為搜尋距離主角「最近」的繩梯，避免靠近南梯卻被送回北梯
 *   3. (#7) 新增探索面板活躍偵測，打開選單/工坊/戰報或戰鬥期間暫停火山噴氣扣血與環境位移
 *   4. (#2) 防卡檢定前同步核對跨區切換，確保高台傳送至新地圖時絕不誤觸高台定位
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.SRPG = window.Aetheria.SRPG || {};

(function() {
  const SRPG = window.Aetheria.SRPG;

  // ================= 1. 7 大區域專屬物理骨架與環境互動設定 =================
  // ★ v14.5 修正 #1：相連矩形交界處重疊 16px，確保 pad=5 碰撞界內完全連通無空氣牆
  const BIOME_LAYOUTS = {
    zone1_forest: {
      styleName: "東南L型高台・順風花谷",
      rects: [
        { x1: 400, y1: 800, x2: 896, y2: 912 },
        { x1: 720, y1: 896, x2: 896, y2: 1056 }
      ],
      ladders: [
        { x: 560, y: 800, side: "north", upX: 560, upY: 836, downX: 560, downY: 770 },
        { x: 624, y: 936, side: "south", upX: 624, upY: 884, downX: 624, downY: 982 }
      ],
      cave:   { x: 496, y: 944, exitX: 496, exitY: 992 },
      crypt:  { x: 944, y: 1015, exitX: 944, exitY: 1058 },
      puzzle: { cx: 230, cy: 880 },
      ores:   [ { x: 480, y: 850 }, { x: 655, y: 865 }, { x: 790, y: 945 }, { x: 790, y: 1015 } ],
      digs:   [
        { x: 265,  y: 625,  reqHighland: false },
        { x: 585,  y: 1045, reqHighland: false },
        { x: 565,  y: 860,  reqHighland: true  },
        { x: 1380, y: 620,  reqHighland: false }
      ],
      env: {
        type: "wind_petals",
        zones: [
          { cx: 340, cy: 710, rx: 120, ry: 48 },
          { cx: 740, cy: 480, rx: 130, ry: 46 }
        ]
      }
    },

    cave1_mushroom: {
      styleName: "西南雙層礦台・螢光菌泉（左右反轉）",
      rects: [
        { x1: 112, y1: 768, x2: 528, y2: 896 },
        { x1: 112, y1: 880, x2: 304, y2: 1008 }
      ],
      ladders: [
        { x: 352, y: 768, side: "north", upX: 352, upY: 808, downX: 352, downY: 736 },
        { x: 416, y: 920, side: "south", upX: 416, upY: 866, downX: 416, downY: 966 }
      ],
      cave:   { x: 352, y: 928, exitX: 352, exitY: 974 },
      crypt:  { x: 608, y: 1010, exitX: 608, exitY: 1050 },
      puzzle: { cx: 810, cy: 880 },
      ores:   [ { x: 200, y: 825 }, { x: 435, y: 830 }, { x: 195, y: 945 }, { x: 255, y: 965 } ],
      digs:   [
        { x: 640,  y: 710,  reqHighland: false },
        { x: 440,  y: 1035, reqHighland: false },
        { x: 310,  y: 830,  reqHighland: true  },
        { x: 1320, y: 620,  reqHighland: false }
      ],
      env: {
        type: "healing_spring",
        zones: [
          { cx: 860, cy: 640, rx: 82, ry: 50 },
          { cx: 615, cy: 825, rx: 72, ry: 46 }
        ]
      }
    },

    zone2_canyon: {
      styleName: "中央巨型孤台・流沙漩渦",
      rects: [
        { x1: 352, y1: 704, x2: 768, y2: 848 }
      ],
      ladders: [
        { x: 560, y: 704, side: "north", upX: 560, upY: 742, downX: 560, downY: 672 },
        { x: 656, y: 872, side: "south", upX: 656, upY: 818, downX: 656, downY: 918 }
      ],
      cave:   { x: 480, y: 880, exitX: 480, exitY: 926 },
      crypt:  { x: 185, y: 950, exitX: 185, exitY: 995 },
      puzzle: { cx: 810, cy: 970 },
      ores:   [ { x: 425, y: 760 }, { x: 560, y: 780 }, { x: 695, y: 765 }, { x: 495, y: 815 } ],
      digs:   [
        { x: 200,  y: 720,  reqHighland: false },
        { x: 540,  y: 1035, reqHighland: false },
        { x: 625,  y: 775,  reqHighland: true  },
        { x: 1350, y: 600,  reqHighland: false }
      ],
      env: {
        type: "quicksand",
        zones: [
          { cx: 720, cy: 540, rx: 130, ry: 85 }
        ]
      }
    },

    zone3_coast: {
      styleName: "U型海灣雙翼懸崖・新月淺灘",
      rects: [
        { x1: 144, y1: 784, x2: 896, y2: 880 },
        { x1: 144, y1: 864, x2: 336, y2: 1024 },
        { x1: 704, y1: 864, x2: 896, y2: 1024 }
      ],
      ladders: [
        { x: 520, y: 784, side: "north", upX: 520, upY: 822, downX: 520, downY: 752 },
        { x: 520, y: 904, side: "south", upX: 520, upY: 854, downX: 520, downY: 948 }
      ],
      cave:   { x: 416, y: 912, exitX: 416, exitY: 958 },
      crypt:  { x: 948, y: 990, exitX: 948, exitY: 1038 },
      puzzle: { cx: 520, cy: 1015 },
      ores:   [ { x: 235, y: 940 }, { x: 245, y: 830 }, { x: 800, y: 830 }, { x: 800, y: 945 } ],
      digs:   [
        { x: 260,  y: 640,  reqHighland: false },
        { x: 685,  y: 720,  reqHighland: false },
        { x: 640,  y: 832,  reqHighland: true  },
        { x: 1360, y: 640,  reqHighland: false }
      ],
      env: {
        type: "tidal_shallows",
        zones: [
          { cx: 760, cy: 580, rx: 175, ry: 95 }
        ]
      }
    },

    zone4_snow: {
      styleName: "東南玄冰堡壘・永凍鏡湖溜冰場",
      rects: [
        { x1: 528, y1: 768, x2: 944, y2: 944 }
      ],
      ladders: [
        { x: 720, y: 768, side: "north", upX: 720, upY: 808, downX: 720, downY: 736 },
        { x: 784, y: 968, side: "south", upX: 784, upY: 916, downX: 784, downY: 1014 }
      ],
      cave:   { x: 640, y: 976, exitX: 640, exitY: 1024 },
      crypt:  { x: 185, y: 690, exitX: 185, exitY: 740 },
      puzzle: { cx: 260, cy: 960 },
      ores:   [ { x: 605, y: 825 }, { x: 845, y: 825 }, { x: 605, y: 895 }, { x: 845, y: 895 } ],
      digs:   [
        { x: 350,  y: 720,  reqHighland: false },
        { x: 480,  y: 1035, reqHighland: false },
        { x: 725,  y: 860,  reqHighland: true  },
        { x: 1360, y: 600,  reqHighland: false }
      ],
      env: {
        type: "ice_lake",
        zones: [
          { cx: 700, cy: 540, rx: 165, ry: 90 }
        ]
      }
    },

    zone5_volcano: {
      styleName: "西南黑曜石脊・間歇地熱噴氣口",
      rects: [
        { x1: 128, y1: 768, x2: 560, y2: 944 }
      ],
      ladders: [
        { x: 352, y: 768, side: "north", upX: 352, upY: 808, downX: 352, downY: 736 },
        { x: 432, y: 968, side: "south", upX: 432, upY: 916, downX: 432, downY: 1014 }
      ],
      cave:   { x: 272, y: 976, exitX: 272, exitY: 1024 },
      crypt:  { x: 640, y: 1035, exitX: 640, exitY: 1075 },
      puzzle: { cx: 830, cy: 930 },
      ores:   [ { x: 205, y: 825 }, { x: 455, y: 825 }, { x: 215, y: 895 }, { x: 455, y: 895 } ],
      digs:   [
        { x: 260,  y: 625,  reqHighland: false },
        { x: 560,  y: 1055, reqHighland: false },
        { x: 345,  y: 860,  reqHighland: true  },
        { x: 1380, y: 620,  reqHighland: false }
      ],
      env: {
        type: "lava_vents",
        vents: [
          { x: 575, y: 540, r: 36, offset: 0 },
          { x: 720, y: 455, r: 36, offset: 2500 },
          { x: 845, y: 585, r: 36, offset: 5000 }
        ]
      }
    },

    zone6_sky: {
      styleName: "中央星界聖台・光速星道與聖光陣",
      rects: [
        { x1: 352, y1: 784, x2: 832, y2: 928 }
      ],
      ladders: [
        { x: 592, y: 784, side: "north", upX: 592, upY: 822, downX: 592, downY: 752 },
        { x: 672, y: 952, side: "south", upX: 672, upY: 898, downX: 672, downY: 998 }
      ],
      cave:   { x: 512, y: 960, exitX: 512, exitY: 1006 },
      crypt:  { x: 925, y: 985, exitX: 925, exitY: 1030 },
      puzzle: { cx: 205, cy: 965 },
      ores:   [ { x: 435, y: 845 }, { x: 592, y: 865 }, { x: 745, y: 845 }, { x: 510, y: 890 } ],
      digs:   [
        { x: 240,  y: 650,  reqHighland: false },
        { x: 600,  y: 1050, reqHighland: false },
        { x: 675,  y: 855,  reqHighland: true  },
        { x: 1360, y: 620,  reqHighland: false }
      ],
      env: {
        type: "star_runway",
        runways: [
          { x1: 180, y1: 525, x2: 960, y2: 575 },
          { x1: 280, y1: 700, x2: 880, y2: 742 }
        ],
        sanctuary: { cx: 720, cy: 550, r: 58 }
      }
    }
  };

  const biomes = {
    LAYOUTS: BIOME_LAYOUTS,
    iceVx: 0,
    iceVy: 0,
    lastHealTick: 0,
    lastVentHitTime: 0,
    lastFootFxTime: 0,
    lastZoneId: "",
    envBadgeEl: null,
    ventDomPool: []
  };
  SRPG.biomes = biomes;

  biomes.getLayout = function(zoneId) {
    return BIOME_LAYOUTS[zoneId] || null;
  };

  function isPointInRects(x, y, rects, pad) {
    const p = pad || 0;
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      if (x >= r.x1 + p && x <= r.x2 - p && y >= r.y1 + p && y <= r.y2 - p) return true;
    }
    return false;
  }

  function isPointBlockedByLayout(x, y, layout) {
    if (!layout || !layout.rects) return false;
    for (let i = 0; i < layout.rects.length; i++) {
      const r = layout.rects[i];
      if (x >= r.x1 - 8 && x <= r.x2 + 8 && y >= r.y1 - 6 && y <= r.y2 + 44) return true;
    }
    return false;
  }

  function isInsideEllipse(x, y, z) {
    const dx = (x - z.cx) / Math.max(10, z.rx);
    const dy = (y - z.cy) / Math.max(10, z.ry);
    return (dx * dx + dy * dy) <= 1.0;
  }

  // ★ v14.5 修正 #7：偵測目前是否處於純探索畫面（若打開工坊/戰報/背包/戰鬥則暫停環境傷害與滑動）
  function isExplorePanelActive() {
    const modal = document.getElementById("panel-modal");
    if (modal && modal.offsetParent !== null) return false;

    const battle = document.getElementById("panel-battle");
    if (battle && battle.offsetParent !== null) return false;

    const explore = document.getElementById("panel-explore");
    if (explore && explore.offsetParent === null) return false;

    if (window.Aetheria.Battle && window.Aetheria.Battle.active) return false;
    return true;
  }

  // ================= 2. 注入環境互動狀態條與噴氣口樣式 =================
  function injectBiomeStyles() {
    if (document.getElementById("srpg-biomes-v145-styles")) return;
    const style = document.createElement("style");
    style.id = "srpg-biomes-v145-styles";
    style.textContent = `
      #srpg-env-badge {
        position: absolute; top: 56px; left: 8px; z-index: 19;
        background: rgba(20, 16, 19, 0.88); color: #ffd166;
        border: 1.5px solid #38b6ff; border-radius: 12px; padding: 2px 8px;
        font-size: 10px; font-weight: 900; pointer-events: none;
        box-shadow: 0 2px 5px rgba(0,0,0,0.8); display: none;
      }
      #srpg-env-badge.env-good { border-color: #5ac54f; color: #a3f7b5; background: rgba(18, 46, 30, 0.90); }
      #srpg-env-badge.env-warn { border-color: #ff595e; color: #ffb3ba; background: rgba(88, 20, 26, 0.92); }
      #srpg-env-badge.env-ice  { border-color: #8ce0ff; color: #ffffff; background: rgba(16, 48, 78, 0.90); }

      @keyframes srpgVentWarnPulse {
        0%, 100% { transform: translate(-50%, -50%) scale(0.88); opacity: 0.65; }
        50%      { transform: translate(-50%, -50%) scale(1.08); opacity: 1; }
      }
      @keyframes srpgVentBurst {
        0%, 100% { transform: translate(-50%, -50%) scale(0.96); }
        50%      { transform: translate(-50%, -50%) scale(1.18); }
      }
      .srpg-lava-vent {
        position: absolute; width: 68px; height: 48px; border-radius: 50%;
        pointer-events: none; z-index: 9; display: flex; align-items: center;
        justify-content: center; font-size: 11px; font-weight: 900; text-shadow: 1px 1px 0 #000;
      }
      .srpg-lava-vent.calm {
        transform: translate(-50%, -50%);
        background: radial-gradient(circle, rgba(31,11,8,0.65) 0%, transparent 72%);
        border: 1.5px dashed rgba(255, 209, 102, 0.3); color: transparent;
      }
      .srpg-lava-vent.warn {
        background: radial-gradient(circle, rgba(255,209,102,0.45) 0%, rgba(224,60,75,0.22) 70%);
        border: 2.5px solid #ffd166; color: #ffd166;
        animation: srpgVentWarnPulse 0.45s ease-in-out infinite;
      }
      .srpg-lava-vent.erupt {
        background: radial-gradient(circle, #ffffff 0%, #ffd166 30%, #e03c4b 72%, transparent 100%);
        border: 3px solid #ff595e; color: #ffffff; box-shadow: 0 0 14px #e03c4b;
        animation: srpgVentBurst 0.22s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
  }

  // ================= 3. 同步更新解題指引資料庫與座標文字 =================
  function syncZoneDataWithNewLayouts() {
    const db = SRPG.db;
    if (!db) return;

    Object.keys(BIOME_LAYOUTS).forEach(function(zId) {
      const lay = BIOME_LAYOUTS[zId];
      if (db.ZONE_EXPLORE_PUZZLES && db.ZONE_EXPLORE_PUZZLES[zId]) {
        db.ZONE_EXPLORE_PUZZLES[zId].cx = lay.puzzle.cx;
        db.ZONE_EXPLORE_PUZZLES[zId].cy = lay.puzzle.cy;
      }

      const chain = db.ZONE_STORY_CHAINS && db.ZONE_STORY_CHAINS[zId];
      if (chain && Array.isArray(chain.tasks)) {
        const lad = lay.ladders[0];
        chain.tasks.forEach(function(t) {
          if (t.id === "cliff") {
            t.x = lad.x; t.y = lad.y;
            t.short = t.short.replace(/\(\d+,\s*\d+\)/g, "(" + lad.x + "," + lad.y + ")");
            t.detail = t.detail.replace(/\(x:\d+,\s*y:\d+\)/g, "(x:" + lad.x + ", y:" + lad.y + ")");
          } else if (t.id === "puzzle") {
            t.x = lay.puzzle.cx; t.y = lay.puzzle.cy;
            t.short = t.short.replace(/\(\d+,\s*\d+\)/g, "(" + lay.puzzle.cx + "," + lay.puzzle.cy + ")").replace("左下角", "機關區");
            t.detail = t.detail.replace(/\(x:\d+,\s*y:\d+\)/g, "(x:" + lay.puzzle.cx + ", y:" + lay.puzzle.cy + ")").replace("左下角", "機關區");
          } else if (t.id === "crypt" && zId !== "zone5_volcano") {
            t.x = lay.crypt.x; t.y = lay.crypt.y;
            t.short = t.short.replace(/\(\d+,\s*\d+\)/g, "(" + lay.crypt.x + "," + lay.crypt.y + ")");
            t.detail = t.detail.replace(/\(x:\d+,\s*y:\d+\)/g, "(x:" + lay.crypt.x + ", y:" + lay.crypt.y + ")").replace("東南角", "遺跡處");
          }
        });
      }
    });
  }

  // ================= 4. 繪製各區專屬物理骨架與環境互動地貌 =================
  function drawEnvZonesOnCanvas(ctx, mapObj, layout) {
    if (!layout || !layout.env) return;
    const env = layout.env;

    if (env.type === "wind_petals") {
      env.zones.forEach(function(z) {
        ctx.fillStyle = "rgba(134, 239, 172, 0.36)";
        ctx.beginPath(); ctx.ellipse(z.cx, z.cy, z.rx, z.ry, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#86efac"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(z.cx, z.cy, z.rx - 6, z.ry - 6, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = "#fef08a";
        for (let i = -3; i <= 3; i++) {
          ctx.fillRect(z.cx + i * 26, z.cy + ((i % 2 === 0) ? -10 : 12), 5, 5);
        }
      });
    } else if (env.type === "healing_spring") {
      env.zones.forEach(function(z) {
        ctx.fillStyle = "#1d4ed8";
        ctx.beginPath(); ctx.ellipse(z.cx, z.cy, z.rx, z.ry, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath(); ctx.ellipse(z.cx, z.cy, z.rx * 0.72, z.ry * 0.72, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#bae6fd";
        ctx.beginPath(); ctx.ellipse(z.cx - 8, z.cy - 6, z.rx * 0.32, z.ry * 0.32, 0, 0, Math.PI * 2); ctx.fill();
      });
    } else if (env.type === "star_runway") {
      (env.runways || []).forEach(function(rw) {
        ctx.fillStyle = "rgba(255, 209, 102, 0.34)";
        ctx.fillRect(rw.x1, rw.y1, rw.x2 - rw.x1, rw.y2 - rw.y1);
        ctx.strokeStyle = "#ffd166"; ctx.lineWidth = 2;
        ctx.strokeRect(rw.x1, rw.y1, rw.x2 - rw.x1, rw.y2 - rw.y1);
        ctx.fillStyle = "#ffffff";
        for (let sx = rw.x1 + 24; sx < rw.x2 - 20; sx += 56) {
          ctx.fillRect(sx, (rw.y1 + rw.y2) / 2 - 2, 16, 4);
        }
      });
    }
  }

  function paintCustomLayoutTerrain(ctx, mapObj, W, H, built) {
    const db = SRPG.db;
    const pal = db.KENNEY_PALETTES[mapObj.theme] || db.KENNEY_PALETTES.forest;
    const layout = BIOME_LAYOUTS[mapObj.id];
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

    const blobs = mapObj.dirtBlobs || [];
    function isPath(px, py) {
      const wave = Math.sin(px * 0.025) * 14 + Math.cos(py * 0.025) * 14;
      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];
        if (b.cx !== undefined && b.cy !== undefined) {
          const dx = (px - b.cx) / Math.max(20, (b.rx || 80) + wave);
          const dy = (py - b.cy) / Math.max(20, (b.ry || 60) + wave * 0.7);
          if (dx * dx + dy * dy <= 1.0) return true;
        } else if (b.x !== undefined && b.y !== undefined) {
          if (px >= b.x && px <= b.x + (b.w || 100) && py >= b.y && py <= b.y + (b.h || 80)) return true;
        }
      }
      return false;
    }

    for (let ty = 0; ty < rows; ty++) {
      for (let tx = 0; tx < cols; tx++) {
        const px = tx * 16 + 8;
        const py = ty * 16 + 8;
        if (!isPath(px, py)) continue;
        const x0 = tx * 16, y0 = ty * 16;
        ctx.fillStyle = pal.path;
        ctx.fillRect(x0, y0, 16, 16);
        ctx.fillStyle = pal.pathEdge;
        if (!isPath(px, py - 16)) ctx.fillRect(x0, y0, 16, 3);
        if (!isPath(px, py + 16)) ctx.fillRect(x0, y0 + 13, 16, 3);
        if (!isPath(px - 16, py)) ctx.fillRect(x0, y0, 3, 16);
        if (!isPath(px + 16, py)) ctx.fillRect(x0 + 13, y0, 3, 16);
      }
    }

    const zId = mapObj.id;
    if (zId === "zone1_forest") {
      ctx.fillStyle = "#2d4c2b"; ctx.beginPath(); ctx.ellipse(420, 540, 95, 65, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#3c1642"; ctx.beginPath(); ctx.ellipse(420, 540, 62, 38, 0, 0, Math.PI * 2); ctx.fill();
    } else if (zId === "cave1_mushroom") {
      ctx.fillStyle = "#102542";
      ctx.beginPath();
      ctx.moveTo(0, 560); ctx.bezierCurveTo(380, 490, 680, 660, W, 540);
      ctx.lineTo(W, 600); ctx.bezierCurveTo(680, 720, 380, 550, 0, 620); ctx.closePath(); ctx.fill();
    } else if (zId === "zone2_canyon") {
      for (let r = 115; r >= 25; r -= 25) {
        ctx.fillStyle = (r % 50 === 0) ? "#b07d3b" : "#e0b97d";
        ctx.beginPath(); ctx.ellipse(720, 540, r * 1.25, r * 0.82, 0, 0, Math.PI * 2); ctx.fill();
      }
    } else if (zId === "zone3_coast") {
      ctx.fillStyle = "#e6c88c"; ctx.beginPath(); ctx.ellipse(760, 580, 210, 125, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#1d5eb8"; ctx.beginPath(); ctx.ellipse(760, 580, 175, 95, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#38b6ff"; ctx.beginPath(); ctx.ellipse(750, 575, 130, 65, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#e6c88c"; ctx.beginPath(); ctx.ellipse(690, 565, 36, 22, 0, 0, Math.PI * 2); ctx.fill();
    } else if (zId === "zone4_snow") {
      ctx.fillStyle = "#7bdff2"; ctx.beginPath(); ctx.ellipse(700, 540, 195, 110, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#b2f7ef"; ctx.beginPath(); ctx.ellipse(695, 535, 155, 82, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(580, 520); ctx.lineTo(660, 550); ctx.lineTo(740, 510); ctx.lineTo(810, 560); ctx.stroke();
    } else if (zId === "zone5_volcano") {
      ctx.fillStyle = "#1f0b08"; ctx.beginPath(); ctx.ellipse(720, 560, 175, 105, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#e03c4b"; ctx.beginPath(); ctx.ellipse(720, 560, 135, 75, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffd166"; ctx.beginPath(); ctx.ellipse(720, 560, 65, 35, 0, 0, Math.PI * 2); ctx.fill();
      for (let sx = 600; sx <= 840; sx += 48) { ctx.fillStyle = "#475569"; ctx.fillRect(sx - 16, 544, 32, 32); }
    } else if (zId === "zone6_sky") {
      ctx.fillStyle = "#191233"; ctx.beginPath(); ctx.ellipse(720, 550, 180, 100, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#e0aaff"; ctx.lineWidth = 3; ctx.strokeRect(590, 480, 260, 140);
      ctx.fillStyle = "#f5eedc"; ctx.beginPath(); ctx.arc(720, 550, 58, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#f5b700"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(720, 550, 54, 0, Math.PI * 2); ctx.stroke();
    }

    drawEnvZonesOnCanvas(ctx, mapObj, layout);
    if (layout && layout.puzzle) {
      ctx.strokeStyle = pal.bridgeRail;
      ctx.lineWidth = 2;
      ctx.strokeRect(layout.puzzle.cx - 68, layout.puzzle.cy - 68, 136, 136);
    }

    if (mapObj.hasRiver) {
      const rx = mapObj.riverX || 1030;
      ctx.fillStyle = pal.bank; ctx.fillRect(rx - 6, 0, 52, H);
      ctx.fillStyle = pal.river; ctx.fillRect(rx, 0, 40, H);
      ctx.fillStyle = pal.riverHi; ctx.fillRect(rx + 6, 0, 4, H);

      const bridgeY = SRPG.data.getMapBridgeY(mapObj);
      const bx = rx - 10, bw = 60, by = bridgeY - 34, bh = 68;
      if (built) {
        ctx.fillStyle = "#141013"; ctx.fillRect(bx, by - 3, bw, bh + 6);
        ctx.fillStyle = pal.bridge; ctx.fillRect(bx + 2, by, bw - 4, bh);
        ctx.fillStyle = pal.bridgeRail; ctx.fillRect(bx, by - 2, bw, 5); ctx.fillRect(bx, by + bh - 3, bw, 5);
      } else {
        ctx.fillStyle = pal.bridge; ctx.fillRect(bx, by, 14, bh); ctx.fillRect(bx + bw - 14, by, 14, bh);
      }
    }

    if (layout && layout.rects) {
      let minX = W, maxX = 0, minY = H, maxY = 0;
      layout.rects.forEach(function(r) {
        if (r.x1 < minX) minX = r.x1;
        if (r.x2 > maxX) maxX = r.x2;
        if (r.y1 < minY) minY = r.y1;
        if (r.y2 > maxY) maxY = r.y2;
      });
      const tx0 = Math.max(0, Math.floor(minX / 16) - 1);
      const tx1 = Math.min(cols - 1, Math.ceil(maxX / 16) + 1);
      const ty0 = Math.max(0, Math.floor(minY / 16) - 1);
      const ty1 = Math.min(rows - 1, Math.ceil(maxY / 16) + 1);

      for (let ty = ty0; ty <= ty1; ty++) {
        for (let tx = tx0; tx <= tx1; tx++) {
          const px = tx * 16 + 8;
          const py = ty * 16 + 8;
          if (!isPointInRects(px, py, layout.rects, 0)) continue;

          const x0 = tx * 16, y0 = ty * 16;
          ctx.fillStyle = pal.cliffTop;
          ctx.fillRect(x0, y0, 16, 16);

          const pUp    = isPointInRects(px, py - 16, layout.rects, 0);
          const pDown  = isPointInRects(px, py + 16, layout.rects, 0);
          const pLeft  = isPointInRects(px - 16, py, layout.rects, 0);
          const pRight = isPointInRects(px + 16, py, layout.rects, 0);

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

      if (layout.cave) {
        const cx = layout.cave.x - 24;
        const cy = layout.cave.y - 28;
        ctx.fillStyle = pal.rockDark; ctx.fillRect(cx - 4, cy - 4, 56, 48);
        ctx.fillStyle = pal.rock2;    ctx.fillRect(cx, cy, 48, 44);
        ctx.fillStyle = "#09060a";    ctx.fillRect(cx + 6, cy + 8, 36, 36);
      }
    }
  }

  // ================= 5. 依各區專屬骨架重排懸崖物件、機關、山洞與地底遺跡 =================
  function applyCustomLayoutToInjectedMap(mapObj) {
    const layout = BIOME_LAYOUTS[mapObj.id];
    if (!layout) return;

    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
    const rigged = Boolean(s.riggedCliffs && s.riggedCliffs[mapObj.id]);
    const cryptUnlocked = Boolean(s.unlockedCrypts && s.unlockedCrypts[mapObj.id]);

    if (mapObj.trees) {
      mapObj.trees = mapObj.trees.filter(function(t) {
        if (t.isExpandedPerimeterTree) return true;
        if (isPointBlockedByLayout(t.x, t.y, layout)) return false;
        if (Math.hypot(t.x - layout.puzzle.cx, t.y - layout.puzzle.cy) < 115) return false;
        if (Math.hypot(t.x - layout.crypt.x, t.y - layout.crypt.y) < 75) return false;
        return true;
      });
    }

    mapObj.dirtBlobs = (mapObj.dirtBlobs || []).filter(function(b) { return !b.isExpandedBlob; });
    mapObj.dirtBlobs.push(
      { cx: layout.puzzle.cx, cy: layout.puzzle.cy, rx: 105, ry: 90, isExpandedBlob: true },
      { cx: layout.cave.exitX, cy: layout.cave.exitY + 12, rx: 130, ry: 55, isExpandedBlob: true },
      { cx: layout.crypt.x, cy: layout.crypt.y + 10, rx: 78, ry: 65, isExpandedBlob: true },
      { cx: 1360, cy: 420, rx: 155, ry: 220, isExpandedBlob: true },
      { cx: 1320, cy: 900, rx: 165, ry: 150, isExpandedBlob: true }
    );

    (mapObj.portals || []).forEach(function(p) {
      if (p && p.isCliffCavePortal) {
        p.x = layout.cave.x;
        p.y = layout.cave.y;
      }
    });

    let ladderIdx = 0;
    (mapObj.decos || []).forEach(function(d) {
      if (!d) return;
      if (d.isCliffLadderSpot && layout.ladders[ladderIdx]) {
        const lCfg = layout.ladders[ladderIdx++];
        d.x = lCfg.x; d.y = lCfg.y;
        d.ladderSide = lCfg.side;
        d.upX = lCfg.upX; d.upY = lCfg.upY;
        d.downX = lCfg.downX; d.downY = lCfg.downY;
        d.sprite = rigged ? "rope_ladder" : "cliff_stake";
      } else if (d.isCryptEntrance) {
        d.x = layout.crypt.x;
        d.y = layout.crypt.y;
        d.sprite = cryptUnlocked ? "crypt_door_open" : "crypt_door_locked";
      }
    });

    let oreIdx = 0;
    let digIdx = 0;
    (mapObj.nodes || []).forEach(function(n) {
      if (!n) return;
      if (n.isHighlandOre && n.reqHighland && !n.isBuriedSpot && layout.ores[oreIdx]) {
        n.x = layout.ores[oreIdx].x;
        n.y = layout.ores[oreIdx].y;
        oreIdx++;
      } else if (n.isBuriedSpot && layout.digs[digIdx]) {
        n.x = layout.digs[digIdx].x;
        n.y = layout.digs[digIdx].y;
        n.reqHighland = Boolean(layout.digs[digIdx].reqHighland);
        digIdx++;
      } else if (n.isHighlandOre && !n.reqHighland && !n.isBuriedSpot && !n.isToolGateObstacle && !n.isExplorePuzzleChest) {
        if (isPointBlockedByLayout(n.x, n.y, layout)) {
          n.x = 180 + (oreIdx * 45);
          n.y = 630;
        }
      }
    });

    (mapObj.monsters || []).forEach(function(m) {
      if (m && !m.isBoss && isPointBlockedByLayout(m.x, m.y, layout)) {
        m.x = 240; m.y = 580; m.homeX = 240; m.homeY = 580;
      }
    });
  }

  // ================= 6. 環境互動即時物理與視覺回饋引擎 =================
  function ensureEnvBadge() {
    const upper = document.getElementById("upper-screen");
    if (!upper) return null;
    if (!biomes.envBadgeEl || !upper.contains(biomes.envBadgeEl)) {
      let el = document.getElementById("srpg-env-badge");
      if (!el) {
        el = document.createElement("div");
        el.id = "srpg-env-badge";
        upper.appendChild(el);
      }
      biomes.envBadgeEl = el;
    }
    return biomes.envBadgeEl;
  }

  function setEnvBadge(text, cls) {
    const el = ensureEnvBadge();
    if (!el) return;
    if (!text) {
      SRPG.utils.setDisplayIfChanged(el, "none");
    } else {
      SRPG.utils.setDisplayIfChanged(el, "block");
      SRPG.utils.setClassIfChanged(el, cls || "");
      SRPG.utils.setTextIfChanged(el, text);
    }
  }

  function spawnFootParticle(x, y, color) {
    const now = Date.now();
    if (now - biomes.lastFootFxTime < 140) return;
    biomes.lastFootFxTime = now;
    const layer = document.getElementById("world-entity-layer");
    if (!layer) return;
    const p = document.createElement("div");
    p.className = "srpg-particle";
    p.style.left = (x + (Math.random() * 10 - 5)) + "px";
    p.style.top = (y + 6) + "px";
    p.style.background = color;
    layer.appendChild(p);
    requestAnimationFrame(function() {
      p.style.transform = "translate(" + (Math.random() * 14 - 7).toFixed(1) + "px, " + (-8 - Math.random() * 6).toFixed(1) + "px)";
      p.style.opacity = "0";
    });
    setTimeout(function() { if (p.parentNode) p.parentNode.removeChild(p); }, 360);
  }

  function syncVolcanoVentsDOM(mapObj, layout, now) {
    const layer = document.getElementById("world-entity-layer");
    if (!layer) return;

    const isVolcano = Boolean(mapObj && mapObj.id === "zone5_volcano" && layout && layout.env && layout.env.vents);
    if (!isVolcano) {
      biomes.ventDomPool.forEach(function(el) { if (el.parentNode) el.parentNode.removeChild(el); });
      biomes.ventDomPool = [];
      return;
    }

    const vents = layout.env.vents;
    while (biomes.ventDomPool.length < vents.length) {
      const vEl = document.createElement("div");
      vEl.className = "srpg-lava-vent calm";
      layer.appendChild(vEl);
      biomes.ventDomPool.push(vEl);
    }

    vents.forEach(function(v, idx) {
      const el = biomes.ventDomPool[idx];
      if (!el.parentNode) layer.appendChild(el);
      el.style.left = v.x + "px";
      el.style.top = v.y + "px";

      const phase = (now + v.offset) % 7500;
      if (phase < 4000) {
        SRPG.utils.setClassIfChanged(el, "srpg-lava-vent calm");
        SRPG.utils.setTextIfChanged(el, "");
      } else if (phase < 6000) {
        SRPG.utils.setClassIfChanged(el, "srpg-lava-vent warn");
        SRPG.utils.setTextIfChanged(el, "⚠️熱氣");
      } else {
        SRPG.utils.setClassIfChanged(el, "srpg-lava-vent erupt");
        SRPG.utils.setTextIfChanged(el, "🔥噴發!");
      }
    });
  }

  function runBiomeEnvironmentStep(mapObj, s, prevX, prevY) {
    const layout = mapObj && BIOME_LAYOUTS[mapObj.id];
    if (!layout || !layout.env || s.onHighland) {
      biomes.iceVx = 0; biomes.iceVy = 0;
      setEnvBadge("", "");
      return;
    }

    // ★ v14.5 修正 #7：打開選單、工坊、戰報或戰鬥時暫停一切環境傷害與位移
    if (!isExplorePanelActive()) {
      biomes.iceVx = 0; biomes.iceVy = 0;
      return;
    }

    const env = layout.env;
    const dx = s.heroX - prevX;
    const dy = s.heroY - prevY;
    const moving = (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1);
    const now = Date.now();
    const maxW = (mapObj.width || 1680) - 48;
    const maxH = (mapObj.height || 1180) - 48;

    function safeMoveBy(mx, my) {
      const nx = Math.max(36, Math.min(maxW, s.heroX + mx));
      const ny = Math.max(36, Math.min(maxH, s.heroY + my));
      if (!isPointBlockedByLayout(nx, ny, layout)) {
        if (mapObj.hasRiver && !SRPG.data.isMapBridgeBuilt(mapObj, s)) {
          const rx = mapObj.riverX || 1030;
          if (nx >= rx - 14 && nx <= rx + 50) return;
        }
        s.heroX = nx;
        s.heroY = ny;
      }
    }

    // 1. 森林：🍃順風花瓣加速道
    if (env.type === "wind_petals") {
      const inWind = env.zones.some(function(z) { return isInsideEllipse(s.heroX, s.heroY, z); });
      if (inWind) {
        setEnvBadge("🍃 順風花道：奔跑加速!", "env-good");
        if (moving) {
          safeMoveBy(dx * 0.45, dy * 0.45);
          spawnFootParticle(s.heroX, s.heroY, "#86efac");
        }
      } else {
        setEnvBadge("", "");
      }
      return;
    }

    // 2. 蘑菇洞窟：💧螢光治癒菌泉
    if (env.type === "healing_spring") {
      const inSpring = env.zones.some(function(z) { return isInsideEllipse(s.heroX, s.heroY, z); });
      if (inSpring) {
        setEnvBadge("💧 螢光菌泉：生命緩慢恢復中", "env-good");
        if (now - biomes.lastHealTick >= 1200) {
          biomes.lastHealTick = now;
          if (s.hp < s.maxHp) {
            s.hp = Math.min(s.maxHp, s.hp + 4);
            if (window.Aetheria.UI && window.Aetheria.UI.updateAllHud) window.Aetheria.UI.updateAllHud();
          }
          spawnFootParticle(s.heroX, s.heroY, "#38bdf8");
        }
      } else {
        setEnvBadge("", "");
      }
      return;
    }

    // 3. 流沙峽谷：🌪️流沙漩渦吸力（持有飛索鉤爪 Lv.1+ 免疫）
    if (env.type === "quicksand") {
      const vortex = env.zones.find(function(z) { return isInsideEllipse(s.heroX, s.heroY, z); });
      if (vortex) {
        const hasHook = ((s.tools && s.tools.hook) || 0) >= 1;
        if (hasHook) {
          setEnvBadge("🪝 飛索鉤爪生效：無視流沙阻力!", "env-good");
        } else {
          setEnvBadge("🌪️ 流沙漩渦：正被拉向中心!", "env-warn");
          const vx = vortex.cx - s.heroX;
          const vy = vortex.cy - s.heroY;
          const dist = Math.hypot(vx, vy);
          if (dist > 14) {
            safeMoveBy((vx / dist) * 0.62, (vy / dist) * 0.62);
          }
          if (moving) spawnFootParticle(s.heroX, s.heroY, "#deb878");
        }
      } else {
        setEnvBadge("", "");
      }
      return;
    }

    // 4. 翡翠海岸：🌊新月淺海灣涉水
    if (env.type === "tidal_shallows") {
      const inWater = env.zones.some(function(z) { return isInsideEllipse(s.heroX, s.heroY, z); });
      const onSandbar = Math.hypot(s.heroX - 690, s.heroY - 565) < 34;
      if (inWater && !onSandbar) {
        setEnvBadge("🌊 新月淺海灣：涉水前行中", "env-ice");
        if (moving) {
          safeMoveBy(-dx * 0.22, -dy * 0.22);
          spawnFootParticle(s.heroX, s.heroY, "#8ce0ff");
        }
      } else {
        setEnvBadge("", "");
      }
      return;
    }

    // 5. 霜語雪原：⛸️永凍鏡湖溜冰滑行
    if (env.type === "ice_lake") {
      const onIce = env.zones.some(function(z) { return isInsideEllipse(s.heroX, s.heroY, z); });
      if (onIce) {
        setEnvBadge("⛸️ 永凍鏡湖：冰面滑行加速!", "env-ice");
        if (moving) {
          biomes.iceVx = dx * 1.15;
          biomes.iceVy = dy * 1.15;
          safeMoveBy(dx * 0.35, dy * 0.35);
          spawnFootParticle(s.heroX, s.heroY, "#ffffff");
        } else if (Math.abs(biomes.iceVx) > 0.25 || Math.abs(biomes.iceVy) > 0.25) {
          biomes.iceVx *= 0.86;
          biomes.iceVy *= 0.86;
          safeMoveBy(biomes.iceVx, biomes.iceVy);
          spawnFootParticle(s.heroX, s.heroY, "#e0f2fe");
        }
      } else {
        biomes.iceVx = 0; biomes.iceVy = 0;
        setEnvBadge("", "");
      }
      return;
    }

    // 6. 熔岩火山：🌋間歇噴發地熱噴氣口
    if (env.type === "lava_vents") {
      let badgeMsg = "";
      let badgeCls = "";
      env.vents.forEach(function(v) {
        const dist = Math.hypot(s.heroX - v.x, s.heroY - v.y);
        const phase = (now + v.offset) % 7500;
        if (dist <= v.r + 12) {
          if (phase >= 4000 && phase < 6000) {
            badgeMsg = "⚠️ 地熱噴口即將噴發，快閃開!";
            badgeCls = "env-warn";
          } else if (phase >= 6000) {
            badgeMsg = "🔥 踩到地熱噴發！好燙!";
            badgeCls = "env-warn";
            if (now - biomes.lastVentHitTime > 1200) {
              biomes.lastVentHitTime = now;
              s.hp = Math.max(1, s.hp - 10);
              const ang = Math.atan2(s.heroY - v.y, s.heroX - v.x) || 0;
              safeMoveBy(Math.cos(ang) * 28, Math.sin(ang) * 28);
              if (window.Aetheria.Audio && window.Aetheria.Audio.sfxWrong) window.Aetheria.Audio.sfxWrong();
              if (window.Aetheria.UI) {
                window.Aetheria.UI.spawnFloatingText("🔥好燙! -10HP", "#ff595e", true);
                window.Aetheria.UI.updateAllHud();
              }
            }
          }
        }
      });
      setEnvBadge(badgeMsg, badgeCls);
      return;
    }

    // 7. 天界聖殿：✨星界光速道 ＋ 中央聖光回復陣
    if (env.type === "star_runway") {
      const inSanctuary = env.sanctuary && Math.hypot(s.heroX - env.sanctuary.cx, s.heroY - env.sanctuary.cy) <= env.sanctuary.r;
      const onRunway = (env.runways || []).some(function(rw) {
        return s.heroX >= rw.x1 && s.heroX <= rw.x2 && s.heroY >= rw.y1 && s.heroY <= rw.y2;
      });
      if (inSanctuary) {
        setEnvBadge("✨ 創世聖壇：聖光恢復生命與飽食!", "env-good");
        if (now - biomes.lastHealTick >= 1400) {
          biomes.lastHealTick = now;
          if (s.hp < s.maxHp) s.hp = Math.min(s.maxHp, s.hp + 6);
          if (typeof s.hunger === "number" && s.hunger < 100) s.hunger = Math.min(100, s.hunger + 2);
          if (window.Aetheria.UI && window.Aetheria.UI.updateAllHud) window.Aetheria.UI.updateAllHud();
          spawnFootParticle(s.heroX, s.heroY, "#ffd166");
        }
      } else if (onRunway) {
        setEnvBadge("⚡ 星界光速道：極速飛行!", "env-good");
        if (moving) {
          safeMoveBy(dx * 0.55, dy * 0.55);
          spawnFootParticle(s.heroX, s.heroY, "#ffd166");
        }
      } else {
        setEnvBadge("", "");
      }
    }
  }

  // ================= 7. 掛鉤全部模組（Terrain、Explore、Nav、Study、Renderer） =================
  function installBiomeHooks() {
    if (biomes._hooked) return;
    biomes._hooked = true;

    injectBiomeStyles();
    syncZoneDataWithNewLayouts();

    const terrain = SRPG.terrain;
    const Exp = window.Aetheria.Explore;
    const Ren = window.Aetheria.Renderer;

    // 1. 覆寫高台碰撞範圍函式
    const origInside = terrain.isInsideHighlandPlateau;
    terrain.isInsideHighlandPlateau = function(x, y) {
      const s = window.Aetheria.State && window.Aetheria.State.data;
      const layout = s && BIOME_LAYOUTS[s.currentZone];
      if (layout) return isPointInRects(x, y, layout.rects, 5);
      return origInside(x, y);
    };

    const origBlocked = terrain.isBlockedByCliffFromLowland;
    terrain.isBlockedByCliffFromLowland = function(x, y) {
      const s = window.Aetheria.State && window.Aetheria.State.data;
      const layout = s && BIOME_LAYOUTS[s.currentZone];
      if (layout) return isPointBlockedByLayout(x, y, layout);
      return origBlocked(x, y);
    };

    // 2. 覆寫地貌渲染函式
    const origPaint = terrain.paintTerrainOntoContext;
    terrain.paintTerrainOntoContext = function(ctx, mapObj, W, H, built) {
      if (mapObj && BIOME_LAYOUTS[mapObj.id]) {
        paintCustomLayoutTerrain(ctx, mapObj, W, H, built);
        return;
      }
      origPaint(ctx, mapObj, W, H, built);
    };

    // 3. 覆寫高台注入與山洞/地底遺跡出口座標
    const origInject = terrain.injectHighlandCliffIntoMap;
    terrain.injectHighlandCliffIntoMap = function(mapObj) {
      const prevToken = mapObj && mapObj._highlandInjectedToken;
      const res = origInject(mapObj);
      if (res && BIOME_LAYOUTS[res.id] && (res._biomeLayoutAppliedToken !== res._highlandInjectedToken || prevToken !== res._highlandInjectedToken)) {
        res._biomeLayoutAppliedToken = res._highlandInjectedToken;
        applyCustomLayoutToInjectedMap(res);
      }
      return res;
    };

    const origBuildGrotto = terrain.buildCliffGrottoMap;
    terrain.buildCliffGrottoMap = function(parentZoneId) {
      const m = origBuildGrotto(parentZoneId);
      const lay = BIOME_LAYOUTS[parentZoneId];
      if (m && lay && lay.cave && m.portals && m.portals[0]) {
        m.portals[0].targetX = lay.cave.exitX;
        m.portals[0].targetY = lay.cave.exitY;
      }
      return m;
    };

    const origBuildCrypt = terrain.buildAncientCryptMap;
    terrain.buildAncientCryptMap = function(parentZoneId) {
      const m = origBuildCrypt(parentZoneId);
      const lay = BIOME_LAYOUTS[parentZoneId];
      if (m && lay && lay.crypt && m.portals && m.portals[0]) {
        m.portals[0].targetX = lay.crypt.exitX;
        m.portals[0].targetY = lay.crypt.exitY;
      }
      return m;
    };

    // 4. 覆寫探索步進：雙重防傳送卡點 ＋ 環境互動物理
    if (Exp && Exp.updateStep) {
      const origStep = Exp.updateStep.bind(Exp);
      Exp.updateStep = function() {
        const s = window.Aetheria.State.data;

        // ★ 雙重防跨區傳送殘留高台旗標
        if (biomes.lastZoneId && biomes.lastZoneId !== s.currentZone) {
          s.onHighland = false;
          biomes.iceVx = 0;
          biomes.iceVy = 0;
        }
        biomes.lastZoneId = s.currentZone;

        const prevX = s.heroX, prevY = s.heroY;
        const mapObj = window.Aetheria.Data && window.Aetheria.Data.Maps && window.Aetheria.Data.Maps.getMap(s.currentZone);

        const lay = mapObj && BIOME_LAYOUTS[mapObj.id];
        if (lay) {
          if (!s.onHighland && isPointBlockedByLayout(s.heroX, s.heroY, lay)) {
            s.heroY = lay.ladders[0].downY;
          } else if (s.onHighland && !isPointInRects(s.heroX, s.heroY, lay.rects, 4)) {
            s.heroX = lay.ladders[0].upX;
            s.heroY = lay.ladders[0].upY;
          }
        }

        origStep();

        if (mapObj && s.currentZone === mapObj.id) {
          runBiomeEnvironmentStep(mapObj, s, prevX, prevY);
        }
      };
    }

    // 5. ★ v14.5 修正 #6：攀爬繩梯互動改為搜尋距離主角「最近」的繩梯
    if (Exp && Exp.interactNearby) {
      const origInteract = Exp.interactNearby.bind(Exp);
      Exp.interactNearby = function() {
        const s = window.Aetheria.State.data;
        const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
        if (mapObj && BIOME_LAYOUTS[mapObj.id] && mapObj.decos) {
          let nearestLadder = null;
          let minDist = 68;

          for (let i = 0; i < mapObj.decos.length; i++) {
            const d = mapObj.decos[i];
            if (d && d.isCliffLadderSpot && d.upX !== undefined) {
              const dist = Math.hypot(s.heroX - d.x, s.heroY - d.y);
              if (dist < minDist) {
                minDist = dist;
                nearestLadder = d;
              }
            }
          }

          if (nearestLadder) {
            const d = nearestLadder;
            const rigged = Boolean(s.riggedCliffs && s.riggedCliffs[mapObj.id]);
            if (!rigged && ((s.inventory && s.inventory.ropeLadder) || 0) <= 0) {
              return origInteract();
            }
            if (!s.riggedCliffs) s.riggedCliffs = {};
            if (!rigged) {
              s.inventory.ropeLadder--;
              s.riggedCliffs[mapObj.id] = true;
              (mapObj.decos || []).forEach(function(dc) { if (dc.isCliffLadderSpot) dc.sprite = "rope_ladder"; });
            }
            if (window.Aetheria.Audio && window.Aetheria.Audio.sfxGather) window.Aetheria.Audio.sfxGather();
            if (s.onHighland) {
              s.onHighland = false;
              s.heroX = d.downX; s.heroY = d.downY;
              window.Aetheria.UI.showToast("🧗 順着攀岩繩梯爬下了平地！");
            } else {
              s.onHighland = true;
              s.heroX = d.upX; s.heroY = d.upY;
              window.Aetheria.UI.showToast("🧗 順着攀岩繩梯爬上了【岩石高台礦區】！");
            }
            s.petX = s.heroX - 20; s.petY = s.heroY;
            window.Aetheria.State.save();
            window.Aetheria.UI.updateAllHud();
            return;
          }
        }
        return origInteract();
      };
    }

    // 6. 同步智慧雙軌解鎖攀爬懸崖的落點
    if (SRPG.study && SRPG.study.executeDualTrackUnlock) {
      const origDualUnlock = SRPG.study.executeDualTrackUnlock.bind(SRPG.study);
      SRPG.study.executeDualTrackUnlock = function(targetType, ref) {
        origDualUnlock(targetType, ref);
        if (targetType === "cliff" && ref && ref.upX !== undefined) {
          const s = window.Aetheria.State.data;
          s.onHighland = true;
          s.heroX = ref.upX;
          s.heroY = ref.upY;
          s.petX = s.heroX - 20;
          s.petY = s.heroY;
          window.Aetheria.State.save();
        }
      };
    }

    // 7. 同步金色導航箭頭 (srpg-nav.js) 指向距離主角最近的繩梯與本區遺跡門
    if (SRPG.nav && SRPG.nav.resolveActiveTarget) {
      const origResolve = SRPG.nav.resolveActiveTarget.bind(SRPG.nav);
      SRPG.nav.resolveActiveTarget = function(mapObj, s) {
        const res = origResolve(mapObj, s);
        const lay = mapObj && BIOME_LAYOUTS[mapObj.id];
        if (!res || !lay) return res;

        if (res.key && (res.key.indexOf("cliff_") === 0 || res.key.indexOf("go_up_ladder_") === 0 || res.key.indexOf("go_down_ladder_") === 0)) {
          let bestLad = lay.ladders[0];
          let bestD = Infinity;
          lay.ladders.forEach(function(l) {
            const d = Math.hypot((s.heroX || 0) - l.x, (s.heroY || 0) - l.y);
            if (d < bestD) { bestD = d; bestLad = l; }
          });
          return { key: res.key, x: bestLad.x, y: bestLad.y, label: res.label, reqHighland: res.reqHighland };
        }
        if (res.key && res.key.indexOf("crypt_door_") === 0) {
          return { key: res.key, x: lay.crypt.x, y: lay.crypt.y, label: res.label, reqHighland: false };
        }
        return res;
      };
    }

    // 8. 渲染器掛鉤：更新火山噴氣口動畫
    if (Ren && Ren.renderWorld) {
      const origRender = Ren.renderWorld.bind(Ren);
      Ren.renderWorld = function() {
        origRender();
        try {
          const s = window.Aetheria.State && window.Aetheria.State.data;
          const mapObj = s && window.Aetheria.Data && window.Aetheria.Data.Maps && window.Aetheria.Data.Maps.getMap(s.currentZone);
          const lay = mapObj && BIOME_LAYOUTS[mapObj.id];
          syncVolcanoVentsDOM(mapObj, lay, Date.now());
          if (!lay) setEnvBadge("", "");
        } catch (e) {}
      };
    }

    // 9. 立即套用新物理骨架到所有區域並重繪當前場景
    terrain.clearSubMapsCache();
    const Maps = window.Aetheria.Data && window.Aetheria.Data.Maps;
    if (Maps && Maps.getMap) {
      Object.keys(BIOME_LAYOUTS).forEach(function(zId) {
        const m = Maps.getMap(zId);
        if (m) {
          m._highlandInjectedToken = null;
          m._biomeLayoutAppliedToken = null;
          terrain.injectHighlandCliffIntoMap(m);
        }
      });
    }
    if (Ren) {
      Ren.builtZoneKey = null;
      Ren.renderWorld();
    }
    if (SRPG.ui && SRPG.ui.updateInlinePuzzleGuideInQuestBox) {
      SRPG.ui.updateInlinePuzzleGuideInQuestBox();
    }
    if (SRPG.nav && SRPG.nav.updateNavigationVisuals) {
      SRPG.nav.updateNavigationVisuals(true);
    }
  }

  function bootBiomesWhenReady() {
    let tries = 0;
    const timer = setInterval(function() {
      tries++;
      if (SRPG._ready && SRPG.terrain && SRPG.data && window.Aetheria.Renderer && window.Aetheria.Explore) {
        clearInterval(timer);
        setTimeout(installBiomeHooks, 140);
      } else if (tries >= 160) {
        clearInterval(timer);
      }
    }, 50);
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    bootBiomesWhenReady();
  } else {
    window.addEventListener("load", bootBiomesWhenReady);
  }
})();
