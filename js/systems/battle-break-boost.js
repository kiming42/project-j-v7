/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 知識充飢檢定、夜戰加成與錯題溫習卡引擎 (battle-break-boost.js - v7.0)
 * 新增：1.startForageChallenge()：零口糧時的「知識共鳴充飢」問答檢定，確保玩家絕不因飢餓卡關
 *       2.飽食度 >= 80% 戰鬥傷害 +10% 且每回額外回血 +12；黑夜時段魔物額外機率掉落破防核心
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  function stripEmoji(str) {
    if (!str) return "";
    return String(str)
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "")
      .trim();
  }

  function getHunterSubPet(state) {
    if (state.currentJob !== "hunter" || !state.unlockedPets || state.unlockedPets.length < 2) {
      return null;
    }
    const subId = state.unlockedPets.find(function(id) { return id !== state.activePet; }) || state.unlockedPets[0];
    return (window.Aetheria.Data && window.Aetheria.Data.PETS[subId]) || null;
  }

  function buildBattleScenery(arenaEl, theme, Sprites) {
    if (!arenaEl || !Sprites) return;

    const horizonEl = arenaEl.querySelector(".bt-scenery-horizon");
    let propsEl = arenaEl.querySelector(".bt-scenery-props");
    if (!propsEl) {
      propsEl = document.createElement("div");
      propsEl.className = "bt-scenery-props";
      arenaEl.insertBefore(propsEl, arenaEl.firstChild);
    }

    const skyPal = {
      forest:  { m1: "#1f4235", m2: "#2f6142", star: "#a8ba59" },
      canyon:  { m1: "#6b2b1e", m2: "#994226", star: "#ffd166" },
      cave:    { m1: "#140d21", m2: "#281c3d", star: "#8ce0ff" },
      coast:   { m1: "#14427a", m2: "#2264ad", star: "#ffffff" },
      snow:    { m1: "#4a6d88", m2: "#789eb8", star: "#ffffff" },
      volcano: { m1: "#3d0c0e", m2: "#731712", star: "#ff9f1c" },
      sky:     { m1: "#2667c9", m2: "#5aa9e6", star: "#ffd166" }
    }[theme] || { m1: "#1f4235", m2: "#2f6142", star: "#a8ba59" };

    if (horizonEl) {
      horizonEl.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 120" preserveAspectRatio="none" style="width:100%;height:100%;shape-rendering:crispEdges;">' +
          '<rect x="28" y="10" width="4" height="4" fill="' + skyPal.star + '" opacity="0.8"/>' +
          '<rect x="96" y="16" width="3" height="3" fill="' + skyPal.star + '" opacity="0.6"/>' +
          '<rect x="184" y="8" width="4" height="4" fill="' + skyPal.star + '" opacity="0.85"/>' +
          '<rect x="268" y="14" width="3" height="3" fill="' + skyPal.star + '" opacity="0.7"/>' +
          '<polygon points="0,54 38,20 76,46 122,14 168,48 218,22 268,44 302,24 320,40 320,56 0,56" fill="' + skyPal.m1 + '"/>' +
          '<polygon points="0,56 24,36 62,50 104,28 148,52 196,32 244,50 288,34 320,48 320,58 0,58" fill="' + skyPal.m2 + '"/>' +
          '<rect x="0" y="54" width="320" height="3" fill="#141013" opacity="0.45"/>' +
        '</svg>';
    }

    let propList = [];
    if (theme === "forest") {
      propList = [
        { sp: "tree", left: "4%", bottom: "46%", size: 44 },
        { sp: "tree", left: "16%", bottom: "50%", size: 36 },
        { sp: "mat_herb", left: "34%", bottom: "42%", size: 22 },
        { sp: "mat_flower", left: "62%", bottom: "44%", size: 22 },
        { sp: "tree", left: "78%", bottom: "50%", size: 38 },
        { sp: "tree", left: "88%", bottom: "45%", size: 46 }
      ];
    } else if (theme === "cave") {
      propList = [
        { sp: "pillar", left: "6%", bottom: "46%", size: 42 },
        { sp: "mat_mithril", left: "22%", bottom: "44%", size: 26 },
        { sp: "brazier_on", left: "46%", bottom: "45%", size: 28 },
        { sp: "mat_obsidian", left: "68%", bottom: "44%", size: 26 },
        { sp: "pillar", left: "86%", bottom: "46%", size: 42 }
      ];
    } else if (theme === "canyon") {
      propList = [
        { sp: "pillar", left: "5%", bottom: "46%", size: 42 },
        { sp: "boulder_block", left: "20%", bottom: "44%", size: 28 },
        { sp: "campfire", left: "46%", bottom: "42%", size: 26 },
        { sp: "mat_mithril", left: "72%", bottom: "45%", size: 26 },
        { sp: "pillar", left: "86%", bottom: "46%", size: 42 }
      ];
    } else if (theme === "coast") {
      propList = [
        { sp: "ancient_ship", left: "14%", bottom: "52%", size: 46 },
        { sp: "mat_coral", left: "36%", bottom: "38%", size: 24 },
        { sp: "mat_coral", left: "64%", bottom: "40%", size: 24 },
        { sp: "grapple_post", left: "85%", bottom: "44%", size: 32 }
      ];
    } else if (theme === "snow") {
      propList = [
        { sp: "pillar", left: "6%", bottom: "46%", size: 40 },
        { sp: "mat_iceLotus", left: "26%", bottom: "43%", size: 24 },
        { sp: "campfire", left: "47%", bottom: "42%", size: 26 },
        { sp: "mat_coreWolf", left: "68%", bottom: "44%", size: 24 },
        { sp: "pillar", left: "86%", bottom: "46%", size: 40 }
      ];
    } else if (theme === "volcano") {
      propList = [
        { sp: "boulder_block", left: "7%", bottom: "45%", size: 34 },
        { sp: "mat_obsidian", left: "26%", bottom: "44%", size: 28 },
        { sp: "brazier_on", left: "47%", bottom: "44%", size: 28 },
        { sp: "mat_obsidian", left: "68%", bottom: "44%", size: 28 },
        { sp: "boulder_block", left: "85%", bottom: "45%", size: 34 }
      ];
    } else {
      propList = [
        { sp: "pillar", left: "6%", bottom: "46%", size: 44 },
        { sp: "deco_lantern", left: "24%", bottom: "45%", size: 28 },
        { sp: "sky_airship", left: "45%", bottom: "54%", size: 44 },
        { sp: "mat_starIron", left: "70%", bottom: "45%", size: 26 },
        { sp: "pillar", left: "86%", bottom: "46%", size: 44 }
      ];
    }

    propsEl.innerHTML = propList.map(function(p) {
      return '<img src="' + Sprites.getDataURL(p.sp) + '" class="bt-prop-img" style="left:' + p.left + ';bottom:' + p.bottom + ';width:' + p.size + 'px;height:' + p.size + 'px;" alt="">';
    }).join("");
  }

  const BattleEngine = {
    active: false,
    mode: "combat",
    mapMonsterRef: null,
    harvestNodeRef: null,
    pathActionRef: null,
    enemy: null,
    boostActive: false,
    guardActive: false,
    revivedThisBattle: false,
    timerInterval: null,
    timeLeft: 0,

    startBattle: function(mapMonsterNode, customMode, customQuestionId) {
      mapMonsterNode = mapMonsterNode || null;
      customMode = customMode || "combat";
      customQuestionId = customQuestionId || null;

      this.active = true;
      this.mode = customMode;
      this.mapMonsterRef = mapMonsterNode;
      this.boostActive = false;
      this.guardActive = false;
      this.revivedThisBattle = false;

      window.Aetheria.State.recalcMaxHp();
      const s = window.Aetheria.State.data;
      this.enemy = window.Aetheria.Data.createBattleEnemy(mapMonsterNode);
      this.enemy.name = stripEmoji(this.enemy.name);
      this.enemy.weak = "弱點：" + stripEmoji(this.enemy.weak);
      this.enemy.wasBroken = false;

      if (s.currentJob === "archmage" && s.bp < 3) s.bp = 3;
      if (s.guildRank === "SS") s.bp = Math.min(s.maxBp, s.bp + 1);
      if (s.monolithPts && s.monolithPts.english >= 25) s.bp = Math.min(s.maxBp, s.bp + 1);
      if (s.activeMeal && s.activeMeal.battlesLeft > 0 && s.activeMeal.id === "meal_steak") {
        s.bp = Math.min(s.maxBp, s.bp + 1);
      }

      if (window.Aetheria.State.hasRune("coreWolf")) {
        this.enemy.frozenTurns = 1;
      }

      let openBreak = 0;
      if (s.tools.bomb >= 3) openBreak += 2;
      else if (s.tools.bomb === 2) openBreak += 1;

      const mainPet = window.Aetheria.Data.PETS[s.activePet];
      const subPet = getHunterSubPet(s);
      if (mainPet && mainPet.openingShieldBreak) openBreak += mainPet.openingShieldBreak;
      if (subPet && subPet.openingShieldBreak) openBreak += subPet.openingShieldBreak;

      if (openBreak > 0 && !this.enemy.broken) {
        this.enemy.shield = Math.max(0, this.enemy.shield - openBreak);
        if (this.enemy.shield === 0) {
          this.enemy.broken = true;
          this.enemy.wasBroken = true;
          this.enemy.breakTurnsLeft = 2;
          this.enemy.intent = window.Aetheria.Data.rollNextIntent(this.enemy, 1);
        }
      }

      document.getElementById("battle-stage").style.display = "flex";
      window.Aetheria.UI.setActivePanel("panel-battle");
      window.Aetheria.Audio.playBgm("battle");

      const phaseTitle = document.getElementById("battle-phase-title");
      if (phaseTitle) {
        const isNight = window.Aetheria.State.getTimePhase().isNight;
        phaseTitle.innerText = (customMode === "bounty") ? "討伐暗影錯題幻象" : (isNight ? "🌙 夜戰破盾詠唱" : "破盾詠唱");
      }

      this.renderBattleDomStage();
      this.updateBattleHUD();
      this.nextTurnQuestion(customQuestionId);
    },

    // v7.0 新增：零口糧時的「野外求生・知識共鳴充飢」保底挑戰
    startForageChallenge: function() {
      this.active = true;
      this.mode = "forage";
      this.boostActive = false;
      this.guardActive = false;

      this.enemy = {
        name: "野外求生・知識覓食",
        lv: 1,
        atk: 0,
        isBoss: false,
        isShiny: true,
        spriteKey: "mat_herb",
        hp: 20,
        maxHp: 20,
        shield: 1,
        maxShield: 1,
        broken: false,
        intent: { type: "none", label: "答對本題即可採得野生微光菇乾，立即恢復 +40% 飽食度！", isUlt: false },
        weak: "知識共鳴充飢"
      };

      document.getElementById("battle-stage").style.display = "flex";
      window.Aetheria.UI.setActivePanel("panel-battle");

      const phaseTitle = document.getElementById("battle-phase-title");
      if (phaseTitle) phaseTitle.innerText = "知識共鳴充飢";

      this.renderBattleDomStage();
      this.updateBattleHUD();
      this.nextTurnQuestion();
    },

    startHarvestChallenge: function(node) {
      this.active = true;
      this.mode = "harvest";
      this.harvestNodeRef = node;
      this.boostActive = false;
      this.guardActive = false;

      const Sprites = window.Aetheria.Data.Sprites;
      const spKey = (node.giveKey && Sprites.getMatSpriteKey) ? Sprites.getMatSpriteKey(node.giveKey) : "mat_mithril";

      this.enemy = {
        name: stripEmoji(node.name),
        lv: 5,
        atk: 0,
        isBoss: false,
        isShiny: true,
        spriteKey: spKey,
        hp: 30,
        maxHp: 30,
        shield: 1,
        maxShield: 1,
        broken: false,
        intent: { type: "none", label: "限時 10 秒內答對即可採集此高純度礦脈並獲賞金", isUlt: false },
        weak: "完美共鳴採集"
      };

      document.getElementById("battle-stage").style.display = "flex";
      window.Aetheria.UI.setActivePanel("panel-battle");

      const phaseTitle = document.getElementById("battle-phase-title");
      if (phaseTitle) phaseTitle.innerText = "完美採集 (10秒)";

      this.renderBattleDomStage();
      this.updateBattleHUD();
      this.nextTurnQuestion(null, 10);
    },

    startPathActionChallenge: function(actionObj, npcObj) {
      this.active = true;
      this.mode = "path_inquire";
      this.pathActionRef = { action: actionObj, npc: npcObj };
      this.boostActive = false;
      this.guardActive = false;

      this.enemy = {
        name: stripEmoji(npcObj.name) + "（檢定）",
        lv: 3,
        atk: 0,
        isBoss: false,
        isShiny: false,
        spriteKey: npcObj.sprite,
        hp: 40,
        maxHp: 40,
        shield: 1,
        maxShield: 1,
        broken: false,
        intent: { type: "none", label: "答對本題即可完成旅人指令", isUlt: false },
        weak: "知識檢定"
      };

      document.getElementById("battle-stage").style.display = "flex";
      window.Aetheria.UI.setActivePanel("panel-battle");

      const phaseTitle = document.getElementById("battle-phase-title");
      if (phaseTitle) phaseTitle.innerText = stripEmoji(actionObj.label);

      this.renderBattleDomStage();
      this.updateBattleHUD();
      this.nextTurnQuestion();
    },

    renderBattleDomStage: function() {
      const s = window.Aetheria.State.data;
      const e = this.enemy;
      const Sprites = window.Aetheria.Data.Sprites;
      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
      const theme = mapObj.theme || "forest";

      const arenaEl = document.getElementById("bt-arena-bg");
      if (arenaEl) {
        arenaEl.className = "bt-arena-field theme-" + theme;
        buildBattleScenery(arenaEl, theme, Sprites);
      }

      const heroSlot = document.getElementById("bt-dom-hero");
      if (heroSlot) {
        heroSlot.innerHTML = '<img src="' + Sprites.getDataURL("hero_right_0") + '" alt="Hero">';
      }

      const petSlot = document.getElementById("bt-dom-pet");
      const subPetSlot = document.getElementById("bt-dom-subpet");
      const petData = window.Aetheria.Data.PETS[s.activePet] || window.Aetheria.Data.PETS.pet_slime;
      const isShinyPet = s.shinyPets && s.shinyPets.indexOf(s.activePet) !== -1;
      const petKey = isShinyPet ? petData.shinySpriteKey : petData.spriteKey;

      if (petSlot) {
        petSlot.innerHTML = '<img src="' + Sprites.getDataURL(petKey) + '" alt="Pet">';
      }

      const subData = getHunterSubPet(s);
      if (subPetSlot) {
        if (subData) {
          const subShiny = s.shinyPets && s.shinyPets.indexOf(subData.id) !== -1;
          const subKey = subShiny ? subData.shinySpriteKey : subData.spriteKey;
          subPetSlot.innerHTML = '<img src="' + Sprites.getDataURL(subKey) + '" alt="SubPet">';
          subPetSlot.style.display = "block";
        } else {
          subPetSlot.innerHTML = "";
          subPetSlot.style.display = "none";
        }
      }

      const enemySlot = document.getElementById("bt-dom-enemy");
      if (enemySlot && e) {
        let eKey = e.spriteKey || "mon_bamboo";
        if (e.isShiny && !e.isBoss && Sprites.get(eKey + "_shiny")) {
          eKey += "_shiny";
        }
        enemySlot.className = "bt-enemy-slot" + (e.isBoss ? " boss" : "") + (e.broken ? " broken" : "");
        enemySlot.innerHTML = '<img src="' + Sprites.getDataURL(eKey) + '" alt="Enemy">';
      }
    },

    playAttackAnimation: function() {
      const heroSlot = document.getElementById("bt-dom-hero");
      const slashEl = document.getElementById("bt-slash-fx");

      if (heroSlot) {
        heroSlot.classList.remove("bt-lunge-right");
        void heroSlot.offsetWidth;
        heroSlot.classList.add("bt-lunge-right");
      }
      if (slashEl) {
        slashEl.style.display = "block";
        setTimeout(function() { slashEl.style.display = "none"; }, 220);
      }
    },

    playEnemyAttackAnimation: function() {
      const enemySlot = document.getElementById("bt-dom-enemy");
      if (enemySlot) {
        enemySlot.classList.remove("bt-lunge-left");
        void enemySlot.offsetWidth;
        enemySlot.classList.add("bt-lunge-left");
      }
    },

    updateBattleHUD: function() {
      const s = window.Aetheria.State.data;
      const e = this.enemy;
      if (!e) return;

      const heroHpTxt = document.getElementById("bt-hero-hp-txt");
      if (heroHpTxt) heroHpTxt.innerText = "HP " + s.hp + "/" + s.maxHp;
      const heroHpBar = document.getElementById("hero-hp-bar");
      if (heroHpBar) heroHpBar.style.width = Math.max(0, (s.hp / s.maxHp) * 100) + "%";

      const guardPill = document.getElementById("bt-guard-pill");
      if (guardPill) guardPill.style.display = this.guardActive ? "inline-block" : "none";

      const streakEl = document.getElementById("battle-streak-tag");
      if (streakEl) streakEl.innerText = "連勝 x" + (s.streak || 0) + "｜飽食 " + (s.hunger !== undefined ? s.hunger : 100) + "%";

      const orbs = document.getElementById("hero-bp-orbs");
      if (orbs) {
        orbs.innerHTML = "";
        for (let i = 0; i < s.maxBp; i++) {
          const d = document.createElement("div");
          d.className = "bp-orb" + (i < s.bp ? " filled" : "");
          orbs.appendChild(d);
        }
      }

      document.getElementById("enemy-name").innerText = e.name;
      const shinyTag = document.getElementById("enemy-shiny-tag");
      if (shinyTag) shinyTag.style.display = e.isShiny ? "inline-block" : "none";

      const intentBox = document.getElementById("enemy-intent-box");
      const intentTxt = document.getElementById("enemy-intent-txt");
      if (intentBox && intentTxt) {
        if (e.broken) {
          intentBox.className = "bt-intent-banner";
          intentTxt.innerText = "狀態：BREAK 暈眩中 (剩 " + (e.breakTurnsLeft || 1) + " 回合)";
        } else if (e.frozenTurns > 0) {
          intentBox.className = "bt-intent-banner";
          intentTxt.innerText = "狀態：雪狼冰魄冰封中 (無法反擊)";
        } else if (e.intent) {
          intentBox.className = "bt-intent-banner" + (e.intent.isUlt ? " intent-ult" : "");
          intentTxt.innerText = e.intent.label;
        }
      }

      const shieldBox = document.getElementById("enemy-shield-box");
      const shieldTxt = document.getElementById("enemy-shield");
      if (shieldBox && shieldTxt) {
        if (e.broken) {
          shieldBox.classList.add("broken");
          shieldTxt.innerText = "BREAK 破防";
        } else {
          shieldBox.classList.remove("broken");
          shieldTxt.innerText = "護盾 " + e.shield + " (減傷75%)";
        }
      }

      const enemySlot = document.getElementById("bt-dom-enemy");
      if (enemySlot) {
        if (e.broken) enemySlot.classList.add("broken");
        else enemySlot.classList.remove("broken");
      }

      document.getElementById("enemy-weak").innerText = e.weak;
      document.getElementById("enemy-hp-bar").style.width = Math.max(0, (e.hp / e.maxHp) * 100) + "%";

      const boostBtn = document.getElementById("btn-boost");
      if (boostBtn) {
        boostBtn.innerText = this.boostActive ? "Boost中" : "Boost(" + s.bp + ")";
        boostBtn.className = "na-btn" + (this.boostActive ? " highlight" : "");
      }

      const guardBtn = document.getElementById("btn-guard");
      if (guardBtn) {
        guardBtn.innerText = this.guardActive ? "舉盾中" : "舉盾";
        guardBtn.className = "na-btn" + (this.guardActive ? " highlight" : "");
      }

      const tameBtn = document.getElementById("btn-tame");
      if (tameBtn) {
        const canTame = (this.mode === "combat") && (e.broken || (e.hp / e.maxHp) <= 0.45);
        tameBtn.style.display = canTame ? "inline-block" : "none";
      }
    },

    toggleBoost: function() {
      const s = window.Aetheria.State.data;
      if (s.bp <= 0) {
        window.Aetheria.UI.showToast("BP 增幅珠不足！每回合答對或開啟【舉盾】可充能 BP。");
        return;
      }
      this.boostActive = !this.boostActive;
      window.Aetheria.Audio.sfxTalkBlip();
      this.updateBattleHUD();
    },

    toggleGuard: function() {
      if (this.mode !== "combat" && this.mode !== "bounty") return;
      this.guardActive = !this.guardActive;
      window.Aetheria.Audio.sfxTalkBlip();
      if (this.guardActive) {
        window.Aetheria.UI.showToast("已開啟【舉盾防禦】：答對後減免敵方 75% 傷害並額外 +1 BP！");
      }
      this.updateBattleHUD();
    },

    attemptTame: function() {
      const s = window.Aetheria.State.data;
      if ((s.inventory.tameFruit || 0) <= 0) {
        window.Aetheria.UI.showToast("靈獸誘餌果不足！可在營地工坊或金幣商店取得。");
        return;
      }
      s.inventory.tameFruit--;
      this.mode = "tame_trial";
      const phaseTitle = document.getElementById("battle-phase-title");
      if (phaseTitle) phaseTitle.innerText = "已投出誘餌果！答對本題收服";
      window.Aetheria.UI.showToast("已投出靈獸誘餌果！請答對下方題目完成契約共鳴！");
    },

    useHealPotion: function() {
      const s = window.Aetheria.State.data;
      if ((s.inventory.potionHeal || 0) <= 0) {
        window.Aetheria.UI.showToast("生命藥水不足！可在工坊煉金或用金幣購買。");
        return;
      }
      if (s.hp >= s.maxHp) {
        window.Aetheria.UI.showToast("生命值已經是滿的！");
        return;
      }
      s.inventory.potionHeal--;
      const sciPts = (s.monolithPts && s.monolithPts.science) || 0;
      const healVal = (sciPts >= 25) ? 140 : 70;
      s.hp = Math.min(s.maxHp, s.hp + healVal);
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();
      this.updateBattleHUD();
      window.Aetheria.UI.spawnFloatingText("+" + healVal + " HP", "#5ac54f", false);
      window.Aetheria.UI.showToast("飲用生命藥水，回復 " + healVal + " 點生命！(剩餘 " + s.inventory.potionHeal + " 瓶)");
    },

    nextTurnQuestion: function(forceId, customSeconds) {
      clearInterval(this.timerInterval);
      const s = window.Aetheria.State.data;
      const e = this.enemy;
      const self = this;

      const isHighPressure = e && ((e.lv - s.lv) >= 6);
      const limitSec = customSeconds || (isHighPressure ? 14 : 0);

      const timerBadge = document.getElementById("timer-badge");
      if (limitSec > 0 && timerBadge) {
        this.timeLeft = limitSec;
        timerBadge.style.display = "inline-block";
        timerBadge.innerText = this.timeLeft + "s";
        this.timerInterval = setInterval(function() {
          self.timeLeft--;
          timerBadge.innerText = self.timeLeft + "s";
          if (self.timeLeft <= 0) {
            clearInterval(self.timerInterval);
            const curQ = (window.Aetheria.QuizUI && window.Aetheria.QuizUI.currentQuestion) || { id: "timeout", answer: "逾時未答" };
            self.resolveTurn(false, curQ.answer || "逾時未答", curQ);
          }
        }, 1000);
      } else if (timerBadge) {
        timerBadge.style.display = "none";
      }

      const q = window.Aetheria.QuizBridge.pickQuestion({
        forceId: forceId,
        preferAdvanced: this.boostActive || (e && e.isBoss)
      });

      window.Aetheria.QuizUI.renderQuestion(q, function(isCorrect, correctText, qObj) {
        self.resolveTurn(isCorrect, correctText, qObj);
      });
    },

    showWrongAnswerReviewCard: function(correctText, qObj, onAcknowledge) {
      const area = document.getElementById("quiz-interactive-area");
      if (!area) {
        if (onAcknowledge) onAcknowledge();
        return;
      }

      const expHtml = (window.Aetheria.QuizBridge && window.Aetheria.QuizBridge.getExplanationHtml)
        ? window.Aetheria.QuizBridge.getExplanationHtml(qObj, correctText)
        : ("請記住正確答案：<b>" + correctText + "</b>");

      area.innerHTML =
        '<div class="review-card-box">' +
          '<div class="review-card-header">' +
            '<span>✗ 詠唱失誤・錯題溫習卡</span>' +
            '<span style="font-size:11px; color:#ffd166;">已自動收入錯題本</span>' +
          '</div>' +
          '<div class="review-ans-block">' +
            '✓ 正確答案：' + (correctText || (qObj && qObj.answer) || "") +
          '</div>' +
          '<div class="review-exp-block">' +
            expHtml +
          '</div>' +
          '<button class="na-btn review-confirm-btn" id="btn-confirm-learned">' +
            '✓ 我已溫習並記住答案，繼續 ▸' +
          '</button>' +
        '</div>';

      const confirmBtn = document.getElementById("btn-confirm-learned");
      if (confirmBtn) {
        confirmBtn.onclick = function() {
          window.Aetheria.Audio.sfxTalkBlip();
          if (onAcknowledge) onAcknowledge();
        };
      }
    },

    resolveTurn: function(isCorrect, correctText, qObj) {
      clearInterval(this.timerInterval);
      const s = window.Aetheria.State.data;
      const e = this.enemy;
      const self = this;

      if (qObj && qObj.id && qObj.id !== "timeout") {
        window.Aetheria.QuizBridge.recordAnswer(qObj.id, isCorrect);
        if (isCorrect && qObj.subject && s.monolithPts && typeof s.monolithPts[qObj.subject] === "number") {
          s.monolithPts[qObj.subject] = Math.min(100, s.monolithPts[qObj.subject] + 2);
        }
      }

      // 模式 0：v7.0 知識共鳴充飢檢定
      if (this.mode === "forage") {
        if (isCorrect) {
          this.playAttackAnimation();
          window.Aetheria.Audio.sfxLevelUp();
          window.Aetheria.State.restoreHunger(40, 25);
          s.inventory.rationHerb = (s.inventory.rationHerb || 0) + 1;
          window.Aetheria.State.save();
          window.Aetheria.UI.showToast("知識覓食成功！飽食度 +40%、HP +25，並額外覓得【烘烤微光菇乾 +1】！");
          this.endBattle();
        } else {
          window.Aetheria.Audio.sfxWrong();
          window.Aetheria.UI.spawnFloatingText("請先溫習下方解析", "#ff595e", false);
          this.showWrongAnswerReviewCard(correctText, qObj, function() {
            window.Aetheria.State.restoreHunger(20, 10);
            self.endBattle();
            window.Aetheria.UI.showToast("完成錯題溫習！獲得保底充飢：飽食度 +20%！");
          });
        }
        return;
      }

      // 模式 A：完美採集檢定
      if (this.mode === "harvest") {
        const node = this.harvestNodeRef || {};
        const matKey = node.giveKey || "mithril";
        const matObj = window.Aetheria.Data.MATERIALS[matKey] || { name: matKey };

        if (isCorrect) {
          this.playAttackAnimation();
          window.Aetheria.Audio.sfxLevelUp();
          s.inventory[matKey] = (s.inventory[matKey] || 0) + 1;
          const goldReward = (s.monolithPts && s.monolithPts.science >= 75) ? 100 : 50;
          window.Aetheria.State.gainRewards(45, goldReward, 12);
          window.Aetheria.UI.showToast("完美共鳴採集成功！獲得【" + matObj.name + " +1】與賞金 " + goldReward + " G！");
          this.endBattle();
        } else {
          if (this.harvestNodeRef) this.harvestNodeRef.opened = false;
          window.Aetheria.Audio.sfxWrong();
          window.Aetheria.UI.spawnFloatingText("採集失誤！請先溫習", "#ff595e", false);
          this.showWrongAnswerReviewCard(correctText, qObj, function() {
            self.endBattle();
            window.Aetheria.UI.showToast("已溫習完畢！可再次對準礦脈按 A 鍵重試。");
          });
        }
        return;
      }

      // 模式 B：NPC 旅人指令檢定
      if (this.mode === "path_inquire") {
        const ref = this.pathActionRef;
        if (isCorrect && ref && ref.action) {
          window.Aetheria.Audio.sfxLevelUp();
          ref.action.onSuccess(s);
          window.Aetheria.State.save();
          window.Aetheria.UI.showToast("旅人指令成功！" + stripEmoji(ref.action.rewardSummary));
          this.endBattle();
        } else {
          window.Aetheria.Audio.sfxWrong();
          window.Aetheria.UI.spawnFloatingText("檢定未通過！請先溫習", "#ff595e", false);
          this.showWrongAnswerReviewCard(correctText, qObj, function() {
            self.endBattle();
          });
        }
        return;
      }

      // 模式 C：投擲誘餌果收服戰寵
      if (this.mode === "tame_trial") {
        if (isCorrect) {
          const petId = e.tamePetId || "pet_fox";
          if (s.unlockedPets.indexOf(petId) === -1) s.unlockedPets.push(petId);
          if (e.isShiny && s.shinyPets.indexOf(petId) === -1) s.shinyPets.push(petId);
          s.activePet = petId;

          if (this.mapMonsterRef) this.mapMonsterRef.alive = false;
          window.Aetheria.Audio.sfxLevelUp();
          const petInfo = window.Aetheria.Data.PETS[petId];
          const shinyPrefix = e.isShiny ? "【異色閃光】" : "";
          window.Aetheria.State.gainRewards(e.expReward, e.goldReward, 20);
          window.Aetheria.UI.showToast("收服成功！" + shinyPrefix + (petInfo ? stripEmoji(petInfo.name) : "新戰寵") + " 已加入隊伍！");
          this.endBattle();
          return;
        } else {
          this.mode = "combat";
          const phaseTitle = document.getElementById("battle-phase-title");
          if (phaseTitle) phaseTitle.innerText = "破盾詠唱";
        }
      }

      // 模式 D：一般戰鬥 / 首領戰
      window.Aetheria.State.advanceTime(6);
      window.Aetheria.State.consumeHunger(1);

      if (isCorrect) {
        this.playAttackAnimation();

        let shieldDmg = 1 + window.Aetheria.State.getBonusShieldBreak();
        let dmgMult = 1.0;

        // v7.0 飽食度 >= 80% 時獲得「飽食強攻」加成
        if ((s.hunger !== undefined ? s.hunger : 100) >= 80) {
          dmgMult *= 1.10;
        }

        const wData = window.Aetheria.Data.WEAPONS[s.equippedWeapon] || {};

        if (s.currentJob === "scholar" && (qObj.type === "matching" || qObj.type === "image_fill" || qObj.type === "classify")) {
          shieldDmg += 1;
        }
        if (wData.spellBonus && (qObj.type === "eng_tile_spell" || qObj.type === "fill_blank" || qObj.type === "image_fill")) {
          dmgMult *= wData.spellBonus;
        }
        if (qObj.type === "eng_tile_spell") {
          dmgMult *= (s.currentJob === "archmage") ? 2.2 : 1.35;
          shieldDmg += 1;
        }

        if (s.activeMeal && s.activeMeal.battlesLeft > 0 && s.activeMeal.id === "meal_steak") {
          dmgMult *= 1.2;
        }

        if (this.guardActive) {
          dmgMult *= 0.55;
        }

        const mainPet = window.Aetheria.Data.PETS[s.activePet] || window.Aetheria.Data.PETS.pet_slime;
        const subPet = getHunterSubPet(s);

        if (this.boostActive && s.bp > 0) {
          dmgMult *= (1.5 + s.bp * 0.45);
          shieldDmg += 1;
          s.bp = 0;
          this.boostActive = false;
        } else {
          let bpGain = 1 + (wData.bpGainBonus || 0) + (this.guardActive ? 1 : 0);
          if (mainPet && mainPet.bpChance && Math.random() < mainPet.bpChance) bpGain += 1;
          if (subPet && subPet.bpChance && Math.random() < subPet.bpChance) bpGain += 1;
          s.bp = Math.min(s.maxBp, s.bp + bpGain);
        }

        let justBroken = false;
        if (!e.broken) {
          e.shield = Math.max(0, e.shield - shieldDmg);
          if (e.shield === 0) {
            e.broken = true;
            e.wasBroken = true;
            e.breakTurnsLeft = 2;
            justBroken = true;
            if (!s.bountyStats) s.bountyStats = { kills: 0, breaks: 0, fishes: 0, meals: 0 };
            s.bountyStats.breaks = (s.bountyStats.breaks || 0) + 1;
            window.Aetheria.Audio.sfxBreakShield();
            window.Aetheria.UI.spawnFloatingText("BREAK! 破防暈眩!", "#38b6ff", true);
          }
        }

        if (!justBroken) window.Aetheria.Audio.sfxAttackHit();

        if (e.broken) {
          dmgMult *= window.Aetheria.State.hasRune("coreDragon") ? 2.5 : 2.0;
        } else {
          dmgMult *= window.Aetheria.State.hasRune("coreGolem") ? 0.5 : 0.28;
        }

        const baseAtk = window.Aetheria.State.getTotalAtk();
        const heroDmg = Math.round(baseAtk * dmgMult);

        const hunterMult = (s.currentJob === "hunter") ? 2.0 : 1.0;
        const petRatio = (mainPet.bonusDmgRatio || 0.2) + (subPet ? (subPet.bonusDmgRatio || 0.2) : 0);
        const petDmg = Math.round(baseAtk * petRatio * hunterMult * (e.broken ? 1.0 : 0.4));
        const totalDmg = Math.max(1, heroDmg + petDmg);

        e.hp = Math.max(0, e.hp - totalDmg);

        let healAmt = (mainPet.healPerTurn || 0) + (subPet ? (subPet.healPerTurn || 0) : 0);
        if ((s.hunger !== undefined ? s.hunger : 100) >= 80) healAmt += 12;
        if (s.currentJob === "alchemist") healAmt += Math.round(s.maxHp * 0.15);
        if (s.equippedWeapon === "w_dawn") healAmt += Math.round(s.maxHp * 0.10);
        if (window.Aetheria.State.hasRune("coreBamboo")) healAmt += 20;
        if (s.activeMeal && s.activeMeal.battlesLeft > 0 && s.activeMeal.id === "meal_soup") healAmt += 15;
        if (window.Aetheria.State.hasRune("coreSkull")) healAmt += Math.round(totalDmg * 0.20);

        if (healAmt > 0) {
          s.hp = Math.min(s.maxHp, s.hp + healAmt);
        }

        if (s.currentJob === "thief" && Math.random() < 0.35) {
          s.inventory.iron += 1;
          window.Aetheria.UI.spawnFloatingText("盜取藍晶礦+1", "#5ac54f", false);
        }

        const passiveMsg = window.Aetheria.State.tickPassiveProduction();
        if (passiveMsg) window.Aetheria.UI.showToast(passiveMsg);

        window.Aetheria.UI.spawnFloatingText("-" + totalDmg, e.broken ? "#fbd000" : "#ffffff", true);
        this.updateBattleHUD();

        if (e.hp <= 0) {
          setTimeout(function() { self.winBattle(); }, 450);
        } else {
          setTimeout(function() { self.executeEnemyCounterPhase(true); }, 580);
        }
      } else {
        window.Aetheria.Audio.sfxWrong();
        this.updateBattleHUD();
        window.Aetheria.UI.spawnFloatingText("詠唱失誤！請先溫習下方解析", "#ff595e", false);

        this.showWrongAnswerReviewCard(correctText, qObj, function() {
          self.executeEnemyCounterPhase(false);
        });
      }
    },

    executeEnemyCounterPhase: function(answeredRight) {
      const s = window.Aetheria.State.data;
      const e = this.enemy;
      const self = this;
      if (!e || e.hp <= 0) return;

      if (e.broken) {
        e.breakTurnsLeft = (e.breakTurnsLeft || 1) - 1;
        if (e.breakTurnsLeft <= 0) {
          e.broken = false;
          e.shield = e.maxShield;
          window.Aetheria.UI.showToast(e.name + " 從破防中甦醒，重新展開了護盾！");
        }
      } else if (e.frozenTurns && e.frozenTurns > 0) {
        e.frozenTurns--;
        window.Aetheria.UI.spawnFloatingText("冰封凝滯!", "#8ce0ff", true);
      } else {
        this.playEnemyAttackAnimation();
        const upper = document.getElementById("upper-screen");
        if (upper) {
          upper.classList.add("shake");
          setTimeout(function() { upper.classList.remove("shake"); }, 280);
        }

        if (e.intent && e.intent.shieldHeal) {
          e.shield = Math.min(e.maxShield, e.shield + e.intent.shieldHeal);
        }

        const intentMult = (e.intent && e.intent.mult) ? e.intent.mult : 1.0;
        const rawAtk = Math.round((e.atk || 20) * intentMult);
        const heroDef = window.Aetheria.State.getTotalDef();

        let netDmg = Math.max(Math.round(rawAtk * 0.2), rawAtk - heroDef);

        if (!answeredRight) {
          netDmg = Math.round(netDmg * 1.3);
        } else if (this.guardActive) {
          netDmg = Math.max(1, Math.round(netDmg * 0.25));
          if (window.Aetheria.State.hasRune("coreSiren")) {
            const reflectDmg = e.atk || 25;
            e.hp = Math.max(0, e.hp - reflectDmg);
            window.Aetheria.UI.spawnFloatingText("水核反彈 -" + reflectDmg, "#38b6ff", true);
          }
        }

        s.hp = Math.max(0, s.hp - netDmg);
        window.Aetheria.UI.spawnFloatingText((this.guardActive && answeredRight ? "格擋 -" : "受擊 -") + netDmg, "#ff595e", false);

        if (e.hp <= 0) {
          this.updateBattleHUD();
          setTimeout(function() { self.winBattle(); }, 450);
          return;
        }

        if (s.hp <= 0) {
          if (s.monolithPts && s.monolithPts.humanities >= 100 && !this.revivedThisBattle) {
            this.revivedThisBattle = true;
            s.hp = Math.round(s.maxHp * 0.5);
            window.Aetheria.Audio.sfxLevelUp();
            window.Aetheria.UI.spawnFloatingText("聖碑神恩・不屈復活!", "#fbd000", false);
            window.Aetheria.UI.showToast("【紀元聖碑神恩】發動！在絕境中恢復 50% 生命值！");
          } else {
            this.updateBattleHUD();
            setTimeout(function() { self.loseBattle(); }, 600);
            return;
          }
        }
      }

      e.turnCount = (e.turnCount || 1) + 1;
      this.guardActive = false;
      e.intent = window.Aetheria.Data.rollNextIntent(e, e.turnCount);
      window.Aetheria.State.save();
      this.updateBattleHUD();

      setTimeout(function() { self.nextTurnQuestion(); }, 420);
    },

    loseBattle: function() {
      const s = window.Aetheria.State.data;
      window.Aetheria.Audio.sfxWrong();

      const lostGold = Math.floor((s.gold || 0) * 0.2);
      s.gold = Math.max(0, s.gold - lostGold);
      s.streak = 0;
      window.Aetheria.State.recalcMaxHp();
      s.hp = s.maxHp;
      s.hunger = Math.max(60, s.hunger || 60);

      window.Aetheria.Data.Maps.refreshAllResources();
      if (window.Aetheria.Renderer) window.Aetheria.Renderer.builtZoneKey = null;

      s.currentZone = "camp_hub";
      s.heroX = 320;
      s.heroY = 260;
      s.petX = 296;
      s.petY = 264;
      window.Aetheria.State.save();

      this.endBattle();
      window.Aetheria.UI.showToast("戰敗重傷！已送回【曙光營地】並損失 " + lostGold + " G！請先鍛造防具與料理再戰！");
    },

    winBattle: function() {
      const s = window.Aetheria.State.data;
      const e = this.enemy;
      const isNight = window.Aetheria.State.getTimePhase().isNight;

      window.Aetheria.Audio.sfxLevelUp();

      if (!s.bountyStats) s.bountyStats = { kills: 0, breaks: 0, fishes: 0, meals: 0 };
      s.bountyStats.kills = (s.bountyStats.kills || 0) + 1;
      s.bountyPoolSeed = (s.bountyPoolSeed || 1) + 1;
      s.bountyCooldowns = {};

      if (this.mode === "bounty") {
        s.wrongBountyKills = (s.wrongBountyKills || 0) + 1;
      }

      if (s.activeMeal && s.activeMeal.battlesLeft > 0) {
        s.activeMeal.battlesLeft--;
        if (s.activeMeal.battlesLeft <= 0) {
          s.activeMeal.id = null;
          window.Aetheria.State.recalcMaxHp();
        }
      }

      const normKey = e.normalDrop || "vine";
      s.inventory[normKey] = (s.inventory[normKey] || 0) + 1;
      let dropSummary = window.Aetheria.Data.MATERIALS[normKey].name + " +1";

      if (e.subDrop && window.Aetheria.Data.MATERIALS[e.subDrop]) {
        s.inventory[e.subDrop] = (s.inventory[e.subDrop] || 0) + 1;
        dropSummary += "、" + window.Aetheria.Data.MATERIALS[e.subDrop].name + " +1";
      }

      // v7.0：黑夜戰鬥除了破防必掉核心外，未破防亦有 45% 機率額外獲得破防核心
      const dropBreakCore = ((e.broken || e.wasBroken) || (isNight && Math.random() < 0.45)) && e.breakDrop;
      if (dropBreakCore) {
        s.inventory[e.breakDrop] = (s.inventory[e.breakDrop] || 0) + 1;
        dropSummary += "、破防核心【" + window.Aetheria.Data.MATERIALS[e.breakDrop].name + " +1】";
      }

      if (e.dropsTabletShard) {
        s.inventory.tabletShard = (s.inventory.tabletShard || 0) + 1;
        dropSummary += "、【古文明聖碑殘片 +1】";
      }

      if (e.bossId) {
        if (!s.clearedBosses) s.clearedBosses = {};
        s.clearedBosses[e.bossId] = true;
      }

      if (this.pathActionRef && this.pathActionRef.action) {
        this.pathActionRef.action.onSuccess(s);
        dropSummary += "、" + stripEmoji(this.pathActionRef.action.rewardSummary);
        this.pathActionRef = null;
      }

      const leveledUp = window.Aetheria.State.gainRewards(e.expReward, e.goldReward, e.isBoss ? 35 : 10);

      if (this.mapMonsterRef) {
        this.mapMonsterRef.alive = false;
      }

      if (e.bossId) {
        window.Aetheria.UI.showToast("擊潰守關領主！通往下一疆域的封印結界已解開！獲得：" + dropSummary);
      } else if (leveledUp) {
        window.Aetheria.UI.showToast("升級至 Lv." + s.lv + "（生命與飽食度全滿）！獲得 " + dropSummary + "！");
      } else {
        window.Aetheria.UI.showToast((isNight ? "🌙 夜戰勝利(獎賞+35%)！" : "戰鬥勝利！") + "獲得 " + dropSummary + "！");
      }

      this.endBattle();
    },

    fleeBattle: function() {
      const s = window.Aetheria.State.data;
      s.heroX = Math.max(40, s.heroX - 32);
      window.Aetheria.UI.showToast("投擲煙霧玉安全撤退！");
      this.endBattle();
    },

    endBattle: function() {
      clearInterval(this.timerInterval);
      this.active = false;
      document.getElementById("battle-stage").style.display = "none";

      const s = window.Aetheria.State.data;
      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
      window.Aetheria.Audio.playBgm(mapObj.bgm || "forest");

      window.Aetheria.UI.closePanelToExplore();
      window.Aetheria.UI.updateAllHud();
    }
  };

  window.Aetheria.Battle = BattleEngine;
})();
