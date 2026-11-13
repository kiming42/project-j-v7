/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 荒島與洞窟推石解謎機關與秘密通道模組 (dungeon-puzzles.js - v8.0)
 * 模組化獨立擴充檔：
 *   1. 註冊像素圖示：符文巨石 (push_boulder / push_boulder_lit)、感應石板 (rune_plate_off / on)、封印鐵門 (secret_gate)、重置石碑 (puzzle_reset)
 *   2. 支援「十字方向鍵頂推」與「A鍵推動」雙模式滑動巨石，並內建防穿牆碰撞與死角【🔄重置石碑】
 *   3. 當所有巨石推上感應石板，自動開啟【秘密通道鐵門】解鎖【遠古機關秘寶箱】
 *   4. 自動注入至 1-B 蘑菇洞窟、2 峽谷、4 雪原(冰面滑行機關)、5 火山，以及所有隨機荒島與深淵秘境地牢！
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  // ================= 1. 注入推石滑動動畫與機關標籤 CSS =================
  function injectPuzzleStyles() {
    if (document.getElementById("puzzle-v80-styles")) return;
    const style = document.createElement("style");
    style.id = "puzzle-v80-styles";
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

  // ================= 2. 註冊推石、感應石板、秘密鐵門與重置石碑像素圖示 =================
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

    // 符文推石（未到位：藍紋巨石）
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
    ], {
      K: "#141013", L: "#94a3b8", G: "#64748b", D: "#334155", C: "#38b6ff"
    });

    // 符文推石（已壓上石板：翠綠金光巨石）
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
    ], {
      K: "#141013", Y: "#f5b700", G: "#475569", D: "#1e293b", L: "#5ac54f"
    });

    // 地面感應石板（未觸發）
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
    ], {
      K: "#141013", D: "#334155", G: "#1e293b", C: "#38b6ff"
    });

    // 地面感應石板（已觸發）
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
    ], {
      K: "#141013", Y: "#f5b700", L: "#5ac54f", G: "#1e3a2f"
    });

    // 遠古秘密通道鐵門
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
    ], {
      K: "#141013", R: "#9d0208", I: "#64748b", Y: "#f5b700", D: "#334155"
    });

    // 重置機關水晶碑
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
    ], {
      K: "#141013", P: "#9d4edd", W: "#e0aaff", G: "#64748b", D: "#334155"
    });

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

  // ================= 3. 在地圖建立推石密室並自動清空周圍隨機樹石 =================
  function clearAreaAroundPuzzle(mapObj, cx, cy, radius) {
    if (mapObj.trees) {
      mapObj.trees = mapObj.trees.filter(function(t) {
        return Math.hypot((t.x + 14) - cx, (t.y + 14) - cy) > radius;
      });
    }
    if (mapObj.nodes) {
      mapObj.nodes = mapObj.nodes.filter(function(n) {
        if (n.isPuzzleVaultChest) return true;
        return Math.hypot(n.x - cx, n.y - cy) > radius - 10;
      });
    }
    if (mapObj.monsters) {
      mapObj.monsters.forEach(function(m) {
        if (!m.isBoss && Math.hypot(m.x - cx, m.y - cy) < radius) {
          m.x = Math.max(60, cx - radius - 30);
          m.homeX = m.x;
        }
      });
    }
  }

  function buildPuzzleRoomInMap(mapObj, config) {
    if (!mapObj) return;
    mapObj.decos = mapObj.decos || [];
    mapObj.nodes = mapObj.nodes || [];

    // 先移除舊的同 ID 推石機關，確保刷新資源時可重置
    mapObj.decos = mapObj.decos.filter(function(d) {
      return !d.isPuzzleElement;
    });
    mapObj.nodes = mapObj.nodes.filter(function(n) {
      return !n.isPuzzleVaultChest;
    });

    const cx = config.cx;
    const cy = config.cy;
    clearAreaAroundPuzzle(mapObj, cx, cy, 115);

    const pGroupId = "puz_" + mapObj.id;

    // 1. 建造密室圍欄石柱（構成只留正門的秘密寶庫小房間）
    const vaultX = cx + 64;
    const vaultY = cy;
    const wallOffsets = [
      { dx: 0,  dy: -34 },
      { dx: 34, dy: -34 },
      { dx: 34, dy: 0 },
      { dx: 34, dy: 34 },
      { dx: 0,  dy: 34 }
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

    // 2. 密室正門的【遠古封印鐵門】（解開所有感應石板後自動開啟）
    mapObj.decos.push({
      id: pGroupId + "_gate",
      x: vaultX - 28,
      y: vaultY,
      sprite: "secret_gate",
      w: 30,
      h: 32,
      solid: true,
      isPuzzleElement: true,
      isSecretGate: true,
      puzzleGroupId: pGroupId,
      gateOpened: false,
      name: "秘密鐵門 [推石解鎖]"
    });

    // 3. 密室內的【遠古機關秘寶箱】
    mapObj.nodes.push({
      id: pGroupId + "_vault_chest",
      x: vaultX + 6,
      y: vaultY,
      type: "chest",
      name: "機關秘寶箱",
      opened: false,
      isPuzzleVaultChest: true,
      puzzleGroupId: pGroupId
    });

    // 4. 放置感應石板 (Rune Plates)
    (config.plates || []).forEach(function(pl, idx) {
      mapObj.decos.push({
        id: pGroupId + "_plate_" + idx,
        x: cx + pl.dx,
        y: cy + pl.dy,
        sprite: "rune_plate_off",
        w: 28,
        h: 28,
        solid: false,
        isPuzzleElement: true,
        isRunePlate: true,
        activated: false,
        puzzleGroupId: pGroupId
      });
    });

    // 5. 放置可推動的符文巨石 (Pushable Boulders)
    (config.boulders || []).forEach(function(b, idx) {
      mapObj.decos.push({
        id: pGroupId + "_boulder_" + idx,
        x: cx + b.dx,
        y: cy + b.dy,
        homeX: cx + b.dx,
        homeY: cy + b.dy,
        sprite: "push_boulder",
        w: 28,
        h: 28,
        solid: true,
        isPuzzleElement: true,
        isPushBoulder: true,
        onPlate: false,
        iceSlide: Boolean(config.iceSlide),
        puzzleGroupId: pGroupId
      });
    });

    // 6. 放置防卡關【🔄重置石碑】
    mapObj.decos.push({
      id: pGroupId + "_reset",
      x: cx - 72,
      y: cy - 48,
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

  // 各區域專屬推石解謎配置
  const ZONE_PUZZLE_CONFIGS = {
    cave1_mushroom: {
      cx: 420,
      cy: 290,
      iceSlide: false,
      plates:   [{ dx: 0, dy: -32 }, { dx: 0, dy: 32 }],
      boulders: [{ dx: -32, dy: -32 }, { dx: -32, dy: 32 }]
    },
    zone2_canyon: {
      cx: 620,
      cy: 310,
      iceSlide: false,
      plates:   [{ dx: 0, dy: -32 }, { dx: 0, dy: 32 }],
      boulders: [{ dx: -32, dy: 0 }, { dx: 0, dy: 0 }]
    },
    zone4_snow: {
      cx: 580,
      cy: 300,
      iceSlide: true, // 雪原專屬：冰面滑行推石（推一下滑行 2 格！）
      plates:   [{ dx: 0, dy: -32 }, { dx: 0, dy: 32 }],
      boulders: [{ dx: -64, dy: -32 }, { dx: -64, dy: 32 }]
    },
    zone5_volcano: {
      cx: 560,
      cy: 300,
      iceSlide: false,
      plates:   [{ dx: 0, dy: -32 }, { dx: 0, dy: 32 }],
      boulders: [{ dx: -32, dy: -32 }, { dx: 0, dy: 0 }]
    }
  };

  // 為荒島與深淵秘境地牢動態注入推石機關室
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
        cx: 660,
        cy: 310,
        iceSlide: false,
        plates:   [{ dx: 0, dy: -32 }, { dx: 0, dy: 32 }],
        boulders: [{ dx: -32, dy: -32 }, { dx: -32, dy: 32 }]
      });
    }
    return mapObj;
  }

  // ================= 4. 推石移動、碰撞檢查、石板感應與重置核心邏輯 =================
  const PuzzleManager = {
    lastPushTime: 0,

    // 檢查目標座標 (tx, ty) 是否有障礙物阻擋巨石
    isBoulderSpotBlocked: function(mapObj, boulder, tx, ty) {
      if (tx < 45 || tx > (mapObj.width || 640) - 55 || ty < 55 || ty > (mapObj.height || 480) - 55) {
        return true;
      }
      if (mapObj.hasRiver) {
        const rx = mapObj.riverX || 1030;
        if (tx > rx - 24 && tx < rx + 50) return true;
      }

      // 避開樹木
      const trees = mapObj.trees || [];
      for (let i = 0; i < trees.length; i++) {
        if (Math.hypot(tx - (trees[i].x + 14), ty - (trees[i].y + 14)) < 24) return true;
      }

      // 避開其他實心裝飾物、未開鐵門或其他推石
      const decos = mapObj.decos || [];
      for (let j = 0; j < decos.length; j++) {
        const d = decos[j];
        if (!d || d.id === boulder.id || d.cleared) continue;
        if (d.isRunePlate) continue; // 石板可以推上去！
        if (d.isSecretGate && d.gateOpened) continue;
        if (d.solid || d.isPushBoulder || d.isPuzzleWall || d.obstacleType) {
          if (Math.hypot(tx - d.x, ty - d.y) < 25) return true;
        }
      }

      // 避開未開啟的寶箱
      const nodes = mapObj.nodes || [];
      for (let k = 0; k < nodes.length; k++) {
        const n = nodes[k];
        if (!n.opened && n.type === "chest" && Math.hypot(tx - n.x, ty - n.y) < 24) {
          return true;
        }
      }

      return false;
    },

    // 嘗試將指定巨石往 (dirX, dirY) 方向推動 1 格 (32px)
    tryPushBoulder: function(mapObj, boulder, dirX, dirY) {
      const now = performance.now();
      if (now - this.lastPushTime < 190) return false;

      const stepSize = 32;
      let targetX = boulder.x + dirX * stepSize;
      let targetY = boulder.y + dirY * stepSize;

      if (this.isBoulderSpotBlocked(mapObj, boulder, targetX, targetY)) {
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.showToast("🪨 前方被阻擋無法推動！若卡住可按旁邊的【🔄重置石碑】還原。");
        this.lastPushTime = now;
        return false;
      }

      boulder.x = targetX;
      boulder.y = targetY;

      // 若是雪原冰面滑石，且還沒壓到感應石板，會順勢再滑行 1 格！
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

    // 檢查該區所有感應石板是否都已壓上巨石
    evaluatePuzzleState: function(mapObj, groupId) {
      const decos = mapObj.decos || [];
      const plates = decos.filter(function(d) { return d.isRunePlate && d.puzzleGroupId === groupId; });
      const boulders = decos.filter(function(d) { return d.isPushBoulder && d.puzzleGroupId === groupId; });
      const gate = decos.find(function(d) { return d.isSecretGate && d.puzzleGroupId === groupId; });

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

      if (gate && !gate.gateOpened && plates.length > 0 && activeCount >= plates.length) {
        gate.gateOpened = true;
        gate.solid = false;
        gate.cleared = true;
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.UI.spawnFloatingText("🔓秘密通道開啟!", "#5ac54f", true);
        window.Aetheria.UI.showToast("✨ 轟隆隆……所有符文石板已共鳴點亮！【秘密通道鐵門】已開啟！");
      }
    },

    // 重置推石至初始座標
    resetPuzzleGroup: function(mapObj, groupId) {
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

  // ================= 5. 掛載地圖載入、推動碰撞、A鍵互動與即時 DOM 座標更新 =================
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
      // (A) 走路碰撞檢測與「直接頂推巨石」邏輯
      const origUpdateStep = Exp.updateStep.bind(Exp);
      Exp.updateStep = function() {
        const s = window.Aetheria.State.data;
        const prevX = s.heroX;
        const prevY = s.heroY;

        origUpdateStep();

        if (!this.isMoving) return;
        const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
        if (!mapObj || !mapObj.decos) return;

        for (let i = 0; i < mapObj.decos.length; i++) {
          const d = mapObj.decos[i];
          if (!d || d.cleared) continue;

          // 1. 阻擋未開啟的秘密鐵門與密室石牆
          if ((d.isSecretGate && !d.gateOpened) || d.isPuzzleWall) {
            if (Math.hypot(s.heroX - d.x, s.heroY - d.y) < 23) {
              s.heroX = prevX;
              s.heroY = prevY;
              if (d.isSecretGate) {
                window.Aetheria.UI.showToast("🔒 遠古封印鐵門緊閉！請將旁邊的【符文巨石】推上所有【感應石板】解鎖！");
              }
              return;
            }
          }

          // 2. 撞上【符文巨石】時，自動按角色前進方向推動巨石！
          if (d.isPushBoulder && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 24) {
            s.heroX = prevX;
            s.heroY = prevY;

            const dx = d.x - prevX;
            const dy = d.y - prevY;
            let pushDirX = 0;
            let pushDirY = 0;
            if (Math.abs(dx) >= Math.abs(dy)) {
              pushDirX = dx >= 0 ? 1 : -1;
            } else {
              pushDirY = dy >= 0 ? 1 : -1;
            }

            PuzzleManager.tryPushBoulder(mapObj, d, pushDirX, pushDirY);
            return;
          }
        }
      };

      // (B) 按 A 鍵互動：支援按 A 鍵推石、或按 A 鍵觸發【🔄重置石碑】
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

      // (C) 右下角 A 鍵動態提示文字
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
            if (d.isPushBoulder && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 40) {
              hintEl.innerText = "推動巨石";
              return;
            }
          }
        }
        origHint(mapObj, s);
      };

      // (D) 開啟【遠古機關秘寶箱】豐厚獎勵
      const origHarvest = Exp.harvestNode.bind(Exp);
      Exp.harvestNode = function(node) {
        if (node && node.isPuzzleVaultChest) {
          const s = window.Aetheria.State.data;
          node.opened = true;
          window.Aetheria.Audio.sfxLevelUp();

          s.gold += 150;
          s.inventory.seaChart = (s.inventory.seaChart || 0) + 1;
          s.inventory.bombItem = (s.inventory.bombItem || 0) + 2;

          if (s.lv >= 20 || s.currentZone === "zone4_snow" || s.currentZone === "zone5_volcano" || s.currentZone === "island_volcano") {
            s.inventory.obsidian = (s.inventory.obsidian || 0) + 2;
            s.inventory.starIron = (s.inventory.starIron || 0) + 1;
            window.Aetheria.UI.showToast("🏆 解開推石密室！獲得【150G、古航海圖+1、熔岩黑曜石+2、深淵星隕鐵+1、炸彈+2】！");
          } else {
            s.inventory.mithril = (s.inventory.mithril || 0) + 2;
            s.inventory.rationFish = (s.inventory.rationFish || 0) + 2;
            window.Aetheria.UI.showToast("🏆 解開推石密室！獲得【150G、古航海圖+1、流沙秘銀礦+2、鮮魚乾+2、炸彈+2】！");
          }

          window.Aetheria.State.save();
          window.Aetheria.UI.updateAllHud();
          return;
        }
        origHarvest(node);
      };
    }

    // (E) 擴充渲染器：即時同步更新推石滑動後的 (x, y) 座標、貼圖與短標籤
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
                item.lbl.innerText = d.onPlate ? "符文石✓" : (d.iceSlide ? "滑冰石" : "推石");
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
              if (item.lbl) {
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
        if (curMap) ensureMapPuzzleInjected(curMap);
      }
      if (window.Aetheria.Renderer) {
        window.Aetheria.Renderer.builtZoneKey = null;
        window.Aetheria.Renderer.renderWorld();
      }
    } catch (err) {
      console.error("Dungeon Puzzles v8.0 init error:", err);
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
