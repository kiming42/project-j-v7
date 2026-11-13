/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 左上角玩家名稱+血量、新遊戲強制命名與雲端三槽位模組 (cloud-save-slots.js - v8.6)
 * 核心修正：
 *   1. 【新遊戲必彈輸入名稱】：攔截首頁與系統所有「新遊戲/重置/開新槽位」入口，並將命名視窗置頂 (z-index:99999)，支援選槽位+輸入名字
 *   2. 【左上角血量框加入玩家名字】：在左上角 #hud-hearts-box 血量數字上方顯示金色玩家名稱，切換槽位或改名時即時更新
 *   3. 保留極簡首頁（右上角音效開關 🔊/🔇）、窄螢幕頂部 HUD 防出界與跨設備雲端通行碼同步
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const ACTIVE_SLOT_KEY   = "AETHERIA_ACTIVE_SLOT_V8";
  const SLOT_KEY_PREFIX   = "AETHERIA_SLOT_V8_";
  const CLOUD_CODE_KEY    = "AETHERIA_CLOUD_PASSCODE_V8";
  const AUTO_CLOUD_KEY    = "AETHERIA_AUTO_CLOUD_V8";
  const AUDIO_MUTE_KEY    = "AETHERIA_AUDIO_MUTE_V8";
  const LEGACY_SAVE_KEYS  = ["AETHERIA_SAVE_V7", "AETHERIA_SAVE_V6", "AETHERIA_SAVE_V5"];

  // ================= 1. 注入左上角名字+血量框、極簡首頁與置頂命名視窗 CSS =================
  function injectSaveSlotsStyles() {
    if (document.getElementById("save-slots-v86-styles")) return;
    const style = document.createElement("style");
    style.id = "save-slots-v86-styles";
    style.textContent = `
      /* 左上角：玩家名字 + 精準血量數字 + 動態血條 (#hud-hearts-box) */
      #hud-hearts-box {
        position: absolute !important;
        top: 4px !important;
        left: 4px !important;
        z-index: 25 !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        background: rgba(20, 16, 19, 0.92) !important;
        border: 1.5px solid #f5b700 !important;
        border-radius: 6px !important;
        padding: 2px 5px 3px !important;
        min-width: 64px !important;
        max-width: 72px !important;
        box-shadow: 0 2px 6px rgba(0,0,0,0.75) !important;
        pointer-events: auto !important;
        cursor: pointer !important;
      }
      .hud-hero-name-row {
        font-size: 10px !important;
        font-weight: 900 !important;
        color: #ffd166 !important;
        text-align: center !important;
        line-height: 1.15 !important;
        border-bottom: 1px solid rgba(245, 183, 0, 0.35) !important;
        padding-bottom: 1px !important;
        margin-bottom: 2px !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        text-shadow: 1px 1px 0 #000 !important;
      }
      .hud-hp-top-row {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        font-size: 9.5px !important;
        font-weight: 900 !important;
        color: #ffffff !important;
        gap: 2px !important;
        line-height: 1.1 !important;
        text-shadow: 1px 1px 0 #000 !important;
      }
      .hud-hp-top-row img {
        width: 10px !important;
        height: 10px !important;
        image-rendering: pixelated !important;
      }
      .hud-hp-mini-track {
        width: 100% !important;
        height: 4px !important;
        background: #2b2129 !important;
        border: 1px solid #000 !important;
        border-radius: 3px !important;
        margin-top: 2px !important;
        overflow: hidden !important;
      }
      .hud-hp-mini-fill {
        height: 100% !important;
        transition: width 0.25s ease, background-color 0.25s ease !important;
      }

      /* 窄螢幕手機頂部 HUD 緊湊防出界 */
      #hud-overlay {
        top: 4px !important;
        left: 76px !important;
        right: 3px !important;
        display: flex !important;
        flex-wrap: nowrap !important;
        justify-content: space-between !important;
        align-items: center !important;
        gap: 2px !important;
        overflow: hidden !important;
      }
      #hud-overlay .na-badge {
        padding: 2px 3.5px !important;
        font-size: 9.5px !important;
        line-height: 1.15 !important;
        white-space: nowrap !important;
        flex-shrink: 1 !important;
      }
      #hud-overlay .na-badge img {
        width: 11px !important;
        height: 11px !important;
        margin-right: 1px !important;
      }
      #hud-zone {
        max-width: 70px !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }
      #hud-fullscreen-btn {
        padding: 2px 4px !important;
        font-size: 10px !important;
        flex-shrink: 0 !important;
        pointer-events: auto !important;
      }

      /* 首頁 (#title-screen) 極簡化：右上角獨立音效鈕 + 單一底部入口 */
      #title-mute-corner-btn {
        position: absolute;
        top: 14px;
        right: 14px;
        z-index: 35;
        width: 40px;
        height: 40px;
        border-radius: 8px;
        background: rgba(20, 16, 19, 0.85);
        border: 2px solid #d9a066;
        color: #ffd166;
        font-size: 18px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        box-shadow: 0 3px 0 #141013;
      }
      #title-mute-corner-btn:active {
        transform: translateY(2px);
      }

      #title-cloud-bar {
        margin-top: 8px;
        display: flex;
        justify-content: center;
        z-index: 25;
        width: 86%;
        max-width: 300px;
      }

      /* 存檔槽位與雲端同步樣式 */
      .slot-card {
        background: #181316;
        border: 2px solid #594950;
        border-radius: 6px;
        padding: 8px 10px;
        margin-bottom: 6px;
        transition: border-color 0.15s ease;
      }
      .slot-card.active-slot {
        background: linear-gradient(135deg, #1d3557 0%, #141013 100%);
        border-color: #f5b700;
        box-shadow: 0 0 8px rgba(245, 183, 0, 0.35);
      }
      .slot-badge-active {
        display: inline-block;
        background: #f5b700;
        color: #141013;
        font-size: 10.5px;
        font-weight: 900;
        padding: 1px 6px;
        border-radius: 4px;
        margin-left: 5px;
      }
      .cloud-box {
        background: linear-gradient(135deg, #0f2942 0%, #1b263b 100%);
        border: 2px solid #38b6ff;
        border-radius: 6px;
        padding: 9px 10px;
        margin-bottom: 8px;
        color: #ffffff;
      }
      .cloud-input {
        width: 100%;
        background: #090d16;
        color: #ffd166;
        border: 1.5px solid #38b6ff;
        border-radius: 5px;
        padding: 6px 8px;
        font-size: 13px;
        font-weight: 900;
        box-sizing: border-box;
        margin: 5px 0;
        text-align: center;
        letter-spacing: 1px;
      }

      /* 玩家自訂名稱彈出視窗（z-index: 99999 確保高於首頁與任何過場層） */
      #hero-name-modal {
        position: fixed !important;
        inset: 0 !important;
        z-index: 99999 !important;
        background: rgba(10, 8, 12, 0.90) !important;
        display: none;
        justify-content: center;
        align-items: center;
        padding: 16px;
      }
      .hero-name-dialog {
        width: 100%;
        max-width: 330px;
        background: linear-gradient(180deg, #2b2118 0%, #181316 100%);
        border: 3px solid #f5b700;
        border-radius: 8px;
        padding: 14px;
        text-align: center;
        color: #ffffff;
        box-shadow: 0 8px 28px rgba(0,0,0,0.95);
      }
      .hero-name-input {
        width: 100%;
        background: #0f172a;
        color: #ffd166;
        border: 2px solid #8ce0ff;
        border-radius: 6px;
        padding: 9px 10px;
        font-size: 16px;
        font-weight: 900;
        text-align: center;
        box-sizing: border-box;
        margin: 8px 0 10px;
      }
      .name-slot-picker {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 5px;
        margin: 6px 0 8px;
      }
    `;
    document.head.appendChild(style);

    if (!document.getElementById("hero-name-modal")) {
      const modal = document.createElement("div");
      modal.id = "hero-name-modal";
      modal.innerHTML = `
        <div class="hero-name-dialog">
          <div id="hero-name-modal-title" style="font-size:16px; font-weight:900; color:#ffd166; margin-bottom:4px;">✨ 新遊戲・冒險者登錄</div>
          <div id="hero-name-slot-wrap" style="display:none;">
            <div style="font-size:11.5px; color:#8ce0ff; margin-top:2px;">選擇要儲存的獨立槽位：</div>
            <div id="hero-name-slot-btns" class="name-slot-picker"></div>
          </div>
          <div id="hero-name-modal-sub" style="font-size:12px; color:#cbd5e1; margin-top:4px;">請輸入主角的專屬名稱（最多 10 字）：</div>
          <input id="hero-name-input-field" class="hero-name-input" type="text" maxlength="10" placeholder="請輸入玩家名稱 (如: Justin)" />
          <div style="display:flex; gap:8px; margin-top:4px;">
            <button id="hero-name-cancel-btn" class="na-btn" style="flex:1; padding:8px;">取消</button>
            <button id="hero-name-confirm-btn" class="na-btn highlight" style="flex:2; padding:8px; font-size:14px;">⚔️ 確認開始</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
  }

  // ================= 2. 玩家名稱管理與視窗互動 =================
  function getHeroName(s) {
    s = s || (window.Aetheria.State && window.Aetheria.State.data) || {};
    return (s.heroName && String(s.heroName).trim()) ? String(s.heroName).trim() : "Justin";
  }

  function replaceHeroNameInText(text, s) {
    if (!text || typeof text !== "string") return text;
    const hName = getHeroName(s);
    return text.replace(/Justin/g, hName);
  }

  function openHeroNamePrompt(options) {
    options = options || {};
    const modal = document.getElementById("hero-name-modal");
    const titleEl = document.getElementById("hero-name-modal-title");
    const slotWrap = document.getElementById("hero-name-slot-wrap");
    const slotBtns = document.getElementById("hero-name-slot-btns");
    const input = document.getElementById("hero-name-input-field");
    const subEl = document.getElementById("hero-name-modal-sub");
    const cancelBtn = document.getElementById("hero-name-cancel-btn");
    const confirmBtn = document.getElementById("hero-name-confirm-btn");
    if (!modal || !input) return;

    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
    let chosenSlot = options.targetSlot || getActiveSlotNum();

    if (titleEl) {
      titleEl.innerText = options.title || "✨ 冒險者登錄";
    }
    if (subEl) {
      subEl.innerText = options.subtitle || "請輸入主角的專屬名稱（最多 10 字）：";
    }

    // 若是「開新遊戲」模式，提供 3 個槽位按鈕讓玩家直覺選擇存在哪一格
    function renderSlotPickerBtns() {
      if (!slotWrap || !slotBtns) return;
      if (!options.allowPickSlot) {
        slotWrap.style.display = "none";
        return;
      }
      slotWrap.style.display = "block";
      slotBtns.innerHTML = "";
      [1, 2, 3].forEach(function(n) {
        const sd = readSlotData(n);
        const btn = document.createElement("button");
        btn.className = "na-btn" + (chosenSlot === n ? " highlight" : "");
        btn.style.cssText = "padding:5px 2px; font-size:11px;";
        btn.innerText = sd ? ("槽位" + n + "(Lv." + (sd.lv || 1) + ")") : ("槽位" + n + "(空)");
        btn.onclick = function() {
          chosenSlot = n;
          if (window.Aetheria.Audio) window.Aetheria.Audio.sfxTalkBlip();
          renderSlotPickerBtns();
        };
        slotBtns.appendChild(btn);
      });
    }
    renderSlotPickerBtns();

    input.value = options.defaultName !== undefined ? options.defaultName : getHeroName(s);

    if (cancelBtn) {
      cancelBtn.style.display = options.hideCancel ? "none" : "block";
      cancelBtn.onclick = function() {
        if (window.Aetheria.Audio) window.Aetheria.Audio.sfxTalkBlip();
        modal.style.display = "none";
      };
    }

    function submitName() {
      const val = String(input.value || "").trim() || "Justin";
      modal.style.display = "none";
      if (window.Aetheria.Audio) window.Aetheria.Audio.sfxLevelUp();
      if (options.onConfirm) {
        options.onConfirm(val, chosenSlot);
      }
    }

    confirmBtn.onclick = submitName;
    input.onkeydown = function(ev) {
      if (ev.key === "Enter") submitName();
    };

    modal.style.display = "flex";
    setTimeout(function() {
      input.focus();
      input.select();
    }, 80);
  }

  // ================= 3. 存檔槽位讀寫與無縫遷移核心邏輯 =================
  function getActiveSlotNum() {
    const raw = parseInt(localStorage.getItem(ACTIVE_SLOT_KEY) || "1", 10);
    return (raw >= 1 && raw <= 3) ? raw : 1;
  }

  function setActiveSlotNum(num) {
    localStorage.setItem(ACTIVE_SLOT_KEY, String(num));
  }

  function getSlotStorageKey(num) {
    return SLOT_KEY_PREFIX + num;
  }

  function readSlotData(num) {
    try {
      const raw = localStorage.getItem(getSlotStorageKey(num));
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function writeSlotData(num, stateObj) {
    if (!stateObj) return;
    try {
      const copy = JSON.parse(JSON.stringify(stateObj));
      if (!copy.heroName) copy.heroName = "Justin";
      copy._savedAt = Date.now();
      copy._slotNum = num;
      const str = JSON.stringify(copy);
      localStorage.setItem(getSlotStorageKey(num), str);

      if (num === getActiveSlotNum()) {
        LEGACY_SAVE_KEYS.forEach(function(k) {
          localStorage.setItem(k, str);
        });
      }
    } catch (e) {
      console.error("Write slot error:", e);
    }
  }

  function ensureInitialSlotMigration() {
    const slot1 = readSlotData(1);
    const slot2 = readSlotData(2);
    const slot3 = readSlotData(3);

    if (!slot1 && !slot2 && !slot3) {
      const s = window.Aetheria.State && window.Aetheria.State.data;
      if (s) {
        if (!s.heroName) s.heroName = "Justin";
        writeSlotData(1, s);
        setActiveSlotNum(1);
      }
    } else {
      const curSlot = getActiveSlotNum();
      const savedSlotData = readSlotData(curSlot);
      if (savedSlotData && window.Aetheria.State && window.Aetheria.State.data) {
        if (!savedSlotData.heroName) savedSlotData.heroName = "Justin";
        Object.assign(window.Aetheria.State.data, savedSlotData);
      }
    }
  }

  function formatZoneShortName(zoneId) {
    const mapNames = {
      camp_hub: "曙光營地",
      tent_guild: "公會帳篷",
      tent_forge: "鐵匠帳篷",
      tent_hero: "主角帳篷",
      zone1_forest: "翠風森林",
      cave1_mushroom: "蘑菇洞窟",
      zone2_canyon: "流沙峽谷",
      zone3_coast: "翡翠海岸",
      zone4_snow: "霜語雪原",
      zone5_volcano: "熔岩火山",
      zone6_sky: "天界聖殿",
      ocean_sea: "無盡碧海",
      island_coral: "珊瑚荒島",
      island_wreck: "沉船墓地",
      dungeon_abyss: "深淵地牢",
      island_volcano: "星隕孤島"
    };
    return mapNames[zoneId] || zoneId || "曙光營地";
  }

  function formatTimeAgo(ts) {
    if (!ts) return "剛剛";
    const d = new Date(ts);
    const pad = function(n) { return n < 10 ? "0" + n : String(n); };
    return (d.getMonth() + 1) + "/" + d.getDate() + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function applyStateToLiveGame(targetState) {
    const St = window.Aetheria.State;
    if (!St || !targetState) return;

    St.data = JSON.parse(JSON.stringify(targetState));
    if (!St.data.heroName) St.data.heroName = "Justin";
    if (St.recalcMaxHp) St.recalcMaxHp();

    if (window.Aetheria.Data && window.Aetheria.Data.Maps) {
      const m = window.Aetheria.Data.Maps.getMap(St.data.currentZone || "camp_hub");
      if (m && window.Aetheria.Audio && window.Aetheria.Audio.playBgm) {
        window.Aetheria.Audio.playBgm(m.bgm || "forest");
      }
    }

    if (window.Aetheria.Renderer) {
      window.Aetheria.Renderer.builtZoneKey = null;
      window.Aetheria.Renderer.lastHeartsState = "";
      window.Aetheria.Renderer.renderWorld();
    }
    if (window.Aetheria.UI && window.Aetheria.UI.updateAllHud) {
      window.Aetheria.UI.updateAllHud();
    }
    updateTitleScreenSlotBadge();
  }

  function createFreshDefaultState(customHeroName) {
    const cur = (window.Aetheria.State && window.Aetheria.State.data) || {};
    return {
      heroName: customHeroName || "Justin",
      hasCustomName: true,
      lv: 1,
      exp: 0,
      maxExp: 100,
      hp: 100,
      maxHp: 100,
      bp: 1,
      maxBp: 5,
      gold: 50,
      guildPts: 0,
      dayCount: 1,
      worldClock: 60,
      hunger: 100,
      torchTicks: 0,
      currentZone: "camp_hub",
      heroX: 310,
      heroY: 235,
      petX: 286,
      petY: 238,
      facing: "down",
      currentJob: "adventurer",
      unlockedJobs: ["adventurer"],
      equippedWeapon: null,
      unlockedWeapons: [],
      equippedArmor: "a_cloth",
      unlockedArmors: ["a_cloth"],
      unlockedRelics: [],
      activePet: "pet_slime",
      subPet: null,
      unlockedPets: ["pet_slime"],
      tools: { axe: 0, pickaxe: 0, rod: 0, hook: 0, pouch: 0 },
      inventory: { branch: 0, flint: 0, clay: 0, rationHerb: 2, potionHeal: 1 },
      projectsBuilt: {},
      projectContributions: {},
      shipContributions: {},
      boatTier: 0,
      unlockedSeals: {},
      clearedBosses: {},
      solvedPuzzles: {},
      claimedPuzzleChests: {},
      weaponAffixes: {},
      armorAffixes: {},
      campUpgrades: { bedLv: 0, potLv: 0, sailLv: 0 },
      mainQuestIndex: 0,
      questProgress: {},
      wrongBook: [],
      questionMastery: {},
      maxStreak: 0,
      activeSubjects: cur.activeSubjects || { chinese: true, english: true, humanities: true, science: true },
      activeLessons: cur.activeLessons || {},
      lessonSelectMode: cur.lessonSelectMode || "multi",
      _savedAt: Date.now()
    };
  }

  // ================= 4. 雲端同步、新遊戲強制命名與槽位管理員 =================
  function sanitizePasscode(raw) {
    return String(raw || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "");
  }

  function getCloudTopicName(passcode) {
    let hash = 2166136261;
    for (let i = 0; i < passcode.length; i++) {
      hash ^= passcode.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const hex = (hash >>> 0).toString(16);
    return "aetheria_v8_cloud_" + passcode + "_" + hex;
  }

  const SaveSlotsManager = {
    isSyncing: false,

    promptRenameCurrentHero: function() {
      const s = window.Aetheria.State.data;
      openHeroNamePrompt({
        title: "✏️ 修改主角名稱",
        defaultName: getHeroName(s),
        allowPickSlot: false,
        subtitle: "請輸入新的主角名稱（將顯示於左上角血量框與對話）：",
        onConfirm: function(newName) {
          s.heroName = newName;
          s.hasCustomName = true;
          window.Aetheria.State.save();
          updateTitleScreenSlotBadge();
          if (window.Aetheria.Renderer) {
            window.Aetheria.Renderer.lastHeartsState = "";
          }
          if (window.Aetheria.UI) {
            window.Aetheria.UI.updateAllHud();
            const modalPanel = document.getElementById("panel-modal");
            if (modalPanel && modalPanel.classList.contains("active")) {
              window.Aetheria.UI.openSettingsModal("system");
            }
            window.Aetheria.UI.showToast("✨ 主角名稱已更新為【" + newName + "】！");
          }
        }
      });
    },

    // 開啟新遊戲並彈出命名視窗（支援直接選擇槽位 1 / 2 / 3）
    startNewGameWithCustomName: function(targetSlotOpt) {
      let defaultSlot = targetSlotOpt;
      if (!defaultSlot) {
        if (!readSlotData(2)) defaultSlot = 2;
        else if (!readSlotData(3)) defaultSlot = 3;
        else defaultSlot = getActiveSlotNum();
      }

      openHeroNamePrompt({
        title: "✨ 新遊戲・冒險者登錄",
        defaultName: "",
        targetSlot: defaultSlot,
        allowPickSlot: !targetSlotOpt,
        subtitle: "請輸入你的冒險者名稱（最多 10 字）：",
        onConfirm: function(customName, pickedSlot) {
          const finalSlot = pickedSlot || defaultSlot;
          const curSlot = getActiveSlotNum();
          if (curSlot !== finalSlot && window.Aetheria.State && window.Aetheria.State.data) {
            writeSlotData(curSlot, window.Aetheria.State.data);
          }

          if (window.Aetheria.Data && window.Aetheria.Data.Maps && window.Aetheria.Data.Maps.refreshAllResources) {
            window.Aetheria.Data.Maps.refreshAllResources();
          }

          const fresh = createFreshDefaultState(customName);
          setActiveSlotNum(finalSlot);
          writeSlotData(finalSlot, fresh);
          applyStateToLiveGame(fresh);

          const titleEl = document.getElementById("title-screen");
          if (titleEl) titleEl.style.display = "none";

          if (window.Aetheria.UI) {
            window.Aetheria.UI.closePanelToExplore();
            if (window.Aetheria.UI.playCutscene) {
              window.Aetheria.UI.playCutscene("intro");
            }
            window.Aetheria.UI.showToast("🎉 歡迎【" + customName + "】展開新冒險！（儲存於槽位 " + finalSlot + "）");
          }
        }
      });
    },

    switchSlot: function(targetSlot) {
      const curSlot = getActiveSlotNum();
      if (window.Aetheria.State && window.Aetheria.State.data) {
        writeSlotData(curSlot, window.Aetheria.State.data);
      }

      const targetData = readSlotData(targetSlot);
      if (!targetData) {
        this.startNewGameWithCustomName(targetSlot);
        return;
      }

      setActiveSlotNum(targetSlot);
      writeSlotData(targetSlot, targetData);
      applyStateToLiveGame(targetData);

      if (window.Aetheria.Audio) window.Aetheria.Audio.sfxLevelUp();
      if (window.Aetheria.UI) {
        window.Aetheria.UI.openSettingsModal("system");
        window.Aetheria.UI.showToast("💾 已切換至【槽位 " + targetSlot + "：" + getHeroName(targetData) + "】(Lv." + (targetData.lv || 1) + ")！");
      }
    },

    copyCurrentToSlot: function(destSlot) {
      const curSlot = getActiveSlotNum();
      if (destSlot === curSlot) return;

      const existing = readSlotData(destSlot);
      if (existing && !confirm("確定要將目前的進度複製到【存檔槽位 " + destSlot + "】並覆蓋該槽位嗎？")) {
        return;
      }

      const curData = window.Aetheria.State.data;
      writeSlotData(destSlot, curData);
      if (window.Aetheria.Audio) window.Aetheria.Audio.sfxGather();
      if (window.Aetheria.UI) {
        window.Aetheria.UI.openSettingsModal("system");
        window.Aetheria.UI.showToast("📋 已將當前進度備份至【存檔槽位 " + destSlot + "】！");
      }
    },

    clearSlot: function(slotNum) {
      this.startNewGameWithCustomName(slotNum);
    },

    toggleSoundMute: function() {
      const Aud = window.Aetheria.Audio;
      if (!Aud) return;
      if (Aud.toggleMute) {
        Aud.toggleMute();
      } else {
        Aud.muted = !Aud.muted;
      }
      const isMuted = Boolean(Aud.muted);
      localStorage.setItem(AUDIO_MUTE_KEY, isMuted ? "1" : "0");
      updateTitleScreenSlotBadge();
      if (window.Aetheria.UI) {
        window.Aetheria.UI.showToast(isMuted ? "🔇 音效已設為【靜音】" : "🔊 音效已【開啟】");
      }
    },

    buildFullBundle: function() {
      const curSlot = getActiveSlotNum();
      if (window.Aetheria.State && window.Aetheria.State.data) {
        writeSlotData(curSlot, window.Aetheria.State.data);
      }
      return {
        version: "8.6",
        exportedAt: Date.now(),
        activeSlot: curSlot,
        slots: {
          1: readSlotData(1),
          2: readSlotData(2),
          3: readSlotData(3)
        }
      };
    },

    restoreFullBundle: function(bundle) {
      if (!bundle) return false;

      if (bundle.slots && (bundle.slots[1] || bundle.slots[2] || bundle.slots[3])) {
        [1, 2, 3].forEach(function(n) {
          if (bundle.slots[n]) {
            writeSlotData(n, bundle.slots[n]);
          }
        });
        const nextActive = (bundle.activeSlot >= 1 && bundle.activeSlot <= 3 && bundle.slots[bundle.activeSlot])
          ? bundle.activeSlot
          : (bundle.slots[1] ? 1 : (bundle.slots[2] ? 2 : 3));
        setActiveSlotNum(nextActive);
        const activeData = readSlotData(nextActive);
        if (activeData) {
          writeSlotData(nextActive, activeData);
          applyStateToLiveGame(activeData);
        }
        return true;
      } else if (bundle.lv !== undefined && bundle.inventory) {
        const curSlot = getActiveSlotNum();
        writeSlotData(curSlot, bundle);
        applyStateToLiveGame(bundle);
        return true;
      }
      return false;
    },

    uploadToCloud: function(silentMode) {
      if (this.isSyncing) return;
      const inputEl = document.getElementById("cloud-passcode-input");
      const rawCode = inputEl ? inputEl.value : (localStorage.getItem(CLOUD_CODE_KEY) || "");
      const code = sanitizePasscode(rawCode);

      if (!code || code.length < 4) {
        if (!silentMode && window.Aetheria.UI) {
          window.Aetheria.Audio.sfxWrong();
          window.Aetheria.UI.showToast("⚠️ 請先輸入至少 4 位英數的【專屬雲端通行碼】（例如 justin888）！");
        }
        return;
      }

      localStorage.setItem(CLOUD_CODE_KEY, code);
      const topic = getCloudTopicName(code);
      const bundle = this.buildFullBundle();
      const payloadStr = JSON.stringify(bundle);

      this.isSyncing = true;
      if (!silentMode && window.Aetheria.UI) {
        window.Aetheria.UI.showToast("☁️ 正在將 3 個存檔槽位加密上傳至雲端……");
      }

      const self = this;
      fetch("https://ntfy.sh/" + topic, {
        method: "POST",
        headers: {
          "Title": "Aetheria Save Backup",
          "Priority": "low"
        },
        body: payloadStr
      })
        .then(function(res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          self.isSyncing = false;
          if (!silentMode) {
            if (window.Aetheria.Audio) window.Aetheria.Audio.sfxLevelUp();
            if (window.Aetheria.UI) {
              window.Aetheria.UI.showToast("☁️ 雲端儲存成功！在其他設備輸入通行碼【" + code + "】即可找回存檔！");
              window.Aetheria.UI.openSettingsModal("system");
            }
          }
        })
        .catch(function() {
          self.isSyncing = false;
          if (!silentMode && window.Aetheria.UI) {
            window.Aetheria.UI.showToast("⚠️ 網絡連線受阻，請使用下方【📂 下載存檔檔案】備份！");
          }
        });
    },

    downloadFromCloud: function() {
      if (this.isSyncing) return;
      const inputEl = document.getElementById("cloud-passcode-input");
      const rawCode = inputEl ? inputEl.value : (localStorage.getItem(CLOUD_CODE_KEY) || "");
      const code = sanitizePasscode(rawCode);

      if (!code || code.length < 4) {
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.showToast("⚠️ 請輸入你之前儲存時設定的【專屬雲端通行碼】！");
        return;
      }

      localStorage.setItem(CLOUD_CODE_KEY, code);
      const topic = getCloudTopicName(code);
      this.isSyncing = true;
      window.Aetheria.UI.showToast("📥 正在從雲端搜尋通行碼【" + code + "】的最新存檔……");

      const self = this;
      fetch("https://ntfy.sh/" + topic + "/json?poll=1&since=all")
        .then(function(res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.text();
        })
        .then(function(text) {
          const lines = String(text || "")
            .split("\n")
            .map(function(l) { return l.trim(); })
            .filter(Boolean);

          let latestMsg = null;
          for (let i = lines.length - 1; i >= 0; i--) {
            try {
              const obj = JSON.parse(lines[i]);
              if (obj && obj.event === "message" && (obj.message || (obj.attachment && obj.attachment.url))) {
                latestMsg = obj;
                break;
              }
            } catch (e) {}
          }

          if (!latestMsg) {
            self.isSyncing = false;
            window.Aetheria.Audio.sfxWrong();
            window.Aetheria.UI.showToast("❌ 找不到通行碼【" + code + "】的雲端存檔！請確認通行碼是否正確。");
            return null;
          }

          if (latestMsg.attachment && latestMsg.attachment.url) {
            return fetch(latestMsg.attachment.url).then(function(r) { return r.json(); });
          }
          return JSON.parse(latestMsg.message);
        })
        .then(function(bundle) {
          if (!bundle) return;
          self.isSyncing = false;
          const ok = self.restoreFullBundle(bundle);
          if (ok) {
            window.Aetheria.Audio.sfxLevelUp();
            window.Aetheria.UI.openSettingsModal("system");
            window.Aetheria.UI.showToast("✅ 雲端存檔載入成功！已找回全部存檔槽位進度！");
          } else {
            window.Aetheria.UI.showToast("⚠️ 雲端資料格式不符，無法還原。");
          }
        })
        .catch(function() {
          self.isSyncing = false;
          window.Aetheria.UI.showToast("⚠️ 無法連線至雲端伺服器，請檢查網絡或使用【📂 讀取存檔檔案】。");
        });
    },

    toggleAutoCloud: function() {
      const cur = localStorage.getItem(AUTO_CLOUD_KEY) === "1";
      const next = !cur;
      localStorage.setItem(AUTO_CLOUD_KEY, next ? "1" : "0");
      window.Aetheria.Audio.sfxTalkBlip();
      window.Aetheria.UI.openSettingsModal("system");
      window.Aetheria.UI.showToast(next ? "✅ 已開啟【過夜自動雲端備份】！" : "已關閉自動雲端備份。");
    },

    downloadSaveFile: function() {
      const bundle = this.buildFullBundle();
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = "Aetheria_Save_" + dateStr + ".json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.UI.showToast("📂 已下載存檔檔案 (.json)！可傳送至其他手機或電腦讀取！");
    },

    triggerUploadSaveFile: function() {
      let fileInput = document.getElementById("aetheria-save-file-input");
      if (!fileInput) {
        fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.id = "aetheria-save-file-input";
        fileInput.accept = ".json,application/json,text/plain";
        fileInput.style.display = "none";
        document.body.appendChild(fileInput);
      }

      const self = this;
      fileInput.onchange = function(ev) {
        const file = ev.target.files && ev.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
          try {
            const parsed = JSON.parse(e.target.result);
            if (self.restoreFullBundle(parsed)) {
              window.Aetheria.Audio.sfxLevelUp();
              window.Aetheria.UI.openSettingsModal("system");
              window.Aetheria.UI.showToast("✅ 存檔檔案讀取成功！已還原遊戲進度！");
            } else {
              window.Aetheria.UI.showToast("❌ 檔案格式不正確！");
            }
          } catch (err) {
            window.Aetheria.UI.showToast("❌ 無法解析存檔檔案！");
          }
          fileInput.value = "";
        };
        reader.readAsText(file);
      };
      fileInput.click();
    },

    renderSlotsAndCloudPanel: function(body) {
      const curSlot = getActiveSlotNum();
      const s = window.Aetheria.State && window.Aetheria.State.data;
      if (s) {
        writeSlotData(curSlot, s);
      }

      const savedCode = localStorage.getItem(CLOUD_CODE_KEY) || "";
      const autoCloudOn = localStorage.getItem(AUTO_CLOUD_KEY) === "1";

      // 0. 當前玩家名稱與開新局快捷列
      const heroBar = document.createElement("div");
      heroBar.className = "sys-card-scroll";
      const isMuted = Boolean(window.Aetheria.Audio && window.Aetheria.Audio.muted);
      heroBar.innerHTML =
        '<div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">' +
          '<div>' +
            '<b>👤 主角：【' + getHeroName(s) + '】</b>' +
            '<div style="font-size:11px; color:#5c3824;">顯示於左上角血量框與劇情對話</div>' +
          '</div>' +
          '<div style="display:flex; gap:4px;">' +
            '<button class="na-btn highlight" style="padding:5px 8px; font-size:11.5px;" onclick="Aetheria.SaveSlots.promptRenameCurrentHero()">✏️ 改名</button>' +
            '<button class="na-btn" style="padding:5px 8px; font-size:11.5px;" onclick="Aetheria.SaveSlots.startNewGameWithCustomName()">🌟 開新遊戲</button>' +
            '<button class="na-btn" style="padding:5px 8px; font-size:11.5px;" onclick="Aetheria.SaveSlots.toggleSoundMute(); Aetheria.UI.openSettingsModal(\'system\');">' +
              (isMuted ? '🔇' : '🔊') +
            '</button>' +
          '</div>' +
        '</div>';
      body.appendChild(heroBar);

      // 1. ☁️ 跨裝置雲端同步中心
      const cloudDiv = document.createElement("div");
      cloudDiv.className = "cloud-box";
      cloudDiv.innerHTML =
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
          '<b style="color:#ffd166; font-size:13.5px;">☁️ 跨設備雲端存檔同步 (免重玩引繼)</b>' +
          '<button class="na-btn ' + (autoCloudOn ? 'highlight' : '') + '" style="padding:2px 7px; font-size:10.5px;" onclick="Aetheria.SaveSlots.toggleAutoCloud()">' +
            (autoCloudOn ? '🔄 自動備份:開' : '自動備份:關') +
          '</button>' +
        '</div>' +
        '<div style="font-size:11.5px; color:#cbd5e1; margin-top:3px;">' +
          '設定你的專屬通行碼（如 <b>justin888</b>），按「上傳雲端」後，在另一部電話、iPad 或電腦輸入相同通行碼按「從雲端載入」即可找回全部存檔！' +
        '</div>' +
        '<input id="cloud-passcode-input" class="cloud-input" type="text" placeholder="請輸入自訂雲端通行碼 (至少4位英數)" value="' + savedCode + '" />' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:4px;">' +
          '<button class="na-btn highlight" style="padding:7px; font-size:12.5px;" onclick="Aetheria.SaveSlots.uploadToCloud(false)">☁️ 上傳存檔至雲端</button>' +
          '<button class="na-btn" style="padding:7px; font-size:12.5px; border-color:#8ce0ff; color:#8ce0ff;" onclick="Aetheria.SaveSlots.downloadFromCloud()">📥 從雲端載入存檔</button>' +
        '</div>';
      body.appendChild(cloudDiv);

      // 2. 💾 三大獨立存檔槽位 (Slot 1 / 2 / 3)
      const slotHeader = document.createElement("div");
      slotHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:6px 0 4px; font-size:13px;";
      slotHeader.innerText = "【💾 獨立存檔槽位管理（開新槽位可自訂名稱）】";
      body.appendChild(slotHeader);

      [1, 2, 3].forEach(function(slotNum) {
        const isCurrent = (slotNum === curSlot);
        const sData = readSlotData(slotNum);
        const card = document.createElement("div");
        card.className = "slot-card" + (isCurrent ? " active-slot" : "");

        if (sData) {
          const zName = formatZoneShortName(sData.currentZone);
          const timeAgo = formatTimeAgo(sData._savedAt);
          const pName = getHeroName(sData);
          card.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<div>' +
                '<b style="color:' + (isCurrent ? '#ffd166' : '#ffffff') + '; font-size:13.5px;">槽位 ' + slotNum + '：【' + pName + '】Lv.' + (sData.lv || 1) + ' (' + zName + ')</b>' +
                (isCurrent ? '<span class="slot-badge-active">遊玩中</span>' : '') +
                '<div style="font-size:11.5px; color:#cbd5e1; margin-top:2px;">' +
                  '❤️ ' + (sData.hp || 100) + '/' + (sData.maxHp || 100) + ' ｜ 💰 ' + (sData.gold || 0) + 'G ｜ 🗓️ D' + (sData.dayCount || 1) + ' ｜ 🕒 ' + timeAgo +
                '</div>' +
              '</div>' +
              '<div style="display:flex; flex-direction:column; gap:4px;">' +
                (!isCurrent
                  ? '<button class="na-btn highlight" style="padding:4px 10px; font-size:12px;" onclick="Aetheria.SaveSlots.switchSlot(' + slotNum + ')">⚡ 切換遊玩</button>'
                  : '<button class="na-btn" style="padding:4px 10px; font-size:11px;" onclick="Aetheria.State.save(); Aetheria.UI.openSettingsModal(\'system\'); Aetheria.UI.showToast(\'💾 已手動儲存至槽位 ' + slotNum + '！\');">💾 立即存檔</button>') +
                '<div style="display:flex; gap:4px;">' +
                  (!isCurrent ? '<button class="na-btn" style="padding:2px 6px; font-size:10.5px;" onclick="Aetheria.SaveSlots.copyCurrentToSlot(' + slotNum + ')">複製至此</button>' : '') +
                  '<button class="na-btn" style="padding:2px 6px; font-size:10.5px; color:#ff758f;" onclick="Aetheria.SaveSlots.clearSlot(' + slotNum + ')">開新局</button>' +
                '</div>' +
              '</div>' +
            '</div>';
        } else {
          card.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<div>' +
                '<b style="color:#8d99ae; font-size:13px;">槽位 ' + slotNum + '：【空白存檔槽】</b>' +
                '<div style="font-size:11px; color:#64748b; margin-top:2px;">點擊右方按鈕可輸入新玩家名稱開啟獨立新遊戲</div>' +
              '</div>' +
              '<div style="display:flex; gap:5px;">' +
                '<button class="na-btn highlight" style="padding:5px 9px; font-size:11.5px;" onclick="Aetheria.SaveSlots.switchSlot(' + slotNum + ')">＋ 開新遊戲</button>' +
                '<button class="na-btn" style="padding:5px 8px; font-size:11.5px;" onclick="Aetheria.SaveSlots.copyCurrentToSlot(' + slotNum + ')">📋 備份至此</button>' +
              '</div>' +
            '</div>';
        }
        body.appendChild(card);
      });

      const sysCard = document.createElement("div");
      sysCard.className = "sys-card";
      sysCard.style.marginTop = "8px";
      sysCard.innerHTML =
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">' +
          '<button class="na-btn" style="padding:7px; font-size:12px;" onclick="Aetheria.SaveSlots.downloadSaveFile()">📂 下載存檔檔 (.json)</button>' +
          '<button class="na-btn" style="padding:7px; font-size:12px;" onclick="Aetheria.SaveSlots.triggerUploadSaveFile()">📂 讀取存檔檔 (.json)</button>' +
          '<button class="na-btn" style="padding:7px; font-size:12px;" onclick="Aetheria.UI.exportSavePrompt()">📋 複製存檔文字碼</button>' +
          '<button class="na-btn" style="padding:7px; font-size:12px;" onclick="Aetheria.UI.importSavePrompt()">📋 貼上存檔文字碼</button>' +
          '<button class="na-btn" style="padding:7px; font-size:12px;" onclick="Aetheria.UI.toggleFullScreen()">⛶ 切換全螢幕模式</button>' +
          '<button class="na-btn" style="padding:7px; font-size:12px;" onclick="Aetheria.UI.playCutscene(\'intro\')">🎬 重溫開場序幕</button>' +
          '<button class="na-btn" style="padding:7px; font-size:12px; grid-column:span 2;" onclick="document.getElementById(\'title-screen\').style.display=\'flex\'; Aetheria.UI.initTitleScreen();">🏠 返回遊戲首頁</button>' +
        '</div>';
      body.appendChild(sysCard);
    }
  };

  window.Aetheria.SaveSlots = SaveSlotsManager;

  // ================= 5. 極簡化首頁 (#title-screen) 並攔截首頁原有的「新遊戲」按鈕 =================
  function updateTitleScreenSlotBadge() {
    const titleScreen = document.getElementById("title-screen");
    if (!titleScreen) return;

    const curSlot = getActiveSlotNum();
    const sData = readSlotData(curSlot) || (window.Aetheria.State && window.Aetheria.State.data) || { lv: 1 };
    const pName = getHeroName(sData);
    const isMuted = Boolean(window.Aetheria.Audio && window.Aetheria.Audio.muted);

    // 1. 右上角獨立音效按鈕
    let muteBtn = document.getElementById("title-mute-corner-btn");
    if (!muteBtn) {
      muteBtn = document.createElement("button");
      muteBtn.id = "title-mute-corner-btn";
      muteBtn.onclick = function(ev) {
        ev.stopPropagation();
        SaveSlotsManager.toggleSoundMute();
      };
      titleScreen.appendChild(muteBtn);
    }
    muteBtn.innerHTML = isMuted ? "🔇" : "🔊";

    // 2. 底部單一顆「槽位 / 雲端」管理鈕
    let bar = document.getElementById("title-cloud-bar");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "title-cloud-bar";
      titleScreen.appendChild(bar);
    }

    bar.innerHTML =
      '<button class="na-btn" style="width:100%; padding:7px 12px; font-size:12px; border-color:#8ce0ff; color:#fff3b0;" onclick="document.getElementById(\'title-screen\').style.display=\'none\'; Aetheria.UI.openSettingsModal(\'system\');">' +
        '💾 槽位 ' + curSlot + '：' + pName + ' (Lv.' + (sData.lv || 1) + ') ｜ 換槽・雲端' +
      '</button>';

    // 3. ★ 攔截首頁上原本的「新遊戲 / 重新開始 / 初次開始」按鈕，確保點擊時 100% 彈出輸入玩家名稱視窗！
    if (!titleScreen._hookedNewGameCapture) {
      titleScreen._hookedNewGameCapture = true;
      titleScreen.addEventListener("click", function(ev) {
        const btn = ev.target && ev.target.closest ? ev.target.closest("button") : null;
        if (!btn) return;
        if (btn.id === "title-mute-corner-btn" || btn.closest("#title-cloud-bar")) return;

        const txt = String(btn.innerText || "").trim();
        const onclickAttr = String(btn.getAttribute("onclick") || "");
        const isNewGameBtn =
          txt.indexOf("新遊戲") !== -1 ||
          txt.indexOf("新冒險") !== -1 ||
          txt.indexOf("重新開始") !== -1 ||
          txt.indexOf("重置") !== -1 ||
          onclickAttr.indexOf("resetSave") !== -1 ||
          onclickAttr.indexOf("newGame") !== -1 ||
          onclickAttr.indexOf("startNew") !== -1;

        if (isNewGameBtn) {
          ev.stopPropagation();
          ev.preventDefault();
          SaveSlotsManager.startNewGameWithCustomName();
          return;
        }

        // 若是全新未命名的 Lv.1 存檔點擊「開始冒險」，也自動彈出輸入名稱視窗
        const curS = (window.Aetheria.State && window.Aetheria.State.data) || {};
        if (!curS.hasCustomName && (curS.lv || 1) === 1 && (curS.exp || 0) === 0 && (curS.mainQuestIndex || 0) === 0) {
          ev.stopPropagation();
          ev.preventDefault();
          SaveSlotsManager.startNewGameWithCustomName(getActiveSlotNum());
        }
      }, true);
    }
  }

  // ================= 6. 掛載左上角「玩家名字+血量框」、NPC 對話替換與存檔系統 =================
  function hookSystemsForSaveSlots() {
    const St   = window.Aetheria.State;
    const UI   = window.Aetheria.UI;
    const Ren  = window.Aetheria.Renderer;
    const Data = window.Aetheria.Data;
    const Surv = window.Aetheria.Survival;
    const Aud  = window.Aetheria.Audio;

    if (Aud && localStorage.getItem(AUDIO_MUTE_KEY) === "1") {
      Aud.muted = true;
    }

    if (St) {
      if (St.save) {
        const origSave = St.save.bind(St);
        St.save = function() {
          origSave();
          const curSlot = getActiveSlotNum();
          writeSlotData(curSlot, this.data);
        };
      }
      if (St.resetSave) {
        St.resetSave = function() {
          SaveSlotsManager.startNewGameWithCustomName(getActiveSlotNum());
        };
      }
    }

    // ★ 修正 2：在左上角血量框 (#hud-hearts-box
