/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 全大陸版圖擴建與四大荒野互動奇物模組 (world-expansion.js - v8.9)
 * 模組化獨立擴充檔：
 *   1. 【全地圖版圖擴大】：曙光營地擴闊至 980x480、主線 1~6 區擴建至 1880x980、無盡碧海擴建至 1960x1060、荒島擴建至 1520x860
 *   2. 【新增四大互動物品】：
 *      - 🎒 遺落探險行囊 (loot_crate)：直接搜刮建材、口糧、火把、炸彈與金幣
 *      - ⛲ 翡翠療癒靈泉 (healing_spring)：飲用恢復 +80 HP、+35% 飽食度與 +2 BP
 *      - 🗿 遠古知識共鳴碑 (lore_monolith)：單題知識共鳴檢定（無傷），獲高階礦石與破防核心
 *      - 🎣 外圍秘境垂釣點 (fishing_spot)：於森林、峽谷、海岸與營地東灣新增釣魚點
 *   3. 【素材與生態倍增】：在擴建的新領土自動鋪設沙洲、林木、12~16 個防重疊素材點與外圍巡邏魔物
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  // ================= 1. 注入新互動奇物標籤 CSS =================
  function injectExpansionStyles() {
    if (document.getElementById("world-exp-v89-styles")) return;
    const style = document.createElement("style");
    style.id = "world-exp-v89-styles";
    style.textContent = `
      .dom-label.spring-lbl {
        background: linear-gradient(90deg, #0f4c5c 0%, #1e3a2f 100%);
        color: #8ce0ff;
        border: 1.5px solid #5ac54f;
        box-shadow: 0 0 6px rgba(90, 197, 79, 0.7);
      }
      .dom-label.monolith-lbl {
        background: linear-gradient(90deg, #2d1442 0%, #1d3557 100%);
        color: #ffd166;
        border: 1.5px solid #e0aaff;
        box-shadow: 0 0 6px rgba(224, 170, 255, 0.7);
      }
      .dom-label.crate-lbl {
        background: #4a2c11;
        color: #fff3b0;
        border: 1.5px solid #f5b700;
      }
    `;
    document.head.appendChild(style);
  }

  // ================= 2. 註冊「探險行囊、翡翠靈泉、遠古知識石碑」像素圖示 =================
  function registerExpansionSprites() {
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

    // 🎒 遺落探險行囊 / 補給物資箱 (16x16)
    const lootCrateUrl = buildGridDataUrl([
      "....KKKKKKKK....",
      "...KLLLLLLLLK...",
      "..KLDDDDDDDDLK..",
      ".KLDYYYYYYYYDLK.",
      ".KDDDDDDDDDDDDK.",
      "KDDDKKKKKKKKDDDK",
      "KDDKYYYYYYYYKDDK",
      "KDDKYWWWWWWYKDDK",
      "KDDDKKKKKKKKDDDK",
      "KDDDDDDYYDDDDDDK",
      "KLLLLLLYYLLLLLLK",
      "KDDDDDDDDDDDDDDK",
      ".KDDDDDDDDDDDDK.",
      "..KKKKKKKKKKKK..",
      "................",
      "................"
    ], {
      K: "#141013", L: "#d9a066", D: "#8f563b", Y: "#f5b700", W: "#ffffff"
    });

    // ⛲ 翡翠療癒靈泉 (16x16)
    const healingSpringUrl = buildGridDataUrl([
      "......WWWW......",
      "....WWCCCCWW....",
      "...WCCBBBBCCW...",
      "..WCBWWWWWWBCW..",
      ".KKKKKKKKKKKKKK.",
      "KGGGGGGGGGGGGGGK",
      "KGCCCCCCCCCCCCGK",
      "KGCBBWWWWWWBBCGK",
      "KGCBWWWWWWWWBCGK",
      "KGCBBCCCCCCBBCGK",
      "KGCCCCCCCCCCCCGK",
      ".KGGGGGGGGGGGGK.",
      "..KDDDDDDDDDDK..",
      "...KKKKKKKKKK...",
      "................",
      "................"
    ], {
      K: "#141013", W: "#ffffff", C: "#8ce0ff", B: "#38b6ff", G: "#5ac54f", D: "#64748b"
    });

    // 🗿 遠古知識共鳴石碑 (16x16)
    const loreMonolithUrl = buildGridDataUrl([
      ".....KKKKKK.....",
      "....KDDDDDDK....",
      "...KDDPPPPDDK...",
      "...KDPWWWWPDK...",
      "..KDDPWYYWPD.K..",
      "..KDDPWWWWPDDK..",
      "..KDDDPPPPDDDK..",
      "..KDDDDYYDDDDK..",
      "..KDDPPYYPPDDK..",
      "..KDDDDYYDDDDK..",
      "..KDDDDDDDDDDK..",
      ".KGGGGGGGGGGGGK.",
      ".KGGGGGGGGGGGGK.",
      "KKKKKKKKKKKKKKKK",
      "................",
      "................"
    ], {
      K: "#141013", D: "#334155", G: "#64748b", P: "#9d4edd", W: "#8ce0ff", Y: "#ffd166"
    });

    const customUrls = {
      loot_crate: lootCrateUrl,
      healing_spring: healingSpringUrl,
      lore_monolith: loreMonolithUrl
    };

    const origGetDataURL = S.getDataURL.bind(S);
    S.getDataURL = function(key) {
      if (customUrls[key]) return customUrls[key];
      return origGetDataURL(key);
    };
  }

  // ================= 3. 各區域擴建尺寸與新增教材/怪物配置表 =================
  const ZONE_EXPANSION_SPECS = {
    camp_hub: {
      targetW: 980,
      targetH: 480,
      extraTrees: 8,
      extraNodes: 6,
      crates: 3,
      springs: 1,
      monoliths: 1,
      extraFishSpots: [{ x: 760, y: 402 }],
      nodePool: [
        { giveKey: "branch", type: "wood",    reqTool: "axe",     reqToolLv: 0 },
        { giveKey: "flint",  type: "crystal", reqTool: "pickaxe", reqToolLv: 0 },
        { giveKey: "clay",   type: "crystal", reqTool: "pickaxe", reqToolLv: 0, southShore: true },
        { giveKey: "wood",   type: "wood",    reqTool: "axe",     reqToolLv: 1 }
      ]
    },
    zone1_forest: {
      targetW: 1880,
      targetH: 980,
      extraTrees: 26,
      extraNodes: 15,
      extraMons: 6,
      crates: 5,
      springs: 2,
      monoliths: 2,
      extraFishSpots: [{ x: 620, y: 820 }, { x: 1480, y: 780 }],
      rewardKey: "coreBamboo",
      monName: "深林守衛木妖",
      nodePool: [
        { giveKey: "wood",   type: "wood",    reqTool: "axe",     reqToolLv: 1 },
        { giveKey: "vine",   type: "wood",    reqTool: "axe",     reqToolLv: 1 },
        { giveKey: "herb",   type: "wood",    reqTool: "axe",     reqToolLv: 1 },
        { giveKey: "resin",  type: "wood",    reqTool: "axe",     reqToolLv: 1 },
        { giveKey: "iron",   type: "crystal", reqTool: "pickaxe", reqToolLv: 1 },
        { giveKey: "branch", type: "wood",    reqTool: "axe",     reqToolLv: 0 }
      ]
    },
    cave1_mushroom: {
      targetW: 1680,
      targetH: 900,
      extraTrees: 20,
      extraNodes: 14,
      extraMons: 5,
      crates: 4,
      springs: 1,
      monoliths: 2,
      extraFishSpots: [{ x: 1280, y: 680 }],
      rewardKey: "mithril",
      monName: "深窟晶簇魔兵",
      nodePool: [
        { giveKey: "herb",    type: "wood",    reqTool: "axe",     reqToolLv: 1 },
        { giveKey: "iron",    type: "crystal", reqTool: "pickaxe", reqToolLv: 1 },
        { giveKey: "basalt",  type: "crystal", reqTool: "pickaxe", reqToolLv: 2 },
        { giveKey: "mithril", type: "crystal", reqTool: "pickaxe", reqToolLv: 2 }
      ]
    },
    zone2_canyon: {
      targetW: 1880,
      targetH: 980,
      extraTrees: 22,
      extraNodes: 15,
      extraMons: 6,
      crates: 5,
      springs: 2,
      monoliths: 2,
      extraFishSpots: [{ x: 1380, y: 810 }],
      rewardKey: "shell",
      monName: "荒漠秘境巨蠍",
      nodePool: [
        { giveKey: "basalt",  type: "crystal", reqTool: "pickaxe", reqToolLv: 2 },
        { giveKey: "mithril", type: "crystal", reqTool: "pickaxe", reqToolLv: 2 },
        { giveKey: "hemp",    type: "wood",    reqTool: "axe",     reqToolLv: 2 },
        { giveKey: "flower",  type: "wood",    reqTool: "axe",     reqToolLv: 2 },
        { giveKey: "iron",    type: "crystal", reqTool: "pickaxe", reqToolLv: 1 }
      ]
    },
    zone3_coast: {
      targetW: 1880,
      targetH: 980,
      extraTrees: 20,
      extraNodes: 16,
      extraMons: 6,
      crates: 5,
      springs: 2,
      monoliths: 2,
      extraFishSpots: [{ x: 1360, y: 520 }, { x: 820, y: 840 }],
      rewardKey: "coreSiren",
      monName: "外海深淵海妖",
      nodePool: [
        { giveKey: "coral",     type: "crystal", reqTool: "pickaxe", reqToolLv: 2 },
        { giveKey: "sailCloth", type: "wood",    reqTool: "axe",     reqToolLv: 0 },
        { giveKey: "hemp",      type: "wood",    reqTool: "axe",     reqToolLv: 2 },
        { giveKey: "mithril",   type: "crystal", reqTool: "pickaxe", reqToolLv: 2 },
        { giveKey: "wood",      type: "wood",    reqTool: "axe",     reqToolLv: 1 }
      ]
    },
    zone4_snow: {
      targetW: 1880,
      targetH: 980,
      extraTrees: 24,
      extraNodes: 15,
      extraMons: 6,
      crates: 5,
      springs: 2,
      monoliths: 2,
      extraFishSpots: [{ x: 1420, y: 760 }],
      rewardKey: "iceCrystal",
      monName: "極地冰原巨狼",
      nodePool: [
        { giveKey: "iceLotus", type: "wood",    reqTool: "axe",     reqToolLv: 2 },
        { giveKey: "sinew",    type: "wood",    reqTool: "axe",     reqToolLv: 0 },
        { giveKey: "obsidian", type: "crystal", reqTool: "pickaxe", reqToolLv: 3 },
        { giveKey: "basalt",   type: "crystal", reqTool: "pickaxe", reqToolLv: 2 }
      ]
    },
    zone5_volcano: {
      targetW: 1880,
      targetH: 980,
      extraTrees: 22,
      extraNodes: 15,
      extraMons: 6,
      crates: 5,
      springs: 2,
      monoliths: 2,
      extraFishSpots: [],
      rewardKey: "magmaScale",
      monName: "熔岩煉獄火魔",
      nodePool: [
        { giveKey: "obsidian", type: "crystal", reqTool: "pickaxe", reqToolLv: 3 },
        { giveKey: "starIron", type: "crystal", reqTool: "pickaxe", reqToolLv: 3 },
        { giveKey: "mithril",  type: "crystal", reqTool: "pickaxe", reqToolLv: 2 },
        { giveKey: "basalt",   type: "crystal", reqTool: "pickaxe", reqToolLv: 2 }
      ]
    },
    zone6_sky: {
      targetW: 1880,
      targetH: 980,
      extraTrees: 20,
      extraNodes: 16,
      extraMons: 6,
      crates: 5,
      springs: 2,
      monoliths: 2,
      extraFishSpots: [{ x: 1450, y: 680 }],
      rewardKey: "tabletShard",
      monName: "天界星辰神兵",
      nodePool: [
        { giveKey: "starIron", type: "crystal", reqTool: "pickaxe", reqToolLv: 3 },
        { giveKey: "goldLeaf", type: "wood",    reqTool: "axe",     reqToolLv: 3 },
        { giveKey: "obsidian", type: "crystal", reqTool: "pickaxe", reqToolLv: 3 }
      ]
    }
  };

  function randBetween(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  // 防重疊座標搜尋器：確保新加入的奇物、樹木、礦石與原有物件保持安全距離
  function findSafeExpansionSpot(mapObj, opts) {
    opts = opts || {};
    const W = mapObj.width || 1200;
    const H = opts.maxY || ((mapObj.height || 680) - 65);
    const minX = opts.minX || 75;
    const maxX = opts.maxX || (W - 75);
    const minY = opts.minY || 75;
    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};

    for (let attempt = 0; attempt < 110; attempt++) {
      const cx = randBetween(minX, Math.max(minX + 40, maxX));
      const cy = randBetween(minY, Math.max(minY + 40, H));

      if (mapObj.hasRiver) {
        const rx = mapObj.riverX || 1030;
        if (cx > rx - 38 && cx < rx + 65) continue;
      }

      if (s.currentZone === mapObj.id && Math.hypot(cx - (s.heroX || 0), cy - (s.heroY || 0)) < 60) {
        continue;
      }

      let hitPortal = false;
      (mapObj.portals || []).forEach(function(p) {
        if (Math.hypot(cx - p.x, cy - p.y) < 68) hitPortal = true;
      });
      if (hitPortal) continue;

      let hitTree = false;
      (mapObj.trees || []).forEach(function(t) {
        if (Math.hypot(cx - (t.x + 14), cy - (t.y + 14)) < 38) hitTree = true;
      });
      if (hitTree) continue;

      let hitNpc = false;
      (mapObj.npcs || []).forEach(function(n) {
        if (Math.hypot(cx - n.x, cy - n.y) < 48) hitNpc = true;
      });
      if (hitNpc) continue;

      let hitDeco = false;
      (mapObj.decos || []).forEach(function(d) {
        const rad = d.isPuzzleElement ? 65 : 42;
        if (Math.hypot(cx - d.x, cy - d.y) < rad) hitDeco = true;
      });
      if (hitDeco) continue;

      let hitNode = false;
      (mapObj.nodes || []).forEach(function(n) {
        if (!n.opened && Math.hypot(cx - n.x, cy - n.y) < 40) hitNode = true;
      });
      if (hitNode) continue;

      let hitMon = false;
      (mapObj.monsters || []).forEach(function(m) {
        if (m.alive !== false && Math.hypot(cx - m.x, cy - m.y) < 46) hitMon = true;
      });
      if (hitMon) continue;

      return { x: cx, y: cy };
    }
    return null;
  }

  // ================= 4. 動態擴建各區版圖並注入新奇物與資源 =================
  function expandAndEnrichMap(mapObj) {
    if (!mapObj) return mapObj;
    const token = mapObj._refreshToken || "init";
    if (mapObj._worldExpandedToken === token) return mapObj;
    mapObj._worldExpandedToken = token;

    const matsDB = (window.Aetheria.Data && window.Aetheria.Data.MATERIALS) || {};
    const s = (window.Aetheria.State && window.Aetheria.State.data) || { lv: 1 };

    // (A) 處理無盡碧海 (ocean_sea) 擴大與額外漂流桶
    if (mapObj.id === "ocean_sea") {
      mapObj.width = Math.max(mapObj.width || 1420, 1960);
      mapObj.height = Math.max(mapObj.height || 760, 1060);
      mapObj.dirtBlobs = mapObj.dirtBlobs || [];
      mapObj.dirtBlobs.push(
        { cx: 1580, cy: 260, rx: 95, ry: 65, isAtoll: true },
        { cx: 1620, cy: 760, rx: 105, ry: 70, isAtoll: true },
        { cx: 420,  cy: 840, rx: 90, ry: 60, isAtoll: true }
      );
      for (let b = 0; b < 6; b++) {
        const pt = findSafeExpansionSpot(mapObj, { minX: 250, maxX: 1850, minY: 120, maxY: 960 });
        if (pt) {
          mapObj.nodes.push({
            id: "exp_sea_barrel_" + b + "_" + Date.now(),
            x: pt.x,
            y: pt.y,
            type: "chest",
            name: "漂流補給桶",
            isSeaBarrel: true,
            reqToolLv: 0,
            opened: false
          });
        }
      }
      return mapObj;
    }

    // (B) 處理隨機荒島與深淵地牢擴大
    const isIsland = ["island_coral", "island_wreck", "dungeon_abyss", "island_volcano"].indexOf(mapObj.id) !== -1;
    if (isIsland) {
      mapObj.width = Math.max(mapObj.width || 1120, 1520);
      mapObj.height = Math.max(mapObj.height || 640, 860);
      mapObj.dirtBlobs = mapObj.dirtBlobs || [];
      mapObj.dirtBlobs.push(
        { cx: 1260, cy: 260, rx: 120, ry: 85 },
        { cx: 1260, cy: 620, rx: 125, ry: 85 },
        { cx: 680,  cy: 710, rx: 140, ry: 80 }
      );
      // 荒島加入 3 個探險行囊、1 座翡翠靈泉與 1 座遠古知識石碑
      for (let c = 0; c < 3; c++) {
        const cPt = findSafeExpansionSpot(mapObj);
        if (cPt) {
          mapObj.decos.push({
            id: "exp_crate_" + mapObj.id + "_" + c,
            x: cPt.x,
            y: cPt.y,
            sprite: "loot_crate",
            w: 26,
            h: 26,
            solid: true,
            isLootCrate: true,
            opened: false,
            name: "🎒探險行囊"
          });
        }
      }
      const spPt = findSafeExpansionSpot(mapObj);
      if (spPt) {
        mapObj.decos.push({
          id: "exp_spring_" + mapObj.id,
          x: spPt.x,
          y: spPt.y,
          sprite: "healing_spring",
          w: 30,
          h: 30,
          solid: true,
          isHealingSpring: true,
          name: "⛲翡翠靈泉"
        });
      }
      const moPt = findSafeExpansionSpot(mapObj);
      if (moPt) {
        mapObj.decos.push({
          id: "exp_mono_" + mapObj.id,
          x: moPt.x,
          y: moPt.y,
          sprite: "lore_monolith",
          w: 28,
          h: 32,
          solid: true,
          isLoreMonolith: true,
          rewardKey: "seaChart",
          name: "🗿遠古石碑"
        });
      }
      return mapObj;
    }

    // (C) 處理曙光營地與 1~6 主線大陸區域擴大
    const spec = ZONE_EXPANSION_SPECS[mapObj.id];
    if (!spec) return mapObj;

    const origW = mapObj.width || 640;
    const origH = mapObj.height || 480;
    mapObj.width = Math.max(origW, spec.targetW);
    mapObj.height = Math.max(origH, spec.targetH);

    mapObj.dirtBlobs = mapObj.dirtBlobs || [];
    mapObj.trees = mapObj.trees || [];
    mapObj.decos = (mapObj.decos || []).filter(function(d) { return !d.isExpandedWorldObj; });
    mapObj.nodes = (mapObj.nodes || []).filter(function(n) { return !n.isExpandedWorldNode; });
    mapObj.monsters = (mapObj.monsters || []).filter(function(m) { return !m.isExpandedWorldMon; });

    // 鋪設擴建區域的沙洲與泥土小徑
    if (mapObj.id === "camp_hub") {
      mapObj.dirtBlobs.push(
        { cx: 740, cy: 230, rx: 140, ry: 95 },
        { cx: 860, cy: 280, rx: 90,  ry: 70 }
      );
    } else {
      mapObj.dirtBlobs.push(
        { cx: 1420, cy: 280, rx: 165, ry: 110 },
        { cx: 1580, cy: 680, rx: 175, ry: 120 },
        { cx: 520,  cy: 790, rx: 180, ry: 95 },
        { cx: 1080, cy: 810, rx: 165, ry: 95 }
      );
    }

    // 1. 在擴建的新區域種植防重疊樹木/岩柱（主要分佈在 x > origW - 80 或 y > origH - 80）
    for (let t = 0; t < (spec.extraTrees || 0); t++) {
      const inEast = (t % 2 === 0);
      const tSpot = findSafeExpansionSpot(mapObj, {
        minX: inEast ? Math.max(580, origW - 60) : 90,
        maxX: mapObj.width - 70,
        minY: inEast ? 80 : Math.max(200, origH - 60),
        maxY: (mapObj.id === "camp_hub") ? 330 : (mapObj.height - 70)
      });
      if (tSpot) {
        mapObj.trees.push({ x: tSpot.x, y: tSpot.y, isExpandedTree: true });
      }
    }

    // 2. 加入額外【🎣秘境垂釣點】
    (spec.extraFishSpots || []).forEach(function(fp, idx) {
      mapObj.decos.push({
        id: "exp_fish_" + mapObj.id + "_" + idx,
        x: fp.x,
        y: fp.y,
        sprite: "fishing_spot",
        w: 28,
        h: 28,
        isFishingSpot: true,
        isExpandedWorldObj: true
      });
    });

    // 3. 加入【⛲翡翠療癒靈泉】
    for (let sp = 0; sp < (spec.springs || 0); sp++) {
      const spSpot = (mapObj.id === "camp_hub")
        ? { x: 750, y: 215 }
        : findSafeExpansionSpot(mapObj, {
            minX: sp === 0 ? 220 : 1120,
            maxX: mapObj.width - 110,
            minY: sp === 0 ? Math.max(480, origH - 40) : 140,
            maxY: mapObj.height - 95
          });
      if (spSpot) {
        mapObj.decos.push({
          id: "exp_spring_" + mapObj.id + "_" + sp,
          x: spSpot.x,
          y: spSpot.y,
          sprite: "healing_spring",
          w: 30,
          h: 30,
          solid: true,
          isHealingSpring: true,
          isExpandedWorldObj: true,
          name: "⛲翡翠靈泉"
        });
      }
    }

    // 4. 加入【🗿遠古知識共鳴碑】
    for (let mo = 0; mo < (spec.monoliths || 0); mo++) {
      const moSpot = (mapObj.id === "camp_hub")
        ? { x: 845, y: 165 }
        : findSafeExpansionSpot(mapObj, {
            minX: mo === 0 ? 300 : 1200,
            maxX: mapObj.width - 110,
            minY: 120,
            maxY: mapObj.height - 95
          });
      if (moSpot) {
        mapObj.decos.push({
          id: "exp_mono_" + mapObj.id + "_" + mo,
          x: moSpot.x,
          y: moSpot.y,
          sprite: "lore_monolith",
          w: 28,
          h: 32,
          solid: true,
          isLoreMonolith: true,
          isExpandedWorldObj: true,
          rewardKey: spec.rewardKey || "iron",
          name: "🗿遠古石碑"
        });
      }
    }

    // 5. 加入【🎒遺落探險行囊 / 補給木箱】
    for (let cr = 0; cr < (spec.crates || 0); cr++) {
      const crSpot = findSafeExpansionSpot(mapObj, {
        minX: (mapObj.id === "camp_hub") ? 600 : 120,
        maxX: mapObj.width - 80,
        minY: (mapObj.id === "camp_hub") ? 150 : 95,
        maxY: (mapObj.id === "camp_hub") ? 340 : (mapObj.height - 80)
      });
      if (crSpot) {
        mapObj.decos.push({
          id: "exp_crate_" + mapObj.id + "_" + cr + "_" + token,
          x: crSpot.x,
          y: crSpot.y,
          sprite: "loot_crate",
          w: 26,
          h: 26,
          solid: true,
          isLootCrate: true,
          isExpandedWorldObj: true,
          opened: false,
          name: "🎒探險行囊"
        });
      }
    }

    // 6. 在擴建區域生成 14~16 個防重疊採集素材點
    const pool = spec.nodePool || [];
    for (let nIdx = 0; nIdx < (spec.extraNodes || 0) && pool.length > 0; nIdx++) {
      const tpl = pool[nIdx % pool.length];
      const nSpot = findSafeExpansionSpot(mapObj, {
        minX: (mapObj.id === "camp_hub") ? 580 : 100,
        maxX: (mapObj.id === "zone1_forest" && nIdx < 6) ? 960 : (mapObj.width - 75),
        minY: tpl.southShore ? 320 : ((mapObj.id === "camp_hub") ? 140 : 85),
        maxY: tpl.southShore ? 350 : ((mapObj.id === "camp_hub") ? 345 : (mapObj.height - 75))
      });
      if (!nSpot) continue;

      const matObj = matsDB[tpl.giveKey] || { name: tpl.giveKey };
      const isPerf = (tpl.reqToolLv >= 1 && Math.random() < 0.28);

      mapObj.nodes.push({
        id: "exp_node_" + mapObj.id + "_" + nIdx + "_" + Date.now(),
        x: nSpot.x,
        y: nSpot.y,
        type: tpl.type || "wood",
        giveKey: tpl.giveKey,
        reqTool: tpl.reqTool || "axe",
        reqToolLv: tpl.reqToolLv !== undefined ? tpl.reqToolLv : 1,
        perfect: isPerf,
        name: (isPerf ? "高純度" : "") + matObj.name,
        opened: false,
        isExpandedWorldNode: true
      });
    }

    // 7. 在擴建的外圍領土生成巡邏魔物
    for (let mIdx = 0; mIdx < (spec.extraMons || 0); mIdx++) {
      const mSpot = findSafeExpansionSpot(mapObj, {
        minX: (mIdx % 2 === 0) ? Math.max(650, origW - 100) : 220,
        maxX: mapObj.width - 90,
        minY: (mIdx % 2 === 0) ? 120 : Math.max(450, origH - 80),
        maxY: mapObj.height - 90
      });
      if (!mSpot) continue;

      const baseLv = Math.max(2, (mapObj.recLv || s.lv || 2) + randBetween(0, 2));
      mapObj.monsters.push({
        id: "exp_mon_" + mapObj.id + "_" + mIdx + "_" + Date.now(),
        name: spec.monName || "外圍秘境魔物",
        lv: baseLv,
        x: mSpot.x,
        y: mSpot.y,
        homeX: mSpot.x,
        homeY: mSpot.y,
        type: (mIdx % 2 === 0) ? "skull" : "bamboo",
        isBoss: false,
        isShiny: (Math.random() < 0.20),
        alive: true,
        isExpandedWorldMon: true
      });
    }

    return mapObj;
  }

  // ================= 5. 四大新物品的互動處理邏輯 =================
  const WorldExpansionManager = {
    // 🎒 搜刮【遺落探險行囊】
    openLootCrate: function(deco) {
      if (!deco || deco.opened) return;
      const s = window.Aetheria.State.data;
      deco.opened = true;
      deco.cleared = true;
      deco.solid = false;

      window.Aetheria.Audio.sfxLevelUp();

      const roll = Math.random();
      if (roll < 0.28) {
        const goldAmt = 45 + (s.lv || 1) * 5;
        s.gold += goldAmt;
        s.inventory.rationFish = (s.inventory.rationFish || 0) + 1;
        window.Aetheria.UI.showToast("🎒 搜刮探險行囊：獲得【" + goldAmt + " G 與 炭烤鮮魚乾 +1】！");
      } else if (roll < 0.56) {
        s.inventory.torchItem = (s.inventory.torchItem || 0) + 2;
        s.inventory.bombItem = (s.inventory.bombItem || 0) + 1;
        window.Aetheria.UI.showToast("🎒 搜刮探險行囊：獲得【松脂火把 +2、爆破炸彈 +1】！");
      } else if (roll < 0.82) {
        s.inventory.plank = (s.inventory.plank || 0) + 1;
        s.inventory.rope = (s.inventory.rope || 0) + 1;
        s.inventory.nails = (s.inventory.nails || 0) + 1;
        window.Aetheria.UI.showToast("🎒 搜刮工程物資箱：驚喜獲得【加工厚木板+1、麻繩索+1、鍛造鐵釘+1】！");
      } else {
        s.inventory.potionHeal = (s.inventory.potionHeal || 0) + 1;
        s.inventory.potionHint = (s.inventory.potionHint || 0) + 1;
        window.Aetheria.UI.showToast("🎒 搜刮鍊金行囊：驚喜獲得【生命藥水 +1、洞察藥水 +1】！");
      }

      window.Aetheria.State.save();
      window.Aetheria.UI.updateAllHud();
    },

    // ⛲ 飲用【翡翠療癒靈泉】
    drinkHealingSpring: function(deco) {
      const s = window.Aetheria.State.data;
      if (!s.usedSpringsDay) s.usedSpringsDay = {};
      const dayKey = (s.dayCount || 1) + "_" + deco.id;

      if (s.usedSpringsDay[dayKey]) {
        window.Aetheria.Audio.sfxTalkBlip();
        window.Aetheria.UI.showToast("⛲ 這座翡翠靈泉今日已飲用過了！睡覺換日後泉水將再次湧現。");
        return;
      }

      s.usedSpringsDay[dayKey] = true;
      window.Aetheria.State.restoreHunger(35, 80);
      s.bp = Math.min(s.maxBp || 5, (s.bp || 0) + 2);

      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      window.Aetheria.UI.updateAllHud();
      window.Aetheria.UI.spawnFloatingText("⛲靈泉療癒 HP+80 BP+2!", "#5ac54f", true);
      window.Aetheria.UI.showToast("⛲ 飲用翡翠療癒靈泉：恢復 +80 HP、+35% 飽食度，並充能 +2 顆 BP 珠！");
    },

    // 🗿 觸發【遠古知識共鳴石碑】（單題無傷檢定）
    activateLoreMonolith: function(deco) {
      const s = window.Aetheria.State.data;
      if (!s.clearedMonoliths) s.clearedMonoliths = {};
      const monoKey = (s.dayCount || 1) + "_" + deco.id;

      if (s.clearedMonoliths[monoKey]) {
        window.Aetheria.Audio.sfxTalkBlip();
        window.Aetheria.UI.showToast("🗿 此遠古石碑今日已完成知識共鳴！睡覺過夜後可再次感悟。");
        return;
      }

      const Bat = window.Aetheria.Battle;
      if (!Bat || !Bat.startForageChallenge) return;

      window.Aetheria.Audio.sfxTalkBlip();
      window.Aetheria.UI.showToast("🗿 觸發【遠古知識共鳴碑】！答對即可獲得石碑秘寶獎勵（答錯不扣血）！");

      // 標記當前正在進行石碑共鳴，答對時給予額外石碑大獎
      Bat._pendingMonolithDeco = deco;
      Bat._pendingMonolithKey = monoKey;
      Bat.startForageChallenge();
    }
  };

  window.Aetheria.WorldExpansion = WorldExpansionManager;

  // ================= 6. 掛載地圖讀取、A鍵互動、石碑獎勵與 DOM 渲染 =================
  function hookSystemsForExpansion() {
    const Maps = window.Aetheria.Data && window.Aetheria.Data.Maps;
    const Exp  = window.Aetheria.Explore;
    const Ren  = window.Aetheria.Renderer;
    const Bat  = window.Aetheria.Battle;

    if (Maps && Maps.getMap) {
      const origGetMap = Maps.getMap.bind(Maps);
      Maps.getMap = function(zoneId) {
        const m = origGetMap(zoneId);
        if (m) expandAndEnrichMap(m);
        return m;
      };
    }

    if (Exp) {
      const origInteract = Exp.interactNearby.bind(Exp);
      Exp.interactNearby = function() {
        const s = window.Aetheria.State.data;
        const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
        if (mapObj && mapObj.decos) {
          for (let i = 0; i < mapObj.decos.length; i++) {
            const d = mapObj.decos[i];
            if (!d || d.cleared) continue;
            if (Math.hypot(s.heroX - d.x, s.heroY - d.y) < 42) {
              if (d.isLootCrate) {
                WorldExpansionManager.openLootCrate(d);
                return;
              }
              if (d.isHealingSpring) {
                WorldExpansionManager.drinkHealingSpring(d);
                return;
              }
              if (d.isLoreMonolith) {
                WorldExpansionManager.activateLoreMonolith(d);
                return;
              }
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
            if (!d || d.cleared) continue;
            if (Math.hypot(s.heroX - d.x, s.heroY - d.y) < 42) {
              if (d.isLootCrate)     { hintEl.innerText = "搜刮行囊"; return; }
              if (d.isHealingSpring) { hintEl.innerText = "飲用靈泉"; return; }
              if (d.isLoreMonolith)  { hintEl.innerText = "共鳴石碑"; return; }
            }
          }
        }
        origHint(mapObj, s);
      };
    }

    // 攔截遠古石碑答題成功結算
    if (Bat && Bat.resolveTurn) {
      const origResolve = Bat.resolveTurn.bind(Bat);
      Bat.resolveTurn = function(isCorrect, correctText, qObj) {
        const pendingMono = this._pendingMonolithDeco;
        const pendingKey  = this._pendingMonolithKey;
        this._pendingMonolithDeco = null;
        this._pendingMonolithKey  = null;

        origResolve(isCorrect, correctText, qObj);

        if (pendingMono && isCorrect) {
          const s = window.Aetheria.State.data;
          if (!s.clearedMonoliths) s.clearedMonoliths = {};
          s.clearedMonoliths[pendingKey] = true;

          const rKey = pendingMono.rewardKey || "mithril";
          s.inventory[rKey] = (s.inventory[rKey] || 0) + 1;
          window.Aetheria.State.gainRewards(85, 90, 15);
          window.Aetheria.State.save();
          window.Aetheria.UI.updateAllHud();

          const matObj = (window.Aetheria.Data.MATERIALS && window.Aetheria.Data.MATERIALS[rKey]) || { name: rKey };
          setTimeout(function() {
            window.Aetheria.UI.showToast("🗿 遠古石碑共鳴成功！獲得【85 EXP、90 G 與 " + matObj.name + " +1】！");
          }, 450);
        }
      };
    }

    if (Ren && Ren.renderWorld) {
      const origRender = Ren.renderWorld.bind(Ren);
      Ren.renderWorld = function() {
        origRender();
        try {
          const s = window.Aetheria.State.data;
          Object.keys(this.domPool.decos || {}).forEach(function(k) {
            const item = Ren.domPool.decos[k];
            if (!item || !item.data || !item.el) return;
            const d = item.data;

            if (d.isLootCrate) {
              if (d.cleared || d.opened) {
                item.el.style.display = "none";
              } else if (item.lbl) {
                item.lbl.style.display = "block";
                item.lbl.className = "dom-label crate-lbl";
                item.lbl.innerText = "🎒探險行囊";
              }
            } else if (d.isHealingSpring && item.lbl) {
              const used = Boolean(s.usedSpringsDay && s.usedSpringsDay[(s.dayCount || 1) + "_" + d.id]);
              item.lbl.style.display = "block";
              item.lbl.className = "dom-label " + (used ? "" : "spring-lbl");
              item.lbl.innerText = used ? "⛲靈泉(已飲)" : "⛲翡翠靈泉";
            } else if (d.isLoreMonolith && item.lbl) {
              const done = Boolean(s.clearedMonoliths && s.clearedMonoliths[(s.dayCount || 1) + "_" + d.id]);
              item.lbl.style.display = "block";
              item.lbl.className = "dom-label " + (done ? "" : "monolith-lbl");
              item.lbl.innerText = done ? "🗿石碑✓" : "🗿遠古石碑";
            }
          });
        } catch (e) {}
      };
    }
  }

  function initWorldExpansionModule() {
    try {
      injectExpansionStyles();
      registerExpansionSprites();
      hookSystemsForExpansion();

      // 立即為所有已載入的地圖執行擴建與奇物佈置
      const Maps = window.Aetheria.Data && window.Aetheria.Data.Maps;
      if (Maps && Maps.getMap) {
        Object.keys(ZONE_EXPANSION_SPECS).forEach(function(zId) {
          const m = Maps.getMap(zId);
          if (m) {
            m._worldExpandedToken = null;
            expandAndEnrichMap(m);
          }
        });
      }

      if (window.Aetheria.Renderer) {
        window.Aetheria.Renderer.builtZoneKey = null;
        window.Aetheria.Renderer.renderWorld();
      }
      if (window.Aetheria.UI && window.Aetheria.UI.updateAllHud) {
        window.Aetheria.UI.updateAllHud();
      }
    } catch (err) {
      console.error("World Expansion v8.9 init error:", err);
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(initWorldExpansionModule, 180);
  } else {
    window.addEventListener("load", function() {
      setTimeout(initWorldExpansionModule, 180);
    });
  }
})();
