/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 工坊 UI、合成圖鑑、全區地圖與按鍵鎖死模組 (srpg-workshop.js - v14.0)
 * 【File 3 / 4】負責：下半屏按鍵鎖死、任務框解題指引、5大解題視窗、放大全圖、圖鑑與格仔工坊
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.SRPG = window.Aetheria.SRPG || {};

(function() {
  const SRPG = window.Aetheria.SRPG;

  // ================= 1. 下半屏按鍵鎖死 ＆ 任務框解題指引 =================
  let questBoxElementRef = null;

  const ui = {
lockLowerScreenControlsPosition: function() {
      const explorePanel = document.getElementById("panel-explore");
      const exploreLog = document.getElementById("explore-log");
      const ctrlRow = explorePanel && explorePanel.querySelector(".controls-pads");

      if (exploreLog) {
        questBoxElementRef = exploreLog;
        exploreLog.style.setProperty("height", "76px", "important");
        exploreLog.style.setProperty("max-height", "76px", "important");
        exploreLog.style.setProperty("min-height", "76px", "important");
        exploreLog.style.setProperty("flex-shrink", "0", "important");
        exploreLog.style.setProperty("overflow-y", "auto", "important");
        exploreLog.style.setProperty("margin-bottom", "0", "important");
        exploreLog.style.setProperty("padding", "4px 8px", "important");
        exploreLog.style.setProperty("box-sizing", "border-box", "important");
      }

      if (ctrlRow) {
        // 讓方向鍵與 A 鍵緊貼在任務框下方，避免沉底被手機導航列遮擋
        ctrlRow.style.setProperty("position", "static", "important");
        ctrlRow.style.setProperty("height", "auto", "important");
        ctrlRow.style.setProperty("margin", "10px 0 auto 0", "important");
        ctrlRow.style.setProperty("padding", "2px 10px 8px", "important");
        ctrlRow.style.setProperty("z-index", "25", "important");
      }
    },

    updateInlinePuzzleGuideInQuestBox: function() {
      ui.lockLowerScreenControlsPosition();
      const s = window.Aetheria.State && window.Aetheria.State.data;
      if (!s) return;

      const qBox = questBoxElementRef ||
                   document.getElementById("quest-tracker") ||
                   document.getElementById("quest-banner");
      if (!qBox) return;

      const prog = SRPG.data.getZoneStoryProgress(s.currentZone, s);
      let guideEl = document.getElementById("srpg-inline-puzzle-guide");

      if (!prog) {
        if (guideEl) SRPG.utils.setDisplayIfChanged(guideEl, "none");
        return;
      }

      if (!guideEl) {
        guideEl = document.createElement("div");
        guideEl.id = "srpg-inline-puzzle-guide";
        guideEl.onclick = function(ev) {
          ev.stopPropagation();
          if (window.Aetheria.Audio && window.Aetheria.Audio.sfxTalkBlip) window.Aetheria.Audio.sfxTalkBlip();
          if (window.Aetheria.HighlandsWorkshop) window.Aetheria.HighlandsWorkshop.openZoneStoryChainModal();
        };
        qBox.appendChild(guideEl);
      } else if (guideEl.parentNode !== qBox) {
        qBox.appendChild(guideEl);
      }

      SRPG.utils.setDisplayIfChanged(guideEl, "block");
      if (prog.nextTask) {
        SRPG.utils.setTextIfChanged(guideEl, "🎯 " + prog.nextTask.short + " [點擊看詳情 " + prog.doneCount + "/5]");
      } else {
        SRPG.utils.setTextIfChanged(guideEl, "🌟 【本區 5/5 解題任務全部完成】已獲得全部尋寶建材與首領削弱加成！");
      }
    }
  };
  SRPG.ui = ui;

  // ================= 2. 工坊、合成圖鑑、5 大解題視窗與全區放大地圖 =================
  const WorkshopUIManager = {
    curTab: "workshop",
    curSubFilter: "all",
    curCodexFilter: "all",
    selectedItemId: null,
    savedScrollTop: 0,
    currentFilteredMap: {},

    openZoneStoryChainModal: function() {
      const s = window.Aetheria.State.data;
      const prog = SRPG.data.getZoneStoryProgress(s.currentZone, s);
      if (!prog) {
        this.openSurvivalCodexModal("all");
        return;
      }

      const c = prog.chain;
      window.Aetheria.UI.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = "🎯 " + c.title + " (" + prog.doneCount + "/5)";

      const body = document.getElementById("modal-body");
      let tasksHtml =
        '<div class="sys-card-scroll" style="margin-bottom:8px;">' +
          '<b>🗣️ ' + c.npcName + '的解題任務總覽：</b>' +
          '<div style="font-size:11.5px; color:#5c3824; margin-top:2px;">' + c.storyIntro + '</div>' +
        '</div>';

      c.tasks.forEach(function(t) {
        const done = Boolean(prog.statusMap[t.id]);
        tasksHtml +=
          '<div class="codex-card ' + (done ? 'owned' : '') + '">' +
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<b style="color:' + (done ? '#5ac54f' : '#ffd166') + '; font-size:12px;">' + (done ? '✅ 已完成' : '🎯 待解題') + '</b>' +
              '<span class="codex-tag">' + (done ? '完成' : '進行中') + '</span>' +
            '</div>' +
            '<div style="font-size:11.5px; color:#ffffff; margin-top:3px; line-height:1.35;">' + t.detail + '</div>' +
          '</div>';
      });

      tasksHtml +=
        '<div style="display:flex; gap:6px; margin-top:8px;">' +
          '<button class="na-btn highlight" style="flex:1; padding:8px;" onclick="Aetheria.UI.openForgeModal(\'workshop\')">🔨 打開工坊做解謎工具</button>' +
          '<button class="na-btn" style="flex:1; padding:8px;" onclick="Aetheria.HighlandsWorkshop.openFullZoneMapModal()">🗺️ 查看全區全貌地圖</button>' +
        '</div>';

      body.innerHTML = tasksHtml;
    },

    openSurvivalCodexModal: function(catFilter) {
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const db = SRPG.db;

      if (catFilter) this.curCodexFilter = catFilter;
      const curCat = this.curCodexFilter || "all";

      window.Aetheria.UI.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML =
        "📖 艾瑟瑞亞求生合成圖鑑 (材料 / 配方 / 途徑 / 用途)";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const cats = [
        { id: "all",    label: "全部(" + db.SURVIVAL_CODEX_DATABASE.length + ")" },
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
          '<button class="na-btn" style="flex:1; padding:5px; font-size:11.5px;" onclick="Aetheria.HighlandsWorkshop.openZoneStoryChainModal()">🎯 本區 5 大解題指引</button>' +
        '</div>';

      let cardsHtml = "";

      if (curCat === "tools") {
        ["axe", "pickaxe", "shovel", "rod", "hook", "pouch"].forEach(function(tk) {
          const tDef = db.BUILTIN_TOOLS_DB[tk];
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
        const list = db.SURVIVAL_CODEX_DATABASE.filter(function(item) {
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

      const terrain = SRPG.terrain;
      const db = SRPG.db;

      terrain.ensureActiveTerrainCanvas(mapObj);

      window.Aetheria.UI.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML =
        "🧭 【" + (mapObj.name || "當前區域") + "】全區全貌探索地圖";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const prog = SRPG.data.getZoneStoryProgress(mapObj.id, s);
      if (prog && prog.nextTask) {
        const chainBanner = document.createElement("div");
        chainBanner.className = "codex-card " + (prog.allDone ? "owned" : "");
        chainBanner.style.marginBottom = "6px";
        chainBanner.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<b style="color:#ffd166; font-size:12px;">🎯 ' + prog.chain.title + ' (' + prog.doneCount + '/5)</b>' +
            '<button class="na-btn" style="padding:2px 8px; font-size:10.5px;" onclick="Aetheria.HighlandsWorkshop.openZoneStoryChainModal()">全部5指引</button>' +
          '</div>' +
          '<div style="font-size:11px; color:#cbd5e1; margin-top:2px;">' + prog.nextTask.short + '</div>';
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
        terrain.paintTerrainOntoContext(ctx, mapObj, W, H, SRPG.data.isMapBridgeBuilt(mapObj, s));
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

      const pCfg = db.ZONE_EXPLORE_PUZZLES[mapObj.id];
      const gList = db.ZONE_TOOL_GATE_OBSTACLES[mapObj.id];
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
          terrain.drawTreasureXMarkerOnCanvas(ctx, nx, ny, 7.5);
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
        '<span>🩷 <b>工具尋寶點(送建材)</b></span>' +
        '<span>🟨 <b>趣味機關寶箱</b></span>' +
        '<span><b style="color:#e03c4b; background:#ffd166; padding:0 3px; border-radius:50%;">✖</b> <b>唯一挖寶點</b></span>' +
        '<span>🟪 <b>地底遺跡門</b></span>' +
        '<span>🔴 <b>區域首領</b></span>';
      body.appendChild(legend);

      canvas.onclick = function(ev) {
        const rect = canvas.getBoundingClientRect();
        const clickX = Math.round(((ev.clientX - rect.left) / rect.width) * W);
        const clickY = Math.round(((ev.clientY - rect.top) / rect.height) * H);
        window.Aetheria.UI.showToast("🧭 地圖座標 (" + clickX + ", " + clickY + ")｜前往 🩷工具尋寶點與 🟨趣味機關陣可免費拎大量修橋建材！");
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
      const db = SRPG.db;
      const self = this;

      SRPG.data.registerIntoGame();
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
        db.COMPLETE_WORKSHOP_RECIPES.concat(SRPG.data.dynamicGuaranteedRecipes).forEach(function(r) {
          recipeMap[r.id] = r;
          seenNames[r.name] = true;
        });
        const rawWks = Array.isArray(Data.WORKSHOP_RECIPES)
          ? Data.WORKSHOP_RECIPES
          : (Data.WORKSHOP_RECIPES && typeof Data.WORKSHOP_RECIPES === "object" ? Object.values(Data.WORKSHOP_RECIPES) : []);
        rawWks.forEach(function(r, idx) {
          if (!r || !r.name) return;
          const rid = r.id || r.wkId || ("wk_legacy_" + idx);
          if (db.REMOVED_BLOAT_RECIPE_IDS.indexOf(rid) !== -1) return;
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
          const tDef = db.BUILTIN_TOOLS_DB[tKey] || (Data.TOOLS && Data.TOOLS[tKey]);
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
          if (!w || !w.id || !w.name || db.REMOVED_DUPLICATE_WEAPON_IDS.indexOf(w.id) !== -1) return false;
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
          if (!a || !a.id || !a.name || db.REMOVED_DUPLICATE_ARMOR_IDS.indexOf(a.id) !== -1) return false;
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

  SRPG.workshop = WorkshopUIManager;
  window.Aetheria.HighlandsWorkshop = WorkshopUIManager;
})();
