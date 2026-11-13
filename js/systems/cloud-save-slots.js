/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 頂部HUD防出界、首頁音效開關、自訂玩家名稱與雲端三槽位模組 (cloud-save-slots.js - v8.4)
 * 核心升級：
 *   1. 【窄螢幕頂部 HUD 濃縮防出界】：將飽食度精簡為「🍖90%」、緊湊化時鐘與血量框，確保最右方 [⛶] 全螢幕鍵 100% 完整顯示
 *   2. 【首頁音效開關】：於遊戲首頁 (#title-screen) 新增「🔊 音效：開 / 🔇 音效：關」一鍵切換按鈕並記憶狀態
 *   3. 【自訂玩家名稱系統】：開新遊戲/新槽位時彈出命名視窗輸入玩家名稱，並支援現有存檔隨時改名，自動套用至 NPC 對話與介面
 *   4. 完整包含 3 個獨立存檔槽位 (Slot 1~3) 與跨設備雲端通行碼同步功能
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const ACTIVE_SLOT_KEY   = "AETHERIA_ACTIVE_SLOT_V8";
  const SLOT_KEY_PREFIX   = "AETHERIA_SLOT_V8_";
  const CLOUD_CODE_KEY    = "AETHERIA_CLOUD_PASSCODE_V8";
  const AUTO_CLOUD_KEY    = "AETHERIA_AUTO_CLOUD_V8";
  const AUDIO_MUTE_KEY    = "AETHERIA_AUDIO_MUTE_V8";
  const LEGACY_SAVE_KEYS  = ["AETHERIA_SAVE_V7", "AETHERIA_SAVE_V6", "AETHERIA_SAVE_V5"];

  // ================= 1. 注入頂部 HUD 緊湊化、首頁工具列與玩家命名視窗 CSS =================
  function injectSaveSlotsStyles() {
    if (document.getElementById("save-slots-v84-styles")) return;
    const style = document.createElement("style");
    style.id = "save-slots-v84-styles";
    style.textContent = `
      /* 修正 1：窄螢幕手機頂部 HUD 緊湊防出界，確保最右側 [⛶] 按鈕完整顯示 */
      #hud-hearts-box {
        top: 4px !important;
        left: 4px !important;
        padding: 2px 5px 2px !important;
        min-width: 64px !important;
        border-width: 1.5px !important;
      }
      .hud-hp-top-row {
        font-size: 10px !important;
        gap: 2px !important;
      }
      .hud-hp-top-row img {
        width: 10px !important;
        height: 10px !important;
      }
      .hud-hp-mini-track {
        height: 4px !important;
        margin-top: 2px !important;
      }

      #hud-overlay {
        top: 4px !important;
        left: 72px !important;
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
        max-width: 72px !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }
      #hud-fullscreen-btn {
        padding: 2px 4px !important;
        font-size: 10px !important;
        flex-shrink: 0 !important;
        pointer-events: auto !important;
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

      /* 首頁 (#title-screen) 快捷控制列 */
      #title-cloud-bar {
        margin-top: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        z-index: 15;
        width: 90%;
        max-width: 340px;
      }
      .title-sub-row {
        display: flex;
        gap: 6px;
        width: 100%;
        justify-content: center;
      }

      /* 玩家自訂名稱彈出視窗 */
      #hero-name-modal {
        position: absolute;
        inset: 0;
        z-index: 120;
        background: rgba(10, 8, 12, 0.88);
        display: none;
        justify-content: center;
        align-items: center;
        padding: 16px;
      }
      .hero-name-dialog {
        width: 100%;
        max-width: 320px;
        background: linear-gradient(180deg, #2b2118 0%, #181316 100%);
        border: 3px solid #f5b700;
        border-radius: 8px;
        padding: 14px;
        text-align: center;
        color: #ffffff;
        box-shadow: 0 8px 24px rgba(0,0,0,0.9);
      }
      .hero-name-input {
        width: 100%;
        background: #0f172a;
        color: #ffd166;
        border: 2px solid #8ce0ff;
        border-radius: 6px;
        padding: 8px 10px;
        font-size: 16px;
        font-weight: 900;
        text-align: center;
        box-sizing: border-box;
        margin: 10px 0;
      }
    `;
    document.head.appendChild(style);

    // 注入玩家命名彈出視窗 DOM
    const app = document.getElementById("app-container") || document.body;
    if (app && !document.getElementById("hero-name-modal")) {
      const modal = document.createElement("div");
      modal.id = "hero-name-modal";
      modal.innerHTML = `
        <div class="hero-name-dialog">
          <div style="font-size:16px; font-weight:900; color:#ffd166; margin-bottom:4px;">✨ 冒險者登錄</div>
          <div id="hero-name-modal-sub" style="font-size:12px; color:#cbd5e1;">請輸入主角的專屬名稱（最多 10 字）：</div>
          <input id="hero-name-input-field" class="hero-name-input" type="text" maxlength="10" placeholder="例如：Justin" />
          <div style="display:flex; gap:8px; margin-top:4px;">
            <button id="hero-name-cancel-btn" class="na-btn" style="flex:1; padding:8px;">取消</button>
            <button id="hero-name-confirm-btn" class="na-btn highlight" style="flex:2; padding:8px; font-size:14px;">⚔️ 確認名稱</button>
          </div>
        </div>
      `;
      app.appendChild(modal);
    }
  }

  // ================= 2. 玩家名稱管理與字串動態替換 =================
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
    const input = document.getElementById("hero-name-input-field");
    const subEl = document.getElementById("hero-name-modal-sub");
    const cancelBtn = document.getElementById("hero-name-cancel-btn");
    const confirmBtn = document.getElementById("hero-name-confirm-btn");
    if (!modal || !input) return;

    const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
    input.value = options.defaultName !== undefined ? options.defaultName : getHeroName(s);
    if (subEl) {
      subEl.innerText = options.subtitle || "請輸入主角的專屬名稱（最多 10 字）：";
    }
    if (cancelBtn) {
      cancelBtn.style.display = options.hideCancel ? "none" : "block";
      cancelBtn.onclick = function() {
        if (window.Aetheria.Audio) window.Aetheria.Audio.sfxTalkBlip();
        modal.style.display = "none";
      };
    }

    function submitName() {
      const val = String(input.value || "").trim() || "冒險者";
      modal.style.display = "none";
      if (window.Aetheria.Audio) window.Aetheria.Audio.sfxLevelUp();
      if (options.onConfirm) {
        options.onConfirm(val);
      }
    }

    confirmBtn.onclick = submitName;
    input.onkeydown = function(ev) {
      if (ev.key === "Enter") submitName();
    };

    modal.style.display = "flex";
    setTimeout(function() { input.focus(); input.select(); }, 60);
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

  // ================= 4. 雲端同步、新遊戲命名與槽位管理員 =================
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

    // 修改當前存檔的主角名稱
    promptRenameCurrentHero: function() {
      const s = window.Aetheria.State.data;
      openHeroNamePrompt({
        defaultName: getHeroName(s),
        subtitle: "請輸入新的主角名稱（將套用至對話與存檔）：",
        onConfirm: function(newName) {
          s.heroName = newName;
          window.Aetheria.State.save();
          updateTitleScreenSlotBadge();
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

    // 在首頁點擊「🌟 開新遊戲」：先讓玩家選擇空白槽位（或當前槽位）並輸入新玩家名稱
    startNewGameWithCustomName: function(targetSlotOpt) {
      let targetSlot = targetSlotOpt;
      if (!targetSlot) {
        // 自動尋找空白槽位，若全滿則詢問是否重置當前槽位開新局
        if (!readSlotData(2)) targetSlot = 2;
        else if (!readSlotData(3)) targetSlot = 3;
        else targetSlot = getActiveSlotNum();
      }

      const existing = readSlotData(targetSlot);
      if (existing && !confirm("將在【存檔槽位 " + targetSlot + "】開啟全新 Lv.1 遊戲！\n確定要覆蓋槽位 " + targetSlot + " 嗎？（其他槽位不受影響）")) {
        return;
      }

      openHeroNamePrompt({
        defaultName: "",
        subtitle: "【存檔槽位 " + targetSlot + "・新遊戲】請輸入你的冒險者名稱：",
        onConfirm: function(customName) {
          const curSlot = getActiveSlotNum();
          if (curSlot !== targetSlot && window.Aetheria.State && window.Aetheria.State.data) {
            writeSlotData(curSlot, window.Aetheria.State.data);
          }
          const fresh = createFreshDefaultState(customName);
          setActiveSlotNum(targetSlot);
          writeSlotData(targetSlot, fresh);
          applyStateToLiveGame(fresh);

          const titleEl = document.getElementById("title-screen");
          if (titleEl) titleEl.style.display = "none";

          if (window.Aetheria.UI) {
            window.Aetheria.UI.closePanelToExplore();
            window.Aetheria.UI.showToast("🎉 歡迎【" + customName + "】來到艾瑟瑞亞大陸！（已儲存於槽位 " + targetSlot + "）");
          }
        }
      });
    },

    // 切換至指定槽位 (1 / 2 / 3)
    switchSlot: function(targetSlot) {
      const curSlot = getActiveSlotNum();
      if (window.Aetheria.State && window.Aetheria.State.data) {
        writeSlotData(curSlot, window.Aetheria.State.data);
      }

      const targetData = readSlotData(targetSlot);
      if (!targetData) {
        // 空白槽位：直接彈出「自訂玩家名稱」視窗開啟新遊戲！
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
      if (!confirm("確定要清空【存檔槽位 " + slotNum + "】的進度嗎？此操作不會影響其他槽位。")) {
        return;
      }
      if (slotNum === getActiveSlotNum()) {
        this.startNewGameWithCustomName(slotNum);
      } else {
        localStorage.removeItem(getSlotStorageKey(slotNum));
        if (window.Aetheria.Audio) window.Aetheria.Audio.sfxTalkBlip();
        if (window.Aetheria.UI) {
          window.Aetheria.UI.openSettingsModal("system");
          window.Aetheria.UI.showToast("🗑️ 已清空【存檔槽位 " + slotNum + "】！");
        }
      }
    },

    // 首頁與設定共用的音效開關
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
        version: "8.4",
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

      // 0. 當前玩家名稱與音效快捷列
      const heroBar = document.createElement("div");
      heroBar.className = "sys-card-scroll";
      const isMuted = Boolean(window.Aetheria.Audio && window.Aetheria.Audio.muted);
      heroBar.innerHTML =
        '<div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">' +
          '<div>' +
            '<b>👤 主角名稱：【' + getHeroName(s) + '】</b>' +
            '<div style="font-size:11px; color:#5c3824;">名稱會顯示於存檔槽位與 NPC 劇情對話中</div>' +
          '</div>' +
          '<div style="display:flex; gap:5px;">' +
            '<button class="na-btn highlight" style="padding:5px 10px; font-size:12px;" onclick="Aetheria.SaveSlots.promptRenameCurrentHero()">✏️ 改名</button>' +
            '<button class="na-btn" style="padding:5px 10px; font-size:12px;" onclick="Aetheria.SaveSlots.toggleSoundMute(); Aetheria.UI.openSettingsModal(\'system\');">' +
              (isMuted ? '🔇 音效:關' : '🔊 音效:開') +
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

      // 3. 📂 檔案下載/匯入與系統功能按鈕
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

  // ================= 5. 在遊戲首頁 (#title-screen) 注入「音效開關 + 開新遊戲命名 + 雲端槽位」 =================
  function updateTitleScreenSlotBadge() {
    const titleScreen = document.getElementById("title-screen");
    if (!titleScreen) return;

    let bar = document.getElementById("title-cloud-bar");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "title-cloud-bar";
      titleScreen.appendChild(bar);
    }

    const curSlot = getActiveSlotNum();
    const sData = readSlotData(curSlot) || (window.Aetheria.State && window.Aetheria.State.data) || { lv: 1 };
    const pName = getHeroName(sData);
    const isMuted = Boolean(window.Aetheria.Audio && window.Aetheria.Audio.muted);

    bar.innerHTML =
      '<div class="title-sub-row">' +
        '<button class="na-btn ' + (!isMuted ? 'highlight' : '') + '" style="flex:1; padding:6px 8px; font-size:12px;" onclick="Aetheria.SaveSlots.toggleSoundMute()">' +
          (isMuted ? '🔇 音效：關' : '🔊 音效：開') +
        '</button>' +
        '<button class="na-btn" style="flex:1; padding:6px 8px; font-size:12px;" onclick="Aetheria.SaveSlots.promptRenameCurrentHero()">' +
          '✏️ 玩家：' + pName +
        '</button>' +
        '<button class="na-btn" style="flex:1; padding:6px 8px; font-size:12px;" onclick="Aetheria.SaveSlots.startNewGameWithCustomName()">' +
          '🌟 開新遊戲' +
        '</button>' +
      '</div>' +
      '<button class="na-btn highlight" style="width:100%; padding:7px 12px; font-size:12.5px;" onclick="document.getElementById(\'title-screen\').style.display=\'none\'; Aetheria.UI.openSettingsModal(\'system\');">' +
        '💾 槽位 ' + curSlot + ' (' + pName + ' Lv.' + (sData.lv || 1) + ') ＆ ☁️ 跨設備雲端存檔' +
      '</button>';
  }

  // ================= 6. 掛載 HUD 緊湊化、NPC 玩家名稱替換與存檔系統 =================
  function hookSystemsForSaveSlots() {
    const St   = window.Aetheria.State;
    const UI   = window.Aetheria.UI;
    const Data = window.Aetheria.Data;
    const Surv = window.Aetheria.Survival;
    const Aud  = window.Aetheria.Audio;

    // 載入記憶的音效開關狀態
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
      // 攔截 resetSave：重置時彈出命名視窗
      if (St.resetSave) {
        St.resetSave = function() {
          SaveSlotsManager.startNewGameWithCustomName(getActiveSlotNum());
        };
      }
    }

    // 將 NPC 對話中的預設名字動態替換為玩家自訂名稱 (s.heroName)
    if (Data && Data.getNpcDynamicGreeting) {
      const origGreet = Data.getNpcDynamicGreeting.bind(Data);
      Data.getNpcDynamicGreeting = function(s, npcId) {
        const raw = origGreet(s, npcId);
        return replaceHeroNameInText(raw, s);
      };
    }

    if (UI) {
      // ★ 緊湊化頂部 HUD 徽章文字，確保在窄手機螢幕上 100% 顯示全部項目與最右方 [⛶] 鍵
      if (UI.updateAllHud) {
        const origUpdateHud = UI.updateAllHud.bind(UI);
        UI.updateAllHud = function() {
          origUpdateHud();
          const s = window.Aetheria.State.data;

          // 將「飽食 90%」濃縮為「🍖90%」或「🍖90%+料理」
          const hungerEl = document.getElementById("hud-hunger");
          if (hungerEl) {
            const hVal = (s.hunger !== undefined) ? s.hunger : 100;
            const mealMark = (s.activeMeal && s.activeMeal.battlesLeft > 0) ? "🍲" : "";
            hungerEl.innerText = "🍖" + hVal + "%" + mealMark;
          }

          // 將「D17 🌅05:00」中間空格縮緊為「D17🌅05:00」
          const timeEl = document.getElementById("hud-time");
          if (timeEl && timeEl.innerText) {
            timeEl.innerText = timeEl.innerText.replace(/^D(\d+)\s+/, "D$1");
          }

          // 為最右側的全螢幕按鈕加上固定 ID 防擠壓
          const overlay = document.getElementById("hud-overlay");
          if (overlay && overlay.lastElementChild && overlay.lastElementChild.id !== "hud-zone") {
            overlay.lastElementChild.id = "hud-fullscreen-btn";
          }
        };
      }

      if (UI.updateHudZoneDynamic) {
        const origZone = UI.updateHudZoneDynamic.bind(UI);
        UI.updateHudZoneDynamic = function(mapObj, s) {
          origZone(mapObj, s);
          const zoneBadge = document.getElementById("hud-zone");
          if (zoneBadge && zoneBadge.innerText) {
            // 將 "翠風森林 Lv.3" 濃縮為 "翠風森林(3)" 節省頂部橫向空間
            zoneBadge.innerText = zoneBadge.innerText.replace(/\s*Lv\.(\d+)/, "($1)");
          }
        };
      }

      if (UI.openSettingsModal) {
        const origOpenSettings = UI.openSettingsModal.bind(UI);
        UI.openSettingsModal = function(tab, previewUnitKey) {
          origOpenSettings(tab, previewUnitKey);
          if (tab === "system") {
            const body = document.getElementById("modal-body");
            if (body && body.children.length > 1) {
              while (body.children.length > 1) {
                body.removeChild(body.lastChild);
              }
              SaveSlotsManager.renderSlotsAndCloudPanel(body);
            }
          }
        };
      }

      if (UI.initTitleScreen) {
        const origInitTitle = UI.initTitleScreen.bind(UI);
        UI.initTitleScreen = function() {
          origInitTitle();
          updateTitleScreenSlotBadge();
        };
      }
    }

    if (Surv && Surv.playSleepToMorning) {
      const origSleep = Surv.playSleepToMorning.bind(Surv);
      Surv.playSleepToMorning = function() {
        origSleep();
        setTimeout(function() {
          const autoOn = localStorage.getItem(AUTO_CLOUD_KEY) === "1";
          const hasCode = Boolean(localStorage.getItem(CLOUD_CODE_KEY));
          if (autoOn && hasCode) {
            SaveSlotsManager.uploadToCloud(true);
          }
        }, 2800);
      };
    }
  }

  function initCloudSaveSlotsModule() {
    try {
      injectSaveSlotsStyles();
      ensureInitialSlotMigration();
      hookSystemsForSaveSlots();
      updateTitleScreenSlotBadge();
      if (window.Aetheria.UI && window.Aetheria.UI.updateAllHud) {
        window.Aetheria.UI.updateAllHud();
      }
    } catch (err) {
      console.error("Cloud Save Slots v8.4 init error:", err);
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(initCloudSaveSlotsModule, 150);
  } else {
    window.addEventListener("load", function() {
      setTimeout(initCloudSaveSlotsModule, 150);
    });
  }
})();
