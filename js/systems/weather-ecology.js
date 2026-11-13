/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 純視覺動態天氣氛圍模組 (weather-ecology.js - v9.2 輕量純享版)
 * 核心設計：
 *   1. 只保留純粹的畫面天氣視覺特效：☀️晴朗、🌧️驟雨、🌫️濃霧、❄️飄雪結霜、🌠夜空流星雨
 *   2. 隨日夜時段轉換與睡眠自然交替（進入室內帳篷自動隱藏，點燃松脂火把可驅散濃霧）
 *   3. 零額外介面按鈕、零額外地圖礦石與怪物生成，保持畫面與系統 100% 乾淨清爽
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const INDOOR_ZONES = ["tent_hero", "tent_guild", "tent_forge"];

  function randInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  // ================= 1. 注入純視覺天氣特效層 CSS 與 DOM =================
  function injectWeatherFXStyles() {
    if (!document.getElementById("weather-v92-styles")) {
      const style = document.createElement("style");
      style.id = "weather-v92-styles";
      style.textContent = `
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
          background: linear-gradient(180deg, transparent, rgba(140, 224, 255, 0.82));
          animation: wxRainFall 0.65s linear infinite;
        }
        @keyframes wxRainFall {
          0%   { transform: translateY(-20px) translateX(6px); opacity: 0; }
          20%  { opacity: 0.85; }
          100% { transform: translateY(340px) translateX(-18px); opacity: 0.15; }
        }

        /* 🌫️ 濃霧特效 */
        .wx-fog-veil {
          position: absolute;
          inset: -20%;
          background:
            radial-gradient(circle at 30% 40%, rgba(226, 232, 240, 0.34) 0%, transparent 55%),
            radial-gradient(circle at 75% 65%, rgba(203, 213, 225, 0.32) 0%, transparent 60%),
            rgba(148, 163, 184, 0.16);
          animation: wxFogDrift 7s ease-in-out infinite alternate;
        }
        @keyframes wxFogDrift {
          0%   { transform: translateX(-14px) scale(1); }
          100% { transform: translateX(14px) scale(1.06); }
        }

        /* ❄️ 飄雪結霜特效 */
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
          0%   { transform: translateY(-15px) translateX(0px); opacity: 0.9; }
          50%  { transform: translateY(160px) translateX(10px); opacity: 0.8; }
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
          animation: wxMeteorShoot 1.9s ease-in infinite;
          opacity: 0;
        }
        @keyframes wxMeteorShoot {
          0%   { transform: translate(120px, -60px) rotate(-32deg); opacity: 0; }
          15%  { opacity: 1; }
          65%  { transform: translate(-220px, 160px) rotate(-32deg); opacity: 0; }
          100% { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    // 若舊版留有左上角天氣膠囊則自動移除，保持畫面乾淨
    const oldPill = document.getElementById("hud-weather-pill");
    if (oldPill && oldPill.parentNode) {
      oldPill.parentNode.removeChild(oldPill);
    }

    const upper = document.getElementById("upper-screen");
    if (upper && !document.getElementById("weather-fx-layer")) {
      const fxLayer = document.createElement("div");
      fxLayer.id = "weather-fx-layer";
      upper.appendChild(fxLayer);
    }
  }

  // ================= 2. 純視覺天氣切換與渲染管理 =================
  const WeatherFXManager = {
    lastStateKey: "",

    rollNaturalWeather: function(phaseId) {
      const r = Math.random();
      if (phaseId === "night") {
        if (r < 0.38) return "meteor";
        if (r < 0.62) return "clear";
        if (r < 0.82) return "fog";
        return "rain";
      }
      if (phaseId === "dawn") {
        if (r < 0.42) return "fog";
        if (r < 0.72) return "clear";
        return "rain";
      }
      if (phaseId === "dusk") {
        if (r < 0.45) return "clear";
        if (r < 0.75) return "rain";
        return "fog";
      }
      // 白晝
      if (r < 0.55) return "clear";
      if (r < 0.80) return "rain";
      if (r < 0.92) return "fog";
      return "frost";
    },

    setWeather: function(weatherId) {
      const s = window.Aetheria.State && window.Aetheria.State.data;
      if (!s) return;
      s.currentWeather = weatherId || "clear";
      this.updateWeatherVisualFX();
    },

    updateWeatherVisualFX: function() {
      const fxLayer = document.getElementById("weather-fx-layer");
      if (!fxLayer) return;

      const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
      const zone = s.currentZone || "camp_hub";
      const isIndoor = INDOOR_ZONES.indexOf(zone) !== -1;
      const hasTorch = Boolean(s.torchTicks && s.torchTicks > 0);

      let wId = s.currentWeather || "clear";
      // 在第4區極寒雪原時，落雨自動呈現為飄雪結霜
      if (zone === "zone4_snow" && (wId === "rain" || wId === "clear")) {
        wId = "frost";
      }
      if (isIndoor || (wId === "fog" && hasTorch)) {
        wId = "clear";
      }

      const stateKey = wId + "|" + zone;
      if (this.lastStateKey === stateKey) return;
      this.lastStateKey = stateKey;

      fxLayer.innerHTML = "";

      if (wId === "rain") {
        for (let i = 0; i < 24; i++) {
          const drop = document.createElement("div");
          drop.className = "wx-rain-drop";
          drop.style.left = randInt(2, 98) + "%";
          drop.style.top = randInt(-10, 90) + "%";
          drop.style.animationDelay = (Math.random() * 0.65).toFixed(2) + "s";
          fxLayer.appendChild(drop);
        }
      } else if (wId === "fog") {
        const veil = document.createElement("div");
        veil.className = "wx-fog-veil";
        fxLayer.appendChild(veil);
      } else if (wId === "frost") {
        for (let j = 0; j < 18; j++) {
          const flake = document.createElement("div");
          flake.className = "wx-frost-flake";
          flake.style.left = randInt(4, 96) + "%";
          flake.style.top = randInt(-10, 85) + "%";
          flake.style.animationDelay = (Math.random() * 2.5).toFixed(2) + "s";
          fxLayer.appendChild(flake);
        }
      } else if (wId === "meteor") {
        for (let k = 0; k < 6; k++) {
          const star = document.createElement("div");
          star.className = "wx-shooting-star";
          star.style.left = randInt(20, 90) + "%";
          star.style.top = randInt(5, 45) + "%";
          star.style.animationDelay = (k * 0.35 + Math.random() * 0.3).toFixed(2) + "s";
          fxLayer.appendChild(star);
        }
      }
    }
  };

  window.Aetheria.Weather = WeatherFXManager;

  // ================= 3. 掛載日夜交替與畫面更新 =================
  function hookWeatherFX() {
    const St = window.Aetheria.State;
    const UI = window.Aetheria.UI;

    if (St) {
      if (St.data && !St.data.currentWeather) {
        St.data.currentWeather = "clear";
      }

      if (St.advanceTime) {
        const origAdvance = St.advanceTime.bind(St);
        St.advanceTime = function(ticks) {
          const oldPhase = this.getTimePhase().id;
          origAdvance(ticks);
          const newPhase = this.getTimePhase().id;
          if (oldPhase !== newPhase) {
            WeatherFXManager.setWeather(WeatherFXManager.rollNaturalWeather(newPhase));
          }
        };
      }

      if (St.sleepUntilMorning) {
        const origSleep = St.sleepUntilMorning.bind(St);
        St.sleepUntilMorning = function() {
          origSleep();
          WeatherFXManager.setWeather(WeatherFXManager.rollNaturalWeather("day"));
        };
      }
    }

    if (UI && UI.updateAllHud) {
      const origUpdateHud = UI.updateAllHud.bind(UI);
      UI.updateAllHud = function() {
        origUpdateHud();
        WeatherFXManager.updateWeatherVisualFX();
      };
    }
  }

  function initWeatherFXModule() {
    try {
      injectWeatherFXStyles();
      hookWeatherFX();
      WeatherFXManager.updateWeatherVisualFX();
    } catch (err) {
      console.error("Weather Visual FX v9.2 init error:", err);
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(initWeatherFXModule, 160);
  } else {
    window.addEventListener("load", function() {
      setTimeout(initWeatherFXModule, 160);
    });
  }
})();
