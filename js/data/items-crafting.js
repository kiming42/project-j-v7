/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 40種素材、零衝突建材配方與禁買素材商店 (items-crafting.js - v6.6)
 * 修正：1.GOLD_SHOP (金幣商店) 移除所有採集素材 (枯枝/燧石/黏土/松脂/原木/藤蔓/鐵礦)，
 *         杜絕玩家用金幣偷雞買素材交任務！所有素材必須親手去地圖採集或戰鬥獲得！
 *       2.金幣只限購買 4 種冒險消耗品 (生命藥水、洞察藥水、爆破炸彈、靈獸誘餌果)
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.Data = window.Aetheria.Data || {};

(function() {
  const MATERIALS = {
    branch:      { id: "branch",      name: "散落枯枝",     tier: 1, desc: "【營地/森林｜徒手拾取】無需工具即可拾取的乾枯樹枝，生火與造繩材料。" },
    flint:       { id: "flint",       name: "尖銳燧石",     tier: 1, desc: "【營地/森林｜徒手拾取】鋒利的打火石片，修復鍛造熔爐與點火必備。" },
    clay:        { id: "clay",        name: "河床黏土",     tier: 1, desc: "【營地池畔/河岸｜徒手拾取】濕潤的耐火陶土，用於修築熔爐、燈塔與耐火磚。" },
    resin:       { id: "resin",       name: "琥珀松脂",     tier: 1, desc: "【第1區森林｜需Lv.1手斧】採集松脂樹樁或擊敗森林魔物獲得，加工木板與防水膠。" },
    basalt:      { id: "basalt",      name: "玄武岩塊",     tier: 2, desc: "【第1~5區｜需Lv.2重鎬】開採玄武岩、擊碎巨石或擊敗骷髏獲得，石造工程基石。" },
    hemp:        { id: "hemp",        name: "荒野亞麻",     tier: 2, desc: "【第2區峽谷/第3區海岸｜需Lv.2戰斧】高強度韌皮纖維，編織麻繩與風帆必備。" },
    sailCloth:   { id: "sailCloth",   name: "幽靈古帆布",   tier: 2, desc: "【第3區海岸】拾取沉船帆布或擊敗幽靈海盜掉落，縫製遠航風帆的關鍵布料。" },
    sinew:       { id: "sinew",       name: "強韌獸筋",     tier: 3, desc: "【第4區雪原】獵場拾取或擊敗雪原魔物掉落，綁紮極地防風毛皮屋與高階防具。" },

    plank:       { id: "plank",       name: "加工厚木板",   tier: 2, desc: "【工坊建材】由翠風原木x2 + 琥珀松脂x1 加工而成，建造吊橋、木梯與木筏龍骨。" },
    rope:        { id: "rope",        name: "強化麻繩索",   tier: 2, desc: "【工坊建材】由堅韌藤蔓x2 + 散落枯枝x1 編織而成，承受吊橋與絞盤拉力。" },
    nails:       { id: "nails",       name: "鍛造鐵釘",     tier: 2, desc: "【工坊建材】由藍晶鐵礦x2 鍛打而成，固定大型木造工程結構。" },
    pitch:       { id: "pitch",       name: "防水松脂膠",   tier: 2, desc: "【工坊建材】由琥珀松脂x2 + 河床黏土x1 熬製而成，塗抹遠航木筏防止滲水。" },
    heavySail:   { id: "heavySail",   name: "遠航風帆",     tier: 3, desc: "【工坊建材】由幽靈古帆布x2 + 荒野亞麻x1 + 強化麻繩索x1 縫製的破浪大帆。" },
    firebrick:   { id: "firebrick",   name: "黑曜耐火磚",   tier: 3, desc: "【工坊建材】由河床黏土x1 + 玄武岩塊x1 + 熔岩黑曜石x1 燒製，可抵禦火山熔岩。" },

    iron:        { id: "iron",        name: "藍晶鐵礦",     tier: 1, desc: "【第1區森林｜需Lv.1鐵鎬】基礎鍛造礦石，每次採集 +1。" },
    mithril:     { id: "mithril",     name: "流沙秘銀礦",   tier: 2, desc: "【第1-B洞窟 & 第2區峽谷｜需Lv.2重鎬】蘊含魔力的銀白礦石。" },
    obsidian:    { id: "obsidian",    name: "熔岩黑曜石",   tier: 3, desc: "【第4區雪原 & 第5區火山｜需Lv.3鑽頭】高溫凝結的黑曜晶礦。" },
    starIron:    { id: "starIron",    name: "深淵星隕鐵",   tier: 4, desc: "【第6區天界｜需Lv.3鑽頭】自星界墜落的神話金屬。" },

    wood:        { id: "wood",        name: "翠風原木",     tier: 1, desc: "【第1區森林｜需Lv.1手斧】砍伐老樹樁獲得，加工木板與鍛造必備。" },
    herb:        { id: "herb",        name: "紅傘微光菇",   tier: 1, desc: "【第1區森林 & 洞窟｜需Lv.1手斧】微光蘑菇，用於鍛造與煲湯。" },
    vine:        { id: "vine",        name: "堅韌藤蔓",     tier: 1, desc: "【第1區森林｜需Lv.1手斧】採集藤蔓叢或擊敗竹妖獲得。" },
    flower:      { id: "flower",      name: "翠風太陽花",   tier: 2, desc: "【第2區峽谷 & 第3區海岸｜需Lv.2戰斧】向陽盛開的高階靈花。" },
    iceLotus:    { id: "iceLotus",    name: "雪山冰蓮",     tier: 3, desc: "【第4區雪原｜需Lv.2戰斧】極寒雪原永不凋謝的冰蓮。" },
    goldLeaf:    { id: "goldLeaf",    name: "世界樹金葉",   tier: 4, desc: "【第6區天界｜需Lv.3神斧】浮空聖殿飄落的神聖金葉。" },

    shell:       { id: "shell",       name: "洞窟硬甲殼",   tier: 2, desc: "【第1-B洞窟 & 第2區峽谷】擊敗骷髏衛兵掉落，打造鎖甲與絞盤齒輪。" },
    coral:       { id: "coral",       name: "深海珊瑚",     tier: 2, desc: "【第3區海岸｜需Lv.2重鎬】採集珊瑚礁或擊敗海盜獲得。" },
    fur:         { id: "fur",         name: "霜狼禦寒毛皮", tier: 3, desc: "【第4區雪原】擊敗雪原魔物掉落，縫製毛皮甲與極地防風屋。" },
    magmaScale:  { id: "magmaScale",  name: "熔岩龍鱗",     tier: 3, desc: "【第5區火山】擊敗火山魔將掉落，打造神鎧與熔岩拱橋。" },
    fish:        { id: "fish",        name: "銀鱗鮮魚",     tier: 2, desc: "【水波釣魚點】完成垂釣小遊戲獲得（需先向老漁夫阿海領取釣竿）。" },
    tabletShard: { id: "tabletShard", name: "古文明聖碑殘片", tier: 4, desc: "【領主/賞金首掉落】於星象師艾莉婭處修復四大聖碑。" },

    coreBamboo:  { id: "coreBamboo",  name: "竹精木心",     tier: 1, desc: "【竹子妖 BREAK 破防掉落】可鍛造、建橋或鑲嵌：每回回血 +20。" },
    coreSkull:   { id: "coreSkull",   name: "骷髏魂火",     tier: 2, desc: "【骷髏怪 BREAK 破防掉落】可鍛造或鑲嵌：20% 攻擊吸血。" },
    coreSiren:   { id: "coreSiren",   name: "海妖水核",     tier: 2, desc: "【海岸魔物 BREAK 破防掉落】可造船或鑲嵌：舉盾反彈 100% 傷害。" },
    coreWolf:    { id: "coreWolf",    name: "雪狼冰魄",     tier: 3, desc: "【雪原魔物 BREAK 破防掉落】可建屋或鑲嵌：開局冰封敵人 1 回合。" },
    coreGolem:   { id: "coreGolem",   name: "炎魔熔核",     tier: 3, desc: "【火山魔物 BREAK 破防掉落】可造橋或鑲嵌：攻擊+25、護盾穿透。" },
    coreDragon:  { id: "coreDragon",  name: "龍王逆鱗",     tier: 4, desc: "【守關領主 BREAK 破防掉落】可鍛造或鑲嵌：破防暴擊傷害 +50%。" },

    potionHeal:  { id: "potionHeal",  name: "生命藥水",     tier: 1, desc: "飲用後回復 70 點生命值（科學聖碑神恩翻倍至 140 點）。" },
    potionHint:  { id: "potionHint",  name: "洞察藥水",     tier: 2, desc: "英文串字時自動填入每個單詞的首字母。" },
    bombItem:    { id: "bombItem",    name: "爆破炸彈",     tier: 2, desc: "炸開洞穴「裂縫岩壁」（需先救出見習礦工石頭取得火藥袋）。" },
    tameFruit:   { id: "tameFruit",   name: "靈獸誘餌果",   tier: 2, desc: "在魔物破防殘血時投擲，答對題目即可收服。" }
  };

  const WORKSHOP_RECIPES = [
    {
      id: "wk_plank", toKey: "plank", toCount: 1, name: "加工【加工厚木板 x1】",
      cost: { wood: 2, resin: 1 }, desc: "用於建造跨河吊橋、峽谷木梯、遠航木筏與雪原防風屋"
    },
    {
      id: "wk_rope", toKey: "rope", toCount: 1, name: "編織【強化麻繩索 x1】",
      cost: { vine: 2, branch: 1 }, desc: "用於綁紮跨河吊橋、峽谷絞盤木梯與縫製遠航風帆"
    },
    {
      id: "wk_nails", toKey: "nails", toCount: 1, name: "鍛打【鍛造鐵釘 x1】",
      cost: { iron: 2 }, desc: "用於固定跨河吊橋與峽谷重型木梯"
    },
    {
      id: "wk_pitch", toKey: "pitch", toCount: 1, name: "熬製【防水松脂膠 x1】",
      cost: { resin: 2, clay: 1 }, desc: "用於塗抹翡翠海岸「破浪遠航木筏」船縫"
    },
    {
      id: "wk_sail", toKey: "heavySail", toCount: 1, name: "縫製【遠航風帆 x1】",
      cost: { sailCloth: 2, hemp: 1, rope: 1 }, desc: "用於組裝翡翠海岸「破浪遠航木筏」主帆"
    },
    {
      id: "wk_brick", toKey: "firebrick", toCount: 1, name: "燒製【黑曜耐火磚 x1】",
      cost: { clay: 1, basalt: 1, obsidian: 1 }, desc: "用於鋪設第五區火山「黑曜耐火石拱橋」"
    }
  ];

  const SURVIVAL_PROJECTS = {
    proj_camp_forge: {
      id: "proj_camp_forge",
      name: "修復巴爾的鍛造熔爐",
      zoneId: "tent_forge",
      desc: "在營地徒手拾取枯枝、燧石與池畔黏土修復熄滅的熔爐。完成後鐵匠巴爾將授予你【新手蒼藍忍刀】、【Lv.1 石製手斧】與【Lv.1 新手鐵鎬】！",
      cost: { branch: 3, flint: 3, clay: 2 },
      rewardText: "獲得【新手蒼藍忍刀】、【Lv.1 石製手斧】、【Lv.1 新手鐵鎬】！",
      onComplete: function(s) {
        if (s.unlockedWeapons.indexOf("w_starter") === -1) s.unlockedWeapons.push("w_starter");
        s.equippedWeapon = "w_starter";
        s.tools.axe = Math.max(1, s.tools.axe || 0);
        s.tools.pickaxe = Math.max(1, s.tools.pickaxe || 0);
        s.questProgress.mq_01_talked = true;
        s.inventory.branch = (s.inventory.branch || 0) + 2;
        s.inventory.vine = (s.inventory.vine || 0) + 1;
        window.Aetheria.State.gainRewards(50, 80, 20);
      }
    },
    proj_z1_bridge: {
      id: "proj_z1_bridge",
      name: "建造【跨河加固吊橋】",
      zoneId: "zone1_forest",
      desc: "洪水沖毀了通往東岸領主的木橋。請先在森林採集原木、松脂、藤蔓與鐵礦，回營地【工坊 ➔ 建材加工】合成木板、麻繩與鐵釘後再來修橋！",
      cost: { plank: 3, rope: 2, nails: 2, coreBamboo: 1 },
      rewardText: "跨河吊橋落成！可通行至森林東岸挑戰守關領主！",
      onComplete: function(s) {
        window.Aetheria.State.gainRewards(150, 180, 35);
      }
    },
    proj_cave1_beacon: {
      id: "proj_cave1_beacon",
      name: "砌築【永明聖火燈塔】",
      zoneId: "cave1_mushroom",
      desc: "洞窟黑霧濃厚，需以玄武岩塊與黏土砌築燈塔，並以松脂、燧石與流沙秘銀點燃永明聖火，徹底驅散洞窟黑暗！",
      cost: { basalt: 2, clay: 2, resin: 2, flint: 2, mithril: 1 },
      rewardText: "永明聖火點亮！洞窟黑霧永久驅散！",
      onComplete: function(s) {
        s.openedNodes.lit_cave1_mushroom = true;
        window.Aetheria.State.gainRewards(220, 240, 40);
      }
    },
    proj_z2_ladder: {
      id: "proj_z2_ladder",
      name: "架設【斷崖重型絞盤木梯】",
      zoneId: "zone2_canyon",
      desc: "峽谷北翼封印柱位於高聳斷崖上。需投入厚木板、麻繩、鐵釘與洞窟硬甲殼（絞盤齒輪）架設重型木梯才可攀登！",
      cost: { plank: 3, rope: 2, nails: 2, shell: 2 },
      rewardText: "斷崖木梯架設完成！可按 A 鍵上下攀爬北翼斷崖！",
      onComplete: function(s) {
        window.Aetheria.State.gainRewards(300, 320, 45);
      }
    },
    proj_z3_raft: {
      id: "proj_z3_raft",
      name: "建造【破浪遠航木筏】",
      zoneId: "zone3_coast",
      desc: "深海阻隔了前往東岸幽靈船長的水道。請收集漂流原木、松脂、黏土、古帆布與亞麻，於營地工坊合成木板、防水膠與遠航風帆來造船！",
      cost: { plank: 4, pitch: 2, heavySail: 1, coral: 2, coreSiren: 1 },
      rewardText: "破浪遠航木筏下水！成功打通跨海航道！",
      onComplete: function(s) {
        window.Aetheria.State.gainRewards(450, 500, 60);
      }
    },
    proj_z4_shelter: {
      id: "proj_z4_shelter",
      name: "搭建【極地防風毛皮屋】",
      zoneId: "zone4_snow",
      desc: "暴風雪肆虐！在雪原中央搭建防風毛皮屋，完工後不僅能永久免除雪原凍傷，還能作為前線免費回血休整站！",
      cost: { basalt: 2, plank: 2, fur: 3, sinew: 2, coreWolf: 1 },
      rewardText: "極地防風毛皮屋落成！獲得永久雪原抗寒庇護！",
      onComplete: function(s) {
        s.hp = s.maxHp;
        window.Aetheria.State.gainRewards(650, 700, 75);
      }
    },
    proj_z5_bridge: {
      id: "proj_z5_bridge",
      name: "鋪設【黑曜耐火石拱橋】",
      zoneId: "zone5_volcano",
      desc: "滾燙的熔岩河阻斷了前往紅蓮龍皇祭壇的道路。必須在工坊燒製「黑曜耐火磚」並搭配熔岩龍鱗與炎魔熔核鋪設石拱橋！",
      cost: { firebrick: 3, magmaScale: 2, mithril: 2, coreGolem: 1 },
      rewardText: "黑曜耐火石拱橋落成！可跨越熔岩河挑戰紅蓮火山龍皇！",
      onComplete: function(s) {
        window.Aetheria.State.gainRewards(950, 1000, 90);
      }
    }
  };

  const WEAPONS = {
    w_starter: {
      id: "w_starter", name: "新手蒼藍忍刀", tier: 1, reqLv: 1, atk: 15, shieldBreak: 0,
      element: "物理", desc: "修復營地鍛造爐後由巴爾鍛造授予。", cost: {}
    },
    w_vine: {
      id: "w_vine", name: "翠風荊棘短刃", tier: 2, reqLv: 2, atk: 30, shieldBreak: 0,
      element: "木屬", desc: "以森林原木、藍晶與藤蔓打造的鋒利短刃。",
      cost: { wood: 3, iron: 3, vine: 2 }
    },
    w_tide: {
      id: "w_tide", name: "潮汐破盾忍刀", tier: 3, reqLv: 4, atk: 48, shieldBreak: 1,
      element: "水屬", desc: "每次答對額外削盾 +1",
      cost: { iron: 4, herb: 3, wood: 3, coreBamboo: 1 }
    },
    w_bone: {
      id: "w_bone", name: "岩窟碎甲重刃", tier: 4, reqLv: 7, atk: 72, shieldBreak: 1,
      element: "地屬", desc: "額外削盾 +1",
      cost: { mithril: 3, shell: 3, iron: 4, coreBamboo: 2 }
    },
    w_flame: {
      id: "w_flame", name: "赤炎連斬太刀", tier: 5, reqLv: 11, atk: 102, shieldBreak: 1, spellBonus: 1.35,
      element: "火屬", desc: "額外削盾 +1，拼字題傷害 +35%",
      cost: { mithril: 4, flower: 3, shell: 3, coreSkull: 1 }
    },
    w_coral: {
      id: "w_coral", name: "淵海珊瑚雙刃", tier: 6, reqLv: 16, atk: 140, shieldBreak: 1, bpGainBonus: 1,
      element: "水屬", desc: "額外削盾 +1，答對多充能 1 顆 BP",
      cost: { coral: 4, fish: 2, mithril: 4, coreSiren: 1 }
    },
    w_thunder: {
      id: "w_thunder", name: "雷鳴疾風雙刃", tier: 7, reqLv: 22, atk: 185, shieldBreak: 1, bpGainBonus: 1,
      element: "雷屬", desc: "額外削盾 +1，額外充能 BP",
      cost: { coral: 5, flower: 4, mithril: 5, coreSiren: 2 }
    },
    w_frost: {
      id: "w_frost", name: "永凍冰龍神劍", tier: 8, reqLv: 30, atk: 245, shieldBreak: 2,
      element: "冰屬", desc: "每次答對直接額外削盾 +2",
      cost: { iceLotus: 4, fur: 4, obsidian: 3, coreWolf: 2 }
    },
    w_magma: {
      id: "w_magma", name: "紅蓮煉獄巨劍", tier: 9, reqLv: 40, atk: 320, shieldBreak: 2, spellBonus: 1.5,
      element: "火屬", desc: "額外削盾 +2，拼字與看圖題暴擊 +50%",
      cost: { obsidian: 5, magmaScale: 4, coreGolem: 2, coreDragon: 1 }
    },
    w_dawn: {
      id: "w_dawn", name: "艾瑟瑞亞破曉神刃", tier: 10, reqLv: 50, atk: 420, shieldBreak: 2, bpGainBonus: 1,
      element: "全屬性", desc: "額外削盾 +2、每擊回血 10%、BP +1",
      cost: { starIron: 6, goldLeaf: 5, magmaScale: 4, coreDragon: 2 }
    }
  };

  const ARMORS = {
    a_cloth: {
      id: "a_cloth", name: "新手旅人布衣", tier: 1, reqLv: 1, def: 6, hpBonus: 0,
      desc: "輕便的旅人布衣。", cost: {}
    },
    a_vine: {
      id: "a_vine", name: "翠風堅韌藤甲", tier: 2, reqLv: 3, def: 18, hpBonus: 55,
      desc: "以森林藤蔓與原木編織的護甲。",
      cost: { wood: 3, vine: 3, herb: 2, coreBamboo: 1 }
    },
    a_mithril: {
      id: "a_mithril", name: "岩窟秘銀鎖甲", tier: 3, reqLv: 8, def: 44, hpBonus: 130,
      desc: "流沙秘銀與硬甲殼打造的鎖子甲。",
      cost: { mithril: 3, shell: 3, iron: 3, coreSkull: 1 }
    },
    a_siren: {
      id: "a_siren", name: "潮汐海鱗戰鎧", tier: 4, reqLv: 16, def: 82, hpBonus: 230,
      desc: "鑲有深海珊瑚的波紋戰鎧。",
      cost: { coral: 4, fish: 2, mithril: 3, coreSiren: 1 }
    },
    a_frost: {
      id: "a_frost", name: "霜狼禦寒毛皮甲", tier: 5, reqLv: 26, def: 135, hpBonus: 380,
      resistCold: true,
      desc: "【極寒抗性】永久免疫第四區雪原凍傷！",
      cost: { iceLotus: 3, fur: 3, sinew: 2, coreWolf: 1 }
    },
    a_dragon: {
      id: "a_dragon", name: "黑曜龍鱗神鎧", tier: 6, reqLv: 38, def: 225, hpBonus: 600,
      resistAll: true,
      desc: "【全環境免疫】永久免疫雪原凍傷與火山灼傷！",
      cost: { obsidian: 4, magmaScale: 4, firebrick: 2, coreGolem: 2 }
    }
  };

  const RUNES = {
    coreBamboo: { id: "coreBamboo", name: "竹精木心符文", title: "生機共鳴", desc: "每次答對題目，自動額外回復 +20 HP。" },
    coreSkull:  { id: "coreSkull",  name: "骷髏魂火符文", title: "噬魂吸血", desc: "攻擊造成傷害時，吸取 20% 轉化為自身 HP。" },
    coreSiren:  { id: "coreSiren",  name: "海妖水核符文", title: "潮汐反甲", desc: "開啟【舉盾】防禦時，將敵人 100% 攻擊力反彈！" },
    coreWolf:   { id: "coreWolf",   name: "雪狼冰魄符文", title: "極寒先制", desc: "開局第 1 回合自動冰封敵人，令其無法反擊！" },
    coreGolem:  { id: "coreGolem",  name: "炎魔熔核符文", title: "熔岩狂暴", desc: "基礎攻擊力 +25，且未破防時護盾穿透傷害提升。" },
    coreDragon: { id: "coreDragon", name: "龍王逆鱗符文", title: "破曉處決", desc: "對 BREAK 破防暈眩敵人造成的暴擊傷害 +50%！" }
  };

  const CAMP_MEALS = {
    meal_soup: {
      id: "meal_soup", name: "微光蘑菇濃湯", battles: 3,
      cost: { herb: 2, wood: 1 },
      desc: "持續 3 場戰鬥：MaxHP 臨時 +80，每回再生 +15 HP。"
    },
    meal_fish: {
      id: "meal_fish", name: "香煎秘銀魚排", battles: 3,
      cost: { fish: 1, herb: 1 },
      desc: "持續 3 場戰鬥：每次答對額外削減 1 點護盾（破盾 +1）！"
    },
    meal_steak: {
      id: "meal_steak", name: "野味藤椒烤肉", battles: 3,
      cost: { vine: 2, herb: 1 },
      desc: "持續 3 場戰鬥：開局額外 +1 BP，且造成傷害 +20%。"
    },
    meal_hotpot: {
      id: "meal_hotpot", name: "暖陽抗寒抗熱火鍋", battles: 3,
      cost: { flower: 2, herb: 2, resin: 1 },
      desc: "持續 3 場戰鬥：獲得【極寒與熔岩免疫】！"
    }
  };

  const RELICS = {
    r_cloak: {
      id: "r_cloak", name: "翠風旅人披風", reqLv: 4,
      desc: "MaxHP +50，移動速度 +15%",
      cost: { wood: 3, vine: 3, rope: 1, coreBamboo: 1 },
      onCraft: function() { window.Aetheria.State.recalcMaxHp(); }
    },
    r_ring: {
      id: "r_ring", name: "學者智慧指環", reqLv: 10,
      desc: "四選一題目自動排除 1 個錯誤選項",
      cost: { mithril: 3, flower: 2, shell: 2, coreSkull: 1 }
    },
    r_charm: {
      id: "r_charm", name: "幸運尋寶護符", reqLv: 18,
      desc: "戰鬥金幣與經驗獲取額外 +20%",
      cost: { coral: 3, mithril: 3, fish: 2, coreSiren: 1 }
    }
  };

  const TOOLS_UPGRADE = {
    pickaxe: {
      name: "十字鎬",
      npcHint: "需先收集枯枝、燧石與黏土修復【鐵匠巴爾】的熔爐以獲贈 Lv.1 鐵鎬",
      levels: {
        0: { title: "未持有", desc: "請先幫營地【鐵匠巴爾】修復鍛造熔爐以獲得新手鐵鎬。" },
        1: { title: "新手鐵鎬", desc: "可開採第 1 區【藍晶鐵礦】。" },
        2: { title: "秘銀重鎬", reqLv: 4, desc: "可敲碎巨石獲【玄武岩塊】，並可開採【流沙秘銀】與【深海珊瑚】！", cost: { iron: 4, wood: 3, coreBamboo: 1 } },
        3: { title: "星隕鑽頭", reqLv: 18, desc: "可開採【熔岩黑曜石】與【深淵星隕鐵】！", cost: { mithril: 4, coral: 3, basalt: 2, coreSkull: 1 } }
      }
    },
    axe: {
      name: "伐木斧",
      npcHint: "需先幫營地【鐵匠巴爾】修復鍛造熔爐以獲贈 Lv.1 手斧",
      levels: {
        0: { title: "未持有", desc: "請先幫營地【鐵匠巴爾】修復鍛造熔爐以獲得石製手斧。" },
        1: { title: "石製手斧", desc: "可採集第 1 區【翠風原木】、【琥珀松脂】、【紅傘菇】與【藤蔓】。" },
        2: { title: "烈焰戰斧", reqLv: 4, desc: "可砍斷枯木，並可採集【翠風太陽花】、【荒野亞麻】與【雪山冰蓮】！", cost: { wood: 4, vine: 3, iron: 3, coreBamboo: 1 } },
        3: { title: "雷鳴神斧", reqLv: 18, desc: "可採集【世界樹金葉】，伐木時有機會發現誘餌果！", cost: { flower: 4, hemp: 2, mithril: 3, coreSiren: 1 } }
      }
    },
    hook: {
      name: "釣竿與抓鉤",
      npcHint: "需先找營地池塘邊的【老漁夫・阿海】完成首次委託以獲贈 Lv.1 釣竿",
      levels: {
        0: { title: "未持有", desc: "請先找營地池塘邊的【老漁夫・阿海】對話並完成他的委託！" },
        1: { title: "竹製釣魚竿", desc: "可在水波釣魚點啟動【垂釣小遊戲】釣取銀鱗鮮魚。" },
        2: { title: "鐵索飛爪鉤", reqLv: 5, desc: "可對準「抓鉤木樁」飛越斷崖，且垂釣命中區加寬 35%！", cost: { rope: 2, nails: 2, iron: 2 } },
        3: { title: "深海黃金鉤", reqLv: 18, desc: "垂釣命中區加寬 70%，完美收竿額外獲深海珊瑚！", cost: { coral: 3, fish: 2, mithril: 3 } }
      }
    },
    bomb: {
      name: "爆破火藥袋",
      npcHint: "需先在第一區森林北翼洞口幫助【見習礦工・石頭】以獲贈 Lv.1 火藥袋",
      levels: {
        0: { title: "未持有", desc: "請先到第一區森林北翼洞口找【見習礦工・石頭】完成委託！" },
        1: { title: "基礎火藥袋", desc: "可使用炸彈炸開洞穴「裂縫岩壁」進入隱藏賞金首密室。" },
        2: { title: "連環爆破袋", reqLv: 6, desc: "進入戰鬥時自動先炸裂敵人 1 點護盾", cost: { iron: 4, resin: 2, coreBamboo: 1 } },
        3: { title: "符文爆破核心", reqLv: 20, desc: "進入戰鬥時自動炸裂敵人 2 點護盾", cost: { mithril: 4, coral: 3, coreSiren: 1 } }
      }
    }
  };

  const ALCHEMY_CONVERSIONS = [
    { id: "conv_rope_hemp", name: "編織【強化麻繩索 x1】", fromKey: "hemp",     fromCount: 2, toKey: "rope",       toCount: 1 },
    { id: "conv_mithril",   name: "提煉【流沙秘銀礦 x1】", fromKey: "iron",     fromCount: 3, toKey: "mithril",    toCount: 1 },
    { id: "conv_obsidian",  name: "熔煉【熔岩黑曜石 x1】", fromKey: "mithril",  fromCount: 3, toKey: "obsidian",   toCount: 1 },
    { id: "conv_star",      name: "凝聚【深淵星隕鐵 x1】", fromKey: "obsidian", fromCount: 3, toKey: "starIron",   toCount: 1 },
    { id: "conv_flower",    name: "培育【翠風太陽花 x1】", fromKey: "herb",     fromCount: 3, toKey: "flower",     toCount: 1 },
    { id: "conv_lotus",     name: "結晶【雪山冰蓮 x1】",   fromKey: "flower",   fromCount: 3, toKey: "iceLotus",   toCount: 1 },
    { id: "conv_goldleaf",  name: "昇華【世界樹金葉 x1】", fromKey: "iceLotus", fromCount: 3, toKey: "goldLeaf",   toCount: 1 },
    { id: "conv_heal",      name: "熬製【生命藥水 x1】",   fromKey: "herb",     fromCount: 2, toKey: "potionHeal", toCount: 1 },
    { id: "conv_hint",      name: "提煉【洞察藥水 x1】",   fromKey: "flower",   fromCount: 2, toKey: "potionHint", toCount: 1 },
    { id: "conv_bomb",      name: "製作【爆破炸彈 x1】",   fromKey: "flint",    fromCount: 2, toKey: "bombItem",   toCount: 1 },
    { id: "conv_fruit",     name: "調配【靈獸誘餌果 x1】", fromKey: "herb",     fromCount: 3, toKey: "tameFruit",  toCount: 1 }
  ];

  // 問題 1 修正：金幣商店移除所有採集素材！防止用金幣偷雞買材料交任務，只售賣 4 種冒險消耗品！
  const GOLD_SHOP = [
    { id: "shop_heal",  name: "購買【生命藥水 x1】",   goldCost: 45,  toKey: "potionHeal", toCount: 1 },
    { id: "shop_hint",  name: "購買【洞察藥水 x1】",   goldCost: 65,  toKey: "potionHint", toCount: 1 },
    { id: "shop_bomb",  name: "購買【爆破炸彈 x1】",   goldCost: 80,  toKey: "bombItem",   toCount: 1 },
    { id: "shop_fruit", name: "購買【靈獸誘餌果 x1】", goldCost: 100, toKey: "tameFruit",  toCount: 1 }
  ];

  function canAfford(inventory, costObj) {
    for (const [matKey, reqCount] of Object.entries(costObj || {})) {
      if ((inventory[matKey] || 0) < reqCount) return false;
    }
    return true;
  }

  function payCost(inventory, costObj) {
    if (!canAfford(inventory, costObj)) return false;
    for (const [matKey, reqCount] of Object.entries(costObj || {})) {
      inventory[matKey] -= reqCount;
    }
    return true;
  }

  function formatCostText(inventory, costObj) {
    const parts = [];
    for (const [matKey, reqCount] of Object.entries(costObj || {})) {
      const mat = MATERIALS[matKey] || { name: matKey };
      const have = inventory[matKey] || 0;
      const color = have >= reqCount ? "#2d6a4f" : "#c1121f";
      parts.push('<span style="color:' + color + '; font-weight:900;">' + mat.name + ' ' + have + '/' + reqCount + '</span>');
    }
    return parts.join("｜") || "初始裝備";
  }

  window.Aetheria.Data.MATERIALS = MATERIALS;
  window.Aetheria.Data.WORKSHOP_RECIPES = WORKSHOP_RECIPES;
  window.Aetheria.Data.SURVIVAL_PROJECTS = SURVIVAL_PROJECTS;
  window.Aetheria.Data.WEAPONS = WEAPONS;
  window.Aetheria.Data.ARMORS = ARMORS;
  window.Aetheria.Data.RUNES = RUNES;
  window.Aetheria.Data.CAMP_MEALS = CAMP_MEALS;
  window.Aetheria.Data.RELICS = RELICS;
  window.Aetheria.Data.TOOLS_UPGRADE = TOOLS_UPGRADE;
  window.Aetheria.Data.ALCHEMY_CONVERSIONS = ALCHEMY_CONVERSIONS;
  window.Aetheria.Data.GOLD_SHOP = GOLD_SHOP;
  window.Aetheria.Data.CraftingHelper = { canAfford: canAfford, payCost: payCost, formatCostText: formatCostText };
})();
