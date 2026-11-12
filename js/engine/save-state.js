/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 存檔狀態、日夜時鐘與飽食度求生核心 (save-state.js - v7.0)
 * 新增：1.飽食度系統 (hunger: 0~100)、生存天數 (dayCount) 與四時段世界時鐘 (worldClock: 0~399)
 *       2.松脂火把照明步數 (torchTicks) 與營地「睡眠至天亮」完整恢復機制
 *       3.100% 向下兼容 v6.7 存檔，舊存檔載入時自動補齊求生欄位與初始口糧
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const SAVE_KEY = "AETHERIA_SAVE_V7";

  function createDefaultState() {
    return {
      version: 7.0,
      heroName: "Justin",
      lv: 1,
      exp: 0,
      maxExp: 80,
      hp: 120,
      maxHp: 120,
      bp: 1,
      maxBp: 5,
      gold: 50,
      guildPoints: 0,
      guildRank: "F",
      streak: 0,
      maxStreak: 0,

      // v7.0 新增：日夜交替與飽食度求生指標
      hunger: 100,
      maxHunger: 100,
      dayCount: 1,
      worldClock: 80, // 0~59:破曉(dawn), 60~219:白晝(day), 220~279:黃昏(dusk), 280~399:黑夜(night)
      stepHungerCounter: 0,
      torchTicks: 0,

      currentZone: "camp_hub",
      heroX: 320,
      heroY: 260,
      petX: 296,
      petY: 264,
      facing: "down",
      unlockedZones: ["camp_hub"],

      currentJob: "swordsman",
      unlockedJobs: ["swordsman"],

      equippedWeapon: null,
      unlockedWeapons: [],

      equippedArmor: "a_cloth",
      unlockedArmors: ["a_cloth"],

      unlockedRelics: [],
      socketedRunes: { weapon: null, armor: null },

      activePet: "pet_slime",
      unlockedPets: ["pet_slime"],
      shinyPets: [],

      tools: {
        pickaxe: 0,
        axe: 0,
        hook: 0,
        bomb: 0
      },

      activeMeal: { id: null, battlesLeft: 0 },

      inventory: {
        branch: 0, flint: 0, clay: 0, resin: 0,
        basalt: 0, hemp: 0, sailCloth: 0, sinew: 0,
        plank: 0, rope: 0, nails: 0, pitch: 0, heavySail: 0, firebrick: 0,
        iron: 0, mithril: 0, obsidian: 0, starIron: 0,
        wood: 0, herb: 0, vine: 0, flower: 0, iceLotus: 0, goldLeaf: 0,
        shell: 0, coral: 0, fur: 0, magmaScale: 0, fish: 0, tabletShard: 0,
        coreBamboo: 0, coreSkull: 0, coreSiren: 0, coreWolf: 0, coreGolem: 0, coreDragon: 0,
        potionHeal: 2, potionHint: 2, bombItem: 0, tameFruit: 1,
        // v7.0 新增隨身求生道具
        rationHerb: 2,
        rationFish: 0,
        torchItem: 1
      },

      projectsBuilt: {},
      projectContributions: {},
      unlockedSeals: {},
      clearedBosses: {},
      openedNodes: {},
      seenCutscenes: {},

      questProgress: {
        bountiesCleared: 0,
        fishedOnce: false,
        cookedOnce: false
      },
      npcQuests: {},
      activeBounties: [],
      bountyStats: { kills: 0, breaks: 0, fishes: 0, meals: 0 },
      bountyPoolSeed: 1,
      bountyCooldowns: {},
      claimedRankSupplies: [],
      wrongBountyKills: 0,

      monolithPts: {
        chinese: 0,
        english: 0,
        science: 0,
        humanities: 0
      },

      maxTowerFloor: 1,
      passiveCounter: 0,

      activeSubjects: { chinese: true, english: true, humanities: true, science: true },
      activeLessons: null,
      lessonSelectMode: "multi",
      activeQuizTypes: null,
      questionMastery: {},
      wrongBook: []
    };
  }

  const StateManager = {
    data: createDefaultState(),

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
        if (!raw) return { lv: 1, guildRank: "F", zone: "camp_hub", dayCount: 1 };
        const parsed = JSON.parse(raw);
        return {
          lv: parsed.lv || 1,
          guildRank: parsed.guildRank || "F",
          zone: parsed.currentZone || "camp_hub",
          dayCount: parsed.dayCount || 1
        };
      } catch (e) {
        return { lv: 1, guildRank: "F", zone: "camp_hub", dayCount: 1 };
      }
    },

    init: function() {
      const def = createDefaultState();
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.data = Object.assign({}, def, parsed);
          this.data.inventory = Object.assign({}, def.inventory, parsed.inventory || {});
          this.data.tools = Object.assign({}, def.tools, parsed.tools || {});
          this.data.monolithPts = Object.assign({}, def.monolithPts, parsed.monolithPts || {});
          this.data.questProgress = Object.assign({}, def.questProgress, parsed.questProgress || {});
          this.data.bountyStats = Object.assign({}, def.bountyStats, parsed.bountyStats || {});
          this.data.socketedRunes = Object.assign({}, def.socketedRunes, parsed.socketedRunes || {});

          if (typeof this.data.hunger !== "number" || isNaN(this.data.hunger)) this.data.hunger = 100;
          if (typeof this.data.maxHunger !== "number") this.data.maxHunger = 100;
          if (typeof this.data.dayCount !== "number" || this.data.dayCount < 1) this.data.dayCount = 1;
          if (typeof this.data.worldClock !== "number" || isNaN(this.data.worldClock)) this.data.worldClock = 80;
          if (typeof this.data.torchTicks !== "number" || isNaN(this.data.torchTicks)) this.data.torchTicks = 0;
        } else {
          this.data = def;
        }
      } catch (e) {
        this.data = def;
      }
      this.recalcMaxHp();
      return this.data;
    },

    startFreshNewGame: function() {
      this.data = createDefaultState();
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
      location.reload();
    },

    exportJSON: function() {
      return JSON.stringify(this.data);
    },

    importJSON: function(rawStr) {
      try {
        const parsed = JSON.parse(rawStr);
        if (!parsed || typeof parsed.lv !== "number") return false;
        localStorage.setItem(SAVE_KEY, JSON.stringify(parsed));
        this.init();
        return true;
      } catch (e) {
        return false;
      }
    },

    // ================= v7.0 日夜時鐘與飽食度輔助方法 =================
    getTimePhase: function() {
      const c = ((this.data.worldClock || 0) % 400 + 400) % 400;
      if (c < 60) {
        return { id: "dawn",  label: "🌅 破曉", icon: "🌅", isNight: false, expMult: 1.0 };
      }
      if (c < 220) {
        return { id: "day",   label: "☀ 白晝", icon: "☀", isNight: false, expMult: 1.0 };
      }
      if (c < 280) {
        return { id: "dusk",  label: "🌇 黃昏", icon: "🌇", isNight: false, expMult: 1.15 };
      }
      return { id: "night", label: "🌙 黑夜", icon: "🌙", isNight: true,  expMult: 1.35 };
    },

    advanceTime: function(ticks) {
      ticks = ticks || 1;
      const s = this.data;
      const oldPhase = this.getTimePhase().id;

      s.worldClock = (s.worldClock || 0) + ticks;
      if (s.worldClock >= 400) {
        s.worldClock = s.worldClock % 400;
        s.dayCount = (s.dayCount || 1) + 1;
      }

      if (s.torchTicks && s.torchTicks > 0) {
        s.torchTicks = Math.max(0, s.torchTicks - ticks);
      }

      const newPhase = this.getTimePhase();
      if (oldPhase !== newPhase.id && window.Aetheria.UI && window.Aetheria.UI.showToast) {
        if (newPhase.id === "dusk") {
          window.Aetheria.UI.showToast("🌇 黃昏降臨！水波釣魚點魚群活躍（命中區加寬 25%），黑夜即將到來！");
        } else if (newPhase.id === "night") {
          window.Aetheria.UI.showToast("🌙 黑夜降臨！野外視野收窄，夜行魔物經驗與金幣 +35%！可點燃【火把】或回營地休息。");
        } else if (newPhase.id === "dawn") {
          window.Aetheria.UI.showToast("🌅 第 " + s.dayCount + " 天破曉時分！黑夜退去，大陸重現晨光。");
        }
      }
    },

    consumeHunger: function(amount) {
      const s = this.data;
      if (s.currentZone === "camp_hub" || s.currentZone === "tent_guild" || s.currentZone === "tent_forge") {
        return true; // 營地安全區不消耗飽食度
      }
      const prev = s.hunger !== undefined ? s.hunger : 100;
      s.hunger = Math.max(0, prev - amount);
      if (prev > 20 && s.hunger <= 20 && window.Aetheria.UI) {
        window.Aetheria.UI.showToast("⚠️ 肚子餓了（飽食度低於 20%）！請按右下角【口糧】進食或回營地煲湯休整！");
      }
      return s.hunger > 0;
    },

    restoreHunger: function(amount, healHp) {
      const s = this.data;
      s.hunger = Math.min(s.maxHunger || 100, (s.hunger || 0) + amount);
      if (healHp && healHp > 0) {
        this.recalcMaxHp();
        s.hp = Math.min(s.maxHp, s.hp + healHp);
      }
      this.save();
    },

    sleepUntilMorning: function() {
      const s = this.data;
      s.dayCount = (s.dayCount || 1) + 1;
      s.worldClock = 65; // 直接進入白晝清晨
      s.hunger = s.maxHunger || 100;
      this.recalcMaxHp();
      s.hp = s.maxHp;
      if (window.Aetheria.Data && window.Aetheria.Data.Maps) {
        window.Aetheria.Data.Maps.refreshAllResources();
      }
      if (window.Aetheria.Renderer) {
        window.Aetheria.Renderer.builtZoneKey = null;
      }
      this.save();
    },

    hasWeaponEquipped: function() {
      const s = this.data;
      return Boolean(s.equippedWeapon && s.unlockedWeapons && s.unlockedWeapons.indexOf(s.equippedWeapon) !== -1);
    },

    hasRune: function(runeKey) {
      const s = this.data;
      if (!s.socketedRunes) return false;
      return s.socketedRunes.weapon === runeKey || s.socketedRunes.armor === runeKey;
    },

    hasHazardImmunity: function(hazardType) {
      const s = this.data;
      const armor = window.Aetheria.Data && window.Aetheria.Data.ARMORS && window.Aetheria.Data.ARMORS[s.equippedArmor];
      if (armor) {
        if (armor.resistAll) return true;
        if (hazardType === "cold" && armor.resistCold) return true;
      }
      if (hazardType === "cold" && s.projectsBuilt && s.projectsBuilt.proj_z4_shelter) {
        return true;
      }
      if (s.activeMeal && s.activeMeal.battlesLeft > 0 && s.activeMeal.id === "meal_hotpot") {
        return true;
      }
      return false;
    },

    recalcMaxHp: function() {
      const s = this.data;
      let base = 100 + (s.lv - 1) * 24;
      const armor = window.Aetheria.Data && window.Aetheria.Data.ARMORS && window.Aetheria.Data.ARMORS[s.equippedArmor];
      if (armor && armor.hpBonus) base += armor.hpBonus;
      if (s.unlockedRelics && s.unlockedRelics.indexOf("r_cloak") !== -1) base += 50;
      if (s.activeMeal && s.activeMeal.battlesLeft > 0 && s.activeMeal.id === "meal_soup") base += 80;
      if (s.monolithPts && s.monolithPts.humanities >= 50) {
        base = Math.round(base * 1.25);
      }
      s.maxHp = base;
      if (s.hp > s.maxHp) s.hp = s.maxHp;
    },

    getTotalAtk: function() {
      const s = this.data;
      let atk = 10 + (s.lv - 1) * 5;
      const w = window.Aetheria.Data && window.Aetheria.Data.WEAPONS && window.Aetheria.Data.WEAPONS[s.equippedWeapon];
      if (w && w.atk) atk += w.atk;
      if (this.hasRune("coreGolem")) atk += 25;

      const job = window.Aetheria.Data && window.Aetheria.Data.JOBS && window.Aetheria.Data.JOBS[s.currentJob];
      if (job && job.atkMult) atk = Math.round(atk * job.atkMult);

      const chiPts = (s.monolithPts && s.monolithPts.chinese) || 0;
      if (chiPts >= 75) atk = Math.round(atk * 1.30);
      else if (chiPts >= 25) atk = Math.round(atk * 1.15);

      if (s.guildRank === "SS") atk = Math.round(atk * 1.30);
      return atk;
    },

    getTotalDef: function() {
      const s = this.data;
      let def = 6 + (s.lv - 1) * 3;
      const a = window.Aetheria.Data && window.Aetheria.Data.ARMORS && window.Aetheria.Data.ARMORS[s.equippedArmor];
      if (a && a.def) def += a.def;
      if (s.currentJob === "paladin") def = Math.round(def * 1.35);
      if (s.monolithPts && s.monolithPts.humanities >= 50) def = Math.round(def * 1.25);
      return def;
    },

    getBonusShieldBreak: function() {
      const s = this.data;
      let b = 0;
      const w = window.Aetheria.Data && window.Aetheria.Data.WEAPONS && window.Aetheria.Data.WEAPONS[s.equippedWeapon];
      if (w && w.shieldBreak) b += w.shieldBreak;
      if (s.activeMeal && s.activeMeal.battlesLeft > 0 && s.activeMeal.id === "meal_fish") b += 1;
      return b;
    },

    unlockZone: function(zoneId) {
      const s = this.data;
      if (!Array.isArray(s.unlockedZones)) s.unlockedZones = ["camp_hub"];
      if (s.unlockedZones.indexOf(zoneId) === -1) {
        s.unlockedZones.push(zoneId);
        this.save();
        return true;
      }
      return false;
    },

    updateGuildRank: function() {
      const s = this.data;
      const ranks = (window.Aetheria.Data && window.Aetheria.Data.GUILD_RANKS) || [];
      let best = "F";
      for (let i = 0; i < ranks.length; i++) {
        if (s.lv >= ranks[i].minLv && s.guildPoints >= ranks[i].minPts) {
          best = ranks[i].rank;
        }
      }
      s.guildRank = best;
    },

    gainRewards: function(expGain, goldGain, guildPtsGain) {
      const s = this.data;
      let mult = 1.0;
      if (s.guildRank === "A" || s.guildRank === "S" || s.guildRank === "SS") mult += 0.25;
      if (s.unlockedRelics && s.unlockedRelics.indexOf("r_charm") !== -1) mult += 0.20;

      // v7.0 黑夜與黃昏戰鬥加成
      const phase = this.getTimePhase();
      if (phase && phase.expMult) mult *= phase.expMult;

      s.exp += Math.round((expGain || 0) * mult);
      s.gold += Math.round((goldGain || 0) * mult);
      s.guildPoints += (guildPtsGain || 0);

      let leveledUp = false;
      while (s.exp >= s.maxExp) {
        s.exp -= s.maxExp;
        s.lv++;
        s.maxExp = Math.round(s.maxExp * 1.28 + 30);
        this.recalcMaxHp();
        s.hp = s.maxHp;
        s.hunger = s.maxHunger || 100; // 升級時同時回滿飽食度
        leveledUp = true;
      }
      this.updateGuildRank();
      this.save();
      return leveledUp;
    },

    tickPassiveProduction: function() {
      const s = this.data;
      if (s.guildRank === "F") return null;
      s.passiveCounter = (s.passiveCounter || 0) + 1;
      if (s.passiveCounter >= 4) {
        s.passiveCounter = 0;
        s.inventory.iron = (s.inventory.iron || 0) + 1;
        this.save();
        return "【公會遠征隊】自動產出：藍晶鐵礦 +1";
      }
      return null;
    }
  };

  window.Aetheria.State = StateManager;
})();
