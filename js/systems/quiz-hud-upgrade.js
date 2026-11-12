/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 原有題庫多樣化題型轉換與精準血量HUD模組 (quiz-hud-upgrade.js - v7.9.1)
 * 核心設計（零外來題目，100% 使用原有題庫）：
 *   1. 【左上角精準血量 HUD】：將 3 顆模糊愛心升級為「♥ 120/120 實時數字 + 動態三色迷你血條」，點擊可快捷飲用藥水
 *   2. 【原有題庫智能題型轉換（科學科 & 人文科）】：
 *      - 模式 A [先後排序題]：若原題答案含箭頭(→/➔)或頓號(、)，自動拆解為順序槽供點擊排列
 *      - 模式 B [概念語塊重組]：將原題正確答案拆為語塊，並混入同題錯誤選項的干擾語塊，依序點擊拼出答案
 *      - 模式 C [原題庫同科配對]：即時從原有題庫抽取 3 題同科題目，組成「題目 ⟷ 答案」配對題
 *   3. 100% 兼容原有錯題本 (wrongBook) 與題目詳解 (explanation)
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  // ================= 1. 注入精準血量膠囊與互動排序/配對介面 CSS =================
  function injectQuizHudStyles() {
    if (document.getElementById("quiz-hud-v79-styles")) return;
    const style = document.createElement("style");
    style.id = "quiz-hud-v79-styles";
    style.textContent = `
      /* 左上角精準數字血量膠囊 (#hud-hearts-box 升級版) */
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

      /* 調整頂部右側徽章列起點，與左上角精準血量框並排不重疊 */
      #hud-overlay {
        left: 90px !important;
      }

      /* 互動排序題 / 語塊重組題 (Sequence / Assembly) 介面樣式 */
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
        background: rgba(15, 23, 42, 0.8);
        padding: 3px 8px;
        border-radius: 4px;
        border: 1px solid #38b6ff;
      }
      .seq-slots-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(68px, 1fr));
        gap: 5px;
        width: 100%;
      }
      .seq-slot-box {
        background: #141013;
        border: 2px dashed #6c757d;
        border-radius: 6px;
        padding: 4px 4px;
        min-height: 40px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-size: 12px;
        font-weight: 900;
        color: #8d99ae;
        cursor: pointer;
        transition: all 0.15s ease;
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
        margin-bottom: 1px;
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
        padding: 6px 5px;
        color: #fff3b0;
        font-size: 12px;
        font-weight: 900;
        text-align: center;
        cursor: pointer;
        box-shadow: 0 2px 0 #141013;
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

  // ================= 2. 輔助函式：從原有題庫拆解步驟或組合配對 =================
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

  function getOriginalQuestionBank() {
    const Data = window.Aetheria.Data || {};
    if (Array.isArray(Data.QUESTIONS) && Data.QUESTIONS.length > 0) return Data.QUESTIONS;
    if (Array.isArray(Data.QUESTIONS_BANK) && Data.QUESTIONS_BANK.length > 0) return Data.QUESTIONS_BANK;
    if (window.Aetheria.QuizBridge && Array.isArray(window.Aetheria.QuizBridge.questions)) {
      return window.Aetheria.QuizBridge.questions;
    }
    return [];
  }

  // 將單一答案字串拆解為 2~4 個有意義的步驟或語塊
  function extractStepsFromAnswer(ansStr) {
    const clean = String(ansStr || "").trim();
    if (!clean) return null;

    // 1. 優先檢查箭頭次序 (➔, →, ->, ＞, >)
    if (/➔|→|->|＞|>/.test(clean)) {
      const arrowParts = clean.split(/➔|→|->|＞|>/).map(function(s) { return s.trim(); }).filter(Boolean);
      if (arrowParts.length >= 2 && arrowParts.length <= 5) {
        return { mode: "arrow", steps: arrowParts };
      }
    }

    // 2. 檢查頓號、分號、斜線或逗號並列項目 (、 / ； / ，)
    if (/、|；|，|\//.test(clean)) {
      const listParts = clean.split(/、|；|，|\//).map(function(s) { return s.trim(); }).filter(Boolean);
      if (listParts.length >= 2 && listParts.length <= 4) {
        return { mode: "list", steps: listParts };
      }
    }

    // 3. 若答案為 4~18 字的完整短句或專有名詞組合，自動切成 2~3 個語塊供重組排序
    if (clean.length >= 4 && clean.length <= 18 && !/^[A-Za-z0-9\s]+$/.test(clean)) {
      const segCount = clean.length >= 9 ? 3 : 2;
      const segLen = Math.ceil(clean.length / segCount);
      const chunks = [];
      for (let i = 0; i < clean.length; i += segLen) {
        chunks.push(clean.slice(i, i + segLen));
      }
      if (chunks.length >= 2) {
        return { mode: "chunk", steps: chunks };
      }
    }

    return null;
  }

  // 從同一題的錯誤選項 (options) 提取 2 個干擾語塊，增加重組與排序思考度
  function extractDistractorBlocks(q, correctSteps) {
    const distractors = [];
    const opts = Array.isArray(q.options) ? q.options : [];
    const ans = String(q.answer || "").trim();

    opts.forEach(function(opt) {
      const oStr = String(opt || "").trim();
      if (!oStr || oStr === ans) return;

      const parsed = extractStepsFromAnswer(oStr);
      if (parsed && parsed.steps.length > 0) {
        parsed.steps.forEach(function(st) {
          if (correctSteps.indexOf(st) === -1 && distractors.indexOf(st) === -1 && st.length <= 14) {
            distractors.push(st);
          }
        });
      } else if (oStr.length <= 10 && correctSteps.indexOf(oStr) === -1 && distractors.indexOf(oStr) === -1) {
        distractors.push(oStr);
      }
    });

    return shuffleArray(distractors).slice(0, Math.max(0, 6 - correctSteps.length));
  }

  // ================= 3. 渲染「原有題目轉換：先後排序／語塊重組題」 =================
  function renderOriginalAsSequence(q, stepInfo, onResultCallback) {
    const area = document.getElementById("quiz-interactive-area");
    const promptEl = document.getElementById("quiz-prompt");
    const subjBadge = document.getElementById("quiz-subject-badge");

    const isPureOrder = (stepInfo.mode === "arrow");
    const sMap = {
      chinese: "中文科",
      english: "英文科",
      science: isPureOrder ? "科學科・排序題" : "科學科・重組題",
      humanities: isPureOrder ? "人文科・排序題" : "人文科・重組題"
    };
    if (subjBadge) subjBadge.innerText = sMap[q.subject] || "互動排序題";
    if (promptEl) promptEl.innerText = q.prompt || "";
    if (!area) return;

    const correctSteps = stepInfo.steps.slice();
    const distractors = isPureOrder ? [] : extractDistractorBlocks(q, correctSteps);

    const allCards = correctSteps.map(function(txt, idx) {
      return { text: txt, isCorrectPart: true, origOrder: idx };
    });
    distractors.forEach(function(dTxt, dIdx) {
      allCards.push({ text: dTxt, isCorrectPart: false, origOrder: 99 + dIdx });
    });

    let poolSteps = shuffleArray(allCards);
    if (poolSteps.every(function(item, i) { return item.origOrder === i; }) && poolSteps.length >= 2) {
      const tmp = poolSteps[0];
      poolSteps[0] = poolSteps[1];
      poolSteps[1] = tmp;
    }

    const selectedIndices = [];

    // 記錄當前步驟供「洞察藥水」提示使用
    q._activeSequenceSteps = correctSteps;

    function redrawSequenceUI() {
      let slotsHtml = "";
      for (let i = 0; i < correctSteps.length; i++) {
        const pickedPoolIdx = selectedIndices[i];
        const hasVal = (pickedPoolIdx !== undefined);
        const stepTxt = hasVal ? poolSteps[pickedPoolIdx].text : "點擊下方選擇";
        const slotTitle = isPureOrder ? ("步驟 " + (i + 1)) : ("片段 " + (i + 1));
        slotsHtml +=
          '<div class="seq-slot-box ' + (hasVal ? 'filled' : '') + '" data-slot="' + i + '">' +
            '<div class="seq-slot-num">' + slotTitle + (hasVal ? ' (點擊移除)' : '') + '</div>' +
            '<div>' + stepTxt + '</div>' +
          '</div>';
      }

      let choicesHtml = "";
      poolSteps.forEach(function(item, pIdx) {
        const isUsed = selectedIndices.indexOf(pIdx) !== -1;
        choicesHtml +=
          '<button class="seq-choice-btn ' + (isUsed ? 'used' : '') + '" data-pool="' + pIdx + '">' +
            item.text +
          '</button>';
      });

      const allFilled = (selectedIndices.length === correctSteps.length);
      const guideTxt = isPureOrder
        ? ("👆 請依先後次序點擊卡片排入槽位 (" + selectedIndices.length + "/" + correctSteps.length + ")")
        : ("👆 請依序點擊正確語塊組合答案 (" + selectedIndices.length + "/" + correctSteps.length + ")");

      area.innerHTML =
        '<div class="seq-container">' +
          '<div class="seq-guide-bar">' +
            '<span>' + guideTxt + '</span>' +
            '<span>破盾 +1</span>' +
          '</div>' +
          '<div class="seq-slots-row">' + slotsHtml + '</div>' +
          '<div class="seq-choices-grid">' + choicesHtml + '</div>' +
          '<div class="seq-action-row">' +
            '<button class="na-btn" id="btn-seq-reset" style="flex:1; padding:6px;">🔄 重排</button>' +
            '<button class="na-btn ' + (allFilled ? 'highlight' : '') + '" id="btn-seq-submit" style="flex:2; padding:6px; font-size:13.5px;">✓ 確認答案</button>' +
          '</div>' +
        '</div>';

      area.querySelectorAll(".seq-choice-btn").forEach(function(btn) {
        btn.onclick = function() {
          const pIdx = parseInt(btn.getAttribute("data-pool"), 10);
          if (selectedIndices.indexOf(pIdx) === -1 && selectedIndices.length < correctSteps.length) {
            selectedIndices.push(pIdx);
            window.Aetheria.Audio.sfxTalkBlip();
            redrawSequenceUI();
          }
        };
      });

      area.querySelectorAll(".seq-slot-box.filled").forEach(function(slotEl) {
        slotEl.onclick = function() {
          const sIdx = parseInt(slotEl.getAttribute("data-slot"), 10);
          if (!isNaN(sIdx) && sIdx < selectedIndices.length) {
            selectedIndices.splice(sIdx, 1);
            window.Aetheria.Audio.sfxTalkBlip();
            redrawSequenceUI();
          }
        };
      });

      const resetBtn = document.getElementById("btn-seq-reset");
      if (resetBtn) {
        resetBtn.onclick = function() {
          selectedIndices.length = 0;
          window.Aetheria.Audio.sfxTalkBlip();
          redrawSequenceUI();
        };
      }

      const submitBtn = document.getElementById("btn-seq-submit");
      if (submitBtn) {
        submitBtn.onclick = function() {
          if (selectedIndices.length < correctSteps.length) {
            window.Aetheria.UI.showToast("請先排滿上方 " + correctSteps.length + " 個位置！");
            return;
          }
          const userWords = selectedIndices.map(function(pIdx) { return poolSteps[pIdx].text; });
          let isRight = false;

          if (stepInfo.mode === "list") {
            // 並列頓號題（如「固體、液體、氣體」）：只要選對全部正確項目即算答對
            const sortedUser = userWords.slice().sort().join("|");
            const sortedCorr = correctSteps.slice().sort().join("|");
            isRight = (sortedUser === sortedCorr);
          } else {
            // 箭頭次序題與短句重組題：順序必須完全一致
            isRight = userWords.every(function(txt, idx) {
              return txt === correctSteps[idx];
            });
          }

          if (onResultCallback) {
            onResultCallback(isRight, q.answer, q);
          }
        };
      }
    }

    redrawSequenceUI();
  }

  // ================= 4. 將原有題庫 3 題同科題目動態組合為「配對題」 =================
  function buildDynamicMatchingFromOriginalBank(baseQ) {
    const bank = getOriginalQuestionBank();
    if (!bank || bank.length < 3) return null;

    // 只從原有題庫同一科目 (science 或 humanities) 篩選答案簡潔的題目
    const candidates = bank.filter(function(item) {
      return item &&
        item.id !== baseQ.id &&
        item.subject === baseQ.subject &&
        item.prompt &&
        item.answer &&
        String(item.answer).length <= 16 &&
        String(item.prompt).length <= 42 &&
        item.answer !== baseQ.answer;
    });

    if (candidates.length < 2) return null;
    const pickedOthers = shuffleArray(candidates).slice(0, 2);
    const trio = [baseQ, pickedOthers[0], pickedOthers[1]];

    const pairs = trio.map(function(item) {
      const cleanPrompt = String(item.prompt)
        .replace(/^【[^】]+】/, "")
        .replace(/請問|下列哪一項|是甚麼|是什麼|？|\?/g, "")
        .trim();
      return {
        left: cleanPrompt.length > 22 ? (cleanPrompt.slice(0, 21) + "…") : cleanPrompt,
        right: String(item.answer).trim()
      };
    });

    return {
      id: baseQ.id,
      subject: baseQ.subject,
      type: "matching",
      prompt: "【同科重點配對】請將左方的題目概念與右方的正確答案配對：",
      pairs: pairs,
      answer: baseQ.answer,
      explanation: baseQ.explanation || ("正確答案：" + baseQ.answer)
    };
  }

  // ================= 5. 掛載左上角精準血量 HUD 與原題庫動態轉換器 =================
  function hookQuizAndHeartsHUD() {
    const Ren = window.Aetheria.Renderer;
    const QUI = window.Aetheria.QuizUI;
    const Bat = window.Aetheria.Battle;
    const UI  = window.Aetheria.UI;

    // (A) 升級左上角 #hud-hearts-box：顯示「♥ 120/120 + 動態三色迷你血條」
    if (Ren) {
      Ren.updateHeartsDOM = function(s, Sprites) {
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

    // (B) 攔截 QuizUI.renderQuestion：只針對原有題庫的科學與人文科題目進行多樣化題型轉換
    if (QUI && QUI.renderQuestion) {
      const origRenderQ = QUI.renderQuestion.bind(QUI);
      QUI.renderQuestion = function(q, callback) {
        if (!q) return origRenderQ(q, callback);

        const isSciOrHum = (q.subject === "science" || q.subject === "humanities");
        const isDefaultMcq = (!q.type || q.type === "multiple_choice");

        if (isSciOrHum && isDefaultMcq) {
          const stepInfo = extractStepsFromAnswer(q.answer);

          // 1. 若原題答案本身帶有箭頭次序 (→/➔) 或並列頓號 (、)，100% 轉為互動排序題
          if (stepInfo && (stepInfo.mode === "arrow" || stepInfo.mode === "list")) {
            this.currentQuestion = q;
            this.currentCallback = callback;
            q._isInteractiveConverted = true;
            renderOriginalAsSequence(q, stepInfo, callback);
            return;
          }

          // 2. 其他科學/人文四選一題目：動態輪流轉為「語塊重組排序題」或「原題庫同科配對題」
          const roll = Math.random();
          if (stepInfo && stepInfo.mode === "chunk" && roll < 0.45) {
            this.currentQuestion = q;
            this.currentCallback = callback;
            q._isInteractiveConverted = true;
            renderOriginalAsSequence(q, stepInfo, callback);
            return;
          }

          if (roll >= 0.45 && roll < 0.72 && String(q.answer || "").length <= 16) {
            const matchQ = buildDynamicMatchingFromOriginalBank(q);
            if (matchQ) {
              q._isInteractiveConverted = true;
              origRenderQ(matchQ, function(isRight) {
                if (callback) callback(isRight, q.answer, q);
              });
              return;
            }
          }
        }

        origRenderQ(q, callback);
      };

      // 支援排序/重組題使用「洞察藥水」提示第 1 個步驟
      if (QUI.useHintPotion) {
        const origHint = QUI.useHintPotion.bind(QUI);
        QUI.useHintPotion = function() {
          const q = this.currentQuestion;
          const s = window.Aetheria.State.data;
          if (q && q._activeSequenceSteps && q._activeSequenceSteps.length >= 2) {
            if ((s.inventory.potionHint || 0) <= 0) {
              window.Aetheria.UI.showToast("洞察藥水不足！");
              return;
            }
            s.inventory.potionHint--;
            window.Aetheria.Audio.sfxGather();
            window.Aetheria.State.save();
            window.Aetheria.UI.showToast("💡 洞察提示：第 1 格是【" + q._activeSequenceSteps[0] + "】！");
            return;
          }
          origHint();
        };
      }
    }

    // (C) 完成互動排序/重組/配對題時，給予額外 +1 破盾獎勵
    if (Bat && Bat.resolveTurn) {
      const origResolve = Bat.resolveTurn.bind(Bat);
      Bat.resolveTurn = function(isCorrect, correctText, qObj) {
        if (isCorrect && qObj && qObj._isInteractiveConverted && this.enemy && !this.enemy.broken && this.mode === "combat") {
          this.enemy.shield = Math.max(0, this.enemy.shield - 1);
          window.Aetheria.UI.spawnFloatingText("思考共鳴・破盾+1!", "#8ce0ff", true);
        }
        origResolve(isCorrect, correctText, qObj);
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
      console.error("Quiz & HUD Upgrade v7.9.1 init error:", err);
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(initQuizHudUpgrade, 110);
  } else {
    window.addEventListener("load", function() {
      setTimeout(initQuizHudUpgrade, 110);
    });
  }
})();
