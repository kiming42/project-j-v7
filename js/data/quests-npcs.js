/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 動態NPC對話狀態機與分步任務庫 (quests-npcs.js - v6.7)
 * 升級：1.新增 getNpcDynamicGreeting(state, npcId)，接受或完成任務後立即切換對應台詞 (解決圖1問題)
 *       2.全面檢查並更新全 10 位 NPC 的階段性對話及行商奇奇台詞
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.Data = window.Aetheria.Data || {};

(function() {
  const STORY_CUTSCENES = {
    intro: [
      { tag: "序幕・赤手空拳的拓荒者", speaker: "星象少女・艾莉婭", text: "300年前，『四座古文明知識聖碑』遭黑霧吞噬，連我們營地的鍛造熔爐都在昨晚的暴風雨中熄滅受損了……" },
      { tag: "序幕・赤手空拳的拓荒者", speaker: "鐵匠大叔・巴爾", text: "Justin！請先走進【鐵匠帳篷】找我對話接取任務，然後在營地地上徒手拾取『散落枯枝、尖銳燧石、河床黏土』幫我修復熔爐吧！" }
    ],
    enter_zone1_forest: [
      { tag: "第一章・翠風迷霧森林", speaker: "受困斥候・里奧（呼救）", text: "喂——！東岸通往守關領主的木橋被洪水沖斷了！快來河岸西側找我接取修橋任務！" }
    ],
    enter_cave1_mushroom: [
      { tag: "第二章・微光蘑菇洞窟", speaker: "見習礦工・石頭（提醒）", text: "洞窟裡伸手不見五指！快收集玄武岩塊、黏土、松脂與秘銀，在入口處砌築『永明聖火燈塔』驅散黑霧吧！" }
    ],
    enter_zone2_canyon: [
      { tag: "第三章・流沙繩索峽谷", speaker: "遺跡學者・古斯塔", text: "太好了！北翼的符文封印柱在垂直斷崖上，快來營火旁找我接取『斷崖重型絞盤木梯』任務！" }
    ],
    enter_zone3_coast: [
      { tag: "第四章・翡翠沉船海岸", speaker: "老船匠・達克", text: "想渡海去討伐幽靈船長？快來碼頭找老夫接取造船任務，建造『破浪遠航木筏』！" }
    ],
    enter_zone4_snow: [
      { tag: "第五章・霜語極寒雪原", speaker: "星象少女・艾莉婭", text: "暴風雪會持續凍傷生命！快在雪原中央搭建『極地防風毛皮屋』建立永久抗寒據點！" }
    ],
    enter_zone5_volcano: [
      { tag: "第六章・赤紅熔岩火山", speaker: "鐵匠大叔・巴爾", text: "前方的熔岩河高達上千度！必須回工坊燒製『黑曜耐火磚』，才能鋪設跨越熔岩的石拱橋！" }
    ],
    enter_zone6_sky: [
      { tag: "終章・天界浮空聖殿", speaker: "星象少女・艾莉婭", text: "終於登上雲端之上的天界聖殿了……解開最後兩座天界聖柱，擊敗元兇【破曉蝕憶神龍皇】吧！" }
    ]
  };

  const MONOLITHS_DB = {
    chinese: {
      id: "chinese", name: "龍語古卷聖碑（中文）",
      perks: "25點：攻擊 +15% ｜ 75點：攻擊 +30%",
      lore25: "【卷一】先民以六書鑄造龍語符文，蘊含破魔鋒芒。",
      lore50: "【卷二】洞悉字詞真義，刀劍與龍脈共鳴。",
      lore100: "【終極】龍語聖碑完全復甦，獲至高劍聖之力。"
    },
    english: {
      id: "english", name: "阿爾比恩聖碑（英文）",
      perks: "25點：開局 +1 BP ｜ 75點：連勝倍率 2.0x",
      lore25: "【卷一】二十六枚字母化為星辰音節契約。",
      lore50: "【卷二】拼寫真名者可引動星辰增幅能量。",
      lore100: "【終極】星界語法徹底解封，連勝賞金倍增。"
    },
    science: {
      id: "science", name: "煉金真理聖碑（科學）",
      perks: "25點：藥水回復翻倍(140) ｜ 75點：完美採集賞金翻倍",
      lore25: "【卷一】觀測光學與物態循環，銘刻自然法則。",
      lore50: "【卷二】理解催化之道，藥草化為奇蹟靈藥。",
      lore100: "【終極】萬物元素皆為所用，煉金臻至化境。"
    },
    humanities: {
      id: "humanities", name: "紀元編年聖碑（人文）",
      perks: "50點：HP與DEF +25% ｜ 100點：每戰1次半血復活",
      lore25: "【卷一】編年史官記錄先祖守護家園的意志。",
      lore50: "【卷二】背負歷史記憶者獲大地母神庇護。",
      lore100: "【終極】千載文明化為不滅金身，賜予絕境重生。"
    }
  };

  function calcProjectProgressList(s, projectId) {
    const proj = window.Aetheria.Data.SURVIVAL_PROJECTS && window.Aetheria.Data.SURVIVAL_PROJECTS[projectId];
    if (!proj) return [];
    const mats = window.Aetheria.Data.MATERIALS || {};
    const built = Boolean(s.projectsBuilt && s.projectsBuilt[projectId]);
    const contrib = (s.projectContributions && s.projectContributions[projectId]) || {};

    return Object.entries(proj.cost).map(function(entry) {
      const k = entry[0];
      const req = entry[1];
      const put = built ? req : (contrib[k] || 0);
      const inBag = (s.inventory && s.inventory[k]) || 0;
      const cur = Math.min(req, put + inBag);
      return { key: k, name: (mats[k] && mats[k].name) || k, cur: cur, max: req };
    });
  }

  function calcCostProgressList(s, costObj, alreadyOwned) {
    const mats = window.Aetheria.Data.MATERIALS || {};
    return Object.entries(costObj || {}).map(function(entry) {
      const k = entry[0];
      const req = entry[1];
      const cur = alreadyOwned ? req : ((s.inventory && s.inventory[k]) || 0);
      return { key: k, name: (mats[k] && mats[k].name) || k, cur: cur, max: req };
    });
  }

  const MAIN_QUESTS = [
    {
      id: "mq_01", chapter: "序章1/3", title: "修復【巴爾的鍛造熔爐】",
      giverNpcId: "npc_smith", giverName: "鐵匠大叔・巴爾", giverZone: "0.鐵匠帳篷",
      desc: "在營地拾取枯枝、燧石與黏土，進入【鐵匠帳篷】對準熔爐按 A 鍵投入修復。",
      getProgressList: function(s) { return calcProjectProgressList(s, "proj_camp_forge"); },
      checkComplete: function(s) {
        if (s.projectsBuilt && s.projectsBuilt.proj_camp_forge) return true;
        const list = calcProjectProgressList(s, "proj_camp_forge");
        return list.length > 0 && list.every(function(i) { return i.cur >= i.max; });
      },
      rewardText: "授予【新手忍刀＋Lv.1手斧＋Lv.1鐵鎬】、80G",
      onClaim: function(s) {
        if (!s.projectsBuilt.proj_camp_forge) {
          const proj = window.Aetheria.Data.SURVIVAL_PROJECTS.proj_camp_forge;
          const contrib = (s.projectContributions && s.projectContributions.proj_camp_forge) || {};
          Object.entries(proj.cost).forEach(function(e) {
            const rem = Math.max(0, e[1] - (contrib[e[0]] || 0));
            s.inventory[e[0]] = Math.max(0, (s.inventory[e[0]] || 0) - rem);
          });
          s.projectsBuilt.proj_camp_forge = true;
          if (proj.onComplete) proj.onComplete(s);
        }
        s.inventory.iron += 2;
        s.inventory.wood += 2;
        window.Aetheria.State.gainRewards(50, 80, 20);
      }
    },
    {
      id: "mq_02", chapter: "序章2/3", title: "幫【老漁夫・阿海】修補魚簍領釣竿",
      giverNpcId: "npc_fisher", giverName: "老漁夫・阿海", giverZone: "0.曙光營地池畔",
      desc: "收集散落枯枝與堅韌藤蔓交給營地池塘邊的【老漁夫・阿海】。",
      deliverCost: { branch: 2, vine: 1 },
      getProgressList: function(s) {
        return calcCostProgressList(s, { branch: 2, vine: 1 }, (s.tools.hook || 0) >= 1);
      },
      checkComplete: function(s) {
        if ((s.tools.hook || 0) >= 1) return true;
        return window.Aetheria.Data.CraftingHelper.canAfford(s.inventory, { branch: 2, vine: 1 });
      },
      rewardText: "授予【Lv.1 竹製釣魚竿】、100G",
      onClaim: function(s) {
        if ((s.tools.hook || 0) < 1) {
          window.Aetheria.Data.CraftingHelper.payCost(s.inventory, { branch: 2, vine: 1 });
          s.tools.hook = 1;
        }
        s.inventory.herb += 2;
        window.Aetheria.State.gainRewards(60, 100, 15);
      }
    },
    {
      id: "mq_03", chapter: "序章3/3", title: "鍛造【翠風荊棘短刃 (T2)】",
      giverNpcId: "npc_smith", giverName: "鐵匠大叔・巴爾", giverZone: "0.鐵匠帳篷",
      desc: "① 採集原木(3)鐵礦(3)藤蔓(2) ➔ ② 升至Lv.2後回【鐵匠帳篷】工坊鍛造短刃 ➔ ③ 找巴爾交付。",
      getProgressList: function(s) {
        const owned = s.unlockedWeapons.indexOf("w_vine") !== -1;
        const list = calcCostProgressList(s, { wood: 3, iron: 3, vine: 2 }, owned);
        list.unshift({ name: "角色Lv.2", cur: s.lv, max: 2 });
        return list;
      },
      checkComplete: function(s) { return s.unlockedWeapons.indexOf("w_vine") !== -1; },
      rewardText: "琥珀松脂x2、翠風原木x2、100G",
      onClaim: function(s) { s.inventory.resin += 2; s.inventory.wood += 2; window.Aetheria.State.gainRewards(80, 100, 20); }
    },
    {
      id: "mq_04", chapter: "一章1/3", title: "打造【翠風藤甲】並向斥候里奧報到",
      giverNpcId: "npc_scout", giverName: "受困斥候・里奧", giverZone: "1.翠風森林斷橋西岸",
      desc: "① 擊殺竹子妖取木心，於工坊打造【翠風藤甲 (T2)】 ➔ ② 前往森林西岸找【里奧】交付。",
      getProgressList: function(s) {
        const owned = s.unlockedArmors.indexOf("a_vine") !== -1;
        return calcCostProgressList(s, { wood: 3, vine: 3, herb: 2, coreBamboo: 1 }, owned);
      },
      checkComplete: function(s) { return s.unlockedArmors.indexOf("a_vine") !== -1; },
      rewardText: "加工厚木板x1、強化麻繩索x1、150G",
      onClaim: function(s) { s.inventory.plank += 1; s.inventory.rope += 1; window.Aetheria.State.gainRewards(120, 150, 25); }
    },
    {
      id: "mq_05", chapter: "一章2/3", title: "加工建材並修築【跨河加固吊橋】",
      giverNpcId: "npc_scout", giverName: "受困斥候・里奧", giverZone: "1.翠風森林斷橋西岸",
      desc: "① 回營地【鐵匠帳篷工坊】加工厚木板/麻繩/鐵釘 ➔ ② 赴森林斷橋處建造 ➔ ③ 找里奧交付。",
      getProgressList: function(s) { return calcProjectProgressList(s, "proj_z1_bridge"); },
      checkComplete: function(s) { return Boolean(s.projectsBuilt && s.projectsBuilt.proj_z1_bridge); },
      rewardText: "竹精木心x1、200G",
      onClaim: function(s) { s.inventory.coreBamboo += 1; window.Aetheria.State.gainRewards(160, 200, 30); }
    },
    {
      id: "mq_06", chapter: "一章3/3", title: "擊敗【千年腐化樹妖王】向會長雷恩報到",
      giverNpcId: "npc_guild", giverName: "公會會長・雷恩", giverZone: "0.公會帳篷",
      desc: "① 點亮森林南北雙封印柱 ➔ ② 擊敗東岸樹妖王 ➔ ③ 回【公會帳篷】找雷恩交付。",
      getProgressList: function(s) {
        const s1 = (s.unlockedSeals && s.unlockedSeals.seal_z1_1) ? 1 : 0;
        const s2 = (s.unlockedSeals && s.unlockedSeals.seal_z1_2) ? 1 : 0;
        const b1 = (s.clearedBosses && s.clearedBosses.boss_z1) ? 1 : 0;
        return [
          { name: "森林封印柱", cur: s1 + s2, max: 2 },
          { name: "樹妖王討伐", cur: b1, max: 1 }
        ];
      },
      checkComplete: function(s) { return Boolean(s.clearedBosses && s.clearedBosses.boss_z1); },
      rewardText: "古文明聖碑殘片x1、280G",
      onClaim: function(s) { s.inventory.tabletShard += 1; window.Aetheria.State.gainRewards(220, 280, 40); }
    },
    {
      id: "mq_07", chapter: "二章1/3", title: "升級【Lv.2 重鎬】並向礦工石頭領火藥袋",
      giverNpcId: "npc_miner", giverName: "見習礦工・石頭", giverZone: "1.翠風森林北口",
      desc: "① 升至 Lv.2 秘銀重鎬 ➔ ② 收集燧石與松脂交給森林北口的【石頭】獲得【Lv.1 火藥袋】。",
      getProgressList: function(s) {
        const hasBomb = (s.tools.bomb || 0) >= 1;
        const list = calcCostProgressList(s, { flint: 2, resin: 2 }, hasBomb);
        list.unshift({ name: "Lv.2秘銀重鎬", cur: Math.min(2, s.tools.pickaxe || 0), max: 2 });
        return list;
      },
      checkComplete: function(s) {
        const pickOk = (s.tools.pickaxe || 0) >= 2;
        const bombOk = (s.tools.bomb || 0) >= 1 || window.Aetheria.Data.CraftingHelper.canAfford(s.inventory, { flint: 2, resin: 2 });
        return pickOk && bombOk;
      },
      rewardText: "授予【Lv.1 火藥袋】、爆破炸彈x2、220G",
      onClaim: function(s) {
        if ((s.tools.bomb || 0) < 1) {
          window.Aetheria.Data.CraftingHelper.payCost(s.inventory, { flint: 2, resin: 2 });
          s.tools.bomb = 1;
        }
        s.inventory.bombItem += 2;
        window.Aetheria.State.gainRewards(190, 220, 30);
      }
    },
    {
      id: "mq_08", chapter: "二章2/3", title: "於蘑菇洞窟砌築【永明聖火燈塔】",
      giverNpcId: "npc_miner", giverName: "見習礦工・石頭", giverZone: "1.翠風森林北口",
      desc: "① 收集玄武岩塊、黏土、松脂、燧石與秘銀 ➔ ② 在洞窟入口砌築燈塔 ➔ ③ 找石頭交付。",
      getProgressList: function(s) { return calcProjectProgressList(s, "proj_cave1_beacon"); },
      checkComplete: function(s) { return Boolean(s.projectsBuilt && s.projectsBuilt.proj_cave1_beacon); },
      rewardText: "流沙秘銀礦x2、260G",
      onClaim: function(s) { s.inventory.mithril += 2; window.Aetheria.State.gainRewards(230, 260, 35); }
    },
    {
      id: "mq_09", chapter: "二章3/3", title: "擊敗洞窟領主【晶簇骷髏大統領】",
      giverNpcId: "npc_astro", giverName: "星象少女・艾莉婭", giverZone: "0.曙光營地",
      desc: "① 解開洞窟雙封印柱 ➔ ② 擊敗北端骷髏大統領 ➔ ③ 回營地找【艾莉婭】交付。",
      getProgressList: function(s) {
        const s1 = (s.unlockedSeals && s.unlockedSeals.seal_c1_1) ? 1 : 0;
        const s2 = (s.unlockedSeals && s.unlockedSeals.seal_c1_2) ? 1 : 0;
        const b1 = (s.clearedBosses && s.clearedBosses.boss_cave1) ? 1 : 0;
        return [
          { name: "洞窟封印柱", cur: s1 + s2, max: 2 },
          { name: "骷髏大統領", cur: b1, max: 1 }
        ];
      },
      checkComplete: function(s) { return Boolean(s.clearedBosses && s.clearedBosses.boss_cave1); },
      rewardText: "聖碑殘片x1、骷髏魂火x1、350G",
      onClaim: function(s) { s.inventory.tabletShard += 1; s.inventory.coreSkull += 1; window.Aetheria.State.gainRewards(320, 350, 45); }
    },
    {
      id: "mq_10", chapter: "三章1/3", title: "打造【秘銀鎖甲】並向峽谷學者報到",
      giverNpcId: "npc_scholar", giverName: "遺跡學者・古斯塔", giverZone: "2.流沙峽谷中央",
      desc: "① 於工坊打造【岩窟秘銀鎖甲 (T3)】 ➔ ② 前往峽谷營火旁找【古斯塔】報到。",
      getProgressList: function(s) {
        const owned = s.unlockedArmors.indexOf("a_mithril") !== -1;
        return calcCostProgressList(s, { mithril: 3, shell: 3, iron: 3, coreSkull: 1 }, owned);
      },
      checkComplete: function(s) { return s.unlockedZones.indexOf("zone2_canyon") !== -1 && s.unlockedArmors.indexOf("a_mithril") !== -1; },
      rewardText: "加工厚木板x2、320G",
      onClaim: function(s) { s.inventory.plank += 2; window.Aetheria.State.gainRewards(300, 320, 40); }
    },
    {
      id: "mq_11", chapter: "三章2/3", title: "架設峽谷【斷崖重型絞盤木梯】",
      giverNpcId: "npc_scholar", giverName: "遺跡學者・古斯塔", giverZone: "2.流沙峽谷中央",
      desc: "① 備妥厚木板、麻繩、鐵釘與硬甲殼 ➔ ② 在峽谷北翼架設木梯 ➔ ③ 找古斯塔交付。",
      getProgressList: function(s) { return calcProjectProgressList(s, "proj_z2_ladder"); },
      checkComplete: function(s) { return Boolean(s.projectsBuilt && s.projectsBuilt.proj_z2_ladder); },
      rewardText: "流沙秘銀礦x2、380G",
      onClaim: function(s) { s.inventory.mithril += 2; window.Aetheria.State.gainRewards(350, 380, 45); }
    },
    {
      id: "mq_12", chapter: "三章3/3", title: "擊敗峽谷領主【荒漠流沙魔神】",
      giverNpcId: "npc_scholar", giverName: "遺跡學者・古斯塔", giverZone: "2.流沙峽谷中央",
      desc: "① 解開峽谷雙封印柱 ➔ ② 擊敗荒漠流沙魔神 ➔ ③ 找【古斯塔】交付。",
      getProgressList: function(s) {
        const s1 = (s.unlockedSeals && s.unlockedSeals.seal_z2_1) ? 1 : 0;
        const s2 = (s.unlockedSeals && s.unlockedSeals.seal_z2_2) ? 1 : 0;
        const b1 = (s.clearedBosses && s.clearedBosses.boss_z2) ? 1 : 0;
        return [
          { name: "峽谷封印柱", cur: s1 + s2, max: 2 },
          { name: "荒漠流沙魔神", cur: b1, max: 1 }
        ];
      },
      checkComplete: function(s) { return Boolean(s.clearedBosses && s.clearedBosses.boss_z2); },
      rewardText: "聖碑殘片x1、深海珊瑚x2、500G",
      onClaim: function(s) { s.inventory.tabletShard += 1; s.inventory.coral += 2; window.Aetheria.State.gainRewards(480, 500, 55); }
    },
    {
      id: "mq_13", chapter: "四章1/3", title: "打造海岸裝備並與【老船匠・達克】會合",
      giverNpcId: "npc_shipwright", giverName: "老船匠・達克", giverZone: "3.翡翠海岸碼頭",
      desc: "① 於工坊打造【珊瑚雙刃】或【海鱗戰鎧】 ➔ ② 前往海岸碼頭找【達克】報到。",
      getProgressList: function(s) {
        const owned = s.unlockedWeapons.indexOf("w_coral") !== -1 || s.unlockedArmors.indexOf("a_siren") !== -1;
        return calcCostProgressList(s, { coral: 4, fish: 2, mithril: 3, coreSiren: 1 }, owned);
      },
      checkComplete: function(s) { return s.unlockedWeapons.indexOf("w_coral") !== -1 || s.unlockedArmors.indexOf("a_siren") !== -1; },
      rewardText: "防水松脂膠x1、幽靈古帆布x2、450G",
      onClaim: function(s) { s.inventory.pitch += 1; s.inventory.sailCloth += 2; window.Aetheria.State.gainRewards(450, 450, 45); }
    },
    {
      id: "mq_14", chapter: "四章2/3", title: "於海岸碼頭建造【破浪遠航木筏】",
      giverNpcId: "npc_shipwright", giverName: "老船匠・達克", giverZone: "3.翡翠海岸碼頭",
      desc: "① 於工坊合成木板、防水膠與風帆 ➔ ② 在碼頭建造木筏 ➔ ③ 找【達克】交付。",
      getProgressList: function(s) { return calcProjectProgressList(s, "proj_z3_raft"); },
      checkComplete: function(s) { return Boolean(s.projectsBuilt && s.projectsBuilt.proj_z3_raft); },
      rewardText: "海妖水核x1、550G",
      onClaim: function(s) { s.inventory.coreSiren += 1; window.Aetheria.State.gainRewards(520, 550, 55); }
    },
    {
      id: "mq_15", chapter: "四章3/3", title: "乘木筏渡海擊敗【深海幽靈船長】",
      giverNpcId: "npc_shipwright", giverName: "老船匠・達克", giverZone: "3.翡翠海岸碼頭",
      desc: "① 解開海岸雙封印柱 ➔ ② 乘木筏擊敗幽靈船長 ➔ ③ 找【達克】交付。",
      getProgressList: function(s) {
        const s1 = (s.unlockedSeals && s.unlockedSeals.seal_z3_1) ? 1 : 0;
        const s2 = (s.unlockedSeals && s.unlockedSeals.seal_z3_2) ? 1 : 0;
        const b1 = (s.clearedBosses && s.clearedBosses.boss_z3) ? 1 : 0;
        return [
          { name: "海岸封印柱", cur: s1 + s2, max: 2 },
          { name: "幽靈船長", cur: b1, max: 1 }
        ];
      },
      checkComplete: function(s) { return Boolean(s.clearedBosses && s.clearedBosses.boss_z3); },
      rewardText: "聖碑殘片x1、毛皮x2、700G",
      onClaim: function(s) { s.inventory.tabletShard += 1; s.inventory.fur += 2; window.Aetheria.State.gainRewards(680, 700, 65); }
    },
    {
      id: "mq_16", chapter: "五章1/3", title: "於霜語雪原搭建【極地防風毛皮屋】",
      giverNpcId: "npc_astro", giverName: "星象少女・艾莉婭", giverZone: "0.曙光營地",
      desc: "① 收集玄武岩、木板、毛皮、獸筋與冰魄 ➔ ② 在雪原中央搭建防風屋 ➔ ③ 回營地找【艾莉婭】交付。",
      getProgressList: function(s) { return calcProjectProgressList(s, "proj_z4_shelter"); },
      checkComplete: function(s) { return Boolean(s.projectsBuilt && s.projectsBuilt.proj_z4_shelter); },
      rewardText: "雪山冰蓮x2、750G",
      onClaim: function(s) { s.inventory.iceLotus += 2; window.Aetheria.State.gainRewards(720, 750, 60); }
    },
    {
      id: "mq_17", chapter: "五章2/3", title: "打造【霜狼毛皮甲】並升級【Lv.3 鑽頭】",
      giverNpcId: "npc_smith", giverName: "鐵匠大叔・巴爾", giverZone: "0.鐵匠帳篷",
      desc: "① 於工坊打造 T5 霜狼毛皮甲與升級 Lv.3 鑽頭 ➔ ② 在【鐵匠帳篷】找巴爾交付。",
      getProgressList: function(s) {
        return [
          { name: "霜狼毛皮甲", cur: s.unlockedArmors.indexOf("a_frost") !== -1 ? 1 : 0, max: 1 },
          { name: "Lv.3星隕鑽頭", cur: Math.min(3, s.tools.pickaxe || 0), max: 3 }
        ];
      },
      checkComplete: function(s) { return s.unlockedArmors.indexOf("a_frost") !== -1 && (s.tools.pickaxe || 0) >= 3; },
      rewardText: "熔岩黑曜石x2、850G",
      onClaim: function(s) { s.inventory.obsidian += 2; window.Aetheria.State.gainRewards(800, 850, 65); }
    },
    {
      id: "mq_18", chapter: "五章3/3", title: "擊敗雪原領主【遠古永凍冰霜龍王】",
      giverNpcId: "npc_guild", giverName: "公會會長・雷恩", giverZone: "0.公會帳篷",
      desc: "① 解開雪原雙封印柱 ➔ ② 擊敗冰霜龍王 ➔ ③ 在【公會帳篷】找雷恩交付。",
      getProgressList: function(s) {
        const s1 = (s.unlockedSeals && s.unlockedSeals.seal_z4_1) ? 1 : 0;
        const s2 = (s.unlockedSeals && s.unlockedSeals.seal_z4_2) ? 1 : 0;
        const b1 = (s.clearedBosses && s.clearedBosses.boss_z4) ? 1 : 0;
        return [
          { name: "雪原封印柱", cur: s1 + s2, max: 2 },
          { name: "冰霜龍王", cur: b1, max: 1 }
        ];
      },
      checkComplete: function(s) { return Boolean(s.clearedBosses && s.clearedBosses.boss_z4); },
      rewardText: "聖碑殘片x2、熔岩龍鱗x2、1000G",
      onClaim: function(s) { s.inventory.tabletShard += 2; s.inventory.magmaScale += 2; window.Aetheria.State.gainRewards(1000, 1000, 80); }
    },
    {
      id: "mq_19", chapter: "六章1/3", title: "鋪設火山【黑曜耐火石拱橋】並擊敗龍皇",
      giverNpcId: "npc_smith", giverName: "鐵匠大叔・巴爾", giverZone: "0.鐵匠帳篷",
      desc: "① 於工坊燒製耐火磚並鋪設石拱橋 ➔ ② 擊敗火山龍皇 ➔ ③ 在【鐵匠帳篷】找巴爾交付。",
      getProgressList: function(s) {
        const list = calcProjectProgressList(s, "proj_z5_bridge");
        list.push({ name: "紅蓮火山龍皇", cur: (s.clearedBosses && s.clearedBosses.boss_z5) ? 1 : 0, max: 1 });
        return list;
      },
      checkComplete: function(s) { return Boolean(s.projectsBuilt && s.projectsBuilt.proj_z5_bridge && s.clearedBosses && s.clearedBosses.boss_z5); },
      rewardText: "深淵星隕鐵x3、1500G",
      onClaim: function(s) { s.inventory.starIron += 3; window.Aetheria.State.gainRewards(1500, 1500, 100); }
    },
    {
      id: "mq_20", chapter: "六章2/3", title: "登上天界聖殿，擊敗【破曉蝕憶神龍皇】",
      giverNpcId: "npc_astro", giverName: "星象少女・艾莉婭", giverZone: "0.曙光營地",
      desc: "① 解開天界雙聖柱 ➔ ② 擊敗終極龍皇 ➔ ③ 回營地找【艾莉婭】交付。",
      getProgressList: function(s) {
        const s1 = (s.unlockedSeals && s.unlockedSeals.seal_z6_1) ? 1 : 0;
        const s2 = (s.unlockedSeals && s.unlockedSeals.seal_z6_2) ? 1 : 0;
        const b1 = (s.clearedBosses && s.clearedBosses.boss_z6) ? 1 : 0;
        return [
          { name: "天界聖柱", cur: s1 + s2, max: 2 },
          { name: "蝕憶神龍皇", cur: b1, max: 1 }
        ];
      },
      checkComplete: function(s) { return Boolean(s.clearedBosses && s.clearedBosses.boss_z6); },
      rewardText: "聖碑殘片x2、星隕鐵x4、3000G",
      onClaim: function(s) { s.inventory.tabletShard += 2; s.inventory.starIron += 4; window.Aetheria.State.gainRewards(2500, 3000, 150); }
    },
    {
      id: "mq_21", chapter: "終章3/3", title: "打造【破曉神刃 (T10)】並突破試煉塔10層",
      giverNpcId: "npc_guild", giverName: "公會會長・雷恩", giverZone: "0.公會帳篷",
      desc: "① 打造【艾瑟瑞亞破曉神刃】 ➔ ② 突破試煉塔第 10 層 ➔ ③ 在【公會帳篷】找雷恩交付。",
      getProgressList: function(s) {
        return [
          { name: "破曉神刃", cur: s.unlockedWeapons.indexOf("w_dawn") !== -1 ? 1 : 0, max: 1 },
          { name: "試煉塔層數", cur: Math.min(10, s.maxTowerFloor || 1), max: 10 }
        ];
      },
      checkComplete: function(s) { return s.unlockedWeapons.indexOf("w_dawn") !== -1 && s.maxTowerFloor >= 10; },
      rewardText: "聖碑殘片x5、5000G、破曉大宗師榮譽",
      onClaim: function(s) { s.inventory.tabletShard += 5; window.Aetheria.State.gainRewards(5000, 5000, 200); }
    }
  ];

  const NPCS_DB = {
    npc_smith: {
      id: "npc_smith", name: "鐵匠大叔・巴爾", role: "鐵匠帳篷・首席鍛造與建材師", sprite: "npc_blacksmith", zoneName: "0.鐵匠帳篷內部",
      greeting: "「鍛造熔爐火力十足！需要打造武器、防具、加工厚木板建材或者升級採集工具，隨時打開下方工坊！」",
      serviceLabel: "開啟工坊（武器/防具/建材加工/工具）", serviceAction: "openForgeModal",
      villagerQuests: [],
      pathActions: [
        {
          id: "pa_smith_inquire", onceKey: "done_pa_smith_inquire", type: "inquire",
          label: "【探查】請教建材加工配方", desc: "單次：獲藍晶鐵礦x2、琥珀松脂x2",
          rewardSummary: "獲得【藍晶鐵礦x2、琥珀松脂x2】！",
          onSuccess: function(state) {
            state.questProgress.done_pa_smith_inquire = true;
            state.inventory.iron += 2;
            state.inventory.resin += 2;
            window.Aetheria.State.gainRewards(45, 30, 10);
          }
        },
        {
          id: "pa_smith_spar", type: "spar",
          label: "【切磋】與巴爾比試 (Lv.6)", desc: "首勝獲秘銀x2；後續獲鐵礦x1",
          enemyConfig: { name: "鐵匠宗師・巴爾", lv: 6, type: "boss", isBoss: false },
          rewardSummary: "切磋獲勝！",
          onSuccess: function(state) {
            if (!state.questProgress.done_pa_smith_spar) {
              state.questProgress.done_pa_smith_spar = true;
              state.inventory.mithril += 2;
            } else {
              state.inventory.iron += 1;
              state.gold += 30;
            }
          }
        }
      ]
    },

    npc_fisher: {
      id: "npc_fisher", name: "老漁夫・阿海", role: "曙光營地池畔垂釣達人", sprite: "npc_fisher", zoneName: "0.曙光營地池畔",
      greeting: "「今日風浪平靜，最啱去水波釣魚點釣幾條銀鱗鮮魚返嚟煲湯或者鍛造水屬神兵！」",
      perkLabel: "【村民回禮】領取阿海的每日魚餌補給",
      onClaimPerk: function(s) {
        s.inventory.branch += 1;
        s.inventory.potionHeal += 1;
        return "老漁夫阿海送了你【散落枯枝 +1、生命藥水 +1】！";
      },
      villagerQuests: [
        {
          id: "vq_fisher_1", reqMainQuest: "mq_02",
          title: "【漁夫委託 1】親手垂釣銀鱗鮮魚",
          kind: "deliver", cost: { fish: 2 },
          desc: "使用竹製釣魚竿在水波釣魚點釣起 2 條銀鱗鮮魚交給阿海。",
          rewardText: "流沙秘銀礦x2、靈獸誘餌果x2、180G、聲望+30",
          onComplete: function(s) {
            s.inventory.mithril += 2;
            s.inventory.tameFruit += 2;
            window.Aetheria.State.gainRewards(130, 180, 30);
          }
        },
        {
          id: "vq_fisher_2", reqQuestId: "vq_fisher_1",
          title: "【漁夫委託 2】海濱奇珍深海珊瑚與鮮魚",
          kind: "deliver", cost: { fish: 2, coral: 2 },
          desc: "收集銀鱗鮮魚x2 與深海珊瑚x2 交給老漁夫阿海。",
          rewardText: "海妖水核x1、300G、聲望+45",
          onComplete: function(s) {
            s.inventory.coreSiren += 1;
            window.Aetheria.State.gainRewards(220, 300, 45);
          }
        }
      ]
    },

    npc_herbalist: {
      id: "npc_herbalist", name: "草藥婆婆・梅姑", role: "營地百草藥師", sprite: "npc_herbalist", zoneName: "0.曙光營地西側",
      greeting: "「出外拓荒最緊要帶備充足嘅生命藥水同埋去營地料理鍋煲熱湯飲！」",
      perkLabel: "【村民回禮】飲用梅姑的百草養生茶",
      onClaimPerk: function(s) {
        s.hp = s.maxHp;
        s.inventory.herb += 1;
        return "飲用梅姑的養生茶，生命全滿並獲贈【紅傘微光菇 +1】！";
      },
      villagerQuests: [
        {
          id: "vq_herb_1", reqMainQuest: "mq_01",
          title: "【藥師委託 1】熬製傷藥的陶土與微光菇",
          kind: "deliver", cost: { herb: 2, clay: 2 },
          desc: "收集紅傘微光菇x2 與河床黏土x2 交給草藥婆婆梅姑。",
          rewardText: "生命藥水x3、琥珀松脂x2、120G、聲望+25",
          onComplete: function(s) {
            s.inventory.potionHeal += 3;
            s.inventory.resin += 2;
            window.Aetheria.State.gainRewards(85, 120, 25);
          }
        },
        {
          id: "vq_herb_2", reqQuestId: "vq_herb_1",
          title: "【藥師委託 2】向陽靈花與松脂提煉",
          kind: "deliver", cost: { flower: 2, resin: 2 },
          desc: "升級 Lv.2 戰斧後，採集翠風太陽花x2 與琥珀松脂x2 交給梅姑。",
          rewardText: "洞察藥水x3、靈獸誘餌果x2、240G、聲望+35",
          onComplete: function(s) {
            s.inventory.potionHint += 3;
            s.inventory.tameFruit += 2;
            window.Aetheria.State.gainRewards(180, 240, 35);
          }
        }
      ]
    },

    npc_scout: {
      id: "npc_scout", name: "受困斥候・里奧", role: "翠風森林前線斥候", sprite: "npc_scout", badge: "[斥候]", zoneName: "1.翠風森林斷橋西岸",
      greeting: "「翠風森林深處有南北兩座符文封印柱，全部點亮後就能削弱東岸樹妖王的護體結界！」",
      perkLabel: "【村民回禮】領取斥候收集的木材與藤蔓",
      onClaimPerk: function(s) {
        s.inventory.wood += 1;
        s.inventory.vine += 1;
        return "斥候里奧分享了【翠風原木 +1、堅韌藤蔓 +1】！";
      },
      villagerQuests: [
        {
          id: "vq_scout_1",
          title: "【斥候委託 1】清剿森林西岸魔物",
          kind: "action", statKey: "kills", reqVal: 2, goalLabel: "討伐魔物",
          desc: "在戰鬥中擊敗 2 隻野外魔物，完成後回來向斥候里奧交付。",
          rewardText: "加工厚木板x1、鍛造鐵釘x1、150G、聲望+25",
          onComplete: function(s) {
            s.inventory.plank += 1;
            s.inventory.nails += 1;
            window.Aetheria.State.gainRewards(110, 150, 25);
          }
        },
        {
          id: "vq_scout_2", reqQuestId: "vq_scout_1",
          title: "【斥候委託 2】破盾戰術實戰演練",
          kind: "action", statKey: "breaks", reqVal: 2, goalLabel: "擊破護盾",
          desc: "在戰鬥中觸發 2 次 BREAK 破防暈眩，完成後向斥候里奧回報。",
          rewardText: "竹精木心x1、強化麻繩索x1、220G、聲望+35",
          onComplete: function(s) {
            s.inventory.coreBamboo += 1;
            s.inventory.rope += 1;
            window.Aetheria.State.gainRewards(160, 220, 35);
          }
        }
      ]
    },

    npc_miner: {
      id: "npc_miner", name: "見習礦工・石頭", role: "洞窟爆破勘探員", sprite: "npc_miner", badge: "[礦工]", zoneName: "1.翠風森林北翼洞口",
      greeting: "「微光蘑菇洞窟入面蘊藏住大量流沙秘銀同玄武岩，記得帶埋炸彈炸開西面嘅裂縫岩壁密室！」",
      perkLabel: "【村民回禮】領取石頭開採的礦石補給",
      onClaimPerk: function(s) {
        s.inventory.iron += 1;
        s.inventory.flint += 1;
        return "礦工石頭送了你【藍晶鐵礦 +1、尖銳燧石 +1】！";
      },
      villagerQuests: [
        {
          id: "vq_miner_1", reqMainQuest: "mq_07",
          title: "【礦工委託 1】洞窟秘銀與玄武岩勘探",
          kind: "deliver", cost: { mithril: 2, basalt: 1 },
          desc: "開採流沙秘銀礦x2 與玄武岩塊x1 交給見習礦工石頭。",
          rewardText: "鍛造鐵釘x2、爆破炸彈x2、280G、聲望+40",
          onComplete: function(s) {
            s.inventory.nails += 2;
            s.inventory.bombItem += 2;
            window.Aetheria.State.gainRewards(210, 280, 40);
          }
        }
      ]
    },

    npc_scholar: {
      id: "npc_scholar", name: "遺跡學者・古斯塔", role: "流沙峽谷古文明調查員", sprite: "npc_scholar", badge: "[學者]", zoneName: "2.流沙峽谷中央",
      greeting: "「流沙峽谷記載住先民嘅歷史智慧，只要善用斷崖木梯解開南北封印柱，就能挑戰荒漠流沙魔神！」",
      perkLabel: "【村民回禮】接受古斯塔的聖碑共鳴灌注",
      onClaimPerk: function(s) {
        s.monolithPts.chinese = Math.min(100, (s.monolithPts.chinese || 0) + 4);
        s.monolithPts.humanities = Math.min(100, (s.monolithPts.humanities || 0) + 4);
        return "古斯塔為你解讀古卷，【龍語與紀元聖碑共鳴 +4】！";
      },
      villagerQuests: [
        {
          id: "vq_scholar_1",
          title: "【學者委託 1】峽谷甲殼與亞麻纖維研究",
          kind: "deliver", cost: { shell: 2, hemp: 2 },
          desc: "收集洞窟硬甲殼x2 與荒野亞麻x2 交給遺跡學者古斯塔。",
          rewardText: "古文明聖碑殘片x1、流沙秘銀礦x2、320G、聲望+40",
          onComplete: function(s) {
            s.inventory.tabletShard += 1;
            s.inventory.mithril += 2;
            window.Aetheria.State.gainRewards(260, 320, 40);
          }
        },
        {
          id: "vq_scholar_2", reqQuestId: "vq_scholar_1",
          title: "【學者委託 2】古語四連勝共鳴實測",
          kind: "streak", reqVal: 4,
          desc: "在戰鬥中累積達成 4 題連勝紀錄 (Streak x4)，再向古斯塔回報。",
          rewardText: "骷髏魂火x1、古文明聖碑殘片x1、400G、聲望+50",
          onComplete: function(s) {
            s.inventory.coreSkull += 1;
            s.inventory.tabletShard += 1;
            window.Aetheria.State.gainRewards(320, 400, 50);
          }
        }
      ]
    },

    npc_shipwright: {
      id: "npc_shipwright", name: "老船匠・達克", role: "翡翠海岸傳奇造船師", sprite: "npc_shipwright", badge: "[船匠]", zoneName: "3.翡翠海岸碼頭",
      greeting: "「翡翠海岸嘅珊瑚同古帆布係極品造船同鍛造材料，準備充足就可以隨時揚帆渡海！」",
      perkLabel: "【村民回禮】領取達克打撈的深海物資",
      onClaimPerk: function(s) {
        s.inventory.coral += 1;
        return "老船匠達克送了你【深海珊瑚 +1】！";
      },
      villagerQuests: [
        {
          id: "vq_ship_1",
          title: "【船匠委託 1】籌備防水塗料與古帆布",
          kind: "deliver", cost: { pitch: 1, sailCloth: 2 },
          desc: "於工坊熬製防水松脂膠x1，並收集幽靈古帆布x2 交給達克。",
          rewardText: "加工厚木板x2、深海珊瑚x2、420G、聲望+45",
          onComplete: function(s) {
            s.inventory.plank += 2;
            s.inventory.coral += 2;
            window.Aetheria.State.gainRewards(350, 420, 45);
          }
        },
        {
          id: "vq_ship_2", reqQuestId: "vq_ship_1",
          title: "【船匠委託 2】遠航補給鮮魚與珊瑚",
          kind: "deliver", cost: { fish: 2, coral: 2 },
          desc: "收集銀鱗鮮魚x2 與深海珊瑚x2 交給老船匠達克。",
          rewardText: "海妖水核x1、熔岩黑曜石x2、550G、聲望+60",
          onComplete: function(s) {
            s.inventory.coreSiren += 1;
            s.inventory.obsidian += 2;
            window.Aetheria.State.gainRewards(450, 550, 60);
          }
        }
      ]
    },

    npc_astro: {
      id: "npc_astro", name: "星象少女・艾莉婭", role: "古文明聖碑共鳴師", sprite: "npc_astrologer", badge: "[聖碑]", zoneName: "0.曙光營地",
      greeting: "「當你獲得『古文明聖碑殘片』時，隨時來我這裡獻上殘片，解鎖中、英、科、人四大聖碑的永久神恩！」",
      serviceLabel: "開啟古文明聖碑祭壇", serviceAction: "openMonolithModal",
      villagerQuests: [],
      pathActions: [
        {
          id: "pa_astro_inquire", onceKey: "done_pa_astro_inquire", type: "inquire",
          label: "【討教】聖碑奧秘", desc: "單次：獲聖碑殘片x1、洞察藥水x2",
          rewardSummary: "獲得【聖碑殘片x1、洞察藥水x2】！",
          onSuccess: function(state) {
            state.questProgress.done_pa_astro_inquire = true;
            state.inventory.tabletShard += 1;
            state.inventory.potionHint += 2;
            window.Aetheria.State.gainRewards(40, 20, 10);
          }
        }
      ]
    },

    npc_guild: {
      id: "npc_guild", name: "公會會長・雷恩", role: "公會帳篷・記憶共鳴者總長", sprite: "npc_guildmaster", badge: "[公會]", zoneName: "0.公會帳篷內部",
      greeting: "「歡迎來到公會帳篷！你可以隨時查看拓荒日誌、接取公會試煉懸賞，或領取冒險階級晉升俸祿。」",
      serviceLabel: "查看拓荒日誌與公會懸賞", serviceAction: "openGuildModal",
      villagerQuests: [],
      pathActions: [
        {
          id: "pa_guild_inquire", onceKey: "done_pa_guild_inquire", type: "inquire",
          label: "【探查】見習補給", desc: "單次：獲誘餌果x2、生命藥水x2",
          rewardSummary: "獲得【靈獸誘餌果x2、生命藥水x2】！",
          onSuccess: function(state) {
            state.questProgress.done_pa_guild_inquire = true;
            state.inventory.tameFruit += 2;
            state.inventory.potionHeal += 2;
            window.Aetheria.State.gainRewards(40, 30, 15);
          }
        }
      ]
    },

    npc_merch: {
      id: "npc_merch", name: "神秘行商・奇奇", role: "跨大陸奇珍異寶商人", sprite: "npc_merchant", badge: "[行商]", zoneName: "0.曙光營地",
      greeting: "「嘿嘿，所有天然木材同礦石都要靠你親手去野外採集！不過如果你需要生命藥水、洞察藥水、爆破炸彈或者靈獸誘餌果，隨時可以用金幣喺我度買到！」",
      serviceLabel: "開啟煉金與金幣消耗品商店", serviceAction: "openMerchantShop",
      villagerQuests: [],
      pathActions: [
        {
          id: "pa_merch_haggle", onceKey: "done_pa_merch_haggle", type: "inquire",
          label: "【議價】行商見面禮", desc: "單次：獲河床黏土x2、紅傘菇x2",
          rewardSummary: "獲得【河床黏土x2、紅傘微光菇x2】！",
          onSuccess: function(state) {
            state.questProgress.done_pa_merch_haggle = true;
            state.inventory.clay += 2;
            state.inventory.herb += 2;
          }
        }
      ]
    }
  };

  NPCS_DB.npc_merch_canyon = NPCS_DB.npc_merch;

  const GUILD_RANKS = [
    { rank: "F",  name: "銅牌見習", minLv: 1,  minPts: 0,    dailyIron: 2,  dailyPotion: 1, perk: "基礎委託權限" },
    { rank: "E",  name: "鐵牌冒險", minLv: 4,  minPts: 120,  dailyIron: 4,  dailyPotion: 2, perk: "牧場遠征產出鐵礦" },
    { rank: "C",  name: "銀牌探索", minLv: 10, minPts: 320,  dailyIron: 6,  dailyPotion: 2, perk: "解鎖中階討伐懸賞" },
    { rank: "A",  name: "金牌先鋒", minLv: 20, minPts: 700,  dailyIron: 9,  dailyPotion: 3, perk: "戰鬥經驗與金幣 +25%" },
    { rank: "S",  name: "鑽石王牌", minLv: 32, minPts: 1300, dailyIron: 14, dailyPotion: 4, perk: "閃光魔物機率翻倍(16%)" },
    { rank: "SS", name: "破曉宗師", minLv: 45, minPts: 2200, dailyIron: 20, dailyPotion: 6, perk: "開局+1 BP、總攻擊+30%" }
  ];

  const GUILD_BOUNTIES = [
    {
      id: "gb_act_kill2", kind: "action", statKey: "kills", reqVal: 2, minLv: 1,
      title: "【公會討伐】擊敗 2 隻野外魔物", goalLabel: "討伐魔物",
      rewardText: "藍晶鐵礦x2、120G、聲望+25",
      onComplete: function(s) { s.inventory.iron += 2; s.questProgress.bountiesCleared++; window.Aetheria.State.gainRewards(80, 120, 25); }
    },
    {
      id: "gb_act_break2", kind: "action", statKey: "breaks", reqVal: 2, minLv: 1,
      title: "【破盾演練】觸發 2 次 BREAK 破防", goalLabel: "擊破護盾",
      rewardText: "琥珀松脂x2、生命藥水x2、聲望+30",
      onComplete: function(s) { s.inventory.resin += 2; s.inventory.potionHeal += 2; window.Aetheria.State.gainRewards(100, 140, 30); }
    },
    {
      id: "gb_act_streak3", kind: "streak", reqVal: 3, minLv: 1,
      title: "【精準共鳴】達成 3 題連勝紀錄", goalLabel: "當前連勝",
      rewardText: "洞察藥水x2、130G、聲望+25",
      onComplete: function(s) { s.inventory.potionHint += 2; s.questProgress.bountiesCleared++; window.Aetheria.State.gainRewards(90, 130, 25); }
    },
    {
      id: "gb_act_fish1", kind: "action", statKey: "fishes", reqVal: 1, minLv: 1,
      title: "【漁獲補給】於釣魚點釣起 1 條鮮魚", goalLabel: "成功垂釣",
      rewardText: "流沙秘銀礦x1、紅傘菇x2、聲望+25",
      onComplete: function(s) { s.inventory.mithril += 1; s.inventory.herb += 2; s.questProgress.bountiesCleared++; window.Aetheria.State.gainRewards(85, 120, 25); }
    },
    {
      id: "gb_act_cook1", kind: "action", statKey: "meals", reqVal: 1, minLv: 1,
      title: "【營地大廚】於營地鍋爐烹調 1 道料理", goalLabel: "烹調料理",
      rewardText: "靈獸誘餌果x1、150G、聲望+25",
      onComplete: function(s) { s.inventory.tameFruit += 1; s.questProgress.bountiesCleared++; window.Aetheria.State.gainRewards(90, 150, 25); }
    },
    {
      id: "gb_act_kill4", kind: "action", statKey: "kills", reqVal: 4, minLv: 6,
      title: "【清剿行動】擊敗 4 隻野外魔物", goalLabel: "討伐魔物",
      rewardText: "流沙秘銀礦x2、220G、聲望+40",
      onComplete: function(s) { s.inventory.mithril += 2; s.questProgress.bountiesCleared++; window.Aetheria.State.gainRewards(160, 220, 40); }
    }
  ];

  function getAvailableBounties(state) {
    const lv = (state && state.lv) || 1;
    const seed = (state && state.bountyPoolSeed) || 1;
    const activeIds = ((state && state.activeBounties) || []).map(function(e) { return (typeof e === "string") ? e : e.id; });

    const eligible = GUILD_BOUNTIES.filter(function(b) {
      return activeIds.indexOf(b.id) === -1 && lv >= (b.minLv || 1);
    });

    if (eligible.length <= 4) return eligible;

    const picked = [];
    for (let i = 0; i < eligible.length && picked.length < 4; i++) {
      const idx = (seed * 3 + i * 2) % eligible.length;
      const cand = eligible[idx];
      if (picked.indexOf(cand) === -1) picked.push(cand);
    }
    return picked;
  }

  function getCurrentMainQuest(state) {
    for (let i = 0; i < MAIN_QUESTS.length; i++) {
      const q = MAIN_QUESTS[i];
      if (!state.questProgress["claimed_" + q.id]) {
        return q;
      }
    }
    return null;
  }

  function isVillagerQuestUnlocked(state, vq) {
    if (!vq) return false;
    if (vq.reqMainQuest && !(state.questProgress && state.questProgress["claimed_" + vq.reqMainQuest])) {
      return false;
    }
    if (vq.reqQuestId) {
      const prev = state.npcQuests && state.npcQuests[vq.reqQuestId];
      if (!prev || prev.status !== "completed") return false;
    }
    return true;
  }

  function isVillagerQuestReady(state, vq) {
    if (!vq) return false;
    const qRec = state.npcQuests && state.npcQuests[vq.id];
    if (!qRec || qRec.status !== "accepted") return false;

    if (vq.kind === "deliver") {
      return window.Aetheria.Data.CraftingHelper.canAfford(state.inventory, vq.cost);
    }
    if (vq.kind === "action") {
      const cur = (state.bountyStats && state.bountyStats[vq.statKey]) || 0;
      return (cur - (qRec.startVal || 0)) >= vq.reqVal;
    }
    if (vq.kind === "streak") {
      return (state.streak || 0) >= vq.reqVal;
    }
    return false;
  }

  function getVillagerQuestProgressList(state, vq) {
    const rec = state.npcQuests && state.npcQuests[vq.id];
    const done = rec && rec.status === "completed";
    if (vq.kind === "deliver") {
      return calcCostProgressList(state, vq.cost, done);
    }
    if (vq.kind === "action") {
      const startVal = (rec && rec.startVal) || 0;
      const cur = done ? vq.reqVal : Math.max(0, ((state.bountyStats && state.bountyStats[vq.statKey]) || 0) - startVal);
      return [{ name: vq.goalLabel || "進度", cur: Math.min(vq.reqVal, cur), max: vq.reqVal }];
    }
    if (vq.kind === "streak") {
      return [{ name: "連勝題數", cur: done ? vq.reqVal : (state.streak || 0), max: vq.reqVal }];
    }
    return [];
  }

  function getNpcMarkerState(state, npcId) {
    const mq = getCurrentMainQuest(state);
    if (mq && mq.giverNpcId === npcId) {
      const isAcc = Boolean(state.questProgress && state.questProgress["acc_" + mq.id]);
      if (!isAcc) return "avail";
      if (mq.checkComplete(state)) return "ready";
      return "active";
    }

    const npc = NPCS_DB[npcId];
    if (npc && npc.villagerQuests && npc.villagerQuests.length > 0) {
      let hasActive = false;
      for (let i = 0; i < npc.villagerQuests.length; i++) {
        const vq = npc.villagerQuests[i];
        if (!isVillagerQuestUnlocked(state, vq)) continue;
        const rec = state.npcQuests && state.npcQuests[vq.id];
        if (!rec) return "avail";
        if (rec.status === "accepted") {
          if (isVillagerQuestReady(state, vq)) return "ready";
          hasActive = true;
        }
      }
      if (hasActive) return "active";
    }
    return null;
  }

  // ================= 問題 1 核心解決方案：全 10 位 NPC 四階段即時動態對話狀態機 =================
  function getNpcDynamicGreeting(state, npcId) {
    const npc = NPCS_DB[npcId];
    if (!npc) return "";

    const mq = getCurrentMainQuest(state);

    // 1. 若當前主線正是由這位 NPC 負責：依「未接取 / 已接取進行中 / 可交付」三種狀態即時切換台詞！
    if (mq && mq.giverNpcId === npcId) {
      const isAcc = Boolean(state.questProgress && state.questProgress["acc_" + mq.id]);
      const isDone = mq.checkComplete(state);

      if (!isAcc) {
        return "「Justin！我有新嘅主線任務【" + mq.title + "】交託俾你！快點擊下方黃色嘅『！可接主線』卡片接受任務啦！」";
      }
      if (isDone) {
        return "「太出色喇 Justin！你已經順利完成【" + mq.title + "】嘅所有條件！快點擊下方綠色嘅『✓ 可交付領獎』卡片領取報酬啦！」";
      }
      // 已接取・進行中（即時切換為該任務的執行指引，絕不停留在上一句「請接取任務」！）
      return "「你已經接咗【" + mq.title + "】喇！請按步驟完成：『" + mq.desc + "』，完成後記住返嚟搵我領獎！」";
    }

    // 2. 檢查這位 NPC 是否有已解鎖的「村民支線委託」，同樣依「未接 / 進行中 / 可交付」即時切換台詞！
    if (npc.villagerQuests && npc.villagerQuests.length > 0) {
      for (let i = 0; i < npc.villagerQuests.length; i++) {
        const vq = npc.villagerQuests[i];
        if (!isVillagerQuestUnlocked(state, vq)) continue;
        const rec = state.npcQuests && state.npcQuests[vq.id];
        if (!rec) {
          return "「Justin，我呢度有個支線委託【" + vq.title + "】想請你幫手，點擊下方黃色卡片就可以接取！」";
        }
        if (rec.status === "accepted") {
          if (isVillagerQuestReady(state, vq)) {
            return "「哇！你已經幫我湊齊【" + vq.title + "】嘅要求喇！快點擊下方綠色卡片交付領獎啦！」";
          }
          return "「多謝你接下【" + vq.title + "】！目標係：『" + vq.desc + "』，完成後隨時返嚟搵我交付！」";
        }
      }
    }

    // 3. 若當前這位 NPC 沒有進行中的任務，顯示符合當前世界進度的日常台詞，並貼心提示當前主線去向！
    const baseGreeting = npc.greeting || "";
    if (mq) {
      return baseGreeting + "（提示：當前主線【" + mq.title + "】請前往「" + mq.giverZone + "」搵【" + mq.giverName + "】！）";
    }
    return baseGreeting;
  }

  window.Aetheria.Data.STORY_CUTSCENES = STORY_CUTSCENES;
  window.Aetheria.Data.MONOLITHS_DB = MONOLITHS_DB;
  window.Aetheria.Data.MAIN_QUESTS = MAIN_QUESTS;
  window.Aetheria.Data.NPCS_DB = NPCS_DB;
  window.Aetheria.Data.GUILD_RANKS = GUILD_RANKS;
  window.Aetheria.Data.GUILD_BOUNTIES = GUILD_BOUNTIES;
  window.Aetheria.Data.getAvailableBounties = getAvailableBounties;
  window.Aetheria.Data.getCurrentMainQuest = getCurrentMainQuest;
  window.Aetheria.Data.isVillagerQuestUnlocked = isVillagerQuestUnlocked;
  window.Aetheria.Data.isVillagerQuestReady = isVillagerQuestReady;
  window.Aetheria.Data.getVillagerQuestProgressList = getVillagerQuestProgressList;
  window.Aetheria.Data.getNpcMarkerState = getNpcMarkerState;
  window.Aetheria.Data.getNpcDynamicGreeting = getNpcDynamicGreeting;
})();
