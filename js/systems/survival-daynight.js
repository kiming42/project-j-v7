/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 左上角精準血量、減慢日夜流逝與高密度生態模組 (survival-daynight.js - v7.9)
 * 核心升級：
 *   1. 【左上角精準血量 HUD】：直接內建「♥ 120/120 實時數字 + 動態三色迷你血條」，點擊可快速飲用生命藥水
 *   2. 【減慢時間流逝速度】：日夜流轉速度減慢約 3 倍 (0.32x)，且在曙光營地與帳篷內不消耗日夜時間
 *   3. 保留 v7.8 高密度魔物群、主角 1.42x 高速移動、高壓迫感追擊 AI、隨機防重疊素材與主角睡袋日出動畫
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  // ================= 0. 手機全螢幕自動適配器 =================
  function setupFullScreenAutoFit() {
    function fitAppToScreen() {
      const app = document.getElementById("app-container");
      if (!app) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isPortrait = vh >= vw;

      if (isPortrait) {
        if (vw <= 500) {
          app.style.width = vw + "px";
          app.style.height = vh + "px";
          app.style.maxWidth = "none";
          app.style.maxHeight = "none";
          app.style.borderWidth = "0px";
          app.style.outline = "none";
          app.style.transform = "none";
        } else {
          const baseW = 430;
          const baseH = Math.round(baseW * (vh / vw));
          const scale = vw / baseW;
          app.style.width = baseW + "px";
          app.style.height = baseH + "px";
          app.style.maxWidth = "none";
          app.style.maxHeight = "none";
          app.style.borderWidth = "0px";
          app.style.outline = "none";
          app.style.transformOrigin = "center center";
          app.style.transform = "scale(" + scale + ")";
        }
      } else {
        app.style.transform = "none";
        app.style.width = "100%";
        app.style.maxWidth = "480px";
        app.style.height = "100%";
        app.style.maxHeight = "920px";
      }
    }

    window.addEventListener("resize", fitAppToScreen);
    window.addEventListener("orientationchange", function() {
      setTimeout(fitAppToScreen, 120);
    });
    fitAppToScreen();
    setTimeout(fitAppToScreen, 100);
  }

  // ================= 1. 注入介面優化 CSS（含左上角精準血量框） =================
  function injectSurvivalStylesAndDOM() {
    if (!document.getElementById("survival-v71-styles")) {
      const style = document.createElement("style");
      style.id = "survival-v71-styles";
      style.textContent = `
        /* 左上角精準數字血量膠囊 (#hud-hearts-box 升級版) */
        #hud-hearts-box {
          position: absolute !important;
          top: 4px !important;
          left: 5px !important;
          z-index: 25 !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          background: rgba(20, 16, 19, 0.92) !important;
          border: 2px solid #f5b700 !important;
          border-radius: 6px !important;
          padding: 2px 6px 3px !important;
          min-width: 78px !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.75) !important;
          pointer-events: auto !important;
          cursor: pointer !important;
        }
        #hud-hearts-box.hp-low-pulse {
          border-color: #ff595e !important;
          animation: hpDangerPulse 0.9s infinite ease-in-out !important;
        }
        @keyframes hpDangerPulse {
          0%, 100% { box-shadow: 0 0 4px rgba(255, 89, 94, 0.6); transform: scale(1); }
          50% { box-shadow: 0 0 12px rgba(255, 89, 94, 1); transform: scale(1.04); }
        }
        .hud-hp-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 4px;
          font-size: 11px;
          font-weight: 900;
          color: #ffffff;
          line-height: 1.1;
          text-shadow: 1px 1px 0 #000;
        }
        .hud-hp-top-row img {
          width: 12px !important;
          height: 12px !important;
          image-rendering: pixelated;
        }
        .hud-hp-mini-track {
          width: 100%;
          height: 5px;
          background: #2b2129;
          border: 1px solid #000;
          border-radius: 3px;
          margin-top: 2px;
          overflow: hidden;
        }
        .hud-hp-mini-fill {
          height: 100%;
          transition: width 0.25s ease, background-color 0.25s ease;
        }

        /* 頂部 HUD 緊湊單行化（預留左方 90px 給精準血量框） */
        #hud-overlay {
          top: 5px !important;
          left: 90px !important;
          right: 5px !important;
          display: flex !important;
          flex-wrap: nowrap !important;
          justify-content: space-between !important;
          align-items: center !important;
          gap: 3px !important;
        }
        #hud-overlay .na-badge {
          padding: 2px 5px !important;
          font-size: 10.5px !important;
          line-height: 1.2 !important;
        }

        .dom-label {
          font-size: 10px !important;
          padding: 1px 5px !important;
          border-radius: 4px !important;
          letter-spacing: 0px !important;
        }
        .dom-label.night-fiend-lbl {
          background: linear-gradient(90deg, #3c096c 0%, #9d0208 100%);
          color: #ffd166;
          border: 1.5px solid #ff758f;
          box-shadow: 0 0 6px rgba(224, 60, 75, 0.8);
          animation: bobQuest 0.8s infinite ease-in-out;
        }
        .dom-label.bed-lbl {
          background: #1d3557;
          color: #fff3b0;
          border-color: #8ce0ff;
        }

        #panel-explore .controls-pads {
          width: 100% !important;
          max-width: 100% !important;
          display: flex !important;
          flex-direction: row !important;
          justify-content: space-between !important;
          align-items: center !important;
          padding: 4px 12px 6px !important;
          margin: auto 0 !important;
          gap: 8px !important;
          box-sizing: border-box !important;
        }

        #panel-explore .dpad {
          display: grid !important;
          grid-template-columns: repeat(3, 52px) !important;
          grid-template-rows: repeat(3, 46px) !important;
          gap: 4px !important;
          margin: 0 !important;
          flex-shrink: 0 !important;
        }
        #panel-explore .dpad-btn {
          width: 52px !important;
          height: 46px !important;
          font-size: 20px !important;
        }

        #panel-explore .action-cluster {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          margin: 0 !important;
          width: 150px !important;
          max-width: 150px !important;
          flex-shrink: 0 !important;
        }

        #panel-explore .btn-action-a {
          width: 76px !important;
          height: 76px !important;
          margin: 0 auto !important;
        }
        #panel-explore .action-main-txt { font-size: 16px !important; }
        #panel-explore .action-sub-txt  { font-size: 10.5px !important; }

        #panel-explore .survival-mini-grid {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 4px !important;
          width: 100% !important;
        }
        #panel-explore .survival-mini-grid .na-btn {
          padding: 5px 2px !important;
          font-size: 11.5px !important;
          text-align: center !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }

        #sleep-transition-overlay {
          position: absolute;
          inset: 0;
          z-index: 85;
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 20px;
          pointer-events: auto;
          transition: background 1.2s ease-in-out, opacity 0.7s ease-in-out;
          background: linear-gradient(180deg, #050814 0%, #0f172a 65%, #1e293b 100%);
        }
        #sleep-transition-overlay.phase-dawn {
          background: linear-gradient(180deg, #1d3557 0%, #c9643b 48%, #f4a261 82%, #ffd166 100%);
        }
        #sleep-transition-overlay.phase-morning {
          background: linear-gradient(180deg, #3898ff 0%, #8ce0ff 55%, #fff3b0 100%);
        }
        #sleep-transition-overlay.phase-dusk-night {
          background: linear-gradient(180deg, #09070f 0%, #191233 60%, #3c096c 100%);
        }

        .sleep-sky-stage {
          position: relative;
          width: 180px;
          height: 110px;
          margin-bottom: 12px;
          overflow: hidden;
          border-bottom: 3px solid rgba(255,255,255,0.35);
        }
        .sleep-celestial-body {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          font-size: 38px;
          transition: top 1.2s ease-in-out, opacity 0.8s ease;
          filter: drop-shadow(0 0 12px rgba(255, 224, 130, 0.9));
        }
        .sleep-hero-bed-box {
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .sleep-zzz {
          font-size: 16px;
          font-weight: 900;
          color: #8ce0ff;
          animation: floatZzz 1.2s infinite ease-in-out;
        }
        @keyframes floatZzz {
          0%, 100% { transform: translateY(0) scale(0.95); opacity: 0.7; }
          50% { transform: translateY(-8px) scale(1.15); opacity: 1; }
        }
        .sleep-title-txt {
          font-size: 18px;
          font-weight: 900;
          color: #ffd166;
          text-shadow: 2px 2px 0 #000;
          margin-bottom: 6px;
        }
        .sleep-sub-txt {
          font-size: 13px;
          font-weight: bold;
          color: #ffffff;
          text-shadow: 1px 1px 0 #000;
          line-height: 1.45;
          max-width: 340px;
        }
      `;
      document.head.appendChild(style);
    }

    const upperScreen = document.getElementById("upper-screen");
    if (upperScreen && !document.getElementById("sleep-transition-overlay")) {
      const overlay = document.createElement("div");
      overlay.id = "sleep-transition-overlay";
      overlay.innerHTML = `
        <div class="sleep-sky-stage">
          <div id="sleep-celestial" class="sleep-celestial-body" style="top:14px;">🌙</div>
          <div class="sleep-hero-bed-box">
            <img id="sleep-bed-img" src="" style="width:36px;height:36px;" alt="">
            <span id="sleep-zzz-tag" class="sleep-zzz">Zzz...</span>
          </div>
        </div>
        <div id="sleep-title" class="sleep-title-txt">🌙 在主角帳篷睡袋中進入夢鄉……</div>
        <div id="sleep-sub" class="sleep-sub-txt">體力與飽食度正在恢復中</div>
      `;
      upperScreen.appendChild(overlay);
    }
  }

  // ================= 2. 輔助函式：短標籤精簡器 =================
  function simplifyPortalName(rawName) {
    if (!rawName) return "";
    if (rawName.indexOf("公會帳篷") !== -1) return "公會帳篷";
    if (rawName.indexOf("主角帳篷") !== -1) return "主角帳篷";
    if (rawName.indexOf("鐵匠帳篷") !== -1) return "鐵匠帳篷";
    if (rawName.indexOf("離開帳篷") !== -1) return "離開帳篷 ▾";

    return rawName
      .replace(/進入【|前往【|返回【|挑戰【|潛入【|登上【/g, "")
      .replace(/】/g, "")
      .replace(/[0-9]+(-B)?\.\s*/g, "")
      .replace("曙光露營基地", "曙光營地")
      .replace("翠風迷霧森林", "翠風森林")
      .replace("微光蘑菇洞窟", "蘑菇洞窟")
      .replace("流沙繩索峽谷", "流沙峽谷")
      .replace("翡翠沉船海岸", "翡翠海岸")
      .replace("霜語極寒雪原", "霜語雪原")
      .replace("赤紅熔岩火山", "熔岩火山")
      .replace("天界浮空聖殿", "天界聖殿")
      .replace("無盡試煉之塔", "試煉之塔");
  }

  function simplifyZoneTitle(rawZoneName) {
    if (!rawZoneName) return "曙光營地";
    return rawZoneName
      .replace(/^[0-9]+(-B)?\.\s*/g, "")
      .replace("曙光露營基地", "曙光營地")
      .replace("翠風迷霧森林", "翠風森林")
      .replace("微光蘑菇洞窟", "蘑菇洞窟")
      .replace("流沙繩索峽谷", "流沙峽谷")
      .replace("翡翠沉船海岸", "翡翠海岸")
      .replace("霜語極寒雪原", "霜語雪原")
      .replace("赤紅熔岩火山", "熔岩火山")
      .replace("天界浮空聖殿", "天界聖殿")
      .replace("無盡試煉之塔", "試煉塔");
  }

  // ================= 3. 高密度魔物群與隨機素材生態池 =================
  const ZONE_ECOLOGY_POOLS = {
    camp_hub: {
      nodeCount: 7,
      extraDayMons: 0,
      extraNightMons: 0,
      maxSpawnY: 348,
      pool: [
        { giveKey: "branch", type: "wood",    reqTool: "axe", reqToolLv: 0, weight: 38, nightBoost: false },
        { giveKey: "flint",  type: "crystal", reqTool: "pickaxe", reqToolLv: 0, weight: 36, nightBoost: false },
        { giveKey: "clay",   type: "crystal", reqTool: "pickaxe", reqToolLv: 0, weight: 30, nightBoost: true, preferSouthShore: true }
      ]
    },
    zone1_forest: {
      nodeCount: 14,
      extraDayMons: 7,
      extraNightMons: 12,
      monNames: ["迷霧竹葉妖", "森林狂暴菇精", "暗林枯木妖", "翠風野林怪", "荊棘襲擊者"],
      monTypes: ["bamboo", "skull", "bamboo"],
      pool: [
        { giveKey: "branch", type: "wood",    reqTool: "axe",     reqToolLv: 0, weight: 16 },
        { giveKey: "flint",  type: "crystal", reqTool: "pickaxe", reqToolLv: 0, weight: 14 },
        { giveKey: "wood",   type: "wood",    reqTool: "axe",     reqToolLv: 1, weight: 26 },
        { giveKey: "vine",   type: "wood",    reqTool: "axe",     reqToolLv: 1, weight: 20 },
        { giveKey: "herb",   type: "wood",    reqTool: "axe",     reqToolLv: 1, weight: 20, nightBoost: true },
        { giveKey: "resin",  type: "wood",    reqTool: "axe",     reqToolLv: 1, weight: 18, nightBoost: true },
        { giveKey: "iron",   type: "crystal", reqTool: "pickaxe", reqToolLv: 1, weight: 24, perfectChance: 0.25 }
      ]
    },
    cave1_mushroom: {
      nodeCount: 11,
      extraDayMons: 6,
      extraNightMons: 10,
      monNames: ["洞窟嗜血蝙蝠", "微光狂暴孢妖", "礦坑碎骨兵", "晶簇守衛怪"],
      monTypes: ["skull", "bamboo"],
      pool: [
        { giveKey: "flint",   type: "crystal", reqTool: "pickaxe", reqToolLv: 0, weight: 15 },
        { giveKey: "herb",    type: "wood",    reqTool: "axe",     reqToolLv: 1, weight: 25, nightBoost: true },
        { giveKey: "iron",    type: "crystal", reqTool: "pickaxe", reqToolLv: 1, weight: 22 },
        { giveKey: "basalt",  type: "crystal", reqTool: "pickaxe", reqToolLv: 2, weight: 22 },
        { giveKey: "mithril", type: "crystal", reqTool: "pickaxe", reqToolLv: 2, weight: 24, nightBoost: true, perfectChance: 0.35 }
      ]
    },
    zone2_canyon: {
      nodeCount: 12,
      extraDayMons: 7,
      extraNightMons: 12,
      monNames: ["峽谷流沙毒蠍", "荒岩骷髏獵手", "斷崖風暴妖", "狂沙追獵者"],
      monTypes: ["skull", "bamboo"],
      pool: [
        { giveKey: "iron",    type: "crystal", reqTool: "pickaxe", reqToolLv: 1, weight: 16 },
        { giveKey: "basalt",  type: "crystal", reqTool: "pickaxe", reqToolLv: 2, weight: 22 },
        { giveKey: "mithril", type: "crystal", reqTool: "pickaxe", reqToolLv: 2, weight: 26, nightBoost: true, perfectChance: 0.30 },
        { giveKey: "hemp",    type: "wood",    reqTool: "axe",     reqToolLv: 2, weight: 24 },
        { giveKey: "flower",  type: "wood",    reqTool: "axe",     reqToolLv: 2, weight: 22, dayBoost: true }
      ]
    },
    zone3_coast: {
      nodeCount: 13,
      extraDayMons: 7,
      extraNightMons: 12,
      monNames: ["沉船亡靈水手", "潮汐噬魂海妖", "深淵鐵甲巨蟹", "迷霧海盜狂徒"],
      monTypes: ["skull", "bamboo"],
      pool: [
        { giveKey: "wood",      type: "wood",    reqTool: "axe",     reqToolLv: 1, weight: 18 },
        { giveKey: "clay",      type: "crystal", reqTool: "pickaxe", reqToolLv: 0, weight: 16 },
        { giveKey: "hemp",      type: "wood",    reqTool: "axe",     reqToolLv: 2, weight: 20 },
        { giveKey: "sailCloth", type: "wood",    reqTool: "axe",     reqToolLv: 0, weight: 20, nightBoost: true },
        { giveKey: "coral",     type: "crystal", reqTool: "pickaxe", reqToolLv: 2, weight: 26, perfectChance: 0.30 },
        { giveKey: "mithril",   type: "crystal", reqTool: "pickaxe", reqToolLv: 2, weight: 18 }
      ]
    },
    zone4_snow: {
      nodeCount: 12,
      extraDayMons: 8,
      extraNightMons: 13,
      monNames: ["極寒嗜血霜狼", "暴雪冰晶魔", "凍土亡靈狂戰", "冰河獵殺者"],
      monTypes: ["skull", "bamboo"],
      pool: [
        { giveKey: "basalt",   type: "crystal", reqTool: "pickaxe", reqToolLv: 2, weight: 18 },
        { giveKey: "sinew",    type: "wood",    reqTool: "axe",     reqToolLv: 0, weight: 20 },
        { giveKey: "iceLotus", type: "wood",    reqTool: "axe",     reqToolLv: 2, weight: 26, nightBoost: true },
        { giveKey: "obsidian", type: "crystal", reqTool: "pickaxe", reqToolLv: 3, weight: 24, perfectChance: 0.35 }
      ]
    },
    zone5_volcano: {
      nodeCount: 12,
      extraDayMons: 8,
      extraNightMons: 14,
      monNames: ["紅蓮炎魔狂兵", "熔岩黑曜魔衛", "煉獄火蜥蜴", "焦土毀滅者"],
      monTypes: ["skull", "bamboo"],
      pool: [
        { giveKey: "basalt",   type: "crystal", reqTool: "pickaxe", reqToolLv: 2, weight: 18 },
        { giveKey: "mithril",  type: "crystal", reqTool: "pickaxe", reqToolLv: 2, weight: 18 },
        { giveKey: "obsidian", type: "crystal", reqTool: "pickaxe", reqToolLv: 3, weight: 32, nightBoost: true, perfectChance: 0.35 },
        { giveKey: "starIron", type: "crystal", reqTool: "pickaxe", reqToolLv: 3, weight: 14, nightBoost: true, perfectChance: 0.50 }
      ]
    },
    zone6_sky: {
      nodeCount: 12,
      extraDayMons: 8,
      extraNightMons: 14,
      monNames: ["星界墮落神兵", "浮空聖殿裁決者", "破曉試煉魔像"],
      monTypes: ["skull", "bamboo"],
      pool: [
        { giveKey: "obsidian", type: "crystal", reqTool: "pickaxe", reqToolLv: 3, weight: 22 },
        { giveKey: "starIron", type: "crystal", reqTool: "pickaxe", reqToolLv: 3, weight: 32, nightBoost: true, perfectChance: 0.40 },
        { giveKey: "goldLeaf", type: "wood",    reqTool: "axe",     reqToolLv: 3, weight: 30, dayBoost: true }
      ]
    }
  };

  function randBetween(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function findNonOverlappingSpot(mapObj, existingList, options) {
    options = options || {};
    const W = mapObj.width || 640;
    const H = options.maxY || ((mapObj.height || 480) - 48);
    const minX = options.minX || 50;
    const maxX = options.maxX || (W - 50);
    const minY = options.minY || 58;
    const avoidPortalsDist = options.avoidPortalsDist || 52;
    const treeSafeDist = options.forMonster ? 24 : 32;
    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};

    for (let attempt = 0; attempt < 120; attempt++) {
      const cx = randBetween(minX, maxX);
      const cy = randBetween(minY, H);

      if (mapObj.hasRiver) {
        const rx = mapObj.riverX || 1030;
        if (cx > rx - 30 && cx < rx + 58) continue;
      }

      if (s.currentZone === mapObj.id && Math.hypot(cx - (s.heroX || 0), cy - (s.heroY || 0)) < (options.forMonster ? 65 : 34)) {
        continue;
      }

      let hitPortal = false;
      (mapObj.portals || []).forEach(function(p) {
        if (Math.hypot(cx - p.x, cy - p.y) < avoidPortalsDist) hitPortal = true;
      });
      if (hitPortal) continue;

      let hitTree = false;
      (mapObj.trees || []).forEach(function(t) {
        if (Math.hypot(cx - (t.x + 14), cy - (t.y + 14)) < treeSafeDist) hitTree = true;
      });
      if (hitTree) continue;

      let hitNpc = false;
      (mapObj.npcs || []).forEach(function(n) {
        if (Math.hypot(cx - n.x, cy - n.y) < 38) hitNpc = true;
      });
      if (hitNpc) continue;

      let hitDeco = false;
      (mapObj.decos || []).forEach(function(d) {
        const radius = (d.w && d.w > 40) ? 44 : 32;
        if (Math.hypot(cx - (d.x + (d.w || 26) / 2), cy - (d.y + (d.h || 26) / 2)) < radius) hitDeco = true;
      });
      if (hitDeco) continue;

      let hitOther = false;
      const spacing = options.minSpacing || 34;
      (existingList || []).forEach(function(item) {
        if (item.opened || item.alive === false) return;
        if (Math.hypot(cx - item.x, cy - item.y) < spacing) hitOther = true;
      });
      if (hitOther) continue;

      return { x: cx, y: cy };
    }
    return null;
  }

  function pickWeightedEcologyItem(pool, isNight) {
    let totalW = 0;
    const weights = pool.map(function(item) {
      let w = item.weight || 10;
      if (isNight && item.nightBoost) w = Math.round(w * 1.65);
      if (!isNight && item.dayBoost)  w = Math.round(w * 1.50);
      totalW += w;
      return w;
    });

    let r = Math.random() * totalW;
    for (let i = 0; i < pool.length; i++) {
      r -= weights[i];
      if (r <= 0) return pool[i];
    }
    return pool[0];
  }

  function populateDynamicZoneEcology(mapObj, onlyReplenishNodes) {
    if (!mapObj || !ZONE_ECOLOGY_POOLS[mapObj.id]) return;
    const eco = ZONE_ECOLOGY_POOLS[mapObj.id];
    const phase = (window.Aetheria.State && window.Aetheria.State.getTimePhase)
      ? window.Aetheria.State.getTimePhase()
      : { id: "day", isNight: false };
    const isNight = Boolean(phase.isNight);
    const matsDB = (window.Aetheria.Data && window.Aetheria.Data.MATERIALS) || {};

    const chests = (mapObj.nodes || []).filter(function(n) { return n.type === "chest"; });
    const activeNodes = onlyReplenishNodes
      ? (mapObj.nodes || []).filter(function(n) { return !n.opened; })
      : chests.slice();

    const targetCount = eco.nodeCount + (isNight && mapObj.id !== "camp_hub" ? 3 : 0);
    const needed = Math.max(0, targetCount - (activeNodes.length - chests.length));

    const guaranteedQueue = (!onlyReplenishNodes && mapObj.id === "camp_hub")
      ? [
          eco.pool[0], eco.pool[0],
          eco.pool[1], eco.pool[1],
          eco.pool[2], eco.pool[2]
        ]
      : [];

    for (let i = 0; i < needed; i++) {
      const picked = (i < guaranteedQueue.length)
        ? guaranteedQueue[i]
        : pickWeightedEcologyItem(eco.pool, isNight);

      const spotOpts = {
        minY: picked.preferSouthShore ? 315 : (mapObj.id === "camp_hub" ? 155 : 58),
        maxY: picked.preferSouthShore ? 352 : (eco.maxSpawnY || (mapObj.height - 50)),
        minSpacing: 34
      };

      if (mapObj.id === "zone1_forest" && i < Math.ceil(needed * 0.68)) {
        spotOpts.maxX = 950;
      }

      const pt = findNonOverlappingSpot(mapObj, activeNodes, spotOpts);
      if (!pt) continue;

      const matInfo = matsDB[picked.giveKey] || { name: picked.giveKey };
      const isPerfect = Boolean(picked.perfectChance && Math.random() < picked.perfectChance);

      activeNodes.push({
        id: "dyn_node_" + mapObj.id + "_" + Date.now() + "_" + i + "_" + Math.floor(Math.random() * 999),
        x: pt.x,
        y: pt.y,
        type: picked.type || "wood",
        giveKey: picked.giveKey,
        reqTool: picked.reqTool || "axe",
        reqToolLv: picked.reqToolLv !== undefined ? picked.reqToolLv : 1,
        perfect: isPerfect,
        name: (isPerfect ? "高純度" : "") + matInfo.name,
        opened: false
      });
    }

    mapObj.nodes = activeNodes;

    if (!onlyReplenishNodes && (eco.extraDayMons > 0 || eco.extraNightMons > 0)) {
      const baseMons = (mapObj.monsters || []).filter(function(m) { return !m.isDynamicSpawn; });
      baseMons.forEach(function(m) { m.alive = true; });

      const extraCount = isNight ? eco.extraNightMons : eco.extraDayMons;
      const allMons = baseMons.slice();

      for (let mIdx = 0; mIdx < extraCount; mIdx++) {
        let monSpot = findNonOverlappingSpot(mapObj, allMons, {
          forMonster: true,
          avoidPortalsDist: 65,
          minSpacing: 38
        });

        if (!monSpot) {
          const fallbackMaxX = (mapObj.hasRiver && mIdx % 2 === 0) ? ((mapObj.riverX || 1030) - 55) : (mapObj.width - 70);
          monSpot = {
            x: randBetween(120, Math.max(200, fallbackMaxX)),
            y: randBetween(80, mapObj.height - 80)
          };
        }

        const nameList = eco.monNames || ["荒野狂暴魔"];
        const typeList = eco.monTypes || ["bamboo"];
        const mName = nameList[mIdx % nameList.length];
        const mType = typeList[mIdx % typeList.length];
        const baseLv = Math.max(1, (mapObj.recLv || 2) + randBetween(0, 2));

        allMons.push({
          id: "dyn_mon_" + mapObj.id + "_" + Date.now() + "_" + mIdx + "_" + Math.floor(Math.random() * 999),
          name: mName,
          lv: baseLv,
          x: monSpot.x,
          y: monSpot.y,
          homeX: monSpot.x,
          homeY: monSpot.y,
          type: mType,
          isBoss: false,
          isShiny: (Math.random() < (isNight ? 0.25 : 0.14)),
          alive: true,
          isDynamicSpawn: true
        });
      }

      mapObj.monsters = allMons;
    }

    mapObj._refreshToken = Date.now() + Math.floor(Math.random() * 1000);
    if (window.Aetheria.Renderer) {
      window.Aetheria.Renderer.builtZoneKey = null;
    }
  }

  function triggerTimePhaseEcologyShift(newPhaseId) {
    const s = window.Aetheria.State && window.Aetheria.State.data;
    if (!s || !window.Aetheria.Data || !window.Aetheria.Data.Maps) return;
    const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
    if (!mapObj || !ZONE_ECOLOGY_POOLS[mapObj.id]) return;

    if (newPhaseId === "night" || newPhaseId === "dawn") {
      populateDynamicZoneEcology(mapObj, false);
    } else {
      populateDynamicZoneEcology(mapObj, true);
    }
  }

  // ================= 4. 註冊主角帳篷、睡袋與書桌像素圖示 =================
  function registerCustomTentSprites() {
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

    const heroTentUrl = buildGridDataUrl([
      ".......YY.......",
      "......YYYY......",
      ".....BBBBBB.....",
      "....BBBBBBBB....",
      "...BYYYYYYYYB...",
      "..BBBBBBBBBBBB..",
      ".BBBBBBBBBBBBBB.",
      "BBBBYYYYYYYYBBBB",
      "BBBBBBBBBBBBBBBB",
      ".BBBBBBWWBBBBBB.",
      ".BBBBBWWWWBBBBB.",
      ".BBBBWWWWWWBBBB.",
      ".BBBBWOOOOOWBBB.",
      ".BBBBWOOOOOWBBB.",
      ".YYYYWOOOOOWYYY.",
      "KKKKKKKKKKKKKKKK"
    ], { K: "#141013", B: "#1d5eb8", Y: "#f5b700", W: "#8ce0ff", O: "#2b2118" });

    const sleepingBagUrl = buildGridDataUrl([
      "..KKKKKKKKKKKK..",
      ".KWWWWWWWWWWWWK.",
      ".KWWPPPPPPPPWWK.",
      ".KWWPPPPPPPPWWK.",
      ".KWWWWWWWWWWWWK.",
      ".KYYYYYYYYYYYYK.",
      ".KRRRRRRRRRRRRK.",
      ".KRRRRYYYYRRRRK.",
      ".KRRRRYYYYRRRRK.",
      ".KRRRRRRRRRRRRK.",
      ".KYYYYYYYYYYYYK.",
      ".KRRRRRRRRRRRRK.",
      ".KRRRRRRRRRRRRK.",
      ".KDDDDDDDDDDDDK.",
      "..KKKKKKKKKKKK..",
      "................"
    ], { K: "#141013", W: "#8f563b", P: "#ffffff", Y: "#f5b700", R: "#e03c4b", D: "#5c3824" });

    const studyDeskUrl = buildGridDataUrl([
      "...........YY...",
      "..........YYYY..",
      "...WWWWWW..OO...",
      "..WBBBBBBW.OO...",
      ".KKKKKKKKKKKKKK.",
      "KLLLLLLLLLLLLLLK",
      "KLLLLLLLLLLLLLLK",
      "KDDDDDDDDDDDDDDK",
      ".KDDK......KDDK.",
      ".KDDK......KDDK.",
      ".KDDK......KDDK.",
      ".KDDK......KDDK.",
      ".KKKK......KKKK.",
      "................",
      "................",
      "................"
    ], { K: "#141013", L: "#d9a066", D: "#8f563b", W: "#ffffff", B: "#3898ff", Y: "#ffd166", O: "#e03c4b" });

    const customUrls = {
      hero_tent: heroTentUrl,
      sleeping_bag: sleepingBagUrl,
      study_desk: studyDeskUrl
    };

    const origGetDataURL = S.getDataURL.bind(S);
    S.getDataURL = function(key) {
      if (customUrls[key]) return customUrls[key];
      return origGetDataURL(key);
    };
  }

  // ================= 5. 注入【主角專屬帳篷】與全地圖動態生態掛載 =================
  function buildHeroTentInterior() {
    return {
      id: "tent_hero",
      _refreshToken: Date.now(),
      name: "主角帳篷",
      recLv: 1,
      bgm: "forest",
      theme: "canyon",
      rain: false,
      fog: false,
      hasRiver: false,
      width: 360,
      height: 260,
      dirtBlobs: [{ x: 30, y: 30, w: 300, h: 200 }],
      trees: [],
      decos: [
        { id: "bed_hero_bag",    x: 166, y: 80, sprite: "sleeping_bag", w: 30, h: 30, solid: true, isHeroBed: true,  name: "睡袋" },
        { id: "desk_hero_study", x: 92,  y: 82, sprite: "study_desk",   w: 28, h: 28, solid: true, isHeroDesk: true, name: "書桌" },
        { x: 248, y: 78, sprite: "campfire",     w: 22, h: 22, solid: true },
        { x: 165, y: 140, sprite: "deco_bench",  w: 30, h: 16, solid: false }
      ],
      nodes: [],
      npcs: [],
      monsters: [],
      portals: [
        { id: "p_exit_hero_tent", name: "離開帳篷 ▾", x: 180, y: 228, targetZone: "camp_hub", targetX: 312, targetY: 182, icon: "stairs" }
      ]
    };
  }

  function injectHeroTentIntoCamp(campMap) {
    if (!campMap) return campMap;
    if (!campMap._heroTentInjected) {
      campMap._heroTentInjected = true;

      campMap.decos = campMap.decos || [];
      campMap.decos.push({
        id: "deco_hero_tent_ext",
        x: 285,
        y: 76,
        sprite: "hero_tent",
        w: 54,
        h: 48,
        solid: true
      });

      campMap.portals = campMap.portals || [];
      campMap.portals.push({
        id: "p_enter_hero_tent",
        name: "主角帳篷",
        x: 312,
        y: 138,
        targetZone: "tent_hero",
        targetX: 180,
        targetY: 185,
        icon: "door",
        labelBottom: true
      });
    }
    return campMap;
  }

  function hookWorldMaps() {
    const Maps = window.Aetheria.Data && window.Aetheria.Data.Maps;
    if (!Maps) return;

    let heroTentMap = buildHeroTentInterior();

    const origGetMap = Maps.getMap.bind(Maps);
    Maps.getMap = function(zoneId) {
      if (zoneId === "tent_hero") {
        return heroTentMap;
      }
      const m = origGetMap(zoneId);
      if (m) {
        if (m.id === "camp_hub") {
          injectHeroTentIntoCamp(m);
        }
        if (!m._dynamicEcologyV78 && ZONE_ECOLOGY_POOLS[m.id]) {
          m._dynamicEcologyV78 = true;
          populateDynamicZoneEcology(m, false);
        }
      }
      return m;
    };

    const origRefresh = Maps.refreshAllResources.bind(Maps);
    Maps.refreshAllResources = function() {
      origRefresh();
      heroTentMap = buildHeroTentInterior();
      const camp = origGetMap("camp_hub");
      if (camp) injectHeroTentIntoCamp(camp);

      Object.keys(ZONE_ECOLOGY_POOLS).forEach(function(zId) {
        const m = origGetMap(zId);
        if (m) {
          m._dynamicEcologyV78 = true;
          populateDynamicZoneEcology(m, false);
        }
      });
    };

    Object.keys(ZONE_ECOLOGY_POOLS).forEach(function(zId) {
      const m = origGetMap(zId);
      if (m) {
        if (zId === "camp_hub") injectHeroTentIntoCamp(m);
        m._dynamicEcologyV78 = true;
        populateDynamicZoneEcology(m, false);
      }
    });
  }

  // ================= 6. 睡袋互動、日出漸變動畫與書桌溫習功能 =================
  const SurvivalDayNight = {
    isSleepingAnim: false,

    openHeroBedModal: function() {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const phase = window.Aetheria.State.getTimePhase();

      window.Aetheria.UI.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML =
        S.iconHtml("sleeping_bag") + "主角專屬睡袋 (第 " + (s.dayCount || 1) + " 天｜" + phase.label + ")";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const statusCard = document.createElement("div");
      statusCard.className = "sys-card-scroll";
      statusCard.innerHTML =
        '<b>🛏️ 溫暖的個人行軍睡袋</b>' +
        '<div style="font-size:12px; margin-top:4px; color:#5c3824;">' +
          '在自己的睡袋中休息，能將<b>生命值與飽食度 100% 恢復</b>，睡醒後獲得<b>【晨間活力】</b>，並讓全大陸在不同位置重新長出隨機素材！' +
        '</div>';
      body.appendChild(statusCard);

      const morningCard = document.createElement("div");
      morningCard.className = "sys-card";
      morningCard.style.borderColor = "#5ac54f";
      morningCard.innerHTML =
        '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">' +
          '<div>' +
            '<b style="color:#5ac54f; font-size:14px;">🌅 鑽入睡袋睡到天亮 (推薦)</b>' +
            '<div style="font-size:12px; color:#cbd5e1; margin-top:2px;">播放黑夜轉天亮動畫 ➔ 迎接清晨白晝、回滿 HP 與 100% 飽食度</div>' +
          '</div>' +
          '<button class="na-btn highlight" style="padding:8px 14px; font-size:14px;" onclick="Aetheria.Survival.playSleepToMorning()">立即睡覺</button>' +
        '</div>';
      body.appendChild(morningCard);

      if (!phase.isNight) {
        const nightCard = document.createElement("div");
        nightCard.className = "sys-card";
        nightCard.style.borderColor = "#9d4edd";
        nightCard.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">' +
            '<div>' +
              '<b style="color:#e0aaff; font-size:14px;">🌙 閉目養神至黑夜降臨 (高危夜獵)</b>' +
              '<div style="font-size:12px; color:#cbd5e1; margin-top:2px;">回滿 HP 與飽食度並推進至黑夜（刷出大量狂暴夜魔與夜間稀有礦植，獎賞+50%）</div>' +
            '</div>' +
            '<button class="na-btn" style="padding:8px 12px;" onclick="Aetheria.Survival.playSleepToNight()">睡到黑夜</button>' +
          '</div>';
        body.appendChild(nightCard);
      }
    },

    playSleepToMorning: function() {
      if (this.isSleepingAnim) return;
      this.isSleepingAnim = true;

      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;

      window.Aetheria.UI.closePanelToExplore();

      const overlay = document.getElementById("sleep-transition-overlay");
      const celestial = document.getElementById("sleep-celestial");
      const bedImg = document.getElementById("sleep-bed-img");
      const zzzTag = document.getElementById("sleep-zzz-tag");
      const titleEl = document.getElementById("sleep-title");
      const subEl = document.getElementById("sleep-sub");

      if (!overlay) {
        window.Aetheria.State.sleepUntilMorning();
        this.isSleepingAnim = false;
        return;
      }

      if (bedImg && S) bedImg.src = S.getDataURL("sleeping_bag");
      overlay.className = "";
      overlay.style.opacity = "1";
      overlay.style.display = "flex";

      if (celestial) {
        celestial.innerText = "🌙";
        celestial.style.top = "14px";
      }
      if (zzzTag) zzzTag.style.display = "inline-block";
      if (titleEl) titleEl.innerText = "🌙 夜深人靜，在溫暖的睡袋中進入夢鄉……";
      if (subEl) subEl.innerText = "正在恢復體力與飽食度……";

      const self = this;

      setTimeout(function() {
        overlay.className = "phase-dawn";
        if (celestial) {
          celestial.innerText = "🌅";
          celestial.style.top = "42px";
        }
        if (titleEl) titleEl.innerText = "🌅 破曉時分，晨曦照亮艾瑟瑞亞大陸……";

        window.Aetheria.State.sleepUntilMorning();
        s.wellRestedBattles = 3;
        window.Aetheria.State.save();
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.UI.updateAllHud();
        if (window.Aetheria.Renderer) window.Aetheria.Renderer.renderWorld();
      }, 1300);

      setTimeout(function() {
        overlay.className = "phase-morning";
        if (celestial) {
          celestial.innerText = "☀️";
          celestial.style.top = "10px";
        }
        if (zzzTag) zzzTag.style.display = "none";
        if (titleEl) titleEl.innerText = "☀️ 第 " + s.dayCount + " 天清晨天亮了！";
        if (subEl) subEl.innerText = "HP與飽食度 100% 恢復！全大陸已隨機長出新素材！";
      }, 2500);

      setTimeout(function() {
        overlay.style.opacity = "0";
        setTimeout(function() {
          overlay.style.display = "none";
          self.isSleepingAnim = false;
          window.Aetheria.UI.showToast("☀️ 早安！第 " + s.dayCount + " 天開始，全大陸素材已於隨機位置刷新！");
        }, 650);
      }, 3700);
    },

    playSleepToNight: function() {
      if (this.isSleepingAnim) return;
      this.isSleepingAnim = true;

      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      window.Aetheria.UI.closePanelToExplore();

      const overlay = document.getElementById("sleep-transition-overlay");
      const celestial = document.getElementById("sleep-celestial");
      const bedImg = document.getElementById("sleep-bed-img");
      const zzzTag = document.getElementById("sleep-zzz-tag");
      const titleEl = document.getElementById("sleep-title");
      const subEl = document.getElementById("sleep-sub");

      if (bedImg && S) bedImg.src = S.getDataURL("sleeping_bag");
      overlay.className = "phase-dawn";
      overlay.style.opacity = "1";
      overlay.style.display = "flex";

      if (celestial) {
        celestial.innerText = "🌇";
        celestial.style.top = "36px";
      }
      if (zzzTag) zzzTag.style.display = "inline-block";
      if (titleEl) titleEl.innerText = "🌇 在睡袋中閉目養神，等待夜幕降臨……";
      if (subEl) subEl.innerText = "正在儲備夜戰體力……";

      const self = this;

      setTimeout(function() {
        overlay.className = "phase-dusk-night";
        if (celestial) {
          celestial.innerText = "🌙";
          celestial.style.top = "12px";
        }
        s.worldClock = 285;
        window.Aetheria.State.restoreHunger(100, s.maxHp);
        window.Aetheria.Data.Maps.refreshAllResources();
        if (window.Aetheria.Renderer) window.Aetheria.Renderer.builtZoneKey = null;
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.UI.updateAllHud();
        if (window.Aetheria.Renderer) window.Aetheria.Renderer.renderWorld();

        if (titleEl) titleEl.innerText = "🌙 黑夜降臨！大批【夜行狂暴魔物】已湧現！";
        if (subEl) subEl.innerText = "夜魔數量暴增且高速追擊！擊敗獲 +50% 經驗金幣，點燃【松脂火把】可破除其暗夜護盾！";
      }, 1400);

      setTimeout(function() {
        overlay.style.opacity = "0";
        setTimeout(function() {
          overlay.style.display = "none";
          self.isSleepingAnim = false;
        }, 650);
      }, 3200);
    },

    openStudyDeskModal: function() {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const wrongCount = (s.wrongBook && s.wrongBook.length) || 0;

      window.Aetheria.UI.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = S.iconHtml("study_desk") + "帳篷溫習書桌 (錯題本：" + wrongCount + " 題)";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const card = document.createElement("div");
      card.className = "sys-card-scroll";
      card.innerHTML =
        '<b>📖 睡前知識溫習與求生筆記</b>' +
        '<div style="font-size:12px; margin-top:4px; color:#5c3824;">' +
          '在自己的帳篷書桌前溫習題目完全不會受到傷害！每溫習答對 1 題，即可恢復 <b>+40% 飽食度</b>並獲贈微光菇乾。' +
        '</div>' +
        '<div style="margin-top:8px;">' +
          '<button class="na-btn highlight" style="width:100%; padding:8px; font-size:14px;" onclick="Aetheria.Survival.startDeskStudyQuiz()">開始書桌溫習檢定</button>' +
        '</div>';
      body.appendChild(card);

      const guideCard = document.createElement("div");
      guideCard.className = "sys-card";
      guideCard.innerHTML =
        '<b style="color:var(--na-gold);">【Survival RPG 日夜激戰指南】</b>' +
        '<div style="font-size:12px; color:#cbd5e1; margin-top:4px; line-height:1.5;">' +
          '• <b>🌱 隨機生態刷新</b>：每當日夜時段轉換或過夜，各區會在不重疊的新地點長出不同素材。<br>' +
          '• <b>🌙 黑夜狂暴魔潮</b>：黑夜野外魔物數量暴增（每區 12~16 隻）、等級+3 且高速追擊！擊敗可獲 <b>+50% 經驗與金幣</b>！<br>' +
          '• <b>🔥 松脂火把破盾</b>：手持點燃的【松脂火把】開戰時，可直接燒毀夜行魔物 1 層暗夜護盾！' +
        '</div>';
      body.appendChild(guideCard);
    },

    startDeskStudyQuiz: function() {
      const s = window.Aetheria.State.data;
      const targetQId = (s.wrongBook && s.wrongBook.length > 0) ? s.wrongBook[0] : null;
      window.Aetheria.Battle.startForageChallenge(targetQId);
    }
  };

  window.Aetheria.Survival = SurvivalDayNight;

  // ================= 7. 掛載減慢時間流逝 (0.32x)、左上角精準血量條、主角高速移動與激戰 AI =================
  function hookSystemsForSurvivalV71() {
    const Exp = window.Aetheria.Explore;
    const Ren = window.Aetheria.Renderer;
    const Bat = window.Aetheria.Battle;
    const UI  = window.Aetheria.UI;
    const St  = window.Aetheria.State;

    if (St) {
      if (St.getTimePhase) {
        const origGetPhase = St.getTimePhase.bind(St);
        St.getTimePhase = function() {
          const p = origGetPhase();
          if (p && p.isNight) p.expMult = 1.50;
          return p;
        };
      }

      // ★ 修正 1：大幅減慢時間流逝速度（約減慢 3 倍至 0.32x），且在營地與帳篷內不流逝日夜時間！
      if (St.advanceTime) {
        let timeAccumulator = 0;
        const origAdvance = St.advanceTime.bind(St);
        St.advanceTime = function(ticks) {
          const s = this.data;
          if (s && (s.currentZone === "camp_hub" || s.currentZone === "tent_guild" || s.currentZone === "tent_forge" || s.currentZone === "tent_hero")) {
            return; // 在營地及室內帳篷整理物資時，時間不會流逝
          }
          timeAccumulator += (ticks || 1) * 0.32;
          const wholeTicks = Math.floor(timeAccumulator);
          if (wholeTicks < 1) return;
          timeAccumulator -= wholeTicks;

          const oldPhase = this.getTimePhase().id;
          origAdvance(wholeTicks);
          const newPhase = this.getTimePhase().id;
          if (oldPhase !== newPhase) {
            triggerTimePhaseEcologyShift(newPhase);
          }
        };
      }
    }

    if (Exp) {
      const origUpdateStep = Exp.updateStep.bind(Exp);
      Exp.updateStep = function() {
        const savedDX = this.moveDX;
        const savedDY = this.moveDY;
        if (this.isMoving) {
          this.moveDX = savedDX * 1.42;
          this.moveDY = savedDY * 1.42;
        }
        origUpdateStep();
        this.moveDX = savedDX;
        this.moveDY = savedDY;
      };

      Exp.updateMonstersAI = function(mapObj, s) {
        if (!mapObj || !mapObj.monsters || mapObj.monsters.length === 0) return;
        if (window.Aetheria.Battle && window.Aetheria.Battle.active) return;
        const titleEl = document.getElementById("title-screen");
        if (titleEl && titleEl.style.display !== "none") return;
        const cutEl = document.getElementById("story-cutscene-modal");
        if (cutEl && cutEl.style.display !== "none") return;

        const isNight = window.Aetheria.State.getTimePhase().isNight;

        for (let i = 0; i < mapObj.monsters.length; i++) {
          const m = mapObj.monsters[i];
          if (m.alive === false) continue;

          const distToHero = Math.hypot(s.heroX - m.x, s.heroY - m.y);

          if (distToHero < 22) {
            this.stopMove();

            if (!window.Aetheria.State.hasWeaponEquipped()) {
              s.heroX = Math.max(40, s.heroX - 36);
              window.Aetheria.Audio.sfxWrong();
              window.Aetheria.UI.showToast("你現在赤手空拳無法戰鬥！請先回營地拾取枯枝、燧石與黏土修復【巴爾的鍛造爐】領取忍刀！");
              return;
            }

            if (m.reqSeals && m.reqSeals.length > 0) {
              const unsealedCount = m.reqSeals.filter(function(sid) {
                return Boolean(s.unlockedSeals && s.unlockedSeals[sid]);
              }).length;
              if (unsealedCount < m.reqSeals.length) {
                s.heroX = Math.max(40, s.heroX - 32);
                window.Aetheria.Audio.sfxWrong();
                window.Aetheria.UI.showToast("領主護體結界生效中！請先深入迷宮南北兩翼點亮【符文封印柱】(" + unsealedCount + "/" + m.reqSeals.length + ")！");
                return;
              }
            }

            if (m.isShiny) m.forceShiny = true;
            window.Aetheria.Battle.startBattle(m);
            return;
          }

          const distFromHome = Math.hypot(m.x - (m.homeX || m.x), m.y - (m.homeY || m.y));
          const aggroRadius = m.isBoss ? 85 : (isNight ? 140 : 115);

          if (distToHero < aggroRadius && (m.isBoss || distFromHome < 260)) {
            m.aggro = true;
            const chaseSpeed = m.isBoss ? 1.25 : (isNight ? 2.45 : 1.95);
            const dx = (s.heroX - m.x) / (distToHero || 1);
            const dy = (s.heroY - m.y) / (distToHero || 1);
            let nextMX = m.x + dx * chaseSpeed;
            let nextMY = m.y + dy * chaseSpeed;

            if (mapObj.hasRiver) {
              const rx = mapObj.riverX || 1030;
              if (nextMX > rx - 18 && nextMX < rx + 46) nextMX = m.x;
            }

            m.x = Math.max(35, Math.min(mapObj.width - 45, nextMX));
            m.y = Math.max(35, Math.min(mapObj.height - 45, nextMY));
          } else if (!m.isBoss) {
            m.aggro = false;
            m.patrolTimer = (m.patrolTimer || 45) - 1;
            if (m.patrolTimer <= 0) {
              m.patrolTimer = 40 + Math.floor(Math.random() * 50);
              const randAng = Math.random() * Math.PI * 2;
              const patrolSpd = isNight ? 1.05 : 0.78;
              m.vx = Math.cos(randAng) * patrolSpd;
              m.vy = Math.sin(randAng) * patrolSpd;
            }

            let nextMX = m.x + (m.vx || 0);
            let nextMY = m.y + (m.vy || 0);

            if (distFromHome > 85) {
              m.vx = ((m.homeX || m.x) - m.x) * 0.035;
              m.vy = ((m.homeY || m.y) - m.y) * 0.035;
              nextMX = m.x + m.vx;
              nextMY = m.y + m.vy;
            }

            if (mapObj.hasRiver) {
              const rx = mapObj.riverX || 1030;
              if (nextMX > rx - 18 && nextMX < rx + 46) {
                m.vx = -m.vx;
                nextMX = m.x;
              }
            }

            m.x = Math.max(35, Math.min(mapObj.width - 45, nextMX));
            m.y = Math.max(35, Math.min(mapObj.height - 45, nextMY));
          } else {
            m.aggro = false;
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
            if (Math.hypot(s.heroX - d.x, s.heroY - d.y) < 38) {
              if (d.isHeroBed) {
                window.Aetheria.Audio.sfxTalkBlip();
                SurvivalDayNight.openHeroBedModal();
                return;
              }
              if (d.isHeroDesk) {
                window.Aetheria.Audio.sfxTalkBlip();
                SurvivalDayNight.openStudyDeskModal();
                return;
              }
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
            if (Math.hypot(s.heroX - d.x, s.heroY - d.y) < 38) {
              if (d.isHeroBed)  { hintEl.innerText = "睡袋睡覺"; return; }
              if (d.isHeroDesk) { hintEl.innerText = "書桌溫習"; return; }
            }
          }
        }
        origHint(mapObj, s);
      };
    }

    if (Ren) {
      // ★ 修正 4：左上角 #hud-hearts-box 升級為「♥ 120/120 實時數字 + 動態三色迷你血條」
      Ren.updateHeartsDOM = function(s, Sprites) {
        if (!s) return;
        const curHp = Math.max(0, Math.round(s.hp || 0));
        const maxHp = Math.max(1, Math.round(s.maxHp || 100));
        const stateKey = curHp + "/" + maxHp;
        if (this.lastHeartsState === stateKey) return;
        this.lastHeartsState = stateKey;

        const box = document.getElementById("hud-hearts-box");
        if (!box) return;

        const pct = Math.max(0, Math.min(100, Math.round((curHp / maxHp) * 100)));
        const barColor = (pct >= 60) ? "#5ac54f" : (pct >= 30) ? "#f5b700" : "#ff595e";
        const heartUrl = (Sprites && Sprites.getDataURL) ? Sprites.getDataURL("heart") : "";

        if (pct < 30) box.classList.add("hp-low-pulse");
        else box.classList.remove("hp-low-pulse");

        box.title = "點擊可快速飲用生命藥水";
        box.innerHTML =
          '<div class="hud-hp-top-row">' +
            (heartUrl ? '<img src="' + heartUrl + '" alt="HP">' : '<span style="color:#ff595e;">♥</span>') +
            '<span>' + curHp + '/' + maxHp + '</span>' +
          '</div>' +
          '<div class="hud-hp-mini-track">' +
            '<div class="hud-hp-mini-fill" style="width:' + pct + '%; background:' + barColor + ';"></div>' +
          '</div>';

        if (!box._boundQuickHeal) {
          box._boundQuickHeal = true;
          box.onclick = function() {
            const st = window.Aetheria.State.data;
            if (st.hp >= st.maxHp) {
              window.Aetheria.UI.showToast("❤️ 當前生命值已滿 (" + st.hp + "/" + st.maxHp + ")！");
              return;
            }
            if ((st.inventory.potionHeal || 0) > 0) {
              window.Aetheria.Battle.useHealPotion();
              Ren.lastHeartsState = "";
              Ren.updateHeartsDOM(st, window.Aetheria.Data.Sprites);
            } else {
              window.Aetheria.UI.showToast("❤️ 當前生命值：" + st.hp + "/" + st.maxHp + "（可按右下角「口糧」進食或回營地睡覺恢復）");
            }
          };
        }
      };

      if (Ren.renderWorld) {
        const origRenderWorld = Ren.renderWorld.bind(Ren);
        Ren.renderWorld = function() {
          origRenderWorld();
          try {
            const s = window.Aetheria.State.data;
            const isNight = window.Aetheria.State.getTimePhase().isNight;
            const dnEl = document.getElementById("daynight-overlay");
            if (dnEl && s && s.currentZone === "tent_hero") {
              dnEl.className = "dn-day";
            }

            Object.keys(this.domPool.portals || {}).forEach(function(pId) {
              const item = Ren.domPool.portals[pId];
              if (!item || !item.lbl || !item.data) return;
              const p = item.data;
              const shortPName = simplifyPortalName(p.name);
              const bottomCls = p.labelBottom ? " lbl-bottom" : "";

              if (p.linkedNpcId && window.Aetheria.Data.getNpcMarkerState) {
                const marker = window.Aetheria.Data.getNpcMarkerState(s, p.linkedNpcId);
                if (marker === "ready") {
                  item.lbl.className = "dom-label quest-ready-lbl" + bottomCls;
                  item.lbl.innerText = "✓ " + shortPName;
                } else if (marker === "avail") {
                  item.lbl.className = "dom-label quest-avail-lbl" + bottomCls;
                  item.lbl.innerText = "! " + shortPName;
                } else if (marker === "active") {
                  item.lbl.className = "dom-label quest-active-lbl" + bottomCls;
                  item.lbl.innerText = "⏳ " + shortPName;
                } else {
                  item.lbl.className = "dom-label portal-lbl" + bottomCls;
                  item.lbl.innerText = shortPName;
                }
              } else {
                item.lbl.className = "dom-label portal-lbl" + bottomCls;
                item.lbl.innerText = shortPName;
              }
            });

            Object.keys(this.domPool.decos || {}).forEach(function(k) {
              const item = Ren.domPool.decos[k];
              if (!item || !item.lbl || !item.data) return;
              const d = item.data;

              if (d.isHeroBed) {
                item.lbl.style.display = "block";
                item.lbl.className = "dom-label bed-lbl";
                item.lbl.innerText = "睡袋";
              } else if (d.isHeroDesk) {
                item.lbl.style.display = "block";
                item.lbl.className = "dom-label portal-lbl";
                item.lbl.innerText = "書桌";
              } else if (d.isCookPot) {
                item.lbl.innerText = "料理鍋";
              } else if (d.isFishingSpot) {
                item.lbl.innerText = "釣魚點";
              } else if (d.isBrazier && item.lbl.style.display !== "none") {
                item.lbl.innerText = "火盆";
              } else if (d.isSealPillar) {
                const unsealed = s.unlockedSeals && s.unlockedSeals[d.id];
                item.lbl.innerText = unsealed ? "封印柱✓" : "封印柱";
              } else if (d.isProjectSite) {
                const built = Boolean(s.projectsBuilt && s.projectsBuilt[d.projectId]);
                const shortProj = (d.name || "工程").replace("巴爾的受損", "").replace("極地防風", "");
                if (!built) {
                  item.lbl.innerText = "🔨" + shortProj;
                } else if (d.isClimbLadder) {
                  item.lbl.innerText = "木梯";
                } else if (d.projectId === "proj_z4_shelter") {
                  item.lbl.innerText = "防風屋";
                } else if (d.projectId === "proj_camp_forge") {
                  item.lbl.innerText = "鍛造爐";
                }
              }
            });

            Object.keys(this.domPool.npcs || {}).forEach(function(npcId) {
              const item = Ren.domPool.npcs[npcId];
              if (!item || !item.lbl || !item.data) return;
              const npc = item.data;
              const shortName = npc.name.split("・")[1] || npc.name;
              const marker = window.Aetheria.Data.getNpcMarkerState ? window.Aetheria.Data.getNpcMarkerState(s, npc.id) : null;

              if (marker === "ready") {
                item.lbl.className = "dom-label quest-ready-lbl";
                item.lbl.innerText = "✓ " + shortName;
              } else if (marker === "avail") {
                item.lbl.className = "dom-label quest-avail-lbl";
                item.lbl.innerText = "! " + shortName;
              } else if (marker === "active") {
                item.lbl.className = "dom-label quest-active-lbl";
                item.lbl.innerText = "⏳ " + shortName;
              } else {
                item.lbl.className = "dom-label";
                item.lbl.innerText = shortName;
              }
            });

            Object.keys(this.domPool.monsters || {}).forEach(function(mId) {
              const item = Ren.domPool.monsters[mId];
              if (!item || !item.lbl || !item.data || item.data.alive === false) return;
              const m = item.data;
              const effLv = isNight ? (m.lv + 3) : m.lv;
              const shortMonName = (m.name || "").replace(/^翠風|^河畔|^岩窟|^流沙|^深海|^霜語|^紅蓮/, "");

              if (m.aggro) {
                item.lbl.className = "dom-label aggro-lbl";
                item.lbl.innerText = "!" + shortMonName + " Lv." + effLv;
              } else if (m.reqSeals && m.reqSeals.length > 0) {
                const allUnsealed = m.reqSeals.every(function(sid) { return Boolean(s.unlockedSeals && s.unlockedSeals[sid]); });
                item.lbl.className = "dom-label " + (allUnsealed ? "portal-lbl" : "lock-lbl");
                item.lbl.innerText = shortMonName + (allUnsealed ? "" : "[封印]");
              } else if (isNight) {
                item.lbl.className = "dom-label night-fiend-lbl";
                item.lbl.innerText = "🌙" + shortMonName + " Lv." + effLv;
              } else {
                item.lbl.className = "dom-label";
                item.lbl.innerText = (m.isShiny ? "★" : "") + shortMonName + " Lv." + effLv;
              }
            });
          } catch (e) {}
        };
      }
    }

    if (Bat && Bat.startBattle) {
      const origStartBattle = Bat.startBattle.bind(Bat);
      Bat.startBattle = function(mapMonsterNode, customMode, customQuestionId) {
        origStartBattle(mapMonsterNode, customMode, customQuestionId);

        const s = window.Aetheria.State.data;
        const e = this.enemy;
        const phase = window.Aetheria.State.getTimePhase();

        if (e && phase.isNight && this.mode === "combat") {
          e.lv = (e.lv || 1) + 3;
          e.maxHp = Math.round(e.maxHp * 1.35);
          e.hp = e.maxHp;
          e.atk = Math.round((e.atk || 15) * 1.30);

          if (e.name.indexOf("夜行") === -1) {
            e.name = "🌙夜行・" + e.name;
          }

          if (s.torchTicks && s.torchTicks > 0) {
            setTimeout(function() {
              window.Aetheria.UI.spawnFloatingText("🔥火把克制夜魔!", "#ffd166", true);
              window.Aetheria.UI.showToast("🔥 手持松脂火把！成功壓制夜行魔物的暗夜護盾！");
            }, 250);
          } else if (!e.broken) {
            e.maxShield = (e.maxShield || 1) + 1;
            e.shield = (e.shield || 1) + 1;
            setTimeout(function() {
              window.Aetheria.UI.showToast("🌙 黑夜狂暴魔物（等級+3、攻血強化、護盾+1）！點燃【松脂火把】可削弱其暗夜護盾！");
            }, 250);
          }

          this.updateBattleHUD();
        }

        if (s.wellRestedBattles && s.wellRestedBattles > 0 && this.mode === "combat") {
          s.wellRestedBattles--;
          e.hp = Math.max(1, Math.round(e.hp * 0.88));
          this.updateBattleHUD();
        }
      };
    }

    if (UI) {
      UI.sleepAtCamp = function() {
        const s = window.Aetheria.State.data;
        s.currentZone = "tent_hero";
        s.heroX = 166;
        s.heroY = 118;
        s.petX = 146;
        s.petY = 122;
        if (window.Aetheria.Renderer) window.Aetheria.Renderer.builtZoneKey = null;
        SurvivalDayNight.playSleepToMorning();
      };

      const origUpdateHud = UI.updateAllHud.bind(UI);
      UI.updateAllHud = function() {
        origUpdateHud();
        const s = window.Aetheria.State.data;
        const S = window.Aetheria.Data.Sprites;
        const lvEl = document.getElementById("hud-lv");
        if (lvEl && S) {
          lvEl.innerHTML = S.iconHtml("icon_sword") + "Lv." + s.lv;
        }
        if (window.Aetheria.Renderer && window.Aetheria.Renderer.updateHeartsDOM) {
          window.Aetheria.Renderer.lastHeartsState = "";
          window.Aetheria.Renderer.updateHeartsDOM(s, S);
        }
      };

      const origUpdateZone = UI.updateHudZoneDynamic.bind(UI);
      UI.updateHudZoneDynamic = function(mapObj, s) {
        origUpdateZone(mapObj, s);
        const zoneBadge = document.getElementById("hud-zone");
        if (!zoneBadge || !mapObj) return;

        const shortZ = simplifyZoneTitle(mapObj.name);
        if (mapObj.id === "camp_hub" || mapObj.id === "tent_guild" || mapObj.id === "tent_forge" || mapObj.id === "tent_hero") {
          zoneBadge.className = "na-badge danger-safe";
          zoneBadge.innerText = shortZ;
        } else {
          zoneBadge.innerText = shortZ + " Lv." + (mapObj.recLv || 1);
        }
      };
    }
  }

  function initSurvivalExpansion() {
    try {
      setupFullScreenAutoFit();
      injectSurvivalStylesAndDOM();
      registerCustomTentSprites();
      hookWorldMaps();
      hookSystemsForSurvivalV71();

      const St = window.Aetheria.State;
      if (St && St.consumeHunger) {
        const origConsume = St.consumeHunger.bind(St);
        St.consumeHunger = function(amount) {
          if (St.data && St.data.currentZone === "tent_hero") return true;
          return origConsume(amount);
        };
      }

      if (window.Aetheria.UI && window.Aetheria.UI.updateAllHud) {
        window.Aetheria.UI.updateAllHud();
      }
      if (window.Aetheria.Renderer) {
        window.Aetheria.Renderer.builtZoneKey = null;
        window.Aetheria.Renderer.renderWorld();
      }
    } catch (err) {
      console.error("Survival v7.9 module init error:", err);
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(initSurvivalExpansion, 90);
  } else {
    window.addEventListener("load", function() {
      setTimeout(initSurvivalExpansion, 90);
    });
  }
})();
