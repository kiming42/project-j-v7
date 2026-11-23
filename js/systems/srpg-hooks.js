/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 系統掛鉤、互動解謎、戰鬥平衡與啟動模組 (srpg-hooks.js - v14.5)
 * 【File 4 / 8】負責：State/Maps/Explore/Battle/Renderer/UI 掛鉤與穩定就緒啟動器
 * v14.5 修正 (#2)：於 updateStep 與 buildSceneDOM 雙重追蹤跨區切換，企喺高台直接傳送亦即時重置 onHighland
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.SRPG = window.Aetheria.SRPG || {};

(function() {
  const SRPG = window.Aetheria.SRPG;

  function hookSystems() {
    if (SRPG._hooksInstalled) return;
    SRPG._hooksInstalled = true;

    const St       = window.Aetheria.State;
    const Maps     = window.Aetheria.Data && window.Aetheria.Data.Maps;
    const Exp      = window.Aetheria.Explore;
    const Ren      = window.Aetheria.Renderer;
    const Bat      = window.Aetheria.Battle;
    const UI       = window.Aetheria.UI;

    const utils    = SRPG.utils;
    const db       = SRPG.db;
    const dataMgr  = SRPG.data;
    const terrain  = SRPG.terrain;
    const ui       = SRPG.ui;
    const workshop = SRPG.workshop;

    let lastStepZoneId  = "";
    let lastBuiltZoneId = "";

    utils.lockHintElementSetter();
    ui.lockLowerScreenControlsPosition();

    // ================= 1. 角色生命值上限掛鉤 =================
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

    // ================= 2. 地圖讀取與資源刷新掛鉤 =================
    if (Maps && Maps.getMap) {
      const origGetMap = Maps.getMap.bind(Maps);
      Maps.getMap = function(zoneId) {
        if (zoneId && zoneId.indexOf("grotto_") === 0) return terrain.getGrottoMap(zoneId);
        if (zoneId && zoneId.indexOf("crypt_") === 0)  return terrain.getCryptMap(zoneId);

        const m = origGetMap(zoneId);
        if (m) {
          if (m.id === "camp_hub") terrain.adjustCampTentsUpward(m);
          else if (db.HIGHLAND_ZONES[m.id]) terrain.injectHighlandCliffIntoMap(m);
        }
        return m;
      };

      const origRefresh = Maps.refreshAllResources.bind(Maps);
      Maps.refreshAllResources = function() {
        origRefresh();
        terrain.clearSubMapsCache();
        const camp = origGetMap("camp_hub");
        if (camp) { camp._campTentsAdjustedToken = null; terrain.adjustCampTentsUpward(camp); }
        Object.keys(db.HIGHLAND_ZONES).forEach(function(zId) {
          const m = origGetMap(zId);
          if (m) { m._highlandInjectedToken = null; terrain.injectHighlandCliffIntoMap(m); }
        });
      };
    }

    // ================= 3. 探索移動、怪物碰撞、互動解謎與採集掛鉤 =================
    if (Exp) {
      const origUpdateStep = Exp.updateStep.bind(Exp);
      Exp.updateStep = function() {
        const s = window.Aetheria.State.data;

        // ★ v14.5 修正 #2：偵測選單傳送導致的跨區切換，在移動與碰撞前即時清除高台狀態
        if (lastStepZoneId && lastStepZoneId !== s.currentZone) {
          s.onHighland = false;
        }
        if (!db.HIGHLAND_ZONES[s.currentZone]) {
          s.onHighland = false;
        }
        lastStepZoneId = s.currentZone;

        const prevX = s.heroX, prevY = s.heroY, prevZone = s.currentZone;
        const curMap = window.Aetheria.Data && window.Aetheria.Data.Maps && window.Aetheria.Data.Maps.getMap(s.currentZone);

        let bypassedRiverForBridge = false;
        if (curMap && curMap.hasRiver && dataMgr.isMapBridgeBuilt(curMap, s)) {
          const bY = dataMgr.getMapBridgeY(curMap);
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

        if (s.currentZone !== prevZone || !db.HIGHLAND_ZONES[s.currentZone]) {
          s.onHighland = false;
          lastStepZoneId = s.currentZone;
          return;
        }
        if (s.onHighland) {
          if (!terrain.isInsideHighlandPlateau(s.heroX, s.heroY)) { s.heroX = prevX; s.heroY = prevY; }
        } else {
          if (terrain.isBlockedByCliffFromLowland(s.heroX, s.heroY)) { s.heroX = prevX; s.heroY = prevY; }
        }
      };

      if (Exp.updateMonstersAI) {
        const origAI = Exp.updateMonstersAI.bind(Exp);
        Exp.updateMonstersAI = function(mapObj, s) {
          const hasCliff = Boolean(mapObj && db.HIGHLAND_ZONES[mapObj.id]);
          const prevCoords = [];
          if (hasCliff && mapObj.monsters) {
            mapObj.monsters.forEach(function(m, idx) { prevCoords[idx] = { x: m.x, y: m.y }; });
          }
          origAI(mapObj, s);
          if (hasCliff && mapObj.monsters) {
            mapObj.monsters.forEach(function(m, idx) {
              if (!m || m.alive === false) return;
              if (terrain.isBlockedByCliffFromLowland(m.x, m.y)) {
                if (prevCoords[idx] && !terrain.isBlockedByCliffFromLowland(prevCoords[idx].x, prevCoords[idx].y)) {
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

          const puzzleDone = dataMgr.isZoneExplorePuzzleSolved(mapObj, s);
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
          let nearestLadder = null;
          let nearestLadderDist = 68;

          for (let i = 0; i < mapObj.decos.length; i++) {
            const d = mapObj.decos[i];
            if (!d) continue;

            if (d.isExplorePuzzleTablet && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 44) {
              window.Aetheria.Audio.sfxTalkBlip();
              window.Aetheria.UI.showToast(d.riddleText || "古老的機關銘文。");
              return;
            }

            if (d.isPuzzleOrderBrazier && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 44) {
              if (dataMgr.isZoneExplorePuzzleSolved(mapObj, s)) {
                const pChest = (mapObj.nodes || []).find(function(n) { return n && n.isExplorePuzzleChest && !n.opened; });
                if (pChest) { Exp.harvestNode(pChest); return; }
                window.Aetheria.UI.showToast("✨ 四個火盆已經點亮並領取過寶箱了！");
                return;
              }
              const nextOrder = (mapObj._brazierStep || 0) + 1;
              if (d.orderNum === nextOrder) {
                d.lit = true; d.sprite = "brazier_on"; mapObj._brazierStep = nextOrder;
                window.Aetheria.Audio.sfxGather();
                if (nextOrder >= 4) {
                  s.solvedExplorePuzzles[mapObj.id] = true;
                  window.Aetheria.State.save();
                  ui.updateInlinePuzzleGuideInQuestBox();
                  window.Aetheria.Audio.sfxLevelUp();
                  window.Aetheria.UI.spawnFloatingText("🔓火盆①~④全亮!再按A開箱!", "#5ac54f", true);
                  window.Aetheria.UI.showToast("🎉 太棒了！四個火盆全部點亮！再按一次 A 鍵即可打開中間的【古遺跡機關寶箱】！");
                } else {
                  window.Aetheria.UI.showToast("🔥 成功點燃【" + d.brazierLabel + "】！下一個請找【火盆" + ["①","②","③","④"][nextOrder] + "】！");
                }
              } else {
                mapObj._brazierStep = 0;
                (mapObj.decos || []).forEach(function(bd) { if (bd.isPuzzleOrderBrazier) { bd.lit = false; bd.sprite = "brazier_off"; } });
                window.Aetheria.Audio.sfxWrong();
                window.Aetheria.UI.showToast("💡 次序不對喔！請先找【火盆①】開始，順着 ① ➔ ② ➔ ③ ➔ ④ 點燃！");
              }
              return;
            }

            if (d.isPuzzleRotateStatue && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 44) {
              if (dataMgr.isZoneExplorePuzzleSolved(mapObj, s)) {
                const pChest = (mapObj.nodes || []).find(function(n) { return n && n.isExplorePuzzleChest && !n.opened; });
                if (pChest) { Exp.harvestNode(pChest); return; }
                window.Aetheria.UI.showToast("✨ 四座石像已經轉好並領取過寶箱了！");
                return;
              }
              d.curDir = ((d.curDir || 0) + 1) % 4;
              window.Aetheria.Audio.sfxGather();
              const allStatues = (mapObj.decos || []).filter(function(sd) { return sd.isPuzzleRotateStatue; });
              if (allStatues.length > 0 && allStatues.every(function(sd) { return sd.curDir === sd.targetDir; })) {
                s.solvedExplorePuzzles[mapObj.id] = true;
                window.Aetheria.State.save();
                ui.updateInlinePuzzleGuideInQuestBox();
                window.Aetheria.Audio.sfxLevelUp();
                window.Aetheria.UI.spawnFloatingText("🔓四座石像全綠!再按A開箱!", "#5ac54f", true);
                window.Aetheria.UI.showToast("🎉 太厲害了！四座石像方向全部正確！再按一次 A 鍵即可打開中間的【古遺跡機關寶箱】！");
              } else {
                const isRight = (d.curDir === d.targetDir);
                window.Aetheria.UI.showToast(
                  isRight
                    ? ("✅ 【" + d.statueName + "】已轉對方向(" + db.DIR_SYMBOLS[d.curDir] + ")！快去轉其他石像吧！")
                    : ("🗿 轉動【" + d.statueName + "】為 " + db.DIR_SYMBOLS[d.curDir] + "（目標是轉去 " + db.DIR_SYMBOLS[d.targetDir] + " 喔！）")
                );
              }
              return;
            }

            if (d.isPuzzleToggleLever && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 44) {
              if (dataMgr.isZoneExplorePuzzleSolved(mapObj, s)) {
                const pChest = (mapObj.nodes || []).find(function(n) { return n && n.isExplorePuzzleChest && !n.opened; });
                if (pChest) { Exp.harvestNode(pChest); return; }
                window.Aetheria.UI.showToast("✨ 三個拉桿已經全部開啟並領取過寶箱了！");
                return;
              }
              d.leverOn = !d.leverOn;
              d.sprite = d.leverOn ? "lever_on" : "lever_off";
              window.Aetheria.Audio.sfxGather();

              const allLevers = (mapObj.decos || []).filter(function(ld) { return ld.isPuzzleToggleLever; });
              if (allLevers.length > 0 && allLevers.every(function(ld) { return ld.leverOn; })) {
                s.solvedExplorePuzzles[mapObj.id] = true;
                window.Aetheria.State.save();
                ui.updateInlinePuzzleGuideInQuestBox();
                window.Aetheria.Audio.sfxLevelUp();
                window.Aetheria.UI.spawnFloatingText("🔓三個拉桿全開!再按A開箱!", "#5ac54f", true);
                window.Aetheria.UI.showToast("🎉 太棒了！三個拉桿全部變成【🟢開】！再按一次 A 鍵即可打開中間的【古遺跡機關寶箱】！");
              } else {
                const onCount = allLevers.filter(function(ld) { return ld.leverOn; }).length;
                window.Aetheria.UI.showToast("⚙️ 已切換拉桿（目前 " + onCount + "/3 個開啟），把 3 個都變成【🟢開】就能開寶箱！");
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

            if (d.isCliffLadderSpot) {
              const lDist = Math.hypot(s.heroX - d.x, s.heroY - d.y);
              if (lDist < nearestLadderDist) {
                nearestLadderDist = lDist;
                nearestLadder = d;
              }
            }
          }

          if (nearestLadder) {
            const d = nearestLadder;
            if (!s.riggedCliffs) s.riggedCliffs = {};
            if (!s.riggedCliffs[mapObj.id]) {
              if ((s.inventory.ropeLadder || 0) <= 0) {
                window.Aetheria.Audio.sfxWrong();
                window.Aetheria.UI.showToast("🧗 陡峭的懸崖岩壁！請先在【工坊 ➔ 🔨加工】用「原木x1+藤蔓x1」合成【攀岩繩梯 x1】架設！");
                return;
              }
              s.inventory.ropeLadder--;
              s.riggedCliffs[mapObj.id] = true;
              (mapObj.decos || []).forEach(function(dc) { if (dc.isCliffLadderSpot) dc.sprite = "rope_ladder"; });
            }

            window.Aetheria.Audio.sfxGather();
            if (s.onHighland) {
              s.onHighland = false;
              s.heroX = (d.downX !== undefined) ? d.downX : d.x;
              s.heroY = (d.downY !== undefined) ? d.downY : ((d.ladderSide === "north") ? 772 : 982);
              window.Aetheria.UI.showToast("🧗 順着攀岩繩梯爬下了平地！");
            } else {
              s.onHighland = true;
              s.heroX = (d.upX !== undefined) ? d.upX : d.x;
              s.heroY = (d.upY !== undefined) ? d.upY : ((d.ladderSide === "north") ? 835 : 895);
              window.Aetheria.UI.showToast("🧗 順着攀岩繩梯爬上了【岩石高台礦區】！");
            }
            s.petX = s.heroX - 20; s.petY = s.heroY;
            window.Aetheria.State.save();
            window.Aetheria.UI.updateAllHud();
            return;
          }
        }

        const brickKey = utils.findMatKeyByNameKeyword("耐火磚", null);
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
        utils.lockHintElementSetter();
        ui.lockLowerScreenControlsPosition();
        const hintEl = document.getElementById("a-btn-hint");
        if (hintEl && mapObj) {
          if (mapObj.id === "camp_hub" && mapObj.portals) {
            for (let pIdx = 0; pIdx < mapObj.portals.length; pIdx++) {
              const pt = mapObj.portals[pIdx];
              if (pt && (pt.targetZone === "tent_guild" || pt.targetZone === "tent_hero" || pt.targetZone === "tent_forge") &&
                  Math.hypot(s.heroX - pt.x, s.heroY - pt.y) < 38) {
                utils.setTextIfChanged(hintEl, "進入帳篷");
                return;
              }
            }
          }
          const puzzleDone = dataMgr.isZoneExplorePuzzleSolved(mapObj, s);
          if (mapObj.nodes) {
            for (let j = 0; j < mapObj.nodes.length; j++) {
              const n = mapObj.nodes[j];
              if (!n || n.opened) continue;
              if (n.isExplorePuzzleChest && Math.hypot(s.heroX - n.x, s.heroY - n.y) < (puzzleDone ? 78 : 44)) {
                utils.setTextIfChanged(hintEl, "開啟秘寶箱");
                return;
              }
              if (n.isToolGateObstacle && Math.hypot(s.heroX - n.x, s.heroY - n.y) < 52) {
                utils.setTextIfChanged(hintEl, "工具尋寶");
                return;
              }
              if (n.isBuriedSpot && Math.hypot(s.heroX - n.x, s.heroY - n.y) < 42) {
                utils.setTextIfChanged(hintEl, "鐵鏟挖寶");
                return;
              }
            }
          }
          if (mapObj.decos) {
            for (let i = 0; i < mapObj.decos.length; i++) {
              const d = mapObj.decos[i];
              if (!d) continue;
              if (d.isExplorePuzzleTablet && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 44) { utils.setTextIfChanged(hintEl, "看尋寶提示"); return; }
              if (d.isPuzzleOrderBrazier && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 44)  { utils.setTextIfChanged(hintEl, puzzleDone ? "開啟秘寶箱" : "點燃火盆"); return; }
              if (d.isPuzzleRotateStatue && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 44)  { utils.setTextIfChanged(hintEl, puzzleDone ? "開啟秘寶箱" : "轉動石像"); return; }
              if (d.isPuzzleToggleLever && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 44)   { utils.setTextIfChanged(hintEl, puzzleDone ? "開啟秘寶箱" : "開啟拉桿"); return; }
              if (d.isCryptEntrance && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 62) {
                const open = Boolean(s.unlockedCrypts && s.unlockedCrypts[d.zoneId || mapObj.id]);
                utils.setTextIfChanged(hintEl, open ? "進入遺跡" : "鑰匙開鎖");
                return;
              }
              if (d.isCliffLadderSpot && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 68) {
                const rigged = Boolean(s.riggedCliffs && s.riggedCliffs[mapObj.id]);
                utils.setTextIfChanged(hintEl, !rigged ? "架設繩梯" : (s.onHighland ? "爬下懸崖" : "爬上高台"));
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
            window.Aetheria.UI.showToast("💡 只要去【工坊 ➔ 🧗解謎工具】做出【" + reqName + "】，就能打開呢個秘寶拎修橋建材！");
            return;
          }

          if (g.consume) s.inventory[reqKey] = Math.max(0, haveCnt - 1);

          node.opened = true;
          s.clearedToolGates[node.id] = true;
          terrain.spawnHarvestParticles(node.x, node.y, "#5ac54f");

          if (window.Aetheria.Renderer && window.Aetheria.Renderer.domPool && window.Aetheria.Renderer.domPool.nodes) {
            const domNode = window.Aetheria.Renderer.domPool.nodes[node.id];
            if (domNode && domNode.el) utils.setDisplayIfChanged(domNode.el, "none");
          }

          s.gold = (s.gold || 0) + (g.rewardGold || 250);
          const rewardNames = [];
          Object.entries(g.rewardMats || {}).forEach(function(entry) {
            const mk = entry[0], mc = entry[1];
            s.inventory[mk] = (s.inventory[mk] || 0) + mc;
            const mn = (matsDB[mk] && matsDB[mk].name) || mk;
            rewardNames.push(mn + "+" + mc);
          });

          if (s.currentZone === "zone5_volcano") {
            const bKey = utils.findMatKeyByNameKeyword("耐火磚", null);
            const cKey = utils.findMatKeyByNameKeyword("熔核", null);
            if (bKey) { s.inventory[bKey] = (s.inventory[bKey] || 0) + 3; rewardNames.push("黑曜耐火磚+3"); }
            if (cKey) { s.inventory[cKey] = (s.inventory[cKey] || 0) + 1; rewardNames.push("炎魔熔核+1"); }
          }

          window.Aetheria.Audio.sfxLevelUp();
          window.Aetheria.State.save();
          ui.updateInlinePuzzleGuideInQuestBox();
          window.Aetheria.UI.updateAllHud();
          window.Aetheria.UI.showToast("🎉 用【" + reqName + "】成功打開秘寶！獲得 " + (g.rewardGold || 250) + "G 與 " + rewardNames.join("、") + "！");
          return;
        }

        if (node && node.isExplorePuzzleChest) {
          const curMap = window.Aetheria.Data.Maps.getMap(s.currentZone);
          if (!dataMgr.isZoneExplorePuzzleSolved(curMap, s)) {
            window.Aetheria.Audio.sfxWrong();
            window.Aetheria.UI.showToast("💡 寶箱鎖住咗！只要解開旁邊嘅【火盆①~④ / 三個拉桿 / 四座石像】就可以打開！");
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
          s.inventory.basalt = (s.inventory.basalt || 0) + 2;
          s.inventory.plank = (s.inventory.plank || 0) + 2;
          s.inventory.spicedStew = (s.inventory.spicedStew || 0) + 1;
          s.srpgBonusHp = (s.srpgBonusHp || 0) + 15;
          window.Aetheria.State.recalcMaxHp();

          window.Aetheria.Audio.sfxLevelUp();
          window.Aetheria.State.save();
          ui.updateInlinePuzzleGuideInQuestBox();
          window.Aetheria.UI.updateAllHud();
          window.Aetheria.UI.spawnFloatingText("🏆尋寶成功!HP+15 & 建材入手!", "#ffd166", true);
          window.Aetheria.UI.showToast("🏆 打開機關寶箱！獲得 320G、🗝️遺跡鑰匙+1、流沙秘銀+2、玄武岩+2、厚木板+2、永久 HP+15，且本區 Boss 護盾已削弱 -2！");
          return;
        }

        if (node) {
          const pColor = (node.type === "wood") ? "#5ac54f" : (node.isBuriedSpot ? "#d9a066" : "#8ce0ff");
          terrain.spawnHarvestParticles(node.x, node.y, pColor);
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
            window.Aetheria.UI.showToast("🥄 地面有神秘的「✖」藏寶記號！請先在【工坊 ➔ ⛏️工具】打造【Lv.1 精鐵探險鏟】(原木x1+鐵礦x1) 挖掘！");
            return;
          }
          node.opened = true;
          s.dugSpots[node.id] = true;
          if (window.Aetheria.Renderer && window.Aetheria.Renderer.domPool && window.Aetheria.Renderer.domPool.nodes) {
            const domNode = window.Aetheria.Renderer.domPool.nodes[node.id];
            if (domNode && domNode.el) utils.setDisplayIfChanged(domNode.el, "none");
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
                    terrain.spawnHarvestParticles(other.x, other.y, "#ffd166");
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

    // ================= 4. 戰鬥數值平衡、護盾減傷與保底掉落掛鉤 =================
    if (Bat) {
      if (Bat.startBattle) {
        const origStart = Bat.startBattle.bind(Bat);
        Bat.startBattle = function(mapMonsterNode, customMode, customQuestionId) {
          origStart(mapMonsterNode, customMode, customQuestionId);

          const e = this.enemy;
          if (!e || this.mode !== "combat") return;

          const s = window.Aetheria.State.data;
          const heroAtk = (window.Aetheria.State.getTotalAtk ? window.Aetheria.State.getTotalAtk() : 80);
          const heroMaxHp = s.maxHp || 300;
          const monLv = e.lv || 1;
          const isElite = Boolean(mapMonsterNode && (mapMonsterNode.isCryptGuardian || mapMonsterNode.isVolcanoHelperSubBoss || mapMonsterNode.isShiny));
          const prog = dataMgr.getZoneStoryProgress(s.currentZone, s);

          if (e.isBoss) {
            const minBossHp = Math.round(heroAtk * 6.5 + monLv * 120);
            e.maxHp = Math.max(Math.round(e.maxHp * 2.2), minBossHp);
            e.maxShield = Math.max(4, (e.maxShield || 3) + 1);
            e.atk = Math.max(Math.round((e.atk || 30) * 1.25), Math.round(heroMaxHp * 0.16));
            e._enrageUsed = false;

            if (prog && prog.bossWeakened) {
              e.maxShield = Math.max(2, e.maxShield - 2);
              e.maxHp = Math.round(e.maxHp * 0.80);
              setTimeout(function() {
                window.Aetheria.UI.spawnFloatingText("🌟解題加成：Boss護盾-2!", "#5ac54f", true);
                window.Aetheria.UI.showToast(prog.chain.bossDebuffMsg);
              }, 350);
            }
            e.hp = e.maxHp;
            e.shield = e.maxShield;
          } else if (isElite) {
            const minEliteHp = Math.round(heroAtk * 3.8 + monLv * 70);
            e.maxHp = Math.max(Math.round(e.maxHp * 1.8), minEliteHp);
            e.hp = e.maxHp;
            e.maxShield = Math.max(3, e.maxShield || 2);
            e.shield = e.maxShield;
            e.atk = Math.max(Math.round((e.atk || 22) * 1.2), Math.round(heroMaxHp * 0.13));
          } else if (monLv >= 8) {
            const minMobHp = Math.round(heroAtk * 1.8 + monLv * 35);
            e.maxHp = Math.max(Math.round(e.maxHp * 1.5), minMobHp);
            e.hp = e.maxHp;
            e.maxShield = Math.max(2, e.maxShield || 2);
            e.shield = e.maxShield;
          }

          let _internalHp = e.hp;
          try {
            Object.defineProperty(e, "hp", {
              get: function() { return _internalHp; },
              set: function(newVal) {
                if (newVal < _internalHp) {
                  const rawDmg = _internalHp - newVal;
                  if (this.shield > 0 && !this.broken) {
                    const mitigatedDmg = Math.max(1, Math.round(rawDmg * 0.55));
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
              const clothKey = utils.findMatKeyByNameKeyword("帆布", "sailCloth");
              const sirenKey = utils.findMatKeyByNameKeyword("海妖", null);
              if ((s.inventory[clothKey] || 0) < 4) s.inventory[clothKey] = (s.inventory[clothKey] || 0) + 1;
              if (sirenKey && (s.inventory[sirenKey] || 0) < 1) s.inventory[sirenKey] = 1;
            } else if (z.indexOf("zone4_snow") !== -1) {
              const sinewKey = utils.findMatKeyByNameKeyword("獸筋", "sinew");
              if ((s.inventory[sinewKey] || 0) < 4) s.inventory[sinewKey] = (s.inventory[sinewKey] || 0) + 1;
            } else if (z.indexOf("zone5_volcano") !== -1) {
              const scaleKey = utils.findMatKeyByNameKeyword("龍鱗", null);
              const coreKey  = utils.findMatKeyByNameKeyword("熔核", null);
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

    // ================= 5. 渲染器掛鉤（地貌、跨區高台重置、標籤與羅盤更新） =================
    if (Ren) {
      if (Ren.updateMinimap) {
        Ren.updateMinimap = function(mapObj, s) {
          terrain.renderCompassMinimap(mapObj, s, false);
        };
      }

      const origBuild = Ren.buildSceneDOM.bind(Ren);
      Ren.buildSceneDOM = function(mapObj) {
        // ★ v14.5 修正 #2：切換地圖重建場景時，強制清除舊地圖的高台旗標，徹底杜絕傳送卡點
        const stData = window.Aetheria.State && window.Aetheria.State.data;
        if (stData && mapObj) {
          if (lastBuiltZoneId && lastBuiltZoneId !== mapObj.id) {
            stData.onHighland = false;
          }
          if (!db.HIGHLAND_ZONES[mapObj.id]) {
            stData.onHighland = false;
          }
          lastBuiltZoneId = mapObj.id;
          lastStepZoneId  = mapObj.id;
        }

        if (mapObj) {
          if (mapObj.id === "camp_hub") terrain.adjustCampTentsUpward(mapObj);
          else if (db.HIGHLAND_ZONES[mapObj.id]) terrain.injectHighlandCliffIntoMap(mapObj);
        }
        origBuild(mapObj);

        terrain.mountGuaranteedCompassWidget();

        const terrainLayer = document.getElementById("world-terrain-layer");
        const S = window.Aetheria.Data.Sprites;
        if (!terrainLayer || !mapObj) return;

        terrain.renderKenneyNaturalTerrainCanvas(mapObj, terrainLayer);
        terrain.syncDomRiverBridge(mapObj, terrainLayer);

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
        if (s) terrain.renderCompassMinimap(mapObj, s, true);
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

          if (mapObj) terrain.renderCompassMinimap(mapObj, s, false);

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
                utils.setDisplayIfChanged(item.lbl, "block");
                utils.setClassIfChanged(item.lbl, "dom-label ladder-spot-lbl");
                utils.setTextIfChanged(item.lbl, rigged ? (s.onHighland ? "🧗爬下懸崖" : "🧗爬上高台") : "🧗架設繩梯");
              }
            } else if (d.isCryptEntrance) {
              const sprKey = cryptOpen ? "crypt_door_open" : "crypt_door_locked";
              if (item.img && S && item.img._lastSpr !== sprKey) {
                item.img._lastSpr = sprKey;
                item.img.src = S.getDataURL(sprKey);
              }
              if (item.lbl) {
                utils.setDisplayIfChanged(item.lbl, "block");
                utils.setClassIfChanged(item.lbl, "dom-label crypt-door-lbl");
                utils.setTextIfChanged(item.lbl, cryptOpen ? "🏛️地底遺跡(已開)" : "🔒地底遺跡[需鑰匙]");
              }
            } else if (d.isExplorePuzzleTablet && item.lbl) {
              utils.setDisplayIfChanged(item.lbl, "block");
              utils.setClassIfChanged(item.lbl, "dom-label puzzle-mech-lbl");
              utils.setTextIfChanged(item.lbl, "📜尋寶提示碑");
            } else if (d.isPuzzleOrderBrazier) {
              const sprKey = d.lit ? "brazier_on" : "brazier_off";
              if (item.img && S && item.img._lastSpr !== sprKey) {
                item.img._lastSpr = sprKey;
                item.img.src = S.getDataURL(sprKey);
              }
              if (item.lbl) {
                utils.setDisplayIfChanged(item.lbl, "block");
                utils.setClassIfChanged(item.lbl, "dom-label " + (d.lit ? "puzzle-mech-on" : "puzzle-mech-lbl"));
                utils.setTextIfChanged(item.lbl, (d.lit ? "✅" : "🔥") + d.brazierLabel);
              }
            } else if (d.isPuzzleRotateStatue) {
              if (item.img && S && item.img._lastSpr !== "ancient_statue") {
                item.img._lastSpr = "ancient_statue";
                item.img.src = S.getDataURL("ancient_statue");
              }
              if (item.lbl) {
                const matched = (d.curDir === d.targetDir);
                utils.setDisplayIfChanged(item.lbl, "block");
                utils.setClassIfChanged(item.lbl, "dom-label " + (matched ? "puzzle-mech-on" : "puzzle-mech-lbl"));
                utils.setTextIfChanged(
                  item.lbl,
                  matched
                    ? ("✅" + d.statueName + ":" + db.DIR_SYMBOLS[d.curDir || 0])
                    : (d.statueName + "[轉去" + db.DIR_SYMBOLS[d.targetDir || 0] + "]:" + db.DIR_SYMBOLS[d.curDir || 0])
                );
              }
            } else if (d.isPuzzleToggleLever) {
              const sprKey = d.leverOn ? "lever_on" : "lever_off";
              if (item.img && S && item.img._lastSpr !== sprKey) {
                item.img._lastSpr = sprKey;
                item.img.src = S.getDataURL(sprKey);
              }
              if (item.lbl) {
                utils.setDisplayIfChanged(item.lbl, "block");
                utils.setClassIfChanged(item.lbl, "dom-label " + (d.leverOn ? "puzzle-mech-on" : "puzzle-mech-lbl"));
                utils.setTextIfChanged(item.lbl, "拉桿" + ["①","②","③"][d.leverIdx] + (d.leverOn ? "[🟢開]" : "[🔴關]"));
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
              utils.setDisplayIfChanged(item.el, "none");
              utils.setDisplayIfChanged(item.lbl, "none");
              return;
            }
            if (n.type === "chest") return;
            const dist = Math.hypot((s.heroX || 0) - n.x, (s.heroY || 0) - n.y);
            const showRadius = (n.isBuriedSpot || n.isToolGateObstacle) ? 105 : 62;
            utils.setDisplayIfChanged(item.lbl, (dist < showRadius) ? "block" : "none");
          });
        } catch (e) {}
      };
    }

    // ================= 6. UI 面板與快捷口糧掛鉤 =================
    if (UI) {
      if (UI.updateAllHud) {
        const origHud = UI.updateAllHud.bind(UI);
        UI.updateAllHud = function() {
          origHud();
          ui.lockLowerScreenControlsPosition();
          ui.updateInlinePuzzleGuideInQuestBox();
        };
      }
      if (UI.setActivePanel) {
        const origPanel = UI.setActivePanel.bind(UI);
        UI.setActivePanel = function(panelId) {
          origPanel(panelId);
          if (panelId === "panel-explore") {
            ui.lockLowerScreenControlsPosition();
            ui.updateInlinePuzzleGuideInQuestBox();
          }
        };
      }

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
        workshop.renderGridWorkshopModal(activeTab || workshop.curTab || "workshop");
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
                '🎯 本區 5 大解題指引' +
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

  // ================= 7. 穩定就緒啟動器 =================
  function initAllSrpgModules() {
    try {
      SRPG.injectStyles();
      SRPG.sprites.register();
      SRPG.data.registerIntoGame();
      SRPG.terrain.mountGuaranteedCompassWidget();
      hookSystems();
      SRPG.ui.lockLowerScreenControlsPosition();
      SRPG.ui.updateInlinePuzzleGuideInQuestBox();

      const Maps = window.Aetheria.Data && window.Aetheria.Data.Maps;
      if (Maps && Maps.getMap) {
        const camp = Maps.getMap("camp_hub");
        if (camp) { camp._campTentsAdjustedToken = null; SRPG.terrain.adjustCampTentsUpward(camp); }
        Object.keys(SRPG.db.HIGHLAND_ZONES).forEach(function(zId) {
          const m = Maps.getMap(zId);
          if (m) { m._highlandInjectedToken = null; SRPG.terrain.injectHighlandCliffIntoMap(m); }
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
      SRPG._ready = true;
    } catch (err) {
      console.error("SRPG Modular v14.5 init error:", err);
    }
  }

  function bootWhenEngineReady() {
    let attempts = 0;
    const maxAttempts = 120;
    const timer = setInterval(function() {
      attempts++;
      const coreReady = Boolean(
        window.Aetheria &&
        window.Aetheria.State &&
        window.Aetheria.State.data &&
        window.Aetheria.Data &&
        window.Aetheria.Data.Maps &&
        window.Aetheria.Renderer &&
        window.Aetheria.Explore &&
        window.Aetheria.UI
      );
      const modulesReady = Boolean(
        SRPG.data && SRPG.terrain && SRPG.ui && SRPG.workshop && SRPG.sprites
      );

      if ((coreReady && modulesReady) || attempts >= maxAttempts) {
        clearInterval(timer);
        if (modulesReady && !SRPG._ready) {
          initAllSrpgModules();
        }
      }
    }, 50);
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    bootWhenEngineReady();
  } else {
    window.addEventListener("load", bootWhenEngineReady);
  }
})();
