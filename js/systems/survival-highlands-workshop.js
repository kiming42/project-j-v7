/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 主線強制因果鎖定與六大差異化地貌模組 (survival-highlands-workshop.js - v13.2)
 * 【Part 1 / 2：主線強制鎖鑰定義、下屏主線任務框同步、地貌自癒渲染引擎】
 * 核心修正：
 *   1. 【100% 強制解謎才可推進主線】：
 *      - 未完成本區「①工具破障 ➔ ②古碑機關 ➔ ③開啟破障寶箱取得破障聖物」前，無法修復過河橋樑、無法點亮封印柱！
 *      - 守關 Boss 帶有【🛡️無敵結界】，未完成 3 步破障解謎直接觸碰 Boss 會被結界彈開並彈出解謎指引，徹底杜絕跳過解謎直接打王！
 *   2. 【直接串連下屏主線任務框】：未完成本區破障前，下屏主線任務欄會直接顯示當前必須完成的解謎步驟與故事原因
 *   3. 【保留 v13.1 全部修復】：懸崖與放大全圖永不消失、移除左下角黑框小地圖、營地帳篷零 Lag、📖求生合成圖鑑
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  // ================= 0. 效能防抖與 DOM 屬性鎖 =================
  function setTextIfChanged(el, newText) {
    if (!el) return;
    if (el._lastTxt !== newText) {
      el._lastTxt = newText;
      el.textContent = newText;
    }
  }

  function setClassIfChanged(el, newCls) {
    if (!el) return;
    if (el._lastCls !== newCls) {
      el._lastCls = newCls;
      el.className = newCls;
    }
  }

  function setDisplayIfChanged(el, newDisp) {
    if (!el) return;
    if (el._lastDisp !== newDisp) {
      el._lastDisp = newDisp;
      el.style.display = newDisp;
    }
  }

  function lockHintElementSetter() {
    const hintEl = document.getElementById("a-btn-hint");
    if (!hintEl || hintEl._setterLocked) return;
    hintEl._setterLocked = true;
    let currentHintVal = hintEl.textContent || "";
    try {
      Object.defineProperty(hintEl, "innerText", {
        get: function() { return currentHintVal; },
        set: function(val) {
          const str = String(val || "");
          if (str === currentHintVal) return;
          currentHintVal = str;
          hintEl.textContent = str;
        },
        configurable: true
      });
    } catch (e) {}
  }

  // ================= 1. 注入樣式 =================
  function injectSurvivalRpgStyles() {
    if (document.getElementById("srpg-kenney-v132-styles")) return;
    const style = document.createElement("style");
    style.id = "srpg-kenney-v132-styles";
    style.textContent = `
      .kenney-terrain-canvas {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        pointer-events: none !important;
        z-index: 0 !important;
        image-rendering: pixelated !important;
      }
      #world-terrain-layer .dom-dirt-blob {
        opacity: 0 !important;
      }
      #world-terrain-layer .dom-dirt-blob.ocean-atoll {
        opacity: 1 !important;
      }

      #world-terrain-layer .dom-river { z-index: 2 !important; }
      #world-terrain-layer .dom-bridge { z-index: 6 !important; }
      #world-terrain-layer .dom-coast-beach { z-index: 2 !important; }
      #world-terrain-layer .dom-coast-sea   { z-index: 3 !important; }
      #world-terrain-layer .dom-wooden-pier { z-index: 4 !important; }

      /* 永久隱藏並移走原版黑框點陣小地圖 */
      #minimap-box, #minimap, #minimap-canvas, #hud-minimap, .minimap-box, .minimap-container {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        left: -9999px !important;
        pointer-events: none !important;
      }

      /* 左下角唯一圓形羅盤小地圖 */
      #srpg-compass-widget {
        position: absolute !important;
        width: 76px !important;
        height: 76px !important;
        bottom: 8px !important;
        left: 8px !important;
        border-radius: 50% !important;
        border: 4px solid #4a2511 !important;
        background: #102542 !important;
        box-shadow: 0 3px 8px rgba(0,0,0,0.85), inset 0 0 6px rgba(0,0,0,0.85) !important;
        overflow: visible !important;
        cursor: pointer !important;
        pointer-events: auto !important;
        z-index: 18 !important;
        padding: 0 !important;
        margin: 0 !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      #srpg-compass-widget:active {
        transform: scale(0.94) !important;
      }
      #toast-box, #dialog-box, #msg-box, #story-box,
      [id*="toast"], [class*="toast"], [id*="dialog"], [class*="dialog"] {
        z-index: 95 !important;
      }

      #srpg-compass-canvas {
        width: 100% !important;
        height: 100% !important;
        border-radius: 50% !important;
        display: block !important;
        image-rendering: pixelated !important;
        pointer-events: auto !important;
        cursor: pointer !important;
        border: none !important;
      }
      .compass-dir-tag {
        position: absolute;
        font-size: 9px;
        font-weight: 900;
        color: #f5e6c4;
        background: #4a2511;
        padding: 0px 3px;
        border-radius: 3px;
        line-height: 1.1;
        text-shadow: 1px 1px 0 #000;
        pointer-events: none;
        z-index: 19;
      }
      .compass-dir-n { top: -7px; left: 50%; transform: translateX(-50%); color: #ffd166; }
      .compass-dir-s { bottom: -7px; left: 50%; transform: translateX(-50%); }
      .compass-dir-w { left: -7px; top: 50%; transform: translateY(-50%); }
      .compass-dir-e { right: -7px; top: 50%; transform: translateY(-50%); }
      .compass-zoom-hint {
        position: absolute;
        bottom: -8px;
        right: -10px;
        background: #1d3557;
        color: #ffd166;
        border: 1px solid #f5b700;
        border-radius: 4px;
        font-size: 8.5px;
        font-weight: 900;
        padding: 0 3px;
        pointer-events: none;
        z-index: 20;
        box-shadow: 0 1px 3px #000;
      }

      #srpg-chain-tracker {
        position: absolute;
        top: 30px;
        right: 6px;
        z-index: 18;
        background: rgba(92, 29, 36, 0.92);
        color: #ffd166;
        border: 1.5px solid #ff758f;
        border-radius: 6px;
        padding: 3px 8px;
        font-size: 10.5px;
        font-weight: 900;
        cursor: pointer;
        pointer-events: auto;
        box-shadow: 0 2px 6px rgba(0,0,0,0.85);
        display: none;
      }
      #srpg-chain-tracker.chain-done {
        border-color: #5ac54f;
        color: #5ac54f;
        background: rgba(20, 42, 30, 0.92);
      }

      /* 下屏主線強制破障提示條 */
      #srpg-main-quest-lock-bar {
        background: linear-gradient(90deg, #4a151b 0%, #2b1116 100%);
        border: 1.5px solid #ff595e;
        border-radius: 6px;
        padding: 4px 8px;
        margin-top: 4px;
        color: #ffd166;
        font-size: 11px;
        font-weight: 900;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      #srpg-main-quest-lock-bar.unlocked {
        background: linear-gradient(90deg, #183a27 0%, #12261b 100%);
        border-color: #5ac54f;
        color: #a3f7b5;
      }

      .fullmap-stage-wrap {
        position: relative;
        width: 100%;
        background: #0f2942;
        border: 3px solid #d9a066;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 14px rgba(0,0,0,0.85);
      }
      #srpg-fullmap-canvas {
        width: 100%;
        height: auto;
        display: block;
        image-rendering: pixelated;
        cursor: crosshair;
      }
      .fullmap-legend-bar {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 4px;
        background: #181316;
        border: 1.5px solid #594950;
        border-radius: 6px;
        padding: 6px 8px;
        margin-top: 6px;
        font-size: 11px;
        color: #cbd5e1;
      }

      @keyframes srpgHitShake {
        0%, 100% { transform: translate(0, 0) scale(1); }
        25% { transform: translate(-3px, 1px) scale(0.92); }
        50% { transform: translate(3px, -2px) scale(1.06); }
        75% { transform: translate(-2px, 0px) scale(0.96); }
      }
      .srpg-node-hit {
        animation: srpgHitShake 0.22s ease-in-out !important;
      }
      .srpg-particle {
        position: absolute;
        width: 5px;
        height: 5px;
        border: 1px solid #141013;
        pointer-events: none;
        z-index: 45;
        transition: transform 0.42s ease-out, opacity 0.42s ease-out;
      }

      .dom-label.ladder-spot-lbl { background: #4a2c11; color: #ffd166; border: 1.5px solid #f5b700; font-weight: 900; }
      .dom-label.crypt-door-lbl  { background: #2d1442; color: #ffd166; border: 1.5px solid #e0aaff; font-weight: 900; }
      .dom-label.dig-spot-lbl    { background: #3d2314; color: #ffd166; border: 1.5px solid #f5b700; font-weight: 900; }
      .dom-label.puzzle-mech-lbl { background: #102542; color: #fff3b0; border: 1.5px solid #38b6ff; font-weight: 900; }
      .dom-label.puzzle-mech-on  { background: #1e3a2f; color: #5ac54f; border: 1.5px solid #5ac54f; font-weight: 900; }
      .dom-label.tool-gate-lbl   { background: #5c1d24; color: #ffd166; border: 1.5px solid #ff758f; font-weight: 900; }

      /* 格仔分類工坊與 📖 求生合成圖鑑 UI */
      #panel-modal #modal-body { overflow-y: auto !important; padding-bottom: 42px !important; }
      .wk-top-control-panel { background: #141013; padding-bottom: 4px; }
      .wk-inspector-box {
        background: linear-gradient(180deg, #261c14 0%, #18120e 100%);
        border: 2px solid #f5b700;
        border-radius: 8px;
        padding: 7px 9px;
        margin-bottom: 6px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.8);
      }
      .wk-subfilter-bar { display: flex; gap: 4px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 5px; }
      .wk-filter-pill {
        background: #1c1619; color: #cbd5e1; border: 1.5px solid #594950;
        border-radius: 14px; padding: 3px 9px; font-size: 11px; font-weight: 900; white-space: nowrap; cursor: pointer;
      }
      .wk-filter-pill.active { background: #1d3557; color: #ffd166; border-color: #38b6ff; }
      .wk-icon-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; padding: 2px 2px 44px 2px; }
      .wk-grid-cell {
        position: relative; background: #181316; border: 2px solid #4a3e44; border-radius: 7px;
        padding: 16px 4px 6px; display: flex; flex-direction: column; align-items: center;
        justify-content: space-between; text-align: center; cursor: pointer; min-height: 70px; user-select: none;
      }
      .wk-grid-cell.can-craft { border-color: #5ac54f; background: linear-gradient(180deg, #18281c 0%, #141815 100%); }
      .wk-grid-cell.selected  { border-color: #ffd166 !important; box-shadow: 0 0 9px rgba(245, 183, 0, 0.85); background: linear-gradient(180deg, #332614 0%, #1c150c 100%); }
      .wk-cell-badge     { position: absolute; top: 2px; right: 3px; font-size: 9.5px; font-weight: 900; padding: 0 4px; border-radius: 4px; background: rgba(0,0,0,0.75); color: #cbd5e1; pointer-events: none; }
      .wk-cell-craft-dot { position: absolute; top: 2px; left: 4px; font-size: 9px; font-weight: 900; color: #5ac54f; pointer-events: none; }
      .wk-cell-name      { font-size: 11px; font-weight: 900; color: #ffffff; margin-top: 2px; line-height: 1.15; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; pointer-events: none; }
      .wk-cell-quick-btn { margin-top: 3px; width: 92%; background: #f5b700; color: #141013; border: 1px solid #000; border-radius: 4px; padding: 2px 0; font-size: 10.5px; font-weight: 900; cursor: pointer; }
      .wk-mat-chip       { display: inline-flex; align-items: center; gap: 2px; font-size: 11px; font-weight: 900; padding: 2px 6px; border-radius: 4px; margin: 2px 4px 2px 0; background: #141013; border: 1px solid #4a3e44; }
      .wk-mat-chip.ok    { color: #5ac54f; border-color: #5ac54f; background: rgba(45, 106, 79, 0.25); }
      .wk-mat-chip.lack  { color: #ff758f; border-color: #ff595e; background: rgba(157, 2, 8, 0.22); }

      .codex-card {
        background: linear-gradient(180deg, #1e171b 0%, #141013 100%);
        border: 1.5px solid #4a3e44;
        border-left: 4px solid #f5b700;
        border-radius: 7px;
        padding: 7px 9px;
        margin-bottom: 6px;
      }
      .codex-card.owned {
        border-left-color: #5ac54f;
      }
      .codex-tag {
        display: inline-block;
        font-size: 10px;
        font-weight: 900;
        padding: 1px 6px;
        border-radius: 4px;
        background: #261c14;
        color: #ffd166;
        border: 1px solid #8f563b;
      }
    `;
    document.head.appendChild(style);
  }

  // ================= 2. 徹底移除左下角黑框小地圖 ＆ 掛載唯一圓形羅盤与右上角章節因果指引 =================
  let cachedCompassCanvas = null;

  function hideLegacyBlackMinimap() {
    const upper = document.getElementById("upper-screen");
    if (!upper) return;
    const upperRect = upper.getBoundingClientRect();

    const containers = [upper, document.getElementById("hud-overlay")].filter(Boolean);
    containers.forEach(function(parent) {
      Array.from(parent.children).forEach(function(ch) {
        if (!ch || ch.id === "srpg-compass-widget" || ch.id === "srpg-chain-tracker" ||
            ch.id === "world-viewport" || ch.id === "hud-overlay" || ch.id === "hud-hearts-box" ||
            ch.id === "weather-fx-layer" || ch.id === "sleep-transition-overlay") {
          return;
        }
        const r = ch.getBoundingClientRect();
        const isBottomLeftMini =
          r.width > 25 && r.width < 145 && r.height > 20 && r.height < 120 &&
          (r.left - upperRect.left) < 45 && (upperRect.bottom - r.bottom) < 45;

        if (ch.id === "minimap-box" || ch.id === "minimap" || ch.id === "minimap-canvas" || isBottomLeftMini) {
          ch.style.setProperty("display", "none", "important");
          ch.style.setProperty("visibility", "hidden", "important");
          ch.style.setProperty("left", "-9999px", "important");
          ch.style.setProperty("pointer-events", "none", "important");
        }
      });
    });
  }

  function mountGuaranteedCompassWidget() {
    hideLegacyBlackMinimap();
    const upper = document.getElementById("upper-screen");
    if (!upper) return null;

    if (!document.getElementById("srpg-chain-tracker")) {
      const tracker = document.createElement("div");
      tracker.id = "srpg-chain-tracker";
      tracker.onclick = function(ev) {
        ev.stopPropagation();
        if (window.Aetheria.Audio && window.Aetheria.Audio.sfxTalkBlip) window.Aetheria.Audio.sfxTalkBlip();
        if (window.Aetheria.HighlandsWorkshop) window.Aetheria.HighlandsWorkshop.openZoneStoryChainModal();
      };
      upper.appendChild(tracker);
    }

    if (cachedCompassCanvas && document.body.contains(cachedCompassCanvas)) {
      return cachedCompassCanvas;
    }

    let widget = document.getElementById("srpg-compass-widget");
    let canvas = document.getElementById("srpg-compass-canvas");

    if (!widget) {
      widget = document.createElement("div");
      widget.id = "srpg-compass-widget";
      widget.className = "srpg-compass-box";
      widget.title = "點擊放大檢視【全區全貌探索地圖】";

      canvas = document.createElement("canvas");
      canvas.id = "srpg-compass-canvas";
      canvas.className = "srpg-compass-canvas";
      canvas.width = 96;
      canvas.height = 96;
      widget.appendChild(canvas);

      ["N", "S", "W", "E"].forEach(function(dir) {
        const span = document.createElement("span");
        span.className = "compass-dir-tag compass-dir-" + dir.toLowerCase();
        span.innerText = dir;
        widget.appendChild(span);
      });

      const hint = document.createElement("span");
      hint.className = "compass-zoom-hint";
      hint.innerText = "🔍全圖";
      widget.appendChild(hint);

      const openMapFn = function(ev) {
        if (ev) { ev.stopPropagation(); ev.preventDefault(); }
        if (window.Aetheria.Audio && window.Aetheria.Audio.sfxTalkBlip) window.Aetheria.Audio.sfxTalkBlip();
        if (window.Aetheria.HighlandsWorkshop) window.Aetheria.HighlandsWorkshop.openFullZoneMapModal();
      };
      widget.onclick = openMapFn;
      canvas.onclick = openMapFn;

      upper.appendChild(widget);
    }
    cachedCompassCanvas = canvas;
    return canvas;
  }

  // ================= 3. ★ 主線強制綁定：章節 3 步因果解謎鏈定義 (ZONE_STORY_CHAINS) =================
  // 未完成全部 3 步 (step3Done === true) 前：
  //   1. 無法修復過河橋樑 / 無法啟動南北封印柱
  //   2. 守關 Boss 處於【🛡️無敵結界】狀態，觸碰時直接被結界彈開並彈出解謎步驟視窗！
  const ZONE_STORY_CHAINS = {
    zone1_forest: {
      zoneId: "zone1_forest",
      title: "第一章主線・破除迷霧森林荊棘詛咒",
      npcName: "斥候・里奧",
      relicName: "【翠風破障聖印】",
      storyIntro: "千年腐化樹妖王以「魔界荊棘」纏死了斷橋，並展開【無敵結界】！不先斬除荊棘並點燃四象淨化火盆取得【翠風破障聖印】，根本無法修橋或傷到樹妖王分毫！",
      step1GateId: "tg_z1_briar",
      step1Short: "① 造【除荊鐮刀】斬開荊棘魔藤(x:420,y:540)",
      step2Short: "② 依序點燃西南【四象火盆】(東➔南➔西➔北)",
      step3Short: "③ 開啟機關寶箱取得【翠風破障聖印】解鎖修橋與Boss戰",
      step1Title: "① 先爬上南側高台或進山洞採集赤銅礦與白錫礦 ➔ 於工坊合成【✂️除荊開路鐮刀】 ➔ 斬開西南荊棘谷的【🌿荊棘魔藤】(x:420, y:540)",
      step2Title: "② 依古碑日出至星夜順序點燃西南【🔥四象淨化火盆】(東之晨➔南之日➔西之霞➔北之星)",
      step3Title: "③ 開啟中央【🏆古遺跡機關寶箱】取得【翠風破障聖印】，即可修橋過河並破除樹妖王的無敵結界！",
      bossDebuffMsg: "🌟【翠風破障聖印共鳴】：樹妖王的無敵結界已粉碎，且護盾上限 -2！"
    },
    cave1_mushroom: {
      zoneId: "cave1_mushroom",
      title: "第一章支線・幽窟暗河與冰封秘銀脈",
      npcName: "矮人探勘員",
      relicName: "【幽窟破障聖印】",
      storyIntro: "蘑菇洞窟深處被寒氣與暗河水閘封鎖，首領受暗河結界保護處於【無敵狀態】！",
      step1GateId: "tg_c1_ice",
      step1Short: "① 造【高熱鋁熱火種】融化玄冰晶殼(x:860,y:640)",
      step2Short: "② 扳動西南【三連連動機括拉桿】使其全亮綠",
      step3Short: "③ 開啟機關寶箱取得【幽窟破障聖印】解除首領無敵",
      step1Title: "① 在工坊以木炭、鐵礦與松脂調配【🔥高熱鋁熱火種】 ➔ 融化洞窟中段的【🧊玄冰晶殼】(x:860, y:640)",
      step2Title: "② 扳動西南暗河畔的【⚙️三連連動機括拉桿】使其全數亮綠開啟",
      step3Title: "③ 開啟【🏆古遺跡機關寶箱】取得【幽窟破障聖印】，解除洞窟首領的無敵結界！",
      bossDebuffMsg: "🌟【幽窟破障聖印共鳴】：洞窟首領無敵結界已解除，且護盾上限 -2！"
    },
    zone2_canyon: {
      zoneId: "zone2_canyon",
      title: "第二章主線・法老王陵與卡死的吊橋絞盤",
      npcName: "斥候隊長・凱爾",
      relicName: "【法老太陽聖印】",
      storyIntro: "流沙峽谷的吊橋絞盤因缺少「青銅齒輪」而卡死，且流沙巨蠍王披着【無敵流沙重甲】！必須先啟動齒輪柱並共鳴四方石像取得【法老太陽聖印】，才能修好吊橋並擊穿蠍王重甲！",
      step1GateId: "tg_z2_gear",
      step1Short: "① 造【精密青銅齒輪】嵌入中央齒輪柱(x:720,y:540)",
      step2Short: "② 旋轉西南【四方石像】(西▶東,東◀西,北▼南,南▲北)",
      step3Short: "③ 開啟機關寶箱取得【法老太陽聖印】解鎖吊橋與Boss戰",
      step1Title: "① 採集赤銅與白錫冶煉青銅錠 ➔ 合成【⚙️精密青銅齒輪】嵌入流沙盆地的【⚙️齒輪機關柱】(x:720, y:540)",
      step2Title: "② 閱讀西南【📜法老方位碑】，旋轉四方守衛石像至正確朝向(西▶東、東◀西、北▼南、南▲北)",
      step3Title: "③ 開啟【🏆古遺跡機關寶箱】取得【法老太陽聖印】，解鎖峽谷吊橋並震碎巨蠍王的無敵重甲！",
      bossDebuffMsg: "🌟【法老太陽聖印共鳴】：流沙巨蠍王的無敵重甲已粉碎，且護盾上限 -2！"
    },
    zone3_coast: {
      zoneId: "zone3_coast",
      title: "第三章主線・新月沉船灣與退潮水閘",
      npcName: "老船匠・達克",
      relicName: "【海神退潮聖印】",
      storyIntro: "新月海灣漲潮淹沒了暗礁航道，且深海幽靈船長受【無敵潮汐結界】庇護！必須先打撈沉船水閘零件並扳動退潮拉桿取得【海神退潮聖印】，才能渡河並破除船長的不死結界！",
      step1GateId: "tg_z3_sunken",
      step1Short: "① 造【深水打撈磁鉤】打撈海灣沉船箱(x:760,y:580)",
      step2Short: "② 扳動西南【三連退潮水閘拉桿】使其全亮綠",
      step3Short: "③ 開啟機關寶箱取得【海神退潮聖印】解鎖渡河與Boss戰",
      step1Title: "① 在工坊打造【🧲深水打撈磁鉤】 ➔ 前往新月海灣打撈【⚓深海沉船箱】(x:760, y:580) 尋回水閘零件",
      step2Title: "② 前往西南祭壇扳動【⚙️三連連動水閘拉桿】使其全部開啟排乾積水",
      step3Title: "③ 開啟【🏆古遺跡機關寶箱】取得【海神退潮聖印】，解鎖渡河並破除幽靈船長的不死結界！",
      bossDebuffMsg: "🌟【海神退潮聖印共鳴】：幽靈船長的不死潮汐結界已斷絕，且護盾上限 -2！"
    },
    zone4_snow: {
      zoneId: "zone4_snow",
      title: "第四章主線・永凍鏡湖與逆風融霜聖火",
      npcName: "冰原獵手・弗雷",
      relicName: "【融霜地熱聖印】",
      storyIntro: "霜語雪原受鏡湖絕對零度冰封，極寒冰龍王披着【無敵萬年玄冰甲】！必須先融化鏡湖玄冰棺並點燃四象融霜聖火取得【融霜地熱聖印】，才能建屋渡河並融化冰龍王的無敵冰甲！",
      step1GateId: "tg_z4_ice1",
      step1Short: "① 造【高熱鋁熱火種】融化鏡湖玄冰棺(x:700,y:540)",
      step2Short: "② 逆風點燃西南【四象融霜火盆】(北➔西➔南➔東)",
      step3Short: "③ 開啟機關寶箱取得【融霜地熱聖印】解鎖冰龍Boss戰",
      step1Title: "① 合成【🔥高熱鋁熱火種】 ➔ 前往中央鏡湖畔融化【🧊萬年玄冰棺】(x:700, y:540) 釋放地熱火種",
      step2Title: "② 依逆風順序點燃西南【🔥四象融霜聖火陣】(北之極光➔西之寒星➔南之暖陽➔東之破曉)",
      step3Title: "③ 開啟【🏆古遺跡機關寶箱】取得【融霜地熱聖印】，破除極寒冰龍王的無敵玄冰甲！",
      bossDebuffMsg: "🌟【融霜地熱聖印共鳴】：極寒冰龍王的無敵玄冰甲已融化，且護盾上限 -2！"
    },
    zone5_volcano: {
      zoneId: "zone5_volcano",
      title: "第五章主線・雙重熔岩火口與急凍冷卻閥",
      npcName: "紅蓮學者・伊格",
      relicName: "【地脈冷卻聖印】",
      storyIntro: "火山岩漿河溫度過高，直接鋪設耐火石拱橋會瞬間融化，且紅蓮火山龍皇處於【無敵沸騰龍炎】狀態！必須先用急凍晶瓶冷卻火口並開啟三連冷卻閥取得【地脈冷卻聖印】，才可鋪橋及挑戰龍皇！",
      step1GateId: "tg_z5_magma",
      step1Short: "① 造【極寒急凍晶瓶】震碎火口熔岩殼(x:720,y:560)",
      step2Short: "② 扳動西南【三連熔岩冷卻閥門】使其全亮綠",
      step3Short: "③ 開啟機關寶箱取得【地脈冷卻聖印】解鎖鋪橋與龍皇戰",
      step1Title: "① 以雪原冰蓮合成【❄️極寒急凍晶瓶】 ➔ 冷卻並震碎中央火口的【🔥熔岩黑曜殼】(x:720, y:560)",
      step2Title: "② 扳動西南熔爐區的【⚙️三連熔岩冷卻閥門】使其全部開啟降溫",
      step3Title: "③ 開啟【🏆古遺跡機關寶箱】取得【地脈冷卻聖印】，即可鋪設黑曜耐火石拱橋並解除火山龍皇的無敵龍炎！",
      bossDebuffMsg: "🌟【地脈冷卻聖印共鳴】：紅蓮火山龍皇的無敵沸騰龍炎已壓制，且護盾上限 -2！"
    },
    zone6_sky: {
      zoneId: "zone6_sky",
      title: "最終章主線・星界浮空聖壇與八方星象共鳴",
      npcName: "破曉大賢者",
      relicName: "【創世破曉聖印】",
      storyIntro: "天界浮空聖殿的星橋斷絕，最終領主受【無敵星界法則】庇護！唯有將青銅齒輪嵌入中央星核並對齊八方星象石像取得【創世破曉聖印】，才能架起星橋迎戰最終領主！",
      step1GateId: "tg_z6_gear",
      step1Short: "① 造【精密青銅齒輪】嵌入星界聖柱(x:720,y:550)",
      step2Short: "② 旋轉西南【四聖像】向外(北▲北,東▶東,南▼南,西◀西)",
      step3Short: "③ 開啟機關寶箱取得【創世破曉聖印】解鎖最終決戰",
      step1Title: "① 合成【⚙️精密青銅齒輪】 ➔ 嵌入中央【⚙️星界齒輪聖柱】(x:720, y:550) 重啟星核",
      step2Title: "② 旋轉西南星壇的【🗿四聖像】使其背心向外守護八方(北▲北、東▶東、南▼南、西◀西)",
      step3Title: "③ 開啟【🏆古遺跡機關寶箱】取得【創世破曉聖印】，解鎖星橋並破除最終領主的無敵星界法則！",
      bossDebuffMsg: "🌟【創世破曉聖印共鳴】：最終領主的無敵法則已破除，且護盾上限 -2！"
    }
  };

  function getZoneStoryProgress(zoneId, s) {
    const chain = ZONE_STORY_CHAINS[zoneId];
    if (!chain || !s) return null;
    // 若該區 Boss 已經在舊存檔被擊敗過，視為已完成破障鏈，不卡已通關章節
    const bossAlreadyDead = Boolean(s.bossesDefeated && s.bossesDefeated[zoneId]);
    const step1Done = Boolean(bossAlreadyDead || (s.clearedToolGates && s.clearedToolGates[chain.step1GateId]));
    const step2Done = Boolean(bossAlreadyDead || (s.solvedExplorePuzzles && s.solvedExplorePuzzles[zoneId]));
    const step3Done = Boolean(bossAlreadyDead || (s.claimedExplorePuzzleChests && s.claimedExplorePuzzleChests[zoneId]));
    const count = (step1Done ? 1 : 0) + (step2Done ? 1 : 0) + (step3Done ? 1 : 0);
    return {
      chain: chain,
      step1Done: step1Done,
      step2Done: step2Done,
      step3Done: step3Done,
      count: count,
      allDone: step3Done
    };
  }

  // ★ 同步更新下屏「主線任務進度框」：在未解開該區 3 步因果鏈前，直接在主線任務框醒目顯示當前強制破障步驟！
  function syncMainQuestTrackerWithStoryChain() {
    const s = window.Aetheria.State && window.Aetheria.State.data;
    if (!s) return;
    const prog = getZoneStoryProgress(s.currentZone, s);

    // 尋找下屏的主線任務容器
    const questBox = document.getElementById("quest-tracker") ||
                     document.getElementById("quest-banner") ||
                     document.querySelector("[id*='quest']");
    if (!questBox) return;

    let lockBar = document.getElementById("srpg-main-quest-lock-bar");
    if (!prog) {
      if (lockBar) setDisplayIfChanged(lockBar, "none");
      return;
    }

    if (!lockBar) {
      lockBar = document.createElement("div");
      lockBar.id = "srpg-main-quest-lock-bar";
      lockBar.onclick = function() {
        if (window.Aetheria.Audio && window.Aetheria.Audio.sfxTalkBlip) window.Aetheria.Audio.sfxTalkBlip();
        if (window.Aetheria.HighlandsWorkshop) window.Aetheria.HighlandsWorkshop.openZoneStoryChainModal();
      };
      questBox.appendChild(lockBar);
    }

    setDisplayIfChanged(lockBar, "flex");
    setClassIfChanged(lockBar, prog.allDone ? "unlocked" : "");

    if (!prog.step1Done) {
      setTextIfChanged(lockBar, "🔒【主線破障 0/3 (未解開無法修橋/打王)】下一步：" + prog.chain.step1Short + " (點擊詳情)");
    } else if (!prog.step2Done) {
      setTextIfChanged(lockBar, "🔒【主線破障 1/3 (地脈已通)】下一步：" + prog.chain.step2Short + " (點擊詳情)");
    } else if (!prog.step3Done) {
      setTextIfChanged(lockBar, "🔒【主線破障 2/3 (機關已開)】下一步：" + prog.chain.step3Short + " (點擊詳情)");
    } else {
      setTextIfChanged(lockBar, "🌟【主線破障 3/3 已完成】已取得" + prog.chain.relicName + "！可修橋過河並討伐首領！");
    }
  }

  // ================= 4. 100% 防消失：6大差異化自然地貌自癒繪製引擎 =================
  const KENNEY_PALETTES = {
    forest:  { bg1: "#4d8036", bg2: "#43732e", bg3: "#599140", path: "#c29b61", pathEdge: "#9c7844", cliffTop: "#bfa065", rock1: "#7a4928", rock2: "#5e361c", rockHi: "#965d36", rockDark: "#381e0e", river: "#2978d4", riverHi: "#8ce0ff", bank: "#d4b06a", bridge: "#9c6347", bridgeRail: "#d9a066" },
    cave:    { bg1: "#282332", bg2: "#211d2a", bg3: "#322c3e", path: "#4a4258", pathEdge: "#393246", cliffTop: "#5c526e", rock1: "#3d354b", rock2: "#2b2536", rockHi: "#685d7c", rockDark: "#17131d", river: "#1d3557", riverHi: "#38b6ff", bank: "#393246", bridge: "#64748b", bridgeRail: "#94a3b8" },
    canyon:  { bg1: "#c79452", bg2: "#ba8745", bg3: "#d4a260", path: "#e0b97d", pathEdge: "#ad7b3b", cliffTop: "#deb878", rock1: "#8f4b26", rock2: "#703819", rockHi: "#ab5e34", rockDark: "#45200b", river: "#2b1508", riverHi: "#472411", bank: "#703819", bridge: "#9c6347", bridgeRail: "#f5b700" },
    coast:   { bg1: "#599140", bg2: "#4d8036", bg3: "#68a34d", path: "#e6c88c", pathEdge: "#c4a366", cliffTop: "#d9bc82", rock1: "#755233", rock2: "#593d24", rockHi: "#8f6743", rockDark: "#362312", river: "#1d5eb8", riverHi: "#8ce0ff", bank: "#e6c88c", bridge: "#9c6347", bridgeRail: "#ffffff" },
    snow:    { bg1: "#dce8f2", bg2: "#c9d9e8", bg3: "#edf4fa", path: "#9eb3c7", pathEdge: "#7e96ad", cliffTop: "#ffffff", rock1: "#5a718a", rock2: "#43566b", rockHi: "#7b93ad", rockDark: "#293645", river: "#3898ff", riverHi: "#ffffff", bank: "#9eb3c7", bridge: "#64748b", bridgeRail: "#e2e8f0" },
    volcano: { bg1: "#3b2321", bg2: "#301b19", bg3: "#4a2c29", path: "#633933", pathEdge: "#472723", cliffTop: "#73423b", rock1: "#52241d", rock2: "#381712", rockHi: "#8c382b", rockDark: "#1f0b08", river: "#e03c4b", riverHi: "#ffd166", bank: "#1f0b08", bridge: "#475569", bridgeRail: "#94a3b8" },
    sky:     { bg1: "#487a6b", bg2: "#3d6b5d", bg3: "#568f7e", path: "#e8dfc5", pathEdge: "#c4b89b", cliffTop: "#f5eedc", rock1: "#6e7885", rock2: "#525b66", rockHi: "#8e99a8", rockDark: "#333940", river: "#191233", riverHi: "#e0aaff", bank: "#c4b89b", bridge: "#f5b700", bridgeRail: "#ffffff" }
  };

  let cachedTerrainCanvas = null;
  let cachedTerrainZoneId = "";
  let lastMinimapHeroX = -999;
  let lastMinimapHeroY = -999;
  let lastMinimapZone = "";

  function seededHash(x, y, seed) {
    let h = (x * 374761393 + y * 668265263 + (seed || 0) * 1442695041) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  function isNaturalPathTile(px, py, mapObj) {
    const blobs = mapObj.dirtBlobs || [];
    const wave = Math.sin(px * 0.025) * 14 + Math.cos(py * 0.025) * 14;
    for (let i = 0; i < blobs.length; i++) {
      const b = blobs[i];
      if (b.cx !== undefined && b.cy !== undefined) {
        const rx = (b.rx || 80) + wave;
        const ry = (b.ry || 60) + wave * 0.7;
        const dx = (px - b.cx) / Math.max(20, rx);
        const dy = (py - b.cy) / Math.max(20, ry);
        if (dx * dx + dy * dy <= 1.0) return true;
      } else if (b.x !== undefined && b.y !== undefined) {
        if (px >= b.x && px <= b.x + (b.w || 100) && py >= b.y && py <= b.y + (b.h || 80)) return true;
      }
    }
    return false;
  }

  function isNaturalPlateauTile(px, py, hasHighland) {
    if (!hasHighland) return false;
    const curveTop = Math.sin(px * 0.03) * 8;
    const curveBottom = Math.sin(px * 0.04) * 6;
    const inTopWing = (px >= 388 && px <= 902 && py >= 798 + curveTop && py <= 918 + curveBottom);
    const inRightWing = (px >= 708 && px <= 902 && py >= 912 && py <= 1058 + curveBottom);
    return inTopWing || inRightWing;
  }

  // ★ 修正：移除「等級達標自動通橋」後門！僅當玩家已完成橋樑工程（或舊存檔已擊敗該區首領）時，橋樑才可通行！
  function isMapBridgeBuilt(mapObj, s) {
    if (!mapObj || !s) return false;
    const pb = s.projectsBuilt || {};
    const bd = s.bossesDefeated || {};
    const zId = mapObj.id;

    if (zId === "zone1_forest")  return Boolean(pb.proj_z1_bridge || bd.zone1_forest);
    if (zId === "zone2_canyon")  return Boolean(pb.proj_z2_rope || pb.proj_z2_bridge || bd.zone2_canyon);
    if (zId === "zone3_coast")   return Boolean(pb.proj_z3_raft || pb.proj_z3_bridge || bd.zone3_coast);
    if (zId === "zone4_snow")    return Boolean(pb.proj_z4_bridge || pb.proj_z4_shelter || bd.zone4_snow);
    if (zId === "zone5_volcano") return Boolean(pb.proj_z5_bridge || bd.zone5_volcano);
    if (zId === "zone6_sky")     return Boolean(pb.proj_z6_bridge || bd.zone6_sky);

    const projDeco = (mapObj.decos || []).find(function(d) { return d && d.isProjectSite && d.projectId; });
    if (projDeco) return Boolean(pb[projDeco.projectId]);
    return true;
  }

  function getMapBridgeY(mapObj) {
    if (!mapObj) return 275;
    const rx = mapObj.riverX || 1030;
    const projDeco = (mapObj.decos || []).find(function(d) {
      return d && (d.isProjectSite || d.projectId) && Math.abs(d.x - rx) < 110;
    });
    if (projDeco && projDeco.y) return projDeco.y + 20;
    return mapObj.bridgeY || 275;
  }

  function drawUniqueZoneLandmarkOnCanvas(ctx, mapObj, W, H) {
    const zId = mapObj.id;

    if (zId === "zone1_forest") {
      ctx.fillStyle = "#2d4c2b";
      ctx.beginPath(); ctx.ellipse(420, 540, 95, 65, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#3c1642";
      ctx.beginPath(); ctx.ellipse(420, 540, 62, 38, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#5ac54f"; ctx.lineWidth = 2;
      ctx.strokeRect(165, 815, 130, 130);
    } else if (zId === "cave1_mushroom") {
      ctx.fillStyle = "#102542";
      ctx.beginPath();
      ctx.moveTo(0, 560);
      ctx.bezierCurveTo(380, 490, 680, 660, W, 540);
      ctx.lineTo(W, 600);
      ctx.bezierCurveTo(680, 720, 380, 550, 0, 620);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#38b6ff";
      ctx.beginPath(); ctx.ellipse(860, 640, 75, 45, 0, 0, Math.PI * 2); ctx.fill();
    } else if (zId === "zone2_canyon") {
      for (let r = 110; r >= 25; r -= 25) {
        ctx.fillStyle = (r % 50 === 0) ? "#b07d3b" : "#e0b97d";
        ctx.beginPath(); ctx.ellipse(720, 540, r * 1.3, r * 0.85, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = "#b5833d";
      ctx.fillRect(150, 800, 160, 160);
      ctx.strokeStyle = "#ffd166"; ctx.lineWidth = 3;
      ctx.strokeRect(154, 804, 152, 152);
    } else if (zId === "zone3_coast") {
      ctx.fillStyle = "#e6c88c";
      ctx.beginPath(); ctx.ellipse(760, 580, 210, 125, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#1d5eb8";
      ctx.beginPath(); ctx.ellipse(760, 580, 175, 95, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#38b6ff";
      ctx.beginPath(); ctx.ellipse(750, 575, 130, 65, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#e6c88c";
      ctx.beginPath(); ctx.ellipse(690, 565, 36, 22, 0, 0, Math.PI * 2); ctx.fill();
    } else if (zId === "zone4_snow") {
      ctx.fillStyle = "#7bdff2";
      ctx.beginPath(); ctx.ellipse(700, 540, 195, 110, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#b2f7ef";
      ctx.beginPath(); ctx.ellipse(695, 535, 155, 82, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(580, 520); ctx.lineTo(660, 550); ctx.lineTo(740, 510); ctx.lineTo(810, 560);
      ctx.stroke();
    } else if (zId === "zone5_volcano") {
      ctx.fillStyle = "#1f0b08";
      ctx.beginPath(); ctx.ellipse(720, 560, 175, 105, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#e03c4b";
      ctx.beginPath(); ctx.ellipse(720, 560, 135, 75, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffd166";
      ctx.beginPath(); ctx.ellipse(720, 560, 65, 35, 0, 0, Math.PI * 2); ctx.fill();
      for (let sx = 600; sx <= 840; sx += 48) {
        ctx.fillStyle = "#475569";
        ctx.fillRect(sx - 16, 544, 32, 32);
      }
    } else if (zId === "zone6_sky") {
      ctx.fillStyle = "#191233";
      ctx.beginPath(); ctx.ellipse(720, 550, 180, 100, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#e0aaff"; ctx.lineWidth = 3;
      ctx.strokeRect(590, 480, 260, 140);
      ctx.fillStyle = "#f5eedc";
      ctx.beginPath(); ctx.arc(720, 550, 58, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#f5b700"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(720, 550, 54, 0, Math.PI * 2); ctx.stroke();
    }
  }

  function paintTerrainOntoContext(ctx, mapObj, W, H, built) {
    const pal = KENNEY_PALETTES[mapObj.theme] || KENNEY_PALETTES.forest;
    const hasHighland = Boolean(HIGHLAND_ZONES[mapObj.id]);
    const cols = Math.ceil(W / 16);
    const rows = Math.ceil(H / 16);

    ctx.fillStyle = pal.bg1;
    ctx.fillRect(0, 0, W, H);

    for (let ty = 0; ty < rows; ty++) {
      for (let tx = 0; tx < cols; tx++) {
        const px = tx * 16;
        const py = ty * 16;
        const r = seededHash(tx, ty, 11);
        if (r >= 0.45) {
          ctx.fillStyle = (r < 0.80) ? pal.bg2 : pal.bg3;
          ctx.fillRect(px, py, 16, 16);
        }

        if (r > 0.72) {
          ctx.fillStyle = pal.bg3;
          ctx.fillRect(px + 4, py + 6, 2, 4);
          ctx.fillRect(px + 7, py + 5, 2, 5);
          ctx.fillRect(px + 10, py + 7, 2, 3);
        } else if (r < 0.08) {
          ctx.fillStyle = pal.pathEdge;
          ctx.fillRect(px + 6, py + 9, 4, 3);
          ctx.fillStyle = pal.path;
          ctx.fillRect(px + 7, py + 9, 2, 2);
        }
      }
    }

    for (let ty = 0; ty < rows; ty++) {
      for (let tx = 0; tx < cols; tx++) {
        const px = tx * 16 + 8;
        const py = ty * 16 + 8;
        if (!isNaturalPathTile(px, py, mapObj)) continue;

        const x0 = tx * 16;
        const y0 = ty * 16;
        ctx.fillStyle = pal.path;
        ctx.fillRect(x0, y0, 16, 16);

        const nUp    = !isNaturalPathTile(px, py - 16, mapObj);
        const nDown  = !isNaturalPathTile(px, py + 16, mapObj);
        const nLeft  = !isNaturalPathTile(px - 16, py, mapObj);
        const nRight = !isNaturalPathTile(px + 16, py, mapObj);

        ctx.fillStyle = pal.pathEdge;
        if (nUp)    ctx.fillRect(x0, y0, 16, 3);
        if (nDown)  ctx.fillRect(x0, y0 + 13, 16, 3);
        if (nLeft)  ctx.fillRect(x0, y0, 3, 16);
        if (nRight) ctx.fillRect(x0 + 13, y0, 3, 16);
      }
    }

    drawUniqueZoneLandmarkOnCanvas(ctx, mapObj, W, H);

    if (mapObj.hasRiver) {
      const rx = mapObj.riverX || 1030;
      ctx.fillStyle = pal.bank;
      ctx.fillRect(rx - 6, 0, 52, H);
      ctx.fillStyle = pal.river;
      ctx.fillRect(rx, 0, 40, H);
      ctx.fillStyle = pal.riverHi;
      ctx.fillRect(rx + 6, 0, 4, H);

      const bridgeY = getMapBridgeY(mapObj);
      const bx = rx - 10;
      const bw = 60;
      const by = bridgeY - 34;
      const bh = 68;

      if (built) {
        ctx.fillStyle = "#141013";
        ctx.fillRect(bx, by - 3, bw, bh + 6);
        ctx.fillStyle = pal.bridge;
        ctx.fillRect(bx + 2, by, bw - 4, bh);
        ctx.fillStyle = pal.bridgeRail;
        ctx.fillRect(bx, by - 2, bw, 5);
        ctx.fillRect(bx, by + bh - 3, bw, 5);
      } else {
        ctx.fillStyle = pal.bridge;
        ctx.fillRect(bx, by, 14, bh);
        ctx.fillRect(bx + bw - 14, by, 14, bh);
      }
    }

    if (mapObj.id === "camp_hub") {
      ctx.fillStyle = "#e6c88c";
      ctx.fillRect(0, 356, W, 124);
      ctx.fillStyle = "#1d5eb8";
      ctx.fillRect(0, 392, W, 88);
      ctx.fillStyle = "#8ce0ff";
      ctx.fillRect(0, 392, W, 5);
      ctx.fillStyle = "#8f563b";
      ctx.fillRect(421, 358, 48, 76);
    }

    if (hasHighland) {
      for (let ty = 48; ty < rows; ty++) {
        for (let tx = 22; tx < cols; tx++) {
          const px = tx * 16 + 8;
          const py = ty * 16 + 8;
          if (!isNaturalPlateauTile(px, py, true)) continue;

          const x0 = tx * 16;
          const y0 = ty * 16;
          ctx.fillStyle = pal.cliffTop;
          ctx.fillRect(x0, y0, 16, 16);

          const pUp    = isNaturalPlateauTile(px, py - 16, true);
          const pDown  = isNaturalPlateauTile(px, py + 16, true);
          const pLeft  = isNaturalPlateauTile(px - 16, py, true);
          const pRight = isNaturalPlateauTile(px + 16, py, true);

          ctx.fillStyle = pal.rockDark;
          if (!pUp)    ctx.fillRect(x0, y0, 16, 3);
          if (!pLeft)  ctx.fillRect(x0, y0, 3, 16);
          if (!pRight) ctx.fillRect(x0 + 13, y0, 3, 16);

          if (!pDown) {
            ctx.fillStyle = pal.rockDark;
            ctx.fillRect(x0, y0 + 13, 16, 3);
            for (let wy = 1; wy <= 3; wy++) {
              const wy0 = y0 + wy * 16;
              ctx.fillStyle = (wy % 2 === 1) ? pal.rock1 : pal.rock2;
              ctx.fillRect(x0, wy0, 16, 16);
              ctx.fillStyle = pal.rockHi;
              ctx.fillRect(x0 + 2, wy0 + 2, 5, 6);
              ctx.fillRect(x0 + 9, wy0 + 6, 5, 6);
              ctx.fillStyle = pal.rockDark;
              ctx.fillRect(x0, wy0, 2, 16);
              if (wy === 3) {
                ctx.fillRect(x0, wy0 + 13, 16, 3);
                ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
                ctx.fillRect(x0, wy0 + 16, 16, 8);
              }
            }
          }
        }
      }

      const cx = 472, cy = 920;
      ctx.fillStyle = pal.rockDark;
      ctx.fillRect(cx - 4, cy - 4, 56, 48);
      ctx.fillStyle = pal.rock2;
      ctx.fillRect(cx, cy, 48, 44);
      ctx.fillStyle = "#09060a";
      ctx.fillRect(cx + 6, cy + 8, 36, 36);
    }
  }

  function renderKenneyNaturalTerrainCanvas(mapObj, terrainLayer) {
    if (!mapObj || !terrainLayer) return;
    if (mapObj.id === "ocean_sea") {
      cachedTerrainCanvas = null;
      cachedTerrainZoneId = "ocean_sea";
      return;
    }

    const oldCanvases = terrainLayer.querySelectorAll(".kenney-terrain-canvas");
    oldCanvases.forEach(function(oc) {
      oc.width = 0;
      oc.height = 0;
      oc.remove();
    });

    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
    const W = mapObj.width || 1200;
    const H = mapObj.height || 680;
    const built = isMapBridgeBuilt(mapObj, s);

    const canvas = document.createElement("canvas");
    canvas.className = "kenney-terrain-canvas";
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    const ctx = canvas.getContext("2d");
    paintTerrainOntoContext(ctx, mapObj, W, H, built);

    cachedTerrainCanvas = canvas;
    cachedTerrainZoneId = mapObj.id;
    lastMinimapZone = "";
    terrainLayer.insertBefore(canvas, terrainLayer.firstChild);
  }

  function ensureActiveTerrainCanvas(mapObj) {
    if (!mapObj || mapObj.id === "ocean_sea") return null;
    const terrainLayer = document.getElementById("world-terrain-layer");
    if (!terrainLayer) return cachedTerrainCanvas;

    const existing = terrainLayer.querySelector(".kenney-terrain-canvas");
    if (!existing || !cachedTerrainCanvas || cachedTerrainZoneId !== mapObj.id || cachedTerrainCanvas.width === 0) {
      renderKenneyNaturalTerrainCanvas(mapObj, terrainLayer);
      syncDomRiverBridge(mapObj, terrainLayer);
    }
    return cachedTerrainCanvas;
  }

  function syncDomRiverBridge(mapObj, terrainLayer) {
    if (!mapObj || !terrainLayer || !mapObj.hasRiver) return;
    const bridgeY = getMapBridgeY(mapObj);
    const rx = mapObj.riverX || 1030;
    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
    const built = isMapBridgeBuilt(mapObj, s);
    const pal = KENNEY_PALETTES[mapObj.theme] || KENNEY_PALETTES.forest;

    const nativeBridges = terrainLayer.querySelectorAll(".dom-bridge");
    nativeBridges.forEach(function(nb) {
      nb.style.top = bridgeY + "px";
      nb.style.transform = "translateY(-50%)";
      nb.style.zIndex = "6";
    });

    let bridgeEl = terrainLayer.querySelector(".srpg-dom-river-bridge");
    if (!bridgeEl) {
      bridgeEl = document.createElement("div");
      bridgeEl.className = "srpg-dom-river-bridge";
      terrainLayer.appendChild(bridgeEl);
    }

    const bw = 58, bh = 68;
    bridgeEl.style.cssText =
      "position:absolute; left:" + (rx - 9) + "px; top:" + (bridgeY - 34) + "px; " +
      "width:" + bw + "px; height:" + bh + "px; z-index:6; pointer-events:none; box-sizing:border-box;";

    if (built) {
      bridgeEl.style.background =
        "repeating-linear-gradient(90deg, " + pal.bridge + " 0px, " + pal.bridge + " 6px, #2b1508 6px, #2b1508 9px)";
      bridgeEl.style.borderTop = "4px solid " + pal.bridgeRail;
      bridgeEl.style.borderBottom = "4px solid " + pal.bridgeRail;
      bridgeEl.style.outline = "2px solid #141013";
      bridgeEl.style.boxShadow = "0 4px 8px rgba(0,0,0,0.6)";
    } else {
      bridgeEl.style.background =
        "linear-gradient(90deg, " + pal.bridge + " 0%, " + pal.bridge + " 22%, transparent 22%, transparent 78%, " + pal.bridge + " 78%, " + pal.bridge + " 100%)";
      bridgeEl.style.borderTop = "3px dashed " + pal.bridgeRail;
      bridgeEl.style.borderBottom = "3px dashed " + pal.bridgeRail;
      bridgeEl.style.outline = "none";
      bridgeEl.style.boxShadow = "none";
    }
  }

  function drawTreasureXMarkerOnCanvas(ctx, x, y, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffd166";
    ctx.fill();
    ctx.lineWidth = Math.max(1.5, radius * 0.25);
    ctx.strokeStyle = "#141013";
    ctx.stroke();

    const r = radius * 0.52;
    ctx.beginPath();
    ctx.moveTo(x - r, y - r);
    ctx.lineTo(x + r, y + r);
    ctx.moveTo(x + r, y - r);
    ctx.lineTo(x - r, y + r);
    ctx.strokeStyle = "#e03c4b";
    ctx.lineWidth = Math.max(2, radius * 0.36);
    ctx.stroke();
    ctx.restore();
  }

  function renderCompassMinimap(mapObj, s, forceRedraw) {
    if (!mapObj || !s) return;

    const tracker = document.getElementById("srpg-chain-tracker");
    if (tracker) {
      const prog = getZoneStoryProgress(mapObj.id, s);
      if (prog) {
        setDisplayIfChanged(tracker, "block");
        setClassIfChanged(tracker, prog.allDone ? "chain-done" : "");
        setTextIfChanged(
          tracker,
          prog.allDone
            ? ("🌟破障聖印已得 (" + prog.count + "/3)")
            : ("🔒主線破障解謎: " + prog.count + "/3 (必解)")
        );
      } else {
        setDisplayIfChanged(tracker, "none");
      }
    }

    syncMainQuestTrackerWithStoryChain();

    const activeTerrain = ensureActiveTerrainCanvas(mapObj);

    const hx = s.heroX || 300;
    const hy = s.heroY || 240;
    if (!forceRedraw && lastMinimapZone === mapObj.id && Math.hypot(hx - lastMinimapHeroX, hy - lastMinimapHeroY) < 4) {
      return;
    }
    lastMinimapHeroX = hx;
    lastMinimapHeroY = hy;
    lastMinimapZone = mapObj.id;

    const mmCanvas = cachedCompassCanvas || mountGuaranteedCompassWidget();
    if (!mmCanvas) return;

    const ctx = mmCanvas.getContext("2d");
    ctx.clearRect(0, 0, 96, 96);
    ctx.fillStyle = "#1d5eb8";
    ctx.fillRect(0, 0, 96, 96);

    const viewSpan = 680;
    const sx = hx - viewSpan / 2;
    const sy = hy - viewSpan / 2;
    const scale = 96 / viewSpan;

    if (activeTerrain) {
      ctx.drawImage(activeTerrain, sx, sy, viewSpan, viewSpan, 0, 0, 96, 96);
    } else if (mapObj.id === "ocean_sea") {
      (mapObj.dirtBlobs || []).forEach(function(b) {
        const bx = ((b.cx || 0) - sx) * scale;
        const by = ((b.cy || 0) - sy) * scale;
        ctx.fillStyle = "#e6c88c";
        ctx.beginPath(); ctx.arc(bx, by, (b.rx || 80) * scale, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#599140";
        ctx.beginPath(); ctx.arc(bx, by, (b.rx || 80) * scale * 0.65, 0, Math.PI * 2); ctx.fill();
      });
    }

    ctx.fillStyle = "#2d5a27";
    (mapObj.trees || []).forEach(function(t) {
      const tx = (t.x - sx) * scale;
      const ty = (t.y - sy) * scale;
      if (tx >= -4 && tx <= 100 && ty >= -4 && ty <= 100) {
        ctx.fillRect(tx - 1.5, ty - 1.5, 3, 3);
      }
    });

    (mapObj.nodes || []).forEach(function(n) {
      if (n.opened) return;
      const nx = (n.x - sx) * scale;
      const ny = (n.y - sy) * scale;
      if (nx < -6 || nx > 102 || ny < -6 || ny > 102) return;
      if (n.isBuriedSpot && !(s.dugSpots && s.dugSpots[n.id])) {
        drawTreasureXMarkerOnCanvas(ctx, nx, ny, 4.5);
      } else if (n.isToolGateObstacle && !(s.clearedToolGates && s.clearedToolGates[n.id])) {
        ctx.fillStyle = "#ff758f";
        ctx.fillRect(nx - 3, ny - 3, 6, 6);
      } else if (n.type === "chest") {
        ctx.fillStyle = "#f5b700";
        ctx.fillRect(nx - 2.5, ny - 2.5, 5, 5);
      }
    });

    (mapObj.portals || []).forEach(function(p) {
      const px = (p.x - sx) * scale;
      const py = (p.y - sy) * scale;
      if (px >= -4 && px <= 100 && py >= -4 && py <= 100) {
        ctx.fillStyle = "#38b6ff";
        ctx.fillRect(px - 2.5, py - 2.5, 5, 5);
      }
    });

    (mapObj.monsters || []).forEach(function(m) {
      if (m.alive === false || !m.isBoss) return;
      const mx = (m.x - sx) * scale;
      const my = (m.y - sy) * scale;
      if (mx >= -4 && mx <= 100 && my >= -4 && my <= 100) {
        ctx.beginPath(); ctx.arc(mx, my, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#e03c4b"; ctx.fill();
      }
    });

    ctx.beginPath();
    ctx.arc(48, 48, 4.2, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#141013";
    ctx.stroke();
  }

  function spawnHarvestParticles(nodeX, nodeY, colorHex) {
    const entityLayer = document.getElementById("world-entity-layer");
    if (!entityLayer) return;
    for (let i = 0; i < 6; i++) {
      const p = document.createElement("div");
      p.className = "srpg-particle";
      p.style.left = nodeX + "px";
      p.style.top = (nodeY - 8) + "px";
      p.style.background = colorHex || "#ffd166";
      entityLayer.appendChild(p);
      const angle = (Math.PI * 2 * i) / 6 + (Math.random() * 0.5 - 0.25);
      const dist = 14 + Math.random() * 16;
      requestAnimationFrame(function() {
        p.style.transform = "translate(" + (Math.cos(angle) * dist).toFixed(1) + "px, " + (Math.sin(angle) * dist - 6).toFixed(1) + "px)";
        p.style.opacity = "0";
      });
      setTimeout(function() { if (p.parentNode) p.parentNode.removeChild(p); }, 430);
    }
  }

  // ===== Part 1 結束位置（請緊接在此行下方貼上 Part 2 代碼） =====
  // ================= 5. 註冊像素圖示（含快取池 spriteDataUrlCache） =================
  const spriteDataUrlCache = {};
  function registerSurvivalRpgSprites() {
    const S = window.Aetheria.Data && window.Aetheria.Data.Sprites;
    if (!S || !S.getDataURL) return;

    function buildGridDataUrl(grid, palette) {
      const c = document.createElement("canvas");
      c.width = 16; c.height = 16;
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

    const customUrls = {
      gate_briar_vines: buildGridDataUrl([
        "..KK....KK....KK",".KGGK..KGGK..KGG","KGGGGKKGGGGKKGGG","KGRGGGGGGGGGRGGG",
        ".KGGGGKKKKGGGGK.","..KGGKYYYYKGGK..","..KGGKYRRYKGGK..",".KGGGGKKKKGGGGK.",
        "KGGGGGGGGGGGGGGK","KGRGGGGGGGGGRGGK",".KGGGGGGGGGGGGK.","..KKGGGGGGGGKK..",
        "....KKKKKKKK....","................","................","................"
      ], { K: "#141013", G: "#2d6a4f", R: "#e03c4b", Y: "#ffd166" }),
      gate_sunken_chest: buildGridDataUrl([
        "......WWWW......","....WWBBBBWW....","..WWBBBBBBBBWW..",".WBBBBKKKKBBBBW.",
        ".WBBKKYYYYKKBBW.","WBBKYYDDDDYYKBBW","WBBKKKKKKKKKKBBW","WBBKDDDDDDDDKBBW",
        ".WBBKKKKKKKKBBW.",".WWBBBBBBBBBBWW.","...WWBBBBBBWW...",".....WWWWWW.....",
        "................","................","................","................"
      ], { K: "#141013", W: "#8ce0ff", B: "#1d5eb8", Y: "#ffd166", D: "#9c6347" }),
      gate_gear_pillar: buildGridDataUrl([
        "...KKKKKKKKKK...","..KGGGGGGGGGGK..",".KGGKKKKKKKKGGK.",".KGKYYYYYYYYKGK.",
        ".KGKYKKKKKKYKGK.",".KGKYKRRRRKYKGK.",".KGKYKRRRRKYKGK.",".KGKYKKKKKKYKGK.",
        ".KGKYYYYYYYYKGK.",".KGGKKKKKKKKGGK.","..KDDDDDDDDDDK..","..KGGGGGGGGGGK..",
        ".KDDDDDDDDDDDDK.",".KKKKKKKKKKKKKK.","................","................"
      ], { K: "#141013", G: "#94a3b8", D: "#475569", Y: "#f5b700", R: "#e03c4b" }),
      gate_element_geode: buildGridDataUrl([
        "......KKKK......","....KKCCCCKK....","...KCCWWWWCCK...","..KCCWYYYYWCCK..",
        ".KCCWYYYYYYWCCK.","KCCWYYKKKKYYWCCK","KCCWYKRRRRKYWCCK","KCCWYKRRRRKYWCCK",
        "KCCWYYKKKKYYWCCK",".KCCWYYYYYYWCCK.","..KCCWWWWWWCCK..","...KKCCCCCCKK...",
        ".....KKKKKK.....","................","................","................"
      ], { K: "#141013", C: "#38b6ff", W: "#ffffff", Y: "#ffd166", R: "#ff595e" }),
      mat_briarSickle: buildGridDataUrl([
        "......KKKKKK....","....KKCCCCCCKK..","...KCCWWWWWWCCK.","..KCCWKKKKKKCCK.",
        "..KCCK......KKK.","..KCCK..........","...KCCK.........","....KCCKK.......",
        ".....KKLLK......","......KLLDK.....",".....KLLDK......","....KLLDK.......",
        "...KLLDK........","...KKKK.........","................","................"
      ], { K: "#141013", C: "#d9a066", W: "#ffd166", L: "#8f563b", D: "#5c3824" }),
      mat_salvageHook: buildGridDataUrl([
        "......KKKK......",".....KLLLLK.....",".....KLLLLK.....","......KKKK......",
        ".......KK.......",".......KK.......","...KKKK..KKKK...","..KRRRR..BBBBK..",
        "..KRRRR..BBBBK..","..KCCCC..CCCCK..","..KCCCCCCCCCCK..","...KCCCCCCCCK...",
        "....KKKKKKKK....","................","................","................"
      ], { K: "#141013", L: "#d9a066", R: "#ff595e", B: "#38b6ff", C: "#94a3b8" }),
      mat_ancientGear: buildGridDataUrl([
        "......KKKK......","...KKKYYYYKKK...","..KYYYYYYYYYYK..",".KYYYYKKKKYYYYK.",
        ".KYYYK....KYYYK.","KYYYYK....KYYYYK","KYYYYK....KYYYYK",".KYYYK....KYYYK.",
        ".KYYYYKKKKYYYYK.","..KYYYYYYYYYYK..","...KKKYYYYKKK...","......KKKK......",
        "................","................","................","................"
      ], { K: "#141013", Y: "#f5b700" }),
      mat_magnifyingLens: buildGridDataUrl([
        "....KKKKKK......","..KKYYYYYYKK....",".KYYCCCCCCYYK...","KYYCWWWWWWCYYK..",
        "KYYCWCCCCWCYYK..","KYYCCCCCCCCYYK..",".KYYCCCCCCYYK...","..KKYYYYYYKK....",
        "....KKKKKKLLK...",".........KLLDK..","..........KLLDK.","...........KLLDK",
        "............KKKK","................","................","................"
      ], { K: "#141013", Y: "#f5b700", C: "#8ce0ff", W: "#ffffff", L: "#8f563b", D: "#5c3824" }),
      mat_thermitePowder: buildGridDataUrl([
        ".......YY.......","......YYYY......",".....YYRRYY.....","....YYRRRRYY....",
        "...KKRRRRRRKK...","..KDDGGGGGGDDK..",".KDDGYYYYYYGDDK.",".KDGYYRRRRYYGDK.",
        ".KDDGYYYYYYGDDK.","..KDDGGGGGGDDK..","...KKKKKKKKKK...","................",
        "................","................","................","................"
      ], { K: "#141013", Y: "#ffd166", R: "#ff595e", D: "#475569", G: "#94a3b8" }),
      mat_frostEssence: buildGridDataUrl([
        "......KKKK......",".....KLLLLK.....","......KCCK......","....KKCWWCKK....",
        "...KCCWWWWCCK...","..KCCWWBBWWCCK..","..KCCWBBBBWCCK..","..KCCWWBBWWCCK..",
        "...KCCWWWWCCK...","....KKKKKKKK....","................","................",
        "................","................","................","................"
      ], { K: "#141013", L: "#d9a066", C: "#8ce0ff", W: "#ffffff", B: "#1d5eb8" }),
      mat_spicedStew: buildGridDataUrl([
        "....YY....YY....","...YYYY..YYYY...","................","..KKKKKKKKKKKK..",
        ".KRRRRRRRRRRRRK.","KRRYYYYRRGGGGYYK","KRRYWWYRRGWWGYYK","KDDDDDDDDDDDDDDK",
        ".KDDDDDDDDDDDDK.","..KKDDDDDDDDKK..","....KKKKKKKK....","................",
        "................","................","................","................"
      ], { K: "#141013", Y: "#ffd166", R: "#e03c4b", G: "#5ac54f", W: "#ffffff", D: "#8f563b" }),
      mat_copperOre: buildGridDataUrl([
        "....KKKKKKKK....","..KKDDDDDDDDKK..",".KDDCCCCCCCCDDK.","KDDCCYYYYYYCCDDK",
        "KDDCYYDDDDYYCDDK","KDDCCYYYYYYCCDDK",".KDDCCCCCCCCDDK.","..KKDDDDDDDDKK..",
        "....KKKKKKKK....","................","................","................",
        "................","................","................","................"
      ], { K: "#141013", D: "#5c3824", C: "#d97706", Y: "#fbbf24" }),
      mat_tinOre: buildGridDataUrl([
        "....KKKKKKKK....","..KKGGGGGGGGKK..",".KGGCCCCCCCCGGK.","KGGCCWWWWWWCCGGK",
        "KGGCWGGGGGGWCGGK","KGGCCWWWWWWCCGGK",".KGGCCCCCCCCGGK.","..KKGGGGGGGGKK..",
        "....KKKKKKKK....","................","................","................",
        "................","................","................","................"
      ], { K: "#141013", G: "#64748b", C: "#cbd5e1", W: "#ffffff" }),
      mat_bronzeIngot: buildGridDataUrl([
        "................","....KKKKKKKK....","...KYYYYYYYYK...","..KYCCCCCCCCYK..",
        ".KYCCCCCCCCCCYK.","KYYYYYYYYYYYYYYK","KCCCCCCCCCCCCCCK","KDDDDDDDDDDDDDDK",
        ".KKKKKKKKKKKKKK.","................","................","................",
        "................","................","................","................"
      ], { K: "#141013", Y: "#fde68a", C: "#d97706", D: "#92400e" }),
      ancient_statue: buildGridDataUrl([
        ".....KKKKKK.....","....KGGGGGGK....","...KGGYYYYGGK...","...KGYKKKKYGK...",
        "...KGGYYYYGGK...","....KGGGGGGK....","..KKKKDDDDKKKK..",".KGGGGDDDDGGGGK.",
        ".KGGDDDDDDDDGGK.","..KKKKDDDDKKKK..","....KDDDDDDK....","...KGGGGGGGGK...",
        "..KDDDDDDDDDDK..","..KKKKKKKKKKKK..","................","................"
      ], { K: "#141013", G: "#94a3b8", D: "#475569", Y: "#ffd166" }),
      lever_off: buildGridDataUrl([
        "................","..KKKK..........",".KRRRRK.........",".KRRRRK.........",
        "..KKLLK.........","....KLLK........",".....KLLK.......","......KLLK......",
        ".......KLLK.....","....KKKKKKKK....","...KGGGGGGGGK...","..KDDDDDDDDDDK..",
        "..KKKKKKKKKKKK..","................","................","................"
      ], { K: "#141013", R: "#ff595e", L: "#d9a066", G: "#94a3b8", D: "#334155" }),
      lever_on: buildGridDataUrl([
        "................","..........KKKK..",".........KGGGGK.",".........KGGGGK.",
        ".........KLLKK..","........KLLK....",".......KLLK.....","......KLLK......",
        ".....KLLK.......","....KKKKKKKK....","...KYYYYYYYYK...","..KDDDDDDDDDDK..",
        "..KKKKKKKKKKKK..","................","................","................"
      ], { K: "#141013", G: "#5ac54f", L: "#d9a066", Y: "#ffd166", D: "#334155" }),
      icon_shovel: buildGridDataUrl([
        "...........KKKK.","..........KLLLLK",".........KLDDDDK",".........KLLLLK.",
        "........KKLKK...",".......KLLK.....","......KLLK......",".....KLLK.......",
        "....KKKK........","..KKCCCCKK......",".KCCWWWWCCK.....","KCCWWWWWWCCK....",
        "KCCWWWWCCCCK....",".KCCCCCCCCK.....","..KKKKKKKK......","................"
      ], { K: "#141013", L: "#d9a066", D: "#8f563b", C: "#94a3b8", W: "#ffffff" }),
      buried_x_spot: buildGridDataUrl([
        "....KKKKKKKK....","..KKYYYYYYYYKK..",".KYYRRRRYYYYRRK.","KYYRRRRRRYYRRRYK",
        "KYYRYYYYRRRRYYYK","KYYYYRRRRRRRRYYK","KYYYYYRRRRRRYYYK","KYYYYRRRRRRRRYYK",
        "KYYRYYYYRRRRYYYK","KYYRRRRRRYYRRRYK",".KYYRRRRYYYYRRK.","..KKYYYYYYYYKK..",
        "....KKKKKKKK....","................","................","................"
      ], { K: "#141013", Y: "#ffd166", R: "#e03c4b" }),
      mat_cryptKey: buildGridDataUrl([
        "....KKKKKK......","...KYYYYYYK.....","..KYYKKKKYYK....","..KYYK..KYYK....",
        "..KYYKKKKYYK....","...KYYYYYYK.....","....KKYYKK......",".....KYYK.......",
        ".....KYYK.......",".....KYYKKKK....",".....KYYYYYK....",".....KYYKKKK....",
        ".....KYYK.......",".....KYYYYYK....",".....KKKKKKK....","................"
      ], { K: "#141013", Y: "#ffd166" }),
      crypt_door_locked: buildGridDataUrl([
        "....KKKKKKKK....","..KKGGGGGGGGKK..",".KGGDDDDDDDDGGK.","KGGDKKKKKKKKDGGK",
        "KGDKPPPPPPPPKDGK","KGDKPYYYYYYPKDGK","KGDKPYKKKKYPKDGK","KGDKPYKYYKYPKDGK",
        "KGDKPYKKKKYPKDGK","KGDKPPPYYPPPPDGK","KGDKPPPYYPPPPDGK","KGDKPPPPPPPPKDGK",
        "KGGDKKKKKKKKDGGK","KGGGGGGGGGGGGGGK","KKKKKKKKKKKKKKKK","................"
      ], { K: "#141013", G: "#64748b", D: "#334155", P: "#2d1442", Y: "#f5b700" }),
      crypt_door_open: buildGridDataUrl([
        "....KKKKKKKK....","..KKGGGGGGGGKK..",".KGGDDDDDDDDGGK.","KGGDKKKKKKKKDGGK",
        "KGDKOOOOOOOOODGK","KGDKOOOOOOOOODGK","KGDKOOCCCCCCODGK","KGDKOOOOOOOOODGK",
        "KGDKOOCCCCCCODGK","KGDKOOOOOOOOODGK","KGDKOOCCCCCCODGK","KGDKOOOOOOOOODGK",
        "KGGDKKKKKKKKDGGK","KGGGGGGGGGGGGGGK","KKKKKKKKKKKKKKKK","................"
      ], { K: "#141013", G: "#64748b", D: "#334155", O: "#090608", C: "#5ac54f" }),
      cluster_boulder: buildGridDataUrl([
        "....KKKKKK......","...KLLLLLLK.....","..KLGGGGGGGK....","..KLGGGGGGGK....",
        ".KKKKGGGGKKKKKK.","KLLLLKGGKLLLLLLK","KLGGGKGGKLGGGGGK","KLGGGGGGKLGGGGGK",
        "KGGGGGGGGGGGGGGK","KDDDDGGGGDDDDDDK",".KDDDDDDDDDDDDK.","..KKKKKKKKKKKK..",
        "................","................","................","................"
      ], { K: "#2b2623", L: "#9ca3af", G: "#6b7280", D: "#4b5563" }),
      cliff_stake: buildGridDataUrl([
        ".......YY.......","......YYYY......",".....YYKKYY.....","....YYKYYKYY....",
        "......KYYK......","..KK..KYYK..KK..",".KLLK.KYYK.KLLK.",".KDDK..KK..KDDK.",
        ".KDDKYYYYYYKDDK.",".KDDKDDDDDDKDDK.",".KDDK......KDDK.",".KDDK......KDDK.",
        ".KDDK......KDDK.","..KK........KK..","................","................"
      ], { K: "#141013", Y: "#ffd166", L: "#d9a066", D: "#8f563b" }),
      rope_ladder: buildGridDataUrl([
        "..KK........KK..","..KRK......KRK..","..KWWWWWWWWWWK..","..KDDDDDDDDDDK..",
        "..KRK......KRK..","..KRK......KRK..","..KWWWWWWWWWWK..","..KDDDDDDDDDDK..",
        "..KRK......KRK..","..KRK......KRK..","..KWWWWWWWWWWK..","..KDDDDDDDDDDK..",
        "..KRK......KRK..","..KRK......KRK..","..KWWWWWWWWWWK..","..KK........KK.."
      ], { K: "#141013", R: "#d9a066", W: "#f5b700", D: "#8f563b" }),
      mat_torchItem: buildGridDataUrl([
        ".......YY.......","......YYYY......",".....YYRRYY.....","....YYRRRRYY....",
        "....YRRRRRRY....",".....YYYYYY.....","......KKKK......","......KDDK......",
        "......KDDK......","......KLLK......","......KDDK......","......KDDK......",
        "......KLLK......","......KDDK......","......KKKK......","................"
      ], { K: "#141013", Y: "#ffd166", R: "#ff595e", D: "#8f563b", L: "#d9a066" }),
      mat_bombItem: buildGridDataUrl([
        ".........YY.....","........YYYY....",".......KK.......","......KLLK......",
        "....KKKKKKKK....","...KDDDDDDDDK...","..KDDWWWWDDDDK..","..KDDWDDDDDDDK..",
        "..KDDDDDDDDDDK..","..KDDDDDDDDDDK..","..KDDDDDDDDDDK..","...KDDDDDDDDK...",
        "....KKKKKKKK....","................","................","................"
      ], { K: "#141013", Y: "#ffd166", L: "#d9a066", D: "#334155", W: "#ffffff" }),
      mat_coal: buildGridDataUrl([
        "................",".....KKKKKK.....","...KKDDDDDDKK...","..KDDGGGGGGDDK..",
        ".KDDGKKKKKKGDDK.",".KDGKKKKKKKKGDK.","KDDGKKRRRRKKGDDK","KDGKKRYYYYRKKGDK",
        "KDGKKRRRRRRKKGDK",".KDGKKKKKKKKGDK.",".KDDGGGGGGGGDDK.","..KKDDDDDDDDKK..",
        "....KKKKKKKK....","................","................","................"
      ], { K: "#141013", D: "#2b2623", G: "#475569", R: "#e03c4b", Y: "#ffd166" }),
      mat_rockSalt: buildGridDataUrl([
        ".......KK.......","......KWWK......",".....KWWWWK.....","...KKWCCCCWKK...",
        "..KWWCCCCCCWWK..",".KWWCCCCCCCCWWK.",".KWCCWWWWWWCCWK.","KWWCWWWWWWWWCWWK",
        "KCCCCCCCCCCCCCCK",".KCCCCCCCCCCCCK.","..KKCCCCCCCCKK..","....KKKKKKKK....",
        "................","................","................","................"
      ], { K: "#141013", W: "#ffffff", C: "#cbd5e1" }),
      mat_quartz: buildGridDataUrl([
        ".......KK.......","......KCCK......",".....KCWWCK.....","..KK.KCWWCK.KK..",
        ".KCCKKCWWCKKCCK.",".KCWWCWWWWCWWCK.","KCCWWWWWWWWWWCCK",".KCCWWWWWWWWCCK.",
        "..KCCCCCCCCCCK..","...KKKKKKKKKK...","................","................",
        "................","................","................","................"
      ], { K: "#141013", C: "#8ce0ff", W: "#ffffff" }),
      mat_rationJerky: buildGridDataUrl([
        "................","....KKKKKKKK....","..KKRRRRRRRRKK..",".KRRWWWWWWWWRRK.",
        ".KRRDDDDDDDDRRK.","KRRDDDDDDDDDDRRK","KRRDDWWDDDDDDRRK",".KRRDDDDDDDDRRK.",
        "..KKRRRRRRRRKK..","....KKKKKKKK....","................","................",
        "................","................","................","................"
      ], { K: "#141013", R: "#9d0208", D: "#6a040f", W: "#f8fafc" })
    };
    customUrls.mat_ropeLadder = customUrls.rope_ladder;

    Object.keys(customUrls).forEach(function(k) {
      spriteDataUrlCache[k] = customUrls[k];
    });

    const origGetDataURL = S.getDataURL.bind(S);
    S.getDataURL = function(key) {
      if (spriteDataUrlCache[key]) return spriteDataUrlCache[key];
      const realKey = (key === "mat_potionHeal" || key === "mat_potionHint") ? "icon_potion" : key;
      const res = origGetDataURL(realKey);
      if (res) spriteDataUrlCache[key] = res;
      return res;
    };
  }

  // ================= 6. 擴充《Survival RPG》素材、6大質變工具、32項配方與【📖 求生合成圖鑑資料庫】 =================
  const CLEAN_SRPG_MATERIALS = {
    copperOre:      { id: "copperOre",      name: "赤銅礦石",       tier: 1, desc: "【基礎金屬礦】採集自懸崖高台與山洞，可與白錫礦冶煉成堅固的青銅合金錠。" },
    tinOre:         { id: "tinOre",         name: "白錫礦石",       tier: 1, desc: "【基礎金屬礦】採集自洞窟與高台，用於合成青銅合金錠。" },
    bronzeIngot:    { id: "bronzeIngot",    name: "青銅合金錠",     tier: 2, desc: "【冶煉合金】由赤銅礦、白錫礦與黑木炭熔煉而成，是製作解謎工具與精密齒輪的核心金屬！" },
    ancientGear:    { id: "ancientGear",    name: "精密青銅齒輪",   tier: 2, desc: "【★機關解謎零件】由青銅合金錠與燧石打磨而成，可嵌入野外【⚙️失落齒輪機關柱】啟動秘寶！" },
    briarSickle:    { id: "briarSickle",    name: "除荊開路鐮刀",   tier: 2, desc: "【★永久開路工具】鋒利的彎月青銅鐮刀，可斬開野外【🌿千年荊棘魔藤】，且砍伐草木額外多獲 +1 材料！" },
    salvageHook:    { id: "salvageHook",    name: "深水打撈磁鉤",   tier: 2, desc: "【★永久打撈工具】附有強磁的長繩鐵鉤，可打撈河岸與海濱的【⚓沉沒古寶箱】，且垂釣額外多獲 +1 鮮魚！" },
    magnifyingLens: { id: "magnifyingLens", name: "水晶鑑定放大鏡", tier: 2, desc: "【★永久尋寶工具】以透明石英砂打磨的透鏡，持有後全地圖採集額外獲得稀有晶礦機率 +35%！" },
    thermitePowder: { id: "thermitePowder", name: "高熱鋁熱火種",   tier: 3, desc: "【★破障鍊金物】結合黑木炭、鐵粉與松脂的高溫火種，可瞬間融化雪原的【🧊萬年玄冰晶殼】！" },
    frostEssence:   { id: "frostEssence",   name: "極寒急凍晶瓶",   tier: 3, desc: "【★破障鍊金物】封存極地冰蓮寒氣的石英瓶，可冷卻並震碎火山的【🔥熔岩黑曜晶殼】！" },
    spicedStew:     { id: "spicedStew",     name: "香辛海陸燉肉",   tier: 3, desc: "【★增益料理】以鮮魚、微光菇與岩鹽慢火精燉，食用恢復 +100% 飽食、+150 HP，並永久提升最大生命 +15！" },
    cryptKey:       { id: "cryptKey",       name: "遠古遺跡鑰匙",   tier: 2, desc: "【尋寶挖掘/工坊鍛造】用探險鐵鏟挖掘地面「✖」藏寶點或於工坊鍛造，可解鎖各區的【🔒遠古地底遺跡】！" },
    coal:           { id: "coal",           name: "黑曜木炭",       tier: 1, desc: "【高台/山洞礦產】由枯枝悶燒或於高台山洞開採，是冶煉青銅錠、高熱火種與炸彈的核心燃料。" },
    quartz:         { id: "quartz",         name: "透明石英砂",     tier: 2, desc: "【高台晶礦】採集自懸崖高台與山洞，可用於燒製水晶放大鏡、急凍晶瓶與探礦照明。" },
    rockSalt:       { id: "rockSalt",       name: "結晶岩鹽",       tier: 1, desc: "【高台礦產】採集自懸崖高台，可醃製風乾肉脯與烹調香辛海陸燉肉。" },
    ropeLadder:     { id: "ropeLadder",     name: "攀岩繩梯",       tier: 1, desc: "【高低差開路工具】由麻繩與原木編織而成，可架設在各區南側懸崖壁上攀爬至高台礦區！" },
    rationJerky:    { id: "rationJerky",    name: "風乾肉脯",       tier: 2, desc: "【頂級求生口糧】以岩鹽醃製鮮魚，食用立即恢復 +80% 飽食度與 +90 HP！" }
  };

  const SURVIVAL_CODEX_DATABASE = [
    { cat: "basic", key: "branch",    icon: "mat_branch",    name: "散落枯枝",   source: "0~6區地面徒手拾取",                   use: "修復熔爐、燒製黑曜木炭(x3➔x2)、松脂火把、Lv.1工具、烤魚乾/菇乾" },
    { cat: "basic", key: "flint",     icon: "mat_flint",     name: "尖銳燧石",   source: "0~6區地面徒手拾取",                   use: "修復熔爐、Lv.1手斧/十字鎬、爆破炸彈、打磨精密青銅齒輪" },
    { cat: "basic", key: "clay",      icon: "mat_clay",      name: "河畔黏土",   source: "水岸徒手拾取 / 釣魚點垂釣",           use: "修復熔爐、防水松脂膠、爆破炸彈、極寒急凍晶瓶、黑曜耐火磚" },
    { cat: "basic", key: "fish",      icon: "mat_fish",      name: "銀鱗鮮魚",   source: "各區水波釣魚點持魚竿垂釣",            use: "炭烤鮮魚乾(+60%飽食)、岩鹽風乾肉脯(+80%飽食)、香辛海陸燉肉(永久HP+15)" },
    { cat: "basic", key: "copperOre", icon: "mat_copperOre", name: "赤銅礦石",   source: "1~2區南側懸崖高台與岩壁礦洞(免工具)", use: "與白錫礦+黑木炭冶煉【青銅合金錠】" },
    { cat: "basic", key: "tinOre",    icon: "mat_tinOre",    name: "白錫礦石",   source: "1~3區南側懸崖高台與岩壁礦洞(免工具)", use: "與赤銅礦+黑木炭冶煉【青銅合金錠】" },
    { cat: "basic", key: "coal",      icon: "mat_coal",      name: "黑曜木炭",   source: "各區高台與山洞開採 / 工坊枯枝x3燒製", use: "冶煉青銅合金錠、黑火藥重型炸彈、高熱鋁熱火種、鍛造遺跡鑰匙" },
    { cat: "basic", key: "rockSalt",  icon: "mat_rockSalt",  name: "結晶岩鹽",   source: "1~6區南側懸崖高台與岩壁礦洞開採",     use: "醃製岩鹽風乾肉脯、烹調香辛海陸燉肉" },
    { cat: "basic", key: "quartz",    icon: "mat_quartz",    name: "透明石英砂", source: "1~6區高台與山洞開採 / 鐵鏟挖寶",      use: "水晶鑑定放大鏡、深水打撈磁鉤、石英探礦提燈、急凍晶瓶、生命/洞察藥水" },

    { cat: "tiered", key: "wood",     icon: "mat_wood",     name: "翠風原木",     source: "1.翠風森林砍伐 (需 Lv.1 手斧)",       use: "裁切厚木板、攀岩繩梯、除荊鐮刀、Lv.1探險鐵鏟、建造近海木帆船" },
    { cat: "tiered", key: "vine",     icon: "mat_vine",     name: "堅韌藤蔓",     source: "1.翠風森林砍伐 (需 Lv.1 手斧)",       use: "編織強化麻繩索、Lv.1翠竹釣竿、建造近海木帆船" },
    { cat: "tiered", key: "herb",     icon: "mat_herb",     name: "紅傘微光菇",   source: "1.森林與蘑菇洞窟採集 (需 Lv.1 手斧)", use: "烘烤微光菇乾、提煉生命藥水、烹調香辛海陸燉肉" },
    { cat: "tiered", key: "resin",    icon: "mat_resin",    name: "琥珀松脂",     source: "1.翠風森林採集 (需 Lv.1 手斧)",       use: "松脂火把、防水松脂膠、爆破炸彈、高熱鋁熱火種、洞察藥水" },
    { cat: "tiered", key: "iron",     icon: "mat_iron",     name: "藍晶鐵礦",     source: "1~2區礦脈與山洞 (需 Lv.1 十字鎬)",    use: "鍛造鐵釘、Lv.2精鐵工具、深水打撈磁鉤、高熱鋁熱火種、探礦提燈" },
    { cat: "tiered", key: "hemp",     icon: "mat_hemp",     name: "荒野亞麻",     source: "2.流沙峽谷採集 (需 Lv.2 手斧)",       use: "高效編織麻繩索(x2)、禦寒獸毛氈、幽靈古帆布、Lv.1亞麻擴容袋" },
    { cat: "tiered", key: "flower",   icon: "mat_flower",   name: "向陽太陽花",   source: "2.流沙峽谷採集 (需 Lv.2 手斧)",       use: "提煉精煉洞察藥水(答題排除錯誤選項)" },
    { cat: "tiered", key: "basalt",   icon: "mat_basalt",   name: "玄武岩塊",     source: "2~3區峽谷與山洞 (需 Lv.2 十字鎬)",    use: "升級 Lv.3 秘銀震波破岩鎬、燒製黑曜耐火磚" },
    { cat: "tiered", key: "mithril",  icon: "mat_mithril",  name: "流沙秘銀",     source: "2~6區礦脈、山洞與鐵鏟挖寶 (Lv.2 鎬)", use: "秘銀強化鋼索、升級 Lv.3 連鎖神斧/破岩鎬/大師竿、鍛造中高階裝備" },
    { cat: "tiered", key: "coral",    icon: "mat_coral",    name: "深海珊瑚",     source: "3.翡翠海岸開採或海釣 (Lv.2 鎬/釣竿)", use: "共鳴合成海妖核心、鍛造海洋系武器防具" },
    { cat: "tiered", key: "iceLotus", icon: "mat_iceLotus", name: "極地冰蓮",     source: "4.霜語雪原採集 (需 Lv.2 手斧)",       use: "提煉【極寒急凍晶瓶】(震碎火山熔岩晶殼)、鍛造冰霜系武防" },
    { cat: "tiered", key: "obsidian", icon: "mat_obsidian", name: "熔岩黑曜石",   source: "4~6區高台與火山開採 (需 Lv.3 十字鎬)",use: "燒製黑曜耐火磚、提煉熔岩龍鱗與炎魔熔核、Lv.3星隕考古鏟" },
    { cat: "tiered", key: "starIron", icon: "mat_starIron", name: "深淵星隕鐵",   source: "5~6區火山與天界開採 (需 Lv.3 十字鎬)",use: "Lv.3星隕考古神鏟、修復古文明聖碑殘片、鍛造 T9~T10 傳奇神裝" },
    { cat: "tiered", key: "goldLeaf", icon: "mat_goldLeaf", name: "黃金世界樹葉", source: "6.天界聖殿砍伐 (需 Lv.3 手斧)",       use: "鍛造 T10 艾瑟瑞亞破曉神刃/神聖鎧甲、共鳴遠古聖物" },

    { cat: "puzzle", key: "ropeLadder",     icon: "mat_ropeLadder",     name: "攀岩繩梯",       source: "工坊合成：強化麻繩索x1 + 翠風原木x2",       use: "【高低差開路】架設於 1~6 區南側懸崖壁，上下攀爬岩石高台礦區" },
    { cat: "puzzle", key: "briarSickle",    icon: "mat_briarSickle",    name: "除荊開路鐮刀",   source: "工坊合成：青銅合金錠x1 + 原木x2 + 麻繩x1",  use: "【第一章步驟①必備】斬開【🌿千年荊棘魔藤】，且砍伐草木收穫 +1" },
    { cat: "puzzle", key: "salvageHook",    icon: "mat_salvageHook",    name: "深水打撈磁鉤",   source: "工坊合成：藍晶鐵礦x2 + 麻繩x2 + 石英砂x1",  use: "【第三章步驟①必備】打撈【⚓沉沒古寶箱】尋回水閘零件，且釣魚 +1" },
    { cat: "puzzle", key: "magnifyingLens", icon: "mat_magnifyingLens", name: "水晶鑑定放大鏡", source: "工坊合成：透明石英砂x2 + 青銅合金錠x1",    use: "【永久神器】持有後全地圖採集 35% 機率額外獲得石英砂或赤銅礦" },
    { cat: "puzzle", key: "ancientGear",    icon: "mat_ancientGear",    name: "精密青銅齒輪",   source: "工坊合成：青銅合金錠x1 + 尖銳燧石x2",       use: "【第二/六章步驟①必備】嵌入【⚙️失落齒輪機關柱】啟動古墓共鳴" },
    { cat: "puzzle", key: "thermitePowder", icon: "mat_thermitePowder", name: "高熱鋁熱火種",   source: "工坊合成：黑曜木炭x2 + 鐵礦x1 + 松脂x2",    use: "【第四章步驟①必備】融化洞窟與雪原的【🧊萬年玄冰晶殼】釋放地熱" },
    { cat: "puzzle", key: "frostEssence",   icon: "mat_frostEssence",   name: "極寒急凍晶瓶",   source: "工坊合成：極地冰蓮x1 + 石英砂x1 + 黏土x1",  use: "【第五章步驟①必備】冷卻並震碎火山的【🔥熔岩黑曜晶殼】壓制龍炎" },
    { cat: "puzzle", key: "cryptKey",       icon: "mat_cryptKey",       name: "遠古遺跡鑰匙",   source: "鐵鏟挖「✖」藏寶點 / 工坊青銅錠x1+木炭x1",   use: "【迷宮開鎖】開啟 1~6 區高台東側的【🔒地底遺跡石門】挑戰守衛魔像" },
    { cat: "puzzle", key: "bombItem",       icon: "mat_bombItem",       name: "爆破炸彈",       source: "工坊合成：燧石x2+黏土x1+松脂x1 (或木炭x2)", use: "【秘境開路】炸開各區與荒島地牢的「裂縫岩壁」開啟隱藏秘寶箱" },

    { cat: "smelt", key: "bronzeIngot", icon: "mat_bronzeIngot", name: "青銅合金錠",     source: "工坊合成：赤銅礦x1 + 白錫礦x1 + 黑木炭x1", use: "打造除荊鐮刀、水晶放大鏡、精密青銅齒輪與遺跡鑰匙的核心合金" },
    { cat: "smelt", key: "plank",       icon: "mat_plank",       name: "加工厚木板",     source: "工坊合成：翠風原木x2",                     use: "修復第1區森林木橋、升級Lv.2秘銀鏟/Lv.3神斧、建造大帆船" },
    { cat: "smelt", key: "rope",        icon: "mat_rope",        name: "強化麻繩索",     source: "工坊合成：堅韌藤蔓x2 (或荒野亞麻x2➔2條)",  use: "製作攀岩繩梯、除荊鐮刀、打撈磁鉤、修復峽谷吊橋與造船" },
    { cat: "smelt", key: "steelCable",  icon: "mat_steelCable",  name: "秘銀強化鋼索",   source: "工坊合成：流沙秘銀x1 + 強化麻繩索x1",       use: "修復高階橋樑、升級 Lv.3 秘銀大師竿與飛索鉤爪" },
    { cat: "smelt", key: "sailCloth",   icon: "mat_sailCloth",   name: "幽靈古帆布",     source: "3區海岸高台/打怪保底 / 工坊亞麻x2+藤蔓x1",  use: "縫製【防風重帆布】以建造破浪遠洋大帆船" },
    { cat: "smelt", key: "warmFur",     icon: "mat_warmFur",     name: "禦寒獸毛氈",     source: "工坊合成：強韌獸筋x2 + 荒野亞麻x1",         use: "搭建第4區雪原防風避難屋、升級 Lv.2 秘銀遠征袋" },
    { cat: "smelt", key: "tabletShard", icon: "crystal",         name: "古文明聖碑殘片", source: "開啟各區地底遺跡石棺 / 工坊星隕鐵+黑曜石",  use: "推進終章天界聖殿主線與共鳴遠古聖物" },

    { cat: "food", key: "spicedStew",  icon: "mat_spicedStew",  name: "香辛海陸燉肉", source: "工坊烹調：銀鱗鮮魚x1 + 微光菇x2 + 岩鹽x1", use: "【極品料理】恢復 100% 飽食 + 150 HP，並永久提升最大生命 +15！" },
    { cat: "food", key: "rationJerky", icon: "mat_rationJerky", name: "岩鹽風乾肉脯", source: "工坊醃製：銀鱗鮮魚x1 + 結晶岩鹽x1 (產2份)", use: "【頂級口糧】每份立即恢復 +80% 飽食度 與 +90 HP" },
    { cat: "food", key: "rationFish",  icon: "mat_rationFish",  name: "炭烤鮮魚乾",   source: "工坊烘烤：銀鱗鮮魚x1 + 散落枯枝x1 (產2份)", use: "【進階口糧】每份立即恢復 +60% 飽食度 與 +60 HP" },
    { cat: "food", key: "rationHerb",  icon: "mat_rationHerb",  name: "烘烤微光菇乾", source: "工坊烘烤：紅傘微光菇x1 + 散落枯枝x1 (產2份)",use: "【基礎口糧】每份立即恢復 +35% 飽食度 與 +25 HP" },
    { cat: "food", key: "potionHeal",  icon: "icon_potion",     name: "精煉生命藥水", source: "工坊提煉：紅傘微光菇x2 + 透明石英砂x1",     use: "戰鬥與野外探索中立即恢復大量生命值" },
    { cat: "food", key: "potionHint",  icon: "icon_potion",     name: "精煉洞察藥水", source: "工坊提煉：太陽花x1 + 松脂x1 + 石英砂x1",    use: "在知識詠唱問答中直接排除錯誤選項" }
  ];

  const REMOVED_BLOAT_MATERIAL_IDS = [
    "ancientGem", "elixirAtk", "elixirHp", "elixirDef",
    "venomSac", "treeBark", "cactusFruit", "chitin", "rawHide", "thickPelt", "sulfur",
    "curedLeather", "steelIngot",
    "gear_gasMask", "gear_lantern", "gear_goggles", "gear_diving", "gear_furCoat", "gear_heatShield", "gear_skyAegis"
  ];

  const REMOVED_BLOAT_RECIPE_IDS = [
    "wk_gear_gasmask", "wk_gear_lantern", "wk_gear_goggles",
    "wk_gear_diving", "wk_gear_furcoat", "wk_gear_heatshield", "wk_gear_skyaegis",
    "wk_steel_ingot", "wk_cured_leather", "wk_bark_rope",
    "wk_elixir_atk", "wk_elixir_hp", "wk_elixir_def", "wk_cactus_ration"
  ];

  const BUILTIN_TOOLS_DB = {
    axe: {
      id: "axe", name: "伐木手斧", iconKey: "icon_axe",
      tiers: {
        0: { name: "徒手拾荒", desc: "尚未裝備手斧，僅能拾取散落枯枝。" },
        1: { name: "Lv.1 燧石手斧", cost: { branch: 2, flint: 2 }, gold: 0, desc: "可砍伐 1 階翠風原木、堅韌藤蔓、微光菇與琥珀松脂。" },
        2: { name: "Lv.2 精鐵伐木斧", cost: { iron: 2, wood: 2 }, gold: 80, desc: "【工具質變】可砍伐 2 階亞麻/太陽花/冰蓮，且每次砍伐 50% 機率獲得雙倍木材！" },
        3: { name: "Lv.3 秘銀連鎖神斧", cost: { mithril: 2, plank: 2 }, gold: 220, desc: "【★終極質變：連鎖砍伐】可砍伐 3 階黃金樹葉，且砍樹時自動震波連鎖採集周圍 155px 內所有草木！" }
      }
    },
    pickaxe: {
      id: "pickaxe", name: "採礦十字鎬", iconKey: "icon_pickaxe",
      tiers: {
        0: { name: "徒手拾荒", desc: "尚未裝備十字鎬，僅能拾取燧石、黏土與高台裸露礦脈。" },
        1: { name: "Lv.1 燧石十字鎬", cost: { branch: 2, flint: 2 }, gold: 0, desc: "可開採 1 階藍晶鐵礦、赤銅礦與白錫礦。" },
        2: { name: "Lv.2 精鐵十字鎬", cost: { iron: 3, wood: 2 }, gold: 80, desc: "【工具質變】可開採 2 階玄武岩/秘銀/珊瑚，且每次挖礦 50% 機率獲得雙倍礦石！" },
        3: { name: "Lv.3 秘銀震波破岩鎬", cost: { mithril: 2, basalt: 2 }, gold: 220, desc: "【★終極質變：連鎖挖礦】可開採 3 階黑曜石/星隕鐵，且挖礦時自動震波連鎖開採周圍 155px 內所有礦脈！" }
      }
    },
    shovel: {
      id: "shovel", name: "探險鐵鏟", iconKey: "icon_shovel",
      tiers: {
        0: { name: "尚未持有鐵鏟", desc: "製作鐵鏟後，可對照【全區放大地圖】挖掘地面唯一「✖ 藏寶記號」獲取遺跡鑰匙！" },
        1: { name: "Lv.1 精鐵探險鏟", cost: { wood: 2, iron: 1 }, gold: 0, desc: "【★尋寶必備】可挖掘全大陸地面唯一「✖」藏寶點，挖出【遠古遺跡鑰匙】與稀有礦石！" },
        2: { name: "Lv.2 秘銀尋寶鏟", cost: { plank: 2, mithril: 1 }, gold: 120, desc: "挖掘「✖」藏寶點時金幣收穫加倍，且額外挖出流沙秘銀與青銅齒輪！" },
        3: { name: "Lv.3 星隕考古神鏟", cost: { obsidian: 1, starIron: 1, quartz: 2 }, gold: 260, desc: "傳奇考古神鏟！挖掘「✖」藏寶點必定獲得高階星隕鐵與大量金幣！" }
      }
    },
    rod: {
      id: "rod", name: "垂釣魚竿", iconKey: "fishing_spot",
      tiers: {
        0: { name: "尚未持有魚竿", desc: "製作魚竿後可於各區水波釣魚點進行看準時機垂釣。" },
        1: { name: "Lv.1 翠竹釣魚竿", cost: { wood: 2, vine: 2 }, gold: 0, desc: "解鎖水波釣魚點垂釣功能，可釣起銀鱗鮮魚與河畔黏土。" },
        2: { name: "Lv.2 韌麻海釣竿", cost: { rope: 2, iron: 1 }, gold: 100, desc: "垂釣綠色完美命中區加寬 25%，更容易釣起深海珊瑚！" },
        3: { name: "Lv.3 秘銀大師竿", cost: { mithril: 2, steelCable: 1 }, gold: 240, desc: "垂釣完美命中區大幅加寬，且每次釣魚額外多獲 2 條鮮魚！" }
      }
    },
    hook: {
      id: "hook", name: "飛索鉤爪", iconKey: "icon_compass",
      tiers: {
        0: { name: "尚未持有鉤爪", desc: "用於跨越峽谷斷崖與險峻地形的輔助工具。" },
        1: { name: "Lv.1 精鐵飛索鉤", cost: { iron: 2, rope: 2 }, gold: 100, desc: "裝備後可快速跨越險峻地形，採集暴擊率 +15%。" },
        2: { name: "Lv.2 秘銀飛索鉤", cost: { mithril: 2, steelCable: 1 }, gold: 240, desc: "頂級探險鉤爪，野外採集額外獲得雙倍收穫機率 +30%！" }
      }
    },
    pouch: {
      id: "pouch", name: "探險行囊", iconKey: "icon_bag",
      tiers: {
        0: { name: "標準隨身行囊", desc: "基礎探險背包。" },
        1: { name: "Lv.1 亞麻擴容袋", cost: { hemp: 2, rope: 1 }, gold: 100, desc: "強化負重與體魄，永久提升最大生命值 +30！" },
        2: { name: "Lv.2 秘銀遠征袋", cost: { warmFur: 1, mithril: 1 }, gold: 240, desc: "頂級遠征行囊，永久提升最大生命值 +70，飽食消耗減緩！" }
      }
    }
  };

  const COMPLETE_WORKSHOP_RECIPES = [
    { id: "wk_rope_ladder",     name: "攀岩繩梯 x1",           category: "explore",  toKey: "ropeLadder",     toCount: 1, cost: { rope: 1, wood: 2 },                  desc: "【★高低差開路】架設於各區南側的岩石懸崖壁上，即可爬上高台採集稀有礦脈！" },
    { id: "wk_briar_sickle",    name: "除荊開路鐮刀",          category: "explore",  toKey: "briarSickle",    toCount: 1, isUniqueGear: true, cost: { bronzeIngot: 1, wood: 2, rope: 1 }, desc: "【★第一章解謎必備】永久可斬開各區【🌿千年荊棘魔藤】推進主線因果鏈，且砍伐草木收穫 +1！" },
    { id: "wk_salvage_hook",    name: "深水打撈磁鉤",          category: "explore",  toKey: "salvageHook",    toCount: 1, isUniqueGear: true, cost: { iron: 2, rope: 2, quartz: 1 },      desc: "【★第三章解謎必備】永久可打撈各區水岸的【⚓沉沒古寶箱】尋回水閘零件，且釣魚收穫 +1！" },
    { id: "wk_magnifying_lens", name: "水晶鑑定放大鏡",        category: "explore",  toKey: "magnifyingLens", toCount: 1, isUniqueGear: true, cost: { quartz: 2, bronzeIngot: 1 },        desc: "【★尋寶神器】持有後全地圖採集額外獲得稀有寶石與雙倍礦物機率 +35%！" },
    { id: "wk_ancient_gear",    name: "精密青銅齒輪 x1",       category: "explore",  toKey: "ancientGear",    toCount: 1, cost: { bronzeIngot: 1, flint: 2 },          desc: "【★第二/六章解謎必備】嵌入峽谷、海岸與天界的【⚙️失落齒輪機關柱】即可啟動古墓共鳴！" },
    { id: "wk_thermite_powder", name: "高熱鋁熱火種 x1",       category: "explore",  toKey: "thermitePowder", toCount: 1, cost: { coal: 2, iron: 1, resin: 2 },        desc: "【★第四章解謎必備】運用舊資源木炭與松脂調配的高溫火種，可融化雪原與洞窟的【🧊萬年玄冰晶殼】！" },
    { id: "wk_frost_essence",   name: "極寒急凍晶瓶 x1",       category: "explore",  toKey: "frostEssence",   toCount: 1, cost: { iceLotus: 1, quartz: 1, clay: 1 },   desc: "【★第五章解謎必備】封存冰蓮寒氣的石英瓶，可冷卻並震碎火山與天界的【🔥熔岩黑曜晶殼】！" },
    { id: "wk_crypt_key",       name: "鍛造遺跡鑰匙 x1",       category: "explore",  toKey: "cryptKey",       toCount: 1, cost: { bronzeIngot: 1, coal: 1 },           desc: "【★地底遺跡開鎖】除用鐵鏟挖掘地面「✖」獲得外，亦可用青銅錠與木炭直接鍛造【遠古遺跡鑰匙】！" },
    { id: "wk_torch",           name: "松脂火把 x2",           category: "explore",  toKey: "torchItem",      toCount: 2, cost: { branch: 1, resin: 1 },               desc: "【地牢與黑夜照明】點燃後照亮黑霧地牢，並在黑夜戰鬥直接燒毀夜魔 1 層暗夜護盾！" },
    { id: "wk_quartz_lantern",  name: "石英探礦提燈 (火把x4)", category: "explore",  toKey: "torchItem",      toCount: 4, cost: { iron: 1, quartz: 1, coal: 1 },       desc: "【強光照明】以鐵礦、石英砂與木炭打造，一次產出相當於 4 支火把的長效照明！" },
    { id: "wk_bomb",            name: "爆破炸彈 x2",           category: "explore",  toKey: "bombItem",       toCount: 2, cost: { flint: 2, clay: 1, resin: 1 },       desc: "【秘境開路】可炸開各區與荒島地牢的「裂縫岩壁」開啟隱藏秘寶箱！" },
    { id: "wk_coal_bomb",       name: "黑火藥重型炸彈 x3",     category: "explore",  toKey: "bombItem",       toCount: 3, cost: { coal: 2, flint: 1 },                 desc: "【高效爆破】以高台黑曜木炭調配火藥，一次大量製造 3 顆爆破炸彈！" },
    { id: "wk_charcoal_kiln",   name: "窯燒黑曜木炭 x2",       category: "smelt",    toKey: "coal",           toCount: 2, cost: { branch: 3 },                         desc: "【舊資源再利用】將初期的 3 根散落枯枝悶燒成 2 塊高熱能黑曜木炭！" },
    { id: "wk_bronze_ingot",    name: "冶煉青銅合金錠 x1",     category: "smelt",    toKey: "bronzeIngot",    toCount: 1, cost: { copperOre: 1, tinOre: 1, coal: 1 },  desc: "【合金冶煉】將赤銅礦、白錫礦與黑木炭熔煉為青銅合金錠，用於打造解謎工具與齒輪！" },
    { id: "wk_plank",           name: "加工厚木板 x1",         category: "smelt",    toKey: "plank",          toCount: 1, cost: { wood: 2 },                           desc: "【工程建材】將 2 塊翠風原木裁切為堅固的厚木板，用於修橋與升級大帆船。" },
    { id: "wk_rope",            name: "強化麻繩索 x1",         category: "smelt",    toKey: "rope",           toCount: 1, cost: { vine: 2 },                           desc: "【工程建材】將 2 條堅韌藤蔓編織為麻繩索，是製作【攀岩繩梯】、【打撈磁鉤】與吊橋的必備材料。" },
    { id: "wk_rope_hemp",       name: "亞麻編織繩 x2",         category: "smelt",    toKey: "rope",           toCount: 2, cost: { hemp: 2 },                           desc: "【高效製繩】以峽谷荒野亞麻一次編織出 2 條強韌麻繩索。" },
    { id: "wk_pitch",           name: "防水松脂膠 x1",         category: "smelt",    toKey: "pitch",          toCount: 1, cost: { resin: 2, clay: 1 },                 desc: "【造船建材】混合琥珀松脂與河畔黏土熬製的防水塗料。" },
    { id: "wk_nails",           name: "鍛造鐵釘 x2",           category: "smelt",    toKey: "nails",          toCount: 2, cost: { iron: 1 },                           desc: "【工程建材】將藍晶鐵礦鍛打為工程鐵釘。" },
    { id: "wk_steel_cable",     name: "秘銀強化鋼索 x1",       category: "smelt",    toKey: "steelCable",     toCount: 1, cost: { mithril: 1, rope: 1 },               desc: "【高階建材】融合流沙秘銀與麻繩索打造的超強韌鋼索。" },
    { id: "wk_heavy_sail",      name: "防風重帆布 x1",         category: "smelt",    toKey: "heavySail",      toCount: 1, cost: { sailCloth: 2, rope: 1 },             desc: "【遠航建材】縫合幽靈古帆布與麻繩，用於建造破浪遠洋大帆船。" },
    { id: "wk_warm_fur",        name: "禦寒獸毛氈 x1",         category: "smelt",    toKey: "warmFur",        toCount: 1, cost: { sinew: 2, hemp: 1 },                 desc: "【極地建材】搭建雪原防風避難屋與高階防寒護甲的保暖毛氈。" },
    { id: "wk_spiced_stew",     name: "香辛海陸燉肉 x1",       category: "survival", toKey: "spicedStew",     toCount: 1, cost: { fish: 1, herb: 2, rockSalt: 1 },     desc: "【★極品增益料理】食用立即恢復 100% 飽食度 + 150 HP，並永久提升主角最大生命值 +15！" },
    { id: "wk_ration_jerky",    name: "岩鹽風乾肉脯 x2",       category: "survival", toKey: "rationJerky",    toCount: 2, cost: { fish: 1, rockSalt: 1 },              desc: "【頂級口糧】以高台結晶岩鹽醃製鮮魚，食用每份恢復 +80% 飽食度與 +90 HP！" },
    { id: "wk_ration_herb",     name: "烘烤微光菇乾 x2",       category: "survival", toKey: "rationHerb",     toCount: 2, cost: { herb: 1, branch: 1 },                desc: "【基礎口糧】食用每份可恢復 +35% 飽食度與 +25 HP。" },
    { id: "wk_ration_fish",     name: "炭烤鮮魚乾 x2",         category: "survival", toKey: "rationFish",     toCount: 2, cost: { fish: 1, branch: 1 },                desc: "【進階口糧】食用每份可恢復 +60% 飽食度與 +60 HP。" },
    { id: "wk_alchemy_heal",    name: "精煉生命藥水 x2",       category: "survival", toKey: "potionHeal",     toCount: 2, cost: { herb: 2, quartz: 1 },                desc: "【隨身提煉】以微光菇 x2 與高台石英砂燒製的玻璃瓶，免費提煉 2 瓶生命藥水！" },
    { id: "wk_alchemy_hint",    name: "精煉洞察藥水 x2",       category: "survival", toKey: "potionHint",     toCount: 2, cost: { flower: 1, resin: 1, quartz: 1 },    desc: "【隨身提煉】以太陽花、松脂與高台石英砂提煉 2 瓶洞察藥水！" }
  ];

  const REMOVED_DUPLICATE_WEAPON_IDS = ["w_srpg_machete", "w_srpg_quartz_blade", "w_srpg_highland_axe"];
  const REMOVED_DUPLICATE_ARMOR_IDS  = ["a_srpg_leather", "a_srpg_steel_mail", "a_srpg_highland_plate"];

  let dynamicGuaranteedRecipes = [];
  function buildGuaranteedQuestMaterialRecipes() {
    const Data = window.Aetheria.Data;
    if (!Data || !Data.MATERIALS) return;
    const mats = Data.MATERIALS;
    const existingOutKeys = {};

    COMPLETE_WORKSHOP_RECIPES.forEach(function(r) { existingOutKeys[r.toKey] = true; });
    const rawWks = Array.isArray(Data.WORKSHOP_RECIPES)
      ? Data.WORKSHOP_RECIPES
      : (Data.WORKSHOP_RECIPES && typeof Data.WORKSHOP_RECIPES === "object" ? Object.values(Data.WORKSHOP_RECIPES) : []);
    rawWks.forEach(function(r) {
      if (r) existingOutKeys[r.toKey || r.giveKey || r.outKey] = true;
    });

    dynamicGuaranteedRecipes = [];

    Object.keys(mats).forEach(function(mKey) {
      if (REMOVED_BLOAT_MATERIAL_IDS.indexOf(mKey) !== -1) return;
      const mObj = mats[mKey];
      if (!mObj || !mObj.name) return;
      const mName = mObj.name;

      let costMap = null;
      let count = 1;
      let descText = "";

      if (mName.indexOf("耐火磚") !== -1 && !existingOutKeys[mKey]) {
        costMap = { obsidian: 1, basalt: 1, clay: 1 };
        descText = "【★六章拱橋建材】以熔岩黑曜石、玄武岩與黏土燒製的耐火石磚，用於鋪設火山石拱橋！";
      } else if (mName.indexOf("龍鱗") !== -1 && !existingOutKeys[mKey]) {
        costMap = { obsidian: 1, coal: 2 };
        descText = "【★六章任務保底】除討伐火山魔物與採集高台獲得外，亦可用黑曜石與黑木炭直接提煉【" + mName + "】！";
      } else if (mName.indexOf("熔核") !== -1 && !existingOutKeys[mKey]) {
        costMap = { obsidian: 2, mithril: 1, coal: 2 };
        descText = "【★六章任務保底】除擊敗火山精英/領主掉落外，亦可在工坊凝聚黑曜石與秘銀直接合成【" + mName + "】！";
      } else if (mName.indexOf("海妖") !== -1 && !existingOutKeys[mKey]) {
        costMap = { coral: 2, mithril: 1, quartz: 1 };
        descText = "【★遠洋大帆船核心保底】除擊敗深海頭目與沉船墓地獲得外，亦可用深海珊瑚與秘銀共鳴合成【" + mName + "】！";
      } else if (mName.indexOf("帆布") !== -1 && mKey !== "heavySail" && !existingOutKeys[mKey]) {
        costMap = { hemp: 2, vine: 1 };
        count = 2;
        descText = "【★四章海岸建材保底】以荒野亞麻與藤蔓編織【" + mName + "】，不用再苦刷海岸怪物掉落！";
      } else if (mName.indexOf("獸筋") !== -1 && !existingOutKeys[mKey]) {
        costMap = { rope: 1, resin: 1 };
        count = 2;
        descText = "【★五章雪原建材保底】以強化麻繩浸潤琥珀松脂製成【" + mName + "】，輕鬆合成禦寒獸毛氈！";
      } else if ((mName.indexOf("聖碑") !== -1 || mName.indexOf("殘片") !== -1) && !existingOutKeys[mKey]) {
        costMap = { starIron: 1, obsidian: 1, quartz: 1 };
        descText = "【★終章聖碑保底】除開啟各區地底遺跡石棺獲得外，亦可用星隕鐵與石英砂修復合成【" + mName + "】！";
      } else if ((mName.indexOf("浮空") !== -1 || mName.indexOf("天界") !== -1 || mName.indexOf("星輝") !== -1) && !existingOutKeys[mKey]) {
        costMap = { starIron: 1, quartz: 2 };
        descText = "【★終章天界建材保底】以深淵星隕鐵與透明石英砂鍛造【" + mName + "】！";
      }

      if (costMap) {
        existingOutKeys[mKey] = true;
        dynamicGuaranteedRecipes.push({
          id: "wk_auto_guarantee_" + mKey,
          name: mName + (count > 1 ? (" x" + count) : " x1"),
          category: "smelt",
          toKey: mKey,
          toCount: count,
          cost: costMap,
          desc: descText
        });
      }
    });
  }

  function registerSrpgDataIntoGame() {
    const Data = window.Aetheria.Data;
    if (!Data) return;

    if (Data.MATERIALS) {
      REMOVED_BLOAT_MATERIAL_IDS.forEach(function(k) { delete Data.MATERIALS[k]; });
      Object.keys(CLEAN_SRPG_MATERIALS).forEach(function(k) { Data.MATERIALS[k] = CLEAN_SRPG_MATERIALS[k]; });
    }
    if (Data.WEAPONS) {
      REMOVED_DUPLICATE_WEAPON_IDS.forEach(function(wid) { delete Data.WEAPONS[wid]; });
    }
    if (Data.ARMORS) {
      REMOVED_DUPLICATE_ARMOR_IDS.forEach(function(aid) { delete Data.ARMORS[aid]; });
    }

    const s = window.Aetheria.State && window.Aetheria.State.data;
    if (s) {
      if (!s.tools) s.tools = { axe: 0, pickaxe: 0, shovel: 0, rod: 0, hook: 0, pouch: 0 };
      if (s.tools.shovel === undefined) s.tools.shovel = 0;
      if (!s.dugSpots) s.dugSpots = {};
      if (!s.clearedToolGates) s.clearedToolGates = {};
      if (!s.solvedExplorePuzzles) s.solvedExplorePuzzles = {};
      if (!s.claimedExplorePuzzleChests) s.claimedExplorePuzzleChests = {};
      if (!s.projectsBuilt) s.projectsBuilt = {};

      // 僅在該區 Boss 確定已被擊敗過時，才回溯標記橋樑已通（不依賴等級自動開橋，確保未打通章節必先解謎！）
      if (s.bossesDefeated && s.bossesDefeated.zone1_forest) s.projectsBuilt.proj_z1_bridge = true;
      if (s.bossesDefeated && s.bossesDefeated.zone2_canyon) {
        s.projectsBuilt.proj_z2_rope = true;
        s.projectsBuilt.proj_z2_bridge = true;
      }
      if (s.bossesDefeated && s.bossesDefeated.zone3_coast) {
        s.projectsBuilt.proj_z3_raft = true;
        s.projectsBuilt.proj_z3_bridge = true;
      }

      if (Array.isArray(s.unlockedWeapons)) {
        s.unlockedWeapons = s.unlockedWeapons.filter(function(id) { return REMOVED_DUPLICATE_WEAPON_IDS.indexOf(id) === -1; });
      }
      if (s.equippedWeapon && REMOVED_DUPLICATE_WEAPON_IDS.indexOf(s.equippedWeapon) !== -1) {
        s.equippedWeapon = (s.unlockedWeapons && s.unlockedWeapons.length > 0) ? s.unlockedWeapons[s.unlockedWeapons.length - 1] : "w_wood";
      }
      if (Array.isArray(s.unlockedArmors)) {
        s.unlockedArmors = s.unlockedArmors.filter(function(id) { return REMOVED_DUPLICATE_ARMOR_IDS.indexOf(id) === -1; });
      }
      if (s.equippedArmor && REMOVED_DUPLICATE_ARMOR_IDS.indexOf(s.equippedArmor) !== -1) {
        s.equippedArmor = (s.unlockedArmors && s.unlockedArmors.length > 0) ? s.unlockedArmors[s.unlockedArmors.length - 1] : "a_cloth";
      }

      if (s.projectsBuilt && s.projectsBuilt.proj_z5_bridge && Data.MATERIALS) {
        Object.keys(Data.MATERIALS).forEach(function(mk) {
          const m = Data.MATERIALS[mk];
          if (m && m.name && m.name.indexOf("耐火磚") !== -1) {
            if ((s.inventory[mk] || 0) < 3) s.inventory[mk] = 3;
          }
        });
      }
    }

    buildGuaranteedQuestMaterialRecipes();

    if (Array.isArray(Data.WORKSHOP_RECIPES)) {
      Data.WORKSHOP_RECIPES = Data.WORKSHOP_RECIPES.filter(function(r) {
        return r && REMOVED_BLOAT_RECIPE_IDS.indexOf(r.id) === -1;
      });
      COMPLETE_WORKSHOP_RECIPES.concat(dynamicGuaranteedRecipes).forEach(function(rec) {
        if (!Data.WORKSHOP_RECIPES.some(function(r) { return r.id === rec.id; })) {
          Data.WORKSHOP_RECIPES.push(rec);
        }
      });
    } else {
      Data.WORKSHOP_RECIPES = COMPLETE_WORKSHOP_RECIPES.concat(dynamicGuaranteedRecipes);
    }
  }

  function findMatKeyByNameKeyword(keyword, fallbackKey) {
    const mats = (window.Aetheria.Data && window.Aetheria.Data.MATERIALS) || {};
    const found = Object.keys(mats).find(function(k) {
      return mats[k] && mats[k].name && mats[k].name.indexOf(keyword) !== -1;
    });
    return found || fallbackKey;
  }

  // ================= 7. 曙光營地三帳篷調整（對齊棕色門口 y=52 防 Lag） =================
  function adjustCampTentsUpward(campMap) {
    if (!campMap || campMap.id !== "camp_hub") return campMap;
    const token = campMap._refreshToken || "init";
    if (campMap._campTentsAdjustedToken === token) return campMap;
    campMap._campTentsAdjustedToken = token;

    campMap.decos = (campMap.decos || []).filter(function(d) {
      return !d.isCampHerbFarm && !d.isCampFishTrap && !d.isMuseumBuilding && !d.isTrainingDummy;
    });
    campMap.portals = (campMap.portals || []).filter(function(p) {
      return p.id !== "p_enter_museum";
    });

    (campMap.decos || []).forEach(function(d) {
      const spr = String(d.sprite || "");
      if (d.id === "deco_hero_tent_ext" || spr.indexOf("tent") !== -1 || (d.y !== undefined && d.y <= 95 && (d.w >= 40 || d.h >= 36))) {
        d.y = 14;
        d.solid = false;
      }
    });

    (campMap.portals || []).forEach(function(p) {
      if (p.targetZone === "tent_guild") {
        p.y = 52;
        p.name = "公會帳篷";
      } else if (p.targetZone === "tent_hero") {
        p.y = 52;
        p.name = "主角帳篷";
      } else if (p.targetZone === "tent_forge") {
        p.y = 52;
        p.name = "鐵匠帳篷";
      }
    });

    if (campMap.trees) {
      campMap.trees = campMap.trees.filter(function(t) {
        return !(t.y < 85 && ((t.x >= 60 && t.x <= 185) || (t.x >= 255 && t.x <= 365) || (t.x >= 435 && t.x <= 565)));
      });
    }

    const Maps = window.Aetheria.Data && window.Aetheria.Data.Maps;
    if (Maps && Maps.getMap) {
      ["tent_guild", "tent_hero", "tent_forge"].forEach(function(tZone) {
        const tm = Maps.getMap(tZone);
        if (tm && tm.portals) {
          tm.portals.forEach(function(ep) {
            if (ep.targetZone === "camp_hub") ep.targetY = 96;
          });
        }
      });
    }
    return campMap;
  }

  // ================= 8. 現場機關陣與 4 大「工具解謎驅動障礙」 =================
  const DIR_SYMBOLS = ["▲北", "▶東", "▼南", "◀西"];

  const ZONE_TOOL_GATE_OBSTACLES = {
    zone1_forest: [
      { id: "tg_z1_briar",  x: 420, y: 540, gateType: "briar",  sprite: "gate_briar_vines",  name: "🌿荊棘魔藤[步驟①:需鐮刀]", reqKey: "briarSickle",    consume: false, rewardGold: 220, rewardMats: { copperOre: 3, tinOre: 2, herb: 4 } },
      { id: "tg_z1_sunken", x: 985, y: 480, gateType: "sunken", sprite: "gate_sunken_chest", name: "⚓沉沒寶箱[需打撈鉤]",     reqKey: "salvageHook",    consume: false, rewardGold: 260, rewardMats: { mithril: 2, quartz: 2, fish: 4 } }
    ],
    cave1_mushroom: [
      { id: "tg_c1_ice",    x: 860, y: 640, gateType: "ice",    sprite: "gate_element_geode",name: "🧊玄冰晶殼[步驟①:需鋁熱火種]", reqKey: "thermitePowder", consume: true,  rewardGold: 320, rewardMats: { mithril: 3, cryptKey: 1 } },
      { id: "tg_c1_briar",  x: 680, y: 480, gateType: "briar",  sprite: "gate_briar_vines",  name: "🌿幽窟魔藤[需鐮刀]",         reqKey: "briarSickle",    consume: false, rewardGold: 250, rewardMats: { tinOre: 3, coal: 3, quartz: 2 } }
    ],
    zone2_canyon: [
      { id: "tg_z2_gear",   x: 720, y: 540, gateType: "gear",   sprite: "gate_gear_pillar",  name: "⚙️齒輪機關柱[步驟①:需青銅齒輪]", reqKey: "ancientGear",    consume: true,  rewardGold: 300, rewardMats: { mithril: 3, basalt: 3, cryptKey: 1 } },
      { id: "tg_z2_sunken", x: 985, y: 520, gateType: "sunken", sprite: "gate_sunken_chest", name: "⚓峽谷沉寶[需打撈鉤]",           reqKey: "salvageHook",    consume: false, rewardGold: 280, rewardMats: { copperOre: 3, tinOre: 3, quartz: 2 } }
    ],
    zone3_coast: [
      { id: "tg_z3_sunken", x: 760, y: 580, gateType: "sunken", sprite: "gate_sunken_chest", name: "⚓深海沉船箱[步驟①:需打撈鉤]", reqKey: "salvageHook",    consume: false, rewardGold: 360, rewardMats: { coral: 3, sailCloth: 2, cryptKey: 1 } },
      { id: "tg_z3_gear",   x: 560, y: 660, gateType: "gear",   sprite: "gate_gear_pillar",  name: "⚙️海神齒輪柱[需青銅齒輪]",     reqKey: "ancientGear",    consume: true,  rewardGold: 340, rewardMats: { coral: 3, mithril: 2 } }
    ],
    zone4_snow: [
      { id: "tg_z4_ice1",   x: 700, y: 540, gateType: "ice",    sprite: "gate_element_geode",name: "🧊萬年玄冰棺[步驟①:需鋁熱火種]", reqKey: "thermitePowder", consume: true,  rewardGold: 420, rewardMats: { iceLotus: 3, sinew: 3, obsidian: 2 } },
      { id: "tg_z4_briar",  x: 880, y: 660, gateType: "briar",  sprite: "gate_briar_vines",  name: "🌿霜棘魔藤[需鐮刀]",             reqKey: "briarSickle",    consume: false, rewardGold: 380, rewardMats: { iceLotus: 2, coal: 4, cryptKey: 1 } }
    ],
    zone5_volcano: [
      { id: "tg_z5_magma",  x: 720, y: 560, gateType: "magma",  sprite: "gate_element_geode",name: "🔥熔岩黑曜殼[步驟①:需急凍晶瓶]", reqKey: "frostEssence",   consume: true,  rewardGold: 480, rewardMats: { obsidian: 3, starIron: 2, cryptKey: 1 } },
      { id: "tg_z5_gear",   x: 880, y: 660, gateType: "gear",   sprite: "gate_gear_pillar",  name: "⚙️熔爐齒輪柱[需青銅齒輪]",       reqKey: "ancientGear",    consume: true,  rewardGold: 450, rewardMats: { obsidian: 3, basalt: 3 } }
    ],
    zone6_sky: [
      { id: "tg_z6_gear",   x: 720, y: 550, gateType: "gear",   sprite: "gate_gear_pillar",  name: "⚙️星界齒輪聖柱[步驟①:需青銅齒輪]", reqKey: "ancientGear",    consume: true,  rewardGold: 600, rewardMats: { starIron: 3, goldLeaf: 2, tabletShard: 1 } },
      { id: "tg_z6_magma",  x: 880, y: 660, gateType: "magma",  sprite: "gate_element_geode",name: "🔥星核晶殼[需急凍晶瓶]",           reqKey: "frostEssence",   consume: true,  rewardGold: 600, rewardMats: { starIron: 3, goldLeaf: 2 } }
    ]
  };

  const ZONE_EXPLORE_PUZZLES = {
    zone1_forest: {
      type: "brazier_order", cx: 230, cy: 880,
      riddle: "📜【森林古碑謎語 (步驟②)】：「先以除荊鐮刀斬開荊棘谷(步驟①)，再依日出至星夜點燃聖火：東之晨(1) ➔ 南之日(2) ➔ 西之霞(3) ➔ 北之星(4)！」",
      items: [
        { dx: 64, dy: 0, order: 1, label: "東之晨" }, { dx: 0, dy: 58, order: 2, label: "南之日" },
        { dx: -64, dy: 0, order: 3, label: "西之霞" }, { dx: 0, dy: -58, order: 4, label: "北之星" }
      ]
    },
    cave1_mushroom: {
      type: "lever_toggle", cx: 230, cy: 860,
      riddle: "📜【礦洞機關銘文 (步驟②)】：「先以鋁熱火種融化玄冰晶殼(步驟①)，再扳動三座連動機括（①動①②、②動①②③、③動②③）使其全部開啟！」"
    },
    zone2_canyon: {
      type: "statue_rotate", cx: 230, cy: 880,
      riddle: "📜【法老方位碑 (步驟②)】：「先將青銅齒輪嵌入流沙盆地機關柱(步驟①)，再令四方石像共鳴：西衛望東(▶東)、東衛望西(◀西)、北衛望南(▼南)、南衛望北(▲北)！」",
      statues: [
        { dx: -64, dy: 0, initDir: 0, targetDir: 1, name: "西衛" }, { dx: 64, dy: 0, initDir: 1, targetDir: 3, name: "東衛" },
        { dx: 0, dy: -58, initDir: 3, targetDir: 2, name: "北衛" }, { dx: 0, dy: 58, initDir: 2, targetDir: 0, name: "南衛" }
      ]
    },
    zone3_coast: {
      type: "lever_toggle", cx: 230, cy: 880,
      riddle: "📜【沉船水閘銘文 (步驟②)】：「先用深水打撈磁鉤於新月海灣撈起沉船箱(步驟①)，再令三座連動水閘同時處於【🟢開啟】斷絕幽靈船長的潮汐加護！」"
    },
    zone4_snow: {
      type: "brazier_order", cx: 230, cy: 880,
      riddle: "📜【冰原融霜碑 (步驟②)】：「先用高熱鋁熱火種融化鏡湖玄冰棺(步驟①)，再逆風點燃四聖火：北之極光(1) ➔ 西之寒星(2) ➔ 南之暖陽(3) ➔ 東之破曉(4)！」",
      items: [
        { dx: 0, dy: -58, order: 1, label: "北之極光" }, { dx: -64, dy: 0, order: 2, label: "西之寒星" },
        { dx: 0, dy: 58, order: 3, label: "南之暖陽" },  { dx: 64, dy: 0, order: 4, label: "東之破曉" }
      ]
    },
    zone5_volcano: {
      type: "lever_toggle", cx: 230, cy: 880,
      riddle: "📜【熔岩閥門銘文 (步驟②)】：「先用極寒急凍晶瓶震碎火口熔岩殼(步驟①)，再令三座連動熔岩閥同時處於【🟢開啟】壓制火山龍皇的沸騰龍炎！」"
    },
    zone6_sky: {
      type: "statue_rotate", cx: 230, cy: 880,
      riddle: "📜【天界星象碑 (步驟②)】：「先將青銅齒輪嵌入中央星界聖柱(步驟①)，再令四聖像背心向外守護八方：北像朝北(▲北)、東像朝東(▶東)、南像朝南(▼南)、西像朝西(◀西)！」",
      statues: [
        { dx: 0, dy: -58, initDir: 2, targetDir: 0, name: "北像" }, { dx: 64, dy: 0, initDir: 3, targetDir: 1, name: "東像" },
        { dx: 0, dy: 58, initDir: 0, targetDir: 2, name: "南像" },  { dx: -64, dy: 0, initDir: 1, targetDir: 3, name: "西像" }
      ]
    }
  };

  function isZoneExplorePuzzleSolved(mapObj, s) {
    if (!mapObj || !s) return false;
    if (s.solvedExplorePuzzles && s.solvedExplorePuzzles[mapObj.id]) return true;

    const decos = mapObj.decos || [];
    const statues = decos.filter(function(d) { return d && d.isPuzzleRotateStatue; });
    if (statues.length > 0 && statues.every(function(d) { return d.curDir === d.targetDir; })) {
      if (!s.solvedExplorePuzzles) s.solvedExplorePuzzles = {};
      s.solvedExplorePuzzles[mapObj.id] = true;
      return true;
    }

    const levers = decos.filter(function(d) { return d && d.isPuzzleToggleLever; });
    if (levers.length > 0 && levers.every(function(d) { return d.leverOn; })) {
      if (!s.solvedExplorePuzzles) s.solvedExplorePuzzles = {};
      s.solvedExplorePuzzles[mapObj.id] = true;
      return true;
    }

    const braziers = decos.filter(function(d) { return d && d.isPuzzleOrderBrazier; });
    if (braziers.length > 0 && braziers.every(function(d) { return d.lit; })) {
      if (!s.solvedExplorePuzzles) s.solvedExplorePuzzles = {};
      s.solvedExplorePuzzles[mapObj.id] = true;
      return true;
    }

    return false;
  }

  function injectExplorationPuzzlesIntoMap(mapObj) {
    const pCfg = ZONE_EXPLORE_PUZZLES[mapObj.id];
    if (!pCfg) return;
    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
    const solved = Boolean(s.solvedExplorePuzzles && s.solvedExplorePuzzles[mapObj.id]);
    const chestClaimed = Boolean(s.claimedExplorePuzzleChests && s.claimedExplorePuzzleChests[mapObj.id]);
    const cx = pCfg.cx, cy = pCfg.cy;

    mapObj.dirtBlobs.push({ cx: cx, cy: cy, rx: 105, ry: 90, isExpandedBlob: true });

    mapObj.decos.push({
      id: "exp_puz_tablet_" + mapObj.id,
      x: cx - 72, y: cy - 62, sprite: "seal_pillar_on", w: 26, h: 30, solid: false,
      isHighlandElement: true, isExplorePuzzleTablet: true, riddleText: pCfg.riddle, zoneId: mapObj.id
    });

    mapObj.nodes.push({
      id: "exp_puz_chest_" + mapObj.id,
      x: cx, y: cy, type: "chest", name: "古遺跡機關寶箱",
      isHighlandOre: true, isExplorePuzzleChest: true, zoneId: mapObj.id, opened: chestClaimed
    });

    if (pCfg.type === "brazier_order") {
      mapObj._brazierStep = solved ? 4 : 0;
      pCfg.items.forEach(function(it, idx) {
        mapObj.decos.push({
          id: "exp_puz_brazier_" + mapObj.id + "_" + idx,
          x: cx + it.dx, y: cy + it.dy, sprite: solved ? "brazier_on" : "brazier_off", w: 26, h: 28, solid: false,
          isHighlandElement: true, isPuzzleOrderBrazier: true, lit: solved, orderNum: it.order, brazierLabel: it.label, zoneId: mapObj.id
        });
      });
    } else if (pCfg.type === "statue_rotate") {
      pCfg.statues.forEach(function(st, idx) {
        const curDir = solved ? st.targetDir : st.initDir;
        mapObj.decos.push({
          id: "exp_puz_statue_" + mapObj.id + "_" + idx,
          x: cx + st.dx, y: cy + st.dy, sprite: "ancient_statue", w: 28, h: 30, solid: false,
          isHighlandElement: true, isPuzzleRotateStatue: true, curDir: curDir, targetDir: st.targetDir, statueName: st.name, zoneId: mapObj.id
        });
      });
    } else if (pCfg.type === "lever_toggle") {
      const initStates = solved ? [true, true, true] : [true, false, false];
      [-56, 0, 56].forEach(function(dx, idx) {
        const isOn = initStates[idx];
        mapObj.decos.push({
          id: "exp_puz_lever_" + mapObj.id + "_" + idx,
          x: cx + dx, y: cy + 56, sprite: isOn ? "lever_on" : "lever_off", w: 26, h: 26, solid: false,
          isHighlandElement: true, isPuzzleToggleLever: true, leverIdx: idx, leverOn: isOn, zoneId: mapObj.id
        });
      });
    }

    const gateList = ZONE_TOOL_GATE_OBSTACLES[mapObj.id] || [];
    gateList.forEach(function(gt) {
      if (s.clearedToolGates && s.clearedToolGates[gt.id]) return;
      mapObj.nodes.push({
        id: gt.id,
        x: gt.x,
        y: gt.y,
        type: "crystal",
        giveKey: "cryptKey",
        reqToolLv: 0,
        isHighlandOre: true,
        isToolGateObstacle: true,
        gateCfg: gt,
        gateSprite: gt.sprite,
        name: gt.name,
        opened: false
      });
    });
  }

  // ================= 9. 各區高低差懸崖、山洞 (grotto_*) 與地底遺跡 (crypt_*) =================
  const HIGHLAND_ZONES = {
    zone1_forest:   { targetW: 1680, targetH: 1180, ores: ["copperOre", "tinOre", "quartz", "rockSalt"],  grottoOres: ["copperOre", "tinOre", "coal", "quartz"],   cryptName: "翠風古老樹根地窖", cryptBoss: "★遠古樹根守衛魔像" },
    cave1_mushroom: { targetW: 1580, targetH: 1140, ores: ["tinOre", "copperOre", "quartz", "coal"],      grottoOres: ["tinOre", "copperOre", "mithril", "quartz"], cryptName: "幽窟地底秘銀聖堂", cryptBoss: "★秘銀晶簇鎮守魔像" },
    zone2_canyon:   { targetW: 1680, targetH: 1180, ores: ["copperOre", "tinOre", "mithril", "quartz"],   grottoOres: ["copperOre", "tinOre", "mithril", "basalt"], cryptName: "流沙埋沒法老王陵", cryptBoss: "★荒漠王陵黃金魔像" },
    zone3_coast:    { targetW: 1680, targetH: 1180, ores: ["coral", "sailCloth", "rockSalt", "quartz"],   grottoOres: ["coral", "sailCloth", "tinOre", "mithril"],  cryptName: "海底亞特蘭蒂斯密室", cryptBoss: "★深海遺跡三叉戟魔像" },
    zone4_snow:     { targetW: 1680, targetH: 1180, ores: ["obsidian", "sinew", "iceLotus", "quartz"],    grottoOres: ["obsidian", "sinew", "coal", "mithril"],     cryptName: "永凍冰河遠古神殿", cryptBoss: "★極寒永凍冰晶魔像" },
    zone5_volcano:  { targetW: 1680, targetH: 1180, ores: ["obsidian", "starIron", "coal", "quartz"],     grottoOres: ["obsidian", "starIron", "coal", "quartz"],   cryptName: "地心黑曜熔爐秘殿", cryptBoss: "★紅蓮火山龍皇・分身" },
    zone6_sky:      { targetW: 1680, targetH: 1180, ores: ["starIron", "goldLeaf", "quartz", "obsidian"], grottoOres: ["starIron", "goldLeaf", "quartz", "obsidian"],cryptName: "星界破曉創世密室", cryptBoss: "★創世星隕守護神像" }
  };

  const grottoMapsCache = {};
  const cryptMapsCache = {};

  function buildCliffGrottoMap(parentZoneId) {
    const cfg = HIGHLAND_ZONES[parentZoneId] || HIGHLAND_ZONES.zone1_forest;
    const matsDB = (window.Aetheria.Data && window.Aetheria.Data.MATERIALS) || {};
    const parentMap = (window.Aetheria.Data && window.Aetheria.Data.Maps && window.Aetheria.Data.Maps.getMap(parentZoneId)) || { recLv: 3 };
    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};

    const grottoPool = cfg.grottoOres.slice();
    if (parentZoneId === "zone5_volcano") {
      grottoPool.push(findMatKeyByNameKeyword("龍鱗", "obsidian"));
      grottoPool.push(findMatKeyByNameKeyword("熔核", "starIron"));
    } else if (parentZoneId === "zone3_coast") {
      grottoPool.push(findMatKeyByNameKeyword("海妖", "coral"));
    }

    const nodes = [];
    [{ x: 130, y: 110 }, { x: 240, y: 95 }, { x: 350, y: 110 }, { x: 145, y: 195 }, { x: 335, y: 195 }, { x: 240, y: 145 }].forEach(function(pt, idx) {
      const giveKey = grottoPool[idx % grottoPool.length];
      const mInfo = matsDB[giveKey] || { name: giveKey };
      nodes.push({
        id: "grotto_node_" + parentZoneId + "_" + idx + "_" + Date.now(),
        x: pt.x, y: pt.y, type: "crystal", giveKey: giveKey, reqTool: "pickaxe", reqToolLv: 0,
        perfect: true, isClusterBoulder: true, name: mInfo.name, opened: false
      });
    });

    const grottoDigId = "dig_perm_grotto_" + parentZoneId;
    if (!(s.dugSpots && s.dugSpots[grottoDigId])) {
      nodes.push({
        id: grottoDigId, x: 240, y: 205, type: "crystal", giveKey: "cryptKey",
        isBuriedSpot: true, reqToolLv: 0, name: "✖藏寶點", opened: false
      });
    }

    return {
      id: "grotto_" + parentZoneId, parentZoneId: parentZoneId, _refreshToken: Date.now(),
      name: "岩壁礦洞", recLv: parentMap.recLv || 3, bgm: "cave", theme: "cave",
      rain: false, fog: false, hasRiver: false, width: 480, height: 320,
      dirtBlobs: [{ cx: 240, cy: 155, rx: 185, ry: 110 }], trees: [],
      decos: [{ x: 185, y: 78, sprite: "brazier_on", w: 24, h: 26, solid: true }, { x: 295, y: 78, sprite: "brazier_on", w: 24, h: 26, solid: true }],
      nodes: nodes, npcs: [], monsters: [],
      portals: [{ id: "p_exit_grotto_" + parentZoneId, name: "離開山洞 ▾", x: 240, y: 278, targetZone: parentZoneId, targetX: 495, targetY: 995, icon: "stairs" }]
    };
  }

  function buildAncientCryptMap(parentZoneId) {
    const cfg = HIGHLAND_ZONES[parentZoneId] || HIGHLAND_ZONES.zone1_forest;
    const matsDB = (window.Aetheria.Data && window.Aetheria.Data.MATERIALS) || {};
    const parentMap = (window.Aetheria.Data && window.Aetheria.Data.Maps && window.Aetheria.Data.Maps.getMap(parentZoneId)) || { recLv: 5 };
    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
    const vaultClaimed = Boolean(s.claimedCryptVaults && s.claimedCryptVaults[parentZoneId]);

    const nodes = [{
      id: "crypt_vault_" + parentZoneId, x: 280, y: 85, type: "chest",
      name: "遠古聖物石棺", isCryptVaultChest: true, parentZoneId: parentZoneId, opened: vaultClaimed
    }];

    [{ x: 115, y: 115 }, { x: 445, y: 115 }, { x: 115, y: 245 }, { x: 445, y: 245 }].forEach(function(pt, idx) {
      const giveKey = cfg.ores[idx % cfg.ores.length];
      const mInfo = matsDB[giveKey] || { name: giveKey };
      nodes.push({
        id: "crypt_ore_" + parentZoneId + "_" + idx + "_" + Date.now(),
        x: pt.x, y: pt.y, type: "crystal", giveKey: giveKey, reqTool: "pickaxe", reqToolLv: 0,
        perfect: true, isClusterBoulder: true, name: "遺跡" + mInfo.name, opened: false
      });
    });

    const bossLv = Math.max(4, (parentMap.recLv || 3) + 2);
    return {
      id: "crypt_" + parentZoneId, parentZoneId: parentZoneId, _refreshToken: Date.now(),
      name: cfg.cryptName || "遠古地底遺跡", recLv: bossLv, bgm: "cave", theme: "cave",
      rain: false, fog: false, hasRiver: false, width: 560, height: 360,
      dirtBlobs: [{ cx: 280, cy: 175, rx: 220, ry: 135 }], trees: [],
      decos: [
        { x: 205, y: 82, sprite: "brazier_on", w: 26, h: 28, solid: true },
        { x: 355, y: 82, sprite: "brazier_on", w: 26, h: 28, solid: true },
        { x: 205, y: 175, sprite: "seal_pillar_on", w: 28, h: 32, solid: true },
        { x: 355, y: 175, sprite: "seal_pillar_on", w: 28, h: 32, solid: true }
      ],
      nodes: nodes, npcs: [],
      monsters: [{
        id: "crypt_guardian_" + parentZoneId + "_" + Date.now(),
        name: cfg.cryptBoss || "★遠古遺跡守衛魔像", lv: bossLv, x: 280, y: 165, homeX: 280, homeY: 165,
        type: "boss", isBoss: (parentZoneId === "zone5_volcano"), isShiny: true, isCryptGuardian: true, alive: true
      }],
      portals: [{ id: "p_exit_crypt_" + parentZoneId, name: "離開地底遺跡 ▾", x: 280, y: 318, targetZone: parentZoneId, targetX: 935, targetY: 1055, icon: "stairs" }]
    };
  }

  function isInsideHighlandPlateau(x, y) {
    const inTopWing   = (x >= 395 && x <= 895 && y >= 802 && y <= 920);
    const inRightWing = (x >= 715 && x <= 895 && y >= 915 && y <= 1058);
    return inTopWing || inRightWing;
  }

  function isBlockedByCliffFromLowland(x, y) {
    if (x >= 385 && x <= 710 && y >= 795 && y <= 965) return true;
    if (x >= 705 && x <= 910 && y >= 795 && y <= 1098) return true;
    return false;
  }

  function injectHighlandCliffIntoMap(mapObj) {
    if (!mapObj || !HIGHLAND_ZONES[mapObj.id]) return mapObj;
    const token = mapObj._refreshToken || "init";
    if (mapObj._highlandInjectedToken === token) return mapObj;
    mapObj._highlandInjectedToken = token;

    const cfg = HIGHLAND_ZONES[mapObj.id];
    const matsDB = (window.Aetheria.Data && window.Aetheria.Data.MATERIALS) || {};
    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
    const rigged = Boolean(s.riggedCliffs && s.riggedCliffs[mapObj.id]);
    const cryptUnlocked = Boolean(s.unlockedCrypts && s.unlockedCrypts[mapObj.id]);

    const oldW = mapObj._origBaseWidth || mapObj.width || 1200;
    const oldH = mapObj._origBaseHeight || mapObj.height || 680;
    mapObj._origBaseWidth = oldW;
    mapObj._origBaseHeight = oldH;

    mapObj.width = Math.max(oldW, cfg.targetW);
    mapObj.height = Math.max(oldH, cfg.targetH);

    if (mapObj.trees) {
      mapObj.trees = mapObj.trees.filter(function(t) {
        if (t.isExpandedPerimeterTree) return false;
        if (t.y >= oldH - 72) return false;
        if (t.x >= oldW - 68) return false;
        if (t.x >= 130 && t.x <= 1010 && t.y >= 740 && t.y <= 1120) return false;
        return true;
      });

      for (let bx = 20; bx < mapObj.width - 20; bx += 42) {
        if (mapObj.hasRiver && Math.abs(bx - (mapObj.riverX || 1030)) < 52) continue;
        mapObj.trees.push({ x: bx, y: mapObj.height - 42, isExpandedPerimeterTree: true });
        if (bx >= oldW - 40) mapObj.trees.push({ x: bx, y: 18, isExpandedPerimeterTree: true });
      }
      for (let by = 58; by < mapObj.height - 42; by += 42) {
        mapObj.trees.push({ x: mapObj.width - 42, y: by, isExpandedPerimeterTree: true });
        if (by >= oldH - 40) mapObj.trees.push({ x: 18, y: by, isExpandedPerimeterTree: true });
      }
    }

    if (mapObj.monsters) {
      mapObj.monsters = mapObj.monsters.filter(function(m) { return !m.isVolcanoHelperSubBoss; });
      mapObj.monsters.forEach(function(m) {
        if (!m.isBoss && isBlockedByCliffFromLowland(m.x, m.y)) {
          m.x = 240; m.y = 720; m.homeX = 240; m.homeY = 720;
        }
      });

      if (mapObj.id === "zone5_volcano") {
        let volcanoBoss = mapObj.monsters.find(function(m) { return m && m.isBoss; });
        if (volcanoBoss) {
          volcanoBoss.name = "守關領主・紅蓮火山龍皇";
          volcanoBoss.x = 1120;
          volcanoBoss.y = 240;
          volcanoBoss.homeX = 1120;
          volcanoBoss.homeY = 240;
        } else {
          mapObj.monsters.push({
            id: "boss_zone5_volcano_dragon",
            name: "守關領主・紅蓮火山龍皇",
            lv: (mapObj.recLv || 22) + 3,
            x: 1120, y: 240, homeX: 1120, homeY: 240,
            type: "boss", isBoss: true, alive: true
          });
        }

        mapObj.monsters.push({
          id: "volcano_flame_core_subboss_" + token,
          name: "★紅蓮炎魔將[掉熔核]",
          lv: mapObj.recLv || 22,
          x: 780, y: 420, homeX: 780, homeY: 420,
          type: "skull", isBoss: false, isShiny: true, isVolcanoHelperSubBoss: true, alive: true
        });
      }
    }

    mapObj.dirtBlobs = (mapObj.dirtBlobs || []).filter(function(b) { return !b.isExpandedBlob; });
    mapObj.dirtBlobs.push(
      { cx: 230,  cy: 780,  rx: 105, ry: 220, isExpandedBlob: true },
      { cx: 520,  cy: 1025, rx: 195, ry: 75,  isExpandedBlob: true },
      { cx: 945,  cy: 1025, rx: 75,  ry: 65,  isExpandedBlob: true },
      { cx: 1360, cy: 420,  rx: 155, ry: 220, isExpandedBlob: true },
      { cx: 1320, cy: 900,  rx: 165, ry: 150, isExpandedBlob: true }
    );

    mapObj.decos = (mapObj.decos || []).filter(function(d) { return !d.isHighlandElement; });
    mapObj.nodes = (mapObj.nodes || []).filter(function(n) { return !n.isHighlandOre; });
    mapObj.portals = (mapObj.portals || []).filter(function(p) { return !p.isCliffCavePortal; });

    mapObj.portals.push({
      id: "p_cliff_cave_" + mapObj.id, name: "山洞", x: 495, y: 948,
      targetZone: "grotto_" + mapObj.id, targetX: 240, targetY: 235, icon: "abyss", isCliffCavePortal: true
    });

    mapObj.decos.push(
      { id: "cliff_ladder_north_" + mapObj.id, x: 560, y: 800, sprite: rigged ? "rope_ladder" : "cliff_stake", w: 30, h: 38, solid: false, isHighlandElement: true, isCliffLadderSpot: true, ladderSide: "north", zoneId: mapObj.id },
      { id: "cliff_ladder_south_" + mapObj.id, x: 625, y: 940, sprite: rigged ? "rope_ladder" : "cliff_stake", w: 30, h: 46, solid: false, isHighlandElement: true, isCliffLadderSpot: true, ladderSide: "south", zoneId: mapObj.id },
      { id: "crypt_entrance_" + mapObj.id,     x: 935, y: 1015, sprite: cryptUnlocked ? "crypt_door_open" : "crypt_door_locked", w: 34, h: 34, solid: false, isHighlandElement: true, isCryptEntrance: true, zoneId: mapObj.id }
    );

    const plateauOres = cfg.ores.slice();
    if (mapObj.id === "zone5_volcano") {
      plateauOres[1] = findMatKeyByNameKeyword("龍鱗", "obsidian");
      plateauOres[2] = findMatKeyByNameKeyword("熔核", "starIron");
    }

    [{ x: 485, y: 845 }, { x: 655, y: 870 }, { x: 785, y: 940 }, { x: 785, y: 1015 }].forEach(function(pt, idx) {
      const giveKey = plateauOres[idx % plateauOres.length];
      const mInfo = matsDB[giveKey] || { name: giveKey };
      mapObj.nodes.push({
        id: "hl_ore_" + mapObj.id + "_" + idx + "_" + token,
        x: pt.x, y: pt.y, type: "crystal", giveKey: giveKey, reqTool: "pickaxe", reqToolLv: 0,
        perfect: true, isHighlandOre: true, isClusterBoulder: true, reqHighland: true, name: "高台" + mInfo.name, opened: false
      });
    });

    [
      { x: 265,  y: 625,  reqHighland: false },
      { x: 585,  y: 1045, reqHighland: false },
      { x: 565,  y: 865,  reqHighland: true  },
      { x: 1380, y: 620,  reqHighland: false }
    ].forEach(function(bpt, idx) {
      const permDigId = "dig_perm_" + mapObj.id + "_" + idx;
      if (s.dugSpots && s.dugSpots[permDigId]) return;
      mapObj.nodes.push({
        id: permDigId, x: bpt.x, y: bpt.y, type: "crystal", giveKey: "cryptKey", reqToolLv: 0,
        isHighlandOre: true, isBuriedSpot: true, reqHighland: bpt.reqHighland, name: "✖藏寶點", opened: false
      });
    });

    [
      { x: 150,  y: 690, key: "copperOre", type: "crystal" },
      { x: 310,  y: 710, key: "tinOre",    type: "crystal" },
      { x: 1240, y: 260, key: "quartz",    type: "crystal" },
      { x: 1380, y: 440, key: "coal",      type: "crystal" },
      { x: 1320, y: 760, key: "rockSalt",  type: "crystal" },
      { x: 1220, y: 960, key: "copperOre", type: "crystal" }
    ].forEach(function(ec, idx) {
      const mInfo = matsDB[ec.key] || { name: ec.key };
      mapObj.nodes.push({
        id: "exp_srpg_node_" + mapObj.id + "_" + idx + "_" + token,
        x: ec.x, y: ec.y, type: ec.type, giveKey: ec.key, reqTool: "pickaxe", reqToolLv: 0,
        perfect: false, isHighlandOre: true, isClusterBoulder: true, reqHighland: false, name: mInfo.name, opened: false
      });
    });

    injectExplorationPuzzlesIntoMap(mapObj);
    return mapObj;
  }

  // ================= 10. 章節因果鏈詳情視窗、全區放大地圖、【📖 求生合成圖鑑】與格仔工坊 =================
  const WorkshopUIManager = {
    curTab: "workshop",
    curSubFilter: "all",
    curCodexFilter: "all",
    selectedItemId: null,
    savedScrollTop: 0,
    currentFilteredMap: {},

    openZoneStoryChainModal: function() {
      const s = window.Aetheria.State.data;
      const prog = getZoneStoryProgress(s.currentZone, s);
      if (!prog) {
        this.openSurvivalCodexModal("all");
        return;
      }

      const c = prog.chain;
      window.Aetheria.UI.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = "🔒 " + c.title + " (" + prog.count + "/3)";

      const body = document.getElementById("modal-body");
      body.innerHTML =
        '<div class="sys-card-scroll" style="margin-bottom:8px;">' +
          '<b>🗣️ ' + c.npcName + '的緊急情報（主線必解）：</b>' +
          '<div style="font-size:12px; color:#5c3824; margin-top:3px;">「' + c.storyIntro + '」</div>' +
        '</div>' +
        '<div class="codex-card ' + (prog.step1Done ? 'owned' : '') + '">' +
          '<b style="color:' + (prog.step1Done ? '#5ac54f' : '#ffd166') + ';">' + (prog.step1Done ? '✅ 步驟① 已完成' : '🔒 步驟① (工具破障 - 必解)') + '</b>' +
          '<div style="font-size:12px; color:#ffffff; margin-top:3px;">' + c.step1Title + '</div>' +
        '</div>' +
        '<div class="codex-card ' + (prog.step2Done ? 'owned' : '') + '">' +
          '<b style="color:' + (prog.step2Done ? '#5ac54f' : '#ffd166') + ';">' + (prog.step2Done ? '✅ 步驟② 已完成' : '🔒 步驟② (古碑機關 - 必解)') + '</b>' +
          '<div style="font-size:12px; color:#ffffff; margin-top:3px;">' + c.step2Title + '</div>' +
        '</div>' +
        '<div class="codex-card ' + (prog.step3Done ? 'owned' : '') + '">' +
          '<b style="color:' + (prog.step3Done ? '#5ac54f' : '#ffd166') + ';">' + (prog.step3Done ? ('✅ 步驟③ 已取得' + c.relicName) : ('🔒 步驟③ (取得' + c.relicName + '解鎖修橋與首領戰)')) + '</b>' +
          '<div style="font-size:12px; color:#ffffff; margin-top:3px;">' + c.step3Title + '</div>' +
        '</div>' +
        '<div style="display:flex; gap:6px; margin-top:10px;">' +
          '<button class="na-btn highlight" style="flex:1; padding:8px;" onclick="Aetheria.UI.openForgeModal(\'workshop\')">🔨 打開隨身工坊打造工具</button>' +
          '<button class="na-btn" style="flex:1; padding:8px;" onclick="Aetheria.HighlandsWorkshop.openFullZoneMapModal()">🗺️ 查看全區全貌地圖</button>' +
        '</div>';
    },

    openSurvivalCodexModal: function(catFilter) {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;

      if (catFilter) this.curCodexFilter = catFilter;
      const curCat = this.curCodexFilter || "all";

      window.Aetheria.UI.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML =
        "📖 艾瑟瑞亞求生合成圖鑑 (材料 / 配方 / 途徑 / 用途)";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const cats = [
        { id: "all",    label: "全部(" + SURVIVAL_CODEX_DATABASE.length + ")" },
        { id: "puzzle", label: "🧗解謎工具" },
        { id: "basic",  label: "🪨基礎/高台" },
        { id: "tiered", label: "⛏️階級素材" },
        { id: "smelt",  label: "🔥冶煉/任務" },
        { id: "food",   label: "🍖料理/藥水" },
        { id: "tools",  label: "🌪️工具質變" }
      ];

      let filterHtml = '<div class="wk-subfilter-bar" style="margin-bottom:8px;">';
      cats.forEach(function(c) {
        const cls = "wk-filter-pill" + (curCat === c.id ? " active" : "");
        filterHtml += '<button class="' + cls + '" onclick="Aetheria.HighlandsWorkshop.openSurvivalCodexModal(\'' + c.id + '\')">' + c.label + '</button>';
      });
      filterHtml += '</div>';

      const navHtml =
        '<div style="display:flex; gap:6px; margin-bottom:8px;">' +
          '<button class="na-btn highlight" style="flex:1; padding:5px; font-size:11.5px;" onclick="Aetheria.UI.openForgeModal(\'workshop\')">🔨 前往隨身工坊合成</button>' +
          '<button class="na-btn" style="flex:1; padding:5px; font-size:11.5px;" onclick="Aetheria.HighlandsWorkshop.openZoneStoryChainModal()">🔒 本區主線破障流程</button>' +
        '</div>';

      let cardsHtml = "";

      if (curCat === "tools") {
        ["axe", "pickaxe", "shovel", "rod", "hook", "pouch"].forEach(function(tk) {
          const tDef = BUILTIN_TOOLS_DB[tk];
          const curLv = (s.tools && s.tools[tk]) || 0;
          let tiersText = "";
          Object.keys(tDef.tiers).forEach(function(lvKey) {
            if (lvKey === "0") return;
            const tr = tDef.tiers[lvKey];
            const unlocked = curLv >= Number(lvKey);
            tiersText +=
              '<div style="font-size:11px; margin-top:3px; color:' + (unlocked ? '#5ac54f' : '#cbd5e1') + ';">' +
                (unlocked ? '✓ ' : '○ ') + '<b>' + tr.name + '</b>：' + tr.desc +
              '</div>';
          });
          cardsHtml +=
            '<div class="codex-card ' + (curLv > 0 ? 'owned' : '') + '">' +
              '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<b style="color:#ffd166; font-size:13px;">' + S.iconHtml(tDef.iconKey, true) + tDef.name + '</b>' +
                '<span class="codex-tag">當前 Lv.' + curLv + '</span>' +
              '</div>' +
              tiersText +
            '</div>';
        });
      } else {
        const list = SURVIVAL_CODEX_DATABASE.filter(function(item) {
          return curCat === "all" || item.cat === curCat;
        });

        list.forEach(function(item) {
          const ownedCnt = (s.inventory && s.inventory[item.key]) || 0;
          cardsHtml +=
            '<div class="codex-card ' + (ownedCnt > 0 ? 'owned' : '') + '">' +
              '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<b style="color:#ffd166; font-size:13px;">' + S.iconHtml(item.icon, true) + item.name + '</b>' +
                '<span class="codex-tag" style="color:' + (ownedCnt > 0 ? '#5ac54f' : '#cbd5e1') + ';">持有：' + ownedCnt + '</span>' +
              '</div>' +
              '<div style="font-size:11px; color:#8ce0ff; margin-top:3px;">📍 <b>獲取途徑</b>：' + item.source + '</div>' +
              '<div style="font-size:11px; color:#e2e8f0; margin-top:2px;">⚙️ <b>合成與用途</b>：' + item.use + '</div>' +
            '</div>';
        });
      }

      body.innerHTML = navHtml + filterHtml + '<div>' + cardsHtml + '</div>';
    },

    openFullZoneMapModal: function() {
      const s = window.Aetheria.State.data;
      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
      if (!mapObj) return;

      ensureActiveTerrainCanvas(mapObj);

      window.Aetheria.UI.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML =
        "🧭 【" + (mapObj.name || "當前區域") + "】全區全貌探索地圖";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const prog = getZoneStoryProgress(mapObj.id, s);
      if (prog) {
        const chainBanner = document.createElement("div");
        chainBanner.className = "codex-card " + (prog.allDone ? "owned" : "");
        chainBanner.style.marginBottom = "6px";
        chainBanner.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<b style="color:#ffd166; font-size:12px;">🔒 ' + prog.chain.title + ' (' + prog.count + '/3)</b>' +
            '<button class="na-btn" style="padding:2px 8px; font-size:10.5px;" onclick="Aetheria.HighlandsWorkshop.openZoneStoryChainModal()">必解詳情</button>' +
          '</div>' +
          '<div style="font-size:11px; color:#cbd5e1; margin-top:2px;">' +
            (!prog.step1Done ? prog.chain.step1Title : (!prog.step2Done ? prog.chain.step2Title : prog.chain.step3Title)) +
          '</div>';
        body.appendChild(chainBanner);
      }

      const wrap = document.createElement("div");
      wrap.className = "fullmap-stage-wrap";
      const canvas = document.createElement("canvas");
      canvas.id = "srpg-fullmap-canvas";

      const W = mapObj.width || 1200;
      const H = mapObj.height || 680;
      const outW = 480;
      const outH = Math.round(outW * (H / W));
      canvas.width = outW;
      canvas.height = outH;
      wrap.appendChild(canvas);
      body.appendChild(wrap);

      const ctx = canvas.getContext("2d");
      const scaleX = outW / W;
      const scaleY = outH / H;

      ctx.fillStyle = "#16427d";
      ctx.fillRect(0, 0, outW, outH);

      if (mapObj.id !== "ocean_sea") {
        ctx.save();
        ctx.scale(scaleX, scaleY);
        paintTerrainOntoContext(ctx, mapObj, W, H, isMapBridgeBuilt(mapObj, s));
        ctx.restore();
      } else {
        (mapObj.dirtBlobs || []).forEach(function(b) {
          ctx.fillStyle = "#e6c88c";
          ctx.beginPath(); ctx.arc((b.cx || 0) * scaleX, (b.cy || 0) * scaleY, (b.rx || 80) * scaleX, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#599140";
          ctx.beginPath(); ctx.arc((b.cx || 0) * scaleX, (b.cy || 0) * scaleY, (b.rx || 80) * scaleX * 0.68, 0, Math.PI * 2); ctx.fill();
        });
      }

      ctx.fillStyle = "#264e22";
      (mapObj.trees || []).forEach(function(t) {
        ctx.fillRect(t.x * scaleX - 2, t.y * scaleY - 2, 4, 4);
      });

      const pCfg = ZONE_EXPLORE_PUZZLES[mapObj.id];
      const gList = ZONE_TOOL_GATE_OBSTACLES[mapObj.id];
      if (pCfg && gList && gList[0]) {
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "#ffd166";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(gList[0].x * scaleX, gList[0].y * scaleY);
        ctx.lineTo(pCfg.cx * scaleX, pCfg.cy * scaleY);
        ctx.stroke();
        ctx.restore();
      }

      (mapObj.portals || []).forEach(function(p) {
        const px = p.x * scaleX, py = p.y * scaleY;
        ctx.fillStyle = p.isCliffCavePortal ? "#09060a" : "#38b6ff";
        ctx.fillRect(px - 5, py - 5, 10, 10);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px - 5, py - 5, 10, 10);
      });

      (mapObj.decos || []).forEach(function(d) {
        const dx = d.x * scaleX, dy = d.y * scaleY;
        if (d.isCryptEntrance) {
          ctx.fillStyle = "#9d4edd";
          ctx.fillRect(dx - 5, dy - 5, 10, 10);
          ctx.strokeStyle = "#ffd166";
          ctx.strokeRect(dx - 5, dy - 5, 10, 10);
        } else if (d.isExplorePuzzleTablet) {
          ctx.fillStyle = "#38b6ff";
          ctx.beginPath(); ctx.arc(dx, dy, 6, 0, Math.PI * 2); ctx.fill();
        }
      });

      (mapObj.nodes || []).forEach(function(n) {
        if (n.opened) return;
        const nx = n.x * scaleX, ny = n.y * scaleY;
        if (n.isBuriedSpot && !(s.dugSpots && s.dugSpots[n.id])) {
          drawTreasureXMarkerOnCanvas(ctx, nx, ny, 7.5);
        } else if (n.isToolGateObstacle && !(s.clearedToolGates && s.clearedToolGates[n.id])) {
          ctx.fillStyle = "#ff758f";
          ctx.beginPath(); ctx.arc(nx, ny, 6.5, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "#141013"; ctx.lineWidth = 1.5; ctx.stroke();
        } else if (n.type === "chest") {
          ctx.fillStyle = "#f5b700";
          ctx.fillRect(nx - 4.5, ny - 4.5, 9, 9);
          ctx.strokeStyle = "#141013";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(nx - 4.5, ny - 4.5, 9, 9);
        }
      });

      (mapObj.monsters || []).forEach(function(m) {
        if (m.alive === false || !m.isBoss) return;
        const mx = m.x * scaleX, my = m.y * scaleY;
        ctx.beginPath(); ctx.arc(mx, my, 7.5, 0, Math.PI * 2);
        ctx.fillStyle = "#e03c4b"; ctx.fill();
        ctx.strokeStyle = "#ffd166"; ctx.lineWidth = 2; ctx.stroke();
      });

      const hx = (s.heroX || 300) * scaleX, hy = (s.heroY || 240) * scaleY;
      ctx.beginPath(); ctx.arc(hx, hy, 7.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(56, 182, 255, 0.45)"; ctx.fill();
      ctx.beginPath(); ctx.arc(hx, hy, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff"; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = "#141013"; ctx.stroke();

      const legend = document.createElement("div");
      legend.className = "fullmap-legend-bar";
      legend.innerHTML =
        '<span>⚪ <b>你的位置</b></span>' +
        '<span>🩷 <b>步驟①工具破障點</b></span>' +
        '<span>🟨 <b>步驟②古碑機關陣</b></span>' +
        '<span><b style="color:#e03c4b; background:#ffd166; padding:0 3px; border-radius:50%;">✖</b> <b>唯一挖寶點</b></span>' +
        '<span>🟪 <b>地底遺跡門</b></span>' +
        '<span>🔴 <b>區域首領(需破障)</b></span>';
      body.appendChild(legend);

      canvas.onclick = function(ev) {
        const rect = canvas.getBoundingClientRect();
        const clickX = Math.round(((ev.clientX - rect.left) / rect.width) * W);
        const clickY = Math.round(((ev.clientY - rect.top) / rect.height) * H);
        window.Aetheria.UI.showToast("🧭 地圖座標 (" + clickX + ", " + clickY + ")｜必須先完成「🩷步驟① ➔ 🟨步驟② ➔ 🏆開箱」才可修橋及挑戰 🔴首領！");
      };
    },

    canAffordRecipe: function(s, costMap, goldCost) {
      if (goldCost && (s.gold || 0) < goldCost) return false;
      if (!costMap) return true;
      return Object.entries(costMap).every(function(entry) {
        return ((s.inventory && s.inventory[entry[0]]) || 0) >= entry[1];
      });
    },

    getRecipeSubCategory: function(rec) {
      if (rec.category) return rec.category;
      const id = String(rec.id || "");
      if (id.indexOf("torch") !== -1 || id.indexOf("bomb") !== -1 || id.indexOf("ladder") !== -1 || id.indexOf("lantern") !== -1 || id.indexOf("key") !== -1) return "explore";
      if (id.indexOf("ration") !== -1 || id.indexOf("heal") !== -1 || id.indexOf("hint") !== -1 || id.indexOf("jerky") !== -1 || id.indexOf("stew") !== -1) return "survival";
      return "smelt";
    },

    switchTab: function(tabId) {
      if (window.Aetheria.Audio && window.Aetheria.Audio.sfxTalkBlip) window.Aetheria.Audio.sfxTalkBlip();
      if (tabId === "codex") {
        this.openSurvivalCodexModal("all");
        return;
      }
      this.curTab = tabId; this.curSubFilter = "all"; this.selectedItemId = null; this.savedScrollTop = 0;
      this.renderGridWorkshopModal(tabId);
    },

    switchFilter: function(filterId) {
      if (window.Aetheria.Audio && window.Aetheria.Audio.sfxTalkBlip) window.Aetheria.Audio.sfxTalkBlip();
      this.curSubFilter = filterId; this.selectedItemId = null; this.savedScrollTop = 0;
      this.renderGridWorkshopModal(this.curTab);
    },

    selectItem: function(uid) {
      if (window.Aetheria.Audio && window.Aetheria.Audio.sfxTalkBlip) window.Aetheria.Audio.sfxTalkBlip();
      const body = document.getElementById("modal-body");
      if (body) this.savedScrollTop = body.scrollTop;
      this.selectedItemId = uid;
      this.renderGridWorkshopModal(this.curTab);
    },

    craftOrAct: function(uid) {
      const targetUid = uid || this.selectedItemId;
      const item = this.currentFilteredMap[targetUid];
      if (!item) return;
      this.selectedItemId = targetUid;
      this.executePrimaryItemAction(item);
    },

    executeCraftRecipe: function(rec) {
      const s = window.Aetheria.State.data;
      if (!rec) return;
      const outKey = rec.toKey || rec.giveKey || rec.outKey;
      if (rec.isUniqueGear && (s.inventory[outKey] || 0) >= 1) {
        window.Aetheria.UI.showToast("✨ 你已經擁有此永久解謎工具【" + rec.name + "】！");
        return;
      }
      if (!this.canAffordRecipe(s, rec.cost, rec.goldCost || 0)) {
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.showToast("⚠️ 合成材料不足！請查看上方檢視盒中標示紅色的材料。");
        return;
      }
      Object.entries(rec.cost || {}).forEach(function(entry) {
        s.inventory[entry[0]] = Math.max(0, (s.inventory[entry[0]] || 0) - entry[1]);
      });
      if (rec.goldCost) s.gold = Math.max(0, (s.gold || 0) - rec.goldCost);
      const outCnt = rec.toCount || rec.count || rec.qty || 1;
      if (outKey) s.inventory[outKey] = (s.inventory[outKey] || 0) + outCnt;

      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      window.Aetheria.UI.updateAllHud();
      window.Aetheria.UI.showToast("🔨 合成成功！獲得【" + rec.name + "】！");
    },

    executePrimaryItemAction: function(selectedObj) {
      const s = window.Aetheria.State.data;
      const UI = window.Aetheria.UI;
      if (!selectedObj) return;
      const modalBody = document.getElementById("modal-body");
      if (modalBody) this.savedScrollTop = modalBody.scrollTop;

      if (selectedObj.itemType === "recipe") {
        this.executeCraftRecipe(selectedObj.raw);
        this.renderGridWorkshopModal(this.curTab);
        return;
      }
      if (selectedObj.itemType === "tool") {
        if (selectedObj.isMax) return;
        if (!selectedObj.canCraft) {
          window.Aetheria.Audio.sfxWrong();
          UI.showToast("⚠️ 升級此工具的材料或金幣不足！");
          return;
        }
        const tKey = selectedObj.toolKey;
        if (!s.tools) s.tools = { axe: 0, pickaxe: 0, shovel: 0, rod: 0, hook: 0, pouch: 0 };
        Object.entries(selectedObj.costMap || {}).forEach(function(entry) {
          s.inventory[entry[0]] = Math.max(0, (s.inventory[entry[0]] || 0) - entry[1]);
        });
        if (selectedObj.goldCost) s.gold = Math.max(0, (s.gold || 0) - selectedObj.goldCost);
        s.tools[tKey] = (s.tools[tKey] || 0) + 1;
        window.Aetheria.State.recalcMaxHp();
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.State.save();
        UI.updateAllHud();
        UI.showToast("⛏️ 工具升級成功！【" + selectedObj.shortName + "】已升至 Lv." + s.tools[tKey] + "！");
        this.renderGridWorkshopModal(this.curTab);
        return;
      }
      if (selectedObj.itemType === "weapon") {
        const wId = selectedObj.uid;
        if (selectedObj.unlocked) {
          s.equippedWeapon = wId;
          window.Aetheria.Audio.sfxGather();
          window.Aetheria.State.save();
          UI.updateAllHud();
          UI.showToast("⚔️ 已裝備武器：【" + selectedObj.shortName + "】！");
        } else {
          if (!selectedObj.canCraft) { window.Aetheria.Audio.sfxWrong(); UI.showToast("⚠️ 鍛造此武器的材料或金幣不足！"); return; }
          Object.entries(selectedObj.costMap || {}).forEach(function(entry) { s.inventory[entry[0]] -= entry[1]; });
          if (selectedObj.goldCost) s.gold -= selectedObj.goldCost;
          if (!s.unlockedWeapons) s.unlockedWeapons = [];
          if (s.unlockedWeapons.indexOf(wId) === -1) s.unlockedWeapons.push(wId);
          s.equippedWeapon = wId;
          window.Aetheria.Audio.sfxLevelUp();
          window.Aetheria.State.save();
          UI.updateAllHud();
          UI.showToast("⚔️ 武器鍛造成功並已自動裝備：【" + selectedObj.shortName + "】！");
        }
        this.renderGridWorkshopModal(this.curTab);
        return;
      }
      if (selectedObj.itemType === "armor") {
        const aId = selectedObj.uid;
        if (selectedObj.unlocked) {
          s.equippedArmor = aId;
          window.Aetheria.State.recalcMaxHp();
          window.Aetheria.Audio.sfxGather();
          window.Aetheria.State.save();
          UI.updateAllHud();
          UI.showToast("🛡️ 已穿戴防具：【" + selectedObj.shortName + "】！");
        } else {
          if (!selectedObj.canCraft) { window.Aetheria.Audio.sfxWrong(); UI.showToast("⚠️ 鍛造此防具的材料或金幣不足！"); return; }
          Object.entries(selectedObj.costMap || {}).forEach(function(entry) { s.inventory[entry[0]] -= entry[1]; });
          if (selectedObj.goldCost) s.gold -= selectedObj.goldCost;
          if (!s.unlockedArmors) s.unlockedArmors = [];
          if (s.unlockedArmors.indexOf(aId) === -1) s.unlockedArmors.push(aId);
          s.equippedArmor = aId;
          window.Aetheria.State.recalcMaxHp();
          s.hp = s.maxHp;
          window.Aetheria.Audio.sfxLevelUp();
          window.Aetheria.State.save();
          UI.updateAllHud();
          UI.showToast("🛡️ 防具鍛造成功並已穿戴：【" + selectedObj.shortName + "】！");
        }
        this.renderGridWorkshopModal(this.curTab);
        return;
      }
      if (selectedObj.itemType === "relic") {
        if (selectedObj.unlocked || !selectedObj.canCraft) return;
        Object.entries(selectedObj.costMap || {}).forEach(function(entry) { s.inventory[entry[0]] -= entry[1]; });
        if (selectedObj.goldCost) s.gold -= selectedObj.goldCost;
        if (!s.unlockedRelics) s.unlockedRelics = [];
        s.unlockedRelics.push(selectedObj.uid);
        window.Aetheria.State.recalcMaxHp();
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.State.save();
        UI.updateAllHud();
        UI.showToast("💎 遠古聖物共鳴成功：【" + selectedObj.shortName + "】永久生效！");
        this.renderGridWorkshopModal(this.curTab);
      }
    },

    useSrpgConsumable: function(matKey) {
      const s = window.Aetheria.State.data;
      if (!s.inventory || (s.inventory[matKey] || 0) <= 0) return;
      if (matKey === "rationJerky") {
        s.inventory.rationJerky--;
        window.Aetheria.State.restoreHunger(80, 90);
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.UI.showToast("🍖 食用【岩鹽風乾肉脯】：恢復 +80% 飽食度與 +90 HP！");
      } else if (matKey === "spicedStew") {
        s.inventory.spicedStew--;
        s.srpgBonusHp = (s.srpgBonusHp || 0) + 15;
        window.Aetheria.State.recalcMaxHp();
        window.Aetheria.State.restoreHunger(100, 150);
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.UI.showToast("🍲 享用【香辛海陸燉肉】：飽食全滿、HP +150，且永久最大生命值 +15！");
      }
      window.Aetheria.State.save();
      this.renderGridWorkshopModal(this.curTab);
      window.Aetheria.UI.updateAllHud();
    },

    buildMainTabBarHtml: function(activeTab) {
      const tabs = [
        { id: "workshop", label: "🔨加工" },
        { id: "tools",    label: "⛏️工具" },
        { id: "weapons",  label: "⚔️武器" },
        { id: "armors",   label: "🛡️防具" },
        { id: "reforge",  label: "✨洗煉" },
        { id: "codex",    label: "📖圖鑑" }
      ];
      let html = '<div style="display:grid; grid-template-columns:repeat(6, 1fr); gap:3px; margin-bottom:5px;">';
      tabs.forEach(function(t) {
        const cls = "na-btn" + (activeTab === t.id ? " highlight" : "");
        html += '<button class="' + cls + '" style="padding:5px 1px; font-size:11px;" onclick="Aetheria.HighlandsWorkshop.switchTab(\'' + t.id + '\')">' + t.label + '</button>';
      });
      html += '</div>';
      return html;
    },

    renderGridWorkshopModal: function(activeTab) {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const Data = window.Aetheria.Data;
      const UI = window.Aetheria.UI;
      const self = this;

      registerSrpgDataIntoGame();
      if (activeTab === "codex") {
        this.openSurvivalCodexModal("all");
        return;
      }
      if (activeTab) this.curTab = activeTab;
      const tab = this.curTab;

      UI.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML =
        S.iconHtml("icon_forge") + "巴爾隨身工坊與鍛造台 (💰 " + (s.gold || 0) + " G)";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      if (tab === "reforge" && window.Aetheria.Reforge && window.Aetheria.Reforge.renderReforgeTab) {
        const topWrap = document.createElement("div");
        topWrap.innerHTML = this.buildMainTabBarHtml("reforge");
        body.appendChild(topWrap.firstElementChild);
        window.Aetheria.Reforge.renderReforgeTab(body);
        return;
      }

      const itemsList = [];
      const matsDB = Data.MATERIALS || {};

      if (tab === "workshop") {
        const recipeMap = {}, seenNames = {};
        COMPLETE_WORKSHOP_RECIPES.concat(dynamicGuaranteedRecipes).forEach(function(r) {
          recipeMap[r.id] = r;
          seenNames[r.name] = true;
        });
        const rawWks = Array.isArray(Data.WORKSHOP_RECIPES)
          ? Data.WORKSHOP_RECIPES
          : (Data.WORKSHOP_RECIPES && typeof Data.WORKSHOP_RECIPES === "object" ? Object.values(Data.WORKSHOP_RECIPES) : []);
        rawWks.forEach(function(r, idx) {
          if (!r || !r.name) return;
          const rid = r.id || r.wkId || ("wk_legacy_" + idx);
          if (REMOVED_BLOAT_RECIPE_IDS.indexOf(rid) !== -1) return;
          r.id = rid;
          if (!recipeMap[rid] && !seenNames[r.name]) { recipeMap[rid] = r; seenNames[r.name] = true; }
        });

        Object.values(recipeMap).forEach(function(r) {
          const subCat = self.getRecipeSubCategory(r);
          const outKey = r.toKey || r.giveKey || r.outKey;
          const owned = (s.inventory && s.inventory[outKey]) || 0;
          const alreadyGotUnique = Boolean(r.isUniqueGear && owned >= 1);
          const canDo = !alreadyGotUnique && self.canAffordRecipe(s, r.cost, r.goldCost || 0);
          itemsList.push({
            uid: r.id, raw: r, itemType: "recipe", subCat: subCat, iconKey: "mat_" + outKey,
            shortName: r.name.replace(/\s*x\d+$/i, "").replace(/\s*\([^)]*\)/g, ""),
            fullName: r.name, badgeText: alreadyGotUnique ? "★已持有" : ("持有 " + owned),
            canCraft: canDo, unlocked: alreadyGotUnique,
            costMap: r.cost, goldCost: r.goldCost || 0, desc: r.desc || "工坊合成加工品。"
          });
        });
      } else if (tab === "tools") {
        ["axe", "pickaxe", "shovel", "rod", "hook", "pouch"].forEach(function(tKey) {
          const tDef = BUILTIN_TOOLS_DB[tKey] || (Data.TOOLS && Data.TOOLS[tKey]);
          if (!tDef) return;
          const curLv = (s.tools && s.tools[tKey]) || 0;
          const nextTier = tDef.tiers && tDef.tiers[curLv + 1];
          const curTierObj = (tDef.tiers && tDef.tiers[curLv]) || { name: tDef.name, desc: "" };
          const isMax = !nextTier;
          const canDo = !isMax && self.canAffordRecipe(s, nextTier.cost, nextTier.gold || 0);
          itemsList.push({
            uid: "tool_" + tKey, toolKey: tKey, itemType: "tool", subCat: "all", iconKey: tDef.iconKey || "icon_axe",
            shortName: tDef.name, fullName: tDef.name + " (當前：" + curTierObj.name + ")",
            badgeText: isMax ? "★滿級" : ("Lv." + curLv), canCraft: canDo, isMax: isMax,
            costMap: nextTier ? nextTier.cost : null, goldCost: nextTier ? (nextTier.gold || 0) : 0,
            desc: nextTier ? ("下一階【" + nextTier.name + "】：" + (nextTier.desc || "")) : ("已達最高階級！" + (curTierObj.desc || ""))
          });
        });
      } else if (tab === "weapons") {
        const seenWId = {}, seenWName = {};
        const wList = Object.values(Data.WEAPONS || {}).filter(function(w) {
          if (!w || !w.id || !w.name || REMOVED_DUPLICATE_WEAPON_IDS.indexOf(w.id) !== -1) return false;
          if (seenWId[w.id] || seenWName[w.name]) return false;
          seenWId[w.id] = true; seenWName[w.name] = true; return true;
        });
        wList.sort(function(a, b) { return (a.tier || 1) - (b.tier || 1); });
        wList.forEach(function(w) {
          const unlocked = Boolean(s.unlockedWeapons && s.unlockedWeapons.indexOf(w.id) !== -1);
          const equipped = (s.equippedWeapon === w.id);
          const canDo = !unlocked && self.canAffordRecipe(s, w.cost, w.gold || 0);
          itemsList.push({
            uid: w.id, raw: w, itemType: "weapon", subCat: (w.tier <= 4) ? "low" : "high", iconKey: "icon_sword",
            shortName: w.name, fullName: w.name + " (ATK +" + w.atk + ")",
            badgeText: equipped ? "已裝備" : (unlocked ? "已擁有" : ("T" + (w.tier || 1))),
            canCraft: canDo, unlocked: unlocked, equipped: equipped, costMap: w.cost, goldCost: w.gold || 0,
            desc: w.desc || ("基礎攻擊力 +" + w.atk)
          });
        });
      } else if (tab === "armors") {
        const seenAId = {}, seenAName = {};
        const aList = Object.values(Data.ARMORS || {}).filter(function(a) {
          if (!a || !a.id || !a.name || REMOVED_DUPLICATE_ARMOR_IDS.indexOf(a.id) !== -1) return false;
          if (seenAId[a.id] || seenAName[a.name]) return false;
          seenAId[a.id] = true; seenAName[a.name] = true; return true;
        });
        aList.sort(function(a, b) { return (a.tier || 1) - (b.tier || 1); });
        aList.forEach(function(a) {
          const unlocked = Boolean(s.unlockedArmors && s.unlockedArmors.indexOf(a.id) !== -1);
          const equipped = (s.equippedArmor === a.id);
          const canDo = !unlocked && self.canAffordRecipe(s, a.cost, a.gold || 0);
          itemsList.push({
            uid: a.id, raw: a, itemType: "armor", subCat: "armor", iconKey: "icon_shield",
            shortName: a.name, fullName: a.name + " (DEF +" + a.def + " / HP +" + (a.hp || 0) + ")",
            badgeText: equipped ? "穿戴中" : (unlocked ? "已擁有" : ("T" + (a.tier || 1))),
            canCraft: canDo, unlocked: unlocked, equipped: equipped, costMap: a.cost, goldCost: a.gold || 0,
            desc: a.desc || ("防禦力 +" + a.def + "，最大生命 +" + (a.hp || 0))
          });
        });
        const seenRId = {};
        Object.values(Data.RELICS || {}).forEach(function(rel) {
          if (!rel || !rel.id || seenRId[rel.id]) return;
          seenRId[rel.id] = true;
          const unlocked = Boolean(s.unlockedRelics && s.unlockedRelics.indexOf(rel.id) !== -1);
          const canDo = !unlocked && self.canAffordRecipe(s, rel.cost, rel.gold || 0);
          itemsList.push({
            uid: rel.id, raw: rel, itemType: "relic", subCat: "relic", iconKey: "crystal",
            shortName: rel.name, fullName: "【聖物】" + rel.name, badgeText: unlocked ? "★已共鳴" : "聖物",
            canCraft: canDo, unlocked: unlocked, costMap: rel.cost, goldCost: rel.gold || 0,
            desc: rel.desc || "永久被動聖物加成。"
          });
        });
      }

      let subFilters = [];
      if (tab === "workshop") {
        subFilters = [
          { id: "all", label: "全部(" + itemsList.length + ")" }, { id: "can", label: "✅可製作" },
          { id: "explore", label: "🧗解謎工具/開路" }, { id: "smelt", label: "🔥冶煉/建材" }, { id: "survival", label: "🍖料理/補給" }
        ];
      } else if (tab === "weapons") {
        subFilters = [
          { id: "all", label: "全部武器(" + itemsList.length + ")" }, { id: "can", label: "✅可鍛造/已擁有" },
          { id: "low", label: "T1~T4 初中階" }, { id: "high", label: "T5~T10 傳奇階" }
        ];
      } else if (tab === "armors") {
        subFilters = [
          { id: "all", label: "全部(" + itemsList.length + ")" }, { id: "armor", label: "🛡️防具護甲" }, { id: "relic", label: "💎遠古聖物" }
        ];
      }

      let filterBarHtml = "";
      if (subFilters.length > 0) {
        filterBarHtml = '<div class="wk-subfilter-bar">';
        subFilters.forEach(function(sf) {
          const cls = "wk-filter-pill" + (self.curSubFilter === sf.id ? " active" : "");
          filterBarHtml += '<button class="' + cls + '" onclick="Aetheria.HighlandsWorkshop.switchFilter(\'' + sf.id + '\')">' + sf.label + '</button>';
        });
        filterBarHtml += '</div>';
      }

      const filteredItems = itemsList.filter(function(item) {
        if (self.curSubFilter === "all") return true;
        if (self.curSubFilter === "can") return item.canCraft || item.unlocked;
        return item.subCat === self.curSubFilter;
      });

      this.currentFilteredMap = {};
      filteredItems.forEach(function(it) { self.currentFilteredMap[it.uid] = it; });

      if (!this.selectedItemId || !this.currentFilteredMap[this.selectedItemId]) {
        const firstCraftable = filteredItems.find(function(x) { return x.canCraft; });
        this.selectedItemId = firstCraftable ? firstCraftable.uid : (filteredItems[0] && filteredItems[0].uid);
      }

      const selectedObj = this.currentFilteredMap[this.selectedItemId] || filteredItems[0];

      let inspectorInnerHtml = "";
      if (selectedObj) {
        let chipsHtml = "";
        if (selectedObj.costMap && !selectedObj.unlocked && !selectedObj.isMax) {
          Object.entries(selectedObj.costMap).forEach(function(entry) {
            const mKey = entry[0], req = entry[1];
            const have = (s.inventory && s.inventory[mKey]) || 0;
            const mName = (matsDB[mKey] && matsDB[mKey].name) || mKey;
            const ok = have >= req;
            chipsHtml += '<span class="wk-mat-chip ' + (ok ? 'ok' : 'lack') + '">' + S.iconHtml("mat_" + mKey, true) + mName + ' ' + have + '/' + req + (ok ? ' ✓' : '') + '</span>';
          });
        }
        if (selectedObj.goldCost > 0 && !selectedObj.unlocked && !selectedObj.isMax) {
          const gOk = (s.gold || 0) >= selectedObj.goldCost;
          chipsHtml += '<span class="wk-mat-chip ' + (gOk ? 'ok' : 'lack') + '">💰 ' + selectedObj.goldCost + ' G</span>';
        }

        let actionBtnHtml = "";
        if (selectedObj.itemType === "recipe") {
          const outKey = selectedObj.raw.toKey || selectedObj.raw.giveKey;
          const canEatFood = (outKey === "rationJerky" || outKey === "spicedStew") && ((s.inventory && s.inventory[outKey]) || 0) > 0;
          if (selectedObj.unlocked) {
            actionBtnHtml = '<span style="color:#5ac54f; font-weight:900; white-space:nowrap;">★ 已持有</span>';
          } else {
            actionBtnHtml =
              '<div style="display:flex; flex-direction:column; gap:4px;">' +
                '<button class="na-btn ' + (selectedObj.canCraft ? 'highlight' : '') + '" style="padding:7px 12px; font-size:13px; white-space:nowrap;" onclick="Aetheria.HighlandsWorkshop.craftOrAct(\'' + selectedObj.uid + '\')">🔨 立即製作</button>' +
                (canEatFood ? '<button class="na-btn" style="padding:4px 8px; font-size:11px; border-color:#5ac54f; color:#5ac54f;" onclick="Aetheria.HighlandsWorkshop.useSrpgConsumable(\'' + outKey + '\')">🍖 立即食用</button>' : '') +
              '</div>';
          }
        } else if (selectedObj.itemType === "tool") {
          actionBtnHtml = selectedObj.isMax
            ? '<span style="color:#5ac54f; font-weight:900; white-space:nowrap;">★ 已滿級</span>'
            : '<button class="na-btn ' + (selectedObj.canCraft ? 'highlight' : '') + '" style="padding:7px 12px; white-space:nowrap;" onclick="Aetheria.HighlandsWorkshop.craftOrAct(\'' + selectedObj.uid + '\')">⛏️ 升級工具</button>';
        } else if (selectedObj.itemType === "weapon" || selectedObj.itemType === "armor") {
          if (selectedObj.equipped) actionBtnHtml = '<span style="color:#ffd166; font-weight:900; white-space:nowrap;">✓ 裝備中</span>';
          else if (selectedObj.unlocked) actionBtnHtml = '<button class="na-btn highlight" style="padding:7px 12px; white-space:nowrap;" onclick="Aetheria.HighlandsWorkshop.craftOrAct(\'' + selectedObj.uid + '\')">⚡ 立即裝備</button>';
          else actionBtnHtml = '<button class="na-btn ' + (selectedObj.canCraft ? 'highlight' : '') + '" style="padding:7px 12px; white-space:nowrap;" onclick="Aetheria.HighlandsWorkshop.craftOrAct(\'' + selectedObj.uid + '\')">🔨 鍛造</button>';
        } else if (selectedObj.itemType === "relic") {
          actionBtnHtml = selectedObj.unlocked
            ? '<span style="color:#5ac54f; font-weight:900;">★ 生效中</span>'
            : '<button class="na-btn ' + (selectedObj.canCraft ? 'highlight' : '') + '" style="padding:7px 12px; white-space:nowrap;" onclick="Aetheria.HighlandsWorkshop.craftOrAct(\'' + selectedObj.uid + '\')">💎 合成聖物</button>';
        }

        inspectorInnerHtml =
          '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">' +
            '<div style="flex:1;">' +
              '<div style="font-size:13.5px; font-weight:900; color:#ffd166;">' + S.iconHtml(selectedObj.iconKey, true) + selectedObj.fullName + '</div>' +
              '<div style="font-size:11px; color:#cbd5e1; margin-top:2px; line-height:1.3;">' + selectedObj.desc + '</div>' +
              (chipsHtml ? '<div style="margin-top:4px;">' + chipsHtml + '</div>' : '') +
            '</div>' +
            actionBtnHtml +
          '</div>';
      } else {
        inspectorInnerHtml = '<div style="color:#94a3b8; font-size:12px; text-align:center;">此分類下暫無項目</div>';
      }

      let gridCellsHtml = "";
      filteredItems.forEach(function(item) {
        const isSel = (selectedObj && selectedObj.uid === item.uid);
        const cls = "wk-grid-cell" + (item.canCraft ? " can-craft" : "") + (isSel ? " selected" : "");
        const showQuickBtn = item.canCraft || (item.unlocked && !item.equipped && (item.itemType === "weapon" || item.itemType === "armor"));
        const quickBtnLabel = item.unlocked ? "⚡裝備" : (item.itemType === "tool" ? "⛏️升級" : "🔨製作");

        gridCellsHtml +=
          '<div class="' + cls + '" onclick="Aetheria.HighlandsWorkshop.selectItem(\'' + item.uid + '\')">' +
            (item.canCraft ? '<span class="wk-cell-craft-dot">●可做</span>' : '') +
            '<span class="wk-cell-badge">' + item.badgeText + '</span>' +
            '<div style="pointer-events:none;">' + S.iconHtml(item.iconKey) + '</div>' +
            '<div class="wk-cell-name">' + item.shortName + '</div>' +
            (showQuickBtn ? ('<button class="wk-cell-quick-btn" onclick="event.stopPropagation(); Aetheria.HighlandsWorkshop.craftOrAct(\'' + item.uid + '\')">' + quickBtnLabel + '</button>') : '') +
          '</div>';
      });

      body.innerHTML =
        '<div class="wk-top-control-panel">' +
          this.buildMainTabBarHtml(tab) +
          filterBarHtml +
          '<div class="wk-inspector-box" id="wk-inspector-box">' + inspectorInnerHtml + '</div>' +
        '</div>' +
        '<div class="wk-icon-grid">' + gridCellsHtml + '</div>';

      if (this.savedScrollTop > 0) body.scrollTop = this.savedScrollTop;
    }
  };

  window.Aetheria.HighlandsWorkshop = WorkshopUIManager;

  // ================= 11. 掛載系統（主線強制破障鎖定 + Boss 無敵結界彈開 + 橋樑通行） =================
  function hookSystemsForHighlandsAndWorkshop() {
    const St   = window.Aetheria.State;
    const Maps = window.Aetheria.Data && window.Aetheria.Data.Maps;
    const Exp  = window.Aetheria.Explore;
    const Ren  = window.Aetheria.Renderer;
    const Bat  = window.Aetheria.Battle;
    const UI   = window.Aetheria.UI;

    lockHintElementSetter();

    if (St && St.recalcMaxHp) {
      const origMaxHp = St.recalcMaxHp.bind(St);
      St.recalcMaxHp = function() {
        origMaxHp();
        if (this.data) {
          const pouchLv = (this.data.tools && this.data.tools.pouch) || 0;
          const pouchHp = (pouchLv >= 2) ? 70 : (pouchLv === 1) ? 30 : 0;
          this.data.maxHp += pouchHp + (this.data.srpgBonusHp || 0);
          if (this.data.hp > this.data.maxHp) this.data.hp = this.data.maxHp;
        }
      };
    }

    if (Maps && Maps.getMap) {
      const origGetMap = Maps.getMap.bind(Maps);
      Maps.getMap = function(zoneId) {
        if (zoneId && zoneId.indexOf("grotto_") === 0) {
          const pZone = zoneId.replace("grotto_", "");
          if (!grottoMapsCache[zoneId]) grottoMapsCache[zoneId] = buildCliffGrottoMap(pZone);
          return grottoMapsCache[zoneId];
        }
        if (zoneId && zoneId.indexOf("crypt_") === 0) {
          const cZone = zoneId.replace("crypt_", "");
          if (!cryptMapsCache[zoneId]) cryptMapsCache[zoneId] = buildAncientCryptMap(cZone);
          return cryptMapsCache[zoneId];
        }
        const m = origGetMap(zoneId);
        if (m) {
          if (m.id === "camp_hub") adjustCampTentsUpward(m);
          else if (HIGHLAND_ZONES[m.id]) injectHighlandCliffIntoMap(m);
        }
        return m;
      };

      const origRefresh = Maps.refreshAllResources.bind(Maps);
      Maps.refreshAllResources = function() {
        origRefresh();
        Object.keys(grottoMapsCache).forEach(function(k) { delete grottoMapsCache[k]; });
        Object.keys(cryptMapsCache).forEach(function(k) { delete cryptMapsCache[k]; });
        const camp = origGetMap("camp_hub");
        if (camp) { camp._campTentsAdjustedToken = null; adjustCampTentsUpward(camp); }
        Object.keys(HIGHLAND_ZONES).forEach(function(zId) {
          const m = origGetMap(zId);
          if (m) { m._highlandInjectedToken = null; injectHighlandCliffIntoMap(m); }
        });
      };
    }

    if (Exp) {
      const origUpdateStep = Exp.updateStep.bind(Exp);
      Exp.updateStep = function() {
        const s = window.Aetheria.State.data;
        const prevX = s.heroX, prevY = s.heroY, prevZone = s.currentZone;
        const curMap = window.Aetheria.Data && window.Aetheria.Data.Maps && window.Aetheria.Data.Maps.getMap(s.currentZone);

        // 僅當本區已修好橋（且已完成 3 步破障解謎或舊存檔已擊敗該區 Boss）時，才允許走過河道橋面
        const prog = curMap ? getZoneStoryProgress(curMap.id, s) : null;
        const canCrossBridge = Boolean(
          curMap && curMap.hasRiver && isMapBridgeBuilt(curMap, s) && (!prog || prog.allDone)
        );

        let bypassedRiverForBridge = false;
        if (canCrossBridge) {
          const bY = getMapBridgeY(curMap);
          if (s.heroY >= Math.min(195, bY - 55) && s.heroY <= Math.max(355, bY + 55)) {
            bypassedRiverForBridge = true;
            curMap.hasRiver = false;
          }
        }

        try {
          origUpdateStep();
        } finally {
          if (bypassedRiverForBridge && curMap) {
            curMap.hasRiver = true;
          }
        }

        if (s.currentZone !== prevZone || !HIGHLAND_ZONES[s.currentZone]) {
          s.onHighland = false;
          return;
        }
        if (s.onHighland) {
          if (!isInsideHighlandPlateau(s.heroX, s.heroY)) { s.heroX = prevX; s.heroY = prevY; }
        } else {
          if (isBlockedByCliffFromLowland(s.heroX, s.heroY)) { s.heroX = prevX; s.heroY = prevY; }
        }
      };

      if (Exp.updateMonstersAI) {
        const origAI = Exp.updateMonstersAI.bind(Exp);
        Exp.updateMonstersAI = function(mapObj, s) {
          const hasCliff = Boolean(mapObj && HIGHLAND_ZONES[mapObj.id]);
          const prevCoords = [];
          if (hasCliff && mapObj.monsters) {
            mapObj.monsters.forEach(function(m, idx) { prevCoords[idx] = { x: m.x, y: m.y }; });
          }
          origAI(mapObj, s);
          if (hasCliff && mapObj.monsters) {
            mapObj.monsters.forEach(function(m, idx) {
              if (!m || m.alive === false) return;
              if (isBlockedByCliffFromLowland(m.x, m.y)) {
                if (prevCoords[idx] && !isBlockedByCliffFromLowland(prevCoords[idx].x, prevCoords[idx].y)) {
                  m.x = prevCoords[idx].x; m.y = prevCoords[idx].y;
                } else {
                  m.x = 240; m.y = 720;
                }
                m.vx = -(m.vx || 0); m.vy = -(m.vy || 0);
              }
            });
          }
        };
      }

      const origInteract = Exp.interactNearby.bind(Exp);
      Exp.interactNearby = function() {
        const s = window.Aetheria.State.data;
        if (!s.solvedExplorePuzzles) s.solvedExplorePuzzles = {};
        const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
        const prog = mapObj ? getZoneStoryProgress(mapObj.id, s) : null;

        if (mapObj) {
          if (mapObj.id === "camp_hub" && mapObj.portals) {
            for (let pIdx = 0; pIdx < mapObj.portals.length; pIdx++) {
              const pt = mapObj.portals[pIdx];
              if (pt && (pt.targetZone === "tent_guild" || pt.targetZone === "tent_hero" || pt.targetZone === "tent_forge") &&
                  Math.hypot(s.heroX - pt.x, s.heroY - pt.y) < 38) {
                Exp.triggerPortal(pt);
                return;
              }
            }
          }

          const puzzleDone = isZoneExplorePuzzleSolved(mapObj, s);
          if (mapObj.nodes) {
            for (let nIdx = 0; nIdx < mapObj.nodes.length; nIdx++) {
              const nd = mapObj.nodes[nIdx];
              if (!nd || nd.opened) continue;
              if (nd.isExplorePuzzleChest && Math.hypot(s.heroX - nd.x, s.heroY - nd.y) < (puzzleDone ? 78 : 44)) {
                Exp.harvestNode(nd);
                return;
              }
              if (nd.isToolGateObstacle && Math.hypot(s.heroX - nd.x, s.heroY - nd.y) < 52) {
                Exp.harvestNode(nd);
                return;
              }
              if (nd.isCryptVaultChest && Math.hypot(s.heroX - nd.x, s.heroY - nd.y) < 56) {
                Exp.harvestNode(nd);
                return;
              }
            }
          }
        }

        if (mapObj && mapObj.decos) {
          for (let i = 0; i < mapObj.decos.length; i++) {
            const d = mapObj.decos[i];
            if (!d) continue;

            // ★ 強制鎖鑰1：若玩家未完成本區 3 步破障解謎 (!prog.allDone)，試圖修橋 (isProjectSite) 或點亮南北封印柱時，直接攔截並彈出破障流程面板！
            const isBridgeOrSealSite = Boolean(
              !d.isHighlandElement && (
                d.isProjectSite ||
                d.projectId ||
                d.isSealPillar ||
                (d.sprite && String(d.sprite).indexOf("seal_pillar") !== -1)
              )
            );
            if (isBridgeOrSealSite && prog && !prog.allDone && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 54) {
              window.Aetheria.Audio.sfxWrong();
              WorkshopUIManager.openZoneStoryChainModal();
              window.Aetheria.UI.showToast("🔒 【主線環境鎖死】" + prog.chain.storyIntro);
              return;
            }

            if (d.isExplorePuzzleTablet && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 44) {
              window.Aetheria.Audio.sfxTalkBlip();
              window.Aetheria.UI.showToast(d.riddleText || "古老的機關銘文。");
              return;
            }

            if ((d.isPuzzleOrderBrazier || d.isPuzzleRotateStatue || d.isPuzzleToggleLever) &&
                Math.hypot(s.heroX - d.x, s.heroY - d.y) < 44) {
              if (prog && !prog.step1Done && !isZoneExplorePuzzleSolved(mapObj, s)) {
                window.Aetheria.Audio.sfxWrong();
                WorkshopUIManager.openZoneStoryChainModal();
                window.Aetheria.UI.showToast("🔒 【步驟①尚未完成】地脈被阻斷！請先完成：" + prog.chain.step1Short);
                return;
              }
            }

            if (d.isPuzzleOrderBrazier && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 44) {
              if (isZoneExplorePuzzleSolved(mapObj, s)) {
                const pChest = (mapObj.nodes || []).find(function(n) { return n && n.isExplorePuzzleChest && !n.opened; });
                if (pChest) { Exp.harvestNode(pChest); return; }
                window.Aetheria.UI.showToast("✨ 此處四象火盆陣已解開並取得破障聖印！");
                return;
              }
              const nextOrder = (mapObj._brazierStep || 0) + 1;
              if (d.orderNum === nextOrder) {
                d.lit = true; d.sprite = "brazier_on"; mapObj._brazierStep = nextOrder;
                window.Aetheria.Audio.sfxGather();
                if (nextOrder >= 4) {
                  s.solvedExplorePuzzles[mapObj.id] = true;
                  window.Aetheria.State.save();
                  syncMainQuestTrackerWithStoryChain();
                  window.Aetheria.Audio.sfxLevelUp();
                  window.Aetheria.UI.spawnFloatingText("🔓步驟②完成・請開中央寶箱!", "#5ac54f", true);
                  window.Aetheria.UI.showToast("🎉 【主線破障 2/3 完成】四象聖火共鳴！請立即按 A 鍵開啟中央【古遺跡機關寶箱】取得" + (prog ? prog.chain.relicName : "破障聖印") + "！");
                } else {
                  window.Aetheria.UI.showToast("🔥 點燃【" + d.brazierLabel + "】(" + nextOrder + "/4)！請繼續點燃下一座！");
                }
              } else {
                mapObj._brazierStep = 0;
                (mapObj.decos || []).forEach(function(bd) { if (bd.isPuzzleOrderBrazier) { bd.lit = false; bd.sprite = "brazier_off"; } });
                window.Aetheria.Audio.sfxWrong();
                window.Aetheria.UI.showToast("⚠️ 點燃順序錯誤！聖火已全部熄滅重置，請先閱讀左上方的【📜古碑謎語】！");
              }
              return;
            }

            if (d.isPuzzleRotateStatue && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 44) {
              if (isZoneExplorePuzzleSolved(mapObj, s)) {
                const pChest = (mapObj.nodes || []).find(function(n) { return n && n.isExplorePuzzleChest && !n.opened; });
                if (pChest) { Exp.harvestNode(pChest); return; }
                window.Aetheria.UI.showToast("✨ 四方守衛石像已共鳴並取得破障聖印！");
                return;
              }
              d.curDir = ((d.curDir || 0) + 1) % 4;
              window.Aetheria.Audio.sfxGather();
              const allStatues = (mapObj.decos || []).filter(function(sd) { return sd.isPuzzleRotateStatue; });
              if (allStatues.length > 0 && allStatues.every(function(sd) { return sd.curDir === sd.targetDir; })) {
                s.solvedExplorePuzzles[mapObj.id] = true;
                window.Aetheria.State.save();
                syncMainQuestTrackerWithStoryChain();
                window.Aetheria.Audio.sfxLevelUp();
                window.Aetheria.UI.spawnFloatingText("🔓步驟②完成・請開中央寶箱!", "#5ac54f", true);
                window.Aetheria.UI.showToast("🎉 【主線破障 2/3 完成】四方石像共鳴！請立即按 A 鍵開啟中央【古遺跡機關寶箱】取得" + (prog ? prog.chain.relicName : "破障聖印") + "！");
              } else {
                window.Aetheria.UI.showToast("🗿 旋轉【" + d.statueName + "】朝向為：" + DIR_SYMBOLS[d.curDir]);
              }
              return;
            }

            if (d.isPuzzleToggleLever && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 44) {
              if (isZoneExplorePuzzleSolved(mapObj, s)) {
                const pChest = (mapObj.nodes || []).find(function(n) { return n && n.isExplorePuzzleChest && !n.opened; });
                if (pChest) { Exp.harvestNode(pChest); return; }
                window.Aetheria.UI.showToast("✨ 三連拉桿機關已解開並取得破障聖印！");
                return;
              }
              const allLevers = (mapObj.decos || []).filter(function(ld) { return ld.isPuzzleToggleLever; });
              const toggleTargets = (d.leverIdx === 0) ? [0, 1] : (d.leverIdx === 1) ? [0, 1, 2] : [1, 2];
              allLevers.forEach(function(ld) {
                if (toggleTargets.indexOf(ld.leverIdx) !== -1) {
                  ld.leverOn = !ld.leverOn;
                  ld.sprite = ld.leverOn ? "lever_on" : "lever_off";
                }
              });
              window.Aetheria.Audio.sfxGather();
              if (allLevers.length > 0 && allLevers.every(function(ld) { return ld.leverOn; })) {
                s.solvedExplorePuzzles[mapObj.id] = true;
                window.Aetheria.State.save();
                syncMainQuestTrackerWithStoryChain();
                window.Aetheria.Audio.sfxLevelUp();
                window.Aetheria.UI.spawnFloatingText("🔓步驟②完成・請開中央寶箱!", "#5ac54f", true);
                window.Aetheria.UI.showToast("🎉 【主線破障 2/3 完成】三座連動拉桿全部開啟！請立即按 A 鍵開啟中央【古遺跡機關寶箱】取得" + (prog ? prog.chain.relicName : "破障聖印") + "！");
              }
              return;
            }

            if (d.isCryptEntrance && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 62) {
              if (!s.unlockedCrypts) s.unlockedCrypts = {};
              const zId = d.zoneId || mapObj.id;
              if (!s.unlockedCrypts[zId]) {
                if ((s.inventory.cryptKey || 0) <= 0) {
                  window.Aetheria.Audio.sfxWrong();
                  window.Aetheria.UI.showToast("🔒 古老的地底遺跡石門緊閉！請點擊左下角【羅盤小地圖】查看紅 ✖ 位置，用【探險鐵鏟】挖出或於工坊鍛造【遠古遺跡鑰匙】！");
                  return;
                }
                s.inventory.cryptKey--;
                s.unlockedCrypts[zId] = true;
                d.sprite = "crypt_door_open";
                window.Aetheria.Audio.sfxLevelUp();
                window.Aetheria.UI.showToast("🗝️ 使用【遠古遺跡鑰匙】解開了封印！正在進入地底古老遺跡……");
              } else {
                window.Aetheria.Audio.sfxGather();
              }

              window.Aetheria.Data.Maps.getMap("crypt_" + zId);
              s.currentZone = "crypt_" + zId;
              s.onHighland = false;
              s.heroX = 280; s.heroY = 275; s.petX = 258; s.petY = 278;
              if (window.Aetheria.Renderer) {
                window.Aetheria.Renderer.builtZoneKey = null;
                window.Aetheria.Renderer.renderWorld();
              }
              if (window.Aetheria.Audio && window.Aetheria.Audio.playBgm) window.Aetheria.Audio.playBgm("cave");
              window.Aetheria.State.save();
              window.Aetheria.UI.updateAllHud();
              return;
            }

            if (d.isCliffLadderSpot && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 68) {
              if (!s.riggedCliffs) s.riggedCliffs = {};
              if (!s.riggedCliffs[mapObj.id]) {
                if ((s.inventory.ropeLadder || 0) <= 0) {
                  window.Aetheria.Audio.sfxWrong();
                  window.Aetheria.UI.showToast("🧗 陡峭的懸崖岩壁！請先在【工坊 ➔ 🔨加工】合成【攀岩繩梯 x1】(麻繩x1+原木x2) 架設！");
                  return;
                }
                s.inventory.ropeLadder--;
                s.riggedCliffs[mapObj.id] = true;
                (mapObj.decos || []).forEach(function(dc) { if (dc.isCliffLadderSpot) dc.sprite = "rope_ladder"; });
              }

              window.Aetheria.Audio.sfxGather();
              if (s.onHighland) {
                s.onHighland = false;
                s.heroX = d.x; s.heroY = (d.ladderSide === "north") ? 772 : 982;
                window.Aetheria.UI.showToast("🧗 順着攀岩繩梯爬下了平地！");
              } else {
                s.onHighland = true;
                s.heroX = d.x; s.heroY = (d.ladderSide === "north") ? 835 : 895;
                window.Aetheria.UI.showToast("🧗 順着攀岩繩梯爬上了【岩石高台礦區】！");
              }
              s.petX = s.heroX - 20; s.petY = s.heroY;
              window.Aetheria.State.save();
              window.Aetheria.UI.updateAllHud();
              return;
            }
          }
        }

        if (prog && !prog.allDone && mapObj && mapObj.npcs) {
          const nearNpc = mapObj.npcs.some(function(n) { return n && Math.hypot(s.heroX - n.x, s.heroY - n.y) < 52; });
          if (nearNpc) {
            setTimeout(function() {
              const nextStepTxt = !prog.step1Done ? prog.chain.step1Short : (!prog.step2Done ? prog.chain.step2Short : prog.chain.step3Short);
              window.Aetheria.UI.showToast("🗣️ " + prog.chain.npcName + "：『" + prog.chain.storyIntro + " 下一步：" + nextStepTxt + "』");
            }, 350);
          }
        }

        const brickKey = findMatKeyByNameKeyword("耐火磚", null);
        const beforeBrick = (brickKey && s.inventory) ? (s.inventory[brickKey] || 0) : 0;
        const wasVolcanoBridgeBuilt = Boolean(s.projectsBuilt && s.projectsBuilt.proj_z5_bridge);

        origInteract();

        if (brickKey && !wasVolcanoBridgeBuilt && s.projectsBuilt && s.projectsBuilt.proj_z5_bridge) {
          s.inventory[brickKey] = Math.max(beforeBrick, 3);
          window.Aetheria.State.save();
          window.Aetheria.UI.updateAllHud();
        }
      };

      const origHint = Exp.updateContextHint.bind(Exp);
      Exp.updateContextHint = function(mapObj, s) {
        lockHintElementSetter();
        const hintEl = document.getElementById("a-btn-hint");
        if (hintEl && mapObj) {
          if (mapObj.id === "camp_hub" && mapObj.portals) {
            for (let pIdx = 0; pIdx < mapObj.portals.length; pIdx++) {
              const pt = mapObj.portals[pIdx];
              if (pt && (pt.targetZone === "tent_guild" || pt.targetZone === "tent_hero" || pt.targetZone === "tent_forge") &&
                  Math.hypot(s.heroX - pt.x, s.heroY - pt.y) < 38) {
                setTextIfChanged(hintEl, "進入帳篷");
                return;
              }
            }
          }
          const puzzleDone = isZoneExplorePuzzleSolved(mapObj, s);
          if (mapObj.nodes) {
            for (let j = 0; j < mapObj.nodes.length; j++) {
              const n = mapObj.nodes[j];
              if (!n || n.opened) continue;
              if (n.isExplorePuzzleChest && Math.hypot(s.heroX - n.x, s.heroY - n.y) < (puzzleDone ? 78 : 44)) {
                setTextIfChanged(hintEl, "取破障聖印");
                return;
              }
              if (n.isToolGateObstacle && Math.hypot(s.heroX - n.x, s.heroY - n.y) < 52) {
                setTextIfChanged(hintEl, "工具破障");
                return;
              }
              if (n.isBuriedSpot && Math.hypot(s.heroX - n.x, s.heroY - n.y) < 42) {
                setTextIfChanged(hintEl, "鐵鏟挖寶");
                return;
              }
            }
          }
          if (mapObj.decos) {
            for (let i = 0; i < mapObj.decos.length; i++) {
              const d = mapObj.decos[i];
              if (!d) continue;
              if (d.isExplorePuzzleTablet && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 44) { setTextIfChanged(hintEl, "閱讀古碑"); return; }
              if (d.isPuzzleOrderBrazier && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 44)  { setTextIfChanged(hintEl, puzzleDone ? "取破障聖印" : "點燃火盆"); return; }
              if (d.isPuzzleRotateStatue && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 44)  { setTextIfChanged(hintEl, puzzleDone ? "取破障聖印" : "旋轉石像"); return; }
              if (d.isPuzzleToggleLever && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 44)   { setTextIfChanged(hintEl, puzzleDone ? "取破障聖印" : "扳動拉桿"); return; }
              if (d.isCryptEntrance && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 62) {
                const open = Boolean(s.unlockedCrypts && s.unlockedCrypts[d.zoneId || mapObj.id]);
                setTextIfChanged(hintEl, open ? "進入遺跡" : "鑰匙開鎖");
                return;
              }
              if (d.isCliffLadderSpot && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 68) {
                const rigged = Boolean(s.riggedCliffs && s.riggedCliffs[mapObj.id]);
                setTextIfChanged(hintEl, !rigged ? "架設繩梯" : (s.onHighland ? "爬下懸崖" : "爬上高台"));
                return;
              }
            }
          }
        }
        origHint(mapObj, s);
      };

      let isChainHarvesting = false;
      const origHarvest = Exp.harvestNode.bind(Exp);
      Exp.harvestNode = function(node) {
        const s = window.Aetheria.State.data;
        if (node && node.reqHighland && !s.onHighland) {
          window.Aetheria.Audio.sfxWrong();
          window.Aetheria.UI.showToast("🧗 此位置位於高台上！請先從懸崖邊的【🧗繩梯】爬上高台！");
          return;
        }

        if (node && node.isToolGateObstacle && node.gateCfg) {
          const g = node.gateCfg;
          if (!s.clearedToolGates) s.clearedToolGates = {};
          if (node.opened || s.clearedToolGates[node.id]) {
            node.opened = true;
            return;
          }

          const reqKey = g.reqKey;
          const matsDB = (window.Aetheria.Data && window.Aetheria.Data.MATERIALS) || {};
          const reqName = (matsDB[reqKey] && matsDB[reqKey].name) || reqKey;
          const haveCnt = (s.inventory && s.inventory[reqKey]) || 0;

          if (haveCnt <= 0) {
            window.Aetheria.Audio.sfxWrong();
            WorkshopUIManager.openZoneStoryChainModal();
            window.Aetheria.UI.showToast("🔒 【" + g.name + "】阻擋了地脈！請先在【工坊 ➔ 🧗解謎工具/開路】合成【" + reqName + "】前來破解！");
            return;
          }

          if (g.consume) {
            s.inventory[reqKey] = Math.max(0, haveCnt - 1);
          }

          node.opened = true;
          s.clearedToolGates[node.id] = true;
          spawnHarvestParticles(node.x, node.y, "#5ac54f");

          if (window.Aetheria.Renderer && window.Aetheria.Renderer.domPool && window.Aetheria.Renderer.domPool.nodes) {
            const domNode = window.Aetheria.Renderer.domPool.nodes[node.id];
            if (domNode && domNode.el) setDisplayIfChanged(domNode.el, "none");
          }

          s.gold = (s.gold || 0) + (g.rewardGold || 250);
          const rewardNames = [];
          Object.entries(g.rewardMats || {}).forEach(function(entry) {
            const mk = entry[0], mc = entry[1];
            s.inventory[mk] = (s.inventory[mk] || 0) + mc;
            const mn = (matsDB[mk] && matsDB[mk].name) || mk;
            rewardNames.push(mn + "+" + mc);
          });

          window.Aetheria.Audio.sfxLevelUp();
          window.Aetheria.State.save();
          syncMainQuestTrackerWithStoryChain();
          window.Aetheria.UI.updateAllHud();

          const chain = ZONE_STORY_CHAINS[s.currentZone];
          if (chain && chain.step1GateId === node.id) {
            window.Aetheria.UI.spawnFloatingText("🔓步驟①完成・地脈導通!", "#ffd166", true);
            window.Aetheria.UI.showToast("🔓 【主線破障 1/3 完成】使用【" + reqName + "】破除障礙！西南方【步驟②古碑機關陣】已導通！");
          } else {
            window.Aetheria.UI.showToast("🔓 使用【" + reqName + "】成功破解" + g.name.replace(/\[.*\]/, "") + "！獲 " + (g.rewardGold || 250) + "G、" + rewardNames.join("、") + "！");
          }
          return;
        }

        if (node && node.isExplorePuzzleChest) {
          const curMap = window.Aetheria.Data.Maps.getMap(s.currentZone);
          const prog = getZoneStoryProgress(s.currentZone, s);
          if ((prog && !prog.step1Done) || !isZoneExplorePuzzleSolved(curMap, s)) {
            window.Aetheria.Audio.sfxWrong();
            WorkshopUIManager.openZoneStoryChainModal();
            window.Aetheria.UI.showToast("🔒 機關寶箱被結界鎖定！請先依序完成【步驟①工具破障】與【步驟②古碑謎語機關】！");
            return;
          }
          if (!s.claimedExplorePuzzleChests) s.claimedExplorePuzzleChests = {};
          if (node.opened || s.claimedExplorePuzzleChests[node.zoneId]) {
            node.opened = true;
            window.Aetheria.UI.showToast("此古遺跡機關寶箱已經領取過了！");
            return;
          }
          node.opened = true;
          s.claimedExplorePuzzleChests[node.zoneId] = true;
          s.gold = (s.gold || 0) + 320;
          s.inventory.cryptKey = (s.inventory.cryptKey || 0) + 1;
          s.inventory.mithril = (s.inventory.mithril || 0) + 2;
          s.inventory.spicedStew = (s.inventory.spicedStew || 0) + 1;
          s.srpgBonusHp = (s.srpgBonusHp || 0) + 15;
          window.Aetheria.State.recalcMaxHp();

          window.Aetheria.Audio.sfxLevelUp();
          window.Aetheria.State.save();
          syncMainQuestTrackerWithStoryChain();
          window.Aetheria.UI.updateAllHud();

          const relicTitle = prog ? prog.chain.relicName : "【破障聖印】";
          window.Aetheria.UI.spawnFloatingText("🌟獲" + relicTitle + "!", "#ffd166", true);
          window.Aetheria.UI.showToast("🏆 【主線破障 3/3 大圓滿】獲得" + relicTitle + "！已解鎖過河修橋與封印柱，並粉碎首領的無敵結界！");
          return;
        }

        if (node) {
          const pColor = (node.type === "wood") ? "#5ac54f" : (node.isBuriedSpot ? "#d9a066" : "#8ce0ff");
          spawnHarvestParticles(node.x, node.y, pColor);
          if (window.Aetheria.Renderer && window.Aetheria.Renderer.domPool && window.Aetheria.Renderer.domPool.nodes) {
            const domItem = window.Aetheria.Renderer.domPool.nodes[node.id];
            if (domItem && domItem.el) {
              domItem.el.classList.remove("srpg-node-hit");
              void domItem.el.offsetWidth;
              domItem.el.classList.add("srpg-node-hit");
            }
          }
        }

        if (node && node.isBuriedSpot) {
          if (!s.dugSpots) s.dugSpots = {};
          if (node.opened || s.dugSpots[node.id]) {
            node.opened = true;
            window.Aetheria.UI.showToast("此藏寶點已經挖掘過了！");
            return;
          }
          const shovelLv = (s.tools && s.tools.shovel) || 0;
          if (shovelLv < 1) {
            window.Aetheria.Audio.sfxWrong();
            window.Aetheria.UI.showToast("🥄 地面有神秘的「✖」藏寶記號！請先在【工坊 ➔ ⛏️工具】打造【Lv.1 精鐵探險鏟】(原木x2+鐵礦x1) 挖掘！");
            return;
          }
          node.opened = true;
          s.dugSpots[node.id] = true;
          if (window.Aetheria.Renderer && window.Aetheria.Renderer.domPool && window.Aetheria.Renderer.domPool.nodes) {
            const domNode = window.Aetheria.Renderer.domPool.nodes[node.id];
            if (domNode && domNode.el) setDisplayIfChanged(domNode.el, "none");
          }
          window.Aetheria.Audio.sfxLevelUp();

          const zId = (s.currentZone || "").replace("grotto_", "");
          const cryptAlreadyOpen = Boolean(s.unlockedCrypts && s.unlockedCrypts[zId]);
          const hasKeyInBag = ((s.inventory && s.inventory.cryptKey) || 0) > 0;
          const goldGain = (65 + (s.lv || 1) * 6) * (shovelLv >= 2 ? 2 : 1);
          s.gold = (s.gold || 0) + goldGain;

          if (!cryptAlreadyOpen && !hasKeyInBag) {
            s.inventory.cryptKey = (s.inventory.cryptKey || 0) + 1;
            s.inventory.mithril = (s.inventory.mithril || 0) + 1;
            window.Aetheria.UI.showToast("🥄 挖開唯一藏寶點！獲得【🗝️遠古遺跡鑰匙 +1、流沙秘銀 +1】與 " + goldGain + " G！");
          } else {
            s.inventory.mithril = (s.inventory.mithril || 0) + (shovelLv >= 2 ? 2 : 1);
            s.inventory.quartz = (s.inventory.quartz || 0) + 2;
            s.inventory.ancientGear = (s.inventory.ancientGear || 0) + 1;
            if (shovelLv >= 3) s.inventory.starIron = (s.inventory.starIron || 0) + 1;
            window.Aetheria.UI.showToast("🥄 挖開唯一藏寶點：獲得【流沙秘銀、⚙️精密青銅齒輪 +1、石英砂 +2】與 " + goldGain + " G！");
          }
          window.Aetheria.State.save();
          window.Aetheria.UI.updateAllHud();
          return;
        }

        if (node && node.isCryptVaultChest) {
          const curMap = window.Aetheria.Data.Maps.getMap(s.currentZone);
          const guardianAlive = curMap && (curMap.monsters || []).some(function(m) {
            return m.isCryptGuardian && m.alive !== false;
          });
          if (guardianAlive) {
            window.Aetheria.Audio.sfxWrong();
            window.Aetheria.UI.showToast("⚔️ 遠古聖物石棺受結界保護！請先擊敗前方的【★地底遺跡守衛魔像】！");
            return;
          }
          if (!s.claimedCryptVaults) s.claimedCryptVaults = {};
          const pZone = node.parentZoneId || s.currentZone;
          if (node.opened || s.claimedCryptVaults[pZone]) {
            node.opened = true;
            window.Aetheria.UI.showToast("此遠古聖物石棺已經開啟過了！");
            return;
          }
          node.opened = true;
          s.claimedCryptVaults[pZone] = true;
          s.gold = (s.gold || 0) + 350;
          s.inventory.tabletShard = (s.inventory.tabletShard || 0) + 1;
          s.inventory.obsidian = (s.inventory.obsidian || 0) + 2;
          window.Aetheria.Audio.sfxLevelUp();
          window.Aetheria.State.save();
          window.Aetheria.UI.updateAllHud();
          window.Aetheria.UI.showToast("🏆 開啟遠古聖物石棺！獲【350G、古文明聖碑殘片x1、熔岩黑曜石x2】！");
          return;
        }

        const wasOpened = Boolean(node && node.opened);
        origHarvest(node);

        if (node && !wasOpened && node.opened && node.giveKey) {
          const gKey = node.giveKey;
          const toolType = node.reqTool || (node.type === "wood" ? "axe" : "pickaxe");
          const toolLv = (s.tools && s.tools[toolType]) || 0;

          if (node.type === "wood" && (s.inventory.briarSickle || 0) > 0) {
            s.inventory[gKey] = (s.inventory[gKey] || 0) + 1;
          }
          if ((s.inventory.magnifyingLens || 0) > 0 && Math.random() < 0.35) {
            const bonusGem = (Math.random() < 0.5) ? "quartz" : "copperOre";
            s.inventory[bonusGem] = (s.inventory[bonusGem] || 0) + 1;
          }
          if (toolLv >= 2 && Math.random() < 0.50) {
            s.inventory[gKey] = (s.inventory[gKey] || 0) + 1;
          }

          if (toolLv >= 3 && !isChainHarvesting) {
            isChainHarvesting = true;
            try {
              const curMap = window.Aetheria.Data.Maps.getMap(s.currentZone);
              let chainCnt = 0;
              if (curMap && curMap.nodes) {
                curMap.nodes.forEach(function(other) {
                  if (!other || other.opened || other.id === node.id) return;
                  if (other.type !== "wood" && other.type !== "crystal") return;
                  if (other.isBuriedSpot || other.isToolGateObstacle || other.isExplorePuzzleChest || other.isCryptVaultChest) return;
                  if (other.reqHighland && !s.onHighland) return;
                  const dist = Math.hypot(other.x - node.x, other.y - node.y);
                  if (dist <= 155 && other.giveKey) {
                    other.opened = true;
                    s.inventory[other.giveKey] = (s.inventory[other.giveKey] || 0) + 2;
                    spawnHarvestParticles(other.x, other.y, "#ffd166");
                    chainCnt++;
                  }
                });
              }
              if (chainCnt > 0) {
                window.Aetheria.UI.spawnFloatingText("🌪️連鎖震波採集 +" + chainCnt + "!", "#ffd166", true);
              }
            } finally {
              isChainHarvesting = false;
            }
          }

          window.Aetheria.State.save();
          window.Aetheria.UI.updateAllHud();
        }
      };
    }

    // ================= 12. ★ 強制鎖鑰2：守關 Boss 無敵結界彈開檢定 + 護盾減傷平衡 =================
    if (Bat) {
      if (Bat.startBattle) {
        const origStart = Bat.startBattle.bind(Bat);
        Bat.startBattle = function(mapMonsterNode, customMode, customQuestionId) {
          const s = window.Aetheria.State.data;
          const prog = getZoneStoryProgress(s.currentZone, s);

          // ★ 若觸碰的是區域守關首領 (isBoss && 非地底遺跡魔像)，且玩家尚未完成本區 3 步破障解謎 (!prog.allDone)：
          // 直接被【🛡️領主無敵結界】彈開，100% 拒絕進入戰鬥，並打開本區主線破障流程視窗！
          if (mapMonsterNode && mapMonsterNode.isBoss && !mapMonsterNode.isCryptGuardian && prog && !prog.allDone) {
            window.Aetheria.Audio.sfxWrong();
            s.heroX = Math.max(80, (mapMonsterNode.x || s.heroX) - 52);
            s.petX = s.heroX - 20;
            window.Aetheria.UI.spawnFloatingText("🛡️無敵結界彈開!(需先破障)", "#ff595e", true);
            WorkshopUIManager.openZoneStoryChainModal();
            window.Aetheria.UI.showToast("🛡️ 【" + mapMonsterNode.name + "】受環境無敵結界保護！必須先完成本區 3 步破障解謎取得" + prog.chain.relicName + "才可開戰！");
            return;
          }

          origStart(mapMonsterNode, customMode, customQuestionId);

          const e = this.enemy;
          if (!e || this.mode !== "combat") return;

          const heroAtk = (window.Aetheria.State.getTotalAtk ? window.Aetheria.State.getTotalAtk() : 80);
          const heroMaxHp = s.maxHp || 300;
          const monLv = e.lv || 1;
          const isElite = Boolean(mapMonsterNode && (mapMonsterNode.isCryptGuardian || mapMonsterNode.isVolcanoHelperSubBoss || mapMonsterNode.isShiny));

          if (e.isBoss) {
            const minBossHp = Math.round(heroAtk * 8.5 + monLv * 150);
            e.maxHp = Math.max(Math.round(e.maxHp * 2.8), minBossHp);
            e.maxShield = Math.max(4, (e.maxShield || 4) + 1);
            e.atk = Math.max(Math.round((e.atk || 35) * 1.40), Math.round(heroMaxHp * 0.20));
            e._enrageUsed = false;
            e.hp = e.maxHp;
            e.shield = e.maxShield;

            if (prog && prog.allDone) {
              setTimeout(function() {
                window.Aetheria.UI.spawnFloatingText("🌟" + prog.chain.relicName + "破除無敵!", "#5ac54f", true);
                window.Aetheria.UI.showToast(prog.chain.bossDebuffMsg);
              }, 350);
            }
          } else if (isElite) {
            const minEliteHp = Math.round(heroAtk * 5.0 + monLv * 90);
            e.maxHp = Math.max(Math.round(e.maxHp * 2.4), minEliteHp);
            e.hp = e.maxHp;
            e.maxShield = Math.max(4, (e.maxShield || 3) + 1);
            e.shield = e.maxShield;
            e.atk = Math.max(Math.round((e.atk || 25) * 1.3), Math.round(heroMaxHp * 0.16));
          } else if (monLv >= 8) {
            const minMobHp = Math.round(heroAtk * 2.3 + monLv * 45);
            e.maxHp = Math.max(Math.round(e.maxHp * 1.8), minMobHp);
            e.hp = e.maxHp;
            e.maxShield = Math.max(monLv >= 20 ? 3 : 2, e.maxShield || 2);
            e.shield = e.maxShield;
            e.atk = Math.max(Math.round((e.atk || 20) * 1.25), Math.round(heroMaxHp * 0.12));
          }

          let _internalHp = e.hp;
          try {
            Object.defineProperty(e, "hp", {
              get: function() { return _internalHp; },
              set: function(newVal) {
                if (newVal < _internalHp) {
                  const rawDmg = _internalHp - newVal;
                  if (this.shield > 0 && !this.broken) {
                    const mitigatedDmg = Math.max(1, Math.round(rawDmg * 0.45));
                    _internalHp = Math.max(this.isBoss ? 1 : 0, _internalHp - mitigatedDmg);
                    return;
                  }
                }
                _internalHp = Math.max(0, newVal);
              },
              configurable: true
            });
          } catch (err) {}

          if (this.updateBattleHUD) this.updateBattleHUD();
        };
      }

      if (Bat.executeEnemyCounterPhase) {
        const origCounter = Bat.executeEnemyCounterPhase.bind(Bat);
        Bat.executeEnemyCounterPhase = function(answeredRight) {
          const e = this.enemy;
          if (e && e.isBoss && !e._enrageUsed && e.hp > 0 && e.hp <= e.maxHp * 0.50) {
            e._enrageUsed = true;
            e.broken = false;
            e.shield = e.maxShield;
            const healAmt = Math.round(e.maxHp * 0.25);
            e.hp = Math.min(e.maxHp, e.hp + healAmt);
            e.atk = Math.round(e.atk * 1.22);
            window.Aetheria.Audio.sfxWrong();
            window.Aetheria.UI.spawnFloatingText("⚡領主狂暴・護盾重鑄!", "#ff595e", true);
            window.Aetheria.UI.showToast("⚡ 首領進入二階段狂暴！恢復 25% 生命並重鑄 " + e.maxShield + " 層護盾，請善用 BP 破盾！");
            if (this.updateBattleHUD) this.updateBattleHUD();
          }
          origCounter(answeredRight);
        };
      }

      if (Bat.winBattle) {
        const origWin = Bat.winBattle.bind(Bat);
        Bat.winBattle = function() {
          const isCombat = (this.mode === "combat");
          const ref = this.mapMonsterRef;
          origWin();
          if (isCombat) {
            const s = window.Aetheria.State.data;
            const z = String(s.currentZone || "");
            if (z.indexOf("zone3_coast") !== -1) {
              const clothKey = findMatKeyByNameKeyword("帆布", "sailCloth");
              const sirenKey = findMatKeyByNameKeyword("海妖", null);
              if ((s.inventory[clothKey] || 0) < 4) s.inventory[clothKey] = (s.inventory[clothKey] || 0) + 1;
              if (sirenKey && (s.inventory[sirenKey] || 0) < 1) s.inventory[sirenKey] = 1;
            } else if (z.indexOf("zone4_snow") !== -1) {
              const sinewKey = findMatKeyByNameKeyword("獸筋", "sinew");
              if ((s.inventory[sinewKey] || 0) < 4) s.inventory[sinewKey] = (s.inventory[sinewKey] || 0) + 1;
            } else if (z.indexOf("zone5_volcano") !== -1) {
              const scaleKey = findMatKeyByNameKeyword("龍鱗", null);
              const coreKey  = findMatKeyByNameKeyword("熔核", null);
              if (scaleKey && (s.inventory[scaleKey] || 0) < 3) s.inventory[scaleKey] = (s.inventory[scaleKey] || 0) + 1;
              if (coreKey && (s.inventory[coreKey] || 0) < 2)   s.inventory[coreKey]  = (s.inventory[coreKey] || 0) + 1;

              if (ref && (ref.isBoss || (ref.name && ref.name.indexOf("龍皇") !== -1))) {
                if (!s.bossesDefeated) s.bossesDefeated = {};
                s.bossesDefeated.zone5_volcano = true;
                const vMap = window.Aetheria.Data.Maps.getMap("zone5_volcano");
                if (vMap && vMap.monsters) {
                  vMap.monsters.forEach(function(m) { if (m && m.isBoss) m.alive = false; });
                }
              }
            }
            window.Aetheria.State.save();
            if (window.Aetheria.UI) window.Aetheria.UI.updateAllHud();
          }
        };
      }
    }

    if (Ren) {
      if (Ren.updateMinimap) {
        Ren.updateMinimap = function(mapObj, s) {
          renderCompassMinimap(mapObj, s, false);
        };
      }

      const origBuild = Ren.buildSceneDOM.bind(Ren);
      Ren.buildSceneDOM = function(mapObj) {
        if (mapObj) {
          if (mapObj.id === "camp_hub") adjustCampTentsUpward(mapObj);
          else if (HIGHLAND_ZONES[mapObj.id]) injectHighlandCliffIntoMap(mapObj);
        }
        origBuild(mapObj);

        mountGuaranteedCompassWidget();

        const terrainLayer = document.getElementById("world-terrain-layer");
        const S = window.Aetheria.Data.Sprites;
        if (!terrainLayer || !mapObj) return;

        renderKenneyNaturalTerrainCanvas(mapObj, terrainLayer);
        syncDomRiverBridge(mapObj, terrainLayer);

        Object.keys(this.domPool.decos || {}).forEach(function(k) {
          const item = Ren.domPool.decos[k];
          if (!item || !item.data || !item.el) return;
          const d = item.data;
          if ((d.isCliffLadderSpot || d.isCryptEntrance || d.isExplorePuzzleTablet ||
               d.isPuzzleOrderBrazier || d.isPuzzleRotateStatue || d.isPuzzleToggleLever) && !item.lbl) {
            const lbl = document.createElement("div");
            lbl.className = "dom-label";
            item.el.appendChild(lbl);
            item.lbl = lbl;
          }
        });

        Object.keys(this.domPool.nodes || {}).forEach(function(nId) {
          const item = Ren.domPool.nodes[nId];
          if (!item || !item.data || !S) return;
          if (item.data.isBuriedSpot) {
            item.el.innerHTML = '<img src="' + S.getDataURL("buried_x_spot") + '" alt="">';
            if (item.lbl) { item.lbl.className = "dom-label dig-spot-lbl"; item.el.appendChild(item.lbl); }
          } else if (item.data.isToolGateObstacle && item.data.gateSprite) {
            item.el.innerHTML = '<img src="' + S.getDataURL(item.data.gateSprite) + '" alt="">';
            if (item.lbl) { item.lbl.className = "dom-label tool-gate-lbl"; item.el.appendChild(item.lbl); }
          } else if (item.data.isClusterBoulder) {
            item.el.innerHTML = '<img src="' + S.getDataURL("cluster_boulder") + '" alt="">';
            if (item.lbl) item.el.appendChild(item.lbl);
          }
        });

        const s = window.Aetheria.State && window.Aetheria.State.data;
        if (s) renderCompassMinimap(mapObj, s, true);
      };

      const origRender = Ren.renderWorld.bind(Ren);
      Ren.renderWorld = function() {
        origRender();
        try {
          const s = window.Aetheria.State.data;
          const S = window.Aetheria.Data.Sprites;
          const mapObj = window.Aetheria.Data && window.Aetheria.Data.Maps && window.Aetheria.Data.Maps.getMap(s.currentZone);
          const rigged = Boolean(s && s.riggedCliffs && s.riggedCliffs[s.currentZone]);
          const cryptOpen = Boolean(s && s.unlockedCrypts && s.unlockedCrypts[s.currentZone]);

          if (mapObj) {
            renderCompassMinimap(mapObj, s, false);
          }

          Object.keys(this.domPool.decos || {}).forEach(function(k) {
            const item = Ren.domPool.decos[k];
            if (!item || !item.data) return;
            const d = item.data;

            if (d.isCliffLadderSpot) {
              const sprKey = rigged ? "rope_ladder" : "cliff_stake";
              if (item.img && S && item.img._lastSpr !== sprKey) {
                item.img._lastSpr = sprKey;
                item.img.src = S.getDataURL(sprKey);
              }
              if (item.lbl) {
                setDisplayIfChanged(item.lbl, "block");
                setClassIfChanged(item.lbl, "dom-label ladder-spot-lbl");
                setTextIfChanged(item.lbl, rigged ? (s.onHighland ? "🧗爬下懸崖" : "🧗爬上高台") : "🧗架設繩梯");
              }
            } else if (d.isCryptEntrance) {
              const sprKey = cryptOpen ? "crypt_door_open" : "crypt_door_locked";
              if (item.img && S && item.img._lastSpr !== sprKey) {
                item.img._lastSpr = sprKey;
                item.img.src = S.getDataURL(sprKey);
              }
              if (item.lbl) {
                setDisplayIfChanged(item.lbl, "block");
                setClassIfChanged(item.lbl, "dom-label crypt-door-lbl");
                setTextIfChanged(item.lbl, cryptOpen ? "🏛️地底遺跡(已開)" : "🔒地底遺跡[需鑰匙]");
              }
            } else if (d.isExplorePuzzleTablet && item.lbl) {
              setDisplayIfChanged(item.lbl, "block");
              setClassIfChanged(item.lbl, "dom-label puzzle-mech-lbl");
              setTextIfChanged(item.lbl, "📜古碑謎語[步驟②]");
            } else if (d.isPuzzleOrderBrazier) {
              const sprKey = d.lit ? "brazier_on" : "brazier_off";
              if (item.img && S && item.img._lastSpr !== sprKey) {
                item.img._lastSpr = sprKey;
                item.img.src = S.getDataURL(sprKey);
              }
              if (item.lbl) {
                setDisplayIfChanged(item.lbl, "block");
                setClassIfChanged(item.lbl, "dom-label " + (d.lit ? "puzzle-mech-on" : "puzzle-mech-lbl"));
                setTextIfChanged(item.lbl, (d.lit ? "🔥" : "") + d.brazierLabel);
              }
            } else if (d.isPuzzleRotateStatue) {
              if (item.img && S && item.img._lastSpr !== "ancient_statue") {
                item.img._lastSpr = "ancient_statue";
                item.img.src = S.getDataURL("ancient_statue");
              }
              if (item.lbl) {
                const matched = (d.curDir === d.targetDir);
                setDisplayIfChanged(item.lbl, "block");
                setClassIfChanged(item.lbl, "dom-label " + (matched ? "puzzle-mech-on" : "puzzle-mech-lbl"));
                setTextIfChanged(item.lbl, d.statueName + ":" + DIR_SYMBOLS[d.curDir || 0]);
              }
            } else if (d.isPuzzleToggleLever) {
              const sprKey = d.leverOn ? "lever_on" : "lever_off";
              if (item.img && S && item.img._lastSpr !== sprKey) {
                item.img._lastSpr = sprKey;
                item.img.src = S.getDataURL(sprKey);
              }
              if (item.lbl) {
                setDisplayIfChanged(item.lbl, "block");
                setClassIfChanged(item.lbl, "dom-label " + (d.leverOn ? "puzzle-mech-on" : "puzzle-mech-lbl"));
                setTextIfChanged(item.lbl, "拉桿" + (d.leverIdx + 1) + (d.leverOn ? "[🟢開]" : "[🔴關]"));
              }
            }
          });

          Object.keys(this.domPool.nodes || {}).forEach(function(nId) {
            const item = Ren.domPool.nodes[nId];
            if (!item || !item.data || !item.lbl) return;
            const n = item.data;
            if (n.opened ||
                (n.isBuriedSpot && s.dugSpots && s.dugSpots[n.id]) ||
                (n.isToolGateObstacle && s.clearedToolGates && s.clearedToolGates[n.id])) {
              setDisplayIfChanged(item.el, "none");
              setDisplayIfChanged(item.lbl, "none");
              return;
            }
            if (n.type === "chest") return;
            const dist = Math.hypot((s.heroX || 0) - n.x, (s.heroY || 0) - n.y);
            const showRadius = (n.isBuriedSpot || n.isToolGateObstacle) ? 105 : 62;
            setDisplayIfChanged(item.lbl, (dist < showRadius) ? "block" : "none");
          });
        } catch (e) {}
      };
    }

    if (UI) {
      UI.openForgeModal = function(activeTab) {
        const s = window.Aetheria.State && window.Aetheria.State.data;
        const forgeUnlocked = Boolean(
          s && ((s.projectsBuilt && s.projectsBuilt.proj_camp_forge) || s.equippedWeapon || (s.lv && s.lv > 1))
        );
        if (!forgeUnlocked) {
          window.Aetheria.Audio.sfxWrong();
          UI.showToast("🔨 巴爾的鍛造爐尚未修復！請先在營地拾取枯枝x3、燧石x3、黏土x2修復熔爐！");
          return;
        }
        WorkshopUIManager.renderGridWorkshopModal(activeTab || WorkshopUIManager.curTab || "workshop");
      };

      if (UI.openQuestLogModal) {
        const origQuestLog = UI.openQuestLogModal.bind(UI);
        UI.openQuestLogModal = function() {
          origQuestLog();
          const body = document.getElementById("modal-body");
          if (body && !document.getElementById("open-codex-from-quest-btn")) {
            const btnWrap = document.createElement("div");
            btnWrap.id = "open-codex-from-quest-btn";
            btnWrap.style.cssText = "display:flex; gap:6px; margin-bottom:8px;";
            btnWrap.innerHTML =
              '<button class="na-btn highlight" style="flex:1; padding:7px; font-size:12px;" onclick="Aetheria.HighlandsWorkshop.openZoneStoryChainModal()">' +
                '🔒 本區主線破障流程' +
              '</button>' +
              '<button class="na-btn highlight" style="flex:1; padding:7px; font-size:12px;" onclick="Aetheria.HighlandsWorkshop.openSurvivalCodexModal(\'all\')">' +
                '📖 求生合成圖鑑' +
              '</button>';
            body.insertBefore(btnWrap, body.firstChild);
          }
        };
      }

      ["openBagModal", "openInventoryModal"].forEach(function(fnName) {
        if (UI[fnName]) {
          const origBag = UI[fnName].bind(UI);
          UI[fnName] = function() {
            origBag();
            const body = document.getElementById("modal-body");
            if (body && !document.getElementById("open-codex-from-bag-btn")) {
              const btnWrap = document.createElement("div");
              btnWrap.id = "open-codex-from-bag-btn";
              btnWrap.style.marginBottom = "8px";
              btnWrap.innerHTML =
                '<button class="na-btn highlight" style="width:100%; padding:7px; font-size:12.5px;" onclick="Aetheria.HighlandsWorkshop.openSurvivalCodexModal(\'all\')">' +
                  '📖 查閱【求生合成圖鑑】(材料獲取途徑與解謎用途)' +
                '</button>';
              body.insertBefore(btnWrap, body.firstChild);
            }
          };
        }
      });

      if (UI.openRationQuickModal) {
        const origRation = UI.openRationQuickModal.bind(UI);
        UI.openRationQuickModal = function() {
          origRation();
          const s = window.Aetheria.State.data;
          const jerkyCnt = (s.inventory && s.inventory.rationJerky) || 0;
          const stewCnt  = (s.inventory && s.inventory.spicedStew) || 0;
          const body = document.getElementById("modal-body");
          if (body && !document.getElementById("quick-eat-jerky-card")) {
            const S = window.Aetheria.Data.Sprites;
            const card = document.createElement("div");
            card.id = "quick-eat-jerky-card";
            card.className = "sys-card";
            card.style.borderColor = "#f5b700";
            card.innerHTML =
              '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">' +
                '<div>' +
                  '<b>' + S.iconHtml("mat_spicedStew", true) + '香辛海陸燉肉 (持有：' + stewCnt + ')</b>' +
                  '<div style="font-size:11px; color:#5ac54f;">恢復 100% 飽食 + 150 HP，且永久最大HP +15！</div>' +
                '</div>' +
                '<button class="na-btn ' + (stewCnt > 0 ? 'highlight' : '') + '" style="padding:6px 12px;" onclick="Aetheria.HighlandsWorkshop.useSrpgConsumable(\'spicedStew\'); Aetheria.UI.openRationQuickModal();">食用</button>' +
              '</div>' +
              '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<div>' +
                  '<b>' + S.iconHtml("mat_rationJerky", true) + '岩鹽風乾肉脯 (持有：' + jerkyCnt + ')</b>' +
                  '<div style="font-size:11px; color:#ffd166;">立即恢復 +80% 飽食度 與 +90 HP</div>' +
                '</div>' +
                '<button class="na-btn ' + (jerkyCnt > 0 ? 'highlight' : '') + '" style="padding:6px 12px;" onclick="Aetheria.HighlandsWorkshop.useSrpgConsumable(\'rationJerky\'); Aetheria.UI.openRationQuickModal();">食用</button>' +
              '</div>';
            body.insertBefore(card, body.firstChild);
          }
        };
      }
    }
  }

  function initHighlandsAndWorkshopModule() {
    try {
      injectSurvivalRpgStyles();
      registerSurvivalRpgSprites();
      registerSrpgDataIntoGame();
      mountGuaranteedCompassWidget();
      hookSystemsForHighlandsAndWorkshop();

      const Maps = window.Aetheria.Data && window.Aetheria.Data.Maps;
      if (Maps && Maps.getMap) {
        const camp = Maps.getMap("camp_hub");
        if (camp) { camp._campTentsAdjustedToken = null; adjustCampTentsUpward(camp); }
        Object.keys(HIGHLAND_ZONES).forEach(function(zId) {
          const m = Maps.getMap(zId);
          if (m) { m._highlandInjectedToken = null; injectHighlandCliffIntoMap(m); }
        });
      }

      if (window.Aetheria.State && window.Aetheria.State.recalcMaxHp) {
        window.Aetheria.State.recalcMaxHp();
      }
      if (window.Aetheria.Renderer) {
        window.Aetheria.Renderer.builtZoneKey = null;
        window.Aetheria.Renderer.renderWorld();
      }
      if (window.Aetheria.UI && window.Aetheria.UI.updateAllHud) {
        window.Aetheria.UI.updateAllHud();
      }
      syncMainQuestTrackerWithStoryChain();
    } catch (err) {
      console.error("Survival RPG Hard-Gated Story Chain v13.2 init error:", err);
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(initHighlandsAndWorkshopModule, 185);
  } else {
    window.addEventListener("load", function() {
      setTimeout(initHighlandsAndWorkshopModule, 185);
    });
  }
})();
