/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 高低差懸崖地形、Survival RPG 合成鏈與格仔工坊介面 (survival-highlands-workshop.js - v9.3)
 * 核心設計：
 *   1. 【高低差懸崖與山洞地形】：還原 L 型黃土高台、垂直深啡色懸崖壁、岩壁山洞口與高台礦脈，需用【攀岩繩梯】爬上高台
 *   2. 【地圖去標籤化視覺減負】：平時隱藏普通礦物與草木的頭頂文字框，僅在主角走近 (<58px) 時浮現，畫面乾淨如原版像素 RPG
 *   3. 【全新格仔化分類工坊 UI】：「頂部固定配方檢視器 + 子分類篩選列 + 3欄9宮格圖示」，綠框標示可製作項目，一秒搵到所需配方
 *   4. 【Survival RPG 合成鏈】：新增木炭、岩鹽、石英砂、獸皮、精鋼錠、硬皮革、攀岩繩梯、風乾肉脯、探礦提燈與藥劑配方
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  // ================= 1. 注入高低差懸崖地形與全新格仔工坊 CSS =================
  function injectHighlandsAndWorkshopStyles() {
    if (document.getElementById("highlands-wk-v93-styles")) return;
    const style = document.createElement("style");
    style.id = "highlands-wk-v93-styles";
    style.textContent = `
      /* ================= A. 參考圖風格：L型高低差黃土高台與深啡色垂直懸崖壁 ================= */
      .srpg-plateau-top {
        position: absolute;
        background-color: #c6a664;
        background-image:
          radial-gradient(#b08d4c 15%, transparent 16%),
          radial-gradient(#d8bc7d 15%, transparent 16%);
        background-size: 16px 16px;
        background-position: 0 0, 8px 8px;
        border-top: 4px solid #7a4424;
        border-left: 4px solid #7a4424;
        border-right: 4px solid #7a4424;
        border-radius: 8px 8px 0 0;
        pointer-events: none;
        z-index: 2;
      }
      .srpg-cliff-wall {
        position: absolute;
        background:
          repeating-linear-gradient(
            90deg,
            #7a4424 0px,
            #7a4424 14px,
            #5c3118 14px,
            #5c3118 18px,
            #8c5230 18px,
            #8c5230 28px
          );
        border-top: 4px solid #472411;
        border-bottom: 5px solid #2b1508;
        box-shadow: 0 8px 12px rgba(0, 0, 0, 0.55);
        pointer-events: none;
        z-index: 3;
      }
      .srpg-cliff-side-wall {
        position: absolute;
        background:
          repeating-linear-gradient(
            180deg,
            #6e3b1e 0px,
            #6e3b1e 12px,
            #4f2913 12px,
            #4f2913 16px
          );
        border-left: 3px solid #3b1d0b;
        border-right: 3px solid #3b1d0b;
        pointer-events: none;
        z-index: 3;
      }
      .srpg-cave-arch {
        position: absolute;
        width: 56px;
        height: 46px;
        background: radial-gradient(circle at 50% 65%, #090608 45%, #241418 85%, #472411 100%);
        border: 4px solid #472411;
        border-bottom: none;
        border-radius: 28px 28px 0 0;
        box-shadow: inset 0 6px 12px #000000;
        pointer-events: none;
        z-index: 4;
      }

      /* ================= B. 全新格仔分類工坊 UI (解決難搵嘢問題) ================= */
      .wk-inspector-box {
        background: linear-gradient(180deg, #261c14 0%, #18120e 100%);
        border: 2px solid #f5b700;
        border-radius: 8px;
        padding: 8px 10px;
        margin-bottom: 7px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.65);
      }
      .wk-subfilter-bar {
        display: flex;
        gap: 4px;
        overflow-x: auto;
        padding-bottom: 4px;
        margin-bottom: 6px;
      }
      .wk-filter-pill {
        background: #1c1619;
        color: #cbd5e1;
        border: 1.5px solid #594950;
        border-radius: 14px;
        padding: 3px 9px;
        font-size: 11px;
        font-weight: 900;
        white-space: nowrap;
        cursor: pointer;
      }
      .wk-filter-pill.active {
        background: #1d3557;
        color: #ffd166;
        border-color: #38b6ff;
      }
      .wk-icon-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
        max-height: 210px;
        overflow-y: auto;
        padding: 2px;
      }
      .wk-grid-cell {
        position: relative;
        background: #181316;
        border: 2px solid #4a3e44;
        border-radius: 7px;
        padding: 6px 4px 5px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        cursor: pointer;
        min-height: 62px;
        transition: transform 0.1s ease, border-color 0.15s ease;
      }
      .wk-grid-cell:active {
        transform: scale(0.96);
      }
      .wk-grid-cell.can-craft {
        border-color: #5ac54f;
        background: linear-gradient(180deg, #18281c 0%, #141815 100%);
      }
      .wk-grid-cell.selected {
        border-color: #ffd166 !important;
        box-shadow: 0 0 8px rgba(245, 183, 0, 0.75);
        background: linear-gradient(180deg, #2b2112 0%, #1c150c 100%);
      }
      .wk-cell-badge {
        position: absolute;
        top: 2px;
        right: 3px;
        font-size: 9.5px;
        font-weight: 900;
        padding: 0px 4px;
        border-radius: 4px;
        background: rgba(0,0,0,0.75);
        color: #cbd5e1;
      }
      .wk-cell-craft-dot {
        position: absolute;
        top: 3px;
        left: 4px;
        font-size: 9px;
        font-weight: 900;
        color: #5ac54f;
      }
      .wk-cell-name {
        font-size: 11px;
        font-weight: 900;
        color: #ffffff;
        margin-top: 3px;
        line-height: 1.15;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .wk-mat-chip {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        font-size: 11px;
        font-weight: 900;
        padding: 2px 6px;
        border-radius: 4px;
        margin: 2px 4px 2px 0;
        background: #141013;
        border: 1px solid #4a3e44;
      }
      .wk-mat-chip.ok {
        color: #5ac54f;
        border-color: #5ac54f;
        background: rgba(45, 106, 79, 0.25);
      }
      .wk-mat-chip.lack {
        color: #ff758f;
        border-color: #ff595e;
        background: rgba(157, 2, 8, 0.22);
      }
    `;
    document.head.appendChild(style);
  }

  // ================= 2. 註冊《Survival RPG》像素圖示（高台礦簇、繩梯、木炭、岩鹽、鋼錠、肉脯） =================
  function registerSurvivalRpgSprites() {
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

    // 還原附圖的高台三連岩塊礦簇 (Cluster Boulder Ore)
    const clusterBoulderUrl = buildGridDataUrl([
      "....KKKKKK......",
      "...KLLLLLLK.....",
      "..KLGGGGGGGK....",
      "..KLGGGGGGGK....",
      ".KKKKGGGGKKKKKK.",
      "KLLLLKGGKLLLLLLK",
      "KLGGGKGGKLGGGGGK",
      "KLGGGGGGKLGGGGGK",
      "KGGGGGGGGGGGGGGK",
      "KDDDDGGGGDDDDDDK",
      ".KDDDDDDDDDDDDK.",
      "..KKKKKKKKKKKK..",
      "................",
      "................",
      "................",
      "................"
    ], { K: "#2b2623", L: "#9ca3af", G: "#6b7280", D: "#4b5563" });

    // 懸崖攀岩繩梯 (Rope Ladder)
    const ropeLadderUrl = buildGridDataUrl([
      "..KK........KK..",
      "..KRK......KRK..",
      "..KWWWWWWWWWWK..",
      "..KDDDDDDDDDDK..",
      "..KRK......KRK..",
      "..KRK......KRK..",
      "..KWWWWWWWWWWK..",
      "..KDDDDDDDDDDK..",
      "..KRK......KRK..",
      "..KRK......KRK..",
      "..KWWWWWWWWWWK..",
      "..KDDDDDDDDDDK..",
      "..KRK......KRK..",
      "..KRK......KRK..",
      "..KWWWWWWWWWWK..",
      "..KK........KK.."
    ], { K: "#141013", R: "#d9a066", W: "#f5b700", D: "#8f563b" });

    // 黑曜木炭 (Coal / Charcoal)
    const coalUrl = buildGridDataUrl([
      "................",
      ".....KKKKKK.....",
      "...KKDDDDDDKK...",
      "..KDDGGGGGGDDK..",
      ".KDDGKKKKKKGDDK.",
      ".KDGKKKKKKKKGDK.",
      "KDDGKKRRRRKKGDDK",
      "KDGKKRYYYYRKKGDK",
      "KDGKKRRRRRRKKGDK",
      ".KDGKKKKKKKKGDK.",
      ".KDDGGGGGGGGDDK.",
      "..KKDDDDDDDDKK..",
      "....KKKKKKKK....",
      "................",
      "................",
      "................"
    ], { K: "#141013", D: "#2b2623", G: "#475569", R: "#e03c4b", Y: "#ffd166" });

    // 結晶岩鹽 (Rock Salt)
    const rockSaltUrl = buildGridDataUrl([
      ".......KK.......",
      "......KWWK......",
      ".....KWWWWK.....",
      "...KKWCCCCWKK...",
      "..KWWCCCCCCWWK..",
      ".KWWCCCCCCCCWWK.",
      ".KWCCWWWWWWCCWK.",
      "KWWCWWWWWWWWCWWK",
      "KCCCCCCCCCCCCCCK",
      ".KCCCCCCCCCCCCK.",
      "..KKCCCCCCCCKK..",
      "....KKKKKKKK....",
      "................",
      "................",
      "................",
      "................"
    ], { K: "#141013", W: "#ffffff", C: "#cbd5e1" });

    // 透明石英砂 (Quartz)
    const quartzUrl = buildGridDataUrl([
      ".......KK.......",
      "......KCCK......",
      ".....KCWWCK.....",
      "..KK.KCWWCK.KK..",
      ".KCCKKCWWCKKCCK.",
      ".KCWWCWWWWCWWCK.",
      "KCCWWWWWWWWWWCCK",
      ".KCCWWWWWWWWCCK.",
      "..KCCCCCCCCCCK..",
      "...KKKKKKKKKK...",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ], { K: "#141013", C: "#8ce0ff", W: "#ffffff" });

    // 荒野獸皮 / 鞣製硬皮革 (Hide / Leather)
    const leatherUrl = buildGridDataUrl([
      "..KKKK....KKKK..",
      ".KDDDDKKKKDDDDK.",
      ".KDDDDDDDDDDDDK.",
      "KDDLLLLLLLLLLDDK",
      "KDDLLLLLLLLLLDDK",
      ".KDDLLLLLLLLDDK.",
      "..KDDLLLLLLDDK..",
      "..KDDLLLLLLDDK..",
      ".KDDLLLLLLLLDDK.",
      "KDDLLLLLLLLLLDDK",
      "KDDDDDDDDDDDDDDK",
      ".KDDDDKKKKDDDDK.",
      "..KKKK....KKKK..",
      "................",
      "................",
      "................"
    ], { K: "#141013", D: "#8f563b", L: "#d9a066" });

    // 百煉精鋼錠 (Steel Ingot)
    const steelIngotUrl = buildGridDataUrl([
      "................",
      "....KKKKKKKK....",
      "...KWWWWWWWWK...",
      "..KWCCCCCCCCWK..",
      ".KWCCCCCCCCCCWK.",
      "KWWWWWWWWWWWWWWK",
      "KGGGGGGGGGGGGGGK",
      "KDDDDDDDDDDDDDDK",
      ".KKKKKKKKKKKKKK.",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ], { K: "#141013", W: "#ffffff", C: "#94a3b8", G: "#64748b", D: "#334155" });

    // 岩鹽風乾肉脯 (Cured Jerky)
    const jerkyUrl = buildGridDataUrl([
      "................",
      "....KKKKKKKK....",
      "..KKRRRRRRRRKK..",
      ".KRRWWWWWWWWRRK.",
      ".KRRDDDDDDDDRRK.",
      "KRRDDDDDDDDDDRRK",
      "KRRDDWWDDDDDDRRK",
      ".KRRDDDDDDDDRRK.",
      "..KKRRRRRRRRKK..",
      "....KKKKKKKK....",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ], { K: "#141013", R: "#9d0208", D: "#6a040f", W: "#f8fafc" });

    const customUrls = {
      cluster_boulder: clusterBoulderUrl,
      rope_ladder: ropeLadderUrl,
      mat_ropeLadder: ropeLadderUrl,
      mat_coal: coalUrl,
      mat_rockSalt: rockSaltUrl,
      mat_quartz: quartzUrl,
      mat_rawHide: leatherUrl,
      mat_curedLeather: leatherUrl,
      mat_steelIngot: steelIngotUrl,
      mat_rationJerky: jerkyUrl
    };

    const origGetDataURL = S.getDataURL.bind(S);
    S.getDataURL = function(key) {
      if (customUrls[key]) return customUrls[key];
      return origGetDataURL(key);
    };
  }

  // ================= 3. 註冊《Survival RPG》新素材與加工配方（直接擴充原有 Data） =================
  const NEW_SRPG_MATERIALS = {
    coal:         { id: "coal",         name: "黑曜木炭",   tier: 1, desc: "【冶煉燃料】由枯枝窯燒或於岩壁山洞開採，是冶煉百煉精鋼錠與高階金屬的核心燃料。" },
    rockSalt:     { id: "rockSalt",     name: "結晶岩鹽",   tier: 1, desc: "【高台礦產】採集自懸崖高台或岩壁礦洞，可醃製長效保存的風乾肉脯。" },
    quartz:       { id: "quartz",       name: "透明石英砂", tier: 2, desc: "【高台晶礦】採集自懸崖高台，可用於燒製鍊金藥瓶與探礦提燈。" },
    rawHide:      { id: "rawHide",      name: "荒野獸皮",   tier: 1, desc: "【狩獵戰利品】討伐野外魔物機率掉落，可加工為堅韌的鞣製硬皮革。" },
    curedLeather: { id: "curedLeather", name: "鞣製硬皮革", tier: 2, desc: "【進階加工材】以獸皮與松脂鞣製而成，用於製作高階防具與遠航裝備。" },
    steelIngot:   { id: "steelIngot",   name: "百煉精鋼錠", tier: 2, desc: "【高階冶煉材】以藍晶鐵礦與黑曜木炭高溫鍛打而成，可強化武器鋒利度。" },
    ropeLadder:   { id: "ropeLadder",   name: "攀岩繩梯",   tier: 1, desc: "【高低差開路工具】由麻繩與原木編織而成，可架設在野外懸崖峭壁上攀爬至高台礦區！" },
    rationJerky:  { id: "rationJerky",  name: "風乾肉脯",   tier: 2, desc: "【頂級求生口糧】以岩鹽醃製鮮魚與獸肉，食用立即恢復 +80% 飽食度與 +90 HP！" }
  };

  const EXTRA_WORKSHOP_RECIPES = [
    {
      id: "wk_rope_ladder",
      name: "攀岩繩梯 x1",
      category: "explore",
      toKey: "ropeLadder",
      toCount: 1,
      cost: { rope: 1, wood: 2 },
      desc: "【高低差開路必備】架設於各區南側的深啡色懸崖壁上，即可自由爬上黃土高台採集稀有礦脈！"
    },
    {
      id: "wk_charcoal",
      name: "窯燒黑木炭 x2",
      category: "smelt",
      toKey: "coal",
      toCount: 2,
      cost: { branch: 3 },
      desc: "【基礎冶煉】將 3 根散落枯枝悶燒成 2 塊高熱能黑曜木炭，用於冶煉精鋼錠。"
    },
    {
      id: "wk_steel_ingot",
      name: "百煉精鋼錠 x1",
      category: "smelt",
      toKey: "steelIngot",
      toCount: 1,
      cost: { iron: 2, coal: 2 },
      desc: "【高溫冶煉】以藍晶鐵礦 x2 與黑曜木炭 x2 鍛造成高純度精鋼錠（使用後永久提升主角攻擊力 +4！）。"
    },
    {
      id: "wk_cured_leather",
      name: "鞣製硬皮革 x1",
      category: "smelt",
      toKey: "curedLeather",
      toCount: 1,
      cost: { rawHide: 2, resin: 1 },
      desc: "【皮革加工】將荒野獸皮與松脂鞣製成防水硬皮革（使用後永久提升主角防禦力 +3、最大HP +12！）。"
    },
    {
      id: "wk_ration_jerky",
      name: "岩鹽風乾肉脯 x2",
      category: "survival",
      toKey: "rationJerky",
      toCount: 2,
      cost: { fish: 1, rockSalt: 1 },
      desc: "【長效求生口糧】以結晶岩鹽醃製鮮魚，食用每份可恢復 +80% 飽食度與 +90 HP！"
    },
    {
      id: "wk_alchemy_heal",
      name: "精煉生命藥水 x2",
      category: "survival",
      toKey: "potionHeal",
      toCount: 2,
      cost: { herb: 2, quartz: 1 },
      desc: "【隨身鍊金】以紅傘微光菇 x2 與石英砂燒製的玻璃瓶，免費提煉 2 瓶生命藥水！"
    },
    {
      id: "wk_alchemy_hint",
      name: "精煉洞察藥水 x2",
      category: "survival",
      toKey: "potionHint",
      toCount: 2,
      cost: { flower: 1, resin: 1, quartz: 1 },
      desc: "【隨身鍊金】以向陽太陽花、松脂與石英砂提煉 2 瓶洞察藥水（答題時可排除錯誤選項）！"
    },
    {
      id: "wk_quartz_lantern",
      name: "石英探礦提燈",
      category: "explore",
      toKey: "torchItem",
      toCount: 4,
      cost: { iron: 1, quartz: 1, coal: 1 },
      desc: "【高效照明】以鐵礦、石英砂與木炭打造的強光提燈，一次產出相當於 4 支松脂火把的照明燃料！"
    }
  ];

  function registerSrpgDataIntoGame() {
    const Data = window.Aetheria.Data;
    if (!Data) return;

    if (Data.MATERIALS) {
      Object.keys(NEW_SRPG_MATERIALS).forEach(function(k) {
        Data.MATERIALS[k] = NEW_SRPG_MATERIALS[k];
      });
    }

    if (Array.isArray(Data.WORKSHOP_RECIPES)) {
      EXTRA_WORKSHOP_RECIPES.forEach(function(rec) {
        if (!Data.WORKSHOP_RECIPES.some(function(r) { return r.id === rec.id; })) {
          Data.WORKSHOP_RECIPES.push(rec);
        }
      });
    }
  }

  // ================= 4. 建立附圖風格「L型高低差懸崖高台 + 岩壁山洞口 + 4連礦簇」 =================
  const HIGHLAND_ZONES = {
    zone1_forest:   { ores: ["iron", "rockSalt", "quartz", "iron"],       grottoOres: ["coal", "iron", "rockSalt", "quartz"] },
    zone2_canyon:   { ores: ["mithril", "quartz", "rockSalt", "basalt"],  grottoOres: ["coal", "mithril", "quartz", "basalt"] },
    zone3_coast:    { ores: ["coral", "rockSalt", "quartz", "mithril"],   grottoOres: ["coal", "coral", "rockSalt", "mithril"] },
    zone4_snow:     { ores: ["obsidian", "rockSalt", "quartz", "mithril"],grottoOres: ["coal", "obsidian", "quartz", "mithril"] },
    zone5_volcano:  { ores: ["starIron", "obsidian", "coal", "quartz"],   grottoOres: ["coal", "starIron", "obsidian", "quartz"] }
  };

  const grottoMapsCache = {};

  function buildCliffGrottoMap(parentZoneId) {
    const cfg = HIGHLAND_ZONES[parentZoneId] || HIGHLAND_ZONES.zone1_forest;
    const matsDB = (window.Aetheria.Data && window.Aetheria.Data.MATERIALS) || {};
    const parentMap = (window.Aetheria.Data && window.Aetheria.Data.Maps && window.Aetheria.Data.Maps.getMap(parentZoneId)) || { recLv: 3, name: "野外" };

    const nodes = [];
    const orePositions = [
      { x: 130, y: 110 }, { x: 240, y: 95 },  { x: 350, y: 110 },
      { x: 145, y: 195 }, { x: 335, y: 195 }, { x: 240, y: 145 }
    ];

    orePositions.forEach(function(pt, idx) {
      const giveKey = cfg.grottoOres[idx % cfg.grottoOres.length];
      const mInfo = matsDB[giveKey] || { name: giveKey };
      nodes.push({
        id: "grotto_node_" + parentZoneId + "_" + idx + "_" + Date.now(),
        x: pt.x,
        y: pt.y,
        type: "crystal",
        giveKey: giveKey,
        reqTool: "pickaxe",
        reqToolLv: 0, // 山洞內裸露礦脈免工具階級即可開採
        perfect: (idx % 2 === 0),
        isClusterBoulder: true,
        name: mInfo.name,
        opened: false
      });
    });

    return {
      id: "grotto_" + parentZoneId,
      parentZoneId: parentZoneId,
      _refreshToken: Date.now(),
      name: "岩壁礦洞",
      recLv: parentMap.recLv || 3,
      bgm: "cave",
      theme: "cave",
      rain: false,
      fog: false,
      hasRiver: false,
      width: 480,
      height: 320,
      dirtBlobs: [{ cx: 240, cy: 155, rx: 185, ry: 110 }],
      trees: [],
      decos: [
        { x: 185, y: 78, sprite: "brazier_on", w: 24, h: 26, solid: true },
        { x: 295, y: 78, sprite: "brazier_on", w: 24, h: 26, solid: true }
      ],
      nodes: nodes,
      npcs: [],
      monsters: [],
      portals: [
        {
          id: "p_exit_grotto_" + parentZoneId,
          name: "離開山洞 ▾",
          x: 240,
          y: 278,
          targetZone: parentZoneId,
          targetX: 468,
          targetY: 812,
          icon: "stairs"
        }
      ]
    };
  }

  // 在 1~5 區南側擴建區域注入附圖的 L 型黃土高台、深啡色懸崖壁、山洞入口、繩梯錨點與 4 連礦簇
  function injectHighlandCliffIntoMap(mapObj) {
    if (!mapObj || !HIGHLAND_ZONES[mapObj.id]) return mapObj;
    const token = mapObj._refreshToken || "init";
    if (mapObj._highlandInjectedToken === token) return mapObj;
    mapObj._highlandInjectedToken = token;

    const cfg = HIGHLAND_ZONES[mapObj.id];
    const matsDB = (window.Aetheria.Data && window.Aetheria.Data.MATERIALS) || {};
    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
    const rigged = Boolean(s.riggedCliffs && s.riggedCliffs[mapObj.id]);

    // 適度向下擴展地圖高度至 960，容納完整的 L 型高低差懸崖與下層草地谷（不影響上方原有主線動線！）
    mapObj.height = Math.max(mapObj.height || 680, 960);

    // 清空南側懸崖高台區 (x: 310~920, y: 590~930) 原有的隨機雜樹，確保高低差地形乾淨呈現
    if (mapObj.trees) {
      mapObj.trees = mapObj.trees.filter(function(t) {
        return !(t.x > 300 && t.x < 920 && t.y > 580 && t.y < 920);
      });
      // 在下層綠草谷地左下角點綴兩棵樹（還原附圖左下角的樹叢）
      mapObj.trees.push({ x: 355, y: 885 }, { x: 415, y: 895 });
    }

    mapObj.decos = (mapObj.decos || []).filter(function(d) { return !d.isHighlandElement; });
    mapObj.nodes = (mapObj.nodes || []).filter(function(n) { return !n.isHighlandOre; });
    mapObj.portals = (mapObj.portals || []).filter(function(p) { return !p.isCliffCavePortal; });

    // 1. 懸崖壁中央的【⛰️ 岩壁山洞口】傳送點 (對應附圖左側懸崖壁上的黑色山洞口)
    mapObj.portals.push({
      id: "p_cliff_cave_" + mapObj.id,
      name: "山洞",
      x: 468,
      y: 766,
      targetZone: "grotto_" + mapObj.id,
      targetX: 240,
      targetY: 235,
      icon: "abyss",
      isCliffCavePortal: true
    });

    // 2. 懸崖壁右側的【🧗 攀岩繩梯錨點】
    mapObj.decos.push({
      id: "cliff_ladder_" + mapObj.id,
      x: 615,
      y: 758,
      sprite: rigged ? "rope_ladder" : "boulder_block",
      w: 28,
      h: 44,
      solid: false,
      isHighlandElement: true,
      isCliffLadderSpot: true,
      zoneId: mapObj.id,
      name: rigged ? "繩梯" : "懸崖[需繩梯]"
    });

    // 3. 在 L 型黃土高台上擺放附圖同款的【4 簇高台礦石】(由左上往右下階梯式排列)
    const plateauOreCoords = [
      { x: 540, y: 655 },
      { x: 675, y: 695 },
      { x: 755, y: 765 },
      { x: 755, y: 830 }
    ];

    plateauOreCoords.forEach(function(pt, idx) {
      const giveKey = cfg.ores[idx % cfg.ores.length];
      const mInfo = matsDB[giveKey] || { name: giveKey };
      mapObj.nodes.push({
        id: "hl_ore_" + mapObj.id + "_" + idx + "_" + token,
        x: pt.x,
        y: pt.y,
        type: "crystal",
        giveKey: giveKey,
        reqTool: "pickaxe",
        reqToolLv: 0,
        perfect: true,
        isHighlandOre: true,
        isClusterBoulder: true,
        reqHighland: true,
        name: "高台" + mInfo.name,
        opened: false
      });
    });

    return mapObj;
  }

  // 判斷座標 (x, y) 是否位於 L 型黃土高台內部 (elevation === 1)
  function isInsideHighlandPlateau(x, y) {
    const inTopWing   = (x >= 355 && x <= 875 && y >= 612 && y <= 732);
    const inRightWing = (x >= 695 && x <= 875 && y >= 730 && y <= 868);
    return inTopWing || inRightWing;
  }

  // 判斷平地 (elevation === 0) 座標 (x, y) 是否撞上 L 型懸崖岩壁或高台區
  function isBlockedByCliffFromLowland(x, y) {
    // 頂部橫向高台與懸崖壁 (x: 340~685, y: 600~782)
    if (x >= 340 && x <= 685 && y >= 600 && y <= 782) return true;
    // 右側縱向高台與懸崖壁 (x: 675~895, y: 600~918)
    if (x >= 675 && x <= 895 && y >= 600 && y <= 918) return true;
    return false;
  }

  // ================= 5. 全新格仔化分類工坊系統 (解決「太難找東西」) =================
  const WorkshopUIManager = {
    curTab: "workshop",
    curSubFilter: "all",
    onlyCraftable: false,
    selectedItemId: null,

    // 判斷一項配方/裝備的材料與金幣是否足夠
    canAffordRecipe: function(s, costMap, goldCost) {
      if (goldCost && (s.gold || 0) < goldCost) return false;
      if (!costMap) return true;
      return Object.entries(costMap).every(function(entry) {
        return ((s.inventory && s.inventory[entry[0]]) || 0) >= entry[1];
      });
    },

    // 將工坊加工配方分類為：explore (開路/工具)、smelt (冶煉/建材)、survival (口糧/靈藥)
    getRecipeSubCategory: function(rec) {
      if (rec.category) return rec.category;
      const id = String(rec.id || "");
      if (id.indexOf("torch") !== -1 || id.indexOf("bomb") !== -1 || id.indexOf("ladder") !== -1 || id.indexOf("lantern") !== -1) {
        return "explore";
      }
      if (id.indexOf("ration") !== -1 || id.indexOf("heal") !== -1 || id.indexOf("hint") !== -1 || id.indexOf("jerky") !== -1) {
        return "survival";
      }
      return "smelt";
    },

    // 使用背包中的強化半成品（精鋼錠 / 硬皮革 / 風乾肉脯）
    useSrpgConsumable: function(matKey) {
      const s = window.Aetheria.State.data;
      if (!s.inventory || (s.inventory[matKey] || 0) <= 0) return;

      if (matKey === "rationJerky") {
        s.inventory.rationJerky--;
        window.Aetheria.State.restoreHunger(80, 90);
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.UI.showToast("🍖 食用【岩鹽風乾肉脯】：恢復 +80% 飽食度與 +90 HP！");
      } else if (matKey === "steelIngot") {
        s.inventory.steelIngot--;
        s.srpgBonusAtk = (s.srpgBonusAtk || 0) + 4;
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.UI.showToast("⚔️ 使用【百煉精鋼錠】打磨武器：主角永久攻擊力 +4！");
      } else if (matKey === "curedLeather") {
        s.inventory.curedLeather--;
        s.srpgBonusDef = (s.srpgBonusDef || 0) + 3;
        s.srpgBonusHp  = (s.srpgBonusHp || 0) + 12;
        window.Aetheria.State.recalcMaxHp();
        s.hp = Math.min(s.maxHp, s.hp + 12);
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.UI.showToast("🛡️ 使用【鞣製硬皮革】加固內甲：永久防禦 +3、最大生命 +12！");
      }
      window.Aetheria.State.save();
      window.Aetheria.UI.openForgeModal(this.curTab);
      window.Aetheria.UI.updateAllHud();
    },

    // 渲染全新格仔化分類工坊
    renderGridWorkshopModal: function(activeTab) {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const Data = window.Aetheria.Data;
      const UI = window.Aetheria.UI;
      const self = this;

      if (activeTab) this.curTab = activeTab;
      const tab = this.curTab;

      UI.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML =
        S.iconHtml("icon_forge") + "巴爾隨身工坊與鍛造台 (💰 " + (s.gold || 0) + " G)";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      // 1. 頂部 5 大主分類 Tab
      const mainTabBar = document.createElement("div");
      mainTabBar.style.cssText = "display:grid; grid-template-columns:repeat(5, 1fr); gap:3px; margin-bottom:6px;";
      [
        { id: "workshop", label: "🔨加工" },
        { id: "tools",    label: "⛏️工具" },
        { id: "weapons",  label: "⚔️武器" },
        { id: "armors",   label: "🛡️防具" },
        { id: "reforge",  label: "✨洗煉" }
      ].forEach(function(t) {
        const b = document.createElement("button");
        b.className = "na-btn" + (tab === t.id ? " highlight" : "");
        b.style.cssText = "padding:5px 2px; font-size:11.5px;";
        b.innerText = t.label;
        b.onclick = function() {
          self.curTab = t.id;
          self.curSubFilter = "all";
          self.selectedItemId = null;
          self.renderGridWorkshopModal(t.id);
        };
        mainTabBar.appendChild(b);
      });
      body.appendChild(mainTabBar);

      // 若點選「✨洗煉」，直接呼叫 Reforge 模組渲染
      if (tab === "reforge" && window.Aetheria.Reforge && window.Aetheria.Reforge.renderReforgeTab) {
        window.Aetheria.Reforge.renderReforgeTab(body);
        return;
      }

      // 2. 收集當前 Tab 的所有項目並轉換為統一的格仔格式
      const itemsList = [];
      const matsDB = Data.MATERIALS || {};

      if (tab === "workshop") {
        (Data.WORKSHOP_RECIPES || []).forEach(function(r) {
          const subCat = self.getRecipeSubCategory(r);
          const canDo = self.canAffordRecipe(s, r.cost, r.goldCost || 0);
          const owned = (s.inventory && s.inventory[r.toKey]) || 0;
          itemsList.push({
            uid: r.id,
            raw: r,
            itemType: "recipe",
            subCat: subCat,
            iconKey: "mat_" + r.toKey,
            shortName: r.name.replace(/\s*x\d+$/i, ""),
            fullName: r.name,
            badgeText: "持有 " + owned,
            canCraft: canDo,
            costMap: r.cost,
            goldCost: r.goldCost || 0,
            desc: r.desc || "工坊合成加工品。"
          });
        });
      } else if (tab === "tools") {
        const toolOrder = ["axe", "pickaxe", "rod", "hook", "pouch"];
        const toolIcons = { axe: "icon_axe", pickaxe: "icon_pickaxe", rod: "fishing_spot", hook: "icon_compass", pouch: "icon_bag" };
        toolOrder.forEach(function(tKey) {
          const tDef = Data.TOOLS && Data.TOOLS[tKey];
          if (!tDef) return;
          const curLv = (s.tools && s.tools[tKey]) || 0;
          const nextTier = tDef.tiers && tDef.tiers[curLv + 1];
          const curTierObj = (tDef.tiers && tDef.tiers[curLv]) || { name: tDef.name };
          const isMax = !nextTier;
          const canDo = !isMax && self.canAffordRecipe(s, nextTier.cost, nextTier.gold || 0);

          itemsList.push({
            uid: "tool_" + tKey,
            toolKey: tKey,
            itemType: "tool",
            subCat: "all",
            iconKey: toolIcons[tKey] || "icon_forge",
            shortName: tDef.name,
            fullName: tDef.name + " (當前：" + curTierObj.name + ")",
            badgeText: isMax ? "★滿級" : ("Lv." + curLv),
            canCraft: canDo,
            isMax: isMax,
            costMap: nextTier ? nextTier.cost : null,
            goldCost: nextTier ? (nextTier.gold || 0) : 0,
            desc: nextTier ? ("下一階【" + nextTier.name + "】：" + (nextTier.desc || "")) : "已達最高階級！"
          });
        });
      } else if (tab === "weapons") {
        Object.values(Data.WEAPONS || {}).forEach(function(w) {
          const unlocked = s.unlockedWeapons && s.unlockedWeapons.indexOf(w.id) !== -1;
          const equipped = (s.equippedWeapon === w.id);
          const canDo = !unlocked && self.canAffordRecipe(s, w.cost, w.gold || 0);
          itemsList.push({
            uid: w.id,
            raw: w,
            itemType: "weapon",
            subCat: (w.tier <= 2) ? "low" : "high",
            iconKey: "icon_sword",
            shortName: w.name,
            fullName: w.name + " (ATK +" + w.atk + ")",
            badgeText: equipped ? "已裝備" : (unlocked ? "已擁有" : ("T" + (w.tier || 1))),
            canCraft: canDo,
            unlocked: unlocked,
            equipped: equipped,
            costMap: w.cost,
            goldCost: w.gold || 0,
            desc: w.desc || ("基礎攻擊力 +" + w.atk)
          });
        });
      } else if (tab === "armors") {
        Object.values(Data.ARMORS || {}).forEach(function(a) {
          const unlocked = s.unlockedArmors && s.unlockedArmors.indexOf(a.id) !== -1;
          const equipped = (s.equippedArmor === a.id);
          const canDo = !unlocked && self.canAffordRecipe(s, a.cost, a.gold || 0);
          itemsList.push({
            uid: a.id,
            raw: a,
            itemType: "armor",
            subCat: "armor",
            iconKey: "icon_shield",
            shortName: a.name,
            fullName: a.name + " (DEF +" + a.def + " / HP +" + (a.hp || 0) + ")",
            badgeText: equipped ? "穿戴中" : (unlocked ? "已擁有" : ("T" + (a.tier || 1))),
            canCraft: canDo,
            unlocked: unlocked,
            equipped: equipped,
            costMap: a.cost,
            goldCost: a.gold || 0,
            desc: a.desc || ("防禦力 +" + a.def + "，最大生命 +" + (a.hp || 0))
          });
        });
        Object.values(Data.RELICS || {}).forEach(function(rel) {
          const unlocked = s.unlockedRelics && s.unlockedRelics.indexOf(rel.id) !== -1;
          const canDo = !unlocked && self.canAffordRecipe(s, rel.cost, rel.gold || 0);
          itemsList.push({
            uid: rel.id,
            raw: rel,
            itemType: "relic",
            subCat: "relic",
            iconKey: "crystal",
            shortName: rel.name,
            fullName: "【聖物】" + rel.name,
            badgeText: unlocked ? "★已共鳴" : "聖物",
            canCraft: canDo,
            unlocked: unlocked,
            costMap: rel.cost,
            goldCost: rel.gold || 0,
            desc: rel.desc || "永久被動聖物加成。"
          });
        });
      }

      // 3. 子分類篩選列 (Sub-filter Pills)
      const filterBar = document.createElement("div");
      filterBar.className = "wk-subfilter-bar";

      let subFilters = [];
      if (tab === "workshop") {
        subFilters = [
          { id: "all",      label: "全部(" + itemsList.length + ")" },
          { id: "can",      label: "✅可製作" },
          { id: "explore",  label: "🧗開路/照明" },
          { id: "smelt",    label: "🔥冶煉/建材" },
          { id: "survival", label: "🍖口糧/靈藥" }
        ];
      } else if (tab === "weapons") {
        subFilters = [
          { id: "all",  label: "全部武器" },
          { id: "can",  label: "✅可鍛造/已擁有" },
          { id: "low",  label: "T1~T2 初中階" },
          { id: "high", label: "T3~T4 傳奇階" }
        ];
      } else if (tab === "armors") {
        subFilters = [
          { id: "all",   label: "全部" },
          { id: "armor", label: "🛡️防具護甲" },
          { id: "relic", label: "💎遠古聖物" }
        ];
      }

      subFilters.forEach(function(sf) {
        const pill = document.createElement("button");
        pill.className = "wk-filter-pill" + (self.curSubFilter === sf.id ? " active" : "");
        pill.innerText = sf.label;
        pill.onclick = function() {
          self.curSubFilter = sf.id;
          self.selectedItemId = null;
          self.renderGridWorkshopModal(tab);
        };
        filterBar.appendChild(pill);
      });
      if (subFilters.length > 0) body.appendChild(filterBar);

      // 根據子分類過濾項目
      const filteredItems = itemsList.filter(function(item) {
        if (self.curSubFilter === "all") return true;
        if (self.curSubFilter === "can") return item.canCraft || item.unlocked;
        return item.subCat === self.curSubFilter;
      });

      // 預設選中第一個可製作項目（或清單第一項）
      if (!this.selectedItemId || !filteredItems.some(function(x) { return x.uid === self.selectedItemId; })) {
        const firstCraftable = filteredItems.find(function(x) { return x.canCraft; });
        this.selectedItemId = firstCraftable ? firstCraftable.uid : (filteredItems[0] && filteredItems[0].uid);
      }

      const selectedObj = filteredItems.find(function(x) { return x.uid === this.selectedItemId; }) || filteredItems[0];

      // 4. 頂部固定【配方檢視與一鍵製作盒 (Inspector Box)】
      const inspector = document.createElement("div");
      inspector.className = "wk-inspector-box";

      if (selectedObj) {
        let chipsHtml = "";
        if (selectedObj.costMap && !selectedObj.unlocked && !selectedObj.isMax) {
          Object.entries(selectedObj.costMap).forEach(function(entry) {
            const mKey = entry[0];
            const req = entry[1];
            const have = (s.inventory && s.inventory[mKey]) || 0;
            const mName = (matsDB[mKey] && matsDB[mKey].name) || mKey;
            const ok = have >= req;
            chipsHtml +=
              '<span class="wk-mat-chip ' + (ok ? 'ok' : 'lack') + '">' +
                S.iconHtml("mat_" + mKey, true) + mName + ' ' + have + '/' + req + (ok ? ' ✓' : '') +
              '</span>';
          });
        }
        if (selectedObj.goldCost > 0 && !selectedObj.unlocked && !selectedObj.isMax) {
          const gOk = (s.gold || 0) >= selectedObj.goldCost;
          chipsHtml +=
            '<span class="wk-mat-chip ' + (gOk ? 'ok' : 'lack') + '">💰 ' + selectedObj.goldCost + ' G</span>';
        }

        // 右側主動作按鈕
        let actionBtnHtml = "";
        if (selectedObj.itemType === "recipe") {
          const canUseBuff = (selectedObj.raw.toKey === "steelIngot" || selectedObj.raw.toKey === "curedLeather" || selectedObj.raw.toKey === "rationJerky") &&
                             ((s.inventory && s.inventory[selectedObj.raw.toKey]) || 0) > 0;
          actionBtnHtml =
            '<div style="display:flex; flex-direction:column; gap:4px;">' +
              '<button class="na-btn ' + (selectedObj.canCraft ? 'highlight' : '') + '" style="padding:7px 12px; font-size:13px; white-space:nowrap;" id="wk-main-craft-btn">🔨 立即製作</button>' +
              (canUseBuff
                ? '<button class="na-btn" style="padding:4px 8px; font-size:11px; border-color:#5ac54f; color:#5ac54f;" id="wk-use-buff-btn">✨ 使用強化</button>'
                : '') +
            '</div>';
        } else if (selectedObj.itemType === "tool") {
          actionBtnHtml = selectedObj.isMax
            ? '<span style="color:#5ac54f; font-weight:900;">★ 已滿級</span>'
            : '<button class="na-btn ' + (selectedObj.canCraft ? 'highlight' : '') + '" style="padding:7px 12px; white-space:nowrap;" id="wk-main-craft-btn">⛏️ 升級工具</button>';
        } else if (selectedObj.itemType === "weapon" || selectedObj.itemType === "armor") {
          if (selectedObj.equipped) {
            actionBtnHtml = '<span style="color:#ffd166; font-weight:900; white-space:nowrap;">✓ 裝備中</span>';
          } else if (selectedObj.unlocked) {
            actionBtnHtml = '<button class="na-btn highlight" style="padding:7px 12px; white-space:nowrap;" id="wk-main-craft-btn">⚡ 立即裝備</button>';
          } else {
            actionBtnHtml = '<button class="na-btn ' + (selectedObj.canCraft ? 'highlight' : '') + '" style="padding:7px 12px; white-space:nowrap;" id="wk-main-craft-btn">🔨 鍛造</button>';
          }
        } else if (selectedObj.itemType === "relic") {
          actionBtnHtml = selectedObj.unlocked
            ? '<span style="color:#5ac54f; font-weight:900;">★ 生效中</span>'
            : '<button class="na-btn ' + (selectedObj.canCraft ? 'highlight' : '') + '" style="padding:7px 12px; white-space:nowrap;" id="wk-main-craft-btn">💎 合成聖物</button>';
        }

        inspector.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">' +
            '<div style="flex:1;">' +
              '<div style="font-size:13.5px; font-weight:900; color:#ffd166;">' +
                S.iconHtml(selectedObj.iconKey, true) + selectedObj.fullName +
              '</div>' +
              '<div style="font-size:11.5px; color:#cbd5e1; margin-top:2px; line-height:1.35;">' + selectedObj.desc + '</div>' +
              (chipsHtml ? '<div style="margin-top:4px;">' + chipsHtml + '</div>' : '') +
            '</div>' +
            actionBtnHtml +
          '</div>';
      } else {
        inspector.innerHTML = '<div style="color:#94a3b8; font-size:12px; text-align:center;">此分類下暫無項目</div>';
      }
      body.appendChild(inspector);

      // 綁定頂部檢視器的「立即製作 / 升級 / 裝備」按鈕
      setTimeout(function() {
        const mainBtn = document.getElementById("wk-main-craft-btn");
        if (mainBtn && selectedObj) {
          mainBtn.onclick = function() {
            if (selectedObj.itemType === "recipe") {
              UI.craftWorkshopItem(selectedObj.uid);
            } else if (selectedObj.itemType === "tool") {
              if (UI.upgradeTool) UI.upgradeTool(selectedObj.toolKey);
              else if (UI.craftToolUpgrade) UI.craftToolUpgrade(selectedObj.toolKey);
            } else if (selectedObj.itemType === "weapon") {
              UI.craftWeapon(selectedObj.uid);
            } else if (selectedObj.itemType === "armor") {
              UI.craftArmor(selectedObj.uid);
            } else if (selectedObj.itemType === "relic") {
              UI.craftRelic(selectedObj.uid);
            }
            self.renderGridWorkshopModal(tab);
          };
        }

        const useBuffBtn = document.getElementById("wk-use-buff-btn");
        if (useBuffBtn && selectedObj && selectedObj.raw) {
          useBuffBtn.onclick = function() {
            self.useSrpgConsumable(selectedObj.raw.toKey);
          };
        }
      }, 0);

      // 5. 底部 3 欄 9 宮格圖示選單 (Visual Icon Grid)
      const grid = document.createElement("div");
      grid.className = "wk-icon-grid";

      filteredItems.forEach(function(item) {
        const isSel = (selectedObj && selectedObj.uid === item.uid);
        const cell = document.createElement("div");
        cell.className = "wk-grid-cell" + (item.canCraft ? " can-craft" : "") + (isSel ? " selected" : "");
        cell.innerHTML =
          (item.canCraft ? '<span class="wk-cell-craft-dot">●可做</span>' : '') +
          '<span class="wk-cell-badge">' + item.badgeText + '</span>' +
          '<div style="margin-top:4px;">' + S.iconHtml(item.iconKey) + '</div>' +
          '<div class="wk-cell-name">' + item.shortName + '</div>';

        cell.onclick = function() {
          if (window.Aetheria.Audio) window.Aetheria.Audio.sfxTalkBlip();
          self.selectedItemId = item.uid;
          self.renderGridWorkshopModal(tab);
        };
        grid.appendChild(cell);
      });

      body.appendChild(grid);
    }
  };

  window.Aetheria.HighlandsWorkshop = WorkshopUIManager;

  // ================= 6. 掛載高低差移動碰撞、繩梯攀爬、去標籤化與格仔工坊 =================
  function hookSystemsForHighlandsAndWorkshop() {
    const St   = window.Aetheria.State;
    const Maps = window.Aetheria.Data && window.Aetheria.Data.Maps;
    const Exp  = window.Aetheria.Explore;
    const Ren  = window.Aetheria.Renderer;
    const Bat  = window.Aetheria.Battle;
    const UI   = window.Aetheria.UI;

    if (St) {
      if (St.getTotalAtk) {
        const origAtk = St.getTotalAtk.bind(St);
        St.getTotalAtk = function() {
          return origAtk() + ((this.data && this.data.srpgBonusAtk) || 0);
        };
      }
      if (St.getTotalDef) {
        const origDef = St.getTotalDef.bind(St);
        St.getTotalDef = function() {
          return origDef() + ((this.data && this.data.srpgBonusDef) || 0);
        };
      }
      if (St.recalcMaxHp) {
        const origMaxHp = St.recalcMaxHp.bind(St);
        St.recalcMaxHp = function() {
          origMaxHp();
          if (this.data && this.data.srpgBonusHp) {
            this.data.maxHp += this.data.srpgBonusHp;
            if (this.data.hp > this.data.maxHp) this.data.hp = this.data.maxHp;
          }
        };
      }
    }

    if (Maps && Maps.getMap) {
      const origGetMap = Maps.getMap.bind(Maps);
      Maps.getMap = function(zoneId) {
        if (zoneId && zoneId.indexOf("grotto_") === 0) {
          const pZone = zoneId.replace("grotto_", "");
          if (!grottoMapsCache[zoneId]) {
            grottoMapsCache[zoneId] = buildCliffGrottoMap(pZone);
          }
          return grottoMapsCache[zoneId];
        }
        const m = origGetMap(zoneId);
        if (m && HIGHLAND_ZONES[m.id]) {
          injectHighlandCliffIntoMap(m);
        }
        return m;
      };

      const origRefresh = Maps.refreshAllResources.bind(Maps);
      Maps.refreshAllResources = function() {
        origRefresh();
        Object.keys(grottoMapsCache).forEach(function(k) {
          delete grottoMapsCache[k];
        });
      };
    }

    if (Exp) {
      // A. 高低差懸崖真實碰撞檢查：平地不可穿過啡色懸崖壁，高台不可走出黃土邊緣
      const origUpdateStep = Exp.updateStep.bind(Exp);
      Exp.updateStep = function() {
        const s = window.Aetheria.State.data;
        const prevX = s.heroX;
        const prevY = s.heroY;
        const prevZone = s.currentZone;

        origUpdateStep();

        if (s.currentZone !== prevZone) {
          s.onHighland = false;
          return;
        }

        if (!HIGHLAND_ZONES[s.currentZone]) {
          s.onHighland = false;
          return;
        }

        if (s.onHighland) {
          // 處於黃土高台層 (elevation === 1)：限制在 L 型高台範圍內行走，不會跌落懸崖
          if (!isInsideHighlandPlateau(s.heroX, s.heroY)) {
            s.heroX = prevX;
            s.heroY = prevY;
          }
        } else {
          // 處於下層綠草地 (elevation === 0)：撞到深啡色懸崖岩壁或高台時阻擋
          if (isBlockedByCliffFromLowland(s.heroX, s.heroY)) {
            s.heroX = prevX;
            s.heroY = prevY;
          }
        }
      };

      // B. 走近懸崖繩梯錨點按 A 鍵：架設【攀岩繩梯】或上下攀爬高台！
      const origInteract = Exp.interactNearby.bind(Exp);
      Exp.interactNearby = function() {
        const s = window.Aetheria.State.data;
        const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
        if (mapObj && mapObj.decos) {
          for (let i = 0; i < mapObj.decos.length; i++) {
            const d = mapObj.decos[i];
            if (d && d.isCliffLadderSpot && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 56) {
              if (!s.riggedCliffs) s.riggedCliffs = {};
              const isRigged = Boolean(s.riggedCliffs[mapObj.id]);

              if (!isRigged) {
                if ((s.inventory.ropeLadder || 0) <= 0) {
                  window.Aetheria.Audio.sfxWrong();
                  window.Aetheria.UI.showToast("🧗 陡峭的懸崖岩壁！請先在【工坊 ➔ 加工】合成【攀岩繩梯 x1】(麻繩x1+原木x2) 架設！");
                  return;
                }
                s.inventory.ropeLadder--;
                s.riggedCliffs[mapObj.id] = true;
                d.sprite = "rope_ladder";
                d.name = "繩梯";
                if (window.Aetheria.Renderer) window.Aetheria.Renderer.builtZoneKey = null;
              }

              // 執行上下攀爬切換高低層
              window.Aetheria.Audio.sfxGather();
              if (s.onHighland) {
                s.onHighland = false;
                s.heroX = d.x;
                s.heroY = 798;
                s.petX = d.x - 20;
                s.petY = 802;
                window.Aetheria.UI.showToast("🧗 順着攀岩繩梯爬下了綠草谷地！");
              } else {
                s.onHighland = true;
                s.heroX = d.x;
                s.heroY = 712;
                s.petX = d.x - 20;
                s.petY = 712;
                window.Aetheria.UI.showToast("🧗 順着攀岩繩梯爬上了【黃土高台礦區】！");
              }
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
        if (hintEl && mapObj && mapObj.decos) {
          for (let i = 0; i < mapObj.decos.length; i++) {
            const d = mapObj.decos[i];
            if (d && d.isCliffLadderSpot && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 56) {
              const rigged = Boolean(s.riggedCliffs && s.riggedCliffs[mapObj.id]);
              hintEl.innerText = !rigged ? "架設繩梯" : (s.onHighland ? "爬下懸崖" : "爬上高台");
              return;
            }
          }
        }
        origHint(mapObj, s);
      };

      // C. 保護高台礦簇：必須先爬上高台 (s.onHighland === true) 才可開採
      const origHarvest = Exp.harvestNode.bind(Exp);
      Exp.harvestNode = function(node) {
        const s = window.Aetheria.State.data;
        if (node && node.reqHighland && !s.onHighland) {
          window.Aetheria.Audio.sfxWrong();
          window.Aetheria.UI.showToast("🧗 此礦簇位於高台上！請先從懸崖右側的【繩梯】爬上高台再開採！");
          return;
        }
        origHarvest(node);
      };
    }

    // D. 擊敗野外魔物時，55% 機率額外掉落《Survival RPG》素材【荒野獸皮 x1】
    if (Bat && Bat.winBattle) {
      const origWin = Bat.winBattle.bind(Bat);
      Bat.winBattle = function() {
        const isCombat = (this.mode === "combat");
        origWin();
        if (isCombat && Math.random() < 0.55) {
          const s = window.Aetheria.State.data;
          s.inventory.rawHide = (s.inventory.rawHide || 0) + 1;
          window.Aetheria.State.save();
        }
      };
    }

    // E. 渲染器掛載：繪製附圖的 L 型黃土高台、垂直深啡色懸崖壁、黑色山洞拱門，並實施「去標籤化」
    if (Ren) {
      const origBuild = Ren.buildSceneDOM.bind(Ren);
      Ren.buildSceneDOM = function(mapObj) {
        origBuild(mapObj);
        const terrainLayer = document.getElementById("world-terrain-layer");
        const S = window.Aetheria.Data.Sprites;
        if (!terrainLayer || !mapObj) return;

        // 繪製 L 型高低差懸崖與山洞口 (對應附圖 1000311094.jpg)
        if (HIGHLAND_ZONES[mapObj.id]) {
          // 1. L型上層黃土高台地板
          const platTop = document.createElement("div");
          platTop.className = "srpg-plateau-top";
          platTop.style.cssText = "left:340px; top:605px; width:550px; height:135px;";
          terrainLayer.appendChild(platTop);

          const platRight = document.createElement("div");
          platRight.className = "srpg-plateau-top";
          platRight.style.cssText = "left:680px; top:732px; width:210px; height:148px; border-top:none; border-radius:0;";
          terrainLayer.appendChild(platRight);

          // 2. 垂直深啡色懸崖岩壁
          const cliffMain = document.createElement("div");
          cliffMain.className = "srpg-cliff-wall";
          cliffMain.style.cssText = "left:340px; top:736px; width:344px; height:46px;";
          terrainLayer.appendChild(cliffMain);

          const cliffStepSide = document.createElement("div");
          cliffStepSide.className = "srpg-cliff-side-wall";
          cliffStepSide.style.cssText = "left:674px; top:736px; width:14px; height:144px;";
          terrainLayer.appendChild(cliffStepSide);

          const cliffRightBottom = document.createElement("div");
          cliffRightBottom.className = "srpg-cliff-wall";
          cliffRightBottom.style.cssText = "left:680px; top:876px; width:210px; height:44px;";
          terrainLayer.appendChild(cliffRightBottom);

          // 3. 懸崖壁上的黑色山洞拱門
          const caveArch = document.createElement("div");
          caveArch.className = "srpg-cave-arch";
          caveArch.style.cssText = "left:440px; top:738px;";
          terrainLayer.appendChild(caveArch);
        }

        // 將高台礦簇與礦洞礦石替換為附圖的「三連岩塊礦簇」圖示
        Object.keys(this.domPool.nodes || {}).forEach(function(nId) {
          const item = Ren.domPool.nodes[nId];
          if (item && item.data && item.data.isClusterBoulder && S) {
            item.el.innerHTML = '<img src="' + S.getDataURL("cluster_boulder") + '" alt="">';
            if (item.lbl) item.el.appendChild(item.lbl);
          }
        });
      };

      // ★ 實施「去標籤化」：普通採集物平時隱藏頭頂文字框，只有主角走近 (<58px) 時才浮現！
      const origRender = Ren.renderWorld.bind(Ren);
      Ren.renderWorld = function() {
        origRender();
        try {
          const s = window.Aetheria.State.data;
          Object.keys(this.domPool.nodes || {}).forEach(function(nId) {
            const item = Ren.domPool.nodes[nId];
            if (!item || !item.data || !item.lbl) return;
            const n = item.data;
            if (n.opened) {
              item.lbl.style.display = "none";
              return;
            }
            if (n.type === "chest") return; // 寶箱保留標籤
            const dist = Math.hypot((s.heroX || 0) - n.x, (s.heroY || 0) - n.y);
            item.lbl.style.display = (dist < 58) ? "block" : "none";
          });
        } catch (e) {}
      };
    }

    // F. 將工坊與口糧選單對接至新系統
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

      // 在右下角「口糧」彈窗中加入【岩鹽風乾肉脯】選項
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
      injectHighlandsAndWorkshopStyles();
      registerSurvivalRpgSprites();
      registerSrpgDataIntoGame();
      hookSystemsForHighlandsAndWorkshop();

      const s = window.Aetheria.State && window.Aetheria.State.data;
      if (s && window.Aetheria.Data && window.Aetheria.Data.Maps) {
        const curMap = window.Aetheria.Data.Maps.getMap(s.currentZone);
        if (curMap && HIGHLAND_ZONES[curMap.id]) {
          curMap._highlandInjectedToken = null;
          injectHighlandCliffIntoMap(curMap);
        }
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
      console.error("Survival Highlands & Grid Workshop v9.3 init error:", err);
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(initHighlandsAndWorkshopModule, 175);
  } else {
    window.addEventListener("load", function() {
      setTimeout(initHighlandsAndWorkshopModule, 175);
    });
  }
})();
