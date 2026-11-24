/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 智慧答題雙軌解鎖與學習戰報模組 (srpg-study.js - v15.1)
 * 升級修正：
 *   1. 補回「日誌」頁（openGuildModal / openQuestLogModal）的「📊 學習戰報」快捷入口
 *   2. 完成溫習／錯題特訓後提示備份存檔，並於戰報頁新增「💾 備份存檔」快捷鍵
 *   3. 特訓彈窗支援免費 Web Speech 語音朗讀按鈕，切題自動停聲
 *   4. 保留 v15.0 修正：轉發 openSettingsModal 參數、100% 對齊四科題庫與 s.wrongBook
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.SRPG = window.Aetheria.SRPG || {};

(function() {
  const SRPG = window.Aetheria.SRPG;

  const SUBJ_KEY_TO_ZH = {
    chinese: "中文",
    english: "英文",
    humanities: "人文",
    science: "科學"
  };

  const FALLBACK_QUESTIONS = [
    { id: "fb_zh_1", subject: "中文", q: "「不離不棄」的意思是？", options: ["永遠陪伴不會離開或放棄", "非常生氣", "忘記帶東西", "跑得很快"], ans: 0, exp: "「不離不棄」指永遠陪伴在身邊，不會離開或放棄。" },
    { id: "fb_en_1", subject: "英文", q: "We like to ________ along the river. (去踏單車)", options: ["go cycling", "play tennis", "read magazines", "do yoga"], ans: 0, exp: "go cycling ＝ 去踏單車。" }
  ];

  function stopTtsSafe() {
    if (window.Aetheria.TTS && typeof window.Aetheria.TTS.stop === "function") {
      window.Aetheria.TTS.stop();
    }
  }

  function injectStudyStyles() {
    if (document.getElementById("srpg-study-v151-styles")) return;
    const style = document.createElement("style");
    style.id = "srpg-study-v151-styles";
    style.textContent = `
      #srpg-study-camp-pill {
        position: absolute; top: 56px; right: 6px; z-index: 18;
        background: rgba(34, 24, 62, 0.92); color: #e0aaff;
        border: 1.5px solid #c77dff; border-radius: 6px; padding: 3px 8px;
        font-size: 10.5px; font-weight: 900; cursor: pointer; pointer-events: auto;
        box-shadow: 0 2px 6px rgba(0,0,0,0.85); display: none;
      }
      .study-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; margin-bottom: 8px; }
      .study-kpi-box { background: #181316; border: 1.5px solid #4a3e44; border-radius: 7px; padding: 6px 4px; text-align: center; }
      .study-kpi-val { font-size: 15px; font-weight: 900; color: #ffd166; line-height: 1.2; }
      .study-kpi-lbl { font-size: 9.5px; color: #cbd5e1; margin-top: 2px; }
      .study-bar-row { margin-bottom: 7px; }
      .study-bar-head { display: flex; justify-content: space-between; font-size: 11.5px; font-weight: 900; color: #ffffff; margin-bottom: 2px; }
      .study-bar-track { width: 100%; height: 9px; background: #141013; border: 1px solid #4a3e44; border-radius: 5px; overflow: hidden; }
      .study-bar-fill { height: 100%; border-radius: 4px; transition: width 0.3s ease; }
      .study-7day-chart {
        display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; align-items: end;
        height: 74px; background: #141013; border: 1.5px solid #4a3e44; border-radius: 7px;
        padding: 8px 6px 4px; margin-bottom: 8px;
      }
      .study-day-col { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; }
      .study-day-bar { width: 14px; min-height: 3px; border-radius: 3px 3px 0 0; background: #38b6ff; }
      .study-day-num { font-size: 9px; color: #ffd166; font-weight: 900; margin-bottom: 2px; }
      .study-day-lbl { font-size: 9px; color: #94a3b8; margin-top: 2px; }
      .study-quiz-opt {
        display: block; width: 100%; text-align: left; background: #1c1619; color: #ffffff;
        border: 2px solid #594950; border-radius: 7px; padding: 8px 10px; margin-bottom: 6px;
        font-size: 12.5px; font-weight: 900; cursor: pointer;
      }
      .study-quiz-opt:active { transform: scale(0.98); }
      .study-quiz-opt.opt-correct { background: #183a27; border-color: #5ac54f; color: #a3f7b5; }
      .study-quiz-opt.opt-wrong   { background: #4a151b; border-color: #ff595e; color: #ffb3ba; }
      .study-track-card {
        background: linear-gradient(180deg, #211a24 0%, #141013 100%);
        border: 2px solid #594950; border-radius: 8px; padding: 9px 10px; margin-bottom: 8px;
      }
      .study-track-card.smart-track {
        border-color: #c77dff;
        background: linear-gradient(180deg, #27183b 0%, #16101f 100%);
      }
    `;
    document.head.appendChild(style);
  }

  function getTodayKey() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function ensureStudyState() {
    const s = window.Aetheria.State && window.Aetheria.State.data;
    if (!s) return null;
    if (!s.studyStats || typeof s.studyStats !== "object") {
      s.studyStats = {
        totalAnswered: 0, totalCorrect: 0, curStreak: 0, bestStreak: 0,
        smartUnlocks: 0, mistakesCleared: 0, bySubject: {}, daily: {}
      };
    }
    if (!s.studyStats.bySubject) s.studyStats.bySubject = {};
    if (!s.studyStats.daily) s.studyStats.daily = {};
    if (!Array.isArray(s.wrongBook)) s.wrongBook = [];
    return s;
  }

  function shuffleArr(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function convertBridgeQuestionToModalItem(rawQ, allBridgeQs) {
    if (!rawQ) return null;
    const subjZh = SUBJ_KEY_TO_ZH[rawQ.subject] || rawQ.subject || "綜合溫習";
    const expHtml = (window.Aetheria.QuizBridge && window.Aetheria.QuizBridge.getExplanationHtml)
      ? window.Aetheria.QuizBridge.getExplanationHtml(rawQ, rawQ.answer)
      : ("正確答案是「" + (rawQ.answer || "") + "」。");

    if (rawQ.type === "mcq" && Array.isArray(rawQ.options) && rawQ.options.length >= 2) {
      let opts = rawQ.options.slice();
      let ansIdx = opts.indexOf(rawQ.answer);
      if (ansIdx === -1) ansIdx = 0;
      return {
        id: rawQ.id,
        bridgeId: rawQ.id,
        rawRef: rawQ,
        subject: subjZh,
        unitName: rawQ.unitName || "",
        q: rawQ.prompt,
        options: opts,
        ans: ansIdx,
        exp: expHtml
      };
    }

    const correctAns = String(rawQ.answer || (rawQ.blanks && rawQ.blanks.join("、")) || "");
    if (!correctAns) return null;

    const dists = [];
    if (Array.isArray(rawQ.distractors) && rawQ.blanks && rawQ.blanks.length === 1) {
      rawQ.distractors.forEach(function(d) {
        if (d !== correctAns && dists.indexOf(d) === -1 && dists.length < 3) dists.push(d);
      });
    }
    const peers = (allBridgeQs || []).filter(function(p) {
      return p.subject === rawQ.subject && p.answer && p.answer !== correctAns;
    });
    for (let i = 0; i < peers.length && dists.length < 3; i++) {
      const pick = peers[Math.floor(Math.random() * peers.length)];
      if (pick && pick.answer !== correctAns && dists.indexOf(pick.answer) === -1) {
        dists.push(pick.answer);
      }
    }
    if (dists.length < 1) return null;

    const mixed = shuffleArr([correctAns].concat(dists.slice(0, 3)));
    return {
      id: rawQ.id,
      bridgeId: rawQ.id,
      rawRef: rawQ,
      subject: subjZh,
      unitName: rawQ.unitName || "",
      q: rawQ.prompt,
      options: mixed,
      ans: mixed.indexOf(correctAns),
      exp: expHtml
    };
  }

  function getBridgeWrongQuestions() {
    const s = ensureStudyState();
    const Bridge = window.Aetheria.QuizBridge;
    if (!s || !Bridge) return [];
    if (typeof Bridge.getValidWrongBook === "function") {
      return Bridge.getValidWrongBook(s);
    }
    const allQs = Bridge.getAllQuestions();
    const byId = {};
    allQs.forEach(function(q) { byId[q.id] = q; });
    return (s.wrongBook || []).map(function(id) { return byId[id]; }).filter(Boolean);
  }

  function getActiveBridgeModalPool() {
    const s = ensureStudyState();
    const Bridge = window.Aetheria.QuizBridge;
    if (!Bridge) return FALLBACK_QUESTIONS.slice();
    if (s) Bridge.ensureQuizSettings(s);

    const allQs = Bridge.getAllQuestions();
    let mcqs = allQs.filter(function(q) {
      if (q.type !== "mcq") return false;
      if (s && s.activeSubjects && s.activeSubjects[q.subject] === false) return false;
      if (s && s.activeLessons && s.activeLessons[q.unitKey] === false) return false;
      return true;
    });
    if (mcqs.length === 0) {
      mcqs = allQs.filter(function(q) { return q.type === "mcq"; });
    }
    const converted = mcqs.map(function(q) { return convertBridgeQuestionToModalItem(q, allQs); }).filter(Boolean);
    return converted.length > 0 ? converted : FALLBACK_QUESTIONS.slice();
  }

  const study = {
    curReportTab: "overview",
    activeSession: null,

    _recordStatsOnly: function(subjectZh, isCorrect, wasMistake) {
      const s = ensureStudyState();
      if (!s) return;
      const st = s.studyStats;
      const subj = subjectZh || "綜合溫習";
      const today = getTodayKey();

      st.totalAnswered = (st.totalAnswered || 0) + 1;
      if (isCorrect) {
        st.totalCorrect = (st.totalCorrect || 0) + 1;
        st.curStreak = (st.curStreak || 0) + 1;
        if (st.curStreak > (st.bestStreak || 0)) st.bestStreak = st.curStreak;
        if (wasMistake) st.mistakesCleared = (st.mistakesCleared || 0) + 1;
      } else {
        st.curStreak = 0;
      }
      if ((s.maxStreak || 0) > (st.bestStreak || 0)) st.bestStreak = s.maxStreak;

      if (!st.bySubject[subj]) st.bySubject[subj] = { total: 0, correct: 0 };
      st.bySubject[subj].total++;
      if (isCorrect) st.bySubject[subj].correct++;

      if (!st.daily[today]) st.daily[today] = { total: 0, correct: 0 };
      st.daily[today].total++;
      if (isCorrect) st.daily[today].correct++;

      if (window.Aetheria.State && window.Aetheria.State.save) {
        window.Aetheria.State.save();
      }
    },

    pickNextQuestion: function(askedIds, onlyMistakes) {
      const Bridge = window.Aetheria.QuizBridge;
      const allQs = Bridge ? Bridge.getAllQuestions() : [];
      const asked = askedIds || {};

      const wrongList = getBridgeWrongQuestions();
      for (let i = 0; i < wrongList.length; i++) {
        if (!asked[wrongList[i].id]) {
          const item = convertBridgeQuestionToModalItem(wrongList[i], allQs);
          if (item) return { question: item, isMistake: true };
        }
      }
      if (onlyMistakes) return null;

      const pool = getActiveBridgeModalPool().filter(function(q) { return !asked[q.id]; });
      const source = pool.length > 0 ? pool : FALLBACK_QUESTIONS;
      const picked = source[Math.floor(Math.random() * source.length)];
      return { question: picked, isMistake: false };
    },

    openDualTrackModal: function(targetType, targetRef, meta) {
      const s = ensureStudyState();
      if (!s) return;
      const mistakesCnt = getBridgeWrongQuestions().length;

      this._pendingTarget = { targetType: targetType, targetRef: targetRef, meta: meta || {} };

      window.Aetheria.UI.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = "🔀 雙軌解鎖：" + (meta.title || "神秘障礙");

      const mistakeBadge = mistakesCnt > 0
        ? ('<span class="codex-tag" style="background:#4a151b; color:#ffb3ba; border-color:#ff595e;">優先複習錯題本 (' + mistakesCnt + '題)</span>')
        : ('<span class="codex-tag" style="background:#1d3557; color:#8ce0ff; border-color:#38b6ff;">依星象調頻四科題庫</span>');

      document.getElementById("modal-body").innerHTML =
        '<div class="sys-card-scroll" style="margin-bottom:8px;">' +
          '<b>💡 你有兩種方法可以解開【' + (meta.title || "此處障礙") + '】：</b>' +
          '<div style="font-size:11.5px; color:#5c3824; margin-top:2px;">你可以去工坊打造工具，也可以直接用「智慧魔力」答對 2 題現場解鎖！</div>' +
        '</div>' +
        '<div class="study-track-card smart-track">' +
          '<div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">' +
            '<b style="color:#e0aaff; font-size:13px;">🧠 路線 B：智慧魔力答題解鎖</b>' +
            mistakeBadge +
          '</div>' +
          '<div style="font-size:11.5px; color:#e2e8f0; margin-top:4px; line-height:1.4;">' +
            '答對 <b>2 題</b>即可直接注入智慧魔力破解，無須消耗工具！答錯不扣血，並會顯示詳盡解析。' +
          '</div>' +
          '<button class="na-btn highlight" style="width:100%; margin-top:8px; padding:8px; font-size:13px;" onclick="Aetheria.SRPG.study.startUnlockQuiz()">' +
            '✨ 立即開始智慧答題解鎖 (需答對 2 題)' +
          '</button>' +
        '</div>' +
        '<div class="study-track-card">' +
          '<b style="color:#ffd166; font-size:13px;">🔨 路線 A：工坊打造正統工具</b>' +
          '<div style="font-size:11.5px; color:#cbd5e1; margin-top:4px; line-height:1.4;">' +
            (meta.toolHint || "前往隨身工坊合成對應工具後再回來按 A 鍵破解。") +
          '</div>' +
          '<button class="na-btn" style="width:100%; margin-top:8px; padding:7px; font-size:12px;" onclick="Aetheria.UI.openForgeModal(\'' + (meta.forgeTab || "workshop") + '\')">' +
            '🔨 前往隨身工坊製作工具' +
          '</button>' +
        '</div>';
    },

    startUnlockQuiz: function() {
      const pending = this._pendingTarget;
      if (!pending) return;
      this.activeSession = {
        mode: "unlock", targetType: pending.targetType, targetRef: pending.targetRef, meta: pending.meta,
        needCorrect: 2, curCorrect: 0, askedIds: {}, curQ: null, fromMistake: false, locked: false
      };
      this.loadNextSessionQuestion();
    },

    startMistakeReviewSession: function() {
      const wrongList = getBridgeWrongQuestions();
      if (wrongList.length === 0) {
        window.Aetheria.UI.showToast("🌟 錯題魔典目前是空的，你非常厲害！");
        return;
      }
      this.activeSession = {
        mode: "mistake", needCorrect: Math.min(3, wrongList.length), curCorrect: 0,
        askedIds: {}, curQ: null, fromMistake: true, locked: false
      };
      this.loadNextSessionQuestion();
    },

    startFreePracticeSession: function() {
      this.activeSession = {
        mode: "practice", needCorrect: 3, curCorrect: 0,
        askedIds: {}, curQ: null, fromMistake: false, locked: false
      };
      this.loadNextSessionQuestion();
    },

    loadNextSessionQuestion: function() {
      stopTtsSafe();
      const sess = this.activeSession;
      if (!sess) return;
      const picked = this.pickNextQuestion(sess.askedIds, sess.mode === "mistake");
      if (!picked) {
        window.Aetheria.UI.showToast("🎉 所有錯題都已經複習完畢！");
        this.openStudyReportModal("mistakes");
        return;
      }
      sess.curQ = picked.question;
      sess.fromMistake = picked.isMistake;
      sess.askedIds[picked.question.id] = true;
      sess.locked = false;
      this.renderQuizModal();
    },

    speakCurrentSessionQuestion: function(btnEl) {
      const sess = this.activeSession;
      const TTS = window.Aetheria.TTS;
      if (!sess || !sess.curQ || !TTS || !TTS.isSupported()) return;
      const q = sess.curQ;
      if (q.rawRef) {
        TTS.speakQuestion(q.rawRef, btnEl);
      } else {
        const isEng = (q.subject === "英文");
        TTS.speak(TTS.cleanPromptForSpeech(q.q, isEng), isEng ? "en-GB" : TTS.getPrefs().chiLang, btnEl);
      }
    },

    renderQuizModal: function(feedback) {
      const sess = this.activeSession;
      if (!sess || !sess.curQ) return;
      const q = sess.curQ;
      const hasTts = Boolean(window.Aetheria.TTS && window.Aetheria.TTS.isSupported());

      window.Aetheria.UI.setActivePanel("panel-modal");
      const modeTitle = (sess.mode === "unlock")
        ? ("🧠 智慧魔力破障 (" + sess.curCorrect + "/" + sess.needCorrect + ")")
        : (sess.mode === "mistake" ? ("📕 消滅錯題特訓 (" + sess.curCorrect + "/" + sess.needCorrect + ")") : ("📚 每日溫習挑戰 (" + sess.curCorrect + "/" + sess.needCorrect + ")"));
      document.getElementById("modal-title").innerHTML = modeTitle;

      const labels = ["A", "B", "C", "D"];
      let optsHtml = "";
      q.options.forEach(function(opt, idx) {
        let cls = "study-quiz-opt";
        if (feedback) {
          if (idx === q.ans) cls += " opt-correct";
          else if (idx === feedback.chosenIdx && !feedback.isRight) cls += " opt-wrong";
        }
        optsHtml +=
          '<button class="' + cls + '" ' + (sess.locked ? 'disabled' : '') + ' onclick="Aetheria.SRPG.study.submitQuizOption(' + idx + ')">' +
            labels[idx] + '. ' + opt +
          '</button>';
      });

      let fbHtml = "";
      if (feedback) {
        const done = sess.curCorrect >= sess.needCorrect;
        const btnLabel = done
          ? (sess.mode === "unlock" ? "🌟 釋放智慧魔力・立即解鎖！" : "🏆 領取溫習獎勵並看戰報")
          : "➡️ 繼續下一題";
        const btnAct = done
          ? "Aetheria.SRPG.study.finishQuizSession()"
          : "Aetheria.SRPG.study.loadNextSessionQuestion()";

        fbHtml =
          '<div class="codex-card ' + (feedback.isRight ? 'owned' : '') + '" style="margin-top:6px;">' +
            '<b style="color:' + (feedback.isRight ? '#5ac54f' : '#ff758f') + '; font-size:13px;">' +
              (feedback.isRight
                ? (sess.fromMistake ? '🎉 答對了！成功消滅 1 題舊錯題！' : '✅ 答對了！智慧魔力注入成功！')
                : '💡 差一點點喔！已收錄到「📕 錯題魔典」，換下一題再試！') +
            '</b>' +
            '<div style="font-size:11.5px; color:#e2e8f0; margin-top:4px; line-height:1.4;">📖 ' + q.exp + '</div>' +
            '<button class="na-btn highlight" style="width:100%; margin-top:8px; padding:8px; font-size:13px;" onclick="' + btnAct + '">' + btnLabel + '</button>' +
          '</div>';
      }

      document.getElementById("modal-body").innerHTML =
        '<div style="display:flex; justify-content:space-between; align-items:center; gap:4px; flex-wrap:wrap; margin-bottom:6px;">' +
          '<span class="codex-tag">' + q.subject + (q.unitName ? ('・' + q.unitName) : '') + '</span>' +
          '<div style="display:flex; align-items:center; gap:5px;">' +
            (hasTts ? '<button type="button" class="quiz-speak-btn" onclick="Aetheria.SRPG.study.speakCurrentSessionQuestion(this)">🔊 朗讀</button>' : '') +
            (sess.fromMistake
              ? '<span class="codex-tag" style="background:#4a151b; color:#ffb3ba; border-color:#ff595e;">📕 錯題本舊題</span>'
              : '<span class="codex-tag" style="color:#5ac54f;">進度：' + sess.curCorrect + '/' + sess.needCorrect + '</span>') +
          '</div>' +
        '</div>' +
        '<div class="wk-inspector-box" style="margin-bottom:8px;">' +
          '<div style="font-size:14px; font-weight:900; color:#ffffff; line-height:1.45;">' + q.q + '</div>' +
        '</div>' +
        '<div>' + optsHtml + '</div>' +
        fbHtml;
    },

    submitQuizOption: function(chosenIdx) {
      stopTtsSafe();
      const sess = this.activeSession;
      if (!sess || !sess.curQ || sess.locked) return;
      sess.locked = true;

      const q = sess.curQ;
      const isRight = (chosenIdx === q.ans);

      if (q.bridgeId && window.Aetheria.QuizBridge) {
        window.Aetheria.QuizBridge.recordAnswer(q.bridgeId, isRight);
      } else {
        this._recordStatsOnly(q.subject, isRight, sess.fromMistake);
      }

      if (isRight) {
        sess.curCorrect++;
        if (window.Aetheria.Audio && window.Aetheria.Audio.sfxLevelUp) window.Aetheria.Audio.sfxLevelUp();
      } else {
        if (window.Aetheria.Audio && window.Aetheria.Audio.sfxWrong) window.Aetheria.Audio.sfxWrong();
      }

      this.renderQuizModal({ chosenIdx: chosenIdx, isRight: isRight });
    },

    finishQuizSession: function() {
      stopTtsSafe();
      const sess = this.activeSession;
      const s = ensureStudyState();
      if (!sess || !s) return;
      this.activeSession = null;

      if (sess.mode === "unlock") {
        s.studyStats.smartUnlocks = (s.studyStats.smartUnlocks || 0) + 1;
        window.Aetheria.UI.setActivePanel("panel-explore");
        this.executeDualTrackUnlock(sess.targetType, sess.targetRef);
        return;
      }

      const bonusGold = sess.mode === "mistake" ? 90 : 75;
      s.gold = (s.gold || 0) + bonusGold;
      if (window.Aetheria.State && window.Aetheria.State.save) window.Aetheria.State.save();
      if (window.Aetheria.UI && window.Aetheria.UI.updateAllHud) window.Aetheria.UI.updateAllHud();
      if (window.Aetheria.Audio && window.Aetheria.Audio.sfxLevelUp) window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.UI.showToast("🏆 溫習特訓完成！獲得獎學金 💰 " + bonusGold + " G！記得定時到【設定 ➔ 存檔/語音】或雲端槽位備份進度。");
      this.openStudyReportModal("overview");
    },

    executeDualTrackUnlock: function(targetType, ref) {
      const s = window.Aetheria.State.data;
      const terrain = SRPG.terrain;
      const utils = SRPG.utils;
      const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);

      if (window.Aetheria.Audio && window.Aetheria.Audio.sfxLevelUp) window.Aetheria.Audio.sfxLevelUp();

      if (targetType === "gate" && ref && ref.gateCfg) {
        const g = ref.gateCfg;
        const matsDB = (window.Aetheria.Data && window.Aetheria.Data.MATERIALS) || {};
        if (!s.clearedToolGates) s.clearedToolGates = {};
        ref.opened = true;
        s.clearedToolGates[ref.id] = true;
        terrain.spawnHarvestParticles(ref.x, ref.y, "#c77dff");

        if (window.Aetheria.Renderer && window.Aetheria.Renderer.domPool && window.Aetheria.Renderer.domPool.nodes) {
          const domNode = window.Aetheria.Renderer.domPool.nodes[ref.id];
          if (domNode && domNode.el) utils.setDisplayIfChanged(domNode.el, "none");
        }

        s.gold = (s.gold || 0) + (g.rewardGold || 250);
        const rewardNames = [];
        Object.entries(g.rewardMats || {}).forEach(function(entry) {
          s.inventory[entry[0]] = (s.inventory[entry[0]] || 0) + entry[1];
          const mn = (matsDB[entry[0]] && matsDB[entry[0]].name) || entry[0];
          rewardNames.push(mn + "+" + entry[1]);
        });
        if (s.currentZone === "zone5_volcano") {
          const bKey = utils.findMatKeyByNameKeyword("耐火磚", null);
          const cKey = utils.findMatKeyByNameKeyword("熔核", null);
          if (bKey) { s.inventory[bKey] = (s.inventory[bKey] || 0) + 3; rewardNames.push("黑曜耐火磚+3"); }
          if (cKey) { s.inventory[cKey] = (s.inventory[cKey] || 0) + 1; rewardNames.push("炎魔熔核+1"); }
        }
        window.Aetheria.UI.spawnFloatingText("🧠智慧破障成功!", "#e0aaff", true);
        window.Aetheria.UI.showToast("🧠 智慧魔力破除【" + g.name.replace(/\[.*\]/, "") + "】！獲得 " + (g.rewardGold || 250) + "G 與 " + rewardNames.join("、") + "！");
      } else if (targetType === "chest" && ref) {
        if (!s.solvedExplorePuzzles) s.solvedExplorePuzzles = {};
        if (!s.claimedExplorePuzzleChests) s.claimedExplorePuzzleChests = {};
        s.solvedExplorePuzzles[mapObj.id] = true;
        (mapObj.decos || []).forEach(function(d) {
          if (d.isPuzzleOrderBrazier) { d.lit = true; d.sprite = "brazier_on"; }
          if (d.isPuzzleToggleLever)  { d.leverOn = true; d.sprite = "lever_on"; }
          if (d.isPuzzleRotateStatue) { d.curDir = d.targetDir; }
        });
        ref.opened = true;
        s.claimedExplorePuzzleChests[ref.zoneId || mapObj.id] = true;
        s.gold = (s.gold || 0) + 320;
        s.inventory.cryptKey = (s.inventory.cryptKey || 0) + 1;
        s.inventory.mithril = (s.inventory.mithril || 0) + 2;
        s.inventory.basalt = (s.inventory.basalt || 0) + 2;
        s.inventory.plank = (s.inventory.plank || 0) + 2;
        s.inventory.spicedStew = (s.inventory.spicedStew || 0) + 1;
        s.srpgBonusHp = (s.srpgBonusHp || 0) + 15;
        window.Aetheria.State.recalcMaxHp();
        terrain.spawnHarvestParticles(ref.x, ref.y, "#ffd166");
        window.Aetheria.UI.spawnFloatingText("🧠智慧開啟秘寶箱!", "#e0aaff", true);
        window.Aetheria.UI.showToast("🧠 智慧魔力直接解開機關寶箱！獲得 320G、🗝️遺跡鑰匙+1、秘銀+2、玄武岩+2、厚木板+2、永久 HP+15！");
      } else if (targetType === "dig" && ref) {
        if (!s.dugSpots) s.dugSpots = {};
        ref.opened = true;
        s.dugSpots[ref.id] = true;
        if (window.Aetheria.Renderer && window.Aetheria.Renderer.domPool && window.Aetheria.Renderer.domPool.nodes) {
          const domNode = window.Aetheria.Renderer.domPool.nodes[ref.id];
          if (domNode && domNode.el) utils.setDisplayIfChanged(domNode.el, "none");
        }
        s.gold = (s.gold || 0) + 120;
        s.inventory.cryptKey = (s.inventory.cryptKey || 0) + 1;
        s.inventory.mithril = (s.inventory.mithril || 0) + 1;
        terrain.spawnHarvestParticles(ref.x, ref.y, "#ffd166");
        window.Aetheria.UI.spawnFloatingText("🧠智慧尋寶成功!", "#e0aaff", true);
        window.Aetheria.UI.showToast("🧠 智慧魔力浮現藏寶！獲得【🗝️遠古遺跡鑰匙 +1、流沙秘銀 +1】與 120 G！");
      } else if (targetType === "cliff" && ref) {
        if (!s.riggedCliffs) s.riggedCliffs = {};
        s.riggedCliffs[mapObj.id] = true;
        (mapObj.decos || []).forEach(function(dc) { if (dc.isCliffLadderSpot) dc.sprite = "rope_ladder"; });
        s.onHighland = true;
        s.heroX = (ref.upX !== undefined) ? ref.upX : ref.x;
        s.heroY = (ref.upY !== undefined) ? ref.upY : ((ref.ladderSide === "north") ? 835 : 895);
        s.petX = s.heroX - 20; s.petY = s.heroY;
        window.Aetheria.UI.spawnFloatingText("🧠魔力繩梯展開!", "#e0aaff", true);
        window.Aetheria.UI.showToast("🧠 智慧魔力凝結成繩梯！已直接登上【岩石高台礦區】！");
      } else if (targetType === "crypt" && ref) {
        if (!s.unlockedCrypts) s.unlockedCrypts = {};
        const zId = ref.zoneId || mapObj.id;
        s.unlockedCrypts[zId] = true;
        ref.sprite = "crypt_door_open";
        window.Aetheria.Data.Maps.getMap("crypt_" + zId);
        s.currentZone = "crypt_" + zId;
        s.onHighland = false;
        s.heroX = 280; s.heroY = 275; s.petX = 258; s.petY = 278;
        if (window.Aetheria.Renderer) {
          window.Aetheria.Renderer.builtZoneKey = null;
          window.Aetheria.Renderer.renderWorld();
        }
        if (window.Aetheria.Audio && window.Aetheria.Audio.playBgm) window.Aetheria.Audio.playBgm("cave");
        window.Aetheria.UI.showToast("🧠 智慧魔力破解石門封印！正在進入【遠古地底遺跡】！");
      }

      window.Aetheria.State.save();
      if (SRPG.ui && SRPG.ui.updateInlinePuzzleGuideInQuestBox) SRPG.ui.updateInlinePuzzleGuideInQuestBox();
      if (SRPG.nav && SRPG.nav.updateNavigationVisuals) SRPG.nav.updateNavigationVisuals(true);
      window.Aetheria.UI.updateAllHud();
    },

    // ================= 📊 學習成果戰報（與四科題庫 & wrongBook 100% 同步） =================
    openStudyReportModal: function(activeTab) {
      stopTtsSafe();
      const s = ensureStudyState();
      if (!s) return;
      if (activeTab) this.curReportTab = activeTab;
      const tab = this.curReportTab || "overview";
      const st = s.studyStats;
      const Bridge = window.Aetheria.QuizBridge;
      const allQs = Bridge ? Bridge.getAllQuestions() : [];
      const wrongQs = getBridgeWrongQuestions();

      window.Aetheria.UI.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = "📊 學習成果戰報 ＆ 錯題魔典";

      const acc = st.totalAnswered > 0 ? Math.round((st.totalCorrect / st.totalAnswered) * 100) : 0;
      const bestStreak = Math.max(st.bestStreak || 0, s.maxStreak || 0);

      const tabsHtml =
        '<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:4px; margin-bottom:8px;">' +
          '<button class="na-btn ' + (tab === "overview" ? "highlight" : "") + '" style="padding:6px 2px; font-size:11.5px;" onclick="Aetheria.SRPG.study.openStudyReportModal(\'overview\')">📊 學習總覽</button>' +
          '<button class="na-btn ' + (tab === "mistakes" ? "highlight" : "") + '" style="padding:6px 2px; font-size:11.5px;" onclick="Aetheria.SRPG.study.openStudyReportModal(\'mistakes\')">📕 錯題魔典(' + wrongQs.length + ')</button>' +
          '<button class="na-btn highlight" style="padding:6px 2px; font-size:11.5px; border-color:#c77dff;" onclick="Aetheria.SRPG.study.startFreePracticeSession()">🧠 溫習賺金幣</button>' +
        '</div>';

      let contentHtml = "";

      if (tab === "overview") {
        contentHtml +=
          '<div class="study-kpi-grid">' +
            '<div class="study-kpi-box"><div class="study-kpi-val">' + st.totalAnswered + '</div><div class="study-kpi-lbl">總答題數</div></div>' +
            '<div class="study-kpi-box"><div class="study-kpi-val" style="color:' + (acc >= 80 ? '#5ac54f' : '#ffd166') + ';">' + acc + '%</div><div class="study-kpi-lbl">總正確率</div></div>' +
            '<div class="study-kpi-box"><div class="study-kpi-val" style="color:#38b6ff;">' + bestStreak + '</div><div class="study-kpi-lbl">最高連勝</div></div>' +
            '<div class="study-kpi-box"><div class="study-kpi-val" style="color:#e0aaff;">' + (st.smartUnlocks || 0) + '</div><div class="study-kpi-lbl">智慧破障</div></div>' +
          '</div>';

        const days = [];
        let maxDayCnt = 1;
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
          const rec = st.daily[key] || { total: 0, correct: 0 };
          if (rec.total > maxDayCnt) maxDayCnt = rec.total;
          days.push({ lbl: (d.getMonth() + 1) + "/" + d.getDate(), total: rec.total });
        }
        let chartCols = "";
        days.forEach(function(day) {
          const hPct = Math.max(6, Math.round((day.total / maxDayCnt) * 100));
          chartCols +=
            '<div class="study-day-col">' +
              '<div class="study-day-num">' + (day.total > 0 ? day.total : '') + '</div>' +
              '<div class="study-day-bar" style="height:' + (day.total > 0 ? hPct : 5) + '%; background:' + (day.total > 0 ? '#5ac54f' : '#334155') + ';"></div>' +
              '<div class="study-day-lbl">' + day.lbl + '</div>' +
            '</div>';
        });
        contentHtml +=
          '<div style="font-size:11.5px; font-weight:900; color:#ffd166; margin-bottom:4px;">📅 近 7 日溫習題數趨勢</div>' +
          '<div class="study-7day-chart">' + chartCols + '</div>';

        const realSubjects = [
          { key: "chinese",    label: "中文" },
          { key: "english",    label: "英文" },
          { key: "humanities", label: "人文" },
          { key: "science",    label: "科學" }
        ];

        let subjBars = "";
        realSubjects.forEach(function(sb) {
          const rec = st.bySubject[sb.label] || { total: 0, correct: 0 };
          const rate = rec.total > 0 ? Math.round((rec.correct / rec.total) * 100) : 0;
          const color = rate >= 80 ? "#5ac54f" : (rate >= 60 ? "#ffd166" : "#ff758f");

          const subjQs = allQs.filter(function(q) { return q.subject === sb.key; });
          const mastered = subjQs.filter(function(q) {
            return s.questionMastery && s.questionMastery[q.id] && s.questionMastery[q.id].stars > 0;
          }).length;

          subjBars +=
            '<div class="study-bar-row">' +
              '<div class="study-bar-head">' +
                '<span>' + sb.label + ' <span style="font-size:10px; color:#8ce0ff;">(掌握 ' + mastered + '/' + subjQs.length + ')</span></span>' +
                '<span style="color:' + (rec.total > 0 ? color : '#94a3b8') + ';">' + (rec.total > 0 ? (rec.correct + '/' + rec.total + ' (' + rate + '%)') : '尚未作答') + '</span>' +
              '</div>' +
              '<div class="study-bar-track"><div class="study-bar-fill" style="width:' + rate + '%; background:' + color + ';"></div></div>' +
            '</div>';
        });

        contentHtml +=
          '<div class="codex-card" style="border-left-color:#38b6ff;">' +
            '<div style="font-size:12px; font-weight:900; color:#8ce0ff; margin-bottom:6px;">📚 四科實戰正確率 ＆ 題庫掌握度</div>' +
            subjBars +
          '</div>' +
          '<div style="display:flex; gap:5px; margin-top:8px; flex-wrap:wrap;">' +
            '<button class="na-btn highlight" style="flex:1; padding:7px 4px; font-size:11.5px;" onclick="Aetheria.SRPG.study.copyParentSummary()">📋 複製家長戰報</button>' +
            (wrongQs.length > 0
              ? '<button class="na-btn" style="flex:1; padding:7px 4px; font-size:11.5px; border-color:#ff758f; color:#ffb3ba;" onclick="Aetheria.SRPG.study.startMistakeReviewSession()">⚔️ 消滅錯題(' + wrongQs.length + ')</button>'
              : '') +
            '<button class="na-btn" style="padding:7px 8px; font-size:11.5px; border-color:#38b6ff; color:#8ce0ff;" onclick="Aetheria.UI.openSettingsModal(\'system\')">💾 備份存檔</button>' +
          '</div>';
      } else {
        if (wrongQs.length === 0) {
          contentHtml =
            '<div class="codex-card owned" style="text-align:center; padding:18px 10px;">' +
              '<div style="font-size:22px;">🌟</div>' +
              '<b style="color:#5ac54f; font-size:13.5px;">太棒了！目前沒有未消滅的錯題！</b>' +
              '<div style="font-size:11.5px; color:#cbd5e1; margin-top:4px;">累計已消滅錯題：' + (st.mistakesCleared || 0) + ' 題。繼續保持！</div>' +
            '</div>';
        } else {
          contentHtml =
            '<button class="na-btn highlight" style="width:100%; padding:8px; margin-bottom:8px; font-size:12.5px;" onclick="Aetheria.SRPG.study.startMistakeReviewSession()">' +
              '⚔️ 立即開始「消滅錯題特訓」 (答對即移出錯題本並賞金幣！)' +
            '</button>';
          wrongQs.forEach(function(q) {
            const subjZh = SUBJ_KEY_TO_ZH[q.subject] || q.subject;
            const expHtml = Bridge ? Bridge.getExplanationHtml(q, q.answer) : "";
            contentHtml +=
              '<div class="codex-card" style="border-left-color:#ff595e;">' +
                '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                  '<span class="codex-tag">' + subjZh + '・' + (q.typeLabel || '') + '</span>' +
                  '<button class="na-btn" style="padding:2px 8px; font-size:10.5px;" onclick="Aetheria.Battle.startBattle(null, \'bounty\', \'' + q.id + '\')">⚔️ 實戰重做</button>' +
                '</div>' +
                '<div style="font-size:12px; font-weight:900; color:#ffffff; margin-top:4px;">' + q.prompt + '</div>' +
                '<div style="font-size:11.5px; color:#5ac54f; margin-top:3px;">✅ 正解：' + (q.answer || '') + '</div>' +
                '<div style="font-size:11px; color:#cbd5e1; margin-top:2px;">📖 ' + expHtml + '</div>' +
              '</div>';
          });
        }
      }

      document.getElementById("modal-body").innerHTML = tabsHtml + contentHtml;
    },

    copyParentSummary: function() {
      const s = ensureStudyState();
      if (!s) return;
      const st = s.studyStats;
      const acc = st.totalAnswered > 0 ? Math.round((st.totalCorrect / st.totalAnswered) * 100) : 0;
      const wrongCnt = getBridgeWrongQuestions().length;
      const lines = [
        "【艾瑟瑞亞的破曉・學習成果戰報】",
        "勇者：" + (s.heroName || "冒險者") + " (Lv." + (s.lv || 1) + ")",
        "總答題：" + st.totalAnswered + " 題｜正確率：" + acc + "%｜最高連勝：" + Math.max(st.bestStreak || 0, s.maxStreak || 0),
        "智慧破障：" + (st.smartUnlocks || 0) + " 次｜已消滅錯題：" + (st.mistakesCleared || 0) + " 題｜待複習錯題：" + wrongCnt + " 題"
      ];
      ["中文", "英文", "人文", "科學"].forEach(function(k) {
        const v = st.bySubject[k];
        if (v && v.total > 0) lines.push("• " + k + "：" + v.correct + "/" + v.total + " (" + Math.round(v.correct / v.total * 100) + "%)");
      });
      const text = lines.join("\n");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
          window.Aetheria.UI.showToast("📋 已複製家長戰報摘要！可直接貼到 WhatsApp 查看。");
        }).catch(function() {
          window.Aetheria.UI.showToast("📋 戰報摘要已生成（瀏覽器未授權自動複製）");
        });
      } else {
        window.Aetheria.UI.showToast("📋 總答題 " + st.totalAnswered + " 題，正確率 " + acc + "%！");
      }
    }
  };
  SRPG.study = study;

  function syncCampStudyPill() {
    const upper = document.getElementById("upper-screen");
    const s = window.Aetheria.State && window.Aetheria.State.data;
    if (!upper || !s) return;

    let pill = document.getElementById("srpg-study-camp-pill");
    if (!pill) {
      pill = document.createElement("div");
      pill.id = "srpg-study-camp-pill";
      pill.onclick = function(ev) {
        ev.stopPropagation();
        if (window.Aetheria.Audio && window.Aetheria.Audio.sfxTalkBlip) window.Aetheria.Audio.sfxTalkBlip();
        study.openStudyReportModal("overview");
      };
      upper.appendChild(pill);
    }

    const showInCamp = (s.currentZone === "camp_hub" || s.currentZone === "tent_hero");
    SRPG.utils.setDisplayIfChanged(pill, showInCamp ? "block" : "none");
    if (showInCamp) {
      const mCnt = getBridgeWrongQuestions().length;
      SRPG.utils.setTextIfChanged(pill, mCnt > 0 ? ("📊學習戰報 (錯題:" + mCnt + ")") : "📊學習戰報 ＆ 溫習");
    }
  }

  function injectJournalStudyButton() {
    const body = document.getElementById("modal-body");
    if (!body) return;
    if (document.getElementById("open-study-report-btn") || document.getElementById("open-study-from-guild-btn")) return;

    const codexWrap = document.getElementById("open-codex-from-quest-btn");
    const mCnt = getBridgeWrongQuestions().length;
    const label = mCnt > 0 ? ("📊 學習戰報 (錯題:" + mCnt + ")") : "📊 學習戰報 ＆ 錯題魔典";

    if (codexWrap) {
      const btn = document.createElement("button");
      btn.id = "open-study-report-btn";
      btn.className = "na-btn highlight";
      btn.style.cssText = "flex:1; padding:7px; font-size:12px; border-color:#c77dff;";
      btn.textContent = label;
      btn.onclick = function() { study.openStudyReportModal("overview"); };
      codexWrap.appendChild(btn);
      return;
    }

    const bar = document.createElement("div");
    bar.id = "open-study-from-guild-btn";
    bar.style.marginBottom = "6px";
    bar.innerHTML =
      '<button class="na-btn highlight" style="width:100%; padding:7px; font-size:12px; border-color:#c77dff;" onclick="Aetheria.SRPG.study.openStudyReportModal(\'overview\')">' +
        label +
      '</button>';
    body.insertBefore(bar, body.firstChild);
  }

  function installStudyHooks() {
    if (study._hooked) return;
    study._hooked = true;

    injectStudyStyles();
    ensureStudyState();

    const Exp = window.Aetheria.Explore;
    const Ren = window.Aetheria.Renderer;
    const UI  = window.Aetheria.UI;
    const Bridge = window.Aetheria.QuizBridge;

    // 1. 直接掛鉤 QuizBridge.recordAnswer：所有戰鬥／採集／溫習答題 100% 精準同步至戰報
    if (Bridge && Bridge.recordAnswer && !Bridge._srpgStudyHooked) {
      Bridge._srpgStudyHooked = true;
      const origRecord = Bridge.recordAnswer.bind(Bridge);
      Bridge.recordAnswer = function(qId, isCorrect) {
        const s = ensureStudyState();
        const wasMistake = Boolean(s && Array.isArray(s.wrongBook) && s.wrongBook.indexOf(qId) !== -1);
        const res = origRecord(qId, isCorrect);
        try {
          const allQs = Bridge.getAllQuestions();
          const qObj = allQs.find(function(x) { return x.id === qId; });
          const subjZh = (qObj && SUBJ_KEY_TO_ZH[qObj.subject]) || "綜合溫習";
          study._recordStatsOnly(subjZh, Boolean(isCorrect), wasMistake);
        } catch (e) {}
        return res;
      };
    }

    // 2. 掛鉤採集點雙軌解鎖
    if (Exp && Exp.harvestNode) {
      const origHarvest = Exp.harvestNode.bind(Exp);
      Exp.harvestNode = function(node) {
        const s = window.Aetheria.State.data;
        if (node && !node.opened) {
          if (node.reqHighland && !s.onHighland) return origHarvest(node);

          if (node.isToolGateObstacle && node.gateCfg && !(s.clearedToolGates && s.clearedToolGates[node.id])) {
            const g = node.gateCfg;
            const haveCnt = (s.inventory && s.inventory[g.reqKey]) || 0;
            if (haveCnt <= 0) {
              const matsDB = (window.Aetheria.Data && window.Aetheria.Data.MATERIALS) || {};
              const reqName = (matsDB[g.reqKey] && matsDB[g.reqKey].name) || g.reqKey;
              study.openDualTrackModal("gate", node, {
                title: g.name.replace(/\[.*\]/, ""),
                forgeTab: "workshop",
                toolHint: "於【隨身工坊 ➔ 🧗解謎工具】製作【" + reqName + "】後，再回來按 A 鍵即可破解。"
              });
              return;
            }
          }

          if (node.isExplorePuzzleChest) {
            const curMap = window.Aetheria.Data.Maps.getMap(s.currentZone);
            if (!SRPG.data.isZoneExplorePuzzleSolved(curMap, s)) {
              study.openDualTrackModal("chest", node, {
                title: "古遺跡機關寶箱",
                forgeTab: "workshop",
                toolHint: "依照旁邊【📜尋寶提示碑】完成機關即可開啟。"
              });
              return;
            }
          }

          if (node.isBuriedSpot && !(s.dugSpots && s.dugSpots[node.id])) {
            const shovelLv = (s.tools && s.tools.shovel) || 0;
            if (shovelLv < 1) {
              study.openDualTrackModal("dig", node, {
                title: "✖ 地面神秘藏寶點",
                forgeTab: "tools",
                toolHint: "於【隨身工坊 ➔ ⛏️工具】升級【Lv.1 精鐵探險鏟】即可挖掘。"
              });
              return;
            }
          }
        }
        return origHarvest(node);
      };
    }

    // 3. 掛鉤互動雙軌解鎖
    if (Exp && Exp.interactNearby) {
      const origInteract = Exp.interactNearby.bind(Exp);
      Exp.interactNearby = function() {
        const s = window.Aetheria.State.data;
        const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
        if (mapObj && mapObj.decos) {
          let nearestLadder = null;
          let nearestLadderDist = 68;

          for (let i = 0; i < mapObj.decos.length; i++) {
            const d = mapObj.decos[i];
            if (!d) continue;
            if (d.isCryptEntrance && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 62) {
              const zId = d.zoneId || mapObj.id;
              if (!(s.unlockedCrypts && s.unlockedCrypts[zId]) && ((s.inventory && s.inventory.cryptKey) || 0) <= 0) {
                study.openDualTrackModal("crypt", d, {
                  title: "🔒 遠古地底遺跡石門",
                  forgeTab: "workshop",
                  toolHint: "用【探險鐵鏟】挖掘地面「✖」藏寶點，或在工坊鍛造【遠古遺跡鑰匙】。"
                });
                return;
              }
            }
            if (d.isCliffLadderSpot) {
              const lDist = Math.hypot(s.heroX - d.x, s.heroY - d.y);
              if (lDist < nearestLadderDist) { nearestLadderDist = lDist; nearestLadder = d; }
            }
          }

          if (nearestLadder && !(s.riggedCliffs && s.riggedCliffs[mapObj.id]) && ((s.inventory && s.inventory.ropeLadder) || 0) <= 0) {
            study.openDualTrackModal("cliff", nearestLadder, {
              title: "🧗 陡峭岩石懸崖",
              forgeTab: "workshop",
              toolHint: "於【隨身工坊 ➔ 🧗解謎工具】合成【攀岩繩梯】即可架設攀爬。"
            });
            return;
          }
        }
        return origInteract();
      };
    }

    // 4. 渲染時同步營地快捷戰報標籤
    if (Ren && Ren.renderWorld) {
      const origRender = Ren.renderWorld.bind(Ren);
      Ren.renderWorld = function() {
        origRender();
        try { syncCampStudyPill(); } catch (e) {}
      };
    }

    // 5. ★ v15.1 補回：於【日誌】(openGuildModal / openQuestLogModal) 顯示「📊 學習戰報」按鈕
    ["openGuildModal", "openQuestLogModal"].forEach(function(fnName) {
      if (UI && UI[fnName]) {
        const origFn = UI[fnName].bind(UI);
        UI[fnName] = function() {
          origFn.apply(this, arguments);
          injectJournalStudyButton();
        };
      }
    });

    // 6. 轉發 arguments，確保「題庫預覽」「掌握報告」等設定分頁切換正常
    ["openSettingsModal", "openSystemModal", "openConfigModal"].forEach(function(fnName) {
      if (UI && UI[fnName]) {
        const origFn = UI[fnName].bind(UI);
        UI[fnName] = function() {
          origFn.apply(this, arguments);
          const body = document.getElementById("modal-body");
          if (body && !document.getElementById("open-study-from-settings-btn")) {
            const box = document.createElement("div");
            box.id = "open-study-from-settings-btn";
            box.style.marginBottom = "8px";
            box.innerHTML =
              '<button class="na-btn highlight" style="width:100%; padding:8px; font-size:12.5px; border-color:#c77dff;" onclick="Aetheria.SRPG.study.openStudyReportModal(\'overview\')">' +
                '📊 家長與勇者專區：查看【學習成果戰報 ＆ 錯題魔典】' +
              '</button>';
            body.insertBefore(box, body.firstChild);
          }
        };
      }
    });

    if (SRPG.workshop && SRPG.workshop.openZoneStoryChainModal) {
      const origChain = SRPG.workshop.openZoneStoryChainModal.bind(SRPG.workshop);
      SRPG.workshop.openZoneStoryChainModal = function() {
        origChain();
        const body = document.getElementById("modal-body");
        if (body && !document.getElementById("open-study-from-chain-btn")) {
          const btn = document.createElement("button");
          btn.id = "open-study-from-chain-btn";
          btn.className = "na-btn";
          btn.style.cssText = "width:100%; margin-top:6px; padding:7px; font-size:12px; border-color:#c77dff; color:#e0aaff;";
          btn.textContent = "📊 打開【學習成果戰報 ＆ 錯題魔典】";
          btn.onclick = function() { study.openStudyReportModal("overview"); };
          body.appendChild(btn);
        }
      };
    }

    syncCampStudyPill();
  }

  function bootStudyWhenReady() {
    let tries = 0;
    const timer = setInterval(function() {
      tries++;
      if (SRPG._ready && SRPG.data && SRPG.workshop && window.Aetheria.Explore && window.Aetheria.UI) {
        clearInterval(timer);
        installStudyHooks();
      } else if (tries >= 160) {
        clearInterval(timer);
      }
    }, 50);
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    bootStudyWhenReady();
  } else {
    window.addEventListener("load", bootStudyWhenReady);
  }
})();
