/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 職業、魔物意圖AI與生存拓荒素材掉落庫 (jobs-monsters.js - v6.0)
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.Data = window.Aetheria.Data || {};

(function() {
  const JOBS = {
    swordsman: {
      id: "swordsman", name: "蒼藍劍士", unlockLv: 1, atkMult: 1.15, title: "破陣先鋒",
      passiveDesc: "基礎攻擊力 +15%，每次答對有 25% 機率額外多削減 1 點護盾。"
    },
    scholar: {
      id: "scholar", name: "符文學者", unlockLv: 5, atkMult: 1.25, title: "古語解讀者",
      passiveDesc: "法術與攻擊 +25%，遇到「看圖題」與「多重配對題」時破盾數直接 +1！"
    },
    hunter: {
      id: "hunter", name: "荒野獵人", unlockLv: 12, atkMult: 1.3, title: "靈獸馴師",
      passiveDesc: "可同時攜帶 2 隻戰寵雙重助戰（觸發雙寵技能），戰寵協同傷害翻倍！"
    },
    thief: {
      id: "thief", name: "暗影盜賊", unlockLv: 20, atkMult: 1.4, title: "秘境疾風",
      passiveDesc: "大世界移動速度 +20%，每次答對攻擊有 35% 機率直接從魔物身上偷走 1 個礦石！"
    },
    alchemist: {
      id: "alchemist", name: "煉金藥師", unlockLv: 30, atkMult: 1.5, title: "真理調合師",
      passiveDesc: "每回合答對自動回復 15% 最大生命，且四選一題目自動排除 1 個錯誤選項！"
    },
    archmage: {
      id: "archmage", name: "星界魔導", unlockLv: 50, atkMult: 1.8, title: "破曉大宗師",
      passiveDesc: "全屬性額外削盾 +1，進場自帶 3 顆 BP 增幅珠，英文盲串暴擊 x3 倍！"
    }
  };

  const PETS = {
    pet_slime: {
      id: "pet_slime", name: "藍水滴史萊姆", spriteKey: "pet_slime", shinySpriteKey: "pet_slime_shiny",
      skillName: "水滴治癒", skillDesc: "每回合答對後，自動回復 14 點生命值並追加 20% 水滴連擊。",
      healPerTurn: 14, bonusDmgRatio: 0.2
    },
    pet_dragon: {
      id: "pet_dragon", name: "赤炎小幼龍", spriteKey: "pet_dragon", shinySpriteKey: "pet_dragon_shiny",
      skillName: "龍炎吐息", skillDesc: "每回合答對後，噴射龍炎追加 45% 額外暴擊傷害！",
      healPerTurn: 0, bonusDmgRatio: 0.45
    },
    pet_fox: {
      id: "pet_fox", name: "雷光九尾靈狐", spriteKey: "pet_fox", shinySpriteKey: "pet_fox_shiny",
      skillName: "雷鳴共鳴", skillDesc: "每回合答對後追加 30% 雷擊傷害，並有 35% 機率額外充能 1 顆 BP！",
      healPerTurn: 6, bonusDmgRatio: 0.3, bpChance: 0.35
    },
    pet_icedragon: {
      id: "pet_icedragon", name: "永凍冰晶幼龍", spriteKey: "pet_icedragon", shinySpriteKey: "pet_icedragon_shiny",
      skillName: "絕對零度", skillDesc: "每回合追加 50% 冰霜傷害、回復 12 點生命，且開局自動削減敵人 1 點護盾！",
      healPerTurn: 12, bonusDmgRatio: 0.5, openingShieldBreak: 1
    }
  };

  const MONSTER_TEMPLATES = {
    bamboo: {
      type: "bamboo", spriteKey: "mon_bamboo",
      baseHp: 65, hpPerLv: 22,
      baseAtk: 14, atkPerLv: 5.5,
      baseShield: 2, weak: "忍刀 / 火遁",
      tamePetId: "pet_fox", expBase: 28, goldBase: 24
    },
    skull: {
      type: "skull", spriteKey: "mon_skull",
      baseHp: 95, hpPerLv: 28,
      baseAtk: 20, atkPerLv: 6.5,
      baseShield: 3, weak: "水遁 / 雷鳴",
      tamePetId: "pet_dragon", expBase: 42, goldBase: 38
    },
    boss: {
      type: "boss", spriteKey: "mon_boss",
      baseHp: 240, hpPerLv: 38,
      baseAtk: 28, atkPerLv: 8.0,
      baseShield: 4, weak: "破盾神兵 / Boost連擊",
      tamePetId: "pet_icedragon", expBase: 150, goldBase: 170
    }
  };

  // 配合 Survival RPG 拓荒建造，魔物掉落區域專屬造船/建屋素材
  function resolveZoneDrops(zoneId, isBoss) {
    if (zoneId === "zone1_forest" || zoneId === "camp_hub") {
      return { normalDrop: "vine", subDrop: "resin", breakDrop: "coreBamboo" };
    }
    if (zoneId === "cave1_mushroom" || zoneId === "zone2_canyon") {
      return { normalDrop: "shell", subDrop: "basalt", breakDrop: "coreSkull" };
    }
    if (zoneId === "zone3_coast") {
      return { normalDrop: "sailCloth", subDrop: "coral", breakDrop: "coreSiren" };
    }
    if (zoneId === "zone4_snow") {
      return { normalDrop: "fur", subDrop: "sinew", breakDrop: "coreWolf" };
    }
    if (zoneId === "zone5_volcano") {
      return { normalDrop: "magmaScale", subDrop: "basalt", breakDrop: isBoss ? "coreDragon" : "coreGolem" };
    }
    return { normalDrop: "starIron", subDrop: "goldLeaf", breakDrop: "coreDragon" };
  }

  function rollNextIntent(enemy, turnNum) {
    if (enemy.broken) {
      return {
        type: "stunned",
        label: "狀態：BREAK 破防暈眩中 (無法行動！)",
        mult: 0,
        isUlt: false
      };
    }
    if ((turnNum % 3 === 2) || (enemy.isBoss && Math.random() < 0.4)) {
      return {
        type: "heavy",
        label: "預警：下回合【蓄力必殺】(2.4倍傷害！請舉盾或破防斷招)",
        mult: 2.4,
        isUlt: true
      };
    }
    if (enemy.shield < enemy.maxShield && Math.random() < 0.25) {
      return {
        type: "fortify",
        label: "意圖：護盾重組 (恢復 1 點護盾並發動輕擊)",
        mult: 0.85,
        shieldHeal: 1,
        isUlt: false
      };
    }
    return {
      type: "attack",
      label: "意圖：普通襲擊 (預計傷害 " + enemy.atk + ")",
      mult: 1.0,
      isUlt: false
    };
  }

  function createBattleEnemy(mapMonsterNode) {
    const state = (window.Aetheria.State && window.Aetheria.State.data) || {};
    const zoneId = state.currentZone || "zone1_forest";

    const mType = mapMonsterNode ? (mapMonsterNode.type || "bamboo") : "bamboo";
    const tpl = MONSTER_TEMPLATES[mType] || MONSTER_TEMPLATES.bamboo;
    const lv = mapMonsterNode ? (mapMonsterNode.lv || 2) : 2;
    const isBoss = Boolean(mapMonsterNode && mapMonsterNode.isBoss);
    const isElite = Boolean(mapMonsterNode && mapMonsterNode.isElite);

    const shinyRate = (state.guildRank === "S" || state.guildRank === "SS") ? 0.16 : 0.08;
    const isShiny = Boolean(mapMonsterNode && (mapMonsterNode.forceShiny || mapMonsterNode.isShiny)) || (Math.random() < shinyRate);

    const hpMult = isBoss ? 1.65 : isElite ? 1.35 : 1.0;
    const maxHp = Math.round((tpl.baseHp + lv * tpl.hpPerLv) * hpMult);
    const atk = Math.round((tpl.baseAtk + lv * tpl.atkPerLv) * (isBoss ? 1.25 : isElite ? 1.15 : 1.0));
    const maxShield = isBoss ? Math.min(8, tpl.baseShield + Math.floor(lv / 7)) : isElite ? (tpl.baseShield + 2) : (tpl.baseShield + (lv >= 12 ? 1 : 0));

    const drops = resolveZoneDrops(zoneId, isBoss);

    const enemyObj = {
      id: mapMonsterNode ? mapMonsterNode.id : "wild_mon",
      bossId: mapMonsterNode ? (mapMonsterNode.bossId || null) : null,
      reqSeals: mapMonsterNode ? (mapMonsterNode.reqSeals || null) : null,
      type: mType,
      name: (mapMonsterNode ? mapMonsterNode.name : "翠風竹子妖") + " Lv." + lv,
      lv: lv,
      atk: atk,
      isBoss: isBoss,
      isElite: isElite,
      isShiny: isShiny,
      spriteKey: tpl.spriteKey,
      hp: maxHp,
      maxHp: maxHp,
      shield: maxShield,
      maxShield: maxShield,
      broken: false,
      breakTurnsLeft: 0,
      frozenTurns: 0,
      turnCount: 1,
      weak: tpl.weak,
      normalDrop: drops.normalDrop,
      subDrop: drops.subDrop,
      breakDrop: drops.breakDrop,
      dropsTabletShard: Boolean(isBoss || isElite),
      tamePetId: tpl.tamePetId,
      expReward: Math.round(tpl.expBase * lv * (isShiny ? 2.0 : isElite ? 1.6 : 1.0)),
      goldReward: Math.round(tpl.goldBase * lv * (isShiny ? 2.0 : isElite ? 1.6 : 1.0))
    };

    enemyObj.intent = rollNextIntent(enemyObj, 1);
    return enemyObj;
  }

  window.Aetheria.Data.JOBS = JOBS;
  window.Aetheria.Data.PETS = PETS;
  window.Aetheria.Data.MONSTER_TEMPLATES = MONSTER_TEMPLATES;
  window.Aetheria.Data.rollNextIntent = rollNextIntent;
  window.Aetheria.Data.createBattleEnemy = createBattleEnemy;
})();
