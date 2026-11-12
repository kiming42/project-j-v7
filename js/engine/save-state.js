/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 赤手空拳開局、40種生存建材與實地建造狀態中心 (save-state.js - v6.0)
 * 升級：1.開局赤手空拳 (equippedWeapon: "w_none"，四大工具皆為 Lv.0)，需先徒手拾荒修復熔爐或經 NPC 授予
 *       2.新增 8 種天然生存原材與 6 種工坊加工建材 (共 40 種素材)
 *       3.新增 7 大實地工程進度 (projectsBuilt / projectContributions) 與村民委託追蹤 (npcQuests)
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const SAVE_KEY = "AETHERIA_SAVE_V7";

  const DEFAULT_STATE = {
    version: "6.0",
    lv: 1,
    exp: 0,
    hp: 100,
    maxHp: 100,
    baseAtk: 24,
    baseDef: 6,
    bp: 1,
    maxBp: 5,
    streak: 0,
    maxStreak: 0,
    gold: 0,

    // 赤手空拳開局：無武器 ("w_none")，需幫鐵匠巴爾修復熔爐才獲贈新手忍刀與基礎工具！
    currentJob: "swordsman",
    unlockedJobs: ["swordsman"],
    equippedWeapon: "w_none",
    unlockedWeapons: [],
    equippedArmor: "a_cloth",
    unlockedArmors: ["a_cloth"],
    unlockedRelics: [],

    socketedRunes: {
      weapon: null,
      armor: null
    },

    activeMeal: {
      id: null,
      battlesLeft: 0
    },

    // 四大探索工具初始皆為 Lv.0 (未持有)
    // pickaxe & axe 由巴爾授予；hook (釣竿) 由老漁夫阿海授予；bomb (火藥袋) 由見習礦工石頭授予
    tools: {
      pickaxe: 0,
      axe: 0,
      bomb: 0,
      hook: 0
    },

    activePet: "pet_slime",
    unlockedPets: ["pet_slime"],
    shinyPets: [],
    expeditionCounter: 0,

    // 40 種完整背包素材：天然原材 + 工坊加工建材 + 礦石靈植 + 6大破防核心 + 消耗品
    inventory: {
      // 徒手與天然生存原材 (8)
      branch: 0,      // 散落枯枝 (徒手拾取)
      flint: 0,       // 尖銳燧石 (徒手拾取)
      clay: 0,        // 河床黏土 (徒手/水岸拾取)
      resin: 0,       // 琥珀松脂 (森林伐木伴生/採集)
      basalt: 0,      // 玄武岩塊 (Lv.2重鎬碎巨石/採集)
      hemp: 0,        // 荒野亞麻 (第2區峽谷綠洲採集)
      sailCloth: 0,   // 幽靈古帆布 (第3區海盜魔物掉落)
      sinew: 0,       // 強韌獸筋 (第4區雪原魔物掉落)
      // 工坊加工建材組件 (6)
      plank: 0,       // 加工厚木板 (原木x2 + 松脂x1)
      rope: 0,        // 強化麻繩索 (藤蔓x2 + 枯枝x1)
      nails: 0,       // 鍛造鐵釘 (藍晶鐵礦x2)
      pitch: 0,       // 防水松脂膠 (松脂x2 + 黏土x1)
      heavySail: 0,   // 遠航風帆 (古帆布x2 + 亞麻x2 + 麻繩x1)
      firebrick: 0,   // 黑曜耐火磚 (黏土x2 + 玄武岩x2 + 黑曜石x1)
      // 礦石與木材靈植 (10)
      iron: 0,
      mithril: 0,
      obsidian: 0,
      starIron: 0,
      wood: 0,
      herb: 0,
      vine: 0,
      flower: 0,
      iceLotus: 0,
      goldLeaf: 0,
      // 生態特產與聖碑 (6)
      shell: 0,
      coral: 0,
      fur: 0,
      magmaScale: 0,
      fish: 0,
      tabletShard: 0,
      // 6 大魔物破防核心
      coreBamboo: 0,
      coreSkull: 0,
      coreSiren: 0,
      coreWolf: 0,
      coreGolem: 0,
      coreDragon: 0,
      // 消耗品 (4)
      potionHeal: 0,
      potionHint: 0,
      bombItem: 0,
      tameFruit: 0
    },

    // 7 大實地拓荒工程完成紀錄與分批建材投入紀錄
    projectsBuilt: {
      proj_camp_forge: false,  // 0. 曙光營地：修復巴爾的鍛造熔爐
      proj_z1_bridge: false,   // 1. 翠風森林：建造跨河加固吊橋
      proj_cave1_beacon: false,// 1-B. 蘑菇洞窟：砌築永明聖火燈塔
      proj_z2_ladder: false,   // 2. 流沙峽谷：架設斷崖重型絞盤木梯
      proj_z3_raft: false,     // 3. 翡翠海岸：建造破浪遠航木筏
      proj_z4_shelter: false,  // 4. 霜語雪原：搭建極地防風毛皮屋
      proj_z5_bridge: false    // 5. 熔岩火山：鋪設黑曜耐火石拱橋
    },
    projectContributions: {},

    // 村民實地委託狀態機：紀錄每個任務 { status: 'accepted' | 'completed', startStat: 0 }
    npcQuests: {},

    monolithPts: {
      chinese: 0,
      english: 0,
      science: 0,
      humanities: 0
    },

    activeSubjects: {
      chinese: true,
      english: true,
      humanities: true,
      science: true
    },
    questionMastery: {},
    wrongBook: [],

    guildPoints: 0,
    guildRank: "F",
    claimedRankSupplies: [],
    activeBounties: [],
    bountyPoolSeed: 1,
    bountyCooldowns: {},
    wrongBountyKills: 0,
    bountyStats: {
      kills: 0,
      breaks: 0,
      fishes: 0,
      meals: 0
    },

    questProgress: {
      mq_01_talked: false,
      bountiesCleared: 0
    },
    clearedBosses: {},
    unlockedSeals: {},
    seenCutscenes: {},

    campBuildings: {
      greenhouse: 0,
      pasture: 1
    },

    currentZone: "camp_hub",
    unlockedZones: ["camp_hub"],
    heroX: 320,
    heroY: 260,
    petX: 296,
    petY: 264,
    facing: "down",
    openedNodes: {},
    maxTowerFloor: 1
  };

  function isObject(item) {
    return (item && typeof item === "object" && !Array.isArray(item));
  }

  function deepMerge(target, source) {
    const output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(function(key) {
        if (isObject(source[key])) {
          if (!(key in target)) Object.assign(output, { [key]: source[key] });
          else output[key] = deepMerge(target[key], source[key]);
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }

  const StateManager = {
    data: JSON.parse(JSON.stringify(DEFAULT_STATE)),

    hasExistingSave: function() {
      try {
        return Boolean(localStorage.getItem(SAVE_KEY));
      } catch (e) {
        return false;
      }
    },

    getSaveSummary: function() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return {
          lv: parsed.lv || 1,
          zone: parsed.currentZone || "camp_hub",
          guildRank: parsed.guildRank || "F"
        };
      } catch (e) {
        return null;
      }
    },

    init: function() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.data = deepMerge(DEFAULT_STATE, parsed);
          if (!Array.isArray(this.data.unlockedZones) || this.data.unlockedZones.length === 0) {
            this.data.unlockedZones = ["camp_hub"];
          }
          if (!Array.isArray(this.data.activeBounties)) this.data.activeBounties = [];
          if (!Array.isArray(this.data.claimedRankSupplies)) this.data.claimedRankSupplies = [];
          if (!Array.isArray(this.data.unlockedArmors) || this.data.unlockedArmors.length === 0) {
            this.data.unlockedArmors = ["a_cloth"];
          }
          if (!this.data.unlockedSeals) this.data.unlockedSeals = {};
          if (!this.data.projectsBuilt) this.data.projectsBuilt = {};
          if (!this.data.projectContributions) this.data.projectContributions = {};
          if (!this.data.npcQuests) this.data.npcQuests = {};
          if (!this.data.bountyStats) this.data.bountyStats = { kills: 0, breaks: 0, fishes: 0, meals: 0 };
        }
      } catch (e) {
        console.warn("讀取存檔失敗，使用預設進度:", e);
      }
      this.updateGuildRank();
      this.recalcMaxHp();
      return this.data;
    },

    startFreshNewGame: function() {
      this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
      this.recalcMaxHp();
      this.save();
      return this.data;
    },

    save: function() {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
      } catch (e) {}
    },

    resetSave: function() {
      try {
        localStorage.removeItem(SAVE_KEY);
      } catch (e) {}
      this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
      window.location.reload();
    },

    // 檢查玩家是否已經獲得初始武器 (若仍為赤手空拳則無法與魔物交戰)
    hasWeaponEquipped: function() {
      const s = this.data;
      return Boolean(s.equippedWeapon && s.equippedWeapon !== "w_none" && s.unlockedWeapons && s.unlockedWeapons.length > 0);
    },

    unlockZone: function(zoneId) {
      if (!zoneId) return false;
      if (zoneId === "tent_guild" || zoneId === "tent_forge") return false;
      if (this.data.unlockedZones.indexOf(zoneId) === -1) {
        this.data.unlockedZones.push(zoneId);
        this.save();
        return true;
      }
      return false;
    },

    exportJSON: function() {
      return JSON.stringify(this.data);
    },

    importJSON: function(jsonStr) {
      try {
        const parsed = JSON.parse(jsonStr);
        this.data = deepMerge(DEFAULT_STATE, parsed);
        this.updateGuildRank();
        this.recalcMaxHp();
        this.save();
        return true;
      } catch (e) {
        return false;
      }
    },

    getExpRequired: function(lv) {
      lv = lv || this.data.lv;
      return Math.floor(35 * Math.pow(lv, 1.35));
    },

    recalcMaxHp: function() {
      const s = this.data;
      const armors = (window.Aetheria.Data && window.Aetheria.Data.ARMORS) || {};
      const aObj = armors[s.equippedArmor] || { hpBonus: 0 };

      let totalMax = 80 + (s.lv * 20) + (aObj.hpBonus || 0);
      if (s.unlockedRelics && s.unlockedRelics.indexOf("r_cloak") !== -1) totalMax += 50;
      if (s.activeMeal && s.activeMeal.battlesLeft > 0 && s.activeMeal.id === "meal_soup") totalMax += 80;

      const humPts = (s.monolithPts && s.monolithPts.humanities) || 0;
      if (humPts >= 50) totalMax = Math.round(totalMax * 1.25);

      s.maxHp = totalMax;
      if (s.hp > s.maxHp) s.hp = s.maxHp;
      return s.maxHp;
    },

    getTotalAtk: function() {
      const s = this.data;
      const weapons = (window.Aetheria.Data && window.Aetheria.Data.WEAPONS) || {};
      const jobs = (window.Aetheria.Data && window.Aetheria.Data.JOBS) || {};
      const wBonus = (s.equippedWeapon && weapons[s.equippedWeapon]) ? weapons[s.equippedWeapon].atk : 0;
      const jMult = jobs[s.currentJob] ? jobs[s.currentJob].atkMult : 1.0;
      const shinyBonus = (s.shinyPets && s.shinyPets.indexOf(s.activePet) !== -1) ? 1.2 : 1.0;
      const ssBonus = (s.guildRank === "SS") ? 1.3 : 1.0;

      const chiPts = (s.monolithPts && s.monolithPts.chinese) || 0;
      const monoMult = (chiPts >= 75) ? 1.3 : (chiPts >= 25) ? 1.15 : 1.0;

      const hasGolemRune = (s.socketedRunes && (s.socketedRunes.weapon === "coreGolem" || s.socketedRunes.armor === "coreGolem")) ? 25 : 0;

      return Math.round((s.baseAtk + wBonus + hasGolemRune) * jMult * shinyBonus * ssBonus * monoMult);
    },

    getTotalDef: function() {
      const s = this.data;
      const armors = (window.Aetheria.Data && window.Aetheria.Data.ARMORS) || {};
      const aDef = armors[s.equippedArmor] ? armors[s.equippedArmor].def : 5;
      let total = s.baseDef + aDef;

      const humPts = (s.monolithPts && s.monolithPts.humanities) || 0;
      if (humPts >= 50) total = Math.round(total * 1.25);

      return total;
    },

    hasHazardImmunity: function(hazardType) {
      const s = this.data;
      const armors = (window.Aetheria.Data && window.Aetheria.Data.ARMORS) || {};
      const aObj = armors[s.equippedArmor] || {};

      if (hazardType === "cold") {
        if (aObj.resistCold || aObj.resistAll) return true;
        if (s.projectsBuilt && s.projectsBuilt.proj_z4_shelter) return true; // 建好雪原防風毛皮屋可抵禦凍傷！
        if (s.activeMeal && s.activeMeal.battlesLeft > 0 && s.activeMeal.id === "meal_hotpot") return true;
      }
      if (hazardType === "heat") {
        if (aObj.resistHeat || aObj.resistAll) return true;
        if (s.activeMeal && s.activeMeal.battlesLeft > 0 && s.activeMeal.id === "meal_hotpot") return true;
      }
      return false;
    },

    getBonusShieldBreak: function() {
      const s = this.data;
      const weapons = (window.Aetheria.Data && window.Aetheria.Data.WEAPONS) || {};
      let bonus = (s.equippedWeapon && weapons[s.equippedWeapon]) ? (weapons[s.equippedWeapon].shieldBreak || 0) : 0;
      if (s.currentJob === "swordsman" && Math.random() < 0.25) bonus += 1;
      if (s.currentJob === "archmage") bonus += 1;
      if (s.activeMeal && s.activeMeal.battlesLeft > 0 && s.activeMeal.id === "meal_fish") bonus += 1;
      return bonus;
    },

    hasRune: function(coreKey) {
      const r = this.data.socketedRunes;
      if (!r) return false;
      return r.weapon === coreKey || r.armor === coreKey;
    },

    gainRewards: function(expAmount, goldAmount, guildPts) {
      goldAmount = goldAmount || 0;
      guildPts = guildPts || 5;
      const s = this.data;

      const engPts = (s.monolithPts && s.monolithPts.english) || 0;
      let streakMult = 1.0;
      if (s.streak >= 5) streakMult = (engPts >= 75) ? 2.0 : 1.5;
      else if (s.streak >= 3) streakMult = 1.25;

      const rankBonus = (s.guildRank === "A" || s.guildRank === "S" || s.guildRank === "SS") ? 1.25 : 1.0;

      s.exp += Math.round(expAmount * streakMult * rankBonus);
      s.gold += Math.round(goldAmount * streakMult * rankBonus);
      s.guildPoints += guildPts;

      let leveledUp = false;
      while (s.exp >= this.getExpRequired(s.lv) && s.lv < 100) {
        s.exp -= this.getExpRequired(s.lv);
        s.lv++;
        s.baseAtk += 5;
        s.baseDef += 3;
        this.recalcMaxHp();
        s.hp = s.maxHp;
        leveledUp = true;
      }

      this.updateGuildRank();
      this.checkJobUnlocks();
      this.save();
      return leveledUp;
    },

    updateGuildRank: function() {
      const s = this.data;
      const pts = s.guildPoints || 0;
      const lv = s.lv || 1;

      if (pts >= 2200 && lv >= 45) s.guildRank = "SS";
      else if (pts >= 1300 && lv >= 32) s.guildRank = "S";
      else if (pts >= 700  && lv >= 20) s.guildRank = "A";
      else if (pts >= 320  && lv >= 10) s.guildRank = "C";
      else if (pts >= 120  && lv >= 4)  s.guildRank = "E";
      else s.guildRank = "F";
    },

    checkJobUnlocks: function() {
      const lv = this.data.lv;
      const unlocked = this.data.unlockedJobs;
      if (lv >= 5 && unlocked.indexOf("scholar") === -1) unlocked.push("scholar");
      if (lv >= 12 && unlocked.indexOf("hunter") === -1) unlocked.push("hunter");
      if (lv >= 20 && unlocked.indexOf("thief") === -1) unlocked.push("thief");
      if (lv >= 30 && unlocked.indexOf("alchemist") === -1) unlocked.push("alchemist");
      if (lv >= 50 && unlocked.indexOf("archmage") === -1) unlocked.push("archmage");
    },

    tickPassiveProduction: function() {
      const s = this.data;
      s.expeditionCounter = (s.expeditionCounter || 0) + 1;
      let msg = null;

      if (s.expeditionCounter >= 5) {
        s.expeditionCounter = 0;
        s.inventory.iron += 1;
        if (s.campBuildings.greenhouse > 0) {
          s.inventory.potionHint += 1;
          msg = "牧場遠征：藍晶鐵礦 +1｜溫室：洞察藥水 +1";
        } else {
          msg = "牧場遠征歸來：藍晶鐵礦 +1";
        }
        this.save();
      }
      return msg;
    }
  };

  window.Aetheria.State = StateManager;
})();
