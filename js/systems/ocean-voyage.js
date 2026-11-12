/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 大航海未知荒島與隨機秘境地牢模組 (ocean-voyage.js - v7.3.1)
 * 修正：1.將營地【⛵航海碼頭】移至奇奇下方空地 (435, 385)，徹底解決與 NPC 重疊問題
 *       2.內建 60FPS 穩定幀率鎖定器與舒適移動速度調節，解決 120Hz 手機與飽食加成導致走太快的問題
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  // ================= 1. 注入航海介面專屬 CSS 樣式 =================
  function injectVoyageStyles() {
    if (document.getElementById("voyage-v73-styles")) return;
    const style = document.createElement("style");
    style.id = "voyage-v73-styles";
    style.textContent = `
      .dom-label.voyage-lbl {
        background: #0f2942;
        color: #ffd166;
        border: 1.5px solid #38b6ff;
        box-shadow: 0 0 6px rgba(56, 182, 255, 0.65);
      }
      .dom-label.campfire-lbl {
        background: #5c2018;
        color: #fff3b0;
        border: 1.5px solid #ff9f1c;
      }
      .voyage-card {
        background: linear-gradient(135deg, #102542 0%, #1d3557 100%);
        border: 2px solid #38b6ff;
        border-radius: 6px;
        padding: 8px 10px;
        margin-bottom: 6px;
        color: #ffffff;
      }
      .voyage-card.locked {
        background: #1a1518;
        border-color: #3d3136;
        opacity: 0.65;
      }
      .voyage-tag {
        display: inline-block;
        background: #0f172a;
        color: #8ce0ff;
        border: 1px solid #38b6ff;
        padding: 1px 6px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 900;
        margin-right: 4px;
      }
    `;
    document.head.appendChild(style);
  }

  // ================= 2. 註冊航海碼頭、帆船與古航海圖像素圖示 =================
  function registerVoyageSprites() {
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

    const dockWheelUrl = buildGridDataUrl([
      ".......YY.......",
      "..Y...YYYY...Y..",
      "...Y.YYKKYY.Y...",
      "....YKKWWKKY....",
      "...YKWWYYWWKY...",
      ".YYKWYDDDDYWKYY.",
      "YYKKWYDDDDYWKKYY",
      ".YYKWYDDDDYWKYY.",
      "...YKWWYYWWKY...",
      "....YKKWWKKY....",
      "...Y.YYKKYY.Y...",
      "..Y..DDDDDD..Y..",
      ".....DDDDDD.....",
      "....KDDDDDDK....",
      "...KDDDDDDDDK...",
      "..KKKKKKKKKKKK.."
    ], {
      K: "#141013", Y: "#f5b700", D: "#8f563b", W: "#d9a066"
    });

    const mapChartUrl = buildGridDataUrl([
      "..KKKKKKKKKKKK..",
      ".KYYYYYYYYYYYYK.",
      ".KSSSSSSSSSSSSK.",
      ".KSBSSSSSSRSSSK.",
      ".KSBBSSSSRRRSSK.",
      ".KSSSSSSSRSSSSK.",
      ".KSSSSXXSSSSSSK.",
      ".KSSSXXXXSSSSSK.",
      ".KSSSSXXSSBBSSK.",
      ".KSSSSSSSBBBSSK.",
      ".KSSSSSSSSSSSSK.",
      ".KYYYYYYYYYYYYK.",
      "..KKKKKKKKKKKK..",
      "................",
      "................",
      "................"
    ], {
      K: "#141013", Y: "#d9a066", S: "#f5e6c4", B: "#3898ff", R: "#e03c4b", X: "#8f563b"
    });

    const customUrls = {
      voyage_dock: dockWheelUrl,
      mat_seaChart: mapChartUrl
    };

    const origGetDataURL = S.getDataURL.bind(S);
    S.getDataURL = function(key) {
      if (customUrls[key]) return customUrls[key];
      return origGetDataURL(key);
    };
  }

  // ================= 3. 註冊新道具【古航海圖殘卷】 =================
  function initVoyageMaterials() {
    const Data = window.Aetheria.Data;
    if (!Data || !Data.MATERIALS) return;

    Data.MATERIALS.seaChart = {
      id: "seaChart",
      name: "古航海圖殘卷",
      tier: 3,
      desc: "【大航海專屬戰利品】探索未知荒島與秘境地牢首領獲得，可於航海碼頭兌換聖碑殘片與高階礦石。"
    };
  }

  // ================= 4. 四大隨機海域與秘境地牢定義 =================
  const VOYAGE_ISLANDS = [
    {
      id: "island_coral",
      name: "迷霧珊瑚荒島",
      shortName: "珊瑚荒島",
      recLv: 3,
      hungerCost: 15,
      theme: "coast",
      bgm: "forest",
      fog: false,
      reqRaft: false,
      desc: "近海未知礁島，隨機生成漂流木箱、原木、藍晶鐵礦、深海珊瑚與水波釣魚點。",
      orePool: ["iron", "iron", "coral", "flint"],
      herbPool: ["wood", "wood", "branch", "herb", "vine"],
      monPool: [
        { name: "荒島寄居蟹", type: "bamboo", lvOffset: 0 },
        { name: "礁岸海妖斥候", type: "skull", lvOffset: 1 }
      ],
      bossConfig: { name: "珊瑚荒島巨蟹王", type: "boss", lvOffset: 2 }
    },
    {
      id: "island_wreck",
      name: "幽靈沉船墓地",
      shortName: "沉船墓地",
      recLv: 10,
      hungerCost: 20,
      theme: "coast",
      bgm: "cave",
      fog: false,
      reqRaft: false,
      desc: "迷霧籠罩的古戰船擱淺區，盛產流沙秘銀礦、幽靈古帆布、荒野亞麻與沉船秘寶箱。",
      orePool: ["mithril", "mithril", "coral", "basalt"],
      herbPool: ["sailCloth", "hemp", "wood", "flower"],
      monPool: [
        { name: "沉船骷髏水手", type: "skull", lvOffset: 0 },
        { name: "深海亡靈舵手", type: "skull", lvOffset: 2 }
      ],
      bossConfig: { name: "沉船墓地幽靈提督", type: "boss", lvOffset: 3 }
    },
    {
      id: "dungeon_abyss",
      name: "深淵秘境地牢",
      shortName: "秘境地牢",
      recLv: 15,
      hungerCost: 20,
      theme: "cave",
      bgm: "cave",
      fog: true,
      reqRaft: false,
      isMultiFloor: true,
      desc: "【無限層數隨機地牢】伸手不見五指的古代迷宮！內含需用【炸彈】炸開的隱藏寶庫與稀有礦脈，層數越深獎勵越豐厚！",
      orePool: ["mithril", "basalt", "obsidian", "iron"],
      herbPool: ["herb", "resin", "flower", "iceLotus"],
      monPool: [
        { name: "秘境暗影骷髏", type: "skull", lvOffset: 0 },
        { name: "深淵晶簇守衛", type: "bamboo", lvOffset: 2 }
      ],
      bossConfig: { name: "深淵秘境鎮守魔像", type: "boss", lvOffset: 3 }
    },
    {
      id: "island_volcano",
      name: "星隕火山孤島",
      shortName: "星隕孤島",
      recLv: 26,
      hungerCost: 25,
      theme: "volcano",
      bgm: "boss",
      fog: false,
      reqRaft: true,
      desc: "【遠洋傳奇孤島】需建造「破浪遠航木筏」方可抵達。遍佈熔岩黑曜石、深淵星隕鐵、世界樹金葉與遠古海龍皇！",
      orePool: ["obsidian", "obsidian", "starIron", "mithril"],
      herbPool: ["goldLeaf", "iceLotus", "magmaScale", "flower"],
      monPool: [
        { name: "孤島熔岩魔將", type: "skull", lvOffset: 0 },
        { name: "星隕烈焰龍侍", type: "bamboo", lvOffset: 2 }
      ],
      bossConfig: { name: "遠古星隕海龍皇", type: "boss", lvOffset: 4 }
    }
  ];

  // ================= 5. 隨機荒島與秘境地牢地圖生成器 =================
  const activeGeneratedMaps = {};

  function randInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function isPointClear(x, y, avoidList, minDist) {
    for (let i = 0; i < avoidList.length; i++) {
      if (Math.hypot(x - avoidList[i].x, y - avoidList[i].y) < minDist) {
        return false;
      }
    }
    return true;
  }

  function generateProceduralIslandMap(islandDef, floorNum) {
    floorNum = floorNum || 1;
    const s = (window.Aetheria.State && window.Aetheria.State.data) || { lv: 1 };
    const W = 1120;
    const H = 640;

    const effLv = Math.max(islandDef.recLv, s.lv + (floorNum - 1) * 2);
    const mapTitle = islandDef.isMultiFloor
      ? (islandDef.shortName + " B" + floorNum + "F")
      : islandDef.shortName;

    const spawnPt = { x: 110, y: 320 };
    const bossPt  = { x: 960, y: 310 };
    const seal1Pt = { x: 540, y: 120 };
    const seal2Pt = { x: 540, y: 520 };
    const firePt  = { x: 195, y: 250 };
    const vaultPt = { x: 520, y: 310 };

    const keyPoints = [spawnPt, bossPt, seal1Pt, seal2Pt, firePt, vaultPt];

    const dirtBlobs = [
      { cx: 140, cy: 320, rx: 95, ry: 75 },
      { cx: 540, cy: 135, rx: 110, ry: 65 },
      { cx: 540, cy: 505, rx: 110, ry: 65 },
      { cx: 540, cy: 320, rx: 130, ry: 85 },
      { cx: 940, cy: 320, rx: 120, ry: 95 }
    ];

    const trees = [];
    const treeCount = 18;
    for (let i = 0; i < treeCount; i++) {
      for (let tries = 0; tries < 15; tries++) {
        const tx = randInt(220, 840);
        const ty = randInt(70, 560);
        if (isPointClear(tx, ty, keyPoints, 78) && isPointClear(tx, ty, trees, 54)) {
          trees.push({ x: tx, y: ty });
          break;
        }
      }
    }

    const seal1Id = "seal_voy_" + islandDef.id + "_" + floorNum + "_1";
    const seal2Id = "seal_voy_" + islandDef.id + "_" + floorNum + "_2";
    const wallId  = "wall_voy_" + Date.now() + "_" + randInt(100, 999);

    const decos = [
      {
        id: "deco_island_fire",
        x: firePt.x,
        y: firePt.y,
        sprite: "campfire",
        w: 26,
        h: 26,
        solid: true,
        isIslandFire: true,
        name: "荒島營火"
      },
      {
        id: seal1Id,
        x: seal1Pt.x,
        y: seal1Pt.y,
        sprite: "seal_pillar_off",
        w: 28,
        h: 34,
        solid: true,
        isSealPillar: true,
        name: "北翼海神柱"
      },
      {
        id: seal2Id,
        x: seal2Pt.x,
        y: seal2Pt.y,
        sprite: "seal_pillar_off",
        w: 28,
        h: 34,
        solid: true,
        isSealPillar: true,
        name: "南翼海神柱"
      },
      {
        id: wallId,
        x: vaultPt.x - 36,
        y: vaultPt.y,
        sprite: "cracked_wall",
        w: 30,
        h: 30,
        solid: true,
        isCrackedWall: true
      },
      {
        id: "obs_boulder_" + randInt(1, 999),
        x: 360,
        y: 190,
        sprite: "boulder_block",
        w: 28,
        h: 28,
        obstacleType: "boulder"
      },
      {
        id: "obs_tree_" + randInt(1, 999),
        x: 360,
        y: 440,
        sprite: "dead_tree",
        w: 28,
        h: 28,
        obstacleType: "deadtree"
      }
    ];

    if (islandDef.theme === "coast") {
      decos.push({
        id: "fish_voy_1",
        x: 260,
        y: 490,
        sprite: "fishing_spot",
        w: 28,
        h: 28,
        isFishingSpot: true
      });
      decos.push({
        id: "deco_wreck_ship",
        x: 740,
        y: 120,
        sprite: "ancient_ship",
        w: 44,
        h: 40,
        solid: true
      });
    } else if (islandDef.fog) {
      decos.push({
        id: "brazier_voy_1",
        x: 280,
        y: 310,
        sprite: "brazier_off",
        w: 26,
        h: 28,
        isBrazier: true
      });
    }

    const nodes = [];
    const matNames = window.Aetheria.Data.MATERIALS || {};

    nodes.push({
      id: "voy_chest_vault_" + Date.now(),
      x: vaultPt.x + 8,
      y: vaultPt.y,
      type: "chest",
      name: "秘境寶箱",
      opened: false,
      isVoyageChest: true,
      floorNum: floorNum
    });

    nodes.push({
      id: "voy_chest_boss_" + Date.now(),
      x: 1035,
      y: 310,
      type: "chest",
      name: "航海秘寶箱",
      opened: false,
      isVoyageChest: true,
      floorNum: floorNum + 1
    });

    for (let m = 0; m < 6; m++) {
      let ox = randInt(230, 860);
      let oy = randInt(80, 550);
      if (!isPointClear(ox, oy, keyPoints, 55)) { ox = 310 + m * 85; oy = 130; }

      let oreKey = islandDef.orePool[m % islandDef.orePool.length];
      if (islandDef.isMultiFloor && floorNum >= 3 && m === 0) oreKey = "obsidian";
      if (islandDef.isMultiFloor && floorNum >= 5 && m === 1) oreKey = "starIron";

      const reqLv = (oreKey === "starIron" || oreKey === "obsidian") ? 3 : (oreKey === "mithril" || oreKey === "coral" || oreKey === "basalt") ? 2 : (oreKey === "flint" ? 0 : 1);
      const oName = (matNames[oreKey] && matNames[oreKey].name) || oreKey;

      nodes.push({
        id: "voy_ore_" + m + "_" + Date.now(),
        x: ox,
        y: oy,
        type: "crystal",
        giveKey: oreKey,
        reqTool: "pickaxe",
        reqToolLv: reqLv,
        perfect: (m % 2 === 0 && reqLv >= 1),
        name: oName,
        opened: false
      });
    }

    for (let h = 0; h < 6; h++) {
      let hx = randInt(210, 850);
      let hy = randInt(85, 555);
      if (!isPointClear(hx, hy, keyPoints, 55)) { hx = 300 + h * 85; hy = 490; }

      const herbKey = islandDef.herbPool[h % islandDef.herbPool.length];
      const reqLv = (herbKey === "goldLeaf") ? 3 : (herbKey === "flower" || herbKey === "hemp" || herbKey === "iceLotus") ? 2 : (herbKey === "branch" || herbKey === "sailCloth" ? 0 : 1);
      const hName = (matNames[herbKey] && matNames[herbKey].name) || herbKey;

      nodes.push({
        id: "voy_herb_" + h + "_" + Date.now(),
        x: hx,
        y: hy,
        type: "wood",
        giveKey: herbKey,
        reqTool: "axe",
        reqToolLv: reqLv,
        perfect: false,
        name: hName,
        opened: false
      });
    }

    const monsters = [];
    for (let k = 0; k < 5; k++) {
      const mTemplate = islandDef.monPool[k % islandDef.monPool.length];
      const mx = 310 + k * 115 + randInt(-20, 20);
      const my = (k % 2 === 0) ? randInt(120, 250) : randInt(380, 510);
      monsters.push({
        id: "voy_mon_" + k + "_" + Date.now(),
        name: mTemplate.name,
        lv: effLv + (mTemplate.lvOffset || 0),
        x: mx,
        y: my,
        homeX: mx,
        homeY: my,
        type: mTemplate.type,
        isBoss: false,
        isShiny: (Math.random() < 0.22),
        alive: true
      });
    }

    const bossId = "boss_voy_" + islandDef.id + "_" + floorNum;
    if (s.clearedBosses) delete s.clearedBosses[bossId];

    monsters.push({
      id: "voy_boss_" + Date.now(),
      bossId: bossId,
      name: islandDef.bossConfig.name + (islandDef.isMultiFloor ? ("・B" + floorNum + "F") : ""),
      lv: effLv + (islandDef.bossConfig.lvOffset || 3),
      x: bossPt.x,
      y: bossPt.y,
      homeX: bossPt.x,
      homeY: bossPt.y,
      type: "boss",
      isBoss: true,
      reqSeals: [seal1Id, seal2Id],
      alive: true,
      isVoyageBoss: true
    });

    const portals = [
      {
        id: "p_voyage_return",
        name: "返航營地 ⛵",
        x: 56,
        y: 320,
        targetZone: "camp_hub",
        targetX: 435,
        targetY: 350,
        icon: "door"
      }
    ];

    if (islandDef.isMultiFloor) {
      portals.push({
        id: "p_voyage_next_floor",
        name: "下一層 B" + (floorNum + 1) + "F ▾",
        x: 1065,
        y: 310,
        targetZone: "dungeon_abyss_next",
        targetX: 110,
        targetY: 320,
        reqBoss: bossId,
        reqBossName: islandDef.bossConfig.name,
        icon: "abyss"
      });
    }

    const generated = {
      id: islandDef.id,
      _refreshToken: Date.now(),
      name: mapTitle,
      recLv: effLv,
      floorNum: floorNum,
      bgm: islandDef.bgm,
      theme: islandDef.theme,
      rain: false,
      fog: Boolean(islandDef.fog),
      hasRiver: false,
      width: W,
      height: H,
      dirtBlobs: dirtBlobs,
      trees: trees,
      decos: decos,
      nodes: nodes,
      npcs: [],
      monsters: monsters,
      portals: portals
    };

    activeGeneratedMaps[islandDef.id] = generated;
    return generated;
  }

  // ================= 6. 注入【航海碼頭】至曙光營地（奇奇下方空地）與翡翠海岸 =================
  function injectVoyageDocksIntoWorld(mapObj) {
    if (!mapObj) return mapObj;

    if (mapObj.id === "camp_hub") {
      mapObj.decos = mapObj.decos || [];
      let existing = mapObj.decos.find(function(d) { return d.id === "deco_camp_voyage_dock"; });
      if (existing) {
        existing.x = 435;
        existing.y = 385;
      } else {
        mapObj.decos.push({
          id: "deco_camp_voyage_dock",
          x: 435,
          y: 385,
          sprite: "voyage_dock",
          w: 28,
          h: 28,
          solid: true,
          isVoyageDock: true,
          name: "航海碼頭"
        });
      }
    } else if (mapObj.id === "zone3_coast") {
      mapObj.decos = mapObj.decos || [];
      let existingCoast = mapObj.decos.find(function(d) { return d.id === "deco_coast_voyage_dock"; });
      if (existingCoast) {
        existingCoast.x = 905;
        existingCoast.y = 540;
      } else {
        mapObj.decos.push({
          id: "deco_coast_voyage_dock",
          x: 905,
          y: 540,
          sprite: "voyage_dock",
          w: 30,
          h: 30,
          solid: true,
          isVoyageDock: true,
          name: "遠航碼頭"
        });
      }
    }
    return mapObj;
  }

  function hookMapsForVoyage() {
    const Maps = window.Aetheria.Data && window.Aetheria.Data.Maps;
    if (!Maps) return;

    const origGetMap = Maps.getMap.bind(Maps);
    Maps.getMap = function(zoneId) {
      if (activeGeneratedMaps[zoneId]) {
        return activeGeneratedMaps[zoneId];
      }
      const isVoyageId = VOYAGE_ISLANDS.some(function(v) { return v.id === zoneId; });
      if (isVoyageId) {
        const def = VOYAGE_ISLANDS.find(function(v) { return v.id === zoneId; });
        const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
        return generateProceduralIslandMap(def, s.voyageFloor || 1);
      }

      const m = origGetMap(zoneId);
      if (m && (m.id === "camp_hub" || m.id === "zone3_coast")) {
        injectVoyageDocksIntoWorld(m);
      }
      return m;
    };

    const origRefresh = Maps.refreshAllResources.bind(Maps);
    Maps.refreshAllResources = function() {
      origRefresh();
      const camp = origGetMap("camp_hub");
      const coast = origGetMap("zone3_coast");
      if (camp) injectVoyageDocksIntoWorld(camp);
      if (coast) injectVoyageDocksIntoWorld(coast);
    };

    const initCamp = origGetMap("camp_hub");
    if (initCamp) injectVoyageDocksIntoWorld(initCamp);
  }

  // ================= 7. 大航海羅盤選單、荒島求生營火與兌換處 =================
  const VoyageSystem = {
    openVoyageModal: function(activeTab) {
      activeTab = activeTab || "sail";
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const curHunger = (s.hunger !== undefined) ? s.hunger : 100;
      const chartCount = (s.inventory && s.inventory.seaChart) || 0;
      const maxDepth = s.maxDungeonDepth || 1;
      const self = this;

      window.Aetheria.UI.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML =
        S.iconHtml("voyage_dock") + "大航海羅盤 (飽食 " + curHunger + "%｜航海圖 x" + chartCount + ")";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const tabBar = document.createElement("div");
      tabBar.style.cssText = "display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:8px;";
      [
        { id: "sail",     label: "⛵ 揚帆未知海域" },
        { id: "exchange", label: "🗺️ 古航海圖兌換 (" + chartCount + ")" }
      ].forEach(function(t) {
        const b = document.createElement("button");
        b.className = "na-btn" + (activeTab === t.id ? " highlight" : "");
        b.innerText = t.label;
        b.onclick = function() { self.openVoyageModal(t.id); };
        tabBar.appendChild(b);
      });
      body.appendChild(tabBar);

      if (activeTab === "sail") {
        const intro = document.createElement("div");
        intro.className = "sys-card-scroll";
        intro.innerHTML =
          '<b>🧭 未知荒島與隨機秘境地牢探索</b>' +
          '<div style="font-size:12px; color:#5c3824; margin-top:2px;">' +
            '每次出海都會<b>隨機生成全新的島嶼迷宮、高純度礦脈、隱藏炸彈密室與首領</b>！請備妥充足【口糧】、【松脂火把】與【爆破炸彈】！(秘境地牢最高紀錄：<b>B' + maxDepth + 'F</b>)' +
          '</div>';
        body.appendChild(intro);

        const hasWeapon = window.Aetheria.State.hasWeaponEquipped();
        const raftBuilt = Boolean(s.projectsBuilt && s.projectsBuilt.proj_z3_raft);

        VOYAGE_ISLANDS.forEach(function(isl) {
          const lvOk = s.lv >= Math.max(1, isl.recLv - 4);
          const raftOk = !isl.reqRaft || raftBuilt;
          const unlocked = hasWeapon && lvOk && raftOk;

          const card = document.createElement("div");
          card.className = "voyage-card" + (unlocked ? "" : " locked");

          let lockReason = "";
          if (!hasWeapon) lockReason = "需先修復巴爾熔爐取得新手忍刀";
          else if (!raftOk) lockReason = "需先於第3區海岸建造【破浪遠航木筏】";
          else if (!lvOk) lockReason = "建議達到 Lv." + Math.max(1, isl.recLv - 4) + " 後出航";

          card.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">' +
              '<div>' +
                '<b style="color:var(--na-gold); font-size:14px;">' + isl.name + '</b> ' +
                '<span class="voyage-tag">推薦 Lv.' + isl.recLv + '+</span>' +
                '<span class="voyage-tag">耗飽食 ' + isl.hungerCost + '%</span>' +
              '</div>' +
              (unlocked
                ? '<button class="na-btn highlight" style="padding:5px 12px; white-space:nowrap;" onclick="Aetheria.Voyage.setSailTo(\'' + isl.id + '\', 1)">揚帆出航</button>'
                : '<span style="font-size:11px; color:#ff758f; font-weight:bold;">🔒未解鎖</span>') +
            '</div>' +
            '<div style="font-size:12px; color:#cbd5e1; margin-top:4px;">' + isl.desc + '</div>' +
            (!unlocked ? '<div style="font-size:11px; color:#ffd166; margin-top:3px;">解鎖條件：' + lockReason + '</div>' : '');

          body.appendChild(card);
        });
      } else {
        const exIntro = document.createElement("div");
        exIntro.className = "sys-card-scroll";
        exIntro.innerHTML =
          '<b>🗺️ 遠古航海圖殘卷寶庫（持有：' + chartCount + ' 卷）</b>' +
          '<div style="font-size:12px; color:#5c3824; margin-top:2px;">' +
            '擊敗荒島與秘境地牢的守關首領，或開啟裂縫岩壁後的秘境寶箱，均可獲得【古航海圖殘卷】！' +
          '</div>';
        body.appendChild(exIntro);

        const rewards = [
          { id: "ex_shard",    name: "兌換【古文明聖碑殘片 x1】", cost: 2, toKey: "tabletShard", toCount: 1 },
          { id: "ex_mithril",  name: "兌換【流沙秘銀礦 x2】",     cost: 1, toKey: "mithril",     toCount: 2 },
          { id: "ex_coral",    name: "兌換【深海珊瑚 x2】",       cost: 1, toKey: "coral",       toCount: 2 },
          { id: "ex_obsidian", name: "兌換【熔岩黑曜石 x2】",     cost: 2, toKey: "obsidian",    toCount: 2 },
          { id: "ex_star",     name: "兌換【深淵星隕鐵 x2】",     cost: 3, toKey: "starIron",    toCount: 2 }
        ];

        rewards.forEach(function(r) {
          const canEx = chartCount >= r.cost;
          const row = document.createElement("div");
          row.className = "sys-card";
          row.style.display = "flex";
          row.style.justifyContent = "space-between";
          row.style.alignItems = "center";
          row.innerHTML =
            '<div>' +
              '<b>' + S.iconHtml("mat_" + r.toKey, true) + r.name + '</b>' +
              '<div style="font-size:11px; color:#ffd166;">需消耗：古航海圖殘卷 x' + r.cost + '</div>' +
            '</div>' +
            '<button class="na-btn ' + (canEx ? 'highlight' : '') + '" style="padding:5px 12px;" onclick="Aetheria.Voyage.exchangeChart(\'' + r.toKey + '\', ' + r.toCount + ', ' + r.cost + ')">兌換</button>';
          body.appendChild(row);
        });
      }
    },

    exchangeChart: function(toKey, toCount, cost) {
      const s = window.Aetheria.State.data;
      if ((s.inventory.seaChart || 0) < cost) {
        window.Aetheria.UI.showToast("【古航海圖殘卷】不足！請出海討伐荒島或地牢首領獲取。");
        return;
      }
      s.inventory.seaChart -= cost;
      s.inventory[toKey] = (s.inventory[toKey] || 0) + toCount;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.openVoyageModal("exchange");
      window.Aetheria.UI.updateAllHud();
      const mName = (window.Aetheria.Data.MATERIALS[toKey] && window.Aetheria.Data.MATERIALS[toKey].name) || toKey;
      window.Aetheria.UI.showToast("兌換成功！獲得【" + mName + " x" + toCount + "】！");
    },

    setSailTo: function(islandId, floorNum) {
      floorNum = floorNum || 1;
      const s = window.Aetheria.State.data;
      const isl = VOYAGE_ISLANDS.find(function(v) { return v.id === islandId; });
      if (!isl) return;

      const curHunger = (s.hunger !== undefined) ? s.hunger : 100;
      if (floorNum === 1 && curHunger < isl.hungerCost) {
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.showToast("⚠️ 飽食度不足 " + isl.hungerCost + "% 無法遠航！請先按右下角【口糧】進食或回營地睡覺補充！");
        return;
      }

      if (floorNum === 1) {
        s.hunger = Math.max(0, curHunger - isl.hungerCost);
        window.Aetheria.State.advanceTime(15);
      }

      s.voyageFloor = floorNum;
      if (isl.isMultiFloor) {
        s.maxDungeonDepth = Math.max(s.maxDungeonDepth || 1, floorNum);
      }

      const newMap = generateProceduralIslandMap(isl, floorNum);

      s.currentZone = isl.id;
      s.heroX = 110;
      s.heroY = 320;
      s.petX = 88;
      s.petY = 324;
      s.facing = "right";

      if (window.Aetheria.Renderer) {
        window.Aetheria.Renderer.builtZoneKey = null;
      }

      window.Aetheria.Audio.playBgm(newMap.bgm || "forest");
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      window.Aetheria.UI.closePanelToExplore();

      if (floorNum === 1 && Math.random() < 0.18) {
        s.inventory.rationFish = (s.inventory.rationFish || 0) + 1;
        s.gold += 40;
        window.Aetheria.UI.showToast("⛵ 航行奇遇！打撈起海上漂流桶，額外獲【炭烤鮮魚乾+1、40G】！已登陸【" + newMap.name + "】！");
      } else {
        window.Aetheria.UI.showToast("⛵ 揚帆抵達【" + newMap.name + "】！解開南北雙海神柱即可討伐守島首領！");
      }
    },

    openIslandCampfireModal: function() {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const inv = s.inventory;

      window.Aetheria.UI.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = S.iconHtml("campfire") + "荒島求生營火 (飽食 " + (s.hunger || 0) + "%｜HP " + s.hp + "/" + s.maxHp + ")";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const warmCard = document.createElement("div");
      warmCard.className = "sys-card-scroll";
      warmCard.innerHTML =
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
          '<div>' +
            '<b>🔥 投入枯枝生火取暖 (持有枯枝：' + (inv.branch || 0) + ')</b>' +
            '<div style="font-size:12px; color:#5c3824;">消耗散落枯枝 x1，立即恢復 +60 HP 與 +20% 飽食度，並照亮周圍 120 步！</div>' +
          '</div>' +
          '<button class="na-btn ' + ((inv.branch || 0) > 0 ? 'highlight' : '') + '" style="padding:6px 12px;" onclick="Aetheria.Voyage.stokeIslandFire()">添柴取暖</button>' +
        '</div>';
      body.appendChild(warmCard);

      const roastList = [
        { name: "即場炭烤【鮮魚乾 x2】(+60%飽食)", fromKey: "fish", toKey: "rationFish", count: 2 },
        { name: "即場烘烤【微光菇乾 x2】(+35%飽食)", fromKey: "herb", toKey: "rationHerb", count: 2 },
        { name: "即場紮製【松脂火把 x2】(地牢照明)", fromKey: "resin", toKey: "torchItem", count: 2 }
      ];

      roastList.forEach(function(item) {
        const haveFrom = inv[item.fromKey] || 0;
        const fromMat = window.Aetheria.Data.MATERIALS[item.fromKey] || { name: item.fromKey };
        const row = document.createElement("div");
        row.className = "sys-card";
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";
        row.innerHTML =
          '<div>' +
            '<b>' + S.iconHtml("mat_" + item.toKey, true) + item.name + '</b>' +
            '<div style="font-size:11px; color:#cbd5e1;">需消耗：' + fromMat.name + ' x1（持有 ' + haveFrom + '）</div>' +
          '</div>' +
          '<button class="na-btn ' + (haveFrom > 0 ? 'highlight' : '') + '" style="padding:5px 12px;" onclick="Aetheria.Voyage.fieldCraftAtFire(\'' + item.fromKey + '\', \'' + item.toKey + '\', ' + item.count + ')">製作</button>';
        body.appendChild(row);
      });
    },

    stokeIslandFire: function() {
      const s = window.Aetheria.State.data;
      if ((s.inventory.branch || 0) <= 0) {
        window.Aetheria.UI.showToast("沒有【散落枯枝】！可在島上徒手拾取枯枝。");
        return;
      }
      s.inventory.branch--;
      s.torchTicks = Math.max(s.torchTicks || 0, 120);
      window.Aetheria.State.restoreHunger(20, 60);
      window.Aetheria.Audio.sfxLevelUp();
      this.openIslandCampfireModal();
      window.Aetheria.UI.updateAllHud();
      window.Aetheria.UI.showToast("🔥 營火熊熊燃燒！恢復 +60 HP、+20% 飽食度，並獲得 120 步火光照明！");
    },

    fieldCraftAtFire: function(fromKey, toKey, count) {
      const s = window.Aetheria.State.data;
      if ((s.inventory[fromKey] || 0) <= 0) {
        window.Aetheria.UI.showToast("所需原料不足！");
        return;
      }
      s.inventory[fromKey]--;
      s.inventory[toKey] = (s.inventory[toKey] || 0) + count;
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();
      this.openIslandCampfireModal();
      window.Aetheria.UI.updateAllHud();
      const toMat = window.Aetheria.Data.MATERIALS[toKey] || { name: toKey };
      window.Aetheria.UI.showToast("荒島營火製作成功：獲得【" + toMat.name + " x" + count + "】！");
    }
  };

  window.Aetheria.Voyage = VoyageSystem;

  // ================= 8. 掛載 60FPS 穩定步速調節器、探索與首領獎勵 =================
  function hookSystemsForVoyage() {
    const Exp = window.Aetheria.Explore;
    const Ren = window.Aetheria.Renderer;
    const Bat = window.Aetheria.Battle;

    if (Exp) {
      // 修正 120Hz 高刷手機與飽食度加成導致移動過快的問題：鎖定 60FPS 時間步並將移動速度調回舒適節奏
      let lastStepTime = 0;
      const origUpdateStep = Exp.updateStep.bind(Exp);
      Exp.updateStep = function() {
        const now = performance.now();
        if (now - lastStepTime < 15.5) {
          return; // 在 120Hz 手機上自動跳過多餘幀，確保與 60Hz 速度完全一致
        }
        lastStepTime = now;

        // 稍微調降方向移動量 (0.76x)，抵銷飽食度 1.12x 加速，令角色操控精準不飄移
        const savedDX = this.moveDX;
        const savedDY = this.moveDY;
        if (this.isMoving) {
          this.moveDX = savedDX * 0.76;
          this.moveDY = savedDY * 0.76;
        }
        origUpdateStep();
        this.moveDX = savedDX;
        this.moveDY = savedDY;
      };

      const origInteract = Exp.interactNearby.bind(Exp);
      Exp.interactNearby = function() {
        const s = window.Aetheria.State.data;
        const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
        if (mapObj && mapObj.decos) {
          for (let i = 0; i < mapObj.decos.length; i++) {
            const d = mapObj.decos[i];
            if (Math.hypot(s.heroX - d.x, s.heroY - d.y) < 40) {
              if (d.isVoyageDock) {
                window.Aetheria.Audio.sfxTalkBlip();
                VoyageSystem.openVoyageModal("sail");
                return;
              }
              if (d.isIslandFire) {
                window.Aetheria.Audio.sfxTalkBlip();
                VoyageSystem.openIslandCampfireModal();
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
            if (Math.hypot(s.heroX - d.x, s.heroY - d.y) < 40) {
              if (d.isVoyageDock) { hintEl.innerText = "出海航行"; return; }
              if (d.isIslandFire) { hintEl.innerText = "荒島營火"; return; }
            }
          }
        }
        origHint(mapObj, s);
      };

      const origPortal = Exp.triggerPortal.bind(Exp);
      Exp.triggerPortal = function(portal) {
        const s = window.Aetheria.State.data;
        if (portal && portal.targetZone === "dungeon_abyss_next") {
          if (portal.reqBoss && !(s.clearedBosses && s.clearedBosses[portal.reqBoss])) {
            s.heroX -= 28;
            window.Aetheria.Audio.sfxWrong();
            window.Aetheria.UI.showToast("深淵結界封鎖中！必須先解開南北雙海神柱並擊敗本層首領才可深入下一層！");
            return;
          }
          const nextF = (s.voyageFloor || 1) + 1;
          VoyageSystem.setSailTo("dungeon_abyss", nextF);
          return;
        }
        origPortal(portal);
      };

      const origHarvest = Exp.harvestNode.bind(Exp);
      Exp.harvestNode = function(node) {
        if (node && node.type === "chest" && node.isVoyageChest) {
          const s = window.Aetheria.State.data;
          node.opened = true;
          window.Aetheria.Audio.sfxLevelUp();

          s.inventory.seaChart = (s.inventory.seaChart || 0) + 1;
          s.inventory.rationFish = (s.inventory.rationFish || 0) + 1;
          const depth = node.floorNum || 1;

          if (depth >= 3 || s.currentZone === "island_volcano") {
            s.inventory.obsidian = (s.inventory.obsidian || 0) + 1;
            s.inventory.starIron = (s.inventory.starIron || 0) + 1;
            window.Aetheria.UI.showToast("開啟深淵秘寶箱：獲【古航海圖殘卷+1、深淵星隕鐵+1、熔岩黑曜石+1、鮮魚乾+1】！");
          } else {
            s.inventory.mithril = (s.inventory.mithril || 0) + 1;
            s.inventory.coral = (s.inventory.coral || 0) + 1;
            window.Aetheria.UI.showToast("開啟荒島秘寶箱：獲【古航海圖殘卷+1、流沙秘銀礦+1、深海珊瑚+1、鮮魚乾+1】！");
          }

          window.Aetheria.State.save();
          window.Aetheria.UI.updateAllHud();
          return;
        }
        origHarvest(node);
      };
    }

    if (Bat && Bat.winBattle) {
      const origWin = Bat.winBattle.bind(Bat);
      Bat.winBattle = function() {
        const ref = this.mapMonsterRef;
        const isVoyBoss = Boolean(ref && ref.isVoyageBoss);
        origWin();
        if (isVoyBoss) {
          const s = window.Aetheria.State.data;
          s.inventory.seaChart = (s.inventory.seaChart || 0) + 1;
          window.Aetheria.State.save();
          setTimeout(function() {
            window.Aetheria.UI.showToast("🗺️ 討伐海域首領成功！額外獲得【古航海圖殘卷 +1】！可回航海碼頭兌換聖碑殘片！");
          }, 500);
        }
      };
    }

    if (Ren && Ren.renderWorld) {
      const origRender = Ren.renderWorld.bind(Ren);
      Ren.renderWorld = function() {
        origRender();
        try {
          Object.keys(this.domPool.decos || {}).forEach(function(k) {
            const item = Ren.domPool.decos[k];
            if (!item || !item.lbl || !item.data) return;
            const d = item.data;
            if (d.isVoyageDock) {
              item.lbl.style.display = "block";
              item.lbl.className = "dom-label voyage-lbl";
              item.lbl.innerText = "⛵航海碼頭";
            } else if (d.isIslandFire) {
              item.lbl.style.display = "block";
              item.lbl.className = "dom-label campfire-lbl";
              item.lbl.innerText = "🔥荒島營火";
            }
          });
        } catch (e) {}
      };
    }
  }

  function initOceanVoyageModule() {
    try {
      injectVoyageStyles();
      registerVoyageSprites();
      initVoyageMaterials();
      hookMapsForVoyage();
      hookSystemsForVoyage();

      if (window.Aetheria.Renderer) {
        window.Aetheria.Renderer.builtZoneKey = null;
        window.Aetheria.Renderer.renderWorld();
      }
    } catch (err) {
      console.error("Ocean Voyage v7.3.1 module init error:", err);
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(initOceanVoyageModule, 55);
  } else {
    window.addEventListener("load", function() {
      setTimeout(initOceanVoyageModule, 55);
    });
  }
})();
