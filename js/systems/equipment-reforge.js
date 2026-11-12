/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 鐵匠金幣詞條洗煉與營地領地升級模組 (equipment-reforge.js - v7.6)
 * 模組化獨立擴充檔：
 *   1. 為工坊新增【✨洗煉/領地】分頁，讓玩家消耗戰鬥與航海賺取的金幣（不影響任務素材採集）
 *   2. 支援武器與防具隨機洗煉 4 大稀有度（普通/稀有/史詩/傳說）共 12 種強大戰鬥與求生詞條
 *   3. 支援消耗金幣升級營地三大設施：【豪華行軍睡袋】、【秘銀料理鍋】與【鍍金順風船帆】
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  // ================= 1. 注入詞條稀有度色彩與洗煉介面 CSS =================
  function injectReforgeStyles() {
    if (document.getElementById("reforge-v76-styles")) return;
    const style = document.createElement("style");
    style.id = "reforge-v76-styles";
    style.textContent = `
      .affix-tag {
        display: inline-block;
        padding: 1px 6px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 900;
        margin-right: 4px;
        border: 1px solid #000;
      }
      .affix-tier-1 { background: #1e3a2f; color: #5ac54f; border-color: #5ac54f; }
      .affix-tier-2 { background: #102542; color: #8ce0ff; border-color: #38b6ff; }
      .affix-tier-3 { background: #2d1442; color: #e0aaff; border-color: #9d4edd; }
      .affix-tier-4 {
        background: linear-gradient(90deg, #5c3824 0%, #8f563b 100%);
        color: #ffd166;
        border-color: #f5b700;
        box-shadow: 0 0 6px rgba(245, 183, 0, 0.65);
      }
      .reforge-card {
        background: #181316;
        border: 2px solid #8f563b;
        border-radius: 6px;
        padding: 8px 10px;
        margin-bottom: 6px;
      }
      .reforge-card.legendary {
        border-color: #f5b700;
        background: linear-gradient(135deg, #1c1619 0%, #2b2112 100%);
      }
    `;
    document.head.appendChild(style);
  }

  // ================= 2. 定義武器與防具洗煉詞條庫 =================
  const WEAPON_AFFIXES = [
    { id: "w_sharp",   name: "鋒利之", tier: 1, tierName: "普通", weight: 30, atkMult: 1.10, desc: "基礎攻擊力 +10%" },
    { id: "w_vital",   name: "生機之", tier: 2, tierName: "稀有", weight: 24, atkMult: 1.12, healOnHit: 18, desc: "攻擊力 +12%，每次答對恢復 +18 HP" },
    { id: "w_night",   name: "夜獵之", tier: 3, tierName: "史詩", weight: 18, atkMult: 1.18, nightBonus: 1.30, desc: "攻擊力 +18%，黑夜戰鬥傷害額外 +30%" },
    { id: "w_gale",    name: "疾風之", tier: 3, tierName: "史詩", weight: 15, atkMult: 1.15, extraBp: 1, desc: "攻擊力 +15%，每次答對額外充能 +1 顆 BP" },
    { id: "w_breaker", name: "破曉之", tier: 4, tierName: "傳說", weight: 8,  atkMult: 1.25, extraBreak: 1, desc: "【傳說】攻擊力 +25%，每次答對額外削盾 +1！" },
    { id: "w_vamp",    name: "龍魂之", tier: 4, tierName: "傳說", weight: 5,  atkMult: 1.28, healOnHit: 35, desc: "【傳說】攻擊力 +28%，每次答對恢復 +35 HP！" }
  ];

  const ARMOR_AFFIXES = [
    { id: "a_sturdy",  name: "堅固之", tier: 1, tierName: "普通", weight: 30, defMult: 1.12, hpFlat: 30,  desc: "防禦力 +12%，最大生命 +30" },
    { id: "a_satiety", name: "飽食之", tier: 2, tierName: "稀有", weight: 24, defMult: 1.12, saveHunger: true, desc: "防禦力 +12%，野外移動與採集有 50% 機率不耗飽食度" },
    { id: "a_scholar", name: "博學之", tier: 3, tierName: "史詩", weight: 18, defMult: 1.18, expGoldBonus: 0.25, desc: "防禦力 +18%，戰鬥經驗與金幣獎勵 +25%" },
    { id: "a_thorn",   name: "荊棘之", tier: 3, tierName: "史詩", weight: 15, defMult: 1.20, reflectRatio: 0.45, desc: "防禦力 +20%，受擊時自動反彈敵人 45% 攻擊傷害" },
    { id: "a_immort",  name: "不朽之", tier: 4, tierName: "傳說", weight: 8,  defMult: 1.28, hpFlat: 130, desc: "【傳說】防禦力 +28%，最大生命 +130！" },
    { id: "a_aegis",   name: "聖佑之", tier: 4, tierName: "傳說", weight: 5,  defMult: 1.25, hpFlat: 90, saveHunger: true, desc: "【傳說】防禦+25%、HP+90，且飽食消耗減半！" }
  ];

  // 營地領地升級項目
  const CAMP_UPGRADES = {
    bedLv: {
      id: "bedLv",
      name: "豪華羽絨行軍睡袋",
      icon: "sleeping_bag",
      maxLv: 3,
      costs: { 1: 120, 2: 280, 3: 550 },
      descs: {
        0: "尚未升級（睡醒獲得 3 場晨間活力）。",
        1: "Lv.1 保暖絨墊：睡醒獲得 4 場【晨間活力】，並自動獲贈【微光菇乾 x1】！",
        2: "Lv.2 秘銀暖爐睡袋：睡醒獲得 5 場【晨間活力】，並獲贈【微光菇乾 x2】！",
        3: "Lv.3 皇家破曉行軍床：睡醒獲得 6 場【晨間活力】、開局 BP+1，並獲贈【炭烤鮮魚乾 x1】！"
      }
    },
    potLv: {
      id: "potLv",
      name: "秘銀高壓料理鍋",
      icon: "icon_potion",
      maxLv: 3,
      costs: { 1: 150, 2: 320, 3: 600 },
      descs: {
        0: "尚未升級（營地料理效果持續 3 場戰鬥）。",
        1: "Lv.1 厚底銅鍋：營地料理效果延長至 4 場戰鬥！",
        2: "Lv.2 秘銀湯鍋：營地料理效果延長至 5 場戰鬥，且烤口糧 35% 機率額外多產出 1 份！",
        3: "Lv.3 龍焰神廚鍋：營地料理效果延長至 6 場戰鬥，且烤口糧 60% 機率額外多產出 1 份！"
      }
    },
    sailLv: {
      id: "sailLv",
      name: "鍍金順風船帆與打撈網",
      icon: "ship_galleon",
      maxLv: 3,
      costs: { 1: 180, 2: 380, 3: 700 },
      descs: {
        0: "尚未升級（標準海上航行速度與打撈收穫）。",
        1: "Lv.1 順風副帆：海上開船速度 +12%，打撈漂流桶金幣 +25 G！",
        2: "Lv.2 秘銀打撈網：海上開船速度 +20%，打撈漂流桶有更高機率出【流沙秘銀】！",
        3: "Lv.3 星辰領航帆：海上開船速度 +28%，打撈漂流桶高機率額外獲【古航海圖殘卷】！"
      }
    }
  };

  function rollWeightedAffix(pool, currentId) {
    const candidates = pool.filter(function(a) { return a.id !== currentId; });
    const list = candidates.length > 0 ? candidates : pool;
    let totalW = 0;
    list.forEach(function(a) { totalW += a.weight; });
    let r = Math.random() * totalW;
    for (let i = 0; i < list.length; i++) {
      r -= list[i].weight;
      if (r <= 0) return list[i];
    }
    return list[0];
  }

  function getWeaponAffixObj(s, wId) {
    if (!s || !s.weaponAffixes || !wId) return null;
    const afId = s.weaponAffixes[wId];
    return WEAPON_AFFIXES.find(function(a) { return a.id === afId; }) || null;
  }

  function getArmorAffixObj(s, aId) {
    if (!s || !s.armorAffixes || !aId) return null;
    const afId = s.armorAffixes[aId];
    return ARMOR_AFFIXES.find(function(a) { return a.id === afId; }) || null;
  }

  // ================= 3. 洗煉與領地升級互動邏輯 =================
  const ReforgeManager = {
    reRollWeapon: function(wId, goldCost) {
      const s = window.Aetheria.State.data;
      if (s.gold < goldCost) {
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.showToast("金幣不足！洗煉需要 " + goldCost + " G。");
        return;
      }
      if (!s.weaponAffixes) s.weaponAffixes = {};
      s.gold -= goldCost;

      const picked = rollWeightedAffix(WEAPON_AFFIXES, s.weaponAffixes[wId]);
      s.weaponAffixes[wId] = picked.id;

      if (picked.tier >= 3) window.Aetheria.Audio.sfxLevelUp();
      else window.Aetheria.Audio.sfxGather();

      window.Aetheria.State.save();
      window.Aetheria.UI.openForgeModal("reforge");
      window.Aetheria.UI.updateAllHud();

      const wObj = window.Aetheria.Data.WEAPONS[wId] || { name: "武器" };
      window.Aetheria.UI.showToast("✨ 洗煉成功！獲得【" + picked.name + wObj.name + "】(" + picked.desc + ")！");
    },

    reRollArmor: function(aId, goldCost) {
      const s = window.Aetheria.State.data;
      if (s.gold < goldCost) {
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.showToast("金幣不足！洗煉需要 " + goldCost + " G。");
        return;
      }
      if (!s.armorAffixes) s.armorAffixes = {};
      s.gold -= goldCost;

      const picked = rollWeightedAffix(ARMOR_AFFIXES, s.armorAffixes[aId]);
      s.armorAffixes[aId] = picked.id;

      window.Aetheria.State.recalcMaxHp();
      if (picked.tier >= 3) window.Aetheria.Audio.sfxLevelUp();
      else window.Aetheria.Audio.sfxGather();

      window.Aetheria.State.save();
      window.Aetheria.UI.openForgeModal("reforge");
      window.Aetheria.UI.updateAllHud();

      const aObj = window.Aetheria.Data.ARMORS[aId] || { name: "防具" };
      window.Aetheria.UI.showToast("✨ 洗煉成功！獲得【" + picked.name + aObj.name + "】(" + picked.desc + ")！");
    },

    upgradeCampFacility: function(upKey) {
      const s = window.Aetheria.State.data;
      if (!s.campUpgrades) s.campUpgrades = { bedLv: 0, potLv: 0, sailLv: 0 };
      const def = CAMP_UPGRADES[upKey];
      if (!def) return;

      const curLv = s.campUpgrades[upKey] || 0;
      if (curLv >= def.maxLv) return;

      const nextLv = curLv + 1;
      const cost = def.costs[nextLv] || 200;

      if (s.gold < cost) {
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.showToast("金幣不足！升級【" + def.name + "】需要 " + cost + " G。");
        return;
      }

      s.gold -= cost;
      s.campUpgrades[upKey] = nextLv;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      window.Aetheria.UI.openForgeModal("reforge");
      window.Aetheria.UI.updateAllHud();
      window.Aetheria.UI.showToast("🏕️ 領地升級成功！【" + def.name + "】已升至 Lv." + nextLv + "！");
    },

    renderReforgeTab: function(body) {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      if (!s.weaponAffixes) s.weaponAffixes = {};
      if (!s.armorAffixes) s.armorAffixes = {};
      if (!s.campUpgrades) s.campUpgrades = { bedLv: 0, potLv: 0, sailLv: 0 };

      const intro = document.createElement("div");
      intro.className = "sys-card-scroll";
      intro.innerHTML =
        '<b>✨ 巴爾的黃金詞條重鑄爐 & 營地建設 (持有金幣：' + s.gold + ' G)</b>' +
        '<div style="font-size:12px; color:#5c3824; margin-top:2px;">' +
          '消耗金幣為當前裝備的<b>武器與防具</b>隨機刷出稀有詞條（普通 ➔ 稀有 ➔ 史詩 ➔ 傳說），或升級營地設施！' +
        '</div>';
      body.appendChild(intro);

      // 1. 當前裝備武器洗煉卡
      const eqWId = s.equippedWeapon;
      const wObj = eqWId ? window.Aetheria.Data.WEAPONS[eqWId] : null;
      if (wObj) {
        const wAf = getWeaponAffixObj(s, eqWId);
        const wCost = 60 + (wObj.tier || 1) * 20;
        const canPayW = s.gold >= wCost;

        const wCard = document.createElement("div");
        wCard.className = "reforge-card" + (wAf && wAf.tier === 4 ? " legendary" : "");
        wCard.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<div>' +
              '<b>' + S.iconHtml("icon_sword") + (wAf ? ('<span class="affix-tag affix-tier-' + wAf.tier + '">' + wAf.tierName + '</span>【' + wAf.name + wObj.name + '】') : ('【' + wObj.name + '】(未洗煉)')) + '</b>' +
              '<div style="font-size:12px; color:#ffd166; margin-top:3px;">當前詞條：' + (wAf ? wAf.desc : '尚無詞條，點擊右側按鈕開始洗煉！') + '</div>' +
            '</div>' +
            '<button class="na-btn ' + (canPayW ? 'highlight' : '') + '" style="padding:6px 10px; white-space:nowrap;" onclick="Aetheria.Reforge.reRollWeapon(\'' + eqWId + '\', ' + wCost + ')">洗煉 (' + wCost + 'G)</button>' +
          '</div>';
        body.appendChild(wCard);
      }

      // 2. 當前穿戴防具洗煉卡
      const eqAId = s.equippedArmor || "a_cloth";
      const aObj = window.Aetheria.Data.ARMORS[eqAId];
      if (aObj) {
        const aAf = getArmorAffixObj(s, eqAId);
        const aCost = 60 + (aObj.tier || 1) * 25;
        const canPayA = s.gold >= aCost;

        const aCard = document.createElement("div");
        aCard.className = "reforge-card" + (aAf && aAf.tier === 4 ? " legendary" : "");
        aCard.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<div>' +
              '<b>' + S.iconHtml("icon_shield") + (aAf ? ('<span class="affix-tag affix-tier-' + aAf.tier + '">' + aAf.tierName + '</span>【' + aAf.name + aObj.name + '】') : ('【' + aObj.name + '】(未洗煉)')) + '</b>' +
              '<div style="font-size:12px; color:#8ce0ff; margin-top:3px;">當前詞條：' + (aAf ? aAf.desc : '尚無詞條，點擊右側按鈕開始洗煉！') + '</div>' +
            '</div>' +
            '<button class="na-btn ' + (canPayA ? 'highlight' : '') + '" style="padding:6px 10px; white-space:nowrap;" onclick="Aetheria.Reforge.reRollArmor(\'' + eqAId + '\', ' + aCost + ')">洗煉 (' + aCost + 'G)</button>' +
          '</div>';
        body.appendChild(aCard);
      }

      // 3. 營地三大領地設施金幣升級
      const campHeader = document.createElement("div");
      campHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:10px 0 4px; font-size:13px;";
      campHeader.innerText = "【營地領地設施升級（永久生效）】";
      body.appendChild(campHeader);

      Object.values(CAMP_UPGRADES).forEach(function(up) {
        const curLv = (s.campUpgrades && s.campUpgrades[up.id]) || 0;
        const isMax = curLv >= up.maxLv;
        const nextCost = up.costs[curLv + 1] || 0;
        const canUp = !isMax && s.gold >= nextCost;

        const uCard = document.createElement("div");
        uCard.className = "sys-card";
        uCard.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<b>' + S.iconHtml(up.icon, true) + up.name + ' <span class="stat-pill">Lv.' + curLv + '/' + up.maxLv + '</span></b>' +
            (isMax
              ? '<span style="color:#5ac54f; font-weight:900;">★ 已滿級</span>'
              : '<button class="na-btn ' + (canUp ? 'highlight' : '') + '" style="padding:4px 10px;" onclick="Aetheria.Reforge.upgradeCampFacility(\'' + up.id + '\')">升級 (' + nextCost + 'G)</button>') +
          '</div>' +
          '<div style="font-size:11.5px; color:#cbd5e1; margin-top:3px;">當前效果：' + up.descs[curLv] + '</div>' +
          (!isMax ? '<div style="font-size:11.5px; color:#ffd166; margin-top:2px;">下一級 Lv.' + (curLv + 1) + '：' + up.descs[curLv + 1] + '</div>' : '');
        body.appendChild(uCard);
      });
    }
  };

  window.Aetheria.Reforge = ReforgeManager;

  // ================= 4. 掛載詞條戰鬥加成、飽食度減免與領地升級效果 =================
  function hookSystemsForReforge() {
    const St  = window.Aetheria.State;
    const UI  = window.Aetheria.UI;
    const Bat = window.Aetheria.Battle;
    const Surv = window.Aetheria.Survival;

    if (St) {
      // 1. 武器攻擊力詞條加成
      const origAtk = St.getTotalAtk.bind(St);
      St.getTotalAtk = function() {
        let atk = origAtk();
        const s = this.data;
        const wAf = getWeaponAffixObj(s, s.equippedWeapon);
        if (wAf && wAf.atkMult) {
          atk = Math.round(atk * wAf.atkMult);
        }
        return atk;
      };

      // 2. 防具防禦力詞條加成
      const origDef = St.getTotalDef.bind(St);
      St.getTotalDef = function() {
        let def = origDef();
        const s = this.data;
        const aAf = getArmorAffixObj(s, s.equippedArmor);
        if (aAf && aAf.defMult) {
          def = Math.round(def * aAf.defMult);
        }
        return def;
      };

      // 3. 防具最大生命值詞條加成
      const origMaxHp = St.recalcMaxHp.bind(St);
      St.recalcMaxHp = function() {
        origMaxHp();
        const s = this.data;
        const aAf = getArmorAffixObj(s, s.equippedArmor);
        if (aAf && aAf.hpFlat) {
          s.maxHp += aAf.hpFlat;
          if (s.hp > s.maxHp) s.hp = s.maxHp;
        }
      };

      // 4. 武器額外削盾詞條加成
      const origBreak = St.getBonusShieldBreak.bind(St);
      St.getBonusShieldBreak = function() {
        let b = origBreak();
        const s = this.data;
        const wAf = getWeaponAffixObj(s, s.equippedWeapon);
        if (wAf && wAf.extraBreak) b += wAf.extraBreak;
        return b;
      };

      // 5. 防具【飽食之 / 聖佑之】詞條：50% 機率免消耗飽食度
      const origHunger = St.consumeHunger.bind(St);
      St.consumeHunger = function(amount) {
        const s = this.data;
        const aAf = getArmorAffixObj(s, s.equippedArmor);
        if (aAf && aAf.saveHunger && Math.random() < 0.50) {
          return (s.hunger || 0) > 0;
        }
        return origHunger(amount);
      };

      // 6. 防具【博學之】詞條：經驗與金幣額外 +25%
      const origRewards = St.gainRewards.bind(St);
      St.gainRewards = function(expGain, goldGain, guildPtsGain) {
        const s = this.data;
        const aAf = getArmorAffixObj(s, s.equippedArmor);
        if (aAf && aAf.expGoldBonus) {
          expGain = Math.round((expGain || 0) * (1 + aAf.expGoldBonus));
          goldGain = Math.round((goldGain || 0) * (1 + aAf.expGoldBonus));
        }
        return origRewards(expGain, goldGain, guildPtsGain);
      };
    }

    // 7. 戰鬥中觸發詞條效果（答對回血、額外 BP、夜獵增傷、荊棘反彈）
    if (Bat) {
      const origResolve = Bat.resolveTurn.bind(Bat);
      Bat.resolveTurn = function(isCorrect, correctText, qObj) {
        const s = window.Aetheria.State.data;
        const e = this.enemy;
        const wAf = getWeaponAffixObj(s, s.equippedWeapon);

        if (isCorrect && this.mode === "combat" && e && wAf) {
          if (wAf.healOnHit) {
            s.hp = Math.min(s.maxHp, s.hp + wAf.healOnHit);
          }
          if (wAf.extraBp && !this.boostActive) {
            s.bp = Math.min(s.maxBp, (s.bp || 0) + wAf.extraBp);
          }
          if (wAf.nightBonus && window.Aetheria.State.getTimePhase().isNight) {
            const nightExtra = Math.round(window.Aetheria.State.getTotalAtk() * 0.30);
            e.hp = Math.max(1, e.hp - nightExtra);
          }
        }
        origResolve(isCorrect, correctText, qObj);
      };

      const origCounter = Bat.executeEnemyCounterPhase.bind(Bat);
      Bat.executeEnemyCounterPhase = function(answeredRight) {
        const s = window.Aetheria.State.data;
        const e = this.enemy;
        const aAf = getArmorAffixObj(s, s.equippedArmor);
        if (e && !e.broken && !(e.frozenTurns > 0) && aAf && aAf.reflectRatio) {
          const refDmg = Math.max(1, Math.round((e.atk || 20) * aAf.reflectRatio));
          e.hp = Math.max(1, e.hp - refDmg);
          window.Aetheria.UI.spawnFloatingText("荊棘反傷 -" + refDmg, "#e0aaff", true);
        }
        origCounter(answeredRight);
      };
    }

    // 8. 掛載工坊第 6 分頁【✨洗煉】、以及領地升級對料理鍋和睡袋的強化
    if (UI) {
      const origOpenForge = UI.openForgeModal.bind(UI);
      UI.openForgeModal = function(activeTab) {
        origOpenForge(activeTab);

        const body = document.getElementById("modal-body");
        if (!body) return;
        const tabBar = body.querySelector(".tab-bar-5");
        if (tabBar) {
          tabBar.style.gridTemplateColumns = "repeat(3, 1fr)";
          const refBtn = document.createElement("button");
          refBtn.className = "na-btn" + (activeTab === "reforge" ? " highlight" : "");
          refBtn.style.fontSize = "12px";
          refBtn.innerText = "✨洗煉/領地";
          refBtn.onclick = function() { UI.openForgeModal("reforge"); };
          tabBar.appendChild(refBtn);
        }

        if (activeTab === "reforge") {
          while (body.children.length > 1) {
            body.removeChild(body.lastChild);
          }
          ReforgeManager.renderReforgeTab(body);
        }
      };

      // 秘銀高壓料理鍋升級加成
      const origCook = UI.cookCampMeal.bind(UI);
      UI.cookCampMeal = function(mealId) {
        origCook(mealId);
        const s = window.Aetheria.State.data;
        const potLv = (s.campUpgrades && s.campUpgrades.potLv) || 0;
        if (potLv > 0 && s.activeMeal && s.activeMeal.id === mealId) {
          s.activeMeal.battlesLeft = 3 + potLv;
          window.Aetheria.State.save();
          UI.openCookingModal();
          UI.updateAllHud();
        }
      };

      const origRoast = UI.roastRationAtPot.bind(UI);
      UI.roastRationAtPot = function(wkId) {
        origRoast(wkId);
        const s = window.Aetheria.State.data;
        const potLv = (s.campUpgrades && s.campUpgrades.potLv) || 0;
        const procChance = (potLv >= 3) ? 0.60 : (potLv === 2) ? 0.35 : 0;
        if (procChance > 0 && Math.random() < procChance) {
          const toKey = (wkId === "wk_ration_fish") ? "rationFish" : "rationHerb";
          s.inventory[toKey] = (s.inventory[toKey] || 0) + 1;
          window.Aetheria.State.save();
          UI.openCookingModal();
          UI.updateAllHud();
          UI.showToast("🍲 秘銀料理鍋暴擊！額外多烘烤出 1 份口糧！");
        }
      };
    }

    // 豪華睡袋升級加成
    if (Surv && Surv.playSleepToMorning) {
      const origSleep = Surv.playSleepToMorning.bind(Surv);
      Surv.playSleepToMorning = function() {
        origSleep();
        setTimeout(function() {
          const s = window.Aetheria.State.data;
          const bedLv = (s.campUpgrades && s.campUpgrades.bedLv) || 0;
          if (bedLv > 0) {
            s.wellRestedBattles = 3 + bedLv;
            if (bedLv >= 3) {
              s.bp = Math.min(s.maxBp, (s.bp || 0) + 1);
              s.inventory.rationFish = (s.inventory.rationFish || 0) + 1;
            } else {
              s.inventory.rationHerb = (s.inventory.rationHerb || 0) + bedLv;
            }
            window.Aetheria.State.save();
            window.Aetheria.UI.updateAllHud();
          }
        }, 1500);
      };
    }
  }

  function initReforgeModule() {
    try {
      injectReforgeStyles();
      hookSystemsForReforge();
    } catch (err) {
      console.error("Equipment Reforge v7.6 init error:", err);
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(initReforgeModule, 80);
  } else {
    window.addEventListener("load", function() {
      setTimeout(initReforgeModule, 80);
    });
  }
})();
