/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 日夜睡眠、打包料理背包與圖標化分步任務總管 (progression-town.js - v7.3)
 * 更新：1.背包頂部同步顯示「🍲 已打包行前大餐」及生效中料理狀態，支援隨時現食
 *       2.營地料理鍋支援「烹調保留（打包帶上戰場）」與「現食」
 *       3.保留全部 10 位 NPC 動態四階段對話狀態機、傳送陣、公會、工坊、職業與戰寵邏輯
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const MAX_ACTIVE_BOUNTIES = 3;

  function cleanText(str) {
    if (!str) return "";
    return String(str).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "").trim();
  }

  function getItemSpriteKey(matKey) {
    return "mat_" + matKey;
  }

  function formatIconCost(inv, costObj) {
    const S = window.Aetheria.Data.Sprites;
    const mats = window.Aetheria.Data.MATERIALS;
    const parts = [];
    for (const [k, req] of Object.entries(costObj || {})) {
      const m = mats[k] || { name: k };
      const have = inv[k] || 0;
      const ok = have >= req;
      const col = ok ? "#5ac54f" : "#ff758f";
      parts.push(
        '<span style="color:' + col + ';font-weight:900;margin-right:6px;white-space:nowrap;">' +
          S.iconHtml(getItemSpriteKey(k)) + m.name + " " + have + "/" + req + (ok ? "✓" : "") +
        '</span>'
      );
    }
    return parts.join("") || "初始裝備";
  }

  function formatProgressListHtml(list, forDarkBg) {
    if (!list || list.length === 0) return "";
    const S = window.Aetheria.Data.Sprites;
    const mats = window.Aetheria.Data.MATERIALS || {};

    return list.map(function(item) {
      const ok = item.cur >= item.max;
      const col = forDarkBg
        ? (ok ? "#5ac54f" : "#ffd166")
        : (ok ? "#2d6a4f" : "#c1121f");
      const icon = (item.key && mats[item.key] && S && S.iconHtml)
        ? S.iconHtml(getItemSpriteKey(item.key))
        : "";
      return '<span style="color:' + col + ';font-weight:900;margin-right:6px;white-space:nowrap;">' +
        icon + item.name + ":" + item.cur + "/" + item.max + (ok ? "✓" : "") +
      '</span>';
    }).join(" ");
  }

  function buildNextStepHintHtml(s, mq, forDarkBg) {
    if (!mq || !mq.getProgressList) return "";
    const list = mq.getProgressList(s);
    const allMatsReady = list.length > 0 && list.every(function(i) { return i.cur >= i.max; });
    const questDone = mq.checkComplete(s);

    const hlCol = forDarkBg ? "#5ac54f" : "#1d5eb8";
    const stepCol = forDarkBg ? "#ffd166" : "#b5381a";

    if (allMatsReady && !questDone) {
      if (mq.id === "mq_03" || mq.id === "mq_04" || mq.id === "mq_10" || mq.id === "mq_13") {
        return '<span style="color:' + hlCol + ';font-weight:900;">➔ 【步驟②】材料已齊！請回營地打開上方【工坊】打造裝備！</span>';
      }
      if (mq.id === "mq_05" || mq.id === "mq_08" || mq.id === "mq_11" || mq.id === "mq_14" || mq.id === "mq_16") {
        return '<span style="color:' + hlCol + ';font-weight:900;">➔ 【步驟②】建材已齊！請走近地圖上的【工程牌】按 A 鍵投入建造！</span>';
      }
    }

    const craftMatKeys = ["plank", "rope", "nails", "pitch", "heavySail", "firebrick"];
    const missingCraftMat = list.find(function(i) {
      return craftMatKeys.indexOf(i.key) !== -1 && i.cur < i.max;
    });
    if (missingCraftMat) {
      return '<span style="color:' + stepCol + ';font-weight:900;">（提示：' + missingCraftMat.name + ' 需回營地【工坊 ➔ 建材加工】合成）</span>';
    }

    return "";
  }

  function isInCampForgeZone(state) {
    return state.currentZone === "camp_hub" || state.currentZone === "tent_forge";
  }

  function sanitizePlayerPosition() {
    const s = window.Aetheria.State.data;
    const Maps = window.Aetheria.Data.Maps;
    if (!s || !Maps) return;

    const validZones = [
      "camp_hub", "tent_guild", "tent_forge", "zone1_forest", "cave1_mushroom",
      "zone2_canyon", "zone3_coast", "zone4_snow", "zone5_volcano", "zone6_sky", "endless_tower"
    ];

    if (validZones.indexOf(s.currentZone) === -1) {
      s.currentZone = "camp_hub";
      s.heroX = 320;
      s.heroY = 260;
    }

    const mapObj = Maps.getMap(s.currentZone);
    if (mapObj) {
      if (isNaN(s.heroX) || s.heroX < 20 || s.heroX > mapObj.width - 20) s.heroX = 320;
      if (isNaN(s.heroY) || s.heroY < 20 || s.heroY > mapObj.height - 20) s.heroY = 260;
      s.petX = s.heroX - 20;
      s.petY = s.heroY + 4;
    }
  }

  const UIManager = {
    cutsceneQueue: [],
    cutsceneIndex: 0,

    playCutscene: function(cutKey) {
      const scripts = (window.Aetheria.Data.STORY_CUTSCENES && window.Aetheria.Data.STORY_CUTSCENES[cutKey]) || null;
      if (!scripts || scripts.length === 0) return;

      this.cutsceneQueue = scripts;
      this.cutsceneIndex = 0;
      this.renderCurrentCutsceneSlide();
      const modal = document.getElementById("story-cutscene-modal");
      if (modal) modal.style.display = "flex";
    },

    renderCurrentCutsceneSlide: function() {
      const slide = this.cutsceneQueue[this.cutsceneIndex];
      if (!slide) return;
      document.getElementById("story-tag").innerText = slide.tag || "古文明記憶共鳴";
      document.getElementById("story-speaker").innerText = slide.speaker || "";
      document.getElementById("story-content").innerText = slide.text || "";
      const nextBtn = document.getElementById("story-btn-next");
      if (nextBtn) {
        nextBtn.innerText = (this.cutsceneIndex < this.cutsceneQueue.length - 1) ? "繼續 ▸" : "展開行動 ✓";
      }
    },

    advanceCutscene: function() {
      window.Aetheria.Audio.sfxTalkBlip();
      this.cutsceneIndex++;
      if (this.cutsceneIndex < this.cutsceneQueue.length) {
        this.renderCurrentCutsceneSlide();
      } else {
        const modal = document.getElementById("story-cutscene-modal");
        if (modal) modal.style.display = "none";
      }
    },

    decorateNavIcons: function() {
      try {
        const S = window.Aetheria.Data.Sprites;
        if (!S || !S.iconHtml) return;

        const mapBtn   = document.getElementById("nav-btn-map");
        const guildBtn = document.getElementById("nav-btn-guild");
        const forgeBtn = document.getElementById("nav-btn-forge");
        const bagBtn   = document.getElementById("nav-btn-bag");
        const jobBtn   = document.getElementById("nav-btn-job");
        const setBtn   = document.getElementById("nav-btn-set");

        if (mapBtn)   mapBtn.innerHTML   = S.iconHtml("icon_map") + "傳送";
        if (guildBtn) guildBtn.innerHTML = S.iconHtml("icon_scroll") + "日誌";
        if (forgeBtn) forgeBtn.innerHTML = S.iconHtml("icon_forge") + "工坊";
        if (bagBtn)   bagBtn.innerHTML   = S.iconHtml("icon_bag") + "背包";
        if (jobBtn)   jobBtn.innerHTML   = S.iconHtml("icon_sword") + "職/寵";
        if (setBtn)   setBtn.innerHTML   = S.iconHtml("icon_gear") + "設定";
      } catch (e) {}
    },

    initTitleScreen: function() {
      try {
        const Sprites = window.Aetheria.Data.Sprites;
        const previewBox = document.getElementById("title-hero-preview");
        if (previewBox && Sprites) {
          previewBox.innerHTML =
            '<img src="' + Sprites.getDataURL("pet_slime") + '" alt="Slime">' +
            '<img src="' + Sprites.getDataURL("hero_down_0") + '" style="width:72px;height:72px;" alt="Hero">' +
            '<img src="' + Sprites.getDataURL("pet_dragon") + '" alt="Dragon">';
        }

        const hasSave = window.Aetheria.State.hasExistingSave();
        const btnCont = document.getElementById("btn-continue-game");
        const infoEl = document.getElementById("continue-save-info");

        if (hasSave) {
          const sum = window.Aetheria.State.getSaveSummary();
          const mapObj = window.Aetheria.Data.Maps.getMap(sum.zone);
          if (btnCont) btnCont.classList.remove("disabled");
          if (infoEl) infoEl.innerText = "存檔：第" + (sum.dayCount || 1) + "天｜Lv." + sum.lv + "｜位於【" + mapObj.name + "】";
        } else {
          if (btnCont) btnCont.classList.add("disabled");
          if (infoEl) infoEl.innerText = "尚無存檔紀錄，請選擇「新遊戲」";
        }
      } catch (e) {}
    },

    continueGame: function() {
      if (!window.Aetheria.State.hasExistingSave()) return;
      window.Aetheria.State.init();
      sanitizePlayerPosition();
      window.Aetheria.State.save
