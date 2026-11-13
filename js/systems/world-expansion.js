/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 全大陸擴建、營地東翼戰利品博物館與練功木人樁模組 (world-expansion.js - v9.0)
 * 核心升級：
 *   1. 【營地東翼：🏛️ 艾瑟瑞亞戰利品博物館】：
 *      - 包含營地東翼外觀建築與專屬室內展廳地圖 (tent_museum)
 *      - 支援上架展示「領主核心標本」、「自然奇珍礦植」與領取「冒險里程碑」，提供永久 ATK / DEF / MaxHP 館藏共鳴加成！
 *   2. 【營地東翼：🥋 機關練功木人樁道場】：
 *      - 支援「零受傷實戰連擊修練 (敵方0傷害，擊破獲EXP/金幣/BP+2)」、「錯題弱點特訓」與「木人樁三階升級」
 *   3. 完整保留 v8.9 全大陸版圖擴大 (1880x980) 與四大野外互動奇物 (探險行囊/翡翠靈泉/遠古石碑/秘境釣魚點)
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  // ================= 1. 注入東翼博物館、木人樁與野外奇物 CSS =================
  function injectExpansionStyles() {
    if (document.getElementById("world-exp-v90-styles")) return;
    const style = document.createElement("style");
    style.id = "world-exp-v90-styles";
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
      .dom-label.museum-lbl {
        background: linear-gradient(90deg, #5c3824 0%, #1d3557 100%);
        color: #ffd166;
        border: 1.5px solid #f5b700;
        box-shadow: 0 0 8px rgba(245, 183, 0, 0.75);
      }
      .dom-label.dummy-lbl {
        background: linear-gradient(90deg, #7f2b1d 0%, #4a2c11 100%);
        color: #fff3b0;
        border: 1.5px solid #ff9f1c;
        box-shadow: 0 0 6px rgba(255, 159, 28, 0.75);
      }
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

    // 🏛️ 戰利品博物館建築外觀 (16x16 金頂古典聖殿)
    const museumBldgUrl = buildGridDataUrl([
      ".......YY.......",
      ".....YYYYYY.....",
      "...YYYYYYYYYY...",
      ".KKKKKKKKKKKKKK.",
      "KWWWWWWWWWWWWWWK",
      "KYYYYYYYYYYYYYYK",
      ".KWWKWWKWWKWWKW.",
      ".KWWKWWKWWKWWKW.",
      ".KWWKWWKWWKWWKW.",
      ".KWWKWWOOOOOWKW.",
      ".KWWKWWOOOOOWKW.",
      ".KWWKWWOOOOOWKW.",
      "KGGGGGGYYYYGGGGK",
      "KWWWWWWWWWWWWWWK",
      "KKKKKKKKKKKKKKKK",
      "................"
    ], {
      K: "#141013", Y: "#f5b700", W: "#f8fafc", G: "#94a3b8", O: "#2b2118"
    });

    // 🏆 博物館室內黃金展示台 (16x16)
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

    // 🥋 機關練功木人樁 (16x16 詠春/RPG 標靶木人樁)
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

    // 🎒 遺落探險行囊
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

    // ⛲ 翡翠療癒靈泉
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

    // 🗿 遠古知識共鳴石碑
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

  // ================= 4. 建立【戰利品博物館室內展廳 (tent_museum)】地圖 =================
  function buildMuseumInteriorMap() {
    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
    const donated = s.museumDonated || {};

    const decos = [
      // 館長與中央榮耀聖火
      { id: "museum_curator_desk", x: 260, y: 72,  sprite: "brazier_on",      w: 28, h: 28, solid: true, isMuseumPedestal: true, tab: "trophies",   name: "🏛️館藏總覽台" },
      // 左翼：領主討伐雕像展台
      { id: "ped_boss_1",          x: 110, y: 120, sprite: "trophy_pedestal", w: 28, h: 30, solid: true, isMuseumPedestal: true, tab: "trophies",   name: "🦖領主雕像展" },
      { id: "ped_boss_2",          x: 110, y: 205, sprite: "trophy_pedestal", w: 28, h: 30, solid: true, isMuseumPedestal: true, tab: "trophies",   name: "⚓航海秘寶展" },
      // 右翼：自然奇珍礦植展台
      { id: "ped_nat_1",           x: 410, y: 120, sprite: "trophy_pedestal", w: 28, h: 30, solid: true, isMuseumPedestal: true, tab: "specimens",  name: "💎稀世礦石展" },
      { id: "ped_nat_2",           x: 410, y: 205, sprite: "trophy_pedestal", w: 28, h: 30, solid: true, isMuseumPedestal: true, tab: "specimens",  name: "🌿奇珍靈植展" },
      // 中央：冒險榮耀紀念碑
      { id: "ped_milestone",       x: 260, y: 160, sprite: "lore_monolith",   w: 30, h: 34, solid: true, isMuseumPedestal: true, tab: "milestones", name: "🎖️榮耀紀念碑" }
    ];

    return {
      id: "tent_museum",
      _refreshToken: Date.now(),
      name: "戰利品博物館",
      recLv: 1,
      bgm: "forest",
      theme: "sky",
      rain: false,
      fog: false,
      hasRiver: false,
      width: 520,
      height: 320,
      dirtBlobs: [
        { cx: 260, cy: 160, rx: 210, ry: 115 }
      ],
      trees: [],
      decos: decos,
      nodes: [],
      npcs: [],
      monsters: [],
      portals: [
        {
          id: "p_exit_museum",
          name: "離開博物館 ▾",
          x: 260,
          y: 282,
          targetZone: "camp_hub",
          targetX: 766,
          targetY: 168,
          icon: "stairs"
        }
      ],
      _donatedCount: Object.keys(donated).length
    };
  }

  // ================= 5. 各區域擴建尺寸與新增教材/怪物配置表 =================
  const ZONE_EXPANSION_SPECS = {
    camp_hub: {
      targetW: 980,
      targetH: 480,
      extraTrees: 6,
      extraNodes: 6,
      crates: 2,
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
        const rad = (d.isPuzzleElement || d.isMuseumBuilding) ? 68 : 44;
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

  // ================= 6. 動態擴建各區版圖並注入【東翼博物館 + 練功木人樁】 =================
  function expandAndEnrichMap(mapObj) {
    if (!mapObj) return mapObj;
    const token = mapObj._refreshToken || "init";
    if (mapObj._worldExpandedToken === token) return mapObj;
    mapObj._worldExpandedToken = token;

    const matsDB = (window.Aetheria.Data && window.Aetheria.Data.MATERIALS) || {};
    const s = (window.Aetheria.State && window.Aetheria.State.data) || { lv: 1 };

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

    const spec = ZONE_EXPANSION_SPECS[mapObj.id];
    if (!spec) return mapObj;

    const origW = mapObj.width || 640;
    const origH = mapObj.height || 480;
    mapObj.width = Math.max(origW, spec.targetW);
    mapObj.height = Math.max(origH, spec.targetH);

    mapObj.dirtBlobs = mapObj.dirtBlobs || [];
    mapObj.trees = mapObj.trees || [];
    mapObj.portals = mapObj.portals || [];
    mapObj.decos = (mapObj.decos || []).filter(function(d) { return !d.isExpandedWorldObj; });
    mapObj.nodes = (mapObj.nodes || []).filter(function(n) { return !n.isExpandedWorldNode; });
    mapObj.monsters = (mapObj.monsters || []).filter(function(m) { return !m.isExpandedWorldMon; });

    // ★ 曙光營地東翼專屬建設：【🏛️戰利品博物館】與【🥋機關練功木人樁道場】
    if (mapObj.id === "camp_hub") {
      mapObj.dirtBlobs.push(
        { cx: 765, cy: 145, rx: 115, ry: 65 }, // 東北：博物館前庭廣場
        { cx: 635, cy: 235, rx: 75,  ry: 55 }, // 東中：練功木人樁武道場
        { cx: 855, cy: 255, rx: 95,  ry: 70 }  // 東南：翡翠靈泉與遠古石碑區
      );

      // 1. 🏛️ 艾瑟瑞亞戰利品博物館建築外觀 + 室內展廳傳送門
      mapObj.decos.push({
        id: "deco_camp_museum_ext",
        x: 740,
        y: 74,
        sprite: "museum_building",
        w: 58,
        h: 52,
        solid: true,
        isMuseumBuilding: true,
        isExpandedWorldObj: true,
        name: "🏛️戰利品博物館"
      });

      if (!mapObj.portals.some(function(p) { return p.id === "p_enter_museum"; })) {
        mapObj.portals.push({
          id: "p_enter_museum",
          name: "戰利品博物館",
          x: 768,
          y: 138,
          targetZone: "tent_museum",
          targetX: 260,
          targetY: 240,
          icon: "door",
          labelBottom: true
        });
      }

      // 2. 🥋 機關練功木人樁 + 武道場火盆
      mapObj.decos.push(
        {
          id: "deco_camp_dummy",
          x: 635,
          y: 225,
          sprite: "training_dummy",
          w: 32,
          h: 34,
          solid: true,
          isTrainingDummy: true,
          isExpandedWorldObj: true,
          name: "🥋練功木人樁"
        },
        {
          id: "deco_dojo_brazier_1",
          x: 590,
          y: 205,
          sprite: "brazier_on",
          w: 24,
          h: 26,
          solid: true,
          isExpandedWorldObj: true
        },
        {
          id: "deco_dojo_brazier_2",
          x: 680,
          y: 205,
          sprite: "brazier_on",
          w: 24,
          h: 26,
          solid: true,
          isExpandedWorldObj: true
        }
      );
    } else {
      mapObj.dirtBlobs.push(
        { cx: 1420, cy: 280, rx: 165, ry: 110 },
        { cx: 1580, cy: 680, rx: 175, ry: 120 },
        { cx: 520,  cy: 790, rx: 180, ry: 95 },
        { cx: 1080, cy: 810, rx: 165, ry: 95 }
      );
    }

    // 鋪設擴建區域防重疊林木
    for (let t = 0; t < (spec.extraTrees || 0); t++) {
      const inEast = (t % 2 === 0);
      const tSpot = findSafeExpansionSpot(mapObj, {
        minX: (mapObj.id === "camp_hub") ? 600 : (inEast ? Math.max(580, origW - 60) : 90),
        maxX: mapObj.width - 70,
        minY: (mapObj.id === "camp_hub") ? 260 : (inEast ? 80 : Math.max(200, origH - 60)),
        maxY: (mapObj.id === "camp_hub") ? 335 : (mapObj.height - 70)
      });
      if (tSpot) {
        mapObj.trees.push({ x: tSpot.x, y: tSpot.y, isExpandedTree: true });
      }
    }

    // 秘境釣魚點
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

    // ⛲ 翡翠療癒靈泉
    for (let sp = 0; sp < (spec.springs || 0); sp++) {
      const spSpot = (mapObj.id === "camp_hub")
        ? { x: 845, y: 215 }
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

    // 🗿 遠古知識共鳴碑
    for (let mo = 0; mo < (spec.monoliths || 0); mo++) {
      const moSpot = (mapObj.id === "camp_hub")
        ? { x: 865, y: 295 }
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

    // 🎒 遺落探險行囊
    for (let cr = 0; cr < (spec.crates || 0); cr++) {
      const crSpot = findSafeExpansionSpot(mapObj, {
        minX: (mapObj.id === "camp_hub") ? 590 : 120,
        maxX: mapObj.width - 80,
        minY: (mapObj.id === "camp_hub") ? 270 : 95,
        maxY: (mapObj.id === "camp_hub") ? 342 : (mapObj.height - 80)
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

    // 額外防重疊採集素材點
    const pool = spec.nodePool || [];
    for (let nIdx = 0; nIdx < (spec.extraNodes || 0) && pool.length > 0; nIdx++) {
      const tpl = pool[nIdx % pool.length];
      const nSpot = findSafeExpansionSpot(mapObj, {
        minX: (mapObj.id === "camp_hub") ? 580 : 100,
        maxX: (mapObj.id === "zone1_forest" && nIdx < 6) ? 960 : (mapObj.width - 75),
        minY: tpl.southShore ? 320 : ((mapObj.id === "camp_hub") ? 150 : 85),
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

    // 外圍巡邏魔物
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

  // ================= 7. 博物館、練功木人樁與奇物互動邏輯 =================
  const WorldExpansionManager = {
    // 🏛️ 打開【艾瑟瑞亞戰利品博物館】介面
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
        '<b>✨ 東翼館藏與木人樁永久共鳴加成：</b>' +
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

    // 🥋 打開【東翼機關練功木人樁道場】介面
    openTrainingDummyModal: function() {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const curLv = s.dummyLevel || 1;
      const curDef = DUMMY_TIERS[curLv] || DUMMY_TIERS[1];
      const nextDef = DUMMY_TIERS[curLv + 1] || null;
      const wrongCount = (s.wrongBook && s.wrongBook.length) || 0;

      window.Aetheria.UI.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML =
        S.iconHtml("training_dummy") + "東翼機關練功木人樁道場 (" + curDef.name + ")";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const infoCard = document.createElement("div");
      infoCard.className = "sys-card-scroll";
      infoCard.innerHTML =
        '<b>🥋 ' + curDef.name + '</b>' +
        '<div style="font-size:12px; color:#5c3824; margin-top:2px;">' + curDef.desc + '</div>';
      body.appendChild(infoCard);

      // 模式 1：實戰連擊木人樁（零受傷練功）
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

      // 模式 2：錯題本弱點特訓
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

      // 模式 3：升級改造木人樁
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
      window.Aetheria.UI.spawnFloatingText("⛲靈泉療癒 HP+80 BP+2!", "#5ac54f", true);
      window.Aetheria.UI.showToast("⛲ 飲用翡翠療癒靈泉：恢復 +80 HP、+35% 飽食度，並充能 +2 顆 BP 珠！");
    },

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

      Bat._pendingMonolithDeco = deco;
      Bat._pendingMonolithKey = monoKey;
      Bat.startForageChallenge();
    }
  };

  window.Aetheria.WorldExpansion = WorldExpansionManager;

  // ================= 8. 掛載館藏屬性加成、木人樁零傷對練與地圖渲染 =================
  function hookSystemsForExpansion() {
    const St   = window.Aetheria.State;
    const Maps = window.Aetheria.Data && window.Aetheria.Data.Maps;
    const Exp  = window.Aetheria.Explore;
    const Ren  = window.Aetheria.Renderer;
    const Bat  = window.Aetheria.Battle;

    // 1. 掛載博物館與木人樁永久屬性加成 (ATK / DEF / MaxHP)
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
            if (Math.hypot(s.heroX - d.x, s.heroY - d.y) < 44) {
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
            if (Math.hypot(s.heroX - d.x, s.heroY - d.y) < 44) {
              if (d.isMuseumBuilding || d.isMuseumPedestal) { hintEl.innerText = "戰利博物館"; return; }
              if (d.isTrainingDummy) { hintEl.innerText = "練功木人樁"; return; }
              if (d.isLootCrate)     { hintEl.innerText = "搜刮行囊"; return; }
              if (d.isHealingSpring) { hintEl.innerText = "飲用靈泉"; return; }
              if (d.isLoreMonolith)  { hintEl.innerText = "共鳴石碑"; return; }
            }
          }
        }
        origHint(mapObj, s);
      };
    }

    // 2. 掛載戰鬥系統：處理【機關練功木人樁（0 傷害、充能 BP、專屬獎勵）】與【Lv.3 木人樁開局 BP+1】
    if (Bat) {
      if (Bat.startBattle) {
        const origStart = Bat.startBattle.bind(Bat);
        Bat.startBattle = function(mapMonsterNode, customMode, customQuestionId) {
          origStart(mapMonsterNode, customMode, customQuestionId);

          const s = window.Aetheria.State.data;
          const e = this.enemy;

          // Lv.3 星隕神機木人樁被動加成：每場戰鬥開局額外 +1 BP
          if ((s.dummyLevel || 1) >= 3 && this.mode === "combat") {
            s.bp = Math.min(s.maxBp || 5, (s.bp || 0) + 1);
          }

          if (mapMonsterNode && mapMonsterNode.isTrainingDummy && e) {
            e.isTrainingDummy = true;
            e.focusWrongBook = Boolean(mapMonsterNode.focusWrongBook);
            e.atk = 0; // 木人樁攻擊力鎖定為 0！
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

      // 木人樁反擊階段：完全不扣主角血量，只顯示「🥋木人樁格擋招式」
      if (Bat.executeEnemyCounterPhase) {
        const origCounter = Bat.executeEnemyCounterPhase.bind(Bat);
        Bat.executeEnemyCounterPhase = function(answeredRight) {
          if (this.enemy && this.enemy.isTrainingDummy) {
            const s = window.Aetheria.State.data;
            const savedHp = s.hp;
            origCounter(answeredRight);
            s.hp = savedHp; // 確保 0 受傷！
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

            if (d.isMuseumBuilding && item.lbl) {
              item.lbl.style.display = "block";
              item.lbl.className = "dom-label museum-lbl";
              item.lbl.innerText = "🏛️戰利品博物館";
            } else if (d.isMuseumPedestal && item.lbl) {
              item.lbl.style.display = "block";
              item.lbl.className = "dom-label museum-lbl";
              item.lbl.innerText = d.name || "🏆展示台";
            } else if (d.isTrainingDummy && item.lbl) {
              const dLv = (s && s.dummyLevel) || 1;
              item.lbl.style.display = "block";
              item.lbl.className = "dom-label dummy-lbl";
              item.lbl.innerText = "🥋木人樁 Lv." + dLv;
            } else if (d.isLootCrate) {
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
      console.error("World Expansion v9.0 init error:", err);
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
