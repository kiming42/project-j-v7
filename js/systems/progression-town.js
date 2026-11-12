/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 日夜睡眠、口糧烘烤與圖標化分步任務總管 (progression-town.js - v7.0)
 * 新增：1.頂部 HUD 即時更新飽食度 (#hud-hunger)、天數與四時段日夜時鐘 (#hud-time)
 *       2.營地料理鍋新增【睡眠至天亮 (回滿HP與飽食度)】及【隨身口糧快速烘烤】
 *       3.背包介面支援直接食用【微光菇乾 / 鮮魚乾】及點燃【松脂火把】
 *       4.保留 v6.7 全 10 位 NPC 動態四階段對話狀態機與分步任務流程
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
      window.Aetheria.State.save();

      if (window.Aetheria.Renderer) window.Aetheria.Renderer.builtZoneKey = null;

      const titleEl = document.getElementById("title-screen");
      if (titleEl) titleEl.style.display = "none";

      this.decorateNavIcons();
      const mapObj = window.Aetheria.Data.Maps.getMap(window.Aetheria.State.data.currentZone);
      window.Aetheria.Audio.playBgm(mapObj.bgm || "forest");
      this.updateAllHud();
      if (window.Aetheria.Renderer) window.Aetheria.Renderer.renderWorld();
      this.showToast("歡迎回來！當前位於【" + mapObj.name + "】");
    },

    startNewGame: function() {
      if (window.Aetheria.State.hasExistingSave()) {
        if (!confirm("開啟「新遊戲」將會覆蓋現有存檔進度，確定要重新開始嗎？")) return;
      }
      window.Aetheria.State.startFreshNewGame();
      sanitizePlayerPosition();
      window.Aetheria.Data.Maps.refreshAllResources();
      if (window.Aetheria.Renderer) window.Aetheria.Renderer.builtZoneKey = null;

      const titleEl = document.getElementById("title-screen");
      if (titleEl) titleEl.style.display = "none";

      this.decorateNavIcons();
      window.Aetheria.Audio.playBgm("forest");
      this.updateAllHud();
      if (window.Aetheria.Renderer) window.Aetheria.Renderer.renderWorld();

      window.Aetheria.State.data.seenCutscenes.intro = true;
      window.Aetheria.State.save();
      this.playCutscene("intro");
    },

    setActivePanel: function(panelId) {
      document.querySelectorAll(".sub-panel").forEach(function(p) {
        p.classList.remove("active");
      });
      const target = document.getElementById(panelId);
      if (target) target.classList.add("active");
    },

    closePanelToExplore: function() {
      this.setActivePanel("panel-explore");
      this.updateAllHud();
    },

    showToast: function(msg) {
      const t = document.getElementById("toast-banner");
      if (!t) return;
      t.innerText = cleanText(msg);
      t.style.display = "block";
      clearTimeout(t._timer);
      t._timer = setTimeout(function() { t.style.display = "none"; }, 3100);
    },

    spawnFloatingText: function(text, color, onEnemy) {
      const stage = document.getElementById("upper-screen");
      if (!stage) return;
      const el = document.createElement("div");
      el.className = "floating-text";
      el.style.color = color || "#ffffff";
      el.style.left = (onEnemy !== false) ? "58%" : "14%";
      el.style.top = "44%";
      el.innerText = cleanText(text);
      stage.appendChild(el);
      setTimeout(function() { el.remove(); }, 880);
    },

    // ================= v7.0 更新頂部與底部 HUD（含飽食度、日夜時鐘、求生快捷鍵數量） =================
    updateAllHud: function() {
      window.Aetheria.State.recalcMaxHp();
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const jobs = window.Aetheria.Data.JOBS;

      const hasWep = window.Aetheria.State.hasWeaponEquipped();
      const jobName = !hasWep ? "赤手空拳" : (jobs[s.currentJob] ? cleanText(jobs[s.currentJob].name) : "蒼藍劍士");

      const lvEl = document.getElementById("hud-lv");
      if (lvEl) {
        lvEl.innerHTML = S.iconHtml("icon_sword") + "Lv." + s.lv + " " + jobName.slice(0, 4);
      }

      // v7.0：更新飽食度徽章
      const hungerEl = document.getElementById("hud-hunger");
      if (hungerEl) {
        const curH = (s.hunger !== undefined) ? s.hunger : 100;
        hungerEl.className = "na-badge badge-hunger" + (curH <= 20 ? " hungry-warn" : "");
        hungerEl.innerText = "飽食 " + curH + "%";
      }

      // v7.0：更新日夜時段徽章
      const timeEl = document.getElementById("hud-time");
      if (timeEl && window.Aetheria.State.getTimePhase) {
        const phase = window.Aetheria.State.getTimePhase();
        const torchTag = (s.torchTicks && s.torchTicks > 0) ? "🔥" : "";
        timeEl.innerText = "D" + (s.dayCount || 1) + " " + phase.label + torchTag;
      }

      // v7.0：更新右下角 2x2 求生快捷鍵數量
      const rationBtn = document.getElementById("btn-use-ration");
      if (rationBtn) {
        const rCount = ((s.inventory && s.inventory.rationHerb) || 0) + ((s.inventory && s.inventory.rationFish) || 0);
        rationBtn.innerText = rCount > 0 ? ("口糧(" + rCount + ")") : "口糧(充飢)";
      }
      const torchBtn = document.getElementById("btn-use-torch");
      if (torchBtn) {
        const tCount = (s.inventory && s.inventory.torchItem) || 0;
        torchBtn.innerText = (s.torchTicks && s.torchTicks > 0) ? ("🔥" + s.torchTicks + "步") : ("火把(" + tCount + ")");
      }
      const bombBtn = document.getElementById("btn-use-bomb");
      if (bombBtn) {
        const bCount = (s.inventory && s.inventory.bombItem) || 0;
        bombBtn.innerText = "炸彈(" + bCount + ")";
      }

      const mealEl = document.getElementById("hud-meal");
      if (mealEl) {
        if (s.activeMeal && s.activeMeal.battlesLeft > 0 && window.Aetheria.Data.CAMP_MEALS[s.activeMeal.id]) {
          const mObj = window.Aetheria.Data.CAMP_MEALS[s.activeMeal.id];
          mealEl.style.display = "inline-block";
          mealEl.innerText = mObj.name.slice(0, 4) + "(" + s.activeMeal.battlesLeft + ")";
        } else {
          mealEl.style.display = "none";
        }
      }

      const questEl = document.getElementById("hud-quest");
      if (questEl) {
        const mq = window.Aetheria.Data.getCurrentMainQuest(s);
        if (mq) {
          const isAcc = Boolean(s.questProgress && s.questProgress["acc_" + mq.id]);
          const isDone = mq.checkComplete(s);

          if (!isAcc) {
            questEl.innerHTML =
              '<div><span class="q-badge-avail">! 新主線</span> <b>[' + mq.chapter + '] 請先找【' + mq.giverName + '】對話接取任務</b></div>' +
              '<div class="log-prog-line">位置：<b>' + mq.giverZone + '</b>（走近 ' + mq.giverName + ' 按 A 鍵聊天接取）</div>';
          } else if (isDone) {
            const progHtml = mq.getProgressList ? formatProgressListHtml(mq.getProgressList(s), false) : "";
            questEl.innerHTML =
              '<div><span class="q-badge-ready">✓ 可交付</span> <b>[' + mq.chapter + '] ' + cleanText(mq.title) + '</b></div>' +
              '<div class="log-prog-line">' + progHtml + ' <b style="color:#1d5eb8;">➔ 【步驟③】去【' + mq.giverZone + '】找【' + mq.giverName + '】領獎！</b></div>';
          } else {
            const progHtml = mq.getProgressList ? formatProgressListHtml(mq.getProgressList(s), false) : cleanText(mq.desc);
            const nextStepHtml = buildNextStepHintHtml(s, mq, false);
            questEl.innerHTML =
              '<div><span class="q-badge-active">⏳ 進行中</span> <b>[' + mq.chapter + '] ' + cleanText(mq.title) + '</b></div>' +
              '<div class="log-prog-line"><span>① 收集：</span>' + progHtml + ' ' + nextStepHtml + '</div>';
          }
        } else {
          questEl.innerHTML = S.iconHtml("icon_scroll") + "主線全破！無盡試煉之塔最高：第 " + s.maxTowerFloor + " 層";
        }
      }

      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
      this.updateHudZoneDynamic(mapObj, s);
    },

    updateHudZoneDynamic: function(mapObj, s) {
      const zoneBadge = document.getElementById("hud-zone");
      if (!zoneBadge || !mapObj) return;

      const effLv = mapObj.recLv || 1;
      const diff = effLv - s.lv;

      if (mapObj.id === "camp_hub" || mapObj.id === "tent_guild" || mapObj.id === "tent_forge") {
        zoneBadge.className = "na-badge danger-safe";
        zoneBadge.innerText = mapObj.name;
      } else if (diff <= 2) {
        zoneBadge.className = "na-badge danger-safe";
        zoneBadge.innerText = mapObj.name + " (Lv." + effLv + ")";
      } else if (diff <= 6) {
        zoneBadge.className = "na-badge danger-warn";
        zoneBadge.innerText = mapObj.name + " (Lv." + effLv + ")";
      } else {
        zoneBadge.className = "na-badge danger-deadly";
        zoneBadge.innerText = mapObj.name + " (高危 Lv." + effLv + ")";
      }
    },

    // ================= 0-A. 實地拓荒工程藍圖視窗 =================
    openProjectModal: function(projectId) {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const proj = window.Aetheria.Data.SURVIVAL_PROJECTS && window.Aetheria.Data.SURVIVAL_PROJECTS[projectId];
      if (!proj) return;

      const mq = window.Aetheria.Data.getCurrentMainQuest(s);
      if (mq && !s.questProgress["acc_" + mq.id]) {
        s.questProgress["acc_" + mq.id] = true;
        window.Aetheria.State.save();
      }

      if (!s.projectContributions) s.projectContributions = {};
      if (!s.projectContributions[projectId]) s.projectContributions[projectId] = {};
      const contrib = s.projectContributions[projectId];
      const mats = window.Aetheria.Data.MATERIALS;

      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = S.iconHtml("icon_forge") + "拓荒工程：" + proj.name;

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const descCard = document.createElement("div");
      descCard.className = "sys-card-scroll";
      descCard.innerHTML =
        '<b>工程說明：</b><div style="font-size:12px; margin-top:3px;">' + proj.desc + '</div>' +
        '<div style="font-size:12px; color:#1d5eb8; font-weight:900; margin-top:4px;">完工效果：' + proj.rewardText + '</div>';
      body.appendChild(descCard);

      let allReadyToFinish = true;
      Object.entries(proj.cost).forEach(function(entry) {
        const matKey = entry[0];
        const reqTotal = entry[1];
        const putCount = contrib[matKey] || 0;
        const rem = Math.max(0, reqTotal - putCount);
        const inBag = s.inventory[matKey] || 0;
        const mObj = mats[matKey] || { name: matKey };

        if (rem > 0) allReadyToFinish = false;

        const row = document.createElement("div");
        row.className = "sys-card";
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";
        row.innerHTML =
          '<div>' +
            '<b>' + S.iconHtml(getItemSpriteKey(matKey), true) + mObj.name + '</b> ' +
            '<span class="stat-pill" style="color:' + (rem === 0 ? '#5ac54f' : '#ffd166') + ';">已投入 ' + putCount + '/' + reqTotal + '</span>' +
            '<div style="font-size:11px; color:#cbd5e1;">背包持有：' + inBag + ' 個</div>' +
          '</div>' +
          (rem === 0
            ? '<span style="color:#5ac54f; font-weight:900;">✓ 已備齊</span>'
            : '<button class="na-btn ' + (inBag > 0 ? 'highlight' : '') + '" style="padding:5px 10px;" onclick="Aetheria.UI.contributeProjectMat(\'' + projectId + '\', \'' + matKey + '\')">投入建材</button>');
        body.appendChild(row);
      });

      if (allReadyToFinish) {
        this.completeSurvivalProject(projectId);
      } else {
        const tip = document.createElement("div");
        tip.style.cssText = "font-size:12px; color:#ffd166; margin-top:6px; text-align:center;";
        tip.innerText = "提示：厚木板、麻繩、鐵釘、防水膠、風帆與耐火磚可回【鐵匠帳篷 ➔ 工坊 ➔ 建材加工】合成！";
        body.appendChild(tip);
      }
    },

    contributeProjectMat: function(projectId, matKey) {
      const s = window.Aetheria.State.data;
      const proj = window.Aetheria.Data.SURVIVAL_PROJECTS[projectId];
      if (!proj) return;

      if (!s.projectContributions[projectId]) s.projectContributions[projectId] = {};
      const contrib = s.projectContributions[projectId];
      const reqTotal = proj.cost[matKey] || 0;
      const putCount = contrib[matKey] || 0;
      const rem = reqTotal - putCount;
      const inBag = s.inventory[matKey] || 0;

      if (rem <= 0 || inBag <= 0) {
        this.showToast("背包中沒有此項素材！");
        return;
      }

      const giveAmt = Math.min(rem, inBag);
      s.inventory[matKey] -= giveAmt;
      contrib[matKey] = putCount + giveAmt;
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();

      const isAllDone = Object.entries(proj.cost).every(function(entry) {
        return (contrib[entry[0]] || 0) >= entry[1];
      });

      if (isAllDone) {
        this.completeSurvivalProject(projectId);
      } else {
        this.openProjectModal(projectId);
        this.updateAllHud();
        this.showToast("已投入建材 x" + giveAmt + "！");
      }
    },

    completeSurvivalProject: function(projectId) {
      const s = window.Aetheria.State.data;
      const proj = window.Aetheria.Data.SURVIVAL_PROJECTS[projectId];
      if (!proj) return;

      if (!s.projectsBuilt) s.projectsBuilt = {};
      s.projectsBuilt[projectId] = true;
      if (proj.onComplete) proj.onComplete(s);

      const mq = window.Aetheria.Data.getCurrentMainQuest(s);
      if (mq) s.questProgress["acc_" + mq.id] = true;

      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      if (window.Aetheria.Renderer) window.Aetheria.Renderer.builtZoneKey = null;
      this.closePanelToExplore();
      this.showToast("工程落成！【" + proj.name + "】已完工！請找對應 NPC 交付主線領獎！");
    },

    // ================= 0-B. 營地料理鍋 & 睡眠至天亮 =================
    openCookingModal: function() {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const inv = s.inventory;
      const Helper = window.Aetheria.Data.CraftingHelper;
      const phase = window.Aetheria.State.getTimePhase();

      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = S.iconHtml("icon_potion") + "營地料理與休息 (飽食 " + (s.hunger || 0) + "%｜" + phase.label + ")";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const healCard = document.createElement("div");
      healCard.className = "sys-card-scroll";
      healCard.innerHTML =
        '<div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">' +
          '<div><b>營地休息與熱湯</b><div style="font-size:11px; color:#5c3824;">睡眠可跳過黑夜並回滿HP與飽食度</div></div>' +
          '<div style="display:flex; gap:5px;">' +
            '<button class="na-btn" style="padding:5px 8px;" onclick="Aetheria.UI.restAtCampPot()">喝熱湯(+30%飽食)</button>' +
            '<button class="na-btn highlight" style="padding:5px 10px;" onclick="Aetheria.UI.sleepAtCamp()">🌙 睡眠至天亮</button>' +
          '</div>' +
        '</div>';
      body.appendChild(healCard);

      // 快速烘烤隨身口糧區
      const rationHeader = document.createElement("div");
      rationHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:6px 0 4px; font-size:13px;";
      rationHeader.innerText = "【隨身求生口糧烘烤】（可放入背包於野外隨時進食）";
      body.appendChild(rationHeader);

      [
        { id: "wk_ration_herb", name: "烘烤【微光菇乾 x2】(+35%飽食)", toKey: "rationHerb", cost: { herb: 1, branch: 1 } },
        { id: "wk_ration_fish", name: "炭烤【鮮魚乾 x2】(+60%飽食)",   toKey: "rationFish", cost: { fish: 1, branch: 1 } }
      ].forEach(function(rk) {
        const canMake = Helper.canAfford(inv, rk.cost);
        const have = inv[rk.toKey] || 0;
        const rCard = document.createElement("div");
        rCard.className = "sys-card";
        rCard.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<b>' + S.iconHtml(getItemSpriteKey(rk.toKey)) + rk.name + ' <span class="stat-pill">持有 ' + have + '</span></b>' +
            '<button class="na-btn ' + (canMake ? 'highlight' : '') + '" style="padding:4px 10px;" onclick="Aetheria.UI.roastRationAtPot(\'' + rk.id + '\')">烘烤</button>' +
          '</div>' +
          '<div style="font-size:12px; margin-top:2px;">原料：' + formatIconCost(inv, rk.cost) + '</div>';
        body.appendChild(rCard);
      });

      const mealHeader = document.createElement("div");
      mealHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:6px 0 4px; font-size:13px;";
      mealHeader.innerText = "【行前大餐料理】（回滿飽食度與HP，並獲 3 場戰鬥強化）";
      body.appendChild(mealHeader);

      if (s.activeMeal && s.activeMeal.battlesLeft > 0 && window.Aetheria.Data.CAMP_MEALS[s.activeMeal.id]) {
        const curMeal = window.Aetheria.Data.CAMP_MEALS[s.activeMeal.id];
        const curBox = document.createElement("div");
        curBox.className = "sys-card";
        curBox.style.borderColor = "#5ac54f";
        curBox.innerHTML = '<b style="color:#5ac54f;">生效中：【' + curMeal.name + '】（剩 ' + s.activeMeal.battlesLeft + ' 戰）</b>';
        body.appendChild(curBox);
      }

      Object.values(window.Aetheria.Data.CAMP_MEALS).forEach(function(meal) {
        const canCook = Helper.canAfford(inv, meal.cost);
        const mCard = document.createElement("div");
        mCard.className = "sys-card";
        mCard.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<b style="color:var(--na-gold);">' + S.iconHtml("mat_potionHeal") + meal.name + '</b>' +
            '<button class="na-btn ' + (canCook ? 'highlight' : '') + '" style="padding:4px 10px;" onclick="Aetheria.UI.cookCampMeal(\'' + meal.id + '\')">烹調</button>' +
          '</div>' +
          '<div style="font-size:12px; color:#cbd5e1; margin:2px 0;">' + meal.desc + '</div>' +
          '<div style="font-size:12px;">' + formatIconCost(inv, meal.cost) + '</div>';
        body.appendChild(mCard);
      });
    },

    restAtCampPot: function() {
      const s = window.Aetheria.State.data;
      window.Aetheria.State.restoreHunger(30, s.maxHp);
      window.Aetheria.Audio.sfxGather();
      this.openCookingModal();
      this.updateAllHud();
      this.showToast("喝下營地免費熱湯，生命值全滿且飽食度 +30%！");
    },

    sleepAtCamp: function() {
      window.Aetheria.State.sleepUntilMorning();
      window.Aetheria.Audio.sfxLevelUp();
      this.closePanelToExplore();
      this.showToast("🌅 已在營地帳篷睡眠至第 " + window.Aetheria.State.data.dayCount + " 天清晨！生命值與飽食度 100% 恢復！");
    },

    roastRationAtPot: function(wkId) {
      const s = window.Aetheria.State.data;
      const wk = (window.Aetheria.Data.WORKSHOP_RECIPES || []).find(function(r) { return r.id === wkId; });
      if (!wk || !window.Aetheria.Data.CraftingHelper.payCost(s.inventory, wk.cost)) {
        this.showToast("烘烤口糧所需的原料不足！");
        return;
      }
      s.inventory[wk.toKey] = (s.inventory[wk.toKey] || 0) + wk.toCount;
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();
      this.openCookingModal();
      this.updateAllHud();
      this.showToast("成功烘烤：" + wk.name + "！可按右下角【口糧】隨時進食。");
    },

    cookCampMeal: function(mealId) {
      const s = window.Aetheria.State.data;
      const meal = window.Aetheria.Data.CAMP_MEALS[mealId];
      const Helper = window.Aetheria.Data.CraftingHelper;
      if (!meal || !Helper.payCost(s.inventory, meal.cost)) {
        this.showToast("食材不足！");
        return;
      }
      s.activeMeal = { id: meal.id, battlesLeft: meal.battles };
      s.questProgress.cookedOnce = true;
      if (!s.bountyStats) s.bountyStats = { kills: 0, breaks: 0, fishes: 0, meals: 0 };
      s.bountyStats.meals = (s.bountyStats.meals || 0) + 1;
      window.Aetheria.State.restoreHunger(100, s.maxHp);
      window.Aetheria.Audio.sfxLevelUp();
      this.openCookingModal();
      this.updateAllHud();
      this.showToast("享用【" + meal.name + "】！飽食度 100% 恢復並獲得 3 場戰鬥強化！");
    },

    // ================= 1. NPC 對話：v6.7 動態四階段台詞與任務卡片 =================
    openNpcDialogue: function(npcId) {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const npc = window.Aetheria.Data.NPCS_DB[npcId] || window.Aetheria.Data.NPCS_DB.npc_smith;
      const self = this;

      this.setActivePanel("panel-dialogue");
      document.getElementById("npc-name-label").innerText = cleanText(npc.name);
      document.getElementById("npc-role-label").innerText = cleanText(npc.role);
      document.getElementById("npc-speech-text").innerText =
        (window.Aetheria.Data.getNpcDynamicGreeting && window.Aetheria.Data.getNpcDynamicGreeting(s, npcId)) || npc.greeting;

      const portImg = document.getElementById("npc-portrait-img");
      if (portImg) portImg.src = S.getDataURL(npc.sprite);

      const btnGrid = document.getElementById("npc-action-buttons");
      btnGrid.innerHTML = "";

      const mq = window.Aetheria.Data.getCurrentMainQuest(s);
      if (mq && mq.giverNpcId === npcId) {
        const isAcc = Boolean(s.questProgress && s.questProgress["acc_" + mq.id]);
        const mqDone = mq.checkComplete(s);
        const progHtml = mq.getProgressList ? formatProgressListHtml(mq.getProgressList(s), true) : "";
        const nextHint = buildNextStepHintHtml(s, mq, true);

        const mqCard = document.createElement("div");

        if (!isAcc) {
          mqCard.className = "q-card-avail";
          mqCard.innerHTML =
            '<div><span class="q-badge-avail">！可接主線</span> <b>[' + mq.chapter + '] ' + cleanText(mq.title) + '</b></div>' +
            '<div style="font-size:12px; color:#f5e6c4; margin:4px 0;">' + cleanText(mq.desc) + '</div>' +
            '<div style="font-size:12px; color:#ffd166; font-weight:900;">獎勵：' + cleanText(mq.rewardText) + ' ➔ 【點擊此處接受任務】</div>';
          mqCard.onclick = function() {
            s.questProgress["acc_" + mq.id] = true;
            window.Aetheria.Audio.sfxTalkBlip();
            window.Aetheria.State.save();
            self.openNpcDialogue(npcId);
            self.updateAllHud();
            self.showToast("已接受主線任務：【" + cleanText(mq.title) + "】！");
          };
        } else if (mqDone) {
          mqCard.className = "q-card-ready";
          mqCard.innerHTML =
            '<div><span class="q-badge-ready">✓ 可交付領獎！</span> <b>[' + mq.chapter + '] ' + cleanText(mq.title) + '</b></div>' +
            (progHtml ? '<div style="font-size:12px; margin:4px 0;">進度：' + progHtml + '</div>' : '') +
            '<div style="font-size:13px; color:#5ac54f; font-weight:900; margin-top:4px;">★ 條件已達成！點擊立即交付並領取：' + cleanText(mq.rewardText) + '</div>';
          mqCard.onclick = function() {
            self.claimMainQuestFromNpc(mq.id, npcId);
          };
        } else {
          mqCard.className = "q-card-active";
          mqCard.innerHTML =
            '<div><span class="q-badge-active">⏳ 已接取・進行中</span> <b>[' + mq.chapter + '] ' + cleanText(mq.title) + '</b></div>' +
            '<div style="font-size:12px; margin:4px 0;">① 收集進度：' + (progHtml || cleanText(mq.desc)) + '</div>' +
            (nextHint ? '<div style="font-size:12px; margin:3px 0;">' + nextHint + '</div>' : '') +
            '<div style="font-size:11px; color:#8ce0ff;">完成獎勵：' + cleanText(mq.rewardText) + '</div>';
          mqCard.onclick = function() {
            if (mq.id === "mq_01") {
              self.openProjectModal("proj_camp_forge");
            } else {
              self.showToast("任務進行中！請按步驟收集材料並打造指定物品後再回來交付。");
            }
          };
        }
        btnGrid.appendChild(mqCard);
      }

      if (npc.villagerQuests && npc.villagerQuests.length > 0) {
        let allVQsDone = true;
        let shownUnfinishedOne = false;

        npc.villagerQuests.forEach(function(vq) {
          const rec = s.npcQuests && s.npcQuests[vq.id];
          if (!rec || rec.status !== "completed") allVQsDone = false;

          if (!window.Aetheria.Data.isVillagerQuestUnlocked(s, vq)) return;
          if ((!rec || rec.status !== "completed") && shownUnfinishedOne) return;
          if (!rec || rec.status !== "completed") shownUnfinishedOne = true;

          const vCard = document.createElement("div");

          if (!rec) {
            vCard.className = "q-card-avail";
            vCard.innerHTML =
              '<div><span class="q-badge-avail">！可接支線</span> <b>' + vq.title + '</b></div>' +
              '<div style="font-size:12px; color:#f5e6c4; margin:3px 0;">' + vq.desc + '</div>' +
              '<div style="font-size:12px; color:#ffd166; font-weight:900;">報酬：' + vq.rewardText + ' ➔ 【點擊此處接受委託】</div>';
            vCard.onclick = function() { self.acceptVillagerQuest(vq.id, npcId); };
          } else if (rec.status === "accepted") {
            const ready = window.Aetheria.Data.isVillagerQuestReady(s, vq);
            const vProgList = window.Aetheria.Data.getVillagerQuestProgressList(s, vq);
            const vProgHtml = formatProgressListHtml(vProgList, true);

            if (ready) {
              vCard.className = "q-card-ready";
              vCard.innerHTML =
                '<div><span class="q-badge-ready">✓ 可交付領獎！</span> <b>' + vq.title + '</b></div>' +
                '<div style="font-size:12px; margin:4px 0;">當前進度：' + vProgHtml + '</div>' +
                '<div style="font-size:13px; color:#5ac54f; font-weight:900;">★ 點擊立即交付並領取：' + vq.rewardText + '</div>';
              vCard.onclick = function() { self.deliverVillagerQuest(vq.id, npcId); };
            } else {
              vCard.className = "q-card-active";
              vCard.innerHTML =
                '<div><span class="q-badge-active">⏳ 已接取・進行中</span> <b>' + vq.title + '</b></div>' +
                '<div style="font-size:12px; margin:4px 0;">當前進度：' + vProgHtml + '</div>' +
                '<div style="font-size:11px; color:#8ce0ff;">報酬：' + vq.rewardText + '（達成後回來點擊交付）</div>';
              vCard.onclick = function() {
                self.showToast("支線進行中！請先集齊所需物資再回來交付。");
              };
            }
          } else {
            vCard.className = "q-card-done";
            vCard.innerHTML = '<div><span class="q-badge-done">✓ 已完成</span> <b>' + vq.title + '</b></div>';
          }
          btnGrid.appendChild(vCard);
        });

        if (allVQsDone && npc.perkLabel) {
          const perkCooling = s.bountyCooldowns && s.bountyCooldowns["perk_" + npcId];
          const pBtn = document.createElement("button");
          pBtn.className = "na-btn" + (!perkCooling ? " highlight" : "");
          pBtn.style.padding = "8px";
          pBtn.innerHTML = perkCooling
            ? '<span style="color:#8d99ae; font-size:12px;">' + npc.perkLabel + ' (戰鬥 1 場後可再次領取)</span>'
            : '<b style="font-size:13px;">' + S.iconHtml("heart") + npc.perkLabel + '</b>';
          pBtn.onclick = function() {
            if (perkCooling) {
              self.showToast("請先進行 1 場野外戰鬥後再來領取村民回禮！");
              return;
            }
            if (!s.bountyCooldowns) s.bountyCooldowns = {};
            s.bountyCooldowns["perk_" + npcId] = true;
            const msg = npc.onClaimPerk(s);
            window.Aetheria.Audio.sfxGather();
            window.Aetheria.State.save();
            self.openNpcDialogue(npcId);
            self.updateAllHud();
            self.showToast(msg);
          };
          btnGrid.appendChild(pBtn);
        }
      }

      if (npc.serviceLabel) {
        const srvBtn = document.createElement("button");
        srvBtn.className = "na-btn highlight";
        srvBtn.style.padding = "9px";
        if (npcId === "npc_smith" && !(s.projectsBuilt && s.projectsBuilt.proj_camp_forge)) {
          srvBtn.innerHTML = S.iconHtml("icon_forge") + "打開【巴爾的受損鍛造爐】投入枯枝/燧石/黏土";
          srvBtn.onclick = function() { self.openProjectModal("proj_camp_forge"); };
        } else {
          srvBtn.innerHTML = S.iconHtml("icon_forge") + cleanText(npc.serviceLabel);
          srvBtn.onclick = function() {
            if (npc.serviceAction === "openMonolithModal") self.openGuildModal("monolith");
            else if (npc.serviceAction === "openMerchantShop") self.openForgeModal("tool");
            else if (self[npc.serviceAction]) self[npc.serviceAction]();
          };
        }
        btnGrid.appendChild(srvBtn);
      }

      if (npc.pathActions && npc.pathActions.length > 0) {
        const paRow = document.createElement("div");
        paRow.style.cssText = "display:grid; grid-template-columns:1fr 1fr; gap:5px;";
        npc.pathActions.forEach(function(pa) {
          const alreadyDone = Boolean(pa.onceKey && s.questProgress && s.questProgress[pa.onceKey]);
          const btn = document.createElement("button");
          btn.className = "na-btn";
          btn.style.textAlign = "left";
          btn.style.padding = "7px";

          if (alreadyDone) {
            btn.style.opacity = "0.5";
            btn.style.pointerEvents = "none";
            btn.innerHTML = '<div style="color:#8d99ae; font-size:12px;">[已完成] ' + cleanText(pa.label) + '</div>';
          } else {
            btn.innerHTML = '<div style="color:var(--na-gold); font-size:12px;">' + S.iconHtml("icon_sword") + cleanText(pa.label) + '</div><div style="font-size:11px; color:#cbd5e1; margin-top:2px;">' + cleanText(pa.desc) + '</div>';
            btn.onclick = function() {
              if (!window.Aetheria.State.hasWeaponEquipped()) {
                self.showToast("請先修復巴爾的熔爐取得新手忍刀後再進行檢定！");
                return;
              }
              if (pa.type === "spar") {
                window.Aetheria.Battle.pathActionRef = { action: pa, npc: npc };
                window.Aetheria.Battle.startBattle(pa.enemyConfig, "combat");
              } else {
                window.Aetheria.Battle.startPathActionChallenge(pa, npc);
              }
            };
          }
          paRow.appendChild(btn);
        });
        btnGrid.appendChild(paRow);
      }
    },

    claimMainQuestFromNpc: function(mqId, npcId) {
      const s = window.Aetheria.State.data;
      const mq = window.Aetheria.Data.MAIN_QUESTS.find(function(q) { return q.id === mqId; });
      if (!mq || !mq.checkComplete(s) || s.questProgress["claimed_" + mqId]) return;

      s.questProgress["claimed_" + mqId] = true;
      mq.onClaim(s);

      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      if (window.Aetheria.Renderer) window.Aetheria.Renderer.builtZoneKey = null;
      this.openNpcDialogue(npcId);
      this.updateAllHud();
      this.showToast("成功交付主線！獲得：" + cleanText(mq.rewardText));
    },

    acceptVillagerQuest: function(vqId, npcId) {
      const s = window.Aetheria.State.data;
      const npc = window.Aetheria.Data.NPCS_DB[npcId];
      const vq = (npc && npc.villagerQuests || []).find(function(q) { return q.id === vqId; });
      if (!vq) return;

      if (!s.npcQuests) s.npcQuests = {};
      const startVal = (vq.kind === "action" && s.bountyStats) ? (s.bountyStats[vq.statKey] || 0) : 0;
      s.npcQuests[vqId] = { status: "accepted", startVal: startVal, npcId: npcId };

      window.Aetheria.Audio.sfxTalkBlip();
      window.Aetheria.State.save();
      this.openNpcDialogue(npcId);
      this.updateAllHud();
      this.showToast("已接受委託：" + vq.title);
    },

    deliverVillagerQuest: function(vqId, npcId) {
      const s = window.Aetheria.State.data;
      const npc = window.Aetheria.Data.NPCS_DB[npcId];
      const vq = (npc && npc.villagerQuests || []).find(function(q) { return q.id === vqId; });
      if (!vq || !window.Aetheria.Data.isVillagerQuestReady(s, vq)) {
        this.showToast("委託條件尚未達成！");
        return;
      }

      if (vq.kind === "deliver") {
        window.Aetheria.Data.CraftingHelper.payCost(s.inventory, vq.cost);
      }
      s.npcQuests[vqId].status = "completed";
      s.questProgress.bountiesCleared = (s.questProgress.bountiesCleared || 0) + 1;
      vq.onComplete(s);

      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.openNpcDialogue(npcId);
      this.updateAllHud();
      this.showToast("委託完成！獲得：" + vq.rewardText);
    },

    openMerchantShop: function() { this.openForgeModal("tool"); },
    openMonolithModal: function() { this.openGuildModal("monolith"); },

    // ================= 2. 傳送陣 =================
    openWorldMapModal: function() {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const unlockedList = s.unlockedZones || ["camp_hub"];

      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = S.iconHtml("icon_map") + "大陸傳送陣 (" + unlockedList.length + "/" + window.Aetheria.Data.Maps.ORDERED_WORLD_ZONES.length + ")";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      window.Aetheria.Data.Maps.ORDERED_WORLD_ZONES.forEach(function(z) {
        const isUnlocked = unlockedList.indexOf(z.id) !== -1;
        const isCurrent = (s.currentZone === z.id);
        const card = document.createElement("div");
        card.className = isUnlocked ? "sys-card-scroll" : "sys-card";

        if (isUnlocked) {
          card.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b>' + S.iconHtml("icon_map") + z.name + '</b>' +
              '<button class="na-btn highlight" style="padding:4px 10px;" onclick="Aetheria.UI.teleportToZone(\'' + z.id + '\', ' + z.x + ', ' + z.y + ')">' + (isCurrent ? "刷新資源" : "傳送") + '</button>' +
            '</div>' +
            '<div style="font-size:11px; margin-top:2px;">' + z.desc + '</div>';
        } else {
          card.style.opacity = "0.5";
          card.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b style="color:#8d99ae;">[封印中] ' + z.name + '</b>' +
              '<span style="font-size:11px; color:#ff595e;">需擊敗前區領主</span>' +
            '</div>';
        }
        body.appendChild(card);
      });
    },

    teleportToZone: function(zoneId, tx, ty) {
      const s = window.Aetheria.State.data;
      if ((s.unlockedZones || []).indexOf(zoneId) === -1) return;
      window.Aetheria.Data.Maps.refreshAllResources();
      if (zoneId === "endless_tower") {
        window.Aetheria.Data.Maps.advanceTowerFloor(s.maxTowerFloor || 1);
      }
      if (window.Aetheria.Renderer) window.Aetheria.Renderer.builtZoneKey = null;

      s.currentZone = zoneId;
      s.heroX = tx;
      s.heroY = ty;
      s.petX = tx - 20;
      s.petY = ty + 6;
      window.Aetheria.State.save();

      const mapObj = window.Aetheria.Data.Maps.getMap(zoneId);
      window.Aetheria.Audio.playBgm(mapObj.bgm || "forest");
      this.closePanelToExplore();
      this.showToast("已傳送至【" + mapObj.name + "】（資源已刷新）！");
    },

    // ================= 3. 拓荒日誌 =================
    openGuildModal: function(activeTab) {
      activeTab = activeTab || "quest";
      window.Aetheria.State.updateGuildRank();
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const self = this;
      if (!Array.isArray(s.activeBounties)) s.activeBounties = [];
      if (!Array.isArray(s.claimedRankSupplies)) s.claimedRankSupplies = [];
      if (!s.bountyStats) s.bountyStats = { kills: 0, breaks: 0, fishes: 0, meals: 0 };

      this.setActivePanel("panel-modal");

      const ranks = window.Aetheria.Data.GUILD_RANKS;
      const curIdx = ranks.findIndex(function(r) { return r.rank === s.guildRank; });
      const nextRank = (curIdx >= 0 && curIdx + 1 < ranks.length) ? ranks[curIdx + 1] : null;
      const nextReqTxt = nextRank ? ("｜升" + nextRank.rank + "級需 Lv." + nextRank.minLv + " & " + nextRank.minPts + "pt") : "｜最高階";

      document.getElementById("modal-title").innerHTML = S.iconHtml("icon_scroll") + "拓荒日誌 (" + s.guildRank + "級 " + s.guildPoints + "pt" + nextReqTxt + ")";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const tabBar = document.createElement("div");
      tabBar.style.cssText = "display:grid; grid-template-columns:repeat(3, 1fr); gap:5px; margin-bottom:6px;";
      [
        { id: "quest",    label: "當前主線",   icon: "icon_scroll" },
        { id: "bounty",   label: "村民與支線", icon: "icon_sword" },
        { id: "monolith", label: "古文明聖碑", icon: "icon_shield" }
      ].forEach(function(t) {
        const b = document.createElement("button");
        b.className = "na-btn" + (activeTab === t.id ? " highlight" : "");
        b.innerHTML = S.iconHtml(t.icon) + t.label;
        b.onclick = function() { self.openGuildModal(t.id); };
        tabBar.appendChild(b);
      });
      body.appendChild(tabBar);

      if (activeTab === "quest") {
        const mq = window.Aetheria.Data.getCurrentMainQuest(s);
        if (mq) {
          const isAcc = Boolean(s.questProgress && s.questProgress["acc_" + mq.id]);
          const isDone = mq.checkComplete(s);
          const progHtml = mq.getProgressList ? formatProgressListHtml(mq.getProgressList(s), true) : "";
          const nextStepHtml = buildNextStepHintHtml(s, mq, true);

          const mqCard = document.createElement("div");
          if (!isAcc) {
            mqCard.className = "q-card-avail";
            mqCard.innerHTML =
              '<div><span class="q-badge-avail">！待接取主線</span> <b>[' + mq.chapter + '] ' + cleanText(mq.title) + '</b></div>' +
              '<div style="font-size:12px; margin:5px 0;">請前往【' + mq.giverZone + '】找【' + mq.giverName + '】按 A 鍵對話接取此任務！</div>' +
              '<div style="font-size:12px; color:#ffd166;">獎勵：' + cleanText(mq.rewardText) + '</div>';
          } else if (isDone) {
            mqCard.className = "q-card-ready";
            mqCard.innerHTML =
              '<div><span class="q-badge-ready">✓ 可交付領獎！</span> <b>[' + mq.chapter + '] ' + cleanText(mq.title) + '</b></div>' +
              '<div style="font-size:12px; margin:5px 0;">進度：' + progHtml + '</div>' +
              '<div style="font-size:12px; color:#5ac54f; font-weight:900;">★ 目標已達成！請去【' + mq.giverZone + '】找【' + mq.giverName + '】對話領獎！</div>';
          } else {
            mqCard.className = "q-card-active";
            mqCard.innerHTML =
              '<div><span class="q-badge-active">⏳ 已接取・進行中</span> <b>[' + mq.chapter + '] ' + cleanText(mq.title) + '</b></div>' +
              '<div style="font-size:12px; margin:4px 0;">流程：' + cleanText(mq.desc) + '</div>' +
              '<div style="font-size:12px; margin:4px 0;">① 收集進度：' + progHtml + '</div>' +
              (nextStepHtml ? '<div style="font-size:12px; margin:3px 0;">' + nextStepHtml + '</div>' : '') +
              '<div style="font-size:11px; color:#8ce0ff;">交接人：【' + mq.giverName + '】（' + mq.giverZone + '）｜獎勵：' + cleanText(mq.rewardText) + '</div>';
          }
          body.appendChild(mqCard);
        } else {
          const allClearCard = document.createElement("div");
          allClearCard.className = "sys-card-scroll";
          allClearCard.innerHTML = '<b>★ 恭喜！全 21 章拓荒主線已圓滿完成！</b>';
          body.appendChild(allClearCard);
        }

        const projHeader = document.createElement("div");
        projHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:8px 0 4px; font-size:13px;";
        projHeader.innerText = "【大陸實地拓荒工程進度】";
        body.appendChild(projHeader);

        Object.values(window.Aetheria.Data.SURVIVAL_PROJECTS).forEach(function(p) {
          const built = Boolean(s.projectsBuilt && s.projectsBuilt[p.id]);
          const row = document.createElement("div");
          row.className = "sys-card";
          row.style.display = "flex";
          row.style.justifyContent = "space-between";
          row.innerHTML =
            '<span><b>' + p.name + '</b></span>' +
            '<span style="color:' + (built ? '#5ac54f' : '#ffd166') + ';font-weight:bold;">' + (built ? '✓ 已完工' : '待建造') + '</span>';
          body.appendChild(row);
        });
      }

      else if (activeTab === "bounty") {
        const vHeader = document.createElement("div");
        vHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin-bottom:4px; font-size:13px;";
        vHeader.innerText = "【各區村民委託進度】";
        body.appendChild(vHeader);

        let hasAnyVillagerQuest = false;
        Object.values(window.Aetheria.Data.NPCS_DB).forEach(function(npc) {
          if (!npc.villagerQuests || npc.villagerQuests.length === 0) return;
          npc.villagerQuests.forEach(function(vq) {
            const rec = s.npcQuests && s.npcQuests[vq.id];
            if (!rec) return;
            hasAnyVillagerQuest = true;
            const ready = window.Aetheria.Data.isVillagerQuestReady(s, vq);
            const vProgHtml = formatProgressListHtml(window.Aetheria.Data.getVillagerQuestProgressList(s, vq), true);

            const card = document.createElement("div");
            if (rec.status === "completed") {
              card.className = "q-card-done";
              card.innerHTML = '<div><span class="q-badge-done">✓ 已完成</span> <b>' + vq.title + '</b>（' + npc.name + '）</div>';
            } else if (ready) {
              card.className = "q-card-ready";
              card.innerHTML =
                '<div><span class="q-badge-ready">✓ 可交付領獎！</span> <b>' + vq.title + '</b></div>' +
                '<div style="font-size:12px; margin:3px 0;">進度：' + vProgHtml + '</div>' +
                '<div style="font-size:12px; color:#5ac54f; font-weight:900;">★ 請找【' + npc.name + '】（' + (npc.zoneName || "營地") + '）交付領獎！</div>';
            } else {
              card.className = "q-card-active";
              card.innerHTML =
                '<div><span class="q-badge-active">⏳ 進行中</span> <b>' + vq.title + '</b></div>' +
                '<div style="font-size:12px; margin:3px 0;">進度：' + vProgHtml + '</div>' +
                '<div style="font-size:11px; color:#8ce0ff;">委託人：【' + npc.name + '】（' + (npc.zoneName || "營地") + '）｜報酬：' + vq.rewardText + '</div>';
            }
            body.appendChild(card);
          });
        });

        if (!hasAnyVillagerQuest) {
          const tipBox = document.createElement("div");
          tipBox.className = "sys-card";
          tipBox.innerHTML = "尚未接取村民委託！請尋找頭頂有黃色 <b>[!新任務]</b> 的村民按 A 鍵接取任務！";
          body.appendChild(tipBox);
        }

        const gHeader = document.createElement("div");
        gHeader.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin:8px 0 4px;";
        gHeader.innerHTML =
          '<b style="color:var(--na-gold);">【公會試煉與錯題討伐】(' + s.activeBounties.length + '/' + MAX_ACTIVE_BOUNTIES + ')</b>' +
          '<button class="na-btn" style="padding:2px 8px; font-size:11px;" onclick="Aetheria.UI.refreshBountyBoard()">換一批(20G)</button>';
        body.appendChild(gHeader);

        const rankAlreadyClaimed = s.claimedRankSupplies.indexOf(s.guildRank) !== -1;
        if (!rankAlreadyClaimed) {
          const supBtn = document.createElement("button");
          supBtn.className = "na-btn highlight";
          supBtn.style.cssText = "width:100%; margin-bottom:6px;";
          supBtn.innerHTML = S.iconHtml("icon_coin") + "領取公會 " + s.guildRank + " 級晉升俸祿";
          supBtn.onclick = function() { self.claimGuildSupply(); };
          body.appendChild(supBtn);
        }

        s.activeBounties.forEach(function(entry) {
          const bId = (typeof entry === "string") ? entry : entry.id;
          const startVal = (typeof entry === "object" && entry.startVal !== undefined) ? entry.startVal : 0;

          if (bId === "bounty_wrong_shadow") {
            const kills = s.wrongBountyKills || 0;
            const ok = kills >= 2;
            const sCard = document.createElement("div");
            sCard.className = ok ? "q-card-ready" : "q-card-active";
            sCard.innerHTML =
              '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<span><span class="' + (ok ? 'q-badge-ready' : 'q-badge-active') + '">' + (ok ? '✓ 可領獎' : '⏳ 進行中') + '</span> <b>[錯題討伐] 暗影幻象 (' + kills + '/2)</b></span>' +
                '<div style="display:flex; gap:4px;">' +
                  (!ok
                    ? '<button class="na-btn highlight" style="padding:3px 8px;" onclick="Aetheria.UI.huntWrongQuestion()">出擊討伐</button>'
                    : '<button class="na-btn highlight" style="padding:3px 8px;" onclick="Aetheria.UI.deliverWrongBounty()">領獎</button>') +
                  '<button class="na-btn" style="padding:3px 6px;" onclick="Aetheria.UI.abandonBounty(\'bounty_wrong_shadow\')">放棄</button>' +
                '</div>' +
              '</div>' +
              '<div style="font-size:11px; color:#8ce0ff; margin-top:2px;">報酬：流沙秘銀x2、聲望+35</div>';
            body.appendChild(sCard);
            return;
          }

          const b = window.Aetheria.Data.GUILD_BOUNTIES.find(function(item) { return item.id === bId; });
          if (!b) return;

          let canDeliver = false;
          let progTxt = "";
          if (b.kind === "action") {
            const cur = (s.bountyStats && s.bountyStats[b.statKey]) || 0;
            const doneCount = Math.max(0, cur - startVal);
            canDeliver = doneCount >= b.reqVal;
            progTxt = b.goalLabel + ": " + Math.min(b.reqVal, doneCount) + "/" + b.reqVal;
          } else if (b.kind === "streak") {
            canDeliver = (s.streak || 0) >= b.reqVal;
            progTxt = "連勝: " + (s.streak || 0) + "/" + b.reqVal;
          }

          const aCard = document.createElement("div");
          aCard.className = canDeliver ? "q-card-ready" : "q-card-active";
          aCard.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<span><span class="' + (canDeliver ? 'q-badge-ready' : 'q-badge-active') + '">' + (canDeliver ? '✓ 可領獎' : '⏳ 進行中') + '</span> <b>' + cleanText(b.title) + ' (' + progTxt + ')</b></span>' +
              '<div style="display:flex; gap:4px;">' +
                '<button class="na-btn ' + (canDeliver ? 'highlight' : '') + '" style="padding:3px 8px;" onclick="Aetheria.UI.deliverGuildBounty(\'' + b.id + '\')">' + (canDeliver ? '領獎' : '未達成') + '</button>' +
                '<button class="na-btn" style="padding:3px 6px;" onclick="Aetheria.UI.abandonBounty(\'' + b.id + '\')">放棄</button>' +
              '</div>' +
            '</div>' +
            '<div style="font-size:11px; color:#8ce0ff; margin-top:2px;">報酬：' + cleanText(b.rewardText) + '</div>';
          body.appendChild(aCard);
        });

        const activeIds = s.activeBounties.map(function(e) { return (typeof e === "string") ? e : e.id; });

        if (activeIds.indexOf("bounty_wrong_shadow") === -1) {
          const wCard = document.createElement("div");
          wCard.className = "q-card-avail";
          wCard.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<span><span class="q-badge-avail">！可接取</span> <b>[錯題討伐] 擊敗 2 隻暗影記憶幻象</b></span>' +
              '<button class="na-btn highlight" style="padding:3px 10px;" onclick="Aetheria.UI.acceptBounty(\'bounty_wrong_shadow\')">接取</button>' +
            '</div>' +
            '<div style="font-size:11px; color:#ffd166; margin-top:2px;">報酬：流沙秘銀x2、聲望+35</div>';
          body.appendChild(wCard);
        }

        window.Aetheria.Data.getAvailableBounties(s).forEach(function(b) {
          if (activeIds.indexOf(b.id) !== -1) return;
          const bCard = document.createElement("div");
          bCard.className = "q-card-avail";
          bCard.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<span><span class="q-badge-avail">！可接取</span> <b>' + cleanText(b.title) + '</b></span>' +
              '<button class="na-btn highlight" style="padding:3px 10px;" onclick="Aetheria.UI.acceptBounty(\'' + b.id + '\')">接取</button>' +
            '</div>' +
            '<div style="font-size:11px; color:#ffd166; margin-top:2px;">報酬：' + cleanText(b.rewardText) + '</div>';
          body.appendChild(bCard);
        });
      }

      else if (activeTab === "monolith") {
        const shardCount = s.inventory.tabletShard || 0;
        const infoBox = document.createElement("div");
        infoBox.className = "sys-card-scroll";
        infoBox.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<b>' + S.iconHtml("mat_tabletShard") + '聖碑殘片：' + shardCount + ' 枚</b>' +
            '<span style="font-size:11px; color:#5c3824;">答對+2點｜獻上殘片+20點</span>' +
          '</div>';
        body.appendChild(infoBox);

        Object.values(window.Aetheria.Data.MONOLITHS_DB).forEach(function(mono) {
          const pts = (s.monolithPts && s.monolithPts[mono.id]) || 0;
          const card = document.createElement("div");
          card.className = "sys-card";
          card.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b style="color:var(--na-gold);">' + mono.name + ' (' + pts + '/100)</b>' +
              (pts < 100
                ? '<button class="na-btn ' + (shardCount > 0 ? 'highlight' : '') + '" style="padding:3px 8px;" onclick="Aetheria.UI.offerTabletShard(\'' + mono.id + '\')">獻上殘片</button>'
                : '<span style="color:#5ac54f; font-weight:bold;">★滿階</span>') +
            '</div>' +
            '<div class="hp-bar-outer" style="margin:4px 0;"><div class="hp-bar-inner" style="background:#38b6ff; width:' + pts + '%;"></div></div>' +
            '<div style="font-size:12px; color:#8ce0ff; font-weight:bold;">' + mono.perks + '</div>';
          body.appendChild(card);
        });
      }
    },

    refreshBountyBoard: function() {
      const s = window.Aetheria.State.data;
      if (s.gold < 20) {
        this.showToast("刷新需要 20 G！");
        return;
      }
      s.gold -= 20;
      s.bountyPoolSeed = (s.bountyPoolSeed || 1) + 1;
      window.Aetheria.Audio.sfxTalkBlip();
      window.Aetheria.State.save();
      this.openGuildModal("bounty");
    },

    offerTabletShard: function(monoId) {
      const s = window.Aetheria.State.data;
      if ((s.inventory.tabletShard || 0) <= 0) {
        this.showToast("尚未持有【古文明聖碑殘片】！");
        return;
      }
      if (s.monolithPts[monoId] >= 100) return;
      s.inventory.tabletShard--;
      s.monolithPts[monoId] = Math.min(100, (s.monolithPts[monoId] || 0) + 20);
      window.Aetheria.State.recalcMaxHp();
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.openGuildModal("monolith");
      this.updateAllHud();
      this.showToast("聖碑共鳴度 +20！");
    },

    acceptBounty: function(bId) {
      const s = window.Aetheria.State.data;
      if (!Array.isArray(s.activeBounties)) s.activeBounties = [];
      const activeIds = s.activeBounties.map(function(e) { return (typeof e === "string") ? e : e.id; });
      if (activeIds.indexOf(bId) !== -1) return;

      if (s.activeBounties.length >= MAX_ACTIVE_BOUNTIES) {
        this.showToast("最多同時接取 " + MAX_ACTIVE_BOUNTIES + " 張試煉！");
        return;
      }

      if (bId === "bounty_wrong_shadow") {
        s.wrongBountyKills = 0;
        s.activeBounties.push({ id: bId, startVal: 0 });
      } else {
        const b = window.Aetheria.Data.GUILD_BOUNTIES.find(function(item) { return item.id === bId; });
        const curStat = (b && b.kind === "action" && s.bountyStats) ? (s.bountyStats[b.statKey] || 0) : 0;
        s.activeBounties.push({ id: bId, startVal: curStat });
      }

      window.Aetheria.Audio.sfxTalkBlip();
      window.Aetheria.State.save();
      this.openGuildModal("bounty");
    },

    abandonBounty: function(bId) {
      const s = window.Aetheria.State.data;
      s.activeBounties = (s.activeBounties || []).filter(function(e) {
        return ((typeof e === "string") ? e : e.id) !== bId;
      });
      window.Aetheria.State.save();
      this.openGuildModal("bounty");
    },

    deliverGuildBounty: function(bountyId) {
      const s = window.Aetheria.State.data;
      if (s.currentZone !== "camp_hub" && s.currentZone !== "tent_guild") {
        this.showToast("請返回【0.公會帳篷】向公會長雷恩交付試煉領獎！");
        return;
      }
      const entry = (s.activeBounties || []).find(function(e) {
        return ((typeof e === "string") ? e : e.id) === bountyId;
      });
      if (!entry) return;

      const b = window.Aetheria.Data.GUILD_BOUNTIES.find(function(item) { return item.id === bountyId; });
      if (!b) return;

      const startVal = (typeof entry === "object" && entry.startVal !== undefined) ? entry.startVal : 0;
      if (b.kind === "action") {
        const cur = (s.bountyStats && s.bountyStats[b.statKey]) || 0;
        if ((cur - startVal) < b.reqVal) {
          this.showToast("尚未達成行動次數！");
          return;
        }
      } else if (b.kind === "streak" && (s.streak || 0) < b.reqVal) {
        this.showToast("連勝尚未達標！");
        return;
      }

      s.activeBounties = s.activeBounties.filter(function(e) {
        return ((typeof e === "string") ? e : e.id) !== bountyId;
      });
      s.bountyPoolSeed = (s.bountyPoolSeed || 1) + 1;
      b.onComplete(s);
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast("試煉完成！獲得：" + cleanText(b.rewardText));
      this.openGuildModal("bounty");
      this.updateAllHud();
    },

    deliverWrongBounty: function() {
      const s = window.Aetheria.State.data;
      if ((s.wrongBountyKills || 0) < 2) {
        this.showToast("尚需擊敗 " + (2 - (s.wrongBountyKills || 0)) + " 隻錯題幻象！");
        return;
      }
      s.activeBounties = (s.activeBounties || []).filter(function(e) {
        return ((typeof e === "string") ? e : e.id) !== "bounty_wrong_shadow";
      });
      s.wrongBountyKills = 0;
      s.inventory.mithril += 2;
      s.questProgress.bountiesCleared = (s.questProgress.bountiesCleared || 0) + 1;
      window.Aetheria.State.gainRewards(120, 150, 35);
      window.Aetheria.Audio.sfxLevelUp();
      this.showToast("錯題討伐完成！獲得【流沙秘銀 x2】與聲望 +35！");
      this.openGuildModal("bounty");
      this.updateAllHud();
    },

    huntWrongQuestion: function() {
      const s = window.Aetheria.State.data;
      if (!window.Aetheria.State.hasWeaponEquipped()) {
        this.showToast("請先修復巴爾的熔爐取得新手忍刀後再出擊！");
        return;
      }
      const targetQId = (s.wrongBook && s.wrongBook.length > 0) ? s.wrongBook[0] : null;
      window.Aetheria.Battle.startBattle(
        { name: "暗影記憶幻象", lv: Math.max(3, s.lv), type: "skull", isBoss: false, forceShiny: true },
        "bounty",
        targetQId
      );
    },

    claimGuildSupply: function() {
      const s = window.Aetheria.State.data;
      if (!Array.isArray(s.claimedRankSupplies)) s.claimedRankSupplies = [];
      if (s.claimedRankSupplies.indexOf(s.guildRank) !== -1) return;

      const rankInfo = window.Aetheria.Data.GUILD_RANKS.find(function(r) { return r.rank === s.guildRank; }) || window.Aetheria.Data.GUILD_RANKS[0];
      s.claimedRankSupplies.push(s.guildRank);
      s.inventory.iron += rankInfo.dailyIron;
      s.inventory.potionHint += rankInfo.dailyPotion;
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();
      this.showToast("領取 " + s.guildRank + " 級俸祿：藍晶礦+" + rankInfo.dailyIron + "、洞察藥水+" + rankInfo.dailyPotion + "！");
      this.openGuildModal("bounty");
      this.updateAllHud();
    },

    // ================= 4. 鐵匠與木工工坊 =================
    openForgeModal: function(activeTab) {
      activeTab = activeTab || "weapon";
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const inv = s.inventory;
      const Helper = window.Aetheria.Data.CraftingHelper;
      const self = this;

      if (!(s.projectsBuilt && s.projectsBuilt.proj_camp_forge)) {
        this.openProjectModal("proj_camp_forge");
        return;
      }

      const inCamp = isInCampForgeZone(s);

      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = S.iconHtml("icon_forge") + (inCamp ? "營地工坊" : "裝備檢視 (回營地可鍛造)") + " (" + s.gold + " G)";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const tabBar = document.createElement("div");
      tabBar.className = "tab-bar-5";
      [
        { id: "weapon",   label: "武器" },
        { id: "armor",    label: "防具" },
        { id: "workshop", label: "建材/口糧" },
        { id: "rune",     label: "符文鑲嵌" },
        { id: "tool",     label: "工具/店" }
      ].forEach(function(t) {
        const b = document.createElement("button");
        b.className = "na-btn" + (activeTab === t.id ? " highlight" : "");
        b.style.fontSize = "12px";
        b.innerText = t.label;
        b.onclick = function() { self.openForgeModal(t.id); };
        tabBar.appendChild(b);
      });
      body.appendChild(tabBar);

      if (activeTab === "weapon") {
        const weaponList = Object.values(window.Aetheria.Data.WEAPONS).sort(function(a, b) { return a.tier - b.tier; });
        let highestOwnedTier = 1;
        weaponList.forEach(function(w) {
          if (s.unlockedWeapons.indexOf(w.id) !== -1 && w.tier > highestOwnedTier) {
            highestOwnedTier = w.tier;
          }
        });

        weaponList.forEach(function(w) {
          const owned = s.unlockedWeapons.indexOf(w.id) !== -1;
          const equipped = (s.equippedWeapon === w.id);

          if (w.tier <= highestOwnedTier + 1) {
            const reqLv = w.reqLv || 1;
            const lvOk = s.lv >= reqLv;
            const canCraft = inCamp && lvOk && Helper.canAfford(inv, w.cost);

            let pills = '<span class="stat-pill">ATK +' + w.atk + '</span>';
            if (w.shieldBreak) pills += '<span class="stat-pill">破盾 +' + w.shieldBreak + '</span>';
            if (w.bpGainBonus) pills += '<span class="stat-pill">BP +' + w.bpGainBonus + '</span>';
            if (!owned) pills += '<span class="stat-pill" style="color:' + (lvOk ? '#5ac54f' : '#ff758f') + ';">需Lv.' + reqLv + '</span>';

            const card = document.createElement("div");
            card.className = owned ? "sys-card-scroll" : "sys-card";
            card.innerHTML =
              '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<b>' + S.iconHtml("icon_sword") + '[T' + w.tier + '] ' + cleanText(w.name) + '</b>' +
                (owned
                  ? '<button class="na-btn ' + (equipped ? 'highlight' : '') + '" style="padding:3px 8px;" onclick="Aetheria.UI.equipWeapon(\'' + w.id + '\')">' + (equipped ? '已裝備' : '裝備') + '</button>'
                  : '<button class="na-btn ' + (canCraft ? 'highlight' : '') + '" style="padding:3px 10px;" onclick="Aetheria.UI.craftWeapon(\'' + w.id + '\')">' + (inCamp ? '鍛造' : '回營地造') + '</button>') +
              '</div>' +
              '<div style="margin-top:3px;">' + pills + '</div>' +
              (!owned ? '<div style="font-size:12px; margin-top:3px;">' + formatIconCost(inv, w.cost) + '</div>' : '');
            body.appendChild(card);
          }
        });
      }

      else if (activeTab === "armor") {
        const armorList = Object.values(window.Aetheria.Data.ARMORS).sort(function(a, b) { return a.tier - b.tier; });
        let highestArmorTier = 1;
        armorList.forEach(function(a) {
          if (s.unlockedArmors.indexOf(a.id) !== -1 && a.tier > highestArmorTier) {
            highestArmorTier = a.tier;
          }
        });

        armorList.forEach(function(a) {
          const owned = s.unlockedArmors.indexOf(a.id) !== -1;
          const equipped = (s.equippedArmor === a.id);

          if (a.tier <= highestArmorTier + 1) {
            const reqLv = a.reqLv || 1;
            const lvOk = s.lv >= reqLv;
            const canCraft = inCamp && lvOk && Helper.canAfford(inv, a.cost);

            let pills = '<span class="stat-pill">DEF +' + a.def + '</span><span class="stat-pill">HP +' + a.hpBonus + '</span>';
            if (a.resistCold) pills += '<span class="stat-pill" style="color:#8ce0ff;">抗寒</span>';
            if (a.resistAll)  pills += '<span class="stat-pill" style="color:#ff9f1c;">抗寒/抗熱</span>';
            if (!owned) pills += '<span class="stat-pill" style="color:' + (lvOk ? '#5ac54f' : '#ff758f') + ';">需Lv.' + reqLv + '</span>';

            const card = document.createElement("div");
            card.className = owned ? "sys-card-scroll" : "sys-card";
            card.innerHTML =
              '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<b>' + S.iconHtml("icon_shield") + '[T' + a.tier + '] ' + a.name + '</b>' +
                (owned
                  ? '<button class="na-btn ' + (equipped ? 'highlight' : '') + '" style="padding:3px 8px;" onclick="Aetheria.UI.equipArmor(\'' + a.id + '\')">' + (equipped ? '已穿戴' : '穿戴') + '</button>'
                  : '<button class="na-btn ' + (canCraft ? 'highlight' : '') + '" style="padding:3px 10px;" onclick="Aetheria.UI.craftArmor(\'' + a.id + '\')">' + (inCamp ? '鍛造' : '回營地造') + '</button>') +
              '</div>' +
              '<div style="margin-top:3px;">' + pills + '</div>' +
              (!owned ? '<div style="font-size:12px; margin-top:3px;">' + formatIconCost(inv, a.cost) + '</div>' : '');
            body.appendChild(card);
          }
        });

        Object.values(window.Aetheria.Data.RELICS).forEach(function(rel) {
          const owned = s.unlockedRelics && s.unlockedRelics.indexOf(rel.id) !== -1;
          const canCraft = inCamp && (s.lv >= (rel.reqLv || 1)) && Helper.canAfford(inv, rel.cost);
          const rCard = document.createElement("div");
          rCard.className = owned ? "sys-card-scroll" : "sys-card";
          rCard.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b>[聖物] ' + rel.name + '</b>' +
              (owned ? '<span style="color:#1d5eb8;font-weight:bold;">已生效</span>' : '<button class="na-btn ' + (canCraft ? 'highlight' : '') + '" style="padding:3px 8px;" onclick="Aetheria.UI.craftRelic(\'' + rel.id + '\')">' + (inCamp ? '鍛造' : '回營地造') + '</button>') +
            '</div>' +
            '<div style="font-size:12px; margin-top:2px;">' + rel.desc + '</div>' +
            (!owned ? '<div style="font-size:12px; margin-top:2px;"><span class="stat-pill">需Lv.' + rel.reqLv + '</span>' + formatIconCost(inv, rel.cost) + '</div>' : '');
          body.appendChild(rCard);
        });
      }

      else if (activeTab === "workshop") {
        const wkHeader = document.createElement("div");
        wkHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin-bottom:5px; font-size:13px;";
        wkHeader.innerText = "【求生火把、口糧與拓荒工程建材加工】";
        body.appendChild(wkHeader);

        (window.Aetheria.Data.WORKSHOP_RECIPES || []).forEach(function(wk) {
          const have = inv[wk.toKey] || 0;
          const canMake = inCamp && Helper.canAfford(inv, wk.cost);
          const card = document.createElement("div");
          card.className = "sys-card";
          card.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b>' + S.iconHtml(getItemSpriteKey(wk.toKey), true) + wk.name + ' <span class="stat-pill">持有 ' + have + '</span></b>' +
              '<button class="na-btn ' + (canMake ? 'highlight' : '') + '" style="padding:4px 10px;" onclick="Aetheria.UI.craftWorkshopMat(\'' + wk.id + '\')">' + (inCamp ? '加工合成' : '需回營地') + '</button>' +
            '</div>' +
            '<div style="font-size:11px; color:#cbd5e1; margin:2px 0;">' + wk.desc + '</div>' +
            '<div style="font-size:12px;">原料：' + formatIconCost(inv, wk.cost) + '</div>';
          body.appendChild(card);
        });
      }

      else if (activeTab === "rune") {
        if (!s.socketedRunes) s.socketedRunes = { weapon: null, armor: null };
        const wRune = s.socketedRunes.weapon ? window.Aetheria.Data.RUNES[s.socketedRunes.weapon] : null;
        const aRune = s.socketedRunes.armor ? window.Aetheria.Data.RUNES[s.socketedRunes.armor] : null;

        const slotBox = document.createElement("div");
        slotBox.className = "sys-card-scroll";
        slotBox.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">' +
            '<span><b>[武器孔]</b>：' + (wRune ? S.iconHtml(getItemSpriteKey(wRune.id)) + wRune.name : '空置') + '</span>' +
            (wRune ? '<button class="na-btn" style="padding:2px 8px;" onclick="Aetheria.UI.unsocketRune(\'weapon\')">拆下</button>' : '') +
          '</div>' +
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<span><b>[防具孔]</b>：' + (aRune ? S.iconHtml(getItemSpriteKey(aRune.id)) + aRune.name : '空置') + '</span>' +
            (aRune ? '<button class="na-btn" style="padding:2px 8px;" onclick="Aetheria.UI.unsocketRune(\'armor\')">拆下</button>' : '') +
          '</div>';
        body.appendChild(slotBox);

        Object.values(window.Aetheria.Data.RUNES).forEach(function(rune) {
          const have = inv[rune.id] || 0;
          const rCard = document.createElement("div");
          rCard.className = "sys-card";
          rCard.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b style="color:var(--na-gold);">' + S.iconHtml(getItemSpriteKey(rune.id)) + rune.name + ' (x' + have + ')</b>' +
              '<div style="display:flex; gap:4px;">' +
                '<button class="na-btn ' + (have > 0 ? 'highlight' : '') + '" style="padding:3px 7px; font-size:11px;" onclick="Aetheria.UI.socketRune(\'weapon\', \'' + rune.id + '\')">鑲武器</button>' +
                '<button class="na-btn ' + (have > 0 ? 'highlight' : '') + '" style="padding:3px 7px; font-size:11px;" onclick="Aetheria.UI.socketRune(\'armor\', \'' + rune.id + '\')">鑲防具</button>' +
              '</div>' +
            '</div>' +
            '<div style="font-size:12px; color:#cbd5e1; margin-top:2px;">' + rune.desc + '</div>';
          body.appendChild(rCard);
        });
      }

      else if (activeTab === "tool" || activeTab === "alchemy") {
        Object.entries(window.Aetheria.Data.TOOLS_UPGRADE).forEach(function(entry) {
          const tKey = entry[0];
          const tDef = entry[1];
          const curLv = (s.tools && s.tools[tKey]) || 0;
          const nextLv = curLv + 1;
          const nextData = tDef.levels[nextLv];

          let condHtml = "";
          let actionBtnHtml = "";

          if (curLv === 0) {
            condHtml = '<div style="font-size:12px; color:#ffd166; margin-top:3px;">取得方式：' + tDef.npcHint + '</div>';
            actionBtnHtml = '<span class="stat-pill" style="color:#ff758f;">找NPC領取</span>';
          } else if (nextData) {
            const reqLv = nextData.reqLv || 1;
            const lvOk = s.lv >= reqLv;
            const canUp = inCamp && lvOk && Helper.canAfford(inv, nextData.cost);
            condHtml =
              '<div style="font-size:12px; color:var(--na-gold); margin-top:2px;">升 Lv.' + nextLv + '：' + cleanText(nextData.desc) + '</div>' +
              '<div style="font-size:12px; margin-top:2px;"><span class="stat-pill" style="color:' + (lvOk ? '#5ac54f' : '#ff758f') + ';">需Lv.' + reqLv + '</span>' + formatIconCost(inv, nextData.cost) + '</div>';
            actionBtnHtml = '<button class="na-btn ' + (canUp ? 'highlight' : '') + '" style="padding:3px 8px;" onclick="Aetheria.UI.upgradeTool(\'' + tKey + '\')">' + (inCamp ? '升級' : '需回營地') + '</button>';
          } else {
            actionBtnHtml = '<span style="color:#5ac54f; font-weight:bold;">滿階</span>';
          }

          const tCard = document.createElement("div");
          tCard.className = "sys-card";
          tCard.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b>' + S.iconHtml("icon_forge") + cleanText(tDef.name) + ' Lv.' + curLv + ' (' + tDef.levels[curLv].title + ')</b>' +
              actionBtnHtml +
            '</div>' +
            condHtml;
          body.appendChild(tCard);
        });

        const shopHeader = document.createElement("div");
        shopHeader.style.cssText = "color:var(--na-gold); font-weight:900; margin:8px 0 4px; font-size:13px;";
        shopHeader.innerText = "【金幣消耗品商店 & 煉金提煉】";
        body.appendChild(shopHeader);

        (window.Aetheria.Data.GOLD_SHOP || []).forEach(function(item) {
          const canBuy = s.gold >= item.goldCost;
          const have = inv[item.toKey] || 0;
          const row = document.createElement("div");
          row.className = "sys-card";
          row.style.display = "flex";
          row.style.justifyContent = "space-between";
          row.style.alignItems = "center";
          row.innerHTML =
            '<span><b>' + S.iconHtml(getItemSpriteKey(item.toKey)) + item.name + '</b> <span class="stat-pill">' + item.goldCost + 'G</span> (有' + have + ')</span>' +
            '<button class="na-btn ' + (canBuy ? 'highlight' : '') + '" style="padding:3px 10px;" onclick="Aetheria.UI.buyGoldItem(\'' + item.id + '\')">購買</button>';
          body.appendChild(row);
        });

        window.Aetheria.Data.ALCHEMY_CONVERSIONS.forEach(function(c) {
          const fromMat = window.Aetheria.Data.MATERIALS[c.fromKey];
          const have = inv[c.fromKey] || 0;
          const row = document.createElement("div");
          row.className = "sys-card";
          row.style.display = "flex";
          row.style.justifyContent = "space-between";
          row.style.alignItems = "center";
          row.innerHTML =
            '<span><b>' + S.iconHtml(getItemSpriteKey(c.toKey)) + cleanText(c.name) + '</b> <span style="font-size:12px;color:#cbd5e1;">(' + fromMat.name + ' ' + have + '/' + c.fromCount + ')</span></span>' +
            '<button class="na-btn ' + (have >= c.fromCount ? 'highlight' : '') + '" style="padding:3px 10px;" onclick="Aetheria.UI.alchemyConvert(\'' + c.id + '\')">提煉</button>';
          body.appendChild(row);
        });
      }
    },

    craftWorkshopMat: function(wkId) {
      const s = window.Aetheria.State.data;
      if (!isInCampForgeZone(s)) {
        this.showToast("需返回【0.曙光營地】找鐵匠巴爾才可加工！");
        return;
      }
      const wk = (window.Aetheria.Data.WORKSHOP_RECIPES || []).find(function(r) { return r.id === wkId; });
      if (!wk || !window.Aetheria.Data.CraftingHelper.payCost(s.inventory, wk.cost)) {
        this.showToast("加工所需天然原材不足！");
        return;
      }
      s.inventory[wk.toKey] = (s.inventory[wk.toKey] || 0) + wk.toCount;
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();
      this.openForgeModal("workshop");
      this.updateAllHud();
      this.showToast("加工成功：" + wk.name + "！");
    },

    socketRune: function(slotType, runeId) {
      const s = window.Aetheria.State.data;
      if ((s.inventory[runeId] || 0) <= 0) {
        this.showToast("尚未持有此魔物核心！");
        return;
      }
      if (!s.socketedRunes) s.socketedRunes = { weapon: null, armor: null };
      if (s.socketedRunes[slotType]) {
        const oldKey = s.socketedRunes[slotType];
        s.inventory[oldKey] = (s.inventory[oldKey] || 0) + 1;
      }
      s.inventory[runeId]--;
      s.socketedRunes[slotType] = runeId;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.openForgeModal("rune");
      this.updateAllHud();
      this.showToast("已鑲嵌【" + window.Aetheria.Data.RUNES[runeId].name + "】！");
    },

    unsocketRune: function(slotType) {
      const s = window.Aetheria.State.data;
      if (!s.socketedRunes || !s.socketedRunes[slotType]) return;
      const oldKey = s.socketedRunes[slotType];
      s.inventory[oldKey] = (s.inventory[oldKey] || 0) + 1;
      s.socketedRunes[slotType] = null;
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();
      this.openForgeModal("rune");
      this.updateAllHud();
    },

    craftArmor: function(aId) {
      const s = window.Aetheria.State.data;
      if (!isInCampForgeZone(s)) {
        this.showToast("需返回【0.曙光營地】找鐵匠巴爾才可鍛造防具！");
        return;
      }
      const a = window.Aetheria.Data.ARMORS[aId];
      const Helper = window.Aetheria.Data.CraftingHelper;
      if (!a || s.lv < (a.reqLv || 1)) {
        this.showToast("需要達 Lv." + (a ? a.reqLv : 1) + " 才可鍛造！");
        return;
      }
      if (!Helper.payCost(s.inventory, a.cost)) {
        this.showToast("鍛造防具素材不足！");
        return;
      }
      s.unlockedArmors.push(aId);
      s.equippedArmor = aId;
      window.Aetheria.State.recalcMaxHp();
      s.hp = s.maxHp;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.openForgeModal("armor");
      this.updateAllHud();
      this.showToast("已鍛造並穿戴【" + a.name + "】！");
    },

    equipArmor: function(aId) {
      const s = window.Aetheria.State.data;
      if (s.unlockedArmors.indexOf(aId) !== -1) {
        s.equippedArmor = aId;
        window.Aetheria.State.recalcMaxHp();
        window.Aetheria.State.save();
        this.openForgeModal("armor");
        this.updateAllHud();
      }
    },

    buyGoldItem: function(shopId) {
      const s = window.Aetheria.State.data;
      const item = (window.Aetheria.Data.GOLD_SHOP || []).find(function(i) { return i.id === shopId; });
      if (!item || s.gold < item.goldCost) {
        this.showToast("金幣不足！");
        return;
      }
      s.gold -= item.goldCost;
      s.inventory[item.toKey] = (s.inventory[item.toKey] || 0) + item.toCount;
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();
      this.openForgeModal("tool");
      this.updateAllHud();
    },

    craftWeapon: function(wId) {
      const s = window.Aetheria.State.data;
      if (!isInCampForgeZone(s)) {
        this.showToast("需返回【0.曙光營地】找鐵匠巴爾才可鍛造新武器！");
        return;
      }
      const w = window.Aetheria.Data.WEAPONS[wId];
      const Helper = window.Aetheria.Data.CraftingHelper;
      if (!w || s.lv < (w.reqLv || 1)) {
        this.showToast("需要達 Lv." + (w ? w.reqLv : 1) + " 才可鍛造！");
        return;
      }
      if (!Helper.payCost(s.inventory, w.cost)) {
        this.showToast("鍛造武器素材不足！");
        return;
      }
      s.unlockedWeapons.push(wId);
      s.equippedWeapon = wId;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.showToast("鍛造成功！已裝備【" + cleanText(w.name) + "】！");
      this.openForgeModal("weapon");
      this.updateAllHud();
    },

    craftRelic: function(rId) {
      const s = window.Aetheria.State.data;
      if (!isInCampForgeZone(s)) {
        this.showToast("需返回【0.曙光營地】找鐵匠巴爾才可鍛造聖物！");
        return;
      }
      const rel = window.Aetheria.Data.RELICS[rId];
      const Helper = window.Aetheria.Data.CraftingHelper;
      if (!rel || s.lv < (rel.reqLv || 1) || !Helper.payCost(s.inventory, rel.cost)) {
        this.showToast("等級或素材不足！");
        return;
      }
      if (!s.unlockedRelics) s.unlockedRelics = [];
      s.unlockedRelics.push(rId);
      if (rel.onCraft) rel.onCraft(s);
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.openForgeModal("armor");
      this.updateAllHud();
      this.showToast("聖物鍛造成功：【" + rel.name + "】永久生效！");
    },

    equipWeapon: function(wId) {
      const s = window.Aetheria.State.data;
      if (s.unlockedWeapons.indexOf(wId) !== -1) {
        s.equippedWeapon = wId;
        window.Aetheria.State.save();
        this.openForgeModal("weapon");
        this.updateAllHud();
      }
    },

    upgradeTool: function(toolKey) {
      const s = window.Aetheria.State.data;
      if (!isInCampForgeZone(s)) {
        this.showToast("需返回【0.曙光營地】找鐵匠巴爾才可升級工具！");
        return;
      }
      const curLv = (s.tools && s.tools[toolKey]) || 0;
      if (curLv === 0) {
        this.showToast("尚未持有此工具！請先找對應村民完成委託領取。");
        return;
      }
      const tDef = window.Aetheria.Data.TOOLS_UPGRADE[toolKey];
      const nextData = tDef && tDef.levels[curLv + 1];
      const Helper = window.Aetheria.Data.CraftingHelper;
      if (!nextData || s.lv < (nextData.reqLv || 1) || !Helper.payCost(s.inventory, nextData.cost)) {
        this.showToast("等級或素材不足！");
        return;
      }
      s.tools[toolKey] = curLv + 1;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.updateAllHud();
      this.showToast("已升級為【Lv." + (curLv + 1) + " " + nextData.title + "】！");
      this.openForgeModal("tool");
    },

    alchemyConvert: function(convId) {
      const s = window.Aetheria.State.data;
      const conv = window.Aetheria.Data.ALCHEMY_CONVERSIONS.find(function(c) { return c.id === convId; });
      if (!conv || (s.inventory[conv.fromKey] || 0) < conv.fromCount) {
        this.showToast("原料數量不足！");
        return;
      }
      s.inventory[conv.fromKey] -= conv.fromCount;
      s.inventory[conv.toKey] = (s.inventory[conv.toKey] || 0) + conv.toCount;
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();
      this.openForgeModal("tool");
      this.updateAllHud();
    },

    // ================= 5. 背包頁面（支援直接使用口糧、火把與藥水） =================
    openBagModal: function(selectedKey) {
      selectedKey = selectedKey || "rationHerb";
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const inv = s.inventory;
      const mats = window.Aetheria.Data.MATERIALS;
      const self = this;

      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = S.iconHtml("icon_bag") + "背包 (金幣：" + s.gold + " G｜飽食：" + (s.hunger || 0) + "%｜HP：" + s.hp + "/" + s.maxHp + ")";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const selMat = mats[selectedKey] || mats.branch;
      const selCount = inv[selectedKey] || 0;
      const selSpKey = getItemSpriteKey(selectedKey);

      let actionBtnHtml = '<span class="stat-pill">Tier ' + selMat.tier + '</span>';
      if (selectedKey === "potionHeal" && selCount > 0) {
        actionBtnHtml = '<button class="na-btn highlight" style="padding:4px 10px;" onclick="Aetheria.UI.useBagHealPotion()">飲用回復</button>';
      } else if ((selectedKey === "rationHerb" || selectedKey === "rationFish") && selCount > 0) {
        actionBtnHtml = '<button class="na-btn highlight" style="padding:4px 10px;" onclick="Aetheria.UI.useBagRation(\'' + selectedKey + '\')">食用充飢</button>';
      } else if (selectedKey === "torchItem" && selCount > 0) {
        actionBtnHtml = '<button class="na-btn highlight" style="padding:4px 10px;" onclick="Aetheria.UI.useBagTorch()">點燃火把</button>';
      }

      const detailBox = document.createElement("div");
      detailBox.className = "sys-card-scroll";
      detailBox.innerHTML =
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
          '<b style="font-size:15px;">' + S.iconHtml(selSpKey, true) + '【' + selMat.name + '】 (持有：' + selCount + ')</b>' +
          actionBtnHtml +
        '</div>' +
        '<div style="font-size:12px; margin-top:2px;">' + selMat.desc + '</div>';
      body.appendChild(detailBox);

      const grid = document.createElement("div");
      grid.className = "bag-grid";

      Object.keys(mats).forEach(function(k) {
        const m = mats[k];
        const count = inv[k] || 0;
        const spKey = getItemSpriteKey(k);
        const slot = document.createElement("div");
        slot.className = "bag-slot" + (k === selectedKey ? " active" : "");
        slot.style.opacity = count > 0 ? "1" : "0.42";
        slot.innerHTML =
          '<div>' + S.iconHtml(spKey, true) + '</div>' +
          '<div class="bag-slot-name">' + m.name + '</div>' +
          '<div class="bag-slot-count">x' + count + '</div>';
        slot.onclick = function() { self.openBagModal(k); };
        grid.appendChild(slot);
      });

      body.appendChild(grid);
    },

    useBagHealPotion: function() {
      const s = window.Aetheria.State.data;
      if ((s.inventory.potionHeal || 0) <= 0 || s.hp >= s.maxHp) return;
      s.inventory.potionHeal--;
      const sciPts = (s.monolithPts && s.monolithPts.science) || 0;
      const healVal = (sciPts >= 25) ? 140 : 70;
      s.hp = Math.min(s.maxHp, s.hp + healVal);
      window.Aetheria.Audio.sfxGather();
      window.Aetheria.State.save();
      this.updateAllHud();
      this.openBagModal("potionHeal");
    },

    useBagRation: function(rKey) {
      const s = window.Aetheria.State.data;
      if ((s.inventory[rKey] || 0) <= 0) return;
      s.inventory[rKey]--;
      if (rKey === "rationFish") {
        window.Aetheria.State.restoreHunger(60, 50);
        this.showToast("食用【炭烤鮮魚乾】！飽食度 +60%、HP +50！");
      } else {
        window.Aetheria.State.restoreHunger(35, 20);
        this.showToast("食用【烘烤微光菇乾】！飽食度 +35%、HP +20！");
      }
      window.Aetheria.Audio.sfxGather();
      this.updateAllHud();
      this.openBagModal(rKey);
    },

    useBagTorch: function() {
      const s = window.Aetheria.State.data;
      if ((s.inventory.torchItem || 0) <= 0) return;
      s.inventory.torchItem--;
      s.torchTicks = 180;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.updateAllHud();
      this.openBagModal("torchItem");
      this.showToast("🔥 已點燃【松脂火把】（持續 180 步照明）！");
    },

    // ================= 6. 職業與戰寵頁面 =================
    openJobPetModal: function() {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = S.iconHtml("icon_sword") + "職業祠堂 & 戰寵牧場";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      Object.values(window.Aetheria.Data.PETS).forEach(function(p) {
        const unlocked = s.unlockedPets.indexOf(p.id) !== -1;
        const isActive = (s.activePet === p.id);
        const isShiny = s.shinyPets && s.shinyPets.indexOf(p.id) !== -1;
        const spKey = isShiny ? p.shinySpriteKey : p.spriteKey;

        const pCard = document.createElement("div");
        pCard.className = unlocked ? "sys-card-scroll" : "sys-card";
        pCard.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<b>' + S.iconHtml(spKey, true) + (isShiny ? '[閃光] ' : '') + cleanText(p.name) + '</b>' +
            (unlocked
              ? '<button class="na-btn ' + (isActive ? 'highlight' : '') + '" style="padding:3px 10px;" onclick="Aetheria.UI.selectPet(\'' + p.id + '\')">' + (isActive ? '同行中' : '攜帶') + '</button>'
              : '<button class="na-btn" style="padding:3px 10px;" onclick="Aetheria.UI.quickUnlockPet(\'' + p.id + '\')">誘餌果x2 契約</button>') +
          '</div>' +
          '<div style="font-size:12px; margin-top:2px;">' + p.skillName + '：' + p.skillDesc + '</div>';
        body.appendChild(pCard);
      });

      Object.values(window.Aetheria.Data.JOBS).forEach(function(j) {
        const unlocked = s.unlockedJobs.indexOf(j.id) !== -1 || s.lv >= j.unlockLv;
        const active = (s.currentJob === j.id);

        const jCard = document.createElement("div");
        jCard.className = unlocked ? "sys-card-scroll" : "sys-card";
        jCard.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<b>' + S.iconHtml("icon_sword") + cleanText(j.name) + ' <span class="stat-pill">ATK x' + j.atkMult + '</span></b>' +
            (unlocked
              ? '<button class="na-btn ' + (active ? 'highlight' : '') + '" style="padding:3px 10px;" onclick="Aetheria.UI.selectJob(\'' + j.id + '\')">' + (active ? '當前職業' : '轉職') + '</button>'
              : '<span class="stat-pill" style="color:#ff758f;">需Lv.' + j.unlockLv + '</span>') +
          '</div>' +
          '<div style="font-size:12px; margin-top:2px;">' + j.passiveDesc + '</div>';
        body.appendChild(jCard);
      });
    },

    selectPet: function(petId) {
      const s = window.Aetheria.State.data;
      if (s.unlockedPets.indexOf(petId) !== -1) {
        s.activePet = petId;
        window.Aetheria.Audio.sfxGather();
        window.Aetheria.State.save();
        this.openJobPetModal();
        this.updateAllHud();
      }
    },

    quickUnlockPet: function(petId) {
      const s = window.Aetheria.State.data;
      if ((s.inventory.tameFruit || 0) < 2) {
        this.showToast("需要 2 顆【靈獸誘餌果】！");
        return;
      }
      s.inventory.tameFruit -= 2;
      if (s.unlockedPets.indexOf(petId) === -1) s.unlockedPets.push(petId);
      s.activePet = petId;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.openJobPetModal();
      this.updateAllHud();
    },

    selectJob: function(jobId) {
      const s = window.Aetheria.State.data;
      const j = window.Aetheria.Data.JOBS[jobId];
      if (!j || (s.lv < j.unlockLv && s.unlockedJobs.indexOf(jobId) === -1)) return;
      if (s.unlockedJobs.indexOf(jobId) === -1) s.unlockedJobs.push(jobId);
      s.currentJob = jobId;
      window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.State.save();
      this.openJobPetModal();
      this.updateAllHud();
    },

    exportSavePrompt: function() {
      const json = window.Aetheria.State.exportJSON();
      const self = this;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(json).then(function() {
          self.showToast("存檔 JSON 已複製！");
        }).catch(function() { prompt("請複製存檔 JSON：", json); });
      } else {
        prompt("請複製存檔 JSON：", json);
      }
    },

    importSavePrompt: function() {
      const raw = prompt("請貼上存檔 JSON：");
      if (raw && window.Aetheria.State.importJSON(raw)) {
        sanitizePlayerPosition();
        if (window.Aetheria.Renderer) window.Aetheria.Renderer.builtZoneKey = null;
        this.showToast("存檔還原成功！");
        this.updateAllHud();
        this.openSettingsModal("system");
      }
    }
  };

  window.Aetheria.UI = Object.assign(window.Aetheria.UI || {}, UIManager);

  function startMainGameLoop() {
    try { window.Aetheria.Data.Sprites.init(); } catch (e) {}
    try {
      window.Aetheria.State.init();
      sanitizePlayerPosition();
    } catch (e) {}

    try { window.Aetheria.UI.decorateNavIcons(); } catch (e) {}
    try { window.Aetheria.UI.initTitleScreen(); } catch (e) {}
    try { window.Aetheria.UI.updateAllHud(); } catch (e) {}
    try {
      if (window.Aetheria.Explore && window.Aetheria.Explore.initControls) {
        window.Aetheria.Explore.initControls();
      }
    } catch (e) {}

    function frameStep() {
      try {
        const isBattling = Boolean(window.Aetheria.Battle && window.Aetheria.Battle.active);
        if (!isBattling) {
          if (window.Aetheria.Explore && window.Aetheria.Explore.updateStep) {
            window.Aetheria.Explore.updateStep();
          }
          if (window.Aetheria.Renderer && window.Aetheria.Renderer.renderWorld) {
            window.Aetheria.Renderer.tick = (window.Aetheria.Renderer.tick || 0) + 1;
            window.Aetheria.Renderer.renderWorld();
          }
        }
      } catch (err) {}
      requestAnimationFrame(frameStep);
    }

    requestAnimationFrame(frameStep);
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(startMainGameLoop, 10);
  } else {
    window.addEventListener("load", startMainGameLoop);
  }
})();
