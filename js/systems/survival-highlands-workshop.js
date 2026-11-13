/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 擴大地圖、高低差懸崖山洞與格仔分類工坊模組 (survival-highlands-workshop.js - v9.4)
 * Cross-Check 重大修正：
 *   1. 【真正擴大版圖並拆走舊邊界樹牆】：1~6區與洞窟全面擴大至 1560x1020，自動拆除舊底邊(y=636)與舊右邊(x=1150)的封路樹牆，鋪設泥土道路通往新區域！
 *   2. 【修復高低差懸崖動線】：於南側新領土建立 L 型黃土高台、深啡色懸崖壁、黑色山洞拱門與南北雙向繩梯口，從主幹道往下走即可直接抵達！
 *   3. 【100% 顯示新增配方與新武防】：修正 Data.WORKSHOP_RECIPES 讀寫格式，內建 8 項加工配方 + 3 把新武器 + 3 件新防具，並修復格仔工坊「立即裝備」功能！
 *   4. 【視覺去標籤化】：平時隱藏普通礦石與草木的頭頂文字牌，走近 (<62px) 才浮現，畫面乾淨清爽！
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  // ================= 1. 注入高低差懸崖地形與全新格仔工坊 CSS =================
  function injectHighlandsAndWorkshopStyles() {
    if (document.getElementById("highlands-wk-v94-styles")) return;
    const style = document.createElement("style");
    style.id = "highlands-wk-v94-styles";
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
        border-top: 5px solid #6e3b1e;
        border-left: 5px solid #6e3b1e;
        border-right: 5px solid #6e3b1e;
        border-radius: 10px 10px 0 0;
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

      /* ================= B. 全新格仔分類工坊 UI ================= */
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
        max-height: 220px;
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

  // ================= 2. 註冊《Survival RPG》像素圖示 =================
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

  // ================= 3. 完整定義《Survival RPG》新素材、加工配方與新武防 =================
  const NEW_SRPG_MATERIALS = {
    coal:         { id: "coal",         name: "黑曜木炭",   tier: 1, desc: "【冶煉燃料】由枯枝窯燒或於高台山洞開採，是冶煉百煉精鋼錠與炸藥的核心燃料。" },
    rockSalt:     { id: "rockSalt",     name: "結晶岩鹽",   tier: 1, desc: "【高台礦產】採集自懸崖高台或岩壁礦洞，可醃製長效保存的岩鹽風乾肉脯。" },
    quartz:       { id: "quartz",       name: "透明石英砂", tier: 2, desc: "【高台晶礦】採集自懸崖高台，可用於燒製鍊金藥瓶、探礦提燈與共鳴戰刃。" },
    rawHide:      { id: "rawHide",      name: "荒野獸皮",   tier: 1, desc: "【狩獵戰利品】討伐野外魔物掉落，可加工為堅韌的鞣製硬皮革。" },
    curedLeather: { id: "curedLeather", name: "鞣製硬皮革", tier: 2, desc: "【進階加工材】以獸皮與松脂鞣製而成，用於鍛造高級皮甲與獵刀握柄。" },
    steelIngot:   { id: "steelIngot",   name: "百煉精鋼錠", tier: 2, desc: "【高階冶煉材】以藍晶鐵礦與黑曜木炭高溫鍛打而成，可鍛造精鋼武器或直接打磨強化。" },
    ropeLadder:   { id: "ropeLadder",   name: "攀岩繩梯",   tier: 1, desc: "【高低差開路工具】由麻繩與原木編織而成，可架設在野外懸崖峭壁上攀爬至高台礦區！" },
    rationJerky:  { id: "rationJerky",  name: "風乾肉脯",   tier: 2, desc: "【頂級求生口糧】以岩鹽醃製鮮魚與獸肉，食用立即恢復 +80% 飽食度與 +90 HP！" }
  };

  // 內建完整工坊配方清單（兼容原版配方 + 新增 8 款 Survival RPG 配方，確保 100% 顯示！）
  const COMPLETE_WORKSHOP_RECIPES = [
    // --- 開路與探索工具 (explore) ---
    {
      id: "wk_rope_ladder",
      name: "攀岩繩梯 x1",
      category: "explore",
      toKey: "ropeLadder",
      toCount: 1,
      cost: { rope: 1, wood: 2 },
      desc: "【★高低差開路必備】架設於各區南側的深啡色懸崖壁上，即可爬上黃土高台採集稀有礦脈！"
    },
    {
      id: "wk_torch",
      name: "松脂火把 x2",
      category: "explore",
      toKey: "torchItem",
      toCount: 2,
      cost: { branch: 1, resin: 1 },
      desc: "【地牢與黑夜照明】點燃後照亮黑霧地牢，並在黑夜戰鬥直接燒毀夜魔 1 層暗夜護盾！"
    },
    {
      id: "wk_quartz_lantern",
      name: "石英探礦提燈 (火把x4)",
      category: "explore",
      toKey: "torchItem",
      toCount: 4,
      cost: { iron: 1, quartz: 1, coal: 1 },
      desc: "【★新配方・強光照明】以鐵礦、石英砂與木炭打造，一次產出相當於 4 支火把的長效照明！"
    },
    {
      id: "wk_bomb",
      name: "爆破炸彈 x2",
      category: "explore",
      toKey: "bombItem",
      toCount: 2,
      cost: { flint: 2, clay: 1, resin: 1 },
      desc: "【秘境開路】可炸開各區與荒島地牢的「裂縫岩壁」開啟隱藏秘寶箱！"
    },
    {
      id: "wk_coal_bomb",
      name: "黑火藥重型炸彈 x3",
      category: "explore",
      toKey: "bombItem",
      toCount: 3,
      cost: { coal: 2, flint: 1, clay: 1 },
      desc: "【★新配方・高效爆破】以黑曜木炭調配黑火藥，一次大量製造 3 顆爆破炸彈！"
    },

    // --- 冶煉與加工建材 (smelt) ---
    {
      id: "wk_charcoal",
      name: "窯燒黑木炭 x2",
      category: "smelt",
      toKey: "coal",
      toCount: 2,
      cost: { branch: 3 },
      desc: "【★新配方・基礎冶煉】將 3 根散落枯枝悶燒成 2 塊高熱能黑曜木炭，用於冶煉精鋼錠。"
    },
    {
      id: "wk_steel_ingot",
      name: "百煉精鋼錠 x1",
      category: "smelt",
      toKey: "steelIngot",
      toCount: 1,
      cost: { iron: 2, coal: 2 },
      desc: "【★新配方・高溫冶煉】以鐵礦 x2 與黑曜木炭 x2 鍛造成精鋼錠（可造新武器，或按「使用強化」永久 ATK+4！）。"
    },
    {
      id: "wk_cured_leather",
      name: "鞣製硬皮革 x1",
      category: "smelt",
      toKey: "curedLeather",
      toCount: 1,
      cost: { rawHide: 2, resin: 1 },
      desc: "【★新配方・皮革加工】將荒野獸皮與松脂鞣製成硬皮革（可造新皮甲，或按「使用強化」永久 DEF+3 / HP+12！）。"
    },
    {
      id: "wk_plank",
      name: "加工厚木板 x1",
      category: "smelt",
      toKey: "plank",
      toCount: 1,
      cost: { wood: 2 },
      desc: "【工程建材】將 2 塊翠風原木裁切為堅固的厚木板，用於修橋與升級大帆船。"
    },
    {
      id: "wk_rope",
      name: "強韌麻繩索 x1",
      category: "smelt",
      toKey: "rope",
      toCount: 1,
      cost: { vine: 2 },
      desc: "【工程建材】將 2 條堅韌藤蔓編織為麻繩索，是製作【攀岩繩梯】與吊橋的必備材料。"
    },
    {
      id: "wk_rope_hemp",
      name: "亞麻編織繩 x2",
      category: "smelt",
      toKey: "rope",
      toCount: 2,
      cost: { hemp: 2 },
      desc: "【高效製繩】以峽谷荒野亞麻一次編織出 2 條強韌麻繩索。"
    },
    {
      id: "wk_pitch",
      name: "防水松脂膠 x1",
      category: "smelt",
      toKey: "pitch",
      toCount: 1,
      cost: { resin: 2, clay: 1 },
      desc: "【造船建材】混合琥珀松脂與河畔黏土熬製的防水塗料。"
    },
    {
      id: "wk_nails",
      name: "鍛造鐵釘 x2",
      category: "smelt",
      toKey: "nails",
      toCount: 2,
      cost: { iron: 1 },
      desc: "【工程建材】將藍晶鐵礦鍛打為工程鐵釘。"
    },
    {
      id: "wk_steel_cable",
      name: "秘銀強化鋼索 x1",
      category: "smelt",
      toKey: "steelCable",
      toCount: 1,
      cost: { mithril: 1, rope: 1 },
      desc: "【高階建材】融合流沙秘銀與麻繩索打造的超強韌鋼索。"
    },
    {
      id: "wk_heavy_sail",
      name: "防風重帆布 x1",
      category: "smelt",
      toKey: "heavySail",
      toCount: 1,
      cost: { sailCloth: 2, rope: 1 },
      desc: "【遠航建材】縫合幽靈古帆布與麻繩，用於建造破浪遠洋大帆船。"
    },
    {
      id: "wk_warm_fur",
      name: "禦寒獸毛氈 x1",
      category: "smelt",
      toKey: "warmFur",
      toCount: 1,
      cost: { sinew: 2, hemp: 1 },
      desc: "【極地建材】搭建雪原防風避難屋與高階防寒護甲的保暖毛氈。"
    },

    // --- 口糧與鍊金靈藥 (survival) ---
    {
      id: "wk_ration_jerky",
      name: "岩鹽風乾肉脯 x2",
      category: "survival",
      toKey: "rationJerky",
      toCount: 2,
      cost: { fish: 1, rockSalt: 1 },
      desc: "【★新配方・頂級口糧】以高台結晶岩鹽醃製鮮魚，食用每份恢復 +80% 飽食度與 +90 HP！"
    },
    {
      id: "wk_ration_herb",
      name: "烘烤微光菇乾 x2",
      category: "survival",
      toKey: "rationHerb",
      toCount: 2,
      cost: { herb: 1, branch: 1 },
      desc: "【基礎口糧】食用每份可恢復 +35% 飽食度與 +25 HP。"
    },
    {
      id: "wk_ration_fish",
      name: "炭烤鮮魚乾 x2",
      category: "survival",
      toKey: "rationFish",
      toCount: 2,
      cost: { fish: 1, branch: 1 },
      desc: "【進階口糧】食用每份可恢復 +60% 飽食度與 +60 HP。"
    },
    {
      id: "wk_alchemy_heal",
      name: "精煉生命藥水 x2",
      category: "survival",
      toKey: "potionHeal",
      toCount: 2,
      cost: { herb: 2, quartz: 1 },
      desc: "【★新配方・隨身鍊金】以微光菇 x2 與高台石英砂燒製的玻璃瓶，免費提煉 2 瓶生命藥水！"
    },
    {
      id: "wk_alchemy_hint",
      name: "精煉洞察藥水 x2",
      category: "survival",
      toKey: "potionHint",
      toCount: 2,
      cost: { flower: 1, resin: 1, quartz: 1 },
      desc: "【★新配方・隨身鍊金】以太陽花、松脂與高台石英砂提煉 2 瓶洞察藥水！"
    }
  ];

  // 新增 3 把《Survival RPG》合成武器與 3 件合成防具
  const NEW_SRPG_WEAPONS = {
    w_srpg_machete: {
      id: "w_srpg_machete",
      name: "荒野開山獵刀",
      tier: 2,
      atk: 34,
      gold: 120,
      cost: { steelIngot: 2, curedLeather: 1, wood: 2 },
      desc: "【★新配方武器】以百煉精鋼錠與鞣製硬皮革打造的求生獵刀，兼具高攻擊力與破盾手感！"
    },
    w_srpg_quartz_blade: {
      id: "w_srpg_quartz_blade",
      name: "石英共鳴戰刃",
      tier: 3,
      atk: 56,
      gold: 260,
      cost: { steelIngot: 3, quartz: 3, mithril: 2 },
      desc: "【★新配方武器】將透明石英砂熔入精鋼與秘銀鍛造的晶刃，大幅提升知識詠唱威力！"
    },
    w_srpg_highland_axe: {
      id: "w_srpg_highland_axe",
      name: "高原破岩巨斧",
      tier: 4,
      atk: 82,
      gold: 450,
      cost: { steelIngot: 4, obsidian: 2, curedLeather: 2 },
      desc: "【★新配方武器】結合精鋼錠與熔岩黑曜石的重型戰斧，擁有摧枯拉朽的破壞力！"
    }
  };

  const NEW_SRPG_ARMORS = {
    a_srpg_leather: {
      id: "a_srpg_leather",
      name: "荒野硬化皮甲",
      tier: 2,
      def: 18,
      hp: 50,
      gold: 110,
      cost: { curedLeather: 2, rope: 1 },
      desc: "【★新配方防具】以鞣製硬皮革縫製的輕便獵裝，大幅提升野外生存力（DEF+18 / HP+50）。"
    },
    a_srpg_steel_mail: {
      id: "a_srpg_steel_mail",
      name: "百煉精鋼鎖甲",
      tier: 3,
      def: 34,
      hp: 95,
      gold: 250,
      cost: { steelIngot: 3, curedLeather: 2 },
      desc: "【★新配方防具】精鋼環扣內襯硬皮革的中階重甲，堅不可摧（DEF+34 / HP+95）。"
    },
    a_srpg_highland_plate: {
      id: "a_srpg_highland_plate",
      name: "高原守護重鎧",
      tier: 4,
      def: 52,
      hp: 150,
      gold: 420,
      cost: { steelIngot: 4, quartz: 3, obsidian: 2 },
      desc: "【★新配方防具】鑲嵌高台石英與黑曜石的精鋼全套重鎧（DEF+52 / HP+150）！"
    }
  };

  function registerSrpgDataIntoGame() {
    const Data = window.Aetheria.Data;
    if (!Data) return;

    if (Data.MATERIALS) {
      Object.keys(NEW_SRPG_MATERIALS).forEach(function(k) {
        Data.MATERIALS[k] = NEW_SRPG_MATERIALS[k];
      });
    }

    if (Data.WEAPONS) {
      Object.keys(NEW_SRPG_WEAPONS).forEach(function(wk) {
        Data.WEAPONS[wk] = NEW_SRPG_WEAPONS[wk];
      });
    }

    if (Data.ARMORS) {
      Object.keys(NEW_SRPG_ARMORS).forEach(function(ak) {
        Data.ARMORS[ak] = NEW_SRPG_ARMORS[ak];
      });
    }

    // 同時兼容 Data.WORKSHOP_RECIPES 為 Array 或 Object 字典
    if (Array.isArray(Data.WORKSHOP_RECIPES)) {
      COMPLETE_WORKSHOP_RECIPES.forEach(function(rec) {
        if (!Data.WORKSHOP_RECIPES.some(function(r) { return r.id === rec.id; })) {
          Data.WORKSHOP_RECIPES.push(rec);
        }
      });
    } else if (Data.WORKSHOP_RECIPES && typeof Data.WORKSHOP_RECIPES === "object") {
      COMPLETE_WORKSHOP_RECIPES.forEach(function(rec) {
        if (!Data.WORKSHOP_RECIPES[rec.id]) {
          Data.WORKSHOP_RECIPES[rec.id] = rec;
        }
      });
    } else {
      Data.WORKSHOP_RECIPES = COMPLETE_WORKSHOP_RECIPES.slice();
    }
  }

  // ================= 4. 擴大地圖尺寸、拆除舊邊界封路樹牆、建立高低差懸崖與山洞 =================
  const HIGHLAND_ZONES = {
    zone1_forest:   { targetW: 1560, targetH: 1020, ores: ["iron", "rockSalt", "quartz", "coal"],        grottoOres: ["coal", "iron", "rockSalt", "quartz"] },
    cave1_mushroom: { targetW: 1480, targetH: 980,  ores: ["coal", "mithril", "quartz", "rockSalt"],     grottoOres: ["coal", "mithril", "quartz", "basalt"] },
    zone2_canyon:   { targetW: 1560, targetH: 1020, ores: ["mithril", "quartz", "rockSalt", "coal"],     grottoOres: ["coal", "mithril", "quartz", "basalt"] },
    zone3_coast:    { targetW: 1560, targetH: 1020, ores: ["coral", "rockSalt", "quartz", "coal"],       grottoOres: ["coal", "coral", "rockSalt", "mithril"] },
    zone4_snow:     { targetW: 1560, targetH: 1020, ores: ["obsidian", "rockSalt", "quartz", "mithril"], grottoOres: ["coal", "obsidian", "quartz", "mithril"] },
    zone5_volcano:  { targetW: 1560, targetH: 1020, ores: ["starIron", "obsidian", "coal", "quartz"],    grottoOres: ["coal", "starIron", "obsidian", "quartz"] },
    zone6_sky:      { targetW: 1560, targetH: 1020, ores: ["starIron", "goldLeaf", "quartz", "obsidian"],grottoOres: ["starIron", "obsidian", "quartz", "mithril"] }
  };

  const grottoMapsCache = {};

  function randBetween(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

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
        reqToolLv: 0,
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
          targetX: 495,
          targetY: 815,
          icon: "stairs"
        }
      ]
    };
  }

  // ★ 核心升級：真正擴大版圖、拆走舊邊界封路樹牆、鋪設南下泥土路與南北雙繩梯高台
  function injectHighlandCliffIntoMap(mapObj) {
    if (!mapObj || !HIGHLAND_ZONES[mapObj.id]) return mapObj;
    const token = mapObj._refreshToken || "init";
    if (mapObj._highlandInjectedToken === token) return mapObj;
    mapObj._highlandInjectedToken = token;

    const cfg = HIGHLAND_ZONES[mapObj.id];
    const matsDB = (window.Aetheria.Data && window.Aetheria.Data.MATERIALS) || {};
    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
    const rigged = Boolean(s.riggedCliffs && s.riggedCliffs[mapObj.id]);

    const oldW = mapObj._origBaseWidth || mapObj.width || 1200;
    const oldH = mapObj._origBaseHeight || mapObj.height || 680;
    mapObj._origBaseWidth = oldW;
    mapObj._origBaseHeight = oldH;

    // 1. 全面擴大地图尺寸 (1560 x 1020)
    mapObj.width = Math.max(oldW, cfg.targetW);
    mapObj.height = Math.max(oldH, cfg.targetH);

    // 2. ★ 關鍵修正：拆除原版在 y ≈ 636 的舊底邊封路樹牆，以及 x ≈ 1156 的舊右邊封路樹牆！
    if (mapObj.trees) {
      mapObj.trees = mapObj.trees.filter(function(t) {
        if (t.isExpandedPerimeterTree) return false;
        // 拆走舊底邊樹牆 (y >= oldH - 72) 與舊右邊樹牆 (x >= oldW - 68)
        if (t.y >= oldH - 72) return false;
        if (t.x >= oldW - 68) return false;
        // 清空南側高台與綠草谷地區域
        if (t.x >= 180 && t.x <= 960 && t.y >= 560 && t.y <= 960) return false;
        return true;
      });

      // 在擴大後的新外圍邊界 (width: 1560, height: 1020) 重建整齊的邊界樹牆
      for (let bx = 20; bx < mapObj.width - 20; bx += 42) {
        if (mapObj.hasRiver && Math.abs(bx - (mapObj.riverX || 1030)) < 48) continue;
        mapObj.trees.push({ x: bx, y: mapObj.height - 42, isExpandedPerimeterTree: true });
        if (bx >= oldW - 40) {
          mapObj.trees.push({ x: bx, y: 18, isExpandedPerimeterTree: true });
        }
      }
      for (let by = 58; by < mapObj.height - 42; by += 42) {
        mapObj.trees.push({ x: mapObj.width - 42, y: by, isExpandedPerimeterTree: true });
        if (by >= oldH - 40) {
          mapObj.trees.push({ x: 18, y: by, isExpandedPerimeterTree: true });
        }
      }
      // 在下層綠草谷地左下角點綴兩棵樹（還原附圖左下角的樹叢）
      mapObj.trees.push(
        { x: 345, y: 890, isExpandedPerimeterTree: true },
        { x: 405, y: 905, isExpandedPerimeterTree: true }
      );
    }

    // 3. 鋪設通往南側高台谷地與東側擴建區的泥土道路 (dirtBlobs)，視覺引導清晰
    mapObj.dirtBlobs = (mapObj.dirtBlobs || []).filter(function(b) { return !b.isExpandedBlob; });
    mapObj.dirtBlobs.push(
      { cx: 280, cy: 650, rx: 95,  ry: 140, isExpandedBlob: true }, // 左側南下大道 (連接主幹道與谷地)
      { cx: 520, cy: 845, rx: 195, ry: 75,  isExpandedBlob: true }, // 懸崖前方的綠草谷地小徑
      { cx: 1320, cy: 360, rx: 145, ry: 180, isExpandedBlob: true }, // 東側擴建新領地大道
      { cx: 1280, cy: 780, rx: 155, ry: 120, isExpandedBlob: true }  // 東南側擴建秘境
    );

    mapObj.decos = (mapObj.decos || []).filter(function(d) { return !d.isHighlandElement; });
    mapObj.nodes = (mapObj.nodes || []).filter(function(n) { return !n.isHighlandOre; });
    mapObj.portals = (mapObj.portals || []).filter(function(p) { return !p.isCliffCavePortal; });

    // 4. 懸崖壁中央的【⛰️ 岩壁山洞口】傳送點 (x: 495, y: 766)
    mapObj.portals.push({
      id: "p_cliff_cave_" + mapObj.id,
      name: "山洞",
      x: 495,
      y: 766,
      targetZone: "grotto_" + mapObj.id,
      targetX: 240,
      targetY: 235,
      icon: "abyss",
      isCliffCavePortal: true
    });

    // 5. ★ 雙向攀岩繩梯錨點：
    //    - 北側繩梯口 (x: 560, y: 615)：玩家從主地圖往下走第一步就能直接架設繩梯爬上高台！
    //    - 南側繩梯口 (x: 645, y: 758)：玩家從谷地山洞旁亦可上下攀爬高台！
    mapObj.decos.push(
      {
        id: "cliff_ladder_north_" + mapObj.id,
        x: 560,
        y: 612,
        sprite: rigged ? "rope_ladder" : "boulder_block",
        w: 28,
        h: 36,
        solid: false,
        isHighlandElement: true,
        isCliffLadderSpot: true,
        ladderSide: "north",
        zoneId: mapObj.id,
        name: rigged ? "繩梯" : "高台[需繩梯]"
      },
      {
        id: "cliff_ladder_south_" + mapObj.id,
        x: 645,
        y: 758,
        sprite: rigged ? "rope_ladder" : "boulder_block",
        w: 28,
        h: 44,
        solid: false,
        isHighlandElement: true,
        isCliffLadderSpot: true,
        ladderSide: "south",
        zoneId: mapObj.id,
        name: rigged ? "繩梯" : "懸崖[需繩梯]"
      }
    );

    // 6. 在 L 型黃土高台上擺放附圖同款的【4 簇高台礦石】(含岩鹽、石英砂、黑曜木炭)
    const plateauOreCoords = [
      { x: 485, y: 660 },
      { x: 655, y: 685 },
      { x: 785, y: 755 },
      { x: 785, y: 830 }
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

    // 7. 在新擴建的東側 (x: 1180~1480) 與南側谷地 (x: 120~360, y: 660~920) 額外生成新礦產與木材
    const extraExpansionCoords = [
      { x: 210, y: 720, key: "coal",     type: "crystal" },
      { x: 260, y: 860, key: "rockSalt", type: "crystal" },
      { x: 1240, y: 240, key: "quartz",   type: "crystal" },
      { x: 1380, y: 390, key: "coal",     type: "crystal" },
      { x: 1320, y: 680, key: "rockSalt", type: "crystal" },
      { x: 1220, y: 840, key: "quartz",   type: "crystal" }
    ];
    extraExpansionCoords.forEach(function(ec, idx) {
      const mInfo = matsDB[ec.key] || { name: ec.key };
      mapObj.nodes.push({
        id: "exp_srpg_node_" + mapObj.id + "_" + idx + "_" + token,
        x: ec.x,
        y: ec.y,
        type: ec.type,
        giveKey: ec.key,
        reqTool: "pickaxe",
        reqToolLv: 0,
        perfect: false,
        isHighlandOre: true,
        isClusterBoulder: true,
        reqHighland: false,
        name: mInfo.name,
        opened: false
      });
    });

    return mapObj;
  }

  // 判斷座標 (x, y) 是否位於 L 型黃土高台內部 (elevation === 1)
  function isInsideHighlandPlateau(x, y) {
    const inTopWing   = (x >= 395 && x <= 895 && y >= 622 && y <= 735);
    const inRightWing = (x >= 715 && x <= 895 && y >= 730 && y <= 872);
    return inTopWing || inRightWing;
  }

  // 判斷平地 (elevation === 0) 座標 (x, y) 是否撞上 L 型懸崖岩壁或高台區
  // 左側 x: 60 ~ 380 為 320px 超寬南下綠草大道，完全暢通無阻！
  function isBlockedByCliffFromLowland(x, y) {
    if (x >= 385 && x <= 710 && y >= 615 && y <= 780) return true;
    if (x >= 705 && x <= 910 && y >= 615 && y <= 915) return true;
    return false;
  }

  // ================= 5. 全新格仔化分類工坊系統（內建獨立合成與一鍵換裝引擎） =================
  const WorkshopUIManager = {
    curTab: "workshop",
    curSubFilter: "all",
    selectedItemId: null,

    canAffordRecipe: function(s, costMap, goldCost) {
      if (goldCost && (s.gold || 0) < goldCost) return false;
      if (!costMap) return true;
      return Object.entries(costMap).every(function(entry) {
        return ((s.inventory && s.inventory[entry[0]]) || 0) >= entry[1];
      });
    },

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

    // ★ 獨立加工合成執行器：100% 支援所有原版與新增的《Survival RPG》配方！
    executeCraftRecipe: function(rec) {
      const s = window.Aetheria.State.data;
      if (!rec) return;

      if (!this.canAffordRecipe(s, rec.cost, rec.goldCost || 0)) {
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.showToast("⚠️ 合成材料不足！請查看上方檢視盒中標示紅色的材料。");
        return;
      }

      Object.entries(rec.cost || {}).forEach(function(entry) {
        s.inventory[entry[0]] = Math.max(0, (s.inventory[entry[0]] || 0) - entry[1]);
      });
      if (rec.goldCost) {
        s.gold = Math.max(0, (s.gold || 0) - rec.goldCost);
      }

      const outKey = rec.toKey;
      const outCnt = rec.toCount || 1;
      s.inventory[outKey] = (s.inventory[outKey] || 0) + outCnt;

      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      window.Aetheria.UI.updateAllHud();
      window.Aetheria.UI.showToast("🔨 合成成功！獲得【" + rec.name + "】！");
    },

    // ★ 獨立武器/防具/聖物/工具鍛造與換裝執行器（修正已擁有裝備無法裝備的問題）
    executePrimaryItemAction: function(selectedObj) {
      const s = window.Aetheria.State.data;
      const Data = window.Aetheria.Data;
      const UI = window.Aetheria.UI;
      if (!selectedObj) return;

      // 1. 工坊加工配方
      if (selectedObj.itemType === "recipe") {
        this.executeCraftRecipe(selectedObj.raw);
        this.renderGridWorkshopModal(this.curTab);
        return;
      }

      // 2. 採集工具升級
      if (selectedObj.itemType === "tool") {
        if (selectedObj.isMax) return;
        const tKey = selectedObj.toolKey;
        const beforeLv = (s.tools && s.tools[tKey]) || 0;
        if (UI.upgradeTool) UI.upgradeTool(tKey);
        else if (UI.craftToolUpgrade) UI.craftToolUpgrade(tKey);

        // 保底直接升級邏輯
        if (((s.tools && s.tools[tKey]) || 0) === beforeLv && selectedObj.canCraft) {
          Object.entries(selectedObj.costMap || {}).forEach(function(entry) {
            s.inventory[entry[0]] -= entry[1];
          });
          if (selectedObj.goldCost) s.gold -= selectedObj.goldCost;
          s.tools[tKey] = beforeLv + 1;
          window.Aetheria.Audio.sfxLevelUp();
          window.Aetheria.State.save();
          UI.updateAllHud();
          UI.showToast("⛏️ 工具升級成功！【" + selectedObj.shortName + "】已升至 Lv." + s.tools[tKey] + "！");
        }
        this.renderGridWorkshopModal(this.curTab);
        return;
      }

      // 3. 武器鍛造與立即裝備
      if (selectedObj.itemType === "weapon") {
        const wId = selectedObj.uid;
        if (selectedObj.unlocked) {
          s.equippedWeapon = wId;
          window.Aetheria.Audio.sfxGather();
          window.Aetheria.State.save();
          UI.updateAllHud();
          UI.showToast("⚔️ 已裝備武器：【" + selectedObj.shortName + "】！");
        } else {
          if (!selectedObj.canCraft) {
            window.Aetheria.Audio.sfxWrong();
            UI.showToast("⚠️ 鍛造此武器的材料或金幣不足！");
            return;
          }
          Object.entries(selectedObj.costMap || {}).forEach(function(entry) {
            s.inventory[entry[0]] -= entry[1];
          });
          if (selectedObj.goldCost) s.gold -= selectedObj.goldCost;
          if (!s.unlockedWeapons) s.unlockedWeapons = [];
          if (s.unlockedWeapons.indexOf(wId) === -1) s.unlockedWeapons.push(wId);
          s.equippedWeapon = wId;
          window.Aetheria.Audio.sfxLevelUp();
          window.Aetheria.State.save();
          UI.updateAllHud();
          UI.showToast("⚔️ 武器鍛造成功並已自動裝備：【" + selectedObj.shortName + "】！");
        }
        this.renderGridWorkshopModal(this.curTab);
        return;
      }

      // 4. 防具鍛造與立即穿戴
      if (selectedObj.itemType === "armor") {
        const aId = selectedObj.uid;
        if (selectedObj.unlocked) {
          s.equippedArmor = aId;
          window.Aetheria.State.recalcMaxHp();
          window.Aetheria.Audio.sfxGather();
          window.Aetheria.State.save();
          UI.updateAllHud();
          UI.showToast("🛡️ 已穿戴防具：【" + selectedObj.shortName + "】！");
        } else {
          if (!selectedObj.canCraft) {
            window.Aetheria.Audio.sfxWrong();
            UI.showToast("⚠️ 鍛造此防具的材料或金幣不足！");
            return;
          }
          Object.entries(selectedObj.costMap || {}).forEach(function(entry) {
            s.inventory[entry[0]] -= entry[1];
          });
          if (selectedObj.goldCost) s.gold -= selectedObj.goldCost;
          if (!s.unlockedArmors) s.unlockedArmors = [];
          if (s.unlockedArmors.indexOf(aId) === -1) s.unlockedArmors.push(aId);
          s.equippedArmor = aId;
          window.Aetheria.State.recalcMaxHp();
          s.hp = s.maxHp;
          window.Aetheria.Audio.sfxLevelUp();
          window.Aetheria.State.save();
          UI.updateAllHud();
          UI.showToast("🛡️ 防具鍛造成功並已穿戴：【" + selectedObj.shortName + "】！");
        }
        this.renderGridWorkshopModal(this.curTab);
        return;
      }

      // 5. 遠古聖物合成
      if (selectedObj.itemType === "relic") {
        if (selectedObj.unlocked) return;
        if (!selectedObj.canCraft) {
          window.Aetheria.Audio.sfxWrong();
          UI.showToast("⚠️ 合成此聖物的材料或金幣不足！");
          return;
        }
        Object.entries(selectedObj.costMap || {}).forEach(function(entry) {
          s.inventory[entry[0]] -= entry[1];
        });
        if (selectedObj.goldCost) s.gold -= selectedObj.goldCost;
        if (!s.unlockedRelics) s.unlockedRelics = [];
        s.unlockedRelics.push(selectedObj.uid);
        window.Aetheria.State.recalcMaxHp();
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.State.save();
        UI.updateAllHud();
        UI.showToast("💎 遠古聖物共鳴成功：【" + selectedObj.shortName + "】永久生效！");
        this.renderGridWorkshopModal(this.curTab);
      }
    },

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
      this.renderGridWorkshopModal(this.curTab);
      window.Aetheria.UI.updateAllHud();
    },

    renderGridWorkshopModal: function(activeTab) {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const Data = window.Aetheria.Data;
      const UI = window.Aetheria.UI;
      const self = this;

      // 每次打開工坊時確保新素材與新武防已註冊
      registerSrpgDataIntoGame();

      if (activeTab) this.curTab = activeTab;
      const tab = this.curTab;

      UI.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML =
        S.iconHtml("icon_forge") + "巴爾隨身工坊與鍛造台 (💰 " + (s.gold || 0) + " G)";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

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

      if (tab === "reforge" && window.Aetheria.Reforge && window.Aetheria.Reforge.renderReforgeTab) {
        window.Aetheria.Reforge.renderReforgeTab(body);
        return;
      }

      const itemsList = [];
      const matsDB = Data.MATERIALS || {};

      if (tab === "workshop") {
        // 合併原版與 COMPLETE_WORKSHOP_RECIPES，保證 100% 完整顯示所有新舊配方
        const recipeMap = {};
        COMPLETE_WORKSHOP_RECIPES.forEach(function(r) { recipeMap[r.id] = r; });
        const rawWks = Array.isArray(Data.WORKSHOP_RECIPES)
          ? Data.WORKSHOP_RECIPES
          : (Data.WORKSHOP_RECIPES && typeof Data.WORKSHOP_RECIPES === "object" ? Object.values(Data.WORKSHOP_RECIPES) : []);
        rawWks.forEach(function(r) {
          if (r && r.id && !recipeMap[r.id]) recipeMap[r.id] = r;
        });

        Object.values(recipeMap).forEach(function(r) {
          const subCat = self.getRecipeSubCategory(r);
          const canDo = self.canAffordRecipe(s, r.cost, r.goldCost || 0);
          const owned = (s.inventory && s.inventory[r.toKey]) || 0;
          itemsList.push({
            uid: r.id,
            raw: r,
            itemType: "recipe",
            subCat: subCat,
            iconKey: "mat_" + r.toKey,
            shortName: r.name.replace(/\s*x\d+$/i, "").replace(/\s*\([^)]*\)/g, ""),
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
          const unlocked = Boolean(s.unlockedWeapons && s.unlockedWeapons.indexOf(w.id) !== -1);
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
          const unlocked = Boolean(s.unlockedArmors && s.unlockedArmors.indexOf(a.id) !== -1);
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
          const unlocked = Boolean(s.unlockedRelics && s.unlockedRelics.indexOf(rel.id) !== -1);
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
          { id: "all",  label: "全部武器(" + itemsList.length + ")" },
          { id: "can",  label: "✅可鍛造/已擁有" },
          { id: "low",  label: "T1~T2 初中階" },
          { id: "high", label: "T3~T4 高階" }
        ];
      } else if (tab === "armors") {
        subFilters = [
          { id: "all",   label: "全部(" + itemsList.length + ")" },
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

      const filteredItems = itemsList.filter(function(item) {
        if (self.curSubFilter === "all") return true;
        if (self.curSubFilter === "can") return item.canCraft || item.unlocked;
        return item.subCat === self.curSubFilter;
      });

      if (!this.selectedItemId || !filteredItems.some(function(x) { return x.uid === self.selectedItemId; })) {
        const firstCraftable = filteredItems.find(function(x) { return x.canCraft; });
        this.selectedItemId = firstCraftable ? firstCraftable.uid : (filteredItems[0] && filteredItems[0].uid);
      }

      const selectedObj = filteredItems.find(function(x) { return x.uid === this.selectedItemId; }) || filteredItems[0];

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

      const mainBtn = inspector.querySelector("#wk-main-craft-btn");
      if (mainBtn && selectedObj) {
        mainBtn.onclick = function() {
          self.executePrimaryItemAction(selectedObj);
        };
      }

      const useBuffBtn = inspector.querySelector("#wk-use-buff-btn");
      if (useBuffBtn && selectedObj && selectedObj.raw) {
        useBuffBtn.onclick = function() {
          self.useSrpgConsumable(selectedObj.raw.toKey);
        };
      }

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

  // ================= 6. 掛載高低差移動碰撞、南北雙繩梯攀爬、去標籤化與格仔工坊 =================
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
        Object.keys(HIGHLAND_ZONES).forEach(function(zId) {
          const m = origGetMap(zId);
          if (m) {
            m._highlandInjectedToken = null;
            injectHighlandCliffIntoMap(m);
          }
        });
      };
    }

    if (Exp) {
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
          if (!isInsideHighlandPlateau(s.heroX, s.heroY)) {
            s.heroX = prevX;
            s.heroY = prevY;
          }
        } else {
          if (isBlockedByCliffFromLowland(s.heroX, s.heroY)) {
            s.heroX = prevX;
            s.heroY = prevY;
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
            if (d && d.isCliffLadderSpot && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 58) {
              if (!s.riggedCliffs) s.riggedCliffs = {};
              const isRigged = Boolean(s.riggedCliffs[mapObj.id]);

              if (!isRigged) {
                if ((s.inventory.ropeLadder || 0) <= 0) {
                  window.Aetheria.Audio.sfxWrong();
                  window.Aetheria.UI.showToast("🧗 陡峭的懸崖岩壁！請先在【工坊 ➔ 🔨加工】合成【攀岩繩梯 x1】(麻繩x1+原木x2) 架設！");
                  return;
                }
                s.inventory.ropeLadder--;
                s.riggedCliffs[mapObj.id] = true;
                (mapObj.decos || []).forEach(function(dc) {
                  if (dc.isCliffLadderSpot) {
                    dc.sprite = "rope_ladder";
                    dc.name = "繩梯";
                  }
                });
                if (window.Aetheria.Renderer) window.Aetheria.Renderer.builtZoneKey = null;
              }

              window.Aetheria.Audio.sfxGather();
              if (s.onHighland) {
                s.onHighland = false;
                if (d.ladderSide === "north") {
                  s.heroX = d.x;
                  s.heroY = 588;
                } else {
                  s.heroX = d.x;
                  s.heroY = 798;
                }
                s.petX = s.heroX - 20;
                s.petY = s.heroY;
                window.Aetheria.UI.showToast("🧗 順着攀岩繩梯爬下了平地！");
              } else {
                s.onHighland = true;
                if (d.ladderSide === "north") {
                  s.heroX = d.x;
                  s.heroY = 655;
                } else {
                  s.heroX = d.x;
                  s.heroY = 710;
                }
                s.petX = s.heroX - 20;
                s.petY = s.heroY;
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
            if (d && d.isCliffLadderSpot && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 58) {
              const rigged = Boolean(s.riggedCliffs && s.riggedCliffs[mapObj.id]);
              hintEl.innerText = !rigged ? "架設繩梯" : (s.onHighland ? "爬下懸崖" : "爬上高台");
              return;
            }
          }
        }
        origHint(mapObj, s);
      };

      const origHarvest = Exp.harvestNode.bind(Exp);
      Exp.harvestNode = function(node) {
        const s = window.Aetheria.State.data;
        if (node && node.reqHighland && !s.onHighland) {
          window.Aetheria.Audio.sfxWrong();
          window.Aetheria.UI.showToast("🧗 此礦簇位於高台上！請先從懸崖邊的【繩梯】爬上高台再開採！");
          return;
        }
        origHarvest(node);
      };
    }

    if (Bat && Bat.winBattle) {
      const origWin = Bat.winBattle.bind(Bat);
      Bat.winBattle = function() {
        const isCombat = (this.mode === "combat");
        origWin();
        if (isCombat && Math.random() < 0.60) {
          const s = window.Aetheria.State.data;
          s.inventory.rawHide = (s.inventory.rawHide || 0) + 1;
          window.Aetheria.State.save();
        }
      };
    }

    if (Ren) {
      const origBuild = Ren.buildSceneDOM.bind(Ren);
      Ren.buildSceneDOM = function(mapObj) {
        if (mapObj && HIGHLAND_ZONES[mapObj.id]) {
          injectHighlandCliffIntoMap(mapObj);
        }
        origBuild(mapObj);

        const terrainLayer = document.getElementById("world-terrain-layer");
        const S = window.Aetheria.Data.Sprites;
        if (!terrainLayer || !mapObj) return;

        // 繪製附圖 1000311094.jpg 的 L 型黃土高台、垂直深啡色懸崖壁與黑色山洞拱門
        if (HIGHLAND_ZONES[mapObj.id]) {
          const platTop = document.createElement("div");
          platTop.className = "srpg-plateau-top";
          platTop.style.cssText = "left:390px; top:618px; width:515px; height:122px;";
          terrainLayer.appendChild(platTop);

          const platRight = document.createElement("div");
          platRight.className = "srpg-plateau-top";
          platRight.style.cssText = "left:710px; top:732px; width:195px; height:148px; border-top:none; border-radius:0;";
          terrainLayer.appendChild(platRight);

          const cliffMain = document.createElement("div");
          cliffMain.className = "srpg-cliff-wall";
          cliffMain.style.cssText = "left:390px; top:736px; width:324px; height:46px;";
          terrainLayer.appendChild(cliffMain);

          const cliffStepSide = document.createElement("div");
          cliffStepSide.className = "srpg-cliff-side-wall";
          cliffStepSide.style.cssText = "left:704px; top:736px; width:14px; height:144px;";
          terrainLayer.appendChild(cliffStepSide);

          const cliffRightBottom = document.createElement("div");
          cliffRightBottom.className = "srpg-cliff-wall";
          cliffRightBottom.style.cssText = "left:710px; top:876px; width:195px; height:44px;";
          terrainLayer.appendChild(cliffRightBottom);

          const caveArch = document.createElement("div");
          caveArch.className = "srpg-cave-arch";
          caveArch.style.cssText = "left:468px; top:738px;";
          terrainLayer.appendChild(caveArch);
        }

        Object.keys(this.domPool.nodes || {}).forEach(function(nId) {
          const item = Ren.domPool.nodes[nId];
          if (item && item.data && item.data.isClusterBoulder && S) {
            item.el.innerHTML = '<img src="' + S.getDataURL("cluster_boulder") + '" alt="">';
            if (item.lbl) item.el.appendChild(item.lbl);
          }
        });
      };

      // 去標籤化：普通採集物走近 (<62px) 才顯示文字標籤
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
            if (n.type === "chest") return;
            const dist = Math.hypot((s.heroX || 0) - n.x, (s.heroY || 0) - n.y);
            item.lbl.style.display = (dist < 62) ? "block" : "none";
          });
        } catch (e) {}
      };
    }

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

      // ★ 啟動時立即將所有 1~6 區與蘑菇洞窟進行擴大與拆舊樹牆，確保進入任何地圖即刻生效！
      const Maps = window.Aetheria.Data && window.Aetheria.Data.Maps;
      if (Maps && Maps.getMap) {
        Object.keys(HIGHLAND_ZONES).forEach(function(zId) {
          const m = Maps.getMap(zId);
          if (m) {
            m._highlandInjectedToken = null;
            injectHighlandCliffIntoMap(m);
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
      console.error("Survival Highlands & Grid Workshop v9.4 init error:", err);
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(initHighlandsAndWorkshopModule, 180);
  } else {
    window.addEventListener("load", function() {
      setTimeout(initHighlandsAndWorkshopModule, 180);
    });
  }
})();
