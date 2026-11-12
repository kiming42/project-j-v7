/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 標籤簡化、按鍵人體工學優化與日夜帳篷模組 (survival-daynight.js - v7.2)
 * 升級：1.全面簡化上半屏地圖標籤（帳篷、設施、NPC、魔物、頂部HUD），消除文字重疊
 *       2.修復下半屏控制區排版，十字鍵靠左、A鍵與2x2求生鍵靠右且預留安全邊距，絕不裁切
 *       3.包含主角專屬帳篷、睡袋「黑夜轉天亮」日出動畫與夜行狂暴魔物機制
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  // ================= 1. 注入介面優化 CSS（含下半框按鍵修正與睡眠日出動畫） =================
  function injectSurvivalStylesAndDOM() {
    if (!document.getElementById("survival-v71-styles")) {
      const style = document.createElement("style");
      style.id = "survival-v71-styles";
      style.textContent = `
        /* 頂部 HUD 緊湊單行化 */
        #hud-overlay {
          top: 5px !important;
          left: 56px !important;
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

        /* 上半屏地圖標籤精簡防重疊 */
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

        /* 下半屏控制區：強制左右分佈，解決右邊按鈕被裁切問題 */
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

        /* 左手拇指區：十字方向鍵靠左對齊 */
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

        /* 右手拇指區：A鍵 + 2x2求生快捷鍵完整靠右且不超出邊界 */
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

        /* 睡眠「黑夜轉天亮」全屏漸變過場層 */
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

  // ================= 2. 輔助函式：將冗長的地圖與傳送門名稱精簡為短標籤 =================
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

  // ================= 3. 註冊主角帳篷、睡袋與書桌像素圖示 =================
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
    ], {
      K: "#141013", B: "#1d5eb8", Y: "#f5b700", W: "#8ce0ff", O: "#2b2118"
    });

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
    ], {
      K: "#141013", W: "#8f563b", P: "#ffffff", Y: "#f5b700", R: "#e03c4b", D: "#5c3824"
    });

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
    ], {
      K: "#141013", L: "#d9a066", D: "#8f563b", W: "#ffffff", B: "#3898ff", Y: "#ffd166", O: "#e03c4b"
    });

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

  // ================= 4. 注入【主角專屬帳篷】至營地與地圖庫 =================
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
    if (!campMap || campMap._heroTentInjected) return campMap;
    campMap._heroTentInjected = true;

    (campMap.nodes || []).forEach(function(n) {
      if (n.id === "camp_fl1") {
        n.x = 248;
        n.y = 162;
      }
    });

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
      if (m && m.id === "camp_hub") {
        injectHeroTentIntoCamp(m);
      }
      return m;
    };

    const origRefresh = Maps.refreshAllResources.bind(Maps);
    Maps.refreshAllResources = function() {
      origRefresh();
      heroTentMap = buildHeroTentInterior();
      const camp = origGetMap("camp_hub");
      if (camp) injectHeroTentIntoCamp(camp);
    };

    const initialCamp = origGetMap("camp_hub");
    if (initialCamp) injectHeroTentIntoCamp(initialCamp);
  }

  // ================= 5. 睡袋互動、日出漸變動畫與書桌溫習功能 =================
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
          '在自己的睡袋中休息，不僅能將<b>生命值與飽食度 100% 恢復</b>，睡醒後更可獲得<b>【晨間活力】</b>（接下來 3 場戰鬥開局削弱敵人 12% HP），並刷新全大陸資源！' +
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
              '<b style="color:#e0aaff; font-size:14px;">🌙 閉目養神至黑夜降臨 (夜獵挑戰)</b>' +
              '<div style="font-size:12px; color:#cbd5e1; margin-top:2px;">回滿 HP 與飽食度並推進至黑夜（野外魔物等級+3、獎賞+50%、高掉率核心）</div>' +
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
        if (subEl) subEl.innerText = "生命值與飽食度 100% 恢復！獲得【晨間活力】！";
      }, 2500);

      setTimeout(function() {
        overlay.style.opacity = "0";
        setTimeout(function() {
          overlay.style.display = "none";
          self.isSleepingAnim = false;
          window.Aetheria.UI.showToast("☀️ 早安！第 " + s.dayCount + " 天開始，HP與飽食度已全滿！");
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

        if (titleEl) titleEl.innerText = "🌙 黑夜降臨！野外魔物已進入【夜行狂暴】狀態！";
        if (subEl) subEl.innerText = "魔物等級+3、攻血強化，擊敗獲 +50% 經驗金幣！記得攜帶【松脂火把】！";
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
        '<b style="color:var(--na-gold);">【Survival RPG 日夜求生指南】</b>' +
        '<div style="font-size:12px; color:#cbd5e1; margin-top:4px; line-height:1.5;">' +
          '• <b>☀ 白晝 / 🌅 破曉</b>：視野清晰，魔物處於常態，最適合推進主線與採集建材。<br>' +
          '• <b>🌇 黃昏</b>：水波釣魚點的綠色命中區加寬 25%，最適合垂釣銀鱗鮮魚。<br>' +
          '• <b>🌙 黑夜（高危高回報）</b>：野外魔物進入<b>【夜行狂暴】</b>（等級+3、HP+35%、ATK+30%、護盾+1），但擊敗可獲 <b>+50% 經驗與金幣</b>及高機率破防核心！<br>' +
          '• <b>🔥 松脂火把克制</b>：黑夜手持點燃的火把，不僅能照亮視野，開戰時更能<b>直接燒毀夜行魔物 1 層護盾</b>！' +
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

  // ================= 6. 掛載上半屏標籤簡化器、睡袋互動與夜戰邏輯 =================
  function hookSystemsForSurvivalV71() {
    const Exp = window.Aetheria.Explore;
    const Ren = window.Aetheria.Renderer;
    const Bat = window.Aetheria.Battle;
    const UI  = window.Aetheria.UI;
    const St  = window.Aetheria.State;

    if (St && St.getTimePhase) {
      const origGetPhase = St.getTimePhase.bind(St);
      St.getTimePhase = function() {
        const p = origGetPhase();
        if (p && p.isNight) p.expMult = 1.50;
        return p;
      };
    }

    // 精簡上半屏所有標籤文字，徹底消除重疊
    if (Ren && Ren.renderWorld) {
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

          // 1. 簡化所有傳送門與帳篷入口標籤（如「! 鐵匠帳篷」、「主角帳篷」、「公會帳篷」）
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

          // 2. 簡化所有設施與工程標籤（如「料理鍋」、「釣魚點」、「睡袋」、「書桌」）
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

          // 3. 簡化所有 NPC 頭頂標籤（只顯示名字與簡潔狀態符號）
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

          // 4. 簡化魔物與夜行狂暴標籤
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

    if (Exp) {
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

    // 精簡頂部 HUD 徽章文字（使頂部 5 個徽章穩定排成單行）
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
      console.error("Survival v7.2 module init error:", err);
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(initSurvivalExpansion, 40);
  } else {
    window.addEventListener("load", function() {
      setTimeout(initSurvivalExpansion, 40);
    });
  }
})();
