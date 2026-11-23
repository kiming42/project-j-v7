/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — 智慧答題雙軌解鎖與學習戰報模組 (srpg-study.js - v14.2)
 * 【File 6 / 6】獨立外掛模組，無須改動前 5 個檔案
 * 核心功能：
 *   1. 【智慧答題雙軌解鎖】：缺工具/鑰匙或機關鎖定時，可選「去工坊打造」或「答對2題智慧破障」（優先抽錯題本舊題）
 *   2. 【📊 學習成果戰報】：自動統計戰鬥詠唱與智慧答題之總正確率、連勝、分科進度條、近 7 日溫習柱狀圖、家長摘要匯出
 *   3. 【📕 錯題魔典】：自動收錄答錯題目與小四小五白話解析，支援隨時重練消滅錯題賺金幣
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.SRPG = window.Aetheria.SRPG || {};

(function() {
  const SRPG = window.Aetheria.SRPG;

  // ================= 1. 內建香港小四、小五四科精選題庫（自動與原版題庫並用） =================
  const BUILTIN_P45_QUESTIONS = [
    // --- 中文 (8題) ---
    { id: "p_zh_1", subject: "中文", q: "成語「畫蛇添足」的意思是什麼？", options: ["畫畫非常細心", "做了多餘的事，反而弄巧成拙", "形容動物跑得很快", "做事非常有計劃"], ans: 1, exp: "「畫蛇添足」指給畫好的蛇多加上腳，比喻多此一舉，反而把事情弄糟。" },
    { id: "p_zh_2", subject: "中文", q: "下列哪一個字的部首是「心」？", options: ["明", "想", "跑", "河"], ans: 1, exp: "「想」字的下方是「心」部，代表用腦與用心思考。" },
    { id: "p_zh_3", subject: "中文", q: "「太陽公公露出了燦爛的笑臉。」運用了哪種修辭手法？", options: ["比喻", "擬人", "排比", "反問"], ans: 1, exp: "把太陽當作人一樣「露出笑臉」，這就是「擬人」法。" },
    { id: "p_zh_4", subject: "中文", q: "諺語「一寸光陰一寸金」的下一句是什麼？", options: ["光陰似箭日月如梭", "寸金難買寸光陰", "少壯不努力", "鐵杵磨成針"], ans: 1, exp: "「一寸光陰一寸金，寸金難買寸光陰」，提醒我們要珍惜時間。" },
    { id: "p_zh_5", subject: "中文", q: "「小傑跑得像獵豹一樣快。」運用了哪種修辭手法？", options: ["明喻", "擬人", "誇張", "設問"], ans: 0, exp: "句子用「像」把小傑跑步的速度比喻成獵豹，屬於「明喻」。" },
    { id: "p_zh_6", subject: "中文", q: "下列哪一個成語最適合形容「非常專心」？", options: ["東張西望", "半途而廢", "聚精會神", "馬馬虎虎"], ans: 2, exp: "「聚精會神」形容集中精神、全神貫注地做事。" },
    { id: "p_zh_7", subject: "中文", q: "「雖然外面下着大雨，____ 我們仍然準時到達。」應填入哪個關聯詞？", options: ["因為", "但是", "所以", "如果"], ans: 1, exp: "「雖然……但是……」是一組常見的轉折複句關聯詞。" },
    { id: "p_zh_8", subject: "中文", q: "成語「水落石出」通常用來比喻什麼？", options: ["河水枯竭了", "石頭很堅硬", "事情的真相完全顯露出來", "下雨後天氣變涼"], ans: 2, exp: "水位下降後水底石頭露出來，比喻真相大白。" },

    // --- 英文 (8題) ---
    { id: "p_en_1", subject: "英文", q: "She ____ to school by bus every morning.", options: ["go", "goes", "going", "went"], ans: 1, exp: "主語是第三人稱單數 She，且 every morning 表示現在式習慣，動詞要加 es 變成 goes。" },
    { id: "p_en_2", subject: "英文", q: "Yesterday, Tom ____ a big fish in the river.", options: ["catch", "catches", "caught", "catching"], ans: 2, exp: "Yesterday 表示過去時間，catch 的過去式是不規則變化 caught。" },
    { id: "p_en_3", subject: "英文", q: "What is the plural form (複數) of \"child\"?", options: ["childs", "childes", "children", "childrens"], ans: 2, exp: "child 是不規則名詞，複數形式是 children（不用再加 s）。" },
    { id: "p_en_4", subject: "英文", q: "Look! The birds ____ in the sky right now.", options: ["fly", "flies", "are flying", "flew"], ans: 2, exp: "Look! 和 right now 表示現在進行式，要用 be + V-ing（are flying）。" },
    { id: "p_en_5", subject: "英文", q: "Which word is the opposite (相反詞) of \"ancient\"?", options: ["old", "modern", "heavy", "dark"], ans: 1, exp: "ancient 是「古老的」，相反詞是 modern（現代的）。" },
    { id: "p_en_6", subject: "英文", q: "I am interested ____ playing adventure games.", options: ["in", "on", "at", "under"], ans: 0, exp: "固定片語「be interested in」表示「對……感興趣」。" },
    { id: "p_en_7", subject: "英文", q: "An elephant is ____ than a mouse.", options: ["big", "bigger", "biggest", "more big"], ans: 1, exp: "有 than 要用比較級，big 雙寫 g 再加 er 變成 bigger。" },
    { id: "p_en_8", subject: "英文", q: "How ____ apples are there in the basket?", options: ["much", "many", "some", "any"], ans: 1, exp: "apples 是可數名詞複數，問數量要用 How many。" },

    // --- 數學 (8題) ---
    { id: "p_ma_1", subject: "數學", q: "計算：24 × 15 = ？", options: ["320", "340", "360", "380"], ans: 2, exp: "可以拆成 24 × 10 = 240，加上 24 × 5 = 120，合起來就是 360。" },
    { id: "p_ma_2", subject: "數學", q: "一個長方形長 12 厘米，闊 8 厘米，它的周界是多少厘米？", options: ["20 厘米", "40 厘米", "48 厘米", "96 厘米"], ans: 1, exp: "長方形周界 = (長 + 闊) × 2 = (12 + 8) × 2 = 40 厘米。" },
    { id: "p_ma_3", subject: "數學", q: "計算：3/8 + 5/8 = ？", options: ["8/16", "1", "2/8", "15/8"], ans: 1, exp: "同分母分數相加，分子 3 + 5 = 8，8/8 就等於 1。" },
    { id: "p_ma_4", subject: "數學", q: "下列哪一個數是「質數」(Prime Number)？", options: ["9", "15", "17", "21"], ans: 2, exp: "17 只有 1 和 17 兩個因數，所以是質數（9、15、21 都能被 3 整除）。" },
    { id: "p_ma_5", subject: "數學", q: "2 小時 25 分鐘等於多少分鐘？", options: ["125 分鐘", "145 分鐘", "165 分鐘", "225 分鐘"], ans: 1, exp: "1 小時 = 60 分鐘，2 小時 = 120 分鐘，120 + 25 = 145 分鐘。" },
    { id: "p_ma_6", subject: "數學", q: "一個正方形的面積是 49 平方厘米，它的邊長是多少厘米？", options: ["6 厘米", "7 厘米", "8 厘米", "9 厘米"], ans: 1, exp: "正方形面積 = 邊長 × 邊長，因為 7 × 7 = 49，所以邊長是 7 厘米。" },
    { id: "p_ma_7", subject: "數學", q: "計算：100 - 18 × 4 = ？", options: ["28", "32", "72", "328"], ans: 0, exp: "記得「先乘除後加減」！先算 18 × 4 = 72，再算 100 - 72 = 28。" },
    { id: "p_ma_8", subject: "數學", q: "12 和 18 的最大公因數 (H.C.F.) 是多少？", options: ["3", "6", "9", "36"], ans: 1, exp: "12 的因數有 1,2,3,4,6,12；18 的因數有 1,2,3,6,9,18，最大公因數是 6。" },

    // --- 常識科學 (8題) ---
    { id: "p_sc_1", subject: "常識科學", q: "植物進行光合作用時，主要吸收哪種氣體並釋放氧氣？", options: ["氮氣", "二氧化碳", "氫氣", "水蒸氣"], ans: 1, exp: "綠色植物在陽光下吸收二氧化碳與水分，製造養分並釋放氧氣。" },
    { id: "p_sc_2", subject: "常識科學", q: "太陽系八大行星中，體積最大的是哪一顆？", options: ["地球", "火星", "木星", "土星"], ans: 2, exp: "木星（Jupiter）是太陽系中體積與質量最大的氣態巨行星。" },
    { id: "p_sc_3", subject: "常識科學", q: "純水在標準氣壓下的沸點是多少度？", options: ["0°C", "50°C", "80°C", "100°C"], ans: 3, exp: "水在 0°C 結冰，在 100°C 沸騰變成水蒸氣。" },
    { id: "p_sc_4", subject: "常識科學", q: "下列哪一種物品最容易導電（屬於導體）？", options: ["銅線", "塑膠尺", "乾木棒", "橡皮擦"], ans: 0, exp: "銅是金屬，屬於優良的電導體；塑膠、乾木與橡膠都是絕緣體。" },
    { id: "p_sc_5", subject: "常識科學", q: "香港特別行政區的區花是什麼？", options: ["牡丹", "洋紫荊", "荷花", "梅花"], ans: 1, exp: "香港的區花是洋紫荊，區旗與區徽上都印有洋紫荊圖案。" },
    { id: "p_sc_6", subject: "常識科學", q: "聲音在下列哪種環境中「無法」傳播？", options: ["空氣中", "水裡", "真空的太空", "金屬鐵軌"], ans: 2, exp: "聲音需要靠物質（固體、液體或氣體）振動傳播，真空中沒有介質所以無法傳聲。" },
    { id: "p_sc_7", subject: "常識科學", q: "把一塊磁鐵的北極 (N) 靠近另一塊磁鐵的北極 (N)，會發生什麼？", options: ["緊緊吸在一起", "互相排斥推開", "發出火花", "失去磁性"], ans: 1, exp: "磁鐵的原理是「同極相斥、異極相吸」，N 極遇上 N 極會互相排斥。" },
    { id: "p_sc_8", subject: "常識科學", q: "人體內負責像水泵一樣把血液輸送到全身的器官是？", options: ["胃", "肺", "心臟", "肝臟"], ans: 2, exp: "心臟日夜不停跳動，將含氧血液經血管輸送到全身各處。" }
  ];

  // ================= 2. 注入樣式 =================
  function injectStudyStyles() {
    if (document.getElementById("srpg-study-v142-styles")) return;
    const style = document.createElement("style");
    style.id = "srpg-study-v142-styles";
    style.textContent = `
      #srpg-study-camp-pill {
        position: absolute;
        top: 56px;
        right: 6px;
        z-index: 18;
        background: rgba(34, 24, 62, 0.92);
        color: #e0aaff;
        border: 1.5px solid #c77dff;
        border-radius: 6px;
        padding: 3px 8px;
        font-size: 10.5px;
        font-weight: 900;
        cursor: pointer;
        pointer-events: auto;
        box-shadow: 0 2px 6px rgba(0,0,0,0.85);
        display: none;
      }
      .study-kpi-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 5px;
        margin-bottom: 8px;
      }
      .study-kpi-box {
        background: #181316;
        border: 1.5px solid #4a3e44;
        border-radius: 7px;
        padding: 6px 4px;
        text-align: center;
      }
      .study-kpi-val { font-size: 15px; font-weight: 900; color: #ffd166; line-height: 1.2; }
      .study-kpi-lbl { font-size: 9.5px; color: #cbd5e1; margin-top: 2px; }

      .study-bar-row { margin-bottom: 6px; }
      .study-bar-head {
        display: flex; justify-content: space-between; font-size: 11.5px;
        font-weight: 900; color: #ffffff; margin-bottom: 2px;
      }
      .study-bar-track {
        width: 100%; height: 9px; background: #141013;
        border: 1px solid #4a3e44; border-radius: 5px; overflow: hidden;
      }
      .study-bar-fill { height: 100%; border-radius: 4px; transition: width 0.3s ease; }

      .study-7day-chart {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 4px;
        align-items: end;
        height: 74px;
        background: #141013;
        border: 1.5px solid #4a3e44;
        border-radius: 7px;
        padding: 8px 6px 4px;
        margin-bottom: 8px;
      }
      .study-day-col { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; }
      .study-day-bar { width: 14px; min-height: 3px; border-radius: 3px 3px 0 0; background: #38b6ff; }
      .study-day-num { font-size: 9px; color: #ffd166; font-weight: 900; margin-bottom: 2px; }
      .study-day-lbl { font-size: 9px; color: #94a3b8; margin-top: 2px; }

      .study-quiz-opt {
        display: block;
        width: 100%;
        text-align: left;
        background: #1c1619;
        color: #ffffff;
        border: 2px solid #594950;
        border-radius: 7px;
        padding: 8px 10px;
        margin-bottom: 6px;
        font-size: 12.5px;
        font-weight: 900;
        cursor: pointer;
      }
      .study-quiz-opt:active { transform: scale(0.98); }
      .study-quiz-opt.opt-correct { background: #183a27; border-color: #5ac54f; color: #a3f7b5; }
      .study-quiz-opt.opt-wrong   { background: #4a151b; border-color: #ff595e; color: #ffb3ba; }

      .study-track-card {
        background: linear-gradient(180deg, #211a24 0%, #141013 100%);
        border: 2px solid #594950;
        border-radius: 8px;
        padding: 9px 10px;
        margin-bottom: 8px;
      }
      .study-track-card.smart-track {
        border-color: #c77dff;
        background: linear-gradient(180deg, #27183b 0%, #16101f 100%);
      }
    `;
    document.head.appendChild(style);
  }

  // ================= 3. 學習數據初始化與紀錄引擎 =================
  function getTodayKey() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function ensureStudyState() {
    const s = window.Aetheria.State && window.Aetheria.State.data;
    if (!s) return null;
    if (!s.studyStats || typeof s.studyStats !== "object") {
      s.studyStats = {
        totalAnswered: 0,
        totalCorrect: 0,
        curStreak: 0,
        bestStreak: 0,
        smartUnlocks: 0,
        mistakesCleared: 0,
        bySubject: {},
        daily: {}
      };
    }
    if (!s.studyStats.bySubject) s.studyStats.bySubject = {};
    if (!s.studyStats.daily) s.studyStats.daily = {};
    if (!Array.isArray(s.srpgMistakes)) s.srpgMistakes = [];
    return s;
  }

  function normalizeQuestionObj(raw, idx) {
    if (!raw || typeof raw !== "object") return null;
    const qText = raw.q || raw.question || raw.prompt || raw.text;
    const opts = raw.options || raw.choices || raw.opts;
    if (!qText || !Array.isArray(opts) || opts.length < 2) return null;

    let ansIdx = 0;
    if (typeof raw.ans === "number") ansIdx = raw.ans;
    else if (typeof raw.answer === "number") ansIdx = raw.answer;
    else if (typeof raw.correct === "number") ansIdx = raw.correct;
    else if (typeof raw.correctIndex === "number") ansIdx = raw.correctIndex;
    else if (typeof raw.answer === "string") {
      const fIdx = opts.indexOf(raw.answer);
      if (fIdx !== -1) ansIdx = fIdx;
    }

    const subjRaw = raw.subject || raw.cat || raw.category || raw.type || "綜合溫習";
    const subjMap = {
      zh: "中文", chi: "中文", chinese: "中文",
      en: "英文", eng: "英文", english: "英文",
      ma: "數學", math: "數學", maths: "數學",
      sc: "常識科學", gs: "常識科學", sci: "常識科學", science: "常識科學"
    };
    const subj = subjMap[String(subjRaw).toLowerCase()] || String(subjRaw);

    return {
      id: String(raw.id || ("nat_q_" + idx + "_" + qText.slice(0, 8))),
      subject: subj,
      q: String(qText),
      options: opts.map(String),
      ans: Math.max(0, Math.min(opts.length - 1, ansIdx)),
      exp: String(raw.exp || raw.explain || raw.explanation || ("正確答案是「" + opts[ansIdx] + "」。"))
    };
  }

  // 自動收集「原版遊戲題庫 + 內建香港小四小五題庫」
  function getCombinedQuestionPool() {
    const pool = [];
    const seenQ = {};

    const Data = window.Aetheria.Data || {};
    const candidateBanks = [Data.QUESTIONS, Data.QUESTION_BANK, Data.QUIZ_BANK, Data.Questions];
    candidateBanks.forEach(function(bank) {
      if (!bank) return;
      const arr = Array.isArray(bank) ? bank : (typeof bank === "object" ? Object.values(bank).flat() : []);
      arr.forEach(function(item, idx) {
        const norm = normalizeQuestionObj(item, idx);
        if (norm && !seenQ[norm.q]) {
          seenQ[norm.q] = true;
          pool.push(norm);
        }
      });
    });

    BUILTIN_P45_QUESTIONS.forEach(function(q) {
      if (!seenQ[q.q]) {
        seenQ[q.q] = true;
        pool.push(q);
      }
    });

    return pool;
  }

  // ================= 4. 學習與雙軌解鎖主控制器 =================
  const study = {
    curReportTab: "overview",
    activeSession: null, // { mode: "unlock" | "mistake" | "practice", targetType, targetRef, needCorrect, curCorrect, askedIds, curQ, locked, fromMistake }

    recordAnswer: function(subject, isCorrect, questionObj) {
      const s = ensureStudyState();
      if (!s) return;
      const st = s.studyStats;
      const subj = subject || "綜合溫習";
      const today = getTodayKey();

      st.totalAnswered = (st.totalAnswered || 0) + 1;
      if (isCorrect) {
        st.totalCorrect = (st.totalCorrect || 0) + 1;
        st.curStreak = (st.curStreak || 0) + 1;
        if (st.curStreak > (st.bestStreak || 0)) st.bestStreak = st.curStreak;
      } else {
        st.curStreak = 0;
      }

      if (!st.bySubject[subj]) st.bySubject[subj] = { total: 0, correct: 0 };
      st.bySubject[subj].total++;
      if (isCorrect) st.bySubject[subj].correct++;

      if (!st.daily[today]) st.daily[today] = { total: 0, correct: 0 };
      st.daily[today].total++;
      if (isCorrect) st.daily[today].correct++;

      // 維護錯題魔典
      if (questionObj && questionObj.q) {
        const existIdx = s.srpgMistakes.findIndex(function(m) { return m.q === questionObj.q; });
        if (!isCorrect) {
          if (existIdx === -1) {
            s.srpgMistakes.unshift({
              id: questionObj.id,
              subject: subj,
              q: questionObj.q,
              options: questionObj.options,
              ans: questionObj.ans,
              exp: questionObj.exp,
              wrongCount: 1,
              addedAt: today
            });
            if (s.srpgMistakes.length > 40) s.srpgMistakes.pop();
          } else {
            s.srpgMistakes[existIdx].wrongCount = (s.srpgMistakes[existIdx].wrongCount || 1) + 1;
          }
        } else if (existIdx !== -1) {
          // 答對了原本在錯題本中的題目 ➔ 消滅錯題！
          s.srpgMistakes.splice(existIdx, 1);
          st.mistakesCleared = (st.mistakesCleared || 0) + 1;
        }
      }

      if (window.Aetheria.State && window.Aetheria.State.save) {
        window.Aetheria.State.save();
      }
    },

    // 挑選下一題（優先從錯題本抽取舊錯題！）
    pickNextQuestion: function(askedIds, onlyMistakes) {
      const s = ensureStudyState();
      const asked = askedIds || {};

      if (s && s.srpgMistakes.length > 0) {
        const mistakeCandidate = s.srpgMistakes.find(function(m) { return !asked[m.q]; });
        if (mistakeCandidate) {
          return { question: mistakeCandidate, isMistake: true };
        }
      }
      if (onlyMistakes) return null;

      const pool = getCombinedQuestionPool().filter(function(q) { return !asked[q.q]; });
      const source = pool.length > 0 ? pool : BUILTIN_P45_QUESTIONS;
      const picked = source[Math.floor(Math.random() * source.length)];
      return { question: picked, isMistake: false };
    },

    // ================= 5. 雙軌解鎖選擇彈窗 =================
    openDualTrackModal: function(targetType, targetRef, meta) {
      const s = ensureStudyState();
      if (!s) return;
      const mistakesCnt = s.srpgMistakes.length;

      this._pendingTarget = { targetType: targetType, targetRef: targetRef, meta: meta || {} };

      window.Aetheria.UI.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = "🔀 雙軌解鎖：" + (meta.title || "神秘障礙");

      const mistakeBadge = mistakesCnt > 0
        ? ('<span class="codex-tag" style="background:#4a151b; color:#ffb3ba; border-color:#ff595e;">優先複習錯題本 (' + mistakesCnt + '題)</span>')
        : ('<span class="codex-tag" style="background:#1d3557; color:#8ce0ff; border-color:#38b6ff;">小四小五綜合題庫</span>');

      const body = document.getElementById("modal-body");
      body.innerHTML =
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
            '答對 <b>2 題</b>即可直接注入智慧魔力破解，無須消耗工具！答錯不扣血，並會顯示白話解析幫你溫習。' +
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
        mode: "unlock",
        targetType: pending.targetType,
        targetRef: pending.targetRef,
        meta: pending.meta,
        needCorrect: 2,
        curCorrect: 0,
        askedIds: {},
        curQ: null,
        fromMistake: false,
        locked: false
      };
      this.loadNextSessionQuestion();
    },

    startMistakeReviewSession: function() {
      const s = ensureStudyState();
      if (!s || s.srpgMistakes.length === 0) {
        window.Aetheria.UI.showToast("🌟 錯題魔典目前是空的，你非常厲害！");
        return;
      }
      this.activeSession = {
        mode: "mistake",
        needCorrect: Math.min(3, s.srpgMistakes.length),
        curCorrect: 0,
        askedIds: {},
        curQ: null,
        fromMistake: true,
        locked: false
      };
      this.loadNextSessionQuestion();
    },

    startFreePracticeSession: function() {
      this.activeSession = {
        mode: "practice",
        needCorrect: 3,
        curCorrect: 0,
        askedIds: {},
        curQ: null,
        fromMistake: false,
        locked: false
      };
      this.loadNextSessionQuestion();
    },

    loadNextSessionQuestion: function() {
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
      sess.askedIds[picked.question.q] = true;
      sess.locked = false;
      this.renderQuizModal();
    },

    renderQuizModal: function(feedback) {
      const sess = this.activeSession;
      if (!sess || !sess.curQ) return;
      const q = sess.curQ;

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
            '<div style="font-size:11.5px; color:#e2e8f0; margin-top:4px; line-height:1.4;">📖 <b>白話解析</b>：' + q.exp + '</div>' +
            '<button class="na-btn highlight" style="width:100%; margin-top:8px; padding:8px; font-size:13px;" onclick="' + btnAct + '">' + btnLabel + '</button>' +
          '</div>';
      }

      const body = document.getElementById("modal-body");
      body.innerHTML =
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">' +
          '<span class="codex-tag">' + q.subject + '</span>' +
          (sess.fromMistake
            ? '<span class="codex-tag" style="background:#4a151b; color:#ffb3ba; border-color:#ff595e;">📕 錯題本舊題（答對即消滅）</span>'
            : '<span class="codex-tag" style="color:#5ac54f;">進度：' + sess.curCorrect + ' / ' + sess.needCorrect + '</span>') +
        '</div>' +
        '<div class="wk-inspector-box" style="margin-bottom:8px;">' +
          '<div style="font-size:14px; font-weight:900; color:#ffffff; line-height:1.45;">' + q.q + '</div>' +
        '</div>' +
        '<div>' + optsHtml + '</div>' +
        fbHtml;
    },

    submitQuizOption: function(chosenIdx) {
      const sess = this.activeSession;
      if (!sess || !sess.curQ || sess.locked) return;
      sess.locked = true;

      const q = sess.curQ;
      const isRight = (chosenIdx === q.ans);
      this.recordAnswer(q.subject, isRight, q);

      if (isRight) {
        sess.curCorrect++;
        if (window.Aetheria.Audio && window.Aetheria.Audio.sfxLevelUp) window.Aetheria.Audio.sfxLevelUp();
      } else {
        if (window.Aetheria.Audio && window.Aetheria.Audio.sfxWrong) window.Aetheria.Audio.sfxWrong();
      }

      this.renderQuizModal({ chosenIdx: chosenIdx, isRight: isRight });
    },

    finishQuizSession: function() {
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

      // 錯題特訓或自由溫習獎勵
      const bonusGold = sess.mode === "mistake" ? 90 : 75;
      s.gold = (s.gold || 0) + bonusGold;
      if (window.Aetheria.State && window.Aetheria.State.save) window.Aetheria.State.save();
      if (window.Aetheria.UI && window.Aetheria.UI.updateAllHud) window.Aetheria.UI.updateAllHud();
      if (window.Aetheria.Audio && window.Aetheria.Audio.sfxLevelUp) window.Aetheria.Audio.sfxLevelUp();
      window.Aetheria.UI.showToast("🏆 溫習特訓完成！獲得智慧獎學金 💰 " + bonusGold + " G！");
      this.openStudyReportModal("overview");
    },

    // ================= 6. 智慧解鎖成功後的實體破障執行 =================
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
        // 同步點亮現場所有機關視覺狀態
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
        s.heroX = ref.x; s.heroY = (ref.ladderSide === "north") ? 835 : 895;
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

    // ================= 7. 📊 學習成果戰報與 📕 錯題魔典面板 =================
    openStudyReportModal: function(activeTab) {
      const s = ensureStudyState();
      if (!s) return;
      if (activeTab) this.curReportTab = activeTab;
      const tab = this.curReportTab || "overview";
      const st = s.studyStats;

      window.Aetheria.UI.setActivePanel("panel-modal");
      document.getElementById("modal-title").innerHTML = "📊 學習成果戰報 ＆ 錯題魔典";

      const acc = st.totalAnswered > 0 ? Math.round((st.totalCorrect / st.totalAnswered) * 100) : 0;

      const tabsHtml =
        '<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:4px; margin-bottom:8px;">' +
          '<button class="na-btn ' + (tab === "overview" ? "highlight" : "") + '" style="padding:6px 2px; font-size:11.5px;" onclick="Aetheria.SRPG.study.openStudyReportModal(\'overview\')">📊 學習總覽</button>' +
          '<button class="na-btn ' + (tab === "mistakes" ? "highlight" : "") + '" style="padding:6px 2px; font-size:11.5px;" onclick="Aetheria.SRPG.study.openStudyReportModal(\'mistakes\')">📕 錯題魔典(' + s.srpgMistakes.length + ')</button>' +
          '<button class="na-btn highlight" style="padding:6px 2px; font-size:11.5px; border-color:#c77dff;" onclick="Aetheria.SRPG.study.startFreePracticeSession()">🧠 溫習賺金幣</button>' +
        '</div>';

      let contentHtml = "";

      if (tab === "overview") {
        // 1. KPI 四格數據
        contentHtml +=
          '<div class="study-kpi-grid">' +
            '<div class="study-kpi-box"><div class="study-kpi-val">' + st.totalAnswered + '</div><div class="study-kpi-lbl">總答題數</div></div>' +
            '<div class="study-kpi-box"><div class="study-kpi-val" style="color:' + (acc >= 80 ? '#5ac54f' : '#ffd166') + ';">' + acc + '%</div><div class="study-kpi-lbl">總正確率</div></div>' +
            '<div class="study-kpi-box"><div class="study-kpi-val" style="color:#38b6ff;">' + (st.bestStreak || 0) + '</div><div class="study-kpi-lbl">最高連勝</div></div>' +
            '<div class="study-kpi-box"><div class="study-kpi-val" style="color:#e0aaff;">' + (st.smartUnlocks || 0) + '</div><div class="study-kpi-lbl">智慧破障</div></div>' +
          '</div>';

        // 2. 近 7 日溫習柱狀圖
        const days = [];
        let maxDayCnt = 1;
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
          const rec = st.daily[key] || { total: 0, correct: 0 };
          if (rec.total > maxDayCnt) maxDayCnt = rec.total;
          days.push({ lbl: (d.getMonth() + 1) + "/" + d.getDate(), total: rec.total, correct: rec.correct });
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

        // 3. 分科正確率進度條
        const allSubjects = ["中文", "英文", "數學", "常識科學", "戰鬥詠唱"];
        Object.keys(st.bySubject).forEach(function(k) {
          if (allSubjects.indexOf(k) === -1) allSubjects.push(k);
        });

        let subjBars = "";
        allSubjects.forEach(function(subj) {
          const rec = st.bySubject[subj] || { total: 0, correct: 0 };
          const rate = rec.total > 0 ? Math.round((rec.correct / rec.total) * 100) : 0;
          const color = rate >= 80 ? "#5ac54f" : (rate >= 60 ? "#ffd166" : "#ff758f");
          subjBars +=
            '<div class="study-bar-row">' +
              '<div class="study-bar-head"><span>' + subj + '</span><span style="color:' + (rec.total > 0 ? color : '#94a3b8') + ';">' + (rec.total > 0 ? (rec.correct + '/' + rec.total + ' (' + rate + '%)') : '尚未作答') + '</span></div>' +
              '<div class="study-bar-track"><div class="study-bar-fill" style="width:' + rate + '%; background:' + color + ';"></div></div>' +
            '</div>';
        });

        contentHtml +=
          '<div class="codex-card" style="border-left-color:#38b6ff;">' +
            '<div style="font-size:12px; font-weight:900; color:#8ce0ff; margin-bottom:6px;">📚 各科掌握度分析</div>' +
            subjBars +
          '</div>';

        // 4. 家長戰報複製按鈕
        contentHtml +=
          '<div style="display:flex; gap:6px; margin-top:8px;">' +
            '<button class="na-btn highlight" style="flex:1; padding:7px; font-size:11.5px;" onclick="Aetheria.SRPG.study.copyParentSummary()">📋 複製家長戰報摘要</button>' +
            (s.srpgMistakes.length > 0
              ? '<button class="na-btn" style="flex:1; padding:7px; font-size:11.5px; border-color:#ff758f; color:#ffb3ba;" onclick="Aetheria.SRPG.study.startMistakeReviewSession()">⚔️ 消滅錯題(' + s.srpgMistakes.length + ')</button>'
              : '') +
          '</div>';
      } else {
        // 📕 錯題魔典分頁
        if (s.srpgMistakes.length === 0) {
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
          s.srpgMistakes.forEach(function(m) {
            contentHtml +=
              '<div class="codex-card" style="border-left-color:#ff595e;">' +
                '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                  '<span class="codex-tag">' + m.subject + '</span>' +
                  '<span style="font-size:10px; color:#ff758f; font-weight:900;">錯 ' + (m.wrongCount || 1) + ' 次</span>' +
                '</div>' +
                '<div style="font-size:12px; font-weight:900; color:#ffffff; margin-top:4px;">' + m.q + '</div>' +
                '<div style="font-size:11px; color:#5ac54f; margin-top:3px;">✅ 正解：' + (m.options && m.options[m.ans] ? m.options[m.ans] : "") + '</div>' +
                '<div style="font-size:11px; color:#cbd5e1; margin-top:2px;">📖 解析：' + m.exp + '</div>' +
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
      const lines = [
        "【艾瑟瑞亞的破曉・學習成果戰報】",
        "勇者：" + (s.heroName || "冒險者") + " (Lv." + (s.lv || 1) + ")",
        "總答題：" + st.totalAnswered + " 題｜正確率：" + acc + "%｜最高連勝：" + (st.bestStreak || 0),
        "智慧破障次數：" + (st.smartUnlocks || 0) + " 次｜已消滅錯題：" + (st.mistakesCleared || 0) + " 題｜待複習錯題：" + s.srpgMistakes.length + " 題"
      ];
      Object.entries(st.bySubject).forEach(function(entry) {
        const k = entry[0], v = entry[1];
        if (v.total > 0) lines.push("• " + k + "：" + v.correct + "/" + v.total + " (" + Math.round(v.correct / v.total * 100) + "%)");
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

  // ================= 8. 營地／主角帳篷快捷戰報膠囊 =================
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
      const mCnt = Array.isArray(s.srpgMistakes) ? s.srpgMistakes.length : 0;
      SRPG.utils.setTextIfChanged(pill, mCnt > 0 ? ("📊學習戰報 (錯題:" + mCnt + ")") : "📊學習戰報 ＆ 溫習");
    }
  }

  // ================= 9. 掛鉤探索互動、戰鬥答題統計與各個 UI 入口 =================
  function installStudyHooks() {
    if (study._hooked) return;
    study._hooked = true;

    injectStudyStyles();
    ensureStudyState();

    const Exp = window.Aetheria.Explore;
    const Bat = window.Aetheria.Battle;
    const Ren = window.Aetheria.Renderer;
    const UI  = window.Aetheria.UI;

    // 1. 掛鉤採集點：缺工具破障 / 鎖定機關寶箱 / 缺鐵鏟挖✖ ➔ 彈出雙軌選擇
    if (Exp && Exp.harvestNode) {
      const origHarvest = Exp.harvestNode.bind(Exp);
      Exp.harvestNode = function(node) {
        const s = window.Aetheria.State.data;
        if (node && !node.opened) {
          if (node.reqHighland && !s.onHighland) return origHarvest(node);

          // 工具障礙點 (荊棘/沉船箱/齒輪柱/玄冰/熔岩)
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

          // 機關寶箱尚未解開
          if (node.isExplorePuzzleChest) {
            const curMap = window.Aetheria.Data.Maps.getMap(s.currentZone);
            if (!SRPG.data.isZoneExplorePuzzleSolved(curMap, s)) {
              study.openDualTrackModal("chest", node, {
                title: "古遺跡機關寶箱",
                forgeTab: "workshop",
                toolHint: "依照旁邊【📜尋寶提示碑】完成火盆①~④ / 三個拉桿 / 四座石像機關即可開啟。"
              });
              return;
            }
          }

          // 地面✖藏寶點尚未有鐵鏟
          if (node.isBuriedSpot && !(s.dugSpots && s.dugSpots[node.id])) {
            const shovelLv = (s.tools && s.tools.shovel) || 0;
            if (shovelLv < 1) {
              study.openDualTrackModal("dig", node, {
                title: "✖ 地面神秘藏寶點",
                forgeTab: "tools",
                toolHint: "於【隨身工坊 ➔ ⛏️工具】用「原木x1+鐵礦x1」升級【Lv.1 精鐵探險鏟】即可挖掘。"
              });
              return;
            }
          }
        }
        return origHarvest(node);
      };
    }

    // 2. 掛鉤互動：缺鑰匙開地底遺跡 / 缺繩梯爬懸崖 ➔ 彈出雙軌選擇
    if (Exp && Exp.interactNearby) {
      const origInteract = Exp.interactNearby.bind(Exp);
      Exp.interactNearby = function() {
        const s = window.Aetheria.State.data;
        const mapObj = window.Aetheria.Data.Maps.getMap(s.currentZone);
        if (mapObj && mapObj.decos) {
          for (let i = 0; i < mapObj.decos.length; i++) {
            const d = mapObj.decos[i];
            if (!d) continue;

            if (d.isCryptEntrance && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 62) {
              const zId = d.zoneId || mapObj.id;
              if (!(s.unlockedCrypts && s.unlockedCrypts[zId]) && ((s.inventory && s.inventory.cryptKey) || 0) <= 0) {
                study.openDualTrackModal("crypt", d, {
                  title: "🔒 遠古地底遺跡石門",
                  forgeTab: "workshop",
                  toolHint: "用【探險鐵鏟】挖掘地面「✖」藏寶點，或在工坊用「鐵礦x1+木炭x1」鍛造【遠古遺跡鑰匙】。"
                });
                return;
              }
            }

            if (d.isCliffLadderSpot && Math.hypot(s.heroX - d.x, s.heroY - d.y) < 68) {
              if (!(s.riggedCliffs && s.riggedCliffs[mapObj.id]) && ((s.inventory && s.inventory.ropeLadder) || 0) <= 0) {
                study.openDualTrackModal("cliff", d, {
                  title: "🧗 陡峭岩石懸崖",
                  forgeTab: "workshop",
                  toolHint: "於【隨身工坊 ➔ 🧗解謎工具】用「原木x1+藤蔓x1」合成【攀岩繩梯】即可架設攀爬。"
                });
                return;
              }
            }
          }
        }
        return origInteract();
      };
    }

    // 3. 自動紀錄原版戰鬥詠唱答題數據
    if (Bat && Bat.executeEnemyCounterPhase) {
      const origCounter = Bat.executeEnemyCounterPhase.bind(Bat);
      Bat.executeEnemyCounterPhase = function(answeredRight) {
        try {
          const rawQ = this.currentQuestion || this.curQuestion || this.activeQuestion || this.question || null;
          const normQ = rawQ ? normalizeQuestionObj(rawQ, Date.now()) : null;
          const subj = (normQ && normQ.subject) ? normQ.subject : "戰鬥詠唱";
          study.recordAnswer(subj, Boolean(answeredRight), normQ);
        } catch (e) {}
        return origCounter(answeredRight);
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

    // 5. 在【日誌】、【解題指引】與【設定】內加入「📊 學習成果戰報」入口按鈕
    if (UI && UI.openQuestLogModal) {
      const origQuestLog = UI.openQuestLogModal.bind(UI);
      UI.openQuestLogModal = function() {
        origQuestLog();
        const wrap = document.getElementById("open-codex-from-quest-btn");
        if (wrap && !document.getElementById("open-study-report-btn")) {
          const btn = document.createElement("button");
          btn.id = "open-study-report-btn";
          btn.className = "na-btn highlight";
          btn.style.cssText = "flex:1; padding:7px; font-size:12px; border-color:#c77dff;";
          btn.textContent = "📊 學習戰報";
          btn.onclick = function() { study.openStudyReportModal("overview"); };
          wrap.appendChild(btn);
        }
      };
    }

    ["openSettingsModal", "openSystemModal", "openConfigModal"].forEach(function(fnName) {
      if (UI && UI[fnName]) {
        const origFn = UI[fnName].bind(UI);
        UI[fnName] = function() {
          origFn();
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

  // 等待主模組就緒後自動掛載
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
