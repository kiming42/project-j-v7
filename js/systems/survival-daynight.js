/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 主角帳篷睡袋、日出動畫與夜行狂暴魔物模組 (survival-daynight.js - v7.1)
 * 模組化獨立擴充檔：
 *   1. 自動註冊像素圖示：主角藍金帳篷 (hero_tent)、舒適睡袋 (sleeping_bag)、溫習書桌 (study_desk)
 *   2. 於曙光營地 (camp_hub) 中央注入【主角專屬帳篷】及內部地圖 (tent_hero)
 *   3. 睡袋互動與「🌙 黑夜星空 ➔ 🌅 破曉日出 ➔ ☀️ 天亮」全屏漸變過場動畫
 *   4. 參考《Survival RPG》黑夜外出魔物難度提升 (Lv+3、HP+35%、ATK+30%、護盾+1、火把克制與豐厚夜戰掉落)
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  // ================= 1. 注入專屬 CSS 樣式与睡眠日出動畫 DOM =================
  function injectSurvivalStylesAndDOM() {
    if (!document.getElementById("survival-v71-styles")) {
      const style = document.createElement("style");
      style.id = "survival-v71-styles";
      style.textContent = `
        /* 夜行狂暴魔物頭頂標籤 */
        .dom-label.night-fiend-lbl {
          background: linear-gradient(90deg, #3c096c 0%, #9d0208 100%);
          color: #ffd166;
          border: 1.5px solid #ff758f;
          box-shadow: 0 0 8px rgba(224, 60, 75, 0.85);
          animation: bobQuest 0.8s infinite ease-in-out;
        }
        .dom-label.bed-lbl {
          background: #1d3557;
          color: #fff3b0;
          border-color: #8ce0ff;
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

  // ================= 2. 註冊主角帳篷、睡袋與書桌像素圖示 =================
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

    // 藍金主角專屬帳篷 (16x16)
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

    // 舒適紅金睡袋與枕頭 (16x16)
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

    // 冒險者溫習書桌與油燈 (16x16)
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

  // ================= 3. 注入【主角專屬帳篷】至營地與地圖庫 =================
  function buildHeroTentInterior() {
    return {
      id: "tent_hero",
      _refreshToken: Date.now(),
      name: "主角專屬帳篷",
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
        { id: "bed_hero_bag",    x: 166, y: 80, sprite: "sleeping_bag", w: 30, h: 30, solid: true, isHeroBed: true,  name: "舒適睡袋 [按A睡覺]" },
        { id: "desk_hero_study", x: 92,  y: 82, sprite: "study_desk",   w: 28, h: 28, solid: true, isHeroDesk: true, name: "冒險書桌 [按A溫習]" },
        { x: 248, y: 78, sprite: "campfire",     w: 22, h: 22, solid: true },
        { x: 165, y: 140, sprite: "deco_bench",  w: 30, h: 16, solid: false }
      ],
      nodes: [],
      npcs: [],
      monsters: [],
      portals: [
        { id: "p_exit_hero_tent", name: "離開帳篷返回營地 ▾", x: 180, y: 228, targetZone: "camp_hub", targetX: 312, targetY: 182, icon: "stairs" }
      ]
    };
  }

  function injectHeroTentIntoCamp(campMap) {
    if (!campMap || campMap._heroTentInjected) return campMap;
    campMap._heroTentInjected = true;

    // 移開原本在 (295, 115) 擋住主角帳篷門口的尖銳燧石
    (campMap.nodes || []).forEach(function(n) {
      if (n.id === "camp_fl1") {
        n.x = 248;
        n.y = 162;
      }
    });

    // 加入藍金主角帳篷外觀
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

    // 加入進入主角帳篷的傳送門
    campMap.portals = campMap.portals || [];
    campMap.portals.push({
      id: "p_enter_hero_tent",
      name: "進入【主角帳篷・睡袋】",
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

    // 立即為當前 camp_hub 注入主角帳篷
    const initialCamp = origGetMap("camp_hub");
    if (initialCamp) injectHeroTentIntoCamp(initialCamp);
  }

  // ================= 4. 睡袋互動、日出漸變動畫與書桌溫習功能 =================
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
          '在自己的睡袋中休息，不僅能將<b>生命值與飽食度 100% 恢復</b>，睡醒後更可獲得<b>【晨間活力】</b>（接下來 3 場戰鬥攻擊力 +15%），並刷新全大陸資源！' +
        '</div>';
      body.appendChild(statusCard);

      // 選項 1：睡到天亮（播放黑夜轉天亮日出動畫）
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

      // 選項 2：休息至黑夜（方便想挑戰《Survival RPG》高難度夜行狂暴魔物的玩家）
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

      // 先切回探索面板，讓玩家清楚看見上半屏的日出過場與地圖光影變化
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

      // 階段 1 (1.3秒後)：月亮落下，天空轉為破曉晨曦金紅色，太陽升起
      setTimeout(function() {
        overlay.className = "phase-dawn";
        if (celestial) {
          celestial.innerText = "🌅";
          celestial.style.top = "42px";
        }
        if (titleEl) titleEl.innerText = "🌅 破曉時分，晨曦照亮艾瑟瑞亞大陸……";

        // 同步更新底層遊戲狀態至清晨白晝
        window.Aetheria.State.sleepUntilMorning();
        s.wellRestedBattles = 3; // 睡袋專屬：3場戰鬥晨間活力加成
        window.Aetheria.State.save();
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.UI.updateAllHud();
        if (window.Aetheria.Renderer) window.Aetheria.Renderer.renderWorld();
      }, 1300);

      // 階段 2 (2.5秒後)：太陽高掛，天空轉為蔚藍白晝
      setTimeout(function() {
        overlay.className = "phase-morning";
        if (celestial) {
          celestial.innerText = "☀️";
          celestial.style.top = "10px";
        }
        if (zzzTag) zzzTag.style.display = "none";
        if (titleEl) titleEl.innerText = "☀️ 第 " + s.dayCount + " 天清晨天亮了！";
        if (subEl) subEl.innerText = "生命值與飽食度 100% 恢復！獲得【晨間活力（3戰傷害+15%）】！";
      }, 2500);

      // 階段 3 (3.7秒後)：平滑淡出過場，回到明亮的遊戲畫面
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
        s.worldClock = 285; // 進入黑夜時段
        window.Aetheria.State.restoreHunger(100, s.maxHp);
        window.Aetheria.Data.Maps.refreshAllResources();
        if (window.Aetheria.Renderer) window.Aetheria.Renderer.builtZoneKey = null;
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.UI.updateAllHud();
        if (window.Aetheria.Renderer) window.Aetheria.Renderer.renderWorld();

        if (titleEl) titleEl.innerText = "🌙 黑夜降臨！野外魔物已進入【夜行狂暴】狀態！";
        if (subEl) subEl.innerText = "魔物等級+3、攻血強化，但擊敗可獲 +50% 經驗金幣與高機率破防核心！記得攜帶【松脂火把】！";
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
          '在自己的帳篷書桌前溫習題目完全不會受到傷害！每溫習答對 1 題，即可恢復 <b>+25% 飽食度</b>並獲得 <b>+25 G 獎學金</b>。' +
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

  // ================= 5. 掛載睡袋互動、夜行狂暴魔物難度與火把克制邏輯 =================
  function hookSystemsForSurvivalV71() {
    const Exp = window.Aetheria.Explore;
    const Ren = window.Aetheria.Renderer;
    const Bat = window.Aetheria.Battle;
    const UI  = window.Aetheria.UI;
    const St  = window.Aetheria.State;

    // (A) 黑夜經驗與金幣獎勵提升至 +50%
    if (St && St.getTimePhase) {
      const origGetPhase = St.getTimePhase.bind(St);
      St.getTimePhase = function() {
        const p = origGetPhase();
        if (p && p.isNight) {
          p.expMult = 1.50;
        }
        return p;
      };
    }

    // (B) 擴充渲染器：渲染帳篷睡袋/書桌標籤，以及黑夜【🌙夜行狂暴】魔物標籤
    if (Ren && Ren.renderWorld) {
      const origRenderWorld = Ren.renderWorld.bind(Ren);
      Ren.renderWorld = function() {
        origRenderWorld();
        try {
          const s = window.Aetheria.State.data;
          const isNight = window.Aetheria.State.getTimePhase().isNight;

          // 標示主角帳篷內的睡袋與書桌
          Object.keys(this.domPool.decos || {}).forEach(function(k) {
            const item = Ren.domPool.decos[k];
            if (!item || !item.data) return;
            if (item.data.isHeroBed) {
              item.lbl.style.display = "block";
              item.lbl.className = "dom-label bed-lbl";
              item.lbl.innerText = "舒適睡袋 [按A睡覺]";
            } else if (item.data.isHeroDesk) {
              item.lbl.style.display = "block";
              item.lbl.className = "dom-label portal-lbl";
              item.lbl.innerText = "冒險書桌 [按A溫習]";
            } else if (item.data.isCookPot) {
              item.lbl.innerText = "料理鍋 [按A煲湯/烤糧]";
            }
          });

          // 黑夜時段：野外魔物顯示【🌙夜行狂暴 Lv.+3】紅紫警示標籤
          if (isNight) {
            Object.keys(this.domPool.monsters || {}).forEach(function(mId) {
              const item = Ren.domPool.monsters[mId];
              if (!item || !item.data || item.data.alive === false) return;
              const m = item.data;
              const nightLv = m.lv + 3;
              if (m.aggro) {
                item.lbl.className = "dom-label aggro-lbl";
                item.lbl.innerText = "[!夜行狂暴] " + m.name + " Lv." + nightLv;
              } else if (!m.reqSeals || m.reqSeals.length === 0) {
                item.lbl.className = "dom-label night-fiend-lbl";
                item.lbl.innerText = "🌙[夜行狂暴] " + m.name + " Lv." + nightLv;
              }
            });
          }
        } catch (e) {}
      };
    }

    // (C) 擴充探索互動：對準睡袋或書桌按 A 鍵，以及火把驅散夜魔仇恨
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

    // (D) 擴充戰鬥系統：黑夜魔物強化 (Lv+3、HP+35%、ATK+30%、護盾+1) 與松脂火把破除暗夜護盾
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

          // 若玩家點燃了松脂火把，火光直接燒毀夜魔額外的暗夜護盾！否則夜魔護盾 +1
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

        // 睡袋【晨間活力】加成提示
        if (s.wellRestedBattles && s.wellRestedBattles > 0 && this.mode === "combat") {
          s.wellRestedBattles--;
          e.hp = Math.max(1, Math.round(e.hp * 0.88)); // 晨間活力開局先削弱敵人 12% HP
          this.updateBattleHUD();
        }
      };
    }

    // (E) 將營地料理鍋的「睡眠」按鈕改為引導或直接進入主角帳篷睡袋動畫
    if (UI) {
      UI.sleepAtCamp = function() {
        const s = window.Aetheria.State.data;
        // 自動將主角移入自己的帳篷睡袋旁並播放日出睡眠動畫
        s.currentZone = "tent_hero";
        s.heroX = 166;
        s.heroY = 118;
        s.petX = 146;
        s.petY = 122;
        if (window.Aetheria.Renderer) window.Aetheria.Renderer.builtZoneKey = null;
        SurvivalDayNight.playSleepToMorning();
      };

      const origUpdateZone = UI.updateHudZoneDynamic.bind(UI);
      UI.updateHudZoneDynamic = function(mapObj, s) {
        origUpdateZone(mapObj, s);
        const zoneBadge = document.getElementById("hud-zone");
        if (zoneBadge && mapObj && mapObj.id === "tent_hero") {
          zoneBadge.className = "na-badge danger-safe";
          zoneBadge.innerText = "0. 主角專屬帳篷";
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

      // 1. 確保主角帳篷 (tent_hero) 視為安全室內：不耗飽食度、不受黑夜遮罩影響
      const St = window.Aetheria.State;
      if (St && St.consumeHunger) {
        const origConsume = St.consumeHunger.bind(St);
        St.consumeHunger = function(amount) {
          if (St.data && St.data.currentZone === "tent_hero") return true;
          return origConsume(amount);
        };
      }

      const Ren = window.Aetheria.Renderer;
      if (Ren) {
        const origRender = Ren.renderWorld.bind(Ren);
        Ren.renderWorld = function() {
          origRender();
          const s = window.Aetheria.State.data;
          const dnEl = document.getElementById("daynight-overlay");
          if (dnEl && s && s.currentZone === "tent_hero") {
            dnEl.className = "dn-day";
          }
        };
        // 2. 強制重置場景快取並立即重繪，確保一進營地即刻顯示【主角專屬帳篷】
        Ren.builtZoneKey = null;
        Ren.renderWorld();
      }
    } catch (err) {
      console.error("Survival v7.1 module init error:", err);
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(initSurvivalExpansion, 25);
  } else {
    window.addEventListener("load", function() {
      setTimeout(initSurvivalExpansion, 25);
    });
  }
})();
