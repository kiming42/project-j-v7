/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 科學科動態天氣、氣象觀測站與稀有生態海怪模組 (weather-ecology.js - v8.7)
 * 模組化獨立擴充檔：
 *   1. 五大動態天氣：☀️晴朗 (clear)、🌧️驟雨 (rain)、🌫️濃霧 (fog)、❄️寒潮結霜 (frost)、🌠星隕流星雨 (meteor)
 *   2. 視覺特效層 (#weather-fx-layer)：動態像素雨絲、流動迷霧、飄落冰晶、金色流星雨（進入帳篷室內自動隱藏）
 *   3. 左上角獨立【🔭天氣徽章】：設於血量框正下方，不佔用頂部橫列空間；點擊打開【科學氣象觀測站】查看科學原理與人工祈雨/喚星
 *   4. 專屬稀有教材與海怪刷新：不同天氣自動在陸地與無盡碧海生成專屬稀有礦植（免高階工具限制）與稀有海怪！
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  // ================= 1. 五大科學天氣定義與小學科學原理筆記 =================
  const WEATHER_TYPES = {
    clear: {
      id: "clear",
      icon: "☀️",
      name: "晴朗",
      shortBadge: "☀️晴朗",
      temp: "26°C",
      humidity: "55%",
      scienceTitle: "【科學原理：蒸發與光合作用】",
      scienceNote: "陽光提供熱能，令地面與海洋的水分加速【蒸發】成水蒸氣；綠色植物則利用陽光、水分與二氧化碳進行【光合作用】製造養分並釋出氧氣。",
      buffDesc: "植物光合作用旺盛：野外刷新【太陽花/黃金樹葉】，採集草木有 25% 機率獲得雙倍收穫！",
      spawnNodes: [
        { giveKey: "flower",   name: "☀️向陽太陽花", type: "wood", sprite: "weather_sun_herb" },
        { giveKey: "wood",     name: "☀️翠綠神木枝", type: "wood", sprite: "weather_sun_herb" }
      ],
      spawnMonster: { name: "☀️向陽花精靈", type: "bamboo", lvOffset: 0, dropKey: "flower", dropCount: 2 }
    },
    rain: {
      id: "rain",
      icon: "🌧️",
      name: "驟雨",
      shortBadge: "🌧️驟雨",
      temp: "21°C",
      humidity: "92%",
      scienceTitle: "【科學原理：水循環與降水現象】",
      scienceNote: "高空中的水蒸氣遇冷【凝結】成無數小水滴並聚集成雲；當水滴大到空氣托不住時，便會受地球引力影響落到地面，形成【降水（落雨）】。",
      buffDesc: "魚群活躍＆雨後靈菇：垂釣成功必定額外獲得【鮮魚+1、深海珊瑚+1】！野外與海域刷新【雨後微光菇】與【潮汐雷電巨蟹】！",
      spawnNodes: [
        { giveKey: "herb",  name: "🌧️雨後微光菇簇", type: "wood",    sprite: "weather_rain_kelp" },
        { giveKey: "coral", name: "🌧️潮汐沖刷珊瑚", type: "crystal", sprite: "weather_rain_kelp" }
      ],
      spawnMonster: { name: "🌧️潮汐雷電巨蟹", type: "bamboo", lvOffset: 1, dropKey: "coral", dropCount: 2 },
      seaMonster:   { name: "🌧️暴風海淵巨蟹王", type: "boss", lvOffset: 2, dropKey: "coral", dropCount: 3 }
    },
    fog: {
      id: "fog",
      icon: "🌫️",
      name: "濃霧",
      shortBadge: "🌫️濃霧",
      temp: "18°C",
      humidity: "96%",
      scienceTitle: "【科學原理：地面水蒸氣凝結與能見度】",
      scienceNote: "當溫暖潮濕的空氣接觸到較冷的地面或海面時，水蒸氣會在近地面【凝結】成極微小的水滴懸浮於空氣中，形成【霧】並降低能見度。",
      buffDesc: "濃霧掩護：魔物視線受阻，追擊移速降低 30%（點燃火把可驅散濃霧）！刷新【濃霧琥珀松脂】、【幽靈古帆布】與【迷霧幽靈海妖】！",
      spawnNodes: [
        { giveKey: "resin",     name: "🌫️濃霧凝結松脂", type: "wood", sprite: "weather_sun_herb" },
        { giveKey: "sailCloth", name: "🌫️迷霧幽靈帆布", type: "wood", sprite: "weather_rain_kelp" }
      ],
      spawnMonster: { name: "🌫️迷霧幻影斥候", type: "skull", lvOffset: 1, dropKey: "sailCloth", dropCount: 2 },
      seaMonster:   { name: "🌫️迷霧幽靈海妖船", type: "skull", lvOffset: 2, dropKey: "seaChart", dropCount: 1 }
    },
    frost: {
      id: "frost",
      icon: "❄️",
      name: "寒潮結霜",
      shortBadge: "❄️結霜",
      temp: "-2°C",
      humidity: "68%",
      scienceTitle: "【科學原理：凝固點與凝華現象】",
      scienceNote: "當氣溫急劇下降至水的凝固點（0°C）以下時，空氣中的水蒸氣會直接由氣態轉變成固態冰晶附着在物體表面，這種現象稱為【凝華（結霜）】。",
      buffDesc: "寒潮異象：全大陸跨區凝結【❄️寒霜極地冰蓮】與【❄️凝華秘銀晶簇】（免工具等級限制即可採集），並出現【極寒冰霜魔狼】！",
      spawnNodes: [
        { giveKey: "iceLotus", name: "❄️寒霜極地冰蓮", type: "wood",    sprite: "weather_frost_lotus" },
        { giveKey: "mithril",  name: "❄️凝華秘銀晶簇", type: "crystal", sprite: "weather_frost_lotus" }
      ],
      spawnMonster: { name: "❄️寒潮霜原魔狼", type: "skull", lvOffset: 2, dropKey: "iceLotus", dropCount: 2 },
      seaMonster:   { name: "❄️冰海寒霜海獸", type: "bamboo", lvOffset: 2, dropKey: "mithril", dropCount: 2 }
    },
    meteor: {
      id: "meteor",
      icon: "🌠",
      name: "星隕流星雨",
      shortBadge: "🌠流星雨",
      temp: "16°C",
      humidity: "45%",
      scienceTitle: "【科學原理：流星體與大氣層摩擦燃燒】",
      scienceNote: "太空中的岩石或金屬碎塊（流星體）受地球引力吸引高速闖入大氣層，與空氣產生劇烈【摩擦】並轉化為極高熱能而燃燒發光，形成【流星雨】；未燒盡落到地面的稱為【隕石】。",
      buffDesc: "★傳奇天象：主角攻擊力 +18%、戰鬥經驗值 +35%！全地圖降下【🌠天外星隕石坑】（可直接採集深淵星隕鐵與黑曜石）並現身【星隕深海雷龍】！",
      spawnNodes: [
        { giveKey: "starIron", name: "🌠天外星隕石坑", type: "crystal", sprite: "weather_meteor_node" },
        { giveKey: "obsidian", name: "🌠星火黑曜石塊", type: "crystal", sprite: "weather_meteor_node" }
      ],
      spawnMonster: { name: "🌠星隕異界魔像", type: "boss", lvOffset: 2, dropKey: "starIron", dropCount: 2 },
      seaMonster:   { name: "🌠星隕深海雷龍", type: "boss", lvOffset: 3, dropKey: "starIron", dropCount: 2 }
    }
  };

  // ================= 2. 注入天氣視覺特效層 (雨絲/濃霧/冰晶/流星) 與左上角天氣膠囊 CSS =================
  function injectWeatherStylesAndDOM() {
    if (!document.getElementById("weather-v87-styles")) {
      const style = document.createElement("style");
      style.id = "weather-v87-styles";
      style.textContent = `
        /* 左上角獨立天氣膠囊（位於血量框正下方，絕不擠壓頂部單行 HUD） */
        #hud-weather-pill {
          position: absolute;
          top: 47px;
          left: 4px;
          z-index: 25;
          background: rgba(15, 23, 42, 0.90);
          border: 1.5px solid #38b6ff;
          border-radius: 5px;
          padding: 2px 6px;
          font-size: 10px;
          font-weight: 900;
          color: #fff3b0;
          box-shadow: 0 2px 5px rgba(0,0,0,0.7);
          cursor: pointer;
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 3px;
          transition: transform 0.15s ease, border-color 0.2s ease;
        }
        #hud-weather-pill:active {
          transform: scale(0.95);
        }
        #hud-weather-pill.weather-meteor-glow {
          background: linear-gradient(90deg, #3c096c 0%, #7209b7 100%);
          border-color: #ffd166;
          color: #ffd166;
          box-shadow: 0 0 8px rgba(245, 183, 0, 0.8);
          animation: bobQuest 1s infinite ease-in-out;
        }

        /* 畫面天氣特效層 */
        #weather-fx-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 16;
          overflow: hidden;
        }

        /* 🌧️ 驟雨特效 */
        .wx-rain-drop {
          position: absolute;
          width: 2px;
          height: 16px;
          background: linear-gradient(180deg, transparent, rgba(140, 224, 255, 0.85));
          animation: wxRainFall 0.65s linear infinite;
        }
        @keyframes wxRainFall {
          0%   { transform: translateY(-20px) translateX(6px); opacity: 0; }
          20%  { opacity: 0.9; }
          100% { transform: translateY(340px) translateX(-18px); opacity: 0.2; }
        }

        /* 🌫️ 濃霧特效 */
        .wx-fog-veil {
          position: absolute;
          inset: -20%;
          background:
            radial-gradient(circle at 30% 40%, rgba(226, 232, 240, 0.36) 0%, transparent 55%),
            radial-gradient(circle at 75% 65%, rgba(203, 213, 225, 0.34) 0%, transparent 60%),
            rgba(148, 163, 184, 0.18);
          animation: wxFogDrift 7s ease-in-out infinite alternate;
        }
        @keyframes wxFogDrift {
          0%   { transform: translateX(-14px) scale(1); }
          100% { transform: translateX(14px) scale(1.06); }
        }

        /* ❄️ 寒潮結霜特效 */
        .wx-frost-flake {
          position: absolute;
          width: 5px;
          height: 5px;
          background: #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 6px #8ce0ff;
          animation: wxSnowFall 2.6s linear infinite;
        }
        @keyframes wxSnowFall {
          0%   { transform: translateY(-15px) translateX(0px); opacity: 0.95; }
          50%  { transform: translateY(160px) translateX(10px); opacity: 0.85; }
          100% { transform: translateY(330px) translateX(-6px); opacity: 0.15; }
        }

        /* 🌠 星隕流星雨特效 */
        .wx-shooting-star {
          position: absolute;
          width: 48px;
          height: 2px;
          background: linear-gradient(90deg, #ffd166 0%, #ff758f 45%, transparent 100%);
          box-shadow: 0 0 8px #ffd166;
          transform: rotate(-32deg);
          animation: wxMeteorShoot 1.8s ease-in infinite;
          opacity: 0;
        }
        @keyframes wxMeteorShoot {
          0%   { transform: translate(120px, -60px) rotate(-32deg); opacity: 0; }
          15%  { opacity: 1; }
          65%  { transform: translate(-220px, 160px) rotate(-32deg); opacity: 0; }
          100% { opacity: 0; }
        }

        /* 天氣專屬稀有資源與海怪標籤 */
        .dom-label.weather-node-lbl {
          background: linear-gradient(90deg, #1d3557 0%, #3c096c 100%);
          color: #ffd166;
          border: 1.5px solid #8ce0ff;
          box-shadow: 0 0 6px rgba(140, 224, 255, 0.75);
        }
        .dom-label.weather-mon-lbl {
          background: linear-gradient(90deg, #5c1a1b 0%, #7209b7 100%);
          color: #fff3b0;
          border: 1.5px solid #ffd166;
          box-shadow: 0 0 8px rgba(245, 183, 0, 0.8);
        }
      `;
      document.head.appendChild(style);
    }

    const upper = document.getElementById("upper-screen");
    if (upper) {
      if (!document.getElementById("weather-fx-layer")) {
        const fxLayer = document.createElement("div");
        fxLayer.id = "weather-fx-layer";
        upper.appendChild(fxLayer);
      }
      if (!document.getElementById("hud-weather-pill")) {
        const pill = document.createElement("div");
        pill.id = "hud-weather-pill";
        pill.title = "點擊打開【科學氣象觀測站】";
        pill.innerHTML = "☀️晴朗";
        pill.onclick = function() {
          if (window.Aetheria.Audio) window.Aetheria.Audio.sfxTalkBlip();
          WeatherManager.openWeatherStationModal();
        };
        upper.appendChild(pill);
      }
    }
  }

  // ================= 3. 註冊天氣專屬稀有礦植像素圖示 =================
  function registerWeatherSprites() {
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

    // 🌠 天外星隕石坑 (金紫發光隕石)
    const meteorNodeUrl = buildGridDataUrl([
      "......YYYY......",
      "....YYPPPPYY....",
      "...YPWWWWWWPY...",
      "..YPWYYYYYYWPY..",
      ".YPWYRRRRRRYWPY.",
      ".YPWYRWWWWRYWPY.",
      "KPPWYRWWWWRYWPPK",
      "KDPWYRRRRRRYWPDK",
      "KDDPWYYYYYYWPDDK",
      ".KDDPWWWWWWPDDK.",
      ".KDDDPPPPPPPDDK.",
      "..KDDDDDDDDDDK..",
      "...KKKKKKKKKK...",
      "................",
      "................",
      "................"
    ], {
      K: "#141013", Y: "#ffd166", P: "#9d4edd", W: "#ffffff", R: "#ff595e", D: "#3c096c"
    });

    // ❄️ 寒霜極地冰蓮 / 凝華秘銀簇
    const frostLotusUrl = buildGridDataUrl([
      ".......WW.......",
      "......WCCW......",
      "...WW.WCCW.WW...",
      "..WCCWWCCWWCCW..",
      "..WCCCWWWWCCCW..",
      "...WCCWWWWCCW...",
      ".WWWWCWWWWCWWWW.",
      "WCCCCWWWWWWCCCCW",
      ".WCCCCWWWWCCCCW.",
      "..WCCCWWWWCCCW..",
      "...WBBBBBBBBW...",
      "....KBBBBBBK....",
      "...KBBBBBBBBK...",
      "..KKKKKKKKKKKK..",
      "................",
      "................"
    ], {
      K: "#141013", W: "#ffffff", C: "#8ce0ff", B: "#38b6ff"
    });

    // 🌧️ 潮汐珊瑚 / 雨後微光靈菇
    const rainKelpUrl = buildGridDataUrl([
      ".....KKKKKK.....",
      "...KKRRRRRRKK...",
      "..KRRWWGGRRRRK..",
      ".KRRWWGGGGRRRRK.",
      ".KRRRRGGGGRWWWK.",
      "KRRRRGGGGGGWWWRK",
      "KKKKKKKKKKKKKKKK",
      "....KYYYYYYK....",
      "....KYYYYYYK....",
      "...KCCCCCCCCK...",
      "..KCCCCCCCCCCK..",
      "..KKKKKKKKKKKK..",
      "................",
      "................",
      "................",
      "................"
    ], {
      K: "#141013", R: "#ff595e", W: "#ffffff", G: "#5ac54f", Y: "#ffd166", C: "#38b6ff"
    });

    // ☀️ 向陽靈花
    const sunHerbUrl = buildGridDataUrl([
      "......YYYY......",
      "....YYYYYYYY....",
      "...YYOOOOOOYY...",
      "..YYOOWWWWOOYY..",
      "..YYOWWWWWWOYY..",
      "...YYOOOOOOYY...",
      "....YYYYYYYY....",
      ".......GG.......",
      "...GGG.GG.GGG...",
      "..GGGGGGGGGGGG..",
      "...GGG.GG.GGG...",
      ".......GG.......",
      "......KKKK......",
      ".....KDDDDK.....",
      "....KKKKKKKK....",
      "................"
    ], {
      K: "#141013", Y: "#ffd166", O: "#f5b700", W: "#ffffff", G: "#5ac54f", D: "#8f563b"
    });

    const customUrls = {
      weather_meteor_node: meteorNodeUrl,
      weather_frost_lotus: frostLotusUrl,
      weather_rain_kelp: rainKelpUrl,
      weather_sun_herb: sunHerbUrl
    };

    const origGetDataURL = S.getDataURL.bind(S);
    S.getDataURL = function(key) {
      if (customUrls[key]) return customUrls[key];
      return origGetDataURL(key);
    };
  }

  // ================= 4. 天氣狀態管理、特效繪製與稀有教材/海怪注入 =================
  const INDOOR_ZONES = ["tent_hero", "tent_guild", "tent_forge"];

  function randInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  const WeatherManager = {
    lastRenderedWeather: "",
    lastRenderedZone: "",

    getCurrentWeather: function() {
      const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
      const wId = s.currentWeather || "clear";
      return WEATHER_TYPES[wId] || WEATHER_TYPES.clear;
    },

    // 隨機抽取下一個自然天氣（夜晚提高流星雨機率，破曉提高濃霧機率）
    rollNaturalWeather: function(phaseId) {
      const r = Math.random();
      if (phaseId === "night") {
        if (r < 0.34) return "meteor";
        if (r < 0.56) return "fog";
        if (r < 0.78) return "frost";
        return "rain";
      }
      if (phaseId === "dawn") {
        if (r < 0.38) return "fog";
        if (r < 0.65) return "rain";
        if (r < 0.82) return "frost";
        return "clear";
      }
      if (phaseId === "dusk") {
        if (r < 0.35) return "rain";
        if (r < 0.60) return "fog";
        if (r < 0.80) return "meteor";
        return "clear";
      }
      // 白晝
      if (r < 0.35) return "clear";
      if (r < 0.62) return "rain";
      if (r < 0.82) return "fog";
      return "frost";
    },

    // 切換天氣並即時在地圖生成該天氣專屬的稀有教材與海怪
    setWeather: function(weatherId, silent) {
      if (!WEATHER_TYPES[weatherId]) weatherId = "clear";
      const s = window.Aetheria.State.data;
      s.currentWeather = weatherId;
      const wDef = WEATHER_TYPES[weatherId];

      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
      if (mapObj) {
        this.injectWeatherSpawnsIntoMap(mapObj, wDef);
      }

      this.updateWeatherVisualFX();
      window.Aetheria.State.save();
      if (window.Aetheria.Renderer) {
        window.Aetheria.Renderer.builtZoneKey = null;
        window.Aetheria.Renderer.renderWorld();
      }
      if (window.Aetheria.UI && window.Aetheria.UI.updateAllHud) {
        window.Aetheria.UI.updateAllHud();
      }

      if (!silent && window.Aetheria.UI) {
        window.Aetheria.UI.showToast(
          wDef.icon + " 天氣轉為【" + wDef.name + "】！" + wDef.buffDesc
        );
      }
    },

    // 更新畫面上的雨絲/濃霧/冰晶/流星雨 DOM 特效與左上角天氣膠囊
    updateWeatherVisualFX: function() {
      const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
      const wDef = this.getCurrentWeather();
      const pill = document.getElementById("hud-weather-pill");

      if (pill) {
        pill.innerHTML = wDef.shortBadge;
        if (wDef.id === "meteor") pill.classList.add("weather-meteor-glow");
        else pill.classList.remove("weather-meteor-glow");
      }

      const fxLayer = document.getElementById("weather-fx-layer");
      if (!fxLayer) return;

      const isIndoor = INDOOR_ZONES.indexOf(s.currentZone) !== -1;
      const hasTorch = Boolean(s.torchTicks && s.torchTicks > 0);
      const effectiveWeather = isIndoor ? "clear" : (wDef.id === "fog" && hasTorch ? "clear" : wDef.id);

      const stateKey = effectiveWeather + "|" + s.currentZone;
      if (this.lastRenderedWeather === stateKey) return;
      this.lastRenderedWeather = stateKey;

      fxLayer.innerHTML = "";

      if (effectiveWeather === "rain") {
        for (let i = 0; i < 24; i++) {
          const drop = document.createElement("div");
          drop.className = "wx-rain-drop";
          drop.style.left = randInt(2, 98) + "%";
          drop.style.top = randInt(-10, 90) + "%";
          drop.style.animationDelay = (Math.random() * 0.65).toFixed(2) + "s";
          fxLayer.appendChild(drop);
        }
      } else if (effectiveWeather === "fog") {
        const veil = document.createElement("div");
        veil.className = "wx-fog-veil";
        fxLayer.appendChild(veil);
      } else if (effectiveWeather === "frost") {
        for (let j = 0; j < 18; j++) {
          const flake = document.createElement("div");
          flake.className = "wx-frost-flake";
          flake.style.left = randInt(4, 96) + "%";
          flake.style.top = randInt(-10, 85) + "%";
          flake.style.animationDelay = (Math.random() * 2.5).toFixed(2) + "s";
          fxLayer.appendChild(flake);
        }
      } else if (effectiveWeather === "meteor") {
        for (let k = 0; k < 6; k++) {
          const star = document.createElement("div");
          star.className = "wx-shooting-star";
          star.style.left = randInt(20, 90) + "%";
          star.style.top = randInt(5, 45) + "%";
          star.style.animationDelay = (k * 0.35 + Math.random() * 0.3).toFixed(2) + "s";
          fxLayer.appendChild(star);
        }
      }
    },

    // 在野外地圖與無盡碧海注入天氣專屬稀有教材與海怪
    injectWeatherSpawnsIntoMap: function(mapObj, wDef) {
      if (!mapObj || INDOOR_ZONES.indexOf(mapObj.id) !== -1) return;
      wDef = wDef || this.getCurrentWeather();
      const s = (window.Aetheria.State && window.Aetheria.State.data) || { lv: 1 };

      mapObj.nodes = (mapObj.nodes || []).filter(function(n) { return !n.isWeatherNode; });
      mapObj.monsters = (mapObj.monsters || []).filter(function(m) { return !m.isWeatherMonster; });

      const W = mapObj.width || 640;
      const H = (mapObj.id === "camp_hub") ? 345 : ((mapObj.height || 480) - 65);

      // 1. 生成 2~3 個天氣專屬稀有素材點（不限工具等級 reqToolLv: 0，讓玩家遇到特殊天氣即可採集！）
      const nodeTemplates = wDef.spawnNodes || [];
      const count = (mapObj.id === "camp_hub") ? 2 : 3;

      for (let i = 0; i < count && nodeTemplates.length > 0; i++) {
        const tpl = nodeTemplates[i % nodeTemplates.length];
        let nx = randInt(110, Math.min(900, W - 90));
        let ny = randInt(95, H);

        if (mapObj.id === "camp_hub") {
          nx = randInt(120, 520);
          ny = randInt(185, 330);
        }

        mapObj.nodes.push({
          id: "wx_node_" + wDef.id + "_" + i + "_" + Date.now(),
          x: nx,
          y: ny,
          type: tpl.type || "crystal",
          giveKey: tpl.giveKey,
          reqTool: tpl.type === "wood" ? "axe" : "pickaxe",
          reqToolLv: 0, // 天氣奇觀素材免除高階工具門檻！
          perfect: true,
          name: tpl.name,
          weatherSprite: tpl.sprite,
          isWeatherNode: true,
          opened: false
        });
      }

      // 2. 在野外或無盡碧海生成天氣專屬稀有魔物 / 海怪
      if (mapObj.id !== "camp_hub") {
        const isSea = (mapObj.id === "ocean_sea");
        const monTpl = (isSea && wDef.seaMonster) ? wDef.seaMonster : wDef.spawnMonster;
        if (monTpl) {
          const baseLv = Math.max(2, (mapObj.recLv || s.lv || 2) + (monTpl.lvOffset || 1));
          const mx = randInt(240, Math.min(860, W - 120));
          const my = randInt(120, H - 40);

          mapObj.monsters.push({
            id: "wx_mon_" + wDef.id + "_" + Date.now(),
            name: monTpl.name,
            lv: baseLv,
            x: mx,
            y: my,
            homeX: mx,
            homeY: my,
            type: monTpl.type || "bamboo",
            isBoss: false,
            isShiny: true,
            alive: true,
            isWeatherMonster: true,
            weatherDropKey: monTpl.dropKey,
            weatherDropCount: monTpl.dropCount || 2
          });
        }
      }

      mapObj._weatherSpawnTag = wDef.id + "_" + (mapObj._refreshToken || 0);
    },

    // 打開【🔭 科學氣象觀測站與人工調頻】視窗
    openWeatherStationModal: function() {
      const s = window.Aetheria.State.data;
      const wDef = this.getCurrentWeather();

      window.Aetheria.UI.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML =
        "🔭 艾瑟瑞亞科學氣象觀測站 (當前：" + wDef.icon + " " + wDef.name + ")";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      // 1. 當前氣象科學數據與小學科學原理卡
      const curCard = document.createElement("div");
      curCard.className = "sys-card-scroll";
      curCard.innerHTML =
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
          '<b style="font-size:14px; color:#1d3557;">' + wDef.icon + ' 當前天氣：【' + wDef.name + '】</b>' +
          '<span style="font-size:11.5px; color:#7f2b1d; font-weight:900;">🌡️氣溫 ' + wDef.temp + ' ｜ 💧濕度 ' + wDef.humidity + '</span>' +
        '</div>' +
        '<div style="font-size:12px; color:#2b2118; margin-top:4px; line-height:1.45;">' +
          '<b>' + wDef.scienceTitle + '</b><br>' + wDef.scienceNote +
        '</div>' +
        '<div style="font-size:11.5px; color:#1e3a2f; background:rgba(90,197,79,0.2); border:1px solid #5ac54f; border-radius:4px; padding:4px 6px; margin-top:5px; font-weight:bold;">' +
          '✨ 生態效果：' + wDef.buffDesc +
        '</div>';
      body.appendChild(curCard);

      // 2. 氣象星象儀（可消耗 80G 人工切換指定天氣，方便收集稀有教材與挑戰海怪）
      const ctrlHeader = document.createElement("div");
      ctrlHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:8px 0 4px; font-size:13px;";
      ctrlHeader.innerText = "【🧭 人工氣象調頻（切換天氣立即刷新該天氣專屬教材與海怪）】";
      body.appendChild(ctrlHeader);

      Object.values(WEATHER_TYPES).forEach(function(item) {
        const isCur = (item.id === wDef.id);
        const cost = (item.id === "meteor") ? 150 : 80;
        const canAfford = (s.gold || 0) >= cost;

        const row = document.createElement("div");
        row.className = "sys-card";
        row.style.borderColor = isCur ? "#f5b700" : "#3d3136";
        row.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">' +
            '<div>' +
              '<b style="color:' + (isCur ? '#ffd166' : '#ffffff') + '; font-size:13px;">' + item.icon + ' ' + item.name + '</b> ' +
              '<span style="font-size:11px; color:#8ce0ff;">(' + item.temp + ' / 濕度' + item.humidity + ')</span>' +
              '<div style="font-size:11.5px; color:#cbd5e1; margin-top:2px;">' + item.buffDesc + '</div>' +
            '</div>' +
            (isCur
              ? '<span style="color:#5ac54f; font-weight:900; white-space:nowrap;">✓ 生效中</span>'
              : '<button class="na-btn ' + (canAfford ? 'highlight' : '') + '" style="padding:5px 10px; white-space:nowrap;" onclick="Aetheria.Weather.summonWeatherByGold(\'' + item.id + '\', ' + cost + ')">喚起 (' + cost + 'G)</button>') +
          '</div>';
        body.appendChild(row);
      });
    },

    summonWeatherByGold: function(weatherId, cost) {
      const s = window.Aetheria.State.data;
      if ((s.gold || 0) < cost) {
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.showToast("金幣不足！人工調頻此天氣需要 " + cost + " G。");
        return;
      }
      s.gold -= cost;
      window.Aetheria.Audio.sfxLevelUp();
      this.setWeather(weatherId, false);
      this.openWeatherStationModal();
    }
  };

  window.Aetheria.Weather = WeatherManager;

  // ================= 5. 掛載日夜換季、垂釣暴擊、濃霧減速與流星雨增傷 =================
  function hookSystemsForWeather() {
    const St   = window.Aetheria.State;
    const Maps = window.Aetheria.Data && window.Aetheria.Data.Maps;
    const Exp  = window.Aetheria.Explore;
    const Ren  = window.Aetheria.Renderer;
    const Bat  = window.Aetheria.Battle;
    const UI   = window.Aetheria.UI;

    if (St) {
      if (!St.data.currentWeather) {
        St.data.currentWeather = "clear";
      }

      // 1. 🌠 星隕流星雨：主角攻擊力 +18%
      if (St.getTotalAtk) {
        const origAtk = St.getTotalAtk.bind(St);
        St.getTotalAtk = function() {
          let atk = origAtk();
          if (this.data && this.data.currentWeather === "meteor") {
            atk = Math.round(atk * 1.18);
          }
          return atk;
        };
      }

      // 2. 🌠 星隕流星雨：戰鬥經驗值 +35%
      if (St.gainRewards) {
        const origRewards = St.gainRewards.bind(St);
        St.gainRewards = function(expGain, goldGain, guildPtsGain) {
          if (this.data && this.data.currentWeather === "meteor") {
            expGain = Math.round((expGain || 0) * 1.35);
          }
          return origRewards(expGain, goldGain, guildPtsGain);
        };
      }

      // 3. 日夜時段切換或睡醒時，自動輪換大自然天氣！
      if (St.advanceTime) {
        const origAdvance = St.advanceTime.bind(St);
        St.advanceTime = function(ticks) {
          const oldPhase = this.getTimePhase().id;
          origAdvance(ticks);
          const newPhase = this.getTimePhase().id;
          if (oldPhase !== newPhase) {
            const nextW = WeatherManager.rollNaturalWeather(newPhase);
            WeatherManager.setWeather(nextW, false);
          }
        };
      }

      if (St.sleepUntilMorning) {
        const origSleep = St.sleepUntilMorning.bind(St);
        St.sleepUntilMorning = function() {
          origSleep();
          const nextW = WeatherManager.rollNaturalWeather("day");
          WeatherManager.setWeather(nextW, true);
        };
      }
    }

    if (Maps && Maps.getMap) {
      const origGetMap = Maps.getMap.bind(Maps);
      Maps.getMap = function(zoneId) {
        const m = origGetMap(zoneId);
        if (m) {
          const wDef = WeatherManager.getCurrentWeather();
          const expectedTag = wDef.id + "_" + (m._refreshToken || 0);
          if (m._weatherSpawnTag !== expectedTag) {
            WeatherManager.injectWeatherSpawnsIntoMap(m, wDef);
          }
        }
        return m;
      };
    }

    if (Exp) {
      // 4. 🌫️ 濃霧掩護：魔物視線受阻，非首領魔物移动與追擊速度降低 30%
      if (Exp.updateMonstersAI) {
        const origAI = Exp.updateMonstersAI.bind(Exp);
        Exp.updateMonstersAI = function(mapObj, s) {
          const isFog = (s && s.currentWeather === "fog" && !(s.torchTicks > 0));
          const oldCoords = [];
          if (isFog && mapObj && mapObj.monsters) {
            mapObj.monsters.forEach(function(m, idx) {
              oldCoords[idx] = { x: m.x, y: m.y };
            });
          }

          origAI(mapObj, s);

          if (isFog && mapObj && mapObj.monsters) {
            mapObj.monsters.forEach(function(m, idx) {
              if (m && !m.isBoss && oldCoords[idx]) {
                m.x = oldCoords[idx].x + (m.x - oldCoords[idx].x) * 0.68;
                m.y = oldCoords[idx].y + (m.y - oldCoords[idx].y) * 0.68;
              }
            });
          }
        };
      }

      // 5. 採集天氣專屬稀有教材與陽光雙倍植物加成
      if (Exp.harvestNode) {
        const origHarvest = Exp.harvestNode.bind(Exp);
        Exp.harvestNode = function(node) {
          const s = window.Aetheria.State.data;
          const isWxNode = Boolean(node && node.isWeatherNode);
          origHarvest(node);

          if (isWxNode && node && node.opened) {
            const matObj = (window.Aetheria.Data.MATERIALS && window.Aetheria.Data.MATERIALS[node.giveKey]) || { name: node.name };
            s.inventory[node.giveKey] = (s.inventory[node.giveKey] || 0) + 1;
            window.Aetheria.State.save();
            window.Aetheria.UI.updateAllHud();
            window.Aetheria.UI.showToast("🌦️ 天氣奇觀額外收穫：多獲【" + matObj.name + " +1】！");
          } else if (s.currentWeather === "clear" && node && node.type === "wood" && node.opened && Math.random() < 0.25) {
            s.inventory[node.giveKey] = (s.inventory[node.giveKey] || 0) + 1;
            window.Aetheria.State.save();
            window.Aetheria.UI.updateAllHud();
            window.Aetheria.UI.showToast("☀️ 陽光光合作用暴擊：額外多採集 1 份植物教材！");
          }
        };
      }
    }

    // 6. 擊敗天氣專屬稀有魔物 / 海怪，必掉專屬稀有素材！
    if (Bat && Bat.winBattle) {
      const origWin = Bat.winBattle.bind(Bat);
      Bat.winBattle = function() {
        const ref = this.mapMonsterRef;
        const isWxMon = Boolean(ref && ref.isWeatherMonster);
        const dropKey = ref && ref.weatherDropKey;
        const dropCnt = (ref && ref.weatherDropCount) || 2;

        origWin();

        if (isWxMon && dropKey) {
          const s = window.Aetheria.State.data;
          s.inventory[dropKey] = (s.inventory[dropKey] || 0) + dropCnt;
          window.Aetheria.State.save();
          window.Aetheria.UI.updateAllHud();
          const mObj = (window.Aetheria.Data.MATERIALS && window.Aetheria.Data.MATERIALS[dropKey]) || { name: dropKey };
          setTimeout(function() {
            window.Aetheria.UI.showToast("🌦️ 討伐天氣稀有魔物成功！額外掉落【" + mObj.name + " x" + dropCnt + "】！");
          }, 450);
        }
      };
    }

    // 7. 🌧️ 驟雨垂釣豐收監測：只要在落雨天釣魚成功 (inventory.fish 增加)，自動額外贈送鮮魚+1 與深海珊瑚+1！
    if (UI && UI.updateAllHud) {
      let lastKnownFish = -1;
      const origUpdateHud = UI.updateAllHud.bind(UI);
      UI.updateAllHud = function() {
        origUpdateHud();
        WeatherManager.updateWeatherVisualFX();

        const s = window.Aetheria.State && window.Aetheria.State.data;
        if (!s || !s.inventory) return;
        const curFish = s.inventory.fish || 0;
        if (lastKnownFish >= 0 && curFish > lastKnownFish && s.currentWeather === "rain") {
          s.inventory.fish = curFish + 1;
          s.inventory.coral = (s.inventory.coral || 0) + 1;
          lastKnownFish = s.inventory.fish;
          window.Aetheria.State.save();
          setTimeout(function() {
            window.Aetheria.UI.showToast("🌧️ 驟雨潮汐大豐收！額外釣起【銀鱗鮮魚 +1、深海珊瑚 +1】！");
          }, 300);
        } else {
          lastKnownFish = curFish;
        }
      };
    }

    // 8. 渲染器掛載：為天氣專屬礦植套用特殊像素圖示與高亮標籤
    if (Ren) {
      const origBuild = Ren.buildSceneDOM.bind(Ren);
      Ren.buildSceneDOM = function(mapObj) {
        origBuild(mapObj);
        try {
          const S = window.Aetheria.Data.Sprites;
          Object.keys(this.domPool.nodes || {}).forEach(function(nId) {
            const item = Ren.domPool.nodes[nId];
            if (item && item.data && item.data.isWeatherNode && item.data.weatherSprite && S) {
              item.el.innerHTML = '<img src="' + S.getDataURL(item.data.weatherSprite) + '" alt="">';
              if (item.lbl) {
                item.lbl.className = "dom-label weather-node-lbl";
                item.lbl.innerText = item.data.name;
                item.el.appendChild(item.lbl);
              }
            }
          });
        } catch (e) {}
      };

      const origRender = Ren.renderWorld.bind(Ren);
      Ren.renderWorld = function() {
        origRender();
        try {
          Object.keys(this.domPool.nodes || {}).forEach(function(nId) {
            const item = Ren.domPool.nodes[nId];
            if (item && item.data && item.data.isWeatherNode && !item.data.opened && item.lbl) {
              item.lbl.className = "dom-label weather-node-lbl";
              item.lbl.innerText = item.data.name;
            }
          });

          Object.keys(this.domPool.monsters || {}).forEach(function(mId) {
            const item = Ren.domPool.monsters[mId];
            if (item && item.data && item.data.isWeatherMonster && item.data.alive !== false && item.lbl) {
              item.lbl.className = "dom-label weather-mon-lbl";
              item.lbl.innerText = item.data.name + " Lv." + item.data.lv;
            }
          });
        } catch (e) {}
      };
    }
  }

  function initWeatherEcologyModule() {
    try {
      injectWeatherStylesAndDOM();
      registerWeatherSprites();
      hookSystemsForWeather();

      const s = window.Aetheria.State && window.Aetheria.State.data;
      if (s && window.Aetheria.Data && window.Aetheria.Data.Maps) {
        const curMap = window.Aetheria.Data.Maps.getMap(s.currentZone);
        if (curMap) {
          WeatherManager.injectWeatherSpawnsIntoMap(curMap, WeatherManager.getCurrentWeather());
        }
      }
      WeatherManager.updateWeatherVisualFX();
      if (window.Aetheria.Renderer) {
        window.Aetheria.Renderer.builtZoneKey = null;
        window.Aetheria.Renderer.renderWorld();
      }
    } catch (err) {
      console.error("Weather Ecology v8.7 init error:", err);
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(initWeatherEcologyModule, 165);
  } else {
    window.addEventListener("load", function() {
      setTimeout(initWeatherEcologyModule, 165);
    });
  }
})();
