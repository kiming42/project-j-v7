/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 進階三石推箱子迷宮、永久鎖定與唯一寶箱模組 (dungeon-puzzles.js - v8.8)
 * Cross-Check 修正：
 *   1. 【修復十字鍵頂推失靈】：解決底層 v6.7 因 solid:true 提前阻擋主角而無法觸發十字鍵頂推的問題
 *   2. 【未開秘門保護】：在秘密通道鐵門尚未開啟前，即使靠近寶箱亦禁止隔牆開啟
 *   3. 完整包含 3 石 Sokoban 迷宮陣、解開後永久鎖定 (s.solvedPuzzles) 與唯一秘寶箱 (s.claimedPuzzleChests)
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  function injectPuzzleStyles() {
    if (document.getElementById("puzzle-v81-styles")) return;
    const style = document.createElement("style");
    style.id = "puzzle-v81-styles";
    style.textContent = `
      .dom-entity.puzzle-smooth-slide {
        transition: left 0.16s ease-out, top 0.16s ease-out;
      }
      .dom-label.puzzle-boulder-lbl {
        background: #1d3557;
        color: #8ce0ff;
        border: 1px solid #38b6ff;
      }
      .dom-label.puzzle-lit-lbl {
        background: #1e3a2f;
        color: #5ac54f;
        border: 1px solid #5ac54f;
      }
      .dom-label.puzzle-gate-lbl {
        background: #5c1a1b;
        color: #ffd166;
        border: 1.5px solid #ff595e;
      }
      .dom-label.puzzle-reset-lbl {
        background: #2d1442;
        color: #e0aaff;
        border: 1px solid #9d4edd;
      }
    `;
    document.head.appendChild(style);
  }

  function registerPuzzleSprites() {
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

    const pushBoulderUrl = buildGridDataUrl([
      "...KKKKKKKKKK...",
      "..KLLLLLLLLLLK..",
      ".KLGGGGGGGGGGGK.",
      "KLGGGGCCCCGGGGGK",
      "KLGGGCCGGGGCCGGK",
      "KLGGGCGGGGGGCGGK",
      "KLGGGCCCCCCCCGGK",
      "KLGGGGGGGGGGGGGK",
      "KGGGGGCCGGCCGGGK",
      "KGGGGGCGGGGGGGGK",
      "KDDDDDGGGGGGDDDK",
      "KDDDDDDDDDDDDDDK",
      ".KDDDDDDDDDDDDK.",
      "..KKKKKKKKKKKK..",
      "................",
      "................"
    ], { K: "#141013", L: "#94a3b8", G: "#64748b", D: "#334155", C: "#38b6ff" });

    const pushBoulderLitUrl = buildGridDataUrl([
      "...KKKKKKKKKK...",
      "..KYYYYYYYYYYK..",
      ".KYGGGGGGGGGGYK.",
      "KYGGGGLLLLGGGGYK",
      "KYGGGLLGGGGLLGYK",
      "KYGGGLGGGGGGGLYK",
      "KYGGGLLLLLLLLGYK",
      "KYGGGGGGGGGGGGYK",
      "KGGGGGLLGGLLGGGK",
      "KGGGGGLGGGGGGGGK",
      "KDDDDDGGGGGGDDDK",
      "KDDDDDDDDDDDDDDK",
      ".KYYYYYYYYYYYYK.",
      "..KKKKKKKKKKKK..",
      "................",
      "................"
    ], { K: "#141013", Y: "#f5b700", G: "#475569", D: "#1e293b", L: "#5ac54f" });

    const plateOffUrl = buildGridDataUrl([
      "................",
      "..KKKKKKKKKKKK..",
      ".KDDDDDDDDDDDDK.",
      ".KDCCCCCCCCCCDK.",
      ".KDCGGGGGGGGCDK.",
      ".KDCGCCCCCCGC.K.",
      ".KDCGCGGGGCGCDK.",
      ".KDCGCGGGGCGCDK.",
      ".KDCGCCCCCCGC.K.",
      ".KDCGGGGGGGGCDK.",
      ".KDCCCCCCCCCCDK.",
      ".KDDDDDDDDDDDDK.",
      "..KKKKKKKKKKKK..",
      "................",
      "................",
      "................"
    ], { K: "#141013", D: "#334155", G: "#1e293b", C: "#38b6ff" });

    const plateOnUrl = buildGridDataUrl([
      "................",
      "..KKKKKKKKKKKK..",
      ".KYYYYYYYYYYYYK.",
      ".KYLLLLLLLLLLYK.",
      ".KYLGGGGGGGGLYK.",
      ".KYLGLLLLLLGLYK.",
      ".KYLGLYYYYLGLYK.",
      ".KYLGLYYYYLGLYK.",
      ".KYLGLLLLLLGLYK.",
      ".KYLGGGGGGGGLYK.",
      ".KYLLLLLLLLLLYK.",
      ".KYYYYYYYYYYYYK.",
      "..KKKKKKKKKKKK..",
      "................",
      "................",
      "................"
    ], { K: "#141013", Y: "#f5b700", L: "#5ac54f", G: "#1e3a2f" });

    const secretGateUrl = buildGridDataUrl([
      "KKKKKKKKKKKKKKKK",
      "KRRRRRRRRRRRRRRK",
      "KKKKKKKKKKKKKKKK",
      ".KIIK.KIIK.KIIK.",
      ".KIIK.KIIK.KIIK.",
      "KKKKKKKKKKKKKKKK",
      ".KIIK.KYYK.KIIK.",
      ".KIIK.KYYK.KIIK.",
      ".KIIK.KIIK.KIIK.",
      "KKKKKKKKKKKKKKKK",
      ".KIIK.KIIK.KIIK.",
      ".KIIK.KIIK.KIIK.",
      ".KIIK.KIIK.KIIK.",
      "KKKKKKKKKKKKKKKK",
      "KDDDDDDDDDDDDDDK",
      "KKKKKKKKKKKKKKKK"
    ], { K: "#141013", R: "#9d0208", I: "#64748b", Y: "#f5b700", D: "#334155" });

    const puzzleResetUrl = buildGridDataUrl([
      "......KKKK......",
      ".....KPPPPK.....",
      "....KPPWWPPK....",
      "...KPPWWWWPPK...",
      "...KPPWPPWPPK...",
      "...KPPPPPPPPK...",
      "....KPPPPPPK....",
      ".....KKKKKK.....",
      "....KGGGGGGK....",
      "....KGGGGGGK....",
      "...KDDDDDDDDK...",
      "..KDDDDDDDDDDK..",
      "..KKKKKKKKKKKK..",
      "................",
      "................",
      "................"
    ], { K: "#141013", P: "#9d4edd", W: "#e0aaff", G: "#64748b", D: "#334155" });

    const customUrls = {
      push_boulder: pushBoulderUrl,
      push_boulder_lit: pushBoulderLitUrl,
      rune_plate_off: plateOffUrl,
      rune_plate_on: plateOnUrl,
      secret_gate: secretGateUrl,
      puzzle_reset: puzzleResetUrl
    };

    const origGetDataURL = S.getDataURL.bind(S);
    S.getDataURL = function(key) {
      if (customUrls[key]) return customUrls[key];
      return origGetDataURL(key);
    };
  }

  function clearAreaAroundPuzzle(mapObj, cx, cy, radius) {
    if (mapObj.trees) {
      mapObj.trees = mapObj.trees.filter(function(t) {
        return Math.hypot((t.x + 14) - cx, (t.y + 14) - cy) > radius;
      });
    }
    if (mapObj.nodes) {
      mapObj.nodes = mapObj.nodes.filter(function(n) {
        if (n.type === "chest" || n.isPuzzleVaultChest) return true;
        return Math.hypot(n.x - cx, n.y - cy) > radius - 10;
      });
    }
    if (mapObj.monsters) {
      mapObj.monsters.forEach(function(m) {
        if (!m.isBoss && Math.hypot(m.x - cx, m.y - cy) < radius) {
          m.x = Math.max(60, cx - radius - 35);
          m.homeX = m.x;
        }
      });
    }
  }

  function buildPuzzleRoomInMap(mapObj, config) {
    if (!mapObj) return;
    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
    if (!s.solvedPuzzles) s.solvedPuzzles = {};
    if (!s.claimedPuzzleChests) s.claimedPuzzleChests = {};

    mapObj.decos = mapObj.decos || [];
    mapObj.nodes = mapObj.nodes || [];

    const cx = config.cx;
    const cy = config.cy;
    clearAreaAroundPuzzle(mapObj, cx, cy, 125);

    const pGroupId = "puz_" + mapObj.id;
    const isAlreadySolved = Boolean(s.solvedPuzzles[pGroupId]);
    const isChestClaimed = Boolean(s.claimedPuzzleChests[pGroupId]);

    const alreadyHasBoulders = mapObj.decos.some(function(d) { return d.isPushBoulder && d.puzzleGroupId === pGroupId; });
    if (alreadyHasBoulders) {
      const hasChest = mapObj.nodes.some(function(n) { return n.isPuzzleVaultChest && n.puzzleGroupId === pGroupId; });
      if (!hasChest) {
        mapObj.nodes.push({
          id: pGroupId + "_vault_chest",
          x: cx + 96,
          y: cy,
          type: "chest",
          name: "機關秘寶箱",
          opened: isChestClaimed,
          isPuzzleVaultChest: true,
          puzzleGroupId: pGroupId
        });
      }
      return;
    }

    mapObj.decos = mapObj.decos.filter(function(d) { return !d.isPuzzleElement; });
    mapObj.nodes = mapObj.nodes.filter(function(n) { return !n.isPuzzleVaultChest; });

    const vaultX = cx + 96;
    const vaultY = cy;
    const wallOffsets = [
      { dx: -32, dy: -32 },
      { dx: 0,   dy: -32 },
      { dx: 32,  dy: -32 },
      { dx: 32,  dy: 0 },
      { dx: 32,  dy: 32 },
      { dx: 0,   dy: 32 },
      { dx: -32, dy: 32 }
    ];
    wallOffsets.forEach(function(wo, idx) {
      mapObj.decos.push({
        id: pGroupId + "_wall_" + idx,
        x: vaultX + wo.dx,
        y: vaultY + wo.dy,
        sprite: "boulder_block",
        w: 28,
        h: 28,
        solid: true,
        isPuzzleElement: true,
        isPuzzleWall: true
      });
    });

    (config.blockers || []).forEach(function(blk, idx) {
      mapObj.decos.push({
        id: pGroupId + "_blk_" + idx,
        x: cx + blk.dx,
        y: cy + blk.dy,
        sprite: "boulder_block",
        w: 28,
        h: 28,
        solid: true,
        isPuzzleElement: true,
        isPuzzleWall: true
      });
    });

    mapObj.decos.push({
      id: pGroupId + "_gate",
      x: cx + 64,
      y: vaultY,
      sprite: "secret_gate",
      w: 30,
      h: 32,
      solid: !isAlreadySolved,
      cleared: isAlreadySolved,
      isPuzzleElement: true,
      isSecretGate: true,
      puzzleGroupId: pGroupId,
      gateOpened: isAlreadySolved,
      name: "秘密鐵門 [推石解鎖]"
    });

    mapObj.nodes.push({
      id: pGroupId + "_vault_chest",
      x: vaultX,
      y: vaultY,
      type: "chest",
      name: "機關秘寶箱",
      opened: isChestClaimed,
      isPuzzleVaultChest: true,
      puzzleGroupId: pGroupId
    });

    const platesList = config.plates || [];
    platesList.forEach(function(pl, idx) {
      mapObj.decos.push({
        id: pGroupId + "_plate_" + idx,
        x: cx + pl.dx,
        y: cy + pl.dy,
        sprite: isAlreadySolved ? "rune_plate_on" : "rune_plate_off",
        w: 28,
        h: 28,
        solid: false,
        isPuzzleElement: true,
        isRunePlate: true,
        activated: isAlreadySolved,
        puzzleGroupId: pGroupId
      });
    });

    // ★ Cross-Check 修正：未鎖定時將 solid 設為 false，交由本模組直接攔截碰撞並轉化為推動，避免底層 v6.7 吃掉移動向量！
    (config.boulders || []).forEach(function(b, idx) {
      const targetPlate = platesList[idx] || b;
      const initX = cx + (isAlreadySolved ? targetPlate.dx : b.dx);
      const initY = cy + (isAlreadySolved ? targetPlate.dy : b.dy);

      mapObj.decos.push({
        id: pGroupId + "_boulder_" + idx,
        x: initX,
        y: initY,
        homeX: cx + b.dx,
        homeY: cy + b.dy,
        sprite: isAlreadySolved ? "push_boulder_lit" : "push_boulder",
        w: 28,
        h: 28,
        solid: isAlreadySolved,
        isPuzzleElement: true,
        isPushBoulder: true,
        onPlate: isAlreadySolved,
        locked: isAlreadySolved,
        iceSlide: Boolean(config.iceSlide),
        puzzleGroupId: pGroupId
      });
    });

    if (!isAlreadySolved) {
      mapObj.decos.push({
        id: pGroupId + "_reset",
        x: cx - 96,
        y: cy - 64,
        sprite: "puzzle_reset",
        w: 26,
        h: 28,
        solid: true,
        isPuzzleElement: true,
        isPuzzleReset: true,
        puzzleGroupId: pGroupId,
        name: "🔄重置石碑"
      });
    }
  }

  const ZONE_PUZZLE_CONFIGS = {
    cave1_mushroom: {
      cx: 420,
      cy: 290,
      iceSlide: false,
      plates:   [{ dx: 0, dy: -64 }, { dx: 32, dy: -32 }, { dx: 0, dy: 64 }],
      blockers: [{ dx: -32, dy: -32 }, { dx: -32, dy: 32 }],
      boulders: [{ dx: 0, dy: -32 }, { dx: -32, dy: 0 }, { dx: -64, dy: 32 }]
    },
    zone2_canyon: {
      cx: 600,
      cy: 310,
      iceSlide: false,
      plates:   [{ dx: 0, dy: -64 }, { dx: 32, dy: -32 }, { dx: 32, dy: 32 }],
      blockers: [{ dx: -32, dy: 0 }, { dx: -32, dy: 64 }],
      boulders: [{ dx: 0, dy: -32 }, { dx: 0, dy: 0 }, { dx: -32, dy: 32 }]
    },
    zone4_snow: {
      cx: 560,
      cy: 300,
      iceSlide: true,
      plates:   [{ dx: 0, dy: -64 }, { dx: 32, dy: -32 }, { dx: 0, dy: 64 }],
      blockers: [{ dx: -64, dy: -64 }, { dx: -32, dy: 32 }],
      boulders: [{ dx: 0, dy: 0 }, { dx: -64, dy: 0 }, { dx: -32, dy: -32 }]
    },
    zone5_volcano: {
      cx: 540,
      cy: 300,
      iceSlide: false,
      plates:   [{ dx: 0, dy: -64 }, { dx: 32, dy: -32 }, { dx: 32, dy: 32 }],
      blockers: [{ dx: -64, dy: 0 }, { dx: 0, dy: -32 }, { dx: -32, dy: 64 }],
      boulders: [{ dx: -32, dy: -32 }, { dx: 0, dy: 0 }, { dx: -32, dy: 32 }]
    }
  };

  const ISLAND_PUZZLE_ZONES = ["island_coral", "island_wreck", "dungeon_abyss", "island_volcano"];

  function ensureMapPuzzleInjected(mapObj) {
    if (!mapObj) return mapObj;
    const tokenKey = mapObj._refreshToken || "init";
    if (mapObj._puzzleInjectedToken === tokenKey) return mapObj;

    if (ZONE_PUZZLE_CONFIGS[mapObj.id]) {
      mapObj._puzzleInjectedToken = tokenKey;
      buildPuzzleRoomInMap(mapObj, ZONE_PUZZLE_CONFIGS[mapObj.id]);
    } else if (ISLAND_PUZZLE_ZONES.indexOf(mapObj.id) !== -1) {
      mapObj._puzzleInjectedToken = tokenKey;
      buildPuzzleRoomInMap(mapObj, {
        cx: 740,
        cy: 310,
        iceSlide: false,
        plates:   [{ dx: 0, dy: -64 }, { dx: 32, dy: -32 }, { dx: 32, dy: 32 }],
        blockers: [{ dx: -32, dy: 0 }, { dx: -32, dy: 64 }],
        boulders: [{ dx: 0, dy: -32 }, { dx: 0, dy: 0 }, { dx: -32, dy: 32 }]
      });
    }
    return mapObj;
  }

  const PuzzleManager = {
    lastPushTime: 0,

    isGroupSolved: function(groupId) {
      const s = window.Aetheria.State && window.Aetheria.State.data;
      return Boolean(s && s.solvedPuzzles && s.solvedPuzzles[groupId]);
    },

    isBoulderSpotBlocked: function(mapObj, boulder, tx, ty) {
      if (tx < 45 || tx > (mapObj.width || 640) - 55 || ty < 55 || ty > (mapObj.height || 480) - 55) {
        return true;
      }
      if (mapObj.hasRiver) {
        const rx = mapObj.riverX || 1030;
        if (tx > rx - 24 && tx < rx + 50) return true;
      }

      const trees = mapObj.trees || [];
      for (let i = 0; i < trees.length; i++) {
        if (Math.hypot(tx - (trees[i].x + 14), ty - (trees[i].y + 14)) < 24) return true;
      }

      const decos = mapObj.decos || [];
      for (let j = 0; j < decos.length; j++) {
        const d = decos[j];
        if (!d || d.id === boulder.id || d.cleared) continue;
        if (d.isRunePlate) continue;
        if (d.isSecretGate && d.gateOpened) continue;
        if (d.solid || d.isPushBoulder || d.isPuzzleWall || d.obstacleType) {
          if (Math.hypot(tx - d.x, ty - d.y) < 25) return true;
        }
      }

      const nodes = mapObj.nodes || [];
      for (let k = 0; k < nodes.length; k++) {
        const n = nodes[k];
        if (!n.opened && n.type === "chest" && Math.hypot(tx - n.x, ty - n.y) < 24) {
          return true;
        }
      }

      return false;
    },

    tryPushBoulder: function(mapObj, boulder, dirX, dirY) {
      const now = performance.now();
      if (now - this.lastPushTime < 190) return false;

      if (boulder.locked || this.isGroupSolved(boulder.puzzleGroupId)) {
        this.lastPushTime = now;
        window.Aetheria.UI.showToast("🔒 符文機關已解開並永久鎖定，巨石不可再移動！");
        return false;
      }

      const stepSize = 32;
      let targetX = boulder.x + dirX * stepSize;
      let targetY = boulder.y + dirY * stepSize;

      if (this.isBoulderSpotBlocked(mapObj, boulder, targetX, targetY)) {
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.showToast("🪨 前方被阻擋無法推動！若卡住可按左上角的【🔄重置石碑】還原。");
        this.lastPushTime = now;
        return false;
      }

      boulder.x = targetX;
      boulder.y = targetY;

      const hitPlateFirst = this.checkSingleBoulderOnPlate(mapObj, boulder);
      if (boulder.iceSlide && !hitPlateFirst) {
        const slideX = boulder.x + dirX * stepSize;
        const slideY = boulder.y + dirY * stepSize;
        if (!this.isBoulderSpotBlocked(mapObj, boulder, slideX, slideY)) {
          boulder.x = slideX;
          boulder.y = slideY;
        }
      }

      this.lastPushTime = now;
      window.Aetheria.Audio.sfxGather();
      this.evaluatePuzzleState(mapObj, boulder.puzzleGroupId);
      return true;
    },

    checkSingleBoulderOnPlate: function(mapObj, boulder) {
      const plates = (mapObj.decos || []).filter(function(d) {
        return d.isRunePlate && d.puzzleGroupId === boulder.puzzleGroupId;
      });
      for (let i = 0; i < plates.length; i++) {
        if (Math.hypot(boulder.x - plates[i].x, boulder.y - plates[i].y) < 18) {
          boulder.x = plates[i].x;
          boulder.y = plates[i].y;
          return true;
        }
      }
      return false;
    },

    evaluatePuzzleState: function(mapObj, groupId) {
      const s = window.Aetheria.State.data;
      if (!s.solvedPuzzles) s.solvedPuzzles = {};

      const decos = mapObj.decos || [];
      const plates = decos.filter(function(d) { return d.isRunePlate && d.puzzleGroupId === groupId; });
      const boulders = decos.filter(function(d) { return d.isPushBoulder && d.puzzleGroupId === groupId; });
      const gate = decos.find(function(d) { return d.isSecretGate && d.puzzleGroupId === groupId; });
      const resetStone = decos.find(function(d) { return d.isPuzzleReset && d.puzzleGroupId === groupId; });

      boulders.forEach(function(b) {
        b.onPlate = false;
        b.sprite = "push_boulder";
      });

      let activeCount = 0;
      plates.forEach(function(pl) {
        const matchedBoulder = boulders.find(function(b) {
          return Math.hypot(b.x - pl.x, b.y - pl.y) < 18;
        });
        if (matchedBoulder) {
          pl.activated = true;
          pl.sprite = "rune_plate_on";
          matchedBoulder.x = pl.x;
          matchedBoulder.y = pl.y;
          matchedBoulder.onPlate = true;
          matchedBoulder.sprite = "push_boulder_lit";
          activeCount++;
        } else {
          pl.activated = false;
          pl.sprite = "rune_plate_off";
        }
      });

      if (plates.length > 0 && activeCount >= plates.length) {
        s.solvedPuzzles[groupId] = true;
        boulders.forEach(function(b) {
          b.locked = true;
          b.solid = true;
          b.onPlate = true;
          b.sprite = "push_boulder_lit";
        });
        if (gate) {
          gate.gateOpened = true;
          gate.solid = false;
          gate.cleared = true;
        }
        if (resetStone) {
          resetStone.cleared = true;
          resetStone.solid = false;
        }
        window.Aetheria.State.save();
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.UI.spawnFloatingText("🔓秘密通道開啟!", "#5ac54f", true);
        window.Aetheria.UI.showToast("✨ 轟隆隆……三塊符文石板共鳴成功！巨石已永久鎖定，【秘密通道鐵門】已開啟！");
      }
    },

    resetPuzzleGroup: function(mapObj, groupId) {
      if (this.isGroupSolved(groupId)) {
        window.Aetheria.UI.showToast("🔒 此處機關已成功解開並永久鎖定，無須重置！");
        return;
      }
      const decos = mapObj.decos || [];
      decos.forEach(function(d) {
        if (d.isPushBoulder && d.puzzleGroupId === groupId) {
          d.x = d.homeX;
          d.y = d.homeY;
          d.onPlate = false;
          d.sprite = "push_boulder";
        }
        if (d.isRunePlate && d.puzzleGroupId === groupId) {
          d.activated = false;
          d.sprite = "rune_plate_off";
        }
      });
      window.Aetheria.Audio.sfxTalkBlip();
      window.Aetheria.UI.showToast("🔄 符文巨石已還原至初始位置！");
    }
  };

  window.Aetheria.Puzzles = PuzzleManager;

  function hookSystemsForPuzzles() {
    const Maps = window.Aetheria.Data && window.Aetheria.Data.Maps;
    const Exp  = window.Aetheria.Explore;
    const Ren  = window.Aetheria.Renderer;

    if (Maps && Maps.getMap) {
      const origGetMap = Maps.getMap.bind(Maps);
      Maps.getMap = function(zoneId) {
        const m = origGetMap(zoneId);
        if (m) ensureMapPuzzleInjected(m);
        return m;
      };
    }

    if (Exp) {
      const origUpdateStep = Exp.updateStep.bind(Exp);
      Exp.updateStep = function() {
        const s = window.Aetheria.State.data;
        const prevX = s.heroX;
        const prevY = s.heroY;

        origUpdateStep();

        if (!this.isMoving) return;
        const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
        if (!mapObj || !mapObj.decos) return;

        // 以主角嘗試移動的方向向量偵測是否頂推巨石（不受底層 solid 影響）
        const nextCheckX = s.heroX !== prevX ? s.heroX : (prevX + (this.moveDX || 0) * 3);
        const nextCheckY = s.heroY !== prevY ? s.heroY : (prevY + (this.moveDY || 0) * 3);

        for (let i = 0; i < mapObj.decos.length; i++) {
          const d = mapObj.decos[i];
          if (!d || d.cleared) continue;

          if ((d.isSecretGate && !d.gateOpened) || d.isPuzzleWall) {
            if (Math.hypot(nextCheckX - d.x, nextCheckY - d.y) < 23) {
              s.heroX = prevX;
              s.heroY = prevY;
              if (d.isSecretGate) {
                window.Aetheria.UI.showToast("🔒 遠古封印鐵門緊閉！請將左方 3 顆【符文巨石】推上所有【感應石板】解鎖！");
              }
              return;
            }
          }

          if (d.isPushBoulder && Math.hypot(nextCheckX - d.x, nextCheckY - d.y) < 25) {
            s.heroX = prevX;
            s.heroY = prevY;

            if (d.locked || PuzzleManager.isGroupSolved(d.puzzleGroupId)) {
              return;
            }

            let pushDirX = 0;
            let pushDirY = 0;
            if (Math.abs(this.moveDX || 0) > Math.abs(this.moveDY || 0)) {
              pushDirX = (this.moveDX > 0) ? 1 : -1;
            } else if (Math.abs(this.moveDY || 0) > 0) {
              pushDirY = (this.moveDY > 0) ? 1 : -1;
            } else {
              const dx = d.x - prevX;
              const dy = d.y - prevY;
              if (Math.abs(dx) >= Math.abs(dy)) pushDirX = dx >= 0 ? 1 : -1;
              else pushDirY = dy >= 0 ? 1 : -1;
            }

            PuzzleManager.tryPushBoulder(mapObj, d, pushDirX, pushDirY);
            return;
          }
        }
      };

      const origInteract = Exp.interactNearby.bind(Exp);
      Exp.interactNearby = function() {
        const s = window.Aetheria.State.data;
        const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
        if (mapObj && mapObj.decos) {
          for (let i = 0; i < mapObj.decos.length; i++) {
            const d = mapObj.decos[i];
            if (!d || d.cleared) continue;

            if (d.isPuzzleReset && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 40) {
              PuzzleManager.resetPuzzleGroup(mapObj, d.puzzleGroupId);
              return;
            }

            if (d.isPushBoulder && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 40) {
              if (d.locked || PuzzleManager.isGroupSolved(d.puzzleGroupId)) {
                window.Aetheria.UI.showToast("🔒 符文機關已解開並永久鎖定，巨石不可再移動！");
                return;
              }
              const dx = d.x - s.heroX;
              const dy = d.y - s.heroY;
              let pX = 0, pY = 0;
              if (Math.abs(dx) >= Math.abs(dy)) pX = dx >= 0 ? 1 : -1;
              else pY = dy >= 0 ? 1 : -1;
              PuzzleManager.tryPushBoulder(mapObj, d, pX, pY);
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
            if (!d || d.cleared) continue;
            if (d.isPuzzleReset && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 40) {
              hintEl.innerText = "重置推石";
              return;
            }
            if (d.isPushBoulder && !d.locked && !PuzzleManager.isGroupSolved(d.puzzleGroupId) && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 40) {
              hintEl.innerText = "推動巨石";
              return;
            }
          }
        }
        origHint(mapObj, s);
      };

      const origHarvest = Exp.harvestNode.bind(Exp);
      Exp.harvestNode = function(node) {
        if (node && node.isPuzzleVaultChest) {
          const s = window.Aetheria.State.data;
          if (!s.claimedPuzzleChests) s.claimedPuzzleChests = {};

          // ★ Cross-Check 修正：必須先解開推石秘門才可開啟機關秘寶箱（防止隔牆開啟）
          if (!PuzzleManager.isGroupSolved(node.puzzleGroupId)) {
            window.Aetheria.Audio.sfxWrong();
            window.Aetheria.UI.showToast("🔒 密室鐵門尚未解鎖！請先將 3 顆符文巨石推上感應石板！");
            return;
          }

          if (node.opened || s.claimedPuzzleChests[node.puzzleGroupId]) {
            node.opened = true;
            window.Aetheria.UI.showToast("此機關秘寶箱已經領取過了！");
            return;
          }

          node.opened = true;
          s.claimedPuzzleChests[node.puzzleGroupId] = true;
          window.Aetheria.Audio.sfxLevelUp();

          s.gold += 200;
          s.inventory.seaChart = (s.inventory.seaChart || 0) + 1;
          s.inventory.bombItem = (s.inventory.bombItem || 0) + 2;

          if (s.lv >= 20 || s.currentZone === "zone4_snow" || s.currentZone === "zone5_volcano" || s.currentZone === "island_volcano") {
            s.inventory.obsidian = (s.inventory.obsidian || 0) + 2;
            s.inventory.starIron = (s.inventory.starIron || 0) + 1;
            window.Aetheria.UI.showToast("🏆 首次解開推石密室！獲得【200G、古航海圖+1、熔岩黑曜石+2、深淵星隕鐵+1、炸彈+2】！");
          } else {
            s.inventory.mithril = (s.inventory.mithril || 0) + 2;
            s.inventory.rationFish = (s.inventory.rationFish || 0) + 2;
            window.Aetheria.UI.showToast("🏆 首次解開推石密室！獲得【200G、古航海圖+1、流沙秘銀礦+2、鮮魚乾+2、炸彈+2】！");
          }

          window.Aetheria.State.save();
          window.Aetheria.UI.updateAllHud();
          return;
        }
        origHarvest(node);
      };
    }

    if (Ren && Ren.renderWorld) {
      const origRender = Ren.renderWorld.bind(Ren);
      Ren.renderWorld = function() {
        origRender();
        try {
          const S = window.Aetheria.Data.Sprites;
          Object.keys(this.domPool.decos || {}).forEach(function(k) {
            const item = Ren.domPool.decos[k];
            if (!item || !item.data || !item.el) return;
            const d = item.data;

            if (d.isPushBoulder) {
              item.el.classList.add("puzzle-smooth-slide");
              item.el.style.left = d.x + "px";
              item.el.style.top = d.y + "px";
              item.el.style.zIndex = String(Math.floor(d.y) + 15);
              if (item.img && S) {
                item.img.src = S.getDataURL(d.onPlate ? "push_boulder_lit" : "push_boulder");
              }
              if (item.lbl) {
                item.lbl.style.display = "block";
                item.lbl.className = "dom-label " + (d.onPlate ? "puzzle-lit-lbl" : "puzzle-boulder-lbl");
                item.lbl.innerText = d.locked ? "已鎖定✓" : (d.onPlate ? "符文石✓" : (d.iceSlide ? "滑冰石" : "推石"));
              }
            } else if (d.isRunePlate) {
              item.el.style.zIndex = "4";
              if (item.img && S) {
                item.img.src = S.getDataURL(d.activated ? "rune_plate_on" : "rune_plate_off");
              }
              if (item.lbl) {
                item.lbl.style.display = d.activated ? "none" : "block";
                item.lbl.className = "dom-label portal-lbl";
                item.lbl.innerText = "石板";
              }
            } else if (d.isSecretGate) {
              if (d.gateOpened) {
                item.el.style.display = "none";
              } else {
                item.el.style.display = "block";
                if (item.lbl) {
                  item.lbl.style.display = "block";
                  item.lbl.className = "dom-label puzzle-gate-lbl";
                  item.lbl.innerText = "🔒秘門";
                }
              }
            } else if (d.isPuzzleReset) {
              if (d.cleared) {
                item.el.style.display = "none";
              } else if (item.lbl) {
                item.lbl.style.display = "block";
                item.lbl.className = "dom-label puzzle-reset-lbl";
                item.lbl.innerText = "🔄重置";
              }
            }
          });
        } catch (e) {}
      };
    }
  }

  function initDungeonPuzzlesModule() {
    try {
      injectPuzzleStyles();
      registerPuzzleSprites();
      hookSystemsForPuzzles();

      const s = window.Aetheria.State && window.Aetheria.State.data;
      if (s && window.Aetheria.Data && window.Aetheria.Data.Maps) {
        const curMap = window.Aetheria.Data.Maps.getMap(s.currentZone);
        if (curMap) {
          curMap._puzzleInjectedToken = null;
          ensureMapPuzzleInjected(curMap);
        }
      }
      if (window.Aetheria.Renderer) {
        window.Aetheria.Renderer.builtZoneKey = null;
        window.Aetheria.Renderer.renderWorld();
      }
    } catch (err) {
      console.error("Dungeon Puzzles v8.8 init error:", err);
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(initDungeonPuzzlesModule, 130);
  } else {
    window.addEventListener("load", function() {
      setTimeout(initDungeonPuzzlesModule, 130);
    });
  }
})();
