/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 原有題庫多樣化題型轉換與精準血量HUD模組 (quiz-hud-upgrade.js - v7.9.2)
 * 根據 quiz-widgets.js 真實結構精準對接：
 *   1. 直接攔截 QuizUI.renderMCQ(q, area) 與 #q-prompt-text / #q-type-tag
 *   2. 透過 QuizBridge.getAllQuestions() 100% 讀取原有題庫（零外來題目）
 *   3. 將科學科與人文科的原四選一題目自動轉為：【互動排序題】、【同課配對題】、【正誤分類籃】
 *   4. 左上角 #hud-hearts-box 升級為「♥ 100/100 實時數字 + 動態三色迷你血條」
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  // ================= 1. 注入左上角精準血量框與互動排序題 CSS =================
  function injectQuizHudStyles() {
    if (document.getElementById("quiz-hud-v792-styles")) return;
    const style = document.createElement("style");
    style.id = "quiz-hud-v792-styles";
    style.textContent = `
      /* 左上角精準數字血量膠囊 (#hud-hearts-box) */
      #hud-hearts-box {
        position: absolute !important;
        top: 4px !important;
        left: 5px !important;
        z-index: 25 !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        background: rgba(20, 16, 19, 0.92) !important;
        border: 2px solid #f5b700 !important;
        border-radius: 6px !important;
        padding: 2px 6px 3px !important;
        min-width: 78px !important;
        box-shadow: 0 2px 6px rgba(0,0,0,0.75) !important;
        pointer-events: auto !important;
        cursor: pointer !important;
      }
      #hud-hearts-box.hp-low-pulse {
        border-color: #ff595e !important;
        animation: hpDangerPulse 0.9s infinite ease-in-out !important;
      }
      @keyframes hpDangerPulse {
        0%, 100% { box-shadow: 0 0 4px rgba(255, 89, 94, 0.6); transform: scale(1); }
        50% { box-shadow: 0 0 12px rgba(255, 89, 94, 1); transform: scale(1.04); }
      }
      .hud-hp-top-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 4px;
        font-size: 11px;
        font-weight: 900;
        color: #ffffff;
        line-height: 1.1;
        text-shadow: 1px 1px 0 #000;
      }
      .hud-hp-top-row img {
        width: 12px !important;
        height: 12px !important;
        image-rendering: pixelated;
      }
      .hud-hp-mini-track {
        width: 100%;
        height: 5px;
        background: #2b2129;
        border: 1px solid #000;
        border-radius: 3px;
        margin-top: 2px;
        overflow: hidden;
      }
      .hud-hp-mini-fill {
        height: 100%;
        transition: width 0.25s ease, background-color 0.25s ease;
      }

      /* 調整頂部徽章列左邊距，避免與左上角血量框重疊 */
      #hud-overlay {
        left: 90px !important;
      }

      /* 互動排序題介面樣式 */
      .seq-container {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 100%;
      }
      .seq-guide-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        color: #ffd166;
        font-weight: 900;
        background: rgba(15, 23, 42, 0.85);
        padding: 3px 8px;
        border-radius: 4px;
        border: 1px solid #38b6ff;
      }
      .seq-slots-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(72px, 1fr));
        gap: 5px;
        width: 100%;
      }
      .seq-slot-box {
        background: #141013;
        border: 2px dashed #6c757d;
        border-radius: 6px;
        padding: 5px 4px;
        min-height: 42px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-size: 12px;
        font-weight: 900;
        color: #8d99ae;
        cursor: pointer;
      }
      .seq-slot-box.filled {
        background: linear-gradient(135deg, #1d3557 0%, #102542 100%);
        border: 2px solid #38b6ff;
        color: #ffffff;
        box-shadow: 0 2px 5px rgba(56, 182, 255, 0.35);
      }
      .seq-slot-num {
        font-size: 9.5px;
        color: #ffd166;
        margin-bottom: 2px;
      }
      .seq-choices-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 5px;
        width: 100%;
      }
      .seq-choice-btn {
        background: #2b2118;
        border: 2px solid #d9a066;
        border-radius: 6px;
        padding: 6px 6px;
        color: #fff3b0;
        font-size: 12px;
        font-weight: 900;
        text-align: center;
        cursor: pointer;
        box-shadow: 0 2px 0 #141013;
        line-height: 1.25;
      }
      .seq-choice-btn:active {
        transform: translateY(2px);
      }
      .seq-choice-btn.used {
        opacity: 0.25;
        pointer-events: none;
        border-color: #4a4e69;
      }
      .seq-action-row {
        display: flex;
        gap: 6px;
        margin-top: 2px;
      }
    `;
    document.head.appendChild(style);
  }

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

  function stripOptionPrefix(str) {
    return String(str || "").replace(/^[A-Da-d][\.\、\s]+/, "").trim();
  }

  function isScienceOrHumanities(q) {
    if (!q) return false;
    if (q.subject === "science" || q.subject === "humanities") return true;
    const lbl = String(q.subjectLabel || "");
    if (lbl.indexOf("科學") !== -1 || lbl.indexOf("人文") !== -1) return true;
    const uKey = String(q.unitKey || "");
    return uKey.indexOf("sci") === 0 || uKey.indexOf("hum") === 0;
  }

  // 解析原題正確答案，將其拆解為自然語意步驟或片段
  function splitAnswerIntoLogicalSteps(rawAns) {
    const clean = stripOptionPrefix(rawAns);
    if (!clean) return null;

    // 1. 若答案含箭頭 (→, ➔, ->, ＞)
    if (/➔|→|->|＞|>/.test(clean)) {
      const parts = clean.split(/➔|→|->|＞|>/).map(function(s) { return s.trim(); }).filter(Boolean);
      if (parts.length >= 2 && parts.length <= 5) {
        return { mode: "arrow", steps: parts };
      }
    }

    // 2. 若答案含頓號、分號、逗號或連詞 (、 ， ； 及 和 與)
    if (/、|，|；|及|和|與/.test(clean)) {
      const parts = clean.split(/、|，|；|及|和|與/).map(function(s) { return s.trim(); }).filter(Boolean);
      if (parts.length >= 2 && parts.length <= 4 && parts.every(function(p) { return p.length >= 1; })) {
        const isOrdered = /，|；/.test(clean);
        return { mode: isOrdered ? "clause" : "list", steps: parts };
      }
    }

    // 3. 若答案含因果或結構助詞（因為...所以 / 使 / 令 / 的 / 由...到）
    const connectorSplit = clean.split(/(?=因為|所以|從而|導致|使|令|並|再|然後|最後)/).map(function(s) { return s.trim(); }).filter(Boolean);
    if (connectorSplit.length >= 2 && connectorSplit.length <= 4) {
      return { mode: "clause", steps: connectorSplit };
    }

    // 4. 一般詞語或短句（長度 >= 4）：按雙字/三字詞組切分為 2~3 個順序片段
    if (clean.length >= 4) {
      const numChunks = clean.length >= 8 ? 3 : 2;
      const chunkLen = Math.ceil(clean.length / numChunks);
      const chunks = [];
      for (let i = 0; i < clean.length; i += chunkLen) {
        chunks.push(clean.slice(i, i + chunkLen));
      }
      if (chunks.length >= 2) {
        return { mode: "chunk", steps: chunks };
      }
    }

    return null;
  }

  // 從同一題的錯誤選項中提取 2~3 個干擾片段
  function getDistractorsFromOptions(q, correctSteps) {
    const distractors = [];
    const ansClean = stripOptionPrefix(q.answer);
    const opts = Array.isArray(q.options) ? q.options : [];

    opts.forEach(function(opt) {
      const cOpt = stripOptionPrefix(opt);
      if (!cOpt || cOpt === ansClean) return;

      const parsed = splitAnswerIntoLogicalSteps(cOpt);
      if (parsed && parsed.steps.length > 0) {
        parsed.steps.forEach(function(st) {
          if (correctSteps.indexOf(st) === -1 && distractors.indexOf(st) === -1) {
            distractors.push(st);
          }
        });
      } else if (correctSteps.indexOf(cOpt) === -1 && distractors.indexOf(cOpt) === -1) {
        distractors.push(cOpt);
      }
    });

    const maxDist = Math.max(2, 6 - correctSteps.length);
    return shuffleArray(distractors).slice(0, maxDist);
  }

  // ================= 2. 題型轉換 A：互動排序／步驟重組渲染器 =================
  function renderConvertedSequence(quizUI, q, area, stepInfo) {
    const typeTag = document.getElementById("q-type-tag");
    const isArrow = (stepInfo.mode === "arrow" || stepInfo.mode === "clause");
    if (typeTag) {
      typeTag.innerText = isArrow ? "先後排序題" : "概念重組題";
    }

    const correctSteps = stepInfo.steps.slice();
    const distractors = (stepInfo.mode === "arrow" && correctSteps.length >= 4)
      ? []
      : getDistractorsFromOptions(q, correctSteps);

    const cardObjects = correctSteps.map(function(txt, i) {
      return { text: txt, origIdx: i };
    });
    distractors.forEach(function(dTxt, dIdx) {
      cardObjects.push({ text: dTxt, origIdx: 100 + dIdx });
    });

    let shuffledPool = shuffleArray(cardObjects);
    if (shuffledPool.every(function(c, i) { return c.origIdx === i; }) && shuffledPool.length >= 2) {
      const tmp = shuffledPool[0];
      shuffledPool[0] = shuffledPool[1];
      shuffledPool[1] = tmp;
    }

    const selectedPoolIndices = [];

    function refreshSeqUI() {
      let slotsHtml = "";
      for (let i = 0; i < correctSteps.length; i++) {
        const pIdx = selectedPoolIndices[i];
        const filled = (pIdx !== undefined);
        const txt = filled ? shuffledPool[pIdx].text : "點擊下方選擇";
        const label = isArrow ? ("步驟 " + (i + 1)) : ("順序 " + (i + 1));
        slotsHtml +=
          '<div class="seq-slot-box ' + (filled ? 'filled' : '') + '" data-slot="' + i + '">' +
            '<div class="seq-slot-num">' + label + (filled ? ' ×' : '') + '</div>' +
            '<div>' + txt + '</div>' +
          '</div>';
      }

      let choicesHtml = "";
      shuffledPool.forEach(function(item, pIdx) {
        const used = selectedPoolIndices.indexOf(pIdx) !== -1;
        choicesHtml +=
          '<button class="seq-choice-btn ' + (used ? 'used' : '') + '" data-pool="' + pIdx + '">' +
            item.text +
          '</button>';
      });

      const isReady = (selectedPoolIndices.length === correctSteps.length);
      const guideText = (stepInfo.mode === "list")
        ? ("👆 請選出正確的 " + correctSteps.length + " 個項目 (" + selectedPoolIndices.length + "/" + correctSteps.length + ")")
        : ("👆 請按正確先後次序點擊下方卡片 (" + selectedPoolIndices.length + "/" + correctSteps.length + ")");

      area.innerHTML =
        '<div class="seq-container">' +
          '<div class="seq-guide-bar">' +
            '<span>' + guideText + '</span>' +
            '<span>💡洞察可用</span>' +
          '</div>' +
          '<div class="seq-slots-row">' + slotsHtml + '</div>' +
          '<div class="seq-choices-grid">' + choicesHtml + '</div>' +
          '<div class="seq-action-row">' +
            '<button class="na-btn" id="seq-btn-undo" style="flex:1; padding:6px;">⌫ 退回</button>' +
            '<button class="na-btn" id="seq-btn-Hint" style="flex:1; padding:6px;">💡 提示</button>' +
            '<button class="na-btn ' + (isReady ? 'highlight' : '') + '" id="seq-btn-ok" style="flex:2; padding:6px; font-size:13px;">✓ 確認提交</button>' +
          '</div>' +
        '</div>';

      area.querySelectorAll(".seq-choice-btn").forEach(function(btn) {
        btn.onclick = function() {
          const pIdx = parseInt(btn.getAttribute("data-pool"), 10);
          if (selectedPoolIndices.indexOf(pIdx) === -1 && selectedPoolIndices.length < correctSteps.length) {
            window.Aetheria.Audio.sfxTalkBlip();
            selectedPoolIndices.push(pIdx);
            refreshSeqUI();
          }
        };
      });

      area.querySelectorAll(".seq-slot-box.filled").forEach(function(slot) {
        slot.onclick = function() {
          const sIdx = parseInt(slot.getAttribute("data-slot"), 10);
          if (!isNaN(sIdx) && sIdx < selectedPoolIndices.length) {
            window.Aetheria.Audio.sfxTalkBlip();
            selectedPoolIndices.splice(sIdx, 1);
            refreshSeqUI();
          }
        };
      });

      const undoBtn = document.getElementById("seq-btn-undo");
      if (undoBtn) {
        undoBtn.onclick = function() {
          if (selectedPoolIndices.length > 0) {
            window.Aetheria.Audio.sfxTalkBlip();
            selectedPoolIndices.pop();
            refreshSeqUI();
          }
        };
      }

      const hintBtn = document.getElementById("seq-btn-Hint");
      if (hintBtn) {
        hintBtn.onclick = function() {
          const s = (window.Aetheria.State && window.Aetheria.State.data) || {};
          if (!s.inventory || (s.inventory.potionHint || 0) <= 0) {
            window.Aetheria.UI.showToast("洞察藥水不足！可在營地工坊提煉或商店購買。");
            return;
          }
          const nextSlot = selectedPoolIndices.length;
          if (nextSlot >= correctSteps.length) return;
          const targetTxt = correctSteps[nextSlot];
          const matchPoolIdx = shuffledPool.findIndex(function(item, idx) {
            return selectedPoolIndices.indexOf(idx) === -1 && item.text === targetTxt;
          });
          if (matchPoolIdx !== -1) {
            s.inventory.potionHint--;
            window.Aetheria.State.save();
            window.Aetheria.Audio.sfxGather();
            selectedPoolIndices.push(matchPoolIdx);
            refreshSeqUI();
          }
        };
      }

      const okBtn = document.getElementById("seq-btn-ok");
      if (okBtn) {
        okBtn.onclick = function() {
          if (selectedPoolIndices.length < correctSteps.length) {
            window.Aetheria.UI.showToast("請先排滿上方 " + correctSteps.length + " 個位置！");
            return;
          }
          const userArr = selectedPoolIndices.map(function(idx) { return shuffledPool[idx].text; });
          let isRight = false;
          if (stepInfo.mode === "list") {
            isRight = (userArr.slice().sort().join("|") === correctSteps.slice().sort().join("|"));
          } else {
            isRight = userArr.every(function(val, i) { return val === correctSteps[i]; });
          }
          if (quizUI.currentCallback) {
            quizUI.currentCallback(isRight, stripOptionPrefix(q.answer), q);
          }
        };
      }
    }

    refreshSeqUI();
  }

  // ================= 3. 題型轉換 B：從原題庫同一課 (unitKey) 抽取 3 題組成【配對題】 =================
  function tryBuildSameLessonMatching(q) {
    const Bridge = window.Aetheria.QuizBridge;
    if (!Bridge || !Bridge.getAllQuestions) return null;

    const allQ = Bridge.getAllQuestions() || [];
    const baseAns = stripOptionPrefix(q.answer);
    if (!baseAns || baseAns.length > 18) return null;

    // 優先從同一課 (unitKey) 篩選答案不重複的題目
    let peers = allQ.filter(function(item) {
      if (!item || item.id === q.id || item.subject !== q.subject) return false;
      if (q.unitKey && item.unitKey !== q.unitKey) return false;
      const a = stripOptionPrefix(item.answer);
      return a && a.length >= 2 && a.length <= 18 && a !== baseAns && item.prompt;
    });

    if (peers.length < 2) return null;
    const pickedPeers = shuffleArray(peers).slice(0, 2);
    const trio = [q, pickedPeers[0], pickedPeers[1]];

    const pairs = trio.map(function(item) {
      let cleanP = String(item.prompt || "")
        .replace(/^【[^】]+】/, "")
        .replace(/請問|下列哪一項|哪一個|是甚麼|是什麼|？|\?/g, "")
        .trim();
      if (cleanP.length > 22) cleanP = cleanP.slice(0, 21) + "…";
      return {
        left: cleanP,
        right: stripOptionPrefix(item.answer)
      };
    });

    return {
      id: q.id,
      subject: q.subject,
      unitKey: q.unitKey,
      type: "matching",
      prompt: "【同課重點連線】請將左方的題目重點與右方的正確答案配對：",
      pairs: pairs,
      answer: stripOptionPrefix(q.answer)
    };
  }

  // ================= 4. 題型轉換 C：利用原題選項組成【正誤觀念分類籃】 =================
  function tryBuildTrueFalseClassify(q) {
    const opts = Array.isArray(q.options) ? q.options : [];
    if (opts.length < 3) return null;

    const ansClean = stripOptionPrefix(q.answer);
    const wrongOpts = opts
      .map(stripOptionPrefix)
      .filter(function(o) { return o && o !== ansClean; });

    if (wrongOpts.length < 2) return null;
    const pickedWrongs = shuffleArray(wrongOpts).slice(0, 2);

    const items = shuffleArray([
      { label: ansClean,         basket: "✅ 正確答案" },
      { label: pickedWrongs[0],  basket: "❌ 錯誤陷阱" },
      { label: pickedWrongs[1],  basket: "❌ 錯誤陷阱" }
    ]);

    return {
      id: q.id,
      subject: q.subject,
      unitKey: q.unitKey,
      type: "classify",
      prompt: q.prompt,
      baskets: ["✅ 正確答案", "❌ 錯誤陷阱"],
      items: items,
      answer: ansClean
    };
  }

  // ================= 5. 掛載 QuizUI.renderMCQ 與左上角精準血量框 =================
  function hookQuizAndHeartsHUD() {
    const Ren = window.Aetheria.Renderer;
    const QUI = window.Aetheria.QuizUI;
    const UI  = window.Aetheria.UI;

    // (A) 升級左上角 #hud-hearts-box：顯示「♥ 120/120 + 動態三色迷你血條」
    if (Ren) {
      Ren.updateHeartsDOM = function(s, Sprites) {
        if (!s) return;
        const curHp = Math.max(0, Math.round(s.hp || 0));
        const maxHp = Math.max(1, Math.round(s.maxHp || 100));
        const stateKey = curHp + "/" + maxHp;
        if (this.lastHeartsState === stateKey) return;
        this.lastHeartsState = stateKey;

        const box = document.getElementById("hud-hearts-box");
        if (!box) return;

        const pct = Math.max(0, Math.min(100, Math.round((curHp / maxHp) * 100)));
        const barColor = (pct >= 60) ? "#5ac54f" : (pct >= 30) ? "#f5b700" : "#ff595e";
        const heartUrl = (Sprites && Sprites.getDataURL) ? Sprites.getDataURL("heart") : "";

        if (pct < 30) box.classList.add("hp-low-pulse");
        else box.classList.remove("hp-low-pulse");

        box.title = "點擊可快速飲用生命藥水";
        box.innerHTML =
          '<div class="hud-hp-top-row">' +
            (heartUrl ? '<img src="' + heartUrl + '" alt="HP">' : '<span style="color:#ff595e;">♥</span>') +
            '<span>' + curHp + '/' + maxHp + '</span>' +
          '</div>' +
          '<div class="hud-hp-mini-track">' +
            '<div class="hud-hp-mini-fill" style="width:' + pct + '%; background:' + barColor + ';"></div>' +
          '</div>';

        if (!box._boundQuickHeal) {
          box._boundQuickHeal = true;
          box.onclick = function() {
            const st = window.Aetheria.State.data;
            if (st.hp >= st.maxHp) {
              window.Aetheria.UI.showToast("❤️ 當前生命值已滿 (" + st.hp + "/" + st.maxHp + ")！");
              return;
            }
            if ((st.inventory.potionHeal || 0) > 0) {
              window.Aetheria.Battle.useHealPotion();
              Ren.lastHeartsState = "";
              Ren.updateHeartsDOM(st, window.Aetheria.Data.Sprites);
            } else {
              window.Aetheria.UI.showToast("❤️ 當前生命值：" + st.hp + "/" + st.maxHp + "（可按右下角「口糧」進食或回營地睡覺恢復）");
            }
          };
        }
      };
    }

    if (UI && UI.updateAllHud) {
      const origUpdateAll = UI.updateAllHud.bind(UI);
      UI.updateAllHud = function() {
        origUpdateAll();
        if (window.Aetheria.Renderer && window.Aetheria.Renderer.updateHeartsDOM) {
          window.Aetheria.Renderer.lastHeartsState = "";
          window.Aetheria.Renderer.updateHeartsDOM(
            window.Aetheria.State.data,
            window.Aetheria.Data.Sprites
          );
        }
      };
    }

    // (B) 直接攔截 QuizUI.renderMCQ(q, area)：將科學科與人文科的原四選一題目轉為排序/配對/分類題！
    if (QUI && QUI.renderMCQ) {
      const origRenderMCQ = QUI.renderMCQ.bind(QUI);
      let rotateCounter = 0;

      QUI.renderMCQ = function(q, area) {
        if (isScienceOrHumanities(q)) {
          const stepInfo = splitAnswerIntoLogicalSteps(q.answer);
          const promptEl = document.getElementById("q-prompt-text");
          const typeTag  = document.getElementById("q-type-tag");

          // 1. 若原題答案含箭頭或並列詞，優先 100% 轉為【先後排序題】
          if (stepInfo && (stepInfo.mode === "arrow" || stepInfo.mode === "list" || stepInfo.mode === "clause")) {
            renderConvertedSequence(this, q, area, stepInfo);
            return;
          }

          // 2. 其他科學/人文單選題：依序輪換為【排序重組題】、【同課配對題】、【正誤分類籃】
          rotateCounter = (rotateCounter + 1) % 3;

          if (rotateCounter === 0 && stepInfo) {
            renderConvertedSequence(this, q, area, stepInfo);
            return;
          }

          if (rotateCounter === 1) {
            const matchObj = tryBuildSameLessonMatching(q);
            if (matchObj && this.renderMatching) {
              if (typeTag) typeTag.innerText = "同課配對題";
              if (promptEl) promptEl.innerText = matchObj.prompt;
              this.renderMatching(matchObj, area);
              return;
            }
          }

          if (rotateCounter === 2) {
            const clsObj = tryBuildTrueFalseClassify(q);
            if (clsObj && this.renderClassifyBaskets) {
              if (typeTag) typeTag.innerText = "正誤分類籃";
              this.renderClassifyBaskets(clsObj, area);
              return;
            }
          }

          if (stepInfo) {
            renderConvertedSequence(this, q, area, stepInfo);
            return;
          }
        }

        origRenderMCQ(q, area);
      };
    }
  }

  function initQuizHudUpgrade() {
    try {
      injectQuizHudStyles();
      hookQuizAndHeartsHUD();

      if (window.Aetheria.UI && window.Aetheria.UI.updateAllHud) {
        window.Aetheria.UI.updateAllHud();
      }
    } catch (err) {
      console.error("Quiz & HUD Upgrade v7.9.2 init error:", err);
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(initQuizHudUpgrade, 120);
  } else {
    window.addEventListener("load", function() {
      setTimeout(initQuizHudUpgrade, 120);
    });
  }
})();
