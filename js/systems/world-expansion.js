/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 營地東翼博物館、練功木人樁與野外奇物模組 (world-expansion.js - v9.1 原生融合改善版)
 * 改善重點：
 *   1. 【修復營地動線與樹牆】：營地適度擴闊至 780x480，自動將「翠風森林」入口移至最右緣 (x:735)，並延伸底部海岸樹牆至右界
 *   2. 【建築並排與標籤統一】：博物館與公會/主角/鐵匠帳篷整齊並列於北排 (y:76)，移除重複標籤；所有奇物統一為 2~3 字原生短標籤
 *   3. 【保留野外地圖黃金比例】：不盲目拉闊野外 Boss 身後空地，確保河流、橋樑與小地圖比例 100% 自然準確
 *   4. 【適量精緻奇物】：每區野外僅點綴 1 座【靈泉】、1 座【古石碑】與 2 個【行囊】，畫面乾淨不雜亂
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  // ================= 1. 注入原生風格簡約 CSS =================
  function injectExpansionStyles() {
    if (document.getElementById("world-exp-v91-styles")) return;
    const style = document.createElement("style");
    style.id = "world-exp-v91-styles";
    style.textContent = `
      .exhibit-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
      }
      .exhibit-card {
        background: #181316;
        border: 2px solid #594950;
        border-radius: 6px;
        padding: 7px 8px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 4px;
      }
      .exhibit-card.donated {
        background: linear-gradient(135deg, #1e3a2f 0%, #141013 100%);
        border-color: #f5b700;
        box-shadow: 0 0 6px rgba(245, 183, 0, 0.35);
      }
    `;
    document.head.appendChild(style);
  }

  // ================= 2. 註冊博物館、展示台、練功木人樁與奇物像素圖示 =================
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

    // 🏛️ 博物館帳篷/聖殿外觀 (與營地其他帳篷風格協調的金白榮耀帳篷)
    const museumBldgUrl = buildGridDataUrl([
      ".......YY.......",
      "......YYYY......",
      ".....WWWWWW.....",
      "....WWWWWWWW....",
      "...WYYYYYYYYW...",
      "..WWWWWWWWWWWW..",
      ".WWWWWWWWWWWWWW.",
      "WWWWYYYYYYYYWWWW",
      "WWWWWWWWWWWWWWWW",
      ".WWWWWWYYWWWWWW.",
      ".WWWWWYYYYWWWWW.",
      ".WWWWYYOOYYWWWW.",
      ".WWWWYOOOOYWWWW.",
      ".WWWWYOOOOYWWWW.",
      ".YYYYYOOOOYYYYY.",
      "KKKKKKKKKKKKKKKK"
    ], {
      K: "#141013", Y: "#f5b700", W: "#e2e8f0", O: "#2b2118"
    });

    // 🏆 博物館室內展示台
    const trophyPedestalUrl = buildGridDataUrl([
      "......YYYY......",
      "....YYWWWWYY....",
      "....YYYYYYYY....",
      ".....YYYYYY.....",
      "......YYYY......",
      "....YYYYYYYY....",
      "...KKKKKKKKKK...",
      "..KRRRRRRRRRRK..",
      "..KWWWWWWWWWWK..",
      "..KWWGGGGGGWWK..",
      "..KWWGGGGGGWWK..",
      "..KWWWWWWWWWWK..",
      ".KGGGGGGGGGGGGK.",
      "KKKKKKKKKKKKKKKK",
      "................",
      "................"
    ], {
      K: "#141013", Y: "#f5b700", W: "#ffffff", R: "#e03c4b", G: "#94a3b8"
    });

    // 🥋 練功木人樁
    const trainingDummyUrl = buildGridDataUrl([
      ".....KKKKKK.....",
      "....KLLLLLLK....",
      "....KLKWWKLK....",
      "....KLLLLLLK....",
      ".....KKKKKK.....",
      "KKKKKKKKKKKKKKKK",
      "KYYYYDDDDDDYYYYK",
      "KKKKKDDDDDDKKKKK",
      "....KDRRRRDK....",
      "....KDRWWWRK....",
      "....KDRRRRDK....",
      ".....KDDDDK.....",
      ".....KDDDDK.....",
      "...KKIIIIIIKK...",
      "..KIIIIIIIIIIK..",
      "..KKKKKKKKKKKK.."
    ], {
      K: "#141013", L: "#d9a066", D: "#8f563b", Y: "#f5b700", R: "#e03c4b", W: "#ffffff", I: "#475569"
    });

    // 🎒 探險行囊
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

    // ⛲ 療癒靈泉
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

    // 🗿 遠古石碑
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
      museum_building: museumBldgUrl,
      trophy_pedestal: trophyPedestalUrl,
      training_dummy: trainingDummyUrl,
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

  // ================= 3. 博物館展覽品清單與木人樁升級定義 =================
  const BOSS_TROPHY_EXHIBITS = [
    { id: "tr_bamboo", matKey: "coreBamboo",  name: "千年竹妖木心雕像", zone: "1.翠風森林", atk: 6, hp: 20, rewardGold: 200 },
    { id: "tr_shell",  matKey: "shell",       name: "峽谷領主硬甲標本", zone: "2.流沙峽谷", atk: 6, hp: 20, rewardGold: 220 },
    { id: "tr_siren",  matKey: "coreSiren",   name: "深海海妖淚珠聖盃", zone: "3.翡翠海岸", atk: 8, hp: 25, rewardGold: 260 },
    { id: "tr_ice",    matKey: "iceCrystal",  name: "極寒雪原冰晶王冠", zone: "4.霜語雪原", atk: 8, hp: 25, rewardGold: 300 },
    { id: "tr_magma",  matKey: "magmaScale",  name: "紅蓮炎魔逆鱗巨盾", zone: "5.熔岩火山", atk: 10, hp: 30, rewardGold: 350 },
    { id: "tr_chart",  matKey: "seaChart",    name: "遠洋大航海秘圖卷", zone: "無盡碧海",   atk: 8, hp: 25, rewardGold: 280 },
    { id: "tr_tablet", matKey: "tabletShard", name: "天界古文明聖碑石", zone: "6.天界聖殿", atk: 12, hp: 40, rewardGold: 450 }
  ];

  const NATURE_SPECIMEN_EXHIBITS = [
    { id: "sp_iron",     matKey: "iron",     name: "藍晶鐵礦原石",   def: 4, hp: 15, rewardGold: 100 },
    { id: "sp_herb",     matKey: "herb",     name: "紅傘微光菇標本", def: 4, hp: 15, rewardGold: 100 },
    { id: "sp_mithril",  matKey: "mithril",  name: "流沙秘銀晶簇",   def: 5, hp: 15, rewardGold: 150 },
    { id: "sp_flower",   matKey: "flower",   name: "向陽太陽花標本", def: 5, hp: 15, rewardGold: 150 },
    { id: "sp_coral",    matKey: "coral",    name: "七彩深海珊瑚",   def: 6, hp: 20, rewardGold: 180 },
    { id: "sp_icelotus", matKey: "iceLotus", name: "極地雪蓮永凍花", def: 6, hp: 20, rewardGold: 220 },
    { id: "sp_obsidian", matKey: "obsidian", name: "熔岩黑曜石結晶", def: 8, hp: 25, rewardGold: 260 },
    { id: "sp_stariron", matKey: "starIron", name: "天外深淵星隕鐵", def: 10, hp: 30, rewardGold: 320 }
  ];

  const MILESTONE_REWARDS = [
    {
      id: "ms_lv10",
      title: "初露鋒芒的冒險家 (達到 Lv.10)",
      check: function(s) { return (s.lv || 1) >= 10; },
      gold: 300,
      exp: 150
    },
    {
      id: "ms_lv25",
      title: "艾瑟瑞亞傳奇勇者 (達到 Lv.25)",
      check: function(s) { return (s.lv || 1) >= 25; },
      gold: 800,
      exp: 400
    },
    {
      id: "ms_streak10",
      title: "知識連擊大師 (最高連勝達 10 題)",
      check: function(s) { return (s.maxStreak || 0) >= 10; },
      gold: 400,
      exp: 200
    },
    {
      id: "ms_ship",
      title: "揚帆破浪航海家 (建造木帆船出海)",
      check: function(s) { return (s.boatTier || 0) >= 1 || Boolean(s.projectsBuilt && s.projectsBuilt.proj_z3_raft); },
      gold: 350,
      exp: 180
    },
    {
      id: "ms_puzzle2",
      title: "遺跡解謎智者 (解開至少 2 座推石密室)",
      check: function(s) { return Object.keys((s.solvedPuzzles) || {}).length >= 2; },
      gold: 500,
      exp: 250
    }
  ];

  const DUMMY_TIERS = {
    1: {
      lv: 1,
      name: "Lv.1 翠木機關木人樁",
      atkBonus: 5,
      hpBonus: 15,
      trainExp: 65,
      trainGold: 55,
      desc: "由堅韌原木打造的新手木人樁。永久提供【攻擊力 +5、最大HP +15】，每次擊破獲 65 EXP 與 55 G。"
    },
    2: {
      lv: 2,
      name: "Lv.2 秘銀裝甲木人樁",
      atkBonus: 15,
      hpBonus: 45,
      trainExp: 130,
      trainGold: 110,
      cost: { plank: 2, iron: 2, mithril: 1 },
      desc: "包覆秘銀甲片的進階木人樁。永久提供【攻擊力 +15、最大HP +45】，每次擊破獲 130 EXP 與 110 G！"
    },
    3: {
      lv: 3,
      name: "Lv.3 星隕神機木人樁",
      atkBonus: 30,
      hpBonus: 90,
      initBpBonus: 1,
      trainExp: 220,
      trainGold: 180,
      cost: { obsidian: 1, starIron: 1, seaChart: 1 },
      desc: "鑲嵌星隕鐵的宗師級神機樁！永久提供【攻擊力 +30、最大HP +90、開戰初始 BP +1】，每次擊破獲 220 EXP 與 180 G！"
    }
  };

  function calcMuseumAndDummyBonuses(s) {
    let atk = 0, def = 0, hp = 0;
    if (!s) return { atk: 0, def: 0, hp: 0 };

    const donated = s.museumDonated || {};
    BOSS_TROPHY_EXHIBITS.forEach(function(ex) {
      if (donated[ex.id]) {
        atk += ex.atk;
        hp += ex.hp;
      }
    });
    NATURE_SPECIMEN_EXHIBITS.forEach(function(sp) {
      if (donated[sp.id]) {
        def += sp.def;
        hp += sp.hp;
      }
    });

    const dummyLv = s.dummyLevel || 1;
    const dTier = DUMMY_TIERS[dummyLv] || DUMMY_TIERS[1];
    atk += (dTier.atkBonus || 0);
    hp  += (dTier.hpBonus || 0);

    return { atk: atk, def: def, hp: hp };
  }

  // ================= 4. 建立【博物館室內展廳 (tent_museum)】（與公會/主角帳篷室內格式 100% 一致） =================
  function buildMuseumInteriorMap() {
    return {
      id: "tent_museum",
      _refreshToken: Date.now(),
      name: "博物館",
      recLv: 1,
      bgm: "forest",
      theme: "canyon",
      rain: false,
      fog: false,
      hasRiver: false,
      width: 380,
      height: 260,
      dirtBlobs: [{ x: 30, y: 30, w: 320, h: 200, cx: 190, cy: 130, rx: 160, ry: 100 }],
      trees: [],
      decos: [
        { id: "ped_boss_1",    x: 95,  y: 82,  sprite: "trophy_pedestal", w: 28, h: 30, solid: true, isMuseumPedestal: true, tab: "trophies",   name: "領主展台" },
        { id: "ped_milestone", x: 190, y: 78,  sprite: "lore_monolith",   w: 28, h: 32, solid: true, isMuseumPedestal: true, tab: "milestones", name: "榮耀石碑" },
        { id: "ped_nat_1",     x: 285, y: 82,  sprite: "trophy_pedestal", w: 28, h: 30, solid: true, isMuseumPedestal: true, tab: "specimens",  name: "標本展台" },
        { id: "indoor_dummy",  x: 95,  y: 155, sprite: "training_dummy",  w: 28, h: 30, solid: true, isTrainingDummy: true,                   name: "木人樁" },
        { x: 190, y: 145, sprite: "deco_bench", w: 30, h: 16, solid: false }
      ],
      nodes: [],
      npcs: [],
      monsters: [],
      portals: [
        {
          id: "p_exit_museum",
          name: "離開帳篷 ▾",
          x: 190,
          y: 228,
          targetZone: "camp_hub",
          targetX: 622,
          targetY: 182,
          icon: "stairs"
        }
      ]
    };
  }

  // ================= 5. 野外各區奇物配置（保留原版地圖長寬比例，不拉出空白死角） =================
  const WILD_CURIO_CONFIG = {
    zone1_forest:   { rewardKey: "coreBamboo" },
    cave1_mushroom: { rewardKey: "mithril" },
    zone2_canyon:   { rewardKey: "shell" },
    zone3_coast:    { rewardKey: "coreSiren" },
    zone4_snow:     { rewardKey: "iceCrystal" },
    zone5_volcano:  { rewardKey: "magmaScale" },
    zone6_sky:      { rewardKey: "tabletShard" }
  };

  function randBetween(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function findSafeCurioSpot(mapObj, opts) {
    opts = opts || {};
    const W = mapObj.width || 1200;
    const H = mapObj.height || 680;
    const minX = opts.minX || 120;
    const maxX = opts.maxX || (mapObj.hasRiver ? ((mapObj.riverX || 1030) - 70) : (W - 140));
    const minY = opts.minY || 80;
    const maxY = opts.maxY || (H - 80);
    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};

    for (let attempt = 0; attempt < 100; attempt++) {
      const cx = randBetween(minX, Math.max(minX + 40, maxX));
      const cy = randBetween(minY, Math.max(minY + 40, maxY));

      if (mapObj.hasRiver) {
        const rx = mapObj.riverX || 1030;
        if (cx > rx - 45 && cx < rx + 70) continue;
      }

      if (s.currentZone === mapObj.id && Math.hypot(cx - (s.heroX || 0), cy - (s.heroY || 0)) < 65) {
        continue;
      }

      let hitPortal = false;
      (mapObj.portals || []).forEach(function(p) {
        if (Math.hypot(cx - p.x, cy - p.y) < 75) hitPortal = true;
      });
      if (hitPortal) continue;

      let hitTree = false;
      (mapObj.trees || []).forEach(function(t) {
        if (Math.hypot(cx - (t.x + 14), cy - (t.y + 14)) < 40) hitTree = true;
      });
      if (hitTree) continue;

      let hitNpc = false;
      (mapObj.npcs || []).forEach(function(n) {
        if (Math.hypot(cx - n.x, cy - n.y) < 55) hitNpc = true;
      });
      if (hitNpc) continue;

      let hitDeco = false;
      (mapObj.decos || []).forEach(function(d) {
        const rad = d.isPuzzleElement ? 85 : 48;
        if (Math.hypot(cx - d.x, cy - d.y) < rad) hitDeco = true;
      });
      if (hitDeco) continue;

      let hitNode = false;
      (mapObj.nodes || []).forEach(function(n) {
        if (!n.opened && Math.hypot(cx - n.x, cy - n.y) < 42) hitNode = true;
      });
      if (hitNode) continue;

      let hitMon = false;
      (mapObj.monsters || []).forEach(function(m) {
        if (m.alive !== false && Math.hypot(cx - m.x, cy - m.y) < 55) hitMon = true;
      });
      if (hitMon) continue;

      return { x: cx, y: cy };
    }
    return null;
  }

  // ================= 6. 自然融入營地東翼與野外奇物（不破壞原有動線） =================
  function enrichMapNaturally(mapObj) {
    if (!mapObj) return mapObj;
    const token = mapObj._refreshToken || "init";
    if (mapObj._worldExpandedToken === token) return mapObj;
    mapObj._worldExpandedToken = token;

    mapObj.decos = (mapObj.decos || []).filter(function(d) { return !d.isExpandedWorldObj; });

    // (A) 曙光營地 (camp_hub)：精準擴闊至 780x480，讓博物館排在鐵匠帳篷右邊，並將森林入口移至最右緣
    if (mapObj.id === "camp_hub") {
      mapObj.width = 780;
      mapObj.height = 480;

      // 1. 將通往「1.翠風森林」的傳送門移至新右邊界 (x: 735)，不再擋在營地中間！
      (mapObj.portals || []).forEach(function(p) {
        if (p.targetZone === "zone1_forest") {
          p.x = 735;
          p.y = 240;
        }
      });

      // 2. 補齊營地南岸海灘底部的樹牆 (x: 640 ~ 760)，消除斷層感
      mapObj.trees = (mapObj.trees || []).filter(function(t) { return !t.isCampEastBorderTree; });
      [635, 675, 715, 755].forEach(function(tx) {
        mapObj.trees.push({ x: tx, y: 430, isCampEastBorderTree: true });
      });

      // 3. 在北排帳篷區 (y: 76) 並排放置【博物館帳篷】+ 門口傳送點 (與公會/主角/鐵匠帳篷完全對齊！)
      mapObj.decos.push({
        id: "deco_camp_museum_ext",
        x: 595,
        y: 76,
        sprite: "museum_building",
        w: 54,
        h: 48,
        solid: true,
        isMuseumBuilding: true,
        isExpandedWorldObj: true
      });

      mapObj.portals = mapObj.portals || [];
      if (!mapObj.portals.some(function(p) { return p.id === "p_enter_museum"; })) {
        mapObj.portals.push({
          id: "p_enter_museum",
          name: "博物館",
          x: 622,
          y: 138,
          targetZone: "tent_museum",
          targetX: 190,
          targetY: 185,
          icon: "door",
          labelBottom: true
        });
      }

      // 4. 在博物館與鐵匠帳篷之間放置【木人樁】
      mapObj.decos.push({
        id: "deco_camp_dummy",
        x: 548,
        y: 162,
        sprite: "training_dummy",
        w: 28,
        h: 30,
        solid: true,
        isTrainingDummy: true,
        isExpandedWorldObj: true,
        name: "木人樁"
      });

      return mapObj;
    }

    // (B) 野外 1~6 區與荒島：保持原版尺寸比例，僅在安全空地放置 1 座【靈泉】、1 座【古石碑】與 2 個【行囊】
    const wildCfg = WILD_CURIO_CONFIG[mapObj.id];
    const isIsland = ["island_coral", "island_wreck", "dungeon_abyss", "island_volcano"].indexOf(mapObj.id) !== -1;

    if (wildCfg || isIsland) {
      const rewardKey = (wildCfg && wildCfg.rewardKey) || "seaChart";

      // 1 座療癒靈泉
      const spSpot = findSafeCurioSpot(mapObj);
      if (spSpot) {
        mapObj.decos.push({
          id: "exp_spring_" + mapObj.id,
          x: spSpot.x,
          y: spSpot.y,
          sprite: "healing_spring",
          w: 28,
          h: 28,
          solid: true,
          isHealingSpring: true,
          isExpandedWorldObj: true,
          name: "靈泉"
        });
      }

      // 1 座遠古石碑
      const moSpot = findSafeCurioSpot(mapObj);
      if (moSpot) {
        mapObj.decos.push({
          id: "exp_mono_" + mapObj.id,
          x: moSpot.x,
          y: moSpot.y,
          sprite: "lore_monolith",
          w: 28,
          h: 30,
          solid: true,
          isLoreMonolith: true,
          isExpandedWorldObj: true,
          rewardKey: rewardKey,
          name: "古石碑"
        });
      }

      // 2 個遺落行囊
      for (let c = 0; c < 2; c++) {
        const crSpot = findSafeCurioSpot(mapObj);
        if (crSpot) {
          mapObj.decos.push({
            id: "exp_crate_" + mapObj.id + "_" + c + "_" + token,
            x: crSpot.x,
            y: crSpot.y,
            sprite: "loot_crate",
            w: 24,
            h: 24,
            solid: true,
            isLootCrate: true,
            isExpandedWorldObj: true,
            opened: false,
            name: "行囊"
          });
        }
      }
    }

    return mapObj;
  }

  // ================= 7. 博物館、練功木人樁與奇物互動邏輯 =================
  const WorldExpansionManager = {
    openMuseumModal: function(activeTab) {
      activeTab = activeTab || "trophies";
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      if (!s.museumDonated) s.museumDonated = {};
      if (!s.claimedMilestones) s.claimedMilestones = {};

      const bonuses = calcMuseumAndDummyBonuses(s);
      const totalExhibits = BOSS_TROPHY_EXHIBITS.length + NATURE_SPECIMEN_EXHIBITS.length;
      const curDonatedCount = Object.keys(s.museumDonated).length;
      const self = this;

      window.Aetheria.UI.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML =
        S.iconHtml("trophy_pedestal") + "艾瑟瑞亞戰利品博物館 (館藏 " + curDonatedCount + "/" + totalExhibits + ")";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const summaryCard = document.createElement("div");
      summaryCard.className = "sys-card-scroll";
      summaryCard.innerHTML =
        '<b>✨ 博物館與木人樁永久屬性加成：</b>' +
        '<div style="font-size:12px; color:#1d3557; font-weight:900; margin-top:2px;">' +
          '⚔️ 攻擊力 +' + bonuses.atk + ' ｜ 🛡️ 防禦力 +' + bonuses.def + ' ｜ ❤️ 最大生命 +' + bonuses.hp +
        '</div>';
      body.appendChild(summaryCard);

      const tabBar = document.createElement("div");
      tabBar.style.cssText = "display:grid; grid-template-columns:repeat(3, 1fr); gap:5px; margin-bottom:8px;";
      [
        { id: "trophies",   label: "🦖 領主雕像(" + BOSS_TROPHY_EXHIBITS.filter(function(x) { return s.museumDonated[x.id]; }).length + "/7)" },
        { id: "specimens",  label: "💎 奇珍標本(" + NATURE_SPECIMEN_EXHIBITS.filter(function(x) { return s.museumDonated[x.id]; }).length + "/8)" },
        { id: "milestones", label: "🎖️ 榮耀成就" }
      ].forEach(function(t) {
        const b = document.createElement("button");
        b.className = "na-btn" + (activeTab === t.id ? " highlight" : "");
        b.style.fontSize = "11.5px";
        b.innerText = t.label;
        b.onclick = function() { self.openMuseumModal(t.id); };
        tabBar.appendChild(b);
      });
      body.appendChild(tabBar);

      if (activeTab === "trophies") {
        const grid = document.createElement("div");
        grid.className = "exhibit-grid";

        BOSS_TROPHY_EXHIBITS.forEach(function(ex) {
          const isDonated = Boolean(s.museumDonated[ex.id]);
          const inBag = (s.inventory && s.inventory[ex.matKey]) || 0;
          const card = document.createElement("div");
          card.className = "exhibit-card" + (isDonated ? " donated" : "");
          card.innerHTML =
            '<div>' +
              '<b style="color:' + (isDonated ? '#ffd166' : '#ffffff') + '; font-size:12px;">' +
                S.iconHtml("mat_" + ex.matKey, true) + ex.name +
              '</b>' +
              '<div style="font-size:10.5px; color:#8ce0ff; margin-top:2px;">產地：' + ex.zone + '</div>' +
              '<div style="font-size:11px; color:#5ac54f; margin-top:2px;">永久加成：ATK+' + ex.atk + ' / HP+' + ex.hp + '</div>' +
            '</div>' +
            (isDonated
              ? '<div style="color:#ffd166; font-weight:900; font-size:11.5px; text-align:center;">🏆 已上架展示</div>'
              : '<button class="na-btn ' + (inBag > 0 ? 'highlight' : '') + '" style="padding:4px 6px; font-size:11px;" onclick="Aetheria.WorldExpansion.donateExhibit(\'' + ex.id + '\', \'' + ex.matKey + '\', ' + ex.rewardGold + ', \'trophies\')">' +
                  (inBag > 0 ? ('上架領 ' + ex.rewardGold + 'G') : '背包未持有(0)') +
                '</button>');
          grid.appendChild(card);
        });
        body.appendChild(grid);
      }

      else if (activeTab === "specimens") {
        const grid = document.createElement("div");
        grid.className = "exhibit-grid";

        NATURE_SPECIMEN_EXHIBITS.forEach(function(sp) {
          const isDonated = Boolean(s.museumDonated[sp.id]);
          const inBag = (s.inventory && s.inventory[sp.matKey]) || 0;
          const card = document.createElement("div");
          card.className = "exhibit-card" + (isDonated ? " donated" : "");
          card.innerHTML =
            '<div>' +
              '<b style="color:' + (isDonated ? '#ffd166' : '#ffffff') + '; font-size:12px;">' +
                S.iconHtml("mat_" + sp.matKey, true) + sp.name +
              '</b>' +
              '<div style="font-size:11px; color:#5ac54f; margin-top:2px;">永久加成：DEF+' + sp.def + ' / HP+' + sp.hp + '</div>' +
            '</div>' +
            (isDonated
              ? '<div style="color:#ffd166; font-weight:900; font-size:11.5px; text-align:center;">💎 已館藏展示</div>'
              : '<button class="na-btn ' + (inBag > 0 ? 'highlight' : '') + '" style="padding:4px 6px; font-size:11px;" onclick="Aetheria.WorldExpansion.donateExhibit(\'' + sp.id + '\', \'' + sp.matKey + '\', ' + sp.rewardGold + ', \'specimens\')">' +
                  (inBag > 0 ? ('捐獻領 ' + sp.rewardGold + 'G') : '背包未持有(0)') +
                '</button>');
          grid.appendChild(card);
        });
        body.appendChild(grid);
      }

      else {
        MILESTONE_REWARDS.forEach(function(ms) {
          const unlocked = ms.check(s);
          const claimed = Boolean(s.claimedMilestones[ms.id]);
          const row = document.createElement("div");
          row.className = "sys-card";
          row.style.display = "flex";
          row.style.justifyContent = "space-between";
          row.style.alignItems = "center";
          row.innerHTML =
            '<div>' +
              '<b style="color:' + (claimed ? '#5ac54f' : (unlocked ? '#ffd166' : '#cbd5e1')) + '; font-size:12.5px;">🎖️ ' + ms.title + '</b>' +
              '<div style="font-size:11px; color:#8ce0ff; margin-top:2px;">獎勵：' + ms.gold + ' G ＋ ' + ms.exp + ' EXP</div>' +
            '</div>' +
            (claimed
              ? '<span style="color:#5ac54f; font-weight:900; font-size:12px;">✓ 已領獎</span>'
              : (unlocked
                  ? '<button class="na-btn highlight" style="padding:5px 10px;" onclick="Aetheria.WorldExpansion.claimMilestone(\'' + ms.id + '\')">領取獎賞</button>'
                  : '<span style="color:#64748b; font-size:11.5px;">未達成</span>'));
          body.appendChild(row);
        });
      }
    },

    donateExhibit: function(exId, matKey, rewardGold, tab) {
      const s = window.Aetheria.State.data;
      if (!s.museumDonated) s.museumDonated = {};
      if (s.museumDonated[exId]) return;

      if (!s.inventory || (s.inventory[matKey] || 0) <= 0) {
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.showToast("背包中尚未持有此展品！請先在野外採集或討伐領主獲得。");
        return;
      }

      s.inventory[matKey]--;
      s.museumDonated[exId] = true;
      s.gold = (s.gold || 0) + rewardGold;

      window.Aetheria.State.recalcMaxHp();
      s.hp = s.maxHp;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();

      this.openMuseumModal(tab);
      window.Aetheria.UI.updateAllHud();
      window.Aetheria.UI.showToast("🏆 展品上架成功！獲得館藏獎金 +" + rewardGold + " G，永久屬性已提升！");
    },

    claimMilestone: function(msId) {
      const s = window.Aetheria.State.data;
      if (!s.claimedMilestones) s.claimedMilestones = {};
      const ms = MILESTONE_REWARDS.find(function(m) { return m.id === msId; });
      if (!ms || s.claimedMilestones[msId] || !ms.check(s)) return;

      s.claimedMilestones[msId] = true;
      window.Aetheria.State.gainRewards(ms.exp, ms.gold, 25);
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();

      this.openMuseumModal("milestones");
      window.Aetheria.UI.updateAllHud();
      window.Aetheria.UI.showToast("🎖️ 領取榮耀成就獎勵：+" + ms.gold + " G、+" + ms.exp + " EXP！");
    },

    openTrainingDummyModal: function() {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const curLv = s.dummyLevel || 1;
      const curDef = DUMMY_TIERS[curLv] || DUMMY_TIERS[1];
      const nextDef = DUMMY_TIERS[curLv + 1] || null;
      const wrongCount = (s.wrongBook && s.wrongBook.length) || 0;

      window.Aetheria.UI.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML =
        S.iconHtml("training_dummy") + "機關練功木人樁 (" + curDef.name + ")";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const infoCard = document.createElement("div");
      infoCard.className = "sys-card-scroll";
      infoCard.innerHTML =
        '<b>🥋 ' + curDef.name + '</b>' +
        '<div style="font-size:12px; color:#5c3824; margin-top:2px;">' + curDef.desc + '</div>';
      body.appendChild(infoCard);

      const sparCard = document.createElement("div");
      sparCard.className = "sys-card";
      sparCard.style.borderColor = "#5ac54f";
      sparCard.innerHTML =
        '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">' +
          '<div>' +
            '<b style="color:#5ac54f; font-size:13.5px;">⚔️ 實戰連擊修練（零受傷破盾對練）</b>' +
            '<div style="font-size:11.5px; color:#cbd5e1; margin-top:2px;">' +
              '木人樁<b>攻擊力為 0（答錯絕不扣血）</b>！擊破木人樁可獲 <b>' + curDef.trainExp + ' EXP、' + curDef.trainGold + ' G 與 +2 顆 BP 珠</b>！' +
            '</div>' +
          '</div>' +
          '<button class="na-btn highlight" style="padding:8px 12px; white-space:nowrap;" onclick="Aetheria.WorldExpansion.startDummySparring(false)">開始對練 ▸</button>' +
        '</div>';
      body.appendChild(sparCard);

      const wrongCard = document.createElement("div");
      wrongCard.className = "sys-card";
      wrongCard.style.borderColor = "#38b6ff";
      wrongCard.innerHTML =
        '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">' +
          '<div>' +
            '<b style="color:#8ce0ff; font-size:13.5px;">🎯 錯題弱點特訓（錯題本：' + wrongCount + ' 題）</b>' +
            '<div style="font-size:11.5px; color:#cbd5e1; margin-top:2px;">' +
              '優先鎖定錯題進行木人樁擊破！成功擊破額外加贈【炭烤鮮魚乾 +1】！' +
            '</div>' +
          '</div>' +
          '<button class="na-btn" style="padding:8px 12px; white-space:nowrap; border-color:#8ce0ff; color:#8ce0ff;" onclick="Aetheria.WorldExpansion.startDummySparring(true)">錯題特訓 ▸</button>' +
        '</div>';
      body.appendChild(wrongCard);

      if (nextDef) {
        const mats = window.Aetheria.Data.MATERIALS || {};
        const costHtml = Object.entries(nextDef.cost).map(function(entry) {
          const mKey = entry[0];
          const req = entry[1];
          const have = (s.inventory && s.inventory[mKey]) || 0;
          const mName = (mats[mKey] && mats[mKey].name) || mKey;
          return '<span style="color:' + (have >= req ? '#5ac54f' : '#ff758f') + '; margin-right:8px;">' + mName + ' ' + have + '/' + req + '</span>';
        }).join("");

        const canUpgrade = Object.entries(nextDef.cost).every(function(entry) {
          return ((s.inventory && s.inventory[entry[0]]) || 0) >= entry[1];
        });

        const upCard = document.createElement("div");
        upCard.className = "sys-card";
        upCard.style.borderColor = "#f5b700";
        upCard.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">' +
            '<div>' +
              '<b style="color:#ffd166; font-size:13px;">🔨 升級改造：【' + nextDef.name + '】</b>' +
              '<div style="font-size:11.5px; color:#cbd5e1; margin-top:2px;">' + nextDef.desc + '</div>' +
              '<div style="font-size:11px; margin-top:4px; font-weight:bold;">所需材料：' + costHtml + '</div>' +
            '</div>' +
            '<button class="na-btn ' + (canUpgrade ? 'highlight' : '') + '" style="padding:7px 12px; white-space:nowrap;" onclick="Aetheria.WorldExpansion.upgradeDummy()">改造升級</button>' +
          '</div>';
        body.appendChild(upCard);
      }
    },

    startDummySparring: function(focusWrongBook) {
      const s = window.Aetheria.State.data;
      const Bat = window.Aetheria.Battle;
      if (!Bat || !Bat.startBattle) return;

      const curLv = s.dummyLevel || 1;
      const dDef = DUMMY_TIERS[curLv] || DUMMY_TIERS[1];
      const customQId = (focusWrongBook && s.wrongBook && s.wrongBook.length > 0) ? s.wrongBook[0] : null;

      window.Aetheria.UI.closePanelToExplore();

      const dummyNode = {
        id: "camp_training_dummy_spar",
        name: dDef.name,
        lv: Math.max(1, s.lv || 1),
        type: "bamboo",
        isBoss: false,
        isTrainingDummy: true,
        focusWrongBook: Boolean(focusWrongBook),
        alive: true
      };

      Bat.startBattle(dummyNode, "combat", customQId);
    },

    upgradeDummy: function() {
      const s = window.Aetheria.State.data;
      const curLv = s.dummyLevel || 1;
      const nextDef = DUMMY_TIERS[curLv + 1];
      if (!nextDef) return;

      const hasAll = Object.entries(nextDef.cost).every(function(entry) {
        return ((s.inventory && s.inventory[entry[0]]) || 0) >= entry[1];
      });
      if (!hasAll) {
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.showToast("改造材料不足！請先收集所需教材。");
        return;
      }

      Object.entries(nextDef.cost).forEach(function(entry) {
        s.inventory[entry[0]] -= entry[1];
      });
      s.dummyLevel = curLv + 1;
      window.Aetheria.State.recalcMaxHp();
      s.hp = s.maxHp;

      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.openTrainingDummyModal();
      window.Aetheria.UI.updateAllHud();
      window.Aetheria.UI.showToast("🥋 改造完成！木人樁已升至【" + nextDef.name + "】，永久屬性已提升！");
    },

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
      window.Aetheria.UI.spawnFloatingText("⛲靈泉 HP+80 BP+2!", "#5ac54f", true);
      window.Aetheria.UI.showToast("⛲ 飲用靈泉：恢復 +80 HP、+35% 飽食度，並充能 +2 顆 BP 珠！");
    },

    activateLoreMonolith: function(deco) {
      const s = window.Aetheria.State.data;
      if (!s.clearedMonoliths) s.clearedMonoliths = {};
      const monoKey = (s.dayCount || 1) + "_" + deco.id;

      if (s.clearedMonoliths[monoKey]) {
        window.Aetheria.Audio.sfxTalkBlip();
        window.Aetheria.UI.showToast("🗿 此古石碑今日已完成知識共鳴！睡覺過夜後可再次感悟。");
        return;
      }

      const Bat = window.Aetheria.Battle;
      if (!Bat || !Bat.startForageChallenge) return;

      window.Aetheria.Audio.sfxTalkBlip();
      window.Aetheria.UI.showToast("🗿 觸發【遠古石碑】！答對即可獲得石碑秘寶獎勵（答錯不扣血）！");

      Bat._pendingMonolithDeco = deco;
      Bat._pendingMonolithKey = monoKey;
      Bat.startForageChallenge();
    }
  };

  window.Aetheria.WorldExpansion = WorldExpansionManager;

  // ================= 8. 掛載館藏屬性加成、木人樁零傷對練與原生短標籤渲染 =================
  function hookSystemsForExpansion() {
    const St   = window.Aetheria.State;
    const Maps = window.Aetheria.Data && window.Aetheria.Data.Maps;
    const Exp  = window.Aetheria.Explore;
    const Ren  = window.Aetheria.Renderer;
    const Bat  = window.Aetheria.Battle;

    if (St) {
      if (St.getTotalAtk) {
        const origAtk = St.getTotalAtk.bind(St);
        St.getTotalAtk = function() {
          const b = calcMuseumAndDummyBonuses(this.data);
          return origAtk() + b.atk;
        };
      }
      if (St.getTotalDef) {
        const origDef = St.getTotalDef.bind(St);
        St.getTotalDef = function() {
          const b = calcMuseumAndDummyBonuses(this.data);
          return origDef() + b.def;
        };
      }
      if (St.recalcMaxHp) {
        const origMaxHp = St.recalcMaxHp.bind(St);
        St.recalcMaxHp = function() {
          origMaxHp();
          const b = calcMuseumAndDummyBonuses(this.data);
          this.data.maxHp += b.hp;
          if (this.data.hp > this.data.maxHp) this.data.hp = this.data.maxHp;
        };
      }
      if (St.consumeHunger) {
        const origHunger = St.consumeHunger.bind(St);
        St.consumeHunger = function(amount) {
          if (this.data && this.data.currentZone === "tent_museum") return true;
          return origHunger(amount);
        };
      }
    }

    if (Maps && Maps.getMap) {
      let museumInterior = buildMuseumInteriorMap();
      const origGetMap = Maps.getMap.bind(Maps);
      Maps.getMap = function(zoneId) {
        if (zoneId === "tent_museum") {
          return museumInterior;
        }
        const m = origGetMap(zoneId);
        if (m) enrichMapNaturally(m);
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
              if (d.isMuseumBuilding || d.isMuseumPedestal) {
                window.Aetheria.Audio.sfxTalkBlip();
                WorldExpansionManager.openMuseumModal(d.tab || "trophies");
                return;
              }
              if (d.isTrainingDummy) {
                window.Aetheria.Audio.sfxTalkBlip();
                WorldExpansionManager.openTrainingDummyModal();
                return;
              }
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
              if (d.isMuseumBuilding || d.isMuseumPedestal) { hintEl.innerText = "博物館"; return; }
              if (d.isTrainingDummy) { hintEl.innerText = "木人樁"; return; }
              if (d.isLootCrate)     { hintEl.innerText = "搜刮行囊"; return; }
              if (d.isHealingSpring) { hintEl.innerText = "飲用靈泉"; return; }
              if (d.isLoreMonolith)  { hintEl.innerText = "共鳴石碑"; return; }
            }
          }
        }
        origHint(mapObj, s);
      };
    }

    if (Bat) {
      if (Bat.startBattle) {
        const origStart = Bat.startBattle.bind(Bat);
        Bat.startBattle = function(mapMonsterNode, customMode, customQuestionId) {
          origStart(mapMonsterNode, customMode, customQuestionId);

          const s = window.Aetheria.State.data;
          const e = this.enemy;

          if ((s.dummyLevel || 1) >= 3 && this.mode === "combat") {
            s.bp = Math.min(s.maxBp || 5, (s.bp || 0) + 1);
          }

          if (mapMonsterNode && mapMonsterNode.isTrainingDummy && e) {
            e.isTrainingDummy = true;
            e.focusWrongBook = Boolean(mapMonsterNode.focusWrongBook);
            e.atk = 0;
            e.maxShield = 2;
            e.shield = 2;
            e.maxHp = Math.max(80, Math.round(window.Aetheria.State.getTotalAtk() * 2.2));
            e.hp = e.maxHp;

            const eSpriteEl = document.getElementById("battle-enemy-sprite");
            if (eSpriteEl && window.Aetheria.Data.Sprites) {
              eSpriteEl.src = window.Aetheria.Data.Sprites.getDataURL("training_dummy");
            }
            this.updateBattleHUD();
          }
        };
      }

      if (Bat.executeEnemyCounterPhase) {
        const origCounter = Bat.executeEnemyCounterPhase.bind(Bat);
        Bat.executeEnemyCounterPhase = function(answeredRight) {
          if (this.enemy && this.enemy.isTrainingDummy) {
            const s = window.Aetheria.State.data;
            const savedHp = s.hp;
            origCounter(answeredRight);
            s.hp = savedHp;
            this.updateBattleHUD();
            return;
          }
          origCounter(answeredRight);
        };
      }

      if (Bat.winBattle) {
        const origWin = Bat.winBattle.bind(Bat);
        Bat.winBattle = function() {
          const ref = this.mapMonsterRef;
          const isDummy = Boolean(ref && ref.isTrainingDummy);
          const isWrongFocus = Boolean(ref && ref.focusWrongBook);

          origWin();

          if (isDummy) {
            const s = window.Aetheria.State.data;
            const dLv = s.dummyLevel || 1;
            const dDef = DUMMY_TIERS[dLv] || DUMMY_TIERS[1];

            s.bp = Math.min(s.maxBp || 5, (s.bp || 0) + 2);
            if (isWrongFocus) {
              s.inventory.rationFish = (s.inventory.rationFish || 0) + 1;
            }
            window.Aetheria.State.gainRewards(dDef.trainExp, dDef.trainGold, 15);
            window.Aetheria.State.save();
            window.Aetheria.UI.updateAllHud();

            setTimeout(function() {
              window.Aetheria.UI.showToast(
                "🥋 木人樁修練完成！獲【+" + dDef.trainExp + " EXP、+" + dDef.trainGold + " G、BP +2" + (isWrongFocus ? "、鮮魚乾+1" : "") + "】！"
              );
            }, 450);
          }
        };
      }

      if (Bat.resolveTurn) {
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
    }

    if (Ren && Ren.renderWorld) {
      const origRender = Ren.renderWorld.bind(Ren);
      Ren.renderWorld = function() {
        origRender();
        try {
          const s = window.Aetheria.State.data;
          const dnEl = document.getElementById("daynight-overlay");
          if (dnEl && s && s.currentZone === "tent_museum") {
            dnEl.className = "dn-day";
          }

          Object.keys(this.domPool.decos || {}).forEach(function(k) {
            const item = Ren.domPool.decos[k];
            if (!item || !item.data || !item.el) return;
            const d = item.data;

            // ★ 修正：博物館建築外觀隱藏多餘標籤（只保留門口的「博物館」傳送門標籤，與公會/主角/鐵匠帳篷完全一致！）
            if (d.isMuseumBuilding && item.lbl) {
              item.lbl.style.display = "none";
            } else if (d.isMuseumPedestal && item.lbl) {
              item.lbl.style.display = "block";
              item.lbl.className = "dom-label portal-lbl";
              item.lbl.innerText = d.name || "展示台";
            } else if (d.isTrainingDummy && item.lbl) {
              item.lbl.style.display = "block";
              item.lbl.className = "dom-label portal-lbl";
              item.lbl.innerText = "木人樁";
            } else if (d.isLootCrate) {
              if (d.cleared || d.opened) {
                item.el.style.display = "none";
              } else if (item.lbl) {
                item.lbl.style.display = "block";
                item.lbl.className = "dom-label";
                item.lbl.innerText = "行囊";
              }
            } else if (d.isHealingSpring && item.lbl) {
              const used = Boolean(s.usedSpringsDay && s.usedSpringsDay[(s.dayCount || 1) + "_" + d.id]);
              item.lbl.style.display = "block";
              item.lbl.className = "dom-label " + (used ? "" : "portal-lbl");
              item.lbl.innerText = used ? "靈泉✓" : "靈泉";
            } else if (d.isLoreMonolith && item.lbl) {
              const done = Boolean(s.clearedMonoliths && s.clearedMonoliths[(s.dayCount || 1) + "_" + d.id]);
              item.lbl.style.display = "block";
              item.lbl.className = "dom-label " + (done ? "" : "portal-lbl");
              item.lbl.innerText = done ? "石碑✓" : "古石碑";
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

      const Maps = window.Aetheria.Data && window.Aetheria.Data.Maps;
      if (Maps && Maps.getMap) {
        const camp = Maps.getMap("camp_hub");
        if (camp) {
          camp._worldExpandedToken = null;
          enrichMapNaturally(camp);
        }
        Object.keys(WILD_CURIO_CONFIG).forEach(function(zId) {
          const m = Maps.getMap(zId);
          if (m) {
            m._worldExpandedToken = null;
            enrichMapNaturally(m);
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
      console.error("World Expansion v9.1 init error:", err);
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
