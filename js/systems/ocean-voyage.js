/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 海濱碼頭、造船主線整合與大航海模組 (ocean-voyage.js - v8.8)
 * Cross-Check 修正：
 *   1. 移除陸地 0.76x 減速，並正式串接【鍍金順風船帆 (sailLv)】Lv.1~Lv.3 的海上航行加速 (+12% / +20% / +28%)
 *   2. 打撈海上漂流桶 (isSeaBarrel) 正式串接 sailLv 加成（額外金幣、秘銀與古航海圖殘卷）
 *   3. 保護荒島/深淵地牢的【炸彈裂縫秘寶箱】：必須先用炸彈炸開旁邊的裂縫岩壁，才可開啟寶箱！
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  function injectVoyageStyles() {
    if (document.getElementById("voyage-v75-styles")) return;
    const style = document.createElement("style");
    style.id = "voyage-v75-styles";
    style.textContent = `
      .dom-coast-beach {
        position: absolute;
        left: 0;
        top: 356px;
        width: 100%;
        height: 124px;
        background: linear-gradient(180deg, rgba(230, 200, 140, 0.92) 0%, #e6c88c 28%, #d4b06a 100%);
        border-top: 3px dashed rgba(181, 137, 82, 0.75);
        pointer-events: none;
        z-index: 1;
      }
      .dom-coast-sea {
        position: absolute;
        left: 0;
        top: 392px;
        width: 100%;
        height: 88px;
        background: linear-gradient(180deg, #38b6ff 0%, #1d5eb8 45%, #102542 100%);
        border-top: 4px solid #ffffff;
        box-shadow: inset 0 6px 10px rgba(140, 224, 255, 0.65);
        pointer-events: none;
        z-index: 2;
        animation: tideWave 2.8s infinite ease-in-out;
      }
      @keyframes tideWave {
        0%, 100% { border-top-width: 3px; transform: translateY(0px); }
        50% { border-top-width: 6px; transform: translateY(2px); }
      }
      .dom-wooden-pier {
        position: absolute;
        left: 421px;
        top: 358px;
        width: 48px;
        height: 76px;
        background: repeating-linear-gradient(180deg, #9c6347 0px, #9c6347 7px, #5c3824 7px, #5c3824 10px);
        border-left: 3px solid #1c1619;
        border-right: 3px solid #1c1619;
        border-bottom: 3px solid #1c1619;
        box-shadow: 0 5px 8px rgba(0,0,0,0.55);
        pointer-events: none;
        z-index: 3;
      }
      .map-theme-ocean {
        background-color: #16427d;
        background-image:
          radial-gradient(#2978d4 16%, transparent 17%),
          radial-gradient(#0f2942 16%, transparent 17%);
        background-size: 36px 36px;
        background-position: 0 0, 18px 18px;
      }
      .dom-dirt-blob.ocean-atoll {
        background: radial-gradient(ellipse at center, #5b8c3e 0%, #e6c88c 62%, #38b6ff 92%, transparent 100%) !important;
        border: 3px solid rgba(255, 255, 255, 0.75) !important;
        box-shadow: 0 0 14px rgba(56, 182, 255, 0.65);
      }
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
    ], { K: "#141013", Y: "#f5b700", D: "#8f563b", W: "#d9a066" });

    const shipSloopUrl = buildGridDataUrl([
      ".......KK.......",
      "......KYYK......",
      ".....KWWWWK.....",
      "....KWWWWWWK....",
      "...KWWWWWWWWK...",
      "..KWWWWWWWWWWK..",
      "..KWWWWWWWWWWK..",
      ".KWWWWWWWWWWWWK.",
      "..KKKKKKKKKKKK..",
      ".......KK.......",
      ".KKKKKKKKKKKKKK.",
      "KDDDDDDDDDDDDDDK",
      ".KLLLLLLLLLLLLK.",
      "..KDDDDDDDDDDK..",
      "..BBBBBBBBBBBB..",
      "....BBBBBBBB...."
    ], { K: "#141013", Y: "#e03c4b", W: "#ffffff", D: "#8f563b", L: "#d9a066", B: "#8ce0ff" });

    const shipGalleonUrl = buildGridDataUrl([
      "...KK......KK...",
      "..KYYK....KYYK..",
      ".KRRRRK..KYYYYK.",
      "KRRRRRRKKYYYYYYK",
      "KRRRRRRKKYYYYYYK",
      "KRRRRRRKKYYYYYYK",
      ".KRRRRK..KYYYYK.",
      "..KKKK....KKKK..",
      "...KK......KK...",
      "KKKKKKKKKKKKKKKK",
      "KYYYYDDDDDDYYYYK",
      ".KDDDDDDDDDDDDK.",
      "..KLLLLLLLLLLK..",
      "...KDDDDDDDDK...",
      "..BBBBBBBBBBBB..",
      "....BBBBBBBB...."
    ], { K: "#141013", Y: "#f5b700", R: "#e03c4b", D: "#5c3824", L: "#d9a066", B: "#8ce0ff" });

    const seaBarrelUrl = buildGridDataUrl([
      "................",
      "....KKKKKKKK....",
      "...KDDDDDDDDK...",
      "..KIIIIIIIIIIK..",
      "..KDDDDDDDDDDK..",
      "..KDDDYYYYDDDK..",
      "..KDDDDDDDDDDK..",
      "..KIIIIIIIIIIK..",
      "..KDDDDDDDDDDK..",
      "...KDDDDDDDDK...",
      "..BBBBBBBBBBBB..",
      ".BBBBWWWWWWBBBB.",
      "....BBBBBBBB....",
      "................",
      "................",
      "................"
    ], { K: "#141013", D: "#8f563b", I: "#4a4e69", Y: "#f5b700", B: "#38b6ff", W: "#ffffff" });

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
    ], { K: "#141013", Y: "#d9a066", S: "#f5e6c4", B: "#3898ff", R: "#e03c4b", X: "#8f563b" });

    const customUrls = {
      voyage_dock: dockWheelUrl,
      ship_sloop: shipSloopUrl,
      ship_galleon: shipGalleonUrl,
      sea_barrel: seaBarrelUrl,
      mat_seaChart: mapChartUrl
    };

    const origGetDataURL = S.getDataURL.bind(S);
    S.getDataURL = function(key) {
      if (customUrls[key]) return customUrls[key];
      return origGetDataURL(key);
    };
  }

  const SHIP_BLUEPRINTS = {
    1: {
      tier: 1,
      name: "近海探索木帆船",
      sprite: "ship_sloop",
      desc: "【第1章主線造船】由翠風原木、堅韌藤蔓與琥珀松脂打造的單桅木帆船。完工後可從營地木棧橋親自駕船駛入【無盡碧海】，探索珊瑚荒島、沉船墓地與深淵地牢！",
      cost: { wood: 3, vine: 2, resin: 2 }
    },
    2: {
      tier: 2,
      name: "破浪遠洋大帆船",
      sprite: "ship_galleon",
      desc: "【第3章主線同步】與第3區海岸「破浪遠航木筏」同步升級！航行飽食度消耗減半，並可衝破狂風巨浪登陸極東【星隕火山孤島】！",
      cost: { plank: 4, pitch: 2, heavySail: 1, coral: 2, coreSiren: 1 }
    }
  };

  function getPlayerBoatTier(s) {
    if (!s) return 0;
    if (s.projectsBuilt && s.projectsBuilt.proj_z3_raft) {
      s.boatTier = Math.max(s.boatTier || 0, 2);
    }
    if ((s.boatTier || 0) >= 2 && s.projectsBuilt) {
      s.projectsBuilt.proj_z3_raft = true;
    }
    return s.boatTier || 0;
  }

  function initVoyageMaterials() {
    const Data = window.Aetheria.Data;
    if (!Data || !Data.MATERIALS) return;

    Data.MATERIALS.seaChart = {
      id: "seaChart",
      name: "古航海圖殘卷",
      tier: 3,
      desc: "【大航海主線與首領戰利品】討伐未知荒島與秘境地牢首領、或打撈海上漂流瓶獲得，可交付達克主線或於碼頭兌換聖碑殘片與星隕鐵。"
    };
  }

  function injectShipbuildingMainQuests() {
    const Data = window.Aetheria.Data;
    if (!Data || !Array.isArray(Data.MAIN_QUESTS)) return;
    if (Data.MAIN_QUESTS.some(function(q) { return q.id === "mq_06_ship"; })) return;

    const mqShip1 = {
      id: "mq_06_ship",
      chapter: "航海1/2",
      giverNpcId: "npc_fisher",
      giverName: "老漁夫・阿海",
      giverZone: "0.曙光營地(海濱)",
      title: "建造【近海探索木帆船】並揚帆出海",
      desc: "步驟①：收集翠風原木x3、堅韌藤蔓x2、琥珀松脂x2 ➔ 步驟②：走上營地南岸木棧橋對準【造船廠】按A鍵造船並登船駛入【無盡碧海】 ➔ 步驟③：向阿海回報領獎。",
      rewardText: "180 EXP、200 G、炭烤鮮魚乾 x2、松脂火把 x2",
      getProgressList: function(s) {
        const bt = getPlayerBoatTier(s);
        const sailed = Boolean(s.questProgress && s.questProgress.sailedOnce);
        if (bt >= 1) {
          return [
            { name: "建造近海木帆船", cur: 1, max: 1 },
            { name: "登船駛入無盡碧海", cur: sailed ? 1 : 0, max: 1 }
          ];
        }
        const contrib = (s.shipContributions && s.shipContributions[1]) || {};
        return [
          { key: "wood",  name: "翠風原木", cur: (s.inventory.wood || 0) + (contrib.wood || 0),   max: 3 },
          { key: "vine",  name: "堅韌藤蔓", cur: (s.inventory.vine || 0) + (contrib.vine || 0),   max: 2 },
          { key: "resin", name: "琥珀松脂", cur: (s.inventory.resin || 0) + (contrib.resin || 0), max: 2 },
          { name: "木棧橋造船出海", cur: 0, max: 1 }
        ];
      },
      checkComplete: function(s) {
        return getPlayerBoatTier(s) >= 1 && Boolean(s.questProgress && s.questProgress.sailedOnce);
      },
      onClaim: function(s) {
        s.inventory.rationFish = (s.inventory.rationFish || 0) + 2;
        s.inventory.torchItem = (s.inventory.torchItem || 0) + 2;
        window.Aetheria.State.gainRewards(180, 200, 35);
      }
    };

    const mqShip2 = {
      id: "mq_12_voyage",
      chapter: "航海2/2",
      giverNpcId: "npc_shipwright",
      giverName: "老船匠・達克",
      giverZone: "3.翡翠沉船海岸",
      title: "遠洋探索：尋回【古航海圖殘卷】",
      desc: "步驟①：從海岸碼頭或營地棧橋登船駛入【無盡碧海】 ➔ 步驟②：登陸任意荒島或深淵地牢（開啟秘寶箱、打撈漂流瓶或擊敗首領）取得【古航海圖殘卷 x1】 ➔ 步驟③：向老船匠達克回報領獎。",
      rewardText: "550 EXP、600 G、古文明聖碑殘片 x1、熔岩黑曜石 x1",
      getProgressList: function(s) {
        const haveChart = (s.inventory && s.inventory.seaChart) || 0;
        const everGot = (s.questProgress && s.questProgress.gotSeaChartOnce) ? 1 : 0;
        return [
          { key: "seaChart", name: "古航海圖殘卷", cur: Math.max(haveChart, everGot), max: 1 }
        ];
      },
      checkComplete: function(s) {
        return ((s.inventory && s.inventory.seaChart) || 0) >= 1 || Boolean(s.questProgress && s.questProgress.gotSeaChartOnce);
      },
      onClaim: function(s) {
        s.inventory.tabletShard = (s.inventory.tabletShard || 0) + 1;
        s.inventory.obsidian = (s.inventory.obsidian || 0) + 1;
        window.Aetheria.State.gainRewards(550, 600, 65);
      }
    };

    const idx06 = Data.MAIN_QUESTS.findIndex(function(q) { return q.id === "mq_06"; });
    if (idx06 !== -1) Data.MAIN_QUESTS.splice(idx06 + 1, 0, mqShip1);
    else Data.MAIN_QUESTS.push(mqShip1);

    const idx12 = Data.MAIN_QUESTS.findIndex(function(q) { return q.id === "mq_12"; });
    if (idx12 !== -1) Data.MAIN_QUESTS.splice(idx12 + 1, 0, mqShip2);
    else Data.MAIN_QUESTS.push(mqShip2);

    if (Data.getNpcDynamicGreeting) {
      const origGreeting = Data.getNpcDynamicGreeting.bind(Data);
      Data.getNpcDynamicGreeting = function(s, npcId) {
        const mq = Data.getCurrentMainQuest ? Data.getCurrentMainQuest(s) : null;
        if (mq && mq.giverNpcId === npcId) {
          const isAcc = Boolean(s.questProgress && s.questProgress["acc_" + mq.id]);
          const isDone = mq.checkComplete(s);
          if (mq.id === "mq_06_ship") {
            if (!isAcc) return "Justin！你已經打通了迷霧森林，是時候建造一艘真正的【近海探索木帆船】出海看看了！快點擊下方卡片接取造船主線吧！";
            if (isDone) return "太壯觀了！看著你親手打造的木帆船在碧海上乘風破浪，老夫也熱血沸騰起來！這是給你的遠航補給獎勵，快收下吧！";
            return "造船材料需要【翠風原木 x3、堅韌藤蔓 x2、琥珀松脂 x2】。集齊後走上我右邊的木棧橋，對準【🔨造船廠】按 A 鍵造船並登船出海一次就能回來領獎了！";
          }
          if (mq.id === "mq_12_voyage") {
            if (!isAcc) return "破浪大帆船已經就緒！傳說外海的沉船墓地與深淵地牢藏着【古航海圖殘卷】，快接下這份遠洋委託出海尋寶吧！";
            if (isDone) return "這正是失傳已久的【古航海圖殘卷】！有了它，你隨時可以在碼頭兌換聖碑殘片與星隕鐵！這份豐厚報酬歸你了！";
            return "從旁邊的碼頭登船駛入【無盡碧海】，打撈海上的古老漂流瓶、或登陸荒島開啟秘寶箱與討伐首領，就能取得【古航海圖殘卷】！";
          }
        }
        return origGreeting(s, npcId);
      };
    }

    if (Data.SURVIVAL_PROJECTS && Data.SURVIVAL_PROJECTS.proj_z3_raft) {
      const origRaftComplete = Data.SURVIVAL_PROJECTS.proj_z3_raft.onComplete;
      Data.SURVIVAL_PROJECTS.proj_z3_raft.onComplete = function(s) {
        s.boatTier = 2;
        if (origRaftComplete) origRaftComplete(s);
      };
    }
  }

  const VOYAGE_ISLANDS = [
    {
      id: "island_coral",
      name: "迷霧珊瑚荒島",
      shortName: "珊瑚荒島",
      recLv: 3,
      reqBoatTier: 1,
      seaX: 520,
      seaY: 175,
      theme: "coast",
      bgm: "forest",
      fog: false,
      desc: "位於西北近海的珊瑚礁島，盛產原木、枯枝、藍晶鐵礦、深海珊瑚與水波釣魚點。",
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
      reqBoatTier: 1,
      seaX: 920,
      seaY: 185,
      theme: "coast",
      bgm: "cave",
      fog: false,
      desc: "位於東北暗礁區的古戰船擱淺地，可搜刮流沙秘銀礦、幽靈古帆布、荒野亞麻與沉船秘寶箱。",
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
      reqBoatTier: 1,
      seaX: 680,
      seaY: 575,
      theme: "cave",
      bgm: "cave",
      fog: true,
      isMultiFloor: true,
      desc: "位於南方海蝕洞的無限層數黑霧地牢！內含需用【炸彈】炸開的隱藏寶庫與稀有礦脈！",
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
      reqBoatTier: 2,
      seaX: 1220,
      seaY: 420,
      theme: "volcano",
      bgm: "boss",
      fog: false,
      desc: "位於極東狂風海域的傳奇孤島（需二階遠洋大帆船）。遍佈熔岩黑曜石、深淵星隕鐵與遠古海龍皇！",
      orePool: ["obsidian", "obsidian", "starIron", "mithril"],
      herbPool: ["goldLeaf", "iceLotus", "magmaScale", "flower"],
      monPool: [
        { name: "孤島熔岩魔將", type: "skull", lvOffset: 0 },
        { name: "星隕烈焰龍侍", type: "bamboo", lvOffset: 2 }
      ],
      bossConfig: { name: "遠古星隕海龍皇", type: "boss", lvOffset: 4 }
    }
  ];

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

  function generateOceanSeaMap() {
    const s = (window.Aetheria.State && window.Aetheria.State.data) || { lv: 1 };
    const W = 1420;
    const H = 760;

    const dirtBlobs = [
      { cx: 130, cy: 380, rx: 95, ry: 75, isAtoll: true },
      { cx: 520, cy: 175, rx: 90, ry: 62, isAtoll: true },
      { cx: 920, cy: 185, rx: 95, ry: 65, isAtoll: true },
      { cx: 680, cy: 575, rx: 90, ry: 62, isAtoll: true },
      { cx: 1220, cy: 420, rx: 105, ry: 72, isAtoll: true }
    ];

    const trees = [
      { x: 320, y: 250 }, { x: 350, y: 490 },
      { x: 710, y: 310 }, { x: 760, y: 390 },
      { x: 1040, y: 340 }, { x: 1060, y: 520 }
    ];

    const decos = [
      { id: "sea_fish_1", x: 310, y: 370, sprite: "fishing_spot", w: 28, h: 28, isFishingSpot: true },
      { id: "sea_fish_2", x: 840, y: 440, sprite: "fishing_spot", w: 28, h: 28, isFishingSpot: true },
      { id: "sea_wreck_deco", x: 920, y: 135, sprite: "ancient_ship", w: 42, h: 38, solid: false },
      { id: "sea_coral_deco", x: 520, y: 130, sprite: "tree", w: 34, h: 36, solid: false },
      { id: "sea_volc_deco",  x: 1220, y: 368, sprite: "brazier_on", w: 32, h: 32, solid: false }
    ];

    const nodes = [];
    const barrelCoords = [
      { x: 290, y: 180 }, { x: 440, y: 380 }, { x: 640, y: 240 },
      { x: 560, y: 460 }, { x: 830, y: 290 }, { x: 1050, y: 220 },
      { x: 980, y: 560 }, { x: 1140, y: 460 }
    ];
    barrelCoords.forEach(function(pt, idx) {
      nodes.push({
        id: "sea_barrel_" + idx + "_" + Date.now(),
        x: pt.x + randInt(-25, 25),
        y: pt.y + randInt(-20, 20),
        type: "chest",
        name: "漂流補給桶",
        isSeaBarrel: true,
        reqToolLv: 0,
        opened: false
      });
    });

    const baseLv = Math.max(3, s.lv);
    const monsters = [
      { id: "sea_mon_1", name: "近海狂暴巨蟹", lv: baseLv,     x: 380, y: 290, homeX: 380, homeY: 290, type: "bamboo", isBoss: false, alive: true },
      { id: "sea_mon_2", name: "迷霧海妖歌者", lv: baseLv + 1, x: 620, y: 380, homeX: 620, homeY: 380, type: "skull",  isBoss: false, alive: true },
      { id: "sea_mon_3", name: "幽靈海盜斥候", lv: baseLv + 3, x: 880, y: 320, homeX: 880, homeY: 320, type: "skull",  isBoss: false, isShiny: true, alive: true },
      { id: "sea_mon_4", name: "深淵觸手海獸", lv: baseLv + 5, x: 1090, y: 390, homeX: 1090, homeY: 390, type: "boss", isBoss: false, alive: true }
    ];

    const portals = [
      {
        id: "p_sea_to_camp",
        name: "返回營地碼頭 ⚓",
        x: 115,
        y: 380,
        targetZone: "camp_hub",
        targetX: 435,
        targetY: 350,
        icon: "door"
      }
    ];

    VOYAGE_ISLANDS.forEach(function(isl) {
      portals.push({
        id: "p_sea_to_" + isl.id,
        name: "登陸・" + isl.shortName,
        x: isl.seaX,
        y: isl.seaY,
        targetZone: "land_" + isl.id,
        targetX: 110,
        targetY: 320,
        icon: isl.isMultiFloor ? "abyss" : "door",
        islandId: isl.id
      });
    });

    const seaMap = {
      id: "ocean_sea",
      _refreshToken: Date.now(),
      name: "無盡碧海",
      recLv: baseLv,
      bgm: "forest",
      theme: "ocean",
      rain: false,
      fog: false,
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

    activeGeneratedMaps.ocean_sea = seaMap;
    return seaMap;
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
    const vaultPt = { x: 460, y: 310 }; // 移至 x:460，與 x:740 的推石密室留出充足通道

    const keyPoints = [spawnPt, bossPt, seal1Pt, seal2Pt, firePt, vaultPt];

    const dirtBlobs = [
      { cx: 140, cy: 320, rx: 95, ry: 75 },
      { cx: 540, cy: 135, rx: 110, ry: 65 },
      { cx: 540, cy: 505, rx: 110, ry: 65 },
      { cx: 540, cy: 320, rx: 130, ry: 85 },
      { cx: 940, cy: 320, rx: 120, ry: 95 }
    ];

    const trees = [];
    for (let i = 0; i < 16; i++) {
      for (let tries = 0; tries < 15; tries++) {
        const tx = randInt(220, 840);
        const ty = randInt(70, 560);
        if (isPointClear(tx, ty, keyPoints, 82) && isPointClear(tx, ty, trees, 54)) {
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
        x: vaultPt.x - 32,
        y: vaultPt.y,
        sprite: "cracked_wall",
        w: 30,
        h: 30,
        solid: true,
        isCrackedWall: true
      },
      {
        id: "obs_boulder_" + randInt(1, 999),
        x: 340,
        y: 190,
        sprite: "boulder_block",
        w: 28,
        h: 28,
        obstacleType: "boulder"
      },
      {
        id: "obs_tree_" + randInt(1, 999),
        x: 340,
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
        y: 435,
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

    // ★ Cross-Check 修正：為裂縫寶箱綁定 reqCrackedWallId，必須先用炸彈炸開裂縫岩壁才可領取！
    nodes.push({
      id: "voy_chest_vault_" + Date.now(),
      x: vaultPt.x + 6,
      y: vaultPt.y,
      type: "chest",
      name: "秘境寶箱",
      opened: false,
      isVoyageChest: true,
      reqCrackedWallId: wallId,
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
      let oy = randInt(80, 520);
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
      let hy = randInt(85, 520);
      if (!isPointClear(hx, hy, keyPoints, 55)) { hx = 300 + h * 85; hy = 460; }

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
      const my = (k % 2 === 0) ? randInt(120, 250) : randInt(360, 480);
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
        id: "p_voyage_back_to_sea",
        name: "登船出海 ⛵",
        x: 56,
        y: 320,
        targetZone: "ocean_sea",
        targetX: Math.max(120, islandDef.seaX - 55),
        targetY: islandDef.seaY,
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

  function injectVoyageDocksIntoWorld(mapObj) {
    if (!mapObj) return mapObj;
    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
    const boatTier = getPlayerBoatTier(s);

    if (mapObj.id === "camp_hub") {
      mapObj.decos = mapObj.decos || [];

      const fishSpot = mapObj.decos.find(function(d) { return d.isFishingSpot; });
      if (fishSpot) {
        fishSpot.x = 205;
        fishSpot.y = 402;
      }

      let dock = mapObj.decos.find(function(d) { return d.id === "deco_camp_voyage_dock"; });
      if (!dock) {
        dock = {
          id: "deco_camp_voyage_dock",
          x: 432,
          y: 378,
          sprite: "voyage_dock",
          w: 28,
          h: 28,
          solid: true,
          isVoyageDock: true,
          name: "造船碼頭"
        };
        mapObj.decos.push(dock);
      } else {
        dock.x = 432;
        dock.y = 378;
      }

      let mooredBoat = mapObj.decos.find(function(d) { return d.id === "deco_camp_moored_boat"; });
      if (boatTier >= 1) {
        const boatSprite = (boatTier >= 2) ? "ship_galleon" : "ship_sloop";
        if (!mooredBoat) {
          mapObj.decos.push({
            id: "deco_camp_moored_boat",
            x: 427,
            y: 408,
            sprite: boatSprite,
            w: 38,
            h: 38,
            solid: false,
            isVoyageDock: true,
            isMooredBoat: true
          });
        } else {
          mooredBoat.sprite = boatSprite;
          mooredBoat.cleared = false;
        }
      } else if (mooredBoat) {
        mooredBoat.cleared = true;
      }
    } else if (mapObj.id === "zone3_coast") {
      mapObj.decos = mapObj.decos || [];
      let existingCoast = mapObj.decos.find(function(d) { return d.id === "deco_coast_voyage_dock"; });
      if (!existingCoast) {
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
      if (zoneId === "ocean_sea") {
        return activeGeneratedMaps.ocean_sea || generateOceanSeaMap();
      }
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

  const VoyageSystem = {
    openVoyageModal: function(activeTab) {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const boatTier = getPlayerBoatTier(s);

      const mq = window.Aetheria.Data.getCurrentMainQuest ? window.Aetheria.Data.getCurrentMainQuest(s) : null;
      if (mq && (mq.id === "mq_06_ship" || mq.id === "mq_12_voyage")) {
        s.questProgress["acc_" + mq.id] = true;
      }

      if (!activeTab) {
        activeTab = (boatTier === 0) ? "shipyard" : "sail";
      }

      const curHunger = (s.hunger !== undefined) ? s.hunger : 100;
      const chartCount = (s.inventory && s.inventory.seaChart) || 0;
      const self = this;

      window.Aetheria.UI.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML =
        S.iconHtml(boatTier >= 2 ? "ship_galleon" : (boatTier === 1 ? "ship_sloop" : "voyage_dock")) +
        "海濱造船廠與航海碼頭 (飽食 " + curHunger + "%)";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const tabBar = document.createElement("div");
      tabBar.style.cssText = "display:grid; grid-template-columns:repeat(3, 1fr); gap:5px; margin-bottom:8px;";
      [
        { id: "shipyard", label: "🔨 造船廠(" + (boatTier === 0 ? "未造" : "T" + boatTier) + ")" },
        { id: "sail",     label: "⛵ 登船出海" },
        { id: "exchange", label: "🗺️ 航海圖(" + chartCount + ")" }
      ].forEach(function(t) {
        const b = document.createElement("button");
        b.className = "na-btn" + (activeTab === t.id ? " highlight" : "");
        b.style.fontSize = "12px";
        b.innerText = t.label;
        b.onclick = function() { self.openVoyageModal(t.id); };
        tabBar.appendChild(b);
      });
      body.appendChild(tabBar);

      if (activeTab === "shipyard") {
        const nextTier = boatTier + 1;
        const bp = SHIP_BLUEPRINTS[nextTier];

        const statusCard = document.createElement("div");
        statusCard.className = "sys-card-scroll";
        if (boatTier === 0) {
          statusCard.innerHTML =
            '<b>⚓ 船塢狀態：尚未建造船隻（主線：建造近海探索木帆船）</b>' +
            '<div style="font-size:12px; color:#7f2b1d; margin-top:3px;">' +
              '沒有船隻無法出海！請先在森林採集<b>翠風原木 x3、堅韌藤蔓 x2、琥珀松脂 x2</b>，於下方投入建材打造你的第一艘【近海探索木帆船】！' +
            '</div>';
        } else {
          const curBp = SHIP_BLUEPRINTS[boatTier];
          statusCard.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<div>' +
                '<b style="color:#1d5eb8;">⛵ 當前停泊：【' + curBp.name + '】</b>' +
                '<div style="font-size:12px; color:#5c3824; margin-top:2px;">船隻已停泊於營地南側木棧橋海面，隨時可登船駛入無盡碧海！</div>' +
              '</div>' +
              '<button class="na-btn highlight" style="padding:6px 12px;" onclick="Aetheria.Voyage.embarkOcean()">⛵ 立即登船</button>' +
            '</div>';
        }
        body.appendChild(statusCard);

        if (bp) {
          if (!s.shipContributions) s.shipContributions = {};
          if (!s.shipContributions[nextTier]) s.shipContributions[nextTier] = {};
          if (nextTier === 2 && s.projectContributions && s.projectContributions.proj_z3_raft) {
            Object.assign(s.shipContributions[2], s.projectContributions.proj_z3_raft);
          }
          const contrib = s.shipContributions[nextTier];
          const mats = window.Aetheria.Data.MATERIALS;

          const buildHeader = document.createElement("div");
          buildHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:8px 0 4px; font-size:13px;";
          buildHeader.innerHTML = S.iconHtml(bp.sprite, true) + "【建造目標：" + bp.name + "】";
          body.appendChild(buildHeader);

          const descBox = document.createElement("div");
          descBox.className = "sys-card";
          descBox.innerHTML = '<div style="font-size:12px; color:#cbd5e1;">' + bp.desc + '</div>';
          body.appendChild(descBox);

          Object.entries(bp.cost).forEach(function(entry) {
            const matKey = entry[0];
            const reqTotal = entry[1];
            const putCount = contrib[matKey] || 0;
            const rem = Math.max(0, reqTotal - putCount);
            const inBag = s.inventory[matKey] || 0;
            const mObj = mats[matKey] || { name: matKey };

            const row = document.createElement("div");
            row.className = "sys-card";
            row.style.display = "flex";
            row.style.justifyContent = "space-between";
            row.style.alignItems = "center";
            row.innerHTML =
              '<div>' +
                '<b>' + S.iconHtml("mat_" + matKey, true) + mObj.name + '</b> ' +
                '<span class="stat-pill" style="color:' + (rem === 0 ? '#5ac54f' : '#ffd166') + ';">已投入 ' + putCount + '/' + reqTotal + '</span>' +
                '<div style="font-size:11px; color:#cbd5e1;">背包持有：' + inBag + ' 個</div>' +
              '</div>' +
              (rem === 0
                ? '<span style="color:#5ac54f; font-weight:900;">✓ 已備齊</span>'
                : '<button class="na-btn ' + (inBag > 0 ? 'highlight' : '') + '" style="padding:5px 10px;" onclick="Aetheria.Voyage.contributeShipMat(' + nextTier + ', \'' + matKey + '\')">投入造船</button>');
            body.appendChild(row);
          });
        } else {
          const maxBox = document.createElement("div");
          maxBox.className = "sys-card";
          maxBox.style.borderColor = "#5ac54f";
          maxBox.innerHTML = '<b style="color:#5ac54f;">★ 你的【破浪遠洋大帆船】已達最高階！可自由航行全海域！</b>';
          body.appendChild(maxBox);
        }
      }

      else if (activeTab === "sail") {
        if (boatTier === 0) {
          const warnBox = document.createElement("div");
          warnBox.className = "sys-card";
          warnBox.style.borderColor = "#ff595e";
          warnBox.innerHTML =
            '<b style="color:#ff758f;">⚠️ 尚未擁有船隻，無法出海！</b>' +
            '<div style="font-size:12px; color:#cbd5e1; margin:4px 0;">請先切換至左方【🔨 造船廠】收集原木、藤蔓與松脂建造你的第一艘木帆船！</div>' +
            '<button class="na-btn highlight" style="width:100%; padding:8px; margin-top:4px;" onclick="Aetheria.Voyage.openVoyageModal(\'shipyard\')">前往造船廠投入素材 ▸</button>';
          body.appendChild(warnBox);
          return;
        }

        const seaBox = document.createElement("div");
        seaBox.className = "sys-card-scroll";
        seaBox.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">' +
            '<div>' +
              '<b style="font-size:14px; color:#1d3557;">⛵ 登船駛入【無盡碧海航行圖】</b>' +
              '<div style="font-size:12px; color:#5c3824; margin-top:2px;">' +
                '親自用十字鍵掌舵開船！在海面上打撈<b>漂流補給桶</b>、迎戰海怪，並自由駛向四座未知荒島與深淵地牢！(出航耗飽食 ' + (boatTier >= 2 ? 5 : 10) + '%)' +
              '</div>' +
            '</div>' +
            '<button class="na-btn highlight" style="padding:10px 14px; font-size:14px; white-space:nowrap;" onclick="Aetheria.Voyage.embarkOcean()">立即登船 ▸</button>' +
          '</div>';
        body.appendChild(seaBox);

        const chartHeader = document.createElement("div");
        chartHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:8px 0 4px; font-size:13px;";
        chartHeader.innerText = "【海域島嶼方位指南（登船後可開船前往）】";
        body.appendChild(chartHeader);

        VOYAGE_ISLANDS.forEach(function(isl) {
          const tierOk = boatTier >= (isl.reqBoatTier || 1);
          const dirTxt = (isl.id === "island_coral") ? "↖ 西北近海" :
                         (isl.id === "island_wreck") ? "↗ 東北暗礁" :
                         (isl.id === "dungeon_abyss") ? "↓ 南方海蝕洞" : "➡ 極東狂風海域";
          const card = document.createElement("div");
          card.className = "voyage-card" + (tierOk ? "" : " locked");
          card.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b style="color:var(--na-gold); font-size:13px;">' + isl.name + '</b>' +
              '<div>' +
                '<span class="voyage-tag">' + dirTxt + '</span>' +
                '<span class="voyage-tag">Lv.' + isl.recLv + '+</span>' +
              '</div>' +
            '</div>' +
            '<div style="font-size:11.5px; color:#cbd5e1; margin-top:3px;">' + isl.desc + '</div>' +
            (!tierOk ? '<div style="font-size:11px; color:#ff758f; margin-top:2px;">🔒 需先升級【二階：破浪遠洋大帆船】才可抗風浪登陸</div>' : '');
          body.appendChild(card);
        });
      }

      else {
        const exIntro = document.createElement("div");
        exIntro.className = "sys-card-scroll";
        exIntro.innerHTML =
          '<b>🗺️ 遠古航海圖殘卷寶庫（持有：' + chartCount + ' 卷）</b>' +
          '<div style="font-size:12px; color:#5c3824; margin-top:2px;">' +
            '擊敗荒島與秘境地牢首領、或打撈海上漂流桶，均可獲得【古航海圖殘卷】！' +
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

    contributeShipMat: function(targetTier, matKey) {
      const s = window.Aetheria.State.data;
      const bp = SHIP_BLUEPRINTS[targetTier];
      if (!bp) return;

      if (!s.shipContributions) s.shipContributions = {};
      if (!s.shipContributions[targetTier]) s.shipContributions[targetTier] = {};
      const contrib = s.shipContributions[targetTier];

      const reqTotal = bp.cost[matKey] || 0;
      const putCount = contrib[matKey] || 0;
      const rem = reqTotal - putCount;
      const inBag = s.inventory[matKey] || 0;

      if (rem <= 0 || inBag <= 0) {
        window.Aetheria.UI.showToast("背包中沒有此造船材料！");
        return;
      }

      const giveAmt = Math.min(rem, inBag);
      s.inventory[matKey] -= giveAmt;
      contrib[matKey] = putCount + giveAmt;

      if (targetTier === 2) {
        if (!s.projectContributions) s.projectContributions = {};
        if (!s.projectContributions.proj_z3_raft) s.projectContributions.proj_z3_raft = {};
        s.projectContributions.proj_z3_raft[matKey] = contrib[matKey];
      }

      window.Aetheria.Audio.sfxGather();

      const allDone = Object.entries(bp.cost).every(function(entry) {
        return (contrib[entry[0]] || 0) >= entry[1];
      });

      if (allDone) {
        s.boatTier = targetTier;
        if (targetTier === 2) {
          if (!s.projectsBuilt) s.projectsBuilt = {};
          s.projectsBuilt.proj_z3_raft = true;
        }
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.State.save();

        const campMap = window.Aetheria.Data.Maps.getMap("camp_hub");
        if (campMap) injectVoyageDocksIntoWorld(campMap);
        if (window.Aetheria.Renderer) window.Aetheria.Renderer.builtZoneKey = null;

        this.openVoyageModal("sail");
        window.Aetheria.UI.updateAllHud();
        window.Aetheria.UI.showToast("⛵ 造船落成！【" + bp.name + "】已停泊在棧橋海面，請點擊「立即登船」駛入無盡碧海！");
      } else {
        window.Aetheria.State.save();
        this.openVoyageModal("shipyard");
        window.Aetheria.UI.updateAllHud();
        window.Aetheria.UI.showToast("已投入造船材料 x" + giveAmt + "！");
      }
    },

    embarkOcean: function() {
      const s = window.Aetheria.State.data;
      const boatTier = getPlayerBoatTier(s);

      if (boatTier < 1) {
        window.Aetheria.Audio.sfxWrong();
        this.openVoyageModal("shipyard");
        window.Aetheria.UI.showToast("請先在造船廠收集原木、藤蔓與松脂建造【近海探索木帆船】！");
        return;
      }

      if (!window.Aetheria.State.hasWeaponEquipped()) {
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.showToast("赤手空拳出海太危險了！請先修復巴爾的熔爐領取新手忍刀！");
        return;
      }

      const hungerCost = (boatTier >= 2) ? 5 : 10;
      const curHunger = (s.hunger !== undefined) ? s.hunger : 100;
      if (curHunger < hungerCost) {
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.showToast("⚠️ 飽食度不足 " + hungerCost + "% 無法開船！請先按右下角【口糧】進食補充！");
        return;
      }

      s.hunger = Math.max(0, curHunger - hungerCost);
      s.questProgress.sailedOnce = true;
      window.Aetheria.State.advanceTime(8);

      generateOceanSeaMap();
      s.currentZone = "ocean_sea";
      s.heroX = 165;
      s.heroY = 380;
      s.petX = 165;
      s.petY = 380;
      s.facing = "right";

      if (window.Aetheria.Renderer) {
        window.Aetheria.Renderer.builtZoneKey = null;
      }

      window.Aetheria.Audio.playBgm("forest");
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      window.Aetheria.UI.closePanelToExplore();
      window.Aetheria.UI.showToast("⛵ 已登船駛入【無盡碧海】！請用十字方向鍵開船打撈漂流桶或駛向荒島港口！");
    },

    landOnIsland: function(islandId, floorNum) {
      floorNum = floorNum || 1;
      const s = window.Aetheria.State.data;
      const isl = VOYAGE_ISLANDS.find(function(v) { return v.id === islandId; });
      if (!isl) return;

      const boatTier = getPlayerBoatTier(s);
      if (boatTier < (isl.reqBoatTier || 1)) {
        s.heroX -= 32;
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.showToast("🌊 外海狂風巨浪！必須先升級【二階：破浪遠洋大帆船】才可登陸【" + isl.name + "】！");
        return;
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
      window.Aetheria.UI.updateAllHud();
      window.Aetheria.UI.showToast("⚓ 船隻靠岸！已登陸【" + newMap.name + "】！");
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

  function hookSystemsForVoyage() {
    const Exp = window.Aetheria.Explore;
    const Ren = window.Aetheria.Renderer;
    const Bat = window.Aetheria.Battle;

    if (Exp) {
      // ★ Cross-Check 修正：移除陸地減速，並串接【鍍金順風船帆 (sailLv)】Lv.1(+12%) / Lv.2(+20%) / Lv.3(+28%) 海上加速！
      let lastStepTime = 0;
      const origUpdateStep = Exp.updateStep.bind(Exp);
      Exp.updateStep = function() {
        const now = performance.now();
        if (now - lastStepTime < 15.5) {
          return;
        }
        lastStepTime = now;

        const s = window.Aetheria.State.data;
        const inOcean = (s.currentZone === "ocean_sea");
        const sailLv = (s.campUpgrades && s.campUpgrades.sailLv) || 0;
        const sailMult = (sailLv >= 3) ? 1.28 : (sailLv === 2) ? 1.20 : (sailLv === 1) ? 1.12 : 1.0;
        const speedFactor = inOcean ? sailMult : 1.0;

        const savedDX = this.moveDX;
        const savedDY = this.moveDY;
        if (this.isMoving) {
          this.moveDX = savedDX * speedFactor;
          this.moveDY = savedDY * speedFactor;
        }
        origUpdateStep();
        this.moveDX = savedDX;
        this.moveDY = savedDY;

        if (s.currentZone === "camp_hub") {
          const onPier = (s.heroX >= 416 && s.heroX <= 468);
          const maxCampY = onPier ? 408 : 388;
          if (s.heroY > maxCampY) {
            s.heroY = maxCampY;
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
            if (!d.cleared && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 42) {
              if (d.isVoyageDock) {
                window.Aetheria.Audio.sfxTalkBlip();
                VoyageSystem.openVoyageModal();
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
            if (!d.cleared && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 42) {
              if (d.isVoyageDock) {
                const bt = getPlayerBoatTier(s);
                hintEl.innerText = (bt >= 1) ? "登船出海" : "造船廠";
                return;
              }
              if (d.isIslandFire) {
                hintEl.innerText = "荒島營火";
                return;
              }
            }
          }
        }
        origHint(mapObj, s);
      };

      const origPortal = Exp.triggerPortal.bind(Exp);
      Exp.triggerPortal = function(portal) {
        const s = window.Aetheria.State.data;
        if (portal && portal.targetZone && portal.targetZone.indexOf("land_") === 0) {
          const islId = portal.islandId || portal.targetZone.replace("land_", "");
          VoyageSystem.landOnIsland(islId, 1);
          return;
        }
        if (portal && portal.targetZone === "dungeon_abyss_next") {
          if (portal.reqBoss && !(s.clearedBosses && s.clearedBosses[portal.reqBoss])) {
            s.heroX -= 28;
            window.Aetheria.Audio.sfxWrong();
            window.Aetheria.UI.showToast("深淵結界封鎖中！必須先解開南北雙海神柱並擊敗本層首領才可深入下一層！");
            return;
          }
          const nextF = (s.voyageFloor || 1) + 1;
          VoyageSystem.landOnIsland("dungeon_abyss", nextF);
          return;
        }
        origPortal(portal);
      };

      const origHarvest = Exp.harvestNode.bind(Exp);
      Exp.harvestNode = function(node) {
        const s = window.Aetheria.State.data;

        // ★ Cross-Check 修正：打撈海上漂流桶正式計入【鍍金順風船帆 (sailLv)】加成！
        if (node && node.isSeaBarrel) {
          node.opened = true;
          window.Aetheria.Audio.sfxGather();
          const sailLv = (s.campUpgrades && s.campUpgrades.sailLv) || 0;
          const extraGold = (sailLv >= 1) ? 25 : 0;
          const roll = Math.random();

          if (roll < 0.30) {
            s.inventory.rationFish = (s.inventory.rationFish || 0) + 1;
            s.gold += (35 + extraGold);
            window.Aetheria.UI.showToast("⛵ 打撈海上漂流桶：獲得【炭烤鮮魚乾 +1】與 " + (35 + extraGold) + " G！");
          } else if (roll < 0.62) {
            s.inventory.plank = (s.inventory.plank || 0) + 1;
            s.inventory.rope = (s.inventory.rope || 0) + 1;
            if (sailLv >= 2) s.inventory.mithril = (s.inventory.mithril || 0) + 1;
            if (extraGold > 0) s.gold += extraGold;
            window.Aetheria.UI.showToast("⛵ 打撈漂流桶：獲【厚木板+1、麻繩+1" + (sailLv >= 2 ? "、秘銀礦+1" : "") + "】！");
          } else {
            const chartAmt = (sailLv >= 3) ? 2 : 1;
            s.inventory.mithril = (s.inventory.mithril || 0) + (sailLv >= 2 ? 2 : 1);
            s.inventory.seaChart = (s.inventory.seaChart || 0) + chartAmt;
            s.questProgress.gotSeaChartOnce = true;
            if (extraGold > 0) s.gold += extraGold;
            window.Aetheria.UI.showToast("⛵ 打撈古老漂流瓶：驚喜獲得【古航海圖殘卷 +" + chartAmt + "、流沙秘銀礦】！");
          }
          window.Aetheria.State.save();
          window.Aetheria.UI.updateAllHud();
          return;
        }

        if (node && node.type === "chest" && node.isVoyageChest) {
          // 檢查是否有未炸開的裂縫岩壁保護此寶箱
          if (node.reqCrackedWallId) {
            const curMap = window.Aetheria.Data.Maps.getMap(s.currentZone);
            const wall = curMap && curMap.decos && curMap.decos.find(function(d) { return d.id === node.reqCrackedWallId; });
            if (wall && !wall.cleared) {
              window.Aetheria.Audio.sfxWrong();
              window.Aetheria.UI.showToast("💣 此秘境寶箱被裂縫岩壁封鎖！請先靠近岩壁按右下角【炸彈】炸開通道！");
              return;
            }
          }

          node.opened = true;
          window.Aetheria.Audio.sfxLevelUp();

          s.inventory.seaChart = (s.inventory.seaChart || 0) + 1;
          s.questProgress.gotSeaChartOnce = true;
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
          s.questProgress.gotSeaChartOnce = true;
          window.Aetheria.State.save();
          setTimeout(function() {
            window.Aetheria.UI.showToast("🗺️ 討伐海域首領成功！額外獲得【古航海圖殘卷 +1】！");
          }, 500);
        }
      };
    }

    if (Ren) {
      const origBuild = Ren.buildSceneDOM.bind(Ren);
      Ren.buildSceneDOM = function(mapObj) {
        if (mapObj && (mapObj.id === "camp_hub" || mapObj.id === "zone3_coast")) {
          injectVoyageDocksIntoWorld(mapObj);
        }
        origBuild(mapObj);

        const terrainLayer = document.getElementById("world-terrain-layer");
        const S = window.Aetheria.Data.Sprites;
        if (!terrainLayer || !mapObj) return;

        if (mapObj.id === "camp_hub") {
          const beach = document.createElement("div");
          beach.className = "dom-coast-beach";
          terrainLayer.appendChild(beach);

          const sea = document.createElement("div");
          sea.className = "dom-coast-sea";
          terrainLayer.appendChild(sea);

          const pier = document.createElement("div");
          pier.className = "dom-wooden-pier";
          terrainLayer.appendChild(pier);
        }

        if (mapObj.id === "ocean_sea") {
          const blobs = terrainLayer.querySelectorAll(".dom-dirt-blob");
          blobs.forEach(function(b) { b.classList.add("ocean-atoll"); });

          Object.keys(Ren.domPool.nodes || {}).forEach(function(nId) {
            const item = Ren.domPool.nodes[nId];
            if (item && item.data && item.data.isSeaBarrel && S) {
              item.el.innerHTML = '<img src="' + S.getDataURL("sea_barrel") + '" alt="">';
            }
          });
        }
      };

      const origRender = Ren.renderWorld.bind(Ren);
      Ren.renderWorld = function() {
        origRender();
        try {
          const s = window.Aetheria.State.data;
          const S = window.Aetheria.Data.Sprites;
          const boatTier = getPlayerBoatTier(s);

          if (s.currentZone === "ocean_sea" && this.domPool.hero && S) {
            const shipKey = (boatTier >= 2) ? "ship_galleon" : "ship_sloop";
            this.domPool.hero.el.style.width = "38px";
            this.domPool.hero.el.style.height = "38px";
            this.domPool.hero.img.src = S.getDataURL(shipKey);
            if (this.domPool.pet) this.domPool.pet.el.style.display = "none";
            if (this.domPool.subPet) this.domPool.subPet.el.style.display = "none";
          } else if (this.domPool.hero) {
            this.domPool.hero.el.style.width = "28px";
            this.domPool.hero.el.style.height = "28px";
            if (this.domPool.pet) this.domPool.pet.el.style.display = "block";
          }

          Object.keys(this.domPool.decos || {}).forEach(function(k) {
            const item = Ren.domPool.decos[k];
            if (!item || !item.lbl || !item.data) return;
            const d = item.data;
            if (d.isMooredBoat) {
              item.lbl.style.display = "block";
              item.lbl.className = "dom-label portal-lbl";
              item.lbl.innerText = (boatTier >= 2) ? "⛵遠洋帆船" : "⛵木帆船";
            } else if (d.isVoyageDock) {
              item.lbl.style.display = "block";
              item.lbl.className = "dom-label voyage-lbl";
              item.lbl.innerText = (boatTier >= 1) ? "⚓登船碼頭" : "🔨造船廠";
            } else if (d.isIslandFire) {
              item.lbl.style.display = "block";
              item.lbl.className = "dom-label campfire-lbl";
              item.lbl.innerText = "🔥荒島營火";
            }
          });
        } catch (e) {}
      };
    }

    const mapsList = window.Aetheria.Data && window.Aetheria.Data.Maps && window.Aetheria.Data.Maps.ORDERED_WORLD_ZONES;
    if (mapsList && !mapsList.some(function(z) { return z.id === "ocean_sea"; })) {
      mapsList.push({
        id: "ocean_sea",
        name: "⛵ 無盡碧海航道",
        x: 165,
        y: 380,
        desc: "駕駛親手建造的帆船，自由探索珊瑚荒島、沉船墓地、深淵地牢與星隕孤島。"
      });
    }
  }

  function initOceanVoyageModule() {
    try {
      injectVoyageStyles();
      registerVoyageSprites();
      initVoyageMaterials();
      injectShipbuildingMainQuests();
      hookMapsForVoyage();
      hookSystemsForVoyage();

      if (window.Aetheria.UI && window.Aetheria.UI.updateAllHud) {
        window.Aetheria.UI.updateAllHud();
      }
      if (window.Aetheria.Renderer) {
        window.Aetheria.Renderer.builtZoneKey = null;
        window.Aetheria.Renderer.renderWorld();
      }
    } catch (err) {
      console.error("Ocean Voyage v8.8 module init error:", err);
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(initOceanVoyageModule, 60);
  } else {
    window.addEventListener("load", function() {
      setTimeout(initOceanVoyageModule, 60);
    });
  }
})();
