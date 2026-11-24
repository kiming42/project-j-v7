/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 六大題型互動組件、免費語音朗讀與星象調頻引擎 (quiz-widgets.js - v7.5)
 * 更新：1.英文串字 (eng_tile_spell)：完全保留原版逐字母串字玩法，改用自動換行與動態格寬根治長詞左右切邊
 *       2.星象調頻：新增「📕 戰鬥只出錯題本」開關，以及四大科目與題型篩選折疊收合（附全部展開/收合鍵）
 *       3.完整保留免費 Web Speech 語音朗讀、中文緊湊字塊拼詞方格與雙重確認重置遊戲
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

  // ================= 0. 免費瀏覽器語音朗讀引擎 (Web Speech API) =================
  function injectTtsStyles() {
    if (document.getElementById("quiz-tts-v75-styles")) return;
    const style = document.createElement("style");
    style.id = "quiz-tts-v75-styles";
    style.textContent =
      ".quiz-meta { align-items: center; gap: 4px; flex-wrap: wrap; }" +
      ".quiz-speak-btn {" +
        "display: inline-flex; align-items: center; gap: 3px;" +
        "background: #1d3557; color: #fff3b0; border: 1.5px solid #1c1619;" +
        "border-radius: 5px; padding: 2px 7px; font-size: 11.5px; font-weight: 900;" +
        "cursor: pointer; line-height: 1.25; white-space: nowrap;" +
        "box-shadow: 0 1px 0 #1c1619;" +
      "}" +
      ".quiz-speak-btn:active { transform: translateY(1px); background: #2b5082; }" +
      ".quiz-speak-btn.speaking { background: #2d6a4f; color: #ffffff; border-color: #5ac54f; }" +
      ".quiz-ans-speak-btn {" +
        "display: inline-flex; align-items: center; gap: 3px; margin-left: 6px;" +
        "background: #1d3557; color: #ffd166; border: 1.5px solid #38b6ff;" +
        "border-radius: 5px; padding: 2px 7px; font-size: 11.5px; font-weight: 900;" +
        "cursor: pointer; vertical-align: middle; white-space: nowrap;" +
      "}" +
      ".quiz-ans-speak-btn.speaking { background: #2d6a4f; color: #ffffff; border-color: #5ac54f; }";
    document.head.appendChild(style);
  }

  let _cachedVoices = [];
  let _activeUtterance = null;

  function refreshVoices() {
    if (!("speechSynthesis" in window)) return [];
    try {
      const list = window.speechSynthesis.getVoices() || [];
      if (list.length > 0) _cachedVoices = list;
    } catch (e) {}
    return _cachedVoices;
  }

  if ("speechSynthesis" in window) {
    refreshVoices();
    try {
      window.speechSynthesis.onvoiceschanged = refreshVoices;
    } catch (e) {}
  }

  const TTS = {
    isSupported: function() {
      return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
    },

    getPrefs: function() {
      const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
      return {
        autoEngSpell: s.ttsAutoEngSpell !== false,
        engSlow: Boolean(s.ttsEngSlow),
        chiLang: s.ttsChiLang || "zh-HK"
      };
    },

    pickVoice: function(langCode) {
      const voices = refreshVoices();
      if (!voices || voices.length === 0) return null;
      const target = String(langCode || "en-GB").toLowerCase();

      let match = voices.find(function(v) { return String(v.lang || "").toLowerCase() === target; });
      if (match) return match;

      if (target.indexOf("en") === 0) {
        match = voices.find(function(v) { return String(v.lang || "").toLowerCase().indexOf("en-gb") === 0; })
             || voices.find(function(v) { return String(v.lang || "").toLowerCase().indexOf("en-us") === 0; })
             || voices.find(function(v) { return String(v.lang || "").toLowerCase().indexOf("en") === 0; });
        return match || null;
      }

      if (target === "zh-hk") {
        match = voices.find(function(v) {
          const l = String(v.lang || "").toLowerCase();
          return l === "zh-hk" || l === "yue-hk" || l === "yue-hant-hk" || l.indexOf("hk") !== -1;
        }) || voices.find(function(v) { return String(v.lang || "").toLowerCase().indexOf("zh-tw") === 0; })
           || voices.find(function(v) { return String(v.lang || "").toLowerCase().indexOf("zh") === 0; });
        return match || null;
      }

      match = voices.find(function(v) { return String(v.lang || "").toLowerCase().indexOf("zh-cn") === 0; })
           || voices.find(function(v) { return String(v.lang || "").toLowerCase().indexOf("zh-tw") === 0; })
           || voices.find(function(v) { return String(v.lang || "").toLowerCase().indexOf("zh") === 0; });
      return match || null;
    },

    stop: function() {
      try {
        if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      } catch (e) {}
      _activeUtterance = null;
      document.querySelectorAll(".quiz-speak-btn.speaking, .quiz-ans-speak-btn.speaking").forEach(function(el) {
        el.classList.remove("speaking");
      });
    },

    speak: function(text, langCode, btnEl) {
      const clean = String(text || "").trim();
      if (!clean) return;
      if (!this.isSupported()) {
        if (window.Aetheria.UI && window.Aetheria.UI.showToast) {
          window.Aetheria.UI.showToast("此瀏覽器暫不支援語音朗讀功能。");
        }
        return;
      }

      const prefs = this.getPrefs();
      const isEng = String(langCode || "").toLowerCase().indexOf("en") === 0;
      const finalLang = isEng ? "en-GB" : (langCode || prefs.chiLang || "zh-HK");

      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(clean);
        u.lang = finalLang;
        u.rate = isEng ? (prefs.engSlow ? 0.72 : 0.90) : 0.96;
        u.pitch = 1.0;

        const chosenVoice = this.pickVoice(finalLang);
        if (chosenVoice) {
          u.voice = chosenVoice;
          u.lang = chosenVoice.lang;
        }

        if (btnEl) {
          btnEl.classList.add("speaking");
          u.onend = function() { btnEl.classList.remove("speaking"); _activeUtterance = null; };
          u.onerror = function() { btnEl.classList.remove("speaking"); _activeUtterance = null; };
        } else {
          u.onend = function() { _activeUtterance = null; };
          u.onerror = function() { _activeUtterance = null; };
        }

        _activeUtterance = u;
        window.speechSynthesis.speak(u);
      } catch (e) {}
    },

    cleanPromptForSpeech: function(rawPrompt, isEng) {
      let txt = String(rawPrompt || "")
        .replace(/<[^>]+>/g, " ")
        .replace(/^【[^】]+】\s*/g, "")
        .replace(/（[^）]*）/g, "")
        .trim();

      if (isEng) {
        txt = txt.replace(/(?:\s*_{2,}\s*)+/g, " blank ");
      } else {
        txt = txt.replace(/(?:\s*_{2,}\s*)+/g, "甚麼");
      }
      return txt.replace(/\s+/g, " ").trim();
    },

    getQuestionSpeakInfo: function(q) {
      if (!q) return { text: "", lang: "zh-HK", label: "🔊 朗讀" };
      const prefs = this.getPrefs();

      if (q.type === "eng_tile_spell") {
        return {
          text: String(q.answer || "").trim(),
          lang: "en-GB",
          label: "🔊 聽發音"
        };
      }
      if (q.subject === "english" || q.qCategory === "eng_fill") {
        return {
          text: this.cleanPromptForSpeech(q.prompt, true),
          lang: "en-GB",
          label: "🔊 讀句子"
        };
      }
      return {
        text: this.cleanPromptForSpeech(q.prompt, false),
        lang: prefs.chiLang,
        label: "🔊 讀題目"
      };
    },

    speakQuestion: function(q, btnEl) {
      const info = this.getQuestionSpeakInfo(q);
      this.speak(info.text, info.lang, btnEl);
    },

    speakAnswer: function(q, fallbackText, btnEl) {
      const prefs = this.getPrefs();
      const isEng = Boolean(q && (q.subject === "english" || q.type === "eng_tile_spell" || q.qCategory === "eng_fill"));
      const rawAns = String((q && q.answer) || fallbackText || "")
        .replace(/<[^>]+>/g, " ")
        .trim();
      if (!rawAns) return;
      this.speak(rawAns, isEng ? "en-GB" : prefs.chiLang, btnEl);
    }
  };

  window.Aetheria.TTS = TTS;

  const QuizUI = {
    currentQuestion: null,
    currentCallback: null,
    _autoSpeakTimer: null,

    renderQuestion: function(q, onResultCallback) {
      injectTtsStyles();
      clearTimeout(this._autoSpeakTimer);
      TTS.stop();

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

      const metaBar = subjTag && subjTag.parentElement;
      if (metaBar && TTS.isSupported()) {
        let speakBtn = document.getElementById("btn-quiz-speak");
        if (!speakBtn) {
          speakBtn = document.createElement("button");
          speakBtn.id = "btn-quiz-speak";
          speakBtn.type = "button";
          speakBtn.className = "quiz-speak-btn";
          metaBar.appendChild(speakBtn);
        }
        const info = TTS.getQuestionSpeakInfo(q);
        speakBtn.innerText = info.label;
        speakBtn.classList.remove("speaking");
        speakBtn.onclick = function(ev) {
          ev.stopPropagation();
          TTS.speakQuestion(q, speakBtn);
        };

        if (q.type === "eng_tile_spell" && TTS.getPrefs().autoEngSpell) {
          this._autoSpeakTimer = setTimeout(function() {
            if (QuizUI.currentQuestion === q) {
              TTS.speakQuestion(q, speakBtn);
            }
          }, 220);
        }
      }

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

    // ================= 1. 英文串字組件 (保留原版逐字母串字玩法 + 自動換行防長詞切邊) =================
    renderEngTileSpell: function(q, area) {
      const self = this;
      const rawPhrase = String(q.answer || "").trim();
      const words = rawPhrase.split(/\s+/).filter(Boolean);
      const cleanLetters = [];
      let maxWordLen = 0;

      const wordSlotMeta = [];
      words.forEach(function(w) {
        if (w.length > maxWordLen) maxWordLen = w.length;
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
      const historyStack = [];
      const engMonoFont = "'Consolas', 'Menlo', 'Courier New', monospace";

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
      wrapper.style.cssText = "display:flex; flex-direction:column; gap:6px; width:100%;";

      const slotsRow = document.createElement("div");
      slotsRow.className = "eng-spell-slots-row";

      const bankRow = document.createElement("div");
      bankRow.style.cssText = "display:flex; flex-wrap:wrap; gap:5px; justify-content:center; max-height:118px; overflow-y:auto; padding:2px;";

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
        const boxSize = maxWordLen >= 13 ? "21px" : (totalLetters > 14 ? "23px" : "28px");
        const fontSize = maxWordLen >= 13 ? "13px" : (totalLetters > 14 ? "14px" : "16px");

        wordSlotMeta.forEach(function(wIdxs) {
          const wordGroup = document.createElement("div");
          wordGroup.className = "eng-word-group";

          wIdxs.forEach(function(flatIdx) {
            const cell = document.createElement("div");
            const val = filled[flatIdx];
            const isNext = (flatIdx === nextEmptyIdx);
            cell.style.cssText =
              "width:" + boxSize + "; height:" + boxSize + "; border-bottom:3px solid " + (val ? "var(--na-gold)" : (isNext ? "#5ac54f" : "#8ce0ff")) + ";" +
              "background:" + (val ? "#2b2118" : (isNext ? "#1e3a2f" : "#1e293b")) + "; color:#ffd166; font-weight:900; font-size:" + fontSize + ";" +
              "display:flex; justify-content:center; align-items:center; border-radius:4px; cursor:pointer; font-family:" + engMonoFont + ";";
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

          slotsRow.appendChild(wordGroup);
        });

        bankRow.innerHTML = "";
        shuffledBank.forEach(function(bItem) {
          const btn = document.createElement("button");
          btn.className = "bank-char" + (bItem.used ? " used" : "");
          btn.style.cssText = "padding:5px 10px; font-size:15px; font-family:" + engMonoFont + "; min-width:33px;";
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

    // ================= 3. 填充題與看圖填充題組件 (支援中文緊湊字塊拼詞 + 對調容錯) =================
    renderFillBlanks: function(q, promptEl, area) {
      const self = this;
      const blanks = q.blanks || [q.answer];
      const numBlanks = blanks.length;
      const isChiTile = (q.qCategory === "chi_tile");
      const filled = new Array(numBlanks).fill(null);
      const historyStack = [];
      let submitted = false;

      const rawBank = blanks.concat(q.distractors || []);
      const shuffledBank = shuffleArray(rawBank.map(function(w, idx) {
        return { id: idx, word: w, used: false };
      }));

      function updatePromptDisplay() {
        if (!promptEl) return;
        let idxCount = 0;

        if (isChiTile) {
          const formatted = String(q.prompt || "")
            .replace(/_{2,}/g, function() {
              const curIdx = idxCount < numBlanks ? idxCount : numBlanks - 1;
              idxCount++;
              const val = filled[curIdx];
              if (val) {
                return '<span class="chi-inline-char filled">' + val.word + '</span>';
              }
              return '<span class="chi-inline-char"> </span>';
            })
            .replace(/<\/span>\s+<span class="chi-inline-char/g, '</span><span class="chi-inline-char');
          promptEl.innerHTML = formatted;
          return;
        }

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
      slotsBar.className = isChiTile ? "chi-tile-slots-row" : "";
      if (!isChiTile) {
        slotsBar.style.cssText = "display:flex; flex-wrap:wrap; gap:6px; justify-content:center;";
      }

      const bankBar = document.createElement("div");
      bankBar.style.cssText = "display:flex; flex-wrap:wrap; gap:6px; justify-content:center;";

      function checkFillAnswer() {
        if (submitted) return;
        submitted = true;
        const userWords = filled.map(function(f) { return f ? f.word : ""; });
        let isAllRight = blanks.every(function(ans, i) {
          return userWords[i] === ans;
        });

        if (!isAllRight && q.allowSwapIndices) {
          const group = q.allowSwapIndices;
          const expectedSet = group.map(function(idx) { return blanks[idx]; }).sort().join("|");
          const actualSet = group.map(function(idx) { return userWords[idx]; }).sort().join("|");
          const otherOk = blanks.every(function(ans, i) {
            return group.indexOf(i) !== -1 || userWords[i] === ans;
          });
          if (otherOk && expectedSet === actualSet) {
            isAllRight = true;
          }
        }

        const correctDisplay = isChiTile ? blanks.join("") : blanks.join("、");
        if (self.currentCallback) {
          self.currentCallback(isAllRight, correctDisplay, q);
        }
      }

      function refreshFillUI() {
        updatePromptDisplay();
        slotsBar.innerHTML = "";
        const nextEmptyIdx = filled.findIndex(function(x) { return x === null; });

        for (let i = 0; i < numBlanks; i++) {
          const slotBtn = document.createElement("div");
          const val = filled[i];

          if (isChiTile) {
            const isNext = (i === nextEmptyIdx);
            slotBtn.className = "chi-tile-slot" + (val ? " filled" : (isNext ? " next-active" : ""));
            slotBtn.innerText = val ? val.word : "";
          } else {
            slotBtn.style.cssText =
              "min-width:86px; padding:5px 10px; border-radius:5px; font-size:13px; font-weight:900; text-align:center; cursor:pointer; " +
              (val ? "background:#2b2118; border:2px solid var(--na-gold); color:var(--na-gold);" : "background:#141013; border:2px dashed #8ce0ff; color:#8ce0ff;");
            slotBtn.innerText = val ? ("(" + (i + 1) + ") " + val.word + " ×") : ("空格 (" + (i + 1) + ")");
          }

          if (val) {
            slotBtn.onclick = function() {
              window.Aetheria.Audio.sfxTalkBlip();
              val.bankItem.used = false;
              filled[i] = null;
              const hPos = historyStack.indexOf(i);
              if (hPos !== -1) historyStack.splice(hPos, 1);
              refreshFillUI();
            };
          }
          slotsBar.appendChild(slotBtn);
        }

        if (isChiTile) {
          const backBtn = document.createElement("button");
          backBtn.className = "na-btn";
          backBtn.style.cssText = "height:42px; padding:0 10px; font-size:13px;";
          backBtn.innerText = "⌫ 退回";
          backBtn.onclick = function() {
            window.Aetheria.Audio.sfxTalkBlip();
            while (historyStack.length > 0) {
              const lastIdx = historyStack.pop();
              if (filled[lastIdx]) {
                filled[lastIdx].bankItem.used = false;
                filled[lastIdx] = null;
                refreshFillUI();
                return;
              }
            }
            for (let i = filled.length - 1; i >= 0; i--) {
              if (filled[i]) {
                filled[i].bankItem.used = false;
                filled[i] = null;
                refreshFillUI();
                return;
              }
            }
          };
          slotsBar.appendChild(backBtn);
        }

        bankBar.innerHTML = "";
        shuffledBank.forEach(function(bItem) {
          const btn = document.createElement("button");
          btn.className = "bank-char" + (isChiTile ? " chi-tile-bank-btn" : "") + (bItem.used ? " used" : "");
          if (!isChiTile) {
            btn.style.cssText = "padding:7px 12px; font-size:14px;";
          }
          btn.innerText = bItem.word;
          btn.onclick = function() {
            if (bItem.used || submitted) return;
            const nextEmpty = filled.findIndex(function(x) { return x === null; });
            if (nextEmpty === -1) return;
            window.Aetheria.Audio.sfxTalkBlip();
            bItem.used = true;
            filled[nextEmpty] = { word: bItem.word, bankItem: bItem };
            historyStack.push(nextEmpty);
            refreshFillUI();
            if (filled.every(function(x) { return x !== null; })) {
              setTimeout(checkFillAnswer, 180);
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

    // ================= 5. 單選選擇題 / 簡答題 / 情境問答題 =================
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

  // ================= 7. 星象調頻（只溫錯題模式、科目折疊收合、題型開關、語音設定） =================
  function attachAstrolabeUpgrade() {
    if (!window.Aetheria.UI) return;
    const UI = window.Aetheria.UI;

    if (!UI._astroExpanded) {
      UI._astroExpanded = {
        chinese: false,
        english: false,
        humanities: false,
        science: false,
        quizTypes: false
      };
    }

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

    UI.toggleAstroSection = function(secKey) {
      this._astroExpanded[secKey] = !Boolean(this._astroExpanded[secKey]);
      window.Aetheria.Audio.sfxTalkBlip();
      this.openSettingsModal("astrolabe");
    };

    UI.setAllAstroSections = function(openBool) {
      ["chinese", "english", "humanities", "science", "quizTypes"].forEach(function(k) {
        UI._astroExpanded[k] = Boolean(openBool);
      });
      window.Aetheria.Audio.sfxTalkBlip();
      this.openSettingsModal("astrolabe");
    };

    UI.toggleWrongOnlyMode = function() {
      const s = window.Aetheria.State.data;
      const Bridge = window.Aetheria.QuizBridge;
      Bridge.ensureQuizSettings(s);
      s.wrongOnlyMode = !Boolean(s.wrongOnlyMode);
      window.Aetheria.Audio.sfxTalkBlip();
      window.Aetheria.State.save();

      const wrongCnt = Bridge.getValidWrongBook ? Bridge.getValidWrongBook(s).length : ((s.wrongBook && s.wrongBook.length) || 0);
      if (s.wrongOnlyMode) {
        this.showToast(wrongCnt > 0
          ? ("📕 已開啟【戰鬥只出錯題本】（目前待消滅 " + wrongCnt + " 題）！")
          : "📕 已開啟只溫錯題模式（目前錯題本為空，將自動由常規題庫出題）。");
      } else {
        this.showToast("已關閉只溫錯題模式，恢復四科智慧權重抽題。");
      }
      this.openSettingsModal("astrolabe");
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

    UI.toggleQuizType = function(typeKey) {
      const s = window.Aetheria.State.data;
      window.Aetheria.QuizBridge.ensureQuizSettings(s);
      s.activeQuizTypes[typeKey] = !s.activeQuizTypes[typeKey];
      window.Aetheria.Audio.sfxTalkBlip();
      window.Aetheria.State.save();
      this.openSettingsModal("astrolabe");
    };

    UI.toggleTtsPref = function(prefKey) {
      const s = window.Aetheria.State.data;
      if (prefKey === "autoEngSpell") {
        s.ttsAutoEngSpell = (s.ttsAutoEngSpell === false);
        this.showToast("英文串字自動朗讀：" + (s.ttsAutoEngSpell ? "已開啟" : "已關閉"));
      } else if (prefKey === "engSlow") {
        s.ttsEngSlow = !Boolean(s.ttsEngSlow);
        this.showToast("英文語速：" + (s.ttsEngSlow ? "慢速清晰 (0.72x)" : "正常語速 (0.9x)"));
        TTS.speak("Good job! Keep going!", "en-GB");
      } else if (prefKey === "chiLang") {
        s.ttsChiLang = (s.ttsChiLang === "zh-CN") ? "zh-HK" : "zh-CN";
        const isHk = s.ttsChiLang !== "zh-CN";
        this.showToast("中文語音已切換為：" + (isHk ? "廣東話 (香港)" : "普通話"));
        TTS.speak(isHk ? "你好，而家用緊廣東話朗讀。" : "你好，現在使用普通話朗讀。", s.ttsChiLang);
      }
      window.Aetheria.Audio.sfxTalkBlip();
      window.Aetheria.State.save();
      this.openSettingsModal("system");
    };

    UI.openSettingsModal = function(tab, previewUnitKey) {
      tab = tab || "astrolabe";
      const s = window.Aetheria.State.data;
      const S = window.Aetheria.Data.Sprites;
      const Bridge = window.Aetheria.QuizBridge;
      Bridge.ensureQuizSettings(s);
      const self = this;
      const allQ = Bridge.getAllQuestions();
      const validWrongCnt = Bridge.getValidWrongBook ? Bridge.getValidWrongBook(s).length : ((s.wrongBook && s.wrongBook.length) || 0);

      this.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = S.iconHtml("icon_gear") + "系統設定與星象調頻 (共 " + allQ.length + " 題)";

      const body = document.getElementById("modal-body");
      body.innerHTML = "";

      const tabBar = document.createElement("div");
      tabBar.className = "tab-bar";
      [
        { id: "astrolabe", label: "星象選課" },
        { id: "preview",   label: "題庫預覽" },
        { id: "report",    label: "掌握報告" },
        { id: "system",    label: "存檔/語音" }
      ].forEach(function(t) {
        const b = document.createElement("button");
        b.className = "na-btn" + (tab === t.id ? " highlight" : "");
        b.innerText = t.label;
        b.onclick = function() { self.openSettingsModal(t.id); };
        tabBar.appendChild(b);
      });
      body.appendChild(tabBar);

      if (tab === "astrolabe") {
        // 1. 📕 戰鬥只出錯題本模式開關
        const wrongOn = Boolean(s.wrongOnlyMode);
        const wrongBanner = document.createElement("div");
        wrongBanner.className = "astro-wrong-banner" + (wrongOn ? " active" : "");
        wrongBanner.innerHTML =
          '<div style="flex:1; min-width:0;">' +
            '<b style="color:' + (wrongOn ? '#ff758f' : '#ffd166') + '; font-size:12.5px;">📕 戰鬥只出錯題本模式 (' + validWrongCnt + ' 題待清)</b>' +
            '<div style="font-size:11px; color:#cbd5e1; margin-top:2px;">' +
              (wrongOn
                ? (validWrongCnt > 0 ? '運作中：打怪將 100% 抽錯題，清零後自動切回常規題庫。' : '已開啟：目前無錯題，暫由常規智慧題庫出題。')
                : '測驗前衝刺必備！開啟後打怪專攻錯題本直至全部消滅。') +
            '</div>' +
          '</div>' +
          '<button class="na-btn ' + (wrongOn ? 'highlight' : '') + '" style="padding:5px 9px; font-size:11.5px; white-space:nowrap;" onclick="Aetheria.UI.toggleWrongOnlyMode()">' +
            (wrongOn ? '✓ 運作中' : '開啟模式') +
          '</button>';
        body.appendChild(wrongBanner);

        // 2. 選課模式 ＋ 全部展開／收合
        const isSingle = (s.lessonSelectMode === "single");
        const modeBox = document.createElement("div");
        modeBox.className = "sys-card-scroll";
        modeBox.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">' +
            '<div style="display:flex; gap:4px; align-items:center;">' +
              '<b>選課：</b>' +
              '<button class="na-btn ' + (isSingle ? 'highlight' : '') + '" style="padding:3px 8px; font-size:11.5px;" onclick="Aetheria.UI.setLessonSelectMode(\'single\')">🎯 單選</button>' +
              '<button class="na-btn ' + (!isSingle ? 'highlight' : '') + '" style="padding:3px 8px; font-size:11.5px;" onclick="Aetheria.UI.setLessonSelectMode(\'multi\')">☑️ 多選</button>' +
            '</div>' +
            '<div style="display:flex; gap:4px;">' +
              '<button class="na-btn" style="padding:3px 7px; font-size:11px;" onclick="Aetheria.UI.setAllAstroSections(true)">全部展開</button>' +
              '<button class="na-btn" style="padding:3px 7px; font-size:11px;" onclick="Aetheria.UI.setAllAstroSections(false)">全部收合</button>' +
            '</div>' +
          '</div>';
        body.appendChild(modeBox);

        // 3. 四大科目可折疊卡片
        const cntBySubj = function(k) { return allQ.filter(function(q) { return q.subject === k; }).length; };
        const engVocabCnt = (window.Aetheria.QuestionBank && window.Aetheria.QuestionBank.English && window.Aetheria.QuestionBank.English.VOCAB) ? window.Aetheria.QuestionBank.English.VOCAB.length : 0;

        const subjMeta = [
          { key: "chinese",    name: "中文科（" + cntBySubj("chinese") + "題）" },
          { key: "english",    name: "英文科（" + engVocabCnt + "詞/" + cntBySubj("english") + "題）" },
          { key: "humanities", name: "人文科（" + cntBySubj("humanities") + "題）" },
          { key: "science",    name: "科學科（" + cntBySubj("science") + "題）" }
        ];

        subjMeta.forEach(function(sm) {
          const subjOn = Boolean(s.activeSubjects[sm.key]);
          const lessons = Bridge.LESSON_CATALOG.filter(function(l) { return l.subject === sm.key; });
          const activeLessonCnt = lessons.filter(function(les) { return subjOn && Boolean(s.activeLessons[les.key]); }).length;
          const isOpen = Boolean(self._astroExpanded[sm.key]);

          const card = document.createElement("div");
          card.className = "sys-card";

          let lessonsGridHtml = "";
          if (isOpen) {
            const lessonsHtml = lessons.map(function(les) {
              const on = subjOn && Boolean(s.activeLessons[les.key]);
              const mark = isSingle ? (on ? "◉ " : "○ ") : (on ? "☑ " : "☐ ");
              return '<button class="na-btn ' + (on ? 'highlight' : '') + '" style="padding:5px 8px; font-size:12px; text-align:left;" ' +
                'onclick="Aetheria.UI.toggleLessonUnit(\'' + les.key + '\', \'' + sm.key + '\')">' +
                mark + les.name + ' <span style="opacity:0.8;font-size:11px;">(' + les.count + '題)</span>' +
              '</button>';
            }).join("");
            lessonsGridHtml = '<div style="display:grid; grid-template-columns:1fr 1fr; gap:5px; margin-top:6px; padding-top:6px; border-top:1px solid #3d3136;">' + lessonsHtml + '</div>';
          }

          card.innerHTML =
            '<div class="astro-subj-header" onclick="Aetheria.UI.toggleAstroSection(\'' + sm.key + '\')">' +
              '<div class="astro-subj-title">' +
                '<span class="astro-subj-arrow">' + (isOpen ? '▾' : '▸') + '</span>' +
                '<span>' + sm.name + '</span>' +
                '<span class="astro-subj-count">已選 ' + activeLessonCnt + '/' + lessons.length + ' 課</span>' +
              '</div>' +
              '<div style="display:flex; gap:4px; flex-shrink:0;" onclick="event.stopPropagation()">' +
                '<button class="na-btn" style="padding:2px 7px; font-size:11px;" onclick="Aetheria.UI.selectAllLessonsInSubject(\'' + sm.key + '\', true)">全選</button>' +
                '<button class="na-btn" style="padding:2px 7px; font-size:11px;" onclick="Aetheria.UI.selectAllLessonsInSubject(\'' + sm.key + '\', false)">全關</button>' +
              '</div>' +
            '</div>' +
            lessonsGridHtml;

          body.appendChild(card);
        });

        // 4. 題型開關篩選（可折疊）
        const quizTypes = Bridge.QUIZ_TYPE_CATALOG || [];
        const activeTypeCnt = quizTypes.filter(function(tp) { return s.activeQuizTypes[tp.key] !== false; }).length;
        const typeOpen = Boolean(self._astroExpanded.quizTypes);

        const typeCard = document.createElement("div");
        typeCard.className = "sys-card";
        let typeGridHtml = "";
        if (typeOpen) {
          const typeBtns = quizTypes.map(function(tp) {
            const on = s.activeQuizTypes[tp.key] !== false;
            return '<button class="na-btn ' + (on ? 'highlight' : '') + '" style="padding:4px 6px; font-size:11px; text-align:left;" ' +
              'onclick="Aetheria.UI.toggleQuizType(\'' + tp.key + '\')">' +
              (on ? "☑ " : "☐ ") + tp.label +
            '</button>';
          }).join("");
          typeGridHtml = '<div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; margin-top:6px; padding-top:6px; border-top:1px solid #3d3136;">' + typeBtns + '</div>';
        }
        typeCard.innerHTML =
          '<div class="astro-subj-header" onclick="Aetheria.UI.toggleAstroSection(\'quizTypes\')">' +
            '<div class="astro-subj-title">' +
              '<span class="astro-subj-arrow">' + (typeOpen ? '▾' : '▸') + '</span>' +
              '<span>🎯 題型開關篩選（字塊拼詞／串字／填充）</span>' +
              '<span class="astro-subj-count">' + activeTypeCnt + '/' + quizTypes.length + '</span>' +
            '</div>' +
          '</div>' +
          typeGridHtml;
        body.appendChild(typeCard);
      }

      else if (tab === "preview") {
        if (!Bridge.LESSON_CATALOG || Bridge.LESSON_CATALOG.length === 0) {
          body.innerHTML += '<div class="sys-card">目前尚未載入任何課程題庫。</div>';
          return;
        }
        const curUnit = previewUnitKey || Bridge.LESSON_CATALOG[0].key;
        const unitBar = document.createElement("div");
        unitBar.style.cssText = "display:flex; flex-wrap:wrap; gap:4px; margin-bottom:8px;";
        Bridge.LESSON_CATALOG.forEach(function(l) {
          const btn = document.createElement("button");
          btn.className = "na-btn" + (l.key === curUnit ? " highlight" : "");
          btn.style.cssText = "font-size:11px; padding:4px 7px;";
          btn.innerText = l.name.length > 14 ? l.name.slice(0, 13) + "…" : l.name;
          btn.onclick = function() { self.openSettingsModal("preview", l.key); };
          unitBar.appendChild(btn);
        });
        body.appendChild(unitBar);

        const unitQuestions = allQ.filter(function(q) { return q.unitKey === curUnit; });
        if (unitQuestions.length === 0) {
          const emptyCard = document.createElement("div");
          emptyCard.className = "sys-card";
          emptyCard.innerText = "此單元暫無題目。";
          body.appendChild(emptyCard);
        }
        unitQuestions.forEach(function(q, idx) {
          const btn = document.createElement("button");
          btn.className = "na-btn";
          btn.style.cssText = "width:100%; text-align:left; padding:7px 10px; margin-bottom:4px; font-size:12px;";
          const shortPrompt = String(q.prompt || "").replace(/\n/g, " ").slice(0, 34);
          btn.innerHTML = (idx + 1) + ". <b>[" + q.typeLabel + "]</b> " + shortPrompt + (String(q.prompt || "").length > 34 ? "..." : "");
          btn.onclick = function() { window.Aetheria.Battle.startBattle(null, "combat", q.id); };
          body.appendChild(btn);
        });
      }

      else if (tab === "report") {
        const topCard = document.createElement("div");
        topCard.className = "sys-card-scroll";
        topCard.innerHTML = '<b>全題庫掌握度報告（最高連勝紀錄：' + (s.maxStreak || 0) + ' 題｜錯題本：' + validWrongCnt + ' 題）</b>';
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
          row.style.alignItems = "center";
          row.innerHTML =
            '<span><b>' + les.name + '</b></span>' +
            '<span style="color:var(--na-gold); font-weight:bold; white-space:nowrap;">' + mastered + '/' + qs.length + ' (' + pct + '%) ★' + stars + '</span>';
          body.appendChild(row);
        });
      }

      else if (tab === "system") {
        const prefs = TTS.getPrefs();
        const ttsCard = document.createElement("div");
        ttsCard.className = "sys-card";
        ttsCard.innerHTML =
          '<div style="color:var(--na-gold); font-weight:900; font-size:13px; margin-bottom:6px;">🔊 免費離線語音朗讀設定（Web Speech）</div>' +
          '<div style="display:flex; flex-direction:column; gap:5px;">' +
            '<button class="na-btn ' + (prefs.autoEngSpell ? 'highlight' : '') + '" style="padding:7px;" onclick="Aetheria.UI.toggleTtsPref(\'autoEngSpell\')">🔊 英文串字自動朗讀：' + (prefs.autoEngSpell ? '已開啟 ✓' : '已關閉') + '</button>' +
            '<button class="na-btn" style="padding:7px;" onclick="Aetheria.UI.toggleTtsPref(\'engSlow\')">🐢 英文朗讀語速：' + (prefs.engSlow ? '慢速清晰 (0.72x)' : '正常語速 (0.9x)') + '</button>' +
            '<button class="na-btn" style="padding:7px;" onclick="Aetheria.UI.toggleTtsPref(\'chiLang\')">🗣️ 中文朗讀語言：' + (prefs.chiLang === 'zh-CN' ? '普通話 (zh-CN)' : '廣東話 (香港 zh-HK)') + '</button>' +
          '</div>';
        body.appendChild(ttsCard);

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
            '<button class="na-btn" style="padding:8px; background:#a32c24; border-color:#ff595e;" onclick="if(confirm(\'確定要清除所有進度並重新開始嗎？\') && confirm(\'再次確認：所有存檔、裝備與溫習紀錄將會永久刪除，確定繼續？\')) Aetheria.State.resetSave()">重置遊戲 (清除進度)</button>' +
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
