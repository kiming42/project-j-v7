/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 寵物進化、自動撿物與尋寶雷達模組 (srpg-pet.js - v14.5)
 * 【File 7 / 8】獨立外掛模組
 * v14.5 修正 (#3)：
 *   1. syncEvolvedPetSprite 改用 querySelectorAll 並明確排除自家 #srpg-pet-* 光環/氣泡元素
 *   2. 強化 petImg.src 校驗，確保切圖與進化後地圖上的小夥伴 100% 顯示對應階級像素外型
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.SRPG = window.Aetheria.SRPG || {};

(function() {
  const SRPG = window.Aetheria.SRPG;

  // ================= 1. 4 階段進化設定與 16x16 專屬像素外型 =================
  const PET_STAGES = [
    {
      stage: 1, minXp: 0, name: "水滴波波", title: "幼生期",
      spriteKey: "pet_evo_1", auraColor: "rgba(56, 182, 255, 0.35)",
      lootRadius: 75, bonusChance: 0, radarRadius: 0, hpBonus: 0,
      lootPool: ["branch", "flint", "clay", "herb"],
      skillSummary: "🐾 自動撿物 (75px)：自動拾取枯枝、燧石、黏土與微光菇。"
    },
    {
      stage: 2, minXp: 15, name: "星輝小靈獸", title: "成長期",
      spriteKey: "pet_evo_2", auraColor: "rgba(255, 209, 102, 0.48)",
      lootRadius: 110, bonusChance: 0.15, radarRadius: 240, hpBonus: 15,
      lootPool: ["branch", "flint", "clay", "herb", "wood", "vine", "resin", "copperOre", "tinOre", "coal", "rockSalt", "quartz"],
      skillSummary: "❗ 解鎖【尋寶雷達】(240px內偵測✖藏寶點與寶箱) ＋ 撿物擴大至 110px ＋ 永久HP+15。"
    },
    {
      stage: 3, minXp: 45, name: "蒼穹星翼獸", title: "完全體",
      spriteKey: "pet_evo_3", auraColor: "rgba(140, 224, 255, 0.58)",
      lootRadius: 145, bonusChance: 0.35, radarRadius: 280, hpBonus: 40,
      lootPool: "tier2",
      skillSummary: "🍀 撿物擴大至 145px (35%雙倍) ＋ 探索緩慢回血/飽食 ＋ 永久HP+40。"
    },
    {
      stage: 4, minXp: 90, name: "破曉聖光龍靈", title: "究極體",
      spriteKey: "pet_evo_4", auraColor: "rgba(245, 183, 0, 0.72)",
      lootRadius: 185, bonusChance: 0.60, radarRadius: 340, hpBonus: 100,
      lootPool: "all",
      skillSummary: "🐉 開戰自動擊破敵人 1 層護盾 ＋ 185px磁場撿物(60%雙倍) ＋ 永久HP+100！"
    }
  ];

  const PET_FEED_ITEMS = [
    { key: "herb",        name: "紅傘微光菇",   xp: 3,  msg: "嚼嚼微光菇，閃閃發亮！" },
    { key: "fish",        name: "銀鱗鮮魚",     xp: 6,  msg: "最喜歡吃新鮮銀鱗魚了！" },
    { key: "rationJerky", name: "岩鹽風乾肉脯", xp: 10, msg: "精力充沛，毛色更亮了！" },
    { key: "spicedStew",  name: "香辛海陸燉肉", xp: 18, msg: "頂級大餐！智慧能量暴漲！" }
  ];

  function buildPixelDataUrl(grid, palette) {
    const c = document.createElement("canvas");
    c.width = 16; c.height = 16;
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

  function registerPetEvolutionSprites() {
    const cache = SRPG.sprites && SRPG.sprites.cache;
    if (!cache || cache.pet_evo_1) return;

    cache.pet_evo_1 = buildPixelDataUrl([
      "................","................","......KKKK......","....KKBBBBKK....",
      "...KBBWWWWBBK...","..KBBWBBBBBBBK..","..KBBBBBBBBBBK..",".KBBBKBBBBKBBBK.",
      ".KBBBKBBBBKBBBK.",".KBBPPBBBBPPBBK.",".KBBBBBBBBBBBBK.","..KDDDDDDDDDDK..",
      "...KKKKKKKKKK...","................","................","................"
    ], { K: "#141013", B: "#38b6ff", D: "#1d5eb8", W: "#ffffff", P: "#ff8fab" });

    cache.pet_evo_2 = buildPixelDataUrl([
      ".......YY.......","......YYYY......","...KK..YY..KK...","..KYYKKKKKKYYK..",
      "..KCCBBBBBBCCK..",".KCCWWWWWWWWCCK.",".KCBKBBBBBBKBCK.",".KCBKBBBBBBKBCK.",
      ".KCCPPBBBBPPCCK.","..KCCBBBBBBCCK..","..KDDCCCCCCDDK..","...KDDK..KDDK...",
      "...KKKK..KKKK...","................","................","................"
    ], { K: "#141013", Y: "#ffd166", C: "#8ce0ff", B: "#2978d4", D: "#1d3557", W: "#ffffff", P: "#ff8fab" });

    cache.pet_evo_3 = buildPixelDataUrl([
      "......YYYY......",".....KYWWYK.....",".KK..KCCCCK..KK.","KYYKKCWWWWCKKYYK",
      "KWWYKCBBBBKCWWYK",".KYYKCKBBKCKYYK.",".KCCKCKBBKCKCCK.","..KKKCCPPCCKKK..",
      "....KCCCCCCK....","...KDDYYYYDDK...","...KDDK..KDDK...","...KKKK..KKKK...",
      "................","................","................","................"
    ], { K: "#141013", Y: "#f5b700", W: "#ffffff", C: "#38b6ff", B: "#1d5eb8", D: "#102542", P: "#ff758f" });

    cache.pet_evo_4 = buildPixelDataUrl([
      ".....YY..YY.....","....KYYKKYYK....","KK..KWWWWWWK..KK","KYYKKWWCCWWKKYYK",
      "KWWYKWKWWKWKYWWK","KYYYKWWWWWWKYYYK",".KKYKYYPPYYKYKK.","..KKYYYYYYYYKK..",
      "...KGGWWWWGGK...","...KGGKYYKGGK...","..KYYK.KK.KYYK..","..KKKK....KKKK..",
      "................","................","................","................"
    ], { K: "#141013", Y: "#ffd166", G: "#f5b700", W: "#ffffff", C: "#38b6ff", P: "#ff595e" });
  }

  // ================= 2. 注入寵物光環、氣泡與進化面板樣式 =================
  function injectPetStyles() {
    if (document.getElementById("srpg-pet-v145-styles")) return;
    const style = document.createElement("style");
    style.id = "srpg-pet-v145-styles";
    style.textContent = `
      @keyframes srpgPetFloat {
        0%, 100% { transform: translate(-50%, 0px); }
        50%      { transform: translate(-50%, -4px); }
      }
      @keyframes srpgPetAuraPulse {
        0%, 100% { transform: translate(-50%, -50%) scale(0.92); opacity: 0.55; }
        50%      { transform: translate(-50%, -50%) scale(1.12); opacity: 0.9; }
      }
      #srpg-pet-aura {
        position: absolute; left: 0; top: 0; width: 0; height: 0;
        pointer-events: none !important; z-index: 14; display: none;
      }
      #srpg-pet-aura-ring {
        position: absolute; left: 0; top: 4px; width: 30px; height: 18px;
        border-radius: 50%; animation: srpgPetAuraPulse 1.6s ease-in-out infinite;
      }
      #srpg-pet-bubble {
        position: absolute; left: 0; top: 0; pointer-events: none !important; z-index: 44; display: none;
      }
      #srpg-pet-bubble-inner {
        position: absolute; left: 0; top: -32px; white-space: nowrap;
        background: rgba(20, 16, 19, 0.92); color: #ffd166; border: 1.5px solid #f5b700;
        border-radius: 10px; padding: 1px 6px; font-size: 9.5px; font-weight: 900;
        text-shadow: 1px 1px 0 #000; box-shadow: 0 2px 5px rgba(0,0,0,0.8);
        animation: srpgPetFloat 1.1s ease-in-out infinite;
      }
      #srpg-pet-bubble-inner.radar-alert { background: rgba(92, 29, 36, 0.94); border-color: #ff758f; color: #fff3b0; }
      #srpg-pet-bubble-inner.loot-pop    { background: rgba(20, 56, 36, 0.94); border-color: #5ac54f; color: #a3f7b5; }

      .pet-hero-banner {
        display: flex; align-items: center; gap: 10px;
        background: linear-gradient(180deg, #1b2838 0%, #11161f 100%);
        border: 2px solid #38b6ff; border-radius: 9px; padding: 9px 10px; margin-bottom: 8px;
      }
      .pet-avatar-frame {
        width: 58px; height: 58px; border-radius: 10px;
        background: radial-gradient(circle, #2a3f5f 0%, #101824 100%);
        border: 2px solid #ffd166; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      }
      .pet-avatar-frame img { width: 48px; height: 48px; image-rendering: pixelated; }
      .pet-xp-track { width: 100%; height: 9px; background: #141013; border: 1px solid #4a3e44; border-radius: 5px; overflow: hidden; margin-top: 4px; }
      .pet-xp-fill  { height: 100%; background: linear-gradient(90deg, #38b6ff 0%, #ffd166 100%); transition: width 0.3s ease; }
      .pet-feed-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; margin-bottom: 8px; }
      .pet-feed-card { background: #181316; border: 1.5px solid #4a3e44; border-radius: 7px; padding: 6px 8px; display: flex; justify-content: space-between; align-items: center; gap: 4px; }
      .pet-feed-card.can-feed { border-color: #5ac54f; }
    `;
    document.head.appendChild(style);
  }

  // ================= 3. 寵物狀態管理與進化計算 =================
  function ensurePetState() {
    const s = window.Aetheria.State && window.Aetheria.State.data;
    if (!s) return null;
    if (typeof s.petWisdomXp !== "number") {
      const studyCorrect = (s.studyStats && s.studyStats.totalCorrect) || 0;
      const retroLvBonus = Math.min(40, Math.max(0, ((s.lv || 1) - 1) * 2));
      s.petWisdomXp = studyCorrect * 3 + retroLvBonus;
    }
    if (typeof s.petAutoLoot !== "boolean") s.petAutoLoot = true;
    if (typeof s.petRadarOn !== "boolean")  s.petRadarOn = true;
    if (typeof s.petAutoLootCount !== "number") s.petAutoLootCount = 0;
    return s;
  }

  const pet = {
    STAGES: PET_STAGES,
    lastTickTime: 0, lastRegenTime: 0, lastSaveTime: 0, lastSfxTime: 0,
    tempBubbleText: "", tempBubbleCls: "", tempBubbleUntil: 0,
    auraEl: null, auraRingEl: null, bubbleEl: null, bubbleInnerEl: null, cachedPetDomImg: null,

    getStageObj: function(xpOverride) {
      const s = ensurePetState();
      const xp = (typeof xpOverride === "number") ? xpOverride : ((s && s.petWisdomXp) || 0);
      let cur = PET_STAGES[0];
      for (let i = 0; i < PET_STAGES.length; i++) {
        if (xp >= PET_STAGES[i].minXp) cur = PET_STAGES[i];
      }
      return cur;
    },

    getNextStageObj: function(curStage) {
      return PET_STAGES.find(function(st) { return st.stage === curStage.stage + 1; }) || null;
    },

    showTempBubble: function(text, cls, durationMs) {
      this.tempBubbleText = text;
      this.tempBubbleCls = cls || "loot-pop";
      this.tempBubbleUntil = Date.now() + (durationMs || 1600);
    },

    addWisdomXp: function(amount, reasonText) {
      const s = ensurePetState();
      if (!s || !amount || amount <= 0) return;
      const beforeStage = this.getStageObj(s.petWisdomXp);
      s.petWisdomXp += amount;
      const afterStage = this.getStageObj(s.petWisdomXp);

      if (afterStage.stage > beforeStage.stage) {
        if (window.Aetheria.State && window.Aetheria.State.recalcMaxHp) {
          window.Aetheria.State.recalcMaxHp();
          s.hp = s.maxHp;
        }
        if (window.Aetheria.Audio && window.Aetheria.Audio.sfxLevelUp) window.Aetheria.Audio.sfxLevelUp();
        this.showTempBubble("✨進化成 " + afterStage.name + "!", "loot-pop", 3200);
        if (window.Aetheria.UI) {
          window.Aetheria.UI.spawnFloatingText("🌟夥伴進化：" + afterStage.name + "!", "#ffd166", true);
          window.Aetheria.UI.showToast("🎉 恭喜！你的夥伴進化為【" + afterStage.name + "（" + afterStage.title + "）】！" + afterStage.skillSummary);
        }
      } else if (reasonText) {
        this.showTempBubble(reasonText + " +" + amount + "智慧", "loot-pop", 1500);
      }

      if (window.Aetheria.State && window.Aetheria.State.save) window.Aetheria.State.save();
      if (window.Aetheria.UI && window.Aetheria.UI.updateAllHud) window.Aetheria.UI.updateAllHud();
    },

    feedPet: function(matKey) {
      const s = ensurePetState();
      if (!s) return;
      const feedDef = PET_FEED_ITEMS.find(function(f) { return f.key === matKey; });
      if (!feedDef) return;
      const have = (s.inventory && s.inventory[matKey]) || 0;
      if (have <= 0) {
        if (window.Aetheria.Audio && window.Aetheria.Audio.sfxWrong) window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.showToast("⚠️ 背包裡沒有【" + feedDef.name + "】可以餵食喔！");
        return;
      }

      s.inventory[matKey] = Math.max(0, have - 1);
      if (window.Aetheria.Audio && window.Aetheria.Audio.sfxGather) window.Aetheria.Audio.sfxGather();
      this.addWisdomXp(feedDef.xp, "😋" + feedDef.name);
      window.Aetheria.UI.showToast("🐾 餵食【" + feedDef.name + "】：" + feedDef.msg + "（智慧經驗 +" + feedDef.xp + "）");
      this.openPetEvolutionModal();
    },

    toggleSkill: function(field) {
      const s = ensurePetState();
      if (!s) return;
      s[field] = !s[field];
      if (window.Aetheria.Audio && window.Aetheria.Audio.sfxTalkBlip) window.Aetheria.Audio.sfxTalkBlip();
      window.Aetheria.State.save();
      this.openPetEvolutionModal();
    },

    // ================= 4. 寵物視覺同步、自動撿物與尋寶雷達 =================
    ensurePetOverlayElements: function() {
      const entityLayer = document.getElementById("world-entity-layer");
      if (!entityLayer) return false;

      if (!this.auraEl || !entityLayer.contains(this.auraEl)) {
        const aura = document.createElement("div");
        aura.id = "srpg-pet-aura";
        aura.innerHTML = '<div id="srpg-pet-aura-ring"></div>';
        entityLayer.appendChild(aura);
        this.auraEl = aura;
        this.auraRingEl = aura.querySelector("#srpg-pet-aura-ring");
      }

      if (!this.bubbleEl || !entityLayer.contains(this.bubbleEl)) {
        const bub = document.createElement("div");
        bub.id = "srpg-pet-bubble";
        bub.innerHTML = '<div id="srpg-pet-bubble-inner"></div>';
        entityLayer.appendChild(bub);
        this.bubbleEl = bub;
        this.bubbleInnerEl = bub.querySelector("#srpg-pet-bubble-inner");
      }
      return true;
    },

    // ★ v14.5 修正 #3：精準過濾自家 #srpg-pet-* 元件，確保 100% 抓到原版寵物 <img> 並套用進化外型
    syncEvolvedPetSprite: function(stageObj) {
      const S = window.Aetheria.Data && window.Aetheria.Data.Sprites;
      const Ren = window.Aetheria.Renderer;
      if (!S || !Ren) return;

      let petImg = this.cachedPetDomImg;
      if (!petImg || !document.body.contains(petImg)) {
        petImg = null;
        if (Ren.domPool) {
          const pEntry = Ren.domPool.pet || Ren.domPool.petEl;
          if (pEntry) {
            if (pEntry.tagName === "IMG") petImg = pEntry;
            else if (pEntry.img && pEntry.img.tagName === "IMG") petImg = pEntry.img;
            else if (pEntry.el && pEntry.el.querySelector) petImg = pEntry.el.querySelector("img");
            else if (pEntry.querySelector) petImg = pEntry.querySelector("img");
          }
        }
        if (!petImg) {
          const layer = document.getElementById("world-entity-layer");
          if (layer) {
            const candidates = layer.querySelectorAll("#dom-pet, #world-pet, .dom-pet, [id*='pet'], [class*='pet']");
            for (let i = 0; i < candidates.length; i++) {
              const el = candidates[i];
              if (!el || (el.id && el.id.indexOf("srpg-pet-") === 0)) continue;
              const foundImg = (el.tagName === "IMG") ? el : el.querySelector("img");
              if (foundImg) {
                petImg = foundImg;
                break;
              }
            }
          }
        }
        this.cachedPetDomImg = petImg;
      }

      if (petImg) {
        const url = S.getDataURL(stageObj.spriteKey);
        if (url && (petImg._lastEvoStage !== stageObj.stage || petImg.src !== url)) {
          petImg._lastEvoStage = stageObj.stage;
          petImg.src = url;
        }
      }
    },

    canPetAutoLootNode: function(node, stageObj, s) {
      if (!node || node.opened || !node.giveKey) return false;
      if (node.type === "chest" || node.isBuriedSpot || node.isToolGateObstacle ||
          node.isExplorePuzzleChest || node.isCryptVaultChest) {
        return false;
      }
      if (node.reqHighland && !s.onHighland) return false;
      if (!node.reqHighland && s.onHighland) return false;

      const reqLv = node.reqToolLv || 0;
      if (reqLv > 0) {
        const toolType = node.reqTool || (node.type === "wood" ? "axe" : "pickaxe");
        const playerToolLv = (s.tools && s.tools[toolType]) || 0;
        if (playerToolLv < reqLv) return false;
      }

      if (stageObj.lootPool === "all") return true;
      if (stageObj.lootPool === "tier2") return reqLv <= 2;
      return Array.isArray(stageObj.lootPool) && stageObj.lootPool.indexOf(node.giveKey) !== -1;
    },

    runAutoLootAndRadarTick: function(mapObj, s, stageObj) {
      const now = Date.now();
      const px = (typeof s.petX === "number") ? s.petX : (s.heroX || 0) - 20;
      const py = (typeof s.petY === "number") ? s.petY : (s.heroY || 0);
      const hx = s.heroX || 0;
      const hy = s.heroY || 0;

      if (stageObj.stage >= 3 && now - this.lastRegenTime >= 12000) {
        this.lastRegenTime = now;
        if (s.hp < s.maxHp) s.hp = Math.min(s.maxHp, s.hp + 3);
        if (typeof s.hunger === "number" && s.hunger < 100) s.hunger = Math.min(100, s.hunger + 1);
      }

      const zId = mapObj.id || "";
      const isSafeField = (zId !== "camp_hub" && zId !== "ocean_sea" && zId.indexOf("tent_") !== 0);

      if (s.petAutoLoot && isSafeField && mapObj.nodes && mapObj.nodes.length > 0) {
        let pickedNode = null;
        let bestDist = Infinity;
        for (let i = 0; i < mapObj.nodes.length; i++) {
          const n = mapObj.nodes[i];
          if (!this.canPetAutoLootNode(n, stageObj, s)) continue;
          const dist = Math.min(Math.hypot(n.x - px, n.y - py), Math.hypot(n.x - hx, n.y - hy));
          if (dist <= stageObj.lootRadius && dist < bestDist) {
            bestDist = dist;
            pickedNode = n;
          }
        }

        if (pickedNode) {
          pickedNode.opened = true;
          const gKey = pickedNode.giveKey;
          let qty = 1;
          if (stageObj.bonusChance > 0 && Math.random() < stageObj.bonusChance) qty += 1;
          if (pickedNode.type === "wood" && (s.inventory.briarSickle || 0) > 0) qty += 1;

          s.inventory[gKey] = (s.inventory[gKey] || 0) + qty;
          s.petAutoLootCount = (s.petAutoLootCount || 0) + 1;

          if (window.Aetheria.Renderer && window.Aetheria.Renderer.domPool && window.Aetheria.Renderer.domPool.nodes) {
            const domNode = window.Aetheria.Renderer.domPool.nodes[pickedNode.id];
            if (domNode && domNode.el) SRPG.utils.setDisplayIfChanged(domNode.el, "none");
          }
          if (SRPG.terrain && SRPG.terrain.spawnHarvestParticles) {
            SRPG.terrain.spawnHarvestParticles(pickedNode.x, pickedNode.y, "#ffd166");
          }

          const matsDB = (window.Aetheria.Data && window.Aetheria.Data.MATERIALS) || {};
          const mName = (matsDB[gKey] && matsDB[gKey].name) || gKey;
          this.showTempBubble("🐾撿到 " + mName + "+" + qty, "loot-pop", 1400);

          if (now - this.lastSfxTime > 900 && window.Aetheria.Audio && window.Aetheria.Audio.sfxGather) {
            this.lastSfxTime = now;
            window.Aetheria.Audio.sfxGather();
          }
          if (now - this.lastSaveTime > 2500 && window.Aetheria.State && window.Aetheria.State.save) {
            this.lastSaveTime = now;
            window.Aetheria.State.save();
          }
          if (window.Aetheria.UI && window.Aetheria.UI.updateAllHud) {
            window.Aetheria.UI.updateAllHud();
          }
        }
      }

      let radarMsg = "";
      if (s.petRadarOn && stageObj.radarRadius > 0 && isSafeField && mapObj.nodes) {
        let nearestTreasure = null;
        let minTDist = stageObj.radarRadius;
        for (let j = 0; j < mapObj.nodes.length; j++) {
          const n = mapObj.nodes[j];
          if (!n || n.opened) continue;
          const isSpecial =
            (n.isBuriedSpot && !(s.dugSpots && s.dugSpots[n.id])) ||
            (n.isToolGateObstacle && !(s.clearedToolGates && s.clearedToolGates[n.id])) ||
            (n.type === "chest");
          if (!isSpecial) continue;
          const d = Math.hypot(n.x - hx, n.y - hy);
          if (d <= minTDist) {
            minTDist = d;
            nearestTreasure = n;
          }
        }
        if (nearestTreasure) {
          if (nearestTreasure.isBuriedSpot) radarMsg = "❗附近有✖藏寶點!";
          else if (nearestTreasure.isToolGateObstacle) radarMsg = "❗發現尋寶障礙!";
          else radarMsg = "❗發現秘寶箱!";
        }
      }
      this._radarMsg = radarMsg;
    },

    updatePetVisuals: function() {
      const s = ensurePetState();
      const Maps = window.Aetheria.Data && window.Aetheria.Data.Maps;
      if (!s || !Maps || !Maps.getMap) return;
      const mapObj = Maps.getMap(s.currentZone);
      if (!mapObj) return;

      const stageObj = this.getStageObj(s.petWisdomXp);
      const now = Date.now();

      if (now - this.lastTickTime >= 420) {
        this.lastTickTime = now;
        this.runAutoLootAndRadarTick(mapObj, s, stageObj);
      }

      if (!this.ensurePetOverlayElements()) return;
      this.syncEvolvedPetSprite(stageObj);

      const px = Math.round((typeof s.petX === "number") ? s.petX : (s.heroX || 0) - 20);
      const py = Math.round((typeof s.petY === "number") ? s.petY : (s.heroY || 0));

      if (mapObj.id === "ocean_sea") {
        SRPG.utils.setDisplayIfChanged(this.auraEl, "none");
        SRPG.utils.setDisplayIfChanged(this.bubbleEl, "none");
        return;
      }

      if (stageObj.stage >= 2) {
        SRPG.utils.setDisplayIfChanged(this.auraEl, "block");
        this.auraEl.style.transform = "translate3d(" + px + "px, " + py + "px, 0)";
        if (this.auraRingEl && this.auraRingEl._lastCol !== stageObj.auraColor) {
          this.auraRingEl._lastCol = stageObj.auraColor;
          this.auraRingEl.style.background = "radial-gradient(circle, " + stageObj.auraColor + " 0%, transparent 72%)";
        }
      } else {
        SRPG.utils.setDisplayIfChanged(this.auraEl, "none");
      }

      let showText = "";
      let showCls = "";
      if (now < this.tempBubbleUntil && this.tempBubbleText) {
        showText = this.tempBubbleText;
        showCls = this.tempBubbleCls;
      } else if (this._radarMsg) {
        showText = this._radarMsg;
        showCls = "radar-alert";
      }

      if (showText) {
        SRPG.utils.setDisplayIfChanged(this.bubbleEl, "block");
        this.bubbleEl.style.transform = "translate3d(" + px + "px, " + py + "px, 0)";
        SRPG.utils.setClassIfChanged(this.bubbleInnerEl, showCls);
        SRPG.utils.setTextIfChanged(this.bubbleInnerEl, showText);
      } else {
        SRPG.utils.setDisplayIfChanged(this.bubbleEl, "none");
      }
    },

    // ================= 5. 🐾 智慧夥伴進化與技能面板 =================
    openPetEvolutionModal: function() {
      const s = ensurePetState();
      const S = window.Aetheria.Data && window.Aetheria.Data.Sprites;
      if (!s || !S) return;

      const cur = this.getStageObj(s.petWisdomXp);
      const next = this.getNextStageObj(cur);
      const pct = next
        ? Math.min(100, Math.round(((s.petWisdomXp - cur.minXp) / Math.max(1, next.minXp - cur.minXp)) * 100))
        : 100;

      window.Aetheria.UI.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = "🐾 智慧夥伴進化 ＆ 探索技能";

      const heroBannerHtml =
        '<div class="pet-hero-banner">' +
          '<div class="pet-avatar-frame"><img src="' + S.getDataURL(cur.spriteKey) + '" alt=""></div>' +
          '<div style="flex:1;">' +
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b style="color:#ffd166; font-size:14px;">' + cur.name + ' <span style="font-size:11px; color:#8ce0ff;">(' + cur.title + ')</span></b>' +
              '<span class="codex-tag">階段 ' + cur.stage + '/4</span>' +
            '</div>' +
            '<div style="font-size:11px; color:#e2e8f0; margin-top:3px;">' + cur.skillSummary + '</div>' +
            '<div style="display:flex; justify-content:space-between; font-size:10px; color:#cbd5e1; margin-top:4px;">' +
              '<span>✨ 智慧經驗：' + s.petWisdomXp + (next ? (' / ' + next.minXp) : ' (已達究極體)') + '</span>' +
              '<span>🐾 累計幫撿：' + (s.petAutoLootCount || 0) + ' 次</span>' +
            '</div>' +
            '<div class="pet-xp-track"><div class="pet-xp-fill" style="width:' + pct + '%;"></div></div>' +
          '</div>' +
        '</div>';

      const toggleRowHtml =
        '<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:5px; margin-bottom:8px;">' +
          '<button class="na-btn ' + (s.petAutoLoot ? 'highlight' : '') + '" style="padding:6px 2px; font-size:11px;" onclick="Aetheria.SRPG.pet.toggleSkill(\'petAutoLoot\')">' +
            (s.petAutoLoot ? '✅自動撿物:開' : '⬜自動撿物:關') +
          '</button>' +
          '<button class="na-btn ' + (s.petRadarOn ? 'highlight' : '') + '" style="padding:6px 2px; font-size:11px;" onclick="Aetheria.SRPG.pet.toggleSkill(\'petRadarOn\')">' +
            (s.petRadarOn ? '✅尋寶雷達:開' : '⬜尋寶雷達:關') +
          '</button>' +
          (SRPG.study
            ? '<button class="na-btn highlight" style="padding:6px 2px; font-size:11px; border-color:#c77dff;" onclick="Aetheria.SRPG.study.startFreePracticeSession()">🧠答題賺經驗</button>'
            : '<button class="na-btn" style="padding:6px 2px; font-size:11px;" onclick="Aetheria.UI.openForgeModal(\'workshop\')">🔨前往工坊</button>') +
        '</div>';

      let feedHtml = '<div style="font-size:11.5px; font-weight:900; color:#ffd166; margin-bottom:4px;">🍖 餵食小點心（增加智慧經驗加速進化）</div><div class="pet-feed-grid">';
      PET_FEED_ITEMS.forEach(function(fi) {
        const cnt = (s.inventory && s.inventory[fi.key]) || 0;
        feedHtml +=
          '<div class="pet-feed-card ' + (cnt > 0 ? 'can-feed' : '') + '">' +
            '<div>' +
              '<div style="font-size:11.5px; font-weight:900; color:#ffffff;">' + S.iconHtml("mat_" + fi.key, true) + fi.name + '</div>' +
              '<div style="font-size:10px; color:#8ce0ff;">持有 ' + cnt + ' ｜ +' + fi.xp + ' 智慧</div>' +
            '</div>' +
            '<button class="na-btn ' + (cnt > 0 ? 'highlight' : '') + '" style="padding:4px 8px; font-size:11px;" onclick="Aetheria.SRPG.pet.feedPet(\'' + fi.key + '\')">餵食</button>' +
          '</div>';
      });
      feedHtml += '</div>';

      let treeHtml = '<div style="font-size:11.5px; font-weight:900; color:#8ce0ff; margin-bottom:4px;">🌟 四階段進化路線與技能解鎖</div>';
      PET_STAGES.forEach(function(st) {
        const reached = cur.stage >= st.stage;
        treeHtml +=
          '<div class="codex-card ' + (reached ? 'owned' : '') + '" style="display:flex; align-items:center; gap:8px;">' +
            '<img src="' + S.getDataURL(st.spriteKey) + '" style="width:32px; height:32px; image-rendering:pixelated; flex-shrink:0;" alt="">' +
            '<div style="flex:1;">' +
              '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<b style="color:' + (reached ? '#5ac54f' : '#ffd166') + '; font-size:12px;">' + (reached ? '✅ ' : '🔒 ') + st.name + ' (' + st.title + ')</b>' +
                '<span class="codex-tag">' + st.minXp + ' 智慧</span>' +
              '</div>' +
              '<div style="font-size:10.5px; color:#cbd5e1; margin-top:2px; line-height:1.3;">' + st.skillSummary + '</div>' +
            '</div>' +
          '</div>';
      });

      document.getElementById("modal-body").innerHTML = heroBannerHtml + toggleRowHtml + feedHtml + treeHtml;
    }
  };
  SRPG.pet = pet;

  // ================= 6. 掛鉤引擎 =================
  function installPetHooks() {
    if (pet._hooked) return;
    pet._hooked = true;

    injectPetStyles();
    registerPetEvolutionSprites();
    ensurePetState();

    const St  = window.Aetheria.State;
    const Bat = window.Aetheria.Battle;
    const Ren = window.Aetheria.Renderer;
    const UI  = window.Aetheria.UI;

    if (St && St.recalcMaxHp) {
      const origMaxHp = St.recalcMaxHp.bind(St);
      St.recalcMaxHp = function() {
        origMaxHp();
        if (this.data) {
          const curStage = pet.getStageObj(this.data.petWisdomXp);
          if (curStage && curStage.hpBonus > 0) {
            this.data.maxHp += curStage.hpBonus;
            if (this.data.hp > this.data.maxHp) this.data.hp = this.data.maxHp;
          }
        }
      };
      St.recalcMaxHp();
    }

    if (SRPG.study && SRPG.study.recordAnswer) {
      const origRecord = SRPG.study.recordAnswer.bind(SRPG.study);
      SRPG.study.recordAnswer = function(subject, isCorrect, questionObj) {
        const res = origRecord(subject, isCorrect, questionObj);
        if (isCorrect) pet.addWisdomXp(3, "✨答題成長");
        return res;
      };
    } else if (Bat && Bat.executeEnemyCounterPhase) {
      const origCounter = Bat.executeEnemyCounterPhase.bind(Bat);
      Bat.executeEnemyCounterPhase = function(answeredRight) {
        if (answeredRight === true) pet.addWisdomXp(3, "✨答題成長");
        return origCounter(answeredRight);
      };
    }

    if (Bat && Bat.startBattle) {
      const origStart = Bat.startBattle.bind(Bat);
      Bat.startBattle = function(mapMonsterNode, customMode, customQuestionId) {
        origStart(mapMonsterNode, customMode, customQuestionId);
        const e = this.enemy;
        if (!e || this.mode !== "combat") return;
        const curStage = pet.getStageObj();
        if (curStage.stage >= 4 && e.shield > 1) {
          e.shield = Math.max(1, e.shield - 1);
          if (this.updateBattleHUD) this.updateBattleHUD();
          setTimeout(function() {
            if (window.Aetheria.UI) {
              window.Aetheria.UI.spawnFloatingText("🐉聖光龍靈助威・敵盾-1!", "#ffd166", true);
            }
          }, 550);
        }
      };
    }

    if (Ren && Ren.renderWorld) {
      const origRender = Ren.renderWorld.bind(Ren);
      Ren.renderWorld = function() {
        origRender();
        try { pet.updatePetVisuals(); } catch (e) {}
      };
    }

    if (UI && UI.setActivePanel) {
      const origPanel = UI.setActivePanel.bind(UI);
      UI.setActivePanel = function(panelId) {
        origPanel(panelId);
        if (panelId === "panel-modal") {
          setTimeout(function() {
            const titleEl = document.getElementById("modal-title");
            const bodyEl  = document.getElementById("modal-body");
            if (!titleEl || !bodyEl) return;
            const tText = titleEl.textContent || "";
            if ((tText.indexOf("寵") !== -1 || tText.indexOf("職") !== -1 || tText.indexOf("夥伴") !== -1) &&
                tText.indexOf("智慧夥伴進化") === -1 &&
                !document.getElementById("open-pet-evo-banner-btn")) {
              const s = ensurePetState();
              const st = pet.getStageObj(s ? s.petWisdomXp : 0);
              const wrap = document.createElement("div");
              wrap.id = "open-pet-evo-banner-btn";
              wrap.style.marginBottom = "8px";
              wrap.innerHTML =
                '<button class="na-btn highlight" style="width:100%; padding:8px; font-size:12.5px; border-color:#38b6ff;" onclick="Aetheria.SRPG.pet.openPetEvolutionModal()">' +
                  '🐾 智慧夥伴進化 ＆ 自動撿物設定【' + st.name + '・階段' + st.stage + '/4】' +
                '</button>';
              bodyEl.insertBefore(wrap, bodyEl.firstChild);
            }
          }, 10);
        }
      };
    }

    if (UI && UI.openQuestLogModal) {
      const origQuestLog = UI.openQuestLogModal.bind(UI);
      UI.openQuestLogModal = function() {
        origQuestLog();
        const body = document.getElementById("modal-body");
        if (body && !document.getElementById("open-pet-from-quest-btn")) {
          const cur = pet.getStageObj();
          const btn = document.createElement("button");
          btn.id = "open-pet-from-quest-btn";
          btn.className = "na-btn";
          btn.style.cssText = "width:100%; margin-bottom:8px; padding:6px; font-size:12px; border-color:#38b6ff; color:#8ce0ff;";
          btn.textContent = "🐾 智慧夥伴進化 ＆ 尋寶雷達【" + cur.name + "・階段" + cur.stage + "/4】";
          btn.onclick = function() { pet.openPetEvolutionModal(); };
          const topRow = document.getElementById("open-codex-from-quest-btn");
          if (topRow && topRow.nextSibling) body.insertBefore(btn, topRow.nextSibling);
          else body.insertBefore(btn, body.firstChild);
        }
      };
    }

    pet.updatePetVisuals();
  }

  function bootPetWhenReady() {
    let tries = 0;
    const timer = setInterval(function() {
      tries++;
      if (SRPG._ready && SRPG.data && SRPG.sprites && window.Aetheria.Renderer && window.Aetheria.UI) {
        clearInterval(timer);
        setTimeout(installPetHooks, 80);
      } else if (tries >= 160) {
        clearInterval(timer);
      }
    }, 50);
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    bootPetWhenReady();
  } else {
    window.addEventListener("load", bootPetWhenReady);
  }
})();
