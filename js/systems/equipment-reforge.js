/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 隨身工坊、高階金幣洗煉機率與領地升級模組 (equipment-reforge.js - v7.7)
 * 修改重點：
 *   1. 【隨身工坊】：解除營地區域限制，在任何地圖點擊【工坊】均可直接鍛造、升級工具、加工與洗煉
 *   2. 【提高金幣消耗】：洗煉費用提升至 320G~800G/次；營地領地升級費用提升至 500G~3500G
 *   3. 【調降稀有至傳說機率】：普通 72% ｜ 稀有 18% ｜ 史詩 8% ｜ 傳說 2%
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  // ================= 1. 注入詞條稀有度色彩與洗煉介面 CSS =================
  function injectReforgeStyles() {
    if (document.getElementById("reforge-v77-styles")) return;
    const style = document.createElement("style");
    style.id = "reforge-v77-styles";
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

  // ================= 2. 定義武器與防具洗煉詞條庫（普通72% / 稀有18% / 史詩8% / 傳說2%） =================
  const WEAPON_AFFIXES = [
    // 普通 (Tier 1) — 總權重 72%
    { id: "w_sharp1",  name: "磨石之", tier: 1, tierName: "普通", weight: 28,  atkMult: 1.05, desc: "基礎攻擊力 +5%" },
    { id: "w_sharp2",  name: "鋒利之", tier: 1, tierName: "普通", weight: 24,  atkMult: 1.08, desc: "基礎攻擊力 +8%" },
    { id: "w_sharp3",  name: "精鋼之", tier: 1, tierName: "普通", weight: 20,  atkMult: 1.10, desc: "基礎攻擊力 +10%" },
    // 稀有 (Tier 2) — 總權重 18%
    { id: "w_vital",   name: "生機之", tier: 2, tierName: "稀有", weight: 18,  atkMult: 1.12, healOnHit: 16, desc: "攻擊力 +12%，每次答對恢復 +16 HP" },
    // 史詩 (Tier 3) — 總權重 8%
    { id: "w_night",   name: "夜獵之", tier: 3, tierName: "史詩", weight: 4.5, atkMult: 1.16, nightBonus: 1.25, desc: "攻擊力 +16%，黑夜戰鬥傷害額外 +25%" },
    { id: "w_gale",    name: "疾風之", tier: 3, tierName: "史詩", weight: 3.5, atkMult: 1.15, extraBp: 1, desc: "攻擊力 +15%，每次答對額外充能 +1 顆 BP" },
    // 傳說 (Tier 4) — 總權重 2%
    { id: "w_breaker", name: "破曉之", tier: 4, tierName: "傳說", weight: 1.2, atkMult: 1.25, extraBreak: 1, desc: "【傳說】攻擊力 +25%，每次答對額外削盾 +1！" },
    { id: "w_vamp",    name: "龍魂之", tier: 4, tierName: "傳說", weight: 0.8, atkMult: 1.28, healOnHit: 35, desc: "【傳說】攻擊力 +28%，每次答對恢復 +35 HP！" }
  ];

  const ARMOR_AFFIXES = [
    // 普通 (Tier 1) — 總權重 72%
    { id: "a_sturdy1", name: "粗布之", tier: 1, tierName: "普通", weight: 28,  defMult: 1.05, hpFlat: 15,  desc: "防禦力 +5%，最大生命 +15" },
    { id: "a_sturdy2", name: "堅固之", tier: 1, tierName: "普通", weight: 24,  defMult: 1.08, hpFlat: 25,  desc: "防禦力 +8%，最大生命 +25" },
    { id: "a_sturdy3", name: "厚甲之", tier: 1, tierName: "普通", weight: 20,  defMult: 1.10, hpFlat: 35,  desc: "防禦力 +10%，最大生命 +35" },
    // 稀有 (Tier 2) — 總權重 18%
    { id: "a_satiety", name: "飽食之", tier: 2, tierName: "稀有", weight: 18,  defMult: 1.12, saveHunger: true, desc: "防禦力 +12%，野外移動與採集有 50% 機率不耗飽食度" },
    // 史詩 (Tier 3) — 總權重 8%
    { id: "a_scholar", name: "博學之", tier: 3, tierName: "史詩", weight: 4.5, defMult: 1.16, expGoldBonus: 0.20, desc: "防禦力 +16%，戰鬥經驗與金幣獎勵 +20%" },
    { id: "a_thorn",   name: "荊棘之", tier: 3, tierName: "史詩", weight: 3.5, defMult: 1.18, reflectRatio: 0.40, desc: "防禦力 +18%，受擊時自動反彈敵人 40% 攻擊傷害" },
    // 傳說 (Tier 4) — 總權重 2%
    { id: "a_immort",  name: "不朽之", tier: 4, tierName: "傳說", weight: 1.2, defMult: 1.28, hpFlat: 130, desc: "【傳說】防禦力 +28%，最大生命 +130！" },
    { id: "a_aegis",   name: "聖佑之", tier: 4, tierName: "傳說", weight: 0.8, defMult: 1.25, hpFlat: 90, saveHunger: true, desc: "【傳說】防禦+25%、HP+90，且飽食消耗減半！" }
  ];

  // 營地領地升級項目（提高金幣門檻）
  const CAMP_UPGRADES = {
    bedLv: {
      id: "bedLv",
      name: "豪華羽絨行軍睡袋",
      icon: "sleeping_bag",
      maxLv: 3,
      costs: { 1: 500, 2: 1200, 3: 2500 },
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
      costs: { 1: 600, 2: 1400, 3: 2800 },
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
      costs: { 1: 800, 2: 1800, 3: 3500 },
      descs: {
        0: "尚未升級（標準海上航行速度與打撈收穫）。",
        1: "Lv.1 順風副帆：海上開船速度 +12%，打撈漂流桶金幣 +25 G！",
        2: "Lv.2 秘銀打撈網：海上開船速度 +20%，打撈漂流桶有更高機率出【流沙秘銀】！",
        3: "Lv.3 星辰領航帆：海上開船速度 +28%，打撈漂流桶高機率額外獲【古航海圖殘卷】！"
      }
    }
  };

  // 嚴格按照 72% / 18% / 8% / 2% 獨立權重抽取（若抽中同階同詞條則於同階內輪換，絕不灌水高階機率）
  function rollWeightedAffix(pool, currentId) {
    let totalW = 0;
    pool.forEach(function(a) { totalW += a.weight; });
    let r = Math.random() * totalW;
    let picked = pool[0];
    for (let i = 0; i < pool.length; i++) {
      r -= pool[i].weight;
      if (r <= 0) {
        picked = pool[i];
        break;
      }
    }
    if (picked.id === currentId) {
      const sameTierOthers = pool.filter(function(a) { return a.tier === picked.tier && a.id !== currentId; });
      if (sameTierOthers.length > 0) {
        picked = sameTierOthers[Math.floor(Math.random() * sameTierOthers.length)];
      }
    }
    return picked;
  }

  function getWeaponAffixObj(s, wId) {
    if (!s || !s.weaponAffixes || !wId) return null;
    let afId = s.weaponAffixes[wId];
    if (afId === "w_sharp") afId = "w_sharp3"; // 兼容舊存檔
    return WEAPON_AFFIXES.find(function(a) { return a.id === afId; }) || null;
  }

  function getArmorAffixObj(s, aId) {
    if (!s || !s.armorAffixes || !aId) return null;
    let afId = s.armorAffixes[aId];
    if (afId === "a_sturdy") afId = "a_sturdy3"; // 兼容舊存檔
    return ARMOR_AFFIXES.find(function(a) { return a.id === afId; }) || null;
  }

  // ================= 3. 洗煉與領地升級互動邏輯 =================
  const ReforgeManager = {
    reRollWeapon: function(wId, goldCost) {
      const s = window.Aetheria.State.data;
      if (s.gold < goldCost) {
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.showToast("金幣不足！洗煉此武器需要 " + goldCost + " G。");
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
      window.Aetheria.UI.showToast("✨ 洗煉結果：獲得[" + picked.tierName + "]【" + picked.name + wObj.name + "】(" + picked.desc + ")！");
    },

    reRollArmor: function(aId, goldCost) {
      const s = window.Aetheria.State.data;
      if (s.gold < goldCost) {
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.showToast("金幣不足！洗煉此防具需要 " + goldCost + " G。");
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
      window.Aetheria.UI.showToast("✨ 洗煉結果：獲得[" + picked.tierName + "]【" + picked.name + aObj.name + "】(" + picked.desc + ")！");
    },

    upgradeCampFacility: function(upKey) {
      const s = window.Aetheria.State.data;
      if (!s.campUpgrades) s.campUpgrades = { bedLv: 0, potLv: 0, sailLv: 0 };
      const def = CAMP_UPGRADES[upKey];
      if (!def) return;

      const curLv = s.campUpgrades[upKey] || 0;
      if (curLv >= def.maxLv) return;

      const nextLv = curLv + 1;
      const cost = def.costs[nextLv] || 500;

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
        '<b>✨ 巴爾的黃金詞條重鑄爐 & 領地升級 (持有金幣：' + s.gold + ' G)</b>' +
        '<div style="font-size:11.5px; color:#5c3824; margin-top:2px;">' +
          '洗煉機率：<b style="color:#2d6a4f;">普通 72%</b> ｜ <b style="color:#1d5eb8;">稀有 18%</b> ｜ <b style="color:#7209b7;">史詩 8%</b> ｜ <b style="color:#d97706;">傳說 2%</b>' +
        '</div>';
      body.appendChild(intro);

      // 1. 當前裝備武器洗煉卡（費用：200 + 階級 * 120）
      const eqWId = s.equippedWeapon;
      const wObj = eqWId ? window.Aetheria.Data.WEAPONS[eqWId] : null;
      if (wObj) {
        const wAf = getWeaponAffixObj(s, eqWId);
        const wCost = 200 + (wObj.tier || 1) * 120;
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

      // 2. 當前穿戴防具洗煉卡（費用：200 + 階級 * 120）
      const eqAId = s.equippedArmor || "a_cloth";
      const aObj = window.Aetheria.Data.ARMORS[eqAId];
      if (aObj) {
        const aAf = getArmorAffixObj(s, eqAId);
        const aCost = 200 + (aObj.tier || 1) * 120;
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

  // ================= 4. 掛載隨身工坊、詞條戰鬥加成與領地升級效果 =================
  function hookSystemsForReforge() {
    const St   = window.Aetheria.State;
    const UI   = window.Aetheria.UI;
    const Bat  = window.Aetheria.Battle;
    const Surv = window.Aetheria.Survival;

    if (St) {
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

      const origBreak = St.getBonusShieldBreak.bind(St);
      St.getBonusShieldBreak = function() {
        let b = origBreak();
        const s = this.data;
        const wAf = getWeaponAffixObj(s, s.equippedWeapon);
        if (wAf && wAf.extraBreak) b += wAf.extraBreak;
        return b;
      };

      const origHunger = St.consumeHunger.bind(St);
      St.consumeHunger = function(amount) {
        const s = this.data;
        const aAf = getArmorAffixObj(s, s.equippedArmor);
        if (aAf && aAf.saveHunger && Math.random() < 0.50) {
          return (s.hunger || 0) > 0;
        }
        return origHunger(amount);
      };

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
            const nightExtra = Math.round(window.Aetheria.State.getTotalAtk() * 0.25);
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

    // ★ 修改 1：讓【工坊】與所有鍛造/加工功能在任何地圖均可直接使用（無須回營地）
    if (UI) {
      function runWithPortableForge(fn, args) {
        const s = window.Aetheria.State && window.Aetheria.State.data;
        if (!s) return fn.apply(UI, args);
        const realZone = s.currentZone;
        const hadForge = Boolean(s.projectsBuilt && s.projectsBuilt.proj_camp_forge);
        if (!s.projectsBuilt) s.projectsBuilt = {};

        // 執行工坊函式期間暫時視為位於營地且熔爐已開啟
        s.currentZone = "camp_hub";
        s.projectsBuilt.proj_camp_forge = true;
        try {
          return fn.apply(UI, args);
        } finally {
          s.currentZone = realZone;
          if (!hadForge) {
            delete s.projectsBuilt.proj_camp_forge;
          }
        }
      }

      // 包裝工坊內所有合成、鍛造、升級工具方法，確保在野外點擊製造時 100% 暢通
      [
        "craftWorkshopItem",
        "craftToolUpgrade",
        "upgradeTool",
        "craftWeapon",
        "craftArmor",
        "craftRelic",
        "buyPotion",
        "buyShopItem"
      ].forEach(function(methodName) {
        if (typeof UI[methodName] === "function") {
          const origFn = UI[methodName].bind(UI);
          UI[methodName] = function() {
            return runWithPortableForge(origFn, arguments);
          };
        }
      });

      const origOpenForge = UI.openForgeModal.bind(UI);
      UI.openForgeModal = function(activeTab) {
        runWithPortableForge(origOpenForge, [activeTab]);

        const body = document.getElementById("modal-body");
        if (!body) return;
        const tabBar = body.querySelector(".tab-bar-5");
        if (tabBar && !tabBar.querySelector(".btn-reforge-tab")) {
          tabBar.style.gridTemplateColumns = "repeat(3, 1fr)";
          const refBtn = document.createElement("button");
          refBtn.className = "na-btn btn-reforge-tab" + (activeTab === "reforge" ? " highlight" : "");
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
      console.error("Equipment Reforge v7.7 init error:", err);
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
