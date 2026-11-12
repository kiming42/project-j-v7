/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 擴大傳送門判定(36px)、A鍵過圖與永久保留釣魚點 (exploration-gather.js - v6.5)
 * 修正：1.傳送門與帳篷入口判定半徑擴大至 36px，並支援隨時按 A 鍵直接過圖，徹底解決接觸不良 (問題 7)
 *       2.釣魚點成功釣魚後保留不消失，可無限次重複垂釣 (問題 4)
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const ExploreSystem = {
    isMoving: false,
    moveDX: 0,
    moveDY: 0,
    hazardTimer: 0,

    fishingActive: false,
    fishingSpotRef: null,
    fishCursorPos: 10,
    fishCursorDir: 1,
    fishSpeed: 2.2,
    fishZoneStart: 35,
    fishZoneWidth: 24,
    fishTimerId: null,

    initControls: function() {
      const self = this;
      const bindPad = function(id, dx, dy) {
        const el = document.getElementById(id);
        if (!el) return;
        const start = function(e) {
          if (e && e.cancelable) e.preventDefault();
          self.startMove(dx, dy);
        };
        const end = function(e) {
          if (e && e.cancelable) e.preventDefault();
          self.stopMove();
        };
        el.addEventListener("mousedown", start);
        el.addEventListener("mouseup", end);
        el.addEventListener("mouseleave", end);
        el.addEventListener("touchstart", start, { passive: false });
        el.addEventListener("touchend", end, { passive: false });
      };

      bindPad("btn-up", 0, -1);
      bindPad("btn-down", 0, 1);
      bindPad("btn-left", -1, 0);
      bindPad("btn-right", 1, 0);

      window.addEventListener("keydown", function(e) {
        if (window.Aetheria.Battle && window.Aetheria.Battle.active) return;
        const titleEl = document.getElementById("title-screen");
        if (titleEl && titleEl.style.display !== "none") return;
        const cutEl = document.getElementById("story-cutscene-modal");
        if (cutEl && cutEl.style.display !== "none") return;

        if (self.fishingActive) {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            self.reelInFish();
          }
          return;
        }

        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") self.startMove(0, -1);
        if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") self.startMove(0, 1);
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") self.startMove(-1, 0);
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") self.startMove(1, 0);
        if (e.key === " " || e.key === "Enter") self.interactNearby();
      });

      window.addEventListener("keyup", function(e) {
        const keys = ["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","w","a","s","d","W","A","S","D"];
        if (keys.indexOf(e.key) !== -1) {
          self.stopMove();
        }
      });
    },

    startMove: function(dx, dy) {
      if ((window.Aetheria.Battle && window.Aetheria.Battle.active) || this.fishingActive) return;
      this.moveDX = dx;
      this.moveDY = dy;
      this.isMoving = true;

      const s = window.Aetheria.State.data;
      if (dy > 0) s.facing = "down";
      else if (dy < 0) s.facing = "up";
      else if (dx < 0) s.facing = "left";
      else if (dx > 0) s.facing = "right";
    },

    stopMove: function() {
      this.isMoving = false;
      this.moveDX = 0;
      this.moveDY = 0;
    },

    updateStep: function() {
      if (this.fishingActive) return;
      const s = window.Aetheria.State.data;
      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
      if (!mapObj) return;

      this.checkEnvironmentalHazard(mapObj, s);
      this.updateMonstersAI(mapObj, s);

      if (!this.isMoving) return;

      let speed = 2.65;
      if (s.currentJob === "thief") speed += 0.5;
      if (s.unlockedRelics && s.unlockedRelics.indexOf("r_cloak") !== -1) speed += 0.4;

      let nx = Math.max(28, Math.min(mapObj.width - 42, s.heroX + this.moveDX * speed));
      let ny = Math.max(28, Math.min(mapObj.height - 42, s.heroY + this.moveDY * speed));

      if (mapObj.trees) {
        for (let t = 0; t < mapObj.trees.length; t++) {
          const tr = mapObj.trees[t];
          if (Math.hypot(nx - (tr.x + 10), ny - (tr.y + 12)) < 20) {
            nx = s.heroX;
            ny = s.heroY;
            break;
          }
        }
      }

      if (mapObj.hasRiver) {
        const rx = mapObj.riverX || 1030;
        const by = mapObj.bridgeY || 455;
        const inRiverX = (nx > rx - 16 && nx < rx + 44);
        const onBridgeY = (ny > by - 8 && ny < by + 46);

        if (inRiverX) {
          const bProj = mapObj.bridgeProject;
          const isBridgeBuilt = !bProj || Boolean(s.projectsBuilt && s.projectsBuilt[bProj]);

          if (!onBridgeY) {
            nx = s.heroX;
          } else if (!isBridgeBuilt) {
            nx = s.heroX;
            const projObj = (window.Aetheria.Data.SURVIVAL_PROJECTS && window.Aetheria.Data.SURVIVAL_PROJECTS[bProj]) || { name: "跨河工程" };
            window.Aetheria.UI.showToast("去路被阻斷！請對準岸邊工程牌按 A 鍵投入建材完成【" + projObj.name + "】！");
          }
        }
      }

      if (mapObj.decos) {
        for (let i = 0; i < mapObj.decos.length; i++) {
          const d = mapObj.decos[i];
          const wallCleared = d.isCrackedWall && s.openedNodes && s.openedNodes[d.id];
          const obsCleared = Boolean(d.cleared);

          if (!wallCleared && !obsCleared && (d.isCrackedWall || d.obstacleType)) {
            if (Math.hypot(nx - d.x, ny - d.y) < 24) {
              nx = s.heroX;
              ny = s.heroY;
              if (d.isCrackedWall) {
                window.Aetheria.UI.showToast("裂縫岩壁擋路！請按右下角【炸彈】炸開密室（需先幫礦工石頭取得火藥袋）！");
              } else if (d.obstacleType === "boulder") {
                window.Aetheria.UI.showToast("玄武巨石擋路！升級【Lv.2 秘銀重鎬】後按 A 鍵即可敲碎並獲得玄武岩塊！");
              } else if (d.obstacleType === "deadtree") {
                window.Aetheria.UI.showToast("巨型枯木擋路！升級【Lv.2 烈焰戰斧】後按 A 鍵即可砍斷！");
              }
            }
          }
        }
      }

      s.petX += (s.heroX - this.moveDX * 20 - s.petX) * 0.2;
      s.petY += (s.heroY - this.moveDY * 18 - s.petY) * 0.2;
      s.heroX = nx;
      s.heroY = ny;

      // 擴大傳送門判定半徑至 36px，行到附近或按 A 鍵即可順暢過圖 (問題 7)
      if (mapObj.portals) {
        for (let j = 0; j < mapObj.portals.length; j++) {
          const p = mapObj.portals[j];
          if (Math.hypot(s.heroX - p.x, s.heroY - p.y) < 36) {
            this.stopMove();
            this.triggerPortal(p);
            return;
          }
        }
      }

      this.updateContextHint(mapObj, s);
      window.Aetheria.UI.updateHudZoneDynamic(mapObj, s);
    },

    checkEnvironmentalHazard: function(mapObj, s) {
      const hazEl = document.getElementById("hazard-overlay");
      if (!mapObj.hazard) {
        if (hazEl) hazEl.className = "";
        return;
      }

      const immune = window.Aetheria.State.hasHazardImmunity(mapObj.hazard);
      if (immune) {
        if (hazEl) hazEl.className = "";
        return;
      }

      if (hazEl) hazEl.className = mapObj.hazard;

      if (this.isMoving) {
        this.hazardTimer++;
        if (this.hazardTimer >= 150) {
          this.hazardTimer = 0;
          const dmg = (mapObj.hazard === "cold") ? 15 : 22;
          s.hp = Math.max(1, s.hp - dmg);
          window.Aetheria.UI.spawnFloatingText("-" + dmg + (mapObj.hazard === "cold" ? " 凍傷!" : " 灼傷!"), "#ff595e", false);
          window.Aetheria.UI.showToast(mapObj.hazard === "cold"
            ? "暴風雪凍傷！請在雪原中央搭建【極地防風毛皮屋】、穿戴毛皮甲或煮暖陽火鍋！"
            : "熔岩高溫灼傷！請穿戴【黑曜龍鱗神鎧】或回營地烹調【暖陽火鍋】！");
        }
      }
    },

    updateMonstersAI: function(mapObj, s) {
      if (!mapObj || !mapObj.monsters || mapObj.monsters.length === 0) return;
      if (window.Aetheria.Battle && window.Aetheria.Battle.active) return;
      const titleEl = document.getElementById("title-screen");
      if (titleEl && titleEl.style.display !== "none") return;
      const cutEl = document.getElementById("story-cutscene-modal");
      if (cutEl && cutEl.style.display !== "none") return;

      for (let i = 0; i < mapObj.monsters.length; i++) {
        const m = mapObj.monsters[i];
        if (m.alive === false) continue;

        const distToHero = Math.hypot(s.heroX - m.x, s.heroY - m.y);

        if (distToHero < 20) {
          this.stopMove();

          if (!window.Aetheria.State.hasWeaponEquipped()) {
            s.heroX = Math.max(40, s.heroX - 36);
            window.Aetheria.Audio.sfxWrong();
            window.Aetheria.UI.showToast("你現在赤手空拳無法戰鬥！請先回營地拾取枯枝、燧石與黏土修復【巴爾的鍛造爐】領取忍刀！");
            return;
          }

          if (m.reqSeals && m.reqSeals.length > 0) {
            const unsealedCount = m.reqSeals.filter(function(sid) {
              return Boolean(s.unlockedSeals && s.unlockedSeals[sid]);
            }).length;
            if (unsealedCount < m.reqSeals.length) {
              s.heroX = Math.max(40, s.heroX - 32);
              window.Aetheria.Audio.sfxWrong();
              window.Aetheria.UI.showToast("領主護體結界生效中！請先深入迷宮南北兩翼點亮【符文封印柱】(" + unsealedCount + "/" + m.reqSeals.length + ")！");
              return;
            }
          }

          if (m.isShiny) m.forceShiny = true;
          window.Aetheria.Battle.startBattle(m);
          return;
        }

        const aggroRadius = m.isBoss ? 68 : 76;
        if (distToHero < aggroRadius) {
          m.aggro = true;
          const chaseSpeed = m.isBoss ? 0.95 : 1.45;
          const dx = (s.heroX - m.x) / (distToHero || 1);
          const dy = (s.heroY - m.y) / (distToHero || 1);
          let nextMX = m.x + dx * chaseSpeed;
          let nextMY = m.y + dy * chaseSpeed;

          if (mapObj.hasRiver) {
            const rx = mapObj.riverX || 1030;
            if (nextMX > rx - 16 && nextMX < rx + 44) nextMX = m.x;
          }

          m.x = Math.max(35, Math.min(mapObj.width - 45, nextMX));
          m.y = Math.max(35, Math.min(mapObj.height - 45, nextMY));
        } else if (!m.isBoss) {
          m.aggro = false;
          m.patrolTimer = (m.patrolTimer || 60) - 1;
          if (m.patrolTimer <= 0) {
            m.patrolTimer = 50 + Math.floor(Math.random() * 60);
            const randAng = Math.random() * Math.PI * 2;
            m.vx = Math.cos(randAng) * 0.55;
            m.vy = Math.sin(randAng) * 0.55;
          }

          let nextMX = m.x + (m.vx || 0);
          let nextMY = m.y + (m.vy || 0);

          const distFromHome = Math.hypot(nextMX - (m.homeX || m.x), nextMY - (m.homeY || m.y));
          if (distFromHome > 60) {
            m.vx = ((m.homeX || m.x) - m.x) * 0.02;
            m.vy = ((m.homeY || m.y) - m.y) * 0.02;
            nextMX = m.x + m.vx;
            nextMY = m.y + m.vy;
          }

          m.x = Math.max(35, Math.min(mapObj.width - 45, nextMX));
          m.y = Math.max(35, Math.min(mapObj.height - 45, nextMY));
        } else {
          m.aggro = false;
        }
      }
    },

    updateContextHint: function(mapObj, s) {
      const hintEl = document.getElementById("a-btn-hint");
      if (!hintEl) return;

      if (s.currentZone === "camp_hub" && Math.hypot(s.heroX - 345, s.heroY - 245) < 36) {
        hintEl.innerText = "行前料理";
        return;
      }
      if (mapObj.portals) {
        for (let p = 0; p < mapObj.portals.length; p++) {
          const portal = mapObj.portals[p];
          if (Math.hypot(s.heroX - portal.x, s.heroY - portal.y) < 42) {
            hintEl.innerText = "進入過圖";
            return;
          }
        }
      }
      if (mapObj.npcs) {
        for (let i = 0; i < mapObj.npcs.length; i++) {
          const npc = mapObj.npcs[i];
          if (Math.hypot(s.heroX - npc.x, s.heroY - npc.y) < 36) {
            hintEl.innerText = "對話:" + (npc.name.split("・")[1] || npc.name);
            return;
          }
        }
      }
      if (mapObj.decos) {
        for (let j = 0; j < mapObj.decos.length; j++) {
          const d = mapObj.decos[j];
          if (!d.cleared && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 38) {
            if (d.isProjectSite) {
              const built = s.projectsBuilt && s.projectsBuilt[d.projectId];
              hintEl.innerText = built ? (d.isClimbLadder ? "攀爬木梯" : "使用設施") : "拓荒建造";
              return;
            }
            if (d.isSealPillar)  { hintEl.innerText = "解開封印柱"; return; }
            if (d.isFishingSpot) { hintEl.innerText = "垂釣小遊戲"; return; }
            if (d.isGrapple)     { hintEl.innerText = "飛爪鉤"; return; }
            if (d.isBrazier)     { hintEl.innerText = "點火盆"; return; }
            if (d.obstacleType === "boulder")  { hintEl.innerText = "碎巨石"; return; }
            if (d.obstacleType === "deadtree") { hintEl.innerText = "砍枯木"; return; }
          }
        }
      }
      if (mapObj.nodes) {
        for (let k = 0; k < mapObj.nodes.length; k++) {
          const n = mapObj.nodes[k];
          if (!n.opened && !(n.legendary && s.openedNodes && s.openedNodes[n.id]) && Math.hypot(s.heroX - n.x, s.heroY - n.y) < 34) {
            hintEl.innerText = (n.reqToolLv === 0 ? "拾取:" : "採集:") + n.name.slice(0, 4);
            return;
          }
        }
      }
      hintEl.innerText = "對話 / 拾取";
    },

    triggerPortal: function(portal) {
      const s = window.Aetheria.State.data;

      if (portal.targetZone === "zone1_forest" && !window.Aetheria.State.hasWeaponEquipped()) {
        s.heroX -= 28;
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.showToast("赤手空拳進入迷霧森林太危險了！請先在鐵匠帳篷找巴爾修復鍛造爐領取忍刀！");
        return;
      }

      if (portal.reqBoss && !(s.clearedBosses && s.clearedBosses[portal.reqBoss])) {
        s.heroX -= 28;
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.showToast("蝕憶結界封鎖中！必須先解開雙封印柱並擊敗【" + (portal.reqBossName || "區域領主") + "】才可通行！");
        return;
      }

      let newlyUnlocked = false;
      window.Aetheria.Data.Maps.refreshAllResources();
      if (window.Aetheria.Renderer) window.Aetheria.Renderer.builtZoneKey = null;

      if (portal.targetZone === "endless_tower_next") {
        const curMap = window.Aetheria.Data.Maps.getMap("endless_tower");
        const nextFloor = (curMap.floorNum || 1) + 1;
        s.maxTowerFloor = Math.max(s.maxTowerFloor || 1, nextFloor);
        window.Aetheria.Data.Maps.advanceTowerFloor(nextFloor);
        s.currentZone = "endless_tower";
        s.heroX = portal.targetX;
        s.heroY = portal.targetY;
        newlyUnlocked = window.Aetheria.State.unlockZone("endless_tower");
      } else {
        s.currentZone = portal.targetZone;
        s.heroX = portal.targetX;
        s.heroY = portal.targetY;
        newlyUnlocked = window.Aetheria.State.unlockZone(portal.targetZone);
      }

      s.petX = s.heroX - 20;
      s.petY = s.heroY + 6;
      window.Aetheria.State.save();

      const newMap = window.Aetheria.Data.Maps.getMap(s.currentZone);
      window.Aetheria.Audio.playBgm(newMap.bgm || "forest");
      window.Aetheria.UI.updateAllHud();

      const cutKey = "enter_" + s.currentZone;
      if (window.Aetheria.Data.STORY_CUTSCENES[cutKey] && !(s.seenCutscenes && s.seenCutscenes[cutKey])) {
        s.seenCutscenes[cutKey] = true;
        window.Aetheria.State.save();
        window.Aetheria.UI.playCutscene(cutKey);
      } else if (newlyUnlocked) {
        window.Aetheria.Audio.sfxLevelUp();
        window.Aetheria.UI.showToast("已抵達並解鎖【" + newMap.name + "】傳送石碑！");
      } else {
        window.Aetheria.UI.showToast("進入【" + newMap.name + "】");
      }
    },

    interactNearby: function() {
      if ((window.Aetheria.Battle && window.Aetheria.Battle.active) || this.fishingActive) return;
      const s = window.Aetheria.State.data;
      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);

      // 1. 傳送門過圖 (按 A 鍵直接過圖)
      if (mapObj.portals) {
        for (let p = 0; p < mapObj.portals.length; p++) {
          const portal = mapObj.portals[p];
          if (Math.hypot(s.heroX - portal.x, s.heroY - portal.y) < 42) {
            this.triggerPortal(portal);
            return;
          }
        }
      }

      // 2. 營地燉肉鍋
      if (s.currentZone === "camp_hub" && Math.hypot(s.heroX - 345, s.heroY - 245) < 36) {
        window.Aetheria.Audio.sfxTalkBlip();
        window.Aetheria.UI.openCookingModal();
        return;
      }

      // 3. 實地拓荒工程點
      if (mapObj.decos) {
        for (let j = 0; j < mapObj.decos.length; j++) {
          const d = mapObj.decos[j];
          if (d.isProjectSite && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 36) {
            const built = Boolean(s.projectsBuilt && s.projectsBuilt[d.projectId]);
            if (!built) {
              window.Aetheria.Audio.sfxTalkBlip();
              window.Aetheria.UI.openProjectModal(d.projectId);
              return;
            } else if (d.isClimbLadder) {
              window.Aetheria.Audio.sfxGather();
              if (s.heroY > (d.topY + d.bottomY) / 2) {
                s.heroY = d.topY;
                window.Aetheria.UI.showToast("順著絞盤木梯爬上了北翼斷崖高台！");
              } else {
                s.heroY = d.bottomY;
                window.Aetheria.UI.showToast("順著絞盤木梯回到了峽谷下方！");
              }
              s.petX = s.heroX - 18;
              s.petY = s.heroY + 4;
              window.Aetheria.State.save();
              return;
            } else if (d.projectId === "proj_z4_shelter") {
              window.Aetheria.State.recalcMaxHp();
              s.hp = s.maxHp;
              window.Aetheria.Audio.sfxLevelUp();
              window.Aetheria.State.save();
              window.Aetheria.UI.updateAllHud();
              window.Aetheria.UI.showToast("在【極地防風毛皮屋】烤火休整，生命值已完全恢復！");
              return;
            }
          }
        }
      }

      // 4. 身邊 NPC
      if (mapObj.npcs) {
        for (let i = 0; i < mapObj.npcs.length; i++) {
          const npc = mapObj.npcs[i];
          if (Math.hypot(s.heroX - npc.x, s.heroY - npc.y) < 38) {
            window.Aetheria.Audio.sfxTalkBlip();
            window.Aetheria.UI.openNpcDialogue(npc.id);
            return;
          }
        }
      }

      // 5. 其他互動機關
      if (mapObj.decos) {
        for (let j = 0; j < mapObj.decos.length; j++) {
          const d = mapObj.decos[j];
          if (!d.cleared && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 38) {
            if (d.isSealPillar) {
              if (!s.unlockedSeals) s.unlockedSeals = {};
              if (s.unlockedSeals[d.id]) {
                window.Aetheria.UI.showToast("此座【" + (d.name || "符文封印柱") + "】已經解封點亮了！");
                return;
              }
              s.unlockedSeals[d.id] = true;
              window.Aetheria.Audio.sfxLevelUp();
              window.Aetheria.State.save();
              window.Aetheria.UI.updateAllHud();
              window.Aetheria.UI.showToast("成功點亮【" + (d.name || "符文封印柱") + "】！守關領主的結界已削弱！");
              return;
            }
            if (d.isFishingSpot) {
              this.startFishingMinigame(d);
              return;
            }
            if (d.isGrapple) {
              if ((s.tools.hook || 0) < 2) {
                window.Aetheria.UI.showToast("需要【Lv.2 鐵索飛爪鉤】才可飛越！請至營地工坊升級工具。");
                return;
              }
              window.Aetheria.Audio.sfxAttackHit();
              s.heroX = d.targetX;
              s.heroY = d.targetY;
              s.petX = s.heroX - 18;
              s.petY = s.heroY + 4;
              window.Aetheria.State.save();
              window.Aetheria.UI.showToast("發射鐵索飛爪鉤，成功飛越對岸！");
              return;
            }
            if (d.isBrazier) {
              const litKey = "lit_" + mapObj.id;
              s.openedNodes[litKey] = true;
              window.Aetheria.Audio.sfxLevelUp();
              window.Aetheria.State.save();
              window.Aetheria.UI.updateAllHud();
              window.Aetheria.UI.showToast("已點燃古代火盆！");
              return;
            }
            if (d.obstacleType === "boulder") {
              if ((s.tools.pickaxe || 0) < 2) {
                window.Aetheria.Audio.sfxWrong();
                window.Aetheria.UI.showToast("岩石堅硬！請先到營地工坊升級【Lv.2 秘銀重鎬】！");
                return;
              }
              d.cleared = true;
              s.inventory.basalt = (s.inventory.basalt || 0) + 1;
              window.Aetheria.Audio.sfxBreakShield();
              window.Aetheria.State.save();
              window.Aetheria.UI.updateAllHud();
              window.Aetheria.UI.showToast("使用秘銀重鎬擊碎擋路巨石，獲得【玄武岩塊 +1】！");
              return;
            }
            if (d.obstacleType === "deadtree") {
              if ((s.tools.axe || 0) < 2) {
                window.Aetheria.Audio.sfxWrong();
                window.Aetheria.UI.showToast("枯木粗壯！請先到營地工坊升級【Lv.2 烈焰戰斧】！");
                return;
              }
              d.cleared = true;
              s.inventory.wood = (s.inventory.wood || 0) + 1;
              window.Aetheria.Audio.sfxBreakShield();
              window.Aetheria.State.save();
              window.Aetheria.UI.updateAllHud();
              window.Aetheria.UI.showToast("揮動烈焰戰斧劈開巨型枯木，獲得【翠風原木 +1】！");
              return;
            }
          }
        }
      }

      // 6. 採集資源點
      if (mapObj.nodes) {
        for (let k = 0; k < mapObj.nodes.length; k++) {
          const n = mapObj.nodes[k];
          if (!n.opened && !(n.legendary && s.openedNodes && s.openedNodes[n.id]) && Math.hypot(s.heroX - n.x, s.heroY - n.y) < 34) {
            this.harvestNode(n);
            return;
          }
        }
      }

      window.Aetheria.UI.showToast("請走近 NPC、拓荒工程牌、傳送門或資源點再按 A 鍵！");
    },

    startFishingMinigame: function(spot) {
      const s = window.Aetheria.State.data;
      const hookLv = (s.tools && s.tools.hook) || 0;

      if (hookLv < 1) {
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.showToast("尚未持有釣魚竿！請先找營地池塘邊的【老漁夫・阿海】完成修補魚簍委託！");
        return;
      }

      this.stopMove();
      this.fishingActive = true;
      this.fishingSpotRef = spot;
      this.fishCursorPos = 6;
      this.fishCursorDir = 1;

      this.fishZoneWidth = (hookLv >= 3) ? 40 : (hookLv === 2) ? 30 : 22;
      this.fishZoneStart = 22 + Math.floor(Math.random() * (68 - this.fishZoneWidth));
      this.fishSpeed = (hookLv >= 3) ? 1.85 : 2.25;

      const modal = document.getElementById("fishing-minigame-modal");
      const targetEl = document.getElementById("fishing-target-zone");
      const cursorEl = document.getElementById("fishing-cursor");

      if (targetEl) {
        targetEl.style.left = this.fishZoneStart + "%";
        targetEl.style.width = this.fishZoneWidth + "%";
      }
      if (cursorEl) {
        cursorEl.style.left = this.fishCursorPos + "%";
      }
      if (modal) modal.style.display = "flex";

      const self = this;
      clearInterval(this.fishTimerId);
      this.fishTimerId = setInterval(function() {
        self.fishCursorPos += self.fishCursorDir * self.fishSpeed;
        if (self.fishCursorPos >= 94) {
          self.fishCursorPos = 94;
          self.fishCursorDir = -1;
        } else if (self.fishCursorPos <= 2) {
          self.fishCursorPos = 2;
          self.fishCursorDir = 1;
        }
        if (cursorEl) cursorEl.style.left = self.fishCursorPos + "%";
      }, 16);
    },

    reelInFish: function() {
      if (!this.fishingActive) return;
      clearInterval(this.fishTimerId);

      const s = window.Aetheria.State.data;
      const hookLv = (s.tools && s.tools.hook) || 1;
      const centerPos = this.fishCursorPos + 2;
      const zoneStart = this.fishZoneStart;
      const zoneEnd = this.fishZoneStart + this.fishZoneWidth;

      const perfStart = zoneStart + this.fishZoneWidth * 0.32;
      const perfEnd = zoneEnd - this.fishZoneWidth * 0.32;

      if (centerPos >= zoneStart && centerPos <= zoneEnd) {
        const isPerfect = (centerPos >= perfStart && centerPos <= perfEnd);
        // 注意：不將 spot.cleared 設為 true，確保釣魚點永不消失、可無限次垂釣 (問題 4)

        s.inventory.fish = (s.inventory.fish || 0) + 1;
        s.questProgress.fishedOnce = true;
        if (!s.bountyStats) s.bountyStats = { kills: 0, breaks: 0, fishes: 0, meals: 0 };
        s.bountyStats.fishes = (s.bountyStats.fishes || 0) + 1;

        let msg = "垂釣成功！獲得【銀鱗鮮魚 +1】！";
        if (isPerfect) {
          const goldBonus = (s.monolithPts && s.monolithPts.science >= 75) ? 60 : 30;
          s.gold += goldBonus;
          if (hookLv >= 3) {
            s.inventory.coral = (s.inventory.coral || 0) + 1;
            msg = "金色紅心完美收竿！獲得【銀鱗鮮魚 +1】、【深海珊瑚 +1】與 " + goldBonus + " G！";
          } else {
            msg = "金色紅心完美收竿！獲得【銀鱗鮮魚 +1】與賞金 " + goldBonus + " G！";
          }
          window.Aetheria.Audio.sfxLevelUp();
        } else {
          window.Aetheria.Audio.sfxGather();
        }

        window.Aetheria.State.save();
        window.Aetheria.UI.updateAllHud();
        window.Aetheria.UI.showToast(msg);
      } else {
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.showToast("收竿時機偏差，魚兒掙脫逃走了！可再次按 A 鍵重試。");
      }

      this.closeFishingMinigame();
    },

    closeFishingMinigame: function() {
      clearInterval(this.fishTimerId);
      this.fishingActive = false;
      this.fishingSpotRef = null;
      const modal = document.getElementById("fishing-minigame-modal");
      if (modal) modal.style.display = "none";
    },

    harvestNode: function(node) {
      const s = window.Aetheria.State.data;

      if (node.type === "chest") {
        node.opened = true;
        if (node.legendary) s.openedNodes[node.id] = true;
        window.Aetheria.Audio.sfxLevelUp();

        if (s.currentZone === "camp_hub" || s.currentZone === "tent_guild" || s.currentZone === "zone1_forest" || s.currentZone === "cave1_mushroom") {
          s.inventory.plank += 1;
          s.inventory.rope += 1;
          s.inventory.potionHeal += 1;
          window.Aetheria.UI.showToast("開啟秘寶箱：獲得【加工厚木板 +1、強化麻繩索 +1、生命藥水 +1】！");
        } else if (s.currentZone === "zone2_canyon" || s.currentZone === "zone3_coast") {
          s.inventory.mithril += 1;
          s.inventory.coral += 1;
          s.inventory.pitch += 1;
          window.Aetheria.UI.showToast("開啟秘寶箱：獲得【流沙秘銀礦 +1、深海珊瑚 +1、防水松脂膠 +1】！");
        } else if (s.currentZone === "zone4_snow" || s.currentZone === "zone5_volcano") {
          s.inventory.obsidian += 1;
          s.inventory.firebrick += 1;
          s.inventory.tameFruit += 1;
          window.Aetheria.UI.showToast("開啟秘寶箱：獲得【熔岩黑曜石 +1、黑曜耐火磚 +1、靈獸誘餌果 +1】！");
        } else {
          s.inventory.starIron += 1;
          s.inventory.goldLeaf += 1;
          s.inventory.tabletShard += 1;
          window.Aetheria.UI.showToast("開啟至高秘寶箱：獲得【深淵星隕鐵 +1、世界樹金葉 +1、聖碑殘片 +1】！");
        }
        window.Aetheria.State.save();
        window.Aetheria.UI.updateAllHud();
        return;
      }

      const reqTool = node.reqTool || (node.type === "crystal" ? "pickaxe" : "axe");
      const reqLv = (node.reqToolLv !== undefined) ? node.reqToolLv : 1;

      if (reqLv > 0) {
        const curToolLv = (s.tools && s.tools[reqTool]) || 0;
        if (curToolLv < reqLv) {
          const toolName = (reqTool === "pickaxe") ? "十字鎬" : "伐木斧";
          window.Aetheria.Audio.sfxWrong();
          if (curToolLv === 0) {
            window.Aetheria.UI.showToast("尚未持有" + toolName + "！請先在鐵匠帳篷找巴爾修復鍛造爐！");
          } else {
            window.Aetheria.UI.showToast("工具等級不足！採集【" + node.name + "】需要升級至 Lv." + reqLv + " " + toolName + "！");
          }
          return;
        }
      }

      node.opened = true;

      if (node.perfect) {
        window.Aetheria.Battle.startHarvestChallenge(node);
        return;
      }

      window.Aetheria.Audio.sfxGather();
      const matKey = node.giveKey || "iron";
      s.inventory[matKey] = (s.inventory[matKey] || 0) + 1;

      const matObj = window.Aetheria.Data.MATERIALS[matKey] || { name: matKey };
      let msg = (reqLv === 0 ? "拾取成功" : "採集成功") + "：獲得【" + matObj.name + " +1】！";

      if (reqTool === "axe" && (s.tools.axe || 0) >= 3 && Math.random() < 0.25) {
        s.inventory.tameFruit = (s.inventory.tameFruit || 0) + 1;
        msg += "（神斧額外發現靈獸誘餌果 +1！）";
      }

      window.Aetheria.State.save();
      window.Aetheria.UI.updateAllHud();
      window.Aetheria.UI.showToast(msg);
    },

    useBomb: function() {
      if ((window.Aetheria.Battle && window.Aetheria.Battle.active) || this.fishingActive) return;
      const s = window.Aetheria.State.data;
      if ((s.tools.bomb || 0) < 1) {
        window.Aetheria.Audio.sfxWrong();
        window.Aetheria.UI.showToast("尚未持有【基礎火藥袋】！請先到第一區森林北翼洞口幫助【見習礦工・石頭】！");
        return;
      }
      if ((s.inventory.bombItem || 0) <= 0) {
        window.Aetheria.UI.showToast("爆破炸彈不足！可在營地工坊用尖銳燧石提煉或於金幣商店購買。");
        return;
      }

      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
      if (mapObj.decos) {
        for (let i = 0; i < mapObj.decos.length; i++) {
          const d = mapObj.decos[i];
          if (d.isCrackedWall && !(s.openedNodes && s.openedNodes[d.id]) && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 44) {
            s.inventory.bombItem--;
            s.openedNodes[d.id] = true;
            window.Aetheria.Audio.sfxBomb();
            window.Aetheria.State.save();
            window.Aetheria.UI.showToast("轟隆！成功炸開裂縫岩壁，隱藏賞金首密室已開啟！");
            return;
          }
        }
      }
      window.Aetheria.UI.showToast("請走近洞窟內的「裂縫岩壁」再使用炸彈！");
    },

    warpToCamp: function() {
      if ((window.Aetheria.Battle && window.Aetheria.Battle.active) || this.fishingActive) return;
      const s = window.Aetheria.State.data;
      window.Aetheria.Data.Maps.refreshAllResources();
      if (window.Aetheria.Renderer) window.Aetheria.Renderer.builtZoneKey = null;

      s.currentZone = "camp_hub";
      s.heroX = 320;
      s.heroY = 260;
      s.petX = 296;
      s.petY = 264;
      s.facing = "down";
      window.Aetheria.State.save();
      window.Aetheria.Audio.playBgm("forest");
      window.Aetheria.UI.closePanelToExplore();
      window.Aetheria.UI.updateAllHud();
      window.Aetheria.UI.showToast("已返回【0. 曙光露營基地】（全大陸資源已刷新）！");
    }
  };

  window.Aetheria.Explore = ExploreSystem;
})();
