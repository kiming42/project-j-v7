/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 畫面金色導航箭頭與智能帶路模組 (srpg-nav.js - v14.1)
 * 【File 5 / 5】獨立外掛模組，無須改動前 4 個檔案
 * 核心功能：
 *   1. 主角身邊 360° 環繞金色箭頭 + 正立步數標籤（60FPS GPU 加速，不擋點擊）
 *   2. 目標位置跳動金色光環 + ▼ 浮標（靠近即變綠提示「✨已到達! 按A鍵」）
 *   3. 智能分步帶路：火盆①➔④逐個指、未開拉桿/未對齊石像逐個指、沒鑰匙先指✖挖寶點
 *   4. 右下角輕巧追蹤膠囊（點擊切換目標/開關）+ 解題清單一鍵導航 + 全圖點擊插旗自訂路標
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.SRPG = window.Aetheria.SRPG || {};

(function() {
  const SRPG = window.Aetheria.SRPG;

  const nav = {
    enabled: true,
    pinnedTaskId: null,     // 手動鎖定的解題任務 ID (cliff / gate1 / puzzle / gate2 / crypt)
    pinnedZoneId: "",       // 鎖定時所在的地圖 ID
    customPin: null,        // 在放大全圖點擊建立的自訂路標 { zoneId, x, y, label }
    lastRenderX: -9999,
    lastRenderY: -9999,
    lastTargetKey: "",

    // DOM 參照快取
    orbitEl: null,
    arrowSvgEl: null,
    stepTagEl: null,
    beaconEl: null,
    pillEl: null
  };
  SRPG.nav = nav;

  // ================= 1. 注入金色導航箭頭專屬樣式 =================
  function injectNavStyles() {
    if (document.getElementById("srpg-nav-v141-styles")) return;
    const style = document.createElement("style");
    style.id = "srpg-nav-v141-styles";
    style.textContent = `
      /* 主角身邊 360° 金色導航箭頭容器（位於 #world-entity-layer） */
      #srpg-nav-orbit {
        position: absolute;
        left: 0;
        top: 0;
        width: 0;
        height: 0;
        pointer-events: none !important;
        z-index: 42;
        will-change: transform;
        display: none;
      }
      #srpg-nav-arrow-svg {
        position: absolute;
        left: -13px;
        top: -13px;
        width: 26px;
        height: 26px;
        filter: drop-shadow(0 2px 3px rgba(0,0,0,0.9));
        transform-origin: center center;
        will-change: transform;
      }
      #srpg-nav-step-tag {
        position: absolute;
        left: -24px;
        top: 12px;
        width: 48px;
        text-align: center;
        background: rgba(20, 16, 19, 0.88);
        color: #ffd166;
        border: 1.5px solid #f5b700;
        border-radius: 8px;
        font-size: 9.5px;
        font-weight: 900;
        line-height: 1.25;
        padding: 0 3px;
        text-shadow: 1px 1px 0 #000;
        box-shadow: 0 2px 4px rgba(0,0,0,0.75);
        white-space: nowrap;
      }

      /* 目標點上的跳動金色光環與 ▼ 標記 */
      @keyframes srpgBeaconPulse {
        0%, 100% { transform: translate(-50%, -50%) scale(0.92); opacity: 0.78; }
        50%      { transform: translate(-50%, -50%) scale(1.16); opacity: 1; }
      }
      @keyframes srpgBeaconBounce {
        0%, 100% { transform: translate(-50%, 0px); }
        50%      { transform: translate(-50%, -7px); }
      }
      #srpg-nav-beacon {
        position: absolute;
        left: 0;
        top: 0;
        width: 0;
        height: 0;
        pointer-events: none !important;
        z-index: 38;
        display: none;
      }
      .srpg-beacon-ring {
        position: absolute;
        left: 0;
        top: 0;
        width: 44px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid #ffd166;
        box-shadow: 0 0 10px rgba(245, 183, 0, 0.9), inset 0 0 6px rgba(255, 209, 102, 0.55);
        animation: srpgBeaconPulse 1.15s ease-in-out infinite;
      }
      .srpg-beacon-pin {
        position: absolute;
        left: 0;
        top: -36px;
        font-size: 16px;
        font-weight: 900;
        color: #ffd166;
        text-shadow: 0 2px 4px #000, 0 0 6px #f5b700;
        animation: srpgBeaconBounce 0.75s ease-in-out infinite;
      }

      /* 上半屏右下角輕巧導航膠囊（不遮擋羅盤與 HUD） */
      #srpg-nav-pill {
        position: absolute;
        bottom: 8px;
        right: 8px;
        z-index: 19;
        max-width: 198px;
        background: rgba(20, 16, 19, 0.90);
        color: #ffd166;
        border: 1.5px solid #f5b700;
        border-radius: 16px;
        padding: 4px 9px;
        font-size: 10.5px;
        font-weight: 900;
        line-height: 1.2;
        cursor: pointer;
        pointer-events: auto;
        box-shadow: 0 3px 8px rgba(0,0,0,0.85);
        display: none;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        user-select: none;
      }
      #srpg-nav-pill:active { transform: scale(0.95); }
      #srpg-nav-pill.arrived {
        background: rgba(20, 56, 36, 0.94);
        border-color: #5ac54f;
        color: #a3f7b5;
      }
      #srpg-nav-pill.nav-off {
        background: rgba(30, 26, 30, 0.78);
        border-color: #64748b;
        color: #94a3b8;
      }
      .srpg-nav-track-btn {
        background: #1d3557;
        color: #ffd166;
        border: 1px solid #38b6ff;
        border-radius: 4px;
        padding: 2px 7px;
        font-size: 10.5px;
        font-weight: 900;
        cursor: pointer;
      }
      .srpg-nav-track-btn.active {
        background: #2d6a4f;
        color: #ffffff;
        border-color: #5ac54f;
      }
    `;
    document.head.appendChild(style);
  }

  // ================= 2. 掛載 DOM 元素（自動自癒） =================
  function ensureNavElements() {
    const upper = document.getElementById("upper-screen");
    const entityLayer = document.getElementById("world-entity-layer");

    if (upper && (!nav.pillEl || !upper.contains(nav.pillEl))) {
      let pill = document.getElementById("srpg-nav-pill");
      if (!pill) {
        pill = document.createElement("div");
        pill.id = "srpg-nav-pill";
        pill.title = "點擊切換下一個追蹤目標（長按或全部完成可關閉）";
        pill.onclick = function(ev) {
          ev.stopPropagation();
          if (window.Aetheria.Audio && window.Aetheria.Audio.sfxTalkBlip) window.Aetheria.Audio.sfxTalkBlip();
          nav.cycleNextTarget();
        };
        upper.appendChild(pill);
      }
      nav.pillEl = pill;
    }

    if (entityLayer && (!nav.orbitEl || !entityLayer.contains(nav.orbitEl))) {
      const orbit = document.createElement("div");
      orbit.id = "srpg-nav-orbit";
      orbit.innerHTML =
        '<svg id="srpg-nav-arrow-svg" viewBox="0 0 24 24">' +
          '<path d="M3 12 L19 4 L15 12 L19 20 Z" fill="#ffd166" stroke="#141013" stroke-width="2" stroke-linejoin="round" transform="rotate(180 12 12)"/>' +
          '<circle cx="11" cy="12" r="2.2" fill="#ffffff"/>' +
        '</svg>' +
        '<div id="srpg-nav-step-tag">0步</div>';
      entityLayer.appendChild(orbit);
      nav.orbitEl = orbit;
      nav.arrowSvgEl = orbit.querySelector("#srpg-nav-arrow-svg");
      nav.stepTagEl = orbit.querySelector("#srpg-nav-step-tag");
    }

    if (entityLayer && (!nav.beaconEl || !entityLayer.contains(nav.beaconEl))) {
      const beacon = document.createElement("div");
      beacon.id = "srpg-nav-beacon";
      beacon.innerHTML =
        '<div class="srpg-beacon-ring"></div>' +
        '<div class="srpg-beacon-pin">▼</div>';
      entityLayer.appendChild(beacon);
      nav.beaconEl = beacon;
    }
  }

  // ================= 3. 智能解析「當前應前往的精準座標與簡短名稱」 =================
  function getShortTaskLabel(taskId, zoneId) {
    if (taskId === "cliff")  return "🧗南側繩梯";
    if (taskId === "puzzle") return "🧩古碑機關陣";
    if (taskId === "crypt")  return (zoneId === "zone5_volcano") ? "🐉火山龍皇" : "🏛️地底遺跡";
    const gates = (SRPG.db.ZONE_TOOL_GATE_OBSTACLES && SRPG.db.ZONE_TOOL_GATE_OBSTACLES[zoneId]) || [];
    if (taskId === "gate1" && gates[0]) return gates[0].name.replace(/\[.*\]/, "");
    if (taskId === "gate2" && gates[1]) return gates[1].name.replace(/\[.*\]/, "");
    return "🎯解題目標";
  }

  // 細分機關陣內部目標：自動精準指向「下一個要點的火盆 / 未開拉桿 / 未轉對石像 / 中央寶箱」
  function resolveSmartPuzzleTarget(mapObj, s) {
    const pCfg = SRPG.db.ZONE_EXPLORE_PUZZLES[mapObj.id];
    if (!pCfg) return null;

    if (SRPG.data.isZoneExplorePuzzleSolved(mapObj, s)) {
      const chest = (mapObj.nodes || []).find(function(n) { return n && n.isExplorePuzzleChest && !n.opened; });
      if (chest) return { key: "puz_chest_" + mapObj.id, x: chest.x, y: chest.y, label: "🏆機關寶箱", reqHighland: false };
    }

    const decos = mapObj.decos || [];
    if (pCfg.type === "brazier_order") {
      const nextStep = (mapObj._brazierStep || 0) + 1;
      const nextBr = decos.find(function(d) { return d && d.isPuzzleOrderBrazier && d.orderNum === nextStep; });
      if (nextBr) return { key: "puz_br_" + nextStep, x: nextBr.x, y: nextBr.y, label: "🔥" + nextBr.brazierLabel, reqHighland: false };
    } else if (pCfg.type === "lever_toggle") {
      const offLever = decos.find(function(d) { return d && d.isPuzzleToggleLever && !d.leverOn; });
      if (offLever) return { key: "puz_lv_" + offLever.leverIdx, x: offLever.x, y: offLever.y, label: "⚙️拉桿" + ["①","②","③"][offLever.leverIdx], reqHighland: false };
    } else if (pCfg.type === "statue_rotate") {
      const wrongSt = decos.find(function(d) { return d && d.isPuzzleRotateStatue && d.curDir !== d.targetDir; });
      if (wrongSt) return { key: "puz_st_" + wrongSt.statueName, x: wrongSt.x, y: wrongSt.y, label: "🗿" + wrongSt.statueName, reqHighland: false };
    }

    return { key: "puz_center_" + mapObj.id, x: pCfg.cx, y: pCfg.cy, label: "🧩機關寶箱", reqHighland: false };
  }

  // 細分地底遺跡目標：如果未有鑰匙且門未開，先指向最近的「✖ 藏寶點」挖鑰匙！
  function resolveSmartCryptTarget(mapObj, s) {
    const zId = mapObj.id;
    if (zId === "zone5_volcano") {
      const boss = (mapObj.monsters || []).find(function(m) { return m && m.isBoss && m.alive !== false; });
      if (boss) return { key: "boss_v5", x: boss.x, y: boss.y, label: "🐉紅蓮龍皇", reqHighland: false };
    }

    const isUnlocked = Boolean(s.unlockedCrypts && s.unlockedCrypts[zId]);
    const hasKey = ((s.inventory && s.inventory.cryptKey) || 0) > 0;

    if (!isUnlocked && !hasKey) {
      // 尋找本區未挖掘的「✖ 藏寶點」（優先平地）
      const spots = (mapObj.nodes || []).filter(function(n) {
        return n && n.isBuriedSpot && !n.opened && !(s.dugSpots && s.dugSpots[n.id]);
      });
      if (spots.length > 0) {
        spots.sort(function(a, b) {
          if (Boolean(a.reqHighland) !== Boolean(b.reqHighland)) return a.reqHighland ? 1 : -1;
          return Math.hypot(a.x - s.heroX, a.y - s.heroY) - Math.hypot(b.x - s.heroX, b.y - s.heroY);
        });
        const sp = spots[0];
        return { key: "dig_" + sp.id, x: sp.x, y: sp.y, label: "✖挖遺跡鑰匙", reqHighland: Boolean(sp.reqHighland) };
      }
    }

    return { key: "crypt_door_" + zId, x: 935, y: 1015, label: isUnlocked ? "🏛️進地底遺跡" : "🗝️開遺跡石門", reqHighland: false };
  }

  nav.resolveActiveTarget = function(mapObj, s) {
    if (!mapObj || !s) return null;
    const zId = mapObj.id;

    // 帳篷、營地、大海不顯示自動解謎箭頭（除非有自訂路標）
    if (zId === "camp_hub" || zId === "ocean_sea" || zId.indexOf("tent_") === 0) {
      if (nav.customPin && nav.customPin.zoneId === zId) return nav.customPin;
      return null;
    }

    // 1. 若玩家在放大全圖點了「自訂路標」且仍在同一張地圖
    if (nav.customPin && nav.customPin.zoneId === zId) {
      if (Math.hypot(nav.customPin.x - s.heroX, nav.customPin.y - s.heroY) < 42) {
        nav.customPin = null; // 抵達自訂路標後自動解除
      } else {
        return nav.customPin;
      }
    }

    // 2. 岩壁礦洞 (grotto_*) 內自動導航
    if (zId.indexOf("grotto_") === 0) {
      const digSpot = (mapObj.nodes || []).find(function(n) {
        return n && n.isBuriedSpot && !n.opened && !(s.dugSpots && s.dugSpots[n.id]);
      });
      if (digSpot) return { key: digSpot.id, x: digSpot.x, y: digSpot.y, label: "✖洞內藏寶點", reqHighland: false };
      const ore = (mapObj.nodes || []).find(function(n) { return n && !n.opened && !n.isBuriedSpot; });
      if (ore) return { key: ore.id, x: ore.x, y: ore.y, label: "⛏️" + (ore.name || "礦脈"), reqHighland: false };
      const exitP = (mapObj.portals || [])[0];
      if (exitP) return { key: exitP.id, x: exitP.x, y: exitP.y, label: "🚪離開山洞", reqHighland: false };
      return null;
    }

    // 3. 地底遺跡 (crypt_*) 內自動導航
    if (zId.indexOf("crypt_") === 0) {
      const guardian = (mapObj.monsters || []).find(function(m) { return m && m.isCryptGuardian && m.alive !== false; });
      if (guardian) return { key: guardian.id, x: guardian.x, y: guardian.y, label: "⚔️遺跡魔像", reqHighland: false };
      const vault = (mapObj.nodes || []).find(function(n) { return n && n.isCryptVaultChest && !n.opened; });
      if (vault) return { key: vault.id, x: vault.x, y: vault.y, label: "🏆聖物石棺", reqHighland: false };
      const exitP = (mapObj.portals || [])[0];
      if (exitP) return { key: exitP.id, x: exitP.x, y: exitP.y, label: "🚪離開遺跡", reqHighland: false };
      return null;
    }

    // 4. 1~6 區與蘑菇洞窟主地圖：依手動鎖定或 5 大解題任務自動指向
    const prog = SRPG.data.getZoneStoryProgress(zId, s);
    if (!prog) return null;

    if (nav.pinnedZoneId !== zId) {
      nav.pinnedZoneId = zId;
      nav.pinnedTaskId = null;
    }

    // 若手動鎖定的任務已經完成，自動釋放並切換到下一題
    if (nav.pinnedTaskId && prog.statusMap[nav.pinnedTaskId]) {
      nav.pinnedTaskId = null;
    }

    const activeTaskId = nav.pinnedTaskId || (prog.nextTask && prog.nextTask.id) || null;
    let rawTarget = null;

    if (activeTaskId === "cliff") {
      rawTarget = { key: "cliff_" + zId, x: 560, y: 800, label: "🧗架設繩梯", reqHighland: false };
    } else if (activeTaskId === "gate1" || activeTaskId === "gate2") {
      const taskObj = prog.chain.tasks.find(function(t) { return t.id === activeTaskId; });
      if (taskObj) {
        rawTarget = { key: activeTaskId + "_" + zId, x: taskObj.x, y: taskObj.y, label: getShortTaskLabel(activeTaskId, zId), reqHighland: false };
      }
    } else if (activeTaskId === "puzzle") {
      rawTarget = resolveSmartPuzzleTarget(mapObj, s);
    } else if (activeTaskId === "crypt") {
      rawTarget = resolveSmartCryptTarget(mapObj, s);
    } else {
      // 全部 5 題完成後，若該區 Boss 還在，則自動指向區域 Boss！
      const boss = (mapObj.monsters || []).find(function(m) { return m && m.isBoss && m.alive !== false; });
      if (boss) {
        rawTarget = { key: "boss_" + zId, x: boss.x, y: boss.y, label: "🔴區域首領", reqHighland: false };
      }
    }

    if (!rawTarget) return null;

    // ★ 高低差防迷路智慧判斷：目標在高台但主角在平地 ➔ 先導航去繩梯！
    if (rawTarget.reqHighland && !s.onHighland) {
      return { key: "go_up_ladder_" + zId, x: 560, y: 800, label: "🧗先爬繩梯上高台" };
    }
    if (!rawTarget.reqHighland && s.onHighland) {
      return { key: "go_down_ladder_" + zId, x: 560, y: 800, label: "🧗先爬繩梯回平地" };
    }

    return rawTarget;
  };

  // ================= 4. 玩家互動操作（鎖定目標 / 循環切換 / 全圖插旗） =================
  nav.trackTask = function(taskId) {
    const s = window.Aetheria.State && window.Aetheria.State.data;
    if (!s) return;
    nav.enabled = true;
    nav.customPin = null;
    nav.pinnedZoneId = s.currentZone;
    nav.pinnedTaskId = taskId;
    nav.lastTargetKey = "";

    if (window.Aetheria.Audio && window.Aetheria.Audio.sfxGather) window.Aetheria.Audio.sfxGather();
    if (window.Aetheria.UI && window.Aetheria.UI.setActivePanel) {
      window.Aetheria.UI.setActivePanel("panel-explore");
    }
    window.Aetheria.UI.showToast("🧭 金色導航箭頭已鎖定【" + getShortTaskLabel(taskId, s.currentZone) + "】，跟着箭頭走吧！");
    nav.updateNavigationVisuals(true);
  };

  nav.setCustomPin = function(zoneId, x, y, label) {
    nav.enabled = true;
    nav.customPin = { key: "pin_" + x + "_" + y, zoneId: zoneId, x: x, y: y, label: label || "📌自訂路標" };
    nav.lastTargetKey = "";
    if (window.Aetheria.Audio && window.Aetheria.Audio.sfxGather) window.Aetheria.Audio.sfxGather();
    if (window.Aetheria.UI && window.Aetheria.UI.setActivePanel) {
      window.Aetheria.UI.setActivePanel("panel-explore");
    }
    window.Aetheria.UI.showToast("📌 已設定金色導航路標 (" + x + ", " + y + ")！跟着主角身邊的箭頭出發吧！");
    nav.updateNavigationVisuals(true);
  };

  nav.cycleNextTarget = function() {
    const s = window.Aetheria.State && window.Aetheria.State.data;
    if (!s) return;

    // 若目前關閉中，點擊立即重新開啟
    if (!nav.enabled) {
      nav.enabled = true;
      nav.lastTargetKey = "";
      window.Aetheria.UI.showToast("🧭 已開啟金色導航箭頭！");
      nav.updateNavigationVisuals(true);
      return;
    }

    // 若目前為自訂路標，點擊清除並切回自動解題目標
    if (nav.customPin) {
      nav.customPin = null;
      nav.lastTargetKey = "";
      window.Aetheria.UI.showToast("🧭 已切換回自動解題導航！");
      nav.updateNavigationVisuals(true);
      return;
    }

    const prog = SRPG.data.getZoneStoryProgress(s.currentZone, s);
    if (!prog) {
      nav.enabled = false;
      nav.updateNavigationVisuals(true);
      return;
    }

    const pendingIds = prog.chain.tasks
      .filter(function(t) { return !prog.statusMap[t.id]; })
      .map(function(t) { return t.id; });

    if (pendingIds.length === 0) {
      nav.enabled = !nav.enabled;
      nav.updateNavigationVisuals(true);
      return;
    }

    const curId = nav.pinnedTaskId || pendingIds[0];
    const curIdx = pendingIds.indexOf(curId);
    if (curIdx === pendingIds.length - 1) {
      // 循環到最後一個再按一次 ➔ 暫時隱藏箭頭（再按可開回）
      nav.enabled = false;
      nav.pinnedTaskId = null;
      window.Aetheria.UI.showToast("🧭 已暫時隱藏導航箭頭（隨時點擊右下角膠囊可再開）");
    } else {
      nav.pinnedZoneId = s.currentZone;
      nav.pinnedTaskId = pendingIds[curIdx + 1];
      window.Aetheria.UI.showToast("🧭 導航已切換至：【" + getShortTaskLabel(nav.pinnedTaskId, s.currentZone) + "】");
    }
    nav.lastTargetKey = "";
    nav.updateNavigationVisuals(true);
  };

  // ================= 5. 每幀高效更新箭頭方向、步數與目標光環 =================
  nav.updateNavigationVisuals = function(force) {
    const s = window.Aetheria.State && window.Aetheria.State.data;
    const Maps = window.Aetheria.Data && window.Aetheria.Data.Maps;
    if (!s || !Maps || !Maps.getMap) return;

    const mapObj = Maps.getMap(s.currentZone);
    if (!mapObj) return;

    ensureNavElements();
    if (!nav.pillEl || !nav.orbitEl || !nav.beaconEl) return;

    const target = nav.resolveActiveTarget(mapObj, s);
    const utils = SRPG.utils;

    // 無可用導航目標（例如在營地或帳篷內）
    if (!target) {
      utils.setDisplayIfChanged(nav.pillEl, "none");
      utils.setDisplayIfChanged(nav.orbitEl, "none");
      utils.setDisplayIfChanged(nav.beaconEl, "none");
      return;
    }

    // 玩家手動暫時關閉導航箭頭
    if (!nav.enabled) {
      utils.setDisplayIfChanged(nav.pillEl, "flex");
      utils.setClassIfChanged(nav.pillEl, "nav-off");
      utils.setTextIfChanged(nav.pillEl, "🧭 導航已關 [點擊開啟]");
      utils.setDisplayIfChanged(nav.orbitEl, "none");
      utils.setDisplayIfChanged(nav.beaconEl, "none");
      return;
    }

    const hx = s.heroX || 0;
    const hy = s.heroY || 0;
    const targetKey = mapObj.id + "|" + target.key + "|" + target.x + "," + target.y;

    // 防抖：若主角與目標位置都幾乎沒動，直接跳過 DOM 寫入
    if (!force && nav.lastTargetKey === targetKey && Math.hypot(hx - nav.lastRenderX, hy - nav.lastRenderY) < 1.2) {
      return;
    }
    nav.lastRenderX = hx;
    nav.lastRenderY = hy;
    nav.lastTargetKey = targetKey;

    const dx = target.x - hx;
    const dy = target.y - hy;
    const distPx = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.round(distPx / 24));
    const arrived = (distPx <= 48);

    // 1. 更新目標位置跳動金色光環與 ▼ 標記
    utils.setDisplayIfChanged(nav.beaconEl, "block");
    nav.beaconEl.style.transform = "translate3d(" + Math.round(target.x) + "px, " + Math.round(target.y) + "px, 0)";

    // 2. 更新主角身邊 360° 環繞金色箭頭（已到達時隱藏環繞箭頭，改看目標光環與綠色提示）
    if (arrived) {
      utils.setDisplayIfChanged(nav.orbitEl, "none");
      utils.setDisplayIfChanged(nav.pillEl, "flex");
      utils.setClassIfChanged(nav.pillEl, "arrived");
      utils.setTextIfChanged(nav.pillEl, "✨ 已到達 " + target.label + "！按A鍵");
    } else {
      const rad = Math.atan2(dy, dx);
      const deg = (rad * 180 / Math.PI).toFixed(1);
      const orbitRadius = 46;
      const ax = Math.round(hx + Math.cos(rad) * orbitRadius);
      const ay = Math.round(hy - 8 + Math.sin(rad) * orbitRadius);

      utils.setDisplayIfChanged(nav.orbitEl, "block");
      nav.orbitEl.style.transform = "translate3d(" + ax + "px, " + ay + "px, 0)";
      if (nav.arrowSvgEl) {
        nav.arrowSvgEl.style.transform = "rotate(" + deg + "deg)";
      }
      if (nav.stepTagEl) {
        utils.setTextIfChanged(nav.stepTagEl, steps + "步");
      }

      utils.setDisplayIfChanged(nav.pillEl, "flex");
      utils.setClassIfChanged(nav.pillEl, "");
      utils.setTextIfChanged(nav.pillEl, "🧭 " + target.label + "・" + steps + "步 ⇄");
    }
  };

  // ================= 6. 掛鉤渲染器、解題清單視窗與全區放大地圖 =================
  function installNavHooks() {
    if (nav._hooked) return;
    nav._hooked = true;

    injectNavStyles();
    ensureNavElements();

    // 1. 掛鉤 Renderer.renderWorld：每幀自動流暢更新金色箭頭與步數
    const Ren = window.Aetheria.Renderer;
    if (Ren && Ren.renderWorld) {
      const origRender = Ren.renderWorld.bind(Ren);
      Ren.renderWorld = function() {
        origRender();
        try {
          nav.updateNavigationVisuals(false);
        } catch (e) {}
      };
    }

    // 2. 增強【5 大解題任務指引】視窗：每一項未完成任務加上「📍 導航去這裡」按鈕
    const wk = SRPG.workshop;
    if (wk && wk.openZoneStoryChainModal) {
      const origOpenChain = wk.openZoneStoryChainModal.bind(wk);
      wk.openZoneStoryChainModal = function() {
        origOpenChain();
        const s = window.Aetheria.State && window.Aetheria.State.data;
        const prog = s && SRPG.data.getZoneStoryProgress(s.currentZone, s);
        const body = document.getElementById("modal-body");
        if (!prog || !body) return;

        const cards = body.querySelectorAll(".codex-card");
        prog.chain.tasks.forEach(function(task, idx) {
          const card = cards[idx];
          if (!card || prog.statusMap[task.id]) return;
          const tag = card.querySelector(".codex-tag");
          if (tag && !card.querySelector(".srpg-nav-track-btn")) {
            const isTracking = (nav.enabled && !nav.customPin && (nav.pinnedTaskId === task.id || (!nav.pinnedTaskId && prog.nextTask && prog.nextTask.id === task.id)));
            const btn = document.createElement("button");
            btn.className = "srpg-nav-track-btn" + (isTracking ? " active" : "");
            btn.textContent = isTracking ? "🧭 導航中" : "📍 導航去這裡";
            btn.onclick = function(ev) {
              ev.stopPropagation();
              nav.trackTask(task.id);
            };
            tag.replaceWith(btn);
          }
        });
      };
    }

    // 3. 增強【全區全貌探索地圖】：點擊地圖任何位置即可插旗並開啟金色箭頭帶路
    if (wk && wk.openFullZoneMapModal) {
      const origOpenMap = wk.openFullZoneMapModal.bind(wk);
      wk.openFullZoneMapModal = function() {
        origOpenMap();
        const s = window.Aetheria.State && window.Aetheria.State.data;
        const mapObj = s && window.Aetheria.Data && window.Aetheria.Data.Maps && window.Aetheria.Data.Maps.getMap(s.currentZone);
        const canvas = document.getElementById("srpg-fullmap-canvas");
        if (!canvas || !mapObj) return;

        const W = mapObj.width || 1200;
        const H = mapObj.height || 680;
        canvas.onclick = function(ev) {
          const rect = canvas.getBoundingClientRect();
          const clickX = Math.round(((ev.clientX - rect.left) / rect.width) * W);
          const clickY = Math.round(((ev.clientY - rect.top) / rect.height) * H);
          nav.setCustomPin(mapObj.id, clickX, clickY, "📌地圖路標");
        };
      };
    }

    nav.updateNavigationVisuals(true);
  }

  // 等待主模組 (v14.0) 就緒後自動掛載
  function bootNavWhenReady() {
    let tries = 0;
    const timer = setInterval(function() {
      tries++;
      if (SRPG._ready && SRPG.data && SRPG.workshop && window.Aetheria.Renderer) {
        clearInterval(timer);
        installNavHooks();
      } else if (tries >= 160) {
        clearInterval(timer);
      }
    }, 50);
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    bootNavWhenReady();
  } else {
    window.addEventListener("load", bootNavWhenReady);
  }
})();
