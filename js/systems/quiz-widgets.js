/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 六大題型互動組件與星象調頻引擎 (quiz-widgets.js - v6.5)
 * 修正：1.英文串字 (eng_tile_spell)：刪除題目空格與(6)(2)字數提示、新增【⌫ 退回】鍵、每題額外混入 6 個干擾字母塊
 *       2.強化簡答題/情境題/多格填充題的答案比對邏輯，支援對調容錯與精準核對
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  function shuffleArray(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function normStr(s) {
    return String(s || "").replace(/[，。！？、；：「」『』（）()\s]/g, "").trim();
  }

  const QuizUI = {
    currentQuestion: null,
    currentCallback: null,

    renderQuestion: function(q, onResultCallback) {
      this.currentQuestion = q;
      this.currentCallback = onResultCallback;

      const subjTag = document.getElementById("q-subject-tag");
      const typeTag = document.getElementById("q-type-tag");
      const promptEl = document.getElementById("q-prompt-text");
      const diagBox = document.getElementById("q-diagram-container");
      const diagSvg = document.getElementById("q-diagram-svg");
      const area = document.getElementById("quiz-interactive-area");

      if (subjTag) subjTag.innerText = "[" + (q.subjectLabel || "知識共鳴") + "]";
      if (typeTag) typeTag.innerText = q.typeLabel || "詠唱檢定";

      const svgContent = q.svgDiagram || (q.svgKey && window.Aetheria.QuizBridge && window.Aetheria.QuizBridge.getDiagram(q.svgKey)) || "";
      if (diagBox && diagSvg) {
        if (svgContent) {
          diagSvg.innerHTML = svgContent;
          diagBox.style.display = "flex";
        } else {
          diagSvg.innerHTML = "";
          diagBox.style.display = "none";
        }
      }

      if (!area) return;
      area.innerHTML = "";

      if (q.type === "eng_tile_spell") {
        // 問題 3 修正：題目框只顯示中文詞意，不顯示底線與字數提示！
        if (promptEl) {
          promptEl.innerHTML = '<div style="color:#7f2b1d; font-size:17px;">【英文串字】' + q.meaning + '</div>';
        }
        this.renderEngTileSpell(q, area);
      } else if (q.type === "classify") {
        if (promptEl) promptEl.innerText = q.prompt;
        this.renderClassifyBaskets(q, area);
      } else if (q.type === "fill_blank" || q.type === "image_fill") {
        this.renderFillBlanks(q, promptEl, area);
      } else if (q.type === "multi_mcq") {
        if (promptEl) promptEl.innerText = q.prompt;
        this.renderMultiMCQ(q, area);
      } else if (q.type === "matching") {
        if (promptEl) promptEl.innerText = q.prompt;
        this.renderMatching(q, area);
      } else if (q.type === "tile_spell" || q.type === "image_spell") {
        if (promptEl) promptEl.innerText = q.prompt;
        this.renderChineseTileSpell(q, area);
      } else {
        if (promptEl) promptEl.innerText = q.prompt;
        this.renderMCQ(q, area);
      }
    },

    // ================= 1. 英文串字組件 (純答題空位 + 無字數數字 + 退回鍵 + 6個額外干擾字母塊) =================
    renderEngTileSpell: function(q, area) {
      const self = this;
      const rawPhrase = String(q.answer || "").trim();
      const words = rawPhrase.split(/\s+/);
      const cleanLetters = [];

      const wordSlotMeta = [];
      words.forEach(function(w) {
        const chars = w.split("");
        const wMeta = [];
        chars.forEach(function(ch) {
          const flatIdx = cleanLetters.length;
          cleanLetters.push(ch);
          wMeta.push(flatIdx);
        });
        wordSlotMeta.push(wMeta);
      });

      const totalLetters = cleanLetters.length;
      const filled = new Array(totalLetters).fill(null);
      const historyStack = []; // 記錄填入順序供「⌫ 退回」鍵使用

      // 問題 3 修正：不論單字長短，一律額外加入 6 個干擾字母塊！
      const bankChars = cleanLetters.map(function(c) { return c.toLowerCase(); });
      const extraAlphabet = shuffleArray(["a","b","c","d","e","f","g","h","i","l","m","n","o","p","r","s","t","u","v","w","y"]);
      const extraTargetCount = 6;
      let addedExtra = 0;
      for (let i = 0; i < extraAlphabet.length && addedExtra < extraTargetCount; i++) {
        bankChars.push(extraAlphabet[i]);
        addedExtra++;
      }

      const shuffledBank = shuffleArray(bankChars.map(function(ch, idx) {
        return { id: idx, char: ch, used: false };
      }));

      const wrapper = document.createElement("div");
      wrapper.style.cssText = "display:flex; flex-direction:column; gap:6px;";

      const slotsRow = document.createElement("div");
      slotsRow.style.cssText = "display:flex; flex-wrap:wrap; gap:12px; justify-content:center; align-items:center; background:#141013; border:2px solid var(--na-wood-mid); border-radius:6px; padding:8px; min-height:46px;";

      const bankRow = document.createElement("div");
      bankRow.style.cssText = "display:flex; flex-wrap:wrap; gap:5px; justify-content:center; max-height:115px; overflow-y:auto; padding:2px;";

      const ctrlRow = document.createElement("div");
      ctrlRow.style.cssText = "display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px;";

      function checkAutoOrSubmit() {
        const isFull = filled.every(function(item) { return item !== null; });
        if (!isFull) return;
        const userJoined = wordSlotMeta.map(function(wIdxs) {
          return wIdxs.map(function(idx) { return filled[idx].char; }).join("");
        }).join(" ");

        const isRight = userJoined.toLowerCase() === rawPhrase.toLowerCase();
        if (self.currentCallback) {
          self.currentCallback(isRight, rawPhrase, q);
        }
      }

      function refreshUI() {
        slotsRow.innerHTML = "";
        const nextEmptyIdx = filled.findIndex(function(x) { return x === null; });

        wordSlotMeta.forEach(function(wIdxs) {
          const wordGroup = document.createElement("div");
          wordGroup.style.cssText = "display:inline-flex; gap:3px; align-items:center;";

          wIdxs.forEach(function(flatIdx) {
            const cell = document.createElement("div");
            const val = filled[flatIdx];
            const isNext = (flatIdx === nextEmptyIdx);
            const boxSize = totalLetters > 14 ? "23px" : "28px";
            const fontSize = totalLetters > 14 ? "14px" : "16px";
            cell.style.cssText =
              "width:" + boxSize + "; height:" + boxSize + "; border-bottom:3px solid " + (val ? "var(--na-gold)" : (isNext ? "#5ac54f" : "#8ce0ff")) + ";" +
              "background:" + (val ? "#2b2118" : (isNext ? "#1e3a2f" : "#1e293b")) + "; color:#ffd166; font-weight:900; font-size:" + fontSize + ";" +
              "display:flex; justify-content:center; align-items:center; border-radius:4px; cursor:pointer; font-family:monospace;";
            cell.innerText = val ? val.char : "_";

            if (val) {
              cell.onclick = function() {
                window.Aetheria.Audio.sfxTalkBlip();
                val.bankItem.used = false;
                filled[flatIdx] = null;
                const hPos = historyStack.indexOf(flatIdx);
                if (hPos !== -1) historyStack.splice(hPos, 1);
                refreshUI();
              };
            }
            wordGroup.appendChild(cell);
          });

          // 問題 3 修正：不顯示 (6)、(2) 等字數提示標籤！
          slotsRow.appendChild(wordGroup);
        });

        bankRow.innerHTML = "";
        shuffledBank.forEach(function(bItem) {
          const btn = document.createElement("button");
          btn.className = "bank-char" + (bItem.used ? " used" : "");
          btn.style.cssText = "padding:5px 10px; font-size:15px; font-family:monospace; min-width:33px;";
          btn.innerText = bItem.char;
          btn.onclick = function() {
            if (bItem.used) return;
            const nextEmpty = filled.findIndex(function(x) { return x === null; });
            if (nextEmpty === -1) return;
            window.Aetheria.Audio.sfxTalkBlip();
            bItem.used = true;
            filled[nextEmpty] = { char: bItem.char, bankItem: bItem };
            historyStack.push(nextEmpty);
            refreshUI();
            if (filled.every(function(x) { return x !== null; })) {
              setTimeout(checkAutoOrSubmit, 180);
            }
          };
          bankRow.appendChild(btn);
        });
      }

      // 新增：【⌫ 退回】鍵（退回最後填入的一個字母）
      const backBtn = document.createElement("button");
      backBtn.className = "na-btn highlight";
      backBtn.innerText = "⌫ 退回";
      backBtn.onclick = function() {
        window.Aetheria.Audio.sfxTalkBlip();
        while (historyStack.length > 0) {
          const lastSlotIdx = historyStack.pop();
          if (filled[lastSlotIdx]) {
            filled[lastSlotIdx].bankItem.used = false;
            filled[lastSlotIdx] = null;
            refreshUI();
            return;
          }
        }
        // 若 historyStack 為空則從右往左退回最後一個非空槽位
        for (let i = filled.length - 1; i >= 0; i--) {
          if (filled[i]) {
            filled[i].bankItem.used = false;
            filled[i] = null;
            refreshUI();
            return;
          }
        }
      };

      const clearBtn = document.createElement("button");
      clearBtn.className = "na-btn";
      clearBtn.innerText = "清除重填";
      clearBtn.onclick = function() {
        window.Aetheria.Audio.sfxTalkBlip();
        shuffledBank.forEach(function(b) { b.used = false; });
        for (let i = 0; i < filled.length; i++) filled[i] = null;
        historyStack.length = 0;
        refreshUI();
      };

      const hintBtn = document.createElement("button");
      hintBtn.className = "na-btn";
      const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
      const hintCount = (s.inventory && s.inventory.potionHint) || 0;
      hintBtn.innerText = "洞察提示(" + hintCount + ")";
      hintBtn.onclick = function() {
        if (!s.inventory || (s.inventory.potionHint || 0) <= 0) {
          window.Aetheria.UI.showToast("洞察藥水不足！可在營地工坊提煉或商店購買。");
          return;
        }
        s.inventory.potionHint--;
        window.Aetheria.State.save();
        hintBtn.innerText = "洞察提示(" + s.inventory.potionHint + ")";

        wordSlotMeta.forEach(function(wIdxs) {
          const firstIdx = wIdxs[0];
          if (filled[firstIdx]) return;
          const targetChar = cleanLetters[firstIdx].toLowerCase();
          const availBank = shuffledBank.find(function(b) { return !b.used && b.char === targetChar; });
          if (availBank) {
            availBank.used = true;
            filled[firstIdx] = { char: availBank.char, bankItem: availBank };
            historyStack.push(firstIdx);
          }
        });
        window.Aetheria.Audio.sfxGather();
        refreshUI();
        if (filled.every(function(x) { return x !== null; })) {
          setTimeout(checkAutoOrSubmit, 180);
        }
      };

      ctrlRow.appendChild(backBtn);
      ctrlRow.appendChild(clearBtn);
      ctrlRow.appendChild(hintBtn);

      wrapper.appendChild(slotsRow);
      wrapper.appendChild(bankRow);
      wrapper.appendChild(ctrlRow);
      area.appendChild(wrapper);

      refreshUI();
    },

    // ================= 2. 分類題組件：🧺 分類籃 (Sorting Baskets) =================
    renderClassifyBaskets: function(q, area) {
      const self = this;
      const items = (q.items || []).map(function(it, idx) {
        return { id: idx, label: it.label, targetBasket: it.basket, placedBasket: null };
      });
      const baskets = q.baskets || [];
      let activeItemId = 0;

      const wrapper = document.createElement("div");
      wrapper.style.cssText = "display:flex; flex-direction:column; gap:6px;";

      const poolBox = document.createElement("div");
      poolBox.style.cssText = "background:#141013; border:2px solid var(--na-wood-mid); border-radius:6px; padding:6px 8px;";

      const basketGrid = document.createElement("div");
      const cols = baskets.length >= 4 ? "1fr 1fr" : (baskets.length === 3 ? "repeat(3, 1fr)" : "1fr 1fr");
      basketGrid.style.cssText = "display:grid; grid-template-columns:" + cols + "; gap:6px;";

      function submitClassification() {
        const allCorrect = items.every(function(it) {
          return it.placedBasket === it.targetBasket;
        });
        if (self.currentCallback) {
          self.currentCallback(allCorrect, q.answer || "請參考課本分類", q);
        }
      }

      function refreshClassifyUI() {
        const unplaced = items.filter(function(it) { return it.placedBasket === null; });
        if (unplaced.length > 0 && (activeItemId === null || items[activeItemId].placedBasket !== null)) {
          activeItemId = unplaced[0].id;
        }

        if (unplaced.length === 0) {
          poolBox.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<span style="color:#5ac54f; font-weight:900; font-size:13px;">✓ 所有項目已放入分類籃！（點擊籃內項目可取回重排）</span>' +
              '<button class="na-btn highlight" id="btn-submit-classify" style="padding:4px 12px;">確認提交 ✓</button>' +
            '</div>';
          const subBtn = poolBox.querySelector("#btn-submit-classify");
          if (subBtn) subBtn.onclick = submitClassification;
        } else {
          const curItem = items[activeItemId] || unplaced[0];
          let pillsHtml = unplaced.map(function(it) {
            const isSel = (it.id === curItem.id);
            return '<span data-id="' + it.id + '" class="cls-item-pill" style="display:inline-block; padding:3px 7px; margin:2px; border-radius:4px; font-size:12px; font-weight:900; cursor:pointer; ' +
              (isSel ? 'background:var(--na-gold); color:#141013; border:2px solid #fff;' : 'background:#2b2327; color:#cbd5e1; border:1px solid #594950;') + '">' +
              it.label + '</span>';
          }).join("");

          poolBox.innerHTML =
            '<div style="font-size:11px; color:#ffd166; margin-bottom:3px;">請點選下方【🧺 分類籃】，將高亮項目投入籃中（剩餘 ' + unplaced.length + ' 項）：</div>' +
            '<div>' + pillsHtml + '</div>';

          poolBox.querySelectorAll(".cls-item-pill").forEach(function(el) {
            el.onclick = function() {
              activeItemId = parseInt(el.getAttribute("data-id"), 10);
              window.Aetheria.Audio.sfxTalkBlip();
              refreshClassifyUI();
            };
          });
        }

        basketGrid.innerHTML = "";
        baskets.forEach(function(bName) {
          const inBasket = items.filter(function(it) { return it.placedBasket === bName; });
          const bCard = document.createElement("div");
          bCard.style.cssText =
            "background:#1e293b; border:2px solid #3898ff; border-radius:6px; padding:6px; cursor:pointer; display:flex; flex-direction:column; justify-content:space-between; min-height:58px;";

          const tagsHtml = inBasket.map(function(it) {
            const shortTxt = it.label.length > 10 ? it.label.slice(0, 9) + "…" : it.label;
            return '<span data-ret="' + it.id + '" style="display:inline-block; background:#141013; color:#8ce0ff; border:1px solid #3898ff; border-radius:3px; padding:1px 5px; margin:2px; font-size:11px; font-weight:bold;">' +
              shortTxt + ' ×</span>';
          }).join("");

          bCard.innerHTML =
            '<div style="color:var(--na-gold); font-weight:900; font-size:12px; border-bottom:1px dashed #475569; padding-bottom:3px; margin-bottom:3px; text-align:center;">' +
              '🧺 ' + bName + ' (' + inBasket.length + ')' +
            '</div>' +
            '<div style="min-height:24px; display:flex; flex-wrap:wrap; align-items:center; justify-content:center;">' +
              (tagsHtml || '<span style="font-size:11px; color:#64748b;">點擊投入此籃</span>') +
            '</div>';

          bCard.querySelectorAll("[data-ret]").forEach(function(tagEl) {
            tagEl.onclick = function(ev) {
              ev.stopPropagation();
              const retId = parseInt(tagEl.getAttribute("data-ret"), 10);
              items[retId].placedBasket = null;
              activeItemId = retId;
              window.Aetheria.Audio.sfxTalkBlip();
              refreshClassifyUI();
            };
          });

          bCard.onclick = function() {
            const unplacedNow = items.filter(function(it) { return it.placedBasket === null; });
            if (unplacedNow.length === 0) return;
            const targetItem = (activeItemId !== null && items[activeItemId] && items[activeItemId].placedBasket === null)
              ? items[activeItemId]
              : unplacedNow[0];
            if (!targetItem) return;

            window.Aetheria.Audio.sfxGather();
            targetItem.placedBasket = bName;
            const nextUnplaced = items.find(function(it) { return it.placedBasket === null; });
            activeItemId = nextUnplaced ? nextUnplaced.id : null;
            refreshClassifyUI();
          };

          basketGrid.appendChild(bCard);
        });
      }

      wrapper.appendChild(poolBox);
      wrapper.appendChild(basketGrid);
      area.appendChild(wrapper);

      refreshClassifyUI();
    },

    // ================= 3. 填充題與看圖填充題組件 (支援對調容錯判定) =================
    renderFillBlanks: function(q, promptEl, area) {
      const self = this;
      const blanks = q.blanks || [q.answer];
      const numBlanks = blanks.length;
      const filled = new Array(numBlanks).fill(null);

      const rawBank = blanks.concat(q.distractors || []);
      const shuffledBank = shuffleArray(rawBank.map(function(w, idx) {
        return { id: idx, word: w, used: false };
      }));

      function updatePromptDisplay() {
        if (!promptEl) return;
        let idxCount = 0;
        const formatted = String(q.prompt || "").replace(/_{2,}/g, function() {
          const curIdx = idxCount < numBlanks ? idxCount : numBlanks - 1;
          idxCount++;
          const val = filled[curIdx];
          if (val) {
            return '<span style="background:#1e3a2f; color:#5ac54f; border:1.5px solid #5ac54f; padding:0 6px; border-radius:4px; font-weight:900;">[' + (curIdx + 1) + ': ' + val.word + ']</span>';
          }
          return '<span style="background:#141013; color:#ffd166; border:1.5px dashed #f5b700; padding:0 6px; border-radius:4px; font-weight:900;">[空格' + (curIdx + 1) + ']</span>';
        });
        promptEl.innerHTML = formatted;
      }

      const wrapper = document.createElement("div");
      wrapper.style.cssText = "display:flex; flex-direction:column; gap:8px;";

      const slotsBar = document.createElement("div");
      slotsBar.style.cssText = "display:flex; flex-wrap:wrap; gap:6px; justify-content:center;";

      const bankBar = document.createElement("div");
      bankBar.style.cssText = "display:flex; flex-wrap:wrap; gap:6px; justify-content:center;";

      function checkFillAnswer() {
        const userWords = filled.map(function(f) { return f ? f.word : ""; });
        let isAllRight = blanks.every(function(ans, i) {
          return userWords[i] === ans;
        });

        // 針對可互換順序的並列空格（例如「蔬菜類、水果類」或「瞿塘峽、巫峽、西陵峽」等並列項）提供容錯
        if (!isAllRight && q.allowSwapIndices) {
          const group = q.allowSwapIndices; // 例如 [1, 2]
          const expectedSet = group.map(function(idx) { return blanks[idx]; }).sort().join("|");
          const actualSet = group.map(function(idx) { return userWords[idx]; }).sort().join("|");
          const otherOk = blanks.every(function(ans, i) {
            return group.indexOf(i) !== -1 || userWords[i] === ans;
          });
          if (otherOk && expectedSet === actualSet) {
            isAllRight = true;
          }
        }

        if (self.currentCallback) {
          self.currentCallback(isAllRight, blanks.join("、"), q);
        }
      }

      function refreshFillUI() {
        updatePromptDisplay();
        slotsBar.innerHTML = "";
        for (let i = 0; i < numBlanks; i++) {
          const slotBtn = document.createElement("div");
          const val = filled[i];
          slotBtn.style.cssText =
            "min-width:86px; padding:5px 10px; border-radius:5px; font-size:13px; font-weight:900; text-align:center; cursor:pointer; " +
            (val ? "background:#2b2118; border:2px solid var(--na-gold); color:var(--na-gold);" : "background:#141013; border:2px dashed #8ce0ff; color:#8ce0ff;");
          slotBtn.innerText = val ? ("(" + (i + 1) + ") " + val.word + " ×") : ("空格 (" + (i + 1) + ")");
          if (val) {
            slotBtn.onclick = function() {
              window.Aetheria.Audio.sfxTalkBlip();
              val.bankItem.used = false;
              filled[i] = null;
              refreshFillUI();
            };
          }
          slotsBar.appendChild(slotBtn);
        }

        bankBar.innerHTML = "";
        shuffledBank.forEach(function(bItem) {
          const btn = document.createElement("button");
          btn.className = "bank-char" + (bItem.used ? " used" : "");
          btn.style.cssText = "padding:7px 12px; font-size:14px;";
          btn.innerText = bItem.word;
          btn.onclick = function() {
            if (bItem.used) return;
            const nextEmpty = filled.findIndex(function(x) { return x === null; });
            if (nextEmpty === -1) return;
            window.Aetheria.Audio.sfxTalkBlip();
            bItem.used = true;
            filled[nextEmpty] = { word: bItem.word, bankItem: bItem };
            refreshFillUI();
            if (filled.every(function(x) { return x !== null; })) {
              setTimeout(checkFillAnswer, 200);
            }
          };
          bankBar.appendChild(btn);
        });
      }

      wrapper.appendChild(slotsBar);
      wrapper.appendChild(bankBar);
      area.appendChild(wrapper);

      refreshFillUI();
    },

    // ================= 4. 複選題組件 (可選多於一項) =================
    renderMultiMCQ: function(q, area) {
      const self = this;
      const selectedMap = {};
      const opts = q.options || [];

      const wrapper = document.createElement("div");
      wrapper.style.cssText = "display:flex; flex-direction:column; gap:5px;";

      const grid = document.createElement("div");
      grid.className = "mcq-grid";

      const submitBtn = document.createElement("button");
      submitBtn.className = "na-btn highlight";
      submitBtn.style.padding = "8px";
      submitBtn.innerText = "選好後點擊確認提交 ✓";

      function refreshMultiUI() {
        grid.innerHTML = "";
        opts.forEach(function(opt) {
          const isSel = Boolean(selectedMap[opt]);
          const btn = document.createElement("button");
          btn.className = "mcq-btn";
          btn.style.cssText =
            "font-size:13px; padding:8px; text-align:left; " +
            (isSel ? "background:#1e3a2f; border-color:#5ac54f; color:#b7e4c7;" : "");
          btn.innerText = (isSel ? "☑ " : "☐ ") + opt;
          btn.onclick = function() {
            window.Aetheria.Audio.sfxTalkBlip();
            selectedMap[opt] = !selectedMap[opt];
            refreshMultiUI();
          };
          grid.appendChild(btn);
        });
      }

      submitBtn.onclick = function() {
        const picked = opts.filter(function(o) { return Boolean(selectedMap[o]); });
        if (picked.length === 0) {
          window.Aetheria.UI.showToast("請至少勾選一項答案！");
          return;
        }
        const targetAns = q.answers || [];
        const isRight = (picked.length === targetAns.length) && targetAns.every(function(a) { return picked.indexOf(a) !== -1; });
        if (self.currentCallback) {
          self.currentCallback(isRight, q.answer || targetAns.join("、"), q);
        }
      };

      wrapper.appendChild(grid);
      wrapper.appendChild(submitBtn);
      area.appendChild(wrapper);
      refreshMultiUI();
    },

    // ================= 5. 單選選擇題 / 簡答題 / 情境問答題 (強化精準與容錯比對) =================
    renderMCQ: function(q, area) {
      const self = this;
      const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
      let opts = (q.options || []).slice();

      const hasLetterPrefix = opts.some(function(o) { return /^[A-D]\./.test(String(o).trim()); });
      if (!hasLetterPrefix) {
        opts = shuffleArray(opts);
      }

      const hasSmartFilter = (s.currentJob === "alchemist") || (s.unlockedRelics && s.unlockedRelics.indexOf("r_ring") !== -1);
      let disabledOpt = null;
      if (hasSmartFilter && opts.length > 2) {
        const wrongOpts = opts.filter(function(o) {
          return o !== q.answer && normStr(o) !== normStr(q.answer);
        });
        if (wrongOpts.length > 0) {
          disabledOpt = wrongOpts[0];
        }
      }

      const isLongText = opts.some(function(o) { return String(o).length > 18; });
      const grid = document.createElement("div");
      grid.className = "mcq-grid";
      if (isLongText) {
        grid.style.gridTemplateColumns = "1fr";
        grid.style.gap = "5px";
      }

      opts.forEach(function(opt) {
        const btn = document.createElement("button");
        btn.className = "mcq-btn";
        if (isLongText) {
          btn.style.cssText = "font-size:12px; padding:7px 9px; text-align:left; line-height:1.35;";
        }
        if (opt === disabledOpt) {
          btn.style.opacity = "0.3";
          btn.style.pointerEvents = "none";
          btn.innerText = "[已排除] " + opt;
        } else {
          btn.innerText = opt;
          btn.onclick = function() {
            const isCorrect =
              (opt === q.answer) ||
              (normStr(opt) === normStr(q.answer)) ||
              (String(q.answer).length === 1 && String(opt).indexOf(q.answer + ".") === 0);
            if (self.currentCallback) {
              self.currentCallback(isCorrect, q.answer, q);
            }
          };
        }
        grid.appendChild(btn);
      });

      area.appendChild(grid);
    },

    // ================= 6. 中文方塊拼字與左右連線配對 =================
    renderChineseTileSpell: function(q, area) {
      const self = this;
      const targetChars = String(q.answer || "").split("");
      const filled = new Array(targetChars.length).fill(null);
      const bank = shuffleArray((q.bank || targetChars).map(function(c, i) {
        return { id: i, char: c, used: false };
      }));

      const slotsDiv = document.createElement("div");
      slotsDiv.className = "tile-slots";
      const bankDiv = document.createElement("div");
      bankDiv.className = "word-bank";

      function refresh() {
        slotsDiv.innerHTML = "";
        for (let i = 0; i < targetChars.length; i++) {
          const box = document.createElement("div");
          box.className = "slot-box";
          box.innerText = filled[i] ? filled[i].char : "";
          if (filled[i]) {
            box.onclick = function() {
              filled[i].bankItem.used = false;
              filled[i] = null;
              refresh();
            };
          }
          slotsDiv.appendChild(box);
        }

        bankDiv.innerHTML = "";
        bank.forEach(function(b) {
          const btn = document.createElement("button");
          btn.className = "bank-char" + (b.used ? " used" : "");
          btn.innerText = b.char;
          btn.onclick = function() {
            if (b.used) return;
            const nextIdx = filled.findIndex(function(x) { return x === null; });
            if (nextIdx === -1) return;
            b.used = true;
            filled[nextIdx] = { char: b.char, bankItem: b };
            refresh();
            if (filled.every(function(x) { return x !== null; })) {
              const userStr = filled.map(function(x) { return x.char; }).join("");
              setTimeout(function() {
                if (self.currentCallback) self.currentCallback(userStr === q.answer, q.answer, q);
              }, 150);
            }
          };
          bankDiv.appendChild(btn);
        });
      }

      area.appendChild(slotsDiv);
      area.appendChild(bankDiv);
      refresh();
    },

    renderMatching: function(q, area) {
      const self = this;
      const pairs = q.pairs || [];
      const leftList = pairs.map(function(p, i) { return { id: i, text: p.left, matched: false }; });
      const rightList = shuffleArray(pairs.map(function(p, i) { return { id: i, text: p.right, matched: false }; }));
      let selLeft = null;

      const cols = document.createElement("div");
      cols.className = "match-columns";
      const colL = document.createElement("div");
      colL.className = "match-col";
      const colR = document.createElement("div");
      colR.className = "match-col";

      function refresh() {
        colL.innerHTML = "";
        colR.innerHTML = "";
        leftList.forEach(function(item) {
          const d = document.createElement("div");
          d.className = "match-card" + (item.matched ? " matched" : "") + (selLeft === item.id ? " selected" : "");
          d.innerText = item.text;
          d.onclick = function() {
            if (item.matched) return;
            selLeft = item.id;
            refresh();
          };
          colL.appendChild(d);
        });

        rightList.forEach(function(item) {
          const d = document.createElement("div");
          d.className = "match-card" + (item.matched ? " matched" : "");
          d.innerText = item.text;
          d.onclick = function() {
            if (item.matched || selLeft === null) return;
            if (selLeft === item.id) {
              item.matched = true;
              leftList.find(function(x) { return x.id === item.id; }).matched = true;
              selLeft = null;
              window.Aetheria.Audio.sfxGather();
              refresh();
              if (leftList.every(function(x) { return x.matched; })) {
                setTimeout(function() {
                  if (self.currentCallback) self.currentCallback(true, "配對完成", q);
                }, 150);
              }
            } else {
              if (self.currentCallback) self.currentCallback(false, pairs.map(function(p) { return p.left + "→" + p.right; }).join("；"), q);
            }
          };
          colR.appendChild(d);
        });
      }

      cols.appendChild(colL);
      cols.appendChild(colR);
      area.appendChild(cols);
      refresh();
    },

    openLightbox: function() {
      const q = this.currentQuestion;
      if (!q) return;
      const svgContent = q.svgDiagram || (q.svgKey && window.Aetheria.QuizBridge && window.Aetheria.QuizBridge.getDiagram(q.svgKey)) || "";
      if (!svgContent) return;

      const box = document.getElementById("image-lightbox");
      const content = document.getElementById("lightbox-content");
      if (box && content) {
        content.innerHTML =
          '<div style="margin-bottom:8px;">' + svgContent + '</div>' +
          '<div style="font-size:13px; color:#1c1619;">' + q.prompt + '</div>';
        box.style.display = "flex";
      }
    },

    closeLightbox: function() {
      const box = document.getElementById("image-lightbox");
      if (box) box.style.display = "none";
    }
  };

  window.Aetheria.QuizUI = QuizUI;

  // ================= 7. 星象調頻（單/多選課次）與全屏切換 =================
  function attachAstrolabeUpgrade() {
    if (!window.Aetheria.UI) return;
    const UI = window.Aetheria.UI;

    UI.toggleFullScreen = function() {
      try {
        const docEl = document.documentElement;
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          if (docEl.requestFullscreen) docEl.requestFullscreen();
          else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
        } else {
          if (document.exitFullscreen) document.exitFullscreen();
          else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        }
      } catch (e) {}
    };

    UI.setLessonSelectMode = function(mode) {
      const s = window.Aetheria.State.data;
      window.Aetheria.QuizBridge.ensureQuizSettings(s);
      s.lessonSelectMode = mode;

      if (mode === "single") {
        const catalog = window.Aetheria.QuizBridge.LESSON_CATALOG;
        let firstActive = catalog.find(function(l) { return Boolean(s.activeLessons[l.key]); });
        if (!firstActive && catalog.length > 0) firstActive = catalog[0];
        catalog.forEach(function(l) {
          s.activeLessons[l.key] = Boolean(firstActive && l.key === firstActive.key);
        });
      }
      window.Aetheria.Audio.sfxTalkBlip();
      window.Aetheria.State.save();
      this.openSettingsModal("astrolabe");
    };

    UI.toggleLessonUnit = function(unitKey, subjectKey) {
      const s = window.Aetheria.State.data;
      window.Aetheria.QuizBridge.ensureQuizSettings(s);
      const catalog = window.Aetheria.QuizBridge.LESSON_CATALOG;

      if (s.lessonSelectMode === "single") {
        catalog.forEach(function(l) {
          s.activeLessons[l.key] = (l.key === unitKey);
        });
        if (subjectKey) s.activeSubjects[subjectKey] = true;
      } else {
        s.activeLessons[unitKey] = !s.activeLessons[unitKey];
        if (s.activeLessons[unitKey] && subjectKey) {
          s.activeSubjects[subjectKey] = true;
        }
      }
      window.Aetheria.Audio.sfxTalkBlip();
      window.Aetheria.State.save();
      this.openSettingsModal("astrolabe");
    };

    UI.selectAllLessonsInSubject = function(subjKey, enable) {
      const s = window.Aetheria.State.data;
      window.Aetheria.QuizBridge.ensureQuizSettings(s);
      s.lessonSelectMode = "multi";
      s.activeSubjects[subjKey] = enable;
      window.Aetheria.QuizBridge.LESSON_CATALOG.forEach(function(l) {
        if (l.subject === subjKey) s.activeLessons[l.key] = enable;
      });
      window.Aetheria.Audio.sfxTalkBlip();
      window.Aetheria.State.save();
      this.openSettingsModal("astrolabe");
    };

    UI.openSettingsModal = function(tab, previewUnitKey) {
      tab = tab || "astrolabe";
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const Bridge = window.Aetheria.QuizBridge;
      Bridge.ensureQuizSettings(s);
      const self = this;

      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = S.iconHtml("icon_gear") + "系統設定與星象調頻 (共 " + Bridge.getAllQuestions().length + " 題)";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const tabBar = document.createElement("div");
      tabBar.className = "tab-bar";
      [
        { id: "astrolabe", label: "星象選課" },
        { id: "preview",   label: "題庫預覽" },
        { id: "report",    label: "掌握報告" },
        { id: "system",    label: "存檔/重置" }
      ].forEach(function(t) {
        const b = document.createElement("button");
        b.className = "na-btn" + (tab === t.id ? " highlight" : "");
        b.innerText = t.label;
        b.onclick = function() { self.openSettingsModal(t.id); };
        tabBar.appendChild(b);
      });
      body.appendChild(tabBar);

      if (tab === "astrolabe") {
        const isSingle = (s.lessonSelectMode === "single");
        const modeBox = document.createElement("div");
        modeBox.className = "sys-card-scroll";
        modeBox.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<b>選課模式：</b>' +
            '<div style="display:flex; gap:6px;">' +
              '<button class="na-btn ' + (isSingle ? 'highlight' : '') + '" style="padding:4px 10px;" onclick="Aetheria.UI.setLessonSelectMode(\'single\')">🎯 單選課次 (專注單課)</button>' +
              '<button class="na-btn ' + (!isSingle ? 'highlight' : '') + '" style="padding:4px 10px;" onclick="Aetheria.UI.setLessonSelectMode(\'multi\')">☑️ 多選課次 (自由組合)</button>' +
            '</div>' +
          '</div>';
        body.appendChild(modeBox);

        const subjMeta = [
          { key: "chinese",    name: "中文科（30成語 + 32字詞｜解釋・填充）" },
          { key: "english",    name: "英文科（46 Vocab｜字塊串字・句子填充）" },
          { key: "humanities", name: "人文科（U1/U2/U8/U9 共120題｜全六大題型）" },
          { key: "science",    name: "科學科（第2/3/8/9課 共120題｜全六大題型）" }
        ];

        subjMeta.forEach(function(sm) {
          const subjOn = Boolean(s.activeSubjects[sm.key]);
          const lessons = Bridge.LESSON_CATALOG.filter(function(l) { return l.subject === sm.key; });

          const card = document.createElement("div");
          card.className = "sys-card";

          let lessonsHtml = lessons.map(function(les) {
            const on = subjOn && Boolean(s.activeLessons[les.key]);
            const mark = isSingle ? (on ? "◉ " : "○ ") : (on ? "☑ " : "☐ ");
            return '<button class="na-btn ' + (on ? 'highlight' : '') + '" style="padding:5px 8px; font-size:12px; text-align:left;" ' +
              'onclick="Aetheria.UI.toggleLessonUnit(\'' + les.key + '\', \'' + sm.key + '\')">' +
              mark + les.name + ' <span style="opacity:0.8;font-size:11px;">(' + les.count + '題)</span>' +
            '</button>';
          }).join("");

          card.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; padding-bottom:4px; border-bottom:1px solid #3d3136;">' +
              '<b style="color:var(--na-gold); font-size:13px;">' + sm.name + '</b>' +
              '<div style="display:flex; gap:4px;">' +
                '<button class="na-btn" style="padding:2px 7px; font-size:11px;" onclick="Aetheria.UI.selectAllLessonsInSubject(\'' + sm.key + '\', true)">全選</button>' +
                '<button class="na-btn" style="padding:2px 7px; font-size:11px;" onclick="Aetheria.UI.selectAllLessonsInSubject(\'' + sm.key + '\', false)">全關</button>' +
              '</div>' +
            '</div>' +
            '<div style="display:grid; grid-template-columns:1fr 1fr; gap:5px;">' + lessonsHtml + '</div>';

          body.appendChild(card);
        });
      }

      else if (tab === "preview") {
        const curUnit = previewUnitKey || Bridge.LESSON_CATALOG[0].key;
        const unitBar = document.createElement("div");
        unitBar.style.cssText = "display:flex; flex-wrap:wrap; gap:4px; margin-bottom:8px;";
        Bridge.LESSON_CATALOG.forEach(function(l) {
          const btn = document.createElement("button");
          btn.className = "na-btn" + (l.key === curUnit ? " highlight" : "");
          btn.style.cssText = "font-size:11px; padding:4px 7px;";
          btn.innerText = l.name.split(" ")[0];
          btn.onclick = function() { self.openSettingsModal("preview", l.key); };
          unitBar.appendChild(btn);
        });
        body.appendChild(unitBar);

        const unitQuestions = Bridge.getAllQuestions().filter(function(q) { return q.unitKey === curUnit; });
        unitQuestions.forEach(function(q, idx) {
          const btn = document.createElement("button");
          btn.className = "na-btn";
          btn.style.cssText = "width:100%; text-align:left; padding:7px 10px; margin-bottom:4px; font-size:12px;";
          const shortPrompt = String(q.prompt || "").replace(/\n/g, " ").slice(0, 34);
          btn.innerHTML = (idx + 1) + ". <b>[" + q.typeLabel + "]</b> " + shortPrompt + "...";
          btn.onclick = function() { window.Aetheria.Battle.startBattle(null, "combat", q.id); };
          body.appendChild(btn);
        });
      }

      else if (tab === "report") {
        const allQ = Bridge.getAllQuestions();
        const topCard = document.createElement("div");
        topCard.className = "sys-card-scroll";
        topCard.innerHTML = '<b>全題庫掌握度報告（最高連勝紀錄：' + (s.maxStreak || 0) + ' 題｜錯題本：' + ((s.wrongBook && s.wrongBook.length) || 0) + ' 題）</b>';
        body.appendChild(topCard);

        Bridge.LESSON_CATALOG.forEach(function(les) {
          const qs = allQ.filter(function(q) { return q.unitKey === les.key; });
          let mastered = 0;
          let stars = 0;
          qs.forEach(function(q) {
            const m = s.questionMastery && s.questionMastery[q.id];
            if (m && m.stars > 0) {
              mastered++;
              stars += m.stars;
            }
          });
          const pct = qs.length > 0 ? Math.round((mastered / qs.length) * 100) : 0;
          const row = document.createElement("div");
          row.className = "sys-card";
          row.style.display = "flex";
          row.style.justifyContent = "space-between";
          row.innerHTML =
            '<span><b>' + les.name + '</b></span>' +
            '<span style="color:var(--na-gold); font-weight:bold;">' + mastered + '/' + qs.length + ' (' + pct + '%) ★' + stars + '</span>';
          body.appendChild(row);
        });
      }

      else if (tab === "system") {
        const sysCard = document.createElement("div");
        sysCard.className = "sys-card";
        sysCard.innerHTML =
          '<div style="display:flex; flex-direction:column; gap:6px;">' +
            '<button class="na-btn highlight" style="padding:8px;" onclick="Aetheria.UI.toggleFullScreen()">切換全螢幕顯示模式 (Full Screen)</button>' +
            '<button class="na-btn" style="padding:8px;" onclick="Aetheria.Audio.toggleMute(); Aetheria.UI.showToast(\'已切換音樂開關！\');">切換 8-bit 音樂 (開 / 關)</button>' +
            '<button class="na-btn" style="padding:8px;" onclick="Aetheria.UI.playCutscene(\'intro\')">重溫開場故事序幕</button>' +
            '<button class="na-btn" style="padding:8px;" onclick="Aetheria.UI.exportSavePrompt()">複製存檔 JSON 代碼 (備份)</button>' +
            '<button class="na-btn" style="padding:8px;" onclick="Aetheria.UI.importSavePrompt()">貼上存檔 JSON 代碼 (還原)</button>' +
            '<button class="na-btn" style="padding:8px;" onclick="document.getElementById(\'title-screen\').style.display=\'flex\'; Aetheria.UI.initTitleScreen();">返回遊戲首頁</button>' +
            '<button class="na-btn" style="padding:8px; background:#a32c24; border-color:#ff595e;" onclick="if(confirm(\'確定要清除所有進度並重新開始嗎？\')) Aetheria.State.resetSave()">重置遊戲 (清除進度)</button>' +
          '</div>';
        body.appendChild(sysCard);
      }
    };
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(attachAstrolabeUpgrade, 30);
  } else {
    window.addEventListener("load", function() { setTimeout(attachAstrolabeUpgrade, 30); });
  }
})();
