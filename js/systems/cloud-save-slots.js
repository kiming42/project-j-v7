/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 三大獨立存檔槽位與跨裝置雲端同步模組 (cloud-save-slots.js - v8.3)
 * 模組化獨立擴充檔：
 *   1. 支援 3 個獨立存檔槽位 (Slot 1 / Slot 2 / Slot 3)，自動將現有進度無縫遷移至槽位 1
 *   2. 支援「☁️ 跨裝置雲端通行碼同步」：輸入自訂通行碼即可在不同手機、iPad 與電腦間一鍵上傳/下載全部存檔
 *   3. 支援「睡覺過夜自動雲端備份」及「.json 存檔檔案直接下載/匯入」雙重保險
 *   4. 同時整合於【遊戲首頁 (#title-screen)】與【設定 ➔ 存檔/重置】分頁
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const ACTIVE_SLOT_KEY   = "AETHERIA_ACTIVE_SLOT_V8";
  const SLOT_KEY_PREFIX   = "AETHERIA_SLOT_V8_";
  const CLOUD_CODE_KEY    = "AETHERIA_CLOUD_PASSCODE_V8";
  const AUTO_CLOUD_KEY    = "AETHERIA_AUTO_CLOUD_V8";
  const LEGACY_SAVE_KEYS  = ["AETHERIA_SAVE_V7", "AETHERIA_SAVE_V6", "AETHERIA_SAVE_V5"];

  // ================= 1. 注入存檔槽位與雲端同步介面 CSS =================
  function injectSaveSlotsStyles() {
    if (document.getElementById("save-slots-v83-styles")) return;
    const style = document.createElement("style");
    style.id = "save-slots-v83-styles";
    style.textContent = `
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
      #title-cloud-bar {
        margin-top: 8px;
        display: flex;
        gap: 6px;
        justify-content: center;
        flex-wrap: wrap;
        z-index: 10;
      }
    `;
    document.head.appendChild(style);
  }

  // ================= 2. 存檔槽位讀寫與無縫遷移核心邏輯 =================
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
      copy._savedAt = Date.now();
      copy._slotNum = num;
      const str = JSON.stringify(copy);
      localStorage.setItem(getSlotStorageKey(num), str);

      // 若寫入的是當前使用中的槽位，同步寫回主存檔 Key 確保重整網頁時直接載入
      if (num === getActiveSlotNum()) {
        LEGACY_SAVE_KEYS.forEach(function(k) {
          localStorage.setItem(k, str);
        });
      }
    } catch (e) {
      console.error("Write slot error:", e);
    }
  }

  // 初次啟動時，自動將現有進度遷移至 Slot 1
  function ensureInitialSlotMigration() {
    const slot1 = readSlotData(1);
    const slot2 = readSlotData(2);
    const slot3 = readSlotData(3);

    if (!slot1 && !slot2 && !slot3) {
      const s = window.Aetheria.State && window.Aetheria.State.data;
      if (s) {
        writeSlotData(1, s);
        setActiveSlotNum(1);
      }
    } else {
      // 確保當前畫面的 State.data 與當前選中的 activeSlot 同步
      const curSlot = getActiveSlotNum();
      const savedSlotData = readSlotData(curSlot);
      if (savedSlotData && window.Aetheria.State && window.Aetheria.State.data) {
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

  // 將指定存檔物件即時套用至當前遊戲畫面（免重新整理網頁）
  function applyStateToLiveGame(targetState) {
    const St = window.Aetheria.State;
    if (!St || !targetState) return;

    St.data = JSON.parse(JSON.stringify(targetState));
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

  // 產生全新 Lv.1 初始存檔結構
  function createFreshDefaultState() {
    const cur = (window.Aetheria.State && window.Aetheria.State.data) || {};
    return {
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

  // ================= 3. 雲端同步與檔案匯出/匯入管理員 =================
  function sanitizePasscode(raw) {
    return String(raw || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "");
  }

  function getCloudTopicName(passcode) {
    // 轉為專屬頻道名稱，確保不同玩家的雲端空間獨立
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
    lastAutoCloudTime: 0,

    // 切換至指定槽位 (1 / 2 / 3)
    switchSlot: function(targetSlot) {
      const curSlot = getActiveSlotNum();
      if (window.Aetheria.State && window.Aetheria.State.data) {
        writeSlotData(curSlot, window.Aetheria.State.data);
      }

      let targetData = readSlotData(targetSlot);
      if (!targetData) {
        if (!confirm("【存檔槽位 " + targetSlot + "】目前是空的。\n要在此槽位建立一個全新的 Lv.1 冒險進度嗎？\n（你原本在槽位 " + curSlot + " 的進度會安全保留！）")) {
          return;
        }
        targetData = createFreshDefaultState();
      }

      setActiveSlotNum(targetSlot);
      writeSlotData(targetSlot, targetData);
      applyStateToLiveGame(targetData);

      if (window.Aetheria.Audio) window.Aetheria.Audio.sfxLevelUp();
      if (window.Aetheria.UI) {
        window.Aetheria.UI.openSettingsModal("system");
        window.Aetheria.UI.showToast("💾 已切換至【存檔槽位 " + targetSlot + "】(Lv." + (targetData.lv || 1) + ")！");
      }
    },

    // 將當前進度複製到另一個槽位作為備份
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

    // 清空/重置指定槽位
    clearSlot: function(slotNum) {
      if (!confirm("確定要清空【存檔槽位 " + slotNum + "】的進度嗎？此操作不會影響其他槽位。")) {
        return;
      }
      if (slotNum === getActiveSlotNum()) {
        const fresh = createFreshDefaultState();
        writeSlotData(slotNum, fresh);
        applyStateToLiveGame(fresh);
      } else {
        localStorage.removeItem(getSlotStorageKey(slotNum));
      }
      if (window.Aetheria.Audio) window.Aetheria.Audio.sfxTalkBlip();
      if (window.Aetheria.UI) {
        window.Aetheria.UI.openSettingsModal("system");
        window.Aetheria.UI.showToast("🗑️ 已重置【存檔槽位 " + slotNum + "】！");
      }
    },

    // 打包全部 3 個槽位為單一 JSON 物件
    buildFullBundle: function() {
      const curSlot = getActiveSlotNum();
      if (window.Aetheria.State && window.Aetheria.State.data) {
        writeSlotData(curSlot, window.Aetheria.State.data);
      }
      return {
        version: "8.3",
        exportedAt: Date.now(),
        activeSlot: curSlot,
        slots: {
          1: readSlotData(1),
          2: readSlotData(2),
          3: readSlotData(3)
        }
      };
    },

    // 還原全部 3 個槽位包裹
    restoreFullBundle: function(bundle) {
      if (!bundle) return false;

      // 兼容單一舊版存檔與新版 3 槽位包裹
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

    // ☁️ 跨裝置雲端上傳
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
            window.Aetheria.UI.showToast("⚠️ 網絡連線受阻，請使用下方【📂 下載存檔檔案】或【複製引繼碼】備份！");
          }
        });
    },

    // 📥 跨裝置從雲端下載找回存檔
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

          // 若存檔較大被轉為 attachment，自動抓取 attachment URL
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

    // 📂 下載 .json 存檔檔案（可存於手機 iCloud / Google Drive / WhatsApp）
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

    // 📂 選擇並讀取 .json 存檔檔案
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

    // 渲染【設定 ➔ 存檔/雲端】完整面板
    renderSlotsAndCloudPanel: function(body) {
      const curSlot = getActiveSlotNum();
      if (window.Aetheria.State && window.Aetheria.State.data) {
        writeSlotData(curSlot, window.Aetheria.State.data);
      }

      const savedCode = localStorage.getItem(CLOUD_CODE_KEY) || "";
      const autoCloudOn = localStorage.getItem(AUTO_CLOUD_KEY) === "1";

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
      slotHeader.innerText = "【💾 獨立存檔槽位管理（支援 3 組不同進度）】";
      body.appendChild(slotHeader);

      [1, 2, 3].forEach(function(slotNum) {
        const isCurrent = (slotNum === curSlot);
        const sData = readSlotData(slotNum);
        const card = document.createElement("div");
        card.className = "slot-card" + (isCurrent ? " active-slot" : "");

        if (sData) {
          const zName = formatZoneShortName(sData.currentZone);
          const timeAgo = formatTimeAgo(sData._savedAt);
          card.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<div>' +
                '<b style="color:' + (isCurrent ? '#ffd166' : '#ffffff') + '; font-size:13.5px;">槽位 ' + slotNum + '：Lv.' + (sData.lv || 1) + ' (' + zName + ')</b>' +
                (isCurrent ? '<span class="slot-badge-active">當前遊玩中</span>' : '') +
                '<div style="font-size:11.5px; color:#cbd5e1; margin-top:2px;">' +
                  '❤️ ' + (sData.hp || 100) + '/' + (sData.maxHp || 100) + ' ｜ 💰 ' + (sData.gold || 0) + 'G ｜ 🗓️ 第' + (sData.dayCount || 1) + '天 ｜ 🕒 ' + timeAgo +
                '</div>' +
              '</div>' +
              '<div style="display:flex; flex-direction:column; gap:4px;">' +
                (!isCurrent
                  ? '<button class="na-btn highlight" style="padding:4px 10px; font-size:12px;" onclick="Aetheria.SaveSlots.switchSlot(' + slotNum + ')">⚡ 切換遊玩</button>'
                  : '<button class="na-btn" style="padding:4px 10px; font-size:11px;" onclick="Aetheria.State.save(); Aetheria.UI.openSettingsModal(\'system\'); Aetheria.UI.showToast(\'💾 已手動儲存至槽位 ' + slotNum + '！\');">💾 立即存檔</button>') +
                '<div style="display:flex; gap:4px;">' +
                  (!isCurrent ? '<button class="na-btn" style="padding:2px 6px; font-size:10.5px;" onclick="Aetheria.SaveSlots.copyCurrentToSlot(' + slotNum + ')">複製至此</button>' : '') +
                  '<button class="na-btn" style="padding:2px 6px; font-size:10.5px; color:#ff758f;" onclick="Aetheria.SaveSlots.clearSlot(' + slotNum + ')">清空</button>' +
                '</div>' +
              '</div>' +
            '</div>';
        } else {
          card.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<div>' +
                '<b style="color:#8d99ae; font-size:13px;">槽位 ' + slotNum + '：【空白存檔槽】</b>' +
                '<div style="font-size:11px; color:#64748b; margin-top:2px;">可開啟全新的 Lv.1 獨立進度，或將當前進度備份至此槽位</div>' +
              '</div>' +
              '<div style="display:flex; gap:5px;">' +
                '<button class="na-btn highlight" style="padding:5px 9px; font-size:11.5px;" onclick="Aetheria.SaveSlots.switchSlot(' + slotNum + ')">＋ 開新進度</button>' +
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
          '<button class="na-btn" style="padding:7px; font-size:12px;" onclick="Aetheria.Audio.toggleMute(); Aetheria.UI.showToast(\'已切換音樂開關！\');">🎵 切換音樂開關</button>' +
          '<button class="na-btn" style="padding:7px; font-size:12px;" onclick="Aetheria.UI.playCutscene(\'intro\')">🎬 重溫開場序幕</button>' +
          '<button class="na-btn" style="padding:7px; font-size:12px;" onclick="document.getElementById(\'title-screen\').style.display=\'flex\'; Aetheria.UI.initTitleScreen();">🏠 返回遊戲首頁</button>' +
        '</div>';
      body.appendChild(sysCard);
    }
  };

  window.Aetheria.SaveSlots = SaveSlotsManager;

  // ================= 4. 在遊戲首頁 (#title-screen) 注入「跨裝置找回存檔 / 切換槽位」快捷鈕 =================
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
    bar.innerHTML =
      '<button class="na-btn highlight" style="padding:6px 12px; font-size:12.5px;" onclick="document.getElementById(\'title-screen\').style.display=\'none\'; Aetheria.UI.openSettingsModal(\'system\');">' +
        '💾 存檔槽位 ' + curSlot + ' (Lv.' + (sData.lv || 1) + ') ＆ ☁️ 跨設備找回存檔' +
      '</button>';
  }

  // ================= 5. 掛載 State.save 與 UI.openSettingsModal =================
  function hookSystemsForSaveSlots() {
    const St   = window.Aetheria.State;
    const UI   = window.Aetheria.UI;
    const Surv = window.Aetheria.Survival;

    if (St && St.save) {
      const origSave = St.save.bind(St);
      St.save = function() {
        origSave();
        const curSlot = getActiveSlotNum();
        writeSlotData(curSlot, this.data);
      };
    }

    if (UI && UI.openSettingsModal) {
      const origOpenSettings = UI.openSettingsModal.bind(UI);
      UI.openSettingsModal = function(tab, previewUnitKey) {
        origOpenSettings(tab, previewUnitKey);
        if (tab === "system") {
          const body = document.getElementById("modal-body");
          if (body && body.children.length > 1) {
            // 保留頂部 Tab Bar，將下方內容替換為「雲端同步 + 3大存檔槽位」面板
            while (body.children.length > 1) {
              body.removeChild(body.lastChild);
            }
            SaveSlotsManager.renderSlotsAndCloudPanel(body);
          }
        }
      };

      // 更新 Tab 名稱為「存檔/雲端」
      const origInitTitle = UI.initTitleScreen ? UI.initTitleScreen.bind(UI) : null;
      if (origInitTitle) {
        UI.initTitleScreen = function() {
          origInitTitle();
          updateTitleScreenSlotBadge();
        };
      }
    }

    // 睡覺過夜時，若玩家已開啟「自動雲端備份」，自動在背景將最新進度同步至雲端
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
    } catch (err) {
      console.error("Cloud Save Slots v8.3 init error:", err);
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(initCloudSaveSlotsModule, 145);
  } else {
    window.addEventListener("load", function() {
      setTimeout(initCloudSaveSlotsModule, 145);
    });
  }
})();
