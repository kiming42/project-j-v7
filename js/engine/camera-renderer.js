/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 日夜光影、火把照明與大世界渲染器 (camera-renderer.js - v7.0)
 * 新增：1.動態渲染四時段光影遮罩 (#daynight-overlay：破曉/白晝/黃昏/黑夜)
 *       2.支援松脂火把 (torchTicks > 0) 在黑夜擴大暖光視野，並可在洞窟內暫時驅散黑霧
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  const Renderer = {
    tick: 0,
    builtZoneKey: null,
    domPool: {
      hero: null,
      pet: null,
      subPet: null,
      bridge: null,
      portals: {},
      decos: {},
      nodes: {},
      npcs: {},
      monsters: {}
    },
    lastHeartsState: "",

    buildSceneDOM: function(mapObj) {
      const mapLayer = document.getElementById("world-map-layer");
      const terrainLayer = document.getElementById("world-terrain-layer");
      const entityLayer = document.getElementById("world-entity-layer");
      if (!mapLayer || !terrainLayer || !entityLayer) return;

      const Sprites = window.Aetheria.Data.Sprites;

      mapLayer.style.width = mapObj.width + "px";
      mapLayer.style.height = mapObj.height + "px";
      mapLayer.className = "map-theme-" + (mapObj.theme || "forest");

      terrainLayer.innerHTML = "";
      entityLayer.innerHTML = "";
      this.domPool = {
        hero: null, pet: null, subPet: null, bridge: null,
        portals: {}, decos: {}, nodes: {}, npcs: {}, monsters: {}
      };

      // 1. 地面泥土步道
      (mapObj.dirtBlobs || []).forEach(function(b) {
        const d = document.createElement("div");
        d.className = "dom-dirt-blob";
        if (b.w && b.h) {
          d.style.left = b.x + "px";
          d.style.top = b.y + "px";
          d.style.width = b.w + "px";
          d.style.height = b.h + "px";
        } else {
          d.style.left = (b.cx - b.rx) + "px";
          d.style.top = (b.cy - b.ry) + "px";
          d.style.width = (b.rx * 2) + "px";
          d.style.height = (b.ry * 2) + "px";
        }
        terrainLayer.appendChild(d);
      });

      // 2. 河流與動態橋樑
      if (mapObj.hasRiver) {
        const rx = mapObj.riverX || 1030;
        const by = mapObj.bridgeY || 455;
        const river = document.createElement("div");
        river.className = "dom-river" + (mapObj.isLavaRiver ? " lava-river" : "");
        river.style.left = rx + "px";
        river.style.height = mapObj.height + "px";
        terrainLayer.appendChild(river);

        const bridge = document.createElement("div");
        bridge.className = "dom-bridge";
        bridge.style.left = (rx - 8) + "px";
        bridge.style.top = by + "px";
        terrainLayer.appendChild(bridge);
        this.domPool.bridge = bridge;
      }

      // 3. 傳送門與帳篷入口
      const self = this;
      (mapObj.portals || []).forEach(function(p) {
        const el = document.createElement("div");
        el.className = "dom-entity";
        el.style.left = (p.x - 16) + "px";
        el.style.top = (p.y - 16) + "px";
        el.style.width = "32px";
        el.style.height = "26px";
        el.style.zIndex = Math.round(p.y);

        const spKey = (p.icon === "cave" || p.icon === "abyss") ? "cracked_wall" : "crate";
        const lbl = document.createElement("div");
        lbl.className = "dom-label portal-lbl" + (p.labelBottom ? " lbl-bottom" : "");
        lbl.innerText = p.name;
        el.appendChild(lbl);

        const img = document.createElement("img");
        img.src = Sprites.getDataURL(spKey);
        el.appendChild(img);

        terrainLayer.appendChild(el);
        self.domPool.portals[p.id] = { el: el, lbl: lbl, data: p };
      });

      // 4. 迷宮樹木與岩柱
      (mapObj.trees || []).forEach(function(t) {
        const el = document.createElement("div");
        el.className = "dom-entity";
        el.style.left = t.x + "px";
        el.style.top = t.y + "px";
        el.style.width = "36px";
        el.style.height = "38px";
        el.style.zIndex = Math.round(t.y + 34);
        const spKey = (mapObj.theme === "forest") ? "tree" : "pillar";
        el.innerHTML = '<img src="' + Sprites.getDataURL(spKey) + '" alt="">';
        terrainLayer.appendChild(el);
      });

      // 5. 裝飾物、釣魚點與實地拓荒工程
      (mapObj.decos || []).forEach(function(d, idx) {
        const key = d.id || ("deco_" + idx);
        const el = document.createElement("div");
        el.className = "dom-entity";
        el.style.left = d.x + "px";
        el.style.top = d.y + "px";
        el.style.width = (d.w || 26) + "px";
        el.style.height = (d.h || 26) + "px";
        el.style.zIndex = Math.round(d.y + (d.h || 26));

        const lbl = document.createElement("div");
        lbl.className = "dom-label";
        lbl.style.display = "none";
        el.appendChild(lbl);

        const img = document.createElement("img");
        img.src = Sprites.getDataURL(d.sprite);
        el.appendChild(img);

        entityLayer.appendChild(el);
        self.domPool.decos[key] = { el: el, img: img, lbl: lbl, data: d };
      });

      // 6. 採集資源點
      (mapObj.nodes || []).forEach(function(n) {
        const el = document.createElement("div");
        el.className = "dom-entity";
        el.style.left = n.x + "px";
        el.style.top = n.y + "px";
        el.style.width = "24px";
        el.style.height = "24px";
        el.style.zIndex = Math.round(n.y + 20);

        let spKey = "crate";
        if (n.type === "chest") {
          spKey = "chest";
        } else if (n.giveKey && Sprites.getMatSpriteKey) {
          spKey = Sprites.getMatSpriteKey(n.giveKey);
        } else if (n.type === "wood") {
          spKey = "mat_wood";
        }

        el.innerHTML = '<img src="' + Sprites.getDataURL(spKey) + '" alt="">';
        entityLayer.appendChild(el);
        self.domPool.nodes[n.id] = { el: el, data: n };
      });

      // 7. 營地與各區村民 NPC
      (mapObj.npcs || []).forEach(function(npc) {
        const el = document.createElement("div");
        el.className = "dom-entity";
        el.style.left = npc.x + "px";
        el.style.top = npc.y + "px";
        el.style.width = "28px";
        el.style.height = "28px";
        el.style.zIndex = Math.round(npc.y + 26);

        const lbl = document.createElement("div");
        lbl.className = "dom-label";
        el.appendChild(lbl);

        const img = document.createElement("img");
        img.src = Sprites.getDataURL(npc.sprite);
        el.appendChild(img);

        entityLayer.appendChild(el);
        self.domPool.npcs[npc.id] = { el: el, lbl: lbl, data: npc };
      });

      // 8. 野外魔物、賞金首與守關領主
      (mapObj.monsters || []).forEach(function(m) {
        const sz = m.isBoss ? 38 : (m.isElite ? 32 : 26);
        const el = document.createElement("div");
        el.className = "dom-entity";
        el.style.width = sz + "px";
        el.style.height = sz + "px";

        const lbl = document.createElement("div");
        lbl.className = "dom-label";
        el.appendChild(lbl);

        const hpBar = document.createElement("div");
        hpBar.className = "dom-hp-mini";
        hpBar.innerHTML = '<div class="dom-hp-mini-fill"></div>';
        el.appendChild(hpBar);

        let spKey = (m.type === "boss") ? "mon_boss" : (m.type === "skull") ? "mon_skull" : "mon_bamboo";
        if (m.isShiny && !m.isBoss) spKey += "_shiny";
        const img = document.createElement("img");
        img.src = Sprites.getDataURL(spKey);
        el.appendChild(img);

        entityLayer.appendChild(el);
        self.domPool.monsters[m.id] = { el: el, lbl: lbl, img: img, data: m, sz: sz };
      });

      // 9. 同行戰寵與副戰寵
      const petEl = document.createElement("div");
      petEl.className = "dom-entity";
      petEl.style.width = "24px";
      petEl.style.height = "24px";
      const petImg = document.createElement("img");
      petEl.appendChild(petImg);
      entityLayer.appendChild(petEl);
      this.domPool.pet = { el: petEl, img: petImg };

      const subPetEl = document.createElement("div");
      subPetEl.className = "dom-entity";
      subPetEl.style.width = "22px";
      subPetEl.style.height = "22px";
      const subPetImg = document.createElement("img");
      subPetEl.appendChild(subPetImg);
      entityLayer.appendChild(subPetEl);
      this.domPool.subPet = { el: subPetEl, img: subPetImg };

      // 10. 主角
      const heroEl = document.createElement("div");
      heroEl.className = "dom-entity";
      heroEl.style.width = "28px";
      heroEl.style.height = "28px";
      const heroImg = document.createElement("img");
      heroImg.src = Sprites.getDataURL("hero_down_0");
      heroEl.appendChild(heroImg);
      entityLayer.appendChild(heroEl);
      this.domPool.hero = { el: heroEl, img: heroImg };

      this.builtZoneKey = mapObj.id + "_" + (mapObj.floorNum || 0) + "_" + (mapObj._refreshToken || 0);
    },

    renderWorld: function() {
      try {
        const viewport = document.getElementById("world-viewport");
        const mapLayer = document.getElementById("world-map-layer");
        if (!viewport || !mapLayer) return;

        const s = window.Aetheria.State.data;
        let mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);

        if (!mapObj || isNaN(s.heroX) || isNaN(s.heroY) || s.heroX < 10 || s.heroX > mapObj.width - 10 || s.heroY < 10 || s.heroY > mapObj.height - 10) {
          s.currentZone = "camp_hub";
          mapObj = window.Aetheria.Data.Maps.getMap("camp_hub");
          s.heroX = 320;
          s.heroY = 260;
          s.petX = 296;
          s.petY = 264;
        }

        const expectedKey = mapObj.id + "_" + (mapObj.floorNum || 0) + "_" + (mapObj._refreshToken || 0);
        if (this.builtZoneKey !== expectedKey) {
          this.buildSceneDOM(mapObj);
        }

        const Sprites = window.Aetheria.Data.Sprites;
        const ExpSys = window.Aetheria.Explore;

        // v7.0：洞窟迷霧與松脂火把聯動（點燃松脂火把或建造聖火燈塔均可照亮洞窟）
        const hasActiveTorch = Boolean(s.torchTicks && s.torchTicks > 0);
        const brazierLit = (s.openedNodes && s.openedNodes["lit_" + mapObj.id]) ||
                           (s.projectsBuilt && s.projectsBuilt.proj_cave1_beacon && mapObj.id === "cave1_mushroom") ||
                           hasActiveTorch;
        const fogEl = document.getElementById("fog-overlay");
        if (fogEl) fogEl.style.display = (mapObj.fog && !brazierLit) ? "block" : "none";

        // v7.0：更新動態日夜光影遮罩 (#daynight-overlay)
        const dnEl = document.getElementById("daynight-overlay");
        if (dnEl) {
          const isIndoor = (mapObj.id === "tent_guild" || mapObj.id === "tent_forge" || mapObj.id === "cave1_mushroom");
          if (isIndoor) {
            dnEl.className = "dn-day";
          } else {
            const phase = window.Aetheria.State.getTimePhase();
            let dnClass = "dn-" + phase.id;
            if (phase.isNight && (hasActiveTorch || mapObj.id === "camp_hub")) {
              dnClass += " torch-lit";
            }
            dnEl.className = dnClass;
          }
        }

        if (this.domPool.bridge && mapObj.hasRiver) {
          const bProj = mapObj.bridgeProject;
          const isBuilt = !bProj || Boolean(s.projectsBuilt && s.projectsBuilt[bProj]);
          if (!isBuilt) {
            this.domPool.bridge.className = "dom-bridge broken";
          } else {
            this.domPool.bridge.className = "dom-bridge" + (mapObj.isLavaRiver ? " stone-bridge" : "");
          }
        }

        // 0. 動態更新帳篷入口標籤
        Object.keys(this.domPool.portals).forEach(function(pId) {
          const item = this.domPool.portals[pId];
          const p = item.data;
          const bottomCls = p.labelBottom ? " lbl-bottom" : "";
          if (p.linkedNpcId && window.Aetheria.Data.getNpcMarkerState) {
            const marker = window.Aetheria.Data.getNpcMarkerState(s, p.linkedNpcId);
            if (marker === "ready") {
              item.lbl.className = "dom-label quest-ready-lbl" + bottomCls;
              item.lbl.innerText = "[✓可交付] " + p.name;
            } else if (marker === "avail") {
              item.lbl.className = "dom-label quest-avail-lbl" + bottomCls;
              item.lbl.innerText = "[!新任務] " + p.name;
            } else if (marker === "active") {
              item.lbl.className = "dom-label quest-active-lbl" + bottomCls;
              item.lbl.innerText = "[⏳進行中] " + p.name;
            } else {
              item.lbl.className = "dom-label portal-lbl" + bottomCls;
              item.lbl.innerText = p.name;
            }
          }
        }, this);

        // 1. 更新實地拓荒工程、釣魚點與互動機關狀態
        Object.keys(this.domPool.decos).forEach(function(k) {
          const item = this.domPool.decos[k];
          const d = item.data;

          if ((d.isCrackedWall && s.openedNodes && s.openedNodes[d.id]) || d.cleared) {
            item.el.style.display = "none";
            return;
          }
          item.el.style.display = "block";

          if (d.isFishingSpot) {
            item.img.src = Sprites.getDataURL("fishing_spot");
            item.lbl.style.display = "block";
            item.lbl.className = "dom-label fish-lbl";
            item.lbl.innerText = "釣魚點 [按A]";
          } else if (d.isProjectSite) {
            const built = Boolean(s.projectsBuilt && s.projectsBuilt[d.projectId]);
            item.img.src = Sprites.getDataURL(built ? (d.builtSprite || d.sprite) : d.sprite);
            item.lbl.style.display = "block";
            if (!built) {
              item.lbl.className = "dom-label build-lbl";
              item.lbl.innerText = "[工程] " + d.name + " [按A]";
            } else if (d.isClimbLadder) {
              item.lbl.className = "dom-label portal-lbl";
              item.lbl.innerText = d.name + " [按A攀爬]";
            } else if (d.projectId === "proj_z4_shelter") {
              item.lbl.className = "dom-label portal-lbl";
              item.lbl.innerText = "防風毛皮屋 [按A睡眠]";
            } else if (d.projectId === "proj_camp_forge") {
              item.lbl.className = "dom-label portal-lbl";
              item.lbl.innerText = "鍛造熔爐 [已修復]";
            } else {
              item.lbl.style.display = "none";
            }
          } else if (d.isBrazier) {
            item.img.src = Sprites.getDataURL(brazierLit ? "brazier_on" : "brazier_off");
            item.lbl.style.display = brazierLit ? "none" : "block";
            item.lbl.innerText = "古代火盆[按A]";
          } else if (d.isSealPillar) {
            const unsealed = s.unlockedSeals && s.unlockedSeals[d.id];
            item.img.src = Sprites.getDataURL(unsealed ? "seal_pillar_on" : "seal_pillar_off");
            item.lbl.style.display = "block";
            item.lbl.className = "dom-label " + (unsealed ? "portal-lbl" : "lock-lbl");
            item.lbl.innerText = (d.name || "封印柱") + (unsealed ? " [已解封]" : " [按A解封]");
          } else if (d.isCookPot) {
            item.lbl.style.display = "block";
            item.lbl.className = "dom-label";
            item.lbl.innerText = "料理鍋/睡眠 [按A]";
          } else {
            item.lbl.style.display = "none";
          }
        }, this);

        // 2. 更新採集資源點顯示狀態
        Object.keys(this.domPool.nodes).forEach(function(nId) {
          const item = this.domPool.nodes[nId];
          const n = item.data;
          const isGone = Boolean(n.opened || (n.legendary && s.openedNodes && s.openedNodes[n.id]));
          item.el.style.display = isGone ? "none" : "block";
        }, this);

        // 3. 更新 NPC 頭頂任務狀態標記
        Object.keys(this.domPool.npcs).forEach(function(npcId) {
          const item = this.domPool.npcs[npcId];
          const npc = item.data;
          const shortName = (npc.badge || "") + (npc.name.split("・")[1] || npc.name);
          const marker = window.Aetheria.Data.getNpcMarkerState ? window.Aetheria.Data.getNpcMarkerState(s, npc.id) : null;

          if (marker === "ready") {
            item.lbl.className = "dom-label quest-ready-lbl";
            item.lbl.innerText = "[✓可交付] " + shortName;
          } else if (marker === "avail") {
            item.lbl.className = "dom-label quest-avail-lbl";
            item.lbl.innerText = "[!新任務] " + shortName;
          } else if (marker === "active") {
            item.lbl.className = "dom-label quest-active-lbl";
            item.lbl.innerText = "[⏳進行中] " + shortName;
          } else {
            item.lbl.className = "dom-label";
            item.lbl.innerText = shortName;
          }
        }, this);

        // 4. 更新野外魔物與守關領主
        const isNight = window.Aetheria.State.getTimePhase().isNight;
        Object.keys(this.domPool.monsters).forEach(function(mId) {
          const item = this.domPool.monsters[mId];
          const m = item.data;
          if (m.alive === false) {
            item.el.style.display = "none";
            return;
          }
          item.el.style.display = "block";
          item.el.style.left = Math.round(m.x) + "px";
          item.el.style.top = Math.round(m.y) + "px";
          item.el.style.zIndex = Math.round(m.y + item.sz);

          if (m.aggro) {
            item.lbl.className = "dom-label aggro-lbl";
            item.lbl.innerText = "[!] " + m.name + " Lv." + m.lv;
          } else if (m.reqSeals && m.reqSeals.length > 0) {
            const allUnsealed = m.reqSeals.every(function(sid) { return Boolean(s.unlockedSeals && s.unlockedSeals[sid]); });
            item.lbl.className = "dom-label " + (allUnsealed ? "portal-lbl" : "lock-lbl");
            item.lbl.innerText = m.name + (allUnsealed ? " [可挑戰]" : " [需解雙封印柱]");
          } else {
            item.lbl.className = "dom-label";
            const nightTag = isNight ? "🌙" : "";
            item.lbl.innerText = nightTag + (m.isShiny ? "[閃光] " : "") + m.name + " Lv." + m.lv;
          }
        }, this);

        // 5. 更新同行戰寵與主角座標
        const isMov = Boolean(ExpSys && ExpSys.isMoving);
        const stepFrame = isMov ? (Math.floor(this.tick / 6) % 2) : 0;
        const dir = s.facing || "down";

        if (this.domPool.hero) {
          this.domPool.hero.el.style.left = Math.round(s.heroX) + "px";
          this.domPool.hero.el.style.top = Math.round(s.heroY) + "px";
          this.domPool.hero.el.style.zIndex = Math.round(s.heroY + 28);
          const heroKey = "hero_" + dir + "_" + stepFrame;
          this.domPool.hero.img.src = Sprites.getDataURL(heroKey);
        }

        const petData = window.Aetheria.Data.PETS[s.activePet] || window.Aetheria.Data.PETS.pet_slime;
        const isShinyPet = s.shinyPets && s.shinyPets.indexOf(s.activePet) !== -1;
        if (this.domPool.pet) {
          this.domPool.pet.el.style.left = Math.round(s.petX) + "px";
          this.domPool.pet.el.style.top = Math.round(s.petY) + "px";
          this.domPool.pet.el.style.zIndex = Math.round(s.petY + 24);
          this.domPool.pet.img.src = Sprites.getDataURL(isShinyPet ? petData.shinySpriteKey : petData.spriteKey);
        }

        if (this.domPool.subPet) {
          if (s.currentJob === "hunter" && s.unlockedPets.length >= 2) {
            const subId = s.unlockedPets.find(function(id) { return id !== s.activePet; }) || s.unlockedPets[0];
            const subData = window.Aetheria.Data.PETS[subId];
            const subShiny = s.shinyPets && s.shinyPets.indexOf(subId) !== -1;
            this.domPool.subPet.el.style.display = "block";
            this.domPool.subPet.el.style.left = Math.round(s.heroX + 20) + "px";
            this.domPool.subPet.el.style.top = Math.round(s.petY) + "px";
            this.domPool.subPet.el.style.zIndex = Math.round(s.petY + 23);
            this.domPool.subPet.img.src = Sprites.getDataURL(subShiny ? subData.shinySpriteKey : subData.spriteKey);
          } else {
            this.domPool.subPet.el.style.display = "none";
          }
        }

        // 6. 相機跟隨
        const vw = viewport.clientWidth || 460;
        const vh = viewport.clientHeight || 340;
        const camX = Math.max(0, Math.min(mapObj.width - vw, Math.round(s.heroX + 14 - vw / 2)));
        const camY = Math.max(0, Math.min(mapObj.height - vh, Math.round(s.heroY + 14 - vh / 2)));
        mapLayer.style.transform = "translate3d(" + (-camX) + "px, " + (-camY) + "px, 0)";

        this.updateHeartsDOM(s, Sprites);
        this.updateMinimapDOM(mapObj, s);
      } catch (err) {
        console.error("DOM renderWorld error:", err);
      }
    },

    updateHeartsDOM: function(s, Sprites) {
      const fullHearts = Math.ceil((s.hp / s.maxHp) * 3);
      if (this.lastHeartsState === String(fullHearts)) return;
      this.lastHeartsState = String(fullHearts);

      const box = document.getElementById("hud-hearts-box");
      if (!box) return;
      const heartUrl = Sprites.getDataURL("heart");
      let html = "";
      for (let i = 0; i < 3; i++) {
        const op = (i < fullHearts) ? "1" : "0.28";
        html += '<img src="' + heartUrl + '" style="opacity:' + op + ';" alt="">';
      }
      box.innerHTML = html;
    },

    updateMinimapDOM: function(mapObj, s) {
      if (this.tick % 4 !== 0) return;
      const mm = document.getElementById("dom-minimap");
      if (!mm) return;

      let html = "";
      (mapObj.portals || []).forEach(function(p) {
        const lx = Math.round((p.x / mapObj.width) * 100);
        const ly = Math.round((p.y / mapObj.height) * 100);
        html += '<div class="mm-dot" style="left:' + lx + '%;top:' + ly + '%;background:#4cc9f0;"></div>';
      });
      (mapObj.decos || []).forEach(function(d) {
        if (d.isSealPillar) {
          const unsealed = s.unlockedSeals && s.unlockedSeals[d.id];
          const lx = Math.round((d.x / mapObj.width) * 100);
          const ly = Math.round((d.y / mapObj.height) * 100);
          html += '<div class="mm-dot" style="left:' + lx + '%;top:' + ly + '%;width:5px;height:5px;background:' + (unsealed ? '#5ac54f' : '#e0aaff') + ';"></div>';
        } else if (d.isProjectSite) {
          const built = s.projectsBuilt && s.projectsBuilt[d.projectId];
          const lx = Math.round((d.x / mapObj.width) * 100);
          const ly = Math.round((d.y / mapObj.height) * 100);
          html += '<div class="mm-dot" style="left:' + lx + '%;top:' + ly + '%;width:5px;height:5px;background:' + (built ? '#38b6ff' : '#ff9f1c') + ';"></div>';
        }
      });
      (mapObj.npcs || []).forEach(function(npc) {
        const lx = Math.round((npc.x / mapObj.width) * 100);
        const ly = Math.round((npc.y / mapObj.height) * 100);
        html += '<div class="mm-dot" style="left:' + lx + '%;top:' + ly + '%;width:4px;height:4px;background:#5ac54f;"></div>';
      });
      (mapObj.nodes || []).forEach(function(n) {
        if (!n.opened && !(n.legendary && s.openedNodes && s.openedNodes[n.id])) {
          const lx = Math.round((n.x / mapObj.width) * 100);
          const ly = Math.round((n.y / mapObj.height) * 100);
          html += '<div class="mm-dot" style="left:' + lx + '%;top:' + ly + '%;width:3px;height:3px;background:#f5b700;"></div>';
        }
      });
      (mapObj.monsters || []).forEach(function(m) {
        if (m.alive !== false) {
          const lx = Math.round((m.x / mapObj.width) * 100);
          const ly = Math.round((m.y / mapObj.height) * 100);
          html += '<div class="mm-dot" style="left:' + lx + '%;top:' + ly + '%;background:#ff595e;"></div>';
        }
      });
      const hx = Math.round((s.heroX / mapObj.width) * 100);
      const hy = Math.round((s.heroY / mapObj.height) * 100);
      html += '<div class="mm-dot" style="left:' + hx + '%;top:' + hy + '%;width:5px;height:5px;background:#ffffff;border:1px solid #000;"></div>';

      mm.innerHTML = html;
    }
  };

  window.Aetheria.Renderer = Renderer;
})();
